# Consently Pre-Launch Audit Report
**Date:** 2026-04-30  
**Scope:** Dashboard (Next.js) + Browser Extension (MV3)  
**Baseline:** `docs/Consently_PRD.md` + `docs/Consently_Ideal_UI.md`  
**Verdict:** ~70–80% PRD alignment. Core mechanics work; user guidance and production safety need attention before public sharing.

---

## 1. What's Working Well

| Area | Status |
|---|---|
| Core PRD features | All shipped: Consent Map, Live Map topology, Activity History, Security Audit, Service Detail View, Revoke Confirmation, GDPR email triggers |
| Risk visualization | Correctly color-coded: RED `#EF4444` HIGH · AMBER `#F59E0B` MEDIUM · TEAL `#14A89C` LOW |
| Plain language map | `PLAIN_LANGUAGE_MAP` in `lib/privacy.ts` translates data types across `ServiceDetailView` and activity pages |
| Extension OAuth detection | 5 providers (Google, GitHub, Facebook, Microsoft, Apple) with 14-domain first-party filter |
| Company trust scoring | 3-layer model: trust factor × scope weights × sharing multiplier |
| Extension↔Dashboard sync | Handshake via `chrome.runtime.sendMessage` external API with origin validation; `flushUnsynced()` on connect |
| GDPR deletion pipeline | Resend-powered Article 17 email on revoke; fires per real consent record |
| Demo mode | Pre-loaded mock data, 2-second simulated handshake, local-only (no sync) |

---

## 2. Dashboard Bugs

| ID | Severity | Location | Issue |
|---|---|---|---|
| D1 | HIGH | `map/page.tsx` | ✅ FIXED: "Handshake Active" jargon shown as system status — Ideal UI explicitly mandates "Watching for new requests" |
| D2 | HIGH | `components/layout/Sidebar.tsx` | ✅ FIXED: Sidebar nav label reads "Consent Map" — PRD mandates plain-language labels ("Dashboard" or "My Data") |
| D3 | HIGH | `map/page.tsx` | ✅ FIXED: Empty state renders only a single blue circle with zero context — Ideal UI calls this "terrible for demos" and requires pre-loaded mock data + next-step CTA |
| D4 | MEDIUM | `components/ui/OnboardingFlow.tsx` | Onboarding stored in `localStorage`, fires only once, is dismissible, and is bypassed in demo mode — no re-trigger mechanism exists |
| D5 | MEDIUM | `components/consent/NodeGraph.tsx` | ✅ FIXED: `setState` called inside `useEffect` — React anti-pattern causing potential infinite re-renders |
| D6 | MEDIUM | `components/layout/Sidebar.tsx` | ✅ FIXED: Same `setState`-in-`useEffect` anti-pattern |
| D7 | LOW | `app/page.tsx` | ✅ FIXED: Multiple `any` type annotations — weakens TypeScript guarantees |

---

## 3. Extension Bugs

| ID | Severity | Location | Issue |
|---|---|---|---|
| E1 | CRITICAL | `extension/.env` | OpenRouter API key committed to repo (`VITE_OPENROUTER_API_KEY=sk-or-v1-507656fb…`). Bundled into `dist/` by Vite, visible to any user who inspects the extension |
| E2 | HIGH | `src/background/sync.ts` | `POST /api/consents` sends `userId` in body with no auth header — trust-on-first-use model; any client can POST as any user |
| E3 | HIGH | `src/popup/PopupApp.tsx` | ✅ FIXED: "Analyze This Page" closes popup immediately before analysis completes, giving no feedback; error states are invisible to user |
| E4 | MEDIUM | `src/background/scout.ts` | Google Permissions Scout requires manual navigation to `myaccount.google.com/permissions` — not automatic; users unlikely to discover it |
| E5 | MEDIUM | `src/content/overlay.tsx` · `src/content/sidebar.tsx` | Both files exist in build but are never activated — dead code inflates extension bundle |
| E6 | LOW | `src/background/privacyAnalyzer.ts` | Page text truncated to 8 000 chars; long privacy policies silently lose content without warning |

---

## 4. Missing PRD-Mandated Features

