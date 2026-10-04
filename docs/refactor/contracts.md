# Contracts to preserve during JavaScript extraction

Original snapshot: 2026-10-02 at e1eb094; current update 2026-10-04 for E08 from clean faefa57. Current source anchors and HTML manifest reflect the dialog factory; historical logs retain stage-specific anchors. Other HTML/inline references retain original snapshot locations (six shared additions and the additional dialog tag on 49 auth pages). Configuration/schema/data/deployment unchanged.

## Loading and startup

All external HTML scripts inspected are classic scripts, without async/defer/type=module attributes. 57 of 58 HTML documents load app.js; the Google verification document has no script. The full ordered manifest below includes cache-busting query strings, which must remain valid. Most portal/auth pages load app.js, then supabase-config.js, then action-dialog.js, then auth.js. Students and teachers administration additionally load self-registration-links.js after auth.js. After E08 the shared synchronous classic order is js/website/offerings.js, js/core/escape-html.js, js/website/practice-grid.js, js/website/why-grid.js, js/features/timetable/store.js, js/features/students/store.js, app.js, then unchanged subsequent scripts. Those shared extracted scripts remain once on all 57 app consumers. E08 additionally loads js/shared-ui/action-dialog.js once directly before auth.js on its 49 consumers, not on public-only pages. There are 548 external tags: 499 through E07 plus 49 dialog tags.

### app.js

1. Immediate theme IIFE reads schoolsphere.theme.v1, updates the root and body, and registers a one-time DOMContentLoaded callback when loading.
2. Top-level lexical declarations and functions establish shared models and helpers. clearLegacySharedState() executes at line 394 and removes legacy unscoped keys. Do not accidentally re-run this cleanup per feature.
3. window.SchoolSphere* manager objects are assigned at lines 3170–3390. Their object identity and public members are compatibility boundaries.
4. A storage listener at line 3392 re-emits feature events for scoped keys.
5. Immediate calls at lines 3687–3691 render header/footer, bind outside-click behavior, render page content, and apply branding. Subsequent listeners handle school settings, hash navigation and feature toggles.

### auth.js

The file remains an IIFE. Its local APIs/state remain private; E08 moves dialog implementation/state into a factory-private closure and binds its three methods once at auth.js:6312–6320. At line 603 it applies the theme. The DOMContentLoaded callback at 605 does the following in source order:

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

Each row lists current tags after E08. Shared app scripts keep their order; action-dialog.js now immediately precedes auth.js wherever auth.js is loaded. All prior tag attributes/order are retained; inline locations in this manifest are current. Paths remain document-relative.

