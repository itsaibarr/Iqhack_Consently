# Consently Extension — Technical Implementation Plan

> Companion to `ExtensionSystemPlan.md`. This document specifies files, interfaces, data flow, and build order for engineers.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Extension language | TypeScript (strict) | Matches dashboard codebase |
| Extension bundler | Vite + CRXJS plugin | First-class Manifest V3 + HMR in dev |
| Popup UI | React 19 + Tailwind v4 | Reuse dashboard design tokens |
| Background logic | Service Worker (no DOM) | Required by Manifest V3 |
| Local storage | `chrome.storage.local` via typed wrapper | Async, survives background SW restarts |
| API transport | `fetch` to Next.js API routes | No extra infra for hackathon |
| Shared types | `packages/shared` symlinked or copied | Single source of truth with dashboard |

---

## Repository Layout

The extension lives as a sibling directory to the Next.js app, sharing types.

```
Iqhack/
├── src/                         # Existing Next.js dashboard
│   ├── lib/
│   │   ├── constants.ts         # CompanyRecord, ActivityRecord — already exists
│   │   └── privacy.ts           # Risk scoring — already exists
│   └── app/
│       └── api/
│           └── consents/
│               └── route.ts     # NEW — receives extension events
├── extension/                   # NEW — Chrome extension package
│   ├── manifest.json
│   ├── src/
│   │   ├── background/
│   │   │   ├── index.ts         # Service worker entry point
│   │   │   ├── detector.ts      # OAuth URL interception
│   │   │   ├── parser.ts        # URL → ConsentEvent
│   │   │   └── sync.ts          # Push events to dashboard API
│   │   ├── popup/
│   │   │   ├── index.tsx        # React popup root
│   │   │   ├── PopupApp.tsx     # Popup shell
│   │   │   └── popup.html
│   │   ├── content/             # (empty for now — no page injection needed)
│   │   ├── lib/
│   │   │   ├── scopes.ts        # Scope translation dictionary
│   │   │   ├── risk.ts          # Risk scoring (mirrors privacy.ts logic)
│   │   │   ├── storage.ts       # Typed chrome.storage wrapper
│   │   │   └── types.ts         # Shared types (ConsentEvent, ScopeEntry)
│   └── vite.config.ts
└── docs/
    ├── ExtensionSystemPlan.md   # Plain English system overview
    └── ExtensionTechPlan.md     # This file
```

---

## Core Types (`extension/src/lib/types.ts`)

These types are the contract between every module in the extension.

```typescript
export type OAuthProvider = "google" | "github" | "facebook" | "microsoft" | "apple" | "unknown";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ScopeEntry {
  raw: string;
  label: string;          // human-readable, e.g. "Read all your emails"
  category: "identity" | "communication" | "files" | "calendar" | "financial" | "access";
  risk: RiskLevel;
}

export interface ConsentEvent {
  id: string;             // crypto.randomUUID()
  detectedAt: string;     // ISO 8601
  provider: OAuthProvider;
  appDomain: string;      // from redirect_uri, e.g. "notion.so"
  appName: string;        // resolved from domain, e.g. "Notion"
  clientId: string;       // raw client_id param
  scopesRaw: string[];
  scopesTranslated: ScopeEntry[];
  overallRisk: RiskLevel;
  userAction: "granted" | "cancelled" | "detected"; // "detected" if we can't confirm outcome
  synced: boolean;        // false until API confirms receipt
}

export interface ExtensionState {
  events: ConsentEvent[];
  lastSyncAt: string | null;
  userId: string | null;
}
```

---

## Module 1 — OAuth Detector (`background/detector.ts`)

**Responsibility:** Watch all browser navigation events and decide if a URL is an OAuth authorization request.

### Known OAuth Provider Patterns

```typescript
const OAUTH_PATTERNS: Record<OAuthProvider, RegExp> = {
  google:    /accounts\.google\.com\/o\/oauth2\/(auth|v2\/auth)/,
  github:    /github\.com\/login\/oauth\/authorize/,
  facebook:  /www\.facebook\.com\/dialog\/oauth/,
  microsoft: /login\.microsoftonline\.com\/[^/]+\/oauth2\/(v2\.0\/)?authorize/,
  apple:     /appleid\.apple\.com\/auth\/authorize/,
  unknown:   /$^/,  // never matches
};
```

### Detection Logic

