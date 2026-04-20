# Consently — Product Requirements Document

> **"Your data. Your rules."**
> A personal consent management dashboard that shows every digital service accessing your data, explains what they take in plain language, and lets you revoke access in one tap.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target User](#3-target-user)
4. [Competitive Landscape](#4-competitive-landscape)
5. [Product Vision](#5-product-vision)
6. [Part A — Hackathon MVP (48h Scope)](#part-a--hackathon-mvp-48h-scope)
7. [Part B — Full Product Vision](#part-b--full-product-vision)
8. [Technical Architecture](#8-technical-architecture)
9. [Financial & Business Model](#9-financial--business-model)
10. [Success Metrics](#10-success-metrics)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Product Overview

**Product Name:** Consently
**Type:** Web application + Browser Extension (Desktop-first)
**Stage:** Hackathon MVP → SaaS Product
**Theme:** Tech for Change — Digital Rights & Data Privacy

### One-Sentence Pitch
> Consently is a personal consent OS that maps every digital service accessing your data, translates legal jargon into plain language, and puts revocation one click away.

### Why Now
Digital government services, educational platforms, and consumer apps have quietly become deeply interconnected. A university student in Kazakhstan or Central Asia may have 10–15 active digital services — eGov portal, university LMS, scholarship system, delivery app, banking app — sharing data between each other without the student ever seeing a unified picture. GDPR-equivalent regulations are either new or weakly enforced in these markets. No consumer-facing tool addresses this gap today.

---

## 2. Problem Statement

### The Core Conflict
> The more convenient digital services become, the less visible the data exchange process is.

Users face four compounding problems:

| Problem | User Experience |
|--------|-----------------|
| **Memory gap** | "I don't remember which services I gave access to" |
| **Comprehension gap** | "I don't understand what data was actually shared" |
| **Control gap** | "I can't easily revoke access from one place" |
| **Visibility gap** | "I don't see connections between systems using my data" |

### Why Existing Solutions Fall Short

- **B2B CMPs** (OneTrust, Cookiebot): Built for companies' compliance teams, not for end users. Users see a cookie banner. That's it.
- **Apple App Privacy Report / Google My Account**: Ecosystem-locked. Only covers services within Apple's or Google's world — not cross-platform, not government portals, not educational systems.
- **Digi.me**: Philosophically identical but requires voluntary API integration from every service. The chicken-and-egg problem killed mainstream adoption after 10+ years.
- **Finland's MyData**: The most mature model — but works only because the government mandated it. No equivalent mandate exists in Central Asian markets yet.

**The gap:** No product today provides a user-first, cross-ecosystem consent map for the education + government digital context in emerging markets.

---

## 3. Target User

### Primary Persona — "Asel"

> University student, 18–22 years old, Kazakhstan

**Digital profile:**
- Uses university LMS (grades, attendance, activity tracking)
- Registered on eGov portal (national ID, scholarship, tax)
- Has banking app for student stipend
- Uses food delivery and transport apps daily
- Signed up for 3+ EdTech platforms during COVID

**Pain points:**
- Has never read a consent form fully
- Doesn't know that her LMS shares activity data with her university's analytics vendor
- Can't find where to revoke access she gave an app she deleted 2 years ago
- Doesn't realize her eGov ID links her scholarship data to her academic record

**Goal:** Understand and control her digital footprint — especially before graduating and entering the job market.

**Emotional trigger:** "I didn't know they had all that."

### Secondary Personas

| Persona | Context | Key Need |
|---------|---------|----------|
| Parent (35–50) | Managing family's gov services | Understand what school shares about their child |
| University IT Admin | Deploying for students | Institutional compliance dashboard |
| Gov Digital Officer | National e-services rollout | Transparency layer over citizen data |

---

## 4. Competitive Landscape

| Product | Type | Gap vs. Consently |
|---------|------|-------------------|
| OneTrust / Cookiebot | B2B CMP | Built for companies, not users |
| Apple Privacy Report | OS-level | Apple ecosystem only |
| Google My Account | Platform | Google services only |
| Digi.me | Consumer | Requires voluntary integration; stalled |
| MyData (Finland) | Government | Requires government mandate |
| **Consently** | **User-first cross-ecosystem** | **Fills the gap** |

**Consently's moat:** The only product targeting the education + government digital context for users in markets where data protection culture is forming — not yet commoditized.

---

## 5. Product Vision

### Core Philosophy
Consently is not a compliance tool. It is a **personal rights tool**. The emotional job it does: *give users back the feeling of being in control*.

### Design Principles
1. **Plain language first** — No legal jargon. Ever. Every consent is explained in one sentence.
2. **Show don't tell** — Visual map before text. Users should feel the picture before they read it.
3. **One action, full control** — Revocation must never be more than 2 taps from any screen.
4. **Trust through transparency** — We show users what we know AND what we don't know.
5. **No dark patterns** — We never make it harder to revoke than to grant.

---

## Part A — Hackathon MVP (48h Scope)

### Objective
Build a polished, demoable web app that produces the "I didn't know they had all that" moment for judges within 90 seconds. Prioritize visual impact and one coherent user journey over completeness.

### Demo Scenario
**Persona:** Asel, 20, university student in Almaty

**Journey:**
1. Asel opens Consently and sees her Consent Map — 6 connected services glowing with risk levels
2. She taps "University LMS" — sees it shares her grades, activity log, and device ID with 2 analytics vendors
3. She opens Permission History — sees a timeline: "March 2023: You gave access to your location and payment info"
4. She hits Revoke on Delivery App — animated disconnect, plain-language confirmation
5. Dashboard updates in real time — risk score drops from High → Medium

### MVP Features (3 Core)

#### Feature 1: Consent Map Dashboard
**What it is:** An interactive card/node view showing all connected services with color-coded risk indicators.

**Requirements:**
- Display 5–6 mock services (University LMS, eGov Portal, Banking App, Delivery App, EdTech Platform, Transport App)
- Each service card shows: name, logo icon, data types accessed (chips), risk level badge
- Risk levels: 🟢 Low (name, email only) / 🟡 Medium (location, history) / 🔴 High (financial, biometric, wide access)
- Clicking a card opens a detail drawer with full breakdown
- Summary stats at top: "6 services connected · 3 data types shared · 1 high-risk consent"

**Tech:** React state + JSON mock data (`consents.json`). No backend needed.

#### Feature 2: Permission History Timeline
**What it is:** A scrollable chronological log of when, why, and what was consented.

**Requirements:**
- Timeline entries: date, service name, action (Granted / Revoked / Updated), data types
- Human-readable: "March 12, 2023 — You gave Delivery App access to your location and payment history"
- Filter by: service, data type, date range
- Visual indicator if consent was given via unclear/auto-accept method

**Tech:** Rendered from mock `history.json`. Filter state in React.

#### Feature 3: One-Click Revocation Flow
**What it is:** The core action — revoke any consent with animated confirmation.

**Requirements:**
- "Revoke Access" button on every service detail view
- Confirmation modal: plain-language explanation of what revocation means ("Delivery App will no longer know your location. Orders in progress will not be affected.")
- Animated state change on card (shimmer → greyed out → "Access Revoked" badge)
- Dashboard risk score updates in real time
- Undo option (5 second window)

**Tech:** React state mutation. Animation via CSS transitions or Framer Motion.

### MVP Screens

| Screen | Priority | Notes |
|--------|----------|-------|
| Dashboard / Consent Map | P0 | Hero screen — must be visually stunning |
| Service Detail Drawer | P0 | Opened on card click |
| Permission History | P1 | Timeline view |
| Revocation Confirmation Modal | P0 | The demo climax |
| Onboarding / Welcome | P2 | Optional — can be skipped in demo |

### Mock Data Structure

```json
{
  "user": { "name": "Asel Nurlanovna", "riskScore": "High" },
  "services": [
    {
      "id": "lms-01",
      "name": "University LMS",
      "category": "Education",
      "riskLevel": "high",
      "dataAccessed": ["grades", "activity_log", "device_id", "location"],
      "grantedAt": "2022-09-01",
      "sharedWith": ["Analytics Vendor A", "Ministry of Education API"],
      "status": "active"
    }
  ]
}
```

### 48h Build Timeline

| Phase | Hours | Owner | Output |
|-------|-------|-------|--------|
| Alignment sprint | 0–2h | Both | Agree on persona, demo flow, JSON schema |
| Mock data + JSON | 2–4h | Coder | `consents.json`, `history.json` |
| Dashboard scaffold | 4–10h | Coder | Layout, sidebar, card grid |
| Consent Map UI | 10–18h | Coder | Cards, risk badges, detail drawer |
| Permission History | 18–24h | Coder | Timeline component |
| Revocation flow | 24–30h | Coder | Modal + animation |
| Pitch deck | 4–28h | Teammate | Structure, slides, brand |
| Polish pass | 30–40h | Both | Micro-animations, copy, consistency |
| Demo rehearsal | 40–46h | Both | 3 run-throughs |
| Buffer | 46–48h | Both | Fixes only |

### What NOT to Build (48h)

- Real OAuth integration with any service
- User authentication / login
- Backend server or database
- Mobile view (desktop-only is fine for demo)
- Multi-user support
- Dark mode
- Real revocation API calls

---

## Part B — Full Product Vision

### Version Roadmap

```
v0.1  →  Hackathon MVP (mock data, demo)
v0.2  →  Real browser extension that reads OAuth scopes
v1.0  →  Production web app with institutional integrations
v2.0  →  National-scale B2G deployment
```

### v0.2 — Browser Extension (Month 1–2)

**Goal:** Make it real without requiring institutional API buy-in.

**How it works:**
- Chrome extension scans OAuth-connected apps in Google account, GitHub, and other services
- Reads publicly available App Store / Play Store privacy disclosures
- Combines with user-reported data to build a real consent map
- No service needs to integrate — the extension extracts what's already public

**Key insight:** You don't need the service to cooperate if you can read what they've already disclosed publicly.

### v1.0 — Production Web App (Month 3–6)

**New capabilities:**
- Real user accounts (NextAuth or Supabase Auth)
- Consent import via OAuth (Google, Microsoft, Apple account scans)
- Institutional pilot: one university or ministry as anchor partner
- AI-powered legal plain-language engine (LLM summarizes ToS/privacy policies)
- Data categorization: Personal / Educational / Financial / Health / Behavioral
- Risk scoring algorithm (weighted by data sensitivity + sharing breadth)
- Export: download your full consent history as PDF
- Notification system: "New consent detected from your LMS"

**Tech stack:**
- Frontend: React + TypeScript + Tailwind
- Backend: Node.js + Express (or Next.js API routes)
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth
- LLM: Anthropic Claude API (ToS summarization)
- Extension: Chrome Manifest V3

### v2.0 — National Platform (Month 12–24)

**Vision:** Consently becomes the standard consent layer for a country's digital ecosystem — the way MyData became infrastructure in Finland.

**B2G product:**
- Deployed by Ministry of Digital Development as opt-in citizen service
- Integrates with national eGov portal via standardized data API
- Universities and hospitals onboard via SDK integration
- Citizen dashboard shows all government service consents in one place
- Regulatory reporting: anonymized consent analytics for policymakers

**Revenue model:**
- Government: Annual license per citizen (B2G SaaS)
- Institutions: Per-seat or per-integration fees
- Developers: API access for privacy compliance tools

**Scaling path:**
- Kazakhstan → Central Asia → MENA → Emerging markets globally
- Target markets where GDPR equivalents are forming (India's PDPB, Brazil's LGPD, etc.)

### Full Feature Set (v1.0)

| Feature | Category | Priority |
|---------|----------|----------|
| Consent Map Dashboard | Core | P0 |
| Permission History Timeline | Core | P0 |
| One-Click Revocation | Core | P0 |
| Risk Scoring Engine | Intelligence | P1 |
| Plain-Language AI Summaries | Intelligence | P1 |
| Data Type Categorization | Organization | P1 |
| Cross-Service Data Flow Visualization | Visualization | P1 |
| Notification Center | Engagement | P2 |
| Consent Health Score | Engagement | P2 |
| PDF Export / Report | Utility | P2 |
| Browser Extension | Acquisition | P1 |
| Institutional Admin Dashboard | B2B/B2G | P2 |
| API for Third-Party Integration | Platform | P3 |
| Multilingual Support (KZ, RU, EN) | Localization | P1 |

---

## 8. Technical Architecture

### Unified Tech Stack (v0.1 to v1.0+)

Consently is built on a unified, production-ready stack from Day 1 to ensure that the Hackathon MVP transitions seamlessly into a national-scale platform.

```
Framework:   Next.js 15 (App Router)
Runtime:     React 19
Styling:     Tailwind CSS v4 + Radix UI Primitives (shadcn/ui)
Package Mgr: pnpm
State/Data:  Next.js Server Actions + React Query (TanStack)
Database:    Supabase (PostgreSQL) — Mocked via Server Actions for MVP
Animation:   Framer Motion
Icons:       Lucide React
Deploy:      Vercel
```

### Data Model (Core)

```typescript
type User = {
  id: string
  name: string
  email: string
  createdAt: Date
}

type ConsentRecord = {
  id: string
  userId: string
  serviceId: string
  dataTypes: DataType[]
  grantedAt: Date
  revokedAt?: Date
  status: 'active' | 'revoked' | 'expired'
  grantMethod: 'explicit' | 'implicit' | 'bundled'
  riskLevel: 'low' | 'medium' | 'high'
  plainLanguageSummary: string
}

type Service = {
  id: string
  name: string
  category: 'education' | 'government' | 'financial' | 'consumer' | 'health'
  privacyPolicyUrl: string
  dataAccessed: DataType[]
  sharedWith: ThirdParty[]
  riskScore: number // 0–100
}

type DataType = 
  | 'identity' | 'location' | 'financial' | 'health'
  | 'academic' | 'behavioral' | 'biometric' | 'contacts'
```

---

## 9. Financial & Business Model

### Cost to Build

| Item | Hackathon MVP | v1.0 Production |
|------|--------------|-----------------|
| Development (frontend) | 48h / free | 3 months / ~$15k |
| Backend + infra | $0 (static) | ~$200/month (Supabase + Vercel) |
| LLM API (ToS summaries) | $0 | ~$50–200/month |
| Design | 48h / free | ~$5k |
| **Total** | **$0** | **~$25k** |

### Revenue Streams

| Stream | Model | Target | ARR Potential |
|--------|-------|--------|---------------|
| B2C Freemium | Free + $4.99/month Pro | 50k students | $300k |
| B2B (Universities) | $2/student/year | 200k students | $400k |
| B2G (Government) | $0.50/citizen/year | 5M citizens | $2.5M |
| API Access | Usage-based | Developers | $100k |

### Go-to-Market

**Phase 1 — Pilot (Month 1–3):**
Target a single university (Nazarbayev University or Al-Farabi KazNU). Deploy for free to 1,000 students. Collect testimonials and usage data.

**Phase 2 — Institutional (Month 3–12):**
Pitch to university IT departments and Ministry of Digital Development. Lead with risk reduction: "Your students don't know what your LMS shares. We help you show them — and build trust."

**Phase 3 — National (Month 12–24):**
Partner with national eGov infrastructure. Position as the trust layer for Kazakhstan's digital transformation agenda.

---

## 10. Success Metrics

### Hackathon
- Judges produce the "I didn't know" reaction during demo
- Demo completes in under 90 seconds without errors
- All 3 core features functional
- Visual quality competitive with top-5 teams

### v1.0 Product
- DAU/MAU ratio > 30% (indicates habitual use)
- Time to first revocation < 3 minutes from onboarding
- Consent comprehension score (post-survey): > 80% users understand what was shared
- Revocation completion rate > 85% (users who start revocation, finish it)
- NPS > 50

### Business (12-month)
- 1 institutional pilot live
- 5,000 registered users
- $10k MRR

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Services don't cooperate with revocation | High | High | Demo uses mock data; real v1 uses extension to read OAuth |
| Regulatory ambiguity in KZ | Medium | Medium | Position as transparency tool, not enforcement tool |
| Users don't care about privacy | Medium | High | Anchor emotional message to job market / digital identity stakes |
| Chicken-and-egg adoption | High | High | B2G route bypasses this — government mandates integration |
| Legal liability for inaccurate consent data | Low | High | Clear disclaimers; user-reported data marked as unverified |

---

*Document Version: 1.0 — Hackathon Edition*
*Last Updated: April 2026*
*Team: Consently Hackathon Team — IQCH #hackwithiq*
