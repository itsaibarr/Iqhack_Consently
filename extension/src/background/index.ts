import { detectProvider } from "./detector";
import { parseOAuthUrl } from "./parser";
import { appendEvent, getState, updateEventAction, saveState, patchEventRisk } from "../lib/storage";
import { flushUnsynced, syncEvent } from "./sync";
import { ConsentEvent } from "../lib/types";
import { analyzePolicyForDomain } from "./privacyAnalyzer";


// ---------------------------------------------------------------------------
// SIGN-IN PAGE DETECTION — Real policy analysis pipeline
// No mock data. The overlay shows a loading state while the background
// fetches and analyzes the site's actual privacy policy via Gemini.
// ---------------------------------------------------------------------------

/**
 * Derives a readable app name from a hostname.
 * "accounts.google.com" → "Google"
 * "app.notion.so" → "Notion"
 */
function deriveAppName(domain: string): string {
  const clean = domain.replace(/^www\./, "");
  // Known brand names for common TLDs/subdomains
  const firstPart = clean.split(".").slice(-2, -1)[0] ?? clean.split(".")[0];
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}

/**
 * Builds a minimal shell ConsentEvent with no fabricated scopes.
 * The risk and scopes are filled in later by real policy analysis.
 */
function buildShellEvent(domain: string): ConsentEvent {
  return {
    id: crypto.randomUUID(),
    detectedAt: new Date().toISOString(),
    provider: "unknown",
    appDomain: domain,
    appName: deriveAppName(domain),
    clientId: "detected-via-signin-page",
    scopesRaw: [],
    scopesTranslated: [],
    overallRisk: "LOW", // Placeholder — overwritten by patchEventRisk when analysis arrives
    userAction: "detected",
    synced: false,
  };
}


// Allow content scripts to access session storage
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.storage.session) {
    chrome.storage.session.setAccessLevel({
      accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
    }).catch(err => console.error("[Consently] Failed to set session storage access level", err));
  }
});

/**
 * DETECTION ENGINE v2
 * Uses onCommitted to ensure we catch the final URL after redirects.
 */
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId !== 0) return;

  const provider = detectProvider(details.url);
  if (provider === "unknown") return;

  console.log(`[Consently] Detected ${provider} OAuth flow: ${details.url}`);

  const event = parseOAuthUrl(details.url, provider);
  if (!event) {
    console.log(`[Consently] Parser ignored URL: ${details.url}`);
    return;
  }

  // Final safety: don't show overlay on the provider's own site for its own apps
  const PROVIDER_DOMAINS = ["google.com", "github.com", "facebook.com", "microsoft.com", "apple.com"];
  const isSelfConsent = PROVIDER_DOMAINS.some(d => 
    (event.appDomain === d || event.appDomain.endsWith("." + d)) &&
    (new URL(details.url).hostname.endsWith(d))
  );

  if (isSelfConsent) {
    console.log(`[Consently] Ignoring 1st-party self-consent on ${event.appDomain}`);
    return;
  }

  // Store the parsed event locally so we can update it
  await appendEvent(event);
  await chrome.storage.local.set({ last_detected_event: event });

  // Store in session storage for handleHandshake fallback so the overlay can fetch it
  if (chrome.storage.session) {
    await chrome.storage.session.set({
      [`pending_event_${details.tabId}`]: event
    });
  }

  // Update badge to analyzing state
  chrome.action.setBadgeText({ text: "…" });
  chrome.action.setBadgeBackgroundColor({ color: "#F59E0B" });

  // Run the background analysis pipeline
  analyzePolicyForDomain(event.appDomain, event.appName)
    .then(async (analysis) => {
      if (!analysis) {
        chrome.tabs.sendMessage(details.tabId, { type: "ANALYSIS_FAILED", domain: event.appDomain }).catch(() => {});
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "#8E8E93" });
        return;
      }

      console.log(`[Consently] Analysis ready for ${event.appName}`);

      // Push update to the active overlay
      chrome.tabs.sendMessage(details.tabId, { type: "UPDATE_OVERLAY", analysis }).catch(() => {});

      const badgeColor = analysis.riskVerdict === "HIGH" ? "#EF4444" : analysis.riskVerdict === "MEDIUM" ? "#F59E0B" : "#10B981";
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });

      if (chrome.storage.session) {
        await chrome.storage.session.set({ [`pending_analysis_${details.tabId}`]: analysis });
      }

      // Patch the shell event with real analysis
      await patchEventRisk(event.id, analysis.riskVerdict, analysis.plainSummary, analysis.privacyPolicyUrl);
    })
    .catch((err) => {
      console.error("[Consently] Policy analysis pipeline failed:", err);
      chrome.tabs.sendMessage(details.tabId, { type: "ANALYSIS_FAILED", domain: event.appDomain }).catch(() => {});
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "#8E8E93" });

      if (chrome.storage.session) {
        chrome.storage.session.set({ 
          [`pending_analysis_${details.tabId}`]: { source: "fallback", appName: "", domain: event.appDomain } 
        });
      }
    });

  // Sync the base event. Best-effort. Will be updated later.
  syncEvent(event).catch(err => console.error("[Consently] Proactive sync failed", err));
});

