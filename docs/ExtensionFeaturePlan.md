# Extension Main Feature: Sign-up Privacy Detection

## What we're building

When a user signs in or signs up on **any** website, the extension detects the form submission, fetches and analyzes the site's privacy policy via Gemini AI, and shows a non-intrusive overlay with:
- Plain-language summary of what data is collected
- Who the data is shared with
- Any red flags
- "Add to My Dashboard" / "Dismiss" actions

The core infrastructure (privacyAnalyzer.ts, overlay.tsx, sync.ts) already exists. We're wiring the detection trigger.

---

## Current State

**Already working:**
- `background/privacyAnalyzer.ts` — full Gemini AI privacy policy pipeline
- `content/overlay.tsx` — React overlay component (loading state, analysis display, add/dismiss)
- `background/sync.ts` — POSTs consent events to dashboard API
- `background/index.ts` — handles `SHOW_OVERLAY`, `UPDATE_OVERLAY` messages
- Detection works for OAuth flows (Google, GitHub, etc.)

**Missing:**
- Detection of general sign-up/sign-in forms on arbitrary websites
- Background handler for `SIGN_UP_DETECTED` message from content script

---

## Architecture

```
content/index.tsx
  └─ SignUpDetector (new)
       ├─ URL pattern check (/signup, /register, /login, /auth, etc.)
       ├─ DOM scan: form with password input present
       └─ on form submit → sends SIGN_UP_DETECTED to background

background/index.ts
  └─ handles SIGN_UP_DETECTED
       ├─ sends SHOW_OVERLAY (analyzing: true) to tab
       ├─ calls analyzePolicyForDomain(domain)
       └─ sends UPDATE_OVERLAY (event with analysis) OR ANALYSIS_FAILED

content/overlay.tsx
  └─ (no changes needed — already handles all 3 message types)
```

---

## Implementation Plan

### Step 1 — Add `SIGN_UP_DETECTED` to message types
**File:** `extension/src/lib/types.ts`

Add `"sign_up_detected"` to the ExtensionMessage union or simply use a string literal in the handlers. No type file change required if we use consistent string literals.

### Step 2 — Add sign-up detector to content script
**File:** `extension/src/content/index.tsx`

Add `setupSignUpDetector()` that:
1. Checks the current page URL for sign-up/sign-in patterns
2. Scans the DOM for a `<form>` containing a `<input type="password">`
3. Attaches a `submit` event listener to that form
4. On submit: sends `SIGN_UP_DETECTED` message to background with `{ domain, tabId }`
5. Also sets up a `MutationObserver` to catch dynamically inserted forms (SPAs)
6. Uses a `detected` flag to avoid double-firing per page load

**URL patterns to match (path only, case-insensitive):**
`/sign.?up|/register|/create.?account|/join|/sign.?in|/login|/log.?in|/auth|/onboard/`

**Form detection logic:**
```
hasPasswordInput = form.querySelector('input[type="password"]') !== null
hasEmailOrUsername = form.querySelector('input[type="email"], input[type="text"], input[name*="email"], input[name*="user"]') !== null
isSignUpForm = hasPasswordInput && hasEmailOrUsername
```

### Step 3 — Handle `SIGN_UP_DETECTED` in background
**File:** `extension/src/background/index.ts`

Add handler inside `chrome.runtime.onMessage.addListener`:
```
if (message.type === "SIGN_UP_DETECTED") {
  const domain = message.domain
  const tabId = sender.tab?.id

  // 1. Build a shell event for the domain
  const shellEvent = buildShellEvent(domain, tabId)

  // 2. Show overlay immediately with analyzing=true
  chrome.tabs.sendMessage(tabId, { type: "SHOW_OVERLAY", event: shellEvent, analyzing: true })

  // 3. Run AI analysis
  analyzePolicyForDomain(domain).then(analysis => {
    if (!analysis) {
      chrome.tabs.sendMessage(tabId, { type: "ANALYSIS_FAILED" })
      return
    }
    // 4. Patch event with analysis results
    const enrichedEvent = {
      ...shellEvent,
      overallRisk: analysis.riskVerdict,
      plainSummary: analysis.plainSummary,
      privacyPolicyUrl: analysis.privacyPolicyUrl,
    }
    // 5. Update overlay
    chrome.tabs.sendMessage(tabId, { type: "UPDATE_OVERLAY", event: enrichedEvent, analysis })
  })
}
```

The `buildShellEvent()` function already exists — it creates a LOW-risk placeholder. We reuse it.

### Step 4 — Guard against duplicate triggers
In content script, use a `Set<string>` of already-detected domains per session (stored in sessionStorage key `consently_detected`). Only fire once per domain per browsing session.

### Step 5 — Handle the "Add" action in background
The overlay's `onAdd` handler already calls `updateEventAction("granted")` via storage and sends a message. The background handler for `ADD_CONSENT` already exists and calls `syncEvent()`. No changes needed.

### Step 6 — Minor overlay copy updates
**File:** `extension/src/content/overlay.tsx`

Update the loading message from "Reading privacy policy..." to:
> "Reading what **{appName}** collects about you..."

This is a one-line copy change already supported by the component's props.

---

## Files to Edit

| File | Change |
|------|--------|
| `extension/src/content/index.tsx` | Add `setupSignUpDetector()` + MutationObserver |
| `extension/src/background/index.ts` | Add `SIGN_UP_DETECTED` handler |
| `extension/src/content/overlay.tsx` | Minor copy tweak for loading message |

No new files needed. No manifest changes needed (content script already runs on `<all_urls>`).

---

## Edge Cases

| Case | Handling |
|------|----------|
| SPA — form appears after JS renders | MutationObserver on `document.body` watching for added `input[type=password]` |
| User visits same site twice | `sessionStorage` flag prevents double overlay |
| OAuth flow triggers both detectors | Existing OAuth detector fires first (URL match is faster). Sign-up detector's `detected` flag blocks second fire |
| Policy fetch fails or times out | `ANALYSIS_FAILED` message shows fallback state in overlay (already implemented) |
| Gemini API unavailable | `analyzePolicyForDomain` returns null → ANALYSIS_FAILED path |
| User on Google/GitHub OAuth page | Already handled by existing OAuth detector. Sign-up detector skips known provider domains |

---

## Demo Flow (Matches Ideal UI doc Phase 2)

1. User visits e.g. `notion.so/signup`
2. Extension detects password form
3. User submits the sign-up form
4. Overlay slides in: "Reading what Notion collects about you..." (spinner)
5. ~3-5 seconds: overlay updates with analysis
   - Red flag: "Notion shares behavioral data with analytics vendors"
   - Summary: one sentence plain English
   - Data collected chips: email, name, usage data
   - Shared with: Amplitude, Intercom
6. User clicks "Add to My Dashboard" → event synced to Consently
7. Extension badge shows count, popup shows new entry