| # | Feature | PRD Reference | Current State |
|---|---|---|---|
| 1 | "Connect Service" manual entry | PRD §3 — user-initiated consent tracking | ✅ FIXED: Implemented via ConnectServiceModal |
| 2 | Onboarding mandatory first-visit gate | Ideal UI — "aha moment" must be inescapable | Dismissible + localStorage-only; one-shot |
| 3 | System status explanation | Ideal UI — "Watching for new requests" with tooltip | Status line shows technical jargon only |
| 4 | Extension install detection | PRD §4 — dashboard shows extension status | Dashboard has no awareness of whether extension is installed |
| 5 | Pro feature gating / upgrade prompts | PRD §Monetisation | No feature flags or upgrade path visible |
| 6 | Keyboard-navigable modals | Ideal UI — accessibility baseline | Revoke modal and Service Detail drawer lack focus trap + Escape key handling |
| 7 | Settings page functional controls | PRD §Settings | Settings page renders but toggles have no persisted effect |

---

## 5. Proposed Improvements

### P0 — Demo-Blocking (fix before any public share)

| Fix | Benefit |
|---|---|
| Replace "Handshake Active" → "Watching for new requests" | Removes last jargon violation; Ideal UI §1 |
| Add empty-state illustration + "Add your first service" CTA on Map page | Fixes worst demo dead-end |
| Scope `localStorage` onboarding to allow re-trigger via `/reset` route or query param | Enables repeat demos without clearing storage |
| Implement basic "Connect Service" modal (name + URL, manual entry) | Closes the most visible PRD gap |

### P1 — Quality Before Sharing with Judges

| Fix | Benefit |
|---|---|
| ✅ FIXED: Add `role="dialog"` + `aria-modal` + focus trap to Revoke modal | Baseline accessibility; keyboard-testable |
| ✅ FIXED: Fix `setState`-in-`useEffect` in `NodeGraph.tsx` and `Sidebar.tsx` | Eliminates console warnings, potential infinite loops |
| Add `aria-label` to all service cards and sidebar nav links | Screen-reader navigable |
| ✅ FIXED: Show analysis progress in popup after "Analyze This Page" click | Removes the "did it work?" uncertainty |

### P2 — Production Safety

| Fix | Benefit |
|---|---|
| Move `VITE_OPENROUTER_API_KEY` to a server-side proxy route | Prevents key exposure in extension bundle |
| Add auth header (`Authorization: Bearer <token>`) to extension→API sync | Prevents impersonation of any userId |
| Add `settings` page persistence via Supabase | Makes user preferences durable |

---

## 6. Production Risks

| # | Severity | Risk | Consequence | Fix |
|---|---|---|---|---|
| RISK-1 | CRITICAL | API key in extension bundle | Key is visible to any user who unzips the extension; quota theft, abuse | Proxy calls through a Next.js API route server-side |
| RISK-2 | CRITICAL | GDPR deletion email fires on mock data | `demo@consently.ai` records could trigger real deletion emails to real DPO addresses | Guard Resend calls with `if (isDemoMode) return` |
| RISK-3 | CRITICAL | No auth on extension→API sync | Any `POST /api/consents` with a valid `userId` string succeeds | Require Supabase JWT in `Authorization` header |
| RISK-4 | HIGH | Hardcoded `demo@consently.ai` dependency | Demo entirely breaks if this DB row is missing or email changes | Seed via migration, not manual insert |
| RISK-5 | HIGH | OAuth detection misses background flows | MV3 removed `webRequest`; any OAuth that opens in a background tab is invisible | Document limitation; consider tab URL monitoring via `chrome.tabs.onUpdated` |
| RISK-6 | HIGH | Privacy policy truncated at 8 000 chars | Long policies silently drop content; AI may miss critical clauses | Show warning in UI when truncation occurs |
| RISK-7 | HIGH | `chrome.storage.session` set to `TRUSTED_AND_UNTRUSTED_CONTEXTS` | Content scripts on malicious pages have full session storage access | Set to `TRUSTED_CONTEXTS` only |
| RISK-8 | MEDIUM | External message handler trusts any whitelisted origin | Any page served from `vercel.app` subdomains could send `AUTH_SUCCESS` | Validate full hostname, not just suffix |
| RISK-9 | MEDIUM | Scout scrapes DOM with fragile selectors | Google can change `myaccount.google.com` markup silently; scout breaks with no error | Add try/catch + user-visible fallback |
| RISK-10 | MEDIUM | NodeGraph `setState`-in-`useEffect` | React strict-mode double-fires effects; can cause infinite loop in development | Refactor to `useReducer` or add ref guard |
| RISK-11 | MEDIUM | Settings toggles have no effect | Users change settings, see no result; erodes trust | Wire toggles to Supabase or extension storage |

