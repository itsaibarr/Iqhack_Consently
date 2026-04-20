# Consently — Master Brandbook
*The Personal Consent OS*

Consently transforms abstract legal terms into a living, breathing inventory of your digital self. This Brandbook defines how we build trust through structured, warm, and transparent design.

---

## 1. Strategic Identity

### Vision
To become the "Operating System" for personal privacy, where every individual has granular, effortless control over their digital rights.

### Design Philosophy
- **Inventory, not Firewall**: We move away from scary metaphors (locks, shields) toward organizational ones (maps, cards, inventories).
- **Trust-first**: Trust is built through consistency and clarity, not marketing fluff.
- **Warm & Structured**: We aim for the aesthetic of a "friendly bank statement" — professional, reliable, but deeply accessible.

---

## 2. Visual Foundations

### 2.1 Color System
Consently uses a sophisticated palette designed to communicate risk without causing panic.

#### Primary & Accent
- **Consent Blue**: `#2851D6` (Primary Action)
- **Consently Teal**: `#00FF88` (Success & Affirmation)

#### Risk Foundation
| Level | Background | Border | Text |
| :--- | :--- | :--- | :--- |
| **Amber (Medium)** | `#FFF8E1` | `#FFC107` | `#B25E09` |
| **Red (High)** | `#FFEBEE` | `#F44336` | `#B71C1C` |

#### Data Type Categories
*Used for Airtable-style highlighting of data classifications.*
- **PII**: Tint `#FFEECC` / Border `#FFAA00`
- **Health**: Tint `#FFCCCC` / Border `#FF4444`
- **Financial**: Tint `#CCFFE6` / Border `#00FF88`
- **Digital**: Tint `#CCE6FF` / Border `#0088FF`
- **Social**: Tint `#F2CCFF` / Border `#AA00FF`

---

## 3. Typography & Rhythm

### Type Scale (Inter / JetBrains Mono)
- **H1**: 32px / 120% / Bold (Hero messaging)
- **H2**: 24px / 125% / Bold (Section headers)
- **H3**: 20px / 130% / Semi-Bold (Card titles)
- **Body**: 16px / 150% / Regular (Primary content)
- **Small**: 14px / 150% / Regular (Metadata & Labels)
- **Code**: 14px / 140% / Mono (Technical data / IDs)

### Spacing Scale
Consently adheres to an **8px grid** foundation.
- **4, 8, 12, 16, 24, 32**
- Consistent border radius: **8px** (Small/Secondary) and **12px** (Primary/Cards).

---

## 4. Components & States

### The Service Card
The central unit of the Consently UI.
- **Title**: Inter Bold, 16px.
- **Description**: Inter Regular, 12px.
- **Status Badge**: Pills with high contrast for quick scanning.
- **Elevation**: Use `Shadow MD` for active cards to create focus.

### Interaction Primitives
- **Primary Button**: Blue fill, centered text, 12px radius.
- **Danger Action**: Red fill (Revoke All).
- **Secondary Interaction**: 1px Neutral-200 border.

---

## 5. Voice & Tone Guidelines

### Tone Rules
1. **Be Granular**: Never say "We share your data." Say "We share your location with 3 partners for delivery services."
2. **Be Neutral**: Use objective, non-emotional language for risk levels.
3. **Be Empowering**: Frame every action as a choice. "You are revoking access" vs "Access is being lost."

---

## 6. Layout Principles
- **Dense with Discipline**: Prioritize information density over "airy" whitespace.
- **Controlled Asymmetry**: Use hierarchy and varied card sizes to create visual tension and avoid a generic SaaS grid look.
- **Sidebar-First**: Navigation is anchored on the left to provide a persistent "CMD Center" feel.