| HTML file | data-page | Ordered scripts |
| --- | --- | --- |
| `admin-admissions.html` | `admin-admissions` | `./js/website/offerings.js` @359 → `./js/core/escape-html.js` @360 → `./js/website/practice-grid.js` @361 → `./js/website/why-grid.js` @362 → `./js/features/timetable/store.js` @363 → `./js/features/students/store.js` @364 → `./app.js` @365 → `./supabase-config.js` @366 → `./js/shared-ui/action-dialog.js` @367 → `./auth.js?v=upload-remove-x` @368 |
| `admin-attendance.html` | `admin-attendance` | `./js/website/offerings.js` @208 → `./js/core/escape-html.js` @209 → `./js/website/practice-grid.js` @210 → `./js/website/why-grid.js` @211 → `./js/features/timetable/store.js` @212 → `./js/features/students/store.js` @213 → `./app.js` @214 → `./supabase-config.js` @215 → `./js/shared-ui/action-dialog.js` @216 → `./auth.js` @217 |
| `admin-classes.html` | `admin-classes` | `./js/website/offerings.js` @289 → `./js/core/escape-html.js` @290 → `./js/website/practice-grid.js` @291 → `./js/website/why-grid.js` @292 → `./js/features/timetable/store.js` @293 → `./js/features/students/store.js` @294 → `./app.js` @295 → `./supabase-config.js` @296 → `./js/shared-ui/action-dialog.js` @297 → `./auth.js` @298 |
| `admin-courses.html` | `admin-courses` | `./js/website/offerings.js` @283 → `./js/core/escape-html.js` @284 → `./js/website/practice-grid.js` @285 → `./js/website/why-grid.js` @286 → `./js/features/timetable/store.js` @287 → `./js/features/students/store.js` @288 → `./app.js` @289 → `./supabase-config.js` @290 → `./js/shared-ui/action-dialog.js` @291 → `./auth.js` @292 |
| `admin-feature-modules.html` | `admin-feature-modules` | `./js/website/offerings.js` @166 → `./js/core/escape-html.js` @167 → `./js/website/practice-grid.js` @168 → `./js/website/why-grid.js` @169 → `./js/features/timetable/store.js` @170 → `./js/features/students/store.js` @171 → `./app.js` @172 → `./supabase-config.js` @173 → `./js/shared-ui/action-dialog.js` @174 → `./auth.js` @175 |
| `admin-fees.html` | `admin-fees` | `./js/website/offerings.js` @316 → `./js/core/escape-html.js` @317 → `./js/website/practice-grid.js` @318 → `./js/website/why-grid.js` @319 → `./js/features/timetable/store.js` @320 → `./js/features/students/store.js` @321 → `./app.js` @322 → `./supabase-config.js` @323 → `./js/shared-ui/action-dialog.js` @324 → `./auth.js` @325 |
| `admin-messages.html` | `admin-messages` | `./js/website/offerings.js` @590 → `./js/core/escape-html.js` @591 → `./js/website/practice-grid.js` @592 → `./js/website/why-grid.js` @593 → `./js/features/timetable/store.js` @594 → `./js/features/students/store.js` @595 → `./app.js` @596 → `./supabase-config.js` @597 → `./js/shared-ui/action-dialog.js` @598 → `./auth.js` @599 → `inline` @600 |
| `admin-reports.html` | `admin-reports` | `./js/website/offerings.js` @236 → `./js/core/escape-html.js` @237 → `./js/website/practice-grid.js` @238 → `./js/website/why-grid.js` @239 → `./js/features/timetable/store.js` @240 → `./js/features/students/store.js` @241 → `./app.js` @242 → `./supabase-config.js` @243 → `./js/shared-ui/action-dialog.js` @244 → `./auth.js` @245 |
| `admin-schedule.html` | `admin-schedule` | `./js/website/offerings.js` @349 → `./js/core/escape-html.js` @350 → `./js/website/practice-grid.js` @351 → `./js/website/why-grid.js` @352 → `./js/features/timetable/store.js` @353 → `./js/features/students/store.js` @354 → `./app.js` @355 → `./supabase-config.js` @356 → `./js/shared-ui/action-dialog.js` @357 → `./auth.js` @358 |
| `admin-settings-academic.html` | `admin-settings-academic` | `./js/website/offerings.js` @258 → `./js/core/escape-html.js` @259 → `./js/website/practice-grid.js` @260 → `./js/website/why-grid.js` @261 → `./js/features/timetable/store.js` @262 → `./js/features/students/store.js` @263 → `./app.js` @264 → `./supabase-config.js` @265 → `./js/shared-ui/action-dialog.js` @266 → `./auth.js` @267 |
| `admin-settings-access.html` | `admin-settings-access` | `./js/website/offerings.js` @211 → `./js/core/escape-html.js` @212 → `./js/website/practice-grid.js` @213 → `./js/website/why-grid.js` @214 → `./js/features/timetable/store.js` @215 → `./js/features/students/store.js` @216 → `./app.js` @217 → `./supabase-config.js` @218 → `./js/shared-ui/action-dialog.js` @219 → `./auth.js` @220 |
| `admin-settings-grading.html` | `admin-settings-grading` | `./js/website/offerings.js` @280 → `./js/core/escape-html.js` @281 → `./js/website/practice-grid.js` @282 → `./js/website/why-grid.js` @283 → `./js/features/timetable/store.js` @284 → `./js/features/students/store.js` @285 → `./app.js` @286 → `./supabase-config.js` @287 → `./js/shared-ui/action-dialog.js` @288 → `./auth.js` @289 |
| `admin-settings-roles.html` | `admin-settings-roles` | `./js/website/offerings.js` @174 → `./js/core/escape-html.js` @175 → `./js/website/practice-grid.js` @176 → `./js/website/why-grid.js` @177 → `./js/features/timetable/store.js` @178 → `./js/features/students/store.js` @179 → `./app.js?v=20260611-student-messages` @180 → `./supabase-config.js` @181 → `./js/shared-ui/action-dialog.js` @182 → `./auth.js?v=20260611-student-messages` @183 |
| `admin-settings-school.html` | `admin-settings-school` | `./js/website/offerings.js` @341 → `./js/core/escape-html.js` @342 → `./js/website/practice-grid.js` @343 → `./js/website/why-grid.js` @344 → `./js/features/timetable/store.js` @345 → `./js/features/students/store.js` @346 → `./app.js` @347 → `./supabase-config.js` @348 → `./js/shared-ui/action-dialog.js` @349 → `./auth.js` @350 |
| `admin-settings.html` | `admin-settings` | `inline` @10 → `./js/website/offerings.js` @182 → `./js/core/escape-html.js` @183 → `./js/website/practice-grid.js` @184 → `./js/website/why-grid.js` @185 → `./js/features/timetable/store.js` @186 → `./js/features/students/store.js` @187 → `./app.js` @188 → `./supabase-config.js` @189 → `./js/shared-ui/action-dialog.js` @190 → `./auth.js` @191 |
| `admin-students.html` | `admin-students` | `./js/website/offerings.js` @382 → `./js/core/escape-html.js` @383 → `./js/website/practice-grid.js` @384 → `./js/website/why-grid.js` @385 → `./js/features/timetable/store.js` @386 → `./js/features/students/store.js` @387 → `./app.js` @388 → `./supabase-config.js` @389 → `./js/shared-ui/action-dialog.js` @390 → `./auth.js?v=self-registration-links` @391 → `./self-registration-links.js?v=copy-open-fix` @392 |
| `admin-teachers.html` | `admin-teachers` | `./js/website/offerings.js` @300 → `./js/core/escape-html.js` @301 → `./js/website/practice-grid.js` @302 → `./js/website/why-grid.js` @303 → `./js/features/timetable/store.js` @304 → `./js/features/students/store.js` @305 → `./app.js` @306 → `./supabase-config.js` @307 → `./js/shared-ui/action-dialog.js` @308 → `./auth.js?v=self-registration-links` @309 → `./self-registration-links.js?v=copy-open-fix` @310 |
| `admissions-apply.html` | `admissions-apply` | `./js/website/offerings.js` @294 → `./js/core/escape-html.js` @295 → `./js/website/practice-grid.js` @296 → `./js/website/why-grid.js` @297 → `./js/features/timetable/store.js` @298 → `./js/features/students/store.js` @299 → `./app.js` @300 → `./supabase-config.js` @301 → `./js/shared-ui/action-dialog.js` @302 → `./auth.js?v=upload-remove-x` @303 |
| `confirm-email.html` | `confirm-email` | `./js/website/offerings.js` @36 → `./js/core/escape-html.js` @37 → `./js/website/practice-grid.js` @38 → `./js/website/why-grid.js` @39 → `./js/features/timetable/store.js` @40 → `./js/features/students/store.js` @41 → `./app.js` @42 → `./supabase-config.js` @43 → `./js/shared-ui/action-dialog.js` @44 → `./auth.js` @45 |
| `contact.html` | `contact` | `./js/website/offerings.js` @905 → `./js/core/escape-html.js` @906 → `./js/website/practice-grid.js` @907 → `./js/website/why-grid.js` @908 → `./js/features/timetable/store.js` @909 → `./js/features/students/store.js` @910 → `./app.js` @911 → `inline` @912 |
| `forgot-password.html` | `forgot-password` | `./js/website/offerings.js` @101 → `./js/core/escape-html.js` @102 → `./js/website/practice-grid.js` @103 → `./js/website/why-grid.js` @104 → `./js/features/timetable/store.js` @105 → `./js/features/students/store.js` @106 → `./app.js` @107 → `./supabase-config.js` @108 → `./js/shared-ui/action-dialog.js` @109 → `./auth.js` @110 |
| `google20c973feb5773234.html` | — | None |
| `in-practice.html` | `practice` | `./js/website/offerings.js` @34 → `./js/core/escape-html.js` @35 → `./js/website/practice-grid.js` @36 → `./js/website/why-grid.js` @37 → `./js/features/timetable/store.js` @38 → `./js/features/students/store.js` @39 → `./app.js` @40 |
| `index.html` | `home` | `./js/website/offerings.js` @190 → `./js/core/escape-html.js` @191 → `./js/website/practice-grid.js` @192 → `./js/website/why-grid.js` @193 → `./js/features/timetable/store.js` @194 → `./js/features/students/store.js` @195 → `./app.js?v=index-ui-20260603` @196 |
| `login.html` | `login` | `./js/website/offerings.js` @214 → `./js/core/escape-html.js` @215 → `./js/website/practice-grid.js` @216 → `./js/website/why-grid.js` @217 → `./js/features/timetable/store.js` @218 → `./js/features/students/store.js` @219 → `./app.js` @220 → `./supabase-config.js` @221 → `./js/shared-ui/action-dialog.js` @222 → `./auth.js` @223 |
| `modules.html` | `modules` | `./js/website/offerings.js` @33 → `./js/core/escape-html.js` @34 → `./js/website/practice-grid.js` @35 → `./js/website/why-grid.js` @36 → `./js/features/timetable/store.js` @37 → `./js/features/students/store.js` @38 → `./app.js` @39 |
| `owner-access.html` | `owner-access` | `./js/website/offerings.js` @121 → `./js/core/escape-html.js` @122 → `./js/website/practice-grid.js` @123 → `./js/website/why-grid.js` @124 → `./js/features/timetable/store.js` @125 → `./js/features/students/store.js` @126 → `./app.js?v=20260611-student-messages` @127 → `./supabase-config.js` @128 → `./js/shared-ui/action-dialog.js` @129 → `./auth.js?v=20260611-student-messages` @130 |
| `parent-attendance.html` | `parent-attendance` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./auth.js` @61 |
| `parent-courses.html` | `parent-courses` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./auth.js` @61 |
| `parent-fees.html` | `parent-fees` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./auth.js` @61 |
| `parent-messages.html` | `parent-messages` | `./js/website/offerings.js` @54 → `./js/core/escape-html.js` @55 → `./js/website/practice-grid.js` @56 → `./js/website/why-grid.js` @57 → `./js/features/timetable/store.js` @58 → `./js/features/students/store.js` @59 → `./app.js` @60 → `./supabase-config.js` @61 → `./js/shared-ui/action-dialog.js` @62 → `./auth.js` @63 |
| `parent-portal.html` | `parent-portal` | `./js/website/offerings.js` @54 → `./js/core/escape-html.js` @55 → `./js/website/practice-grid.js` @56 → `./js/website/why-grid.js` @57 → `./js/features/timetable/store.js` @58 → `./js/features/students/store.js` @59 → `./app.js` @60 → `./supabase-config.js` @61 → `./js/shared-ui/action-dialog.js` @62 → `./auth.js` @63 |
| `parent-reports.html` | `parent-reports` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./auth.js` @61 |
| `parent-settings.html` | `parent-settings` | `./js/website/offerings.js` @198 → `./js/core/escape-html.js` @199 → `./js/website/practice-grid.js` @200 → `./js/website/why-grid.js` @201 → `./js/features/timetable/store.js` @202 → `./js/features/students/store.js` @203 → `./app.js` @204 → `./supabase-config.js` @205 → `./js/shared-ui/action-dialog.js` @206 → `./auth.js` @207 |
| `parent-teachers.html` | `parent-teachers` | `./js/website/offerings.js` @52 → `./js/core/escape-html.js` @53 → `./js/website/practice-grid.js` @54 → `./js/website/why-grid.js` @55 → `./js/features/timetable/store.js` @56 → `./js/features/students/store.js` @57 → `./app.js` @58 → `./supabase-config.js` @59 → `./js/shared-ui/action-dialog.js` @60 → `./auth.js` @61 |
| `portal.html` | `portal` | `./js/website/offerings.js` @185 → `./js/core/escape-html.js` @186 → `./js/website/practice-grid.js` @187 → `./js/website/why-grid.js` @188 → `./js/features/timetable/store.js` @189 → `./js/features/students/store.js` @190 → `./app.js?v=20260611-student-messages` @191 → `./supabase-config.js` @192 → `./js/shared-ui/action-dialog.js` @193 → `./auth.js?v=20260611-student-messages` @194 |
| `products.html` | `products` | `./js/website/offerings.js` @84 → `./js/core/escape-html.js` @85 → `./js/website/practice-grid.js` @86 → `./js/website/why-grid.js` @87 → `./js/features/timetable/store.js` @88 → `./js/features/students/store.js` @89 → `./app.js` @90 |
| `reset-password.html` | `reset-password` | `./js/website/offerings.js` @118 → `./js/core/escape-html.js` @119 → `./js/website/practice-grid.js` @120 → `./js/website/why-grid.js` @121 → `./js/features/timetable/store.js` @122 → `./js/features/students/store.js` @123 → `./app.js` @124 → `./supabase-config.js` @125 → `./js/shared-ui/action-dialog.js` @126 → `./auth.js` @127 |
| `school-types.html` | `types` | `./js/website/offerings.js` @34 → `./js/core/escape-html.js` @35 → `./js/website/practice-grid.js` @36 → `./js/website/why-grid.js` @37 → `./js/features/timetable/store.js` @38 → `./js/features/students/store.js` @39 → `./app.js` @40 |
| `self-register.html` | `self-register` | `./js/website/offerings.js` @234 → `./js/core/escape-html.js` @235 → `./js/website/practice-grid.js` @236 → `./js/website/why-grid.js` @237 → `./js/features/timetable/store.js` @238 → `./js/features/students/store.js` @239 → `./app.js` @240 → `./supabase-config.js` @241 → `./js/shared-ui/action-dialog.js` @242 → `./auth.js?v=self-registration-links` @243 |
| `signup.html` | `signup` | `./js/website/offerings.js` @218 → `./js/core/escape-html.js` @219 → `./js/website/practice-grid.js` @220 → `./js/website/why-grid.js` @221 → `./js/features/timetable/store.js` @222 → `./js/features/students/store.js` @223 → `./app.js` @224 → `./supabase-config.js` @225 → `./js/shared-ui/action-dialog.js` @226 → `./auth.js` @227 |
| `staff-attendance.html` | `staff-attendance` | `./js/website/offerings.js` @45 → `./js/core/escape-html.js` @46 → `./js/website/practice-grid.js` @47 → `./js/website/why-grid.js` @48 → `./js/features/timetable/store.js` @49 → `./js/features/students/store.js` @50 → `./app.js` @51 → `./supabase-config.js` @52 → `./js/shared-ui/action-dialog.js` @53 → `./auth.js` @54 |
| `staff-classes.html` | `staff-classes` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-dashboard.html` | `staff-dashboard` | `./js/website/offerings.js` @82 → `./js/core/escape-html.js` @83 → `./js/website/practice-grid.js` @84 → `./js/website/why-grid.js` @85 → `./js/features/timetable/store.js` @86 → `./js/features/students/store.js` @87 → `./app.js` @88 → `./supabase-config.js` @89 → `./js/shared-ui/action-dialog.js` @90 → `./auth.js` @91 |
| `staff-gradebook.html` | `staff-gradebook` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-leave.html` | `staff-leave` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-lesson-plans.html` | `staff-lesson-plans` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-messages.html` | `staff-messages` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-results.html` | `staff-results` | `./js/website/offerings.js` @25 → `./js/core/escape-html.js` @26 → `./js/website/practice-grid.js` @27 → `./js/website/why-grid.js` @28 → `./js/features/timetable/store.js` @29 → `./js/features/students/store.js` @30 → `./app.js` @31 → `./supabase-config.js` @31 → `./js/shared-ui/action-dialog.js` @31 → `./auth.js` @32 |
| `staff-settings.html` | `staff-settings` | `./js/website/offerings.js` @143 → `./js/core/escape-html.js` @144 → `./js/website/practice-grid.js` @145 → `./js/website/why-grid.js` @146 → `./js/features/timetable/store.js` @147 → `./js/features/students/store.js` @148 → `./app.js` @149 → `./supabase-config.js` @150 → `./js/shared-ui/action-dialog.js` @151 → `./auth.js` @152 |
| `staff-timetable.html` | `staff-timetable` | `./js/website/offerings.js` @53 → `./js/core/escape-html.js` @54 → `./js/website/practice-grid.js` @55 → `./js/website/why-grid.js` @56 → `./js/features/timetable/store.js` @57 → `./js/features/students/store.js` @58 → `./app.js` @59 → `./supabase-config.js` @60 → `./js/shared-ui/action-dialog.js` @61 → `./auth.js` @62 |
| `super-admin-accounts.html` | `super-admin-accounts` | `./js/website/offerings.js` @128 → `./js/core/escape-html.js` @129 → `./js/website/practice-grid.js` @130 → `./js/website/why-grid.js` @131 → `./js/features/timetable/store.js` @132 → `./js/features/students/store.js` @133 → `./app.js?v=20260611-student-messages` @134 → `./supabase-config.js` @135 → `./js/shared-ui/action-dialog.js` @136 → `./auth.js?v=20260611-student-messages` @137 |
| `super-admin-activity.html` | `super-admin-activity` | `./js/website/offerings.js` @102 → `./js/core/escape-html.js` @103 → `./js/website/practice-grid.js` @104 → `./js/website/why-grid.js` @105 → `./js/features/timetable/store.js` @106 → `./js/features/students/store.js` @107 → `./app.js?v=20260611-student-messages` @108 → `./supabase-config.js` @109 → `./js/shared-ui/action-dialog.js` @110 → `./auth.js?v=20260611-student-messages` @111 |
| `super-admin-schools.html` | `super-admin-schools` | `./js/website/offerings.js` @102 → `./js/core/escape-html.js` @103 → `./js/website/practice-grid.js` @104 → `./js/website/why-grid.js` @105 → `./js/features/timetable/store.js` @106 → `./js/features/students/store.js` @107 → `./app.js?v=20260611-student-messages` @108 → `./supabase-config.js` @109 → `./js/shared-ui/action-dialog.js` @110 → `./auth.js?v=20260611-student-messages` @111 |
| `super-admin.html` | `super-admin` | `./js/website/offerings.js` @105 → `./js/core/escape-html.js` @106 → `./js/website/practice-grid.js` @107 → `./js/website/why-grid.js` @108 → `./js/features/timetable/store.js` @109 → `./js/features/students/store.js` @110 → `./app.js?v=20260611-student-messages` @111 → `./supabase-config.js` @112 → `./js/shared-ui/action-dialog.js` @113 → `./auth.js?v=20260611-student-messages` @114 |
| `user-settings.html` | `user-settings` | `./js/website/offerings.js` @143 → `./js/core/escape-html.js` @144 → `./js/website/practice-grid.js` @145 → `./js/website/why-grid.js` @146 → `./js/features/timetable/store.js` @147 → `./js/features/students/store.js` @148 → `./app.js` @149 → `./supabase-config.js` @150 → `./js/shared-ui/action-dialog.js` @151 → `./auth.js` @152 |
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
| `getPortalOnboardingStorageKey` | `auth.js:33102-33108` | `DEFAULT_AUTH_ROLE`, `PORTAL_ONBOARDING_STORAGE_KEY`, `getCurrentWorkspaceId`, `getPortalOnboardingRoleKey`, `normalizeWorkspaceId` |
| `getParentSelectionStorageKey` | `auth.js:39334-39339` | `PARENT_SELECTION_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `getSession`, `normalizeWorkspaceId` |
| `getParentFeesStorageKey` | `auth.js:39357-39359` | `PARENT_FEES_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getSuperAdminKnownWorkspaceIds` | `auth.js:41728-41756` | `ADMISSIONS_STORAGE_KEY_BASE`, `NOTIFICATION_STORAGE_PREFIX`, `WORKSPACE_SCOPED_STATE_KEYS`, `getUsers`, `normalizeWorkspaceId` |
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
| `auth.js:24783` | `syncAttendanceAbsenceNotifications` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId }` |
| `auth.js:39372` | `saveParentFeesState` | `PARENT_FEES_EVENT_NAME` | `{ workspaceId: resolvedWorkspaceId, }` |
| `auth.js:46437` | `initUserSettingsPage` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizeWorkspaceId(activeUser.workspaceId &#124;&#124; session.workspaceId &#124;&#124; getCurrentWorkspaceId()), }` |
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
| `auth.js:13712` | `initTimetableControls` | `getElementById` | `"portal-timetable-lesson-overlay"` |
| `auth.js:13713` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-overlay"` |
| `auth.js:13714` | `initTimetableControls` | `getElementById` | `"portal-calendar-substitution-log"` |
| `auth.js:13715` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-form"` |
| `auth.js:13716` | `initTimetableControls` | `getElementById` | `"timetable-period-title"` |
| `auth.js:13717` | `initTimetableControls` | `getElementById` | `"timetable-session-id"` |
| `auth.js:13718` | `initTimetableControls` | `getElementById` | `"timetable-term-id"` |
| `auth.js:13719` | `initTimetableControls` | `getElementById` | `"timetable-view-mode"` |
| `auth.js:13720` | `initTimetableControls` | `getElementById` | `"timetable-class-level"` |
| `auth.js:13721` | `initTimetableControls` | `getElementById` | `"timetable-teacher-view"` |
| `auth.js:13722` | `initTimetableControls` | `getElementById` | `"timetable-week-type"` |
| `auth.js:13723` | `initTimetableControls` | `querySelector` | `"[data-timetable-copy-term]"` |
| `auth.js:13724` | `initTimetableControls` | `querySelector` | `"[data-timetable-period-add]"` |
| `auth.js:13725` | `initTimetableControls` | `querySelector` | `"[data-timetable-save-class]"` |
| `auth.js:13726` | `initTimetableControls` | `querySelector` | `"[data-timetable-print]"` |
| `auth.js:13727` | `initTimetableControls` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:13728` | `initTimetableControls` | `getElementById` | `"timetable-form-title"` |
| `auth.js:13729` | `initTimetableControls` | `getElementById` | `"timetable-form-context"` |
| `auth.js:13745` | `initTimetableControls` | `getElementById` | `"portal-timetable-toast"` |
| `auth.js:13764` | `initTimetableControls` | `getElementById` | `"portal-timetable-inline-status"` |
| `auth.js:13828` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal"` |
| `auth.js:13829` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal-body"` |
| `auth.js:13831` | `initTimetableControls` | `closest` | `"[data-timetable-class-close]"` |
| `auth.js:13835` | `initTimetableControls` | `closest` | `"[data-timetable-class-print-current]"` |
| `auth.js:13846` | `initTimetableControls` | `querySelectorAll` | `".portal-field"` |
| `auth.js:13847` | `initTimetableControls` | `querySelectorAll` | `"[data-period-error-for]"` |
| `auth.js:13856` | `initTimetableControls` | `querySelector` | ``[data-period-error-for="${fieldName}"]`` |
| `auth.js:13858` | `initTimetableControls` | `closest` | `".portal-field"` |
| `auth.js:14115` | `initTimetableControls` | `querySelector` | `".portal-timetable-grid"` |
| `auth.js:14280` | `initTimetableControls` | `closest` | `".portal-field"` |
| `auth.js:14671` | `initTimetableControls` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:14683` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-lesson-close]"` |
| `auth.js:14694` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-period-close]"` |
| `auth.js:14891` | `initTimetableControls` | `closest` | `"[data-timetable-inline-action]"` |
| `auth.js:14892` | `initTimetableControls` | `closest` | `"[data-timetable-period-edit]"` |
| `auth.js:14893` | `initTimetableControls` | `closest` | `"[data-timetable-slot]"` |
| `auth.js:14894` | `initTimetableControls` | `closest` | `"[data-timetable-action]"` |
| `auth.js:14895` | `initTimetableControls` | `closest` | `"[data-timetable-class-action]"` |
| `auth.js:14896` | `initTimetableControls` | `closest` | `"[data-timetable-group-action]"` |
| `auth.js:15159` | `initFeeManagementControls` | `querySelector` | `"[data-fee-form-toggle]"` |
| `auth.js:15163` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-status"` |
| `auth.js:15164` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-list"` |
| `auth.js:15165` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-form-open]"` |
| `auth.js:15166` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-form-overlay"` |
| `auth.js:15168` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-session"` |
| `auth.js:15169` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-term"` |
| `auth.js:15170` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-class"` |
| `auth.js:15171` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-student"` |
| `auth.js:15172` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-due-date"` |
| `auth.js:15173` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-whatsapp"` |
| `auth.js:15174` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-generate-single]"` |
| `auth.js:15176` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-overlay"` |
| `auth.js:15177` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-body"` |
| `auth.js:15178` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-title"` |
| `auth.js:15179` | `initFeeManagementControls` | `getElementById` | `"portal-fee-category-options"` |
| `auth.js:15180` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-overlay"` |
| `auth.js:15181` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-modal-title"` |
| `auth.js:15189` | `initFeeManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:15197` | `initFeeManagementControls` | `getElementById` | `"portal-fee-toast"` |
| `auth.js:15683` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-close]"` |
| `auth.js:16438` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-form-close]"` |
| `auth.js:16444` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class]"` |
| `auth.js:16453` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class-whatsapp]"` |
| `auth.js:16462` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-action]"` |
| `auth.js:16484` | `initFeeManagementControls` | `closest` | `"details[data-invoice-class-token]"` |
| `auth.js:16504` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-close]"` |
| `auth.js:16509` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-current]"` |
| `auth.js:16518` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-with-history]"` |
| `auth.js:16527` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-history]"` |
| `auth.js:16536` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-download-history]"` |
| `auth.js:16586` | `initFeeManagementControls` | `closest` | `"[data-fee-category]"` |
| `auth.js:16603` | `initFeeManagementControls` | `closest` | `"[data-fee-form-close]"` |
| `auth.js:16699` | `initFeeManagementControls` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:16704` | `initFeeManagementControls` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:16715` | `initFeeManagementControls` | `closest` | `"[data-fee-action]"` |
| `auth.js:16741` | `initFeeManagementControls` | `closest` | `"[data-fee-action='edit']"` |
| `auth.js:16780` | `initSchoolSettingsControls` | `querySelector` | `'input[name="logoFile"]'` |
| `auth.js:16781` | `initSchoolSettingsControls` | `querySelector` | `"[data-clear-logo]"` |
| `auth.js:16782` | `initSchoolSettingsControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:16783` | `initSchoolSettingsControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:17030` | `initSchoolSettingsControls` | `querySelector` | `"[data-reset-school-settings]"` |
| `auth.js:17311` | `initRolePermissionControls` | `matches` | `"[data-role-permission-role][data-role-permission-key]"` |
| `auth.js:17426` | `initAcademicCycleControls` | `closest` | `"[data-term-period-type-wrap]"` |
| `auth.js:17426` | `initAcademicCycleControls` | `closest` | `".portal-field"` |
| `auth.js:17440` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:17441` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:17454` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:17455` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:17779` | `initAcademicCycleControls` | `closest` | `"[data-session-action]"` |
| `auth.js:17799` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:17800` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:17832` | `initAcademicCycleControls` | `closest` | `"[data-term-action]"` |
| `auth.js:17857` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:17858` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:17875` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:17884` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:17944` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17945` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-structure-block"` |
| `auth.js:17946` | `clearPortalSettingsErrors` | `querySelectorAll` | `"[data-settings-error-for]"` |
| `auth.js:17952` | `setPortalSettingsError` | `querySelector` | ``[data-settings-error-for="${fieldName}"]`` |
| `auth.js:17955` | `setPortalSettingsError` | `closest` | `".portal-field"` |
| `auth.js:17968` | `clearPortalSessionErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17969` | `clearPortalSessionErrors` | `querySelectorAll` | `"[data-session-error-for]"` |
| `auth.js:17975` | `setPortalSessionError` | `querySelector` | ``[data-session-error-for="${fieldName}"]`` |
| `auth.js:17977` | `setPortalSessionError` | `closest` | `".portal-field"` |
| `auth.js:17989` | `clearPortalTermErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:17990` | `clearPortalTermErrors` | `querySelectorAll` | `"[data-term-error-for]"` |
| `auth.js:17996` | `setPortalTermError` | `querySelector` | ``[data-term-error-for="${fieldName}"]`` |
| `auth.js:17998` | `setPortalTermError` | `closest` | `".portal-field"` |
| `auth.js:18010` | `clearPortalClassErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18011` | `clearPortalClassErrors` | `querySelectorAll` | `"[data-class-error-for]"` |
| `auth.js:18017` | `setPortalClassError` | `querySelector` | ``[data-class-error-for="${fieldName}"]`` |
| `auth.js:18019` | `setPortalClassError` | `closest` | `".portal-field"` |
| `auth.js:18031` | `clearPortalCalendarErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18032` | `clearPortalCalendarErrors` | `querySelectorAll` | `"[data-calendar-error-for]"` |
| `auth.js:18038` | `setPortalCalendarError` | `querySelector` | ``[data-calendar-error-for="${fieldName}"]`` |
| `auth.js:18040` | `setPortalCalendarError` | `closest` | `".portal-field"` |
| `auth.js:18111` | `clearPortalCourseErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18112` | `clearPortalCourseErrors` | `querySelectorAll` | `"[data-course-error-for]"` |
| `auth.js:18118` | `setPortalCourseError` | `querySelector` | ``[data-course-error-for="${fieldName}"]`` |
| `auth.js:18120` | `setPortalCourseError` | `closest` | `".portal-field"` |
| `auth.js:18188` | `resetPortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:18197` | `resetPortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:18198` | `resetPortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:18231` | `populatePortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:18236` | `populatePortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:18237` | `populatePortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:18281` | `resetPortalCourseForm` | `querySelector` | `"[data-course-subject-select]"` |
| `auth.js:18282` | `resetPortalCourseForm` | `querySelector` | `"[data-course-custom-subject]"` |
| `auth.js:18310` | `resetPortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:18311` | `resetPortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:18394` | `populatePortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:18395` | `populatePortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:18427` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:18428` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:18457` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:18458` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:18476` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18477` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `"[data-admission-config-error-for]"` |
| `auth.js:18483` | `setPortalAdmissionConfigError` | `querySelector` | ``[data-admission-config-error-for="${fieldName}"]`` |
| `auth.js:18485` | `setPortalAdmissionConfigError` | `closest` | `".portal-field"` |
| `auth.js:18496` | `clearPortalTimetableErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18497` | `clearPortalTimetableErrors` | `querySelectorAll` | `"[data-timetable-error-for]"` |
| `auth.js:18503` | `setPortalTimetableError` | `querySelector` | ``[data-timetable-error-for="${fieldName}"]`` |
| `auth.js:18505` | `setPortalTimetableError` | `closest` | `".portal-field"` |
| `auth.js:18516` | `clearPortalFeeErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18517` | `clearPortalFeeErrors` | `querySelectorAll` | `"[data-fee-error-for]"` |
| `auth.js:18523` | `setPortalFeeError` | `querySelector` | ``[data-fee-error-for="${fieldName}"]`` |
| `auth.js:18525` | `setPortalFeeError` | `closest` | `".portal-field"` |
| `auth.js:18550` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:18551` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:18552` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:18553` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:18554` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:18588` | `populatePortalTimetableForm` | `getElementById` | `"timetable-session-id"` |
| `auth.js:18589` | `populatePortalTimetableForm` | `getElementById` | `"timetable-term-id"` |
| `auth.js:18590` | `populatePortalTimetableForm` | `getElementById` | `"timetable-class-level"` |
| `auth.js:18591` | `populatePortalTimetableForm` | `getElementById` | `"timetable-teacher-view"` |
| `auth.js:18592` | `populatePortalTimetableForm` | `getElementById` | `"timetable-week-type"` |
| `auth.js:18593` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:18594` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:18641` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:18642` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:18643` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:18679` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:18680` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:18681` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:18725` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:18726` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:18727` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:18768` | `getSelectedSchoolTypesFromForm` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:18781` | `syncSchoolTypeControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:18789` | `syncSchoolTypeControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:18802` | `syncHigherInstitutionTypeField` | `querySelector` | `"[data-higher-institution-type-field]"` |
| `auth.js:18948` | `updateLogoSwatch` | `querySelector` | `"[data-logo-swatch]"` |
| `auth.js:18982` | `clearPortalAccessErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18983` | `clearPortalAccessErrors` | `querySelectorAll` | `"[data-access-error-for]"` |
| `auth.js:18989` | `setPortalAccessError` | `querySelector` | ``[data-access-error-for="${fieldName}"]`` |
| `auth.js:18991` | `setPortalAccessError` | `closest` | `".portal-field"` |
| `auth.js:19028` | `resetPortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:19029` | `resetPortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:19065` | `populatePortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:19066` | `populatePortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:19113` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal"` |
| `auth.js:19114` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-body"` |
| `auth.js:19115` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-title"` |
| `auth.js:19117` | `ensureAccessGrantModal` | `closest` | `"[data-access-grant-close]"` |
| `auth.js:19130` | `setAccessGrantModalOpen` | `querySelector` | `"[data-access-grant-close]"` |
| `auth.js:19852` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:19957` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:19959` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:19974` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:19975` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:19986` | `initAccessProvisioningControls` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:20004` | `clearPortalStaffErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:20005` | `clearPortalStaffErrors` | `querySelectorAll` | `"[data-staff-error-for]"` |
| `auth.js:20011` | `setPortalStaffError` | `querySelector` | ``[data-staff-error-for="${fieldName}"]`` |
| `auth.js:20013` | `setPortalStaffError` | `closest` | `".portal-field"` |
| `auth.js:20094` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:20095` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:20160` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:20161` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:20389` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-search"` |
| `auth.js:20390` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-status"` |
| `auth.js:20391` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-overlay"` |
| `auth.js:20392` | `initStaffManagementControls` | `querySelector` | `"[data-staff-form-open]"` |
| `auth.js:20393` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-title"` |
| `auth.js:20412` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:20446` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:20482` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:20486` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-grid"` |
| `auth.js:20496` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:20917` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:20944` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:20948` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-content"` |
| `auth.js:20950` | `initStaffManagementControls` | `closest` | `"[data-staff-created-close]"` |
| `auth.js:20952` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:20958` | `initStaffManagementControls` | `closest` | `"[data-staff-created-print]"` |
| `auth.js:20965` | `initStaffManagementControls` | `closest` | `"[data-staff-created-mail]"` |
| `auth.js:20995` | `initStaffManagementControls` | `querySelector` | `"[data-staff-created-print]"` |
| `auth.js:21132` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-edit]"` |
| `auth.js:21133` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-status]"` |
| `auth.js:21134` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-delete]"` |
| `auth.js:21293` | `initStaffManagementControls` | `closest` | `"[data-staff-form-close]"` |
| `auth.js:21633` | `initStaffManagementControls` | `closest` | `"[data-staff-open]"` |
| `auth.js:21652` | `initStaffManagementControls` | `closest` | `"[data-staff-view-close]"` |
| `auth.js:21658` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-print]"` |
| `auth.js:21667` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-mail]"` |
| `auth.js:21676` | `initStaffManagementControls` | `closest` | `"[data-staff-view-edit]"` |
| `auth.js:21694` | `initStaffManagementControls` | `closest` | `"[data-staff-view-status]"` |
| `auth.js:21717` | `initStaffManagementControls` | `closest` | `"[data-staff-view-delete]"` |
| `auth.js:21741` | `initStaffManagementControls` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:21960` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:21981` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:21985` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-content"` |
| `auth.js:21986` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-title"` |
| `auth.js:21987` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-modal-status"` |
| `auth.js:21997` | `initAdminStaffLeaveReviewControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:22113` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-open]"` |
| `auth.js:22132` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-review-close]"` |
| `auth.js:22138` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-approve]"` |
| `auth.js:22144` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-reject]"` |
| `auth.js:22214` | `renderPortalFeatureToggleSection` | `querySelectorAll` | `"[data-feature-toggle]"` |
| `auth.js:24304` | `clearPortalStudentErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:24305` | `clearPortalStudentErrors` | `querySelectorAll` | `"[data-student-error-for]"` |
| `auth.js:24311` | `setPortalStudentError` | `querySelector` | ``[data-student-error-for="${fieldName}"]`` |
| `auth.js:24313` | `setPortalStudentError` | `closest` | `".portal-field"` |
| `auth.js:25053` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:25055` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:25071` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:25072` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:25146` | `parseGuardianRows` | `querySelectorAll` | `".portal-guardian-row"` |
| `auth.js:25152` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="name"]'` |
| `auth.js:25154` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="phone"]'` |
| `auth.js:25155` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="email"]'` |
| `auth.js:25217` | `resetPortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:25218` | `resetPortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:25289` | `populatePortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:25290` | `populatePortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:25371` | `parseSpreadsheetXmlRows` | `querySelector` | `"parsererror"` |
| `auth.js:25398` | `parseSpreadsheetXmlRows` | `querySelector` | `"Data"` |
| `auth.js:25399` | `parseSpreadsheetXmlRows` | `querySelector` | `"ss\\:Data"` |
| `auth.js:25892` | `initStudentManagementControls` | `querySelector` | `"[data-add-guardian]"` |
| `auth.js:25893` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-form"` |
| `auth.js:25894` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-status"` |
| `auth.js:25895` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-toggle]"` |
| `auth.js:25896` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-panel"` |
| `auth.js:25897` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-overlay"` |
| `auth.js:25898` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-overlay"` |
| `auth.js:25899` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-overlay"` |
| `auth.js:25900` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-content"` |
| `auth.js:25901` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-overlay"` |
| `auth.js:25902` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-status"` |
| `auth.js:25903` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-list"` |
| `auth.js:25904` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-id"` |
| `auth.js:25905` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-name"` |
| `auth.js:25906` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-type"` |
| `auth.js:25907` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-file"` |
| `auth.js:25908` | `initStudentManagementControls` | `querySelector` | `"[data-student-doc-upload]"` |
| `auth.js:25909` | `initStudentManagementControls` | `getElementById` | `"portal-student-class-filters"` |
| `auth.js:25910` | `initStudentManagementControls` | `getElementById` | `"portal-student-search"` |
| `auth.js:25911` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-status"` |
| `auth.js:25912` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-file"` |
| `auth.js:25913` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-preview]"` |
| `auth.js:25914` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-confirm]"` |
| `auth.js:25915` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-preview"` |
| `auth.js:25919` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-title"` |
| `auth.js:26143` | `initStudentManagementControls` | `closest` | `"[data-student-class]"` |
| `auth.js:26154` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-create-close]"` |
| `auth.js:26163` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-import-close]"` |
| `auth.js:26169` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-view-close]"` |
| `auth.js:26175` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-docs-close]"` |
| `auth.js:26289` | `initStudentManagementControls` | `closest` | `"[data-student-doc-action]"` |
| `auth.js:26371` | `initStudentManagementControls` | `closest` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:26377` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:26382` | `initStudentManagementControls` | `closest` | `"[data-remove-guardian]"` |
| `auth.js:26388` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:26644` | `initStudentManagementControls` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:26656` | `initStudentManagementControls` | `closest` | `"[data-student-bulk-delete-level]"` |
| `auth.js:26729` | `initStudentManagementControls` | `closest` | `"[data-student-class-toggle]"` |
| `auth.js:26742` | `initStudentManagementControls` | `closest` | `".portal-student-group"` |
| `auth.js:26743` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-list"` |
| `auth.js:26744` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-toggle-arrow"` |
| `auth.js:26763` | `initStudentManagementControls` | `closest` | `"[data-student-action]"` |
| `auth.js:27412` | `initStudentManagementControls` | `closest` | `"[data-student-photo-action]"` |
| `auth.js:27425` | `initStudentManagementControls` | `querySelector` | `"[data-student-photo-input]"` |
| `auth.js:27452` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:27457` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:27465` | `initStudentManagementControls` | `closest` | `"[data-student-photo-input]"` |
| `auth.js:27503` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:27509` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="remove"]'` |
| `auth.js:27513` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:27521` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-template-download]"` |
| `auth.js:27730` | `getSelectedRole` | `querySelector` | `".auth-role.is-active"` |
| `auth.js:27740` | `getSelectedRole` | `querySelector` | `".auth-role-label"` |
| `auth.js:27751` | `initRoleButtons` | `getElementById` | `"login-email"` |
| `auth.js:27752` | `initRoleButtons` | `querySelector` | `'.auth-field-label[for="login-email"]'` |
| `auth.js:27763` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:27765` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:27774` | `initPasswordToggles` | `querySelectorAll` | `"[data-password-toggle]"` |
| `auth.js:27777` | `initPasswordToggles` | `getElementById` | `targetId` |
| `auth.js:27809` | `getActionFeedbackTrigger` | `matches` | `[ "[data-no-inline-feedback]", "[data-password-toggle]", "[data-theme-toggle]", "[data-sidebar-toggle]", "[data-auth-modal-close]", "[data-auth-role]", ].join(",")` |
| `auth.js:27865` | `getInlineActionFeedbackHost` | `getElementById` | `existingId` |
| `auth.js:27879` | `getInlineActionFeedbackHost` | `closest` | `".inline-action-feedback-wrap"` |
| `auth.js:27977` | `clearInlineActionFeedback` | `getElementById` | `hostId` |
| `auth.js:28075` | `clearFieldErrors` | `querySelectorAll` | `".auth-line-field"` |
| `auth.js:28076` | `clearFieldErrors` | `querySelectorAll` | `".auth-check"` |
| `auth.js:28077` | `clearFieldErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:28078` | `clearFieldErrors` | `querySelectorAll` | `".auth-field-error"` |
| `auth.js:28084` | `setFieldError` | `querySelector` | ``[data-error-for="${fieldName}"]`` |
| `auth.js:28087` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:28088` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:28089` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:28090` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:28091` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:28092` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:28180` | `initSignupFlow` | `getElementById` | `"signup-form"` |
| `auth.js:28181` | `initSignupFlow` | `getElementById` | `"signup-status"` |
| `auth.js:28194` | `initSignupFlow` | `closest` | `"[data-supabase-resend-confirmation]"` |
| `auth.js:28641` | `initLoginFlow` | `getElementById` | `"login-form"` |
| `auth.js:28642` | `initLoginFlow` | `getElementById` | `"login-status"` |
| `auth.js:28939` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-form"` |
| `auth.js:28940` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-status"` |
| `auth.js:28941` | `initOwnerAccessFlow` | `getElementById` | `"owner-confirm-block"` |
| `auth.js:28942` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-copy"` |
| `auth.js:28943` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-submit"` |
| `auth.js:29040` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form"` |
| `auth.js:29041` | `initForgotPasswordFlow` | `getElementById` | `"forgot-status"` |
| `auth.js:29042` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form-view"` |
| `auth.js:29043` | `initForgotPasswordFlow` | `getElementById` | `"forgot-sent-view"` |
| `auth.js:29129` | `initResetPasswordFlow` | `getElementById` | `"reset-form"` |
| `auth.js:29130` | `initResetPasswordFlow` | `getElementById` | `"reset-status"` |
| `auth.js:29131` | `initResetPasswordFlow` | `getElementById` | `"reset-form-wrapper"` |
| `auth.js:29132` | `initResetPasswordFlow` | `getElementById` | `"reset-invalid-view"` |
| `auth.js:29133` | `initResetPasswordFlow` | `getElementById` | `"reset-success-view"` |
| `auth.js:29310` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29340` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29342` | `ensureGoogleModal` | `querySelectorAll` | `"[data-auth-modal-close]"` |
| `auth.js:29346` | `ensureGoogleModal` | `querySelector` | `"#auth-google-form"` |
| `auth.js:29353` | `openGoogleModal` | `querySelector` | `"#auth-google-title"` |
| `auth.js:29354` | `openGoogleModal` | `querySelector` | `"#auth-google-copy"` |
| `auth.js:29355` | `openGoogleModal` | `querySelector` | `"#auth-google-error"` |
| `auth.js:29356` | `openGoogleModal` | `querySelector` | `"#auth-google-email"` |
| `auth.js:29373` | `closeGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29385` | `startSupabaseGoogleAuth` | `getElementById` | `page === "signup" ? "signup-status" : "login-status"` |
| `auth.js:29386` | `startSupabaseGoogleAuth` | `getElementById` | `"login-remember"` |
| `auth.js:29423` | `handleGoogleSubmit` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29425` | `handleGoogleSubmit` | `querySelector` | `"#auth-google-error"` |
| `auth.js:29550` | `initGoogleButtons` | `querySelectorAll` | `"[data-google-auth]"` |
| `auth.js:29569` | `initConfirmPage` | `getElementById` | `"confirm-status"` |
| `auth.js:29570` | `initConfirmPage` | `getElementById` | `"confirm-heading"` |
| `auth.js:29571` | `initConfirmPage` | `getElementById` | `"confirm-copy"` |
| `auth.js:29572` | `initConfirmPage` | `getElementById` | `"confirm-details"` |
| `auth.js:29626` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-form"` |
| `auth.js:29627` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-status"` |
| `auth.js:29628` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-workspace-id"` |
| `auth.js:29629` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-copy"` |
| `auth.js:29630` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-step-indicator"` |
| `auth.js:29631` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-review-panel"` |
| `auth.js:29632` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition"` |
| `auth.js:29633` | `initAdmissionsApplyPage` | `getElementById` | `"health-condition-details-wrap"` |
| `auth.js:29634` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition-details"` |
| `auth.js:29638` | `initAdmissionsApplyPage` | `querySelectorAll` | `'input[type="file"]'` |
| `auth.js:29656` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-brand-mark"` |
| `auth.js:29657` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-school-name"` |
| `auth.js:29844` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admissions-step]"` |
| `auth.js:29853` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-toast"` |
| `auth.js:29890` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:29926` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:29928` | `initAdmissionsApplyPage` | `querySelector` | `"[data-apply-file-selection]"` |
| `auth.js:30199` | `initAdmissionsApplyPage` | `closest` | `"[data-apply-file-remove]"` |
| `auth.js:30221` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-next]"` |
| `auth.js:30230` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-prev]"` |
| `auth.js:30555` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-date]"` |
| `auth.js:30556` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-lesson]"` |
| `auth.js:30557` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-form]"` |
| `auth.js:30558` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"#teacher-attendance-status"` |
| `auth.js:30586` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `".attendance-status-option input"` |
| `auth.js:30588` | `renderTeacherAttendanceWorkspace` | `closest` | `".attendance-status-picker"` |
| `auth.js:30595` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-mark-all]"` |
| `auth.js:30598` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `'.attendance-status-option input[value="present"]'` |
| `auth.js:30610` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:30614` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:30623` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:30655` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:30659` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:30660` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:32174` | `showReportCardToast` | `getElementById` | `"portal-report-card-toast"` |
| `auth.js:32223` | `loadReportCardPdfLibrary` | `querySelector` | `'script[data-report-card-pdf-library="true"]'` |
| `auth.js:32463` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:32490` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:32493` | `ensureReportCardModal` | `closest` | `"[data-report-card-close]"` |
| `auth.js:32496` | `ensureReportCardModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:32500` | `ensureReportCardModal` | `closest` | `"[data-report-card-print]"` |
| `auth.js:32505` | `ensureReportCardModal` | `closest` | `"[data-report-card-download]"` |
| `auth.js:32523` | `ensureReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:32537` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-body"` |
| `auth.js:32538` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-title"` |
| `auth.js:32550` | `openReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:32566` | `wireReportCardDocumentActions` | `closest` | `"[data-report-card-action]"` |
| `auth.js:33394` | `showPortalOnboardingModal` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:33486` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-close]"` |
| `auth.js:33487` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-skip]"` |
| `auth.js:33488` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-prev]"` |
| `auth.js:33489` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-next]"` |
| `auth.js:33490` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-step]"` |
| `auth.js:33491` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-open-section]"` |
| `auth.js:33537` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-metrics"` |
| `auth.js:33544` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-onboarding-checklist"` |
| `auth.js:33594` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-open-onboarding-guide]"` |
| `auth.js:33597` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-dismiss-onboarding-checklist]"` |
| `auth.js:33614` | `initPortalOnboarding` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:33657` | `initPortalAnnouncementToasts` | `getElementById` | `"portal-announcement-toast"` |
| `auth.js:33697` | `initPortalAnnouncementToasts` | `querySelector` | `".portal-announcement-toast-timer"` |
| `auth.js:33703` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-title]"` |
| `auth.js:33705` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-message]"` |
| `auth.js:33707` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-meta]"` |
| `auth.js:33731` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-close]"` |
| `auth.js:33842` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:33843` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:34163` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:34183` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:34194` | `renderStudentClassesSection` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:34199` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-title"` |
| `auth.js:34200` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-body"` |
| `auth.js:34211` | `renderStudentClassesSection` | `querySelectorAll` | `"[data-student-other-class-open]"` |
| `auth.js:34226` | `renderStudentClassesSection` | `closest` | `"[data-student-class-roster-close]"` |
| `auth.js:34564` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head h2"` |
| `auth.js:34565` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head span"` |
| `auth.js:34834` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:34835` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:35164` | `renderStaffTimetableWorkspace` | `querySelectorAll` | `"[data-staff-timetable-view]"` |
| `auth.js:35285` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:35305` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:35309` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-title"` |
| `auth.js:35310` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-body"` |
| `auth.js:35320` | `renderStaffClassesWorkspace` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:35345` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-open]"` |
| `auth.js:35363` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-roster-close]"` |
| `auth.js:35696` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:35704` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-class]"` |
| `auth.js:35709` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-subject]"` |
| `auth.js:35713` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-session]"` |
| `auth.js:35718` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-term]"` |
| `auth.js:35725` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:35726` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-components]"` |
| `auth.js:35728` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:35731` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-name]"` |
| `auth.js:35732` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-maximum]"` |
| `auth.js:35736` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(component.id)}"]`` |
| `auth.js:35744` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-component-total]"` |
| `auth.js:35749` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:35752` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-score="${CSS.escape(component.id)}"]`` |
| `auth.js:35757` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-student-total]"` |
| `auth.js:35764` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:35764` | `renderStaffGradebookWorkspace` | `matches` | `"[data-gradebook-score]"` |
| `auth.js:35768` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-add-component]"` |
| `auth.js:35783` | `renderStaffGradebookWorkspace` | `querySelector` | `".staff-gradebook-table thead th:last-child"` |
| `auth.js:35788` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:35799` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-remove-component]"` |
| `auth.js:35801` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:35805` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:35808` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(componentId)}"]`` |
| `auth.js:35809` | `renderStaffGradebookWorkspace` | `querySelectorAll` | ``[data-gradebook-score="${CSS.escape(componentId)}"]`` |
| `auth.js:35810` | `renderStaffGradebookWorkspace` | `closest` | `"td"` |
| `auth.js:35814` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-save]"` |
| `auth.js:35833` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-student="${CSS.escape(student.id)}"]`` |
| `auth.js:35947` | `collectStaffReportCardSubjects` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:35951` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:35952` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectCode"]'` |
| `auth.js:35953` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:35954` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:36317` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-context-form"` |
| `auth.js:36318` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-form"` |
| `auth.js:36349` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-status"` |
| `auth.js:36350` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-subject-rows"` |
| `auth.js:36352` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36353` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:36354` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:36357` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-total]"` |
| `auth.js:36358` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-grade]"` |
| `auth.js:36362` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:36375` | `renderStaffResultsWorkspace` | `querySelector` | ``[data-report-editor-summary="${key}"]`` |
| `auth.js:36416` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:36421` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-add]"` |
| `auth.js:36422` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36427` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36432` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-remove]"` |
| `auth.js:36434` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:36435` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36436` | `renderStaffResultsWorkspace` | `querySelector` | `"td"` |
| `auth.js:36443` | `renderStaffResultsWorkspace` | `closest` | `"[data-result-generate-summary]"` |
| `auth.js:36471` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-release]"` |
| `auth.js:36509` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-return-draft]"` |
| `auth.js:36940` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:36952` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:36956` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:36974` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:36978` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:36983` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:36987` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:37074` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:37075` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:37087` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37088` | `renderStaffLessonPlansWorkspace` | `closest` | `"[data-lesson-attachment-remove]"` |
| `auth.js:37091` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37095` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-reset]"` |
| `auth.js:37100` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-save-status]"` |
| `auth.js:37129` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:37132` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-action]"` |
| `auth.js:37530` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-history]"` |
| `auth.js:37535` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-picker]"` |
| `auth.js:37536` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-search]"` |
| `auth.js:37542` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:37548` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:37551` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-close]"` |
| `auth.js:37557` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:37564` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-group]"` |
| `auth.js:37565` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-key]:not([hidden])"` |
| `auth.js:37567` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-empty]"` |
| `auth.js:37572` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:37586` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-thread]"` |
| `auth.js:37599` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-delete-thread]"` |
| `auth.js:37628` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-composer]"` |
| `auth.js:37659` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-status]"` |
| `auth.js:38211` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-form"` |
| `auth.js:38212` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-status"` |
| `auth.js:38218` | `renderStaffLeaveWorkspace` | `querySelector` | `"[data-leave-days-output]"` |
| `auth.js:38612` | `wireNotificationReplyForms` | `closest` | `"[data-notification-parent-reply-form]"` |
| `auth.js:38634` | `wireNotificationReplyForms` | `querySelector` | `"button[type='submit']"` |
| `auth.js:38648` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:38675` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:38999` | `initDashboardGlobalSearch` | `getElementById` | `input.getAttribute("aria-controls") &#124;&#124; "admin-search-suggestions"` |
| `auth.js:39052` | `initPortalNotifications` | `getElementById` | `"admin-notification-list"` |
| `auth.js:39069` | `initPortalNotifications` | `getElementById` | `"admin-notification-dot"` |
| `auth.js:39094` | `initPortalNotifications` | `querySelectorAll` | `"[data-notification-close]"` |
| `auth.js:39149` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-main"` |
| `auth.js:39150` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:39156` | `initAdminSectionQuickNav` | `querySelector` | `".admin-section-quick-nav"` |
| `auth.js:39162` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-settings-subnav a"` |
| `auth.js:39191` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-surface-card"` |
| `auth.js:39192` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:39210` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:39221` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:39221` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:39256` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-section-quick-link"` |
| `auth.js:39478` | `loadPaystackInline` | `querySelector` | `'script[src="https://js.paystack.co/v2/inline.js"]'` |
| `auth.js:39944` | `renderParentChildSelector` | `querySelector` | `"#parent-child-switch"` |
| `auth.js:40561` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:40584` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:40587` | `ensureParentFeeInvoiceModal` | `closest` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:40589` | `ensureParentFeeInvoiceModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:40598` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-title"` |
| `auth.js:40599` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-body"` |
| `auth.js:40611` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:40618` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:40777` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-form"` |
| `auth.js:40778` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-status"` |
| `auth.js:40779` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-view]"` |
| `auth.js:40780` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:40799` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-amount"` |
| `auth.js:40819` | `renderParentFeesPage` | `querySelector` | `"button[type='submit']"` |
| `auth.js:41437` | `initParentFloatingChatbot` | `getElementById` | `"parent-floating-chatbot"` |
| `auth.js:41496` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-toggle]"` |
| `auth.js:41497` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-panel]"` |
| `auth.js:41498` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-close]"` |
| `auth.js:41499` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-thread]"` |
| `auth.js:41500` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-form]"` |
| `auth.js:41553` | `initParentFloatingChatbot` | `querySelectorAll` | `"[data-parent-chatbot-question]"` |
| `auth.js:41600` | `initParentPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:41601` | `initParentPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:41602` | `initParentPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:41603` | `initParentPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:41604` | `initParentPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:41605` | `initParentPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:41606` | `initParentPages` | `getElementById` | `"portal-gate"` |
| `auth.js:41607` | `initParentPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:41638` | `initParentPages` | `getElementById` | `"parent-child-switcher"` |
| `auth.js:41640` | `initParentPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:41641` | `initParentPages` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:41676` | `initParentPages` | `getElementById` | `"parent-page-content"` |
| `auth.js:41894` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-search"` |
| `auth.js:41895` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-role-filter"` |
| `auth.js:41896` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-status-filter"` |
| `auth.js:42052` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-metrics"` |
| `auth.js:42053` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-users"` |
| `auth.js:42054` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-workspaces"` |
| `auth.js:42055` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-activity"` |
| `auth.js:42057` | `refreshSuperAdminConsole` | `getElementById` | `"portal-last-updated"` |
| `auth.js:42064` | `handleSuperAdminUserAction` | `closest` | `"[data-super-user-action]"` |
| `auth.js:42205` | `initSuperAdminPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:42206` | `initSuperAdminPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:42207` | `initSuperAdminPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:42208` | `initSuperAdminPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:42209` | `initSuperAdminPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:42210` | `initSuperAdminPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:42211` | `initSuperAdminPage` | `getElementById` | `"portal-gate"` |
| `auth.js:42212` | `initSuperAdminPage` | `getElementById` | `"super-admin-status"` |
| `auth.js:42213` | `initSuperAdminPage` | `getElementById` | `"super-admin-users"` |
| `auth.js:42240` | `initSuperAdminPage` | `querySelectorAll` | `"[data-super-refresh]"` |
| `auth.js:42247` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:42248` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:42266` | `initAdminShellPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:42267` | `initAdminShellPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:42268` | `initAdminShellPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:42269` | `initAdminShellPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:42270` | `initAdminShellPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:42271` | `initAdminShellPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:42272` | `initAdminShellPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:42273` | `initAdminShellPages` | `getElementById` | `"portal-gate"` |
| `auth.js:42656` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="applications"]'` |
| `auth.js:42657` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="history"]'` |
| `auth.js:42672` | `initAdmissionsControls` | `getElementById` | `"portal-admission-submit-button"` |
| `auth.js:42672` | `initAdmissionsControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:42673` | `initAdmissionsControls` | `getElementById` | `"portal-admission-cancel-edit"` |
| `auth.js:42674` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-overlay"` |
| `auth.js:42675` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-title"` |
| `auth.js:42676` | `initAdmissionsControls` | `querySelector` | `"[data-admission-form-open]"` |
| `auth.js:42773` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-form-close]"` |
| `auth.js:42786` | `initAdmissionsControls` | `getElementById` | `"portal-admission-approval-toast"` |
| `auth.js:42829` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal"` |
| `auth.js:42830` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal-body"` |
| `auth.js:42833` | `initAdmissionsControls` | `closest` | `"[data-admission-close]"` |
| `auth.js:42839` | `initAdmissionsControls` | `closest` | `"[data-admission-action]"` |
| `auth.js:42947` | `initAdmissionsControls` | `getElementById` | `"portal-admission-link-value"` |
| `auth.js:42948` | `initAdmissionsControls` | `getElementById` | `"portal-admission-copy-link"` |
| `auth.js:42949` | `initAdmissionsControls` | `getElementById` | `"portal-admission-open-link"` |
| `auth.js:42950` | `initAdmissionsControls` | `getElementById` | `"portal-admission-qr-image"` |
| `auth.js:43415` | `initAdmissionsControls` | `closest` | `"[data-admission-delete]"` |
| `auth.js:43425` | `initAdmissionsControls` | `closest` | `"[data-admission-open]"` |
| `auth.js:43441` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-delete-all]"` |
| `auth.js:43487` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-form"` |
| `auth.js:43488` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-status"` |
| `auth.js:43489` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-summary"` |
| `auth.js:43490` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-list"` |
| `auth.js:43491` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-history"` |
| `auth.js:43492` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-apply-link"` |
| `auth.js:43494` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-config-summary"` |
| `auth.js:43495` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-form"` |
| `auth.js:43496` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-status"` |
| `auth.js:43497` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-class-picker"` |
| `auth.js:43498` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-preview"` |
| `auth.js:43665` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-title"` |
| `auth.js:43666` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-copy"` |
| `auth.js:43667` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-school-name"` |
| `auth.js:43668` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-brand-mark"` |
| `auth.js:43669` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-kicker"` |
| `auth.js:43670` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-title"` |
| `auth.js:43671` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-copy"` |
| `auth.js:43796` | `initSelfRegisterPage` | `getElementById` | `"self-register-form"` |
| `auth.js:43797` | `initSelfRegisterPage` | `getElementById` | `"self-register-status"` |
| `auth.js:43798` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-student]"` |
| `auth.js:43799` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-staff]"` |
| `auth.js:43800` | `initSelfRegisterPage` | `getElementById` | `"self-student-level"` |
| `auth.js:43801` | `initSelfRegisterPage` | `getElementById` | `"self-register-submit"` |
| `auth.js:43977` | `initAdminStudentsPage` | `getElementById` | `"portal-student-summary"` |
| `auth.js:43978` | `initAdminStudentsPage` | `getElementById` | `"portal-student-form"` |
| `auth.js:43979` | `initAdminStudentsPage` | `getElementById` | `"portal-student-status"` |
| `auth.js:43980` | `initAdminStudentsPage` | `getElementById` | `"portal-student-list"` |
| `auth.js:43981` | `initAdminStudentsPage` | `getElementById` | `"portal-guardian-list"` |
| `auth.js:43982` | `initAdminStudentsPage` | `querySelector` | `"[data-student-form-toggle]"` |
| `auth.js:43998` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-link"` |
| `auth.js:43999` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-copy]"` |
| `auth.js:44000` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-open]"` |
| `auth.js:44001` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-status"` |
| `auth.js:44012` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-summary"` |
| `auth.js:44013` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-form"` |
| `auth.js:44014` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-status"` |
| `auth.js:44015` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-list"` |
| `auth.js:44016` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-summary"` |
| `auth.js:44017` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-list"` |
| `auth.js:44018` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-review-status"` |
| `auth.js:44019` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-status-filter"` |
| `auth.js:44032` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-link"` |
| `auth.js:44033` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-copy]"` |
| `auth.js:44034` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-open]"` |
| `auth.js:44035` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-status"` |
| `auth.js:44055` | `initAdminClassesPage` | `getElementById` | `"portal-class-summary"` |
| `auth.js:44056` | `initAdminClassesPage` | `getElementById` | `"portal-class-form"` |
| `auth.js:44057` | `initAdminClassesPage` | `getElementById` | `"portal-class-status"` |
| `auth.js:44058` | `initAdminClassesPage` | `getElementById` | `"portal-class-list"` |
| `auth.js:44083` | `initAdminCoursesPage` | `getElementById` | `"portal-course-summary"` |
| `auth.js:44084` | `initAdminCoursesPage` | `getElementById` | `"portal-course-form"` |
| `auth.js:44085` | `initAdminCoursesPage` | `getElementById` | `"portal-course-status"` |
| `auth.js:44086` | `initAdminCoursesPage` | `getElementById` | `"portal-course-list"` |
| `auth.js:44109` | `initAdminSchedulePage` | `getElementById` | `"portal-calendar-summary"` |
| `auth.js:44110` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-form"` |
| `auth.js:44111` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-status"` |
| `auth.js:44112` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-list"` |
| `auth.js:44114` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-summary"` |
| `auth.js:44115` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-form"` |
| `auth.js:44116` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-status"` |
| `auth.js:44117` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-list"` |
| `auth.js:44146` | `initAdminFeesPage` | `getElementById` | `"portal-fee-summary"` |
| `auth.js:44147` | `initAdminFeesPage` | `getElementById` | `"portal-fee-form"` |
| `auth.js:44148` | `initAdminFeesPage` | `getElementById` | `"portal-fee-status"` |
| `auth.js:44149` | `initAdminFeesPage` | `getElementById` | `"portal-fee-list"` |
| `auth.js:44150` | `initAdminFeesPage` | `getElementById` | `"portal-fee-setup-notice"` |
| `auth.js:44175` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-summary"` |
| `auth.js:44176` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-status"` |
| `auth.js:44177` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-review-list"` |
| `auth.js:44178` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-submission-list"` |
| `auth.js:44179` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-view]"` |
| `auth.js:44180` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date]"` |
| `auth.js:44181` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term]"` |
| `auth.js:44182` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-class]"` |
| `auth.js:44183` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-student]"` |
| `auth.js:44184` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status]"` |
| `auth.js:44185` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-search]"` |
| `auth.js:44186` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date-wrap]"` |
| `auth.js:44187` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term-wrap]"` |
| `auth.js:44188` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status-wrap]"` |
| `auth.js:44189` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-copy]"` |
| `auth.js:44190` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-submission-copy]"` |
| `auth.js:44296` | `wireAdminReportParentMessages` | `closest` | `"[data-admin-report-parent-reply-form]"` |
| `auth.js:44320` | `wireAdminReportParentMessages` | `querySelector` | `"button[type='submit']"` |
| `auth.js:44712` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment"` |
| `auth.js:44713` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-session"` |
| `auth.js:44714` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-class"` |
| `auth.js:44715` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-gender"` |
| `auth.js:44798` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance"` |
| `auth.js:44799` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-session"` |
| `auth.js:44800` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-class"` |
| `auth.js:44801` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-subject"` |
| `auth.js:44928` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:44929` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:44930` | `renderAdminAnnouncementSection` | `querySelector` | `"[data-announcement-class-wrap]"` |
| `auth.js:44931` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-class-options"` |
| `auth.js:44932` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-list"` |
| `auth.js:44939` | `renderAdminAnnouncementSection` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:45139` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-kpis"` |
| `auth.js:45140` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-insights"` |
| `auth.js:45141` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-health"` |
| `auth.js:45142` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-areas"` |
| `auth.js:45143` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-checklist"` |
| `auth.js:45411` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:45412` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:45449` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="roleTargets"]:checked'` |
| `auth.js:45454` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:45574` | `initAdminReportsPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:45599` | `initAdminReportsPage` | `getElementById` | `id` |
| `auth.js:45602` | `initAdminReportsPage` | `querySelectorAll` | `"[data-admin-report-export]"` |
| `auth.js:45634` | `initAdminMessagesPage` | `getElementById` | `"admin-report-parent-messages"` |
| `auth.js:45635` | `initAdminMessagesPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:45664` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-summary"` |
| `auth.js:45665` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-grid"` |
| `auth.js:45666` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-status"` |
| `auth.js:45683` | `initReportConfigurationControls` | `querySelector` | `"[data-grading-scale-add]"` |
| `auth.js:45684` | `initReportConfigurationControls` | `querySelector` | `"[data-report-configuration-reset]"` |
| `auth.js:45687` | `initReportConfigurationControls` | `querySelector` | `"[data-score-structure-total]"` |
| `auth.js:45688` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-score-preset]"` |
| `auth.js:45772` | `initReportConfigurationControls` | `querySelector` | `'input[name="minimum"]'` |
| `auth.js:45776` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-remove]"` |
| `auth.js:45778` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:45782` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-row]"` |
| `auth.js:45802` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:45803` | `initReportConfigurationControls` | `querySelector` | `'[name="minimum"]'` |
| `auth.js:45804` | `initReportConfigurationControls` | `querySelector` | `'[name="grade"]'` |
| `auth.js:45805` | `initReportConfigurationControls` | `querySelector` | `'[name="remark"]'` |
| `auth.js:45885` | `initReportSchoolCommentControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:46166` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-preview"` |
| `auth.js:46167` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-form"` |
| `auth.js:46168` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-status"` |
| `auth.js:46169` | `initAdminSettingsPage` | `getElementById` | `"portal-access-summary"` |
| `auth.js:46170` | `initAdminSettingsPage` | `getElementById` | `"portal-access-form"` |
| `auth.js:46171` | `initAdminSettingsPage` | `getElementById` | `"portal-access-status"` |
| `auth.js:46172` | `initAdminSettingsPage` | `getElementById` | `"portal-access-list"` |
| `auth.js:46173` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-summary"` |
| `auth.js:46174` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-grid"` |
| `auth.js:46175` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-status"` |
| `auth.js:46176` | `initAdminSettingsPage` | `querySelector` | `"[data-reset-role-permissions]"` |
| `auth.js:46177` | `initAdminSettingsPage` | `querySelector` | `"[data-save-role-permissions]"` |
| `auth.js:46178` | `initAdminSettingsPage` | `getElementById` | `"portal-academic-cycle-summary"` |
| `auth.js:46179` | `initAdminSettingsPage` | `getElementById` | `"portal-session-form"` |
| `auth.js:46180` | `initAdminSettingsPage` | `getElementById` | `"portal-session-status"` |
| `auth.js:46181` | `initAdminSettingsPage` | `getElementById` | `"portal-session-list"` |
| `auth.js:46182` | `initAdminSettingsPage` | `getElementById` | `"portal-term-form"` |
| `auth.js:46183` | `initAdminSettingsPage` | `getElementById` | `"portal-term-status"` |
| `auth.js:46184` | `initAdminSettingsPage` | `getElementById` | `"portal-term-list"` |
| `auth.js:46185` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-form"` |
| `auth.js:46186` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-status"` |
| `auth.js:46187` | `initAdminSettingsPage` | `getElementById` | `"portal-grading-scale-list"` |
| `auth.js:46188` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-form"` |
| `auth.js:46189` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-status"` |
| `auth.js:46190` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-summary"` |
| `auth.js:46191` | `initAdminSettingsPage` | `querySelector` | `"[data-delete-school-account]"` |
| `auth.js:46192` | `initAdminSettingsPage` | `getElementById` | `"portal-account-delete-status"` |
| `auth.js:46201` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46202` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46203` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46269` | `initUserSettingsPage` | `getElementById` | `"user-settings-form"` |
| `auth.js:46270` | `initUserSettingsPage` | `getElementById` | `"user-settings-status"` |
| `auth.js:46271` | `initUserSettingsPage` | `getElementById` | `"user-settings-name"` |
| `auth.js:46272` | `initUserSettingsPage` | `getElementById` | `"user-settings-role"` |
| `auth.js:46273` | `initUserSettingsPage` | `getElementById` | `"user-settings-email"` |
| `auth.js:46274` | `initUserSettingsPage` | `getElementById` | `"user-profile-form"` |
| `auth.js:46275` | `initUserSettingsPage` | `getElementById` | `"user-profile-status"` |
| `auth.js:46276` | `initUserSettingsPage` | `getElementById` | `"user-settings-photo-preview"` |
| `auth.js:46277` | `initUserSettingsPage` | `getElementById` | `"user-profile-photo"` |
| `auth.js:46278` | `initUserSettingsPage` | `querySelector` | `"[data-user-profile-remove-photo]"` |
| `auth.js:46279` | `initUserSettingsPage` | `getElementById` | `"user-settings-hint"` |
| `auth.js:46280` | `initUserSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46281` | `initUserSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46282` | `initUserSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46283` | `initUserSettingsPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:46284` | `initUserSettingsPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:46285` | `initUserSettingsPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:46286` | `initUserSettingsPage` | `getElementById` | `"portal-heading"` |
| `auth.js:46287` | `initUserSettingsPage` | `getElementById` | `"portal-copy"` |
| `auth.js:46288` | `initUserSettingsPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:46289` | `initUserSettingsPage` | `getElementById` | `"portal-gate"` |
| `auth.js:46290` | `initUserSettingsPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:46291` | `initUserSettingsPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:46292` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-form"` |
| `auth.js:46293` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-status"` |
| `auth.js:46318` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:46321` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:46391` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:46394` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:46402` | `initUserSettingsPage` | `matches` | `"[data-notification-preference]"` |
| `auth.js:46403` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:46409` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:46579` | `initUserSettingsPage` | `closest` | `".admin-surface-card"` |
| `auth.js:46581` | `initUserSettingsPage` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:46777` | `initStaffPortalPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46778` | `initStaffPortalPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46779` | `initStaffPortalPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46780` | `initStaffPortalPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:46781` | `initStaffPortalPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:46782` | `initStaffPortalPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:46783` | `initStaffPortalPages` | `getElementById` | `"portal-heading"` |
| `auth.js:46784` | `initStaffPortalPages` | `getElementById` | `"portal-copy"` |
| `auth.js:46785` | `initStaffPortalPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:46786` | `initStaffPortalPages` | `getElementById` | `"portal-gate"` |
| `auth.js:46787` | `initStaffPortalPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:46788` | `initStaffPortalPages` | `getElementById` | `"admin-global-search"` |
| `auth.js:46789` | `initStaffPortalPages` | `getElementById` | `"staff-page-content"` |
| `auth.js:46882` | `initPortalPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46883` | `initPortalPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46884` | `initPortalPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46885` | `initPortalPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:46886` | `initPortalPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:46887` | `initPortalPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:46888` | `initPortalPage` | `getElementById` | `"portal-heading"` |
| `auth.js:46889` | `initPortalPage` | `getElementById` | `"portal-copy"` |
| `auth.js:46890` | `initPortalPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:46891` | `initPortalPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:46892` | `initPortalPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:46893` | `initPortalPage` | `getElementById` | `"portal-metrics"` |
| `auth.js:46894` | `initPortalPage` | `getElementById` | `"admin-events"` |
| `auth.js:46895` | `initPortalPage` | `getElementById` | `"admin-activity"` |
| `auth.js:46896` | `initPortalPage` | `getElementById` | `"portal-links"` |
| `auth.js:46897` | `initPortalPage` | `getElementById` | `"portal-details"` |
| `auth.js:46898` | `initPortalPage` | `getElementById` | `"staff-portal-workspace"` |
| `auth.js:46899` | `initPortalPage` | `getElementById` | `"student-portal-workspace"` |
| `auth.js:46900` | `initPortalPage` | `getElementById` | `"teacher-attendance-workspace"` |
| `auth.js:46901` | `initPortalPage` | `getElementById` | `"portal-gate"` |
| `auth.js:47137` | `initPortalPage` | `closest` | `".admin-primary-grid"` |
| `auth.js:47137` | `initPortalPage` | `closest` | `".admin-surface-card"` |
| `auth.js:47151` | `initPortalPage` | `querySelector` | `".admin-sidebar-nav"` |
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
| `auth.js:29134` | `initResetPasswordFlow` | `new URLSearchParams(window.location.search)` |
| `auth.js:29135` | `initResetPasswordFlow` | `params.get("token")` |
| `auth.js:29136` | `initResetPasswordFlow` | `params.get("code")` |
| `auth.js:29148` | `initResetPasswordFlow` | `params.get("type")` |
| `auth.js:29573` | `initConfirmPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:29574` | `initConfirmPage` | `params.get("token")` |
| `auth.js:29644` | `initAdmissionsApplyPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:29645` | `initAdmissionsApplyPage` | `params.get("workspace")` |
| `auth.js:29646` | `initAdmissionsApplyPage` | `params.get("institution")` |
| `auth.js:42954` | `initAdmissionsControls` | `new URL("./admissions-apply.html", window.location.href)` |
| `auth.js:42955` | `initAdmissionsControls` | `linkUrl.searchParams.set("workspace", workspaceId)` |
| `auth.js:42957` | `initAdmissionsControls` | `linkUrl.searchParams.set("institution", institutionId)` |
| `auth.js:43524` | `buildSelfRegistrationUrl` | `new URL("./self-register.html", window.location.href)` |
| `auth.js:43525` | `buildSelfRegistrationUrl` | `url.searchParams.set("type", registrationType)` |
| `auth.js:43526` | `buildSelfRegistrationUrl` | `url.searchParams.set("workspace", getCurrentWorkspaceId())` |
| `auth.js:43793` | `initSelfRegisterPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:43794` | `initSelfRegisterPage` | `params.get("type")` |
| `auth.js:43795` | `initSelfRegisterPage` | `params.get("workspace")` |
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
| `institutions` | `ensureSupabaseInstitutionId` @`auth.js:3793`, `syncInstitutionSnapshot` @`auth.js:3846`, `hydrateSchoolSettingsFromSupabase` @`auth.js:3927`, `initAdmissionsApplyPage` @`auth.js:29726` |
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

`auth.js:39334`

```js
function getParentSelectionStorageKey(user = null) {
    const session = getSession();
    const workspaceId = normalizeWorkspaceId(user?.workspaceId || session?.workspaceId || getCurrentWorkspaceId());
    const userId = String(user?.id || session?.userId || "parent").trim() || "parent";
    return `${PARENT_SELECTION_STORAGE_PREFIX}:${workspaceId}:${userId}`;
  }
