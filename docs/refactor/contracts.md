# Contracts to preserve during JavaScript extraction

Original snapshot: 2026-10-02 at e1eb094; current update 2026-10-04 for E09 from clean f06543b. Current auth anchors and HTML manifest reflect the timetable factory. Original HTML ID catalog is preserved; other historical HTML/inline coordinates remain snapshot references. E08 browser acceptance is user-reported; E09 browser/backend acceptance is not tested. Configuration/schema/data/deployment unchanged.

## Loading and startup

All external HTML scripts inspected are classic scripts, without async/defer/type=module attributes. 57 of 58 HTML documents load app.js; the Google verification document has no script. The full ordered manifest below includes cache-busting query strings, which must remain valid. Most portal/auth pages load app.js, then supabase-config.js, then action-dialog.js, then timetable/controller.js, then auth.js. Students and teachers administration additionally load self-registration-links.js after auth.js. After E09 the shared synchronous classic order is js/website/offerings.js, js/core/escape-html.js, js/website/practice-grid.js, js/website/why-grid.js, js/features/timetable/store.js, js/features/students/store.js, app.js, then unchanged subsequent scripts. Those shared extracted scripts remain once on all 57 app consumers. E08 loads js/shared-ui/action-dialog.js; E09 adds js/features/timetable/controller.js once directly after it and before auth.js on all 49 auth consumers, not on public-only pages. There are 597 external tags: 499 through E07, 49 dialog tags and 49 controller tags.

### app.js

1. Immediate theme IIFE reads schoolsphere.theme.v1, updates the root and body, and registers a one-time DOMContentLoaded callback when loading.
2. Top-level lexical declarations and functions establish shared models and helpers. clearLegacySharedState() executes at line 394 and removes legacy unscoped keys. Do not accidentally re-run this cleanup per feature.
3. window.SchoolSphere* manager objects are assigned at lines 3170–3390. Their object identity and public members are compatibility boundaries.
4. A storage listener at line 3392 re-emits feature events for scoped keys.
5. Immediate calls at lines 3687–3691 render header/footer, bind outside-click behavior, render page content, and apply branding. Subsequent listeners handle school settings, hash navigation and feature toggles.

### auth.js

The file remains an IIFE. Its local APIs/state remain private; E08 moves dialog implementation/state into a factory-private closure and binds its three methods once at auth.js:6312–6320. E09 retains a private initTimetableControls alias at auth.js:13697–13731. At line 603 it applies the theme. The DOMContentLoaded callback at 605 does the following in source order:

```text
applyThemePreference(getThemePreference());
initThemeControls();
wireSignOutButton(document);
try await initSupabaseAuthBridge(); catch retains local fallback
initConnectionResilienceBanner();
initAdminSidebarUi();
initActionFeedbackTracking();
initPasswordToggles();
initRoleButtons();
initSignupFlow();
initLoginFlow();
initOwnerAccessFlow();
initForgotPasswordFlow();
initResetPasswordFlow();
initGoogleButtons();
initConfirmPage();
initPortalPage();
initParentPages();
initAdminShellPages();
initSuperAdminPage();
initStaffPortalPages();
initAdminStudentsPage();
initAdminAdmissionsPage();
initAdminTeachersPage();
initAdminClassesPage();
initAdminCoursesPage();
initAdminSchedulePage();
initAdminFeesPage();
initAdminAttendancePage();
initAdminReportsPage();
initAdminMessagesPage();
initAdminFeatureModulesPage();
initAdminSettingsPage();
initUserSettingsPage();
initAdmissionsApplyPage();
initSelfRegisterPage();
initFormDraftPersistence();
initSupabaseWorkspaceStateLiveSync();
hydrateSchoolSettingsFromSupabase() .catch(local/background fallback);
hydrateWorkspaceStateCollectionsFromSupabase() .catch(local/background fallback);
```

Only the authentication bridge is awaited by this outer sequence. Some page initializers are async but invoked without await. Hydration starts in the background after page wiring and live-sync wiring. Do not reorder, add awaiting, or introduce import-time side effects as an incidental consequence of moving files.

initSupabaseAuthBridge registers onAuthStateChange and defers callback processing with setTimeout(..., 0); PASSWORD_RECOVERY persists recovery status, SIGNED_OUT clears local session and redirects selected protected pages, other events synchronize session. Preserve the actual page conditions, including any current omissions. The bootstrap lacks a readyState fallback: later lazy loading requires a deliberate ready-once design.

### Inline/companion exceptions

- admin-settings.html: head script and meta refresh both target ./admin-settings-school.html.
- admin-messages.html: inline IIFE returns immediately. Its dormant inbox must not become active during extraction.
- contact.html: the inline script has a pre-existing parse failure at line 958. Intended FAQ/form behavior includes simulated success, not a backend send.
- self-registration-links.js: independent DOM-ready listener can run while auth.js awaits Supabase. It refreshes links immediately and after 250/1,000 ms. Its workspace fallback precedence differs from app.js/auth.js; preserve each until a separately reviewed consolidation.

## HTML entry-point manifest

Each row lists current tags after E09. Shared app scripts keep their order; action-dialog.js, timetable/controller.js and auth.js load in that order on all auth pages. All prior tag attributes/order are retained; inline locations in this manifest are current. Paths remain document-relative.

| HTML file | data-page | Ordered scripts |
| --- | --- | --- |
| `admin-admissions.html` | `admin-admissions` | `./js/website/offerings.js` @359 → `./js/core/escape-html.js` @360 → `./js/website/practice-grid.js` @361 → `./js/website/why-grid.js` @362 → `./js/features/timetable/store.js` @363 → `./js/features/students/store.js` @364 → `./app.js` @365 → `./supabase-config.js` @366 → `./js/shared-ui/action-dialog.js` @367 → `./js/features/timetable/controller.js` @368 → `./auth.js?v=upload-remove-x` @369 |
| `admin-attendance.html` | `admin-attendance` | `./js/website/offerings.js` @208 → `./js/core/escape-html.js` @209 → `./js/website/practice-grid.js` @210 → `./js/website/why-grid.js` @211 → `./js/features/timetable/store.js` @212 → `./js/features/students/store.js` @213 → `./app.js` @214 → `./supabase-config.js` @215 → `./js/shared-ui/action-dialog.js` @216 → `./js/features/timetable/controller.js` @217 → `./auth.js` @218 |
| `admin-classes.html` | `admin-classes` | `./js/website/offerings.js` @289 → `./js/core/escape-html.js` @290 → `./js/website/practice-grid.js` @291 → `./js/website/why-grid.js` @292 → `./js/features/timetable/store.js` @293 → `./js/features/students/store.js` @294 → `./app.js` @295 → `./supabase-config.js` @296 → `./js/shared-ui/action-dialog.js` @297 → `./js/features/timetable/controller.js` @298 → `./auth.js` @299 |
| `admin-courses.html` | `admin-courses` | `./js/website/offerings.js` @283 → `./js/core/escape-html.js` @284 → `./js/website/practice-grid.js` @285 → `./js/website/why-grid.js` @286 → `./js/features/timetable/store.js` @287 → `./js/features/students/store.js` @288 → `./app.js` @289 → `./supabase-config.js` @290 → `./js/shared-ui/action-dialog.js` @291 → `./js/features/timetable/controller.js` @292 → `./auth.js` @293 |
| `admin-feature-modules.html` | `admin-feature-modules` | `./js/website/offerings.js` @166 → `./js/core/escape-html.js` @167 → `./js/website/practice-grid.js` @168 → `./js/website/why-grid.js` @169 → `./js/features/timetable/store.js` @170 → `./js/features/students/store.js` @171 → `./app.js` @172 → `./supabase-config.js` @173 → `./js/shared-ui/action-dialog.js` @174 → `./js/features/timetable/controller.js` @175 → `./auth.js` @176 |
| `admin-fees.html` | `admin-fees` | `./js/website/offerings.js` @316 → `./js/core/escape-html.js` @317 → `./js/website/practice-grid.js` @318 → `./js/website/why-grid.js` @319 → `./js/features/timetable/store.js` @320 → `./js/features/students/store.js` @321 → `./app.js` @322 → `./supabase-config.js` @323 → `./js/shared-ui/action-dialog.js` @324 → `./js/features/timetable/controller.js` @325 → `./auth.js` @326 |
| `admin-messages.html` | `admin-messages` | `./js/website/offerings.js` @590 → `./js/core/escape-html.js` @591 → `./js/website/practice-grid.js` @592 → `./js/website/why-grid.js` @593 → `./js/features/timetable/store.js` @594 → `./js/features/students/store.js` @595 → `./app.js` @596 → `./supabase-config.js` @597 → `./js/shared-ui/action-dialog.js` @598 → `./js/features/timetable/controller.js` @599 → `./auth.js` @600 → `inline` @601 |
| `admin-reports.html` | `admin-reports` | `./js/website/offerings.js` @236 → `./js/core/escape-html.js` @237 → `./js/website/practice-grid.js` @238 → `./js/website/why-grid.js` @239 → `./js/features/timetable/store.js` @240 → `./js/features/students/store.js` @241 → `./app.js` @242 → `./supabase-config.js` @243 → `./js/shared-ui/action-dialog.js` @244 → `./js/features/timetable/controller.js` @245 → `./auth.js` @246 |
| `admin-schedule.html` | `admin-schedule` | `./js/website/offerings.js` @349 → `./js/core/escape-html.js` @350 → `./js/website/practice-grid.js` @351 → `./js/website/why-grid.js` @352 → `./js/features/timetable/store.js` @353 → `./js/features/students/store.js` @354 → `./app.js` @355 → `./supabase-config.js` @356 → `./js/shared-ui/action-dialog.js` @357 → `./js/features/timetable/controller.js` @358 → `./auth.js` @359 |
| `admin-settings-academic.html` | `admin-settings-academic` | `./js/website/offerings.js` @258 → `./js/core/escape-html.js` @259 → `./js/website/practice-grid.js` @260 → `./js/website/why-grid.js` @261 → `./js/features/timetable/store.js` @262 → `./js/features/students/store.js` @263 → `./app.js` @264 → `./supabase-config.js` @265 → `./js/shared-ui/action-dialog.js` @266 → `./js/features/timetable/controller.js` @267 → `./auth.js` @268 |
| `admin-settings-access.html` | `admin-settings-access` | `./js/website/offerings.js` @211 → `./js/core/escape-html.js` @212 → `./js/website/practice-grid.js` @213 → `./js/website/why-grid.js` @214 → `./js/features/timetable/store.js` @215 → `./js/features/students/store.js` @216 → `./app.js` @217 → `./supabase-config.js` @218 → `./js/shared-ui/action-dialog.js` @219 → `./js/features/timetable/controller.js` @220 → `./auth.js` @221 |
| `admin-settings-grading.html` | `admin-settings-grading` | `./js/website/offerings.js` @280 → `./js/core/escape-html.js` @281 → `./js/website/practice-grid.js` @282 → `./js/website/why-grid.js` @283 → `./js/features/timetable/store.js` @284 → `./js/features/students/store.js` @285 → `./app.js` @286 → `./supabase-config.js` @287 → `./js/shared-ui/action-dialog.js` @288 → `./js/features/timetable/controller.js` @289 → `./auth.js` @290 |
| `admin-settings-roles.html` | `admin-settings-roles` | `./js/website/offerings.js` @174 → `./js/core/escape-html.js` @175 → `./js/website/practice-grid.js` @176 → `./js/website/why-grid.js` @177 → `./js/features/timetable/store.js` @178 → `./js/features/students/store.js` @179 → `./app.js?v=20260611-student-messages` @180 → `./supabase-config.js` @181 → `./js/shared-ui/action-dialog.js` @182 → `./js/features/timetable/controller.js` @183 → `./auth.js?v=20260611-student-messages` @184 |
| `admin-settings-school.html` | `admin-settings-school` | `./js/website/offerings.js` @341 → `./js/core/escape-html.js` @342 → `./js/website/practice-grid.js` @343 → `./js/website/why-grid.js` @344 → `./js/features/timetable/store.js` @345 → `./js/features/students/store.js` @346 → `./app.js` @347 → `./supabase-config.js` @348 → `./js/shared-ui/action-dialog.js` @349 → `./js/features/timetable/controller.js` @350 → `./auth.js` @351 |
| `admin-settings.html` | `admin-settings` | `inline` @10 → `./js/website/offerings.js` @182 → `./js/core/escape-html.js` @183 → `./js/website/practice-grid.js` @184 → `./js/website/why-grid.js` @185 → `./js/features/timetable/store.js` @186 → `./js/features/students/store.js` @187 → `./app.js` @188 → `./supabase-config.js` @189 → `./js/shared-ui/action-dialog.js` @190 → `./js/features/timetable/controller.js` @191 → `./auth.js` @192 |
| `admin-students.html` | `admin-students` | `./js/website/offerings.js` @382 → `./js/core/escape-html.js` @383 → `./js/website/practice-grid.js` @384 → `./js/website/why-grid.js` @385 → `./js/features/timetable/store.js` @386 → `./js/features/students/store.js` @387 → `./app.js` @388 → `./supabase-config.js` @389 → `./js/shared-ui/action-dialog.js` @390 → `./js/features/timetable/controller.js` @391 → `./auth.js?v=self-registration-links` @392 → `./self-registration-links.js?v=copy-open-fix` @393 |
| `admin-teachers.html` | `admin-teachers` | `./js/website/offerings.js` @300 → `./js/core/escape-html.js` @301 → `./js/website/practice-grid.js` @302 → `./js/website/why-grid.js` @303 → `./js/features/timetable/store.js` @304 → `./js/features/students/store.js` @305 → `./app.js` @306 → `./supabase-config.js` @307 → `./js/shared-ui/action-dialog.js` @308 → `./js/features/timetable/controller.js` @309 → `./auth.js?v=self-registration-links` @310 → `./self-registration-links.js?v=copy-open-fix` @311 |
| `admissions-apply.html` | `admissions-apply` | `./js/website/offerings.js` @294 → `./js/core/escape-html.js` @295 → `./js/website/practice-grid.js` @296 → `./js/website/why-grid.js` @297 → `./js/features/timetable/store.js` @298 → `./js/features/students/store.js` @299 → `./app.js` @300 → `./supabase-config.js` @301 → `./js/shared-ui/action-dialog.js` @302 → `./js/features/timetable/controller.js` @303 → `./auth.js?v=upload-remove-x` @304 |
| `confirm-email.html` | `confirm-email` | `./js/website/offerings.js` @36 → `./js/core/escape-html.js` @37 → `./js/website/practice-grid.js` @38 → `./js/website/why-grid.js` @39 → `./js/features/timetable/store.js` @40 → `./js/features/students/store.js` @41 → `./app.js` @42 → `./supabase-config.js` @43 → `./js/shared-ui/action-dialog.js` @44 → `./js/features/timetable/controller.js` @45 → `./auth.js` @46 |
| `contact.html` | `contact` | `./js/website/offerings.js` @905 → `./js/core/escape-html.js` @906 → `./js/website/practice-grid.js` @907 → `./js/website/why-grid.js` @908 → `./js/features/timetable/store.js` @909 → `./js/features/students/store.js` @910 → `./app.js` @911 → `inline` @912 |
| `forgot-password.html` | `forgot-password` | `./js/website/offerings.js` @101 → `./js/core/escape-html.js` @102 → `./js/website/practice-grid.js` @103 → `./js/website/why-grid.js` @104 → `./js/features/timetable/store.js` @105 → `./js/features/students/store.js` @106 → `./app.js` @107 → `./supabase-config.js` @108 → `./js/shared-ui/action-dialog.js` @109 → `./js/features/timetable/controller.js` @110 → `./auth.js` @111 |
| `google20c973feb5773234.html` | — | None |
| `in-practice.html` | `practice` | `./js/website/offerings.js` @34 → `./js/core/escape-html.js` @35 → `./js/website/practice-grid.js` @36 → `./js/website/why-grid.js` @37 → `./js/features/timetable/store.js` @38 → `./js/features/students/store.js` @39 → `./app.js` @40 |
| `index.html` | `home` | `./js/website/offerings.js` @190 → `./js/core/escape-html.js` @191 → `./js/website/practice-grid.js` @192 → `./js/website/why-grid.js` @193 → `./js/features/timetable/store.js` @194 → `./js/features/students/store.js` @195 → `./app.js?v=index-ui-20260603` @196 |
| `login.html` | `login` | `./js/website/offerings.js` @214 → `./js/core/escape-html.js` @215 → `./js/website/practice-grid.js` @216 → `./js/website/why-grid.js` @217 → `./js/features/timetable/store.js` @218 → `./js/features/students/store.js` @219 → `./app.js` @220 → `./supabase-config.js` @221 → `./js/shared-ui/action-dialog.js` @222 → `./js/features/timetable/controller.js` @223 → `./auth.js` @224 |
| `modules.html` | `modules` | `./js/website/offerings.js` @33 → `./js/core/escape-html.js` @34 → `./js/website/practice-grid.js` @35 → `./js/website/why-grid.js` @36 → `./js/features/timetable/store.js` @37 → `./js/features/students/store.js` @38 → `./app.js` @39 |
| `owner-access.html` | `owner-access` | `./js/website/offerings.js` @121 → `./js/core/escape-html.js` @122 → `./js/website/practice-grid.js` @123 → `./js/website/why-grid.js` @124 → `./js/features/timetable/store.js` @125 → `./js/features/students/store.js` @126 → `./app.js?v=20260611-student-messages` @127 → `./supabase-config.js` @128 → `./js/shared-ui/action-dialog.js` @129 → `./js/features/timetable/controller.js` @130 → `./auth.js?v=20260611-student-messages` @131 |
| `parent-attendance.html` | `parent-attendance` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./js/features/timetable/controller.js` @61 → `./auth.js` @62 |
| `parent-courses.html` | `parent-courses` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./js/features/timetable/controller.js` @61 → `./auth.js` @62 |
| `parent-fees.html` | `parent-fees` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./js/features/timetable/controller.js` @61 → `./auth.js` @62 |
| `parent-messages.html` | `parent-messages` | `./js/website/offerings.js` @54 → `./js/core/escape-html.js` @55 → `./js/website/practice-grid.js` @56 → `./js/website/why-grid.js` @57 → `./js/features/timetable/store.js` @58 → `./js/features/students/store.js` @59 → `./app.js` @60 → `./supabase-config.js` @61 → `./js/shared-ui/action-dialog.js` @62 → `./js/features/timetable/controller.js` @63 → `./auth.js` @64 |
| `parent-portal.html` | `parent-portal` | `./js/website/offerings.js` @54 → `./js/core/escape-html.js` @55 → `./js/website/practice-grid.js` @56 → `./js/website/why-grid.js` @57 → `./js/features/timetable/store.js` @58 → `./js/features/students/store.js` @59 → `./app.js` @60 → `./supabase-config.js` @61 → `./js/shared-ui/action-dialog.js` @62 → `./js/features/timetable/controller.js` @63 → `./auth.js` @64 |
| `parent-reports.html` | `parent-reports` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./js/features/timetable/controller.js` @61 → `./auth.js` @62 |
| `parent-settings.html` | `parent-settings` | `./js/website/offerings.js` @198 → `./js/core/escape-html.js` @199 → `./js/website/practice-grid.js` @200 → `./js/website/why-grid.js` @201 → `./js/features/timetable/store.js` @202 → `./js/features/students/store.js` @203 → `./app.js` @204 → `./supabase-config.js` @205 → `./js/shared-ui/action-dialog.js` @206 → `./js/features/timetable/controller.js` @207 → `./auth.js` @208 |
| `parent-teachers.html` | `parent-teachers` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./js/features/timetable/controller.js` @61 → `./auth.js` @62 |
| `portal.html` | `portal` | `./js/website/offerings.js` @185 → `./js/core/escape-html.js` @186 → `./js/website/practice-grid.js` @187 → `./js/website/why-grid.js` @188 → `./js/features/timetable/store.js` @189 → `./js/features/students/store.js` @190 → `./app.js?v=20260611-student-messages` @191 → `./supabase-config.js` @192 → `./js/shared-ui/action-dialog.js` @193 → `./js/features/timetable/controller.js` @194 → `./auth.js?v=20260611-student-messages` @195 |
| `products.html` | `products` | `./js/website/offerings.js` @84 → `./js/core/escape-html.js` @85 → `./js/website/practice-grid.js` @86 → `./js/website/why-grid.js` @87 → `./js/features/timetable/store.js` @88 → `./js/features/students/store.js` @89 → `./app.js` @90 |
| `reset-password.html` | `reset-password` | `./js/website/offerings.js` @118 → `./js/core/escape-html.js` @119 → `./js/website/practice-grid.js` @120 → `./js/website/why-grid.js` @121 → `./js/features/timetable/store.js` @122 → `./js/features/students/store.js` @123 → `./app.js` @124 → `./supabase-config.js` @125 → `./js/shared-ui/action-dialog.js` @126 → `./js/features/timetable/controller.js` @127 → `./auth.js` @128 |
| `school-types.html` | `types` | `./js/website/offerings.js` @34 → `./js/core/escape-html.js` @35 → `./js/website/practice-grid.js` @36 → `./js/website/why-grid.js` @37 → `./js/features/timetable/store.js` @38 → `./js/features/students/store.js` @39 → `./app.js` @40 |
| `self-register.html` | `self-register` | `./js/website/offerings.js` @234 → `./js/core/escape-html.js` @235 → `./js/website/practice-grid.js` @236 → `./js/website/why-grid.js` @237 → `./js/features/timetable/store.js` @238 → `./js/features/students/store.js` @239 → `./app.js` @240 → `./supabase-config.js` @241 → `./js/shared-ui/action-dialog.js` @242 → `./js/features/timetable/controller.js` @243 → `./auth.js?v=self-registration-links` @244 |
| `signup.html` | `signup` | `./js/website/offerings.js` @218 → `./js/core/escape-html.js` @219 → `./js/website/practice-grid.js` @220 → `./js/website/why-grid.js` @221 → `./js/features/timetable/store.js` @222 → `./js/features/students/store.js` @223 → `./app.js` @224 → `./supabase-config.js` @225 → `./js/shared-ui/action-dialog.js` @226 → `./js/features/timetable/controller.js` @227 → `./auth.js` @228 |
| `staff-attendance.html` | `staff-attendance` | `./js/website/offerings.js` @45 → `./js/core/escape-html.js` @46 → `./js/website/practice-grid.js` @47 → `./js/website/why-grid.js` @48 → `./js/features/timetable/store.js` @49 → `./js/features/students/store.js` @50 → `./app.js` @51 → `./supabase-config.js` @52 → `./js/shared-ui/action-dialog.js` @53 → `./js/features/timetable/controller.js` @54 → `./auth.js` @55 |
| `staff-classes.html` | `staff-classes` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-dashboard.html` | `staff-dashboard` | `./js/website/offerings.js` @82 → `./js/core/escape-html.js` @83 → `./js/website/practice-grid.js` @84 → `./js/website/why-grid.js` @85 → `./js/features/timetable/store.js` @86 → `./js/features/students/store.js` @87 → `./app.js` @88 → `./supabase-config.js` @89 → `./js/shared-ui/action-dialog.js` @90 → `./js/features/timetable/controller.js` @91 → `./auth.js` @92 |
| `staff-gradebook.html` | `staff-gradebook` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-leave.html` | `staff-leave` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-lesson-plans.html` | `staff-lesson-plans` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-messages.html` | `staff-messages` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-results.html` | `staff-results` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./js/features/timetable/controller.js` @32 → `./auth.js` @33 |
| `staff-settings.html` | `staff-settings` | `./js/website/offerings.js` @143 → `./js/core/escape-html.js` @144 → `./js/website/practice-grid.js` @145 → `./js/website/why-grid.js` @146 → `./js/features/timetable/store.js` @147 → `./js/features/students/store.js` @148 → `./app.js` @149 → `./supabase-config.js` @150 → `./js/shared-ui/action-dialog.js` @151 → `./js/features/timetable/controller.js` @152 → `./auth.js` @153 |
| `staff-timetable.html` | `staff-timetable` | `./js/website/offerings.js` @53 → `./js/core/escape-html.js` @54 → `./js/website/practice-grid.js` @55 → `./js/website/why-grid.js` @56 → `./js/features/timetable/store.js` @57 → `./js/features/students/store.js` @58 → `./app.js` @59 → `./supabase-config.js` @60 → `./js/shared-ui/action-dialog.js` @61 → `./js/features/timetable/controller.js` @62 → `./auth.js` @63 |
| `super-admin-accounts.html` | `super-admin-accounts` | `./js/website/offerings.js` @128 → `./js/core/escape-html.js` @129 → `./js/website/practice-grid.js` @130 → `./js/website/why-grid.js` @131 → `./js/features/timetable/store.js` @132 → `./js/features/students/store.js` @133 → `./app.js?v=20260611-student-messages` @134 → `./supabase-config.js` @135 → `./js/shared-ui/action-dialog.js` @136 → `./js/features/timetable/controller.js` @137 → `./auth.js?v=20260611-student-messages` @138 |
| `super-admin-activity.html` | `super-admin-activity` | `./js/website/offerings.js` @102 → `./js/core/escape-html.js` @103 → `./js/website/practice-grid.js` @104 → `./js/website/why-grid.js` @105 → `./js/features/timetable/store.js` @106 → `./js/features/students/store.js` @107 → `./app.js?v=20260611-student-messages` @108 → `./supabase-config.js` @109 → `./js/shared-ui/action-dialog.js` @110 → `./js/features/timetable/controller.js` @111 → `./auth.js?v=20260611-student-messages` @112 |
| `super-admin-schools.html` | `super-admin-schools` | `./js/website/offerings.js` @102 → `./js/core/escape-html.js` @103 → `./js/website/practice-grid.js` @104 → `./js/website/why-grid.js` @105 → `./js/features/timetable/store.js` @106 → `./js/features/students/store.js` @107 → `./app.js?v=20260611-student-messages` @108 → `./supabase-config.js` @109 → `./js/shared-ui/action-dialog.js` @110 → `./js/features/timetable/controller.js` @111 → `./auth.js?v=20260611-student-messages` @112 |
| `super-admin.html` | `super-admin` | `./js/website/offerings.js` @105 → `./js/core/escape-html.js` @106 → `./js/website/practice-grid.js` @107 → `./js/website/why-grid.js` @108 → `./js/features/timetable/store.js` @109 → `./js/features/students/store.js` @110 → `./app.js?v=20260611-student-messages` @111 → `./supabase-config.js` @112 → `./js/shared-ui/action-dialog.js` @113 → `./js/features/timetable/controller.js` @114 → `./auth.js?v=20260611-student-messages` @115 |
| `user-settings.html` | `user-settings` | `./js/website/offerings.js` @143 → `./js/core/escape-html.js` @144 → `./js/website/practice-grid.js` @145 → `./js/website/why-grid.js` @146 → `./js/features/timetable/store.js` @147 → `./js/features/students/store.js` @148 → `./app.js` @149 → `./supabase-config.js` @150 → `./js/shared-ui/action-dialog.js` @151 → `./js/features/timetable/controller.js` @152 → `./auth.js` @153 |
| `why-it-works.html` | `why` | `./js/website/offerings.js` @41 → `./js/core/escape-html.js` @42 → `./js/website/practice-grid.js` @43 → `./js/website/why-grid.js` @44 → `./js/features/timetable/store.js` @45 → `./js/features/students/store.js` @46 → `./app.js` @47 |
| `workflows.html` | `workflows` | `./js/website/offerings.js` @33 → `./js/core/escape-html.js` @34 → `./js/website/practice-grid.js` @35 → `./js/website/why-grid.js` @36 → `./js/features/timetable/store.js` @37 → `./js/features/students/store.js` @38 → `./app.js` @39 |

## Public global interfaces

Classic top-level function declarations in app.js and extracted scripts are also potential window properties; top-level const/let bindings are global lexical bindings, not equivalent window properties. Explicit objects below are consumed by auth manager wrappers. Preserve method names, argument defaults, return shapes, eventName values and synchronous vs asynchronous behavior. Unknown members shown as AST types need their source body retained unchanged.

### window.SchoolSphereFeatureModules

`app.js:3170`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `modules` | `features` |
| `getState` | `getFeatureToggleState` |
| `getEnabledFeatures` | `getEnabledFeatures` |
| `setFeatureEnabled` | `setFeatureEnabled` |
| `summarize` | `summarizeFeatureToggleState` |
| `eventName` | `FEATURE_TOGGLE_EVENT` |

### window.SchoolSphereRolePermissions

`app.js:3179`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `roles` | `ROLE_PERMISSION_ROLES` |
| `permissions` | `ROLE_PERMISSION_OPTIONS` |
| `permissionsByRole` | `ROLE_PERMISSION_OPTIONS_BY_ROLE` |
| `defaults` | `DEFAULT_ROLE_PERMISSIONS` |
| `getOptions` | `getRolePermissionOptions` |
| `getPermissions` | `getRolePermissions` |
| `setPermission` | `setRolePermission` |
| `savePermissions` | `saveRolePermissions` |
| `resetPermissions` | `resetRolePermissions` |
| `summarize` | `summarizeRolePermissions` |
| `eventName` | `ROLE_PERMISSIONS_EVENT` |

### window.SchoolSphereSiteSettings

`app.js:3193`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_SCHOOL_SETTINGS` |
| `schoolTypeOptions` | `SCHOOL_TYPE_OPTIONS` |
| `getSettings` | `getSchoolSettings` |
| `getEnabledSchoolTypes` | `ArrowFunctionExpression` |
| `saveSettings` | `saveSchoolSettings` |
| `resetSettings` | `resetSchoolSettings` |
| `formatAcademicYearLabel` | `formatAcademicYearLabel` |
| `hasContext` | `hasSchoolSettingsContext` |
| `eventName` | `SCHOOL_SETTINGS_EVENT` |

