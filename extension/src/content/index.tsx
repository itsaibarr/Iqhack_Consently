import React from "react";
import ReactDOM from "react-dom/client";
import { ConsentOverlay } from "./overlay";
import { ConsentEvent } from "../lib/types";
import { scoutGooglePermissions } from "../background/scout";

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;

function showOverlay(event: ConsentEvent) {
  if (container) return; // Prevent multiple overlays

  console.log("[Consently] Showing overlay for", event.appName);

  // Create host container
  container = document.createElement("div");
  container.id = "consently-overlay-host";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "2147483647"; // Max z-index
  document.body.appendChild(container);

  // Create Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: "open" });
  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  // Inject font link (Inter) into shadow DOM
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  shadow.appendChild(fontLink);

  root = ReactDOM.createRoot(mountPoint);
  root.render(
    <ConsentOverlay 
      event={event} 
      onAdd={() => {
        chrome.runtime.sendMessage({ type: "CONSENT_ACCEPTED", event });
      }}
      onDismiss={() => destroyOverlay()}
    />
  );
}

function destroyOverlay() {
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_OVERLAY") {
    showOverlay(message.event);
  }
});