// Message Routing
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_READY" && sender.tab?.id) {
    handleHandshake(sender.tab.id);
  }

  if (message.type === "SIGNIN_PAGE_DETECTED") {
    const tabId = sender.tab?.id;
    console.log("[Consently BG] SIGNIN_PAGE_DETECTED domain=", message.domain, "tabId=", tabId);
    if (tabId && message.domain) {
      let targetDomain = message.domain;
      if (message.url) {
        try {
          const params = new URL(message.url).searchParams;
          const redirectUri = params.get("redirect_uri") || params.get("redirecturi") || params.get("continue");
          if (redirectUri) {
            targetDomain = new URL(redirectUri).hostname;
          }
        } catch(_e) {}
      }
      handleSignInDetection(tabId, targetDomain);
    } else {
      console.warn("[Consently BG] SIGNIN_PAGE_DETECTED missing tabId or domain", { tabId, domain: message.domain });
    }
  }

  if (message.type === "CONSENT_ACCEPTED") {
    console.log("[Consently] User accepted consent, updating action and flushing...");
    if (message.event?.id) {
      updateEventAction(message.event.id, "granted").then(() => {
        flushUnsynced();
      });
    } else {
      flushUnsynced();
    }
  }

  if (message.type === "OVERLAY_DISMISSED") {
    chrome.action.setBadgeText({ text: "" });
  }
  
  if (message.type === "SCOUT_DISCOVERY") {
    console.log("[Consently] Scouter discovered events", message.events);
    handleScoutDiscovery(message.events);
  }

  return true; // Keep channel open for async
});

// External Message Routing (Web to Extension)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("[Consently] Received external message:", message, "from:", sender.url);
  
  // Validate sender if possible (optional security check for local dev)
  if (sender.url && !sender.url.includes("localhost:3000")) {
    console.warn("[Consently] Rejected external message from untrusted origin:", sender.url);
    return;
  }

  if (message.type === "AUTH_SUCCESS") {
    console.log("[Consently] Auth success received from web app for user:", message.userId);
    
    // Use an IIFE or separate async call to handle the storage operations
    (async () => {
      try {
        // Save user state in local storage using our helper
        const state = await getState();
        await saveState({
          ...state,
          userId: message.userId,
          userEmail: message.userEmail || state.userEmail,
          handshakeComplete: true
        });

        // Sync any events detected while logged out
        await flushUnsynced();

        // Notify internal popup if it's open
        chrome.runtime.sendMessage({ type: "AUTH_SYNC_COMPLETE", userId: message.userId });

        // Inform user of connection success
        if (chrome.notifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "public/icons/icon128.png",
            title: "Consently Connected",
            message: `Welcome ${message.userEmail || "user"}! Your extension is now linked.`
          });
        }

        sendResponse({ success: true });
      } catch (err) {
        console.error("[Consently] Auth sync storage error:", err);
        sendResponse({ success: false, error: "Storage error" });
      }
    })();

    return true; // CRITICAL: Keep channel open for async sendResponse
  }
});

