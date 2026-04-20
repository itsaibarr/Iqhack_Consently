# Consently — DESIGN.md

> A design system for Consently: a personal consent management OS. Built for a hackathon demo but designed to scale to a national-level B2G product. Light mode only. Desktop-first. Inspired by Airtable's structured friendliness, Coinbase's institutional trust, Composio's integration-card aesthetic, and the Stratify dashboard's airy conversational shell.

---

## Identity

**Product:** Consently
**Tagline:** Your data. Your rules.
**Visual character:** Trust-first, warm, structured. This is not a security tool that feels scary. It is a rights tool that feels empowering. Think: a friendly bank statement, not a firewall alert.
**Tone:** Clear, human, plain-spoken. Never legal. Never alarming unless necessary.
**Mode:** Light only (demo-safe, high contrast, projector-friendly)

---

## 1. Color System

### Philosophy
Three semantic axes: **Trust** (blues — safe, active consents), **Risk** (amber/red — attention required), and **Neutral** (grays — structure and text). One brand accent that isn't blue (to differentiate from Coinbase's pure institutional blue — Consently is warmer and more personal).

### Brand Palette

```css
/* Primary — Consent Blue (trust, active, CTA) */
--color-primary-50:  #EEF3FF;   /* page tint background */
--color-primary-100: #DBE7FF;   /* card hover states */
--color-primary-200: #BFCFFF;   /* borders, dividers */
--color-primary-400: #6B8EF5;   /* secondary interactive */
--color-primary-500: #3B6BF5;   /* primary buttons, links */
--color-primary-600: #2851D6;   /* button hover */
--color-primary-700: #1A38A8;   /* pressed state */

/* Accent — Teal (unique to Consently, data visualization) */
--color-accent-100:  #D0F4F0;
--color-accent-400:  #2CC4B8;
--color-accent-500:  #14A89C;   /* active consent nodes in map */
--color-accent-600:  #0E8A80;

/* Risk — Amber (medium risk) */
--color-risk-amber-50:  #FFFBEB;
--color-risk-amber-100: #FEF3C7;
--color-risk-amber-400: #F59E0B;
--color-risk-amber-500: #D97706;   /* medium risk badge */

/* Risk — Red (high risk) */
--color-risk-red-50:  #FFF1F2;
--color-risk-red-100: #FFE4E6;
--color-risk-red-400: #F87171;
--color-risk-red-500: #EF4444;   /* high risk badge, urgent states */
--color-risk-red-600: #DC2626;

/* Success — Green (revoked / safe / confirmed) */
--color-success-50:  #F0FDF4;
--color-success-100: #DCFCE7;
--color-success-400: #4ADE80;
--color-success-500: #22C55E;   /* revoked badge, success states */

/* Neutral (structure, text, surfaces) */
--color-neutral-0:   #FFFFFF;   /* pure white */
--color-neutral-25:  #FAFAFA;   /* page background */
--color-neutral-50:  #F5F5F7;   /* sidebar background */
--color-neutral-100: #EBEBED;   /* card borders */
--color-neutral-200: #D1D1D6;   /* dividers */
--color-neutral-400: #8E8E93;   /* placeholder text */
--color-neutral-600: #48484A;   /* secondary text */
--color-neutral-800: #1C1C1E;   /* primary text */
--color-neutral-900: #111113;   /* headings */
```

### Semantic Color Tokens

```css
/* Backgrounds */
--bg-page:           var(--color-neutral-25);     /* #FAFAFA — page canvas */
--bg-sidebar:        var(--color-neutral-50);     /* #F5F5F7 — left nav */
--bg-card:           var(--color-neutral-0);      /* #FFFFFF — card surfaces */
--bg-card-hover:     var(--color-primary-50);     /* #EEF3FF — card hover */
--bg-overlay:        rgba(28, 28, 30, 0.5);       /* modal backdrop */

/* Text */
--text-primary:      var(--color-neutral-900);    /* headings */
--text-secondary:    var(--color-neutral-600);    /* body, descriptions */
--text-tertiary:     var(--color-neutral-400);    /* placeholders, hints */
--text-inverse:      var(--color-neutral-0);      /* on dark/colored backgrounds */
--text-link:         var(--color-primary-500);    /* interactive text */

/* Borders */
--border-subtle:     var(--color-neutral-100);    /* card borders */
--border-default:    var(--color-neutral-200);    /* input borders */
--border-focus:      var(--color-primary-500);    /* focused inputs */

/* Risk Semantic */
--risk-low-bg:       var(--color-success-50);
--risk-low-text:     #15803D;
--risk-low-border:   var(--color-success-100);
--risk-medium-bg:    var(--color-risk-amber-50);
--risk-medium-text:  #92400E;
--risk-medium-border: var(--color-risk-amber-100);
--risk-high-bg:      var(--color-risk-red-50);
--risk-high-text:    #991B1B;
--risk-high-border:  var(--color-risk-red-100);

/* Interactive */
--interactive-primary:       var(--color-primary-500);
--interactive-primary-hover: var(--color-primary-600);
--interactive-primary-press: var(--color-primary-700);
--interactive-danger:        var(--color-risk-red-500);
--interactive-danger-hover:  var(--color-risk-red-600);
```

