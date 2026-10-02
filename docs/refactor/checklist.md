# Baseline and regression checklist

Snapshot: 2026-10-02; HEAD e1eb094 on main. This task documents a future refactor. No application, browser session, remote API or database was used to run an end-to-end workflow.

## Status definitions

- **PASS**: the specifically described check ran and passed. A source check is not a browser or production pass.
- **FAIL — pre-existing**: a reproducible failure observed before extraction, left unchanged.
- **NOT TESTED**: required behavior has not been exercised; source presence alone is insufficient.
- **BLOCKED**: record the concrete missing prerequisite when a future attempt cannot run. Do not silently promote it to PASS.

## Checks actually performed

| Check | Result | Evidence and limit |
| --- | --- | --- |
| Applicable instructions | PASS | No AGENTS.md found in repository/ancestor scan; user constraints govern. |
| Existing working tree | PASS | Read-only git status eventually returned only “## main...origin/main”; clean before documentation. HEAD e1eb094. Earlier attempts stalled and were interrupted. |
| Staged/untracked baseline | PASS | git diff-index --cached --name-status HEAD and git ls-files --others --exclude-standard returned no changes before docs. |
| Browser JS syntax | PASS | Acorn and Babel parsed app.js, auth.js, self-registration-links.js, supabase-config.js as classic scripts without execution. |
| Inline syntax: admin-settings | PASS | Both parsers accepted the redirect script. Redirect behavior not browser-tested. |
| Inline syntax: admin-messages | PASS | Both parsers accepted the script. Its early return disables the inbox code; parse success does not mean active functionality. |
| Inline syntax: contact | FAIL — pre-existing | Both parsers reject inline script line 53, corresponding to contact.html:958, at the unescaped apostrophe in the success string. Entire inline script fails parsing. |
| HTML script manifest | PASS | Inspected all 58 root HTML files and 157 external script tags; all referenced local script files exist after stripping query strings. No async/defer/module attributes found. Does not verify HTTP delivery. |
| Supabase source syntax | PASS | Babel TypeScript parser accepted all four function sources. Not Deno type-checking or hosted gateway verification. |
| Inventory coverage | PASS | AST inventory has 1,222 direct declarations (318 app, 893 auth IIFE, 10 link IIFE, 1 config), 19 explicit window.SchoolSphere objects including config, 32 CustomEvent constructions and 423 listener/timer/subscription/cleanup sites in parsable scripts. |
| First-candidate isolated behavior | PASS | Executed only renderWhyGrid in a Node VM with a fake document: missing target returns safely; synthetic title/copy render; empty input clears the target. No app bootstrap, storage or network executed. Not a visual test or full markup equivalence proof. |
| Existing application source preservation | PASS | SHA-256 comparison of 63 root HTML/JS/CSS files and four function sources found no changes. Final read-only git status shows only the new docs/ directory; no tracked application changes. |
| Documentation integrity | PASS | All four saved documents match the prepared text, all 1,222 inventoried declaration names are present, and scans found no JWT-like values, key literals or email addresses. This is a focused content check, not a general secret-scanner audit. |
| Browser UI baseline | NOT TESTED | No browser baseline run in this documentation task. |
| Authentication/database baseline | NOT TESTED | No login, provisioning, synchronization, payments or database writes attempted. |

No package.json or source test/spec files were found. There is no discovered project test command to claim as passed. Installed parsers were reused without installing packages.

## Existing observations to keep separate from regressions

1. **contact.html:958** has a confirmed syntax defect. It is outside this documentation stage and must not be silently fixed in a code-movement commit. Record a separate fix/checkpoint if later requested. Until then, public-site acceptance must disclose this known failure.
2. Contact submission is a 1,200 ms simulated success flow in source; there is no demonstrated message delivery. Do not write a test expecting real delivery.
3. admin-messages.html's old inline inbox is disabled by an early return. Do not activate it during cleanup; its dormant behavior is not the live messaging implementation.
4. auth.js and self-registration-links.js both wire registration links. Their overlap and timing are risks to investigate, not a confirmed runtime regression.
5. Workspace-resolution fallback orders differ between app.js, auth.js and the link companion. Preserve existing algorithms until a separate consolidation is justified.
6. Server school deletion returns HTTP 207 with ok:true on partial failure. Do not collapse partial into complete success.
7. SQL policies and Edge-function source are not proof of currently deployed database policy or gateway settings.

