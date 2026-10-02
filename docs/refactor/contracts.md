# Contracts to preserve during JavaScript extraction

Original contracts snapshot: 2026-10-02, e1eb094. Updated for E01 from pre-extraction 39ec400: renderWhyGrid is defined in js/website/why-grid.js and loaded before app.js. Configuration, schema and deployment remain unchanged. The HTML script manifest below is current; other HTML/inline locations retain baseline anchors and shift by one after the inserted script tag. See checklist.md for remaining untested workflows.

## Loading and startup

All external HTML scripts inspected are classic scripts, without async/defer/type=module attributes. 57 of 58 HTML documents load app.js; the Google verification document has no script. The full ordered manifest below includes cache-busting query strings, which must remain valid. Most portal/auth pages load app.js, then supabase-config.js, then auth.js. Students and teachers administration additionally load self-registration-links.js after auth.js. After E01 every app.js tag is immediately preceded by one synchronous classic js/website/why-grid.js tag. There are now 214 external tags (157 original plus 57 new).

### app.js

1. Immediate theme IIFE reads schoolsphere.theme.v1, updates the root and body, and registers a one-time DOMContentLoaded callback when loading.
2. Top-level lexical declarations and functions establish shared models and helpers. clearLegacySharedState() executes at line 505 and removes legacy unscoped keys. Do not accidentally re-run this cleanup per feature.
3. window.SchoolSphere* manager objects are assigned at lines 4197–4417. Their object identity and public members are compatibility boundaries.
4. A storage listener at line 4419 re-emits feature events for scoped keys.
5. Immediate calls at lines 4851–4855 render header/footer, bind outside-click behavior, render page content, and apply branding. Subsequent listeners handle school settings, hash navigation and feature toggles.

### auth.js

The entire file is an IIFE: its constants, functions and state are private. At line 603 it applies the theme. The DOMContentLoaded callback at 605 does the following in source order:

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

Each row lists current source tags after E01, in their original order plus the preceding why-grid.js tag, including current inline script locations. Paths remain document-relative.

| HTML file | data-page | Ordered scripts |
| --- | --- | --- |
| `admin-admissions.html` | `admin-admissions` | `./js/website/why-grid.js` @359 → `./app.js` @360 → `./supabase-config.js` @361 → `./auth.js?v=upload-remove-x` @362 |
| `admin-attendance.html` | `admin-attendance` | `./js/website/why-grid.js` @208 → `./app.js` @209 → `./supabase-config.js` @210 → `./auth.js` @211 |
| `admin-classes.html` | `admin-classes` | `./js/website/why-grid.js` @289 → `./app.js` @290 → `./supabase-config.js` @291 → `./auth.js` @292 |
| `admin-courses.html` | `admin-courses` | `./js/website/why-grid.js` @283 → `./app.js` @284 → `./supabase-config.js` @285 → `./auth.js` @286 |
| `admin-feature-modules.html` | `admin-feature-modules` | `./js/website/why-grid.js` @166 → `./app.js` @167 → `./supabase-config.js` @168 → `./auth.js` @169 |
| `admin-fees.html` | `admin-fees` | `./js/website/why-grid.js` @316 → `./app.js` @317 → `./supabase-config.js` @318 → `./auth.js` @319 |
| `admin-messages.html` | `admin-messages` | `./js/website/why-grid.js` @590 → `./app.js` @591 → `./supabase-config.js` @592 → `./auth.js` @593 → `inline` @594 |
| `admin-reports.html` | `admin-reports` | `./js/website/why-grid.js` @236 → `./app.js` @237 → `./supabase-config.js` @238 → `./auth.js` @239 |
| `admin-schedule.html` | `admin-schedule` | `./js/website/why-grid.js` @349 → `./app.js` @350 → `./supabase-config.js` @351 → `./auth.js` @352 |
| `admin-settings-academic.html` | `admin-settings-academic` | `./js/website/why-grid.js` @258 → `./app.js` @259 → `./supabase-config.js` @260 → `./auth.js` @261 |
| `admin-settings-access.html` | `admin-settings-access` | `./js/website/why-grid.js` @211 → `./app.js` @212 → `./supabase-config.js` @213 → `./auth.js` @214 |
| `admin-settings-grading.html` | `admin-settings-grading` | `./js/website/why-grid.js` @280 → `./app.js` @281 → `./supabase-config.js` @282 → `./auth.js` @283 |
| `admin-settings-roles.html` | `admin-settings-roles` | `./js/website/why-grid.js` @174 → `./app.js?v=20260611-student-messages` @175 → `./supabase-config.js` @176 → `./auth.js?v=20260611-student-messages` @177 |
| `admin-settings-school.html` | `admin-settings-school` | `./js/website/why-grid.js` @341 → `./app.js` @342 → `./supabase-config.js` @343 → `./auth.js` @344 |
| `admin-settings.html` | `admin-settings` | `inline` @10 → `./js/website/why-grid.js` @182 → `./app.js` @183 → `./supabase-config.js` @184 → `./auth.js` @185 |
| `admin-students.html` | `admin-students` | `./js/website/why-grid.js` @382 → `./app.js` @383 → `./supabase-config.js` @384 → `./auth.js?v=self-registration-links` @385 → `./self-registration-links.js?v=copy-open-fix` @386 |
| `admin-teachers.html` | `admin-teachers` | `./js/website/why-grid.js` @300 → `./app.js` @301 → `./supabase-config.js` @302 → `./auth.js?v=self-registration-links` @303 → `./self-registration-links.js?v=copy-open-fix` @304 |
| `admissions-apply.html` | `admissions-apply` | `./js/website/why-grid.js` @294 → `./app.js` @295 → `./supabase-config.js` @296 → `./auth.js?v=upload-remove-x` @297 |
| `confirm-email.html` | `confirm-email` | `./js/website/why-grid.js` @36 → `./app.js` @37 → `./supabase-config.js` @38 → `./auth.js` @39 |
| `contact.html` | `contact` | `./js/website/why-grid.js` @905 → `./app.js` @906 → `inline` @907 |
| `forgot-password.html` | `forgot-password` | `./js/website/why-grid.js` @101 → `./app.js` @102 → `./supabase-config.js` @103 → `./auth.js` @104 |
| `google20c973feb5773234.html` | `none` | None |
| `in-practice.html` | `practice` | `./js/website/why-grid.js` @34 → `./app.js` @35 |
| `index.html` | `home` | `./js/website/why-grid.js` @190 → `./app.js?v=index-ui-20260603` @191 |
| `login.html` | `login` | `./js/website/why-grid.js` @214 → `./app.js` @215 → `./supabase-config.js` @216 → `./auth.js` @217 |
| `modules.html` | `modules` | `./js/website/why-grid.js` @33 → `./app.js` @34 |
| `owner-access.html` | `owner-access` | `./js/website/why-grid.js` @121 → `./app.js?v=20260611-student-messages` @122 → `./supabase-config.js` @123 → `./auth.js?v=20260611-student-messages` @124 |
| `parent-attendance.html` | `parent-attendance` | `./js/website/why-grid.js` @52 → `./app.js` @53 → `./supabase-config.js` @54 → `./auth.js` @55 |
| `parent-courses.html` | `parent-courses` | `./js/website/why-grid.js` @52 → `./app.js` @53 → `./supabase-config.js` @54 → `./auth.js` @55 |
| `parent-fees.html` | `parent-fees` | `./js/website/why-grid.js` @52 → `./app.js` @53 → `./supabase-config.js` @54 → `./auth.js` @55 |
| `parent-messages.html` | `parent-messages` | `./js/website/why-grid.js` @54 → `./app.js` @55 → `./supabase-config.js` @56 → `./auth.js` @57 |
| `parent-portal.html` | `parent-portal` | `./js/website/why-grid.js` @54 → `./app.js` @55 → `./supabase-config.js` @56 → `./auth.js` @57 |
| `parent-reports.html` | `parent-reports` | `./js/website/why-grid.js` @52 → `./app.js` @53 → `./supabase-config.js` @54 → `./auth.js` @55 |
| `parent-settings.html` | `parent-settings` | `./js/website/why-grid.js` @198 → `./app.js` @199 → `./supabase-config.js` @200 → `./auth.js` @201 |
| `parent-teachers.html` | `parent-teachers` | `./js/website/why-grid.js` @52 → `./app.js` @53 → `./supabase-config.js` @54 → `./auth.js` @55 |
| `portal.html` | `portal` | `./js/website/why-grid.js` @185 → `./app.js?v=20260611-student-messages` @186 → `./supabase-config.js` @187 → `./auth.js?v=20260611-student-messages` @188 |
| `products.html` | `products` | `./js/website/why-grid.js` @84 → `./app.js` @85 |
| `reset-password.html` | `reset-password` | `./js/website/why-grid.js` @118 → `./app.js` @119 → `./supabase-config.js` @120 → `./auth.js` @121 |
| `school-types.html` | `types` | `./js/website/why-grid.js` @34 → `./app.js` @35 |
| `self-register.html` | `self-register` | `./js/website/why-grid.js` @234 → `./app.js` @235 → `./supabase-config.js` @236 → `./auth.js?v=self-registration-links` @237 |
| `signup.html` | `signup` | `./js/website/why-grid.js` @218 → `./app.js` @219 → `./supabase-config.js` @220 → `./auth.js` @221 |
| `staff-attendance.html` | `staff-attendance` | `./js/website/why-grid.js` @45 → `./app.js` @46 → `./supabase-config.js` @47 → `./auth.js` @48 |
| `staff-classes.html` | `staff-classes` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-dashboard.html` | `staff-dashboard` | `./js/website/why-grid.js` @82 → `./app.js` @83 → `./supabase-config.js` @84 → `./auth.js` @85 |
| `staff-gradebook.html` | `staff-gradebook` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-leave.html` | `staff-leave` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-lesson-plans.html` | `staff-lesson-plans` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-messages.html` | `staff-messages` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-results.html` | `staff-results` | `./js/website/why-grid.js` @25 → `./app.js` @26 → `./supabase-config.js` @26 → `./auth.js` @26 |
| `staff-settings.html` | `staff-settings` | `./js/website/why-grid.js` @143 → `./app.js` @144 → `./supabase-config.js` @145 → `./auth.js` @146 |
| `staff-timetable.html` | `staff-timetable` | `./js/website/why-grid.js` @53 → `./app.js` @54 → `./supabase-config.js` @55 → `./auth.js` @56 |
| `super-admin-accounts.html` | `super-admin-accounts` | `./js/website/why-grid.js` @128 → `./app.js?v=20260611-student-messages` @129 → `./supabase-config.js` @130 → `./auth.js?v=20260611-student-messages` @131 |
| `super-admin-activity.html` | `super-admin-activity` | `./js/website/why-grid.js` @102 → `./app.js?v=20260611-student-messages` @103 → `./supabase-config.js` @104 → `./auth.js?v=20260611-student-messages` @105 |
| `super-admin-schools.html` | `super-admin-schools` | `./js/website/why-grid.js` @102 → `./app.js?v=20260611-student-messages` @103 → `./supabase-config.js` @104 → `./auth.js?v=20260611-student-messages` @105 |
| `super-admin.html` | `super-admin` | `./js/website/why-grid.js` @105 → `./app.js?v=20260611-student-messages` @106 → `./supabase-config.js` @107 → `./auth.js?v=20260611-student-messages` @108 |
| `user-settings.html` | `user-settings` | `./js/website/why-grid.js` @143 → `./app.js` @144 → `./supabase-config.js` @145 → `./auth.js` @146 |
| `why-it-works.html` | `why` | `./js/website/why-grid.js` @41 → `./app.js` @42 |
| `workflows.html` | `workflows` | `./js/website/why-grid.js` @33 → `./app.js` @34 |

## Public global interfaces

Classic top-level function declarations in app.js are also potential window properties; top-level const/let bindings are global lexical bindings, not equivalent window properties. Explicit objects below are consumed by auth manager wrappers. Preserve method names, argument defaults, return shapes, eventName values and synchronous vs asynchronous behavior. Unknown members shown as AST types need their source body retained unchanged.

### window.SchoolSphereFeatureModules

`app.js:4197`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `modules` | `features` |
| `getState` | `getFeatureToggleState` |
| `getEnabledFeatures` | `getEnabledFeatures` |
| `setFeatureEnabled` | `setFeatureEnabled` |
| `summarize` | `summarizeFeatureToggleState` |
| `eventName` | `FEATURE_TOGGLE_EVENT` |

### window.SchoolSphereRolePermissions

`app.js:4206`

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

`app.js:4220`

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

`app.js:4232`

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

`app.js:4244`

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

`app.js:4258`

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

`app.js:4272`

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

`app.js:4299`

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

`app.js:4310`

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

`app.js:4322`

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

`app.js:4335`

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

`app.js:4346`

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

`app.js:4357`

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

`app.js:4372`

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

`app.js:4382`

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

`app.js:4393`

| Public member | Implementation binding / expression kind |
| --- | --- |
| `defaults` | `DEFAULT_REPORT_CONFIGURATION` |
| `getConfiguration` | `getReportConfiguration` |
| `saveConfiguration` | `saveReportConfiguration` |
| `gradeScore` | `getReportCardGrade` |
| `eventName` | `SCHOOL_REPORT_CONFIGURATION_EVENT` |

### window.SchoolSphereGradebook

`app.js:4401`

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

`app.js:4411`

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

## Storage and school isolation

- app.js:414–476 normalizes workspace identifiers (trim/lowercase, unsupported characters become hyphens), gives transient session precedence over persistent session, prefers session.workspaceId, and otherwise falls back to userId/email (including its explicit administrator fallback). resolveWorkspaceStorageKey builds baseKey::workspaceId. readWorkspaceState does not read legacy shared values unless allowLegacyFallback is true.
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
| `schoolsphere.academicCalendar.v1` | `app.js:250`, `auth.js:535`, `auth.js:567` |
| `schoolsphere.academicCycles.v1` | `app.js:247`, `auth.js:534`, `auth.js:565` |
| `schoolsphere.access.grants.v1` | `auth.js:17` |
| `schoolsphere.access.guard.notice.v1` | `auth.js:18` |
| `schoolsphere.accessGrants.v1` | `auth.js:575`, `auth.js:3646` |
| `schoolsphere.admin.sidebar.collapsed.v1` | `auth.js:11` |
| `schoolsphere.admissionConfig.v1` | `app.js:262`, `auth.js:536`, `auth.js:566` |
| `schoolsphere.admissions.v1` | `auth.js:72`, `auth.js:572`, `auth.js:3614` |
| `schoolsphere.announcement-toast.v1` | `auth.js:23` |
| `schoolsphere.attendance.v1` | `app.js:283`, `auth.js:545`, `auth.js:560` |
| `schoolsphere.auditTrail.v1` | `app.js:326`, `auth.js:551` |
| `schoolsphere.auth.password-recovery.v1` | `auth.js:16` |
| `schoolsphere.auth.pending.role.v1` | `auth.js:15` |
| `schoolsphere.auth.persistence.local.v1` | `auth.js:13` |
| `schoolsphere.auth.persistence.session.v1` | `auth.js:14` |
| `schoolsphere.classes.v1` | `app.js:274`, `auth.js:542`, `auth.js:557` |
| `schoolsphere.courses.v1` | `app.js:277`, `auth.js:543`, `auth.js:558` |
| `schoolsphere.featureModules.v1` | `app.js:221`, `auth.js:549`, `auth.js:553` |
| `schoolsphere.feeItems.v1` | `app.js:271`, `auth.js:541`, `auth.js:564` |
| `schoolsphere.form-draft.v1` | `auth.js:24` |
| `schoolsphere.gradebook.v1` | `app.js:291`, `auth.js:548`, `auth.js:563` |
| `schoolsphere.leaveRequests.v1` | `app.js:297` |
| `schoolsphere.lessonPlans.v1` | `app.js:294` |
| `schoolsphere.mail.v1` | `auth.js:4` |
| `schoolsphere.notification-preferences.v1` | `auth.js:22` |
| `schoolsphere.notifications.v1` | `auth.js:20`, `auth.js:573`, `auth.js:3601`, `admin-messages.html:inline@593:27` |
| `schoolsphere.parent.fees.v1` | `auth.js:32` |
| `schoolsphere.parent.selected-child.v1` | `auth.js:31` |
| `schoolsphere.parentFees.v1` | `auth.js:574`, `auth.js:3627` |
| `schoolsphere.passwordRecovery.v1` | `auth.js:5` |
| `schoolsphere.portalOnboarding.v1` | `auth.js:576` |
| `schoolsphere.reportCards.v1` | `app.js:286`, `auth.js:546`, `auth.js:561` |
| `schoolsphere.reportConfiguration.v1` | `app.js:288`, `auth.js:547`, `auth.js:562` |
| `schoolsphere.rolePermissions.studentMessagesDefault.v1` | `app.js:332` |
| `schoolsphere.rolePermissions.v1` | `app.js:329`, `auth.js:550`, `auth.js:554` |
| `schoolsphere.schoolSettings.v1` | `app.js:241`, `auth.js:533`, `auth.js:556` |
| `schoolsphere.session.persistent.v1` | `app.js:410`, `auth.js:6`, `self-registration-links.js:4` |
| `schoolsphere.session.transient.v1` | `app.js:411`, `auth.js:7`, `self-registration-links.js:3` |
| `schoolsphere.students.v1` | `app.js:280`, `auth.js:26`, `auth.js:544`, `auth.js:559` |
| `schoolsphere.supabase.auth.v1` | `auth.js:10` |
| `schoolsphere.theme.v1` | `app.js:4`, `auth.js:12` |
| `schoolsphere.timetable.periods.v1` | `app.js:267`, `auth.js:538`, `auth.js:569` |
| `schoolsphere.timetable.rooms.v1` | `app.js:268`, `auth.js:539`, `auth.js:570` |
| `schoolsphere.timetable.substitutions.v1` | `app.js:269`, `auth.js:540`, `auth.js:571` |
| `schoolsphere.timetable.v1` | `app.js:265`, `auth.js:537`, `auth.js:568` |
| `schoolsphere.users.v1` | `auth.js:3` |
| `schoolsphere:academic-calendar-updated` | `app.js:251` |
| `schoolsphere:academic-cycles-updated` | `app.js:248` |
| `schoolsphere:access-grants:updated` | `auth.js:19` |
| `schoolsphere:admission-config-updated` | `app.js:263` |
| `schoolsphere:admissions:updated` | `auth.js:73` |
| `schoolsphere:attendance-updated` | `app.js:284` |
| `schoolsphere:audit-trail-updated` | `app.js:327` |
| `schoolsphere:classes-updated` | `app.js:275` |
| `schoolsphere:courses-updated` | `app.js:278` |
| `schoolsphere:feature-modules-updated` | `app.js:222` |
| `schoolsphere:fee-items-updated` | `app.js:272` |
| `schoolsphere:gradebook-updated` | `app.js:292` |
| `schoolsphere:leave-requests-updated` | `app.js:298` |
| `schoolsphere:lesson-plans-updated` | `app.js:295` |
| `schoolsphere:notifications:updated` | `auth.js:21`, `admin-messages.html:inline@593:416`, `admin-messages.html:inline@593:530` |
| `schoolsphere:parent-fees:updated` | `auth.js:33` |
| `schoolsphere:report-cards-updated` | `app.js:287` |
| `schoolsphere:report-configuration-updated` | `app.js:289` |
| `schoolsphere:role-permissions-updated` | `app.js:330` |
| `schoolsphere:school-settings-updated` | `app.js:242` |
| `schoolsphere:students-updated` | `app.js:281` |
| `schoolsphere:timetable-updated` | `app.js:266` |

### Key and workspace resolution owners

| Owner | Location | Outer dependencies |
| --- | --- | --- |
| `normalizeWorkspaceStorageId` | `app.js:414-422` |  |
| `getWorkspaceSessionSnapshot` | `app.js:424-429` | `AUTH_SESSION_STORAGE_KEYS`, `parseStoredJSON` |
| `getActiveWorkspaceStorageId` | `app.js:431-449` | `getWorkspaceSessionSnapshot`, `normalizeWorkspaceStorageId` |
| `resolveWorkspaceStorageKey` | `app.js:451-453` | `getActiveWorkspaceStorageId` |
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
| `getPortalOnboardingStorageKey` | `auth.js:33287-33293` | `DEFAULT_AUTH_ROLE`, `PORTAL_ONBOARDING_STORAGE_KEY`, `getCurrentWorkspaceId`, `getPortalOnboardingRoleKey`, `normalizeWorkspaceId` |
| `getParentSelectionStorageKey` | `auth.js:39519-39524` | `PARENT_SELECTION_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `getSession`, `normalizeWorkspaceId` |
| `getParentFeesStorageKey` | `auth.js:39542-39544` | `PARENT_FEES_STORAGE_PREFIX`, `getCurrentWorkspaceId`, `normalizeWorkspaceId` |
| `getSuperAdminKnownWorkspaceIds` | `auth.js:41913-41941` | `ADMISSIONS_STORAGE_KEY_BASE`, `NOTIFICATION_STORAGE_PREFIX`, `WORKSPACE_SCOPED_STATE_KEYS`, `getUsers`, `normalizeWorkspaceId` |
| `normalizeWorkspaceId` | `self-registration-links.js:15-22` |  |
| `getSessionSnapshot` | `self-registration-links.js:24-30` | `SESSION_KEYS`, `parseJson` |
| `getWorkspaceId` | `self-registration-links.js:32-35` | `getSessionSnapshot`, `normalizeWorkspaceId` |