### Data Type Color Coding (for chips/tags)
Each data type category gets a consistent color — this is the Airtable-inspired element.

```css
--datatype-identity:    #E0E7FF;  /* indigo tint — text: #3730A3 */
--datatype-location:    #FEF3C7;  /* amber tint  — text: #92400E */
--datatype-financial:   #DCFCE7;  /* green tint  — text: #166534 */
--datatype-academic:    #EDE9FE;  /* violet tint — text: #5B21B6 */
--datatype-behavioral:  #FFF7ED;  /* orange tint — text: #9A3412 */
--datatype-health:      #FDF2F8;  /* pink tint   — text: #831843 */
--datatype-biometric:   #FFF1F2;  /* red tint    — text: #881337 */
--datatype-contacts:    #F0F9FF;  /* sky tint    — text: #0C4A6E */
```

---

## 2. Typography

### Font Stack
**Primary:** Inter — humanist sans-serif, high legibility at small sizes, trusted in fintech and SaaS. Direct equivalent of what Coinbase and Airtable both use.

**Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; /* for timestamps, IDs */
```

### Type Scale

```css
/* Display — hero headlines, landing sections */
--text-display-xl:  font-size: 40px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em;
--text-display-lg:  font-size: 32px; line-height: 1.2;  font-weight: 700; letter-spacing: -0.025em;

/* Headings — page titles, section headers */
--text-h1:  font-size: 24px; line-height: 1.3;  font-weight: 600; letter-spacing: -0.02em;
--text-h2:  font-size: 20px; line-height: 1.35; font-weight: 600; letter-spacing: -0.015em;
--text-h3:  font-size: 16px; line-height: 1.4;  font-weight: 600; letter-spacing: -0.01em;
--text-h4:  font-size: 14px; line-height: 1.4;  font-weight: 600; letter-spacing: 0;

/* Body — content, descriptions */
--text-body-lg: font-size: 16px; line-height: 1.6; font-weight: 400;
--text-body-md: font-size: 14px; line-height: 1.5; font-weight: 400;
--text-body-sm: font-size: 13px; line-height: 1.45; font-weight: 400;

/* Labels — tags, chips, badges, nav */
--text-label-md: font-size: 13px; line-height: 1.4; font-weight: 500; letter-spacing: 0.01em;
--text-label-sm: font-size: 11px; line-height: 1.3; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;

