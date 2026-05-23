# Supabase Setup

This project now supports two auth modes:

1. Local prototype mode
2. Real Supabase auth mode

To switch to real Supabase auth:

1. Create a Supabase project.
2. Open the SQL editor and run [supabase/schema.sql](/Users/Abbas/Downloads/school-management-web-app/School-management-web-app/supabase/schema.sql).
3. Open [supabase-config.js](/Users/Abbas/Downloads/school-management-web-app/School-management-web-app/supabase-config.js) and fill in:
   - `enableSupabaseAuth: true`
   - `url`
   - `anonKey`
4. In Supabase Auth URL settings, add your local and production app URLs.
5. In Supabase Auth Providers, enable Google and paste your Google client ID and secret.
6. Use the login and signup pages. When Supabase config is enabled:
   - email/password signup uses Supabase Auth
   - email/password login uses Supabase Auth
   - Google buttons start real Google OAuth through Supabase

## Parent/Staff provisioning function (required for admin-created accounts)

Admin-created guardian/parent accounts now require a Supabase Edge Function so those accounts are created in real Supabase Auth (not only local browser storage).

1. Install and login Supabase CLI.
2. From the project root, deploy the function:
   - `supabase functions deploy provision-user`
3. Ensure your `supabase-config.js` includes:
   - `userProvisionFunctionName: "provision-user"`
4. Keep RLS + `profiles` table from `supabase/schema.sql` already applied.

What this enables:
- When Admin creates a student with guardian email, parent login is provisioned in Supabase Auth immediately.
- Parent can then log in on the login page with:
  - role: `Parent`
  - email: guardian email
  - password: `Parent@123` (default)
- Parent is marked to change password later in personal settings.

## Public admissions submission function (required for applicant form → admin pending)

Applications submitted from the public form page now post directly to Supabase so they appear in Admin Admissions even across different devices/browsers.

1. Deploy the function:
   - `supabase functions deploy submit-admission --no-verify-jwt`
2. Ensure [supabase-config.js](/Users/Abbas/Downloads/school-management-web-app/School-management-web-app/supabase-config.js) includes:
   - `admissionsSubmitFunctionName: "submit-admission"`
3. Use the admin-generated application link/QR from Admissions.

What this enables:
- Applicant submits form on `admissions-apply.html`.
- Record is written to `public.admissions_applications`.
- Admin sees it under pending admissions after reload (or next hydration).

If you see `Missing authorization header` on submit, redeploy with `--no-verify-jwt` exactly as above.

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
- School Settings now includes a **Migrate Workspace Data** button that copies current browser workspace state into:
  - `public.workspace_states`
  - `public.workspace_migration_runs`
  - and syncs school profile fields into `public.institutions`.

## Run browser-storage migration now

1. Sign in as an **Admin**.
2. Go to **Settings → School Settings**.
3. Click **Migrate Workspace Data**.
4. Wait for the success message showing migrated keys and workspace id.

This migrates state such as school settings, sessions/terms, classes, courses, students, feature modules, permissions, admissions, and notifications for the current workspace.

## What still needs to be connected next

The backend schema is ready for these next steps:

1. Replace localStorage-based feature toggles with `public.feature_modules`.
2. Replace localStorage-based role permissions with `public.role_permissions`.
3. Replace localStorage-based class loading with `public.classes`.
4. Add a first-run onboarding flow so the first admin creates the institution record and joins it automatically.

Done in Phase 1:
- School settings now hydrate from `public.institutions` on Supabase sessions.
- School settings save/reset now write through to `public.institutions` first.

Done in Phase 2:
- Feature modules now hydrate from `public.workspace_states` (`schoolsphere.featureModules.v1`) on Supabase sessions.
- Feature module changes now auto-sync back to `public.workspace_states`.
- Role permissions now hydrate from `public.workspace_states` (`schoolsphere.rolePermissions.v1`) on Supabase sessions.
- Role permission changes/reset now sync back to `public.workspace_states`.

Done in Phase 3:
- Classes now hydrate from `public.workspace_states` (`schoolsphere.classes.v1`) on Supabase sessions.
- Courses now hydrate from `public.workspace_states` (`schoolsphere.courses.v1`) on Supabase sessions.
- Students now hydrate from `public.workspace_states` (`schoolsphere.students.v1`) on Supabase sessions.
- Academic calendar + timetable now hydrate from `public.workspace_states`.
- Admissions and notifications now hydrate from `public.workspace_states`.
- Live changes in these modules now auto-sync back to `public.workspace_states` in the background.

Done in Phase 4 (table-native):
- `schoolsphere.featureModules.v1` now reads/writes through `public.feature_modules`.
- `schoolsphere.rolePermissions.v1` now reads/writes through `public.role_permissions`.
- `schoolsphere.classes.v1` now reads/writes through `public.classes`.
- `schoolsphere.courses.v1` now reads/writes through `public.courses`.
- `schoolsphere.students.v1` now reads/writes through `public.students`.
- `schoolsphere.feeItems.v1` now reads/writes through `public.fee_items`.
- `schoolsphere.academicCycles.v1` now reads/writes through `public.academic_cycles_state`.
- `schoolsphere.admissionConfig.v1` now reads/writes through `public.admission_config_state`.
- `schoolsphere.admissions.v1` now reads/writes through `public.admissions_applications`.
- `schoolsphere.notifications.v1` now reads/writes through `public.notifications_log`.
- `schoolsphere.academicCalendar.v1` now reads/writes through `public.academic_calendar_events`.
- `schoolsphere.timetable.v1` now reads/writes through `public.timetable_entries`.

Done in Phase 5 (table-native completion):
- `schoolsphere.parentFees.v1` now reads/writes through `public.parent_fee_records`.
- `schoolsphere.accessGrants.v1` now reads/writes through `public.access_grants`.
- Parent fee updates now auto-sync to Supabase in the background.
- Access grant updates now auto-sync to Supabase in the background.

Migration button behavior now:
- **Migrate Workspace Data** writes all known module keys to dedicated table-native targets.
- `public.workspace_states` remains only as compatibility fallback for unknown/future keys.

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