### window.SchoolSphereAcademicCycles

`app.js:3205`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_ACADEMIC_CYCLES` |
| `getState` | `getAcademicCycles` |
| `summarize` | `summarizeAcademicCycles` |
| `saveState` | `saveAcademicCycles` |
| `upsertSession` | `upsertAcademicSession` |
| `setSessionStatus` | `setAcademicSessionStatus` |
| `upsertTerm` | `upsertAcademicTerm` |
| `setTermStatus` | `setAcademicTermStatus` |
| `eventName` | `SCHOOL_ACADEMIC_CYCLES_EVENT` |

### window.SchoolSphereAcademicCalendar

`app.js:3217`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_ACADEMIC_CALENDAR_EVENTS` |
| `types` | `ArrayExpression` |
| `getEvents` | `getAcademicCalendarEvents` |
| `summarize` | `summarizeAcademicCalendarEvents` |
| `saveEvents` | `saveAcademicCalendarEvents` |
| `upsertEvent` | `upsertAcademicCalendarEvent` |
| `archiveEvent` | `ArrowFunctionExpression` |
| `activateEvent` | `ArrowFunctionExpression` |
| `findConflicts` | `findAcademicCalendarConflicts` |
| `getUpcomingEvents` | `getUpcomingAcademicCalendarEvents` |
| `eventName` | `SCHOOL_ACADEMIC_CALENDAR_EVENT` |

### window.SchoolSphereAdmissionConfig

`app.js:3231`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_ADMISSION_CONFIGURATION` |
| `getState` | `getAdmissionConfiguration` |
| `summarize` | `summarizeAdmissionConfiguration` |
| `saveState` | `saveAdmissionConfiguration` |
| `upsertSession` | `upsertAdmissionConfigSession` |
| `setSessionStatus` | `setAdmissionConfigSessionStatus` |
| `upsertClassOption` | `upsertAdmissionConfigClass` |
| `setClassOptionStatus` | `setAdmissionConfigClassStatus` |
| `upsertStage` | `upsertAdmissionConfigStage` |
| `setStageStatus` | `setAdmissionConfigStageStatus` |
| `eventName` | `SCHOOL_ADMISSION_CONFIG_EVENT` |

### window.SchoolSphereTimetable

`app.js:3245`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_TIMETABLE_ENTRIES` |
| `days` | `TIMETABLE_DAYS` |
| `schoolDays` | `TIMETABLE_SCHOOL_DAYS` |
| `weekTypes` | `TIMETABLE_WEEK_TYPES` |
| `getEntries` | `getSchoolTimetableEntries` |
| `getPeriods` | `getSchoolTimetablePeriods` |
| `savePeriods` | `saveSchoolTimetablePeriods` |
| `upsertPeriod` | `upsertSchoolTimetablePeriod` |
| `getRooms` | `getSchoolTimetableRooms` |
| `saveRooms` | `saveSchoolTimetableRooms` |
| `upsertRoom` | `upsertSchoolTimetableRoom` |
| `getSubstitutions` | `getSchoolTimetableSubstitutions` |
| `logSubstitution` | `logSchoolTimetableSubstitution` |
| `summarize` | `summarizeSchoolTimetableEntries` |
| `saveEntries` | `saveSchoolTimetableEntries` |
| `upsertEntry` | `upsertSchoolTimetableEntry` |
| `checkConflicts` | `checkSchoolTimetableConflicts` |
| `getTeacherLoad` | `getTeacherTimetableLoad` |
| `copyTerm` | `copyTimetableTerm` |
| `archiveEntry` | `ArrowFunctionExpression` |
| `activateEntry` | `ArrowFunctionExpression` |
| `publishGroup` | `ArrowFunctionExpression` |
| `unpublishGroup` | `ArrowFunctionExpression` |
| `eventName` | `SCHOOL_TIMETABLE_EVENT` |

### window.SchoolSphereFeeItems

`app.js:3272`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_FEE_ITEMS` |
| `getItems` | `getSchoolFeeItems` |
| `summarize` | `summarizeSchoolFeeItems` |
| `saveItems` | `saveSchoolFeeItems` |
| `upsertItem` | `upsertSchoolFeeItem` |
| `archiveItem` | `ArrowFunctionExpression` |
| `activateItem` | `ArrowFunctionExpression` |
| `eventName` | `SCHOOL_FEE_ITEMS_EVENT` |

### window.SchoolSphereClasses

`app.js:3283`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_CLASS_RECORDS` |
| `getClasses` | `getSchoolClasses` |
| `summarize` | `summarizeSchoolClasses` |
| `saveClasses` | `saveSchoolClasses` |
| `upsertClass` | `upsertSchoolClass` |
| `archiveClass` | `ArrowFunctionExpression` |
| `activateClass` | `ArrowFunctionExpression` |
| `deleteClass` | `deleteSchoolClass` |
| `eventName` | `SCHOOL_CLASSES_EVENT` |

### window.SchoolSphereCourses

`app.js:3295`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_COURSE_RECORDS` |
| `getCourses` | `getSchoolCourses` |
| `summarize` | `summarizeSchoolCourses` |
| `saveCourses` | `saveSchoolCourses` |
| `upsertCourse` | `upsertSchoolCourse` |
| `archiveCourse` | `ArrowFunctionExpression` |
| `activateCourse` | `ArrowFunctionExpression` |
| `deleteCourse` | `deleteSchoolCourse` |
| `getActiveCatalog` | `getActiveCourseCatalog` |
| `eventName` | `SCHOOL_COURSES_EVENT` |

### window.SchoolSphereLessonPlans

`app.js:3308`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_LESSON_PLAN_RECORDS` |
| `getPlans` | `getLessonPlans` |
| `summarize` | `summarizeLessonPlans` |
| `savePlans` | `saveLessonPlans` |
| `upsertPlan` | `upsertLessonPlan` |
| `duplicatePlan` | `duplicateLessonPlan` |
| `deletePlan` | `deleteLessonPlan` |
| `eventName` | `SCHOOL_LESSON_PLANS_EVENT` |

### window.SchoolSphereLeaveRequests

`app.js:3319`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_LEAVE_REQUEST_RECORDS` |
| `getRequests` | `getLeaveRequests` |
| `summarize` | `summarizeLeaveRequests` |
| `saveRequests` | `saveLeaveRequests` |
| `upsertRequest` | `upsertLeaveRequest` |
| `setStatus` | `setLeaveRequestStatus` |
| `calculateDays` | `calculateLeaveDays` |
| `eventName` | `SCHOOL_LEAVE_REQUESTS_EVENT` |

### window.SchoolSphereStudents

`app.js:3330`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_STUDENT_RECORDS` |
| `getStudents` | `getSchoolStudents` |
| `summarize` | `summarizeSchoolStudents` |
| `saveStudents` | `saveSchoolStudents` |
| `upsertStudent` | `upsertSchoolStudent` |
| `updateStudentProgression` | `updateSchoolStudentProgression` |
| `transferStudentOut` | `setSchoolStudentTransferred` |
| `archiveStudent` | `ArrowFunctionExpression` |
| `activateStudent` | `ArrowFunctionExpression` |
| `deleteStudent` | `deleteSchoolStudent` |
| `deleteStudentsByLevel` | `deleteSchoolStudentsByLevel` |
| `eventName` | `SCHOOL_STUDENTS_EVENT` |

### window.SchoolSphereAttendance

`app.js:3345`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_ATTENDANCE_RECORDS` |
| `getRecords` | `getAttendanceRecords` |
| `summarize` | `summarizeAttendanceRecords` |
| `saveRecords` | `saveAttendanceRecords` |
| `upsertRecord` | `upsertAttendanceRecord` |
| `getRecordForClassDate` | `getAttendanceRecordForClassDate` |
| `eventName` | `SCHOOL_ATTENDANCE_EVENT` |

### window.SchoolSphereReportCards

`app.js:3355`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_REPORT_CARD_RECORDS` |
| `getRecords` | `getReportCardRecords` |
| `summarizeSubjects` | `summarizeReportCardSubjects` |
| `saveRecords` | `saveReportCardRecords` |
| `upsertRecord` | `upsertReportCardRecord` |
| `setReleased` | `setReportCardReleased` |
| `getForStudentPeriod` | `getReportCardForStudentPeriod` |
| `eventName` | `SCHOOL_REPORT_CARDS_EVENT` |

### window.SchoolSphereReportConfiguration

`app.js:3366`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_REPORT_CONFIGURATION` |
| `getConfiguration` | `getReportConfiguration` |
| `saveConfiguration` | `saveReportConfiguration` |
| `gradeScore` | `getReportCardGrade` |
| `eventName` | `SCHOOL_REPORT_CONFIGURATION_EVENT` |

### window.SchoolSphereGradebook

`app.js:3374`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_GRADEBOOK_RECORDS` |
| `getRecords` | `getGradebookRecords` |
| `saveRecords` | `saveGradebookRecords` |
| `upsertRecord` | `upsertGradebookRecord` |
| `getForContext` | `getGradebookRecordForContext` |
| `getStudentTotal` | `getGradebookStudentTotal` |
| `eventName` | `SCHOOL_GRADEBOOK_EVENT` |

### window.SchoolSphereAuditTrail

`app.js:3384`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `getEntries` | `getAuditTrailEntries` |
| `saveEntries` | `saveAuditTrailEntries` |
| `record` | `recordAuditTrailEntry` |
| `clear` | `clearAuditTrailEntries` |
| `eventName` | `AUDIT_TRAIL_EVENT` |

### window.SchoolSphereSupabaseConfig

`supabase-config.js:3`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `enableSupabaseAuth` | `BooleanLiteral` |
| `url` | `StringLiteral` |
| `anonKey` | `StringLiteral` |
| `siteUrl` | `schoolSphereAppBaseUrl` |
| `redirectPath` | `StringLiteral` |
| `emailRedirectPath` | `StringLiteral` |
| `userProvisionFunctionName` | `StringLiteral` |
| `admissionsSubmitFunctionName` | `StringLiteral` |
| `selfRegistrationFunctionName` | `StringLiteral` |
| `accountDeleteFunctionName` | `StringLiteral` |
| `paystackPublicKey` | `StringLiteral` |

### window.SchoolSphereActionDialogs (E08)

Factory only: createController({ document, window, HTMLElement }) returns { openAppActionDialog, showAppConfirm, showAppPrompt }. Published at js/shared-ui/action-dialog.js:201. The sole app instance is created privately at auth.js:6312–6320. There is no globally exposed controller, resolver, state or close/ensure method. See the E08 boundary below for lazy DOM and Promise contracts.

### window.SchoolSphereTimetableUI (E09)

Factory only: createController(dependencies) returns { initTimetableControls }. Published at js/features/timetable/controller.js:1487. A single private auth bridge at auth.js:13697–13731 injects document/window/HTMLElement/HTMLSelectElement and the 29 functions listed in the controller inventory. No controller state or nested methods are exposed.

## Storage and school isolation

- app.js:303–365 normalizes workspace identifiers (trim/lowercase, unsupported characters become hyphens), gives transient session precedence over persistent session, prefers session.workspaceId, and otherwise falls back to userId/email (including its explicit administrator fallback). resolveWorkspaceStorageKey builds baseKey::workspaceId. readWorkspaceState does not read legacy shared values unless allowLegacyFallback is true.
- auth.js:1280 onward also gives transient session precedence. getCurrentWorkspaceId and parent/student discovery/alignment operate over account and guardian links; do not replace them with an apparently similar helper without comparing precedence and fallbacks.
- self-registration-links.js:39–41 uses workspaceId, then email, then userId, then public. This differs from app.js.
- Regular feature collections use double-colon suffixes. Notifications, admissions and parent fees use single-colon suffixes.
- Notification preferences use prefix:workspaceId:role:identity. Other key builders (drafts, selected child, onboarding and toast state) include their existing form/user/role context; their expressions are indexed below.
- Access grants use one shared local array with workspaceId on records. Hydrating one workspace preserves records from other workspaces (auth.js:4958). Global users/mail/recovery are not the same as school-scoped feature arrays.
- Remote state names and local names are not interchangeable: schoolsphere.parentFees.v1 maps to schoolsphere.parent.fees.v1:<workspace>; schoolsphere.accessGrants.v1 maps to schoolsphere.access.grants.v1. auth.js:4936 is the mapping authority.
- Supabase auth storage uses its own key and an adapter that removes the alternative session/local copy before writing to the selected persistence store. Keep one client promise.
- clearLegacySharedState and the student-messages permission migration are existing migrations, not normalizers to run on every module import.

### Exact storage/event string vocabulary

Names only; no stored values. Colons/hyphens/case are significant. Some event names deliberately reuse storage names, notably the users update event.

| Literal name | Source occurrences |
| --- | --- |
| `schoolsphere.academicCalendar.v1` | `app.js:139`, `auth.js:535`, `auth.js:567` |
| `schoolsphere.academicCycles.v1` | `app.js:136`, `auth.js:534`, `auth.js:565` |
| `schoolsphere.access.grants.v1` | `auth.js:17` |
| `schoolsphere.access.guard.notice.v1` | `auth.js:18` |
| `schoolsphere.accessGrants.v1` | `auth.js:575`, `auth.js:3646` |
| `schoolsphere.admin.sidebar.collapsed.v1` | `auth.js:11` |
| `schoolsphere.admissionConfig.v1` | `app.js:151`, `auth.js:536`, `auth.js:566` |
| `schoolsphere.admissions.v1` | `auth.js:72`, `auth.js:572`, `auth.js:3614` |
| `schoolsphere.announcement-toast.v1` | `auth.js:23` |
| `schoolsphere.attendance.v1` | `app.js:172`, `auth.js:545`, `auth.js:560` |
| `schoolsphere.auditTrail.v1` | `app.js:215`, `auth.js:551` |
| `schoolsphere.auth.password-recovery.v1` | `auth.js:16` |
| `schoolsphere.auth.pending.role.v1` | `auth.js:15` |
| `schoolsphere.auth.persistence.local.v1` | `auth.js:13` |
| `schoolsphere.auth.persistence.session.v1` | `auth.js:14` |
| `schoolsphere.classes.v1` | `app.js:163`, `auth.js:542`, `auth.js:557` |
| `schoolsphere.courses.v1` | `app.js:166`, `auth.js:543`, `auth.js:558` |
| `schoolsphere.featureModules.v1` | `app.js:110`, `auth.js:549`, `auth.js:553` |
| `schoolsphere.feeItems.v1` | `app.js:160`, `auth.js:541`, `auth.js:564` |
| `schoolsphere.form-draft.v1` | `auth.js:24` |
| `schoolsphere.gradebook.v1` | `app.js:180`, `auth.js:548`, `auth.js:563` |
| `schoolsphere.leaveRequests.v1` | `app.js:186` |
| `schoolsphere.lessonPlans.v1` | `app.js:183` |
| `schoolsphere.mail.v1` | `auth.js:4` |
| `schoolsphere.notification-preferences.v1` | `auth.js:22` |
| `schoolsphere.notifications.v1` | `auth.js:20`, `auth.js:573`, `auth.js:3601`, `admin-messages.html:inline@593:27` |
| `schoolsphere.parent.fees.v1` | `auth.js:32` |
| `schoolsphere.parent.selected-child.v1` | `auth.js:31` |
| `schoolsphere.parentFees.v1` | `auth.js:574`, `auth.js:3627` |
| `schoolsphere.passwordRecovery.v1` | `auth.js:5` |
| `schoolsphere.portalOnboarding.v1` | `auth.js:576` |
| `schoolsphere.reportCards.v1` | `app.js:175`, `auth.js:546`, `auth.js:561` |
| `schoolsphere.reportConfiguration.v1` | `app.js:177`, `auth.js:547`, `auth.js:562` |
| `schoolsphere.rolePermissions.studentMessagesDefault.v1` | `app.js:221` |
| `schoolsphere.rolePermissions.v1` | `app.js:218`, `auth.js:550`, `auth.js:554` |
| `schoolsphere.schoolSettings.v1` | `app.js:130`, `auth.js:533`, `auth.js:556` |
| `schoolsphere.session.persistent.v1` | `app.js:299`, `auth.js:6`, `self-registration-links.js:4` |
| `schoolsphere.session.transient.v1` | `app.js:300`, `auth.js:7`, `self-registration-links.js:3` |
| `schoolsphere.students.v1` | `app.js:169`, `auth.js:26`, `auth.js:544`, `auth.js:559` |
| `schoolsphere.supabase.auth.v1` | `auth.js:10` |
| `schoolsphere.theme.v1` | `app.js:4`, `auth.js:12` |
| `schoolsphere.timetable.periods.v1` | `app.js:156`, `auth.js:538`, `auth.js:569` |
| `schoolsphere.timetable.rooms.v1` | `app.js:157`, `auth.js:539`, `auth.js:570` |
| `schoolsphere.timetable.substitutions.v1` | `app.js:158`, `auth.js:540`, `auth.js:571` |
| `schoolsphere.timetable.v1` | `app.js:154`, `auth.js:537`, `auth.js:568` |
| `schoolsphere.users.v1` | `auth.js:3` |
| `schoolsphere:academic-calendar-updated` | `app.js:140` |
| `schoolsphere:academic-cycles-updated` | `app.js:137` |
| `schoolsphere:access-grants:updated` | `auth.js:19` |
| `schoolsphere:admission-config-updated` | `app.js:152` |
| `schoolsphere:admissions:updated` | `auth.js:73` |
| `schoolsphere:attendance-updated` | `app.js:173` |
| `schoolsphere:audit-trail-updated` | `app.js:216` |
| `schoolsphere:classes-updated` | `app.js:164` |
| `schoolsphere:courses-updated` | `app.js:167` |
| `schoolsphere:feature-modules-updated` | `app.js:111` |
| `schoolsphere:fee-items-updated` | `app.js:161` |
| `schoolsphere:gradebook-updated` | `app.js:181` |
| `schoolsphere:leave-requests-updated` | `app.js:187` |
| `schoolsphere:lesson-plans-updated` | `app.js:184` |
| `schoolsphere:notifications:updated` | `auth.js:21`, `admin-messages.html:inline@593:416`, `admin-messages.html:inline@593:530` |
| `schoolsphere:parent-fees:updated` | `auth.js:33` |
| `schoolsphere:report-cards-updated` | `app.js:176` |
| `schoolsphere:report-configuration-updated` | `app.js:178` |
| `schoolsphere:role-permissions-updated` | `app.js:219` |
| `schoolsphere:school-settings-updated` | `app.js:131` |
| `schoolsphere:students-updated` | `app.js:170` |
| `schoolsphere:timetable-updated` | `app.js:155` |

### Key and workspace resolution owners

