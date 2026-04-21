# Consently — Business Plan
> *"Your data. Your rules."*
> A personal consent management dashboard that shows every digital service accessing your data, explains what they take in plain language, and lets you revoke access in one tap.

---

## 1. Problem

Every time a user signs up for a digital service, they unknowingly hand over personal data — browsing history, location, contacts, financial behavior. The average person has 100+ apps and services accessing their data at any given time. The consent mechanism — a wall of legal text and a single "Accept All" button — is designed to be ignored.

The result: users have no visibility, no control, and no recourse.

**The information asymmetry is structural.** Companies know exactly what they collect. Users know nothing.

---

## 2. Solution

Consently is a personal consent management dashboard that:

- **Shows** every digital service currently accessing your data, in plain language
- **Explains** what each service takes, why, and what risk it carries
- **Lets you revoke** access in one tap — automated, logged, and auditable

No legal jargon. No buried settings pages. One dashboard, full control.

---

## 3. Market

### Target User
Privacy-conscious individuals who have experienced a data breach, identity theft, or have grown aware of how their data is monetized. Early adopters skew toward:
- Tech-literate users aged 25–40
- Users in GDPR/CCPA jurisdictions (Europe, USA) where privacy rights are legally established
- Parents concerned about their family's digital footprint

### Market Size
| Segment | Size |
|---|---|
| Global internet users | ~5.4 billion |
| Users who express concern about data privacy | ~79% (Pew Research) |
| Addressable market (willing to act on concern) | ~500M users |
| Serviceable market (English-speaking, privacy-aware) | ~50M users |
| Realistic 3-year target | ~500K paid users |

### Why Now
- GDPR fines exceeded €4B cumulative by 2024
- Apple's App Tracking Transparency reduced ad tracking by ~60%, signaling mainstream privacy demand
- Data breaches hit record highs — 3,200+ reported in the USA in 2023 alone
- Consumer awareness is at an inflection point

---

## 4. Business Model

### Model: B2C Freemium SaaS

Free tier drives acquisition. Paid tier monetizes power users who need automation and deeper protection.

### Pricing Tiers

| Tier | Price | Key Features |
|---|---|---|
| **Free** | $0/mo | See connected services, plain-language summaries, manual revocation links, 3 services max |
| **Pro** | $7/mo | Unlimited services, 1-tap automated revocation, breach alerts, consent history export, email/SMS alerts |
| **Family** | $12/mo | Up to 5 members, all Pro features, parental data monitoring, shared dashboard |

### Why $7 for Pro
- Below the $10 psychological barrier
- Above the "not serious" $3 range
- Comparable to password managers (1Password: $3–5, LastPass: $3) but with broader utility
- Anchored against the value of data itself — the average user's data is worth $100–$200/year to advertisers

---

## 5. Unit Economics

### Core Assumptions (Base Case)

| Metric | Value | Rationale |
|---|---|---|
| Monthly new free signups | 500 | Organic-only, bootstrap phase |
| Free → Paid conversion | 3% | Optimistic for privacy tools; realistic range is 1–3% |
| Monthly churn (paid) | 5% | ~14-month average paid lifetime |
| Average revenue per user | $7/mo | Pro tier anchor |
| CAC (bootstrap phase) | ~$0 | Content marketing, SEO, word of mouth only |

### Derived Metrics

| Metric | Calculation | Value |
|---|---|---|
| Average paid lifetime | 1 / 5% churn | 20 months |
| LTV (Pro user) | $7 × 20 months | **$140** |
| LTV (Family user) | $12 × 20 months | **$240** |
| CAC payback period | $0 CAC (bootstrap) | **Immediate** |
| LTV:CAC ratio (bootstrap) | $140 / ~$0 | **∞ (favorable)** |

### Monthly Recurring Revenue Projection

| Month | Cumulative Free Users | Paid Users (after churn) | MRR |
|---|---|---|---|
| M1 | 500 | 15 | $105 |
| M3 | 1,500 | 43 | $301 |
| M6 | 3,000 | 82 | $574 |
| M9 | 4,500 | 118 | $826 |
| M12 | 6,000 | 150 | $1,050 |

> **Note:** These are conservative bootstrap numbers. With a single growth channel added (e.g. one viral Reddit post or a ProductHunt launch), signups can spike 10–20× in a single month. The model is highly sensitive to acquisition spikes.

