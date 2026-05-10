# Supabase Setup

This project now supports two auth modes:

1. Local prototype mode
2. Real Supabase auth mode

To switch to real Supabase auth:

1. Create a Supabase project.
2. Open the SQL editor and run [supabase/schema.sql](/Users/Abbas/Downloads/school-management-web-app/supabase/schema.sql).
3. Open [supabase-config.js](/Users/Abbas/Downloads/school-management-web-app/supabase-config.js) and fill in:
   - `enableSupabaseAuth: true`
   - `url`
   - `anonKey`
4. In Supabase Auth URL settings, add your local and production app URLs.
5. In Supabase Auth Providers, enable Google and paste your Google client ID and secret.
6. Use the login and signup pages. When Supabase config is enabled:
   - email/password signup uses Supabase Auth
   - email/password login uses Supabase Auth
   - Google buttons start real Google OAuth through Supabase

## Suggested local redirect URLs

Add every local URL you actually use:

- `http://localhost:8080`
- `http://127.0.0.1:8080`
- `http://localhost:8081`
- `http://127.0.0.1:8081`
- `http://localhost:8080/portal.html`
- `http://127.0.0.1:8080/portal.html`

## What is already wired in the frontend

- The auth pages automatically use Supabase when `supabase-config.js` is filled in.
- Google auth now redirects through Supabase OAuth instead of using the old fake modal flow.
- Sign-out calls Supabase sign-out when Supabase mode is enabled.
- The app mirrors the authenticated Supabase user into the existing dashboard session so the current admin pages keep working.

## What still needs to be connected next

The backend schema is ready for these next steps:

1. Replace localStorage-based class loading with `public.classes`.
2. Replace localStorage-based school settings with `public.institutions`.
3. Replace localStorage-based feature toggles with `public.feature_modules`.
4. Add a first-run onboarding flow so the first admin creates the institution record and joins it automatically.

## Recommended next implementation order

1. Connect school settings to `public.institutions`
2. Connect feature modules to `public.feature_modules`
3. Connect class management to `public.classes`
4. Add student, teacher, and attendance tables after that