| Owner | Location | Outer dependencies |
| --- | --- | --- |
| `normalizeWorkspaceStorageId` | `app.js:303-311` |  |
| `getWorkspaceSessionSnapshot` | `app.js:313-318` | `AUTH_SESSION_STORAGE_KEYS`, `parseStoredJSON` |
| `getActiveWorkspaceStorageId` | `app.js:320-338` | `getWorkspaceSessionSnapshot`, `normalizeWorkspaceStorageId` |
| `resolveWorkspaceStorageKey` | `app.js:340-342` | `getActiveWorkspaceStorageId` |
| `getFormDraftStorageKey` | `auth.js:791-793` | `FORM_DRAFT_STORAGE_PREFIX` |
| `normalizeWorkspaceId` | `auth.js:1341-1348` |  |
| `deriveWorkspaceIdFromRecord` | `auth.js:1350-1369` | `DEFAULT_AUTH_ROLE`, `SUPER_ADMIN_ROLE`, `SUPER_ADMIN_WORKSPACE_ID`, `normalizeEmail`, `normalizeRoleLabel`, `normalizeWorkspaceId` |
| `getCurrentWorkspaceId` | `auth.js:1536-1550` | `getSession`, `getUsers`, `normalizeWorkspaceId` |
| `parseWorkspaceIdFromScopedStorageKey` | `auth.js:1552-1561` | `normalizeWorkspaceId` |
| `getNotificationStorageKey` | `auth.js:1784-1786` | `NOTIFICATION_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getNotificationPreferencesStorageKey` | `auth.js:1817-1826` | `DEFAULT_AUTH_ROLE`, `NOTIFICATION_PREFERENCES_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `getSession`, `normalizeEmail`, `normalizeRoleLabel`, `normalizeWorkspaceId` |
| `getAdmissionsStorageKey` | `auth.js:2829-2831` | `ADMISSIONS_STORAGE_KEY_BASE`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `inferAccessGrantWorkspaceId` | `auth.js:3204-3224` | `DEFAULT_AUTH_ROLE`, `getUsers`, `normalizeEmail`, `normalizeRoleLabel`, `normalizeWorkspaceId` |
| `buildWorkspaceScopedStateKey` | `auth.js:3558-3560` | `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getWorkspaceStateStorageKeyForState` | `auth.js:4936-4956` | `ACCESS_GRANTS_STORAGE_KEY`, `ADMISSIONS_STORAGE_KEY_BASE`, `NOTIFICATION_STORAGE_PREFIX`, `PARENT_FEES_STORAGE_PREFIX`, `SUPABASE_STATE_KEY_ACCESS_GRANTS`, `SUPABASE_STATE_KEY_ADMISSIONS`, `SUPABASE_STATE_KEY_NOTIFICATIONS`, `SUPABASE_STATE_KEY_PARENT_FEES`, `buildWorkspaceScopedStateKey`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getPortalOnboardingStorageKey` | `auth.js:31691-31697` | `DEFAULT_AUTH_ROLE`, `PORTAL_ONBOARDING_STORAGE_KEY`, `getCurrentWorkspaceId`, `getPortalOnboardingRoleKey`, `normalizeWorkspaceId` |
| `getParentSelectionStorageKey` | `auth.js:37923-37928` | `PARENT_SELECTION_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `getSession`, `normalizeWorkspaceId` |
| `getParentFeesStorageKey` | `auth.js:37946-37948` | `PARENT_FEES_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getSuperAdminKnownWorkspaceIds` | `auth.js:40317-40345` | `ADMISSIONS_STORAGE_KEY_BASE`, `NOTIFICATION_STORAGE_PREFIX`, `WORKSPACE_SCOPED_STATE_KEYS`, `getUsers`, `normalizeWorkspaceId` |
| `normalizeWorkspaceId` | `self-registration-links.js:15-22` |  |
| `getSessionSnapshot` | `self-registration-links.js:24-30` | `SESSION_KEYS`, `parseJson` |
| `getWorkspaceId` | `self-registration-links.js:32-35` | `getSessionSnapshot`, `normalizeWorkspaceId` |

## Custom events and payloads

Local data mutations generally write storage then emit an event. Native storage events are for other documents; custom events notify the current page. Hydration uses the same event name with a different detail shape: {workspaceId, source: "supabase-hydration"}, not the local collection payload. Preserve both variants and consumers that re-read managers.

| Dispatch location | Owner | Event expression | detail shape/expression |
| --- | --- | --- | --- |
| `app.js:712` | `emitSchoolSettingsUpdate` | `SCHOOL_SETTINGS_EVENT` | `{ settings }` |
| `app.js:799` | `emitAcademicCyclesUpdate` | `SCHOOL_ACADEMIC_CYCLES_EVENT` | `{ state }` |
| `app.js:1080` | `emitAcademicCalendarUpdate` | `SCHOOL_ACADEMIC_CALENDAR_EVENT` | `{ events }` |
| `app.js:1288` | `emitAdmissionConfigurationUpdate` | `SCHOOL_ADMISSION_CONFIG_EVENT` | `{ state }` |
| `js/features/timetable/store.js:273` | `emitSchoolTimetableUpdate` | `SCHOOL_TIMETABLE_EVENT` | `{ entries }` |
| `app.js:1555` | `emitSchoolFeeItemsUpdate` | `SCHOOL_FEE_ITEMS_EVENT` | `{ items }` |
| `app.js:1692` | `emitSchoolClassesUpdate` | `SCHOOL_CLASSES_EVENT` | `{ classes }` |
| `app.js:1883` | `emitSchoolCoursesUpdate` | `SCHOOL_COURSES_EVENT` | `{ courses }` |
| `app.js:2109` | `emitLessonPlansUpdate` | `SCHOOL_LESSON_PLANS_EVENT` | `{ records }` |
| `app.js:2281` | `emitLeaveRequestsUpdate` | `SCHOOL_LEAVE_REQUESTS_EVENT` | `{ records }` |
| `js/features/students/store.js:141` | `emitSchoolStudentsUpdate` | `SCHOOL_STUDENTS_EVENT` | `{ students }` |
| `app.js:2473` | `emitAttendanceUpdate` | `SCHOOL_ATTENDANCE_EVENT` | `{ records }` |
| `app.js:2698` | `saveGradebookRecords` | `SCHOOL_GRADEBOOK_EVENT` | `{ records: normalized }` |
| `app.js:2764` | `saveReportConfiguration` | `SCHOOL_REPORT_CONFIGURATION_EVENT` | `{ configuration: normalized }` |
| `app.js:2868` | `emitReportCardsUpdate` | `SCHOOL_REPORT_CARDS_EVENT` | `{ records }` |
| `app.js:2977` | `emitAuditTrailUpdate` | `AUDIT_TRAIL_EVENT` | `{ entries }` |
| `app.js:3024` | `emitFeatureToggleUpdate` | `FEATURE_TOGGLE_EVENT` | `{ state }` |
| `app.js:3117` | `emitRolePermissionsUpdate` | `ROLE_PERMISSIONS_EVENT` | `{ rolePermissions }` |
| `app.js:3443` | `startup/inline` | `SCHOOL_REPORT_CONFIGURATION_EVENT` | `{ configuration: getReportConfiguration() }` |
| `app.js:3451` | `startup/inline` | `SCHOOL_GRADEBOOK_EVENT` | `{ records: getGradebookRecords() }` |
| `auth.js:1246` | `saveUsers` | `STORAGE_KEYS.users` | `{ users: normalizedUsers }` |
| `auth.js:2143` | `pushNotification` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:2264` | `updateNotificationsForViewer` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:2801` | `markNotificationsRead` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:3115` | `saveAdmissions` | `ADMISSIONS_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId }` |
| `auth.js:3291` | `saveAccessGrants` | `ACCESS_GRANTS_EVENT_NAME` | `{ workspaceId: targetWorkspaceId &#124;&#124; normalizeWorkspaceId(getCurrentWorkspaceId()), allWorkspaces: Boolean(options.allWorkspaces), }` |
| `auth.js:3308` | `saveAccessGrants` | `ACCESS_GRANTS_EVENT_NAME` | `{ workspaceId: targetWorkspaceId, allWorkspaces: false, }` |
| `auth.js:5024` | `emitHydratedWorkspaceStateEvent` | `eventName` | `{ workspaceId: normalizedWorkspaceId, source: "supabase-hydration", }` |
| `auth.js:23372` | `syncAttendanceAbsenceNotifications` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId }` |
| `auth.js:37961` | `saveParentFeesState` | `PARENT_FEES_EVENT_NAME` | `{ workspaceId: resolvedWorkspaceId, }` |
| `auth.js:45026` | `initUserSettingsPage` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizeWorkspaceId(activeUser.workspaceId &#124;&#124; session.workspaceId &#124;&#124; getCurrentWorkspaceId()), }` |
| `admin-messages.html:inline@593:416` | `startup/inline` | `"schoolsphere:notifications:updated"` | `{ workspaceId: replyEntry.workspaceId }` |

All listener/timer owners are enumerated in inventory.md. Inline admin-messages dispatch is dormant.

## DOM and routing contracts

Preserve DOM IDs, classes used by styles, data-* action attributes, form field names, generated markup, accessibility attributes and delegated event targets. A selector may reference dynamically rendered content rather than an initial HTML node. The catalogs below are static coverage, not proof a target exists at runtime. Never rename selectors on the basis of a missing initial HTML match.

### HTML IDs by page

| Page | Declared IDs |
| --- | --- |
| `admin-admissions.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-admission-apply-link`, `portal-admission-link-value`, `portal-admission-copy-link`, `portal-admission-open-link`, `portal-admission-qr-image`, `portal-admission-summary`, `portal-admission-form-overlay`, `portal-admission-form-title`, `portal-admission-form`, `portal-admission-status`, `admission-full-name`, `admission-email`, `admission-phone`, `admission-level`, `admission-date-of-birth`, `admission-passport-photo`, `admission-guardian-name`, `admission-guardian-email`, `admission-guardian-phone`, `admission-doc-previous-report`, `admission-doc-birth-certificate`, `admission-doc-previous-school-result`, `admission-doc-transfer-certificate`, `admission-doc-other`, `admission-notes`, `portal-admission-submit-button`, `portal-admission-cancel-edit`, `portal-admission-list`, `portal-admission-history`, `portal-admission-config-summary`, `portal-admission-setup-form`, `portal-admission-setup-status`, `admission-setup-session-name`, `admission-setup-session-status`, `portal-admission-class-picker`, `admission-setup-stages`, `portal-admission-setup-preview` |
| `admin-attendance.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-attendance-summary`, `attendance-review-view`, `attendance-review-date`, `attendance-review-term`, `attendance-review-class`, `attendance-review-student`, `attendance-review-status`, `attendance-review-search`, `portal-attendance-status`, `portal-attendance-review-list`, `portal-attendance-submission-list` |
| `admin-classes.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-class-summary`, `class-template-title`, `class-template-type`, `class-template-arm`, `class-template-custom-arm`, `class-template-stream`, `class-template-custom-stream`, `class-template-faculty`, `class-template-custom-faculty`, `class-template-department`, `class-template-custom-department`, `class-template-capacity`, `portal-class-status`, `portal-class-form`, `class-name`, `class-level`, `class-capacity`, `class-teacher`, `class-subjects`, `teacher-assignments`, `class-arms`, `portal-class-list` |
| `admin-courses.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-course-summary`, `course-library-title`, `portal-course-form`, `portal-course-status`, `course-name`, `course-template-type`, `course-session-id`, `course-term-id`, `course-category`, `course-faculty`, `course-department`, `course-custom-department`, `course-level`, `course-class-arm`, `course-subject-select`, `course-custom-subject`, `course-teacher-assignments`, `course-code`, `course-credit-unit`, `course-description`, `portal-course-list` |
| `admin-feature-modules.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-feature-toggle-status`, `portal-feature-toggle-summary`, `portal-feature-toggle-grid` |
| `admin-fees.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-fee-summary`, `portal-fee-category-options`, `portal-fee-setup-notice`, `portal-fee-list`, `portal-fee-form-overlay`, `portal-fee-form-modal-title`, `portal-fee-form`, `portal-fee-status`, `fee-item-category`, `fee-item-class`, `fee-item-name`, `fee-item-amount`, `fee-item-session`, `fee-item-term`, `fee-item-due-date`, `fee-item-description`, `portal-fee-invoice-title`, `portal-fee-invoice-status`, `portal-fee-invoice-list`, `portal-fee-invoice-form-overlay`, `portal-fee-invoice-form-title`, `fee-invoice-session`, `fee-invoice-term`, `fee-invoice-class`, `fee-invoice-student`, `fee-invoice-due-date`, `fee-invoice-whatsapp`, `portal-fee-invoice-overlay`, `portal-fee-invoice-modal-title`, `portal-fee-invoice-modal-body` |
| `admin-messages.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-report-title`, `admin-report-parent-messages`, `admin-announcement-form`, `admin-announcement-status`, `admin-announcement-scope`, `admin-announcement-title`, `admin-announcement-message`, `admin-announcement-alert-type`, `admin-announcement-whatsapp`, `admin-announcement-class-options`, `admin-announcement-feed-title`, `admin-announcement-list`, `ss-chat-scroll`, `ss-reply-input`, `ss-send-btn`, `ss-search`, `ss-inbox-list`, `ss-chat-pane` |
| `admin-reports.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-report-title`, `admin-report-kpis`, `admin-report-enrollment-session`, `admin-report-enrollment-class`, `admin-report-enrollment-gender`, `admin-report-enrollment`, `admin-report-performance-session`, `admin-report-performance-class`, `admin-report-performance-subject`, `admin-report-performance`, `admin-report-insights`, `admin-report-health`, `admin-report-areas`, `admin-report-checklist` |
| `admin-schedule.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-calendar-summary`, `portal-academic-calendar-form`, `portal-academic-calendar-status`, `calendar-title`, `calendar-type`, `calendar-start-date`, `calendar-end-date`, `calendar-notes`, `portal-academic-calendar-list`, `portal-calendar-substitution-log`, `portal-timetable-summary`, `timetable-session-id`, `timetable-term-id`, `timetable-view-mode`, `timetable-class-level`, `timetable-teacher-view`, `timetable-week-type`, `portal-timetable-status`, `portal-timetable-list`, `portal-timetable-lesson-overlay`, `timetable-form-title`, `timetable-form-context`, `portal-timetable-form`, `timetable-subject`, `timetable-custom-subject`, `timetable-teacher`, `portal-timetable-period-overlay`, `timetable-period-title`, `portal-timetable-period-form`, `timetable-period-name`, `timetable-period-start`, `timetable-period-end` |
| `admin-settings-academic.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-academic-cycle-summary`, `portal-session-form`, `portal-session-status`, `session-name`, `session-start-date`, `session-end-date`, `session-status-select`, `portal-session-list`, `portal-term-form`, `portal-term-status`, `term-session-id`, `term-period-type`, `term-name`, `term-start-date`, `term-end-date`, `term-status-select`, `portal-term-list` |
| `admin-settings-access.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-access-summary`, `portal-access-form`, `portal-access-status`, `access-username`, `access-email`, `access-role`, `access-method`, `access-status-select`, `portal-access-list` |
| `admin-settings-grading.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-report-configuration-form`, `portal-report-configuration-status`, `report-ca-maximum`, `report-exam-maximum`, `portal-grading-scale-list`, `report-template-title`, `portal-report-school-comment-form`, `portal-report-school-comment-status`, `report-school-comment-class`, `report-school-comment-student`, `report-school-comment-session`, `report-school-comment-term`, `portal-report-school-comment-summary`, `report-school-comment-text` |
| `admin-settings-roles.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-role-permission-status`, `portal-role-permission-summary`, `portal-role-permission-grid` |
| `admin-settings-school.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-school-settings-preview`, `portal-school-settings-form`, `portal-school-settings-status`, `school-name`, `school-logo-url`, `school-logo-file`, `school-profile`, `school-address`, `school-phone`, `school-website`, `campus-details`, `school-type-all`, `school-type-nursery`, `school-type-primary`, `school-type-secondary`, `school-type-higher`, `higher-institution-type`, `academic-year-start`, `academic-year-end`, `portal-account-delete-status` |
| `admin-settings.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading` |
| `admin-students.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-student-summary`, `student-self-registration-title`, `student-self-registration-link`, `student-self-registration-status`, `portal-student-search`, `portal-student-class-filters`, `portal-student-list`, `portal-student-create-overlay`, `portal-student-create-title`, `portal-student-form`, `portal-student-status`, `student-first-name`, `student-last-name`, `student-admission-no`, `student-email`, `student-profile-photo`, `student-level`, `student-class-arm`, `student-dob`, `student-gender`, `student-promotion-decision`, `portal-guardian-list`, `portal-student-import-overlay`, `portal-student-import-title`, `portal-student-import-panel`, `portal-student-import-status`, `portal-student-import-file`, `portal-student-import-preview`, `portal-student-view-overlay`, `portal-student-view-title`, `portal-student-view-content`, `portal-student-docs-overlay`, `portal-student-docs-title`, `portal-student-docs-status`, `portal-student-docs-student-id`, `portal-student-docs-student-name`, `portal-student-doc-type`, `portal-student-doc-file`, `portal-student-doc-list` |
| `admin-teachers.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `portal-staff-summary`, `staff-self-registration-title`, `staff-self-registration-link`, `staff-self-registration-status`, `portal-staff-form-overlay`, `portal-staff-form-title`, `portal-staff-form`, `portal-staff-status`, `staff-name`, `staff-prefix`, `staff-first-name`, `staff-last-name`, `staff-email`, `staff-phone`, `staff-profile-photo`, `staff-school-type`, `staff-faculty`, `staff-custom-faculty`, `staff-department`, `staff-custom-department`, `staff-subject-course`, `staff-title`, `portal-staff-filter-search`, `portal-staff-filter-status`, `portal-staff-list`, `portal-staff-leave-status-filter`, `portal-staff-leave-review-status`, `portal-staff-leave-summary`, `portal-staff-leave-list` |
| `admissions-apply.html` | `admissions-apply-brand-mark`, `admissions-apply-school-name`, `admissions-apply-copy`, `admissions-apply-form`, `admissions-apply-status`, `admissions-step-indicator`, `admissions-workspace-id`, `apply-first-name`, `apply-middle-name`, `apply-last-name`, `apply-gender`, `apply-date-of-birth`, `apply-student-email`, `apply-passport-photo`, `apply-guardian-full-name`, `apply-guardian-relationship`, `apply-guardian-phone`, `apply-guardian-email`, `apply-guardian-address`, `apply-guardian-occupation`, `apply-last-class-attended`, `apply-academic-class`, `apply-previous-school-name`, `apply-previous-school-address`, `apply-health-condition`, `health-condition-details-wrap`, `apply-health-condition-details`, `apply-health-allergies`, `apply-health-medications`, `apply-previous-report`, `apply-birth-certificate`, `apply-previous-school-result`, `apply-transfer-certificate`, `apply-other-document`, `admissions-review-panel` |
| `confirm-email.html` | `site-header`, `confirm-status`, `confirm-heading`, `confirm-copy`, `confirm-details`, `site-footer` |
| `contact.html` | `site-header`, `contact-status`, `contact-form`, `contact-first-name`, `contact-last-name`, `contact-email`, `contact-phone`, `contact-school`, `contact-role`, `contact-subject`, `contact-message`, `contact-submit-btn`, `faq-list`, `site-footer` |
| `forgot-password.html` | `forgot-form-view`, `forgot-form`, `forgot-status`, `forgot-email`, `forgot-sent-view`, `lg`, `lb` |
| `google20c973feb5773234.html` | None |
| `in-practice.html` | `site-header`, `practice-page-grid`, `site-footer` |
| `index.html` | `site-header`, `site-footer` |
| `login.html` | `login-form`, `login-status`, `login-email`, `login-password`, `login-remember` |
| `modules.html` | `site-header`, `module-page-grid`, `site-footer` |
| `owner-access.html` | `owner-login-copy`, `owner-login-form`, `owner-login-status`, `owner-username`, `owner-password`, `owner-confirm-block`, `owner-confirm-password`, `owner-remember`, `owner-login-submit` |
| `parent-attendance.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-courses.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-fees.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-messages.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-portal.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-reports.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `parent-settings.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `user-profile-form`, `user-profile-status`, `user-settings-photo-preview`, `user-profile-photo-url`, `user-display-name`, `user-profile-photo`, `user-settings-name`, `user-settings-role`, `user-settings-email`, `user-notification-preferences-form`, `user-notification-preferences-status`, `user-settings-hint`, `user-settings-form`, `user-settings-status`, `user-current-password`, `user-new-password`, `user-confirm-password` |
| `parent-teachers.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `parent-child-switcher`, `parent-page-content` |
| `portal.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-dashboard`, `portal-metrics`, `admin-events`, `staff-portal-workspace`, `student-portal-workspace`, `teacher-attendance-workspace` |
| `products.html` | `site-header`, `products-lane-grid`, `site-footer` |
| `reset-password.html` | `reset-form-wrapper`, `reset-form`, `reset-status`, `reset-password`, `reset-confirm`, `reset-invalid-view`, `reset-success-view`, `sg`, `sf` |
| `school-types.html` | `site-header`, `school-type-page-grid`, `site-footer` |
| `self-register.html` | `self-register-brand-mark`, `self-register-school-name`, `self-register-title`, `self-register-copy`, `self-register-form`, `self-register-status`, `self-register-workspace-id`, `self-register-type`, `self-student-first-name`, `self-student-last-name`, `self-student-email`, `self-student-profile-photo`, `self-student-gender`, `self-student-date-of-birth`, `self-student-level`, `self-guardian-name`, `self-guardian-relationship`, `self-guardian-phone`, `self-guardian-email`, `self-guardian-address`, `self-staff-name`, `self-staff-prefix`, `self-staff-first-name`, `self-staff-last-name`, `self-staff-email`, `self-staff-phone`, `self-staff-title`, `self-staff-school-type`, `self-staff-faculty`, `self-staff-custom-faculty`, `self-staff-department`, `self-staff-custom-department`, `self-register-submit` |
| `signup.html` | `signup-form`, `signup-status`, `signup-email`, `signup-password`, `signup-confirm-password`, `signup-terms` |
| `staff-attendance.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-classes.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-dashboard.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `portal-metrics`, `admin-events`, `staff-portal-workspace` |
| `staff-gradebook.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-leave.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-lesson-plans.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-messages.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-results.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `staff-settings.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `user-profile-form`, `user-profile-status`, `user-settings-photo-preview`, `user-profile-photo-url`, `user-display-name`, `user-profile-photo`, `user-settings-name`, `user-settings-role`, `user-settings-email`, `user-settings-hint`, `user-settings-form`, `user-settings-status`, `user-current-password`, `user-new-password`, `user-confirm-password` |
| `staff-timetable.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `admin-global-search`, `admin-search-suggestions`, `admin-notification-button`, `admin-notification-dot`, `staff-page-content` |
| `super-admin-accounts.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `super-admin-status`, `super-users`, `super-admin-search`, `super-admin-role-filter`, `super-admin-status-filter`, `super-admin-users` |
| `super-admin-activity.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `super-admin-status`, `super-activity`, `super-admin-activity` |
| `super-admin-schools.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `super-admin-status`, `super-workspaces`, `super-admin-workspaces` |
| `super-admin.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `super-overview`, `super-admin-status`, `super-admin-metrics` |
| `user-settings.html` | `admin-brand-mark`, `admin-brand-name`, `admin-brand-subtitle`, `admin-profile-avatar`, `admin-profile-name`, `admin-profile-role`, `portal-gate`, `portal-last-updated`, `portal-heading`, `portal-copy`, `user-profile-form`, `user-profile-status`, `user-settings-photo-preview`, `user-profile-photo-url`, `user-display-name`, `user-profile-photo`, `user-settings-name`, `user-settings-role`, `user-settings-email`, `user-settings-hint`, `user-settings-form`, `user-settings-status`, `user-current-password`, `user-new-password`, `user-confirm-password` |
| `why-it-works.html` | `site-header`, `why-page-grid`, `site-footer` |
| `workflows.html` | `site-header`, `workflow-page-grid`, `site-footer` |

### DOM lookup call sites

All 1095 AST lookup sites from parsable scripts, including template/dynamic expressions. Inline locations are relative to the script start identified in their label; admin-messages entries are dormant. The failed contact inline script uses [data-faq], #contact-form, #contact-submit-btn and #contact-status.