/* Mono — timestamps, IDs, technical data */
--text-mono-sm: font-family: var(--font-mono); font-size: 12px; line-height: 1.5;
```

### Usage Rules
- All headings use `letter-spacing: negative` — this is critical for the polished premium feel
- Body text is always `font-weight: 400`, never 300 (too light on most screens)
- Labels on chips use `font-weight: 500` or `600` — never 400
- Timestamps and IDs use monospace — it signals precision
- Never use `font-size` below `11px`
- The welcome/hero greeting (like Stratify's "Welcome, Sam!") uses `display-lg` at `font-weight: 700`

---

## 3. Spacing System

8px base grid. All spacing values are multiples of 4px (half-unit system for fine control).

```css
--space-1:  4px;    /* micro — icon padding, tight gaps */
--space-2:  8px;    /* xs — between inline elements */
--space-3:  12px;   /* sm — chip internal padding */
--space-4:  16px;   /* md — card padding, standard gaps */
--space-5:  20px;   /* lg — section gaps */
--space-6:  24px;   /* xl — card-to-card gaps */
--space-8:  32px;   /* 2xl — section separation */
--space-10: 40px;   /* 3xl — major section gaps */
--space-12: 48px;   /* 4xl — page-level breathing room */
--space-16: 64px;   /* 5xl — hero spacing */
```

### Layout Constants

```css
--sidebar-width:       240px;
--sidebar-collapsed:   64px;
--content-max-width:   1200px;
--card-padding:        var(--space-6);      /* 24px */
--page-padding-x:      var(--space-8);      /* 32px */
--page-padding-y:      var(--space-6);      /* 24px */
--drawer-width:        420px;
--modal-width-sm:      400px;
--modal-width-md:      560px;
```

---

## 4. Border Radius

Consently uses rounded but not bubbly corners. This signals "friendly precision" — approachable but structured.

```css
--radius-sm:   4px;    /* tags, chips, badges */
--radius-md:   8px;    /* buttons, inputs */
--radius-lg:   12px;   /* cards, drawers */
--radius-xl:   16px;   /* modals, highlighted panels */
--radius-full: 9999px; /* pill shapes — used for risk badges only */
```

### When to Use What
- **Cards:** `--radius-lg` (12px)
- **Buttons:** `--radius-md` (8px)
- **Input fields:** `--radius-md` (8px)
- **Data type chips:** `--radius-sm` (4px)
- **Risk level badges:** `--radius-full` (pill shape — visually distinct from chips)
- **Avatar / service logo:** `--radius-md` (8px) — square-ish, not circular
- **Modals:** `--radius-xl` (16px)
- **Sidebar:** no radius — flush to screen edge

---

## 5. Elevation & Shadow

Light mode shadows use a warm blue-gray tint, not pure black.

```css
--shadow-sm:   0px 1px 2px rgba(16, 24, 40, 0.06);                          /* cards at rest */
--shadow-md:   0px 4px 8px rgba(16, 24, 40, 0.08), 0px 1px 3px rgba(16, 24, 40, 0.04); /* card hover */
--shadow-lg:   0px 12px 24px rgba(16, 24, 40, 0.10), 0px 4px 8px rgba(16, 24, 40, 0.06); /* drawers, modals */
--shadow-focus: 0px 0px 0px 3px rgba(59, 107, 245, 0.20);                   /* focus ring */
--shadow-danger-focus: 0px 0px 0px 3px rgba(239, 68, 68, 0.20);             /* danger button focus */
```

### Elevation Rules
- Cards at rest: `--shadow-sm` + `--border-subtle`
- Cards on hover: `--shadow-md` (border stays)
- Open drawers: `--shadow-lg`
- Modals: `--shadow-lg` + overlay backdrop
- Buttons: no shadow in rest state (flat) — shadow-sm on hover only
- Sidebar: `border-right: 1px solid var(--border-subtle)` — no shadow

---

## 6. Component Patterns

### Service Card (core UI unit)

The building block of the Consent Map. Inspired by Composio's integration cards — clean icon + name + tags + action — but warmer and risk-coded.

```
┌─────────────────────────────────────────┐
│  [Icon 32px]  University LMS            │  ← h4, font-weight: 600
│               Education Platform   [●HIGH]│  ← label-sm + risk badge pill
│─────────────────────────────────────────│
│  [grades] [activity_log] [device_id]    │  ← data type chips
│                                         │
│  Shared with: Analytics Co., MoE API   │  ← body-sm, text-secondary
│  Connected: Sep 2022                    │  ← mono-sm, text-tertiary
│─────────────────────────────────────────│
│  [View Details →]           [Revoke]    │  ← ghost + danger button
└─────────────────────────────────────────┘
```

**Tokens:**
- Background: `--bg-card`
- Border: `1px solid var(--border-subtle)`
- Border radius: `--radius-lg`
- Padding: `var(--card-padding)` = 24px
- Shadow: `--shadow-sm`
- On hover: shadow → `--shadow-md`, background → `--bg-card-hover`
- Transition: `all 200ms ease`

**Risk color coding:**
- HIGH: left border `4px solid var(--color-risk-red-500)`
- MEDIUM: left border `4px solid var(--color-risk-amber-500)`
- LOW: left border `4px solid var(--color-success-500)`
- REVOKED: background `var(--color-neutral-50)`, opacity `0.6`, left border `4px solid var(--color-neutral-200)`

### Risk Badge (pill component)

```
 ● HIGH     → bg: --risk-high-bg,   text: --risk-high-text,   border: --risk-high-border
 ● MEDIUM   → bg: --risk-medium-bg, text: --risk-medium-text, border: --risk-medium-border
 ● LOW      → bg: --risk-low-bg,    text: --risk-low-text,    border: --risk-low-border
 ✓ REVOKED  → bg: --color-neutral-100, text: --text-tertiary, border: --border-subtle