## Custom events and payloads

Local data mutations generally write storage then emit an event. Native storage events are for other documents; custom events notify the current page. Hydration uses the same event name with a different detail shape: {workspaceId, source: "supabase-hydration"}, not the local collection payload. Preserve both variants and consumers that re-read managers.

| Dispatch location | Owner | Event expression | detail shape/expression |
| --- | --- | --- | --- |
| `app.js:832` | `emitSchoolSettingsUpdate` | `SCHOOL_SETTINGS_EVENT` | `{ settings }` |
| `app.js:919` | `emitAcademicCyclesUpdate` | `SCHOOL_ACADEMIC_CYCLES_EVENT` | `{ state }` |
| `app.js:1200` | `emitAcademicCalendarUpdate` | `SCHOOL_ACADEMIC_CALENDAR_EVENT` | `{ events }` |
| `app.js:1408` | `emitAdmissionConfigurationUpdate` | `SCHOOL_ADMISSION_CONFIG_EVENT` | `{ state }` |
| `app.js:1842` | `emitSchoolTimetableUpdate` | `SCHOOL_TIMETABLE_EVENT` | `{ entries }` |
| `app.js:2267` | `emitSchoolFeeItemsUpdate` | `SCHOOL_FEE_ITEMS_EVENT` | `{ items }` |
| `app.js:2404` | `emitSchoolClassesUpdate` | `SCHOOL_CLASSES_EVENT` | `{ classes }` |
| `app.js:2595` | `emitSchoolCoursesUpdate` | `SCHOOL_COURSES_EVENT` | `{ courses }` |
| `app.js:2821` | `emitLessonPlansUpdate` | `SCHOOL_LESSON_PLANS_EVENT` | `{ records }` |
| `app.js:2993` | `emitLeaveRequestsUpdate` | `SCHOOL_LEAVE_REQUESTS_EVENT` | `{ records }` |
| `app.js:3218` | `emitSchoolStudentsUpdate` | `SCHOOL_STUDENTS_EVENT` | `{ students }` |
| `app.js:3500` | `emitAttendanceUpdate` | `SCHOOL_ATTENDANCE_EVENT` | `{ records }` |
| `app.js:3725` | `saveGradebookRecords` | `SCHOOL_GRADEBOOK_EVENT` | `{ records: normalized }` |
| `app.js:3791` | `saveReportConfiguration` | `SCHOOL_REPORT_CONFIGURATION_EVENT` | `{ configuration: normalized }` |
| `app.js:3895` | `emitReportCardsUpdate` | `SCHOOL_REPORT_CARDS_EVENT` | `{ records }` |
| `app.js:4004` | `emitAuditTrailUpdate` | `AUDIT_TRAIL_EVENT` | `{ entries }` |
| `app.js:4051` | `emitFeatureToggleUpdate` | `FEATURE_TOGGLE_EVENT` | `{ state }` |
| `app.js:4144` | `emitRolePermissionsUpdate` | `ROLE_PERMISSIONS_EVENT` | `{ rolePermissions }` |
| `app.js:4470` | `startup/inline` | `SCHOOL_REPORT_CONFIGURATION_EVENT` | `{ configuration: getReportConfiguration() }` |
| `app.js:4478` | `startup/inline` | `SCHOOL_GRADEBOOK_EVENT` | `{ records: getGradebookRecords() }` |
| `auth.js:1246` | `saveUsers` | `STORAGE_KEYS.users` | `{ users: normalizedUsers }` |
| `auth.js:2143` | `pushNotification` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:2264` | `updateNotificationsForViewer` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:2801` | `markNotificationsRead` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId, }` |
| `auth.js:3115` | `saveAdmissions` | `ADMISSIONS_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId }` |
| `auth.js:3291` | `saveAccessGrants` | `ACCESS_GRANTS_EVENT_NAME` | `{ workspaceId: targetWorkspaceId &#124;&#124; normalizeWorkspaceId(getCurrentWorkspaceId()), allWorkspaces: Boolean(options.allWorkspaces), }` |
| `auth.js:3308` | `saveAccessGrants` | `ACCESS_GRANTS_EVENT_NAME` | `{ workspaceId: targetWorkspaceId, allWorkspaces: false, }` |
| `auth.js:5024` | `emitHydratedWorkspaceStateEvent` | `eventName` | `{ workspaceId: normalizedWorkspaceId, source: "supabase-hydration", }` |
| `auth.js:24968` | `syncAttendanceAbsenceNotifications` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizedWorkspaceId }` |
| `auth.js:39557` | `saveParentFeesState` | `PARENT_FEES_EVENT_NAME` | `{ workspaceId: resolvedWorkspaceId, }` |
| `auth.js:46622` | `initUserSettingsPage` | `NOTIFICATION_EVENT_NAME` | `{ workspaceId: normalizeWorkspaceId(activeUser.workspaceId &#124;&#124; session.workspaceId &#124;&#124; getCurrentWorkspaceId()), }` |
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
| `app.js:824` | `applySchoolSettingsBranding` | `querySelectorAll` | `"[data-school-context]"` |
| `app.js:4518` | `renderHeader` | `getElementById` | `"site-header"` |
| `app.js:4574` | `renderFooter` | `getElementById` | `"site-footer"` |
| `app.js:4620` | `closeMenusOnOutsideClick` | `querySelectorAll` | `".nav-menu[open]"` |
| `js/website/why-grid.js:2` | `renderWhyGrid` | `getElementById` | `targetId` |
| `app.js:4629` | `renderOfferingPreviewGrid` | `getElementById` | `targetId` |
| `app.js:4649` | `renderStandoutList` | `getElementById` | `targetId` |
| `app.js:4659` | `renderFeatureGrid` | `getElementById` | `targetId` |
| `app.js:4692` | `renderSchoolGrid` | `getElementById` | `targetId` |
| `app.js:4715` | `renderPracticeGrid` | `getElementById` | `targetId` |
| `app.js:4739` | `renderOfferingTabs` | `getElementById` | `"home-offering-tabs"` |
| `app.js:4740` | `renderOfferingTabs` | `getElementById` | `"home-offering-panel"` |
| `app.js:4785` | `renderOfferingTabs` | `querySelectorAll` | `"[data-offering]"` |
| `app.js:4794` | `renderWorkflowPage` | `getElementById` | `"workflow-page-grid"` |
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
| `auth.js:6325` | `closeAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `auth.js:6340` | `ensureAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `auth.js:6372` | `ensureAppActionDialog` | `getElementById` | `"app-action-dialog"` |
| `auth.js:6375` | `ensureAppActionDialog` | `closest` | `"[data-app-action-cancel]"` |
| `auth.js:6380` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-form"` |
| `auth.js:6382` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-input"` |
| `auth.js:6383` | `ensureAppActionDialog` | `querySelector` | `"#app-action-dialog-error"` |
| `auth.js:6439` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-kicker"` |
| `auth.js:6440` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-title"` |
| `auth.js:6441` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-message"` |
| `auth.js:6442` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-details"` |
| `auth.js:6443` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-prompt"` |
| `auth.js:6444` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-input-label"` |
| `auth.js:6445` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-input"` |
| `auth.js:6446` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-error"` |
| `auth.js:6447` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-cancel"` |
| `auth.js:6448` | `openAppActionDialog` | `querySelector` | `"#app-action-dialog-confirm"` |
| `auth.js:7470` | `initAdminSidebarUi` | `querySelector` | `".admin-dashboard-shell"` |
| `auth.js:7471` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar"` |
| `auth.js:7477` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar-nav"` |
| `auth.js:7509` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-courses.html"]'` |
| `auth.js:7510` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-classes.html"]'` |
| `auth.js:7534` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7563` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-students.html"]'` |
| `auth.js:7576` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7591` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-schedule.html"]'` |
| `auth.js:7613` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7628` | `initAdminSidebarUi` | `querySelector` | `'a[href="./admin-reports.html"]'` |
| `auth.js:7651` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7656` | `initAdminSidebarUi` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:7683` | `initAdminSidebarUi` | `querySelector` | `"[data-sidebar-toggle]"` |
| `auth.js:7702` | `initAdminSidebarUi` | `querySelector` | `".admin-sidebar-toggle-icon"` |
| `auth.js:7832` | `updateStaffPortalSidebarActive` | `querySelectorAll` | `"[data-staff-nav-key]"` |
| `auth.js:7881` | `updateStudentPortalSidebarActive` | `querySelectorAll` | `"[data-student-nav-key]"` |
| `auth.js:7943` | `applyRolePermissionSidebarVisibility` | `querySelectorAll` | `".admin-sidebar-link"` |
| `auth.js:8652` | `getStaffFieldWrapper` | `querySelector` | `dataSelector` |
| `auth.js:9325` | `wireSignOutButton` | `querySelector` | `"[data-signout]"` |
| `auth.js:9369` | `initClassManagementControls` | `querySelector` | `"[data-class-form-toggle]"` |
| `auth.js:9373` | `initClassManagementControls` | `querySelector` | `"[data-teacher-assignment-list]"` |
| `auth.js:9374` | `initClassManagementControls` | `querySelector` | `"[data-assignment-add]"` |
| `auth.js:9375` | `initClassManagementControls` | `querySelector` | `"[data-class-assignment-raw]"` |
| `auth.js:9376` | `initClassManagementControls` | `querySelector` | `"[data-class-template-type]"` |
| `auth.js:9377` | `initClassManagementControls` | `querySelector` | `"[data-class-template-arm]"` |
| `auth.js:9378` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-arm]"` |
| `auth.js:9379` | `initClassManagementControls` | `querySelector` | `"[data-class-template-stream]"` |
| `auth.js:9380` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-stream]"` |
| `auth.js:9381` | `initClassManagementControls` | `querySelector` | `"[data-class-template-faculty]"` |
| `auth.js:9382` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-faculty]"` |
| `auth.js:9383` | `initClassManagementControls` | `querySelector` | `"[data-class-template-department]"` |
| `auth.js:9384` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-department]"` |
| `auth.js:9385` | `initClassManagementControls` | `querySelector` | `"[data-class-template-capacity]"` |
| `auth.js:9386` | `initClassManagementControls` | `querySelector` | `"[data-class-template-generate]"` |
| `auth.js:9387` | `initClassManagementControls` | `querySelector` | `"[data-class-template-arm-wrap]"` |
| `auth.js:9388` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-arm-wrap]"` |
| `auth.js:9389` | `initClassManagementControls` | `querySelector` | `"[data-class-template-stream-wrap]"` |
| `auth.js:9390` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-stream-wrap]"` |
| `auth.js:9391` | `initClassManagementControls` | `querySelector` | `"[data-class-template-faculty-wrap]"` |
| `auth.js:9392` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-faculty-wrap]"` |
| `auth.js:9393` | `initClassManagementControls` | `querySelector` | `"[data-class-template-department-wrap]"` |
| `auth.js:9394` | `initClassManagementControls` | `querySelector` | `"[data-class-template-custom-department-wrap]"` |
| `auth.js:9647` | `initClassManagementControls` | `querySelectorAll` | `"[data-assignment-row]"` |
| `auth.js:9648` | `initClassManagementControls` | `querySelector` | `'[data-assignment-field="subject"]'` |
| `auth.js:9649` | `initClassManagementControls` | `querySelector` | `'[data-assignment-field="teacher"]'` |
| `auth.js:9761` | `initClassManagementControls` | `getElementById` | `"portal-class-edit-overlay"` |
| `auth.js:9762` | `initClassManagementControls` | `querySelector` | `"[data-class-form-modal-body]"` |
| `auth.js:9764` | `initClassManagementControls` | `closest` | `"[data-class-form-modal-close]"` |
| `auth.js:9995` | `initClassManagementControls` | `closest` | `"[data-assignment-remove]"` |
| `auth.js:10001` | `initClassManagementControls` | `closest` | `"[data-assignment-row]"` |
| `auth.js:10164` | `initClassManagementControls` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:10222` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal"` |
| `auth.js:10223` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-body"` |
| `auth.js:10224` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-title"` |
| `auth.js:10225` | `initClassManagementControls` | `getElementById` | `"portal-class-subject-modal-subtitle"` |
| `auth.js:10226` | `initClassManagementControls` | `querySelector` | `"[data-class-subject-manage]"` |
| `auth.js:10228` | `initClassManagementControls` | `closest` | `"[data-class-subject-close]"` |
| `auth.js:10410` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-quick-modal"` |
| `auth.js:10411` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-modal-body"` |
| `auth.js:10412` | `initClassManagementControls` | `getElementById` | `"portal-class-timetable-modal-title"` |
| `auth.js:10414` | `initClassManagementControls` | `closest` | `"[data-class-timetable-close]"` |
| `auth.js:10418` | `initClassManagementControls` | `closest` | `"[data-class-timetable-print]"` |
| `auth.js:10580` | `initClassManagementControls` | `querySelector` | `"[data-class-timetable-print]"` |
| `auth.js:10662` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal"` |
| `auth.js:10663` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-body"` |
| `auth.js:10664` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-title"` |
| `auth.js:10665` | `initClassManagementControls` | `getElementById` | `"portal-class-detail-modal-subtitle"` |
| `auth.js:10667` | `initClassManagementControls` | `closest` | `"[data-class-detail-close]"` |
| `auth.js:10677` | `initClassManagementControls` | `closest` | `'[data-class-action="edit"]'` |
| `auth.js:10698` | `initClassManagementControls` | `closest` | `"[data-class-subjects-view]"` |
| `auth.js:10708` | `initClassManagementControls` | `closest` | `"[data-class-timetable-view]"` |
| `auth.js:10718` | `initClassManagementControls` | `closest` | `"[data-class-detail-jump]"` |
| `auth.js:11187` | `initClassManagementControls` | `closest` | `"[data-class-detail-view]"` |
| `auth.js:11199` | `initClassManagementControls` | `closest` | `"[data-class-subjects-view]"` |
| `auth.js:11211` | `initClassManagementControls` | `closest` | `"[data-class-timetable-view]"` |
| `auth.js:11223` | `initClassManagementControls` | `closest` | `"[data-class-action]"` |
| `auth.js:11540` | `initCourseManagementControls` | `querySelector` | `"[data-course-form-toggle]"` |
| `auth.js:11548` | `initCourseManagementControls` | `querySelector` | `"[data-course-code-field]"` |
| `auth.js:11549` | `initCourseManagementControls` | `querySelector` | `"[data-course-level-field]"` |
| `auth.js:11550` | `initCourseManagementControls` | `querySelector` | `"[data-course-arm-field]"` |
| `auth.js:11551` | `initCourseManagementControls` | `querySelector` | `"[data-course-teacher-field]"` |
| `auth.js:11552` | `initCourseManagementControls` | `querySelector` | `"[data-course-description-field]"` |
| `auth.js:11553` | `initCourseManagementControls` | `querySelector` | `"[data-course-wizard-actions]"` |
| `auth.js:11554` | `initCourseManagementControls` | `querySelector` | `"[data-course-category-field]"` |
| `auth.js:11555` | `initCourseManagementControls` | `querySelector` | `"[data-course-name-field]"` |
| `auth.js:11556` | `initCourseManagementControls` | `querySelector` | `"[data-course-subject-select-field]"` |
| `auth.js:11557` | `initCourseManagementControls` | `querySelector` | `"[data-course-subject-select]"` |
| `auth.js:11558` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-subject-field]"` |
| `auth.js:11559` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-subject]"` |
| `auth.js:11560` | `initCourseManagementControls` | `querySelector` | `"[data-course-faculty-field]"` |
| `auth.js:11561` | `initCourseManagementControls` | `querySelector` | `"[data-course-department-field]"` |
| `auth.js:11562` | `initCourseManagementControls` | `querySelector` | `"[data-course-custom-department-field]"` |
| `auth.js:11563` | `initCourseManagementControls` | `querySelector` | `"[data-course-faculty]"` |
| `auth.js:11564` | `initCourseManagementControls` | `querySelector` | `"[data-course-department]"` |
| `auth.js:11566` | `initCourseManagementControls` | `querySelector` | `"[data-course-template-type]"` |
| `auth.js:11567` | `initCourseManagementControls` | `querySelector` | `"[data-course-library-list]"` |
| `auth.js:11745` | `initCourseManagementControls` | `closest` | `"option"` |
| `auth.js:11983` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:11990` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:11994` | `initCourseManagementControls` | `querySelector` | `"input"` |
| `auth.js:12031` | `initCourseManagementControls` | `getElementById` | `"portal-heading"` |
| `auth.js:12032` | `initCourseManagementControls` | `querySelector` | `"[data-course-form-toggle]"` |
| `auth.js:12055` | `initCourseManagementControls` | `closest` | `".portal-field"` |
| `auth.js:12080` | `initCourseManagementControls` | `querySelector` | `"span"` |
| `auth.js:12578` | `initCourseManagementControls` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:12589` | `initCourseManagementControls` | `closest` | `"[data-course-action]"` |
| `auth.js:12769` | `initAcademicCalendarControls` | `querySelector` | `"[data-calendar-form-toggle]"` |
| `auth.js:12919` | `initAcademicCalendarControls` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:12931` | `initAcademicCalendarControls` | `closest` | `"[data-calendar-action]"` |
| `auth.js:13056` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-submit]"` |
| `auth.js:13057` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:13075` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-submit]"` |
| `auth.js:13076` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:13094` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-submit]"` |
| `auth.js:13095` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:13120` | `initAdmissionConfigurationControls` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13275` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:13284` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:13293` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:13303` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-session-action]"` |
| `auth.js:13320` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-submit]"` |
| `auth.js:13321` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-session-cancel]"` |
| `auth.js:13343` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-class-action]"` |
| `auth.js:13358` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-submit]"` |
| `auth.js:13359` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-class-cancel]"` |
| `auth.js:13381` | `initAdmissionConfigurationControls` | `closest` | `"[data-admission-stage-action]"` |
| `auth.js:13397` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-submit]"` |
| `auth.js:13398` | `initAdmissionConfigurationControls` | `querySelector` | `"[data-admission-stage-cancel]"` |
| `auth.js:13446` | `clearPortalAdmissionSetupErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:13447` | `clearPortalAdmissionSetupErrors` | `querySelectorAll` | `"[data-admission-setup-error-for]"` |
| `auth.js:13456` | `setPortalAdmissionSetupError` | `querySelector` | ``[data-admission-setup-error-for="${fieldName}"]`` |
| `auth.js:13459` | `setPortalAdmissionSetupError` | `querySelector` | `"#portal-admission-class-picker"` |
| `auth.js:13461` | `setPortalAdmissionSetupError` | `closest` | `".portal-field"` |
| `auth.js:13551` | `syncAdmissionClassFieldOptions` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13559` | `syncAdmissionClassFieldOptions` | `getElementById` | `"portal-admission-class-options"` |
| `auth.js:13644` | `initAdmissionSetupControls` | `querySelectorAll` | `'input[name="admissionClassOption"]:checked'` |
| `auth.js:13726` | `initAdmissionSetupControls` | `querySelectorAll` | `'input[name="admissionClassOption"]'` |
| `auth.js:13746` | `initAdmissionSetupControls` | `querySelector` | `"[data-admission-setup-recommended]"` |
| `auth.js:13897` | `initTimetableControls` | `getElementById` | `"portal-timetable-lesson-overlay"` |
| `auth.js:13898` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-overlay"` |
| `auth.js:13899` | `initTimetableControls` | `getElementById` | `"portal-calendar-substitution-log"` |
| `auth.js:13900` | `initTimetableControls` | `getElementById` | `"portal-timetable-period-form"` |
| `auth.js:13901` | `initTimetableControls` | `getElementById` | `"timetable-period-title"` |
| `auth.js:13902` | `initTimetableControls` | `getElementById` | `"timetable-session-id"` |
| `auth.js:13903` | `initTimetableControls` | `getElementById` | `"timetable-term-id"` |
| `auth.js:13904` | `initTimetableControls` | `getElementById` | `"timetable-view-mode"` |
| `auth.js:13905` | `initTimetableControls` | `getElementById` | `"timetable-class-level"` |
| `auth.js:13906` | `initTimetableControls` | `getElementById` | `"timetable-teacher-view"` |
| `auth.js:13907` | `initTimetableControls` | `getElementById` | `"timetable-week-type"` |
| `auth.js:13908` | `initTimetableControls` | `querySelector` | `"[data-timetable-copy-term]"` |
| `auth.js:13909` | `initTimetableControls` | `querySelector` | `"[data-timetable-period-add]"` |
| `auth.js:13910` | `initTimetableControls` | `querySelector` | `"[data-timetable-save-class]"` |
| `auth.js:13911` | `initTimetableControls` | `querySelector` | `"[data-timetable-print]"` |
| `auth.js:13912` | `initTimetableControls` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:13913` | `initTimetableControls` | `getElementById` | `"timetable-form-title"` |
| `auth.js:13914` | `initTimetableControls` | `getElementById` | `"timetable-form-context"` |
| `auth.js:13930` | `initTimetableControls` | `getElementById` | `"portal-timetable-toast"` |
| `auth.js:13949` | `initTimetableControls` | `getElementById` | `"portal-timetable-inline-status"` |
| `auth.js:14013` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal"` |
| `auth.js:14014` | `initTimetableControls` | `getElementById` | `"portal-timetable-class-modal-body"` |
| `auth.js:14016` | `initTimetableControls` | `closest` | `"[data-timetable-class-close]"` |
| `auth.js:14020` | `initTimetableControls` | `closest` | `"[data-timetable-class-print-current]"` |
| `auth.js:14031` | `initTimetableControls` | `querySelectorAll` | `".portal-field"` |
| `auth.js:14032` | `initTimetableControls` | `querySelectorAll` | `"[data-period-error-for]"` |
| `auth.js:14041` | `initTimetableControls` | `querySelector` | ``[data-period-error-for="${fieldName}"]`` |
| `auth.js:14043` | `initTimetableControls` | `closest` | `".portal-field"` |
| `auth.js:14300` | `initTimetableControls` | `querySelector` | `".portal-timetable-grid"` |
| `auth.js:14465` | `initTimetableControls` | `closest` | `".portal-field"` |
| `auth.js:14856` | `initTimetableControls` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:14868` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-lesson-close]"` |
| `auth.js:14879` | `initTimetableControls` | `querySelectorAll` | `"[data-timetable-period-close]"` |
| `auth.js:15076` | `initTimetableControls` | `closest` | `"[data-timetable-inline-action]"` |
| `auth.js:15077` | `initTimetableControls` | `closest` | `"[data-timetable-period-edit]"` |
| `auth.js:15078` | `initTimetableControls` | `closest` | `"[data-timetable-slot]"` |
| `auth.js:15079` | `initTimetableControls` | `closest` | `"[data-timetable-action]"` |
| `auth.js:15080` | `initTimetableControls` | `closest` | `"[data-timetable-class-action]"` |
| `auth.js:15081` | `initTimetableControls` | `closest` | `"[data-timetable-group-action]"` |
| `auth.js:15344` | `initFeeManagementControls` | `querySelector` | `"[data-fee-form-toggle]"` |
| `auth.js:15348` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-status"` |
| `auth.js:15349` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-list"` |
| `auth.js:15350` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-form-open]"` |
| `auth.js:15351` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-form-overlay"` |
| `auth.js:15353` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-session"` |
| `auth.js:15354` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-term"` |
| `auth.js:15355` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-class"` |
| `auth.js:15356` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-student"` |
| `auth.js:15357` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-due-date"` |
| `auth.js:15358` | `initFeeManagementControls` | `getElementById` | `"fee-invoice-whatsapp"` |
| `auth.js:15359` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-generate-single]"` |
| `auth.js:15361` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-overlay"` |
| `auth.js:15362` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-body"` |
| `auth.js:15363` | `initFeeManagementControls` | `getElementById` | `"portal-fee-invoice-modal-title"` |
| `auth.js:15364` | `initFeeManagementControls` | `getElementById` | `"portal-fee-category-options"` |
| `auth.js:15365` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-overlay"` |
| `auth.js:15366` | `initFeeManagementControls` | `getElementById` | `"portal-fee-form-modal-title"` |
| `auth.js:15374` | `initFeeManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:15382` | `initFeeManagementControls` | `getElementById` | `"portal-fee-toast"` |
| `auth.js:15868` | `initFeeManagementControls` | `querySelector` | `"[data-fee-invoice-close]"` |
| `auth.js:16623` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-form-close]"` |
| `auth.js:16629` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class]"` |
| `auth.js:16638` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-generate-class-whatsapp]"` |
| `auth.js:16647` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-action]"` |
| `auth.js:16669` | `initFeeManagementControls` | `closest` | `"details[data-invoice-class-token]"` |
| `auth.js:16689` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-close]"` |
| `auth.js:16694` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-current]"` |
| `auth.js:16703` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-with-history]"` |
| `auth.js:16712` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-print-history]"` |
| `auth.js:16721` | `initFeeManagementControls` | `closest` | `"[data-fee-invoice-download-history]"` |
| `auth.js:16771` | `initFeeManagementControls` | `closest` | `"[data-fee-category]"` |
| `auth.js:16788` | `initFeeManagementControls` | `closest` | `"[data-fee-form-close]"` |
| `auth.js:16884` | `initFeeManagementControls` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:16889` | `initFeeManagementControls` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:16900` | `initFeeManagementControls` | `closest` | `"[data-fee-action]"` |
| `auth.js:16926` | `initFeeManagementControls` | `closest` | `"[data-fee-action='edit']"` |
| `auth.js:16965` | `initSchoolSettingsControls` | `querySelector` | `'input[name="logoFile"]'` |
| `auth.js:16966` | `initSchoolSettingsControls` | `querySelector` | `"[data-clear-logo]"` |
| `auth.js:16967` | `initSchoolSettingsControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:16968` | `initSchoolSettingsControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:17215` | `initSchoolSettingsControls` | `querySelector` | `"[data-reset-school-settings]"` |
| `auth.js:17496` | `initRolePermissionControls` | `matches` | `"[data-role-permission-role][data-role-permission-key]"` |
| `auth.js:17611` | `initAcademicCycleControls` | `closest` | `"[data-term-period-type-wrap]"` |
| `auth.js:17611` | `initAcademicCycleControls` | `closest` | `".portal-field"` |
| `auth.js:17625` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:17626` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:17639` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:17640` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:17964` | `initAcademicCycleControls` | `closest` | `"[data-session-action]"` |
| `auth.js:17984` | `initAcademicCycleControls` | `querySelector` | `"[data-session-submit]"` |
| `auth.js:17985` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:18017` | `initAcademicCycleControls` | `closest` | `"[data-term-action]"` |
| `auth.js:18042` | `initAcademicCycleControls` | `querySelector` | `"[data-term-submit]"` |
| `auth.js:18043` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:18060` | `initAcademicCycleControls` | `querySelector` | `"[data-session-cancel]"` |
| `auth.js:18069` | `initAcademicCycleControls` | `querySelector` | `"[data-term-cancel]"` |
| `auth.js:18129` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18130` | `clearPortalSettingsErrors` | `querySelectorAll` | `".portal-structure-block"` |
| `auth.js:18131` | `clearPortalSettingsErrors` | `querySelectorAll` | `"[data-settings-error-for]"` |
| `auth.js:18137` | `setPortalSettingsError` | `querySelector` | ``[data-settings-error-for="${fieldName}"]`` |
| `auth.js:18140` | `setPortalSettingsError` | `closest` | `".portal-field"` |
| `auth.js:18153` | `clearPortalSessionErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18154` | `clearPortalSessionErrors` | `querySelectorAll` | `"[data-session-error-for]"` |
| `auth.js:18160` | `setPortalSessionError` | `querySelector` | ``[data-session-error-for="${fieldName}"]`` |
| `auth.js:18162` | `setPortalSessionError` | `closest` | `".portal-field"` |
| `auth.js:18174` | `clearPortalTermErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18175` | `clearPortalTermErrors` | `querySelectorAll` | `"[data-term-error-for]"` |
| `auth.js:18181` | `setPortalTermError` | `querySelector` | ``[data-term-error-for="${fieldName}"]`` |
| `auth.js:18183` | `setPortalTermError` | `closest` | `".portal-field"` |
| `auth.js:18195` | `clearPortalClassErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18196` | `clearPortalClassErrors` | `querySelectorAll` | `"[data-class-error-for]"` |
| `auth.js:18202` | `setPortalClassError` | `querySelector` | ``[data-class-error-for="${fieldName}"]`` |
| `auth.js:18204` | `setPortalClassError` | `closest` | `".portal-field"` |
| `auth.js:18216` | `clearPortalCalendarErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18217` | `clearPortalCalendarErrors` | `querySelectorAll` | `"[data-calendar-error-for]"` |
| `auth.js:18223` | `setPortalCalendarError` | `querySelector` | ``[data-calendar-error-for="${fieldName}"]`` |
| `auth.js:18225` | `setPortalCalendarError` | `closest` | `".portal-field"` |
| `auth.js:18296` | `clearPortalCourseErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18297` | `clearPortalCourseErrors` | `querySelectorAll` | `"[data-course-error-for]"` |
| `auth.js:18303` | `setPortalCourseError` | `querySelector` | ``[data-course-error-for="${fieldName}"]`` |
| `auth.js:18305` | `setPortalCourseError` | `closest` | `".portal-field"` |
| `auth.js:18373` | `resetPortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:18382` | `resetPortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:18383` | `resetPortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:18416` | `populatePortalClassForm` | `querySelector` | `".portal-class-advanced"` |
| `auth.js:18421` | `populatePortalClassForm` | `querySelector` | `"[data-class-submit]"` |
| `auth.js:18422` | `populatePortalClassForm` | `querySelector` | `"[data-class-cancel]"` |
| `auth.js:18466` | `resetPortalCourseForm` | `querySelector` | `"[data-course-subject-select]"` |
| `auth.js:18467` | `resetPortalCourseForm` | `querySelector` | `"[data-course-custom-subject]"` |
| `auth.js:18495` | `resetPortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:18496` | `resetPortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:18579` | `populatePortalCourseForm` | `querySelector` | `"[data-course-submit]"` |
| `auth.js:18580` | `populatePortalCourseForm` | `querySelector` | `"[data-course-cancel]"` |
| `auth.js:18612` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:18613` | `resetPortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:18642` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-submit]"` |
| `auth.js:18643` | `populatePortalCalendarForm` | `querySelector` | `"[data-calendar-cancel]"` |
| `auth.js:18661` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18662` | `clearPortalAdmissionConfigErrors` | `querySelectorAll` | `"[data-admission-config-error-for]"` |
| `auth.js:18668` | `setPortalAdmissionConfigError` | `querySelector` | ``[data-admission-config-error-for="${fieldName}"]`` |
| `auth.js:18670` | `setPortalAdmissionConfigError` | `closest` | `".portal-field"` |
| `auth.js:18681` | `clearPortalTimetableErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18682` | `clearPortalTimetableErrors` | `querySelectorAll` | `"[data-timetable-error-for]"` |
| `auth.js:18688` | `setPortalTimetableError` | `querySelector` | ``[data-timetable-error-for="${fieldName}"]`` |
| `auth.js:18690` | `setPortalTimetableError` | `closest` | `".portal-field"` |
| `auth.js:18701` | `clearPortalFeeErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:18702` | `clearPortalFeeErrors` | `querySelectorAll` | `"[data-fee-error-for]"` |
| `auth.js:18708` | `setPortalFeeError` | `querySelector` | ``[data-fee-error-for="${fieldName}"]`` |
| `auth.js:18710` | `setPortalFeeError` | `closest` | `".portal-field"` |
| `auth.js:18735` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:18736` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:18737` | `resetPortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:18738` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:18739` | `resetPortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:18773` | `populatePortalTimetableForm` | `getElementById` | `"timetable-session-id"` |
| `auth.js:18774` | `populatePortalTimetableForm` | `getElementById` | `"timetable-term-id"` |
| `auth.js:18775` | `populatePortalTimetableForm` | `getElementById` | `"timetable-class-level"` |
| `auth.js:18776` | `populatePortalTimetableForm` | `getElementById` | `"timetable-teacher-view"` |
| `auth.js:18777` | `populatePortalTimetableForm` | `getElementById` | `"timetable-week-type"` |
| `auth.js:18778` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-title"` |
| `auth.js:18779` | `populatePortalTimetableForm` | `getElementById` | `"timetable-form-context"` |
| `auth.js:18826` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-submit]"` |
| `auth.js:18827` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-cancel]"` |
| `auth.js:18828` | `populatePortalTimetableForm` | `querySelector` | `"[data-timetable-delete]"` |
| `auth.js:18864` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:18865` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:18866` | `resetPortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:18910` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-submit]"` |
| `auth.js:18911` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-cancel]"` |
| `auth.js:18912` | `populatePortalFeeForm` | `querySelector` | `"[data-fee-modal-archive]"` |
| `auth.js:18953` | `getSelectedSchoolTypesFromForm` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:18966` | `syncSchoolTypeControls` | `querySelectorAll` | `"[data-school-type-option]"` |
| `auth.js:18974` | `syncSchoolTypeControls` | `querySelector` | `"[data-school-type-all]"` |
| `auth.js:18987` | `syncHigherInstitutionTypeField` | `querySelector` | `"[data-higher-institution-type-field]"` |
| `auth.js:19133` | `updateLogoSwatch` | `querySelector` | `"[data-logo-swatch]"` |
| `auth.js:19167` | `clearPortalAccessErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:19168` | `clearPortalAccessErrors` | `querySelectorAll` | `"[data-access-error-for]"` |
| `auth.js:19174` | `setPortalAccessError` | `querySelector` | ``[data-access-error-for="${fieldName}"]`` |
| `auth.js:19176` | `setPortalAccessError` | `closest` | `".portal-field"` |
| `auth.js:19213` | `resetPortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:19214` | `resetPortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:19250` | `populatePortalAccessForm` | `querySelector` | `"[data-access-submit]"` |
| `auth.js:19251` | `populatePortalAccessForm` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:19298` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal"` |
| `auth.js:19299` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-body"` |
| `auth.js:19300` | `ensureAccessGrantModal` | `getElementById` | `"portal-access-grant-modal-title"` |
| `auth.js:19302` | `ensureAccessGrantModal` | `closest` | `"[data-access-grant-close]"` |
| `auth.js:19315` | `setAccessGrantModalOpen` | `querySelector` | `"[data-access-grant-close]"` |
| `auth.js:20037` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:20142` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:20144` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:20159` | `initAccessProvisioningControls` | `closest` | `"[data-access-id]"` |
| `auth.js:20160` | `initAccessProvisioningControls` | `closest` | `"[data-access-action]"` |
| `auth.js:20171` | `initAccessProvisioningControls` | `querySelector` | `"[data-access-cancel]"` |
| `auth.js:20189` | `clearPortalStaffErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:20190` | `clearPortalStaffErrors` | `querySelectorAll` | `"[data-staff-error-for]"` |
| `auth.js:20196` | `setPortalStaffError` | `querySelector` | ``[data-staff-error-for="${fieldName}"]`` |
| `auth.js:20198` | `setPortalStaffError` | `closest` | `".portal-field"` |
| `auth.js:20279` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:20280` | `resetPortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:20345` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-submit]"` |
| `auth.js:20346` | `populatePortalStaffForm` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:20574` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-search"` |
| `auth.js:20575` | `initStaffManagementControls` | `getElementById` | `"portal-staff-filter-status"` |
| `auth.js:20576` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-overlay"` |
| `auth.js:20577` | `initStaffManagementControls` | `querySelector` | `"[data-staff-form-open]"` |
| `auth.js:20578` | `initStaffManagementControls` | `getElementById` | `"portal-staff-form-title"` |
| `auth.js:20597` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:20631` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:20667` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-overlay"` |
| `auth.js:20671` | `initStaffManagementControls` | `getElementById` | `"portal-staff-view-grid"` |
| `auth.js:20681` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:21102` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:21129` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-overlay"` |
| `auth.js:21133` | `initStaffManagementControls` | `getElementById` | `"portal-staff-created-content"` |
| `auth.js:21135` | `initStaffManagementControls` | `closest` | `"[data-staff-created-close]"` |
| `auth.js:21137` | `initStaffManagementControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:21143` | `initStaffManagementControls` | `closest` | `"[data-staff-created-print]"` |
| `auth.js:21150` | `initStaffManagementControls` | `closest` | `"[data-staff-created-mail]"` |
| `auth.js:21180` | `initStaffManagementControls` | `querySelector` | `"[data-staff-created-print]"` |
| `auth.js:21317` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-edit]"` |
| `auth.js:21318` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-status]"` |
| `auth.js:21319` | `initStaffManagementControls` | `querySelector` | `"[data-staff-view-delete]"` |
| `auth.js:21478` | `initStaffManagementControls` | `closest` | `"[data-staff-form-close]"` |
| `auth.js:21818` | `initStaffManagementControls` | `closest` | `"[data-staff-open]"` |
| `auth.js:21837` | `initStaffManagementControls` | `closest` | `"[data-staff-view-close]"` |
| `auth.js:21843` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-print]"` |
| `auth.js:21852` | `initStaffManagementControls` | `closest` | `"[data-staff-job-letter-mail]"` |
| `auth.js:21861` | `initStaffManagementControls` | `closest` | `"[data-staff-view-edit]"` |
| `auth.js:21879` | `initStaffManagementControls` | `closest` | `"[data-staff-view-status]"` |
| `auth.js:21902` | `initStaffManagementControls` | `closest` | `"[data-staff-view-delete]"` |
| `auth.js:21926` | `initStaffManagementControls` | `querySelector` | `"[data-staff-cancel]"` |
| `auth.js:22145` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:22166` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-overlay"` |
| `auth.js:22170` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-content"` |
| `auth.js:22171` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-review-title"` |
| `auth.js:22172` | `initAdminStaffLeaveReviewControls` | `getElementById` | `"portal-staff-leave-modal-status"` |
| `auth.js:22182` | `initAdminStaffLeaveReviewControls` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:22298` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-open]"` |
| `auth.js:22317` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-review-close]"` |
| `auth.js:22323` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-approve]"` |
| `auth.js:22329` | `initAdminStaffLeaveReviewControls` | `closest` | `"[data-leave-reject]"` |
| `auth.js:22399` | `renderPortalFeatureToggleSection` | `querySelectorAll` | `"[data-feature-toggle]"` |
| `auth.js:24489` | `clearPortalStudentErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:24490` | `clearPortalStudentErrors` | `querySelectorAll` | `"[data-student-error-for]"` |
| `auth.js:24496` | `setPortalStudentError` | `querySelector` | ``[data-student-error-for="${fieldName}"]`` |
| `auth.js:24498` | `setPortalStudentError` | `closest` | `".portal-field"` |
| `auth.js:25238` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:25240` | `resolveGuardianRelationshipFields` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:25256` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:25257` | `updateGuardianRelationshipCustomField` | `querySelector` | `'[data-guardian-field="relationshipOther"]'` |
| `auth.js:25331` | `parseGuardianRows` | `querySelectorAll` | `".portal-guardian-row"` |
| `auth.js:25337` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="name"]'` |
| `auth.js:25339` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="phone"]'` |
| `auth.js:25340` | `parseGuardianRows` | `querySelector` | `'[data-guardian-field="email"]'` |
| `auth.js:25402` | `resetPortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:25403` | `resetPortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:25474` | `populatePortalStudentForm` | `querySelector` | `"[data-student-submit]"` |
| `auth.js:25475` | `populatePortalStudentForm` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:25556` | `parseSpreadsheetXmlRows` | `querySelector` | `"parsererror"` |
| `auth.js:25583` | `parseSpreadsheetXmlRows` | `querySelector` | `"Data"` |
| `auth.js:25584` | `parseSpreadsheetXmlRows` | `querySelector` | `"ss\\:Data"` |
| `auth.js:26077` | `initStudentManagementControls` | `querySelector` | `"[data-add-guardian]"` |
| `auth.js:26078` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-form"` |
| `auth.js:26079` | `initStudentManagementControls` | `getElementById` | `"portal-student-quick-add-status"` |
| `auth.js:26080` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-toggle]"` |
| `auth.js:26081` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-panel"` |
| `auth.js:26082` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-overlay"` |
| `auth.js:26083` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-overlay"` |
| `auth.js:26084` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-overlay"` |
| `auth.js:26085` | `initStudentManagementControls` | `getElementById` | `"portal-student-view-content"` |
| `auth.js:26086` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-overlay"` |
| `auth.js:26087` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-status"` |
| `auth.js:26088` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-list"` |
| `auth.js:26089` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-id"` |
| `auth.js:26090` | `initStudentManagementControls` | `getElementById` | `"portal-student-docs-student-name"` |
| `auth.js:26091` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-type"` |
| `auth.js:26092` | `initStudentManagementControls` | `getElementById` | `"portal-student-doc-file"` |
| `auth.js:26093` | `initStudentManagementControls` | `querySelector` | `"[data-student-doc-upload]"` |
| `auth.js:26094` | `initStudentManagementControls` | `getElementById` | `"portal-student-class-filters"` |
| `auth.js:26095` | `initStudentManagementControls` | `getElementById` | `"portal-student-search"` |
| `auth.js:26096` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-status"` |
| `auth.js:26097` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-file"` |
| `auth.js:26098` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-preview]"` |
| `auth.js:26099` | `initStudentManagementControls` | `querySelector` | `"[data-student-import-confirm]"` |
| `auth.js:26100` | `initStudentManagementControls` | `getElementById` | `"portal-student-import-preview"` |
| `auth.js:26104` | `initStudentManagementControls` | `getElementById` | `"portal-student-create-title"` |
| `auth.js:26328` | `initStudentManagementControls` | `closest` | `"[data-student-class]"` |
| `auth.js:26339` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-create-close]"` |
| `auth.js:26348` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-import-close]"` |
| `auth.js:26354` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-view-close]"` |
| `auth.js:26360` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-docs-close]"` |
| `auth.js:26474` | `initStudentManagementControls` | `closest` | `"[data-student-doc-action]"` |
| `auth.js:26556` | `initStudentManagementControls` | `closest` | `'[data-guardian-field="relationshipType"]'` |
| `auth.js:26562` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:26567` | `initStudentManagementControls` | `closest` | `"[data-remove-guardian]"` |
| `auth.js:26573` | `initStudentManagementControls` | `closest` | `".portal-guardian-row"` |
| `auth.js:26829` | `initStudentManagementControls` | `querySelector` | `"[data-student-cancel]"` |
| `auth.js:26841` | `initStudentManagementControls` | `closest` | `"[data-student-bulk-delete-level]"` |
| `auth.js:26914` | `initStudentManagementControls` | `closest` | `"[data-student-class-toggle]"` |
| `auth.js:26927` | `initStudentManagementControls` | `closest` | `".portal-student-group"` |
| `auth.js:26928` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-list"` |
| `auth.js:26929` | `initStudentManagementControls` | `querySelector` | `".portal-student-group-toggle-arrow"` |
| `auth.js:26948` | `initStudentManagementControls` | `closest` | `"[data-student-action]"` |
| `auth.js:27597` | `initStudentManagementControls` | `closest` | `"[data-student-photo-action]"` |
| `auth.js:27610` | `initStudentManagementControls` | `querySelector` | `"[data-student-photo-input]"` |
| `auth.js:27637` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:27642` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:27650` | `initStudentManagementControls` | `closest` | `"[data-student-photo-input]"` |
| `auth.js:27688` | `initStudentManagementControls` | `querySelector` | `".portal-student-profile-photo-media"` |
| `auth.js:27694` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="remove"]'` |
| `auth.js:27698` | `initStudentManagementControls` | `querySelector` | `'[data-student-photo-action="replace"]'` |
| `auth.js:27706` | `initStudentManagementControls` | `querySelectorAll` | `"[data-student-template-download]"` |
| `auth.js:27915` | `getSelectedRole` | `querySelector` | `".auth-role.is-active"` |
| `auth.js:27925` | `getSelectedRole` | `querySelector` | `".auth-role-label"` |
| `auth.js:27936` | `initRoleButtons` | `getElementById` | `"login-email"` |
| `auth.js:27937` | `initRoleButtons` | `querySelector` | `'.auth-field-label[for="login-email"]'` |
| `auth.js:27948` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:27950` | `initRoleButtons` | `querySelectorAll` | `".auth-role"` |
| `auth.js:27959` | `initPasswordToggles` | `querySelectorAll` | `"[data-password-toggle]"` |
| `auth.js:27962` | `initPasswordToggles` | `getElementById` | `targetId` |
| `auth.js:27994` | `getActionFeedbackTrigger` | `matches` | `[ "[data-no-inline-feedback]", "[data-password-toggle]", "[data-theme-toggle]", "[data-sidebar-toggle]", "[data-auth-modal-close]", "[data-auth-role]", ].join(",")` |
| `auth.js:28050` | `getInlineActionFeedbackHost` | `getElementById` | `existingId` |
| `auth.js:28064` | `getInlineActionFeedbackHost` | `closest` | `".inline-action-feedback-wrap"` |
| `auth.js:28162` | `clearInlineActionFeedback` | `getElementById` | `hostId` |
| `auth.js:28260` | `clearFieldErrors` | `querySelectorAll` | `".auth-line-field"` |
| `auth.js:28261` | `clearFieldErrors` | `querySelectorAll` | `".auth-check"` |
| `auth.js:28262` | `clearFieldErrors` | `querySelectorAll` | `".portal-field"` |
| `auth.js:28263` | `clearFieldErrors` | `querySelectorAll` | `".auth-field-error"` |
| `auth.js:28269` | `setFieldError` | `querySelector` | ``[data-error-for="${fieldName}"]`` |
| `auth.js:28272` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:28273` | `setFieldError` | `closest` | `".auth-line-field"` |
| `auth.js:28274` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:28275` | `setFieldError` | `closest` | `".auth-check"` |
| `auth.js:28276` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:28277` | `setFieldError` | `closest` | `".portal-field"` |
| `auth.js:28365` | `initSignupFlow` | `getElementById` | `"signup-form"` |
| `auth.js:28366` | `initSignupFlow` | `getElementById` | `"signup-status"` |
| `auth.js:28379` | `initSignupFlow` | `closest` | `"[data-supabase-resend-confirmation]"` |
| `auth.js:28826` | `initLoginFlow` | `getElementById` | `"login-form"` |
| `auth.js:28827` | `initLoginFlow` | `getElementById` | `"login-status"` |
| `auth.js:29124` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-form"` |
| `auth.js:29125` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-status"` |
| `auth.js:29126` | `initOwnerAccessFlow` | `getElementById` | `"owner-confirm-block"` |
| `auth.js:29127` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-copy"` |
| `auth.js:29128` | `initOwnerAccessFlow` | `getElementById` | `"owner-login-submit"` |
| `auth.js:29225` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form"` |
| `auth.js:29226` | `initForgotPasswordFlow` | `getElementById` | `"forgot-status"` |
| `auth.js:29227` | `initForgotPasswordFlow` | `getElementById` | `"forgot-form-view"` |
| `auth.js:29228` | `initForgotPasswordFlow` | `getElementById` | `"forgot-sent-view"` |
| `auth.js:29314` | `initResetPasswordFlow` | `getElementById` | `"reset-form"` |
| `auth.js:29315` | `initResetPasswordFlow` | `getElementById` | `"reset-status"` |
| `auth.js:29316` | `initResetPasswordFlow` | `getElementById` | `"reset-form-wrapper"` |
| `auth.js:29317` | `initResetPasswordFlow` | `getElementById` | `"reset-invalid-view"` |
| `auth.js:29318` | `initResetPasswordFlow` | `getElementById` | `"reset-success-view"` |
| `auth.js:29495` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29525` | `ensureGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29527` | `ensureGoogleModal` | `querySelectorAll` | `"[data-auth-modal-close]"` |
| `auth.js:29531` | `ensureGoogleModal` | `querySelector` | `"#auth-google-form"` |
| `auth.js:29538` | `openGoogleModal` | `querySelector` | `"#auth-google-title"` |
| `auth.js:29539` | `openGoogleModal` | `querySelector` | `"#auth-google-copy"` |
| `auth.js:29540` | `openGoogleModal` | `querySelector` | `"#auth-google-error"` |
| `auth.js:29541` | `openGoogleModal` | `querySelector` | `"#auth-google-email"` |
| `auth.js:29558` | `closeGoogleModal` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29570` | `startSupabaseGoogleAuth` | `getElementById` | `page === "signup" ? "signup-status" : "login-status"` |
| `auth.js:29571` | `startSupabaseGoogleAuth` | `getElementById` | `"login-remember"` |
| `auth.js:29608` | `handleGoogleSubmit` | `getElementById` | `"auth-google-modal"` |
| `auth.js:29610` | `handleGoogleSubmit` | `querySelector` | `"#auth-google-error"` |
| `auth.js:29735` | `initGoogleButtons` | `querySelectorAll` | `"[data-google-auth]"` |
| `auth.js:29754` | `initConfirmPage` | `getElementById` | `"confirm-status"` |
| `auth.js:29755` | `initConfirmPage` | `getElementById` | `"confirm-heading"` |
| `auth.js:29756` | `initConfirmPage` | `getElementById` | `"confirm-copy"` |
| `auth.js:29757` | `initConfirmPage` | `getElementById` | `"confirm-details"` |
| `auth.js:29811` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-form"` |
| `auth.js:29812` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-status"` |
| `auth.js:29813` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-workspace-id"` |
| `auth.js:29814` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-copy"` |
| `auth.js:29815` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-step-indicator"` |
| `auth.js:29816` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-review-panel"` |
| `auth.js:29817` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition"` |
| `auth.js:29818` | `initAdmissionsApplyPage` | `getElementById` | `"health-condition-details-wrap"` |
| `auth.js:29819` | `initAdmissionsApplyPage` | `getElementById` | `"apply-health-condition-details"` |
| `auth.js:29823` | `initAdmissionsApplyPage` | `querySelectorAll` | `'input[type="file"]'` |
| `auth.js:29841` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-brand-mark"` |
| `auth.js:29842` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-school-name"` |
| `auth.js:30029` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admissions-step]"` |
| `auth.js:30038` | `initAdmissionsApplyPage` | `getElementById` | `"admissions-apply-toast"` |
| `auth.js:30075` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:30111` | `initAdmissionsApplyPage` | `closest` | `".auth-field-block"` |
| `auth.js:30113` | `initAdmissionsApplyPage` | `querySelector` | `"[data-apply-file-selection]"` |
| `auth.js:30384` | `initAdmissionsApplyPage` | `closest` | `"[data-apply-file-remove]"` |
| `auth.js:30406` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-next]"` |
| `auth.js:30415` | `initAdmissionsApplyPage` | `querySelectorAll` | `"[data-admission-step-prev]"` |
| `auth.js:30740` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-date]"` |
| `auth.js:30741` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-lesson]"` |
| `auth.js:30742` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-teacher-attendance-form]"` |
| `auth.js:30743` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"#teacher-attendance-status"` |
| `auth.js:30771` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `".attendance-status-option input"` |
| `auth.js:30773` | `renderTeacherAttendanceWorkspace` | `closest` | `".attendance-status-picker"` |
| `auth.js:30780` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-mark-all]"` |
| `auth.js:30783` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `'.attendance-status-option input[value="present"]'` |
| `auth.js:30795` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:30799` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:30808` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:30840` | `renderTeacherAttendanceWorkspace` | `querySelectorAll` | `"[data-attendance-student-row]"` |
| `auth.js:30844` | `renderTeacherAttendanceWorkspace` | `querySelector` | `'input[type="radio"]:checked'` |
| `auth.js:30845` | `renderTeacherAttendanceWorkspace` | `querySelector` | `"[data-attendance-note]"` |
| `auth.js:32359` | `showReportCardToast` | `getElementById` | `"portal-report-card-toast"` |
| `auth.js:32408` | `loadReportCardPdfLibrary` | `querySelector` | `'script[data-report-card-pdf-library="true"]'` |
| `auth.js:32648` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:32675` | `ensureReportCardModal` | `getElementById` | `"portal-report-card-overlay"` |
| `auth.js:32678` | `ensureReportCardModal` | `closest` | `"[data-report-card-close]"` |
| `auth.js:32681` | `ensureReportCardModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:32685` | `ensureReportCardModal` | `closest` | `"[data-report-card-print]"` |
| `auth.js:32690` | `ensureReportCardModal` | `closest` | `"[data-report-card-download]"` |
| `auth.js:32708` | `ensureReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:32722` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-body"` |
| `auth.js:32723` | `openReportCardModal` | `querySelector` | `"#portal-report-card-modal-title"` |
| `auth.js:32735` | `openReportCardModal` | `querySelector` | `"[data-report-card-close]"` |
| `auth.js:32751` | `wireReportCardDocumentActions` | `closest` | `"[data-report-card-action]"` |
| `auth.js:33579` | `showPortalOnboardingModal` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:33671` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-close]"` |
| `auth.js:33672` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-skip]"` |
| `auth.js:33673` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-prev]"` |
| `auth.js:33674` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-next]"` |
| `auth.js:33675` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-step]"` |
| `auth.js:33676` | `showPortalOnboardingModal` | `closest` | `"[data-onboarding-open-section]"` |
| `auth.js:33722` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-metrics"` |
| `auth.js:33729` | `renderAdminPortalSetupChecklist` | `getElementById` | `"portal-onboarding-checklist"` |
| `auth.js:33779` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-open-onboarding-guide]"` |
| `auth.js:33782` | `renderAdminPortalSetupChecklist` | `querySelector` | `"[data-dismiss-onboarding-checklist]"` |
| `auth.js:33799` | `initPortalOnboarding` | `getElementById` | `"portal-onboarding-modal"` |
| `auth.js:33842` | `initPortalAnnouncementToasts` | `getElementById` | `"portal-announcement-toast"` |
| `auth.js:33882` | `initPortalAnnouncementToasts` | `querySelector` | `".portal-announcement-toast-timer"` |
| `auth.js:33888` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-title]"` |
| `auth.js:33890` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-message]"` |
| `auth.js:33892` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-meta]"` |
| `auth.js:33916` | `initPortalAnnouncementToasts` | `querySelector` | `"[data-announcement-toast-close]"` |
| `auth.js:34027` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:34028` | `renderStudentEvents` | `closest` | `".admin-events-card"` |
| `auth.js:34348` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:34368` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-overlay"` |
| `auth.js:34379` | `renderStudentClassesSection` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:34384` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-title"` |
| `auth.js:34385` | `renderStudentClassesSection` | `getElementById` | `"student-class-roster-body"` |
| `auth.js:34396` | `renderStudentClassesSection` | `querySelectorAll` | `"[data-student-other-class-open]"` |
| `auth.js:34411` | `renderStudentClassesSection` | `closest` | `"[data-student-class-roster-close]"` |
| `auth.js:34749` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head h2"` |
| `auth.js:34750` | `renderStudentReportsSection` | `querySelector` | `".parent-report-card-command .admin-surface-head span"` |
| `auth.js:35019` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:35020` | `renderStaffEvents` | `closest` | `".admin-events-card"` |
| `auth.js:35349` | `renderStaffTimetableWorkspace` | `querySelectorAll` | `"[data-staff-timetable-view]"` |
| `auth.js:35470` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:35490` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-overlay"` |
| `auth.js:35494` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-title"` |
| `auth.js:35495` | `renderStaffClassesWorkspace` | `getElementById` | `"staff-class-roster-body"` |
| `auth.js:35505` | `renderStaffClassesWorkspace` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:35530` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-open]"` |
| `auth.js:35548` | `renderStaffClassesWorkspace` | `closest` | `"[data-staff-class-roster-close]"` |
| `auth.js:35881` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:35889` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-class]"` |
| `auth.js:35894` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-subject]"` |
| `auth.js:35898` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-session]"` |
| `auth.js:35903` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-term]"` |
| `auth.js:35910` | `renderStaffGradebookWorkspace` | `querySelector` | `"#staff-gradebook-status"` |
| `auth.js:35911` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-components]"` |
| `auth.js:35913` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:35916` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-name]"` |
| `auth.js:35917` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-component-maximum]"` |
| `auth.js:35921` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(component.id)}"]`` |
| `auth.js:35929` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-component-total]"` |
| `auth.js:35934` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:35937` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-score="${CSS.escape(component.id)}"]`` |
| `auth.js:35942` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-student-total]"` |
| `auth.js:35949` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:35949` | `renderStaffGradebookWorkspace` | `matches` | `"[data-gradebook-score]"` |
| `auth.js:35953` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-add-component]"` |
| `auth.js:35968` | `renderStaffGradebookWorkspace` | `querySelector` | `".staff-gradebook-table thead th:last-child"` |
| `auth.js:35973` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-student]"` |
| `auth.js:35984` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-remove-component]"` |
| `auth.js:35986` | `renderStaffGradebookWorkspace` | `querySelectorAll` | `"[data-gradebook-component]"` |
| `auth.js:35990` | `renderStaffGradebookWorkspace` | `closest` | `"[data-gradebook-component]"` |
| `auth.js:35993` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-heading="${CSS.escape(componentId)}"]`` |
| `auth.js:35994` | `renderStaffGradebookWorkspace` | `querySelectorAll` | ``[data-gradebook-score="${CSS.escape(componentId)}"]`` |
| `auth.js:35995` | `renderStaffGradebookWorkspace` | `closest` | `"td"` |
| `auth.js:35999` | `renderStaffGradebookWorkspace` | `querySelector` | `"[data-gradebook-save]"` |
| `auth.js:36018` | `renderStaffGradebookWorkspace` | `querySelector` | ``[data-gradebook-student="${CSS.escape(student.id)}"]`` |
| `auth.js:36132` | `collectStaffReportCardSubjects` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36136` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:36137` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="subjectCode"]'` |
| `auth.js:36138` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:36139` | `collectStaffReportCardSubjects` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:36502` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-context-form"` |
| `auth.js:36503` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-form"` |
| `auth.js:36534` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-card-status"` |
| `auth.js:36535` | `renderStaffResultsWorkspace` | `querySelector` | `"#staff-result-subject-rows"` |
| `auth.js:36537` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36538` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="caScore"]'` |
| `auth.js:36539` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="examScore"]'` |
| `auth.js:36542` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-total]"` |
| `auth.js:36543` | `renderStaffResultsWorkspace` | `querySelector` | `"[data-report-row-grade]"` |
| `auth.js:36547` | `renderStaffResultsWorkspace` | `querySelector` | `'[name="subjectName"]'` |
| `auth.js:36560` | `renderStaffResultsWorkspace` | `querySelector` | ``[data-report-editor-summary="${key}"]`` |
| `auth.js:36601` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:36606` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-add]"` |
| `auth.js:36607` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36612` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36617` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-remove]"` |
| `auth.js:36619` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-subject-row]"` |
| `auth.js:36620` | `renderStaffResultsWorkspace` | `querySelectorAll` | `"[data-report-subject-row]"` |
| `auth.js:36621` | `renderStaffResultsWorkspace` | `querySelector` | `"td"` |
| `auth.js:36628` | `renderStaffResultsWorkspace` | `closest` | `"[data-result-generate-summary]"` |
| `auth.js:36656` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-release]"` |
| `auth.js:36694` | `renderStaffResultsWorkspace` | `closest` | `"[data-report-card-return-draft]"` |
| `auth.js:37125` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:37137` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:37141` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37159` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:37163` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37168` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:37172` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-resource-input]"` |
| `auth.js:37259` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-form"` |
| `auth.js:37260` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:37272` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37273` | `renderStaffLessonPlansWorkspace` | `closest` | `"[data-lesson-attachment-remove]"` |
| `auth.js:37276` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-attachments]"` |
| `auth.js:37280` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"[data-lesson-reset]"` |
| `auth.js:37285` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-save-status]"` |
| `auth.js:37314` | `renderStaffLessonPlansWorkspace` | `querySelector` | `"#staff-lesson-plan-status"` |
| `auth.js:37317` | `renderStaffLessonPlansWorkspace` | `querySelectorAll` | `"[data-lesson-action]"` |
| `auth.js:37715` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-history]"` |
| `auth.js:37720` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-picker]"` |
| `auth.js:37721` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-search]"` |
| `auth.js:37727` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:37733` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-open]"` |
| `auth.js:37736` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-close]"` |
| `auth.js:37742` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:37749` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-group]"` |
| `auth.js:37750` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-key]:not([hidden])"` |
| `auth.js:37752` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-recipient-empty]"` |
| `auth.js:37757` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-recipient-key]"` |
| `auth.js:37771` | `renderPortalMessageInbox` | `querySelectorAll` | `"[data-message-thread]"` |
| `auth.js:37784` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-delete-thread]"` |
| `auth.js:37813` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-composer]"` |
| `auth.js:37844` | `renderPortalMessageInbox` | `querySelector` | `"[data-message-status]"` |
| `auth.js:38396` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-form"` |
| `auth.js:38397` | `renderStaffLeaveWorkspace` | `querySelector` | `"#staff-leave-status"` |
| `auth.js:38403` | `renderStaffLeaveWorkspace` | `querySelector` | `"[data-leave-days-output]"` |
| `auth.js:38797` | `wireNotificationReplyForms` | `closest` | `"[data-notification-parent-reply-form]"` |
| `auth.js:38819` | `wireNotificationReplyForms` | `querySelector` | `"button[type='submit']"` |
| `auth.js:38833` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:38860` | `ensureDashboardNotificationsOverlay` | `getElementById` | `"admin-notification-overlay"` |
| `auth.js:39184` | `initDashboardGlobalSearch` | `getElementById` | `input.getAttribute("aria-controls") &#124;&#124; "admin-search-suggestions"` |
| `auth.js:39237` | `initPortalNotifications` | `getElementById` | `"admin-notification-list"` |
| `auth.js:39254` | `initPortalNotifications` | `getElementById` | `"admin-notification-dot"` |
| `auth.js:39279` | `initPortalNotifications` | `querySelectorAll` | `"[data-notification-close]"` |
| `auth.js:39334` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-main"` |
| `auth.js:39335` | `initAdminSectionQuickNav` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:39341` | `initAdminSectionQuickNav` | `querySelector` | `".admin-section-quick-nav"` |
| `auth.js:39347` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-settings-subnav a"` |
| `auth.js:39376` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-surface-card"` |
| `auth.js:39377` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:39395` | `initAdminSectionQuickNav` | `querySelector` | `".admin-surface-head h2, .admin-report-heading h2"` |
| `auth.js:39406` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:39406` | `initAdminSectionQuickNav` | `getElementById` | `id` |
| `auth.js:39441` | `initAdminSectionQuickNav` | `querySelectorAll` | `".admin-section-quick-link"` |
| `auth.js:39663` | `loadPaystackInline` | `querySelector` | `'script[src="https://js.paystack.co/v2/inline.js"]'` |
| `auth.js:40129` | `renderParentChildSelector` | `querySelector` | `"#parent-child-switch"` |
| `auth.js:40746` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:40769` | `ensureParentFeeInvoiceModal` | `getElementById` | `"parent-fee-invoice-overlay"` |
| `auth.js:40772` | `ensureParentFeeInvoiceModal` | `closest` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:40774` | `ensureParentFeeInvoiceModal` | `querySelector` | `".portal-overlay:not([hidden])"` |
| `auth.js:40783` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-title"` |
| `auth.js:40784` | `openParentFeeInvoiceModal` | `querySelector` | `"#parent-fee-invoice-modal-body"` |
| `auth.js:40796` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:40803` | `openParentFeeInvoiceModal` | `querySelector` | `"[data-parent-fee-invoice-close]"` |
| `auth.js:40962` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-form"` |
| `auth.js:40963` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-status"` |
| `auth.js:40964` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-view]"` |
| `auth.js:40965` | `renderParentFeesPage` | `querySelector` | `"[data-parent-fee-invoice-download]"` |
| `auth.js:40984` | `renderParentFeesPage` | `querySelector` | `"#parent-fee-payment-amount"` |
| `auth.js:41004` | `renderParentFeesPage` | `querySelector` | `"button[type='submit']"` |
| `auth.js:41622` | `initParentFloatingChatbot` | `getElementById` | `"parent-floating-chatbot"` |
| `auth.js:41681` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-toggle]"` |
| `auth.js:41682` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-panel]"` |
| `auth.js:41683` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-close]"` |
| `auth.js:41684` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-thread]"` |
| `auth.js:41685` | `initParentFloatingChatbot` | `querySelector` | `"[data-parent-chatbot-form]"` |
| `auth.js:41738` | `initParentFloatingChatbot` | `querySelectorAll` | `"[data-parent-chatbot-question]"` |
| `auth.js:41785` | `initParentPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:41786` | `initParentPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:41787` | `initParentPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:41788` | `initParentPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:41789` | `initParentPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:41790` | `initParentPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:41791` | `initParentPages` | `getElementById` | `"portal-gate"` |
| `auth.js:41792` | `initParentPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:41823` | `initParentPages` | `getElementById` | `"parent-child-switcher"` |
| `auth.js:41825` | `initParentPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:41826` | `initParentPages` | `querySelector` | `".admin-dashboard-topbar"` |
| `auth.js:41861` | `initParentPages` | `getElementById` | `"parent-page-content"` |
| `auth.js:42079` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-search"` |
| `auth.js:42080` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-role-filter"` |
| `auth.js:42081` | `renderSuperAdminUsers` | `getElementById` | `"super-admin-status-filter"` |
| `auth.js:42237` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-metrics"` |
| `auth.js:42238` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-users"` |
| `auth.js:42239` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-workspaces"` |
| `auth.js:42240` | `refreshSuperAdminConsole` | `getElementById` | `"super-admin-activity"` |
| `auth.js:42242` | `refreshSuperAdminConsole` | `getElementById` | `"portal-last-updated"` |
| `auth.js:42249` | `handleSuperAdminUserAction` | `closest` | `"[data-super-user-action]"` |
| `auth.js:42390` | `initSuperAdminPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:42391` | `initSuperAdminPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:42392` | `initSuperAdminPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:42393` | `initSuperAdminPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:42394` | `initSuperAdminPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:42395` | `initSuperAdminPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:42396` | `initSuperAdminPage` | `getElementById` | `"portal-gate"` |
| `auth.js:42397` | `initSuperAdminPage` | `getElementById` | `"super-admin-status"` |
| `auth.js:42398` | `initSuperAdminPage` | `getElementById` | `"super-admin-users"` |
| `auth.js:42425` | `initSuperAdminPage` | `querySelectorAll` | `"[data-super-refresh]"` |
| `auth.js:42432` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:42433` | `initSuperAdminPage` | `getElementById` | `id` |
| `auth.js:42451` | `initAdminShellPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:42452` | `initAdminShellPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:42453` | `initAdminShellPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:42454` | `initAdminShellPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:42455` | `initAdminShellPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:42456` | `initAdminShellPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:42457` | `initAdminShellPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:42458` | `initAdminShellPages` | `getElementById` | `"portal-gate"` |
| `auth.js:42841` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="applications"]'` |
| `auth.js:42842` | `initAdmissionsControls` | `querySelector` | `'[data-admission-delete-all="history"]'` |
| `auth.js:42857` | `initAdmissionsControls` | `getElementById` | `"portal-admission-submit-button"` |
| `auth.js:42857` | `initAdmissionsControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:42858` | `initAdmissionsControls` | `getElementById` | `"portal-admission-cancel-edit"` |
| `auth.js:42859` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-overlay"` |
| `auth.js:42860` | `initAdmissionsControls` | `getElementById` | `"portal-admission-form-title"` |
| `auth.js:42861` | `initAdmissionsControls` | `querySelector` | `"[data-admission-form-open]"` |
| `auth.js:42958` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-form-close]"` |
| `auth.js:42971` | `initAdmissionsControls` | `getElementById` | `"portal-admission-approval-toast"` |
| `auth.js:43014` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal"` |
| `auth.js:43015` | `initAdmissionsControls` | `getElementById` | `"portal-admission-modal-body"` |
| `auth.js:43018` | `initAdmissionsControls` | `closest` | `"[data-admission-close]"` |
| `auth.js:43024` | `initAdmissionsControls` | `closest` | `"[data-admission-action]"` |
| `auth.js:43132` | `initAdmissionsControls` | `getElementById` | `"portal-admission-link-value"` |
| `auth.js:43133` | `initAdmissionsControls` | `getElementById` | `"portal-admission-copy-link"` |
| `auth.js:43134` | `initAdmissionsControls` | `getElementById` | `"portal-admission-open-link"` |
| `auth.js:43135` | `initAdmissionsControls` | `getElementById` | `"portal-admission-qr-image"` |
| `auth.js:43600` | `initAdmissionsControls` | `closest` | `"[data-admission-delete]"` |
| `auth.js:43610` | `initAdmissionsControls` | `closest` | `"[data-admission-open]"` |
| `auth.js:43626` | `initAdmissionsControls` | `querySelectorAll` | `"[data-admission-delete-all]"` |
| `auth.js:43672` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-form"` |
| `auth.js:43673` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-status"` |
| `auth.js:43674` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-summary"` |
| `auth.js:43675` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-list"` |
| `auth.js:43676` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-history"` |
| `auth.js:43677` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-apply-link"` |
| `auth.js:43679` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-config-summary"` |
| `auth.js:43680` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-form"` |
| `auth.js:43681` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-status"` |
| `auth.js:43682` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-class-picker"` |
| `auth.js:43683` | `initAdminAdmissionsPage` | `getElementById` | `"portal-admission-setup-preview"` |
| `auth.js:43850` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-title"` |
| `auth.js:43851` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-copy"` |
| `auth.js:43852` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-school-name"` |
| `auth.js:43853` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-brand-mark"` |
| `auth.js:43854` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-kicker"` |
| `auth.js:43855` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-title"` |
| `auth.js:43856` | `setSelfRegistrationPageCopy` | `getElementById` | `"self-register-side-copy"` |
| `auth.js:43981` | `initSelfRegisterPage` | `getElementById` | `"self-register-form"` |
| `auth.js:43982` | `initSelfRegisterPage` | `getElementById` | `"self-register-status"` |
| `auth.js:43983` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-student]"` |
| `auth.js:43984` | `initSelfRegisterPage` | `querySelector` | `"[data-self-register-staff]"` |
| `auth.js:43985` | `initSelfRegisterPage` | `getElementById` | `"self-student-level"` |
| `auth.js:43986` | `initSelfRegisterPage` | `getElementById` | `"self-register-submit"` |
| `auth.js:44162` | `initAdminStudentsPage` | `getElementById` | `"portal-student-summary"` |
| `auth.js:44163` | `initAdminStudentsPage` | `getElementById` | `"portal-student-form"` |
| `auth.js:44164` | `initAdminStudentsPage` | `getElementById` | `"portal-student-status"` |
| `auth.js:44165` | `initAdminStudentsPage` | `getElementById` | `"portal-student-list"` |
| `auth.js:44166` | `initAdminStudentsPage` | `getElementById` | `"portal-guardian-list"` |
| `auth.js:44167` | `initAdminStudentsPage` | `querySelector` | `"[data-student-form-toggle]"` |
| `auth.js:44183` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-link"` |
| `auth.js:44184` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-copy]"` |
| `auth.js:44185` | `initAdminStudentsPage` | `querySelector` | `"[data-student-self-registration-open]"` |
| `auth.js:44186` | `initAdminStudentsPage` | `getElementById` | `"student-self-registration-status"` |
| `auth.js:44197` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-summary"` |
| `auth.js:44198` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-form"` |
| `auth.js:44199` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-status"` |
| `auth.js:44200` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-list"` |
| `auth.js:44201` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-summary"` |
| `auth.js:44202` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-list"` |
| `auth.js:44203` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-review-status"` |
| `auth.js:44204` | `initAdminTeachersPage` | `getElementById` | `"portal-staff-leave-status-filter"` |
| `auth.js:44217` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-link"` |
| `auth.js:44218` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-copy]"` |
| `auth.js:44219` | `initAdminTeachersPage` | `querySelector` | `"[data-staff-self-registration-open]"` |
| `auth.js:44220` | `initAdminTeachersPage` | `getElementById` | `"staff-self-registration-status"` |
| `auth.js:44240` | `initAdminClassesPage` | `getElementById` | `"portal-class-summary"` |
| `auth.js:44241` | `initAdminClassesPage` | `getElementById` | `"portal-class-form"` |
| `auth.js:44242` | `initAdminClassesPage` | `getElementById` | `"portal-class-status"` |
| `auth.js:44243` | `initAdminClassesPage` | `getElementById` | `"portal-class-list"` |
| `auth.js:44268` | `initAdminCoursesPage` | `getElementById` | `"portal-course-summary"` |
| `auth.js:44269` | `initAdminCoursesPage` | `getElementById` | `"portal-course-form"` |
| `auth.js:44270` | `initAdminCoursesPage` | `getElementById` | `"portal-course-status"` |
| `auth.js:44271` | `initAdminCoursesPage` | `getElementById` | `"portal-course-list"` |
| `auth.js:44294` | `initAdminSchedulePage` | `getElementById` | `"portal-calendar-summary"` |
| `auth.js:44295` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-form"` |
| `auth.js:44296` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-status"` |
| `auth.js:44297` | `initAdminSchedulePage` | `getElementById` | `"portal-academic-calendar-list"` |
| `auth.js:44299` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-summary"` |
| `auth.js:44300` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-form"` |
| `auth.js:44301` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-status"` |
| `auth.js:44302` | `initAdminSchedulePage` | `getElementById` | `"portal-timetable-list"` |
| `auth.js:44331` | `initAdminFeesPage` | `getElementById` | `"portal-fee-summary"` |
| `auth.js:44332` | `initAdminFeesPage` | `getElementById` | `"portal-fee-form"` |
| `auth.js:44333` | `initAdminFeesPage` | `getElementById` | `"portal-fee-status"` |
| `auth.js:44334` | `initAdminFeesPage` | `getElementById` | `"portal-fee-list"` |
| `auth.js:44335` | `initAdminFeesPage` | `getElementById` | `"portal-fee-setup-notice"` |
| `auth.js:44360` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-summary"` |
| `auth.js:44361` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-status"` |
| `auth.js:44362` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-review-list"` |
| `auth.js:44363` | `initAdminAttendancePage` | `getElementById` | `"portal-attendance-submission-list"` |
| `auth.js:44364` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-view]"` |
| `auth.js:44365` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date]"` |
| `auth.js:44366` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term]"` |
| `auth.js:44367` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-class]"` |
| `auth.js:44368` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-student]"` |
| `auth.js:44369` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status]"` |
| `auth.js:44370` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-search]"` |
| `auth.js:44371` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-date-wrap]"` |
| `auth.js:44372` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-term-wrap]"` |
| `auth.js:44373` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-status-wrap]"` |
| `auth.js:44374` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-review-copy]"` |
| `auth.js:44375` | `initAdminAttendancePage` | `querySelector` | `"[data-attendance-submission-copy]"` |
| `auth.js:44481` | `wireAdminReportParentMessages` | `closest` | `"[data-admin-report-parent-reply-form]"` |
| `auth.js:44505` | `wireAdminReportParentMessages` | `querySelector` | `"button[type='submit']"` |
| `auth.js:44897` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment"` |
| `auth.js:44898` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-session"` |
| `auth.js:44899` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-class"` |
| `auth.js:44900` | `renderEnrollmentReport` | `getElementById` | `"admin-report-enrollment-gender"` |
| `auth.js:44983` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance"` |
| `auth.js:44984` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-session"` |
| `auth.js:44985` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-class"` |
| `auth.js:44986` | `renderAcademicPerformanceReport` | `getElementById` | `"admin-report-performance-subject"` |
| `auth.js:45113` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:45114` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:45115` | `renderAdminAnnouncementSection` | `querySelector` | `"[data-announcement-class-wrap]"` |
| `auth.js:45116` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-class-options"` |
| `auth.js:45117` | `renderAdminAnnouncementSection` | `getElementById` | `"admin-announcement-list"` |
| `auth.js:45124` | `renderAdminAnnouncementSection` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:45324` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-kpis"` |
| `auth.js:45325` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-insights"` |
| `auth.js:45326` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-health"` |
| `auth.js:45327` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-areas"` |
| `auth.js:45328` | `renderAdminReportsDashboard` | `getElementById` | `"admin-report-checklist"` |
| `auth.js:45596` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-form"` |
| `auth.js:45597` | `initAdminAnnouncementComposer` | `getElementById` | `"admin-announcement-status"` |
| `auth.js:45634` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="roleTargets"]:checked'` |
| `auth.js:45639` | `initAdminAnnouncementComposer` | `querySelectorAll` | `'input[name="classTargets"]:checked'` |
| `auth.js:45759` | `initAdminReportsPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:45784` | `initAdminReportsPage` | `getElementById` | `id` |
| `auth.js:45787` | `initAdminReportsPage` | `querySelectorAll` | `"[data-admin-report-export]"` |
| `auth.js:45819` | `initAdminMessagesPage` | `getElementById` | `"admin-report-parent-messages"` |
| `auth.js:45820` | `initAdminMessagesPage` | `querySelector` | `".admin-report-workspace"` |
| `auth.js:45849` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-summary"` |
| `auth.js:45850` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-grid"` |
| `auth.js:45851` | `initAdminFeatureModulesPage` | `getElementById` | `"portal-feature-toggle-status"` |
| `auth.js:45868` | `initReportConfigurationControls` | `querySelector` | `"[data-grading-scale-add]"` |
| `auth.js:45869` | `initReportConfigurationControls` | `querySelector` | `"[data-report-configuration-reset]"` |
| `auth.js:45872` | `initReportConfigurationControls` | `querySelector` | `"[data-score-structure-total]"` |
| `auth.js:45873` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-score-preset]"` |
| `auth.js:45957` | `initReportConfigurationControls` | `querySelector` | `'input[name="minimum"]'` |
| `auth.js:45961` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-remove]"` |
| `auth.js:45963` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:45967` | `initReportConfigurationControls` | `closest` | `"[data-grading-scale-row]"` |
| `auth.js:45987` | `initReportConfigurationControls` | `querySelectorAll` | `"[data-grading-scale-row]"` |
| `auth.js:45988` | `initReportConfigurationControls` | `querySelector` | `'[name="minimum"]'` |
| `auth.js:45989` | `initReportConfigurationControls` | `querySelector` | `'[name="grade"]'` |
| `auth.js:45990` | `initReportConfigurationControls` | `querySelector` | `'[name="remark"]'` |
| `auth.js:46070` | `initReportSchoolCommentControls` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:46351` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-preview"` |
| `auth.js:46352` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-form"` |
| `auth.js:46353` | `initAdminSettingsPage` | `getElementById` | `"portal-school-settings-status"` |
| `auth.js:46354` | `initAdminSettingsPage` | `getElementById` | `"portal-access-summary"` |
| `auth.js:46355` | `initAdminSettingsPage` | `getElementById` | `"portal-access-form"` |
| `auth.js:46356` | `initAdminSettingsPage` | `getElementById` | `"portal-access-status"` |
| `auth.js:46357` | `initAdminSettingsPage` | `getElementById` | `"portal-access-list"` |
| `auth.js:46358` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-summary"` |
| `auth.js:46359` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-grid"` |
| `auth.js:46360` | `initAdminSettingsPage` | `getElementById` | `"portal-role-permission-status"` |
| `auth.js:46361` | `initAdminSettingsPage` | `querySelector` | `"[data-reset-role-permissions]"` |
| `auth.js:46362` | `initAdminSettingsPage` | `querySelector` | `"[data-save-role-permissions]"` |
| `auth.js:46363` | `initAdminSettingsPage` | `getElementById` | `"portal-academic-cycle-summary"` |
| `auth.js:46364` | `initAdminSettingsPage` | `getElementById` | `"portal-session-form"` |
| `auth.js:46365` | `initAdminSettingsPage` | `getElementById` | `"portal-session-status"` |
| `auth.js:46366` | `initAdminSettingsPage` | `getElementById` | `"portal-session-list"` |
| `auth.js:46367` | `initAdminSettingsPage` | `getElementById` | `"portal-term-form"` |
| `auth.js:46368` | `initAdminSettingsPage` | `getElementById` | `"portal-term-status"` |
| `auth.js:46369` | `initAdminSettingsPage` | `getElementById` | `"portal-term-list"` |
| `auth.js:46370` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-form"` |
| `auth.js:46371` | `initAdminSettingsPage` | `getElementById` | `"portal-report-configuration-status"` |
| `auth.js:46372` | `initAdminSettingsPage` | `getElementById` | `"portal-grading-scale-list"` |
| `auth.js:46373` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-form"` |
| `auth.js:46374` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-status"` |
| `auth.js:46375` | `initAdminSettingsPage` | `getElementById` | `"portal-report-school-comment-summary"` |
| `auth.js:46376` | `initAdminSettingsPage` | `querySelector` | `"[data-delete-school-account]"` |
| `auth.js:46377` | `initAdminSettingsPage` | `getElementById` | `"portal-account-delete-status"` |
| `auth.js:46386` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46387` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46388` | `initAdminSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46454` | `initUserSettingsPage` | `getElementById` | `"user-settings-form"` |
| `auth.js:46455` | `initUserSettingsPage` | `getElementById` | `"user-settings-status"` |
| `auth.js:46456` | `initUserSettingsPage` | `getElementById` | `"user-settings-name"` |
| `auth.js:46457` | `initUserSettingsPage` | `getElementById` | `"user-settings-role"` |
| `auth.js:46458` | `initUserSettingsPage` | `getElementById` | `"user-settings-email"` |
| `auth.js:46459` | `initUserSettingsPage` | `getElementById` | `"user-profile-form"` |
| `auth.js:46460` | `initUserSettingsPage` | `getElementById` | `"user-profile-status"` |
| `auth.js:46461` | `initUserSettingsPage` | `getElementById` | `"user-settings-photo-preview"` |
| `auth.js:46462` | `initUserSettingsPage` | `getElementById` | `"user-profile-photo"` |
| `auth.js:46463` | `initUserSettingsPage` | `querySelector` | `"[data-user-profile-remove-photo]"` |
| `auth.js:46464` | `initUserSettingsPage` | `getElementById` | `"user-settings-hint"` |
| `auth.js:46465` | `initUserSettingsPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46466` | `initUserSettingsPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46467` | `initUserSettingsPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46468` | `initUserSettingsPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:46469` | `initUserSettingsPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:46470` | `initUserSettingsPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:46471` | `initUserSettingsPage` | `getElementById` | `"portal-heading"` |
| `auth.js:46472` | `initUserSettingsPage` | `getElementById` | `"portal-copy"` |
| `auth.js:46473` | `initUserSettingsPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:46474` | `initUserSettingsPage` | `getElementById` | `"portal-gate"` |
| `auth.js:46475` | `initUserSettingsPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:46476` | `initUserSettingsPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:46477` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-form"` |
| `auth.js:46478` | `initUserSettingsPage` | `getElementById` | `"user-notification-preferences-status"` |
| `auth.js:46503` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:46506` | `initUserSettingsPage` | `querySelectorAll` | `"input, button"` |
| `auth.js:46576` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:46579` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:46587` | `initUserSettingsPage` | `matches` | `"[data-notification-preference]"` |
| `auth.js:46588` | `initUserSettingsPage` | `closest` | `".portal-toggle-card"` |
| `auth.js:46594` | `initUserSettingsPage` | `querySelectorAll` | `"[data-notification-preference]"` |
| `auth.js:46764` | `initUserSettingsPage` | `closest` | `".admin-surface-card"` |
| `auth.js:46766` | `initUserSettingsPage` | `querySelector` | `'button[type="submit"]'` |
| `auth.js:46962` | `initStaffPortalPages` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:46963` | `initStaffPortalPages` | `getElementById` | `"admin-brand-name"` |
| `auth.js:46964` | `initStaffPortalPages` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:46965` | `initStaffPortalPages` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:46966` | `initStaffPortalPages` | `getElementById` | `"admin-profile-name"` |
| `auth.js:46967` | `initStaffPortalPages` | `getElementById` | `"admin-profile-role"` |
| `auth.js:46968` | `initStaffPortalPages` | `getElementById` | `"portal-heading"` |
| `auth.js:46969` | `initStaffPortalPages` | `getElementById` | `"portal-copy"` |
| `auth.js:46970` | `initStaffPortalPages` | `getElementById` | `"portal-last-updated"` |
| `auth.js:46971` | `initStaffPortalPages` | `getElementById` | `"portal-gate"` |
| `auth.js:46972` | `initStaffPortalPages` | `getElementById` | `"admin-notification-button"` |
| `auth.js:46973` | `initStaffPortalPages` | `getElementById` | `"admin-global-search"` |
| `auth.js:46974` | `initStaffPortalPages` | `getElementById` | `"staff-page-content"` |
| `auth.js:47067` | `initPortalPage` | `getElementById` | `"admin-brand-mark"` |
| `auth.js:47068` | `initPortalPage` | `getElementById` | `"admin-brand-name"` |
| `auth.js:47069` | `initPortalPage` | `getElementById` | `"admin-brand-subtitle"` |
| `auth.js:47070` | `initPortalPage` | `getElementById` | `"admin-profile-avatar"` |
| `auth.js:47071` | `initPortalPage` | `getElementById` | `"admin-profile-name"` |
| `auth.js:47072` | `initPortalPage` | `getElementById` | `"admin-profile-role"` |
| `auth.js:47073` | `initPortalPage` | `getElementById` | `"portal-heading"` |
| `auth.js:47074` | `initPortalPage` | `getElementById` | `"portal-copy"` |
| `auth.js:47075` | `initPortalPage` | `getElementById` | `"portal-last-updated"` |
| `auth.js:47076` | `initPortalPage` | `getElementById` | `"admin-notification-button"` |
| `auth.js:47077` | `initPortalPage` | `getElementById` | `"admin-global-search"` |
| `auth.js:47078` | `initPortalPage` | `getElementById` | `"portal-metrics"` |
| `auth.js:47079` | `initPortalPage` | `getElementById` | `"admin-events"` |
| `auth.js:47080` | `initPortalPage` | `getElementById` | `"admin-activity"` |
| `auth.js:47081` | `initPortalPage` | `getElementById` | `"portal-links"` |
| `auth.js:47082` | `initPortalPage` | `getElementById` | `"portal-details"` |
| `auth.js:47083` | `initPortalPage` | `getElementById` | `"staff-portal-workspace"` |
| `auth.js:47084` | `initPortalPage` | `getElementById` | `"student-portal-workspace"` |
| `auth.js:47085` | `initPortalPage` | `getElementById` | `"teacher-attendance-workspace"` |
| `auth.js:47086` | `initPortalPage` | `getElementById` | `"portal-gate"` |
| `auth.js:47322` | `initPortalPage` | `closest` | `".admin-primary-grid"` |
| `auth.js:47322` | `initPortalPage` | `closest` | `".admin-surface-card"` |
| `auth.js:47336` | `initPortalPage` | `querySelector` | `".admin-sidebar-nav"` |
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
| `auth.js:7912` | `getPageIdFromHref` | `new URL(href, window.location.href)` |
| `auth.js:29319` | `initResetPasswordFlow` | `new URLSearchParams(window.location.search)` |
| `auth.js:29320` | `initResetPasswordFlow` | `params.get("token")` |
| `auth.js:29321` | `initResetPasswordFlow` | `params.get("code")` |
| `auth.js:29333` | `initResetPasswordFlow` | `params.get("type")` |
| `auth.js:29758` | `initConfirmPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:29759` | `initConfirmPage` | `params.get("token")` |
| `auth.js:29829` | `initAdmissionsApplyPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:29830` | `initAdmissionsApplyPage` | `params.get("workspace")` |
| `auth.js:29831` | `initAdmissionsApplyPage` | `params.get("institution")` |
| `auth.js:43139` | `initAdmissionsControls` | `new URL("./admissions-apply.html", window.location.href)` |
| `auth.js:43140` | `initAdmissionsControls` | `linkUrl.searchParams.set("workspace", workspaceId)` |
| `auth.js:43142` | `initAdmissionsControls` | `linkUrl.searchParams.set("institution", institutionId)` |
| `auth.js:43709` | `buildSelfRegistrationUrl` | `new URL("./self-register.html", window.location.href)` |
| `auth.js:43710` | `buildSelfRegistrationUrl` | `url.searchParams.set("type", registrationType)` |
| `auth.js:43711` | `buildSelfRegistrationUrl` | `url.searchParams.set("workspace", getCurrentWorkspaceId())` |
| `auth.js:43978` | `initSelfRegisterPage` | `new URLSearchParams(window.location.search)` |
| `auth.js:43979` | `initSelfRegisterPage` | `params.get("type")` |
| `auth.js:43980` | `initSelfRegisterPage` | `params.get("workspace")` |
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
| `canAccessPermission` | `auth.js:7984-8010` | `DEFAULT_AUTH_ROLE`, `getRolePermissionSnapshot`, `normalizeRoleLabel` |
| `getAdminAccessContext` | `auth.js:9204-9236` | `DEFAULT_AUTH_ROLE`, `clearSession`, `getSession`, `getUsers`, `normalizeRoleLabel` |

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
| `institutions` | `ensureSupabaseInstitutionId` @`auth.js:3793`, `syncInstitutionSnapshot` @`auth.js:3846`, `hydrateSchoolSettingsFromSupabase` @`auth.js:3927`, `initAdmissionsApplyPage` @`auth.js:29911` |
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
| `normalizeSchoolSettings` | `app.js:722-747` | `schoolName`, `logoUrl`, `schoolProfile`, `address`, `campusDetails`, `phone`, `website`, `academicYearStart`, `academicYearEnd`, `schoolTypes`, `higherInstitutionType`, `hasNursery`, `hasPrimary`, `hasSecondary`, `hasHigherInstitution` |
| `normalizeAcademicSession` | `app.js:860-873` | `id`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAcademicTerm` | `app.js:875-893` | `id`, `sessionId`, `periodType`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfigSession` | `app.js:1321-1333` | `id`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfigClass` | `app.js:1335-1344` | `id`, `name`, `status`, `createdAt`, `updatedAt` |
| `normalizeAdmissionConfiguration` | `app.js:1359-1396` | `...spread`, `status`, `sessions`, `classes`, `stages` |
| `normalizeSchoolTimetableEntry` | `app.js:1771-1802` | `id`, `periodId`, `classId`, `classLevel`, `subjectId`, `teacherId`, `roomId`, `sessionId`, `termId`, `day`, `startTime`, `endTime`, `subject`, `teacher`, `room`, `weekType`, `status`, `publishedAt`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeSchoolClass` | `app.js:2338-2372` | `id`, `name`, `level`, `capacity`, `classTeacher`, `arms`, `subjects`, `teacherAssignments`, `status`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeSchoolCourse` | `app.js:2510-2538` | `id`, `name`, `code`, `category`, `creditUnit`, `description`, `level`, `sessionId`, `sessionName`, `termId`, `termName`, `classId`, `classRecordId`, `classLabel`, `classArm`, `classScope`, `teacherAssignments`, `studentAssignments`, `status`, `createdAt`, `updatedAt`, `archivedAt` |
| `normalizeLessonPlanAttachment` | `app.js:2717-2728` | `id`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeLessonPlanRecord` | `app.js:2730-2797` | `id`, `teacherId`, `teacherName`, `teacherEmail`, `subject`, `subjectCode`, `classId`, `classLevel`, `sessionId`, `sessionName`, `termId`, `termName`, `weekNumber`, `planDate`, `planView`, `topic`, `subTopic`, `curriculumTopic`, `syllabusOrder`, `coverageStatus`, `objectives`, `materials`, `teachingMethods`, `classActivities`, `assessment`, `homework`, `remarks`, `reflection`, `delivery`, `attachments`, `status`, `submittedAt`, `deliveredAt`, `createdAt`, `updatedAt` |
| `normalizeLeaveAttachment` | `app.js:2911-2922` | `id`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeStudentProgressionEntry` | `app.js:3081-3090` | `id`, `type`, `fromLevel`, `toLevel`, `note`, `timestamp` |
| `normalizeStudentDocumentRecord` | `app.js:3092-3104` | `id`, `name`, `documentType`, `mimeType`, `sizeBytes`, `dataUrl`, `uploadedBy`, `uploadedAt` |
| `normalizeStudentRecord` | `app.js:3106-3186` | `id`, `firstName`, `lastName`, `fullName`, `admissionNo`, `studentEmail`, `profilePhotoUrl`, `profilePhotoName`, `profilePhotoMimeType`, `profilePhotoSizeBytes`, `profilePhotoRemoved`, `level`, `classId`, `classRecordId`, `classLevel`, `baseLevel`, `classArm`, `dateOfBirth`, `gender`, `guardians`, `progressionHistory`, `documents`, `status`, `promotionDecision`, `examOutcome`, `lastPromotionSessionId`, `lastPromotionOutcome`, `createdAt`, `updatedAt`, `archivedAt`, `transferredAt`, `transferReason` |
| `normalizeAttendanceEntry` | `app.js:3393-3404` | `studentId`, `studentName`, `admissionNo`, `status`, `note` |
| `normalizeAttendanceRecord` | `app.js:3433-3475` | `id`, `date`, `classId`, `lessonId`, `timetableEntryId`, `subject`, `periodId`, `day`, `startTime`, `endTime`, `weekType`, `sessionId`, `termId`, `className`, `level`, `submittedById`, `submittedByEmail`, `submittedByName`, `status`, `entries`, `takenAt`, `createdAt`, `updatedAt` |
| `normalizeReportConfiguration` | `app.js:3619-3662` | `scoreStructure`, `gradingScale`, `template` |
| `normalizeGradebookRecord` | `app.js:3672-3712` | `studentId`, `studentName`, `admissionNo`, `componentScores`, `id`, `classId`, `classLevel`, `subject`, `subjectCode`, `sessionId`, `sessionName`, `termId`, `termName`, `teacherId`, `teacherName`, `components`, `scores`, `createdAt`, `updatedAt` |
| `normalizeReportCardRecord` | `app.js:3842-3870` | `id`, `studentId`, `studentName`, `admissionNo`, `classId`, `classLevel`, `sessionId`, `sessionName`, `termId`, `termName`, `subjects`, `teacherComment`, `schoolComment`, `status`, `createdById`, `createdByName`, `releasedById`, `releasedByName`, `releasedAt`, `createdAt`, `updatedAt` |
| `normalizeAuditTrailEntry` | `app.js:3980-3992` | `id`, `timestamp`, `actorName`, `actorRole`, `action`, `entityType`, `entityId`, `summary`, `details` |
| `normalizeUserRecord` | `auth.js:1427-1437` | `...spread`, `displayName`, `profilePhotoUrl`, `role`, `status`, `mustChangePassword`, `workspaceId` |
| `normalizeNotificationEntry` | `auth.js:2092-2111` | `id`, `title`, `message`, `entityType`, `entityId`, `action`, `actorName`, `createdAt`, `readAt`, `workspaceId`, `visibleToRoles`, `metadata` |
| `normalizeAdmissionFileRecord` | `auth.js:2873-2907` | `id`, `label`, `name`, `type`, `size`, `dataUrl`, `uploadedAt` |
| `normalizeAdmissionRecord` | `auth.js:3021-3092` | `id`, `fullName`, `firstName`, `middleName`, `lastName`, `gender`, `dateOfBirth`, `email`, `studentEmail`, `phone`, `level`, `classApplyingFor`, `previousSchool`, `passportPhotoName`, `passportPhotoFile`, `guardianName`, `guardianFullName`, `guardianRelationship`, `guardianEmail`, `guardianPhone`, `guardianAddress`, `guardianOccupation`, `lastClassAttended`, `academicClassApplyingFor`, `admissionSessionId`, `admissionSessionName`, `applicationStage`, `previousSchoolName`, `previousSchoolAddress`, `healthCondition`, `healthConditionDetails`, `healthAllergies`, `healthMedications`, `docPreviousReportName`, `docPreviousReportFile`, `docBirthCertificateName`, `docBirthCertificateFile`, `docPreviousSchoolResultName`, `docPreviousSchoolResultFile`, `docTransferCertificateName`, `docTransferCertificateFile`, `docPassportPhotographName`, `docPassportPhotographFile`, `docOtherName`, `docOtherFile`, `documents`, `notes`, `status`, `statusNote`, `source`, `createdAt`, `updatedAt`, `reviewedAt`, `reviewedBy`, `convertedStudentId`, `convertedAt`, `workspaceId` |
| `normalizeAccessGrant` | `auth.js:3226-3248` | `id`, `email`, `normalizedEmail`, `username`, `role`, `authMethod`, `status`, `workspaceId`, `createdAt`, `updatedAt`, `claimedAt`, `claimedByUserId` |


## Exact permission/routing declarations

Literal mapping snapshots only; preserve keys and aliases. These are source contracts, not a statement about each role’s deployed grant.

### app.js / ROLE_PERMISSION_ROLES

`app.js:333`

```js
ROLE_PERMISSION_ROLES = ["Teacher", "Parent", "Student"]
```

### app.js / ROLE_PERMISSION_OPTIONS_BY_ROLE

`app.js:334`

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

`app.js:369`

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

`auth.js:39519`

```js
function getParentSelectionStorageKey(user = null) {
    const session = getSession();
    const workspaceId = normalizeWorkspaceId(user?.workspaceId || session?.workspaceId || getCurrentWorkspaceId());
    const userId = String(user?.id || session?.userId || "parent").trim() || "parent";
    return `${PARENT_SELECTION_STORAGE_PREFIX}:${workspaceId}:${userId}`;
  }
```

### getParentFeesStorageKey

`auth.js:39542`

```js
function getParentFeesStorageKey(workspaceId = null) {
    return `${PARENT_FEES_STORAGE_PREFIX}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }
```

## E01 renderer boundary

js/website/why-grid.js contains only the unchanged renderWhyGrid function declaration. It depends on document.getElementById, targetId and items, and writes the same innerHTML. Missing targets return without reading items. It creates no new initializer or side effect at load time. initPageContent remains in app.js:4836 with its two calls at 4837–4838; the single immediate bootstrap call remains at app.js:4854. All 57 app.js consumers include the helper exactly once immediately before app.js, preserving its classic-script global function interface. Browser/HTTP delivery and visual checks remain unverified; local path and syntax checks passed.
