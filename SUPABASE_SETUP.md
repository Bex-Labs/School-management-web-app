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
4. Replace localStorage-based role permissions with `public.role_permissions`.
5. Add a first-run onboarding flow so the first admin creates the institution record and joins it automatically.

The `public.institutions` table now includes:

- `name`
- `logo_url`
- `school_profile`
- `address`
- `campus_details`
- `phone`
- `website`
- `has_nursery`
- `has_higher_institution`
- `academic_year_start`
- `academic_year_end`

School structure now assumes these always exist:
- `Primary 1-6`
- `JSS 1-3`
- `SS 1-3`

And these are optional toggles:
- `Nursery`
- `Higher Institution (Polytechnic/University)`

Role permission storage is ready in `public.role_permissions` with:
- `role_key` (`Administrator`, `Teacher`, `Parent`, `Student`)
- `permission_key` (dashboard, students, staff, classes, attendance, results, fees, reports, settings)
- `enabled`

Class management storage in `public.classes` also supports:
- `class_teacher`
- `arms` (text array)
- `subjects` (text array)
- `teacher_assignments` (JSON array of `{ subject, teacher }`)

## Recommended next implementation order

1. Connect school settings to `public.institutions`
2. Connect feature modules to `public.feature_modules`
3. Connect role permissions to `public.role_permissions`
4. Connect class management to `public.classes`
5. Add student, teacher, and attendance tables after that