| Location | Owner | Lookup | Argument |
| --- | --- | --- | --- |
| `app.js:704` | `applySchoolSettingsBranding` | `querySelectorAll` | `"[data-school-context]"` |
| `app.js:3491` | `renderHeader` | `getElementById` | `"site-header"` |
| `app.js:3547` | `renderFooter` | `getElementById` | `"site-footer"` |
| `app.js:3593` | `closeMenusOnOutsideClick` | `querySelectorAll` | `".nav-menu[open]"` |
| `js/website/why-grid.js:20` | `renderWhyGrid` | `getElementById` | `targetId` |
| `js/website/offerings.js:95` | `renderOfferingPreviewGrid` | `getElementById` | `targetId` |
| `app.js:3602` | `renderStandoutList` | `getElementById` | `targetId` |
| `app.js:3612` | `renderFeatureGrid` | `getElementById` | `targetId` |
| `app.js:3645` | `renderSchoolGrid` | `getElementById` | `targetId` |
| `js/website/practice-grid.js:2` | `renderPracticeGrid` | `getElementById` | `targetId` |
| `js/website/offerings.js:117` | `renderOfferingTabs` | `getElementById` | `"home-offering-tabs"` |
| `js/website/offerings.js:118` | `renderOfferingTabs` | `getElementById` | `"home-offering-panel"` |
| `js/website/offerings.js:163` | `renderOfferingTabs` | `querySelectorAll` | `"[data-offering]"` |
| `js/website/offerings.js:172` | `renderWorkflowPage` | `getElementById` | `"workflow-page-grid"` |
| `auth.js:687` | `syncThemeToggleButton` | `querySelector` | `"[data-theme-toggle-label]"` |
| `auth.js:705` | `applyThemePreference` | `querySelectorAll` | `"[data-theme-toggle]"` |
| `auth.js:735` | `initThemeControls` | `querySelector` | `".admin-sidebar"` |
| `auth.js:736` | `initThemeControls` | `querySelector` | `".theme-toggle-sidebar"` |
| `auth.js:737` | `initThemeControls` | `querySelector` | `".admin-sidebar-nav"` |
| `auth.js:738` | `initThemeControls` | `querySelector` | `".admin-sidebar-profile"` |
| `auth.js:869` | `serializeBasicFormDraft` | `querySelector` | ``input[type="radio"][name="${CSS.escape(name)}"]:checked`` |
| `auth.js:952` | `setAuthRoleSelection` | `querySelectorAll` | `".auth-role"` |
| `auth.js:963` | `setAuthRoleSelection` | `querySelector` | `'.auth-role[data-auth-role="admin"]'` |
| `auth.js:985` | `serializeSchoolSettingsFormDraft` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:997` | `restoreSchoolSettingsFormDraft` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:1003` | `restoreSchoolSettingsFormDraft` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:1004` | `restoreSchoolSettingsFormDraft` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:1015` | `serializeStudentFormDraft` | `getElementById` | `"portal-guardian-list"` |
| `auth.js:1021` | `serializeStudentFormDraft` | `querySelectorAll` | `".portal-guardian-row"` |
| `auth.js:1022` | `serializeStudentFormDraft` | `querySelector` | `'[data-guardian-field="name"]'` |
| `auth.js:1023` | `serializeStudentFormDraft` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:1024` | `serializeStudentFormDraft` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:1025` | `serializeStudentFormDraft` | `querySelector` | `'[data-guardian-field="phone"]'` |
| `auth.js:1026` | `serializeStudentFormDraft` | `querySelector` | `'[data-guardian-field="email"]'` |
| `auth.js:1041` | `restoreStudentFormDraft` | `getElementById` | `"portal-guardian-list"` |
| `auth.js:1052` | `restoreClassFormDraft` | `querySelector` | `"[data-class-form-toggle]"` |
| `auth.js:1053` | `restoreClassFormDraft` | `querySelector` | `"[data-course-form-toggle]"` |
| `auth.js:1054` | `restoreClassFormDraft` | `querySelector` | `"[data-calendar-form-toggle]"` |
| `auth.js:1076` | `initializeDraftForForm` | `getElementById` | `formId` |
| `auth.js:1132` | `initConnectionResilienceBanner` | `querySelector` | `".network-resilience-banner-message"` |
| `auth.js:1133` | `initConnectionResilienceBanner` | `querySelector` | `".network-resilience-banner-dismiss"` |
| `auth.js:2388` | `showWhatsAppAlertToast` | `getElementById` | `"portal-whatsapp-toast"` |
| `auth.js:3444` | `loadSupabaseLibrary` | `querySelector` | ``script[data-supabase-sdk="true"]`` |
| `js/shared-ui/action-dialog.js:16` | `closeAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `js/shared-ui/action-dialog.js:31` | `ensureAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `js/shared-ui/action-dialog.js:63` | `ensureAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `js/shared-ui/action-dialog.js:66` | `ensureAppActionDialog` | `closest` | `"[data-app-action-cancel]"` |
| `js/shared-ui/action-dialog.js:71` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-form"` |
| `js/shared-ui/action-dialog.js:73` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-input"` |
| `js/shared-ui/action-dialog.js:74` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-error"` |
| `js/shared-ui/action-dialog.js:130` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-kicker"` |
| `js/shared-ui/action-dialog.js:131` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-title"` |
| `js/shared-ui/action-dialog.js:132` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-message"` |
| `js/shared-ui/action-dialog.js:133` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-details"` |
| `js/shared-ui/action-dialog.js:134` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-prompt"` |
| `js/shared-ui/action-dialog.js:135` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-input-label"` |
| `js/shared-ui/action-dialog.js:136` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-input"` |
| `js/shared-ui/action-dialog.js:137` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-error"` |
| `js/shared-ui/action-dialog.js:138` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-cancel"` |
| `js/shared-ui/action-dialog.js:139` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-confirm"` |
| `auth.js:7285` | `initAdminSidebarUi` | `querySelector` | `".admin-dashboard-shell"` |
| `auth.js:7286` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar"` |
| `auth.js:7292` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar-nav"` |
| `auth.js:7324` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-courses.html"]'` |
| `auth.js:7325` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-classes.html"]'` |
| `auth.js:7349` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7378` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-students.html"]'` |
| `auth.js:7391` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7406` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-schedule.html"]'` |
| `auth.js:7428` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7443` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-reports.html"]'` |
| `auth.js:7466` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7471` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7498` | `initAdminSidebarUi` | `querySelector` | `"[data-sidebar-toggle]"` |
| `auth.js:7517` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar-toggle-icon"` |
| `auth.js:7647` | `updateStaffPortalSidebarActive` | `querySelectorAll` | `"[data-staff-nav-key]"` |
| `auth.js:7696` | `updateStudentPortalSidebarActive` | `querySelectorAll` | `"[data-student-nav-key]"` |
| `auth.js:7758` | `applyRolePermissionSidebarVisibility` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:8467` | `getStaffFieldWrapper` | `querySelector` | `dataSelector` |
| `auth.js:9140` | `wireSignOutButton` | `querySelector` | `"[data-signout]"` |
| `auth.js:9184` | `initClassManagementControls` | `querySelector` | `"[data-class-form-toggle]"` |
| `auth.js:9188` | `initClassManagementControls` | `querySelector` | `"[data-teacher-assignment-list]"` |
| `auth.js:9189` | `initClassManagementControls` | `querySelector` | `"[data-assignment-add]"` |
| `auth.js:9190` | `initClassManagementControls` | `querySelector` | `"[data-class-assignment-raw]"` |
| `auth.js:9191` | `initClassManagementControls` | `querySelector` | `"[data-class-template-type]"` |
| `auth.js:9192` | `initClassManagementControls` | `querySelector` | `"[data-class-template-arm]"` |
| `auth.js:9193` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-arm]"` |
| `auth.js:9194` | `initClassManagementControls` | `querySelector` | `"[data-class-template-stream]"` |
| `auth.js:9195` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-stream]"` |
| `auth.js:9196` | `initClassManagementControls` | `querySelector` | `"[data-class-template-faculty]"` |
| `auth.js:9197` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-faculty]"` |
| `auth.js:9198` | `initClassManagementControls` | `querySelector` | `"[data-class-template-department]"` |
| `auth.js:9199` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-department]"` |
| `auth.js:9200` | `initClassManagementControls` | `querySelector` | `"[data-class-template-capacity]"` |
| `auth.js:9201` | `initClassManagementControls` | `querySelector` | `"[data-class-template-generate]"` |
| `auth.js:9202` | `initClassManagementControls` | `querySelector` | `"[data-class-template-arm-wrap]"` |
| `auth.js:9203` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-arm-wrap]"` |
| `auth.js:9204` | `initClassManagementControls` | `querySelector` | `"[data-class-template-stream-wrap]"` |
| `auth.js:9205` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-stream-wrap]"` |
| `auth.js:9206` | `initClassManagementControls` | `querySelector` | `"[data-class-template-faculty-wrap]"` |
| `auth.js:9207` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-faculty-wrap]"` |
| `auth.js:9208` | `initClassManagementControls` | `querySelector` | `"[data-class-template-department-wrap]"` |
| `auth.js:9209` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-department-wrap]"` |
| `auth.js:9462` | `initClassManagementControls` | `querySelectorAll` | `"[data-assignment-row]"` |
| `auth.js:9463` | `initClassManagementControls` | `querySelector` | `'[data-assignment-field="subject"]'` |
| `auth.js:9464` | `initClassManagementControls` | `querySelector` | `'[data-assignment-field="teacher"]'` |
| `auth.js:9576` | `initClassManagementControls` | `getElementById` | `"portal-class-edit-overlay"` |
| `auth.js:9577` | `initClassManagementControls` | `querySelector` | `"[data-class-form-modal-body]"` |
| `auth.js:9579` | `initClassManagementControls` | `closest` | `"[data-class-form-modal-close]"` |
| `auth.js:9810` | `initClassManagementControls` | `closest` | `"[data-assignment-remove]"` |
| `auth.js:9816` | `initClassManagementControls` | `closest` | `"[data-assignment-row]"` |
| `auth.js:9979` | `initClassManagementControls` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:10037` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal"` |
| `auth.js:10038` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-body"` |
| `auth.js:10039` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-title"` |
| `auth.js:10040` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-subtitle"` |
| `auth.js:10041` | `initClassManagementControls` | `querySelector` | `"[data-class-subject-manage]"` |
| `auth.js:10043` | `initClassManagementControls` | `closest` | `"[data-class-subject-close]"` |
| `auth.js:10225` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-quick-modal"` |
| `auth.js:10226` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-modal-body"` |
| `auth.js:10227` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-modal-title"` |
| `auth.js:10229` | `initClassManagementControls` | `closest` | `"[data-class-timetable-close]"` |
| `auth.js:10233` | `initClassManagementControls` | `closest` | `"[data-class-timetable-print]"` |
| `auth.js:10395` | `initClassManagementControls` | `querySelector` | `"[data-class-timetable-print]"` |
| `auth.js:10477` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal"` |
| `auth.js:10478` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-body"` |
| `auth.js:10479` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-title"` |
| `auth.js:10480` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-subtitle"` |
| `auth.js:10482` | `initClassManagementControls` | `closest` | `"[data-class-detail-close]"` |
| `auth.js:10492` | `initClassManagementControls` | `closest` | `'[data-class-action="edit"]'` |
| `auth.js:10513` | `initClassManagementControls` | `closest` | `"[data-class-subjects-view]"` |
| `auth.js:10523` | `initClassManagementControls` | `closest` | `"[data-class-timetable-view]"` |
| `auth.js:10533` | `initClassManagementControls` | `closest` | `"[data-class-detail-jump]"` |
| `auth.js:11002` | `initClassManagementControls` | `closest` | `"[data-class-detail-view]"` |
| `auth.js:11014` | `initClassManagementControls` | `closest` | `"[data-class-subjects-view]"` |
| `auth.js:11026` | `initClassManagementControls` | `closest` | `"[data-class-timetable-view]"` |
| `auth.js:11038` | `initClassManagementControls` | `closest` | `"[data-class-action]"` |
| `auth.js:11355` | `initCourseManagementControls` | `querySelector` | `"[data-course-form-toggle]"` |
| `auth.js:11363` | `initCourseManagementControls` | `querySelector` | `"[data-course-code-field]"` |
| `auth.js:11364` | `initCourseManagementControls` | `querySelector` | `"[data-course-level-field]"` |
| `auth.js:11365` | `initCourseManagementControls` | `querySelector` | `"[data-course-arm-field]"` |
| `auth.js:11366` | `initCourseManagementControls` | `querySelector` | `"[data-course-teacher-field]"` |
| `auth.js:11367` | `initCourseManagementControls` | `querySelector` | `"[data-course-description-field]"` |
| `auth.js:11368` | `initCourseManagementControls` | `querySelector` | `"[data-course-wizard-actions]"` |
| `auth.js:11369` | `initCourseManagementControls` | `querySelector` | `"[data-course-category-field]"` |
| `auth.js:11370` | `initCourseManagementControls` | `querySelector` | `"[data-course-name-field]"` |
| `auth.js:11371` | `initCourseManagementControls` | `querySelector` | `"[data-course-subject-select-field]"` |
| `auth.js:11372` | `initCourseManagementControls` | `querySelector` | `"[data-course-subject-select]"` |
| `auth.js:11373` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-subject-field]"` |
| `auth.js:11374` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-subject]"` |
| `auth.js:11375` | `initCourseManagementControls` | `querySelector` | `"[data-course-faculty-field]"` |
| `auth.js:11376` | `initCourseManagementControls` | `querySelector` | `"[data-course-department-field]"` |
| `auth.js:11377` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-department-field]"` |
| `auth.js:11378` | `initCourseManagementControls` | `querySelector` | `"[data-course-faculty]"` |
| `auth.js:11379` | `initCourseManagementControls` | `querySelector` | `"[data-course-department]"` |
| `auth.js:11381` | `initCourseManagementControls` | `querySelector` | `"[data-course-template-type]"` |
| `auth.js:11382` | `initCourseManagementControls` | `querySelector` | `"[data-course-library-list]"` |
| `auth.js:11560` | `initCourseManagementControls` | `closest` | `"option"` |
| `auth.js:11798` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:11805` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:11809` | `initCourseManagementControls` | `querySelector` | `"input"` |
| `auth.js:11846` | `initCourseManagementControls` | `getElementById` | `"portal-heading"` |
| `auth.js:11847` | `initCourseManagementControls` | `querySelector` | `"[data-course-form-toggle]"` |
| `auth.js:11870` | `initCourseManagementControls` | `closest` | `".portal-field"` |
| `auth.js:11895` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:12393` | `initCourseManagementControls` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:12404` | `initCourseManagementControls` | `closest` | `"[data-course-action]"` |
| `auth.js:12584` | `initAcademicCalendarControls` | `querySelector` | `"[data-calendar-form-toggle]"` |
| `auth.js:12734` | `initAcademicCalendarControls` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:12746` | `initAcademicCalendarControls` | `closest` | `"[data-calendar-action]"` |
| `auth.js:12871` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-submit]"` |
| `auth.js:12872` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:12890` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-submit]"` |
| `auth.js:12891` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:12909` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-submit]"` |
| `auth.js:12910` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:12935` | `initAdmissionConfigurationControls` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13090` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:13099` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:13108` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:13118` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-session-action]"` |
| `auth.js:13135` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-submit]"` |
| `auth.js:13136` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:13158` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-class-action]"` |
| `auth.js:13173` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-submit]"` |
| `auth.js:13174` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:13196` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-stage-action]"` |
| `auth.js:13212` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-submit]"` |
| `auth.js:13213` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:13261` | `clearPortalAdmissionSetupErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:13262` | `clearPortalAdmissionSetupErrors` | `querySelectorAll` | `"[data-admission-setup-error-for]"` |
| `auth.js:13271` | `setPortalAdmissionSetupError` | `querySelector` | ``[data-admission-setup-error-for="${fieldName}"]`` |
| `auth.js:13274` | `setPortalAdmissionSetupError` | `querySelector` | `"#portal-admission-class-picker"` |
| `auth.js:13276` | `setPortalAdmissionSetupError` | `closest` | `".portal-field"` |
| `auth.js:13366` | `syncAdmissionClassFieldOptions` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13374` | `syncAdmissionClassFieldOptions` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13459` | `initAdmissionSetupControls` | `querySelectorAll` | `'input[name="admissionClassOption"]:checked'` |
| `auth.js:13541` | `initAdmissionSetupControls` | `querySelectorAll` | `'input[name="admissionClassOption"]'` |
| `auth.js:13561` | `initAdmissionSetupControls` | `querySelector` | `"[data-admission-setup-recommended]"` |
| `js/features/timetable/controller.js:52` | `initTimetableControls` | `getElementById` | `"portal-timetable-lesson-overlay"` |
| `js/features/timetable/controller.js:53` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-overlay"` |
| `js/features/timetable/controller.js:54` | `initTimetableControls` | `getElementById` | `"portal-calendar-substitution-log"` |
| `js/features/timetable/controller.js:55` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-form"` |
| `js/features/timetable/controller.js:56` | `initTimetableControls` | `getElementById` | `"timetable-period-title"` |
| `js/features/timetable/controller.js:57` | `initTimetableControls` | `getElementById` | `"timetable-session-id"` |
| `js/features/timetable/controller.js:58` | `initTimetableControls` | `getElementById` | `"timetable-term-id"` |
| `js/features/timetable/controller.js:59` | `initTimetableControls` | `getElementById` | `"timetable-view-mode"` |
| `js/features/timetable/controller.js:60` | `initTimetableControls` | `getElementById` | `"timetable-class-level"` |
| `js/features/timetable/controller.js:61` | `initTimetableControls` | `getElementById` | `"timetable-teacher-view"` |
| `js/features/timetable/controller.js:62` | `initTimetableControls` | `getElementById` | `"timetable-week-type"` |
| `js/features/timetable/controller.js:63` | `initTimetableControls` | `querySelector` | `"[data-timetable-copy-term]"` |
| `js/features/timetable/controller.js:64` | `initTimetableControls` | `querySelector` | `"[data-timetable-period-add]"` |
| `js/features/timetable/controller.js:65` | `initTimetableControls` | `querySelector` | `"[data-timetable-save-class]"` |
| `js/features/timetable/controller.js:66` | `initTimetableControls` | `querySelector` | `"[data-timetable-print]"` |
| `js/features/timetable/controller.js:67` | `initTimetableControls` | `querySelector` | `"[data-timetable-delete]"` |
| `js/features/timetable/controller.js:68` | `initTimetableControls` | `getElementById` | `"timetable-form-title"` |
| `js/features/timetable/controller.js:69` | `initTimetableControls` | `getElementById` | `"timetable-form-context"` |
| `js/features/timetable/controller.js:85` | `initTimetableControls` | `getElementById` | `"portal-timetable-toast"` |
| `js/features/timetable/controller.js:104` | `initTimetableControls` | `getElementById` | `"portal-timetable-inline-status"` |
| `js/features/timetable/controller.js:168` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal"` |
| `js/features/timetable/controller.js:169` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal-body"` |
| `js/features/timetable/controller.js:171` | `initTimetableControls` | `closest` | `"[data-timetable-class-close]"` |
| `js/features/timetable/controller.js:175` | `initTimetableControls` | `closest` | `"[data-timetable-class-print-current]"` |
| `js/features/timetable/controller.js:186` | `initTimetableControls` | `querySelectorAll` | `".portal-field"` |
| `js/features/timetable/controller.js:187` | `initTimetableControls` | `querySelectorAll` | `"[data-period-error-for]"` |
| `js/features/timetable/controller.js:196` | `initTimetableControls` | `querySelector` | ``[data-period-error-for="${fieldName}"]`` |
| `js/features/timetable/controller.js:198` | `initTimetableControls` | `closest` | `".portal-field"` |
| `js/features/timetable/controller.js:455` | `initTimetableControls` | `querySelector` | `".portal-timetable-grid"` |
| `js/features/timetable/controller.js:620` | `initTimetableControls` | `closest` | `".portal-field"` |
| `js/features/timetable/controller.js:1011` | `initTimetableControls` | `querySelector` | `"[data-timetable-cancel]"` |
| `js/features/timetable/controller.js:1023` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-lesson-close]"` |
| `js/features/timetable/controller.js:1034` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-period-close]"` |
| `js/features/timetable/controller.js:1231` | `initTimetableControls` | `closest` | `"[data-timetable-inline-action]"` |
| `js/features/timetable/controller.js:1232` | `initTimetableControls` | `closest` | `"[data-timetable-period-edit]"` |
| `js/features/timetable/controller.js:1233` | `initTimetableControls` | `closest` | `"[data-timetable-slot]"` |
| `js/features/timetable/controller.js:1234` | `initTimetableControls` | `closest` | `"[data-timetable-action]"` |
| `js/features/timetable/controller.js:1235` | `initTimetableControls` | `closest` | `"[data-timetable-class-action]"` |
| `js/features/timetable/controller.js:1236` | `initTimetableControls` | `closest` | `"[data-timetable-group-action]"` |
| `auth.js:13748` | `initFeeManagementControls` | `querySelector` | `"[data-fee-form-toggle]"` |
| `auth.js:13752` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-status"` |
| `auth.js:13753` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-list"` |
| `auth.js:13754` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-form-open]"` |
| `auth.js:13755` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-form-overlay"` |
| `auth.js:13757` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-session"` |
| `auth.js:13758` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-term"` |
| `auth.js:13759` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-class"` |
| `auth.js:13760` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-student"` |
| `auth.js:13761` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-due-date"` |
| `auth.js:13762` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-whatsapp"` |
| `auth.js:13763` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-generate-single]"` |
| `auth.js:13765` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-overlay"` |
| `auth.js:13766` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-body"` |
| `auth.js:13767` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-title"` |
| `auth.js:13768` | `initFeeManagementControls` | `getElementById` | `"portal-fee-category-options"` |
| `auth.js:13769` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-overlay"` |
| `auth.js:13770` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-modal-title"` |
| `auth.js:13778` | `initFeeManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:13786` | `initFeeManagementControls` | `getElementById` | `"portal-fee-toast"` |
| `auth.js:14272` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-close]"` |
| `auth.js:15027` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-form-close]"` |
| `auth.js:15033` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class]"` |
| `auth.js:15042` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class-whatsapp]"` |
| `auth.js:15051` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-action]"` |
| `auth.js:15073` | `initFeeManagementControls` | `closest` | `"details[data-invoice-class-token]"` |
| `auth.js:15093` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-close]"` |
| `auth.js:15098` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-current]"` |
| `auth.js:15107` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-with-history]"` |
| `auth.js:15116` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-history]"` |
| `auth.js:15125` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-download-history]"` |
| `auth.js:15175` | `initFeeManagementControls` | `closest` | `"[data-fee-category]"` |
| `auth.js:15192` | `initFeeManagementControls` | `closest` | `"[data-fee-form-close]"` |
| `auth.js:15288` | `initFeeManagementControls` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:15293` | `initFeeManagementControls` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:15304` | `initFeeManagementControls` | `closest` | `"[data-fee-action]"` |
| `auth.js:15330` | `initFeeManagementControls` | `closest` | `"[data-fee-action='edit']"` |
| `auth.js:15369` | `initSchoolSettingsControls` | `querySelector` | `'input[name="logoFile"]'` |
| `auth.js:15370` | `initSchoolSettingsControls` | `querySelector` | `"[data-clear-logo]"` |
| `auth.js:15371` | `initSchoolSettingsControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:15372` | `initSchoolSettingsControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:15619` | `initSchoolSettingsControls` | `querySelector` | `"[data-reset-school-settings]"` |
| `auth.js:15900` | `initRolePermissionControls` | `matches` | `"[data-role-permission-role][data-role-permission-key]"` |
| `auth.js:16015` | `initAcademicCycleControls` | `closest` | `"[data-term-period-type-wrap]"` |
| `auth.js:16015` | `initAcademicCycleControls` | `closest` | `".portal-field"` |
| `auth.js:16029` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:16030` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:16043` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:16044` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:16368` | `initAcademicCycleControls` | `closest` | `"[data-session-action]"` |
| `auth.js:16388` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:16389` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:16421` | `initAcademicCycleControls` | `closest` | `"[data-term-action]"` |
| `auth.js:16446` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:16447` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:16464` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:16473` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:16533` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16534` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-structure-block"` |
| `auth.js:16535` | `clearPortalSettingsErrors` | `querySelectorAll` | `"[data-settings-error-for]"` |
| `auth.js:16541` | `setPortalSettingsError` | `querySelector` | ``[data-settings-error-for="${fieldName}"]`` |
| `auth.js:16544` | `setPortalSettingsError` | `closest` | `".portal-field"` |
| `auth.js:16557` | `clearPortalSessionErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16558` | `clearPortalSessionErrors` | `querySelectorAll` | `"[data-session-error-for]"` |
| `auth.js:16564` | `setPortalSessionError` | `querySelector` | ``[data-session-error-for="${fieldName}"]`` |
| `auth.js:16566` | `setPortalSessionError` | `closest` | `".portal-field"` |
| `auth.js:16578` | `clearPortalTermErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16579` | `clearPortalTermErrors` | `querySelectorAll` | `"[data-term-error-for]"` |
| `auth.js:16585` | `setPortalTermError` | `querySelector` | ``[data-term-error-for="${fieldName}"]`` |
| `auth.js:16587` | `setPortalTermError` | `closest` | `".portal-field"` |
| `auth.js:16599` | `clearPortalClassErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16600` | `clearPortalClassErrors` | `querySelectorAll` | `"[data-class-error-for]"` |
| `auth.js:16606` | `setPortalClassError` | `querySelector` | ``[data-class-error-for="${fieldName}"]`` |
| `auth.js:16608` | `setPortalClassError` | `closest` | `".portal-field"` |
| `auth.js:16620` | `clearPortalCalendarErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16621` | `clearPortalCalendarErrors` | `querySelectorAll` | `"[data-calendar-error-for]"` |
| `auth.js:16627` | `setPortalCalendarError` | `querySelector` | ``[data-calendar-error-for="${fieldName}"]`` |
| `auth.js:16629` | `setPortalCalendarError` | `closest` | `".portal-field"` |
| `auth.js:16700` | `clearPortalCourseErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:16701` | `clearPortalCourseErrors` | `querySelectorAll` | `"[data-course-error-for]"` |
| `auth.js:16707` | `setPortalCourseError` | `querySelector` | ``[data-course-error-for="${fieldName}"]`` |
| `auth.js:16709` | `setPortalCourseError` | `closest` | `".portal-field"` |
| `auth.js:16777` | `resetPortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:16786` | `resetPortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:16787` | `resetPortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:16820` | `populatePortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:16825` | `populatePortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:16826` | `populatePortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:16870` | `resetPortalCourseForm` | `querySelector` | `"[data-course-subject-select]"` |
| `auth.js:16871` | `resetPortalCourseForm` | `querySelector` | `"[data-course-custom-subject]"` |
| `auth.js:16899` | `resetPortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:16900` | `resetPortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:16983` | `populatePortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:16984` | `populatePortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:17016` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:17017` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:17046` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:17047` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:17065` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17066` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `"[data-admission-config-error-for]"` |
| `auth.js:17072` | `setPortalAdmissionConfigError` | `querySelector` | ``[data-admission-config-error-for="${fieldName}"]`` |
| `auth.js:17074` | `setPortalAdmissionConfigError` | `closest` | `".portal-field"` |
| `auth.js:17085` | `clearPortalTimetableErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17086` | `clearPortalTimetableErrors` | `querySelectorAll` | `"[data-timetable-error-for]"` |
| `auth.js:17092` | `setPortalTimetableError` | `querySelector` | ``[data-timetable-error-for="${fieldName}"]`` |
| `auth.js:17094` | `setPortalTimetableError` | `closest` | `".portal-field"` |
| `auth.js:17105` | `clearPortalFeeErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17106` | `clearPortalFeeErrors` | `querySelectorAll` | `"[data-fee-error-for]"` |
| `auth.js:17112` | `setPortalFeeError` | `querySelector` | ``[data-fee-error-for="${fieldName}"]`` |
| `auth.js:17114` | `setPortalFeeError` | `closest` | `".portal-field"` |
| `auth.js:17139` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:17140` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:17141` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:17142` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:17143` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:17177` | `populatePortalTimetableForm` | `getElementById` | `"timetable-session-id"` |
| `auth.js:17178` | `populatePortalTimetableForm` | `getElementById` | `"timetable-term-id"` |
| `auth.js:17179` | `populatePortalTimetableForm` | `getElementById` | `"timetable-class-level"` |
| `auth.js:17180` | `populatePortalTimetableForm` | `getElementById` | `"timetable-teacher-view"` |
| `auth.js:17181` | `populatePortalTimetableForm` | `getElementById` | `"timetable-week-type"` |
| `auth.js:17182` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:17183` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:17230` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:17231` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:17232` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:17268` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:17269` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:17270` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:17314` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:17315` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:17316` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:17357` | `getSelectedSchoolTypesFromForm` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:17370` | `syncSchoolTypeControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:17378` | `syncSchoolTypeControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:17391` | `syncHigherInstitutionTypeField` | `querySelector` | `"[data-higher-institution-type-field]"` |
| `auth.js:17537` | `updateLogoSwatch` | `querySelector` | `"[data-logo-swatch]"` |
| `auth.js:17571` | `clearPortalAccessErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17572` | `clearPortalAccessErrors` | `querySelectorAll` | `"[data-access-error-for]"` |
| `auth.js:17578` | `setPortalAccessError` | `querySelector` | ``[data-access-error-for="${fieldName}"]`` |
| `auth.js:17580` | `setPortalAccessError` | `closest` | `".portal-field"` |
| `auth.js:17617` | `resetPortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:17618` | `resetPortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:17654` | `populatePortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:17655` | `populatePortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:17702` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal"` |
| `auth.js:17703` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-body"` |
| `auth.js:17704` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-title"` |
| `auth.js:17706` | `ensureAccessGrantModal` | `closest` | `"[data-access-grant-close]"` |
| `auth.js:17719` | `setAccessGrantModalOpen` | `querySelector` | `"[data-access-grant-close]"` |
| `auth.js:18441` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:18546` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:18548` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:18563` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:18564` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:18575` | `initAccessProvisioningControls` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:18593` | `clearPortalStaffErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18594` | `clearPortalStaffErrors` | `querySelectorAll` | `"[data-staff-error-for]"` |
| `auth.js:18600` | `setPortalStaffError` | `querySelector` | ``[data-staff-error-for="${fieldName}"]`` |
| `auth.js:18602` | `setPortalStaffError` | `closest` | `".portal-field"` |
| `auth.js:18683` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:18684` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:18749` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:18750` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:18978` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-search"` |
| `auth.js:18979` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-status"` |
| `auth.js:18980` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-overlay"` |
| `auth.js:18981` | `initStaffManagementControls` | `querySelector` | `"[data-staff-form-open]"` |
| `auth.js:18982` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-title"` |
| `auth.js:19001` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:19035` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:19071` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:19075` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-grid"` |
| `auth.js:19085` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:19506` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:19533` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:19537` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-content"` |
| `auth.js:19539` | `initStaffManagementControls` | `closest` | `"[data-staff-created-close]"` |
| `auth.js:19541` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:19547` | `initStaffManagementControls` | `closest` | `"[data-staff-created-print]"` |
| `auth.js:19554` | `initStaffManagementControls` | `closest` | `"[data-staff-created-mail]"` |
| `auth.js:19584` | `initStaffManagementControls` | `querySelector` | `"[data-staff-created-print]"` |
| `auth.js:19721` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-edit]"` |
| `auth.js:19722` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-status]"` |
| `auth.js:19723` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-delete]"` |
| `auth.js:19882` | `initStaffManagementControls` | `closest` | `"[data-staff-form-close]"` |
| `auth.js:20222` | `initStaffManagementControls` | `closest` | `"[data-staff-open]"` |
| `auth.js:20241` | `initStaffManagementControls` | `closest` | `"[data-staff-view-close]"` |
| `auth.js:20247` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-print]"` |
| `auth.js:20256` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-mail]"` |
| `auth.js:20265` | `initStaffManagementControls` | `closest` | `"[data-staff-view-edit]"` |
| `auth.js:20283` | `initStaffManagementControls` | `closest` | `"[data-staff-view-status]"` |
| `auth.js:20306` | `initStaffManagementControls` | `closest` | `"[data-staff-view-delete]"` |
| `auth.js:20330` | `initStaffManagementControls` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:20549` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:20570` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:20574` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-content"` |
| `auth.js:20575` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-title"` |
| `auth.js:20576` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-modal-status"` |
| `auth.js:20586` | `initAdminStaffLeaveReviewControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:20702` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-open]"` |
| `auth.js:20721` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-review-close]"` |
| `auth.js:20727` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-approve]"` |
| `auth.js:20733` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-reject]"` |
| `auth.js:20803` | `renderPortalFeatureToggleSection` | `querySelectorAll` | `"[data-feature-toggle]"` |
| `auth.js:22893` | `clearPortalStudentErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:22894` | `clearPortalStudentErrors` | `querySelectorAll` | `"[data-student-error-for]"` |
| `auth.js:22900` | `setPortalStudentError` | `querySelector` | ``[data-student-error-for="${fieldName}"]`` |
| `auth.js:22902` | `setPortalStudentError` | `closest` | `".portal-field"` |
| `auth.js:23642` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:23644` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:23660` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:23661` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:23735` | `parseGuardianRows` | `querySelectorAll` | `".portal-guardian-row"` |
| `auth.js:23741` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="name"]'` |
| `auth.js:23743` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="phone"]'` |
| `auth.js:23744` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="email"]'` |
| `auth.js:23806` | `resetPortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:23807` | `resetPortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:23878` | `populatePortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:23879` | `populatePortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:23960` | `parseSpreadsheetXmlRows` | `querySelector` | `"parsererror"` |
| `auth.js:23987` | `parseSpreadsheetXmlRows` | `querySelector` | `"Data"` |
| `auth.js:23988` | `parseSpreadsheetXmlRows` | `querySelector` | `"ss\\:Data"` |
| `auth.js:24481` | `initStudentManagementControls` | `querySelector` | `"[data-add-guardian]"` |
| `auth.js:24482` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-form"` |
| `auth.js:24483` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-status"` |
| `auth.js:24484` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-toggle]"` |
| `auth.js:24485` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-panel"` |
| `auth.js:24486` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-overlay"` |
| `auth.js:24487` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-overlay"` |
| `auth.js:24488` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-overlay"` |
| `auth.js:24489` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-content"` |
| `auth.js:24490` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-overlay"` |
| `auth.js:24491` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-status"` |
| `auth.js:24492` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-list"` |
| `auth.js:24493` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-id"` |
| `auth.js:24494` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-name"` |
| `auth.js:24495` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-type"` |
| `auth.js:24496` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-file"` |
| `auth.js:24497` | `initStudentManagementControls` | `querySelector` | `"[data-student-doc-upload]"` |
| `auth.js:24498` | `initStudentManagementControls` | `getElementById` | `"portal-student-class-filters"` |
| `auth.js:24499` | `initStudentManagementControls` | `getElementById` | `"portal-student-search"` |
| `auth.js:24500` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-status"` |
| `auth.js:24501` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-file"` |
| `auth.js:24502` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-preview]"` |
| `auth.js:24503` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-confirm]"` |
| `auth.js:24504` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-preview"` |
| `auth.js:24508` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-title"` |
| `auth.js:24732` | `initStudentManagementControls` | `closest` | `"[data-student-class]"` |
| `auth.js:24743` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-create-close]"` |
| `auth.js:24752` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-import-close]"` |
| `auth.js:24758` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-view-close]"` |
| `auth.js:24764` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-docs-close]"` |
| `auth.js:24878` | `initStudentManagementControls` | `closest` | `"[data-student-doc-action]"` |
| `auth.js:24960` | `initStudentManagementControls` | `closest` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:24966` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:24971` | `initStudentManagementControls` | `closest` | `"[data-remove-guardian]"` |
| `auth.js:24977` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:25233` | `initStudentManagementControls` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:25245` | `initStudentManagementControls` | `closest` | `"[data-student-bulk-delete-level]"` |
| `auth.js:25318` | `initStudentManagementControls` | `closest` | `"[data-student-class-toggle]"` |
| `auth.js:25331` | `initStudentManagementControls` | `closest` | `".portal-student-group"` |
| `auth.js:25332` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-list"` |
| `auth.js:25333` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-toggle-arrow"` |
| `auth.js:25352` | `initStudentManagementControls` | `closest` | `"[data-student-action]"` |
| `auth.js:26001` | `initStudentManagementControls` | `closest` | `"[data-student-photo-action]"` |
| `auth.js:26014` | `initStudentManagementControls` | `querySelector` | `"[data-student-photo-input]"` |
| `auth.js:26041` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:26046` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:26054` | `initStudentManagementControls` | `closest` | `"[data-student-photo-input]"` |
| `auth.js:26092` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:26098` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="remove"]'` |
| `auth.js:26102` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:26110` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-template-download]"` |
| `auth.js:26319` | `getSelectedRole` | `querySelector` | `".auth-role.is-active"` |
| `auth.js:26329` | `getSelectedRole` | `querySelector` | `".auth-role-label"` |
| `auth.js:26340` | `initRoleButtons` | `getElementById` | `"login-email"` |
| `auth.js:26341` | `initRoleButtons` | `querySelector` | `'.auth-field-label[for="login-email"]'` |
| `auth.js:26352` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:26354` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:26363` | `initPasswordToggles` | `querySelectorAll` | `"[data-password-toggle]"` |
| `auth.js:26366` | `initPasswordToggles` | `getElementById` | `targetId` |
| `auth.js:26398` | `getActionFeedbackTrigger` | `matches` | `[ "[data-no-inline-feedback]", "[data-password-toggle]", "[data-theme-toggle]", "[data-sidebar-toggle]", "[data-auth-modal-close]", "[data-auth-role]", ].join(",")` |
| `auth.js:26454` | `getInlineActionFeedbackHost` | `getElementById` | `existingId` |
| `auth.js:26468` | `getInlineActionFeedbackHost` | `closest` | `".inline-action-feedback-wrap"` |
| `auth.js:26566` | `clearInlineActionFeedback` | `getElementById` | `hostId` |
| `auth.js:26664` | `clearFieldErrors` | `querySelectorAll` | `".auth-line-field"` |
| `auth.js:26665` | `clearFieldErrors` | `querySelectorAll` | `".auth-check"` |
| `auth.js:26666` | `clearFieldErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:26667` | `clearFieldErrors` | `querySelectorAll` | `".auth-field-error"` |
| `auth.js:26673` | `setFieldError` | `querySelector` | ``[data-error-for="${fieldName}"]`` |
| `auth.js:26676` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:26677` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:26678` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:26679` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:26680` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:26681` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:26769` | `initSignupFlow` | `getElementById` | `"signup-form"` |
| `auth.js:26770` | `initSignupFlow` | `getElementById` | `"signup-status"` |
| `auth.js:26783` | `initSignupFlow` | `closest` | `"[data-supabase-resend-confirmation]"` |
| `auth.js:27230` | `initLoginFlow` | `getElementById` | `"login-form"` |
| `auth.js:27231` | `initLoginFlow` | `getElementById` | `"login-status"` |
| `auth.js:27528` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-form"` |
| `auth.js:27529` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-status"` |
| `auth.js:27530` | `initOwnerAccessFlow` | `getElementById` | `"owner-confirm-block"` |
| `auth.js:27531` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-copy"` |
| `auth.js:27532` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-submit"` |
| `auth.js:27629` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form"` |
| `auth.js:27630` | `initForgotPasswordFlow` | `getElementById` | `"forgot-status"` |
| `auth.js:27631` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form-view"` |
| `auth.js:27632` | `initForgotPasswordFlow` | `getElementById` | `"forgot-sent-view"` |
| `auth.js:27718` | `initResetPasswordFlow` | `getElementById` | `"reset-form"` |
| `auth.js:27719` | `initResetPasswordFlow` | `getElementById` | `"reset-status"` |
| `auth.js:27720` | `initResetPasswordFlow` | `getElementById` | `"reset-form-wrapper"` |
| `auth.js:27721` | `initResetPasswordFlow` | `getElementById` | `"reset-invalid-view"` |
| `auth.js:27722` | `initResetPasswordFlow` | `getElementById` | `"reset-success-view"` |
| `auth.js:27899` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:27929` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:27931` | `ensureGoogleModal` | `querySelectorAll` | `"[data-auth-modal-close]"` |
| `auth.js:27935` | `ensureGoogleModal` | `querySelector` | `"#auth-google-form"` |
| `auth.js:27942` | `openGoogleModal` | `querySelector` | `"#auth-google-title"` |
| `auth.js:27943` | `openGoogleModal` | `querySelector` | `"#auth-google-copy"` |
| `auth.js:27944` | `openGoogleModal` | `querySelector` | `"#auth-google-error"` |
| `auth.js:27945` | `openGoogleModal` | `querySelector` | `"#auth-google-email"` |
| `auth.js:27962` | `closeGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:27974` | `startSupabaseGoogleAuth` | `getElementById` | `page === "signup" ? "signup-status" : "login-status"` |
| `auth.js:27975` | `startSupabaseGoogleAuth` | `getElementById` | `"login-remember"` |
| `auth.js:28012` | `handleGoogleSubmit` | `getElementById` | `"auth-google-modal"` |
| `auth.js:28014` | `handleGoogleSubmit` | `querySelector` | `"#auth-google-error"` |
| `auth.js:28139` | `initGoogleButtons` | `querySelectorAll` | `"[data-google-auth]"` |
| `auth.js:28158` | `initConfirmPage` | `getElementById` | `"confirm-status"` |
| `auth.js:28159` | `initConfirmPage` | `getElementById` | `"confirm-heading"` |
| `auth.js:28160` | `initConfirmPage` | `getElementById` | `"confirm-copy"` |
| `auth.js:28161` | `initConfirmPage` | `getElementById` | `"confirm-details"` |
| `auth.js:28215` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-form"` |
| `auth.js:28216` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-status"` |
| `auth.js:28217` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-workspace-id"` |
| `auth.js:28218` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-copy"` |
| `auth.js:28219` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-step-indicator"` |
| `auth.js:28220` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-review-panel"` |
| `auth.js:28221` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition"` |
| `auth.js:28222` | `initAdmissionsApplyPage` | `getElementById` | `"health-condition-details-wrap"` |
| `auth.js:28223` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition-details"` |
| `auth.js:28227` | `initAdmissionsApplyPage` | `querySelectorAll` | `'input[type="file"]'` |
| `auth.js:28245` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-brand-mark"` |
| `auth.js:28246` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-school-name"` |
| `auth.js:28433` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admissions-step]"` |
| `auth.js:28442` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-toast"` |
| `auth.js:28479` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:28515` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:28517` | `initAdmissionsApplyPage` | `querySelector` | `"[data-apply-file-selection]"` |
| `auth.js:28788` | `initAdmissionsApplyPage` | `closest` | `"[data-apply-file-remove]"` |
| `auth.js:28810` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-next]"` |
| `auth.js:28819` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-prev]"` |
| `auth.js:29144` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-date]"` |
| `auth.js:29145` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-lesson]"` |
| `auth.js:29146` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-form]"` |
| `auth.js:29147` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"#teacher-attendance-status"` |
| `auth.js:29175` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `".attendance-status-option input"` |
| `auth.js:29177` | `renderTeacherAttendanceWorkspace` | `closest` | `".attendance-status-picker"` |
| `auth.js:29184` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-mark-all]"` |
| `auth.js:29187` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `'.attendance-status-option input[value="present"]'` |
| `auth.js:29199` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:29203` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:29212` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:29244` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:29248` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:29249` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:30763` | `showReportCardToast` | `getElementById` | `"portal-report-card-toast"` |
| `auth.js:30812` | `loadReportCardPdfLibrary` | `querySelector` | `'script[data-report-card-pdf-library="true"]'` |
| `auth.js:31052` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:31079` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:31082` | `ensureReportCardModal` | `closest` | `"[data-report-card-close]"` |
| `auth.js:31085` | `ensureReportCardModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:31089` | `ensureReportCardModal` | `closest` | `"[data-report-card-print]"` |
| `auth.js:31094` | `ensureReportCardModal` | `closest` | `"[data-report-card-download]"` |
| `auth.js:31112` | `ensureReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:31126` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-body"` |
| `auth.js:31127` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-title"` |
| `auth.js:31139` | `openReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:31155` | `wireReportCardDocumentActions` | `closest` | `"[data-report-card-action]"` |
| `auth.js:31983` | `showPortalOnboardingModal` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:32075` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-close]"` |
| `auth.js:32076` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-skip]"` |
| `auth.js:32077` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-prev]"` |
| `auth.js:32078` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-next]"` |
| `auth.js:32079` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-step]"` |
| `auth.js:32080` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-open-section]"` |
| `auth.js:32126` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-metrics"` |
| `auth.js:32133` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-onboarding-checklist"` |
| `auth.js:32183` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-open-onboarding-guide]"` |
| `auth.js:32186` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-dismiss-onboarding-checklist]"` |
| `auth.js:32203` | `initPortalOnboarding` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:32246` | `initPortalAnnouncementToasts` | `getElementById` | `"portal-announcement-toast"` |
| `auth.js:32286` | `initPortalAnnouncementToasts` | `querySelector` | `".portal-announcement-toast-timer"` |
| `auth.js:32292` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-title]"` |
| `auth.js:32294` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-message]"` |
| `auth.js:32296` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-meta]"` |
| `auth.js:32320` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-close]"` |
| `auth.js:32431` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:32432` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:32752` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:32772` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:32783` | `renderStudentClassesSection` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:32788` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-title"` |
| `auth.js:32789` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-body"` |
| `auth.js:32800` | `renderStudentClassesSection` | `querySelectorAll` | `"[data-student-other-class-open]"` |
| `auth.js:32815` | `renderStudentClassesSection` | `closest` | `"[data-student-class-roster-close]"` |
| `auth.js:33153` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head h2"` |
| `auth.js:33154` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head span"` |
| `auth.js:33423` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:33424` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:33753` | `renderStaffTimetableWorkspace` | `querySelectorAll` | `"[data-staff-timetable-view]"` |
| `auth.js:33874` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:33894` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:33898` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-title"` |
| `auth.js:33899` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-body"` |
| `auth.js:33909` | `renderStaffClassesWorkspace` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:33934` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-open]"` |
| `auth.js:33952` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-roster-close]"` |
| `auth.js:34285` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:34293` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-class]"` |
| `auth.js:34298` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-subject]"` |
| `auth.js:34302` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-session]"` |
| `auth.js:34307` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-term]"` |
| `auth.js:34314` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:34315` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-components]"` |
| `auth.js:34317` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:34320` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-name]"` |
| `auth.js:34321` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-maximum]"` |
| `auth.js:34325` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(component.id)}"]`` |
| `auth.js:34333` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-component-total]"` |
| `auth.js:34338` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:34341` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-score="${CSS.escape(component.id)}"]`` |
| `auth.js:34346` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-student-total]"` |
| `auth.js:34353` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:34353` | `renderStaffGradebookWorkspace` | `matches` | `"[data-gradebook-score]"` |
| `auth.js:34357` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-add-component]"` |
| `auth.js:34372` | `renderStaffGradebookWorkspace` | `querySelector` | `".staff-gradebook-table thead th:last-child"` |
| `auth.js:34377` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:34388` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-remove-component]"` |
| `auth.js:34390` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:34394` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:34397` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(componentId)}"]`` |
| `auth.js:34398` | `renderStaffGradebookWorkspace` | `querySelectorAll` | ``[data-gradebook-score="${CSS.escape(componentId)}"]`` |
| `auth.js:34399` | `renderStaffGradebookWorkspace` | `closest` | `"td"` |
| `auth.js:34403` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-save]"` |
| `auth.js:34422` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-student="${CSS.escape(student.id)}"]`` |
| `auth.js:34536` | `collectStaffReportCardSubjects` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:34540` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:34541` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectCode"]'` |
| `auth.js:34542` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:34543` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:34906` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-context-form"` |
| `auth.js:34907` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-form"` |
| `auth.js:34938` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-status"` |
| `auth.js:34939` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-subject-rows"` |
| `auth.js:34941` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:34942` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:34943` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:34946` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-total]"` |
| `auth.js:34947` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-grade]"` |
| `auth.js:34951` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:34964` | `renderStaffResultsWorkspace` | `querySelector` | ``[data-report-editor-summary="${key}"]`` |
| `auth.js:35005` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:35010` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-add]"` |
| `auth.js:35011` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:35016` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:35021` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-remove]"` |
| `auth.js:35023` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:35024` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:35025` | `renderStaffResultsWorkspace` | `querySelector` | `"td"` |
| `auth.js:35032` | `renderStaffResultsWorkspace` | `closest` | `"[data-result-generate-summary]"` |
| `auth.js:35060` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-release]"` |
| `auth.js:35098` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-return-draft]"` |
| `auth.js:35529` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:35541` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:35545` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:35563` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:35567` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:35572` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:35576` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:35663` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:35664` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:35676` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:35677` | `renderStaffLessonPlansWorkspace` | `closest` | `"[data-lesson-attachment-remove]"` |
| `auth.js:35680` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:35684` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-reset]"` |
| `auth.js:35689` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-save-status]"` |
| `auth.js:35718` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:35721` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-action]"` |
| `auth.js:36119` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-history]"` |
| `auth.js:36124` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-picker]"` |
| `auth.js:36125` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-search]"` |
| `auth.js:36131` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:36137` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:36140` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-close]"` |
| `auth.js:36146` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:36153` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-group]"` |
| `auth.js:36154` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-key]:not([hidden])"` |
| `auth.js:36156` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-empty]"` |
| `auth.js:36161` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:36175` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-thread]"` |
| `auth.js:36188` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-delete-thread]"` |
| `auth.js:36217` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-composer]"` |
| `auth.js:36248` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-status]"` |
| `auth.js:36800` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-form"` |
| `auth.js:36801` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-status"` |
| `auth.js:36807` | `renderStaffLeaveWorkspace` | `querySelector` | `"[data-leave-days-output]"` |
| `auth.js:37201` | `wireNotificationReplyForms` | `closest` | `"[data-notification-parent-reply-form]"` |
| `auth.js:37223` | `wireNotificationReplyForms` | `querySelector` | `"button[type='submit']"` |
| `auth.js:37237` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:37264` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:37588` | `initDashboardGlobalSearch` | `getElementById` | `input.getAttribute("aria-controls") &#124;&#124; "admin-search-suggestions"` |
| `auth.js:37641` | `initPortalNotifications` | `getElementById` | `"admin-notification-list"` |
| `auth.js:37658` | `initPortalNotifications` | `getElementById` | `"admin-notification-dot"` |
| `auth.js:37683` | `initPortalNotifications` | `querySelectorAll` | `"[data-notification-close]"` |
| `auth.js:37738` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-main"` |
| `auth.js:37739` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:37745` | `initAdminSectionQuickNav` | `querySelector` | `".admin-section-quick-nav"` |
| `auth.js:37751` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-settings-subnav a"` |
| `auth.js:37780` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-surface-card"` |
| `auth.js:37781` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:37799` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:37810` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:37810` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:37845` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-section-quick-link"` |
| `auth.js:38067` | `loadPaystackInline` | `querySelector` | `'script[src="https://js.paystack.co/v2/inline.js"]'` |
| `auth.js:38533` | `renderParentChildSelector` | `querySelector` | `"#parent-child-switch"` |
| `auth.js:39150` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:39173` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:39176` | `ensureParentFeeInvoiceModal` | `closest` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:39178` | `ensureParentFeeInvoiceModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:39187` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-title"` |
| `auth.js:39188` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-body"` |
| `auth.js:39200` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:39207` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:39366` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-form"` |
| `auth.js:39367` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-status"` |
| `auth.js:39368` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-view]"` |
| `auth.js:39369` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:39388` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-amount"` |
| `auth.js:39408` | `renderParentFeesPage` | `querySelector` | `"button[type='submit']"` |
| `auth.js:40026` | `initParentFloatingChatbot` | `getElementById` | `"parent-floating-chatbot"` |
| `auth.js:40085` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-toggle]"` |
| `auth.js:40086` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-panel]"` |
| `auth.js:40087` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-close]"` |
| `auth.js:40088` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-thread]"` |
| `auth.js:40089` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-form]"` |
| `auth.js:40142` | `initParentFloatingChatbot` | `querySelectorAll` | `"[data-parent-chatbot-question]"` |
| `auth.js:40189` | `initParentPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:40190` | `initParentPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:40191` | `initParentPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:40192` | `initParentPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:40193` | `initParentPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:40194` | `initParentPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:40195` | `initParentPages` | `getElementById` | `"portal-gate"` |
| `auth.js:40196` | `initParentPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:40227` | `initParentPages` | `getElementById` | `"parent-child-switcher"` |
| `auth.js:40229` | `initParentPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:40230` | `initParentPages` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:40265` | `initParentPages` | `getElementById` | `"parent-page-content"` |
| `auth.js:40483` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-search"` |
| `auth.js:40484` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-role-filter"` |
| `auth.js:40485` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-status-filter"` |
| `auth.js:40641` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-metrics"` |
| `auth.js:40642` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-users"` |
| `auth.js:40643` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-workspaces"` |
| `auth.js:40644` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-activity"` |
| `auth.js:40646` | `refreshSuperAdminConsole` | `getElementById` | `"portal-last-updated"` |
| `auth.js:40653` | `handleSuperAdminUserAction` | `closest` | `"[data-super-user-action]"` |
| `auth.js:40794` | `initSuperAdminPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:40795` | `initSuperAdminPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:40796` | `initSuperAdminPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:40797` | `initSuperAdminPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:40798` | `initSuperAdminPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:40799` | `initSuperAdminPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:40800` | `initSuperAdminPage` | `getElementById` | `"portal-gate"` |
| `auth.js:40801` | `initSuperAdminPage` | `getElementById` | `"super-admin-status"` |
| `auth.js:40802` | `initSuperAdminPage` | `getElementById` | `"super-admin-users"` |
| `auth.js:40829` | `initSuperAdminPage` | `querySelectorAll` | `"[data-super-refresh]"` |
| `auth.js:40836` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:40837` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:40855` | `initAdminShellPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:40856` | `initAdminShellPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:40857` | `initAdminShellPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:40858` | `initAdminShellPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:40859` | `initAdminShellPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:40860` | `initAdminShellPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:40861` | `initAdminShellPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:40862` | `initAdminShellPages` | `getElementById` | `"portal-gate"` |
| `auth.js:41245` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="applications"]'` |
| `auth.js:41246` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="history"]'` |
| `auth.js:41261` | `initAdmissionsControls` | `getElementById` | `"portal-admission-submit-button"` |
| `auth.js:41261` | `initAdmissionsControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:41262` | `initAdmissionsControls` | `getElementById` | `"portal-admission-cancel-edit"` |
| `auth.js:41263` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-overlay"` |
| `auth.js:41264` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-title"` |
| `auth.js:41265` | `initAdmissionsControls` | `querySelector` | `"[data-admission-form-open]"` |
| `auth.js:41362` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-form-close]"` |
| `auth.js:41375` | `initAdmissionsControls` | `getElementById` | `"portal-admission-approval-toast"` |
| `auth.js:41418` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal"` |
| `auth.js:41419` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal-body"` |
| `auth.js:41422` | `initAdmissionsControls` | `closest` | `"[data-admission-close]"` |
| `auth.js:41428` | `initAdmissionsControls` | `closest` | `"[data-admission-action]"` |
| `auth.js:41536` | `initAdmissionsControls` | `getElementById` | `"portal-admission-link-value"` |
| `auth.js:41537` | `initAdmissionsControls` | `getElementById` | `"portal-admission-copy-link"` |
| `auth.js:41538` | `initAdmissionsControls` | `getElementById` | `"portal-admission-open-link"` |
| `auth.js:41539` | `initAdmissionsControls` | `getElementById` | `"portal-admission-qr-image"` |
| `auth.js:42004` | `initAdmissionsControls` | `closest` | `"[data-admission-delete]"` |
| `auth.js:42014` | `initAdmissionsControls` | `closest` | `"[data-admission-open]"` |
| `auth.js:42030` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-delete-all]"` |
| `auth.js:42076` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-form"` |
| `auth.js:42077` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-status"` |
| `auth.js:42078` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-summary"` |
| `auth.js:42079` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-list"` |
| `auth.js:42080` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-history"` |
| `auth.js:42081` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-apply-link"` |
| `auth.js:42083` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-config-summary"` |
| `auth.js:42084` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-form"` |
| `auth.js:42085` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-status"` |
| `auth.js:42086` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-class-picker"` |
| `auth.js:42087` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-preview"` |
| `auth.js:42254` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-title"` |
| `auth.js:42255` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-copy"` |
| `auth.js:42256` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-school-name"` |
| `auth.js:42257` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-brand-mark"` |
| `auth.js:42258` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-kicker"` |
| `auth.js:42259` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-title"` |
| `auth.js:42260` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-copy"` |
| `auth.js:42385` | `initSelfRegisterPage` | `getElementById` | `"self-register-form"` |
| `auth.js:42386` | `initSelfRegisterPage` | `getElementById` | `"self-register-status"` |
| `auth.js:42387` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-student]"` |
| `auth.js:42388` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-staff]"` |
| `auth.js:42389` | `initSelfRegisterPage` | `getElementById` | `"self-student-level"` |
| `auth.js:42390` | `initSelfRegisterPage` | `getElementById` | `"self-register-submit"` |
| `auth.js:42566` | `initAdminStudentsPage` | `getElementById` | `"portal-student-summary"` |
| `auth.js:42567` | `initAdminStudentsPage` | `getElementById` | `"portal-student-form"` |
| `auth.js:42568` | `initAdminStudentsPage` | `getElementById` | `"portal-student-status"` |
| `auth.js:42569` | `initAdminStudentsPage` | `getElementById` | `"portal-student-list"` |
| `auth.js:42570` | `initAdminStudentsPage` | `getElementById` | `"portal-guardian-list"` |
| `auth.js:42571` | `initAdminStudentsPage` | `querySelector` | `"[data-student-form-toggle]"` |
| `auth.js:42587` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-link"` |
| `auth.js:42588` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-copy]"` |
| `auth.js:42589` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-open]"` |
| `auth.js:42590` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-status"` |
| `auth.js:42601` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-summary"` |
| `auth.js:42602` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-form"` |
| `auth.js:42603` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-status"` |
| `auth.js:42604` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-list"` |
| `auth.js:42605` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-summary"` |
| `auth.js:42606` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-list"` |
| `auth.js:42607` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-review-status"` |
| `auth.js:42608` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-status-filter"` |
| `auth.js:42621` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-link"` |
| `auth.js:42622` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-copy]"` |
| `auth.js:42623` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-open]"` |
| `auth.js:42624` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-status"` |
| `auth.js:42644` | `initAdminClassesPage` | `getElementById` | `"portal-class-summary"` |
| `auth.js:42645` | `initAdminClassesPage` | `getElementById` | `"portal-class-form"` |
| `auth.js:42646` | `initAdminClassesPage` | `getElementById` | `"portal-class-status"` |
| `auth.js:42647` | `initAdminClassesPage` | `getElementById` | `"portal-class-list"` |
| `auth.js:42672` | `initAdminCoursesPage` | `getElementById` | `"portal-course-summary"` |
| `auth.js:42673` | `initAdminCoursesPage` | `getElementById` | `"portal-course-form"` |
| `auth.js:42674` | `initAdminCoursesPage` | `getElementById` | `"portal-course-status"` |
| `auth.js:42675` | `initAdminCoursesPage` | `getElementById` | `"portal-course-list"` |
| `auth.js:42698` | `initAdminSchedulePage` | `getElementById` | `"portal-calendar-summary"` |
| `auth.js:42699` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-form"` |
| `auth.js:42700` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-status"` |
| `auth.js:42701` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-list"` |
| `auth.js:42703` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-summary"` |
| `auth.js:42704` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-form"` |
| `auth.js:42705` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-status"` |
| `auth.js:42706` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-list"` |
| `auth.js:42735` | `initAdminFeesPage` | `getElementById` | `"portal-fee-summary"` |
| `auth.js:42736` | `initAdminFeesPage` | `getElementById` | `"portal-fee-form"` |
| `auth.js:42737` | `initAdminFeesPage` | `getElementById` | `"portal-fee-status"` |
| `auth.js:42738` | `initAdminFeesPage` | `getElementById` | `"portal-fee-list"` |
| `auth.js:42739` | `initAdminFeesPage` | `getElementById` | `"portal-fee-setup-notice"` |
| `auth.js:42764` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-summary"` |
| `auth.js:42765` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-status"` |
| `auth.js:42766` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-review-list"` |
| `auth.js:42767` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-submission-list"` |
| `auth.js:42768` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-view]"` |
| `auth.js:42769` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date]"` |
| `auth.js:42770` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term]"` |
| `auth.js:42771` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-class]"` |
| `auth.js:42772` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-student]"` |
| `auth.js:42773` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status]"` |
| `auth.js:42774` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-search]"` |
| `auth.js:42775` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date-wrap]"` |
| `auth.js:42776` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term-wrap]"` |
| `auth.js:42777` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status-wrap]"` |
| `auth.js:42778` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-copy]"` |
| `auth.js:42779` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-submission-copy]"` |
| `auth.js:42885` | `wireAdminReportParentMessages` | `closest` | `"[data-admin-report-parent-reply-form]"` |
| `auth.js:42909` | `wireAdminReportParentMessages` | `querySelector` | `"button[type='submit']"` |
| `auth.js:43301` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment"` |
| `auth.js:43302` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-session"` |
| `auth.js:43303` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-class"` |
| `auth.js:43304` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-gender"` |
| `auth.js:43387` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance"` |
| `auth.js:43388` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-session"` |
| `auth.js:43389` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-class"` |
| `auth.js:43390` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-subject"` |
| `auth.js:43517` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:43518` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:43519` | `renderAdminAnnouncementSection` | `querySelector` | `"[data-announcement-class-wrap]"` |
| `auth.js:43520` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-class-options"` |
| `auth.js:43521` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-list"` |
| `auth.js:43528` | `renderAdminAnnouncementSection` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:43728` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-kpis"` |
| `auth.js:43729` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-insights"` |
| `auth.js:43730` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-health"` |
| `auth.js:43731` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-areas"` |
| `auth.js:43732` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-checklist"` |
| `auth.js:44000` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:44001` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:44038` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="roleTargets"]:checked'` |
| `auth.js:44043` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:44163` | `initAdminReportsPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:44188` | `initAdminReportsPage` | `getElementById` | `id` |
| `auth.js:44191` | `initAdminReportsPage` | `querySelectorAll` | `"[data-admin-report-export]"` |
| `auth.js:44223` | `initAdminMessagesPage` | `getElementById` | `"admin-report-parent-messages"` |
| `auth.js:44224` | `initAdminMessagesPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:44253` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-summary"` |
| `auth.js:44254` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-grid"` |
| `auth.js:44255` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-status"` |
| `auth.js:44272` | `initReportConfigurationControls` | `querySelector` | `"[data-grading-scale-add]"` |
| `auth.js:44273` | `initReportConfigurationControls` | `querySelector` | `"[data-report-configuration-reset]"` |
| `auth.js:44276` | `initReportConfigurationControls` | `querySelector` | `"[data-score-structure-total]"` |
| `auth.js:44277` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-score-preset]"` |
| `auth.js:44361` | `initReportConfigurationControls` | `querySelector` | `'input[name="minimum"]'` |
| `auth.js:44365` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-remove]"` |
| `auth.js:44367` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:44371` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-row]"` |
| `auth.js:44391` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:44392` | `initReportConfigurationControls` | `querySelector` | `'[name="minimum"]'` |
| `auth.js:44393` | `initReportConfigurationControls` | `querySelector` | `'[name="grade"]'` |
| `auth.js:44394` | `initReportConfigurationControls` | `querySelector` | `'[name="remark"]'` |
| `auth.js:44474` | `initReportSchoolCommentControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:44755` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-preview"` |
| `auth.js:44756` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-form"` |
| `auth.js:44757` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-status"` |
| `auth.js:44758` | `initAdminSettingsPage` | `getElementById` | `"portal-access-summary"` |
| `auth.js:44759` | `initAdminSettingsPage` | `getElementById` | `"portal-access-form"` |
| `auth.js:44760` | `initAdminSettingsPage` | `getElementById` | `"portal-access-status"` |
| `auth.js:44761` | `initAdminSettingsPage` | `getElementById` | `"portal-access-list"` |
| `auth.js:44762` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-summary"` |
| `auth.js:44763` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-grid"` |
| `auth.js:44764` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-status"` |
| `auth.js:44765` | `initAdminSettingsPage` | `querySelector` | `"[data-reset-role-permissions]"` |
| `auth.js:44766` | `initAdminSettingsPage` | `querySelector` | `"[data-save-role-permissions]"` |
| `auth.js:44767` | `initAdminSettingsPage` | `getElementById` | `"portal-academic-cycle-summary"` |
| `auth.js:44768` | `initAdminSettingsPage` | `getElementById` | `"portal-session-form"` |
| `auth.js:44769` | `initAdminSettingsPage` | `getElementById` | `"portal-session-status"` |
| `auth.js:44770` | `initAdminSettingsPage` | `getElementById` | `"portal-session-list"` |
| `auth.js:44771` | `initAdminSettingsPage` | `getElementById` | `"portal-term-form"` |
| `auth.js:44772` | `initAdminSettingsPage` | `getElementById` | `"portal-term-status"` |
| `auth.js:44773` | `initAdminSettingsPage` | `getElementById` | `"portal-term-list"` |
| `auth.js:44774` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-form"` |
| `auth.js:44775` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-status"` |
| `auth.js:44776` | `initAdminSettingsPage` | `getElementById` | `"portal-grading-scale-list"` |
| `auth.js:44777` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-form"` |
| `auth.js:44778` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-status"` |
| `auth.js:44779` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-summary"` |
| `auth.js:44780` | `initAdminSettingsPage` | `querySelector` | `"[data-delete-school-account]"` |
| `auth.js:44781` | `initAdminSettingsPage` | `getElementById` | `"portal-account-delete-status"` |
| `auth.js:44790` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:44791` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:44792` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:44858` | `initUserSettingsPage` | `getElementById` | `"user-settings-form"` |
| `auth.js:44859` | `initUserSettingsPage` | `getElementById` | `"user-settings-status"` |
| `auth.js:44860` | `initUserSettingsPage` | `getElementById` | `"user-settings-name"` |
| `auth.js:44861` | `initUserSettingsPage` | `getElementById` | `"user-settings-role"` |
| `auth.js:44862` | `initUserSettingsPage` | `getElementById` | `"user-settings-email"` |
| `auth.js:44863` | `initUserSettingsPage` | `getElementById` | `"user-profile-form"` |
| `auth.js:44864` | `initUserSettingsPage` | `getElementById` | `"user-profile-status"` |
| `auth.js:44865` | `initUserSettingsPage` | `getElementById` | `"user-settings-photo-preview"` |
| `auth.js:44866` | `initUserSettingsPage` | `getElementById` | `"user-profile-photo"` |
| `auth.js:44867` | `initUserSettingsPage` | `querySelector` | `"[data-user-profile-remove-photo]"` |
| `auth.js:44868` | `initUserSettingsPage` | `getElementById` | `"user-settings-hint"` |
| `auth.js:44869` | `initUserSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:44870` | `initUserSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:44871` | `initUserSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:44872` | `initUserSettingsPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:44873` | `initUserSettingsPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:44874` | `initUserSettingsPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:44875` | `initUserSettingsPage` | `getElementById` | `"portal-heading"` |
| `auth.js:44876` | `initUserSettingsPage` | `getElementById` | `"portal-copy"` |
| `auth.js:44877` | `initUserSettingsPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:44878` | `initUserSettingsPage` | `getElementById` | `"portal-gate"` |
| `auth.js:44879` | `initUserSettingsPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:44880` | `initUserSettingsPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:44881` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-form"` |
| `auth.js:44882` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-status"` |
| `auth.js:44907` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:44910` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:44980` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:44983` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:44991` | `initUserSettingsPage` | `matches` | `"[data-notification-preference]"` |
| `auth.js:44992` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:44998` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:45168` | `initUserSettingsPage` | `closest` | `".admin-surface-card"` |
| `auth.js:45170` | `initUserSettingsPage` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:45366` | `initStaffPortalPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:45367` | `initStaffPortalPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:45368` | `initStaffPortalPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:45369` | `initStaffPortalPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:45370` | `initStaffPortalPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:45371` | `initStaffPortalPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:45372` | `initStaffPortalPages` | `getElementById` | `"portal-heading"` |
| `auth.js:45373` | `initStaffPortalPages` | `getElementById` | `"portal-copy"` |
| `auth.js:45374` | `initStaffPortalPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:45375` | `initStaffPortalPages` | `getElementById` | `"portal-gate"` |
| `auth.js:45376` | `initStaffPortalPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:45377` | `initStaffPortalPages` | `getElementById` | `"admin-global-search"` |
| `auth.js:45378` | `initStaffPortalPages` | `getElementById` | `"staff-page-content"` |
| `auth.js:45471` | `initPortalPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:45472` | `initPortalPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:45473` | `initPortalPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:45474` | `initPortalPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:45475` | `initPortalPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:45476` | `initPortalPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:45477` | `initPortalPage` | `getElementById` | `"portal-heading"` |
| `auth.js:45478` | `initPortalPage` | `getElementById` | `"portal-copy"` |
| `auth.js:45479` | `initPortalPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:45480` | `initPortalPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:45481` | `initPortalPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:45482` | `initPortalPage` | `getElementById` | `"portal-metrics"` |
| `auth.js:45483` | `initPortalPage` | `getElementById` | `"admin-events"` |
| `auth.js:45484` | `initPortalPage` | `getElementById` | `"admin-activity"` |
| `auth.js:45485` | `initPortalPage` | `getElementById` | `"portal-links"` |
| `auth.js:45486` | `initPortalPage` | `getElementById` | `"portal-details"` |
| `auth.js:45487` | `initPortalPage` | `getElementById` | `"staff-portal-workspace"` |
| `auth.js:45488` | `initPortalPage` | `getElementById` | `"student-portal-workspace"` |
| `auth.js:45489` | `initPortalPage` | `getElementById` | `"teacher-attendance-workspace"` |
| `auth.js:45490` | `initPortalPage` | `getElementById` | `"portal-gate"` |
| `auth.js:45726` | `initPortalPage` | `closest` | `".admin-primary-grid"` |
| `auth.js:45726` | `initPortalPage` | `closest` | `".admin-surface-card"` |
| `auth.js:45740` | `initPortalPage` | `querySelector` | `".admin-sidebar-nav"` |
| `self-registration-links.js:77` | `initRegistrationLinkCard` | `getElementById` | `inputId` |
| `self-registration-links.js:78` | `initRegistrationLinkCard` | `querySelector` | `copySelector` |
| `self-registration-links.js:79` | `initRegistrationLinkCard` | `querySelector` | `openSelector` |
| `self-registration-links.js:80` | `initRegistrationLinkCard` | `getElementById` | `statusId` |
| `admin-messages.html:inline@593:222` | `startup/inline` | `querySelectorAll` | `".ss-inbox-thread-item"` |
| `admin-messages.html:inline@593:300` | `startup/inline` | `querySelector` | `"#ss-chat-scroll"` |
| `admin-messages.html:inline@593:304` | `startup/inline` | `querySelector` | `"#ss-reply-input"` |
| `admin-messages.html:inline@593:305` | `startup/inline` | `querySelector` | `"#ss-send-btn"` |
| `admin-messages.html:inline@593:353` | `startup/inline` | `querySelectorAll` | `"[data-admin-report-parent-reply-form]"` |
| `admin-messages.html:inline@593:411` | `startup/inline` | `getElementById` | `"ss-chat-pane"` |
| `admin-messages.html:inline@593:448` | `startup/inline` | `querySelector` | `"#ss-inbox-list"` |
| `admin-messages.html:inline@593:449` | `startup/inline` | `querySelector` | `"#ss-chat-pane"` |
| `admin-messages.html:inline@593:450` | `startup/inline` | `querySelector` | `"#ss-search"` |
| `admin-messages.html:inline@593:500` | `startup/inline` | `getElementById` | `"admin-report-parent-messages"` |
| `admin-messages.html:inline@593:512` | `startup/inline` | `querySelector` | `".ss-inbox"` |
| `admin-messages.html:inline@593:531` | `startup/inline` | `getElementById` | `"admin-report-parent-messages"` |

### URL/query/hash construction and lookup sites

Keep root HTML routes and document-relative paths. Do not replace window.location-based URL resolution with module-relative import.meta.url for page links. Preserve token, code and recovery handling; workspace/institution admission parameters; type/workspace registration parameters; student portal and quick-navigation hashes; print/download/blob URLs and external links. No token values are documented.

| Location | Owner | Expression |
| --- | --- | --- |
| `auth.js:3429` | `buildSupabaseRedirectUrl` | `new URL("./", window.location.href)` |
| `auth.js:3431` | `buildSupabaseRedirectUrl` | `new URL(targetPath, baseUrl)` |
| `auth.js:7727` | `getPageIdFromHref` | `new URL(href, window.location.href)` |
| `auth.js:27723` | `initResetPasswordFlow` | `new URLSearchParams(window.location.search)` |
| `auth.js:27724` | `initResetPasswordFlow` | `params.get("token")` |
| `auth.js:27725` | `initResetPasswordFlow` | `params.get("code")` |
| `auth.js:27737` | `initResetPasswordFlow` | `params.get("type")` |
| `auth.js:28162` | `initConfirmPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:28163` | `initConfirmPage` | `params.get("token")` |
| `auth.js:28233` | `initAdmissionsApplyPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:28234` | `initAdmissionsApplyPage` | `params.get("workspace")` |
| `auth.js:28235` | `initAdmissionsApplyPage` | `params.get("institution")` |
| `auth.js:41543` | `initAdmissionsControls` | `new URL("./admissions-apply.html", window.location.href)` |
| `auth.js:41544` | `initAdmissionsControls` | `linkUrl.searchParams.set("workspace", workspaceId)` |
| `auth.js:41546` | `initAdmissionsControls` | `linkUrl.searchParams.set("institution", institutionId)` |
| `auth.js:42113` | `buildSelfRegistrationUrl` | `new URL("./self-register.html", window.location.href)` |
| `auth.js:42114` | `buildSelfRegistrationUrl` | `url.searchParams.set("type", registrationType)` |
| `auth.js:42115` | `buildSelfRegistrationUrl` | `url.searchParams.set("workspace", getCurrentWorkspaceId())` |
| `auth.js:42382` | `initSelfRegisterPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:42383` | `initSelfRegisterPage` | `params.get("type")` |
| `auth.js:42384` | `initSelfRegisterPage` | `params.get("workspace")` |
| `self-registration-links.js:39` | `buildRegistrationUrl` | `new URL("./self-register.html", window.location.href)` |
| `self-registration-links.js:40` | `buildRegistrationUrl` | `url.searchParams.set("type", registrationType)` |
| `self-registration-links.js:41` | `buildRegistrationUrl` | `url.searchParams.set("workspace", getWorkspaceId())` |
| `supabase-config.js:1` | `schoolSphereAppBaseUrl` | `new URL("./", window.location.href)` |

### Role routing and permission map owners

The HTML manifest gives every current page identifier. Roles are Super Admin, Admin, Teacher, Student and Parent. Aliases and fallbacks must remain unchanged. Role home defaults are super-admin.html, portal.html for Admin/Student, staff-dashboard.html for Teacher, and parent-portal.html for Parent; inspect getPostLoginRoute and guards for conditional overrides.

| Mapping/owner | Location | Depends on |
| --- | --- | --- |
| `ROLE_HOME_ROUTES` | `auth.js:123-129` | `SUPER_ADMIN_ROLE` |
| `PARENT_SETTINGS_PAGE` | `auth.js:130` | Literal map |
| `PARENT_PAGE_ROUTES` | `auth.js:131-139` | Literal map |
| `PARENT_PAGE_PERMISSION_KEYS` | `auth.js:140-148` | Literal map |
| `PAGE_PERMISSION_KEYS` | `auth.js:232-262` | Literal map |
| `STAFF_PORTAL_PAGE_CONFIG` | `auth.js:330-376` | Literal map |
| `STUDENT_PORTAL_LINKS` | `auth.js:378-442` | Literal map |
| `ADMIN_SETTINGS_PAGES` | `auth.js:444-451` | Literal map |
| `getPostLoginRoute` | `auth.js:769-772` | `DEFAULT_AUTH_ROLE`, `getRoleHomeRoute`, `normalizeRoleLabel` |
| `normalizeRoleLabel` | `auth.js:1371-1407` | `DEFAULT_AUTH_ROLE`, `SUPER_ADMIN_ROLE` |
| `canAccessPermission` | `auth.js:7799-7825` | `DEFAULT_AUTH_ROLE`, `getRolePermissionSnapshot`, `normalizeRoleLabel` |
| `getAdminAccessContext` | `auth.js:9019-9051` | `DEFAULT_AUTH_ROLE`, `clearSession`, `getSession`, `getUsers`, `normalizeRoleLabel` |

Client permission checks do not replace server authorization/RLS. Preserving a role label alone is insufficient; preserve page, action, feature-toggle and record-scope checks.

## Supabase configuration and client

Retain supabase-config.js as a classic script initially. Its siteUrl derives from new URL("./", window.location.href), redirectPath is portal.html, emailRedirectPath is login.html, and function names are provision-user, submit-admission, submit-registration and delete-school-account. url/anonKey/paystackPublicKey values are intentionally omitted.

getSupabaseClient (auth.js:3494) caches the client promise; persistSession, autoRefreshToken and detectSessionInUrl are enabled. The browser SDK is dynamically loaded from jsDelivr @supabase/supabase-js@2 with a data-supabase-sdk marker. Preserve one SDK load/client and existing failure behavior. Server functions import the SDK through esm.sh and require SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY environment variable names; values belong only in server configuration.

### Workspace synchronization

- loadWorkspaceStatePayloadFromSupabase/saveWorkspaceStatePayloadToSupabase prefer table-native adapters and fall back to workspace_states where unhandled. Preserve handled flags, return shapes, institution/record identifiers, upsert conflict columns and timestamp conversion.
- initSupabaseWorkspaceStateLiveSync (5092) is an event-driven local-to-remote writer, not evidence of a realtime channel. It uses a closure-owned Map with a 260 ms per-state debounce. Admin binds the full supported manager set; Teacher binds report cards and gradebook only; other roles return.
- isHydratingWorkspaceStateFromSupabase suppresses sync while hydrating. Preserve its try/finally lifecycle, local fallback data preservation and event detail variant.
- Report cards have special stale-row deletion handling; do not generalize every collection to the same save/delete policy.
- WORKSPACE_SCOPED_STATE_KEYS and SUPABASE_WORKSPACE_HYDRATE_KEYS differ. Lesson plans, leave, audit, attendance and other collections must retain their actual current storage/sync paths, not be automatically included in a new registry.
- No deployed configuration or RLS behavior was queried. Repository SQL is source evidence only.

### Browser table access sites

| Table | Owners / locations |
| --- | --- |
| `classes` | `loadTableNativeStatePayloadFromSupabase` @`auth.js:4219` |
| `feature_modules` | `loadTableNativeStatePayloadFromSupabase` @`auth.js:4169`, `saveTableNativeStatePayloadToSupabase` @`auth.js:4335` |
| `institutions` | `ensureSupabaseInstitutionId` @`auth.js:3793`, `syncInstitutionSnapshot` @`auth.js:3846`, `hydrateSchoolSettingsFromSupabase` @`auth.js:3927`, `initAdmissionsApplyPage` @`auth.js:28315` |
| `profiles` | `ensureSupabaseInstitutionId` @`auth.js:3776`, `ensureSupabaseInstitutionId` @`auth.js:3808`, `hydrateSchoolSettingsFromSupabase` @`auth.js:3915` |
| `role_permissions` | `loadTableNativeStatePayloadFromSupabase` @`auth.js:4192`, `saveTableNativeStatePayloadToSupabase` @`auth.js:4364` |
| `workspace_migration_runs` | `migrateWorkspaceStateToSupabase` @`auth.js:5331` |
| `workspace_states` | `loadWorkspaceStatePayloadFromSupabase` @`auth.js:4872`, `saveWorkspaceStatePayloadToSupabase` @`auth.js:4924` |

Table names computed from adapter configuration also require the mapping below.

| Adapter source | Table |
| --- | --- |
| `auth.js:4434` | `courses` |
| `auth.js:4464` | `students` |
| `auth.js:4503` | `report_cards` |
| `auth.js:4531` | `gradebook_records` |
| `auth.js:4556` | `fee_items` |
| `auth.js:4586` | `academic_cycles_state` |
| `auth.js:4601` | `admission_config_state` |
| `auth.js:4616` | `admissions_applications` |
| `auth.js:4641` | `parent_fee_records` |
| `auth.js:4655` | `access_grants` |
| `auth.js:4681` | `notifications_log` |
| `auth.js:4706` | `academic_calendar_events` |
| `auth.js:4730` | `timetable_entries` |
| `auth.js:4762` | `timetable_periods` |
| `auth.js:4787` | `timetable_rooms` |
| `auth.js:4809` | `timetable_substitutions` |

## Edge function interfaces (retain server-side)

All four source functions support POST and OPTIONS with CORS headers allowing authorization, x-client-info, apikey and content-type; unsupported methods return 405. Error envelopes generally contain {ok:false,message}. The hosted gateway/JWT settings were NOT verified.

### delete-school-account

`supabase/functions/delete-school-account/index.ts`

Requires authenticated caller and an Admin profile linked to an institution. Request confirmation must exactly match DELETE ACCOUNT. The browser also sends schoolName, but this server currently reads confirmation only. Deletes the institution, then attempts linked Auth-user deletions with caller last. HTTP 207 carries ok:true/status:partial plus failedUsers; never treat that as complete deletion. Run destructive checks only against an explicitly disposable environment, never during this documentation task.

Directly read request/helper payload properties: `payload.confirmation`. These are AST member accesses, not a complete schema: spread payloads retain additional fields.

| HTTP status | Response source line | Top-level response keys |
| --- | --- | --- |
| 405 | `supabase/functions/delete-school-account/index.ts:47` | `ok`, `message` |
| 500 | `supabase/functions/delete-school-account/index.ts:56` | `ok`, `message` |
| 401 | `supabase/functions/delete-school-account/index.ts:60` | `ok`, `message` |
| 401 | `supabase/functions/delete-school-account/index.ts:88` | `ok`, `message` |
| 403 | `supabase/functions/delete-school-account/index.ts:98` | `ok`, `message` |
| 403 | `supabase/functions/delete-school-account/index.ts:102` | `ok`, `message` |
| 400 | `supabase/functions/delete-school-account/index.ts:107` | `ok`, `message` |
| 400 | `supabase/functions/delete-school-account/index.ts:114` | `ok`, `message` |
| 400 | `supabase/functions/delete-school-account/index.ts:118` | `ok`, `message` |
| 404 | `supabase/functions/delete-school-account/index.ts:128` | `ok`, `message` |
| 500 | `supabase/functions/delete-school-account/index.ts:137` | `ok`, `message` |
| 500 | `supabase/functions/delete-school-account/index.ts:158` | `ok`, `message` |
| 207 | `supabase/functions/delete-school-account/index.ts:184` | `ok`, `status`, `message`, `deletedUsers`, `failedUsers`, `institutionId` |
| 200 | `supabase/functions/delete-school-account/index.ts:194` | `ok`, `status`, `message`, `deletedUsers`, `institutionId` |

Tables: `profiles`, `institutions`.

### provision-user

`supabase/functions/provision-user/index.ts`

Requires bearer authentication and an Admin profile with institution_id. Provision request fields include email, displayName, password, role, workspaceId, mustChangePassword; action defaults to provision. Delete uses {action:"delete",email}, checks same institution and prevents Admin deletion in that branch. Preserve create/update/existing_google/not_found/deleted outcomes and local mirroring. This is not a security audit of all branches.

Directly read request/helper payload properties: `payload.action`, `payload.displayName`, `payload.email`, `payload.mustChangePassword`, `payload.password`, `payload.role`, `payload.workspaceId`. These are AST member accesses, not a complete schema: spread payloads retain additional fields.

| HTTP status | Response source line | Top-level response keys |
| --- | --- | --- |
| 405 | `supabase/functions/provision-user/index.ts:97` | `ok`, `message` |
| 500 | `supabase/functions/provision-user/index.ts:106` | `ok`, `message` |
| 401 | `supabase/functions/provision-user/index.ts:110` | `ok`, `message` |
| 401 | `supabase/functions/provision-user/index.ts:138` | `ok`, `message` |
| 403 | `supabase/functions/provision-user/index.ts:148` | `ok`, `message` |
| 403 | `supabase/functions/provision-user/index.ts:154` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:158` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:168` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:181` | `ok`, `message` |
| 200 | `supabase/functions/provision-user/index.ts:188` | `ok`, `status` |
| 500 | `supabase/functions/provision-user/index.ts:198` | `ok`, `message` |
| 404 | `supabase/functions/provision-user/index.ts:205` | `ok`, `message` |
| 403 | `supabase/functions/provision-user/index.ts:209` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:213` | `ok`, `message` |
| 500 | `supabase/functions/provision-user/index.ts:218` | `ok`, `message` |
| 200 | `supabase/functions/provision-user/index.ts:224` | `ok`, `status`, `userId` |
| 400 | `supabase/functions/provision-user/index.ts:232` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:236` | `ok`, `message` |
| 400 | `supabase/functions/provision-user/index.ts:257` | `ok`, `message` |
| 500 | `supabase/functions/provision-user/index.ts:282` | `ok`, `message` |
| 200 | `supabase/functions/provision-user/index.ts:292` | `ok`, `status`, `user` |

