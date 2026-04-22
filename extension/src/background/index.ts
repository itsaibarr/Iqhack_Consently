import { appendEvent, getState, updateEventAction, saveState, patchEventRisk, markSynced } from "../lib/storage";
import { flushUnsynced, syncEvent, fetchUserSettings } from "./sync";
import { ConsentEvent } from "../lib/types";
import { analyzePageText } from "./privacyAnalyzer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveAppName(domain: string): string {
  const clean = domain.replace(/^www\./, "");
  const firstPart = clean.split(".").slice(-2, -1)[0] ?? clean.split(".")[0];
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}

function buildShellEvent(domain: string): ConsentEvent {
  return {
    id: crypto.randomUUID(),
    detectedAt: new Date().toISOString(),
    provider: "unknown",
    appDomain: domain,
    appName: deriveAppName(domain),
    clientId: "analyzed-via-policy-page",
    scopesRaw: [],
    scopesTranslated: [],
    overallRisk: "LOW",
    userAction: "detected",
    synced: false,
  };
}

/**
 * Write analysis state to chrome.storage.session so the side panel can react.
 * The side panel listens on chrome.storage.session.onChanged for "consently_analysis".
 */
function setAnalysisState(state: {
  status: "analyzing" | "ready" | "failed";
  domain: string;
  event?: ConsentEvent;
  analysis?: unknown;
}): void {
  chrome.storage.session.set({ consently_analysis: state }).catch(err =>
    console.warn("[Consently] Failed to write analysis state to session storage:", err)
  );
}

// ---------------------------------------------------------------------------
// Side panel — open on extension icon click
// ---------------------------------------------------------------------------

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(err =>
      console.error("[Consently] sidePanel.open failed:", err)
    );
  }
});

// ---------------------------------------------------------------------------
// Session storage access for content scripts
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.storage.session) {
    chrome.storage.session.setAccessLevel({
      accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
    }).catch(err => console.error("[Consently] Failed to set session storage access level", err));
  }
});

// ---------------------------------------------------------------------------
// ANALYZE_CURRENT_PAGE — triggered by the popup button
//
// Flow:
//   1. Read page text from active tab content script
//   2. Show sidebar immediately (analyzing state)
//   3. Send text to OpenRouter
//   4. Push analysis to sidebar — user reviews and approves
//   5. Sync to web app only on CONSENT_ACCEPTED (user clicked "Save to Dashboard")
// ---------------------------------------------------------------------------

async function handleAnalyzeCurrentPage(callerTabId?: number) {
  let tabId = callerTabId;
  let tabUrl: string | undefined;

  if (tabId) {
    // Caller already identified the tab — just get its URL
    try {
      const tab = await chrome.tabs.get(tabId);
      tabUrl = tab.url;
    } catch {
      console.warn("[Consently] Provided tabId is invalid:", tabId);
      tabId = undefined;
    }
  }

  // Fallback: query the active tab (works from popup, may not work from service worker)
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || !tab.url) {
      console.warn("[Consently] No active tab found for analysis");
      return;
    }
    tabId = tab.id;
    tabUrl = tab.url;
  }

  if (!tabId || !tabUrl) {
    console.warn("[Consently] Could not resolve tab for analysis");
    return;
  }

  const domain = new URL(tabUrl).hostname;
  const appName = deriveAppName(domain);

  // 1. Get page text from content script (live DOM — no CORS, no fetch)
  let pageText: string | null = null;
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "GET_PAGE_TEXT" });
    pageText = response?.text ?? null;
  } catch (err) {
    // Content script may not be injected — inject it dynamically
    console.warn("[Consently] Content script not ready, injecting dynamically:", err);
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.body.innerText.slice(0, 8000),
      }).then(results => {
        pageText = results?.[0]?.result ?? null;
      });
    } catch (injectErr) {
      console.error("[Consently] Dynamic injection also failed:", injectErr);
    }
  }

  if (!pageText) {
    console.warn("[Consently] No page text returned from content script");
    setAnalysisState({ status: "failed", domain });
    return;
  }

  // 2. Build and store a shell event (local only until user approves)
  const event = buildShellEvent(domain);
  await appendEvent(event);

  // 3. Tell side panel to enter analyzing state via session storage
  chrome.action.setBadgeText({ text: "…" });
  chrome.action.setBadgeBackgroundColor({ color: "#F59E0B" });
  setAnalysisState({ status: "analyzing", event, domain });

  // 4. Run analysis on the page text
  const analysis = await analyzePageText(pageText, appName);

  if (!analysis) {
    setAnalysisState({ status: "failed", domain });
    chrome.action.setBadgeText({ text: "?" });
    chrome.action.setBadgeBackgroundColor({ color: "#8E8E93" });
    return;
  }

  console.log(`[Consently] Analysis ready for ${appName}, awaiting user approval in side panel`);

  // 5. Patch local event with full analysis data so CONSENT_ACCEPTED can sync it
  const scopesTranslated: ConsentEvent["scopesTranslated"] = analysis.dataCollected.map(label => ({
    raw: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    category: "identity",
    risk: analysis.riskVerdict,
  }));

  await patchEventRisk(event.id, {
    overallRisk: analysis.riskVerdict,
    plainSummary: analysis.plainSummary,
    privacyPolicyUrl: tabUrl,
    scopesTranslated,
    sharedWith: analysis.sharedWith,
    dpoEmail: analysis.dpoEmail ?? undefined,
  });

  // 6. Push findings to side panel via session storage — user reviews before anything is sent
  setAnalysisState({ status: "ready", analysis, event, domain });

  const badgeColor = analysis.riskVerdict === "HIGH" ? "#EF4444"
    : analysis.riskVerdict === "MEDIUM" ? "#F59E0B"
    : "#10B981";
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });

  // NOTE: No syncEvent here — sync fires only when user clicks "Save to Dashboard"
  // which triggers CONSENT_ACCEPTED from the side panel.
}

