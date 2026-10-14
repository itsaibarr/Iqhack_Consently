# Consently

A web dashboard plus browser extension that maps which services hold your data, explains their privacy policies in plain language, and revokes access in one click. I built it for a hackathon in April and May 2026 and no longer maintain it.

Status: the production front end loads, but its database was deleted, so the hosted demo does not work. Run it locally. That takes about five minutes.

## Try it locally

You need Node 18+ and a Supabase project. The extension comes pre-built.

```
npm install
cp .env.example .env.local   # fill in Supabase keys, see below
npm run dev                  # dashboard on localhost:3000
```

Load the extension: open `chrome://extensions`, turn on developer mode, click "Load unpacked", pick `extension/dist`. Click the Consently icon, hit "Connect Account", sign in. The side panel starts tracking from there.

To get the seeded demo (38 mock services with risk scores), set `DEMO_LOGIN_ENABLED=true` and `NEXT_PUBLIC_DEMO_LOGIN_ENABLED=true` in `.env.local`, apply `migrations/seed_demo_user.sql` to your Supabase project, and sign in as `demo@consently.ai`. Keep this flag off on any public deployment. The demo password is public by design.

## What to try

Sign in with Google somewhere and watch the event land in the side panel under recent events. Open any privacy policy page, click "Analyze Current Page", and the dashboard proxy asks an OpenRouter model for a plain-language summary. Open the inventory, pick a service, and "Disconnect & Revoke" sends a GDPR deletion request to its data protection officer through Resend.

## Layout

| Path | What lives there |
| --- | --- |
| `src/app` | dashboard pages and `/api/analyze`, `/api/consents`, `/api/settings` |
| `src/actions` | auth, consent, GDPR, and settings server actions |
| `src/context/ConsentContext.tsx` | dashboard state, demo mode included |
| `extension/src/background` | OAuth detector, policy parser, dashboard sync |
| `extension/src/popup`, `extension/src/sidepanel` | toolbar UI and tracking panel |
| `migrations`, `seed.sql` | schema plus mock companies, history, and demo user |
| `docs` | PRD, audit report, design notes from the hackathon |
| `e2e` | Playwright specs (a few revoke-modal cases fail on main too) |

## Stack

Next.js 16, React 19, Tailwind v4. Supabase Postgres. OpenRouter through the `/api/analyze` proxy, nothing calls AI vendors from the browser. Resend for deletion emails. MV3 extension built with Vite. Deploys to Vercel.

The dashboard URL is configurable through `VITE_DASHBOARD_URL` and defaults to the production host. Extension IDs and trusted hostnames derive from it at build time.
