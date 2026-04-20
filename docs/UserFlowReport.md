# Consently: Finalized User Flow Pipeline

This report pins the user journey for the **Consently** web application. It transitions from traditional SaaS listing to a dynamic, rights-focused ecosystem.

---

## 1. The Detection Layer (Passive Ingestion)
The user entry point shifts from manual forms to a **Browser Extension model**. 
- **The "Guard" Extension**: Upon first visit, the user is prompted to install the Consently browser extension.
- **Passive Monitoring**: As the user browses the web (e.g., signing into a university LMS or eGov portal), the extension detects OAuth requests or "Agree to Terms" buttons.
- **Metadata Sniffing**: It captures the company name and the requested data scopes (Identity, Email, Location, etc.).
- **Automatic Sync**: This data is instantly pushed to the Consently Dashboard, creating a "New Connection" notification.

## 2. The Visual Core: Obsidian-Style Node Graph
The home screen is anchored by the **Live Consent Map**.
- **Dynamic Topology**: Inspired by Obsidian’s node graph, the user is the central "Self" node. Every company accessing their data is a satellite node orbiting the center.
- **The Data Web**: Lines connect the nodes to the center. The thickness of the line represents the "Data Volume" (e.g., sharing a Name = thin line; sharing Biometric + Financial = thick, pulsing line).
- **Risk Color Space**:
  - **Green Nodes**: Minimal surface area (e.g., Email only).
  - **Amber Nodes**: Sensitive but necessary (e.g., Location).
  - **Red Nodes**: Critical exposure (e.g., Financial / Academic history).
- **Physics of Privacy**: Moving a node reveals how it might be connected to other third-party vendors (sub-nodes).

## 3. The Discovery Journey (Plain Language)
When a user clicks a node in the graph:
- **Zero-Jargon Breakdown**: Instead of "Third-party data processing," the user sees: *"This service shares your campus activity with 2 advertising partners."*
- **Timeline Context**: A mini-timeline appears showing exactly when the keys to this data were handed over (e.g., "Granted: 4 months ago during scholarship registration").

## 4. The Action Peak: One-Click Revocation
The "demo climax" is the revocation of access.
- **The Revoke Action**: A prominent, danger-themed button triggers a confirmation modal.
- **Consequence Education**: We explain what happens next in real terms: *"You will no longer be able to track your delivery in real-time, but your history will remain private."*
- **The Detach Animation**: Upon confirmation, the node physically detaches from the user in the graph, drifts away, and fades to grey.
- **Instant Rewards**: The global **Privacy Score** (e.g., 72 → 85) updates with a "Success" micro-animation.

## 5. The Audit Trail: Permission History
For deeper reflection, the user visits the **History Pipeline**.
- **The Long View**: A chronological log of every grant, update, and revocation.
- **Searchable Impact**: Filtering by "Location" shows every service that ever touched that specific data point.

---

## Implementation Pin for 48h Hackathon
This flow is chosen to maximize **Information Density** and **Emotional Impact** for the judges. We are moving from "Data Compliance" to "Data Ownership."