async function handleHandshake(tabId: number) {
  console.log(`[Consently] Handshake initiated for tab ${tabId}`);
  
  const MAX_RETRIES = 12; // 1.2 seconds total
  const RETRY_DELAY = 100;
  
  let eventToShow: ConsentEvent | null = null;

  // Retry loop to handle race conditions where the content script is READY 
  // before the storage operations in onCommitted are finished.
  for (let i = 0; i < MAX_RETRIES; i++) {
    // 1. Try tab-specific session storage first (Fast Path)
    if (chrome.storage.session) {
      const key = `pending_event_${tabId}`;
      const data = await chrome.storage.session.get(key);
      if (data[key]) {
        console.log(`[Consently] Found event in session storage on attempt ${i + 1}`);
        eventToShow = data[key];
        await chrome.storage.session.remove(key);
        break;
      }
    }

    // 2. Try persistent local storage fallback (Slow Path)
    const localData = await chrome.storage.local.get("last_detected_event");
    if (localData.last_detected_event) {
      const fallbackEvent = localData.last_detected_event as ConsentEvent;
      const age = Date.now() - new Date(fallbackEvent.detectedAt).getTime();
      // Only use if very fresh (within 30s)
      if (age < 30000) {
        console.log(`[Consently] Found event in local storage fallback on attempt ${i + 1}`);
        eventToShow = fallbackEvent;
        // Do not remove from local storage immediately as other tabs might need it during redirects
        break;
      }
    }

    if (i < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  if (eventToShow) {
    console.log(`[Consently] Sending SHOW_OVERLAY to tab ${tabId}`);
    
    // Check if there's a stored analysis for this tab
    let analysisObj = null;
    let analyzing = true;
    
    if (chrome.storage.session) {
      const data = await chrome.storage.session.get(`pending_analysis_${tabId}`);
      if (data[`pending_analysis_${tabId}`]) {
        analysisObj = data[`pending_analysis_${tabId}`];
        analyzing = false; // it finished
        await chrome.storage.session.remove(`pending_analysis_${tabId}`);
      }
    }

    try {
      await chrome.tabs.sendMessage(tabId, { 
        type: "SHOW_OVERLAY", 
        event: eventToShow,
        analyzing
      });

      if (analysisObj) {
        // If it finished before handshake, push the update now
        await chrome.tabs.sendMessage(tabId, {
          type: "UPDATE_OVERLAY",
          analysis: analysisObj
        });
      }
    } catch (err) {
      console.warn("[Consently] Message delivery failed (tab might have changed)", err);
    }
  } else {
    console.log(`[Consently] Handshake complete - No fresh event found for tab ${tabId}`);
  }
}

async function handleSignInDetection(tabId: number, domain: string) {
  const event = buildShellEvent(domain);

  // 1. Persist shell event locally (risk will be patched when analysis arrives)
  await appendEvent(event);

  // 2. Store in session storage for handleHandshake fallback
  if (chrome.storage.session) {
    await chrome.storage.session.set({ [`pending_event_${tabId}`]: event });
  }

  // 3. Badge: amber while analyzing
  chrome.action.setBadgeText({ text: "…" });
  chrome.action.setBadgeBackgroundColor({ color: "#F59E0B" });

  // 4. PHASE 1 — Show overlay immediately in "analyzing" state
  //    No mock scopes. Just the site name and a spinner.
  console.log("[Consently BG] Sending SHOW_OVERLAY to tab", tabId);
  chrome.tabs.sendMessage(tabId, {
    type: "SHOW_OVERLAY",
    event,
    analyzing: true,
  }).then(() => {
    console.log("[Consently BG] SHOW_OVERLAY delivered OK to tab", tabId);
  }).catch((err) => {
    console.warn("[Consently BG] SHOW_OVERLAY delivery FAILED for tab", tabId, err);
  });

  // 5. PHASE 2 — Fetch real privacy policy and analyze with Gemini
  analyzePolicyForDomain(domain, event.appName)
    .then(async (analysis) => {
      if (!analysis) {
        // Could not fetch or analyze — tell the overlay honestly
        chrome.tabs.sendMessage(tabId, { type: "ANALYSIS_FAILED", domain }).catch(() => {});
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "#8E8E93" });
        return;
      }

      console.log(`[Consently] Analysis ready for ${event.appName}`);

      // Update overlay with real findings
      chrome.tabs.sendMessage(tabId, { type: "UPDATE_OVERLAY", analysis }).catch(() => {});

      // Update badge to reflect real risk
      const badgeColor = analysis.riskVerdict === "HIGH"
        ? "#EF4444" : analysis.riskVerdict === "MEDIUM" ? "#F59E0B" : "#10B981";
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });

      if (chrome.storage.session) {
        await chrome.storage.session.set({ [`pending_analysis_${tabId}`]: analysis });
      }

      // Patch the stored event with real risk so the dashboard reflects truth
      await patchEventRisk(event.id, analysis.riskVerdict, analysis.plainSummary, analysis.privacyPolicyUrl);
    })
    .catch((err) => {
      console.error("[Consently] Policy analysis pipeline failed:", err);
      chrome.tabs.sendMessage(tabId, { type: "ANALYSIS_FAILED", domain }).catch(() => {});
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "#8E8E93" });

      if (chrome.storage.session) {
        chrome.storage.session.set({ 
          [`pending_analysis_${tabId}`]: { source: "fallback", appName: "", domain } 
        });
      }
    });

  // 6. Background sync (best-effort)
  syncEvent(event).catch((err) =>
    console.error("[Consently] Sign-in event sync failed", err)
  );
}

async function handleScoutDiscovery(events: Partial<ConsentEvent>[]) {
  for (const eventData of events) {
    const event: ConsentEvent = {
      id: crypto.randomUUID(),
      ...eventData,
      synced: false
    };
    await appendEvent(event);
    await syncEvent(event); // Auto-sync discovered apps
  }
}

// Periodic sync on startup/install
chrome.runtime.onStartup.addListener(flushUnsynced);
chrome.runtime.onInstalled.addListener(flushUnsynced);