Tables: `profiles`.

### submit-admission

`supabase/functions/submit-admission/index.ts`

Public application endpoint; source expects gateway JWT verification disabled and validates apikey against the project public key. Request is {workspaceId,institutionId?,payload}. Validates student name, class and guardian contact fields, normalizes the payload, resolves institution/admin, and upserts admissions_applications on institution_id,record_id. Preserve original payload fields and canonical aliases.

Directly read request/helper payload properties: `body.institutionId`, `body.payload`, `body.workspaceId`, `payload.firstName`, `payload.fullName`, `payload.lastName`, `payload.middleName`, `rawPayload.academicClassApplyingFor`, `rawPayload.applicationStage`, `rawPayload.classApplyingFor`, `rawPayload.email`, `rawPayload.guardianEmail`, `rawPayload.guardianFullName`, `rawPayload.guardianName`, `rawPayload.id`, `rawPayload.level`, `rawPayload.source`, `rawPayload.status`, `rawPayload.workspaceId`. These are AST member accesses, not a complete schema: spread payloads retain additional fields.

| HTTP status | Response source line | Top-level response keys |
| --- | --- | --- |
| 405 | `supabase/functions/submit-admission/index.ts:131` | `ok`, `message` |
| 500 | `supabase/functions/submit-admission/index.ts:139` | `ok`, `message` |
| 401 | `supabase/functions/submit-admission/index.ts:146` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:156` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:167` | `ok`, `message` |
| 500 | `supabase/functions/submit-admission/index.ts:190` | `ok`, `message` |
| 404 | `supabase/functions/submit-admission/index.ts:194` | `ok`, `message` |
| 500 | `supabase/functions/submit-admission/index.ts:203` | `ok`, `message` |
| 404 | `supabase/functions/submit-admission/index.ts:210` | `ok`, `message` |
| 500 | `supabase/functions/submit-admission/index.ts:221` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:228` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:242` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:246` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:250` | `ok`, `message` |
| 400 | `supabase/functions/submit-admission/index.ts:258` | `ok`, `message` |
| 500 | `supabase/functions/submit-admission/index.ts:301` | `ok`, `message` |
| 200 | `supabase/functions/submit-admission/index.ts:307` | `ok`, `status`, `institutionId`, `workspaceId`, `record` |

