# Implementation Plan: Connecting Dashboard to Real Auth & Data

This plan outlines the transition from mock data to real-time, user-specific data powered by Supabase Auth and Database.

## User Review Required

> [!IMPORTANT]
> **Database Migration**: We need to add `user_id` columns to existing tables and enable Row Level Security (RLS). This ensures users only see their own data.
> **Auth Guard**: Surfaces like the Dashboard will now require an active session. Unauthenticated users will be redirected to the sign-in page.

## Proposed Changes

### [Database Layer]

- **[MODIFY] Supabase Tables**:
    - Add `user_id` (UUID, references auth.users) to `companies` and `history`.
    - Enable RLS on both tables.
    - Create Policies: `Users can see/modify only their own records`.

### [Application Layer]

- **[MODIFY] [src/context/ConsentContext.tsx](file:///home/itsaibarr/projects/Iqhack/src/context/ConsentContext.tsx)**:
    - Change initial state from `MOCK_COMPANIES` to an empty array.
    - Add logic to fetch real data for the authenticated user on mount.
    - Update `revokeConsent` and `addHistoryEvent` to call the real database.
- **[MODIFY] [src/actions/consent.ts](file:///home/itsaibarr/projects/Iqhack/src/actions/consent.ts)**:
    - Replace mock delays with actual Supabase mutations.
- **[MODIFY] Dashboard Auth Guard**:
    - Ensure `Home` page redirects to `/auth` if no session is detected.

### [API Layer]

- **[MODIFY] [src/app/api/consents/route.ts](file:///home/itsaibarr/projects/Iqhack/src/app/api/consents/route.ts)**:
    - Update the sync engine to require and store the `user_id` for each detected consent.

## Open Questions

> [!IMPORTANT]
> 1. **Extension Association**: How should the browser extension identify which user to sync data for? Should we pass the `user_id` in the handshake?
> 2. **Demo Data**: When a new user signs up, should I automatically seed their database with some "placeholder" real records (e.g., standard services like Google, GitHub) so the dashboard isn't empty?

## Verification Plan

### Automated Tests
- Script to verify RLS policies by trying to access data as different users.

### Manual Verification
- Sign up with a new email.
- Verify dashboard is empty/seeded.
- Use the extension to trigger a detection and verify it appears in the real dashboard.
- Revoke a service and verify the database is updated.
