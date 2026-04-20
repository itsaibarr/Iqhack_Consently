# Consently Extension — System Plan

> How the browser extension detects OAuth consent events and feeds the dashboard.

---

## The Core Idea

When a user clicks "Sign in with Google" (or GitHub, Facebook, Microsoft, etc.) on any website, the browser goes through a specific handshake called OAuth. During this handshake, the website must declare exactly what data it wants to access — your email, your calendar, your contacts, and so on. This declaration happens in a URL that the browser visits, and it contains all the information we need.

The Consently extension sits in the browser and watches for these moments. It reads the declaration, translates it into plain language, and sends a record to your personal dashboard. You didn't have to read the fine print. We did it for you.

---

## The Flow, Step by Step

### Step 1 — The User Visits a Website and Clicks "Sign In With..."

Nothing special happens yet. The user is just browsing normally. The extension is dormant.

### Step 2 — The OAuth Redirect Fires

When the user clicks a social login button, the website redirects their browser to an OAuth authorization URL — something like `accounts.google.com/o/oauth2/auth?...`. This URL contains a parameter called `scope`, which is a list of everything the website is requesting access to.

Examples of what scopes look like in the URL:
- `scope=email profile` — just your name and email
- `scope=email profile https://www.googleapis.com/auth/calendar` — your name, email, AND full calendar access
- `scope=read:user repo` — on GitHub, your profile plus all your repositories

This URL fires in the browser tab as a navigation event. The extension can intercept it.

### Step 3 — The Extension Intercepts and Parses the URL

The extension uses the browser's `webNavigation` or `webRequest` API to watch for navigations to known OAuth provider domains (Google, GitHub, Facebook, Microsoft, LinkedIn, Apple, etc.).

