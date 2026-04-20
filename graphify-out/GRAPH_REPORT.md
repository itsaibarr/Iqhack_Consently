# Graph Report - .  (2026-04-20)

## Corpus Check
- Corpus is ~15,027 words - fits in a single context window. You may not need a graph.

## Summary
- 149 nodes · 177 edges · 20 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Consently Product` - 14 edges
2. `Consently Design System` - 13 edges
3. `Color System (CSS Custom Properties)` - 11 edges
4. `Service Card Component (Risk-coded, Composio-inspired)` - 10 edges
5. `One-Click Revocation Flow Feature` - 8 edges
6. `Hackathon MVP (48h Scope)` - 8 edges
7. `v1.0 Production Web App (Auth, LLM ToS summaries)` - 6 edges
8. `Consent Map Dashboard Feature` - 5 edges
9. `Primary Persona: Asel (University Student, Kazakhstan)` - 5 edges
10. `Motion & Animation System (revoke-shimmer, badge-pop, drawer-slide)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Tech Stack (React 18/19, TypeScript, Tailwind v4)` --semantically_similar_to--> `Unified Tech Stack (Next.js 15, React 19, Tailwind v4, Supabase, Vercel)`  [INFERRED] [semantically similar]
  GEMINI.md → docs/Consently_PRD.md
- `Consently UI Patterns (Service Card, Icons, Transitions)` --references--> `Service Card Component (Risk-coded, Composio-inspired)`  [INFERRED]
  CLAUDE.md → docs/Consently_DESIGN.md
- `Design Influences (Airtable, Coinbase, Composio, Stratify)` --rationale_for--> `Service Card Component (Risk-coded, Composio-inspired)`  [INFERRED]
  CLAUDE.md → docs/Consently_DESIGN.md
- `Revocation Flow UX Climax (revoke-shimmer animation)` --references--> `One-Click Revocation Flow Feature`  [INFERRED]
  GEMINI.md → docs/Consently_PRD.md
- `Brandbook Color System (Consent Blue, Teal, Risk Amber/Red)` --conceptually_related_to--> `Color System (CSS Custom Properties)`  [INFERRED]
  Consently_BRANDBOOK.md → docs/Consently_DESIGN.md

## Hyperedges (group relationships)
- **MVP Core Feature Triad (Consent Map + History + Revocation)** — prd_consent_map_dashboard, prd_permission_history_timeline, prd_one_click_revocation [EXTRACTED 1.00]
- **Four User Problems Drive Four Product Solutions** — prd_problem_memory_gap, prd_problem_comprehension_gap, prd_problem_control_gap, prd_problem_visibility_gap, prd_consent_map_dashboard, prd_plain_language_ai_summaries, prd_one_click_revocation, prd_cross_service_data_flow_viz [INFERRED 0.85]
- **Service Card Uses Risk Badge, Data Type Chip, Color Coding** — design_service_card, design_risk_badge, design_data_type_chip, design_data_type_color_coding, design_risk_semantic_axis [EXTRACTED 1.00]
- **Consently Unified Design Token System** — design_color_system, design_typography, design_spacing_system, design_border_radius, design_elevation_shadow, design_tailwind_config [EXTRACTED 1.00]
- **Consently AI Agent Protocols (Claude + Gemini)** — claude_role_uiux_engineer, gemini_role_architect, claude_verification_workflow, gemini_verification_workflow [INFERRED 0.85]
- **Consently Finalized User Flow Pipeline** — userflow_detection_layer, userflow_node_graph, userflow_discovery_journey, userflow_revocation_action, userflow_privacy_score, userflow_audit_trail [EXTRACTED 1.00]
- **Consently Product Version Roadmap (v0.1 → v2.0)** — prd_hackathon_mvp, prd_v02_browser_extension, prd_v10_production_webapp, prd_v20_national_platform [EXTRACTED 1.00]
- **Default Next.js App Public Icons Set** — file_svg_file_icon, globe_svg_globe_icon, next_svg_nextjs_logo, vercel_svg_vercel_logo, window_svg_window_icon [INFERRED 0.90]

## Communities

### Community 0 - "Product Vision & PRD"
Cohesion: 0.09
Nodes (26): Card Grid Layout (Hackathon MVP Data Viz), Permission History Timeline Entry Component, Node Graph Visualization (Full Vision, D3.js / React Flow), B2G Revenue Model (government license per citizen), Competitor: Apple Privacy Report (ecosystem-locked), Competitor: Digi.me (voluntary integration stalled), Competitor: MyData Finland (government mandate required), Competitor: OneTrust / Cookiebot (B2B CMP) (+18 more)

### Community 1 - "Consent UI Components"
Cohesion: 0.12
Nodes (0): 

### Community 2 - "UI Patterns & Accessibility"
Cohesion: 0.14
Nodes (18): Service Card Component (Central UI Unit), Design Influences (Airtable, Coinbase, Composio, Stratify), Consently UI Patterns (Service Card, Icons, Transitions), Accessibility Guidelines (WCAG 2.1 AA, Focus States, ARIA), Button Components (Primary / Danger / Ghost / Icon), Data Type Chip Component, Data Type Color Coding (Airtable-inspired chips), Risk Badge Component (Pill, HIGH/MEDIUM/LOW/REVOKED) (+10 more)

### Community 3 - "Brand Identity & Color"
Cohesion: 0.13
Nodes (16): Brandbook Color System (Consent Blue, Teal, Risk Amber/Red), Consently — Personal Consent OS, Purple Ban Design Constraint, Claude — Lead UI/UX Engineer Role, UX Principles (Primary Action, Contextual Disclosure, No Fluff), Claude Verification Workflow (ux_audit.py, accessibility_checker.py), Consently Visual Mandate (Trust-first, Warm, Structured), Color System (CSS Custom Properties) (+8 more)

### Community 4 - "Design System Foundations"
Cohesion: 0.16
Nodes (15): Design Philosophy (Inventory not Firewall, Trust-first, Warm & Structured), Typography System (Inter / JetBrains Mono, Type Scale), Border Radius Scale (sm:4px md:8px lg:12px xl:16px pill), Consently Design System, Elevation & Shadow System (sm, md, lg, focus), Design Influence: Airtable (structured warmth), Design Influence: Coinbase (institutional trust), Design Influence: Composio (integration cards) (+7 more)

### Community 5 - "Layout & Motion Design"
Cohesion: 0.16
Nodes (14): React Component File Structure (src/ layout), Detail Drawer Component (slides from right), Layout System (Sidebar-fixed, Card Grid, Drawer), Motion & Animation System (revoke-shimmer, badge-pop, drawer-slide), Rationale: Animation Communicates State Change, Not Decoration, Revocation Confirmation Modal Component, Revoke Shimmer Keyframe Animation, Sidebar Navigation Component (Stratify-inspired) (+6 more)

### Community 6 - "App Context & Routing"
Cohesion: 0.29
Nodes (0): 

### Community 7 - "Next.js Static Assets"
Cohesion: 0.36
Nodes (8): File Icon SVG, Globe Icon SVG, Next.js Logo SVG, Next.js Framework, Public Static Assets Directory, Vercel Deployment Platform, Vercel Logo SVG, Window/Browser Icon SVG

### Community 8 - "Tech Stack & Setup"
Cohesion: 0.5
Nodes (5): Next.js Breaking Changes Warning, Unified Tech Stack (Next.js 15, React 19, Tailwind v4, Supabase, Vercel), Next.js Framework, Consently Next.js Project, Vercel Deployment Platform

### Community 9 - "Lint Errors & Code Quality"
Cohesion: 0.5
Nodes (4): NodeGraph.tsx setState-in-effect Error, Lint Output — 10 Errors, 9 Warnings, page.tsx Unescaped Entities & no-explicit-any Errors, Sidebar.tsx setState-in-effect Error

### Community 10 - "Data Models"
Cohesion: 0.67
Nodes (4): ConsentRecord TypeScript Data Model, DataType Enum (identity, location, financial, health...), Service TypeScript Data Model, User TypeScript Data Model

### Community 11 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "TypeScript Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Design Tokens"
Cohesion: 1.0
Nodes (1): Consently Design Tokens (Colors, Radii)

### Community 14 - "Server Actions"
Cohesion: 1.0
Nodes (1): Next.js Server Actions for Mutations

### Community 15 - "Strategic Identity"
Cohesion: 1.0
Nodes (1): Strategic Identity (OS for Personal Privacy)

### Community 16 - "Voice & Tone"
Cohesion: 1.0
Nodes (1): Voice & Tone Guidelines (Granular, Neutral, Empowering)

### Community 17 - "Layout Principles"
Cohesion: 1.0
Nodes (1): Layout Principles (Dense with Discipline, Sidebar-First)

### Community 18 - "Iconography"
Cohesion: 1.0
Nodes (1): Iconography (Lucide React)

### Community 19 - "User Discovery Flow"
Cohesion: 1.0
Nodes (1): Discovery Journey — Plain Language Zero-Jargon Breakdown

## Knowledge Gaps
- **48 isolated node(s):** `Next.js Breaking Changes Warning`, `Consently Design Tokens (Colors, Radii)`, `Consently UI Patterns (Service Card, Icons, Transitions)`, `UX Principles (Primary Action, Contextual Disclosure, No Fluff)`, `Purple Ban Design Constraint` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TypeScript Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Design Tokens`** (1 nodes): `Consently Design Tokens (Colors, Radii)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Server Actions`** (1 nodes): `Next.js Server Actions for Mutations`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Strategic Identity`** (1 nodes): `Strategic Identity (OS for Personal Privacy)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice & Tone`** (1 nodes): `Voice & Tone Guidelines (Granular, Neutral, Empowering)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Layout Principles`** (1 nodes): `Layout Principles (Dense with Discipline, Sidebar-First)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Iconography`** (1 nodes): `Iconography (Lucide React)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Discovery Flow`** (1 nodes): `Discovery Journey — Plain Language Zero-Jargon Breakdown`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Consently Product` connect `Product Vision & PRD` to `UI Patterns & Accessibility`, `Design System Foundations`, `Layout & Motion Design`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Why does `Consently Design System` connect `Design System Foundations` to `Product Vision & PRD`, `UI Patterns & Accessibility`, `Brand Identity & Color`, `Layout & Motion Design`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `Color System (CSS Custom Properties)` connect `Brand Identity & Color` to `UI Patterns & Accessibility`, `Design System Foundations`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Service Card Component (Risk-coded, Composio-inspired)` (e.g. with `Design Influences (Airtable, Coinbase, Composio, Stratify)` and `Consently UI Patterns (Service Card, Icons, Transitions)`) actually correct?**
  _`Service Card Component (Risk-coded, Composio-inspired)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `One-Click Revocation Flow Feature` (e.g. with `Revocation Flow UX Climax (revoke-shimmer animation)` and `Problem: Control Gap (no single revocation point)`) actually correct?**
  _`One-Click Revocation Flow Feature` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Next.js Breaking Changes Warning`, `Consently Design Tokens (Colors, Radii)`, `Consently UI Patterns (Service Card, Icons, Transitions)` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Product Vision & PRD` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._