Tables: `profiles`, `institutions`, `admissions_applications`.

### submit-registration

`supabase/functions/submit-registration/index.ts`

Public endpoint with apikey validation; request is {action:"config"|"submit",type:"student"|"staff",workspaceId,institutionId?,payload?}. Config returns classes/levels and school metadata. Staff submission provisions Teacher; student submission stores a student record and attempts student/guardian accounts. Warnings may accompany success. Preserve generated admission numbers, class allocation, user metadata, local mirrors and password-change policy; default password values are deliberately omitted.

Directly read request/helper payload properties: `body.action`, `body.institutionId`, `body.payload`, `body.type`, `body.workspaceId`, `payload.admissionNo`, `payload.classId`, `payload.classRecordId`, `payload.displayName`, `payload.firstName`, `payload.fullName`, `payload.lastName`, `payload.level`, `payload.middleName`, `rawPayload.admissionNo`, `rawPayload.dateOfBirth`, `rawPayload.department`, `rawPayload.displayName`, `rawPayload.email`, `rawPayload.faculty`, `rawPayload.firstName`, `rawPayload.fullName`, `rawPayload.gender`, `rawPayload.guardianAddress`, `rawPayload.guardianEmail`, `rawPayload.guardianFullName`, `rawPayload.guardianName`, `rawPayload.guardianPhone`, `rawPayload.guardianRelationship`, `rawPayload.id`, `rawPayload.lastName`, `rawPayload.level`, `rawPayload.phone`, `rawPayload.prefix`, `rawPayload.profilePhotoMimeType`, `rawPayload.profilePhotoName`, `rawPayload.profilePhotoSizeBytes`, `rawPayload.profilePhotoUrl`, `rawPayload.schoolType`, `rawPayload.studentEmail`, `rawPayload.title`. These are AST member accesses, not a complete schema: spread payloads retain additional fields.

