import React from "react";
import ReactDOM from "react-dom/client";
import { ConsentOverlay } from "./overlay";
import { ConsentEvent } from "../lib/types";
import { scoutGooglePermissions } from "../background/scout";
import type { PolicyAnalysis } from "../background/privacyAnalyzer";

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;

// Callback registered by the mounted overlay so background can push live updates in
let onAnalysisUpdate: ((analysis: PolicyAnalysis) => void) | null = null;

// ---------------------------------------------------------------------------
// SIGN-UP / SIGN-IN PAGE DETECTOR
// Fires when the user lands on a sign-in/sign-up page — before they submit —
// so the privacy overlay appears as an informed-consent moment.
// ---------------------------------------------------------------------------

const PROVIDER_HOSTNAMES = [
  "accounts.google.com", "github.com", "www.facebook.com",
  "login.microsoftonline.com", "appleid.apple.com", "login.live.com",
  "auth0.com", "okta.com", "cognito-idp.amazonaws.com",
];

// Skip our own dashboard so Consently doesn't analyse itself
const SELF_HOSTNAMES = ["localhost", "127.0.0.1", "consently-app.vercel.app"];

const SIGNUP_URL_PATTERN = /\/(sign.?up|register|create.?account|join|onboard|sign.?in|log.?in|login|auth|signin)/i;

// In-memory flag — resets automatically on every page navigation (new content script instance)
let _detected = false;

function isSkippedPage(): boolean {
  const h = window.location.hostname;
  return (
    PROVIDER_HOSTNAMES.some(p => h === p || h.endsWith("." + p)) ||
    SELF_HOSTNAMES.some(s => h === s || h.endsWith("." + s))
  );
}

function alreadyDetectedThisSession(): boolean {
  return _detected;
}

function markDetected(): void {
  _detected = true;
}

function hasPasswordForm(): boolean {
  return Array.from(document.querySelectorAll("form")).some(form => {
    const hasPassword = !!form.querySelector('input[type="password"]');
    const hasEmailOrUser = !!(
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name*="email" i]') ||
      form.querySelector('input[name*="user" i]') ||
      form.querySelector('input[placeholder*="email" i]') ||
      form.querySelector('input[type="text"]')
    );
    return hasPassword && hasEmailOrUser;
  });
}

function fireDetection(): void {
  console.log("[Consently DBG] fireDetection called. skipped=", isSkippedPage(), "alreadyDetected=", alreadyDetectedThisSession());
  if (isSkippedPage()) return;
  if (alreadyDetectedThisSession()) return;
  markDetected();

  console.log("[Consently] Firing SIGNIN_PAGE_DETECTED for", window.location.hostname);
  chrome.runtime.sendMessage({
    type: "SIGNIN_PAGE_DETECTED",
    domain: window.location.hostname,
    url: window.location.href,
  }).catch((e) => console.warn("[Consently] sendMessage failed:", e));
}

function runDetection(): void {
  const combined = window.location.pathname + window.location.hostname;
  const urlMatch = SIGNUP_URL_PATTERN.test(combined);
  const hasPwd = hasPasswordForm();
  console.log("[Consently DBG] runDetection urlMatch=", urlMatch, "hasPwd=", hasPwd, "path=", window.location.pathname);

  if (urlMatch || hasPwd) {
    fireDetection();
    return;
  }

  // Neither URL nor form matched yet — watch for DOM changes (SPAs)
  const observer = new MutationObserver(() => {
    const combined2 = window.location.pathname + window.location.hostname;
    if (SIGNUP_URL_PATTERN.test(combined2) || hasPasswordForm()) {
      observer.disconnect();
      fireDetection();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("[Consently DBG] MutationObserver set up, waiting for sign-in form");
}

function setupSignUpDetector(): void {
  console.log("[Consently DBG] setupSignUpDetector host=", window.location.hostname);
  if (isSkippedPage()) {
    console.log("[Consently DBG] skipped page, bailing");
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runDetection, { once: true });
  } else {
    runDetection();
  }
}

function showOverlay(event: ConsentEvent, analyzing = false) {
  if (container) return; // Prevent multiple overlays

  console.log("[Consently] Showing overlay for", event.appName);

  container = document.createElement("div");
  container.id = "consently-overlay-host";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "2147483647";
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: "open" });
  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  shadow.appendChild(fontLink);

  root = ReactDOM.createRoot(mountPoint);
  root.render(
    <ConsentOverlay
      event={event}
      analyzing={analyzing}
      onAnalysisReady={(cb) => { onAnalysisUpdate = cb; }}
      onAdd={() => {
        chrome.runtime.sendMessage({ type: "CONSENT_ACCEPTED", event });
      }}
      onDismiss={() => {
        destroyOverlay();
        chrome.runtime.sendMessage({ type: "OVERLAY_DISMISSED" });
      }}
    />
  );
}

function destroyOverlay() {
  onAnalysisUpdate = null;
  if (root) {
    root.unmount();
    root = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
}

// 1. Signal background that we are ready to receive detection events
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_READY" });

// 2. Run the scouter if on target page
if (window.location.host.includes("google.com")) {
  scoutGooglePermissions();
}

// 3. Set up sign-up/sign-in form detector for any website
setupSignUpDetector();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  console.log("[Consently DBG] content received message:", message.type);
  if (message.type === "SHOW_OVERLAY") {
    console.log("[Consently DBG] calling showOverlay, event=", message.event?.appName);
    showOverlay(message.event, message.analyzing ?? false);
  }

  if (message.type === "UPDATE_OVERLAY" && onAnalysisUpdate) {
    onAnalysisUpdate(message.analysis as PolicyAnalysis);
  }

  if (message.type === "ANALYSIS_FAILED" && onAnalysisUpdate) {
    // Cast a sentinel value so the overlay knows analysis failed (not still loading)
    onAnalysisUpdate({ source: "fallback", appName: "", domain: message.domain } as unknown as PolicyAnalysis);
  }
});