## Test setup for a future implementation stage

Use a disposable browser profile with synthetic records. Use local/in-memory mocks for a storage/UI-only extraction. Backend acceptance needs a dedicated non-production environment and authorized test accounts; this checklist is not permission to mutate production.

Prepare fixtures for two schools A/B, Admin, Teacher with assigned/unassigned classes, Student, Parent with two children, Super Admin, restricted/deactivated accounts, and empty/populated workspace states. Record the baseline snapshot and expected behavior without storing personal data, passwords or tokens in this documentation.

Preserve pre-test storage in the disposable profile. Run through HTTP rather than file://. Record desktop/mobile viewport, console errors, failed requests, selected account role, expected outcome and actual outcome. Do not attach raw authenticated request headers or personal data.

## Public pages and shared shell

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| P01 | Open index, products, workflows, modules, school-types, why-it-works and in-practice directly and via navigation; same headings, cards, links and active state. | NOT TESTED |
| P02 | Desktop/mobile header, menu open/close and outside click, footer and school branding match baseline. | NOT TESTED |
| P03 | Theme before and after reload, saved dark/light preference, no new theme flash. | NOT TESTED |
| P04 | Contact accordion and submit validation compared against disclosed existing syntax failure; no claim of real delivery. | NOT TESTED |
| P05 | Google verification file stays at its exact path with unchanged contents. | NOT TESTED |
| P06 | Every HTML entry in contracts.md loads scripts once, in order, without new console errors or missing files. | NOT TESTED |

## Authentication, access and identity

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| A01 | Email/password login for each role, invalid credentials and wrong-role selection; same error/redirect behavior. | NOT TESTED |
| A02 | Persistent versus tab-session login, reload, new tab, browser restart, logout; same storage precedence. | NOT TESTED |
| A03 | Signup, confirmation, existing account, confirmation link replay/expiry. | NOT TESTED |
| A04 | Forgot/reset password for existing supported modes: token, code and recovery hash; expired/invalid links and required password change. | NOT TESTED |
| A05 | Google sign-in callback, role/grant resolution, provider-specific behavior and cancelled/failed flow. | NOT TESTED |
| A06 | Owner access and Super Admin routing; ordinary roles cannot access owner-only screens. | NOT TESTED |
| A07 | Direct protected-page navigation while logged out, permission disabled, module disabled or account deactivated. Compare page and action guards. | NOT TESTED |
| A08 | Student admission-number login and parent guardian-email workspace alignment choose expected record/school. | NOT TESTED |
| A09 | Remote service failure/timeout and local fallback match baseline without premature redirects or duplicate initialization. | NOT TESTED |

## Administrative features

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| F01 | Students: create/edit, guardian relationships/accounts, documents/photo, import/export, promotion/transfer/archive, selected/bulk operations using disposable records. | NOT TESTED |
| F02 | Admissions: public URL/QR, school branding, steps/review, 200 KB attachment limit/removal, submit, edit, approve/convert, reject/history; preserve IDs and linkage. | NOT TESTED |
| F03 | Teachers: create/edit/provision, department/role metadata, job letter preview/print, archive/status; permissions remain enforced. | NOT TESTED |
| F04 | Classes: school-type templates, levels/arms, subject/teacher assignment, student/attendance/results detail modals. | NOT TESTED |
| F05 | Courses: faculty/department/subject choices, class/arm/teacher associations, academic period and archive behavior. | NOT TESTED |
| F06 | Timetable: period/room/teacher conflicts, class assignment, week types, copy term, publish/unpublish, substitution, print. | NOT TESTED |
| F07 | Academic sessions/terms: create/edit/status and dependent selections; calendar events/conflicts and dashboard refresh. | NOT TESTED |
| F08 | Attendance: status entry/edit, class/date/lesson scoping, summaries, absence notifications and grouped reports. | NOT TESTED |
| F09 | Fees: catalog/categories, invoice generation, transactions/balances, receipts/print/PDF and parent/student balance consistency. No live payment. | NOT TESTED |
| F10 | Gradebook/results: components, totals, grading settings, teacher assignment permissions, save/reload and report release rules. | NOT TESTED |
| F11 | Reports: enrollment/academic calculations, period/class filters, report cards, CSV/PDF/print and comments. | NOT TESTED |
| F12 | Messaging: inbox/thread scope, unread/hide/reply, attachments, announcements/audience and notification preferences. Verify one action produces one message. | NOT TESTED |
| F13 | Settings: branding, school types, access grants, roles/permissions, module toggles and persisted academic/grading settings. | NOT TESTED |
| F14 | Self-registration: copy/open links, type/workspace query, missing/invalid workspace, remote config/submission and local fallback; verify no new duplicate listeners. | NOT TESTED |
| F15 | Account deletion: cancellation, invalid confirmation, denial for unauthorized roles, complete/partial response mapping. Mock responses first; actual deletion only in explicitly disposable environment. | NOT TESTED |
| F16 | Audit entries/onboarding/search/toasts/form drafts retain scope and behavior; no duplicate side effects. | NOT TESTED |

