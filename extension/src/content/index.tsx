import { scoutGooglePermissions } from "../background/scout";

// ---------------------------------------------------------------------------
// Page text extractor — responds to background requests with the live DOM text.
// All UI is handled by the Chrome Side Panel, not injected into the page.
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PAGE_TEXT") {
    sendResponse({ text: document.body.innerText.slice(0, 8000) });
    return true;
  }
});

// Google OAuth permissions scouter (unchanged)
if (window.location.host.includes("google.com")) {
  scoutGooglePermissions();
}
