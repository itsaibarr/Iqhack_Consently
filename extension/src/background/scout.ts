import { ConsentEvent } from "../lib/types";

/**
 * Responsibility: Detect when the user is viewing their Google Security permissions
 * and offer to "Scout" existing connections.
 */
export async function scoutGooglePermissions() {
  const currentUrl = window.location.href;
  
  if (!currentUrl.includes("myaccount.google.com/permissions")) {
    return;
  }

  console.log("[Consently] Scouting active on Google Permissions page");

  // Logic: Scrape the list of connected apps
  // Google's permissions page often uses <li> or <div> with specific aria-labels or headers.
  // We'll look for elements that seem to be app names.
  
  const discoveredEvents: Partial<ConsentEvent>[] = [];
  
  // Heuristic: App names are often in headers or bold text within list items
  const appContainers = document.querySelectorAll("li, [role='listitem']");
  
  appContainers.forEach((container) => {
    // Try to find the name (usually the first strong or header-like element)
    const nameEl = container.querySelector("h3, strong, [role='heading']");
    if (nameEl && nameEl.textContent) {
      const name = nameEl.textContent.trim();
      
      // Skip generic sections
      if (name.length > 2 && !name.includes("Manage") && !name.includes("Sign in")) {
        discoveredEvents.push({
          appName: name,
          provider: "google",
          detectedAt: new Date().toISOString(),
          userAction: "detected",
          appDomain: "discovered.via.scout",
          overallRisk: "LOW", // Default for discovered apps
          scopesRaw: [],
          scopesTranslated: []
        });
      }
    }
  });

  if (discoveredEvents.length > 0) {
    console.log(`[Consently] Scout found ${discoveredEvents.length} apps`);
    chrome.runtime.sendMessage({ 
      type: "SCOUT_DISCOVERY", 
      events: discoveredEvents 
    });
    
    // Visual feedback (optional: we can show a small notification on the page)
    showScoutBadge(discoveredEvents.length);
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

// Auto-run if on the target page
if (typeof window !== "undefined") {
  // Give it a second for dynamic content to load
  setTimeout(scoutGooglePermissions, 2000);
}