```

Font: `--text-label-sm` (11px, uppercase, font-weight 600)
Border radius: `--radius-full`
Padding: `2px 10px`

### Data Type Chip

```
[grades]   [location]   [financial data]
```

Each chip uses its category's color pair (see Data Type Color Coding above).
Font: `--text-label-md` (13px, font-weight 500)
Border radius: `--radius-sm` (4px)
Padding: `3px 10px`
No border — background color alone provides grouping

### Buttons

```css
/* Primary — CTA actions (Connect, Save) */
.btn-primary {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font: var(--text-label-md); font-weight: 600;
  transition: background 150ms ease, box-shadow 150ms ease;
}
.btn-primary:hover { background: var(--interactive-primary-hover); box-shadow: var(--shadow-sm); }
.btn-primary:focus-visible { box-shadow: var(--shadow-focus); }

/* Danger — Revoke Access */
.btn-danger {
  background: var(--color-risk-red-50);
  color: var(--risk-high-text);
  border: 1px solid var(--color-risk-red-100);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font: var(--text-label-md); font-weight: 600;
}
.btn-danger:hover { background: var(--interactive-danger); color: white; border-color: transparent; }

/* Ghost — secondary actions (View Details) */
.btn-ghost {
  background: transparent;
  color: var(--text-link);
  border: 1px solid var(--border-default);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font: var(--text-label-md); font-weight: 500;
}
.btn-ghost:hover { background: var(--color-primary-50); border-color: var(--color-primary-200); }

/* Icon button (sidebar nav) */
.btn-icon {
  background: transparent;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}
.btn-icon:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.btn-icon.active { background: var(--color-primary-100); color: var(--interactive-primary); }
```

### Sidebar Navigation

Directly inspired by the Stratify screenshot's left nav — tight, icon + label, grouped by section, with a collapsible option.

```
┌────────────────────┐
│ [avatar] Asel N.  ≪│  ← User identity + collapse toggle
│────────────────────│
│ 🏠 Dashboard       │  ← Active: bg primary-100, text primary-500
│ 🗺️  Consent Map    │
│ 📜 History         │
│ 🔔 Alerts          │
│────────────────────│
│ RECENT             │  ← section label: --text-label-sm, uppercase
│ Revoked LMS access │  ← --text-body-sm, --text-secondary
│ Added Banking App  │
│────────────────────│
│ ⚙️  Settings       │  ← pinned to bottom
└────────────────────┘
```

**Tokens:**
- Width: `240px`
- Background: `var(--bg-sidebar)` = `#F5F5F7`
- Right border: `1px solid var(--border-subtle)`
- Nav item height: `36px`
- Nav item padding: `0 12px`
- Nav item border-radius: `var(--radius-md)` (8px)
- Active item: `background: var(--color-primary-100)`, `color: var(--interactive-primary)`, `font-weight: 600`
- Hover: `background: var(--color-neutral-100)`
- Section label: `--text-label-sm`, `color: var(--text-tertiary)`, `margin: 16px 12px 4px`

### Top Summary Bar (Dashboard)

Inspired by Stratify's header widget row — key stats at a glance before the card grid.

```
┌─────────────────────────────────────────────────────────────┐
│  6 Services Connected  │  3 Data Types  │  ⚠ 1 High Risk   │
│  Since Sep 2022        │  Shared        │  Review needed    │
└─────────────────────────────────────────────────────────────┘
```

3-column grid. Each stat cell: padding 20px, background white, border 1px subtle, radius 12px.
Stat number: `--text-h2`, font-weight 700
Stat label: `--text-body-sm`, text-secondary
Stat detail: `--text-label-sm`, text-tertiary

### Permission History Timeline Entry

```
│  ●  [Service Name]  [GRANTED]         March 12, 2023  │
│     You gave Delivery App access to your              │
│     location and payment history.                     │
│     [location] [payment]                              │
```

Timeline dot: `8px` circle — color matches action type (green = granted, red = revoked, amber = updated)
Entry background: white on hover, `--radius-lg`
Timestamp: `--text-mono-sm`, right-aligned, `--text-tertiary`
Action badge: same as Risk Badge pattern but uses action color

