-- =============================================================================
-- Migration: seed_demo_user
-- Purpose : Ensure demo@consently.ai exists in auth.users and is populated
--           with representative company + history data.
--           Safe to re-run — every INSERT uses ON CONFLICT DO NOTHING.
-- Apply   : Supabase Dashboard → SQL Editor, or:
--             supabase db push --db-url <connection-string> < migrations/seed_demo_user.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Auth user — create demo@consently.ai with a known UUID so the code-side
--    DEMO_USER_ID constant always matches.
--    Password: consently2024 (bcrypt via pgcrypto's crypt())
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  is_super_admin,
  is_sso_user,
  deleted_at
)
VALUES (
  '15e1f301-268a-434c-b4d5-8927fd698456',
  '00000000-0000-0000-0000-000000000000',
  'demo@consently.ai',
  crypt('consently2024', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo User"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  false,
  false,
  null
)
ON CONFLICT (id) DO NOTHING;

-- auth.identities required for email/password sign-in
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '15e1f301-268a-434c-b4d5-8927fd698456',
  'demo@consently.ai',
  jsonb_build_object(
    'sub',   '15e1f301-268a-434c-b4d5-8927fd698456',
    'email', 'demo@consently.ai',
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Default profile settings
-- ---------------------------------------------------------------------------

INSERT INTO profile_settings (
  user_id,
  stealth_mode,
  notifications_enabled,
  alert_frequency,
  handshake_interval
)
VALUES (
  '15e1f301-268a-434c-b4d5-8927fd698456',
  false,
  true,
  'high_priority',
  120
)
ON CONFLICT (user_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Companies (50 demo records — idempotent via (user_id, name) unique key)
-- ---------------------------------------------------------------------------

INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Google', 'CONSUMER', 'MEDIUM', 'REVOKED', '[{"name": "Medical History", "category": "HEALTH"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY['License Dept', 'Reddit', 'TikTok', 'Pinterest'], '2025-09-12T22:36:20.153576', 'Tracks location and health signals for personalization.', 'google') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Meta', 'CONSUMER', 'LOW', 'REVOKED', '[{"name": "Friends List", "category": "SOCIAL"}, {"name": "Email", "category": "PII"}, {"name": "Phone Number", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}]'::jsonb, ARRAY['Duolingo', 'IRS Online', 'Robinhood', 'Snapchat'], '2026-01-15T22:36:20.153624', 'Collects social graph and browsing data for ad targeting.', 'meta') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Amazon', 'CONSUMER', 'LOW', 'REVOKED', '[{"name": "Friends List", "category": "SOCIAL"}, {"name": "Phone Number", "category": "PII"}, {"name": "IP Address", "category": "DIGITAL"}, {"name": "Payment Methods", "category": "FINANCIAL"}]'::jsonb, ARRAY['Discord'], '2025-07-03T22:36:20.153642', 'Stores payment and device data for purchase history.', 'amazon') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Microsoft', 'CONSUMER', 'MEDIUM', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "IP Address", "category": "DIGITAL"}]'::jsonb, ARRAY['Asana', 'MyFitnessPal', 'Old Bank Co'], '2025-07-22T22:36:20.153658', 'Email and device telemetry shared with productivity partners.', 'microsoft') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Apple', 'CONSUMER', 'MEDIUM', 'ACTIVE', '[{"name": "Browsing History", "category": "DIGITAL"}, {"name": "IP Address", "category": "DIGITAL"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY['Airbnb'], '2025-05-04T22:36:20.153672', 'Location and browsing data used for App Store personalisation.', 'apple') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Twitter', 'CONSUMER', 'MEDIUM', 'REVOKED', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY['Google', 'Meta'], '2025-08-17T22:36:20.153690', 'Tweet activity and location used for promoted content.', 'twitter') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Spotify', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Payment Methods", "category": "FINANCIAL"}]'::jsonb, ARRAY['Facebook', 'Apple'], '2025-06-11T22:36:20.153705', 'Listening habits and payment info stored for premium billing.', 'spotify') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'LinkedIn', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Full Name", "category": "PII"}, {"name": "Email", "category": "PII"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY['Microsoft'], '2025-10-30T22:36:20.153720', 'Professional profile data shared with Microsoft ecosystem.', 'linkedin') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Netflix', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Payment Methods", "category": "FINANCIAL"}]'::jsonb, ARRAY[]::text[], '2025-04-19T22:36:20.153735', 'Viewing history used for recommendation algorithms.', 'netflix') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Slack', 'CONSUMER', 'MEDIUM', 'REVOKED', '[{"name": "Email", "category": "PII"}, {"name": "Friends List", "category": "SOCIAL"}, {"name": "Transaction History", "category": "FINANCIAL"}]'::jsonb, ARRAY['Salesforce', 'Google'], '2025-11-22T22:36:20.153750', 'Workspace messages and contact graph synced to CRM partners.', 'slack') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'GitHub', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "IP Address", "category": "DIGITAL"}]'::jsonb, ARRAY['Microsoft'], '2025-03-08T22:36:20.153765', 'Code activity and device info used for security alerts.', 'github') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Discord', 'CONSUMER', 'MEDIUM', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "IP Address", "category": "DIGITAL"}, {"name": "Friends List", "category": "SOCIAL"}]'::jsonb, ARRAY['Twitch'], '2025-12-04T22:36:20.153780', 'Voice and messaging data retained for moderation.', 'discord') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Robinhood', 'FINANCIAL', 'HIGH', 'ACTIVE', '[{"name": "Payment Methods", "category": "FINANCIAL"}, {"name": "Transaction History", "category": "FINANCIAL"}, {"name": "Full Name", "category": "PII"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Apex Clearing', 'DTCC'], '2025-09-01T22:36:20.153795', 'Full financial profile shared with clearing houses.', 'robinhood') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Stripe', 'FINANCIAL', 'MEDIUM', 'ACTIVE', '[{"name": "Payment Methods", "category": "FINANCIAL"}, {"name": "Email", "category": "PII"}]'::jsonb, ARRAY[]::text[], '2026-02-14T22:36:20.153810', 'Payment data stored for recurring billing.', 'stripe') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Doordash', 'CONSUMER', 'MEDIUM', 'REVOKED', '[{"name": "Location", "category": "DIGITAL"}, {"name": "Payment Methods", "category": "FINANCIAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Doordash Merchants'], '2025-08-29T22:36:20.153825', 'Real-time location tracked during delivery.', 'doordash') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Instacart', 'CONSUMER', 'LOW', 'REVOKED', '[{"name": "Browsing History", "category": "DIGITAL"}, {"name": "Transaction History", "category": "FINANCIAL"}]'::jsonb, ARRAY['CPG Brands'], '2025-07-15T22:36:20.153840', 'Shopping data shared with consumer goods partners.', 'instacart') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Airbnb', 'CONSUMER', 'MEDIUM', 'ACTIVE', '[{"name": "Full Name", "category": "PII"}, {"name": "Payment Methods", "category": "FINANCIAL"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY['Airbnb Hosts'], '2025-10-05T22:36:20.153855', 'Identity and payment shared with hosts on booking.', 'airbnb') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Strava', 'HEALTH', 'MEDIUM', 'ACTIVE', '[{"name": "Location", "category": "DIGITAL"}, {"name": "Heart Rate", "category": "HEALTH"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Garmin', 'Under Armour'], '2025-06-28T22:36:20.153870', 'Fitness and biometric data shared with equipment partners.', 'strava') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'MyFitnessPal', 'HEALTH', 'HIGH', 'REVOKED', '[{"name": "Heart Rate", "category": "HEALTH"}, {"name": "Medical History", "category": "HEALTH"}, {"name": "Email", "category": "PII"}]'::jsonb, ARRAY['Under Armour', 'Health insurers'], '2025-05-18T22:36:20.153885', 'Health and medical history shared with insurance data brokers.', 'myfitnesspal') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'MedConnect', 'HEALTH', 'HIGH', 'ACTIVE', '[{"name": "Heart Rate", "category": "HEALTH"}, {"name": "Full Name", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Medical History", "category": "HEALTH"}]'::jsonb, ARRAY['Khan Academy', 'MedConnect', 'Amazon'], '2025-09-29T22:36:20.153900', 'Full medical profile including biometrics shared broadly.', 'medconnect') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Asana', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Friends List", "category": "SOCIAL"}]'::jsonb, ARRAY['Slack', 'Google'], '2025-08-12T22:36:20.153915', 'Task and team data integrated with productivity platforms.', 'asana') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Notion', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}]'::jsonb, ARRAY[]::text[], '2026-01-08T22:36:20.153930', 'Document usage patterns retained for product improvement.', 'notion') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Figma', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "IP Address", "category": "DIGITAL"}]'::jsonb, ARRAY['Adobe'], '2025-11-03T22:36:20.153945', 'Design activity and device data synced to Adobe CC.', 'figma') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Snapchat', 'CONSUMER', 'HIGH', 'REVOKED', '[{"name": "Location", "category": "DIGITAL"}, {"name": "Friends List", "category": "SOCIAL"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Snap Audience Network', 'Data brokers'], '2025-07-30T22:36:20.153960', 'Precise location and social graph sold to ad networks.', 'snapchat') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Pinterest', 'CONSUMER', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}]'::jsonb, ARRAY['Google', 'Meta'], '2025-09-21T22:36:20.153975', 'Interest graph and browsing data used for ad targeting.', 'pinterest') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Lyft', 'CONSUMER', 'MEDIUM', 'REVOKED', '[{"name": "Location", "category": "DIGITAL"}, {"name": "Payment Methods", "category": "FINANCIAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Insurance partners'], '2025-10-14T22:36:20.153990', 'Trip location and payment shared with insurance providers.', 'lyft') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Khan Academy', 'EDUCATION', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}]'::jsonb, ARRAY[]::text[], '2025-04-01T22:36:20.154005', 'Learning progress retained for personalised curriculum.', 'khan_academy') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Duolingo', 'EDUCATION', 'LOW', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Google'], '2025-05-25T22:36:20.154020', 'Language learning sessions synced with Google accounts.', 'duolingo') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Quizlet', 'EDUCATION', 'LOW', 'REVOKED', '[{"name": "Email", "category": "PII"}, {"name": "Location", "category": "DIGITAL"}]'::jsonb, ARRAY[]::text[], '2025-12-20T22:36:20.154035', 'Study behaviour and location logged for analytics.', 'quizlet') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Canvas', 'EDUCATION', 'MEDIUM', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Location", "category": "DIGITAL"}, {"name": "Transaction History", "category": "FINANCIAL"}]'::jsonb, ARRAY['Instructure', 'SIS providers'], '2026-01-31T22:36:20.154050', 'Academic records and location shared with institutional SIS.', 'canvas') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Reddit', 'CONSUMER', 'MEDIUM', 'ACTIVE', '[{"name": "Email", "category": "PII"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "IP Address", "category": "DIGITAL"}]'::jsonb, ARRAY['Google', 'Advance Publications'], '2025-08-06T22:36:20.154065', 'Browsing patterns and IP used for ad and moderation purposes.', 'reddit') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'TikTok', 'CONSUMER', 'HIGH', 'REVOKED', '[{"name": "Browsing History", "category": "DIGITAL"}, {"name": "Location", "category": "DIGITAL"}, {"name": "Friends List", "category": "SOCIAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['ByteDance', 'Advertising partners'], '2025-10-22T22:36:20.154080', 'Extensive behavioural and location data sent to ByteDance servers.', 'tiktok') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'IRS Online', 'GOVERNMENT', 'HIGH', 'ACTIVE', '[{"name": "Full Name", "category": "PII"}, {"name": "Transaction History", "category": "FINANCIAL"}, {"name": "Medical History", "category": "HEALTH"}]'::jsonb, ARRAY['SSA', 'State revenue agencies'], '2025-06-04T22:36:20.154095', 'Full financial and health records shared with federal agencies.', 'irs_online') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'City Portal', 'GOVERNMENT', 'MEDIUM', 'ACTIVE', '[{"name": "Full Name", "category": "PII"}, {"name": "Location", "category": "DIGITAL"}, {"name": "Payment Methods", "category": "FINANCIAL"}]'::jsonb, ARRAY['City departments'], '2025-09-07T22:36:20.154110', 'Civic service data shared across municipal departments.', 'city_portal') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Old Bank Co', 'FINANCIAL', 'MEDIUM', 'ACTIVE', '[{"name": "Full Name", "category": "PII"}, {"name": "Email", "category": "PII"}, {"name": "Friends List", "category": "SOCIAL"}]'::jsonb, ARRAY['Duolingo', 'Lyft', 'Figma'], '2025-11-10T22:36:20.154125', 'Banking contact data unexpectedly shared with consumer apps.', 'old_bank_co') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Crypto Hub', 'FINANCIAL', 'LOW', 'REVOKED', '[{"name": "Email", "category": "PII"}, {"name": "Location", "category": "DIGITAL"}, {"name": "Phone Number", "category": "PII"}]'::jsonb, ARRAY['Khan Academy', 'Microsoft', 'Instacart'], '2026-03-01T22:36:20.154140', 'Crypto account data broadly shared with unrelated services.', 'crypto_hub') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'NeoBank', 'FINANCIAL', 'MEDIUM', 'REVOKED', '[{"name": "Browsing History", "category": "DIGITAL"}, {"name": "Transaction History", "category": "FINANCIAL"}, {"name": "Heart Rate", "category": "HEALTH"}, {"name": "Medical History", "category": "HEALTH"}, {"name": "Email", "category": "PII"}]'::jsonb, ARRAY['Reddit', 'Netflix'], '2025-09-19T22:36:20.154155', 'Financial and health data combined for credit risk profiling.', 'neobank') ON CONFLICT (user_id, name) DO NOTHING;
INSERT INTO companies (user_id, name, category, risk, status, data_types, shared_with, connected_at, description, logo_uid) VALUES ('15e1f301-268a-434c-b4d5-8927fd698456', 'Unity LMS', 'EDUCATION', 'MEDIUM', 'REVOKED', '[{"name": "Friends List", "category": "SOCIAL"}, {"name": "Email", "category": "PII"}, {"name": "Transaction History", "category": "FINANCIAL"}, {"name": "Browsing History", "category": "DIGITAL"}, {"name": "Heart Rate", "category": "HEALTH"}]'::jsonb, ARRAY['Asana'], '2025-05-22T22:36:20.154170', 'Learning platform collecting health data beyond its scope.', 'unity_lms') ON CONFLICT (user_id, name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Activity history (25 records)
--    history has no unique constraint, so we guard with a single existence
--    check — if the demo user already has history rows, we skip all inserts.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  -- Skip all inserts if the demo user already has history rows
  IF NOT EXISTS (
    SELECT 1 FROM history WHERE user_id = '15e1f301-268a-434c-b4d5-8927fd698456'
  ) THEN
    INSERT INTO history (user_id, company_name, action, data_types, timestamp) VALUES
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Twitter',       'UPDATED', ARRAY['Transaction History', 'Payment Methods'],           '2026-03-13T22:36:20.154350'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Asana',         'UPDATED', ARRAY['Friends List', 'Heart Rate'],                       '2026-03-31T22:36:20.154359'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'City Portal',   'GRANTED', ARRAY['Payment Methods'],                                  '2026-04-03T22:36:20.154367'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'City Portal',   'REVOKED', ARRAY['Browsing History', 'Full Name'],                    '2026-03-14T22:36:20.154374'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Robinhood',     'UPDATED', ARRAY['Phone Number', 'Heart Rate', 'Payment Methods'],    '2026-03-03T22:36:20.154382'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Pinterest',     'UPDATED', ARRAY['Payment Methods'],                                  '2026-02-20T22:36:20.154388'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Strava',        'GRANTED', ARRAY['Transaction History', 'Location', 'Phone Number'],  '2026-03-28T22:36:20.154395'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Canvas',        'GRANTED', ARRAY['Location', 'Transaction History'],                  '2026-03-01T22:36:20.154402'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Quizlet',       'UPDATED', ARRAY['Location'],                                         '2026-04-16T22:36:20.154425'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'MyFitnessPal',  'REVOKED', ARRAY['Payment Methods'],                                  '2026-04-14T22:36:20.154433'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Doordash',      'REVOKED', ARRAY['Heart Rate'],                                       '2026-03-15T22:36:20.154439'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Microsoft',     'UPDATED', ARRAY['IP Address', 'Email'],                              '2026-04-07T22:36:20.154446'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'LinkedIn',      'UPDATED', ARRAY['Transaction History', 'Heart Rate'],                '2026-03-22T22:36:20.154453'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Apple',         'REVOKED', ARRAY['Transaction History'],                              '2026-03-24T22:36:20.154459'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Twitter',       'GRANTED', ARRAY['Email'],                                            '2026-03-15T22:36:20.154465'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'IRS Online',    'UPDATED', ARRAY['Medical History', 'Transaction History', 'Heart Rate'], '2026-03-15T22:36:20.154473'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Snapchat',      'UPDATED', ARRAY['Friends List'],                                     '2026-03-18T22:36:20.154479'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Slack',         'REVOKED', ARRAY['Email', 'Friends List', 'Transaction History'],     '2026-04-13T22:36:20.154486'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Instacart',     'REVOKED', ARRAY['Browsing History', 'Transaction History'],         '2026-03-09T22:36:20.154492'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Spotify',       'GRANTED', ARRAY['Payment Methods', 'Medical History', 'Phone Number'], '2026-03-04T22:36:20.154499'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'TikTok',        'REVOKED', ARRAY['Location', 'Browsing History', 'Phone Number'],    '2026-04-18T22:36:20.154506'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'Robinhood',     'GRANTED', ARRAY['Transaction History', 'Payment Methods'],           '2026-02-28T22:36:20.154513'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'MedConnect',    'GRANTED', ARRAY['Heart Rate', 'Medical History'],                   '2026-04-02T22:36:20.154520'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'GitHub',        'GRANTED', ARRAY['Email', 'IP Address'],                             '2026-01-11T22:36:20.154527'),
      ('15e1f301-268a-434c-b4d5-8927fd698456', 'NeoBank',       'REVOKED', ARRAY['Transaction History', 'Medical History'],          '2026-03-27T22:36:20.154534');
  END IF;
END $$;