### Upside Case (1,000 signups/month, 5% conversion)

| Metric | Value |
|---|---|
| Paid users at M12 | ~600 |
| MRR at M12 | ~$4,200 |
| ARR at M12 | ~$50,400 |

---

## 6. Acquisition Strategy

### Phase 1 — Bootstrap (Months 1–6)
Zero budget. Growth through:
- **Reddit** — r/privacy, r/PrivacyGuides, r/netsec. These communities actively search for tools like Consently. One genuine post can drive thousands of signups.
- **Content / SEO** — Articles targeting high-intent queries: *"how to revoke app permissions"*, *"what data does [app] collect"*, *"how to delete your data from [service]"*. Each article is a landing page.
- **ProductHunt launch** — Single high-visibility event. Target top 5 of the day for press pickup.

### Phase 2 — Leverage (Months 6–18)
- **Partnership with privacy-focused newsletters** (e.g. The Privacy Advisor, IAPP)
- **Influencer seeding** — tech YouTubers and privacy advocates (no paid sponsorship, just product access)
- **Referral program** — "Give a friend 1 month free, get 1 month free"

### Phase 3 — Paid (Month 18+)
Only after LTV is empirically validated. Paid ads should never run until:
- LTV is confirmed above $80
- CAC on paid channels is confirmed below $30
- Payback period is under 4 months

---

## 7. Competitive Landscape

| Competitor | Focus | Gap Consently Fills |
|---|---|---|
| OneTrust | Enterprise compliance | Consumer-facing, no individual dashboard |
| Ghostery / uBlock | Browser tracking only | No cross-service consent management |
| Apple Privacy Report | Apple ecosystem only | Platform-locked, no revocation |
| Mine (getmine.com) | Data deletion requests | No ongoing monitoring or dashboard |
| DeleteMe | Manual data broker removal | Narrow scope, no real-time consent view |

**Consently's defensible position:** The only consumer-grade, cross-platform consent dashboard with automated revocation. Not a browser extension. Not an enterprise tool. A personal privacy operating system.

---

## 8. Risks & Honest Challenges

### Risk 1 — Willingness to Pay
People say they care about privacy. Empirically, most don't pay for it. Conversion rates in privacy tools historically sit at 1–2%. Mitigation: Free tier must deliver genuine *aha* moments (e.g. "TikTok is reading your clipboard 47 times a day") that make the paid upgrade feel urgent, not optional.

### Risk 2 — Technical Complexity
Automated revocation requires OAuth integrations with every major platform. Each integration is a negotiation. Mitigation: Launch with manual revocation (guided links) and build automation incrementally. Never overpromise on demo day.

### Risk 3 — Market Timing in Central Asia
GDPR does not apply in Kazakhstan. Privacy awareness is lower. Regulatory pressure — the primary emotional trigger for privacy tools — is absent. Mitigation: Position Kazakhstan as a development/test market. Target European or US users for monetization from day one.

### Risk 4 — Platform Gatekeeping
Apple and Google may restrict access to cross-app permission data on iOS/Android. Mitigation: Web-first product is immune to app store policies. Build native later once the model is validated.

---

## 9. Milestones

| Milestone | Target |
|---|---|
| MVP live (free tier) | Month 1 |
| First 1,000 free signups | Month 2 |
| First 30 paid users | Month 3 |
| ProductHunt launch | Month 3 |
| MRR > $1,000 | Month 6 |
| First 500 paid users | Month 12 |
| MRR > $10,000 | Month 18 |
| Break-even (if 2-person team, minimal infra) | Month 18–24 |

---

## 10. The Pitch Narrative (for judges)

> *"Every year, companies extract billions of dollars of value from your personal data. You consented to this — technically. But you had no idea what you agreed to, and you have no way to take it back.*
>
> *Consently changes that. We give individuals a single dashboard to see exactly who has their data, what they're doing with it, and a one-tap way to revoke access — automatically.*
>
> *We're free to start, $7/month for full control. At 3% conversion from a growing free base, we reach $50K ARR by year one — bootstrapped, with zero ad spend.*
>
> *Privacy isn't a feature. It's a right. We're building the infrastructure for people to actually exercise it."*

---

*Document prepared for hackathon — Tech for Change track.*
*Team: Aibar (Engineering) + [Teammate] (Product & Pitch)*