// ---------------------------------------------------------------------------
// Message Router
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_CURRENT_PAGE") {
    sendResponse({ ok: true });
    handleAnalyzeCurrentPage(message.tabId).catch(err =>
      console.error("[Consently] handleAnalyzeCurrentPage failed:", err)
    );
    return true;
  }

  if (message.type === "CONSENT_ACCEPTED") {
    // User approved the analysis — now sync to web app
    (async () => {
      if (message.event?.id) {
        await updateEventAction(message.event.id, "granted");
        // Re-read the patched event so sync sends the complete record
        const state = await getState();
        const enrichedEvent = state.events.find(e => e.id === message.event.id);
        if (enrichedEvent) {
          const success = await syncEvent(enrichedEvent);
          if (success) {
            await markSynced(enrichedEvent.id);
          }
        }
      } else {
        flushUnsynced();
      }
    })();
  }

  if (message.type === "SIDEBAR_DISMISSED") {
    chrome.action.setBadgeText({ text: "" });
  }

  if (message.type === "SCOUT_DISCOVERY") {
    handleScoutDiscovery(message.events);
  }

  return true;
});

// ---------------------------------------------------------------------------
// External Message Router (Web App → Extension auth handshake)
// ---------------------------------------------------------------------------

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const TRUSTED_ORIGINS = ["localhost:3000", "consently.vercel.app", "consently-itsaibarrs-projects.vercel.app", "consently-git-main-itsaibarrs-projects.vercel.app"];
  if (sender.url && !TRUSTED_ORIGINS.some(o => sender.url!.includes(o))) {
    console.warn("[Consently] Rejected external message from untrusted origin:", sender.url);
    return;
  }

  if (message.type === "AUTH_SUCCESS") {
    (async () => {
      try {
        const state = await getState();
        await saveState({
          ...state,
          userId: message.userId,
          userEmail: message.userEmail || state.userEmail,
          handshakeComplete: true,
        });

        await flushUnsynced();
        await fetchUserSettings();
        chrome.runtime.sendMessage({ type: "AUTH_SYNC_COMPLETE", userId: message.userId });

        if (chrome.notifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "public/icons/icon128.png",
            title: "Consently Connected",
            message: `Welcome ${message.userEmail || "user"}! Your extension is now linked.`,
          });
        }

        sendResponse({ success: true });
      } catch (err) {
        console.error("[Consently] Auth sync error:", err);
        sendResponse({ success: false, error: "Storage error" });
      }
    })();

    return true;
  }
});

// ---------------------------------------------------------------------------
// Scout Discovery
// ---------------------------------------------------------------------------

async function handleScoutDiscovery(events: Partial<ConsentEvent>[]) {
  for (const eventData of events) {
    const event: ConsentEvent = { id: crypto.randomUUID(), ...eventData, synced: false };
    await appendEvent(event);
    await syncEvent(event);
  }
}

// ---------------------------------------------------------------------------
// Startup sync
// ---------------------------------------------------------------------------

chrome.runtime.onStartup.addListener(async () => {
  await flushUnsynced();
  await fetchUserSettings();
});
chrome.runtime.onInstalled.addListener(async () => {
  await flushUnsynced();
  await fetchUserSettings();
});
