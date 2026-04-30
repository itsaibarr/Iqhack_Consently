import { ConsentEvent } from "../lib/types";
import { getState } from "../lib/storage";

/**
 * Responsibility: Detect when the user is viewing their Google Security permissions
 * and offer to "Scout" existing connections.
 */
export async function scoutGooglePermissions() {
  const currentUrl = window.location.href;
  
  const state = await getState();
  if (state.settings.stealth_mode) {
    console.log("[Consently] Stealth Mode active: Suppression startup scout.");
    return;
  }

  if (!currentUrl.includes("myaccount.google.com/permissions")) {
    return;
  }

  console.log("[Consently] Scouting active on Google Permissions page");

  try {
    const discoveredEvents: Partial<ConsentEvent>[] = [];

    // Google's permissions page uses <li> or [role='listitem'] containers;
    // app names appear in the first heading/strong child. This is fragile —
    // Google can change markup silently, hence the try/catch.
    const appContainers = document.querySelectorAll("li, [role='listitem']");

    appContainers.forEach((container) => {
      const nameEl = container.querySelector("h3, strong, [role='heading']");
      if (nameEl && nameEl.textContent) {
        const name = nameEl.textContent.trim();
        if (name.length > 2 && !name.includes("Manage") && !name.includes("Sign in")) {
          discoveredEvents.push({
            appName: name,
            provider: "google",
            detectedAt: new Date().toISOString(),
            userAction: "detected",
            appDomain: "discovered.via.scout",
            overallRisk: "LOW",
            scopesRaw: [],
            scopesTranslated: [],
          });
        }
      }
    });

    if (discoveredEvents.length > 0) {
      console.log(`[Consently] Scout found ${discoveredEvents.length} apps`);
      chrome.runtime.sendMessage({ type: "SCOUT_DISCOVERY", events: discoveredEvents });
      showScoutBadge(discoveredEvents.length);
    } else {
      console.log("[Consently] Scout found no apps — Google may have changed their markup");
      showScoutFallback();
    }
  } catch (err) {
    console.warn("[Consently] Scout DOM scraping failed:", err);
    showScoutFallback();
  }
}

function showScoutBadge(count: number) {
  const badge = document.createElement("div");
  badge.innerHTML = `Consently: Found ${count} connections. <a href="#" id="consently-sync-scout" style="color:white; text-decoration:underline">Sync now</a>`;
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #3B6BF5;
    color: white;
    padding: 12px 24px;
    border-radius: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 2147483647;
  `;
  document.body.appendChild(badge);
  
  document.getElementById("consently-sync-scout")?.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "CONSENT_ACCEPTED" });
    badge.innerText = "✓ Synced to Dashboard";
    setTimeout(() => badge.remove(), 3000);
  });
}

function showScoutFallback() {
  const badge = document.createElement("div");
  badge.textContent = "Consently: Could not read permissions — try refreshing the page.";
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #6B7280;
    color: white;
    padding: 12px 24px;
    border-radius: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 2147483647;
  `;
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 5000);
}