```

### getParentFeesStorageKey

`auth.js:39357`

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

Load the factory once immediately before auth.js on all 49 auth consumers. Evaluation only publishes the factory; construction only establishes private bindings. The original state location is replaced by a single construction/destructuring statement. No awaiting, ready handler, auto-open, eager element creation or extra async forwarding wrapper is added. The original DOMContentLoaded registration and later bootstrap sequence are unchanged. All 20 external calls occur after the original declaration location and still resolve to private auth names.

Preserve IDs/classes/ARIA and template bytes: app-action-dialog plus its form, kicker/title/message/details, prompt/input-label/input/error and cancel/confirm children; [data-app-action-cancel]; body class app-action-dialog-open; danger/success/primary variants. Text still uses textContent, and styles.css is unchanged. Do not add a focus trap, new validation, revised labels, timer cancellation or other unrelated accessibility/behavior changes during this move.

openAppActionDialog returns a Promise of { confirmed, value }; missing body resolves { confirmed: false, value: null }. showAppConfirm is the original async function returning a boolean; showAppPrompt returns a trimmed string (including empty string when optional) or null on cancellation. Required-empty prompt submission sets the same message/refocuses without resolving. Cancel button/backdrop/Escape resolve cancellation; other clicks/keys do not. Opening a new dialog cancels the previous pending Promise before installing its new state. Prior HTMLElement focus restoration and the existing zero-delay focus/select timer order are retained, including rapid-overlap behavior.

Three DOM handlers are installed only during initial element creation: delegated click, form submit and dialog keydown. Reopening reuses the element/listeners while reading the current private state; closing clears that state before resolving. auth.js account-deletion/provisioning/permission/business operations remain outside this controller. Tests use synthetic DOM only and never confirm a live destructive action.

E07 browser acceptance is user-reported; E08 actual browser keyboard/focus/layout and authentication startup are NOT TESTED. Source/Promise/DOM-fixture parity is not a substitute for those checks. No storage key, data format, database, Supabase or route changes.
