import { detectProvider } from "./detector";
import { parseOAuthUrl } from "./parser";
import { appendEvent, getState, updateEventAction, saveState } from "../lib/storage";
import { flushUnsynced, syncEvent } from "./sync";
import { ConsentEvent } from "../lib/types";

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
    console.log("[Consently] Failed to parse OAuth URL or no scope found");
    return;
  }

  // 1. Save locally (Persistent)
  await appendEvent(event);
  
  // Also store as the most "recent" for quick handshake fallback
  await chrome.storage.local.set({ last_detected_event: event });

  // 2. Proactively Sync to Dashboard as 'PENDING'
  console.log(`[Consently] Proactively syncing detected event for ${event.appName}...`);
  syncEvent(event).catch(err => console.error("[Consently] Proactive sync failed", err));

  // 3. Store in session for the content script to pick up
  if (chrome.storage.session) {
    await chrome.storage.session.set({
      [`pending_event_${details.tabId}`]: event
    });
    console.log(`[Consently] Stored pending event for tab ${details.tabId}`);
  }

  // 4. Update badge
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#3B6BF5" });
});

// Message Routing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_READY" && sender.tab?.id) {
    handleHandshake(sender.tab.id);
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
    chrome.tabs.sendMessage(tabId, { 
      type: "SHOW_OVERLAY", 
      event: eventToShow 
    }).catch(err => {
      // Common if the tab is still loading or user navigated away
      console.warn("[Consently] Message delivery failed (tab might have changed)", err);
    });
  } else {
    console.log(`[Consently] Handshake complete - No fresh event found for tab ${tabId}`);
  }
}

async function handleScoutDiscovery(events: any[]) {
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