## Role-specific portals

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| R01 | Teacher dashboard/classes/timetable, assigned attendance, lesson-plan create/duplicate, gradebook/results, leave request, messages/settings. | NOT TESTED |
| R02 | Teacher cannot access another teacher's unassigned record or an administrator-only action. | NOT TESTED |
| R03 | Student portal sections/hash navigation, own courses/timetable/attendance/fees/released reports/messages/profile. | NOT TESTED |
| R04 | Student cannot obtain another student's record through changed selection/hash/state. | NOT TESTED |
| R05 | Parent switches between linked children and sees correct teachers/courses/attendance/fees/reports/messages; selection persists. | NOT TESTED |
| R06 | Parent cannot access an unrelated child/school; chatbot summaries and preferences reflect selected child. | NOT TESTED |
| R07 | Super Admin schools/accounts/activity/search and actions match baseline; normal Admin remains school-scoped. | NOT TESTED |
| R08 | User/parent/staff settings, password updates, notification preferences, signout and mobile sidebar behavior. | NOT TESTED |

## Storage, synchronization and cross-feature acceptance

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| S01 | Load existing-format synthetic local data and compare normalized shapes before/after extraction; IDs, aliases and key names unchanged. | NOT TESTED |
| S02 | Switch school A → B → A with both populated; no cross-school records, selected state, grants, notifications or draft leaks. | NOT TESTED |
| S03 | Single-colon collections, double-colon collections and shared access-grant merge preserve other-school data. | NOT TESTED |
| S04 | Save/reload and two-tab storage updates; one custom update in originating tab, correct refresh elsewhere. | NOT TESTED |
| S05 | Hydration emits its distinct payload, suppresses echo writes, preserves documented local fallback and exits hydration mode on errors. | NOT TESTED |
| S06 | 260 ms sync debounce, repeated rapid edits, one logical write per state; same Admin/Teacher eligibility. | NOT TESTED |
| S07 | Table-native adapters and workspace_states fallback preserve conflict keys, institution scope and report-card stale-row exception. | NOT TESTED |
| S08 | Existing migrations/legacy cleanup run only at their existing lifecycle point; no new clears or resets. | NOT TESTED |
| S09 | Network failure/reconnect/timeout, SDK/library load failure, offline local operation and draft recovery match baseline. | NOT TESTED |
| S10 | Student/class/attendance change propagates to relevant teacher, student, parent and report views; counts match. | NOT TESTED |
| S11 | Session callbacks, client/library caches, timers, listeners and subscriptions are not duplicated after startup/navigation. | NOT TESTED |

## Acceptance for extraction E01 only

1. Capture the existing why-it-works card markup and visual layout, plus behavior where the target does not exist.
2. Repeat the isolated helper checks using the same synthetic input and compare full innerHTML strings before/after, not only substring presence.
3. All 57 app.js consumers must load the extracted classic script exactly once immediately before app.js; preserve existing order and query strings on other scripts. Verification HTML remains untouched.
4. Load public pages plus a representative login/portal page over HTTP; no new missing-file/reference errors; no UI/style changes.
5. Compare app.js manager interfaces and startup calls to baseline; this step must not touch auth.js, configuration, persistence, Supabase or styles.
6. Record known contact failure separately. Do not describe the whole site as passing.
7. Review a narrow diff and update inventory location/status. Stop after E01, leaving the user to checkpoint through GitHub Desktop.

## Result log template

For each future run record: extraction ID; local revision/working state; check IDs; synthetic fixture role/school; expected vs actual; PASS/FAIL/NOT TESTED; console/network evidence with secrets redacted; touched paths; remaining risks; rollback checkpoint. A screenshot or syntax pass alone cannot substitute for data, access or synchronization checks.