### Revocation Confirmation Modal

```
┌──────────────────────────────────────────┐
│  Revoke access from Delivery App?        │  ← --text-h3
│                                          │
│  Delivery App will no longer have        │
│  access to:                              │
│  [location] [payment history]            │
│                                          │
│  Orders currently in progress will not  │
│  be affected.                            │
│                                          │
│  [Cancel]          [Revoke Access →]     │
└──────────────────────────────────────────┘
```

Modal width: `--modal-width-sm` (400px)
Border radius: `--radius-xl` (16px)
Shadow: `--shadow-lg`
Backdrop: `rgba(28, 28, 30, 0.5)` with `backdrop-filter: blur(4px)`

---

## 7. Layout System

### Page Structure

```
┌──────────────────────────────────────────────────┐
│ SIDEBAR (240px, fixed)  │  MAIN CONTENT           │
│                         │  ┌──────────────────┐   │
│ [nav]                   │  │ Page Header      │   │
│                         │  │ Summary Stats    │   │
│                         │  │ Card Grid        │   │
│                         │  └──────────────────┘   │
└──────────────────────────────────────────────────┘
```

**Consent Map card grid:**
- `display: grid`
- `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`
- `gap: var(--space-6)` (24px)
- `padding: var(--page-padding-y) var(--page-padding-x)`