```typescript
// Registered in background/index.ts
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;  // main frame only

  const provider = detectProvider(details.url);
  if (!provider) return;

  const event = parseOAuthUrl(details.url, provider);
  if (!event) return;

  handleConsentEvent(event);
});
```

**Key constraint:** `onBeforeNavigate` fires before the request leaves the browser. We do not need `webRequestBlocking` — we are read-only.

---

## Module 2 — URL Parser (`background/parser.ts`)

**Responsibility:** Extract structured data from a matched OAuth URL.

### Parsing Steps

1. Construct a `URL` object from the raw string
2. Read `scope`, `client_id`, `redirect_uri` from `searchParams`
3. Split scopes by space or `+`
4. Normalize each scope (trim, lowercase where safe)
5. Resolve `appDomain` from `redirect_uri` (strip `https://`, take hostname)
6. Map each scope through `scopes.ts` dictionary
7. Compute `overallRisk` — take the highest single scope risk
8. Return a `ConsentEvent` or `null` if scope param is missing

### Edge Cases

| Situation | Handling |
|---|---|
| `scope` param absent | Return `null` — not a real OAuth auth request |
| `redirect_uri` absent | Use `client_id` as fallback identifier, appDomain = "unknown" |
| Scope not in dictionary | `ScopeEntry` with label "Unrecognized permission", risk "MEDIUM" |
| Duplicate scopes | Deduplicate before translating |
| URL-encoded scopes | `decodeURIComponent` before splitting |

---

## Module 3 — Scope Dictionary (`lib/scopes.ts`)

**Responsibility:** Map raw OAuth scope strings to `ScopeEntry` objects.

### Structure

```typescript
const SCOPE_MAP: Record<string, Omit<ScopeEntry, "raw">> = {
  // Google — Identity
  "email":                                        { label: "Your email address",                  category: "identity",      risk: "LOW" },
  "profile":                                      { label: "Your name and profile photo",          category: "identity",      risk: "LOW" },
  "openid":                                       { label: "Verify your identity (OpenID)",        category: "identity",      risk: "LOW" },

  // Google — Gmail
  "https://www.googleapis.com/auth/gmail.readonly":      { label: "Read all your emails",         category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/gmail.send":          { label: "Send emails on your behalf",   category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/gmail.modify":        { label: "Read, delete and modify emails", category: "communication", risk: "HIGH" },

  // Google — Calendar
  "https://www.googleapis.com/auth/calendar":            { label: "Read and write your calendar", category: "calendar",      risk: "MEDIUM" },
  "https://www.googleapis.com/auth/calendar.readonly":   { label: "Read your calendar events",    category: "calendar",      risk: "MEDIUM" },

  // Google — Drive
  "https://www.googleapis.com/auth/drive":               { label: "Access all files in your Drive", category: "files",       risk: "HIGH" },
  "https://www.googleapis.com/auth/drive.readonly":      { label: "Read all files in your Drive",   category: "files",       risk: "HIGH" },
  "https://www.googleapis.com/auth/drive.file":          { label: "Access files this app creates",  category: "files",       risk: "LOW" },

  // Google — Contacts
  "https://www.googleapis.com/auth/contacts":            { label: "Read and write your contacts", category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/contacts.readonly":   { label: "Read your contacts list",      category: "communication", risk: "HIGH" },

  // GitHub
  "read:user":       { label: "Read your GitHub profile",          category: "identity",  risk: "LOW" },
  "user:email":      { label: "Read your GitHub email addresses",  category: "identity",  risk: "LOW" },
  "repo":            { label: "Full access to all your repositories", category: "files",  risk: "HIGH" },
  "public_repo":     { label: "Read your public repositories",     category: "files",     risk: "LOW" },
  "read:org":        { label: "Read your organization membership", category: "access",    risk: "MEDIUM" },
  "write:org":       { label: "Manage your organization membership", category: "access",  risk: "HIGH" },

  // Microsoft
  "User.Read":       { label: "Read your Microsoft account profile", category: "identity", risk: "LOW" },
  "Mail.Read":       { label: "Read your Outlook emails",           category: "communication", risk: "HIGH" },
  "Calendars.Read":  { label: "Read your Outlook calendar",         category: "calendar",  risk: "MEDIUM" },
  "Files.Read.All":  { label: "Read all files in your OneDrive",    category: "files",     risk: "HIGH" },
};

export function translateScope(raw: string): ScopeEntry {
  const entry = SCOPE_MAP[raw];
  if (entry) return { raw, ...entry };
  return { raw, label: `Unrecognized permission: ${raw}`, category: "access", risk: "MEDIUM" };
}
```