---

## 7. Extension Architecture Reference

```
extension/
├── src/
│   ├── background/
│   │   ├── index.ts          # Service worker — routes 5 message types
│   │   ├── detector.ts       # OAuth URL pattern matching (5 providers)
│   │   ├── parser.ts         # Extracts scope/client_id/redirect_uri from OAuth URLs
│   │   ├── privacyAnalyzer.ts # OpenRouter AI analysis + keyword fallback
│   │   ├── risk.ts           # 3-layer scoring: scope weights × trust factor × sharing
│   │   ├── scout.ts          # Google Permissions page DOM scraper
│   │   └── sync.ts           # POST /api/consents, GET /api/settings
│   ├── popup/
│   │   ├── PopupApp.tsx      # 400×600 popup: score + last 12 events + Analyze CTA
│   │   └── WelcomeView.tsx   # First-run link-account view
│   ├── sidepanel/
│   │   └── SidePanelApp.tsx  # Primary UI — 5 views: dashboard/analyzing/results/error/link-account
│   ├── content/
│   │   ├── index.tsx         # Active: GET_PAGE_TEXT + Google Scout trigger
│   │   ├── overlay.tsx       # UNUSED — toast consent card
│   │   └── sidebar.tsx       # UNUSED — right-side panel
│   └── lib/
│       ├── storage.ts        # ExtensionState shape + chrome.storage.local wrappers
│       ├── types.ts          # ConsentEvent, AnalysisResult, ExtensionState
│       └── scopes.ts         # Scope → risk level + description map
```

**Key flows:**
- **OAuth detected** → `detector.ts` matches URL → `parser.ts` extracts params → `risk.ts` scores → `sync.ts` POSTs → side panel updates via `storage.onChanged`
- **Analyze page** → content script extracts 8 000 chars → `privacyAnalyzer.ts` calls OpenRouter → structured JSON returned → side panel renders results
- **Auth handshake** → dashboard fires `chrome.runtime.sendMessage(EXT_ID, {type: 'AUTH_SUCCESS', userId, userEmail})` → background validates origin → saves userId → `flushUnsynced()`

---

## 8. Dashboard Architecture Reference

```
src/
├── app/
│   ├── page.tsx              # Main dashboard — consent cards grid
│   ├── map/page.tsx          # Live topology graph (NodeGraph)
│   ├── activity/page.tsx     # Permission history timeline
│   ├── audit/page.tsx        # Security audit score breakdown
│   ├── inventory/page.tsx    # Full service inventory with filters
│   ├── settings/page.tsx     # User settings (toggles not persisted)
│   └── auth/page.tsx         # Extension handshake receiver
├── components/
│   ├── consent/
│   │   ├── CompanyCard.tsx        # Service card with left-border risk coding
│   │   ├── NodeGraph.tsx          # D3-powered topology visualization
│   │   ├── ServiceDetailView.tsx  # Drawer: data types, rights, revoke CTA
│   │   └── RevokeConfirmModal.tsx # Confirmation + GDPR email trigger
│   ├── layout/
│   │   └── Sidebar.tsx            # Nav: Dashboard, Map, Activity, Audit, Settings
│   └── ui/
│       └── OnboardingFlow.tsx     # 3-step modal (localStorage-gated)
├── context/
│   └── ConsentContext.tsx    # Global state: consents, user, settings
└── lib/
    ├── privacy.ts            # PLAIN_LANGUAGE_MAP, risk scoring, AI prompt
    └── constants.ts          # Data type definitions, company trust registry
```

---

## 9. Recommended Fix Priority

| Priority | Items | Owner |
|---|---|---|
| Before any demo | D1 (jargon), D3 (empty state), E3 (popup feedback), Missing #1 (Connect Service) | UI |
| Before judge sharing | RISK-1 (API key), RISK-2 (GDPR mock guard), RISK-3 (auth header), D5/D6 (anti-patterns) | Backend |
| Before public release | All remaining RISK-4 → RISK-11, Missing #2–7, P1 accessibility work | Full team |

---

*Generated from session S365 audit on 2026-04-30. Re-run `ux_audit.py` and `accessibility_checker.py` after each fix batch.*