When it detects a match, it pulls the following from the URL:
- **`scope`** — the data permissions being requested
- **`client_id`** — the unique identifier of the app asking for access
- **`redirect_uri`** — the domain that will receive the token (tells us which app it is)
- **`state`** — a session token (we don't read the value, just note that one exists)

From the `redirect_uri` or `client_id`, the extension figures out which app or website is asking. From the `scope`, it knows what they want.

### Step 4 — Scope Translation

Raw OAuth scopes are developer-speak. `https://www.googleapis.com/auth/gmail.readonly` means nothing to a normal person.

The extension has a built-in translation dictionary that maps known scopes to plain-language descriptions and risk levels:

| Raw Scope | Plain Language | Risk Level |
|---|---|---|
| `email` | Your email address | Low |
| `profile` | Your name and profile photo | Low |
| `https://www.googleapis.com/auth/calendar` | Read and write your calendar events | Medium |
| `https://www.googleapis.com/auth/gmail.readonly` | Read all your emails | High |
| `https://www.googleapis.com/auth/contacts` | Access your full contact list | High |
| `repo` (GitHub) | Full access to your repositories | High |
| `read:user` (GitHub) | Your GitHub profile data | Low |

This dictionary covers all major Google, GitHub, Facebook, and Microsoft scopes. For unknown scopes, the extension flags them as "Unrecognized — may require attention."

### Step 5 — Risk Score Calculation

Each permission has a base sensitivity score. The extension adds them up and classifies the overall request:

- **Low** — only identity data (name, email, profile photo)
- **Medium** — behavioral data (activity, history, calendar)
- **High** — financial, communications, biometric, or broad access

The score is recalculated every time a new consent event is detected for the same service.

### Step 6 — Sending the Record to the Dashboard

The extension sends a structured record to the Consently dashboard via a lightweight API call. The record contains:

```json
{
  "detectedAt": "2026-04-20T14:32:00Z",
  "provider": "google",
  "appName": "Notion",
  "appDomain": "notion.so",
  "scopesRaw": ["email", "profile", "openid"],
  "scopesTranslated": [
    { "raw": "email", "label": "Your email address", "risk": "low" },
    { "raw": "profile", "label": "Your name and profile photo", "risk": "low" }
  ],
  "overallRisk": "low",
  "userAction": "granted"
}
```

If the user is not logged in to Consently yet, the record is stored locally in the extension and synced when they log in.

### Step 7 — Dashboard Update

The dashboard receives the event and:
1. Creates or updates the service card for "Notion"
2. Logs the event to the Permission History timeline
3. Recalculates the user's overall risk score
4. Shows a notification badge on the extension icon: "New consent detected"

The user can open Consently, see "Notion was just added — it can see your email and name," and decide whether they're comfortable with that.

---

## What the Extension Does NOT Do

- It does not read the content of your emails, files, or calendar — only the permission declarations
- It injects a read-only informational overlay during OAuth flows — it does not modify page content, intercept form submissions, or interact with the OAuth provider's UI
- It does not block or interrupt the login flow in any way — the OAuth continues normally regardless of what the user does in the overlay
- It does not store OAuth tokens or session credentials
- It does not communicate with any third party other than the Consently API

---

## Architecture Overview

```
Browser Tab
    │
    │  User visits site, clicks "Sign in with Google"
    ▼
OAuth Provider URL
(accounts.google.com/o/oauth2/auth?scope=email+profile&client_id=...)
    │
    │  webNavigation.onBeforeNavigate fires
    ▼
Extension Background Service Worker
    │
    ├─ URL matches known OAuth provider? → YES
    ├─ Parse: scope, client_id, redirect_uri
    ├─ Translate scopes → plain language + risk
    ├─ Build consent record
    │
    ▼
Consently API  ──────────────────────────────────────→  Database
                                                              │
                                                              ▼
                                                     Dashboard (Next.js)
                                                      - Service cards update
                                                      - Timeline entry added
                                                      - Risk score recalculated
```

---

## The Sign-Up Intercept Window

This is the most important UX moment in the entire product. When the extension detects an OAuth authorization URL, it does not wait for the user to click the toolbar icon. It immediately injects a small, non-blocking overlay window into the current tab — appearing at the same time the OAuth provider's own consent screen loads.

The user sees two things at once: the service's consent screen on the left, and Consently's plain-language breakdown sliding in from the bottom-right corner.

### What the Window Shows

The overlay is compact — roughly 320px wide, designed to never cover the OAuth consent screen itself. It contains four elements, rendered in under 200ms from detection:

**1. Who is asking**
The app's domain name and a resolved display name (e.g. "Notion" from `notion.so`), alongside a risk badge colored with Consently's risk palette — green, amber, or red.

**2. What they want — in plain language**
A short list of the translated scope labels, not the raw developer strings. Maximum 4 items shown; if there are more, a "and 2 more" expander appears. Each item has a small icon indicating the data category (envelope for email, calendar icon, folder for files, etc.).

Example for a Notion login:
```
✉  Your email address          · Low
👤 Your name and profile photo · Low
```

Example for a calendar integration:
```
✉  Your email address          · Low
📅 Read and write your calendar · Medium
📁 Access all files in Drive   · High  ← highlighted in red
```

**3. The risk summary line**
One sentence at the bottom of the list: "This app is requesting medium-level access to your data." or "One high-risk permission detected — this app can read all your emails."

**4. Two action buttons**

| Button | Action |
|---|---|
| **"Add to my dashboard"** (primary, blue) | Sends the consent event to the dashboard and closes the overlay |
| **"Dismiss"** (ghost) | Closes the overlay. The event is stored locally but not pushed to the dashboard unless the user adds it later from the toolbar popup. |

The user is never blocked. Both buttons dismiss the overlay immediately. The OAuth flow continues normally regardless of what they choose.

### Window Behavior Rules

- **Appears after 400ms delay** — gives the OAuth provider page time to render so the overlay doesn't feel like it's fighting the page load
- **Auto-dismisses after 12 seconds** with a thin countdown bar at the bottom, unless the user hovers (hover pauses the timer)
- **Never covers the "Allow" / "Authorize" button** on the OAuth provider screen — positioned to avoid this via a fixed bottom-right anchor
- **One window at a time** — if another OAuth is detected before the first is dismissed, the new one replaces it
- **Accessible** — full keyboard navigation: Tab to cycle buttons, Enter to confirm, Escape to dismiss. ARIA role `dialog` with `aria-label="Consently — data request detected"`

### The "Add to Dashboard" Confirmation

When the user clicks "Add to my dashboard":
1. The overlay shrinks and shows a single line: "✓ Added to Consently" with the app name
2. It fades out after 1.5 seconds
3. The service card appears on the dashboard on the next focus/refresh

When the user clicks "Dismiss" or the timer expires:
1. The overlay fades out immediately
2. The event is saved locally in `chrome.storage.local` with `addedToDashboard: false`
3. The toolbar icon badge shows "!" so the user knows something was detected
4. If they open the toolbar popup later, the pending event is listed with an "Add now" button

### Why This Approach

Most users will not remember to open the Consently dashboard proactively. The intercept window meets the user at the exact moment the data sharing is happening — when the context is live and the decision feels real. "You are about to give Notion access to read all your emails. Want to track that?" is a much more effective prompt than a weekly digest.

---

## Extension Toolbar Popup (What the User Sees on Icon Click)

When the user clicks the Consently icon in the browser toolbar, they see a compact popup showing:

1. **Pending events** — any detections the user dismissed without adding, with "Add now" buttons
2. **Last added service** — "5 minutes ago: Notion added · Low risk"
3. **Active consent count** — "14 active consents tracked"
4. **Risk summary** — "2 high-risk, 4 medium-risk"
5. **"Open Dashboard" button** — links to the full web app

The popup handles the second-chance adds for dismissed events. All revocation, history, and detail views happen on the full dashboard.

---

## Data the Extension Stores Locally

The extension stores a small cache in `chrome.storage.local`:

- The list of detected consent events (for offline/pre-login users)
- The translation dictionary (so scope lookups work without a network call)
- The user's session token (encrypted) for API communication

The cache is capped at 500 events and rotates oldest-first. Everything is also synced to the backend.

---

## How the Dashboard Knows What to Show

The dashboard is the existing Consently Next.js web app. The extension feeds it new data through a simple backend API. On the dashboard side:

- Each consent event becomes or updates a **Service Card** in the consent map
- Each event is appended to the **Permission History** timeline
- The **Risk Score** widget recalculates on every new event
- If a service is detected for the first time, the user gets a subtle notification prompt

The dashboard does not need to poll — the extension pushes events when they happen. For the hackathon demo, the API can be a simple Next.js API route writing to a JSON file or Supabase table. The dashboard re-fetches on focus.

---

## Why This Approach Works Without Service Cooperation

The key insight is that **the OAuth consent URL is public information**. It is a browser navigation visible to any extension with the `webNavigation` permission. We are not hacking anything. We are reading the same declaration that the OAuth provider (Google, GitHub, etc.) already shows to the user in their consent screen — we just record it and translate it automatically.

No third-party service needs to integrate with Consently. No API keys from external apps are needed. The data is already flowing through the browser; we just make it visible.

---

## Technical Permissions Required

The extension will request the following Chrome permissions, with justification:

| Permission | Why |
|---|---|
| `webNavigation` | To detect OAuth redirect URLs |
| `storage` | To cache events locally before sync |
| `scripting` | To inject the intercept overlay window into the active tab |
| `notifications` | To alert on detections when the tab is not active |

`host_permissions` required:
- `https://accounts.google.com/*` — to detect Google OAuth navigations
- `https://github.com/*` — to detect GitHub OAuth navigations
- `<all_urls>` — to inject the overlay content script into any site that triggers an OAuth flow

We do NOT request:
- `cookies` — not needed
- `webRequest` blocking — we are read-only, never intercepting or modifying requests
- `tabs` for URL reading — `webNavigation` gives us OAuth URLs without broad tab access

The `<all_urls>` host permission is required solely to inject the overlay UI. This will be clearly disclosed in the Chrome Web Store listing with a plain-language explanation: "Consently needs permission to show an informational window on any website where you sign in with Google, GitHub, or another service."

---

## Scope for Hackathon vs Full Build

### Hackathon (now)
- Detect Google OAuth scopes only
- Translation dictionary for top 20 Google scopes
- Intercept overlay injected into the active tab on detection
- "Add to dashboard" / "Dismiss" buttons in the overlay
- Push to a mock API endpoint (Next.js API route writing to in-memory state) when user clicks "Add"
- Toolbar popup shows pending (dismissed) events with "Add now"
- Dashboard auto-refreshes every 10 seconds

### Full Build (v0.2)
- Support Google, GitHub, Facebook, Microsoft, LinkedIn, Apple
- Full translation dictionary (200+ scopes)
- Supabase backend with user accounts
- Real-time dashboard updates via Supabase Realtime
- Historical scan: detect existing connected apps from Google account settings page
- Risk score explanation modal ("Why is this High Risk?")