**Hackathon scope:** Ship with all Google + GitHub entries above (covers ~90% of real-world OAuth). Add Microsoft, Facebook, Apple in v0.2.

---

## Module 4 — Risk Scorer (`lib/risk.ts`)

Mirrors the logic in `src/lib/privacy.ts` but operates on `ScopeEntry[]` instead of `CompanyRecord`.

```typescript
const RISK_WEIGHTS: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 3, HIGH: 10 };

export function computeOverallRisk(scopes: ScopeEntry[]): RiskLevel {
  if (scopes.length === 0) return "LOW";
  
  // Any single HIGH scope → overall HIGH
  if (scopes.some(s => s.risk === "HIGH")) return "HIGH";
  
  // Weighted sum: 2+ MEDIUM scopes → HIGH
  const score = scopes.reduce((acc, s) => acc + RISK_WEIGHTS[s.risk], 0);
  if (score >= 6) return "HIGH";
  if (score >= 3) return "MEDIUM";
  return "LOW";
}
```

---

## Module 5 — Storage Wrapper (`lib/storage.ts`)

`chrome.storage.local` is callback-based and untyped. This wrapper makes it typed and promise-based.

```typescript
const STORAGE_KEY = "consently_state";

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? { events: [], lastSyncAt: null, userId: null };
}

export async function appendEvent(event: ConsentEvent): Promise<void> {
  const state = await getState();
  const events = [event, ...state.events].slice(0, 500); // cap at 500
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...state, events } });
}

export async function markSynced(eventId: string): Promise<void> {
  const state = await getState();
  const events = state.events.map(e => e.id === eventId ? { ...e, synced: true } : e);
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...state, events } });
}
```

---

## Module 6 — API Sync (`background/sync.ts`)

**Responsibility:** Send new `ConsentEvent` records to the Next.js dashboard API.

```typescript
const API_BASE = process.env.VITE_DASHBOARD_URL ?? "http://localhost:3000";

export async function syncEvent(event: ConsentEvent): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/consents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return res.ok;
  } catch {
    return false;  // caller retries on next SW wake
  }
}

// Called from background/index.ts after appendEvent
export async function flushUnsynced(): Promise<void> {
  const state = await getState();
  const unsynced = state.events.filter(e => !e.synced);
  for (const event of unsynced) {
    const ok = await syncEvent(event);
    if (ok) await markSynced(event.id);
  }
}
```

**Retry strategy:** `flushUnsynced` is called on every SW wake (every detection + on popup open). No complex queue needed for hackathon.

---

## Module 7 — Background Entry (`background/index.ts`)

Wires everything together. This is the service worker root.

```typescript
import { detectProvider } from "./detector";
import { parseOAuthUrl } from "./parser";
import { appendEvent } from "../lib/storage";
import { flushUnsynced } from "./sync";

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const provider = detectProvider(details.url);
  if (!provider) return;

  const event = parseOAuthUrl(details.url, provider);
  if (!event) return;

  await appendEvent(event);
  await flushUnsynced();

  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#3B6BF5" });
});

// Flush any pending events when SW wakes for other reasons
chrome.runtime.onStartup.addListener(flushUnsynced);
chrome.runtime.onInstalled.addListener(flushUnsynced);
```

---

## Module 8 — Dashboard API Route (`src/app/api/consents/route.ts`)

This is the receiving end on the Next.js side.

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { ConsentEvent } from "@/lib/types"; // or inline the type