| HTTP status | Response source line | Top-level response keys |
| --- | --- | --- |
| 405 | `supabase/functions/submit-registration/index.ts:467` | `ok`, `message` |
| 500 | `supabase/functions/submit-registration/index.ts:475` | `ok`, `message` |
| 401 | `supabase/functions/submit-registration/index.ts:480` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:487` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:496` | `ok`, `message` |
| 500 | `supabase/functions/submit-registration/index.ts:513` | `ok`, `message` |
| 404 | `supabase/functions/submit-registration/index.ts:517` | `ok`, `message` |
| 200 | `supabase/functions/submit-registration/index.ts:528` | `ok`, `institutionId`, `workspaceId`, `schoolName`, `schoolTypes`, `type`, `classes`, `levels` |
| 500 | `supabase/functions/submit-registration/index.ts:539` | `ok`, `message` |
| 500 | `supabase/functions/submit-registration/index.ts:547` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:551` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:580` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:583` | `ok`, `message` |
| 200 | `supabase/functions/submit-registration/index.ts:612` | `ok`, `status`, `institutionId`, `workspaceId`, `user`, `record` |
| 500 | `supabase/functions/submit-registration/index.ts:635` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:655` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:658` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:661` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:664` | `ok`, `message` |
| 400 | `supabase/functions/submit-registration/index.ts:670` | `ok`, `message` |
| 200 | `supabase/functions/submit-registration/index.ts:804` | `ok`, `status`, `institutionId`, `workspaceId`, `record`, `user`, `guardianUsers`, `warnings` |
| 500 | `supabase/functions/submit-registration/index.ts:815` | `ok`, `message` |

Tables: `profiles`, `institutions`, `classes`, `access_grants`, `students`.

## Other integrations and generated artifacts

- Paystack loader and callbacks in the parent fee flow: preserve key lookup, amount units, transaction references, callback/close semantics and receipt state; no live payment was attempted.
- jsPDF library promise/report generation: preserve load caching, filename/content/layout, printing and blob cleanup.
- WhatsApp wa.me links, mailto links and QR image URLs: preserve encoding and user-triggered opening; do not send messages while testing the refactor.
- Public contact success is simulated, not verified delivery.
- Google verification HTML, images, styles and all Supabase SQL/functions remain outside the first extraction.

## Record shape reference

Top-level object fields returned from named record normalizers are indexed below. This is a source aid, not a new schema: spreads, nested fields, legacy aliases, fallback values and normalization algorithms remain authoritative in the original function.

| Normalizer | Location | Returned object keys (may include nested returns) |
| --- | --- | --- |
| `normalizeSchoolSettings` | `app.js:602-627` | `schoolName`, `logoUrl`, `schoolProfile`, `address`, `campusDetails`, `phone`, `website`, `academicYearStart`, `academicYearEnd`, `schoolTypes`, `higherInstitutionType`, `hasNursery`, `hasPrimary`, `hasSecondary`, `hasHigherInstitution` |
| `normalizeAcademicSession` | `app.js:740-753` | `id`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAcademicTerm` | `app.js:755-773` | `id`, `sessionId`, `periodType`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfigSession` | `app.js:1201-1213` | `id`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfigClass` | `app.js:1215-1224` | `id`, `name`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfiguration` | `app.js:1239-1276` | `...spread`, `status`, `sessions`, `classes`, `stages` |
| `normalizeSchoolTimetableEntry` | `js/features/timetable/store.js:202-233` | `id`, `periodId`, `classId`, `classLevel`, `subjectId`, `teacherId`, `roomId`, `sessionId`, `termId`, `day`, `startTime`, `endTime`, `subject`, `teacher`, `room`, `weekType`, `status`, `publishedAt`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeSchoolClass` | `app.js:1626-1660` | `id`, `name`, `level`, `capacity`, `classTeacher`, `arms`, `subjects`, `teacherAssignments`, `status`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeSchoolCourse` | `app.js:1798-1826` | `id`, `name`, `code`, `category`, `creditUnit`, `description`, `level`, `sessionId`, `sessionName`, `termId`, `termName`, `classId`, `classRecordId`, `classLabel`, `classArm`, `classScope`, `teacherAssignments`, `studentAssignments`, `status`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeLessonPlanAttachment` | `app.js:2005-2016` | `id`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeLessonPlanRecord` | `app.js:2018-2085` | `id`, `teacherId`, `teacherName`, `teacherEmail`, `subject`, `subjectCode`, `classId`, `classLevel`, `sessionId`, `sessionName`, `termId`, `termName`, `weekNumber`, `planDate`, `planView`, `topic`, `subTopic`, `curriculumTopic`, `syllabusOrder`, `coverageStatus`, `objectives`, `materials`, `teachingMethods`, `classActivities`, `assessment`, `homework`, `remarks`, `reflection`, `delivery`, `attachments`, `status`, `submittedAt`, `deliveredAt`, `createdAt`, `updatedAt` |
| `normalizeLeaveAttachment` | `app.js:2199-2210` | `id`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeStudentProgressionEntry` | `js/features/students/store.js:11-20` | `id`, `type`, `fromLevel`, `toLevel`, `note`, `timestamp` |
| `normalizeStudentDocumentRecord` | `js/features/students/store.js:22-34` | `id`, `name`, `documentType`, `mimeType`, `sizeBytes`, `dataUrl`, `uploadedBy`, `uploadedAt` |
| `normalizeStudentRecord` | `js/features/students/store.js:36-116` | `id`, `firstName`, `lastName`, `fullName`, `admissionNo`, `studentEmail`, `profilePhotoUrl`, `profilePhotoName`, `profilePhotoMimeType`, `profilePhotoSizeBytes`, `profilePhotoRemoved`, `level`, `classId`, `classRecordId`, `classLevel`, `baseLevel`, `classArm`, `dateOfBirth`, `gender`, `guardians`, `progressionHistory`, `documents`, `status`, `promotionDecision`, `examOutcome`, `lastPromotionSessionId`, `lastPromotionOutcome`, `createdAt`, `updatedAt`, `archivedAt`, `transferredAt`, `transferReason` |
| `normalizeAttendanceEntry` | `app.js:2366-2377` | `studentId`, `studentName`, `admissionNo`, `status`, `note` |
| `normalizeAttendanceRecord` | `app.js:2406-2448` | `id`, `date`, `classId`, `lessonId`, `timetableEntryId`, `subject`, `periodId`, `day`, `startTime`, `endTime`, `weekType`, `sessionId`, `termId`, `className`, `level`, `submittedById`, `submittedByEmail`, `submittedByName`, `status`, `entries`, `takenAt`, `createdAt`, `updatedAt` |
| `normalizeReportConfiguration` | `app.js:2592-2635` | `scoreStructure`, `gradingScale`, `template` |
| `normalizeGradebookRecord` | `app.js:2645-2685` | `studentId`, `studentName`, `admissionNo`, `componentScores`, `id`, `classId`, `classLevel`, `subject`, `subjectCode`, `sessionId`, `sessionName`, `termId`, `termName`, `teacherId`, `teacherName`, `components`, `scores`, `createdAt`, `updatedAt` |
| `normalizeReportCardRecord` | `app.js:2815-2843` | `id`, `studentId`, `studentName`, `admissionNo`, `classId`, `classLevel`, `sessionId`, `sessionName`, `termId`, `termName`, `subjects`, `teacherComment`, `schoolComment`, `status`, `createdById`, `createdByName`, `releasedById`, `releasedByName`, `releasedAt`, `createdAt`, `updatedAt` |
| `normalizeAuditTrailEntry` | `app.js:2953-2965` | `id`, `timestamp`, `actorName`, `actorRole`, `action`, `entityType`, `entityId`, `summary`, `details` |
| `normalizeUserRecord` | `auth.js:1427-1437` | `...spread`, `displayName`, `profilePhotoUrl`, `role`, `status`, `mustChangePassword`, `workspaceId` |
| `normalizeNotificationEntry` | `auth.js:2092-2111` | `id`, `title`, `message`, `entityType`, `entityId`, `action`, `actorName`, `createdAt`, `readAt`, `workspaceId`, `visibleToRoles`, `metadata` |
| `normalizeAdmissionFileRecord` | `auth.js:2873-2907` | `id`, `label`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeAdmissionRecord` | `auth.js:3021-3092` | `id`, `fullName`, `firstName`, `middleName`, `lastName`, `gender`, `dateOfBirth`, `email`, `studentEmail`, `phone`, `level`, `classApplyingFor`, `previousSchool`, `passportPhotoName`, `passportPhotoFile`, `guardianName`, `guardianFullName`, `guardianRelationship`, `guardianEmail`, `guardianPhone`, `guardianAddress`, `guardianOccupation`, `lastClassAttended`, `academicClassApplyingFor`, `admissionSessionId`, `admissionSessionName`, `applicationStage`, `previousSchoolName`, `previousSchoolAddress`, `healthCondition`, `healthConditionDetails`, `healthAllergies`, `healthMedications`, `docPreviousReportName`, `docPreviousReportFile`, `docBirthCertificateName`, `docBirthCertificateFile`, `docPreviousSchoolResultName`, `docPreviousSchoolResultFile`, `docTransferCertificateName`, `docTransferCertificateFile`, `docPassportPhotographName`, `docPassportPhotographFile`, `docOtherName`, `docOtherFile`, `documents`, `notes`, `status`, `statusNote`, `source`, `createdAt`, `updatedAt`, `reviewedAt`, `reviewedBy`, `convertedStudentId`, `convertedAt`, `workspaceId` |
| `normalizeAccessGrant` | `auth.js:3226-3248` | `id`, `email`, `normalizedEmail`, `username`, `role`, `authMethod`, `status`, `workspaceId`, `createdAt`, `updatedAt`, `claimedAt`, `claimedByUserId` |


## Exact permission/routing declarations

Literal mapping snapshots only; preserve keys and aliases. These are source contracts, not a statement about each role’s deployed grant.

### app.js / ROLE_PERMISSION_ROLES

`app.js:222`

```js
ROLE_PERMISSION_ROLES = ["Teacher", "Parent", "Student"]
```

### app.js / ROLE_PERMISSION_OPTIONS_BY_ROLE

`app.js:223`

```js
ROLE_PERMISSION_OPTIONS_BY_ROLE = {
  Teacher: [
    { key: "staff_dashboard_view", label: "Dashboard", description: "Home, today's schedule, pending tasks" },
    { key: "staff_timetable_view", label: "My Timetable", description: "Weekly schedule for the active term" },
    { key: "staff_attendance_mark", label: "Attendance", description: "Mark class register" },
    { key: "staff_classes_view", label: "My Classes", description: "Assigned classes and student rosters" },
    { key: "staff_gradebook_manage", label: "Gradebook", description: "Continuous-assessment setup and score entry" },
    { key: "staff_results_manage", label: "Results", description: "View, comment, and publish term results" },
    { key: "staff_lesson_plans_manage", label: "Lesson Plans", description: "Create and submit weekly plans" },
    { key: "staff_messages_view", label: "Messages", description: "Message admin, linked parents, and assigned students" },
    { key: "staff_leave_manage", label: "Leave Requests", description: "Apply for leave and view approval status" },
    { key: "staff_profile_manage", label: "My Profile", description: "Account info, password, notification prefs" },
  ],
  Parent: [
    { key: "parent_performance_view", label: "My Child Performance", description: "Child overview and key school updates" },
    { key: "parent_teachers_view", label: "Teachers by Class", description: "Teachers connected to the child" },
    { key: "parent_courses_view", label: "My Child Courses", description: "Subjects or courses assigned to the child" },
    { key: "parent_attendance_view", label: "Attendance", description: "Child attendance summary" },
    { key: "parent_fees_view", label: "Fees and Balance", description: "Invoices, balances, and payments" },
    { key: "parent_reports_view", label: "Reports", description: "Released report cards and PDFs" },
    { key: "parent_messages_view", label: "Messages", description: "Message school admin and teachers" },
    { key: "parent_chatbot_view", label: "AI Parent Chatbot", description: "Ask questions about the linked child and school records" },
  ],
  Student: [
    { key: "student_dashboard_view", label: "Dashboard", description: "Student home and school updates" },
    { key: "student_timetable_view", label: "My Timetable", description: "Weekly class schedule" },
    { key: "student_classes_view", label: "My Classes", description: "Class workspace and rosters" },
    { key: "student_courses_view", label: "Subjects or Courses", description: "Assigned subjects or courses" },
    { key: "student_attendance_view", label: "Attendance", description: "Personal attendance record" },
    { key: "student_fees_view", label: "Fees", description: "Assigned fee items and balance" },
    { key: "student_reports_view", label: "Results and Report Cards", description: "Released results and PDFs" },
    { key: "student_messages_view", label: "Messages", description: "Message school admin and connected teachers" },
    { key: "student_profile_manage", label: "My Profile", description: "Account info and password" },
  ],
}
```

### app.js / ROLE_PERMISSION_OPTIONS

`app.js:258`

```js
ROLE_PERMISSION_OPTIONS = Object.values(ROLE_PERMISSION_OPTIONS_BY_ROLE)
  .flat()
  .filter(
    (option, index, options) =>
      options.findIndex((candidate) => candidate.key === option.key) === index,
  )
