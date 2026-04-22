# Consently — Your Personal Consent OS

> *"Your data. Your rules."*
>
> Consently maps every digital service accessing your data, translates legal jargon into plain language, and lets you revoke access in one click.

---

## What Is It?

Consently is a **web dashboard + browser extension** that gives users a unified, real-time picture of their digital privacy. The extension watches for OAuth sign-ins and privacy policy pages in the background, automatically building a map of which services have your data, what they collect, and how risky that is. Everything syncs to the dashboard where you can inspect details and revoke consent.

---

## Fastest Way to Evaluate (5 minutes)

The production dashboard is live. The extension is pre-built in this repo. No server setup needed.

### Step 1 — Open the Dashboard

Go to **[https://consently.vercel.app](https://consently.vercel.app)**

Sign in using the demo account:

| Field | Value |
|-------|-------|
| Email | `demo@consently.ai` |
| Password | `consently2024` |

> On the login page, click **"Fill Credentials"** under the Demo Access banner to auto-fill — no typing needed.

You will land on a dashboard pre-loaded with 38 real services (Anthropic, Spotify, Netflix, Airbnb, Canva, etc.), each with a risk score, data categories collected, and sharing partners.

---

### Step 2 — Install the Browser Extension

The extension is already built. You only need to load it into your browser.

**Works in:** Chrome, Brave, Edge (any Chromium-based browser)

1. Open your browser's extensions page:
   - Chrome/Brave: `chrome://extensions` or `brave://extensions`
   - Edge: `edge://extensions`

2. Toggle **Developer mode** ON (top-right corner of the extensions page)

3. Click **"Load unpacked"** (top-left)

4. In the file picker, navigate to this project folder and select:
   ```
   extension/dist
   ```

5. Consently (version 0.1.0) will appear in your extensions list. Pin it to your toolbar for easy access.

---

### Step 3 — Connect the Extension to Your Account

1. Click the Consently icon in your browser toolbar — a side panel opens on the right
2. Click **"Connect Account"**
3. You will be taken to the dashboard login — use the same demo credentials above
4. Once logged in, go back to any tab. The side panel will show your **Privacy Score** and start tracking events

---

## What to Try (Use Case Walkthrough)

Once the extension is connected, try this flow to see Consently in action:

### Detect an OAuth Sign-In
1. Visit any website and click "Sign in with Google" (or any OAuth provider)
2. The extension instantly logs the event in the side panel under **Recent Events**

### Analyze a Privacy Policy
1. Go to any privacy policy page — try [anthropic.com/legal/privacy](https://anthropic.com/legal/privacy)
2. In the side panel, click **"Analyze Current Page"**
3. Consently sends the policy to an AI analyzer and returns a plain-language summary of what data is collected and with whom it is shared
4. The result is automatically synced to your dashboard

### View Your Full Consent Map
1. Click **"Open Dashboard"** in the side panel, or go directly to [https://consently.vercel.app/inventory](https://consently.vercel.app/inventory)
2. You will see all tracked services with color-coded risk levels:
   - 🔴 **HIGH** — wide-reaching permissions (e.g., Anthropic, Airtable)
   - 🟡 **MEDIUM** — moderate data sharing (e.g., Canva, Netflix)
   - 🟢 **LOW** — minimal exposure (e.g., Spotify, Airbnb)

### Inspect a Service & Revoke
1. Click any service card → **"View Details"**
2. See exactly what data categories are collected, who they are shared with, and when the connection was made
3. Click **"Disconnect & Revoke"** to terminate the consent — this triggers a GDPR Article 17 deletion request email to the service's Data Protection Officer

---

## Running Locally (Optional)

If you want to run the dashboard on your own machine:

### Prerequisites
- Node.js 18+
- A Supabase project (or use the production credentials — see `.env.example`)

### Dashboard

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The demo credentials (`demo@consently.ai` / `consently2024`) work locally too.

### Extension (for local dashboard)

The `dist/` folder is pre-built and ready to load. If you modify the extension source and want to rebuild:

```bash
cd extension
npm install
npm run build
```

Then reload the extension in your browser (`chrome://extensions` → click the refresh icon on the Consently card).

> **Note:** When running locally, the extension connects to `localhost:3000` automatically. The dashboard must be running before the extension can sync data.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Dashboard | Next.js 15, React 19, Tailwind v4 |
| Database | Supabase (PostgreSQL) |
| Browser Extension | Vite, TypeScript, Chrome Extension Manifest v3 |
| AI Analysis | Google Gemini (privacy policy parsing) |
| Email / GDPR | Resend (Article 17 deletion requests) |
| Deployment | Vercel |

---

## Project Structure

```
/
├── src/                  # Next.js dashboard (web app)
│   ├── app/              # Pages and API routes
│   ├── components/       # UI components
│   └── context/          # Global state (ConsentContext)
├── extension/            # Browser extension
│   ├── src/              # Extension source
│   └── dist/             # Pre-built — load this folder into Chrome
└── docs/                 # PRD, design system, feature plans
```