// For hackathon: in-memory store. For v0.2: replace with Supabase insert.
const eventLog: ConsentEvent[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json() as ConsentEvent;

  // Basic validation
  if (!body.id || !body.provider || !body.appDomain) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  // Deduplicate by id
  if (!eventLog.find(e => e.id === body.id)) {
    eventLog.push(body);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(eventLog);
}
```

The dashboard's `ConsentContext` can poll `GET /api/consents` on `window.focus` to pick up new events detected by the extension.

---

## Module 9 — Popup UI (`popup/PopupApp.tsx`)

Minimal React component using existing Consently design tokens.

**What it renders:**
1. Last detected event with timestamp ("2 min ago — Notion requested your email")
2. Count of active tracked services
3. Count of HIGH-risk consents (red badge if > 0)
4. "Open Dashboard" button → `chrome.tabs.create({ url: DASHBOARD_URL })`

**State source:** `chrome.storage.local` via `getState()`. No network call in popup.

---

## Manifest (`extension/manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "Consently",
  "version": "0.1.0",
  "description": "See what data apps request when you sign in. Automatically.",
  "permissions": ["webNavigation", "storage", "notifications"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "32": "icons/icon32.png" }
  },
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "icons": {
    "32": "icons/icon32.png",
    "128": "icons/icon128.png"
  }
}
```

No `host_permissions` are needed because `webNavigation` does not require them for URL-pattern matching. We do not inject content scripts.

---

## Build Configuration (`extension/vite.config.ts`)

```typescript
import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: { popup: "src/popup/popup.html" },
    },
  },
});
```

Dev: `vite build --watch` + load `dist/` as unpacked extension in Chrome.

---

## Data Flow Diagram

```
chrome.webNavigation.onBeforeNavigate
          │
          ▼
    detector.ts          Is this a known OAuth URL?
          │                    YES ──► parser.ts
          │                              │
          │              Extract: provider, appDomain,
          │              clientId, scopesRaw
          │                              │
          │                         scopes.ts
          │              Translate each raw scope
          │              → ScopeEntry[]
          │                              │
          │                           risk.ts
          │              computeOverallRisk(scopes)
          │              → RiskLevel
          │                              │
          │              Build ConsentEvent object
          │                              │
          ▼                              ▼
    storage.ts                       sync.ts
  appendEvent()                    syncEvent()
  (local cache)                 POST /api/consents
          │                              │
          ▼                              ▼
  chrome.storage.local       Next.js API route
  (popup reads this)         (in-memory / Supabase)
                                         │
                                         ▼
                               Dashboard re-fetches
                               on window.focus
                               → ConsentContext updates
                               → Service cards appear
                               → Activity timeline entry added
```

---

## Build Order (Hackathon Sprint)

| Step | Output | Time |
|---|---|---|
| 1. `extension/src/lib/types.ts` | Core types | 20 min |
| 2. `extension/src/lib/scopes.ts` | Google + GitHub dictionary (25 entries) | 45 min |
| 3. `extension/src/lib/risk.ts` | Risk scorer | 15 min |
| 4. `extension/src/lib/storage.ts` | Storage wrapper | 20 min |
| 5. `extension/src/background/detector.ts` + `parser.ts` | Core detection | 45 min |
| 6. `extension/src/background/sync.ts` | API push | 20 min |
| 7. `extension/src/background/index.ts` | Wire-up | 15 min |
| 8. `src/app/api/consents/route.ts` | Dashboard receiver | 20 min |
| 9. Dashboard polling in `ConsentContext` | Live updates | 20 min |
| 10. `extension/src/popup/PopupApp.tsx` | Popup UI | 40 min |
| 11. `manifest.json` + `vite.config.ts` | Build config | 20 min |
| 12. Load in Chrome, test against Google login | Integration test | 30 min |

**Total: ~5 hours end-to-end.** Steps 1–9 (the detection pipeline) are the MVP core. Step 10 (popup) is polish.

---

## What Reuses the Existing Dashboard Codebase

| Extension needs | Reuse from dashboard |
|---|---|
| `RiskLevel` type | `src/lib/constants.ts` — same literal union |
| Risk color map | `src/lib/constants.ts` — `RISK_CONFIG_MAP` |
| Privacy scoring logic | `src/lib/privacy.ts` — mirror the weights |
| Design tokens in popup | `src/app/globals.css` — import `--color-primary-500` etc. |
| `ActivityRecord` shape | `src/lib/constants.ts` — map `ConsentEvent` → `ActivityRecord` at API layer |

The API route in step 8 should translate incoming `ConsentEvent` objects into the existing `CompanyRecord` / `ActivityRecord` shapes so the dashboard renders them without any UI changes.

---

## Hackathon Demo Simulation (No Real Extension Installed)

For the live demo, if the extension is not installed on the judge's machine, the dashboard can trigger a fake detection via a hidden keyboard shortcut or URL param:

`localhost:3000?simulate=oauth&app=notion&scopes=email,profile`

The dashboard reads the query param, creates a synthetic `ConsentEvent`, and animates it arriving — identical to what the real extension would push. This lets the demo work on any machine.