```

### auth.js / ROLE_HOME_ROUTES

`auth.js:123`

```js
ROLE_HOME_ROUTES = {
    [SUPER_ADMIN_ROLE]: "./super-admin.html",
    Admin: "./portal.html",
    Teacher: "./staff-dashboard.html",
    Student: "./portal.html",
    Parent: "./parent-portal.html",
  }
```

### auth.js / PARENT_PAGE_ROUTES

`auth.js:131`

```js
PARENT_PAGE_ROUTES = {
    "parent-portal": "./parent-portal.html",
    "parent-teachers": "./parent-teachers.html",
    "parent-courses": "./parent-courses.html",
    "parent-attendance": "./parent-attendance.html",
    "parent-fees": "./parent-fees.html",
    "parent-reports": "./parent-reports.html",
    "parent-messages": "./parent-messages.html",
  }
```

### auth.js / PARENT_PAGE_PERMISSION_KEYS

`auth.js:140`

```js
PARENT_PAGE_PERMISSION_KEYS = {
    "parent-portal": "parent_performance_view",
    "parent-teachers": "parent_teachers_view",
    "parent-courses": "parent_courses_view",
    "parent-attendance": "parent_attendance_view",
    "parent-fees": "parent_fees_view",
    "parent-reports": "parent_reports_view",
    "parent-messages": "parent_messages_view",
  }
```

### auth.js / PAGE_PERMISSION_KEYS

`auth.js:232`

```js
PAGE_PERMISSION_KEYS = {
    portal: "student_dashboard_view",
    "admin-students": "students_manage",
    "admin-admissions": "students_manage",
    "admin-teachers": "teachers_manage",
    "admin-classes": "classes_manage",
    "admin-courses": "courses_manage",
    "admin-schedule": "classes_manage",
    "admin-fees": "fees_manage",
    "admin-attendance": "attendance_manage",
    "admin-reports": "reports_view",
    "admin-messages": "reports_view",
    "admin-feature-modules": "settings_manage",
    "admin-settings": "settings_manage",
    "admin-settings-school": "settings_manage",
    "admin-settings-access": "settings_manage",
    "admin-settings-roles": "settings_manage",
    "admin-settings-academic": "settings_manage",
    "admin-settings-grading": "settings_manage",
    "staff-dashboard": "staff_dashboard_view",
    "staff-timetable": "staff_timetable_view",
    "staff-attendance": "staff_attendance_mark",
    "staff-classes": "staff_classes_view",
    "staff-gradebook": "staff_gradebook_manage",
    "staff-results": "staff_results_manage",
    "staff-lesson-plans": "staff_lesson_plans_manage",
    "staff-messages": "staff_messages_view",
    "staff-leave": "staff_leave_manage",
    "staff-settings": "staff_profile_manage",
    "user-settings": "student_profile_manage",
  }
```

### auth.js / STAFF_PORTAL_PAGE_CONFIG

`auth.js:330`

```js
STAFF_PORTAL_PAGE_CONFIG = {
    "staff-dashboard": {
      key: "dashboard",
      heading: "Dashboard",
      copy: "Home, today's schedule, and pending tasks for your staff workspace.",
    },
    "staff-timetable": {
      key: "timetable",
      heading: "My Timetable",
      copy: "Weekly schedule for the active term.",
    },
    "staff-attendance": {
      key: "attendance",
      heading: "Attendance",
      copy: "Mark the class register for classes assigned to you.",
    },
    "staff-classes": {
      key: "classes",
      heading: "My Classes",
      copy: "Assigned classes and student rosters.",
    },
    "staff-gradebook": {
      key: "gradebook",
      heading: "Gradebook",
      copy: "Configure and record continuous-assessment scores.",
    },
    "staff-results": {
      key: "results",
      heading: "Results",
      copy: "View, comment, and publish term results.",
    },
    "staff-lesson-plans": {
      key: "lesson-plans",
      heading: "Lesson Plans",
      copy: "Create and submit weekly plans.",
    },
    "staff-messages": {
      key: "messages",
      heading: "Messages",
      copy: "Message school admin, linked parents, and students in your assigned classes.",
    },
    "staff-leave": {
      key: "leave",
      heading: "Leave Requests",
      copy: "Apply for leave and view approval status.",
    },
  }
```

### auth.js / ADMIN_SETTINGS_PAGES

`auth.js:444`

```js
ADMIN_SETTINGS_PAGES = new Set([
    "admin-settings",
    "admin-settings-school",
    "admin-settings-access",
    "admin-settings-roles",
    "admin-settings-academic",
    "admin-settings-grading",
  ])
```

## Exact key construction expressions

User identities in these expressions are parameter names only. Preserve separators and ordering.

### getFormDraftStorageKey

`auth.js:791`

```js
function getFormDraftStorageKey(formId) {
    return `${FORM_DRAFT_STORAGE_PREFIX}:${formId}`;
  }
```

### getNotificationStorageKey

`auth.js:1784`

```js
function getNotificationStorageKey(workspaceId = null) {
    return `${NOTIFICATION_STORAGE_PREFIX}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }
```

### getNotificationPreferencesStorageKey

`auth.js:1817`

```js
function getNotificationPreferencesStorageKey(userOrSession = {}, roleOverride = "") {
    const session = getSession() || {};
    const role = normalizeRoleLabel(roleOverride || userOrSession.role || session.role || DEFAULT_AUTH_ROLE);
    const workspaceId = normalizeWorkspaceId(
      userOrSession.workspaceId || session.workspaceId || getCurrentWorkspaceId(),
    );
    const identity = normalizeEmail(userOrSession.email || session.email || "") ||
      String(userOrSession.id || userOrSession.userId || session.userId || "anonymous").trim().toLowerCase();
    return `${NOTIFICATION_PREFERENCES_STORAGE_PREFIX}:${workspaceId}:${role.toLowerCase()}:${identity}`;
  }
```

### getAdmissionsStorageKey

`auth.js:2829`

```js
function getAdmissionsStorageKey(workspaceId = null) {
    return `${ADMISSIONS_STORAGE_KEY_BASE}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }
```

### buildWorkspaceScopedStateKey

`auth.js:3558`

```js
function buildWorkspaceScopedStateKey(baseKey, workspaceId) {
    return `${baseKey}::${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }
```

### getWorkspaceStateStorageKeyForState

`auth.js:4936`

```js
function getWorkspaceStateStorageKeyForState(stateKey, workspaceId) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());

    if (stateKey === SUPABASE_STATE_KEY_NOTIFICATIONS) {
      return `${NOTIFICATION_STORAGE_PREFIX}:${normalizedWorkspaceId}`;
    }

    if (stateKey === SUPABASE_STATE_KEY_ADMISSIONS) {
      return `${ADMISSIONS_STORAGE_KEY_BASE}:${normalizedWorkspaceId}`;
    }

    if (stateKey === SUPABASE_STATE_KEY_PARENT_FEES) {
      return `${PARENT_FEES_STORAGE_PREFIX}:${normalizedWorkspaceId}`;
    }

    if (stateKey === SUPABASE_STATE_KEY_ACCESS_GRANTS) {
      return ACCESS_GRANTS_STORAGE_KEY;
    }

    return buildWorkspaceScopedStateKey(stateKey, normalizedWorkspaceId);
  }
```

### getParentSelectionStorageKey

`auth.js:37923`

```js
function getParentSelectionStorageKey(user = null) {
    const session = getSession();
    const workspaceId = normalizeWorkspaceId(user?.workspaceId || session?.workspaceId || getCurrentWorkspaceId());
    const userId = String(user?.id || session?.userId || "parent").trim() || "parent";
    return `${PARENT_SELECTION_STORAGE_PREFIX}:${workspaceId}:${userId}`;
  }
```

### getParentFeesStorageKey

`auth.js:37946`

```js
function getParentFeesStorageKey(workspaceId = null) {
    return `${PARENT_FEES_STORAGE_PREFIX}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }
```

## E01 renderer boundary

js/website/why-grid.js now contains whyCards at lines 1–17 (E03) and the unchanged renderWhyGrid declaration at lines 19–37 (E01). The renderer still depends only on document and its arguments, writes identical innerHTML and returns early for absent targets. Current initPageContent is at app.js:3672, its Why calls at 3673–3674, and its sole immediate invocation at app.js:3690. All 57 consumers still load why-grid.js once before timetable/store.js, students/store.js and app.js. E01 browser completion was user-reported, not independently verified.

## E02 renderer boundary

js/website/practice-grid.js declares renderPracticeGrid(targetId, items) only. Dependencies: document.getElementById and supplied array records with title, label and copy. Its unchanged template emits quote-card and quote-meta classes; styles.css is untouched. No storage, permissions, SchoolSphere manager, Supabase call, private shared state or initialization is added. Missing targets return before accessing items.

The sole caller of renderPracticeGrid is initPageContent (app.js:3672); calls at 3683 and 3684 pass practiceStories.slice(0, 3) for home-practice-grid and practice-page-grid. Only practice-page-grid exists in current HTML (in-practice.html:29). practiceStories remains in app.js:481–506 with four records. Synchronous classic loading and helper behavior are unchanged by E03. E02 browser checks passed according to the user; no independent browser evidence was captured.

## E03 content boundary

whyCards is initialized once by the existing classic js/website/why-grid.js script, above renderWhyGrid. Preserve the top-level const name, array order, three records, title/copy field names and exact string contents. The binding remains accessible to later classic scripts but is not a window property; const prevents reassignment, not mutation of its array or records. Do not add exports, wrappers, freezing or a window adapter.

The only detected consumers are app.js:initPageContent calls at 3673–3674, passing the same whyCards array to renderWhyGrid for why-preview-grid and why-page-grid. Only why-page-grid exists in current HTML (why-it-works.html:36). No content, renderer or caller logic changed. Loading is now offerings.js → escape-html.js → practice-grid.js → why-grid.js → timetable/store.js → students/store.js → app.js → existing subsequent scripts on all 57 consumers. E05 prepended offerings.js; E06 inserted timetable/store.js; E07 adds students/store.js immediately before app.js. E03 data and the prior tags retain their relative order. Moving literal allocation before the app.js theme bootstrap introduces no external side effects. No listener, storage key, permission, data format or Supabase behavior changes. E03 HTTP/visual/startup checks remain unverified.

## E04 escaping boundary

js/core/escape-html.js defines only the unchanged app-level escapeHtml(value). Preserve String(value ?? "") coercion, then replacement order ampersand, less-than, greater-than, double quote and apostrophe. Existing entities are escaped again; null/undefined become an empty string; numbers and booleans are converted. Conversion exceptions still propagate. This is HTML escaping, not a new URL validator or sanitizer.

The original callable global interface is retained with one definition in the classic helper script and no app.js duplicate. Its eight callers remain in buildBrandMarkHtml (app.js:682), renderHeader (3490) and renderFooter (3546). Current header/footer startup remains at app.js:3687–3688, with existing settings/hash refresh callbacks unchanged. The function has no DOM, state, listener, storage or network dependency and performs no work at script load.

Do not merge the separate private auth.js:6303–6310 escapeHtml helper. That helper does not coerce through String and throws for null/numeric arguments; its 1,371 scoped references and enclosing IIFE stay unchanged. All 57 HTML app consumers load the new helper synchronously once, before the two existing website scripts and app.js. HTTP/MIME/cache delivery, appearance and full browser startup remain unverified; source and isolated parity checks do not replace those checks.

## E05 offerings feature boundary

The approved unit is js/website/offerings.js: offerings at 1–92, renderOfferingPreviewGrid at 94–112, activeOfferingId at 114, renderOfferingTabs at 116–169 and renderWorkflowPage at 171–207. All five declarations are unchanged. Preserve every ID/title/tag/description, bullet/metric record, record order, the initial offerings[0].id selection and the existing invalid-ID fallback. offerings remains a mutable array behind a const; activeOfferingId remains a single let with its click-handler assignment at line 165. Neither binding is a window property. No wrapper/export/factory or duplicate state was introduced.

Only document is external to this unit. The three functions retain their callable globals. initPageContent stays in app.js:3672 and calls preview at 3675 with offerings.slice(0, 3), tabs at 3678, and workflows at 3679. The workflow renderer also selects the first three records. The initial call remains at app.js:3690; no render occurs during offerings.js loading. Earlier literal dataset/state initialization adds no DOM, storage or network side effects.

DOM contracts: products-lane-grid is in products.html:79 and workflow-page-grid in workflows.html:28. home-offering-tabs and home-offering-panel are absent from all current HTML; their existing both-present guard and [data-offering] click behavior are retained and tested with synthetic nodes, not new UI. Re-render still replaces tab markup and binds one listener on each new live button. No events, permission checks, storage formats or Supabase interfaces change. All 57 app consumers load this script exactly once before the prior scripts. HTTP/MIME/cache, actual browser listener behavior and visual/full-startup acceptance remain unverified.


## E06 timetable store boundary

js/features/timetable/store.js owns the original seven default/day/week const declarations and 36 timetable functions, unchanged. Its top-level array construction references only declarations inside that file; it performs no DOM/storage/network/event/listener/timer work. Functions remain classic global callable bindings, constants remain global lexical bindings (not window properties), and arrays remain unfrozen. Do not duplicate them in app.js or create a second manager.

Load timetable/store.js once before students/store.js and app.js on all 57 current consumers, without async/defer/type=module. Retain the original window.SchoolSphereTimetable assignment at app.js:3245–3270 after app constants/storage helpers have initialized. Its complete method/property map above is unchanged. The new functions resolve dependencies at invocation; no workspace/session is cached at import. Existing app boot sequence, legacy cleanup and all event listeners remain in their original relative execution order.

Retain readWorkspaceState, writeWorkspaceState and createStorageId in app.js, plus the six timetable key/default/event constants at app.js:153–158. All four base keys retain the existing ::workspaceId suffix, transient session precedence and no legacy fallback for these reads. Do not rename fields, aliases, IDs, default values, sort rules, timestamps or enum/status behavior. Keep existing behavior even where a later independent bug fix may be desirable.

Event contract: local saves dispatch schoolsphere:timetable-updated with detail { entries }; period/room/substitution saves still read current entries when emitting. The original storage handler responds to the active workspace entry key only, not all four timetable keys. auth.js hydration independently dispatches { workspaceId, source: "supabase-hydration" }; do not unify these shapes. Existing admin live sync binds the same event four times for the four distinct state collections, with one 260 ms debounce per key and hydration echo suppression. Preserve that fan-out; four handlers are intentional here, not a new duplicate. Teacher eligibility still filters synchronization to report-card/gradebook state, and other roles do not acquire timetable writes.

No auth.js controller/view, route, selector, permission check, inline code, Supabase configuration/function/table adapter or backend file changed. Browser role restrictions and actual remote behavior remain subject to manual/authorized environment acceptance; isolated tests are not live backend evidence. E05 and E06 browser completion were user-reported before E07; this is not independent browser evidence. E07 browser acceptance is outstanding.


## E07 student store boundary

js/features/students/store.js owns exactly 16 unchanged function declarations. Names, signatures, synchronous returns, nested promotion/exam normalization, updater callback behavior and thrown-error behavior are retained. There are no moved constants, mutable bindings, listeners, timers, adapter assignments or initialization calls. getLocalDateValue remains in app.js for its attendance consumers.

Load once immediately before app.js, after timetable/store.js, on all 57 consumers. No async/defer/module/factory or lazy-loader conversion. Original window.SchoolSphereStudents assignment remains at app.js:3330–3343, after its constants/storage helpers are initialized and before auth consumes it. Preserve its complete member map above and all existing startup/listener ownership.

Retain the six external application bindings in app.js: createStorageId, readWorkspaceState, writeWorkspaceState, DEFAULT_STUDENT_RECORDS, SCHOOL_STUDENTS_STORAGE_KEY and SCHOOL_STUDENTS_EVENT. Workspace resolution stays live per operation with existing transient/persistent/public precedence and the exact schoolsphere.students.v1::workspaceId format. No legacy fallback, new migration, session capture or shared cache is introduced.

Data contracts include student/class aliases, guardian filtering, photo/document data fields, generated IDs/timestamps, ordering, progression history, promotion/exam outcomes, archived/transferred fields and aggregate counts. updateSchoolStudentProgression retains original ID/createdAt even if the callback returns replacements. Empty deletion inputs retain their no-save path; valid nonmatching IDs/levels retain existing save/event behavior. These are preservation requirements, not recommendations to change existing semantics. No cascade deletion/account operation is added.

Local writes still dispatch schoolsphere:students-updated with detail { students }; storage-event refresh responds only to the currently scoped student key. Supabase hydration keeps its separate { workspaceId, source: "supabase-hydration" } payload. Admin sync retains one student-state listener, a 260 ms debounce and hydration suppression; Teacher eligibility still excludes student-state sync. No UI permission, account provisioning, synchronization/table adapter, Edge Function, selector, route or auth controller changes.

Relevant consumers are recorded in the inventory. Verification covers synthetic data/storage/events and simulated sync only. Real browser role guards, cross-tab delivery, parent/student linkage, import/export and remote operations remain manual/authorized environment acceptance, not implied by syntax or parity results.


## E08 shared action-dialog boundary

The 194-line original dialog feature is retained inside createController in js/shared-ui/action-dialog.js. The controller owns one private appActionDialogState initialized to null. Inject document/window/HTMLElement once; read document.body and document.activeElement live on use. Standard Promise/String/Boolean remain unchanged. The exported namespace contains only createController. Do not create multiple controllers against the shared DOM ID.

Load the dialog factory once before timetable/controller.js and auth.js on all 49 auth consumers. Evaluation only publishes the factory; construction only establishes private bindings. The original state location is replaced by a single construction/destructuring statement. No awaiting, ready handler, auto-open, eager element creation or extra async forwarding wrapper is added. The original DOMContentLoaded registration and later bootstrap sequence are unchanged. All 20 external calls occur after the original declaration location and still resolve to private auth names.

Preserve IDs/classes/ARIA and template bytes: app-action-dialog plus its form, kicker/title/message/details, prompt/input-label/input/error and cancel/confirm children; [data-app-action-cancel]; body class app-action-dialog-open; danger/success/primary variants. Text still uses textContent, and styles.css is unchanged. Do not add a focus trap, new validation, revised labels, timer cancellation or other unrelated accessibility/behavior changes during this move.

openAppActionDialog returns a Promise of { confirmed, value }; missing body resolves { confirmed: false, value: null }. showAppConfirm is the original async function returning a boolean; showAppPrompt returns a trimmed string (including empty string when optional) or null on cancellation. Required-empty prompt submission sets the same message/refocuses without resolving. Cancel button/backdrop/Escape resolve cancellation; other clicks/keys do not. Opening a new dialog cancels the previous pending Promise before installing its new state. Prior HTMLElement focus restoration and the existing zero-delay focus/select timer order are retained, including rapid-overlap behavior.

Three DOM handlers are installed only during initial element creation: delegated click, form submit and dialog keydown. Reopening reuses the element/listeners while reading the current private state; closing clears that state before resolving. auth.js account-deletion/provisioning/permission/business operations remain outside this controller. Tests use synthetic DOM only and never confirm a live destructive action.

E08 browser keyboard/focus/layout and authentication startup checks passed according to the user and were checkpointed as f06543b. This is not independent observation. Source/Promise/DOM-fixture parity is not a substitute for those checks. No storage key, data format, database, Supabase or route changes.


## E09 timetable-controller boundary

Load controller.js synchronously once after action-dialog.js and before auth.js on 49 auth pages. No async/defer/module conversion or added ready callback. Publication and factory construction have no DOM/storage/timer/listener effects. Original DOMContentLoaded bootstrap is byte-identical; it awaits the same auth bridge and invokes initAdminSchedulePage in the same position. The function alias is established during synchronous auth evaluation before that callback can run. The sole controller call remains auth.js:42717; no extra auto-initializer or new idempotence guard is introduced.

Page/access contract stays at initAdminSchedulePage (auth.js:42690): getPage() must equal admin-schedule; isAdmin comes from the existing access context and canManageSchedule remains isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-schedule"]). That key remains classes_manage. Preserve the existing role matching/permission semantics rather than redesigning them. The controller still takes { isAdmin, manager, summaryTarget, form, status, listTarget }. Missing any of the four DOM targets returns immediately; optional elements and missing managers retain existing paths.

Keep all per-invocation state and nested closures in the original initializer: selected/editing IDs, toast timer, inline status, modal elements and active print criteria. 19 listener-registration sites (some loop over controls), two setTimeout sites (3,600 ms toast and 50 ms edit scroll) and one clearTimeout site move unchanged. The separate load handler embedded in the print-window HTML remains byte-identical too. Refreshes do not re-run initialization; repeated direct initializer calls were not guarded before and must not be newly introduced by composition.

The four injected browser objects and 29 unchanged private functions are listed exhaustively in inventory.md and in the factory signature. Capture function identities, not results: getCurrentWorkspaceId/getUsers/getConfiguredSchoolSettings keep reading live state, and injected helpers retain their original auth closures. Preserve the private auth escapeHtml and E08 showAppPrompt. Cycle/class/course managers are obtained at the original invocation point, not on import.

DOM IDs, data attributes, form field names, templates, body portal-overlay-open class, week types, selections, validation text and print markup are unchanged. The complete HTML IDs catalog above remains intact. Lesson payloads retain IDs/session/term/period/class/subject/teacher/status/week fields and existing empty roomId/room values. There is no new room editor or inferred room behavior. Class-teacher assignment, audit entries and draft clearing remain part of the same save sequence. Substitution still has two awaited prompts; either cancellation avoids logging. Preserve publish/archive/copy grouping criteria and all method-call ordering, even synchronous manager events that refresh during a write.

SchoolSphereTimetable and the other app managers are not moved/replaced. Storage keys/workspace suffixes, local event { entries }, hydration { workspaceId, source }, sync fan-out/debounce/eligibility and Supabase interfaces are untouched. The controller subscribes to timetable, academic-cycle, class and course manager event names in the same order. No direct storage/network/DB calls are introduced. Mock/in-memory tests prove parity only for tested cases, not actual browser delivery or hosted permissions.
