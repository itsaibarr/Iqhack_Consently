# Consently — UX Audit, Fix List & Ideal User Flow
> Full product review based on 5 app screenshots, PRD, and B2C business model.

---

## Table of Contents

1. [Overall Assessment](#1-overall-assessment)
2. [Screen-by-Screen Critique](#2-screen-by-screen-critique)
3. [The Deeper Problem — Missing User Flow](#3-the-deeper-problem--missing-user-flow)
4. [Ideal User Flow — Web App + Extension](#4-ideal-user-flow--web-app--extension)
5. [Language & Terminology Fixes](#5-language--terminology-fixes)
6. [Priority Fix List](#6-priority-fix-list)
7. [Demo Strategy](#7-demo-strategy)

---

## 1. Overall Assessment

The UI is visually polished. Clean typography, good whitespace, consistent component style. For a hackathon, the design quality is in the top 10%.

But there are serious usability and conceptual problems underneath the surface. The product violates its own design principles (plain language first — stated in the PRD) on nearly every screen. There is no guided onboarding. The empty states are dead ends. And critically, there is no clear user journey connecting the extension to the dashboard.

**The single biggest problem:** there is no flow. A user who installs the extension and opens the dashboard has no path to follow. The product assumes users know what to do. They don't.

---

## 2. Screen-by-Screen Critique

### Screen 1 — Consent Map (Dashboard)

**What works:**
- Three metric cards (Services Connected, Data Types Shared, High Risk Services) are the right information hierarchy
- "Revoke All" button is bold and present
- Neural Data Web visualization concept is strong and differentiated

**What is broken:**

The empty state shows `0 / 0 / 0` across all metrics with no guidance on next steps. A new user lands here and sees a giant blue circle with nothing around it. There is no prominent onboarding prompt. The `+ Connect Service` button is top-right — easy to miss.

"Neural Data Web" is jargon. The primary persona is Asel, a 20-year-old student. She does not know what a neural data web is. Call it "Your Data Map" or "Who Has Your Data."

"Live Sovereignty Map" violates the product's own design principle #1: *plain language first, no legal jargon, ever.* "Sovereignty" is a political/legal term that means nothing to a mainstream user. This is the first thing they see.

---

### Screen 2 — Live Map

**What works:**
- The topology visualization — identity at the center, services orbiting it — is conceptually perfect for the product
- The visual metaphor is strong and memorable

**What is broken:**

The empty state is a single massive blue circle. This is the most important visual in the entire product and it communicates nothing on first load. This will be the demo moment in the pitch — and right now it is a blue dot. Pre-loaded mock data is mandatory.

"Handshake Active" system status means nothing to a normal user. What handshake? With whom? This should either be removed or replaced with something like "Watching for new requests."

"1.2 req/s — Inbound Flows" appears at the bottom of a screen showing zero active nodes. What is flowing if there is nothing connected? This creates cognitive dissonance.

Legend terminology needs simplification:
- "Critical Risk Node" → "High Risk"
- "Identity Core" → "You"
- "Passive Service" → "Low Risk"

---

### Screen 3 — Activity / Permission History

**What works:**
- Audit trail concept is excellent and highly differentiating
- Chronological, filterable by Granted / Revoked
- "Permanent and cannot be modified by third parties" sidebar copy is strong trust-building language — keep this exactly

**What is broken:**

Empty state just says "No events match your current filter." There is no illustration, no explanation, no next step. This is a dead end for a new user.

"Export Audit Log (PDF)" is a Pro feature being shown to everyone with no paywall indicator. Either gate it with a lock icon and "Pro" badge, or it gives away value for free.

The "Audit Trail" badge label at the top reads as developer terminology, not user language. Consider "Your History" or just removing the badge entirely.

---

### Screen 4 — Security Audit / Vulnerability Report

**What works:**
The "Proactive Health" sidebar with specific actionable items is the best UX in the entire app. "3 services have access to your GPA records" is exactly the plain-language, specific, emotionally relevant alert the PRD describes. This screen demonstrates the product's real value most clearly.

**What is broken:**

"Vulnerability Report" sounds like enterprise IT security software, not a personal privacy tool. Rename to "Your Risk Report" or "Privacy Health Check."

"94% Compliance Status" — compliance with what regulation, standard, or benchmark? This metric has no anchor and users will either ignore it or misinterpret it. Rename to "Privacy Health: 94/100" or replace with a simpler label.

"Enable Auto-Audit" is the only prominent CTA on a page that should be driving upgrades. This is the best upsell screen in the product and it is underutilized. Consider: "Unlock Auto-Audit — Pro feature" with a clear upgrade path.

The Proactive Health items (Audit Academic Data, Weekly Stealth Sweep, Revoke LinkedIn Path) are all rendered at the same visual weight despite having very different urgency levels. The LinkedIn one should have a warning/danger treatment. A plain text link for "Microsoft has updated its terms — high exposure for professional nodes" is insufficient signal.

---

### Screen 5 — Browser Extension

**What works:**
- Security Score 100/100 with "TRUSTED" badge is satisfying and clean
- "Open Sovereignty Hub" button creates a clear bridge to the web app
- Small footprint is appropriate for an extension popup

**What is broken:**

"LIVE RADAR" in the top right — what is it monitoring live? There is no indication of activity or what the radar is scanning. Either show something, or remove the label.

"Privacy Events" section is completely empty with no explanation. On first install it should read: "We're watching. You'll see alerts here as you browse."

"Open Sovereignty Hub" — again, sovereignty language. A mainstream user will find this odd. Rename to "Open Dashboard" or simply "Open Consently."

The extension has no clear trigger moment communicated. When does it activate? When a site requests data? There is no visual feedback showing it is doing anything between visits. Consider a subtle "Watching..." indicator.

---

## 3. The Deeper Problem — Missing User Flow

The most important critique is structural: **there is no clear user journey connecting these screens.**

Each screen is an island. A user who installs the extension and opens the dashboard has no guided path from one to the next. The product assumes users will self-navigate. They won't.

The gap is not in visual design — it is in transitions, empty states, and onboarding.

Specific missing pieces:
- No welcome / onboarding flow (3-step minimum)
- No "first finding" moment — the emotional hook that makes users understand why this matters
- No connection between what the extension detects and what the dashboard shows
- No guided first revocation — the core product action
- No paywall trigger that feels earned rather than arbitrary

---

## 4. Ideal User Flow — Web App + Extension

The flow below is the complete journey from first install to long-term retention.

---

### Phase 1 — Extension Install

**Step 1.1 — Install**
User installs the Consently extension from the Chrome or Firefox store. Trigger: privacy concern, friend recommendation, Reddit post, or ProductHunt discovery.

**Step 1.2 — Extension popup on first open**
Shows: Security Score 100/100, "TRUSTED" badge, "Privacy Events" section with copy: *"We're watching. You'll see alerts here as you browse."*
The extension is idle but communicates that it is active. This is important — the user needs to feel it is doing something even when nothing has triggered yet.

---

### Phase 2 — First Trigger (The Aha Moment)

**Step 2.1 — User visits a site**
Could be a banking app, university LMS, social media platform, or food delivery service. The extension detects data access requests.

**Step 2.2 — Alert badge appears**
Extension icon shows a badge: "3 trackers found" or "Data request detected." The popup changes to show the finding in plain language. Example: *"TikTok is reading your clipboard. This happens every time you open the app."*

This is the emotional hook. The user now has a personal, specific, concrete reason to care.

**Step 2.3 — CTA in popup**
Below the finding: *"See your full data map →"* — this is the bridge to the web app. Not "Open Sovereignty Hub." Not "Open Dashboard." Something that answers the user's implicit question: *"How much more is happening?"*

**Step 2.4 — First web app visit**
User clicks through. Dashboard opens.

---

### Phase 3 — Onboarding (3 steps, no skipping)

**Step 3.1 — Welcome screen**
One screen. One sentence explaining what Consently does: *"Consently shows you every service that has your data — and lets you take it back."* A single CTA: "Connect your first service."

Do not show the full dashboard yet. The user has not earned context to understand it.

**Step 3.2 — Connect services**
User connects 1–3 services. Suggestions appear based on what the extension already detected. Example: "We noticed you visited your university portal. Want to see what data they hold?" This reduces friction and makes the onboarding feel intelligent.

**Step 3.3 — First finding**
Immediately after connecting, show the data map with real nodes populated. Show the most alarming finding first. Example: *"12 services have access to your data. 2 are high risk."* Animate the nodes appearing one by one. This is the moment the user goes: *"I didn't know they had all that."*

This is the product's core emotional moment. Everything before this is setup. Everything after is retention.

---

### Phase 4 — Dashboard Exploration

**Step 4.1 — Data map**
User explores the node graph. Each node is tappable: clicking it shows a plain-language summary of what data that service holds and what it does with it. No legal text. One sentence per data type.

Key UX rule: the most alarming nodes should be visually prominent (red, larger, or with a warning indicator). The user's eye should go there first.

**Step 4.2 — Risk report**
User clicks through to the Privacy Health Check. The Proactive Health sidebar shows 2–3 specific actions ranked by urgency. The most urgent item is visually distinct (red/warning treatment). Each item has one action button.

**Step 4.3 — Manual revocation (free tier)**
User selects a service to revoke. Free tier provides a guided link — step-by-step instructions to revoke access manually. It works, but it takes 4–6 steps per service.

This friction is intentional. It demonstrates the value of the Pro tier without hiding functionality.

---

### Phase 5 — Upgrade (Paywall Trigger)

**Step 5.1 — Paywall trigger**
After completing a manual revocation (or attempting a second one), show: *"You just protected your data. With Pro, this happens in one tap — automatically, for every service."*

The paywall should feel earned, not arbitrary. The user has just experienced the pain point (manual revocation is slow). The Pro pitch arrives at exactly the right moment.

**Step 5.2 — Upgrade modal**
Single screen. Clear value: 1-tap revocation, breach alerts, consent history export, unlimited services. Price: $7/month. One CTA: "Upgrade to Pro." No dark patterns, no confusing tiers on this screen.

**Step 5.3 — Pro unlocked**
Immediately demonstrate the upgrade value. Run an automatic scan and show what Consently just revoked on the user's behalf. *"We just automatically revoked 4 services that had access to your location data."* Make it feel powerful.

---

### Phase 6 — Retention

**Step 6.1 — Weekly digest (email)**
Every Monday: a short email showing what changed in the user's data landscape that week. New services detected, revocations processed, any breach alerts. This is the habit-forming mechanism — it gives users a reason to open the app weekly even when nothing urgent is happening.

**Step 6.2 — Breach alert (push + in-app)**
When a connected service is reported in a data breach, the extension badge activates and an in-app notification appears. This is the highest-value retention event. Users who experience a breach alert almost never churn.

**Step 6.3 — Referral moment**
After the first successful auto-revocation or breach alert, show: *"You just protected your data. Know someone who should know about this?"* — with a one-click share link. This is the organic growth mechanic.

---

## 5. Language & Terminology Fixes

Every instance of the following terms must be replaced before the demo. This is not stylistic — it is a core product principle violation.

| Current (jargon) | Replacement (plain language) |
|---|---|
| Neural Data Web | Your Data Map |
| Live Sovereignty Map | Who Has Your Data |
| Open Sovereignty Hub | Open Dashboard / Open Consently |
| Live Radar | Watching |
| Handshake Active | Connected |
| Vulnerability Report | Your Risk Report / Privacy Health Check |
| Critical Risk Node | High Risk |
| Identity Core | You |
| Passive Service | Low Risk |
| Compliance Status 94% | Privacy Health: 94/100 |
| Audit Trail | Your History |
| Inbound Flows | Active requests |
| Data Sovereignty | Your data control |

**Rule for any new copy:** Write it, then ask — "Would Asel (20-year-old student, Kazakhstan, never read a consent form) understand this immediately?" If no, rewrite.

---

## 6. Priority Fix List

Ranked by impact. The first three are non-negotiable before any demo or pitch.

### Critical — Fix today

**1. Load mock data into the dashboard**
The demo cannot show an empty blue circle. Populate the node graph with Asel's persona data: 8–12 pre-seeded services including TikTok, a university LMS, a banking app, Instagram, Google, and 2 unknown/suspicious nodes. The TikTok node should be red and labeled "reads clipboard 47×/day." This is your demo's most compelling moment.

**2. Replace all jargon — full find and replace**
Run a find-and-replace on every instance of: sovereignty, neural data web, live radar, handshake active, vulnerability report, audit trail, inbound flows. Use the replacement table in section 5. This takes 30 minutes and changes everything about first impressions.

**3. Add a 3-step onboarding flow**
Without this, new users are lost. Steps: (1) one-sentence explanation of what Consently does, (2) connect your first service, (3) your first finding. The flow should not be skippable until step 3 is complete. This is the user's first experience of the product's value.

---

### Important — Fix if time allows

**4. Extension empty state copy**
Add to the Privacy Events section: *"We're watching. You'll see alerts here as you browse."* This communicates that the extension is active even when idle. Currently the empty state is just blank.

**5. Gate "Export Audit Log" behind a Pro lock**
Currently this appears as a free feature. Add a lock icon and a "Pro" badge. Alternatively, grey it out with a tooltip: "Available on Pro — $7/month." This protects a key monetization driver.

**6. Differentiate urgency in Proactive Health sidebar**
The LinkedIn warning ("Microsoft has updated its terms — high exposure") should have a red/warning visual treatment. Currently it looks identical to low-urgency suggestions. Users will miss the most important alerts.

**7. Fix the "94% Compliance" metric anchor**
Either rename it "Privacy Health: 94/100" with a one-line explanation of how it is calculated, or remove it. An unexplained percentage creates confusion, not confidence.

---

### Nice to have — If hours remain

**8. Share your score**
After onboarding, show the user their Privacy Health score and a one-tap share button: "My Consently score is 73/100. How does yours compare?" This is the single best organic acquisition mechanic in the product and takes approximately 2 hours to build.

**9. Referral prompt after first revocation**
Immediately after a user completes their first revocation: *"You just protected your data. Know someone who should?"* One-click referral link. This is the moment of highest emotional engagement — leverage it.

**10. "Watching..." indicator in extension**
A subtle pulsing dot or animated indicator in the extension popup when the user is on an active site. Communicates that Consently is running even when no alerts have triggered.

---

## 7. Demo Strategy

The demo sequence for the hackathon pitch should follow this exact order:

1. Open the extension on a "live" site (use a pre-staged demo environment). Show the alert badge activate. Show the plain-language finding: *"TikTok is reading your clipboard."*

2. Click through to the dashboard. The node graph animates in — 12 services, 2 in red. Let the visual land for 3 seconds before speaking.

3. Click the TikTok node. Show the plain-language summary. Show the "Revoke Access" button.

4. Attempt revocation. Hit the paywall. Deliver the Pro pitch: *"With Pro, this is one tap."*

5. Show the Privacy Health Check screen with the Proactive Health sidebar. Read one item aloud: *"3 services have access to your GPA records."*

6. Close with the business model: free to start, $7/month for full control. State the LTV and conversion assumption.

**What not to demo:** The Permission History screen (too empty, not visually compelling). The Live Map screen without populated data. Any screen that uses jargon you have not yet replaced.

**The single most important demo principle:** The product must feel personal and specific. "12 services have your data" is more powerful than any feature description. Let the data do the talking.

---

*Document prepared for Consently hackathon — Tech for Change track.*
*UX audit and product strategy — April 2026.*