**Detail Drawer (slides in from right):**
- Width: `420px`
- Full height, fixed position
- Background: `--bg-card`
- Shadow: `--shadow-lg`
- `transform: translateX(100%)` → `translateX(0)` on open
- Transition: `transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### Page Background Treatment

The Stratify screenshot's signature: a very light blue-tinted page background with subtle geometric shapes. Replicate for Consently:

```css
body {
  background-color: var(--bg-page);  /* #FAFAFA */
  /* Optional: subtle radial gradient to add depth */
  background-image: radial-gradient(
    ellipse 80% 50% at 90% 10%,
    rgba(59, 107, 245, 0.04) 0%,
    transparent 60%
  );
}
```

---

## 8. Iconography

**Icon library:** Lucide React — matches Inter's geometric humanist quality. 16px for inline, 20px for nav, 24px for feature icons.

**Service logos:** Use letter-based fallback squares with category-coded backgrounds when no logo is available.

```css
/* Service logo fallback */
.service-logo-fallback {
  width: 32px; height: 32px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font: var(--text-h4); font-weight: 700; color: white;
}
/* Category colors for fallback */
.category-education  { background: #7C3AED; }  /* violet */
.category-government { background: #0284C7; }  /* sky blue */
.category-financial  { background: #059669; }  /* emerald */
.category-consumer   { background: #EA580C; }  /* orange */
.category-health     { background: #DB2777; }  /* pink */
```

**Data type icons (alongside chips):**
- Identity → `User`
- Location → `MapPin`
- Financial → `CreditCard`
- Academic → `GraduationCap`
- Behavioral → `Activity`
- Health → `Heart`
- Contacts → `Users`

---

## 9. Motion & Animation

### Principles
- **Purposeful:** Animation communicates state change, not decoration
- **Fast:** Max 300ms for UI feedback, max 500ms for page transitions
- **Natural:** Ease-out for entrances, ease-in for exits

### Easing Tokens

```css
--ease-out:      cubic-bezier(0.25, 0.46, 0.45, 0.94);   /* elements entering view */
--ease-in:       cubic-bezier(0.55, 0.055, 0.675, 0.19); /* elements leaving view */
--ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275); /* badge pop, success state */
--ease-linear:   linear;                                   /* progress bars */
```

### Key Animations

**Revocation success (the demo climax):**
```css
/* Card transitions to revoked state */
@keyframes revoke-shimmer {
  0%   { background: var(--bg-card); }
  50%  { background: var(--color-risk-red-50); }
  100% { background: var(--color-neutral-50); opacity: 0.6; }
}
/* Duration: 600ms, then hold on final state */
```

**Risk badge entrance (on card load):**
```css
@keyframes badge-pop {
  0%   { transform: scale(0.7); opacity: 0; }
  70%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
/* Duration: 200ms, easing: --ease-spring */
```

**Drawer slide-in:**
```css
.drawer { transition: transform 250ms var(--ease-out); }
.drawer.open { transform: translateX(0); }
.drawer.closed { transform: translateX(100%); }
```

**Dashboard counter update (risk score drops after revocation):**
- Use a number-counting animation: previous value counts down to new value over 800ms

---

## 10. Data Visualization

The Consent Map can be rendered two ways:
1. **Card grid** (MVP — easier to build, still impressive)
2. **Node graph** (full vision — visually spectacular, harder to build in 48h)

### Card Grid (Use This for Hackathon)

Already defined above. Simple, scannable, highly demo-able.

### Node Graph (Full Vision Reference)

For the pitch deck and long-term vision slides. A force-directed graph where:
- Central node = "Asel" (user)
- Second ring = services (LMS, eGov, Bank, etc.)
- Third ring = third parties / data recipients
- Edge thickness = data volume / sensitivity
- Edge color = data category color

Technology suggestion: D3.js force simulation or React Flow

---

## 11. Writing & UX Copy Patterns

### Plain-Language Consent Descriptions

Always follow this formula:
> **[Service] has access to your [data types].** They use it for [purpose]. Last used [time].

Examples:
- "University LMS has access to your grades, activity log, and device ID. They use it for academic performance tracking. Last accessed 2 days ago."
- "Delivery App had access to your location and payment history. Access was revoked by you on April 18, 2026."

### Revocation Confirmation Copy

Always include:
1. What will change (what access ends)
2. What won't change (reassurance)
3. How to re-grant if needed

> "Delivery App will no longer know your location or payment history. Orders currently in progress will not be affected. You can re-connect this service any time from Settings."

### Risk Level Explanations

Don't just show a badge — explain it in one line on hover:
- HIGH: "This service has access to sensitive data and shares it with 2+ third parties."
- MEDIUM: "This service tracks your location or behavioral patterns."
- LOW: "This service only has access to your basic profile information."

### Empty States

- No services connected: "Your consent map is empty. Add services to see what has access to your data."
- No history: "No consent history yet. Activity will appear here as you connect services."
- All revoked: "Great — no active consents. Your data is fully under your control." (with a small celebration micro-animation)

---

## 12. Accessibility

- All color pairs meet WCAG 2.1 AA contrast minimum (4.5:1 for normal text, 3:1 for large text)
- Focus states use `--shadow-focus` ring — never rely on browser default outline alone
- Risk level conveyed by both color AND text label (never color alone)
- Interactive elements minimum touch target: 44x44px
- Keyboard navigation: Tab through cards, Enter to open, Escape to close drawer/modal
- Screen reader: service cards use `role="article"`, risk badges use `aria-label="Risk level: High"`

---

## 13. Implementation Notes (Next.js)

### Core Setup

```bash
# Initialize using pnpm
pnpm dlx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

### Tailwind CSS v4 Setup

Consently uses the new CSS-first configuration for Tailwind v4.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Paste all tokens from sections 1–5 here */
  --color-primary-50:  #EEF3FF;
  --color-primary-100: #DBE7FF;
  --color-primary-200: #BFCFFF;
  --color-primary-400: #6B8EF5;
  --color-primary-500: #3B6BF5;
  --color-primary-600: #2851D6;
  --color-primary-700: #1A38A8;

  --color-accent-400:  #2CC4B8;
  --color-accent-500:  #14A89C;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-sm: 0px 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0px 4px 8px rgba(16, 24, 40, 0.08), 0px 1px 3px rgba(16, 24, 40, 0.04);
}
```

### Component Architecture (App Router)

```
src/
├── app/
│   ├── layout.tsx       /* Root layout with sidebar */
│   ├── page.tsx         /* Dashboard view */
│   ├── map/             /* Consent Map page */
│   ├── history/         /* History Timeline page */
│   └── globals.css      /* Tailwind v4 CSS */
├── components/
│   ├── ui/              /* shadcn/ui primitives */
│   ├── layout/          /* Sidebar, PageHeader */
│   ├── consent/         /* ServiceCard, ServiceDrawer */
│   └── shared/          /* RiskBadge, DataTypeChip */
├── actions/             /* Next.js Server Actions for data simulation */
└── lib/
    ├── utils.ts         /* cn() helper */
    └── constants.ts     /* Mock data definitions */
```

---

*Consently DESIGN.md v1.0*
*Built for IQCH Hackathon — Tech for Change*
*Design influences: Airtable (structured warmth), Coinbase (institutional trust), Composio (integration cards), Stratify (conversational dashboard shell)*
