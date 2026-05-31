(function () {
  const STORAGE_KEYS = {
    users: "schoolsphere.users.v1",
    mail: "schoolsphere.mail.v1",
    persistentSession: "schoolsphere.session.persistent.v1",
    transientSession: "schoolsphere.session.transient.v1",
  };
  const SUPABASE_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const SUPABASE_STORAGE_KEY = "schoolsphere.supabase.auth.v1";
  const ADMIN_SIDEBAR_STATE_KEY = "schoolsphere.admin.sidebar.collapsed.v1";
  const AUTH_PERSIST_LOCAL_KEY = "schoolsphere.auth.persistence.local.v1";
  const AUTH_PERSIST_SESSION_KEY = "schoolsphere.auth.persistence.session.v1";
  const AUTH_PENDING_ROLE_KEY = "schoolsphere.auth.pending.role.v1";
  const ACCESS_GRANTS_STORAGE_KEY = "schoolsphere.access.grants.v1";
  const ACCESS_GUARD_NOTICE_KEY = "schoolsphere.access.guard.notice.v1";
  const ACCESS_GRANTS_EVENT_NAME = "schoolsphere:access-grants:updated";
  const NOTIFICATION_STORAGE_PREFIX = "schoolsphere.notifications.v1";
  const NOTIFICATION_EVENT_NAME = "schoolsphere:notifications:updated";
  const FORM_DRAFT_STORAGE_PREFIX = "schoolsphere.form-draft.v1";
  const NETWORK_RESILIENCE_BANNER_ID = "network-resilience-banner";
  const STUDENT_STORAGE_KEY_BASE = "schoolsphere.students.v1";
  const AUTH_ROLES = ["Admin", "Teacher", "Student", "Parent"];
  const PARENT_SELECTION_STORAGE_PREFIX = "schoolsphere.parent.selected-child.v1";
  const PARENT_FEES_STORAGE_PREFIX = "schoolsphere.parent.fees.v1";
  const PARENT_FEES_EVENT_NAME = "schoolsphere:parent-fees:updated";
  const FEE_CATEGORY_FALLBACK = "fees";
  const FEE_CATEGORY_OPTIONS = Object.freeze([
    {
      value: "fees",
      label: "Fees",
      copy: "Tuition, development levies, PTA, and core school charges.",
    },
    {
      value: "uniform",
      label: "Uniform",
      copy: "Uniform sets, sportswear, cardigans, and related wear.",
    },
    {
      value: "books",
      label: "Books",
      copy: "Textbooks, workbooks, notebooks, and learning materials.",
    },
    {
      value: "transport",
      label: "Transport",
      copy: "Bus, shuttle, and route-based transport charges.",
    },
    {
      value: "exam",
      label: "Exam",
      copy: "Examination, assessment, practical, or external exam fees.",
    },
    {
      value: "boarding",
      label: "Boarding",
      copy: "Hostel, accommodation, feeding, and boarding support.",
    },
    {
      value: "other",
      label: "Other",
      copy: "Any school-approved charge outside the standard categories.",
    },
  ]);
  const ADMISSIONS_STORAGE_KEY_BASE = "schoolsphere.admissions.v1";
  const ADMISSIONS_EVENT_NAME = "schoolsphere:admissions:updated";
  const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"];
  const ROLE_HOME_ROUTES = {
    Admin: "./portal.html",
    Teacher: "./portal.html",
    Student: "./portal.html",
    Parent: "./parent-portal.html",
  };
  const PARENT_PAGE_ROUTES = {
    "parent-portal": "./parent-portal.html",
    "parent-teachers": "./parent-teachers.html",
    "parent-courses": "./parent-courses.html",
    "parent-attendance": "./parent-attendance.html",
    "parent-fees": "./parent-fees.html",
    "parent-reports": "./parent-reports.html",
  };
  let supabaseClientPromise = null;

  const DASHBOARD_SECTION_LINKS = [
    {
      label: "Students",
      href: "./admin-students.html",
      permissionKey: "students_manage",
      copy: "Open the student records page for admissions, guardian links, and roster checks.",
    },
    {
      label: "Admissions",
      href: "./admin-admissions.html",
      permissionKey: "students_manage",
      copy: "Review, shortlist, reject, or approve incoming student applications in one queue.",
    },
    {
      label: "Classes",
      href: "./admin-classes.html",
      permissionKey: "classes_manage",
      copy: "Create classes, configure arms and subjects, and assign teachers in one flow.",
    },
    {
      label: "Courses",
      href: "./admin-courses.html",
      permissionKey: "courses_manage",
      copy: "Define course catalog, manage codes and levels, and control teacher assignment from one source.",
    },
    {
      label: "Teachers",
      href: "./admin-teachers.html",
      permissionKey: "teachers_manage",
      copy: "Review staff deployment, homeroom assignment, and teaching coverage.",
    },
    {
      label: "Schedule",
      href: "./admin-schedule.html",
      permissionKey: "classes_manage",
      copy: "Manage timetable windows, period times, and class-day sequencing.",
    },
    {
      label: "Fees",
      href: "./admin-fees.html",
      permissionKey: "fees_manage",
      copy: "Configure fee items by class, term, and session from one billing registry.",
    },
    {
      label: "Attendance",
      href: "./admin-attendance.html",
      permissionKey: "attendance_manage",
      copy: "Track daily attendance snapshots, exceptions, and follow-up actions.",
    },
    {
      label: "Reports",
      href: "./admin-reports.html",
      permissionKey: "reports_view",
      copy: "Review printable summaries, exports, and school-wide reporting outputs.",
    },
    {
      label: "Settings",
      href: "./admin-settings.html",
      permissionKey: "settings_manage",
      copy: "Update school profile, logo, campus details, and structure settings.",
    },
  ];

  const PAGE_PERMISSION_KEYS = {
    portal: "dashboard_view",
    "admin-students": "students_manage",
    "admin-admissions": "students_manage",
    "admin-teachers": "teachers_manage",
    "admin-classes": "classes_manage",
    "admin-courses": "courses_manage",
    "admin-schedule": "classes_manage",
    "admin-fees": "fees_manage",
    "admin-attendance": "attendance_manage",
    "admin-reports": "reports_view",
    "admin-feature-modules": "settings_manage",
    "admin-settings": "settings_manage",
    "admin-settings-school": "settings_manage",
    "admin-settings-access": "settings_manage",
    "admin-settings-roles": "settings_manage",
    "admin-settings-academic": "settings_manage",
    "user-settings": "dashboard_view",
  };

  const ADMIN_SETTINGS_PAGES = new Set([
    "admin-settings",
    "admin-settings-school",
    "admin-settings-access",
    "admin-settings-roles",
    "admin-settings-academic",
  ]);

  const DASHBOARD_EVENT_ITEMS = [
    {
      time: "Pending",
      title: "Staff Meeting",
      location: "Main Hall",
      tone: "amber",
      action: "Details",
    },
    {
      time: "Pending",
      title: "Parent-Teacher Conference",
      location: "Room 102",
      tone: "blue",
      action: "Details",
    },
    {
      time: "Pending",
      title: "Science Fair Prep",
      location: "Gymnasium",
      tone: "green",
      action: "Details",
    },
    {
      time: "Pending",
      title: "Bus Departure",
      location: "Front Gates",
      tone: "gold",
      action: "Details",
    },
  ];

  const DASHBOARD_ACTIVITY_ITEMS = [
    {
      person: "Mr. Davis",
      accent: "Math 101",
      message: "submitted grades for",
      timeAgo: "Recently",
      tone: "blue",
    },
    {
      person: "Mrs. Smith",
      accent: "Tommy Hill",
      message: "marked absent:",
      timeAgo: "Recently",
      tone: "violet",
    },
    {
      person: "Admin",
      accent: "Lunch Menu",
      message: "published new",
      timeAgo: "Recently",
      tone: "green",
    },
    {
      person: "Coach T.",
      accent: "Main Field",
      message: "reserved",
      timeAgo: "Recently",
      tone: "amber",
    },
  ];

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const DEFAULT_AUTH_ROLE = "Admin";
  const GUARDIAN_RELATIONSHIP_TYPES = [
    "Mother",
    "Father",
    "Guardian",
    "Grandparent",
    "Aunt",
    "Uncle",
    "Sibling",
    "Sponsor",
    "Other",
  ];
  const STUDENT_LIST_PREVIEW_COUNT = 5;
  const DEFAULT_PARENT_PASSWORD = "Parent@123";
  const DEFAULT_STAFF_PASSWORD = "Staff@123";
  const WORKSPACE_SCOPED_STATE_KEYS = Object.freeze([
    "schoolsphere.schoolSettings.v1",
    "schoolsphere.academicCycles.v1",
    "schoolsphere.academicCalendar.v1",
    "schoolsphere.admissionConfig.v1",
    "schoolsphere.timetable.v1",
    "schoolsphere.timetable.periods.v1",
    "schoolsphere.timetable.rooms.v1",
    "schoolsphere.timetable.substitutions.v1",
    "schoolsphere.feeItems.v1",
    "schoolsphere.classes.v1",
    "schoolsphere.courses.v1",
    "schoolsphere.students.v1",
    "schoolsphere.attendance.v1",
    "schoolsphere.featureModules.v1",
    "schoolsphere.rolePermissions.v1",
    "schoolsphere.auditTrail.v1",
  ]);
  const SUPABASE_STATE_KEY_FEATURE_MODULES = "schoolsphere.featureModules.v1";
  const SUPABASE_STATE_KEY_ROLE_PERMISSIONS = "schoolsphere.rolePermissions.v1";
  const SUPABASE_STATE_KEY_SCHOOL_SETTINGS = "schoolsphere.schoolSettings.v1";
  const SUPABASE_STATE_KEY_CLASSES = "schoolsphere.classes.v1";
  const SUPABASE_STATE_KEY_COURSES = "schoolsphere.courses.v1";
  const SUPABASE_STATE_KEY_STUDENTS = "schoolsphere.students.v1";
  const SUPABASE_STATE_KEY_ATTENDANCE = "schoolsphere.attendance.v1";
  const SUPABASE_STATE_KEY_FEE_ITEMS = "schoolsphere.feeItems.v1";
  const SUPABASE_STATE_KEY_ACADEMIC_CYCLES = "schoolsphere.academicCycles.v1";
  const SUPABASE_STATE_KEY_ADMISSION_CONFIG = "schoolsphere.admissionConfig.v1";
  const SUPABASE_STATE_KEY_ACADEMIC_CALENDAR = "schoolsphere.academicCalendar.v1";
  const SUPABASE_STATE_KEY_TIMETABLE = "schoolsphere.timetable.v1";
  const SUPABASE_STATE_KEY_TIMETABLE_PERIODS = "schoolsphere.timetable.periods.v1";
  const SUPABASE_STATE_KEY_TIMETABLE_ROOMS = "schoolsphere.timetable.rooms.v1";
  const SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS = "schoolsphere.timetable.substitutions.v1";
  const SUPABASE_STATE_KEY_ADMISSIONS = "schoolsphere.admissions.v1";
  const SUPABASE_STATE_KEY_NOTIFICATIONS = "schoolsphere.notifications.v1";
  const SUPABASE_STATE_KEY_PARENT_FEES = "schoolsphere.parentFees.v1";
  const SUPABASE_STATE_KEY_ACCESS_GRANTS = "schoolsphere.accessGrants.v1";
  const SUPABASE_WORKSPACE_HYDRATE_KEYS = Object.freeze([
    SUPABASE_STATE_KEY_SCHOOL_SETTINGS,
    SUPABASE_STATE_KEY_CLASSES,
    SUPABASE_STATE_KEY_COURSES,
    SUPABASE_STATE_KEY_STUDENTS,
    SUPABASE_STATE_KEY_ATTENDANCE,
    SUPABASE_STATE_KEY_FEE_ITEMS,
    SUPABASE_STATE_KEY_ACADEMIC_CYCLES,
    SUPABASE_STATE_KEY_ADMISSION_CONFIG,
    SUPABASE_STATE_KEY_ACADEMIC_CALENDAR,
    SUPABASE_STATE_KEY_TIMETABLE,
    SUPABASE_STATE_KEY_TIMETABLE_PERIODS,
    SUPABASE_STATE_KEY_TIMETABLE_ROOMS,
    SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS,
    SUPABASE_STATE_KEY_ADMISSIONS,
    SUPABASE_STATE_KEY_NOTIFICATIONS,
    SUPABASE_STATE_KEY_PARENT_FEES,
    SUPABASE_STATE_KEY_ACCESS_GRANTS,
    SUPABASE_STATE_KEY_FEATURE_MODULES,
    SUPABASE_STATE_KEY_ROLE_PERMISSIONS,
  ]);
  let isHydratingWorkspaceStateFromSupabase = false;

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await initSupabaseAuthBridge();
    } catch {
      // Keep the local workspace usable when Supabase auth is slow or temporarily unreachable.
    }

    initConnectionResilienceBanner();
    initAdminSidebarUi();
    initPasswordToggles();
    initRoleButtons();
    initSignupFlow();
    initLoginFlow();
    initGoogleButtons();
    initConfirmPage();
    initPortalPage();
    initParentPages();
    initAdminShellPages();
    initAdminStudentsPage();
    initAdminAdmissionsPage();
    initAdminTeachersPage();
    initAdminClassesPage();
    initAdminCoursesPage();
    initAdminSchedulePage();
    initAdminFeesPage();
    initAdminAttendancePage();
    initAdminReportsPage();
    initAdminFeatureModulesPage();
    initAdminSettingsPage();
    initUserSettingsPage();
    initAdmissionsApplyPage();
    initFormDraftPersistence();
    initSupabaseWorkspaceStateLiveSync();

    hydrateSchoolSettingsFromSupabase().catch(() => {
      // Local settings render first; remote settings refresh when available.
    });
    hydrateWorkspaceStateCollectionsFromSupabase().catch(() => {
      // Workspace data keeps using local storage if the background refresh fails.
    });
  });

  function getPage() {
    return document.body.dataset.page || "";
  }

  function isParentPage(page = getPage()) {
    return String(page || "").startsWith("parent-");
  }

  function getRoleHomeRoute(roleLabel) {
    const normalizedRole = normalizeRoleLabel(roleLabel || DEFAULT_AUTH_ROLE);
    return ROLE_HOME_ROUTES[normalizedRole] || ROLE_HOME_ROUTES.Admin;
  }

  function getPostLoginRoute(roleLabel, user = null) {
    const normalizedRole = normalizeRoleLabel(roleLabel || DEFAULT_AUTH_ROLE);

    if (normalizedRole === "Teacher" && user?.mustChangePassword) {
      return "./user-settings.html";
    }

    return getRoleHomeRoute(normalizedRole);
  }

  function getCurrentRoleHomeRoute() {
    const session = getSession();
    return getRoleHomeRoute(session?.role || DEFAULT_AUTH_ROLE);
  }

  function parseJSON(raw, fallback) {
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function getFormDraftStorageKey(formId) {
    return `${FORM_DRAFT_STORAGE_PREFIX}:${formId}`;
  }

  function writeFormDraft(formId, payload) {
    if (!formId) {
      return;
    }

    try {
      localStorage.setItem(getFormDraftStorageKey(formId), JSON.stringify(payload));
    } catch {
      // If storage quota is exceeded, we keep the form usable without blocking input.
    }
  }

  function readFormDraft(formId) {
    if (!formId) {
      return null;
    }

    try {
      return parseJSON(localStorage.getItem(getFormDraftStorageKey(formId)), null);
    } catch {
      return null;
    }
  }

  function clearFormDraft(formId) {
    if (!formId) {
      return;
    }

    try {
      localStorage.removeItem(getFormDraftStorageKey(formId));
    } catch {
      // Storage access can be restricted in private browsing contexts.
    }
  }

  function clearFormDraftFor(form) {
    if (!form || !form.id) {
      return;
    }

    clearFormDraft(form.id);
  }

  function serializeBasicFormDraft(form) {
    if (!form) {
      return {};
    }

    const draft = {};
    const seenRadioNames = new Set();

    Array.from(form.elements).forEach((field) => {
      if (!(field instanceof HTMLElement) || !("name" in field)) {
        return;
      }

      const name = field.name;

      if (!name) {
        return;
      }

      const type = "type" in field ? String(field.type || "").toLowerCase() : "";

      if (type === "password" || type === "file") {
        return;
      }

      if (type === "radio") {
        if (seenRadioNames.has(name)) {
          return;
        }
        seenRadioNames.add(name);
        const checked = form.querySelector(`input[type="radio"][name="${CSS.escape(name)}"]:checked`);
        draft[name] = checked ? checked.value : "";
        return;
      }

      if (type === "checkbox") {
        draft[name] = Boolean(field.checked);
        return;
      }

      if ("value" in field) {
        draft[name] = field.value;
      }
    });

    return draft;
  }

  async function withNetworkTimeout(promise, timeoutMs = 25000) {
    let timeoutHandle = null;

    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timeoutHandle = window.setTimeout(() => {
            reject(new Error("network_timeout"));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutHandle) {
        window.clearTimeout(timeoutHandle);
      }
    }
  }

  function restoreBasicFormDraft(form, draft = {}) {
    if (!form || !draft || typeof draft !== "object") {
      return;
    }

    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements[name];

      if (!field) {
        return;
      }

      const applyValue = (control) => {
        if (!(control instanceof HTMLElement)) {
          return;
        }

        const type = "type" in control ? String(control.type || "").toLowerCase() : "";

        if (type === "checkbox") {
          control.checked = Boolean(value);
          return;
        }

        if (type === "radio") {
          control.checked = control.value === String(value);
          return;
        }

        if ("value" in control && value !== undefined && value !== null) {
          control.value = String(value);
        }
      };

      if (field instanceof RadioNodeList) {
        Array.from(field).forEach(applyValue);
      } else {
        applyValue(field);
      }
    });
  }

  function setAuthRoleSelection(role) {
    const normalizedRole = normalizeRoleLabel(role);
    let matched = false;

    document.querySelectorAll(".auth-role").forEach((button) => {
      const roleValue = normalizeRoleLabel(button.dataset.authRole || button.textContent || "");
      const isMatch = roleValue === normalizedRole;
      button.classList.toggle("is-active", isMatch);
      if (isMatch) {
        matched = true;
      }
    });

    if (!matched) {
      const defaultButton =
        document.querySelector('.auth-role[data-auth-role="admin"]') ||
        document.querySelector('.auth-role[data-auth-role="super-admin"]');
      if (defaultButton) {
        defaultButton.classList.add("is-active");
      }
    }
  }

  function serializeAuthFormDraft(form) {
    const draft = serializeBasicFormDraft(form);
    draft.__selectedRole = getSelectedRole();
    return draft;
  }

  function restoreAuthFormDraft(form, draft = {}) {
    restoreBasicFormDraft(form, draft);
    if (draft.__selectedRole) {
      setAuthRoleSelection(draft.__selectedRole);
    }
  }

  function serializeSchoolSettingsFormDraft(form) {
    const draft = serializeBasicFormDraft(form);
    draft.__schoolTypes = Array.from(form.querySelectorAll("[data-school-type-option]"))
      .filter((input) => input instanceof HTMLInputElement && input.checked)
      .map((input) => input.value);
    delete draft.schoolTypes;
    return draft;
  }

  function restoreSchoolSettingsFormDraft(form, draft = {}) {
    const { schoolTypes, __schoolTypes, ...basicDraft } = draft;
    restoreBasicFormDraft(form, basicDraft);

    if (Array.isArray(draft.__schoolTypes)) {
      form.querySelectorAll("[data-school-type-option]").forEach((input) => {
        if (input instanceof HTMLInputElement) {
          input.checked = draft.__schoolTypes.includes(input.value);
        }
      });

      const allInput = form.querySelector("[data-school-type-all]");
      const typeInputs = Array.from(form.querySelectorAll("[data-school-type-option]"));
      if (allInput instanceof HTMLInputElement) {
        const checkedCount = typeInputs.filter((input) => input instanceof HTMLInputElement && input.checked).length;
        allInput.checked = checkedCount === typeInputs.length && typeInputs.length > 0;
        allInput.indeterminate = checkedCount > 0 && checkedCount < typeInputs.length;
      }
    }
  }

  function serializeStudentFormDraft(form) {
    const draft = serializeBasicFormDraft(form);
    const guardianList = document.getElementById("portal-guardian-list");

    if (!guardianList) {
      return draft;
    }

    draft.__guardians = Array.from(guardianList.querySelectorAll(".portal-guardian-row")).map((row) => {
      const name = row.querySelector('[data-guardian-field="name"]')?.value.trim() || "";
      const relationshipType = row.querySelector('[data-guardian-field="relationshipType"]')?.value.trim() || "";
      const relationshipOther = row.querySelector('[data-guardian-field="relationshipOther"]')?.value.trim() || "";
      const phone = row.querySelector('[data-guardian-field="phone"]')?.value.trim() || "";
      const email = row.querySelector('[data-guardian-field="email"]')?.value.trim() || "";
      return {
        id: row.dataset.guardianId || createId(),
        name,
        relationship: relationshipType === "Other" ? relationshipOther : relationshipType,
        phone,
        email,
      };
    });

    return draft;
  }

  function restoreStudentFormDraft(form, draft = {}) {
    restoreBasicFormDraft(form, draft);
    const guardianList = document.getElementById("portal-guardian-list");

    if (guardianList && Array.isArray(draft.__guardians) && draft.__guardians.length) {
      guardianList.innerHTML = "";
      draft.__guardians.forEach((guardian) => appendGuardianRow(guardianList, guardian, true));
    }
  }

  function restoreClassFormDraft(form, draft = {}) {
    restoreBasicFormDraft(form, draft);
    const formToggleButton =
      document.querySelector("[data-class-form-toggle]") ||
      document.querySelector("[data-course-form-toggle]") ||
      document.querySelector("[data-calendar-form-toggle]");

    if (form.hidden) {
      form.hidden = false;
      if (formToggleButton) {
        formToggleButton.textContent =
          form.id === "portal-course-form"
            ? "Hide course form"
            : form.id === "portal-academic-calendar-form"
              ? "Hide calendar form"
              : "Hide class form";
        formToggleButton.setAttribute("aria-expanded", "true");
      }
    }
  }

  function initializeDraftForForm(config = {}) {
    const {
      formId,
      serializer = serializeBasicFormDraft,
      restorer = restoreBasicFormDraft,
    } = config;
    const form = document.getElementById(formId);

    if (!form) {
      return;
    }

    const savedDraft = readFormDraft(formId);

    if (savedDraft) {
      restorer(form, savedDraft);
    }

    const persistDraft = () => {
      const payload = serializer(form);
      writeFormDraft(formId, payload);
    };

    form.addEventListener("input", persistDraft);
    form.addEventListener("change", persistDraft);
  }

  function initFormDraftPersistence() {
    [
      { formId: "signup-form", serializer: serializeAuthFormDraft, restorer: restoreAuthFormDraft },
      { formId: "login-form", serializer: serializeAuthFormDraft, restorer: restoreAuthFormDraft },
      {
        formId: "portal-school-settings-form",
        serializer: serializeSchoolSettingsFormDraft,
        restorer: restoreSchoolSettingsFormDraft,
      },
      { formId: "portal-access-form" },
      { formId: "portal-session-form" },
      { formId: "portal-term-form" },
      { formId: "portal-class-form", restorer: restoreClassFormDraft },
      { formId: "portal-course-form", restorer: restoreClassFormDraft },
      { formId: "portal-academic-calendar-form", restorer: restoreClassFormDraft },
      { formId: "portal-student-form", serializer: serializeStudentFormDraft, restorer: restoreStudentFormDraft },
      { formId: "portal-staff-form" },
      { formId: "admissions-apply-form" },
      { formId: "user-settings-form", serializer: serializeAuthFormDraft, restorer: restoreAuthFormDraft },
    ].forEach(initializeDraftForForm);
  }

  function initConnectionResilienceBanner() {
    const banner = document.createElement("div");
    banner.id = NETWORK_RESILIENCE_BANNER_ID;
    banner.className = "network-resilience-banner";
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    banner.hidden = true;
    banner.innerHTML = `
      <span class="network-resilience-banner-message"></span>
      <button class="network-resilience-banner-dismiss" type="button" aria-label="Dismiss message">&times;</button>
    `;
    document.body.appendChild(banner);

    const bannerMessage = banner.querySelector(".network-resilience-banner-message");
    const dismissButton = banner.querySelector(".network-resilience-banner-dismiss");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    let currentState = "clear";
    let dismissedState = null;

    const isSlow = () => {
      if (!connection) {
        return false;
      }

      return (
        connection.saveData === true ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.effectiveType === "3g"
      );
    };

    const renderBannerState = (nextState, message) => {
      currentState = nextState;

      if (nextState === "clear") {
        banner.hidden = true;
        if (bannerMessage) {
          bannerMessage.textContent = "";
        }
        dismissedState = null;
        return;
      }

      if (dismissedState === nextState) {
        banner.hidden = true;
        return;
      }

      if (bannerMessage) {
        bannerMessage.textContent = message;
      }
      banner.hidden = false;
    };

    const updateBanner = () => {
      if (!navigator.onLine) {
        renderBannerState(
          "offline",
          "You are offline. Keep filling forms; your entries are saved locally until you reconnect.",
        );
        return;
      }

      if (isSlow()) {
        renderBannerState(
          "slow",
          "Slow connection detected. Forms remain usable and drafts are auto-saved.",
        );
        return;
      }

      renderBannerState("clear", "");
    };

    if (dismissButton) {
      dismissButton.addEventListener("click", () => {
        dismissedState = currentState;
        banner.hidden = true;
      });
    }

    window.addEventListener("online", updateBanner);
    window.addEventListener("offline", updateBanner);

    if (connection && typeof connection.addEventListener === "function") {
      connection.addEventListener("change", updateBanner);
    }

    updateBanner();
  }

  function getUsers() {
    const records = parseJSON(localStorage.getItem(STORAGE_KEYS.users), []);
    if (!Array.isArray(records)) {
      return [];
    }

    return records.map((record) => normalizeUserRecord(record));
  }

  function saveUsers(users) {
    const normalizedUsers = Array.isArray(users)
      ? users.map((record) => normalizeUserRecord(record))
      : [];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(normalizedUsers));
  }

  function getMailLog() {
    return parseJSON(localStorage.getItem(STORAGE_KEYS.mail), []);
  }

  function saveMailLog(entries) {
    localStorage.setItem(STORAGE_KEYS.mail, JSON.stringify(entries));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.persistentSession);
    sessionStorage.removeItem(STORAGE_KEYS.transientSession);
  }

  function getSession() {
    return (
      parseJSON(sessionStorage.getItem(STORAGE_KEYS.transientSession), null) ||
      parseJSON(localStorage.getItem(STORAGE_KEYS.persistentSession), null)
    );
  }

  function setSession(session, remember) {
    clearSession();

    const targetStorage = remember ? localStorage : sessionStorage;
    const key = remember ? STORAGE_KEYS.persistentSession : STORAGE_KEYS.transientSession;
    const normalizedSession = {
      ...session,
      workspaceId: normalizeWorkspaceId(session?.workspaceId || session?.userId || session?.email),
    };

    targetStorage.setItem(key, JSON.stringify(normalizedSession));
  }

  function setAuthPersistencePreference(remember) {
    if (remember) {
      localStorage.setItem(AUTH_PERSIST_LOCAL_KEY, "persistent");
      sessionStorage.removeItem(AUTH_PERSIST_SESSION_KEY);
      return;
    }

    sessionStorage.setItem(AUTH_PERSIST_SESSION_KEY, "session");
    localStorage.removeItem(AUTH_PERSIST_LOCAL_KEY);
  }

  function getAuthPersistencePreference() {
    if (sessionStorage.getItem(AUTH_PERSIST_SESSION_KEY) === "session") {
      return "session";
    }

    if (localStorage.getItem(AUTH_PERSIST_LOCAL_KEY) === "persistent") {
      return "persistent";
    }

    return "persistent";
  }

  function rememberPendingRole(role) {
    sessionStorage.setItem(AUTH_PENDING_ROLE_KEY, normalizeRoleLabel(role));
  }

  function consumePendingRole() {
    const role = sessionStorage.getItem(AUTH_PENDING_ROLE_KEY);

    if (role) {
      sessionStorage.removeItem(AUTH_PENDING_ROLE_KEY);
    }

    return role;
  }

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  function normalizeWorkspaceId(rawWorkspaceId) {
    const normalized = String(rawWorkspaceId || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || "public";
  }

  function deriveWorkspaceIdFromRecord(record = {}) {
    if (record.workspaceId) {
      return normalizeWorkspaceId(record.workspaceId);
    }

    const role = normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE);
    const normalizedEmail = String(record.normalizedEmail || "").trim();

    if (role === "Admin") {
      return normalizeWorkspaceId(
        normalizedEmail || (record.email ? normalizeEmail(record.email) : "") || record.id || "admin",
      );
    }

    return normalizeWorkspaceId(record.id || normalizedEmail || (record.email ? normalizeEmail(record.email) : ""));
  }

  function normalizeRoleLabel(rawRole) {
    const normalized = String(rawRole || "")
      .trim()
      .toLowerCase();

    if (normalized === "system" || normalized === "guest") {
      return "System";
    }

    if (normalized === "administrator" || normalized === "admin") {
      return "Admin";
    }

    if (normalized === "employee" || normalized === "staff" || normalized === "teacher") {
      return "Teacher";
    }

    if (normalized === "student" || normalized === "learner") {
      return "Student";
    }

    if (normalized === "parent" || normalized === "guardian") {
      return "Parent";
    }

    return DEFAULT_AUTH_ROLE;
  }

  function normalizeUserStatus(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();
    return normalized === "deactivated" || normalized === "inactive" || normalized === "disabled"
      ? "deactivated"
      : "active";
  }

  function normalizeUserRecord(record = {}) {
    return {
      ...record,
      role: normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE),
      status: normalizeUserStatus(record.status),
      mustChangePassword: Boolean(record.mustChangePassword),
      workspaceId: deriveWorkspaceIdFromRecord(record),
    };
  }

  function isUserDeactivated(user) {
    return normalizeUserStatus(user?.status) === "deactivated";
  }

  function getCurrentWorkspaceId() {
    const session = getSession();
    if (session?.workspaceId) {
      return normalizeWorkspaceId(session.workspaceId);
    }

    if (session?.userId) {
      const user = getUsers().find((entry) => entry.id === session.userId);
      if (user?.workspaceId) {
        return normalizeWorkspaceId(user.workspaceId);
      }
    }

    return "public";
  }

  function parseWorkspaceIdFromScopedStorageKey(key, baseKey) {
    const normalizedKey = String(key || "");
    const prefix = `${baseKey}::`;

    if (!normalizedKey.startsWith(prefix)) {
      return null;
    }

    return normalizeWorkspaceId(normalizedKey.slice(prefix.length));
  }

  function discoverParentWorkspaceByGuardianEmail(parentEmail) {
    const normalizedParentEmail = normalizeEmail(parentEmail || "");

    if (!normalizedParentEmail) {
      return null;
    }

    const matches = new Map();

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const workspaceId =
        key === STUDENT_STORAGE_KEY_BASE
          ? "public"
          : parseWorkspaceIdFromScopedStorageKey(key, STUDENT_STORAGE_KEY_BASE);

      if (!workspaceId) {
        continue;
      }

      const records = parseJSON(localStorage.getItem(key), []);

      if (!Array.isArray(records)) {
        continue;
      }

      let hitCount = 0;
      records.forEach((record) => {
        const guardians = Array.isArray(record?.guardians) ? record.guardians : [];
        const isLinked = guardians.some(
          (guardian) =>
            normalizeEmail(String(guardian?.email || "").trim()) === normalizedParentEmail,
        );

        if (isLinked) {
          hitCount += 1;
        }
      });

      if (hitCount > 0) {
        matches.set(workspaceId, (matches.get(workspaceId) || 0) + hitCount);
      }
    }

    if (!matches.size) {
      return null;
    }

    return Array.from(matches.entries())
      .sort((left, right) => right[1] - left[1])[0][0];
  }

  function alignParentWorkspaceFromGuardianLink(user, session) {
    if (!user || normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) !== "Parent") {
      return user;
    }

    const discoveredWorkspaceId = discoverParentWorkspaceByGuardianEmail(user.email);

    if (!discoveredWorkspaceId) {
      return user;
    }

    const currentWorkspaceId = normalizeWorkspaceId(user.workspaceId || session?.workspaceId || "public");

    if (currentWorkspaceId === discoveredWorkspaceId) {
      return user;
    }

    const updatedUser = updateUser(user.id, (record) => ({
      ...record,
      workspaceId: discoveredWorkspaceId,
    }));

    const remember = (session?.persistence || "persistent") !== "session";
    setSession(
      {
        ...session,
        workspaceId: discoveredWorkspaceId,
      },
      remember,
    );

    const allGrants = getAccessGrants({ allWorkspaces: true });
    const normalizedEmail = normalizeEmail(user.email || "");
    const updatedGrants = allGrants.map((grant) => {
      if (
        normalizeEmail(grant.email || "") === normalizedEmail &&
        normalizeRoleLabel(grant.role || DEFAULT_AUTH_ROLE) === "Parent"
      ) {
        return normalizeAccessGrant({
          ...grant,
          workspaceId: discoveredWorkspaceId,
          updatedAt: nowIso(),
        }, discoveredWorkspaceId);
      }

      return grant;
    });
    saveAccessGrants(updatedGrants, { allWorkspaces: true });

    return updatedUser || user;
  }

  function getNotificationStorageKey(workspaceId = null) {
    return `${NOTIFICATION_STORAGE_PREFIX}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }

  function normalizeNotificationRoles(roles, fallback = ["Admin"]) {
    const source = Array.isArray(roles) ? roles : [roles];
    const normalized = source
      .map((role) => normalizeRoleLabel(role))
      .filter((role) => AUTH_ROLES.includes(role));

    if (!normalized.length) {
      return [...fallback];
    }

    return Array.from(new Set(normalized));
  }

  function getNotificationAudience(entry = {}) {
    if (entry.visibleToRoles) {
      return normalizeNotificationRoles(entry.visibleToRoles, AUTH_ROLES);
    }

    const entityType = String(entry.entityType || "system")
      .trim()
      .toLowerCase();

    const explicitTargetRole = entry.targetRole ? normalizeRoleLabel(entry.targetRole) : null;
    if (explicitTargetRole && AUTH_ROLES.includes(explicitTargetRole)) {
      return explicitTargetRole === "Admin"
        ? ["Admin"]
        : normalizeNotificationRoles(["Admin", explicitTargetRole], ["Admin"]);
    }

    if (
      entityType === "student" ||
      entityType === "attendance" ||
      entityType === "class" ||
      entityType === "course" ||
      entityType === "calendar" ||
      entityType === "result" ||
      entityType === "assignment" ||
      entityType === "activity"
    ) {
      return ["Admin", "Teacher", "Student", "Parent"];
    }

    if (
      entityType === "teacher" ||
      entityType === "staff-account" ||
      entityType === "staff" ||
      entityType === "timetable"
    ) {
      return ["Admin", "Teacher"];
    }

    if (
      entityType === "parent" ||
      entityType === "guardian"
    ) {
      return ["Admin", "Parent"];
    }

    if (
      entityType === "parent-account" ||
      entityType === "role-permission" ||
      entityType === "feature-module" ||
      entityType === "access-grant" ||
      entityType === "school-settings" ||
      entityType === "academic-cycle" ||
      entityType === "user-password" ||
      entityType === "system"
    ) {
      return ["Admin"];
    }

    return ["Admin"];
  }

  function filterNotificationsByRole(notifications = [], roleLabel = DEFAULT_AUTH_ROLE) {
    const role = normalizeRoleLabel(roleLabel || DEFAULT_AUTH_ROLE);

    if (!AUTH_ROLES.includes(role)) {
      return [];
    }

    if (role === "Admin") {
      return notifications;
    }

    return notifications.filter((entry) => {
      const audience = normalizeNotificationRoles(entry.visibleToRoles, ["Admin"]);
      return audience.includes(role);
    });
  }

  function normalizeNotificationEntry(entry = {}, workspaceId = null) {
    const visibleToRoles = getNotificationAudience(entry);

    return {
      id: String(entry.id || createId()),
      title: String(entry.title || entry.summary || "System activity").trim(),
      message: String(entry.message || entry.details || "").trim(),
      entityType: String(entry.entityType || "system").trim(),
      entityId: String(entry.entityId || "").trim(),
      action: String(entry.action || "updated").trim(),
      actorName: String(entry.actorName || "System").trim(),
      createdAt: entry.createdAt || entry.timestamp || nowIso(),
      readAt: String(entry.readAt || "").trim(),
      workspaceId: normalizeWorkspaceId(workspaceId || entry.workspaceId || getCurrentWorkspaceId()),
      visibleToRoles,
    };
  }

  function getNotifications(workspaceId = null) {
    const storageKey = getNotificationStorageKey(workspaceId);
    const stored = parseJSON(localStorage.getItem(storageKey), []);

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored
      .map((entry) => normalizeNotificationEntry(entry, workspaceId))
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }

  function saveNotifications(entries, workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const storageKey = getNotificationStorageKey(normalizedWorkspaceId);
    const normalizedEntries = Array.isArray(entries)
      ? entries.map((entry) => normalizeNotificationEntry(entry, normalizedWorkspaceId))
      : [];
    localStorage.setItem(storageKey, JSON.stringify(normalizedEntries.slice(0, 120)));
    return normalizedEntries;
  }

  function pushNotification(entry = {}, workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || entry.workspaceId || getCurrentWorkspaceId());
    const nextEntry = normalizeNotificationEntry(entry, normalizedWorkspaceId);
    const existing = getNotifications(normalizedWorkspaceId);
    const next = [nextEntry, ...existing.filter((item) => item.id !== nextEntry.id)].slice(0, 120);
    saveNotifications(next, normalizedWorkspaceId);
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT_NAME, {
        detail: {
          workspaceId: normalizedWorkspaceId,
        },
      }),
    );
    return nextEntry;
  }

  function isNotificationUnread(entry = {}) {
    return !String(entry.readAt || "").trim();
  }

  function markNotificationsRead(notificationIds = [], workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const idSet = new Set(notificationIds.map((id) => String(id || "").trim()).filter(Boolean));

    if (!idSet.size) {
      return false;
    }

    const timestamp = nowIso();
    let changed = false;
    const nextNotifications = getNotifications(normalizedWorkspaceId).map((entry) => {
      if (!idSet.has(entry.id) || entry.readAt) {
        return entry;
      }
      changed = true;
      return {
        ...entry,
        readAt: timestamp,
      };
    });

    if (!changed) {
      return false;
    }

    saveNotifications(nextNotifications, normalizedWorkspaceId);
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT_NAME, {
        detail: {
          workspaceId: normalizedWorkspaceId,
        },
      }),
    );
    return true;
  }

  function getAccessGuardNotice() {
    const notice = sessionStorage.getItem(ACCESS_GUARD_NOTICE_KEY);

    if (notice) {
      sessionStorage.removeItem(ACCESS_GUARD_NOTICE_KEY);
    }

    return notice;
  }

  function setAccessGuardNotice(message) {
    if (!message) {
      sessionStorage.removeItem(ACCESS_GUARD_NOTICE_KEY);
      return;
    }

    sessionStorage.setItem(ACCESS_GUARD_NOTICE_KEY, message);
  }

  function getAdmissionsStorageKey(workspaceId = null) {
    return `${ADMISSIONS_STORAGE_KEY_BASE}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }

  function normalizeAdmissionStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (
      normalized === "review" ||
      normalized === "shortlisted" ||
      normalized === "rejected" ||
      normalized === "approved"
    ) {
      return normalized;
    }

    return "pending";
  }

  function composeAdmissionFullName(record = {}) {
    const direct = String(record.fullName || "").trim();

    if (direct) {
      return direct;
    }

    return [
      String(record.firstName || "").trim(),
      String(record.middleName || "").trim(),
      String(record.lastName || "").trim(),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function normalizeAdmissionRecord(record = {}, workspaceId = null) {
    const classApplyingFor = String(record.classApplyingFor || record.level || "").trim();
    const academicClassApplyingFor = String(
      record.academicClassApplyingFor || record.classApplyingFor || record.level || "",
    ).trim();
    const guardianFullName = String(record.guardianFullName || record.guardianName || "").trim();
    const guardianEmail = String(record.guardianEmail || "").trim();

    return {
      id: String(record.id || createId()),
      fullName: composeAdmissionFullName(record),
      firstName: String(record.firstName || "").trim(),
      middleName: String(record.middleName || "").trim(),
      lastName: String(record.lastName || "").trim(),
      gender: String(record.gender || "").trim(),
      dateOfBirth: String(record.dateOfBirth || "").trim(),
      email: String(record.email || "").trim(),
      phone: String(record.phone || "").trim(),
      level: String(record.level || classApplyingFor || academicClassApplyingFor).trim(),
      classApplyingFor,
      previousSchool: String(record.previousSchool || record.previousSchoolName || "").trim(),
      passportPhotoName: String(record.passportPhotoName || "").trim(),
      guardianName: guardianFullName,
      guardianFullName,
      guardianRelationship: String(record.guardianRelationship || "").trim(),
      guardianEmail,
      guardianPhone: String(record.guardianPhone || "").trim(),
      guardianAddress: String(record.guardianAddress || "").trim(),
      guardianOccupation: String(record.guardianOccupation || "").trim(),
      lastClassAttended: String(record.lastClassAttended || "").trim(),
      academicClassApplyingFor,
      admissionSessionId: String(record.admissionSessionId || "").trim(),
      admissionSessionName: String(record.admissionSessionName || "").trim(),
      applicationStage: String(record.applicationStage || "").trim(),
      previousSchoolName: String(record.previousSchoolName || "").trim(),
      previousSchoolAddress: String(record.previousSchoolAddress || "").trim(),
      healthCondition: String(record.healthCondition || "").trim(),
      healthConditionDetails: String(record.healthConditionDetails || "").trim(),
      healthAllergies: String(record.healthAllergies || "").trim(),
      healthMedications: String(record.healthMedications || "").trim(),
      docPreviousReportName: String(record.docPreviousReportName || "").trim(),
      docBirthCertificateName: String(record.docBirthCertificateName || "").trim(),
      docPreviousSchoolResultName: String(record.docPreviousSchoolResultName || "").trim(),
      docTransferCertificateName: String(record.docTransferCertificateName || "").trim(),
      docPassportPhotographName: String(record.docPassportPhotographName || "").trim(),
      docOtherName: String(record.docOtherName || "").trim(),
      notes: String(record.notes || "").trim(),
      status: normalizeAdmissionStatus(record.status),
      statusNote: String(record.statusNote || "").trim(),
      source: String(record.source || "web").trim(),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || nowIso(),
      reviewedAt: record.reviewedAt || null,
      reviewedBy: String(record.reviewedBy || "").trim(),
      convertedStudentId: String(record.convertedStudentId || "").trim(),
      convertedAt: String(record.convertedAt || "").trim(),
      workspaceId: normalizeWorkspaceId(workspaceId || record.workspaceId || getCurrentWorkspaceId()),
    };
  }

  function getAdmissions(workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const stored = parseJSON(localStorage.getItem(getAdmissionsStorageKey(normalizedWorkspaceId)), []);

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored
      .map((record) => normalizeAdmissionRecord(record, normalizedWorkspaceId))
      .filter((record) => record.fullName && (record.level || record.classApplyingFor || record.academicClassApplyingFor))
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }

  function saveAdmissions(records, workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const normalized = Array.isArray(records)
      ? records.map((record) => normalizeAdmissionRecord(record, normalizedWorkspaceId))
      : [];
    localStorage.setItem(getAdmissionsStorageKey(normalizedWorkspaceId), JSON.stringify(normalized));
    window.dispatchEvent(
      new CustomEvent(ADMISSIONS_EVENT_NAME, {
        detail: { workspaceId: normalizedWorkspaceId },
      }),
    );
    return normalized;
  }

  function upsertAdmission(record = {}, workspaceId = null) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || record.workspaceId || getCurrentWorkspaceId());
    const admissions = getAdmissions(normalizedWorkspaceId);
    const nextRecord = normalizeAdmissionRecord(
      {
        ...record,
        updatedAt: nowIso(),
      },
      normalizedWorkspaceId,
    );
    const index = admissions.findIndex((entry) => entry.id === nextRecord.id);

    if (index >= 0) {
      admissions[index] = {
        ...admissions[index],
        ...nextRecord,
        createdAt: admissions[index].createdAt,
      };
    } else {
      admissions.unshift(nextRecord);
    }

    return saveAdmissions(admissions, normalizedWorkspaceId);
  }

  function setAdmissionStatus(admissionId, status, options = {}) {
    const normalizedWorkspaceId = normalizeWorkspaceId(options.workspaceId || getCurrentWorkspaceId());
    const normalizedStatus = normalizeAdmissionStatus(status);
    const admissions = getAdmissions(normalizedWorkspaceId);
    const index = admissions.findIndex((entry) => entry.id === admissionId);

    if (index < 0) {
      return null;
    }

    const reviewedBy = String(options.reviewedBy || "").trim();
    const statusNote = String(options.statusNote || "").trim();
    const applicationStage = String(options.applicationStage || "").trim();
    admissions[index] = normalizeAdmissionRecord(
      {
        ...admissions[index],
        status: normalizedStatus,
        applicationStage:
          applicationStage ||
          (normalizedStatus === "review"
            ? "Review"
            : normalizedStatus === "shortlisted"
              ? "Shortlisted"
              : normalizedStatus === "rejected"
                ? "Rejected"
                : normalizedStatus === "approved"
                  ? "Approved"
                  : admissions[index].applicationStage || "Submitted"),
        statusNote,
        reviewedBy,
        reviewedAt: nowIso(),
        updatedAt: nowIso(),
      },
      normalizedWorkspaceId,
    );
    saveAdmissions(admissions, normalizedWorkspaceId);
    return admissions[index];
  }

  function normalizeAccessMethod(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === "password") {
      return "password";
    }

    if (normalized === "google") {
      return "google";
    }

    return "any";
  }

  function normalizeAccessStatus(value) {
    return String(value || "").trim().toLowerCase() === "revoked" ? "revoked" : "active";
  }

  function inferAccessGrantWorkspaceId(record = {}) {
    const normalizedEmail = normalizeEmail(record.email || record.normalizedEmail || "");

    if (!normalizedEmail) {
      return null;
    }

    const matchedUser = getUsers().find((user) => user.normalizedEmail === normalizedEmail);

    if (matchedUser?.workspaceId) {
      return normalizeWorkspaceId(matchedUser.workspaceId);
    }

    const role = normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE);

    if (role === "Admin") {
      return normalizeWorkspaceId(normalizedEmail);
    }

    return null;
  }

  function normalizeAccessGrant(record = {}, workspaceIdOverride = null) {
    const timestamp = nowIso();
    const resolvedWorkspaceId =
      workspaceIdOverride ||
      record.workspaceId ||
      inferAccessGrantWorkspaceId(record) ||
      "public";

    return {
      id: String(record.id || createId()),
      email: String(record.email || "").trim(),
      normalizedEmail: normalizeEmail(record.email || record.normalizedEmail || ""),
      role: normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE),
      authMethod: normalizeAccessMethod(record.authMethod),
      status: normalizeAccessStatus(record.status),
      workspaceId: normalizeWorkspaceId(resolvedWorkspaceId),
      createdAt: record.createdAt || timestamp,
      updatedAt: record.updatedAt || timestamp,
      claimedAt: record.claimedAt || null,
      claimedByUserId: record.claimedByUserId || null,
    };
  }

  function getAccessGrants(options = {}) {
    const hasSession = Boolean(getSession());
    const normalizedWorkspaceId = options.workspaceId
      ? normalizeWorkspaceId(options.workspaceId)
      : hasSession && !options.allWorkspaces
        ? normalizeWorkspaceId(getCurrentWorkspaceId())
        : null;
    const stored = parseJSON(localStorage.getItem(ACCESS_GRANTS_STORAGE_KEY), []);

    if (!Array.isArray(stored)) {
      return [];
    }

    const normalized = stored
      .map((record) => normalizeAccessGrant(record))
      .filter((record) => record.email && record.normalizedEmail)
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));

    if (!normalizedWorkspaceId) {
      return normalized;
    }

    return normalized.filter(
      (record) => normalizeWorkspaceId(record.workspaceId || "public") === normalizedWorkspaceId,
    );
  }

  function saveAccessGrants(grants, options = {}) {
    const hasSession = Boolean(getSession());
    const targetWorkspaceId = options.workspaceId
      ? normalizeWorkspaceId(options.workspaceId)
      : hasSession && !options.allWorkspaces
        ? normalizeWorkspaceId(getCurrentWorkspaceId())
        : null;
    const normalizedIncoming = Array.isArray(grants)
      ? grants.map((record) => normalizeAccessGrant(record, targetWorkspaceId || record.workspaceId || null))
      : [];

    if (!targetWorkspaceId || options.allWorkspaces) {
      localStorage.setItem(ACCESS_GRANTS_STORAGE_KEY, JSON.stringify(normalizedIncoming));
      window.dispatchEvent(
        new CustomEvent(ACCESS_GRANTS_EVENT_NAME, {
          detail: {
            workspaceId: targetWorkspaceId || normalizeWorkspaceId(getCurrentWorkspaceId()),
            allWorkspaces: Boolean(options.allWorkspaces),
          },
        }),
      );
      return normalizedIncoming;
    }

    const existingAll = getAccessGrants({ allWorkspaces: true });
    const preserved = existingAll.filter(
      (record) => normalizeWorkspaceId(record.workspaceId || "public") !== targetWorkspaceId,
    );
    const merged = [...preserved, ...normalizedIncoming];
    localStorage.setItem(ACCESS_GRANTS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(
      new CustomEvent(ACCESS_GRANTS_EVENT_NAME, {
        detail: {
          workspaceId: targetWorkspaceId,
          allWorkspaces: false,
        },
      }),
    );
    return normalizedIncoming;
  }

  function upsertAccessGrant(record, workspaceId = null) {
    const targetWorkspaceId = normalizeWorkspaceId(workspaceId || record.workspaceId || getCurrentWorkspaceId());
    const grants = getAccessGrants({ workspaceId: targetWorkspaceId });
    const normalizedEmail = normalizeEmail(record.email || record.normalizedEmail || "");
    const role = normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE);
    const id = record.id || null;
    const existingIndex =
      id
        ? grants.findIndex((entry) => entry.id === id)
        : grants.findIndex(
            (entry) =>
              entry.normalizedEmail === normalizedEmail &&
              normalizeWorkspaceId(entry.workspaceId || "public") === targetWorkspaceId,
          );
    const next = normalizeAccessGrant({
      ...(existingIndex >= 0 ? grants[existingIndex] : {}),
      ...record,
      workspaceId: targetWorkspaceId,
      email: record.email || (existingIndex >= 0 ? grants[existingIndex].email : ""),
      role,
      updatedAt: nowIso(),
    }, targetWorkspaceId);

    if (existingIndex >= 0) {
      grants[existingIndex] = next;
    } else {
      grants.unshift(next);
    }

    return saveAccessGrants(grants, { workspaceId: targetWorkspaceId });
  }

  function setAccessGrantStatus(grantId, status, workspaceId = null) {
    const targetWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const grants = getAccessGrants({ workspaceId: targetWorkspaceId });
    const targetIndex = grants.findIndex((entry) => entry.id === grantId);

    if (targetIndex < 0) {
      return grants;
    }

    grants[targetIndex] = normalizeAccessGrant({
      ...grants[targetIndex],
      status: normalizeAccessStatus(status),
      updatedAt: nowIso(),
    }, targetWorkspaceId);

    return saveAccessGrants(grants, { workspaceId: targetWorkspaceId });
  }

  function removeAccessGrant(grantId, workspaceId = null) {
    const targetWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const grants = getAccessGrants({ workspaceId: targetWorkspaceId }).filter((entry) => entry.id !== grantId);
    return saveAccessGrants(grants, { workspaceId: targetWorkspaceId });
  }

  function getProvisioningGrant(email, role, provider = "password", workspaceId = null) {
    const normalizedEmail = normalizeEmail(email || "");
    const normalizedRole = role ? normalizeRoleLabel(role) : null;
    const normalizedProvider = provider === "google" ? "google" : "password";
    const matchedUser = findUserByEmail(email);
    const targetWorkspaceId = workspaceId
      ? normalizeWorkspaceId(workspaceId)
      : matchedUser?.workspaceId
        ? normalizeWorkspaceId(matchedUser.workspaceId)
        : null;
    const grants = targetWorkspaceId
      ? getAccessGrants({ workspaceId: targetWorkspaceId })
      : getAccessGrants({ allWorkspaces: true });

    return (
      grants.find(
        (entry) =>
          entry.status === "active" &&
          entry.normalizedEmail === normalizedEmail &&
          (normalizedRole ? normalizeRoleLabel(entry.role) === normalizedRole : true) &&
          (entry.authMethod === "any" || entry.authMethod === normalizedProvider),
      ) || null
    );
  }

  function markAccessGrantClaimed(email, role, provider = "password", userId = null, workspaceId = null) {
    const grant = getProvisioningGrant(email, role, provider, workspaceId);

    if (!grant) {
      return null;
    }

    const updatedGrants = upsertAccessGrant({
      ...grant,
      claimedAt: nowIso(),
      claimedByUserId: userId || grant.claimedByUserId || null,
      status: "active",
      workspaceId: workspaceId || grant.workspaceId || null,
    }, workspaceId || grant.workspaceId || null);

    return updatedGrants.find((entry) => entry.id === grant.id) || null;
  }

  function getSupabaseConfig() {
    return window.SchoolSphereSupabaseConfig || null;
  }

  function isSupabaseConfigured() {
    const config = getSupabaseConfig();

    return Boolean(config && config.enableSupabaseAuth && config.url && config.anonKey);
  }

  function buildSupabaseRedirectUrl(path) {
    const config = getSupabaseConfig();
    const baseUrl = config?.siteUrl || window.location.origin;
    const targetPath = path || config?.redirectPath || "/portal.html";
    return new URL(targetPath, baseUrl).toString();
  }

  function buildSupabaseEmailRedirectUrl() {
    const config = getSupabaseConfig();
    return buildSupabaseRedirectUrl(config?.emailRedirectPath || "/login.html");
  }

  async function loadSupabaseLibrary() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return window.supabase;
    }

    const existingScript = document.querySelector(`script[data-supabase-sdk="true"]`);

    if (existingScript) {
      await new Promise((resolve, reject) => {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
      });
      return window.supabase;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SUPABASE_SCRIPT_SRC;
      script.async = true;
      script.dataset.supabaseSdk = "true";
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });

    return window.supabase;
  }

  function getSupabaseStorageAdapter() {
    return {
      getItem(key) {
        return (
          sessionStorage.getItem(key) ||
          localStorage.getItem(key) ||
          null
        );
      },
      setItem(key, value) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);

        if (getAuthPersistencePreference() === "session") {
          sessionStorage.setItem(key, value);
          return;
        }

        localStorage.setItem(key, value);
      },
      removeItem(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      },
    };
  }

  async function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    if (!supabaseClientPromise) {
      supabaseClientPromise = loadSupabaseLibrary().then((sdk) => {
        const config = getSupabaseConfig();

        return sdk.createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: SUPABASE_STORAGE_KEY,
            storage: getSupabaseStorageAdapter(),
          },
        });
      });
    }

    return supabaseClientPromise;
  }

  function getSupabaseProvisionFunctionName() {
    const config = getSupabaseConfig();
    const configuredName = String(config?.userProvisionFunctionName || "").trim();
    return configuredName || "provision-user";
  }

  function getSupabaseAdmissionsSubmitFunctionName() {
    const config = getSupabaseConfig();
    const configuredName = String(config?.admissionsSubmitFunctionName || "").trim();
    return configuredName || "submit-admission";
  }

  function normalizeAuthProvider(value) {
    return String(value || "").trim().toLowerCase() === "google" ? "google" : "password";
  }

  function createUuidV4() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
      const random = Math.floor(Math.random() * 16);
      const next = token === "x" ? random : (random & 0x3) | 0x8;
      return next.toString(16);
    });
  }

  function buildWorkspaceScopedStateKey(baseKey, workspaceId) {
    return `${baseKey}::${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }

  function parseWorkspaceScopedState(baseKey, workspaceId, fallback = null) {
    const storageKey = buildWorkspaceScopedStateKey(baseKey, workspaceId);
    const raw = localStorage.getItem(storageKey);

    if (raw === null) {
      return null;
    }

    return {
      storageKey,
      data: parseJSON(raw, fallback),
    };
  }

  function collectWorkspaceStatesForMigration(workspaceId) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const collected = [];

    WORKSPACE_SCOPED_STATE_KEYS.forEach((baseKey) => {
      const parsed = parseWorkspaceScopedState(baseKey, normalizedWorkspaceId, null);

      if (!parsed) {
        return;
      }

      collected.push({
        stateKey: baseKey,
        payload: {
          workspaceId: normalizedWorkspaceId,
          data: parsed.data,
          sourceStorageKey: parsed.storageKey,
        },
      });
    });

    const notificationsKey = `${NOTIFICATION_STORAGE_PREFIX}:${normalizedWorkspaceId}`;
    const notificationsRaw = localStorage.getItem(notificationsKey);
    if (notificationsRaw !== null) {
      collected.push({
        stateKey: "schoolsphere.notifications.v1",
        payload: {
          workspaceId: normalizedWorkspaceId,
          data: parseJSON(notificationsRaw, []),
          sourceStorageKey: notificationsKey,
        },
      });
    }

    const admissionsKey = `${ADMISSIONS_STORAGE_KEY_BASE}:${normalizedWorkspaceId}`;
    const admissionsRaw = localStorage.getItem(admissionsKey);
    if (admissionsRaw !== null) {
      collected.push({
        stateKey: "schoolsphere.admissions.v1",
        payload: {
          workspaceId: normalizedWorkspaceId,
          data: parseJSON(admissionsRaw, []),
          sourceStorageKey: admissionsKey,
        },
      });
    }

    const parentFeesKey = `${PARENT_FEES_STORAGE_PREFIX}:${normalizedWorkspaceId}`;
    const parentFeesRaw = localStorage.getItem(parentFeesKey);
    if (parentFeesRaw !== null) {
      collected.push({
        stateKey: "schoolsphere.parentFees.v1",
        payload: {
          workspaceId: normalizedWorkspaceId,
          data: parseJSON(parentFeesRaw, {}),
          sourceStorageKey: parentFeesKey,
        },
      });
    }

    const rawAccessGrants = parseJSON(localStorage.getItem(ACCESS_GRANTS_STORAGE_KEY), []);
    const accessGrants =
      Array.isArray(rawAccessGrants)
        ? rawAccessGrants.filter(
            (entry) => normalizeWorkspaceId(entry?.workspaceId || "public") === normalizedWorkspaceId,
          )
        : [];

    if (accessGrants.length) {
      collected.push({
        stateKey: "schoolsphere.accessGrants.v1",
        payload: {
          workspaceId: normalizedWorkspaceId,
          data: accessGrants,
          sourceStorageKey: ACCESS_GRANTS_STORAGE_KEY,
        },
      });
    }

    return collected;
  }

  function mapSchoolSettingsToInstitutionPayload(settings = {}, userId) {
    const schoolName = String(settings.schoolName || "").trim() || "SchoolSphere";
    const schoolTypes = normalizeConfiguredSchoolTypes(settings);

    return {
      id: createUuidV4(),
      name: schoolName,
      logo_url: String(settings.logoUrl || "").trim() || null,
      school_profile: String(settings.schoolProfile || "").trim() || null,
      address: String(settings.address || "").trim() || null,
      campus_details: String(settings.campusDetails || "").trim() || null,
      phone: String(settings.phone || "").trim() || null,
      website: String(settings.website || "").trim() || null,
      has_nursery: schoolTypes.includes("nursery"),
      has_higher_institution: schoolTypes.includes("higher"),
      academic_year_start: String(settings.academicYearStart || "").trim() || null,
      academic_year_end: String(settings.academicYearEnd || "").trim() || null,
      created_by: userId,
    };
  }

  async function ensureSupabaseInstitutionId({
    client,
    userId,
    workspaceId,
    schoolSettings,
    profileRole,
  }) {
    const {
      data: profile,
      error: profileError,
    } = await withNetworkTimeout(
      client
        .from("profiles")
        .select("id, institution_id, role")
        .eq("id", userId)
        .maybeSingle(),
    );

    if (profileError) {
      throw new Error(formatSupabaseAuthError(profileError, "Could not read your Supabase profile."));
    }

    if (profile?.institution_id) {
      return profile.institution_id;
    }

    const institutionPayload = mapSchoolSettingsToInstitutionPayload(schoolSettings, userId);
    const { error: insertInstitutionError } = await withNetworkTimeout(
      client.from("institutions").insert(institutionPayload),
    );

    if (insertInstitutionError) {
      throw new Error(
        formatSupabaseAuthError(
          insertInstitutionError,
          "Could not create your school workspace in Supabase.",
        ),
      );
    }

    const normalizedRole = normalizeRoleLabel(profileRole || profile?.role || DEFAULT_AUTH_ROLE);
    const profileRoleForDb = normalizedRole === "Admin" ? "Administrator" : normalizedRole;
    const { error: updateProfileError } = await withNetworkTimeout(
      client
        .from("profiles")
        .update({
          institution_id: institutionPayload.id,
          role: profileRoleForDb,
        })
        .eq("id", userId),
    );

    if (updateProfileError) {
      throw new Error(
        formatSupabaseAuthError(
          updateProfileError,
          "Created the workspace, but could not link it to your profile.",
        ),
      );
    }

    return institutionPayload.id;
  }

  async function syncInstitutionSnapshot(client, institutionId, schoolSettings = {}) {
    const schoolTypes = normalizeConfiguredSchoolTypes(schoolSettings);
    const payload = {
      name: String(schoolSettings.schoolName || "").trim() || "SchoolSphere",
      logo_url: String(schoolSettings.logoUrl || "").trim() || null,
      school_profile: String(schoolSettings.schoolProfile || "").trim() || null,
      address: String(schoolSettings.address || "").trim() || null,
      campus_details: String(schoolSettings.campusDetails || "").trim() || null,
      phone: String(schoolSettings.phone || "").trim() || null,
      website: String(schoolSettings.website || "").trim() || null,
      has_nursery: schoolTypes.includes("nursery"),
      has_higher_institution: schoolTypes.includes("higher"),
      academic_year_start: String(schoolSettings.academicYearStart || "").trim() || null,
      academic_year_end: String(schoolSettings.academicYearEnd || "").trim() || null,
    };

    const { error } = await withNetworkTimeout(
      client.from("institutions").update(payload).eq("id", institutionId),
    );

    if (error) {
      throw new Error(formatSupabaseAuthError(error, "Could not sync school settings to Supabase."));
    }
  }

  function mapInstitutionToSchoolSettings(institution = {}) {
    const manager = getSchoolSettingsManager();
    const defaults =
      manager && typeof manager.defaults === "object"
        ? manager.defaults
        : getDefaultAdminSchoolSettings();

    const schoolTypes = normalizeConfiguredSchoolTypes({
      hasNursery: Boolean(institution.has_nursery),
      hasPrimary: true,
      hasSecondary: true,
      hasHigherInstitution: Boolean(institution.has_higher_institution),
    });

    return {
      schoolName: String(institution.name || defaults.schoolName || "SchoolSphere").trim(),
      logoUrl: String(institution.logo_url || "").trim(),
      schoolProfile: String(institution.school_profile || "").trim(),
      address: String(institution.address || "").trim(),
      campusDetails: String(institution.campus_details || "").trim(),
      phone: String(institution.phone || "").trim(),
      website: String(institution.website || "").trim(),
      academicYearStart: String(institution.academic_year_start || "").trim(),
      academicYearEnd: String(institution.academic_year_end || "").trim(),
      schoolTypes,
      higherInstitutionType: defaults.higherInstitutionType || "university",
      hasNursery: schoolTypes.includes("nursery"),
      hasPrimary: schoolTypes.includes("primary"),
      hasSecondary: schoolTypes.includes("secondary"),
      hasHigherInstitution: schoolTypes.includes("higher"),
    };
  }

  async function hydrateSchoolSettingsFromSupabase() {
    if (!isSupabaseConfigured()) {
      return;
    }

    const manager = getSchoolSettingsManager();
    const session = getSession();

    if (
      !manager ||
      typeof manager.saveSettings !== "function" ||
      !session ||
      session.source !== "supabase"
    ) {
      return;
    }

    const client = await getSupabaseClient();
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await withNetworkTimeout(client.auth.getSession());

    if (sessionError || !supabaseSession?.user?.id) {
      return;
    }

    const { data: profile, error: profileError } = await withNetworkTimeout(
      client
        .from("profiles")
        .select("institution_id")
        .eq("id", supabaseSession.user.id)
        .maybeSingle(),
    );

    if (profileError || !profile?.institution_id) {
      return;
    }

    const { data: institution, error: institutionError } = await withNetworkTimeout(
      client
        .from("institutions")
        .select(
          "name, logo_url, school_profile, address, campus_details, phone, website, has_nursery, has_higher_institution, academic_year_start, academic_year_end",
        )
        .eq("id", profile.institution_id)
        .maybeSingle(),
    );

    if (institutionError || !institution) {
      return;
    }

    const institutionSettings = mapInstitutionToSchoolSettings(institution);
    const context = {
      client,
      workspaceId: normalizeWorkspaceId(session?.workspaceId || getCurrentWorkspaceId()),
      institutionId: profile.institution_id,
      userId: supabaseSession.user.id,
    };

    try {
      const workspaceSettings = await loadWorkspaceStatePayloadFromSupabase(
        SUPABASE_STATE_KEY_SCHOOL_SETTINGS,
        DEFAULT_AUTH_ROLE,
        context,
      );
      const payload = workspaceSettings?.payload;

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const payloadSchoolTypes = normalizeConfiguredSchoolTypes(payload);
        manager.saveSettings({
          ...institutionSettings,
          ...payload,
          schoolTypes: payloadSchoolTypes.length ? payloadSchoolTypes : institutionSettings.schoolTypes,
        });
        return;
      }
    } catch {
      // Institution fields still provide a usable settings snapshot if the workspace row is unavailable.
    }

    manager.saveSettings(institutionSettings);
  }

  async function persistSchoolSettingsToSupabase(payload, roleLabel = DEFAULT_AUTH_ROLE) {
    if (!isSupabaseConfigured()) {
      return { synced: false, reason: "not_configured" };
    }

    const localSession = getSession();

    if (!localSession || localSession.source !== "supabase") {
      return { synced: false, reason: "non_supabase_session" };
    }

    const client = await getSupabaseClient();
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await withNetworkTimeout(client.auth.getSession());

    if (sessionError || !supabaseSession?.user?.id) {
      throw new Error("Could not verify your Supabase session while saving school settings.");
    }

    const workspaceId = normalizeWorkspaceId(localSession.workspaceId || getCurrentWorkspaceId());
    const institutionId = await ensureSupabaseInstitutionId({
      client,
      userId: supabaseSession.user.id,
      workspaceId,
      schoolSettings: payload,
      profileRole: roleLabel,
    });

    await syncInstitutionSnapshot(client, institutionId, payload);
    await saveWorkspaceStatePayloadToSupabase(
      SUPABASE_STATE_KEY_SCHOOL_SETTINGS,
      payload,
      roleLabel,
      {
        client,
        workspaceId,
        institutionId,
        userId: supabaseSession.user.id,
      },
    );
    return { synced: true, institutionId };
  }

  async function getSupabaseInstitutionContext(roleLabel = DEFAULT_AUTH_ROLE) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const localSession = getSession();
    if (!localSession || localSession.source !== "supabase") {
      return null;
    }

    const client = await getSupabaseClient();
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await withNetworkTimeout(client.auth.getSession());

    if (sessionError || !supabaseSession?.user?.id) {
      return null;
    }

    const workspaceId = normalizeWorkspaceId(localSession.workspaceId || getCurrentWorkspaceId());
    const schoolSettingsManager = getSchoolSettingsManager();
    const schoolSettings = schoolSettingsManager?.getSettings
      ? schoolSettingsManager.getSettings()
      : getDefaultAdminSchoolSettings();
    const institutionId = await ensureSupabaseInstitutionId({
      client,
      userId: supabaseSession.user.id,
      workspaceId,
      schoolSettings,
      profileRole: roleLabel,
    });

    return {
      client,
      workspaceId,
      institutionId,
      userId: supabaseSession.user.id,
    };
  }

  function supportsTableNativeState(stateKey) {
    return (
      stateKey === SUPABASE_STATE_KEY_FEATURE_MODULES ||
      stateKey === SUPABASE_STATE_KEY_ROLE_PERMISSIONS ||
      stateKey === SUPABASE_STATE_KEY_CLASSES ||
      stateKey === SUPABASE_STATE_KEY_COURSES ||
      stateKey === SUPABASE_STATE_KEY_STUDENTS ||
      stateKey === SUPABASE_STATE_KEY_FEE_ITEMS ||
      stateKey === SUPABASE_STATE_KEY_ACADEMIC_CYCLES ||
      stateKey === SUPABASE_STATE_KEY_ADMISSION_CONFIG ||
      stateKey === SUPABASE_STATE_KEY_ADMISSIONS ||
      stateKey === SUPABASE_STATE_KEY_NOTIFICATIONS ||
      stateKey === SUPABASE_STATE_KEY_PARENT_FEES ||
      stateKey === SUPABASE_STATE_KEY_ACCESS_GRANTS ||
      stateKey === SUPABASE_STATE_KEY_ACADEMIC_CALENDAR ||
      stateKey === SUPABASE_STATE_KEY_TIMETABLE ||
      stateKey === SUPABASE_STATE_KEY_TIMETABLE_PERIODS ||
      stateKey === SUPABASE_STATE_KEY_TIMETABLE_ROOMS ||
      stateKey === SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS
    );
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asTextArray(value) {
    return asArray(value)
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }

  function asObject(value, fallback = {}) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  }

  async function syncSupabaseTableRows({
    context,
    tableName,
    rows,
    conflictKey = "record_id",
  }) {
    const normalizedRows = Array.isArray(rows) ? rows : [];
    const ids = normalizedRows
      .map((row) => String(row?.[conflictKey] || "").trim())
      .filter(Boolean);
    const idSet = new Set(ids);

    const { data: existingRows, error: existingError } = await withNetworkTimeout(
      context.client
        .from(tableName)
        .select(conflictKey)
        .eq("institution_id", context.institutionId),
    );

    if (existingError) {
      throw new Error(
        formatSupabaseAuthError(
          existingError,
          `Could not read existing rows for ${tableName}.`,
        ),
      );
    }

    const staleIds = asArray(existingRows)
      .map((row) => String(row?.[conflictKey] || "").trim())
      .filter((recordId) => recordId && !idSet.has(recordId));

    if (staleIds.length) {
      const { error: deleteError } = await withNetworkTimeout(
        context.client
          .from(tableName)
          .delete()
          .eq("institution_id", context.institutionId)
          .in(conflictKey, staleIds),
      );

      if (deleteError) {
        throw new Error(
          formatSupabaseAuthError(deleteError, `Could not remove stale rows in ${tableName}.`),
        );
      }
    }

    if (normalizedRows.length) {
      const { error: upsertError } = await withNetworkTimeout(
        context.client.from(tableName).upsert(normalizedRows, {
          onConflict: `institution_id,${conflictKey}`,
        }),
      );

      if (upsertError) {
        throw new Error(
          formatSupabaseAuthError(upsertError, `Could not save rows to ${tableName}.`),
        );
      }
    }
  }

  async function loadTableNativeStatePayloadFromSupabase(stateKey, context) {
    if (!supportsTableNativeState(stateKey) || !context) {
      return { handled: false, payload: null };
    }

    if (stateKey === SUPABASE_STATE_KEY_FEATURE_MODULES) {
      const { data, error } = await withNetworkTimeout(
        context.client
          .from("feature_modules")
          .select("module_key, enabled")
          .eq("institution_id", context.institutionId),
      );

      if (error) {
        throw new Error(
          formatSupabaseAuthError(error, "Could not load feature modules from Supabase."),
        );
      }

      const payload = {};
      asArray(data).forEach((row) => {
        const key = String(row?.module_key || "").trim();
        if (!key) return;
        payload[key] = Boolean(row?.enabled);
      });
      return { handled: true, payload };
    }

    if (stateKey === SUPABASE_STATE_KEY_ROLE_PERMISSIONS) {
      const { data, error } = await withNetworkTimeout(
        context.client
          .from("role_permissions")
          .select("role_key, permission_key, enabled")
          .eq("institution_id", context.institutionId),
      );

      if (error) {
        throw new Error(
          formatSupabaseAuthError(error, "Could not load role permissions from Supabase."),
        );
      }

      const payload = {};
      asArray(data).forEach((row) => {
        const role = normalizeRoleLabel(row?.role_key || "Admin");
        const permissionKey = String(row?.permission_key || "").trim();
        if (!permissionKey) return;
        if (!payload[role]) {
          payload[role] = {};
        }
        payload[role][permissionKey] = Boolean(row?.enabled);
      });
      return { handled: true, payload };
    }

    if (stateKey === SUPABASE_STATE_KEY_CLASSES) {
      const { data, error } = await withNetworkTimeout(
        context.client
          .from("classes")
          .select(
            "record_id, name, level, capacity, class_teacher, arms, subjects, teacher_assignments, status, archived_at, created_at, updated_at",
          )
          .eq("institution_id", context.institutionId)
          .order("updated_at", { ascending: false }),
      );

      if (error) {
        throw new Error(formatSupabaseAuthError(error, "Could not load classes from Supabase."));
      }

      return {
        handled: true,
        payload: asArray(data).map((row) => ({
          id: String(row?.record_id || "").trim() || createId(),
          name: String(row?.name || "").trim(),
          level: String(row?.level || "").trim(),
          capacity: Number.parseInt(row?.capacity, 10) || 0,
          classTeacher: String(row?.class_teacher || "").trim(),
          arms: asTextArray(row?.arms),
          subjects: asTextArray(row?.subjects),
          teacherAssignments: asArray(row?.teacher_assignments)
            .map((assignment) => ({
              subject: String(assignment?.subject || "").trim(),
              teacher: String(assignment?.teacher || "").trim(),
            }))
            .filter((assignment) => assignment.subject && assignment.teacher),
          status: String(row?.status || "active").trim().toLowerCase() === "archived" ? "archived" : "active",
          createdAt: String(row?.created_at || nowIso()),
          updatedAt: String(row?.updated_at || nowIso()),
          archivedAt: row?.archived_at ? String(row.archived_at) : null,
        })),
      };
    }

    const tableByState = {
      [SUPABASE_STATE_KEY_COURSES]: "courses",
      [SUPABASE_STATE_KEY_STUDENTS]: "students",
      [SUPABASE_STATE_KEY_FEE_ITEMS]: "fee_items",
      [SUPABASE_STATE_KEY_ACADEMIC_CYCLES]: "academic_cycles_state",
      [SUPABASE_STATE_KEY_ADMISSION_CONFIG]: "admission_config_state",
      [SUPABASE_STATE_KEY_ADMISSIONS]: "admissions_applications",
      [SUPABASE_STATE_KEY_NOTIFICATIONS]: "notifications_log",
      [SUPABASE_STATE_KEY_PARENT_FEES]: "parent_fee_records",
      [SUPABASE_STATE_KEY_ACCESS_GRANTS]: "access_grants",
      [SUPABASE_STATE_KEY_ACADEMIC_CALENDAR]: "academic_calendar_events",
      [SUPABASE_STATE_KEY_TIMETABLE]: "timetable_entries",
      [SUPABASE_STATE_KEY_TIMETABLE_PERIODS]: "timetable_periods",
      [SUPABASE_STATE_KEY_TIMETABLE_ROOMS]: "timetable_rooms",
      [SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS]: "timetable_substitutions",
    };

    const tableName = tableByState[stateKey];

    const { data, error } = await withNetworkTimeout(
      context.client
        .from(tableName)
        .select("record_id, payload, created_at, updated_at")
        .eq("institution_id", context.institutionId)
        .order("updated_at", { ascending: false }),
    );

    if (error) {
      throw new Error(
        formatSupabaseAuthError(error, `Could not load ${stateKey} from Supabase.`),
      );
    }

    if (
      stateKey === SUPABASE_STATE_KEY_ACADEMIC_CYCLES ||
      stateKey === SUPABASE_STATE_KEY_ADMISSION_CONFIG ||
      stateKey === SUPABASE_STATE_KEY_PARENT_FEES
    ) {
      const firstRow = asArray(data)[0] || null;
      const firstPayload = asObject(firstRow?.payload, null);
      return {
        handled: true,
        payload: firstPayload,
      };
    }

    return {
      handled: true,
      payload: asArray(data).map((row) => {
        const payload = asObject(row?.payload, {});
        return {
          ...payload,
          id: String(row?.record_id || payload.id || createId()).trim(),
          createdAt: payload.createdAt || String(row?.created_at || nowIso()),
          updatedAt: payload.updatedAt || String(row?.updated_at || nowIso()),
        };
      }),
    };
  }

  async function saveTableNativeStatePayloadToSupabase(stateKey, payload, context) {
    if (!supportsTableNativeState(stateKey) || !context) {
      return { handled: false };
    }

    if (stateKey === SUPABASE_STATE_KEY_FEATURE_MODULES) {
      const source = asObject(payload, {});
      const moduleRows = Object.entries(source)
        .map(([moduleKey, enabled]) => ({
          institution_id: context.institutionId,
          module_key: String(moduleKey || "").trim(),
          enabled: Boolean(enabled),
        }))
        .filter((row) => row.module_key);

      if (moduleRows.length) {
        const { error } = await withNetworkTimeout(
          context.client.from("feature_modules").upsert(moduleRows, {
            onConflict: "institution_id,module_key",
          }),
        );
        if (error) {
          throw new Error(
            formatSupabaseAuthError(error, "Could not save feature modules to Supabase."),
          );
        }
      }

      return { handled: true };
    }

    if (stateKey === SUPABASE_STATE_KEY_ROLE_PERMISSIONS) {
      const source = asObject(payload, {});
      const permissionRows = Object.entries(source).flatMap(([role, permissions]) =>
        Object.entries(asObject(permissions, {}))
          .map(([permissionKey, enabled]) => ({
            institution_id: context.institutionId,
            role_key: normalizeRoleLabel(role) === "Admin" ? "Administrator" : normalizeRoleLabel(role),
            permission_key: String(permissionKey || "").trim(),
            enabled: Boolean(enabled),
          }))
          .filter((row) => row.permission_key),
      );

      if (permissionRows.length) {
        const { error } = await withNetworkTimeout(
          context.client.from("role_permissions").upsert(permissionRows, {
            onConflict: "institution_id,role_key,permission_key",
          }),
        );
        if (error) {
          throw new Error(
            formatSupabaseAuthError(error, "Could not save role permissions to Supabase."),
          );
        }
      }

      return { handled: true };
    }

    const rows =
      stateKey === SUPABASE_STATE_KEY_ACADEMIC_CYCLES ||
      stateKey === SUPABASE_STATE_KEY_ADMISSION_CONFIG ||
      stateKey === SUPABASE_STATE_KEY_PARENT_FEES
        ? [asObject(payload, {})]
        : asArray(payload);

    if (stateKey === SUPABASE_STATE_KEY_CLASSES) {
      await syncSupabaseTableRows({
        context,
        tableName: "classes",
        rows: rows
          .map((record) => {
            const normalized = asObject(record, {});
            const recordId = String(normalized.id || "").trim();

            if (!recordId) {
              return null;
            }

            return {
              institution_id: context.institutionId,
              record_id: recordId,
              name: String(normalized.name || "").trim() || "Class",
              level: String(normalized.level || "").trim() || "General",
              capacity: Math.max(1, Number.parseInt(normalized.capacity, 10) || 1),
              class_teacher: String(normalized.classTeacher || "").trim() || null,
              arms: asTextArray(normalized.arms),
              subjects: asTextArray(normalized.subjects),
              teacher_assignments: asArray(normalized.teacherAssignments)
                .map((assignment) => ({
                  subject: String(assignment?.subject || "").trim(),
                  teacher: String(assignment?.teacher || "").trim(),
                }))
                .filter((assignment) => assignment.subject && assignment.teacher),
              status:
                String(normalized.status || "active").trim().toLowerCase() === "archived"
                  ? "archived"
                  : "active",
              archived_at:
                String(normalized.status || "active").trim().toLowerCase() === "archived"
                  ? String(normalized.archivedAt || normalized.updatedAt || nowIso())
                  : null,
              created_by: context.userId,
              created_at: String(normalized.createdAt || nowIso()),
              updated_at: String(normalized.updatedAt || nowIso()),
            };
          })
          .filter(Boolean),
      });

      return { handled: true };
    }

    const tableByState = {
      [SUPABASE_STATE_KEY_COURSES]: {
        table: "courses",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            name: String(normalized.name || "").trim() || "Course",
            code: String(normalized.code || "").trim() || null,
            description: String(normalized.description || "").trim() || null,
            level: String(normalized.level || "").trim() || null,
            teacher_assignments: asTextArray(normalized.teacherAssignments),
            student_assignments: asTextArray(normalized.studentAssignments),
            status:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? "archived"
                : "active",
            archived_at:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? String(normalized.archivedAt || normalized.updatedAt || nowIso())
                : null,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_STUDENTS]: {
        table: "students",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            first_name: String(normalized.firstName || "").trim() || null,
            last_name: String(normalized.lastName || "").trim() || null,
            full_name: String(normalized.fullName || "").trim() || "Student",
            admission_no: String(normalized.admissionNo || "").trim() || null,
            level: String(normalized.level || "").trim() || null,
            date_of_birth: String(normalized.dateOfBirth || "").trim() || null,
            gender: String(normalized.gender || "").trim() || null,
            guardians: asArray(normalized.guardians),
            progression_history: asArray(normalized.progressionHistory),
            documents: asArray(normalized.documents),
            status: (() => {
              const status = String(normalized.status || "active").trim().toLowerCase();
              return status === "archived" || status === "transferred" ? status : "active";
            })(),
            promotion_decision: String(normalized.promotionDecision || "").trim() || null,
            exam_outcome: String(normalized.examOutcome || "").trim() || null,
            last_promotion_session_id:
              String(normalized.lastPromotionSessionId || "").trim() || null,
            last_promotion_outcome:
              String(normalized.lastPromotionOutcome || "").trim() || null,
            transfer_reason: String(normalized.transferReason || "").trim() || null,
            payload: normalized,
            created_by: context.userId,
            archived_at: normalized.archivedAt ? String(normalized.archivedAt) : null,
            transferred_at: normalized.transferredAt ? String(normalized.transferredAt) : null,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_FEE_ITEMS]: {
        table: "fee_items",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            name: String(normalized.name || "").trim() || "Fee Item",
            description: String(normalized.description || "").trim() || null,
            amount: Number.isFinite(Number.parseFloat(normalized.amount))
              ? Number.parseFloat(normalized.amount)
              : 0,
            class_level: String(normalized.classLevel || "").trim() || null,
            session_id: String(normalized.sessionId || "").trim() || null,
            term_id: String(normalized.termId || "").trim() || null,
            due_date: String(normalized.dueDate || "").trim() || null,
            status:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? "archived"
                : "active",
            archived_at: normalized.archivedAt ? String(normalized.archivedAt) : null,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_ACADEMIC_CYCLES]: {
        table: "academic_cycles_state",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "default").trim() || "default";
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_ADMISSION_CONFIG]: {
        table: "admission_config_state",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "default").trim() || "default";
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_ADMISSIONS]: {
        table: "admissions_applications",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            full_name: String(normalized.fullName || "").trim() || "Applicant",
            level: String(
              normalized.level || normalized.classApplyingFor || normalized.academicClassApplyingFor || "",
            ).trim() || "Unspecified",
            status: String(normalized.status || "pending").trim().toLowerCase(),
            guardian_name:
              String(normalized.guardianName || normalized.guardianFullName || "").trim() || null,
            guardian_email: String(normalized.guardianEmail || "").trim() || null,
            application_stage: String(normalized.applicationStage || "").trim() || null,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_PARENT_FEES]: {
        table: "parent_fee_records",
        map: (record) => {
          const normalized = asObject(record, {});
          return {
            institution_id: context.institutionId,
            record_id: "default",
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_ACCESS_GRANTS]: {
        table: "access_grants",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            email: String(normalized.email || "").trim() || null,
            normalized_email: normalizeEmail(
              normalized.normalizedEmail || normalized.email || "",
            ) || null,
            role_key: normalizeRoleLabel(normalized.role || DEFAULT_AUTH_ROLE),
            auth_method: normalizeAccessMethod(normalized.authMethod),
            status: normalizeAccessStatus(normalized.status),
            workspace_id: normalizeWorkspaceId(normalized.workspaceId || context.workspaceId),
            claimed_at: normalized.claimedAt ? String(normalized.claimedAt) : null,
            claimed_by_user_id: normalized.claimedByUserId || null,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_NOTIFICATIONS]: {
        table: "notifications_log",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            title: String(normalized.title || normalized.summary || "System activity").trim(),
            message: String(normalized.message || normalized.details || "").trim() || null,
            entity_type: String(normalized.entityType || "system").trim() || null,
            entity_id: String(normalized.entityId || "").trim() || null,
            action: String(normalized.action || "updated").trim() || null,
            actor_name: String(normalized.actorName || "System").trim() || null,
            visible_to_roles: asTextArray(normalized.visibleToRoles).length
              ? asTextArray(normalized.visibleToRoles)
              : ["Admin"],
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_ACADEMIC_CALENDAR]: {
        table: "academic_calendar_events",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            event_name: String(normalized.title || "").trim() || "Event",
            event_type: String(normalized.type || "term").trim().toLowerCase() || "term",
            start_date: String(normalized.startDate || "").trim() || null,
            end_date: String(normalized.endDate || "").trim() || null,
            status:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? "archived"
                : "active",
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_TIMETABLE]: {
        table: "timetable_entries",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            period_id: String(normalized.periodId || "").trim() || null,
            class_id: String(normalized.classId || "").trim() || null,
            subject_id: String(normalized.subjectId || "").trim() || null,
            teacher_id: String(normalized.teacherId || "").trim() || null,
            room_id: String(normalized.roomId || "").trim() || null,
            session_id: String(normalized.sessionId || "").trim() || null,
            term_id: String(normalized.termId || "").trim() || null,
            week_type: String(normalized.weekType || "all").trim() || "all",
            day_of_week: String(normalized.day || "").trim() || null,
            class_level: String(normalized.classLevel || "").trim() || null,
            subject: String(normalized.subject || "").trim() || null,
            teacher: String(normalized.teacher || "").trim() || null,
            venue: String(normalized.room || "").trim() || null,
            start_time: String(normalized.startTime || "").trim() || null,
            end_time: String(normalized.endTime || "").trim() || null,
            status: String(normalized.status || "draft").trim().toLowerCase() || "draft",
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_TIMETABLE_PERIODS]: {
        table: "timetable_periods",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            period_name: String(normalized.name || "").trim() || "Period",
            day_of_week: String(normalized.day || "").trim() || null,
            start_time: String(normalized.startTime || "").trim() || null,
            end_time: String(normalized.endTime || "").trim() || null,
            sort_order: Number.parseInt(normalized.sortOrder, 10) || 1,
            status:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? "archived"
                : "active",
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_TIMETABLE_ROOMS]: {
        table: "timetable_rooms",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            name: String(normalized.name || "").trim() || "Room",
            capacity: Number.parseInt(normalized.capacity, 10) || null,
            status:
              String(normalized.status || "active").trim().toLowerCase() === "archived"
                ? "archived"
                : "active",
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
      [SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS]: {
        table: "timetable_substitutions",
        map: (record) => {
          const normalized = asObject(record, {});
          const recordId = String(normalized.id || "").trim();
          if (!recordId) return null;
          return {
            institution_id: context.institutionId,
            record_id: recordId,
            entry_record_id: String(normalized.entryId || "").trim() || null,
            period_id: String(normalized.periodId || "").trim() || null,
            term_id: String(normalized.termId || "").trim() || null,
            class_level: String(normalized.classLevel || "").trim() || null,
            subject: String(normalized.subject || "").trim() || null,
            original_teacher_id: String(normalized.originalTeacherId || "").trim() || null,
            original_teacher: String(normalized.originalTeacher || "").trim() || null,
            replacement_teacher_id: String(normalized.replacementTeacherId || "").trim() || null,
            replacement_teacher: String(normalized.replacementTeacher || "").trim() || null,
            reason: String(normalized.reason || "").trim() || null,
            substitution_date: String(normalized.substitutionDate || "").trim() || null,
            payload: normalized,
            created_by: context.userId,
            created_at: String(normalized.createdAt || nowIso()),
            updated_at: String(normalized.updatedAt || nowIso()),
          };
        },
      },
    };

    const config = tableByState[stateKey];

    await syncSupabaseTableRows({
      context,
      tableName: config.table,
      rows: rows.map(config.map).filter(Boolean),
    });

    return { handled: true };
  }

  async function loadWorkspaceStatePayloadFromSupabase(
    stateKey,
    roleLabel = DEFAULT_AUTH_ROLE,
    existingContext = null,
  ) {
    const context = existingContext || (await getSupabaseInstitutionContext(roleLabel));

    if (!context) {
      return { synced: false, payload: null, context: null };
    }

    const tableStateResult = await loadTableNativeStatePayloadFromSupabase(stateKey, context);

    if (tableStateResult.handled) {
      return {
        synced: true,
        payload: tableStateResult.payload,
        context,
        source: "table-native",
      };
    }

    const { data, error } = await withNetworkTimeout(
      context.client
        .from("workspace_states")
        .select("payload")
        .eq("institution_id", context.institutionId)
        .eq("state_key", stateKey)
        .maybeSingle(),
    );

    if (error) {
      throw new Error(formatSupabaseAuthError(error, "Could not load workspace state from Supabase."));
    }

    const rowPayload = data?.payload;
    const payload =
      rowPayload && typeof rowPayload === "object" && "data" in rowPayload
        ? rowPayload.data
        : rowPayload || null;

    return { synced: true, payload, context, source: "workspace-states" };
  }

  async function saveWorkspaceStatePayloadToSupabase(
    stateKey,
    payload,
    roleLabel = DEFAULT_AUTH_ROLE,
    existingContext = null,
  ) {
    const context = existingContext || (await getSupabaseInstitutionContext(roleLabel));

    if (!context) {
      return { synced: false, context: null };
    }

    const tableSaveResult = await saveTableNativeStatePayloadToSupabase(stateKey, payload, context);

    if (tableSaveResult.handled) {
      return { synced: true, context, source: "table-native" };
    }

    const row = {
      institution_id: context.institutionId,
      state_key: stateKey,
      payload: {
        workspaceId: context.workspaceId,
        data: payload,
        syncedAt: nowIso(),
      },
      source: "web-client",
      migrated_by: context.userId,
    };

    const { error } = await withNetworkTimeout(
      context.client.from("workspace_states").upsert(row, {
        onConflict: "institution_id,state_key",
      }),
    );

    if (error) {
      throw new Error(formatSupabaseAuthError(error, "Could not save workspace state to Supabase."));
    }

    return { synced: true, context, source: "workspace-states" };
  }

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

  function writeWorkspaceStatePayloadToLocal(stateKey, payload, workspaceId) {
    if (stateKey === SUPABASE_STATE_KEY_ACCESS_GRANTS) {
      const targetWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
      const existing = parseJSON(localStorage.getItem(ACCESS_GRANTS_STORAGE_KEY), []);
      const preserved = Array.isArray(existing)
        ? existing.filter(
            (record) =>
              normalizeWorkspaceId(record?.workspaceId || "public") !== targetWorkspaceId,
          )
        : [];
      const currentWorkspaceGrants = asArray(payload).map((record) =>
        normalizeAccessGrant(record, targetWorkspaceId),
      );
      localStorage.setItem(
        ACCESS_GRANTS_STORAGE_KEY,
        JSON.stringify([...preserved, ...currentWorkspaceGrants]),
      );
      emitHydratedWorkspaceStateEvent(stateKey, targetWorkspaceId);
      return;
    }

    const storageKey = getWorkspaceStateStorageKeyForState(stateKey, workspaceId);
    localStorage.setItem(storageKey, JSON.stringify(payload));
    emitHydratedWorkspaceStateEvent(stateKey, workspaceId);
  }

  function emitHydratedWorkspaceStateEvent(stateKey, workspaceId = getCurrentWorkspaceId()) {
    const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const managerEventMap = new Map([
      [SUPABASE_STATE_KEY_SCHOOL_SETTINGS, getSchoolSettingsManager()?.eventName],
      [SUPABASE_STATE_KEY_CLASSES, getClassManager()?.eventName],
      [SUPABASE_STATE_KEY_COURSES, getCourseManager()?.eventName],
      [SUPABASE_STATE_KEY_STUDENTS, getStudentManager()?.eventName],
      [SUPABASE_STATE_KEY_ATTENDANCE, getAttendanceManager()?.eventName],
      [SUPABASE_STATE_KEY_FEE_ITEMS, getFeeItemManager()?.eventName],
      [SUPABASE_STATE_KEY_ACADEMIC_CYCLES, getAcademicCycleManager()?.eventName],
      [SUPABASE_STATE_KEY_ADMISSION_CONFIG, getAdmissionConfigManager()?.eventName],
      [SUPABASE_STATE_KEY_ACADEMIC_CALENDAR, getAcademicCalendarManager()?.eventName],
      [SUPABASE_STATE_KEY_TIMETABLE, getTimetableManager()?.eventName],
      [SUPABASE_STATE_KEY_TIMETABLE_PERIODS, getTimetableManager()?.eventName],
      [SUPABASE_STATE_KEY_TIMETABLE_ROOMS, getTimetableManager()?.eventName],
      [SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS, getTimetableManager()?.eventName],
      [SUPABASE_STATE_KEY_FEATURE_MODULES, getFeatureModuleManager()?.eventName],
      [SUPABASE_STATE_KEY_ROLE_PERMISSIONS, getRolePermissionManager()?.eventName],
      [SUPABASE_STATE_KEY_ADMISSIONS, ADMISSIONS_EVENT_NAME],
      [SUPABASE_STATE_KEY_NOTIFICATIONS, NOTIFICATION_EVENT_NAME],
      [SUPABASE_STATE_KEY_PARENT_FEES, PARENT_FEES_EVENT_NAME],
      [SUPABASE_STATE_KEY_ACCESS_GRANTS, ACCESS_GRANTS_EVENT_NAME],
    ]);
    const eventName = managerEventMap.get(stateKey);

    if (!eventName) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          workspaceId: normalizedWorkspaceId,
          source: "supabase-hydration",
        },
      }),
    );
  }

  async function hydrateWorkspaceStateCollectionsFromSupabase(roleLabel = DEFAULT_AUTH_ROLE) {
    if (!isSupabaseConfigured()) {
      return;
    }

    const context = await getSupabaseInstitutionContext(roleLabel);

    if (!context) {
      return;
    }

    isHydratingWorkspaceStateFromSupabase = true;

    try {
      for (const stateKey of SUPABASE_WORKSPACE_HYDRATE_KEYS) {
        try {
          const result = await loadWorkspaceStatePayloadFromSupabase(
            stateKey,
            roleLabel,
            context,
          );

          if (!result?.synced) {
            continue;
          }

          if (result.payload === undefined || result.payload === null) {
            continue;
          }

          writeWorkspaceStatePayloadToLocal(
            stateKey,
            result.payload,
            result.context?.workspaceId || getCurrentWorkspaceId(),
          );
        } catch {
          // Continue hydrating remaining keys even if one key fails.
        }
      }
    } finally {
      isHydratingWorkspaceStateFromSupabase = false;
    }
  }

  function initSupabaseWorkspaceStateLiveSync() {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { isAdmin } = getAdminAccessContext();

    if (!isAdmin) {
      return;
    }

    const debounceHandles = new Map();

    const queueSync = (stateKey, getPayload) => {
      if (isHydratingWorkspaceStateFromSupabase) {
        return;
      }

      if (debounceHandles.has(stateKey)) {
        window.clearTimeout(debounceHandles.get(stateKey));
      }

      const handle = window.setTimeout(async () => {
        try {
          await saveWorkspaceStatePayloadToSupabase(stateKey, getPayload());
        } catch {
          // Keep UI responsive even when background sync fails.
        } finally {
          debounceHandles.delete(stateKey);
        }
      }, 260);

      debounceHandles.set(stateKey, handle);
    };

    const managerBindings = [
      {
        manager: getSchoolSettingsManager(),
        stateKey: SUPABASE_STATE_KEY_SCHOOL_SETTINGS,
        getPayload: (manager) => manager.getSettings(),
      },
      {
        manager: getClassManager(),
        stateKey: SUPABASE_STATE_KEY_CLASSES,
        getPayload: (manager) => manager.getClasses(),
      },
      {
        manager: getCourseManager(),
        stateKey: SUPABASE_STATE_KEY_COURSES,
        getPayload: (manager) => manager.getCourses(),
      },
      {
        manager: getStudentManager(),
        stateKey: SUPABASE_STATE_KEY_STUDENTS,
        getPayload: (manager) => manager.getStudents(),
      },
      {
        manager: getAttendanceManager(),
        stateKey: SUPABASE_STATE_KEY_ATTENDANCE,
        getPayload: (manager) => manager.getRecords(),
      },
      {
        manager: getFeeItemManager(),
        stateKey: SUPABASE_STATE_KEY_FEE_ITEMS,
        getPayload: (manager) => manager.getItems(),
      },
      {
        manager: getAcademicCycleManager(),
        stateKey: SUPABASE_STATE_KEY_ACADEMIC_CYCLES,
        getPayload: (manager) => manager.getState(),
      },
      {
        manager: getAdmissionConfigManager(),
        stateKey: SUPABASE_STATE_KEY_ADMISSION_CONFIG,
        getPayload: (manager) => manager.getState(),
      },
      {
        manager: getAcademicCalendarManager(),
        stateKey: SUPABASE_STATE_KEY_ACADEMIC_CALENDAR,
        getPayload: (manager) => manager.getEvents(),
      },
      {
        manager: getTimetableManager(),
        stateKey: SUPABASE_STATE_KEY_TIMETABLE,
        getPayload: (manager) => manager.getEntries(),
      },
      {
        manager: getTimetableManager(),
        stateKey: SUPABASE_STATE_KEY_TIMETABLE_PERIODS,
        getPayload: (manager) => manager.getPeriods(),
      },
      {
        manager: getTimetableManager(),
        stateKey: SUPABASE_STATE_KEY_TIMETABLE_ROOMS,
        getPayload: (manager) => manager.getRooms(),
      },
      {
        manager: getTimetableManager(),
        stateKey: SUPABASE_STATE_KEY_TIMETABLE_SUBSTITUTIONS,
        getPayload: (manager) => manager.getSubstitutions(),
      },
      {
        manager: getFeatureModuleManager(),
        stateKey: SUPABASE_STATE_KEY_FEATURE_MODULES,
        getPayload: (manager) => manager.getState(),
      },
      {
        manager: getRolePermissionManager(),
        stateKey: SUPABASE_STATE_KEY_ROLE_PERMISSIONS,
        getPayload: (manager) => manager.getPermissions(),
      },
    ];

    managerBindings.forEach((binding) => {
      if (!binding.manager || !binding.manager.eventName || typeof binding.getPayload !== "function") {
        return;
      }

      window.addEventListener(binding.manager.eventName, () => {
        queueSync(binding.stateKey, () => binding.getPayload(binding.manager));
      });
    });

    window.addEventListener(ADMISSIONS_EVENT_NAME, () => {
      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      queueSync(SUPABASE_STATE_KEY_ADMISSIONS, () => getAdmissions(workspaceId));
    });

    window.addEventListener(NOTIFICATION_EVENT_NAME, () => {
      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      queueSync(SUPABASE_STATE_KEY_NOTIFICATIONS, () => getNotifications(workspaceId));
    });

    window.addEventListener(PARENT_FEES_EVENT_NAME, (event) => {
      const workspaceId = normalizeWorkspaceId(
        event?.detail?.workspaceId || getCurrentWorkspaceId(),
      );
      queueSync(SUPABASE_STATE_KEY_PARENT_FEES, () => readParentFeesState(workspaceId));
    });

    window.addEventListener(ACCESS_GRANTS_EVENT_NAME, (event) => {
      const workspaceId = normalizeWorkspaceId(
        event?.detail?.workspaceId || getCurrentWorkspaceId(),
      );
      queueSync(SUPABASE_STATE_KEY_ACCESS_GRANTS, () =>
        getAccessGrants({ workspaceId }),
      );
    });
  }

  async function migrateWorkspaceStateToSupabase() {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured. Update supabase-config.js first.");
    }

    const client = await getSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await withNetworkTimeout(client.auth.getSession());

    if (sessionError) {
      throw new Error(formatSupabaseAuthError(sessionError, "Could not verify your Supabase session."));
    }

    if (!session?.user?.id) {
      throw new Error("You are not signed in to Supabase. Please sign in again.");
    }

    const { user, roleLabel, isAdmin } = getAdminAccessContext();

    if (!isAdmin) {
      throw new Error("Only administrators can migrate workspace data.");
    }

    const workspaceId = normalizeWorkspaceId(user?.workspaceId || getCurrentWorkspaceId());
    const schoolSettingsManager = getSchoolSettingsManager();
    const schoolSettings = schoolSettingsManager?.getSettings
      ? schoolSettingsManager.getSettings()
      : getDefaultAdminSchoolSettings();
    const institutionId = await ensureSupabaseInstitutionId({
      client,
      userId: session.user.id,
      workspaceId,
      schoolSettings,
      profileRole: roleLabel,
    });

    await syncInstitutionSnapshot(client, institutionId, schoolSettings);

    const stateEntries = collectWorkspaceStatesForMigration(workspaceId);
    const context = {
      client,
      institutionId,
      workspaceId,
      userId: session.user.id,
    };

    for (const entry of stateEntries) {
      const statePayload =
        entry.payload && typeof entry.payload === "object" && "data" in entry.payload
          ? entry.payload.data
          : entry.payload;
      await saveWorkspaceStatePayloadToSupabase(
        entry.stateKey,
        statePayload,
        roleLabel,
        context,
      );
    }

    const migratedKeys = stateEntries.map((entry) => entry.stateKey);
    const { error: migrationRunError } = await withNetworkTimeout(
      client.from("workspace_migration_runs").insert({
        institution_id: institutionId,
        triggered_by: session.user.id,
        source: "web-client",
        migrated_keys: migratedKeys,
        notes: `Workspace ${workspaceId} migrated from browser localStorage.`,
      }),
    );

    if (migrationRunError) {
      throw new Error(
        formatSupabaseAuthError(
          migrationRunError,
          "Workspace data migrated, but migration log could not be written.",
        ),
      );
    }

    return {
      migratedKeys,
      workspaceId,
      institutionId,
    };
  }

  function initWorkspaceStateMigrationControls({ isAdmin, triggerButton, statusTarget }) {
    if (!triggerButton || !statusTarget) {
      return;
    }

    const configured = isSupabaseConfigured();
    triggerButton.disabled = !isAdmin || !configured;

    if (!isAdmin) {
      setStatus(statusTarget, "info", "Only administrators can run Supabase migration.");
      return;
    }

    if (!configured) {
      setStatus(
        statusTarget,
        "info",
        "Supabase is currently disabled. Add project URL and anon key in <code>supabase-config.js</code> first.",
      );
      return;
    }

    setStatus(
      statusTarget,
      "info",
      "Ready to migrate local browser workspace data to Supabase.",
    );

    triggerButton.addEventListener("click", async () => {
      triggerButton.disabled = true;
      setStatus(statusTarget, "info", "Migrating workspace data to Supabase...");

      try {
        const result = await migrateWorkspaceStateToSupabase();
        const keyCount = result.migratedKeys.length;
        const keysCopy = keyCount
          ? ` Keys: ${escapeHtml(result.migratedKeys.join(", "))}.`
          : " No local workspace records were found yet.";
        setStatus(
          statusTarget,
          "success",
          `Migration complete for workspace <strong>${escapeHtml(result.workspaceId)}</strong>.${keysCopy}`,
        );
      } catch (error) {
        setStatus(
          statusTarget,
          "error",
          escapeHtml(
            String(error?.message || "Could not migrate local workspace data to Supabase."),
          ),
        );
      } finally {
        triggerButton.disabled = false;
      }
    });
  }

  function upsertProvisionedSupabaseUserLocal(record = {}) {
    const email = String(record.email || "").trim();

    if (!email || !EMAIL_REGEX.test(email)) {
      return null;
    }

    const normalizedEmail = normalizeEmail(email);
    const role = normalizeRoleLabel(record.role || DEFAULT_AUTH_ROLE);
    const provider = normalizeAuthProvider(record.provider);
    const users = getUsers();
    const existingIndex = users.findIndex(
      (user) => user.id === record.id || user.normalizedEmail === normalizedEmail,
    );
    const existingUser = existingIndex >= 0 ? users[existingIndex] : null;
    const now = nowIso();
    const workspaceId = normalizeWorkspaceId(
      record.workspaceId ||
        existingUser?.workspaceId ||
        (role === "Admin" ? normalizedEmail : null),
    );
    const nextUser = normalizeUserRecord({
      ...(existingUser || {}),
      id: record.id || existingUser?.id || createId(),
      email,
      normalizedEmail,
      displayName: String(record.displayName || existingUser?.displayName || buildDisplayName(email) || "School User").trim(),
      role,
      provider,
      workspaceId,
      status: normalizeUserStatus(record.status || existingUser?.status || "active"),
      isConfirmed: true,
      confirmationToken: null,
      confirmationSentAt: null,
      confirmedAt: existingUser?.confirmedAt || now,
      updatedAt: now,
      passwordHash: existingUser?.passwordHash || null,
      mustChangePassword:
        record.mustChangePassword !== undefined
          ? Boolean(record.mustChangePassword)
          : Boolean(existingUser?.mustChangePassword),
      createdAt: existingUser?.createdAt || now,
      lastLoginAt: existingUser?.lastLoginAt || null,
    });

    if (existingIndex >= 0) {
      users[existingIndex] = nextUser;
    } else {
      users.push(nextUser);
    }

    saveUsers(users);
    return nextUser;
  }

  async function provisionSupabaseManagedUser({
    email,
    displayName,
    role,
    password,
    workspaceId = null,
    mustChangePassword = false,
  }) {
    if (!isSupabaseConfigured()) {
      return { status: "skipped", user: null };
    }

    const client = await getSupabaseClient();
    const functionName = getSupabaseProvisionFunctionName();
    let data;
    let error;

    try {
      ({ data, error } = await withNetworkTimeout(
        client.functions.invoke(functionName, {
          body: {
            email,
            displayName,
            role: normalizeRoleLabel(role || DEFAULT_AUTH_ROLE),
            password,
            workspaceId: workspaceId ? normalizeWorkspaceId(workspaceId) : null,
            mustChangePassword: Boolean(mustChangePassword),
          },
        }),
      ));
    } catch (requestError) {
      return {
        status: "error",
        user: null,
        message: formatSupabaseAuthError(requestError, "Could not provision this account in Supabase."),
      };
    }

    if (error) {
      return {
        status: "error",
        user: null,
        message: formatSupabaseAuthError(error, "Could not provision this account in Supabase."),
      };
    }

    const payload = data && typeof data === "object" ? data : null;

    if (!payload || payload.ok === false) {
      return {
        status: "error",
        user: null,
        message:
          String(payload?.message || "").trim() || "Could not provision this account in Supabase.",
      };
    }

    const user = upsertProvisionedSupabaseUserLocal({
      id: payload.user?.id || null,
      email: payload.user?.email || email,
      displayName: payload.user?.displayName || displayName,
      role: payload.user?.role || role,
      provider: payload.user?.provider || "password",
      workspaceId: payload.user?.workspaceId || workspaceId,
      mustChangePassword:
        payload.user?.mustChangePassword !== undefined
          ? Boolean(payload.user.mustChangePassword)
          : Boolean(mustChangePassword),
      status: "active",
    });

    if (!user) {
      return {
        status: "error",
        user: null,
        message: "Supabase provisioned this account, but local sync failed.",
      };
    }

    const returnedStatus = String(payload.status || "").trim().toLowerCase();
    let status = "updated";

    if (returnedStatus === "created") {
      status = "created";
    } else if (returnedStatus === "existing_google") {
      status = "existing_google";
    } else if (payload.user?.provider === "google") {
      status = "existing_google";
    }

    return {
      status,
      user,
      message: String(payload.message || "").trim(),
    };
  }

  async function submitPublicAdmissionToSupabase({
    workspaceId,
    institutionId = "",
    payload,
  }) {
    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        message: "Supabase is not configured for online admissions yet.",
      };
    }

    const config = getSupabaseConfig();
    const functionName = getSupabaseAdmissionsSubmitFunctionName();
    const url = String(config?.url || "").replace(/\/+$/g, "");
    const anonKey = String(config?.anonKey || "").trim();

    if (!url || !anonKey) {
      return {
        ok: false,
        message: "Supabase URL or anon key is missing.",
      };
    }

    const endpoint = `${url}/functions/v1/${encodeURIComponent(functionName)}`;
    let response;

    try {
      response = await withNetworkTimeout(
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
          },
          body: JSON.stringify({
            workspaceId: normalizeWorkspaceId(workspaceId || "public"),
            institutionId: String(institutionId || "").trim(),
            payload,
          }),
        }),
      );
    } catch (error) {
      return {
        ok: false,
        message: formatSupabaseAuthError(error, "Could not submit this application online."),
      };
    }

    let responsePayload = null;
    try {
      responsePayload = await response.json();
    } catch {
      responsePayload = null;
    }

    if (!response.ok || !responsePayload || responsePayload.ok === false) {
      return {
        ok: false,
        message:
          String(responsePayload?.message || "").trim() ||
          "Could not submit this application online.",
      };
    }

    return {
      ok: true,
      record: responsePayload.record || null,
      institutionId: responsePayload.institutionId || null,
      workspaceId: responsePayload.workspaceId || null,
    };
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function isGoogleAuthEmail(email) {
    return EMAIL_REGEX.test(email);
  }

  function isStrongPassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function createToken() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }

  async function hashSecret(secret) {
    if (window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
      const bytes = new TextEncoder().encode(secret);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    return btoa(unescape(encodeURIComponent(secret)));
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  }

  function buildDisplayName(email) {
    const localPart = normalizeEmail(email).split("@")[0];
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  async function upsertManagedPasswordUser({
    email,
    displayName,
    role,
    password,
    workspaceId = null,
    preserveExistingPassword = true,
    forcePasswordReset = false,
  }) {
    const trimmedEmail = String(email || "").trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return { status: "invalid_email", user: null };
    }

    const normalizedEmail = normalizeEmail(trimmedEmail);
    const users = getUsers();
    const existingIndex = users.findIndex((user) => user.normalizedEmail === normalizedEmail);
    const normalizedRole = normalizeRoleLabel(role || DEFAULT_AUTH_ROLE);
    const normalizedWorkspaceId = normalizeWorkspaceId(
      workspaceId || (normalizedRole === "Admin" ? normalizedEmail : null),
    );
    const now = nowIso();
    const preferredDisplayName =
      String(displayName || "").trim() || buildDisplayName(trimmedEmail) || "School User";
    const passwordValue = String(password || "");
    const nextPasswordHash = passwordValue ? await hashSecret(passwordValue) : null;

    if (existingIndex >= 0) {
      const existingUser = users[existingIndex];

      if (existingUser.provider === "google" && !existingUser.passwordHash) {
        users[existingIndex] = normalizeUserRecord({
          ...existingUser,
          displayName: existingUser.displayName || preferredDisplayName,
          role: normalizedRole,
          workspaceId: existingUser.workspaceId || normalizedWorkspaceId,
          status: "active",
          isConfirmed: true,
          confirmedAt: existingUser.confirmedAt || now,
          updatedAt: now,
        });
        saveUsers(users);
        return { status: "existing_google", user: users[existingIndex] };
      }

      const shouldSetPassword =
        Boolean(nextPasswordHash) &&
        (!preserveExistingPassword || !existingUser.passwordHash);
      const nextUser = {
        ...existingUser,
        email: trimmedEmail,
        normalizedEmail,
        displayName: preferredDisplayName,
        role: normalizedRole,
        workspaceId: existingUser.workspaceId || normalizedWorkspaceId,
        provider: "password",
        status: "active",
        isConfirmed: true,
        confirmationToken: null,
        confirmationSentAt: null,
        confirmedAt: existingUser.confirmedAt || now,
        updatedAt: now,
      };

      if (shouldSetPassword) {
        nextUser.passwordHash = nextPasswordHash;
        nextUser.mustChangePassword = Boolean(forcePasswordReset);
      }

      users[existingIndex] = normalizeUserRecord(nextUser);
      saveUsers(users);
      return { status: "updated", user: users[existingIndex], passwordSet: shouldSetPassword };
    }

    const userRecord = normalizeUserRecord({
      id: createId(),
      email: trimmedEmail,
      normalizedEmail,
      displayName: preferredDisplayName,
      workspaceId: normalizedWorkspaceId,
      passwordHash: nextPasswordHash,
      provider: "password",
      role: normalizedRole,
      isConfirmed: true,
      confirmationToken: null,
      confirmationSentAt: null,
      confirmedAt: now,
      createdAt: now,
      lastLoginAt: null,
      status: "active",
      mustChangePassword: Boolean(forcePasswordReset),
    });

    users.push(userRecord);
    saveUsers(users);
    return { status: "created", user: userRecord, passwordSet: Boolean(nextPasswordHash) };
  }

  async function provisionParentAccountsForStudent(studentPayload) {
    const guardians = Array.isArray(studentPayload?.guardians) ? studentPayload.guardians : [];
    const guardiansWithEmail = guardians.filter(
      (guardian) => guardian?.email && EMAIL_REGEX.test(String(guardian.email).trim()),
    );

    if (!guardiansWithEmail.length) {
      return {
        created: [],
        updated: [],
        existingGoogle: [],
        failed: [],
      };
    }

    const uniqueByEmail = new Map();
    guardiansWithEmail.forEach((guardian) => {
      uniqueByEmail.set(normalizeEmail(guardian.email), guardian);
    });

    const created = [];
    const updated = [];
    const existingGoogle = [];
    const failed = [];
    const workspaceId = getCurrentWorkspaceId();

    for (const guardian of uniqueByEmail.values()) {
      let result = isSupabaseConfigured()
        ? await provisionSupabaseManagedUser({
            email: guardian.email,
            displayName: guardian.name || buildDisplayName(guardian.email),
            role: "Parent",
            password: DEFAULT_PARENT_PASSWORD,
            workspaceId,
            mustChangePassword: true,
          })
        : await upsertManagedPasswordUser({
            email: guardian.email,
            displayName: guardian.name || buildDisplayName(guardian.email),
            role: "Parent",
            password: DEFAULT_PARENT_PASSWORD,
            workspaceId,
            preserveExistingPassword: true,
            forcePasswordReset: true,
          });

      if (!result.user && isSupabaseConfigured()) {
        const localFallback = await upsertManagedPasswordUser({
          email: guardian.email,
          displayName: guardian.name || buildDisplayName(guardian.email),
          role: "Parent",
          password: DEFAULT_PARENT_PASSWORD,
          workspaceId,
          preserveExistingPassword: true,
          forcePasswordReset: true,
        });

        if (localFallback.user) {
          result = {
            ...localFallback,
            message: result.message || "Supabase parent provisioning failed. Local fallback account created.",
          };
        }
      }

      if (!result.user) {
        failed.push({
          email: guardian.email,
          message: result.message || "Parent account could not be created.",
        });
        continue;
      }

      upsertAccessGrant({
        email: result.user.email,
        role: "Parent",
        authMethod: result.user.provider === "google" ? "google" : "password",
        status: "active",
      }, workspaceId);
      markAccessGrantClaimed(
        result.user.email,
        "Parent",
        result.user.provider === "google" ? "google" : "password",
        result.user.id,
        workspaceId,
      );

      if (result.status === "created") {
        created.push(result.user);
        recordAuditEvent({
          action: "created",
          entityType: "parent-account",
          entityId: result.user.email,
          summary: `Created parent login for ${guardian.name || result.user.email}`,
          details: `Linked to student ${studentPayload.admissionNo || studentPayload.fullName || "record"} • Default password issued`,
        });
      } else if (result.status === "updated") {
        updated.push(result.user);
      } else if (result.status === "existing_google") {
        existingGoogle.push(result.user);
      } else {
        updated.push(result.user);
      }
    }

    return { created, updated, existingGoogle, failed };
  }

  function upsertLocalUserFromSupabase(authUser, roleOverride, workspaceOverride) {
    const email = authUser.email || "";
    const normalizedEmail = normalizeEmail(email);
    const provider =
      authUser.app_metadata?.provider ||
      authUser.identities?.[0]?.provider ||
      "password";
    const displayName =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      buildDisplayName(email) ||
      "School User";
    const users = getUsers();
    const existingIndex = users.findIndex((user) => user.id === authUser.id || user.normalizedEmail === normalizedEmail);
    const existingRole = existingIndex >= 0 ? users[existingIndex].role : null;
    const role = normalizeRoleLabel(
      authUser.user_metadata?.role ||
        existingRole ||
        roleOverride ||
        DEFAULT_AUTH_ROLE,
    );
    const workspaceId = normalizeWorkspaceId(
      workspaceOverride ||
        authUser.user_metadata?.workspace_id ||
        (existingIndex >= 0 ? users[existingIndex].workspaceId : null) ||
        (role === "Admin" ? normalizedEmail : null),
    );
    const record = {
      id: authUser.id,
      email,
      normalizedEmail,
      displayName,
      workspaceId,
      passwordHash: existingIndex >= 0 ? users[existingIndex].passwordHash : null,
      provider,
      role,
      isConfirmed: Boolean(authUser.email_confirmed_at || provider === "google"),
      confirmationToken: null,
      confirmationSentAt: existingIndex >= 0 ? users[existingIndex].confirmationSentAt : null,
      confirmedAt: authUser.email_confirmed_at || nowIso(),
      createdAt: authUser.created_at || (existingIndex >= 0 ? users[existingIndex].createdAt : nowIso()),
      lastLoginAt: nowIso(),
      status: existingIndex >= 0 ? normalizeUserStatus(users[existingIndex].status) : "active",
      mustChangePassword: existingIndex >= 0 ? Boolean(users[existingIndex].mustChangePassword) : false,
    };

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...record,
      };
    } else {
      users.push(record);
    }

    saveUsers(users);
    return record;
  }

  function formatSupabaseAuthError(error, fallbackMessage) {
    const message = String(error?.message || fallbackMessage || "").trim();

    if (!message) {
      return fallbackMessage || "Something went wrong. Please try again.";
    }

    if (/invalid login credentials/i.test(message)) {
      return "Your email or password is incorrect.";
    }

    if (/email not confirmed/i.test(message)) {
      return "Please confirm your email from the Supabase message before signing in.";
    }

    if (/already registered|already been registered/i.test(message)) {
      return "This email is already registered. Try signing in instead.";
    }

    if (/network_timeout/i.test(message)) {
      return "The network is slow right now. Your form is saved locally, so you can retry in a moment.";
    }

    return message;
  }

  async function syncSupabaseSessionToLocal(options = {}) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const {
      preferredRole = null,
      preferredWorkspaceId = null,
      redirectAuthenticatedAuthPages = true,
    } = options;
    const client = await getSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      const localSession = getSession();

      if (localSession?.source === "supabase") {
        clearSession();
      }

      return null;
    }

    const localSession = getSession();
    consumePendingRole();
    const provider =
      session.user.app_metadata?.provider ||
      session.user.identities?.[0]?.provider ||
      "password";
    const providerKey = provider === "google" ? "google" : "password";
    const usersBeforeSync = getUsers();
    const existingLocalUser =
      usersBeforeSync.find(
        (entry) =>
          entry.id === session.user.id ||
          entry.normalizedEmail === normalizeEmail(session.user.email || ""),
      ) || null;
    const activeGrant = getProvisioningGrant(session.user.email || "", null, providerKey);
    const roleToApply = normalizeRoleLabel(
      preferredRole ||
        session.user.user_metadata?.role ||
        activeGrant?.role ||
        existingLocalUser?.role ||
        DEFAULT_AUTH_ROLE,
    );
    const workspaceToApply = normalizeWorkspaceId(
      preferredWorkspaceId ||
        activeGrant?.workspaceId ||
        existingLocalUser?.workspaceId ||
        session.user.user_metadata?.workspace_id ||
        localSession?.workspaceId ||
        (roleToApply === "Admin" ? normalizeEmail(session.user.email || "") : null),
    );

    if (existingLocalUser && isUserDeactivated(existingLocalUser)) {
      await client.auth.signOut();
      clearSession();
      setAccessGuardNotice("This account is deactivated. Contact an administrator for reactivation.");

      if (getPage() !== "login") {
        window.location.assign("./login.html");
      }

      return null;
    }

    const mirroredUser = upsertLocalUserFromSupabase(
      session.user,
      roleToApply,
      workspaceToApply,
    );

    if (!existingLocalUser) {
      markAccessGrantClaimed(
        mirroredUser.email,
        mirroredUser.role,
        providerKey,
        mirroredUser.id,
        mirroredUser.workspaceId,
      );
    }

    const remember = getAuthPersistencePreference() !== "session";

    setSession(
      {
        userId: mirroredUser.id,
        email: mirroredUser.email,
        displayName: mirroredUser.displayName,
        role: mirroredUser.role,
        provider: mirroredUser.provider,
        workspaceId: mirroredUser.workspaceId,
        persistence: remember ? "persistent" : "session",
        signedInAt: session.created_at || nowIso(),
        source: "supabase",
      },
      remember,
    );

    if ((getPage() === "login" || getPage() === "signup") && redirectAuthenticatedAuthPages) {
      window.location.assign(getRoleHomeRoute(mirroredUser.role));
    }

    return { session, user: mirroredUser };
  }

  async function initSupabaseAuthBridge() {
    if (!isSupabaseConfigured()) {
      return;
    }

    const client = await getSupabaseClient();

    client.auth.onAuthStateChange((event) => {
      setTimeout(async () => {
        if (event === "SIGNED_OUT") {
          clearSession();

          if (
            getPage() === "portal" ||
            getPage().startsWith("admin-") ||
            getPage().startsWith("parent-") ||
            getPage() === "user-settings"
          ) {
            window.location.assign("./login.html");
          }

          return;
        }

        await syncSupabaseSessionToLocal({
          redirectAuthenticatedAuthPages: false,
        });
      }, 0);
    });

    await syncSupabaseSessionToLocal({
      redirectAuthenticatedAuthPages: true,
    });
  }

  function buildConfirmationUrl(token) {
    return `./confirm-email.html?token=${encodeURIComponent(token)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatTimestamp(iso) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  }

  function getDashboardSnapshot() {
    const users = getUsers();
    const workspaceId = getCurrentWorkspaceId();
    const studentManager = getStudentManager();
    const studentSummary =
      studentManager && typeof studentManager.summarize === "function"
        ? studentManager.summarize()
        : null;
    const attendanceManager = getAttendanceManager();
    const attendanceSummary =
      attendanceManager && typeof attendanceManager.summarize === "function"
        ? attendanceManager.summarize({ date: getTodayDateValue() })
        : null;
    const activeStaffCount = users.filter(
      (user) =>
        normalizeRoleLabel(user.role) === "Teacher" &&
        normalizeUserStatus(user.status) === "active" &&
        normalizeWorkspaceId(user.workspaceId) === workspaceId,
    ).length;

    return {
      activeStudents: studentSummary ? studentSummary.activeCount : null,
      staffCount: activeStaffCount,
      attendanceRate: attendanceSummary ? attendanceSummary.attendanceRate : null,
      activeIncidents: attendanceSummary
        ? (attendanceSummary.counts.absent || 0) + (attendanceSummary.counts.late || 0)
        : null,
      updatedAt: nowIso(),
    };
  }

  function getFirstName(value) {
    return String(value || "there")
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] || "there";
  }

  function getInitials(value) {
    const parts = String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (!parts.length) {
      return "S";
    }

    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  function getDayGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  function initAdminSidebarUi() {
    if (!document.body.classList.contains("admin-dashboard-page")) {
      return;
    }

    const shell = document.querySelector(".admin-dashboard-shell");
    const sidebar = document.querySelector(".admin-sidebar");

    if (!shell || !sidebar) {
      return;
    }

    const nav = sidebar.querySelector(".admin-sidebar-nav");

    const shouldInjectCourseLink = getPage() !== "user-settings" && !isParentPage();

    if (nav && shouldInjectCourseLink && !nav.querySelector('a[href="./admin-courses.html"]')) {
      const referenceLink = nav.querySelector('a[href="./admin-classes.html"]');
      const courseLink = document.createElement("a");
      const isCoursePage = getPage() === "admin-courses";
      courseLink.className = `admin-sidebar-link${isCoursePage ? " is-active" : ""}`;
      courseLink.href = "./admin-courses.html";
      courseLink.innerHTML = `
        <span class="admin-sidebar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 18h10"></path>
            <path d="M18.5 14.5v7"></path>
            <path d="M15 18h7"></path>
          </svg>
        </span>
        <span>Courses</span>
      `;

      if (referenceLink?.nextSibling) {
        nav.insertBefore(courseLink, referenceLink.nextSibling);
      } else {
        nav.append(courseLink);
      }
    } else if (nav && getPage() === "admin-courses") {
      nav.querySelectorAll(".admin-sidebar-link").forEach((link) => {
        const isActive = link.getAttribute("href") === "./admin-courses.html";
        link.classList.toggle("is-active", isActive);
      });
    }

    const shouldInjectAdmissionsLink =
      getPage() !== "user-settings" &&
      !isParentPage() &&
      !nav?.querySelector('a[href="./admin-admissions.html"]');

    if (nav && shouldInjectAdmissionsLink) {
      const studentsLink = nav.querySelector('a[href="./admin-students.html"]');
      const admissionsLink = document.createElement("a");
      const isAdmissionsPage = getPage() === "admin-admissions";
      admissionsLink.className = `admin-sidebar-link${isAdmissionsPage ? " is-active" : ""}`;
      admissionsLink.href = "./admin-admissions.html";
      admissionsLink.innerHTML = `
        <span class="admin-sidebar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z"></path>
            <path d="M6 10.5V15.8c0 .4.2.8.6 1 1.4.9 3.3 1.5 5.4 1.5s4-.6 5.4-1.5c.4-.2.6-.6.6-1v-5.3"></path>
          </svg>
        </span>
        <span>Admissions</span>
      `;

      if (studentsLink?.nextSibling) {
        nav.insertBefore(admissionsLink, studentsLink.nextSibling);
      } else {
        nav.append(admissionsLink);
      }
    } else if (nav && getPage() === "admin-admissions") {
      nav.querySelectorAll(".admin-sidebar-link").forEach((link) => {
        const isActive = link.getAttribute("href") === "./admin-admissions.html";
        link.classList.toggle("is-active", isActive);
      });
    }

    const shouldInjectFeesLink =
      getPage() !== "user-settings" &&
      !isParentPage() &&
      !nav?.querySelector('a[href="./admin-fees.html"]');

    if (nav && shouldInjectFeesLink) {
      const scheduleLink = nav.querySelector('a[href="./admin-schedule.html"]');
      const feesLink = document.createElement("a");
      const isFeesPage = getPage() === "admin-fees";
      feesLink.className = `admin-sidebar-link${isFeesPage ? " is-active" : ""}`;
      feesLink.href = "./admin-fees.html";
      feesLink.innerHTML = `
        <span class="admin-sidebar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2.5" y="6" width="19" height="12" rx="2"></rect>
            <path d="M2.5 10.5h19"></path>
            <path d="M7 14h4"></path>
          </svg>
        </span>
        <span>Fees</span>
      `;

      if (scheduleLink?.nextSibling) {
        nav.insertBefore(feesLink, scheduleLink.nextSibling);
      } else {
        nav.append(feesLink);
      }
    } else if (nav && getPage() === "admin-fees") {
      nav.querySelectorAll(".admin-sidebar-link").forEach((link) => {
        const isActive = link.getAttribute("href") === "./admin-fees.html";
        link.classList.toggle("is-active", isActive);
      });
    }

    const existingButton = document.querySelector("[data-sidebar-toggle]");
    const toggleButton = existingButton || document.createElement("button");

    if (!existingButton) {
      toggleButton.type = "button";
      toggleButton.className = "admin-sidebar-toggle";
      toggleButton.setAttribute("data-sidebar-toggle", "");
      toggleButton.setAttribute("aria-label", "Toggle sidebar");
      toggleButton.innerHTML = `
        <span class="admin-sidebar-toggle-icon" aria-hidden="true">‹</span>
      `;
      document.body.append(toggleButton);
    }

    const setCollapsed = (collapsed) => {
      document.body.classList.toggle("admin-sidebar-collapsed", collapsed);
      toggleButton.setAttribute("aria-expanded", String(!collapsed));
      toggleButton.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
      toggleButton.classList.toggle("is-collapsed", collapsed);
      const icon = toggleButton.querySelector(".admin-sidebar-toggle-icon");
      if (icon) {
        icon.textContent = collapsed ? "›" : "‹";
      }
      localStorage.setItem(ADMIN_SIDEBAR_STATE_KEY, collapsed ? "1" : "0");
    };

    const persisted = localStorage.getItem(ADMIN_SIDEBAR_STATE_KEY) === "1";
    setCollapsed(persisted);

    toggleButton.addEventListener("click", () => {
      const isCollapsed = document.body.classList.contains("admin-sidebar-collapsed");
      setCollapsed(!isCollapsed);
    });
  }

  function getFeatureModuleManager() {
    return window.SchoolSphereFeatureModules || null;
  }

  function getRolePermissionManager() {
    return window.SchoolSphereRolePermissions || null;
  }

  function getRolePermissionSnapshot(roleLabel) {
    const manager = getRolePermissionManager();

    if (!manager || typeof manager.getPermissions !== "function") {
      return null;
    }

    const normalizedRole = normalizeRoleLabel(roleLabel || DEFAULT_AUTH_ROLE);
    const permissions = manager.getPermissions();
    return permissions[normalizedRole] || permissions.Admin || null;
  }

  function canAccessPermission(roleLabel, permissionKey) {
    if (!permissionKey) {
      return true;
    }

    const permissionSnapshot = getRolePermissionSnapshot(roleLabel);

    if (!permissionSnapshot) {
      return /admin/i.test(normalizeRoleLabel(roleLabel));
    }

    return Boolean(permissionSnapshot[permissionKey]);
  }

  function getSchoolSettingsManager() {
    return window.SchoolSphereSiteSettings || null;
  }

  function getAcademicCycleManager() {
    return window.SchoolSphereAcademicCycles || null;
  }

  function getAcademicCalendarManager() {
    return window.SchoolSphereAcademicCalendar || null;
  }

  function getAdmissionConfigManager() {
    return window.SchoolSphereAdmissionConfig || null;
  }

  function getTimetableManager() {
    return window.SchoolSphereTimetable || null;
  }

  function getFeeItemManager() {
    return window.SchoolSphereFeeItems || null;
  }

  function normalizeFeeCategoryKey(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (["fee", "fees", "tuition", "school-fees", "school-fee", "levy", "levies"].includes(normalized)) {
      return "fees";
    }

    if (["uniform", "uniforms", "school-uniform"].includes(normalized)) {
      return "uniform";
    }

    if (["book", "books", "textbook", "textbooks"].includes(normalized)) {
      return "books";
    }

    if (["transport", "transportation", "bus", "bus-fee"].includes(normalized)) {
      return "transport";
    }

    if (["exam", "exams", "examination", "examination-fee"].includes(normalized)) {
      return "exam";
    }

    if (["boarding", "hostel", "accommodation"].includes(normalized)) {
      return "boarding";
    }

    return normalized || FEE_CATEGORY_FALLBACK;
  }

  function getFeeCategoryOption(value) {
    const category = normalizeFeeCategoryKey(value);
    const option = FEE_CATEGORY_OPTIONS.find((item) => item.value === category);
    if (option) {
      return option;
    }

    const label = category
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      value: category,
      label: label || "Fees",
      copy: "Custom school billing category.",
    };
  }

  function getFeeCategoryLabel(value) {
    return getFeeCategoryOption(value).label;
  }

  function getFeeCategoryOptionsForItems(items = []) {
    const known = new Map(FEE_CATEGORY_OPTIONS.map((option) => [option.value, option]));
    (Array.isArray(items) ? items : []).forEach((item) => {
      const category = normalizeFeeCategoryKey(item?.category || FEE_CATEGORY_FALLBACK);
      if (!known.has(category)) {
        known.set(category, getFeeCategoryOption(category));
      }
    });
    return Array.from(known.values());
  }

  function getClassManager() {
    return window.SchoolSphereClasses || null;
  }

  function getCourseManager() {
    return window.SchoolSphereCourses || null;
  }

  function getStudentManager() {
    return window.SchoolSphereStudents || null;
  }

  function getAttendanceManager() {
    return window.SchoolSphereAttendance || null;
  }

  function getDefaultAdminSchoolSettings() {
    return {
      schoolName: "SchoolSphere",
      logoUrl: "",
      schoolProfile: "",
      address: "",
      campusDetails: "",
      phone: "",
      website: "",
      academicYearStart: "",
      academicYearEnd: "",
      schoolTypes: ["primary", "secondary"],
      higherInstitutionType: "university",
      hasNursery: false,
      hasPrimary: true,
      hasSecondary: true,
      hasHigherInstitution: false,
    };
  }

  const SCHOOL_TYPE_LABELS = {
    nursery: "Nursery",
    primary: "Primary",
    secondary: "Secondary",
    higher: "Higher Institution",
  };
  const SCHOOL_TYPE_ORDER = ["nursery", "primary", "secondary", "higher"];
  const SECONDARY_LEVEL_TEMPLATES = [
    "Junior Secondary School 1 (JSS1)",
    "Junior Secondary School 2 (JSS2)",
    "Junior Secondary School 3 (JSS3)",
    "Senior Secondary School 1 (SSS1)",
    "Senior Secondary School 2 (SSS2)",
    "Senior Secondary School 3 (SSS3)",
  ];
  const HIGHER_INSTITUTION_TYPE_LABELS = {
    university: "University",
    polytechnic: "Polytechnic",
    "college-of-education": "Federal College of Education",
  };
  const HIGHER_INSTITUTION_LEVEL_TEMPLATES = {
    university: [
      "100 Level",
      "200 Level",
      "300 Level",
      "400 Level",
      "500 Level",
      "600 Level",
      "700 Level",
    ],
    polytechnic: ["ND I", "ND II", "HND I", "HND II"],
    "college-of-education": ["NCE I", "NCE II", "NCE III"],
  };
  const HIGHER_INSTITUTION_DEPARTMENT_TEMPLATES = {
    university: {
      "Faculty of Science": [
        "Computer Science",
        "Microbiology",
        "Biochemistry",
        "Mathematics",
        "Physics",
        "Chemistry",
      ],
      "Faculty of Arts": [
        "English and Literary Studies",
        "History and International Studies",
        "Linguistics",
        "Philosophy",
        "Theatre Arts",
      ],
      "Faculty of Social Sciences": [
        "Economics",
        "Political Science",
        "Sociology",
        "Psychology",
        "Mass Communication",
      ],
      "Faculty of Management Sciences": [
        "Accounting",
        "Business Administration",
        "Banking and Finance",
        "Marketing",
        "Public Administration",
      ],
      "Faculty of Education": [
        "Educational Management",
        "Guidance and Counselling",
        "Science Education",
        "Primary Education Studies",
      ],
      "Faculty of Engineering": [
        "Civil Engineering",
        "Electrical/Electronics Engineering",
        "Mechanical Engineering",
        "Computer Engineering",
        "Chemical Engineering",
      ],
      "Faculty of Health Sciences": [
        "Nursing Science",
        "Public Health",
        "Medical Laboratory Science",
        "Anatomy",
        "Physiology",
      ],
      "Faculty of Law": ["Law"],
    },
    polytechnic: {
      "School of Engineering Technology": [
        "Civil Engineering Technology",
        "Electrical/Electronics Engineering Technology",
        "Mechanical Engineering Technology",
        "Computer Engineering Technology",
      ],
      "School of Environmental Technology": [
        "Architecture",
        "Building Technology",
        "Estate Management",
        "Quantity Surveying",
        "Urban and Regional Planning",
      ],
      "School of Applied Sciences": [
        "Computer Science",
        "Science Laboratory Technology",
        "Statistics",
        "Food Technology",
      ],
      "School of Business and Management Studies": [
        "Accountancy",
        "Business Administration and Management",
        "Banking and Finance",
        "Marketing",
        "Public Administration",
      ],
      "School of Communication and Information Technology": [
        "Mass Communication",
        "Office Technology and Management",
        "Library and Information Science",
      ],
    },
    "college-of-education": {
      "School of Education": [
        "Educational Foundation",
        "Curriculum and Instruction",
        "Guidance and Counselling",
        "Primary Education Studies",
      ],
      "School of Arts and Social Sciences": [
        "Christian Religious Studies Education",
        "Islamic Studies Education",
        "Social Studies Education",
        "Economics Education",
        "Political Science Education",
      ],
      "School of Languages": [
        "English Education",
        "Yoruba Education",
        "Hausa Education",
        "Igbo Education",
        "French Education",
      ],
      "School of Sciences": [
        "Computer Science Education",
        "Mathematics Education",
        "Biology Education",
        "Chemistry Education",
        "Physics Education",
      ],
      "School of Vocational and Technical Education": [
        "Business Education",
        "Agricultural Education",
        "Home Economics Education",
        "Fine and Applied Arts Education",
      ],
    },
  };
  const SCHOOL_TYPE_LEVEL_TEMPLATES = {
    nursery: ["Nursery 1", "Nursery 2", "Nursery 3"],
    primary: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"],
    secondary: SECONDARY_LEVEL_TEMPLATES,
    higher: HIGHER_INSTITUTION_LEVEL_TEMPLATES.university,
  };

  function normalizeExplicitSchoolTypeList(value = []) {
    const rawTypes = Array.isArray(value)
      ? value
      : String(value || "")
          .split(",")
          .map((item) => item.trim());

    return Array.from(
      new Set(rawTypes.map((type) => String(type || "").trim()).filter((type) => SCHOOL_TYPE_ORDER.includes(type))),
    );
  }

  function normalizeHigherInstitutionType(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

    if (normalized === "poly" || normalized === "polytechnic") {
      return "polytechnic";
    }

    if (
      normalized === "college" ||
      normalized === "college-of-education" ||
      normalized === "federal-college" ||
      normalized === "federal-college-of-education" ||
      normalized === "fce"
    ) {
      return "college-of-education";
    }

    if (normalized === "university" || normalized === "uni") {
      return "university";
    }

    return getDefaultAdminSchoolSettings().higherInstitutionType;
  }

  function getHigherInstitutionTypeLabel(value) {
    const type = normalizeHigherInstitutionType(value);
    return HIGHER_INSTITUTION_TYPE_LABELS[type] || "Higher Institution";
  }

  function getHigherInstitutionUnitLabel(value) {
    const type = normalizeHigherInstitutionType(value);
    return type === "university" ? "Faculty" : "School";
  }

  function normalizeConfiguredSchoolTypes(settings = {}) {
    if (Array.isArray(settings.schoolTypes)) {
      return normalizeExplicitSchoolTypeList(settings.schoolTypes);
    }

    if (String(settings.schoolTypes || "").trim()) {
      return normalizeExplicitSchoolTypeList(settings.schoolTypes);
    }

    return [
      settings.hasNursery ? "nursery" : null,
      settings.hasPrimary === false ? null : "primary",
      settings.hasSecondary === false ? null : "secondary",
      settings.hasHigherInstitution ? "higher" : null,
    ].filter(Boolean);
  }

  function getConfiguredSchoolSettings() {
    const manager = getSchoolSettingsManager();
    return manager?.getSettings ? manager.getSettings() : getDefaultAdminSchoolSettings();
  }

  function getConfiguredSchoolTypes() {
    const manager = getSchoolSettingsManager();
    const settings = getConfiguredSchoolSettings();
    const enabledTypes = manager?.getEnabledSchoolTypes
      ? manager.getEnabledSchoolTypes()
      : normalizeConfiguredSchoolTypes(settings);
    const normalized = normalizeConfiguredSchoolTypes({ ...settings, schoolTypes: enabledTypes });
    return normalized.length ? normalized : getDefaultAdminSchoolSettings().schoolTypes;
  }

  function getConfiguredHigherInstitutionType(settings = getConfiguredSchoolSettings()) {
    return normalizeHigherInstitutionType(settings.higherInstitutionType);
  }

  function getConfiguredHigherInstitutionLevelTemplates(settings = getConfiguredSchoolSettings()) {
    const higherType = getConfiguredHigherInstitutionType(settings);
    return HIGHER_INSTITUTION_LEVEL_TEMPLATES[higherType] || HIGHER_INSTITUTION_LEVEL_TEMPLATES.university;
  }

  function isConfiguredHigherInstitutionLevel(levelValue, settings = getConfiguredSchoolSettings()) {
    const levelToken = normalizeLevelToken(levelValue);
    if (!levelToken) {
      return false;
    }

    return getConfiguredHigherInstitutionLevelTemplates(settings).some(
      (level) => normalizeLevelToken(level) === levelToken,
    );
  }

  function getConfiguredSchoolTypeLevelTemplates(settings = getConfiguredSchoolSettings()) {
    return {
      ...SCHOOL_TYPE_LEVEL_TEMPLATES,
      higher: getConfiguredHigherInstitutionLevelTemplates(settings),
    };
  }

  function getConfiguredHigherInstitutionDepartmentMap(settings = getConfiguredSchoolSettings()) {
    const higherType = getConfiguredHigherInstitutionType(settings);
    return HIGHER_INSTITUTION_DEPARTMENT_TEMPLATES[higherType] || HIGHER_INSTITUTION_DEPARTMENT_TEMPLATES.university;
  }

  function inferSchoolTypeFromLevel(levelValue) {
    const token = normalizeLevelToken(levelValue);
    if (!token) return "";
    if (token.startsWith("nursery") || token.startsWith("creche") || token.startsWith("playgroup") || token.startsWith("kindergarten")) {
      return "nursery";
    }
    if (token.startsWith("primary")) return "primary";
    if (/^(jss|sss)\d/.test(token)) return "secondary";
    if (/^\d{3}level$/.test(token) || /^level\d{3}$/.test(token) || /^(nd|hnd|nce)[123]$/.test(token)) {
      return "higher";
    }
    return "";
  }

  function getConfiguredStudentLevelGroups() {
    const settings = getConfiguredSchoolSettings();
    const configuredTypes = getConfiguredSchoolTypes().filter((type) => SCHOOL_TYPE_ORDER.includes(type));
    const levelTemplates = getConfiguredSchoolTypeLevelTemplates(settings);
    const groups = new Map();
    const customLevels = [];
    const addLevel = (group, level) => {
      const normalizedLevel = String(level || "").trim();
      if (!normalizedLevel) {
        return;
      }
      if (!group.levels.some((item) => normalizeLevelToken(item) === normalizeLevelToken(normalizedLevel))) {
        group.levels.push(normalizedLevel);
      }
    };

    configuredTypes.forEach((type) => {
      const label =
        type === "higher"
          ? `${SCHOOL_TYPE_LABELS.higher} - ${getHigherInstitutionTypeLabel(settings.higherInstitutionType)}`
          : SCHOOL_TYPE_LABELS[type] || type;
      const group = { type, label, levels: [] };
      (levelTemplates[type] || []).forEach((level) => addLevel(group, level));
      groups.set(type, group);
    });

    const classManager = getClassManager();
    const classes = classManager && typeof classManager.getClasses === "function"
      ? classManager.getClasses().filter((record) => record.status !== "archived")
      : [];

    classes.forEach((record) => {
      const level = String(record.level || "").trim();
      if (!level) {
        return;
      }

      const type = inferSchoolTypeFromLevel(level);
      if (type === "higher" && !isConfiguredHigherInstitutionLevel(level, settings)) {
        return;
      }
      if (type && groups.has(type)) {
        addLevel(groups.get(type), level);
        return;
      }

      if (!type && !customLevels.some((item) => normalizeLevelToken(item) === normalizeLevelToken(level))) {
        customLevels.push(level);
      }
    });

    const orderedGroups = configuredTypes
      .map((type) => groups.get(type))
      .filter((group) => group && group.levels.length);

    if (customLevels.length) {
      orderedGroups.push({
        type: "custom",
        label: "Custom class levels",
        levels: customLevels.sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
      });
    }

    return orderedGroups;
  }

  function getConfiguredStudentLevelOptions() {
    return getConfiguredStudentLevelGroups().flatMap((group) => group.levels);
  }

  function renderStudentLevelSelectOptions(select, selectedValue = "") {
    if (!(select instanceof HTMLSelectElement)) {
      return [];
    }

    const groups = getConfiguredStudentLevelGroups();
    const levels = groups.flatMap((group) => group.levels);
    const selected = String(selectedValue || select.value || "").trim();
    const matchingSelectedLevel = levels.find((level) => normalizeLevelToken(level) === normalizeLevelToken(selected)) || "";
    const hasSelected = Boolean(matchingSelectedLevel);
    const customSelectedOption =
      selected && !hasSelected
        ? `<option value="${escapeHtml(selected)}" selected>${escapeHtml(selected)} (current)</option>`
        : "";

    select.innerHTML = `
      <option value="">${levels.length ? "Select level/class" : "Select school type in Settings first"}</option>
      ${groups
        .map(
          (group) => `
            <optgroup label="${escapeHtml(group.label)}">
              ${group.levels.map((level) => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`).join("")}
            </optgroup>
          `,
        )
        .join("")}
      ${customSelectedOption}
    `;

    if (selected) {
      select.value = matchingSelectedLevel || selected;
    }
    return levels;
  }

  function renderConfiguredSchoolTypeSelect(select, { includeCombined = false } = {}) {
    if (!(select instanceof HTMLSelectElement)) {
      return "";
    }

    const previousValue = String(select.value || "").trim();
    const settings = getConfiguredSchoolSettings();
    const enabledTypes = getConfiguredSchoolTypes();
    const options = enabledTypes
      .filter((type) => SCHOOL_TYPE_ORDER.includes(type))
      .map((type) => ({
        value: type,
        label:
          type === "higher"
            ? `${SCHOOL_TYPE_LABELS.higher} (${getHigherInstitutionTypeLabel(settings.higherInstitutionType)})`
            : SCHOOL_TYPE_LABELS[type] || type,
      }));
    const combinedTypes = enabledTypes.filter((type) => ["nursery", "primary", "secondary"].includes(type));

    if (includeCombined && combinedTypes.length > 1) {
      options.push({ value: "combined", label: "Combined School" });
    }

    select.innerHTML = `
      <option value="">Select school type</option>
      ${options
        .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
        .join("")}
    `;

    if (options.some((option) => option.value === previousValue)) {
      select.value = previousValue;
      return previousValue;
    }

    select.value = "";
    return "";
  }

  function getAdminAccessContext() {
    const session = getSession();

    if (!session) {
      return {
        session: null,
        user: null,
        roleLabel: "Guest access",
        isAdmin: false,
      };
    }

    const user = getUsers().find((entry) => entry.id === session.userId) || null;

    if (!user) {
      clearSession();
      return {
        session: null,
        user: null,
        roleLabel: "Guest access",
        isAdmin: false,
      };
    }

    const roleLabel = normalizeRoleLabel(session.role || user.role || DEFAULT_AUTH_ROLE);

    return {
      session,
      user,
      roleLabel,
      isAdmin: /admin/i.test(roleLabel),
    };
  }

  function recordAuditEvent(entry = {}) {
    const session = getSession();
    const user = session ? getUsers().find((item) => item.id === session.userId) || null : null;
    const actorName =
      String(entry.actorName || "").trim() ||
      user?.displayName ||
      user?.email ||
      "System";
    const workspaceId = normalizeWorkspaceId(
      entry.workspaceId || session?.workspaceId || user?.workspaceId || getCurrentWorkspaceId(),
    );

    return pushNotification(
      {
        ...entry,
        actorName,
        createdAt: entry.createdAt || nowIso(),
      },
      workspaceId,
    );
  }

  function applyAdminBranding(brandMark, brandName, brandSubtitle, manager) {
    if (!brandMark || !brandName || !brandSubtitle) {
      return;
    }

    const settings = manager ? manager.getSettings() : getDefaultAdminSchoolSettings();
    const subtitle =
      manager && manager.formatAcademicYearLabel(settings)
        ? manager.formatAcademicYearLabel(settings)
        : "Admin workspace";

    brandName.textContent = settings.schoolName || "SchoolSphere";
    brandSubtitle.textContent = subtitle || "Admin workspace";

    if (settings.logoUrl) {
      brandMark.classList.add("is-image");
      brandMark.innerHTML = `<img src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(
        settings.schoolName,
      )} logo" />`;
      return;
    }

    brandMark.classList.remove("is-image");
    brandMark.textContent = getInitials(settings.schoolName).charAt(0) || "S";
  }

  async function signOutCurrentUser() {
    if (isSupabaseConfigured()) {
      const client = await getSupabaseClient();
      await client.auth.signOut();
    }

    clearSession();
  }

  function wireSignOutButton(gate) {
    if (!gate) {
      return;
    }

    const activeSignOutButton = gate.querySelector("[data-signout]");

    if (!activeSignOutButton) {
      return;
    }

    activeSignOutButton.addEventListener("click", async () => {
      await signOutCurrentUser();
      window.location.assign("./login.html");
    });
  }

  function initClassManagementControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const formToggleButton =
      form.parentElement?.querySelector("[data-class-form-toggle]") ||
      document.querySelector("[data-class-form-toggle]");
    const courseManager = getCourseManager();
    const subjectField = form.elements.subjects;
    const classTeacherField = form.elements.classTeacher;
    const assignmentList = form.querySelector("[data-teacher-assignment-list]");
    const assignmentAddButton = form.querySelector("[data-assignment-add]");
    const assignmentRawInput = form.querySelector("[data-class-assignment-raw]");
    const templateType = document.querySelector("[data-class-template-type]");
    const templateArm = document.querySelector("[data-class-template-arm]");
    const templateCustomArm = document.querySelector("[data-class-template-custom-arm]");
    const templateStream = document.querySelector("[data-class-template-stream]");
    const templateCustomStream = document.querySelector("[data-class-template-custom-stream]");
    const templateFaculty = document.querySelector("[data-class-template-faculty]");
    const templateCustomFaculty = document.querySelector("[data-class-template-custom-faculty]");
    const templateDepartment = document.querySelector("[data-class-template-department]");
    const templateCustomDepartment = document.querySelector("[data-class-template-custom-department]");
    const templateCapacity = document.querySelector("[data-class-template-capacity]");
    const templateGenerateButton = document.querySelector("[data-class-template-generate]");
    const templateArmWrap = document.querySelector("[data-class-template-arm-wrap]");
    const templateCustomArmWrap = document.querySelector("[data-class-template-custom-arm-wrap]");
    const templateStreamWrap = document.querySelector("[data-class-template-stream-wrap]");
    const templateCustomStreamWrap = document.querySelector("[data-class-template-custom-stream-wrap]");
    const templateFacultyWrap = document.querySelector("[data-class-template-faculty-wrap]");
    const templateCustomFacultyWrap = document.querySelector("[data-class-template-custom-faculty-wrap]");
    const templateDepartmentWrap = document.querySelector("[data-class-template-department-wrap]");
    const templateCustomDepartmentWrap = document.querySelector("[data-class-template-custom-department-wrap]");

    const normalizeLookupToken = (value) => String(value || "").trim().toLowerCase();
    const normalizeClassArmName = (value) => String(value || "").trim().replace(/^Arm\s+/i, "");
    const normalizeClassNameLookup = (value) => normalizeLookupToken(normalizeClassArmName(value));

    const getActiveCourseCatalog = () => {
      if (!courseManager || typeof courseManager.getActiveCatalog !== "function") {
        return [];
      }

      return courseManager.getActiveCatalog().filter((course) => course.level && course.name);
    };

    const buildCourseLookup = (catalog = []) => {
      const lookup = new Set();
      catalog.forEach((course) => {
        lookup.add(normalizeLookupToken(course.name));
        lookup.add(normalizeLookupToken(course.code));
        lookup.add(normalizeLookupToken(course.label));
      });
      return lookup;
    };

    const updateCourseCatalogSuggestions = () => {
      const catalog = getActiveCourseCatalog();

      if (subjectField instanceof HTMLTextAreaElement) {
        subjectField.placeholder = catalog.length
          ? "Optional: use active course names from Course Management"
          : "Optional: add subjects later after creating courses";
      }
    };

    const getClassTemplates = () => {
      const templates = getConfiguredSchoolTypeLevelTemplates();
      return {
        nursery: { levels: templates.nursery || [] },
        primary: { levels: templates.primary || [] },
        secondary: { levels: templates.secondary || [] },
        higher: { levels: templates.higher || [] },
        combined: {
          levels: ["nursery", "primary", "secondary"].flatMap((schoolType) => templates[schoolType] || []),
        },
      };
    };

    const getTemplateLevels = (type) => {
      const classTemplates = getClassTemplates();
      if (type !== "combined") {
        return classTemplates[type]?.levels || [];
      }

      const enabledTypes = getConfiguredSchoolTypes().filter((schoolType) =>
        ["nursery", "primary", "secondary"].includes(schoolType),
      );
      return enabledTypes.flatMap((schoolType) => classTemplates[schoolType]?.levels || []);
    };

    const renderClassTemplateTypeOptions = () => {
      const selected = renderConfiguredSchoolTypeSelect(templateType, { includeCombined: true });
      if (!selected) {
        resetTemplateSelectionsForType();
      }
      return selected;
    };

    const facultyDepartments = getConfiguredHigherInstitutionDepartmentMap();

    const setTemplateFieldVisible = (wrapper, isVisible) => {
      if (wrapper) {
        wrapper.hidden = !isVisible;
      }
    };

    const replaceSelectOptions = (select, options = [], placeholder = "Select option") => {
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }
      select.innerHTML = "";
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = placeholder;
      select.appendChild(placeholderOption);
      options.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
      const customOption = document.createElement("option");
      customOption.value = "custom";
      customOption.textContent = "Other / custom";
      select.appendChild(customOption);
    };

    const getSelectedTemplateValue = (select, customInput) => {
      const selected = String(select?.value || "").trim();
      if (selected === "custom") {
        return String(customInput?.value || "").trim();
      }
      return selected;
    };

    const getTemplateTypeValue = () => String(templateType?.value || "").trim();

    const updateTemplateDepartmentOptions = () => {
      const currentDepartment = String(templateDepartment?.value || "").trim();
      const selectedFaculty = String(templateFaculty?.value || "").trim();
      const departmentOptions =
        selectedFaculty && selectedFaculty !== "custom" ? facultyDepartments[selectedFaculty] || [] : [];

      replaceSelectOptions(templateDepartment, departmentOptions, "Select department");

      if (templateDepartment && departmentOptions.includes(currentDepartment)) {
        templateDepartment.value = currentDepartment;
      }
    };

    const updateTemplateVisibility = () => {
      const type = getTemplateTypeValue();
      const usesArm = false;
      const usesStream = false;
      const usesHigherFields = type === "higher";
      const hasFacultySelection = usesHigherFields && Boolean(String(templateFaculty?.value || "").trim());
      const usesDepartment = usesHigherFields && hasFacultySelection;
      const usesCustomArm = usesArm && String(templateArm?.value || "") === "custom";
      const usesCustomStream = usesStream && String(templateStream?.value || "") === "custom";
      const usesCustomFaculty = usesHigherFields && String(templateFaculty?.value || "") === "custom";
      const usesCustomDepartment = usesDepartment && String(templateDepartment?.value || "") === "custom";
      const higherUnitLabel = getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType());

      setTemplateFieldVisible(templateArmWrap, usesArm);
      setTemplateFieldVisible(templateCustomArmWrap, usesCustomArm);
      setTemplateFieldVisible(templateStreamWrap, usesStream);
      setTemplateFieldVisible(templateCustomStreamWrap, usesCustomStream);
      setTemplateFieldVisible(templateFacultyWrap, usesHigherFields);
      setTemplateFieldVisible(templateCustomFacultyWrap, usesCustomFaculty);
      setTemplateFieldVisible(templateDepartmentWrap, usesDepartment);
      setTemplateFieldVisible(templateCustomDepartmentWrap, usesCustomDepartment);

      const facultyLabel = templateFacultyWrap?.querySelector("span");
      const customFacultyLabel = templateCustomFacultyWrap?.querySelector("span");
      if (facultyLabel) {
        facultyLabel.textContent = higherUnitLabel;
      }
      if (customFacultyLabel) {
        customFacultyLabel.textContent = `Custom ${higherUnitLabel.toLowerCase()}`;
      }
    };

    const resetTemplateSelectionsForType = () => {
      if (templateArm) {
        templateArm.value = "";
      }
      if (templateStream) {
        templateStream.value = "";
      }
      if (templateFaculty) {
        templateFaculty.value = "";
      }
      if (templateDepartment) {
        templateDepartment.value = "";
      }
      [templateCustomArm, templateCustomStream, templateCustomFaculty, templateCustomDepartment].forEach((input) => {
        if (input) {
          input.value = "";
        }
      });
      updateTemplateDepartmentOptions();
      updateTemplateVisibility();
    };

    const getTeacherDirectory = () => {
      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      return getUsers()
        .filter(
          (user) =>
            normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) === "Teacher" &&
            !isUserDeactivated(user) &&
            normalizeWorkspaceId(user.workspaceId || "public") === workspaceId,
        )
        .map((user) => ({
          value: String(user.email || "").trim(),
          label: user.displayName
            ? `${user.displayName} (${user.email})`
            : String(user.email || "").trim(),
        }))
        .filter((item) => item.value)
        .sort((left, right) => left.label.localeCompare(right.label));
    };

    const getSubjectOptions = () =>
      getActiveCourseCatalog()
        .map((course) => ({
          value: String(course.name || "").trim(),
          label: course.code ? `${course.name} (${course.code})` : String(course.name || "").trim(),
        }))
        .filter((item) => item.value);

    const buildSelectOptions = ({ options = [], selected = "", placeholder = "Select option" }) => {
      const normalizedSelected = String(selected || "").trim();
      const hasSelected =
        normalizedSelected &&
        options.some((option) => String(option.value || "").trim() === normalizedSelected);
      const selectedOption = hasSelected
        ? ""
        : normalizedSelected
          ? `<option value="${escapeHtml(normalizedSelected)}" selected>${escapeHtml(normalizedSelected)}</option>`
          : "";

      return `
        <option value="">${escapeHtml(placeholder)}</option>
        ${options
          .map(
            (option) => `
              <option value="${escapeHtml(option.value)}" ${
                String(option.value || "").trim() === normalizedSelected ? "selected" : ""
              }>
                ${escapeHtml(option.label || option.value)}
              </option>
            `,
          )
          .join("")}
        ${selectedOption}
      `;
    };

    const renderClassTeacherOptions = (selected = "") => {
      if (!(classTeacherField instanceof HTMLSelectElement)) {
        return;
      }

      classTeacherField.innerHTML = buildSelectOptions({
        options: getTeacherDirectory(),
        selected,
        placeholder: "Select teacher",
      });
    };

    const getTeacherAssignmentRows = () => {
      if (!assignmentList) {
        return [];
      }

      return Array.from(assignmentList.querySelectorAll("[data-assignment-row]")).map((row) => ({
        subject: row.querySelector('[data-assignment-field="subject"]')?.value.trim() || "",
        teacher: row.querySelector('[data-assignment-field="teacher"]')?.value.trim() || "",
      }));
    };

    const syncTeacherAssignmentRaw = () => {
      if (!assignmentRawInput) {
        return;
      }

      const lines = getTeacherAssignmentRows()
        .filter((item) => item.subject && item.teacher)
        .map((item) => `${item.subject}: ${item.teacher}`);
      assignmentRawInput.value = lines.join("\n");
    };

    const appendTeacherAssignmentRow = (assignment = {}, disabled = !isAdmin) => {
      if (!assignmentList) {
        return;
      }

      const subject = String(assignment.subject || "").trim();
      const teacher = String(assignment.teacher || "").trim();
      const row = document.createElement("div");
      row.className = "portal-assignment-row";
      row.dataset.assignmentRow = "true";
      row.innerHTML = `
        <select data-assignment-field="subject" ${disabled ? "disabled" : ""}>
          ${buildSelectOptions({
            options: getSubjectOptions(),
            selected: subject,
            placeholder: "Select subject",
          })}
        </select>
        <select data-assignment-field="teacher" ${disabled ? "disabled" : ""}>
          ${buildSelectOptions({
            options: getTeacherDirectory(),
            selected: teacher,
            placeholder: "Select teacher",
          })}
        </select>
        <button type="button" class="portal-assignment-remove" data-assignment-remove ${disabled ? "disabled" : ""}>Remove</button>
      `;
      assignmentList.appendChild(row);
      syncTeacherAssignmentRaw();
    };

    const renderTeacherAssignmentRows = (rows = []) => {
      if (!assignmentList) {
        return;
      }

      const normalizedRows = Array.isArray(rows) && rows.length ? rows : [{}];
      assignmentList.innerHTML = "";
      normalizedRows.forEach((row) => appendTeacherAssignmentRow(row, !isAdmin));
    };

    const parseTeacherAssignmentsFromBuilder = () => {
      const rows = getTeacherAssignmentRows();
      const items = [];
      const invalidLines = [];

      rows.forEach((row, index) => {
        const subject = String(row.subject || "").trim();
        const teacher = String(row.teacher || "").trim();

        if (!subject && !teacher) {
          return;
        }

        if (!subject || !teacher) {
          invalidLines.push(`row-${index + 1}`);
          return;
        }

        items.push({ subject, teacher });
      });

      return { items, invalidLines };
    };

    const setClassFormVisibility = (isVisible) => {
      form.hidden = !isVisible;

      if (formToggleButton) {
        formToggleButton.textContent = isVisible ? "Hide class form" : "Create class";
        formToggleButton.setAttribute("aria-expanded", String(isVisible));
      }
    };

    const toggleClassFormVisibility = () => {
      if (!isAdmin || !manager) {
        return;
      }

      const shouldOpen = form.hidden;

      setClassFormVisibility(shouldOpen);

      if (!shouldOpen) {
        clearPortalClassErrors(form);
        resetPortalClassForm(form, isAdmin);
        setStatus(status, "", "");
      }
    };

    form.addEventListener("input", () => {
      clearPortalClassErrors(form);

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    const refreshClassManagementSection = () => {
      renderPortalClassManagementSection({
        isAdmin,
        manager,
        summaryTarget,
        form,
        status,
        listTarget,
      });
      updateCourseCatalogSuggestions();
      renderClassTeacherOptions(classTeacherField?.value || "");
      const currentRows = getTeacherAssignmentRows();
      if (assignmentList) {
        renderTeacherAssignmentRows(currentRows.length ? currentRows : [{}]);
      }
    };

    refreshClassManagementSection();
    resetPortalClassForm(form, isAdmin);
    renderClassTeacherOptions("");
    renderTeacherAssignmentRows([{}]);
    setClassFormVisibility(false);
    renderClassTemplateTypeOptions();
    replaceSelectOptions(
      templateFaculty,
      Object.keys(facultyDepartments),
      `Select ${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType()).toLowerCase()}`,
    );
    updateTemplateDepartmentOptions();
    updateTemplateVisibility();

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleClassFormVisibility);
    }

    if (templateType) {
      templateType.addEventListener("change", resetTemplateSelectionsForType);
    }

    if (templateArm) {
      templateArm.addEventListener("change", updateTemplateVisibility);
    }

    if (templateStream) {
      templateStream.addEventListener("change", updateTemplateVisibility);
    }

    if (templateFaculty) {
      templateFaculty.addEventListener("change", () => {
        if (templateDepartment) {
          templateDepartment.value = "";
        }
        if (templateCustomDepartment) {
          templateCustomDepartment.value = "";
        }
        updateTemplateDepartmentOptions();
        updateTemplateVisibility();
      });
    }

    if (templateDepartment) {
      templateDepartment.addEventListener("change", updateTemplateVisibility);
    }

    if (templateGenerateButton) {
      templateGenerateButton.disabled = !isAdmin || !manager;
      templateGenerateButton.addEventListener("click", () => {
        if (!isAdmin || !manager) {
          setStatus(status, "info", "Only administrators can generate class templates.");
          return;
        }

        const type = getTemplateTypeValue();
        const templateLevels = getTemplateLevels(type);

        if (!templateLevels.length) {
          setStatus(status, "error", "Select a school type before generating classes.");
          return;
        }

        const faculty = getSelectedTemplateValue(templateFaculty, templateCustomFaculty);
        const department = getSelectedTemplateValue(templateDepartment, templateCustomDepartment);
        const templateArms = ["A", "B", "C", "D", "E", "F"];
        let generatedRecords = [];

        if (type === "higher") {
          if (!faculty || !department) {
            setStatus(
              status,
              "error",
              `Select or enter a ${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType()).toLowerCase()} and department first.`,
            );
            return;
          }
          generatedRecords = templateLevels.map((level) => ({
            level,
            name: `${faculty} - ${department}`,
            arms: [department],
          }));
        } else {
          generatedRecords = templateLevels.flatMap((level) =>
            templateArms.map((arm) => ({
              level,
              name: arm,
              arms: [arm],
            })),
          );
        }

        const capacity = Number.parseInt(templateCapacity?.value || "30", 10);
        const safeCapacity = Number.isFinite(capacity) && capacity > 0 ? capacity : 30;
        const existing = manager.getClasses();
        let created = 0;
        let skipped = 0;

        generatedRecords.forEach((templateRecord) => {
          const duplicate = existing.some(
            (record) =>
              normalizeLevelToken(record.level) === normalizeLevelToken(templateRecord.level) &&
              normalizeClassNameLookup(record.name) === normalizeClassNameLookup(templateRecord.name),
          );

          if (duplicate) {
            skipped += 1;
            return;
          }

          manager.upsertClass({
            level: templateRecord.level,
            name: templateRecord.name,
            capacity: safeCapacity,
            classTeacher: "",
            arms: templateRecord.arms,
            subjects: [],
            teacherAssignments: [],
            status: "active",
          });
          created += 1;
        });

        recordAuditEvent({
          action: "created",
          entityType: "class-template",
          entityId: type,
          summary: `Generated ${created} class records from template`,
          details: skipped ? `${skipped} duplicate class record(s) skipped` : "No duplicates skipped",
        });

        refreshClassManagementSection();
        setStatus(
          status,
          "success",
          `Generated <strong>${created}</strong> class${created === 1 ? "" : "es"}.${
            skipped ? ` Skipped ${skipped} existing class${skipped === 1 ? "" : "es"}.` : ""
          }`,
        );
      });
    }

    if (assignmentAddButton) {
      assignmentAddButton.disabled = !isAdmin;
      assignmentAddButton.addEventListener("click", () => {
        appendTeacherAssignmentRow({}, !isAdmin);
      });
    }

    if (assignmentList) {
      assignmentList.addEventListener("change", () => {
        syncTeacherAssignmentRaw();
      });

      assignmentList.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-assignment-remove]");

        if (!removeButton || !isAdmin) {
          return;
        }

        const row = removeButton.closest("[data-assignment-row]");
        if (!row) {
          return;
        }

        row.remove();

        if (!assignmentList.children.length) {
          appendTeacherAssignmentRow({}, !isAdmin);
        }

        syncTeacherAssignmentRaw();
      });
    }

    if (!manager) {
      setClassFormVisibility(false);
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can manage classes.");
        return;
      }

      clearPortalClassErrors(form);
      setStatus(status, "", "");

      const classId = form.elements.classId.value;
      const payload = {
        id: classId || undefined,
        name: form.elements.name.value.trim(),
        level: form.elements.level.value.trim(),
        capacity: form.elements.capacity.value,
        classTeacher: form.elements.classTeacher.value.trim(),
        arms: parseCommaSeparatedValues(form.elements.arms.value),
        subjects: parseCommaSeparatedValues(form.elements.subjects.value),
      };
      if (!payload.arms.length && payload.name) {
        payload.arms = [payload.name];
      }
      const assignmentParse = assignmentList
        ? parseTeacherAssignmentsFromBuilder()
        : parseTeacherAssignments(form.elements.teacherAssignments.value);
      payload.teacherAssignments = assignmentParse.items;
      const activeCourseCatalog = getActiveCourseCatalog();
      const courseLookup = buildCourseLookup(activeCourseCatalog);
      const unknownSubjects = payload.subjects.filter(
        (subject) => !courseLookup.has(normalizeLookupToken(subject)),
      );
      const unknownAssignmentSubjects = payload.teacherAssignments
        .filter((assignment) => activeCourseCatalog.length && !courseLookup.has(normalizeLookupToken(assignment.subject)))
        .map((assignment) => assignment.subject);

      let hasError = false;

      if (!payload.name) {
        setPortalClassError(form, "name", "Enter the class name.");
        hasError = true;
      }

      if (!payload.level) {
        setPortalClassError(form, "level", "Enter the level or grade.");
        hasError = true;
      }

      if (!payload.capacity) {
        setPortalClassError(form, "capacity", "Enter the class capacity.");
        hasError = true;
      } else if (!Number.isInteger(Number(payload.capacity)) || Number(payload.capacity) < 1) {
        setPortalClassError(form, "capacity", "Capacity must be a whole number above zero.");
        hasError = true;
      }

      if (payload.subjects.length && activeCourseCatalog.length && unknownSubjects.length) {
        setPortalClassError(
          form,
          "subjects",
          "Only active courses can be assigned. Update this list from Course Management.",
        );
        hasError = true;
      }

      if (assignmentParse.invalidLines.length) {
        setPortalClassError(
          form,
          "teacherAssignments",
          "Complete both subject and teacher for each assignment row.",
        );
        hasError = true;
      } else if (unknownAssignmentSubjects.length) {
        setPortalClassError(
          form,
          "teacherAssignments",
          "Each assignment subject must match an active course name or course code.",
        );
        hasError = true;
      }

      const duplicate = manager
        .getClasses()
        .find(
          (record) =>
            record.id !== classId &&
            record.name.toLowerCase() === payload.name.toLowerCase() &&
            record.level.toLowerCase() === payload.level.toLowerCase(),
        );

      if (duplicate) {
        setPortalClassError(
          form,
          "name",
          "This class name already exists for the selected level or grade.",
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted class details and try again.");
        return;
      }

      const currentRecord = manager.getClasses().find((record) => record.id === classId) || null;
      manager.upsertClass({
        ...currentRecord,
        ...payload,
        capacity: Number.parseInt(payload.capacity, 10),
        status: currentRecord ? currentRecord.status : "active",
      });
      recordAuditEvent({
        action: currentRecord ? "updated" : "created",
        entityType: "class",
        entityId: `${payload.level}-${payload.name}`,
        summary: currentRecord
          ? `Updated class ${payload.level} · ${payload.name}`
          : `Created class ${payload.level} · ${payload.name}`,
        details: `${payload.arms.length} arms • ${payload.subjects.length} subjects • ${payload.teacherAssignments.length} assignments`,
      });

      resetPortalClassForm(form, isAdmin);
      renderClassTeacherOptions("");
      renderTeacherAssignmentRows([{}]);
      clearFormDraftFor(form);
      setClassFormVisibility(false);
      setStatus(
        status,
        "success",
        currentRecord
          ? `Class <strong>${escapeHtml(payload.level)} · ${escapeHtml(
              payload.name,
            )}</strong> updated with arms, subjects, and teacher assignments.`
          : `Class <strong>${escapeHtml(payload.level)} · ${escapeHtml(
              payload.name,
            )}</strong> created and ready for assignments.`,
      );
    });

    const classCancelButton = form.querySelector("[data-class-cancel]");

    if (classCancelButton) {
      classCancelButton.addEventListener("click", () => {
        clearPortalClassErrors(form);
        resetPortalClassForm(form, isAdmin);
        renderClassTeacherOptions("");
        renderTeacherAssignmentRows([{}]);
        setClassFormVisibility(false);
        setStatus(status, "", "");
      });
    }

    listTarget.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-class-action]");

      if (!actionButton || !isAdmin) {
        return;
      }

      const classId = actionButton.dataset.classId;
      const action = actionButton.dataset.classAction;

      if (action === "add-arm") {
        event.preventDefault();
        event.stopPropagation();
        const level = String(actionButton.dataset.classLevel || "").trim();

        if (!level) {
          setStatus(status, "error", "Select a class level before adding an arm.");
          return;
        }

        const armName = normalizeClassArmName(window.prompt(`Add a custom arm for ${level}`, "") || "");

        if (!armName) {
          return;
        }

        const duplicate = manager
          .getClasses()
          .some(
            (record) =>
              normalizeLookupToken(record.level) === normalizeLookupToken(level) &&
              normalizeClassNameLookup(record.name) === normalizeClassNameLookup(armName),
          );

        if (duplicate) {
          setStatus(status, "error", `Arm <strong>${escapeHtml(armName)}</strong> already exists for ${escapeHtml(level)}.`);
          return;
        }

        const levelRecords = manager
          .getClasses()
          .filter((record) => normalizeLookupToken(record.level) === normalizeLookupToken(level));
        const referenceRecord = levelRecords.find((record) => record.status !== "archived") || levelRecords[0] || {};
        const capacity = Number.parseInt(referenceRecord.capacity || templateCapacity?.value || "30", 10);

        manager.upsertClass({
          level,
          name: armName,
          capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 30,
          classTeacher: "",
          arms: [armName],
          subjects: [],
          teacherAssignments: [],
          status: "active",
        });
        recordAuditEvent({
          action: "created",
          entityType: "class",
          entityId: `${level}-${armName}`,
          summary: `Added arm ${armName} to ${level}`,
          details: `${Number.isFinite(capacity) && capacity > 0 ? capacity : 30} capacity`,
        });
        refreshClassManagementSection();
        setStatus(status, "success", `Added <strong>${escapeHtml(armName)}</strong> to <strong>${escapeHtml(level)}</strong>.`);
        return;
      }

      if (action === "delete-level") {
        event.preventDefault();
        event.stopPropagation();
        const level = String(actionButton.dataset.classLevel || "").trim();
        const levelRecords = manager
          .getClasses()
          .filter((record) => normalizeLookupToken(record.level) === normalizeLookupToken(level));

        if (!level || !levelRecords.length) {
          setStatus(status, "error", "No class level was found to delete.");
          return;
        }

        const confirmed = window.confirm(
          `Delete ${level} and all ${levelRecords.length} arm${levelRecords.length === 1 ? "" : "s"}? This cannot be undone.`,
        );

        if (!confirmed) {
          return;
        }

        if (typeof manager.deleteClass !== "function") {
          setStatus(status, "error", "Class removal is not available right now.");
          return;
        }

        levelRecords.forEach((record) => manager.deleteClass(record.id));
        recordAuditEvent({
          action: "deleted",
          entityType: "class-level",
          entityId: level,
          summary: `Deleted class level ${level}`,
          details: `${levelRecords.length} arm${levelRecords.length === 1 ? "" : "s"} removed`,
        });
        refreshClassManagementSection();
        setStatus(
          status,
          "success",
          `Deleted <strong>${escapeHtml(level)}</strong> and ${levelRecords.length} arm${
            levelRecords.length === 1 ? "" : "s"
          }.`,
        );
        return;
      }

      const record = manager.getClasses().find((item) => item.id === classId);

      if (!record) {
        return;
      }

      clearPortalClassErrors(form);

      if (action === "view") {
        const studentManager = getStudentManager();
        const studentCount =
          studentManager && typeof studentManager.getStudents === "function"
            ? studentManager
                .getStudents()
                .filter(
                  (student) =>
                    String(student.status || "active") === "active" &&
                    normalizeLevelToken(student.level) === normalizeLevelToken(record.level),
                ).length
            : 0;
        setStatus(
          status,
          "info",
          `<strong>${escapeHtml(record.level)} ${escapeHtml(record.name)}</strong>: ${studentCount} student${
            studentCount === 1 ? "" : "s"
          }, ${escapeHtml(record.classTeacher || "no class teacher assigned")}. Use the mini workspace links on the class card for students, subjects, attendance, timetable, results, and announcements.`,
        );
        return;
      }

      if (action === "promote") {
        const studentManager = getStudentManager();
        const nextLevel = getNextStudentLevel(record.level);

        if (!studentManager || typeof studentManager.updateStudentProgression !== "function") {
          setStatus(status, "error", "Student manager is not available right now.");
          return;
        }

        if (!nextLevel) {
          setStatus(
            status,
            "error",
            `No next class level found after <strong>${escapeHtml(record.level)}</strong>. Generate or create the next class first.`,
          );
          return;
        }

        const studentsToPromote = studentManager
          .getStudents()
          .filter(
            (student) =>
              String(student.status || "active") === "active" &&
              normalizeLevelToken(student.level) === normalizeLevelToken(record.level),
          );

        studentsToPromote.forEach((student) => {
          studentManager.updateStudentProgression(student.id, (current) => ({
            ...current,
            level: nextLevel,
            promotionDecision: "promote",
            examOutcome: "pass",
            lastPromotionOutcome: "class-promoted",
            progressionHistory: appendStudentProgression(current, {
              type: "class-promoted",
              fromLevel: current.level,
              toLevel: nextLevel,
              note: `Promoted from class workspace ${record.level}`,
            }),
          }));
        });

        recordAuditEvent({
          action: "promoted",
          entityType: "class",
          entityId: record.id,
          summary: `Promoted ${studentsToPromote.length} students from ${record.level} to ${nextLevel}`,
          details: record.name || "",
        });
        setStatus(
          status,
          "success",
          `Promoted <strong>${studentsToPromote.length}</strong> student${
            studentsToPromote.length === 1 ? "" : "s"
          } from <strong>${escapeHtml(record.level)}</strong> to <strong>${escapeHtml(nextLevel)}</strong>.`,
        );
        refreshClassManagementSection();
        return;
      }

      if (action === "edit") {
        populatePortalClassForm(form, record, isAdmin);
        renderClassTeacherOptions(record.classTeacher || "");
        renderTeacherAssignmentRows(record.teacherAssignments || [{}]);
        setClassFormVisibility(true);
        setStatus(
          status,
          "info",
          `Editing <strong>${escapeHtml(record.level)} · ${escapeHtml(
            record.name,
          )}</strong>. Save to update this class.`,
        );
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (action === "archive") {
        manager.archiveClass(record.id);
        recordAuditEvent({
          action: "archived",
          entityType: "class",
          entityId: record.id,
          summary: `Archived class ${record.level} · ${record.name}`,
          details: `${record.capacity} capacity`,
        });
        resetPortalClassForm(form, isAdmin);
        renderClassTeacherOptions("");
        renderTeacherAssignmentRows([{}]);
        setClassFormVisibility(false);
        setStatus(
          status,
          "success",
          `Class <strong>${escapeHtml(record.level)} · ${escapeHtml(
            record.name,
          )}</strong> archived. It stays available for history while being removed from live assignment.`,
        );
        return;
      }

      if (action === "delete") {
        if (typeof manager.deleteClass !== "function") {
          setStatus(status, "error", "Class removal is not available right now.");
          return;
        }
        manager.deleteClass(record.id);
        recordAuditEvent({
          action: "deleted",
          entityType: "class",
          entityId: record.id,
          summary: `Removed class ${record.level} · ${record.name}`,
          details: `${record.capacity} capacity`,
        });
        resetPortalClassForm(form, isAdmin);
        renderClassTeacherOptions("");
        renderTeacherAssignmentRows([{}]);
        setClassFormVisibility(false);
        setStatus(
          status,
          "success",
          `Class <strong>${escapeHtml(record.level)} · ${escapeHtml(record.name)}</strong> removed from the list.`,
        );
        return;
      }

      if (action === "activate") {
        manager.activateClass(record.id);
        recordAuditEvent({
          action: "reactivated",
          entityType: "class",
          entityId: record.id,
          summary: `Reactivated class ${record.level} · ${record.name}`,
          details: `${record.capacity} capacity`,
        });
        resetPortalClassForm(form, isAdmin);
        renderClassTeacherOptions("");
        renderTeacherAssignmentRows([{}]);
        setClassFormVisibility(false);
        setStatus(
          status,
          "success",
          `Class <strong>${escapeHtml(record.level)} · ${escapeHtml(
            record.name,
          )}</strong> reactivated and available again for assignments.`,
        );
      }
    });

    window.addEventListener(manager.eventName, refreshClassManagementSection);

    if (courseManager?.eventName) {
      window.addEventListener(courseManager.eventName, refreshClassManagementSection);
    }

    const settingsManager = getSchoolSettingsManager();
    if (settingsManager?.eventName) {
      window.addEventListener(settingsManager.eventName, () => {
        renderClassTemplateTypeOptions();
        updateTemplateVisibility();
      });
    }
  }

  function initCourseManagementControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const formToggleButton =
      form.parentElement?.querySelector("[data-course-form-toggle]") ||
      document.querySelector("[data-course-form-toggle]");
    const teacherSelect = form.elements.teacherAssignments;
    const levelSelect = form.elements.level;
    const categoryField = form.elements.category;
    const creditField = form.elements.creditUnit;
    const codeFieldWrap = document.querySelector("[data-course-code-field]");
    const levelFieldWrap = document.querySelector("[data-course-level-field]");
    const teacherFieldWrap = document.querySelector("[data-course-teacher-field]");
    const descriptionFieldWrap = document.querySelector("[data-course-description-field]");
    const wizardActions = document.querySelector("[data-course-wizard-actions]");
    const categoryFieldWrap = document.querySelector("[data-course-category-field]");
    const nameFieldWrap = document.querySelector("[data-course-name-field]");
    const subjectSelectWrap = document.querySelector("[data-course-subject-select-field]");
    const subjectSelect = document.querySelector("[data-course-subject-select]");
    const customSubjectWrap = document.querySelector("[data-course-custom-subject-field]");
    const customSubjectField = document.querySelector("[data-course-custom-subject]");
    const facultyFieldWrap = document.querySelector("[data-course-faculty-field]");
    const departmentFieldWrap = document.querySelector("[data-course-department-field]");
    const customDepartmentFieldWrap = document.querySelector("[data-course-custom-department-field]");
    const facultySelect = document.querySelector("[data-course-faculty]");
    const departmentSelect = document.querySelector("[data-course-department]");
    const customDepartmentField = form.elements.customDepartment;
    const templateType = document.querySelector("[data-course-template-type]");
    const templateList = document.querySelector("[data-course-library-list]");
    const classManager = getClassManager();
    const normalizeLookupToken = (value) => String(value || "").trim().toLowerCase();
    const facultyDepartments = getConfiguredHigherInstitutionDepartmentMap();
    const subjectTemplates = {
      nursery: {
        label: "Subjects",
        categories: {
          Foundation: ["Numbers", "Rhymes", "Coloring", "Social Habits", "Handwriting"],
        },
      },
      primary: {
        label: "Subjects",
        categories: {
          Core: ["English", "Mathematics", "Basic Science", "Civic Education", "Social Studies"],
          Faith: ["CRS/IRS"],
          Digital: ["Computer Studies"],
        },
      },
      secondary: {
        label: "Subjects",
        categories: {
          Science: ["Mathematics", "English", "Physics", "Chemistry", "Biology"],
          Art: ["English", "Literature"],
          Commercial: ["Mathematics", "English", "Economics"],
        },
      },
      higher: {
        label: "Courses",
        categories: {
          "Faculty of Science / Computer Science": ["CSC101", "CSC102", "MTH101"],
          "Faculty of Management Sciences / Accounting": ["ACC101", "ACC102"],
          "Faculty of Management Sciences / Business Administration": ["BUS101", "ECO101"],
          "Faculty of Arts / English and Literary Studies": ["ENG101", "ENG102"],
          "School of Engineering Technology / Electrical/Electronics Engineering Technology": ["EET101", "MTH101"],
          "School of Business and Management Studies / Accountancy": ["ACC111", "BAM101"],
          "School of Applied Sciences / Computer Science": ["COM101", "STA101"],
          "School of Sciences / Computer Science Education": ["CSE101", "EDU101"],
          "School of Languages / English Education": ["ENG101", "EDU101"],
          "School of Vocational and Technical Education / Business Education": ["BED101", "EDU101"],
        },
      },
    };

    const renderCourseTemplateTypeOptions = () => {
      const selected = renderConfiguredSchoolTypeSelect(templateType);
      if (!selected) {
        if (categoryField) {
          categoryField.value = "";
        }
        if (form.elements.name) {
          form.elements.name.value = "";
        }
      }
      return selected;
    };

    const getTeacherDirectory = () => {
      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      return getUsers()
        .filter(
          (user) =>
            normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) === "Teacher" &&
            !isUserDeactivated(user) &&
            normalizeWorkspaceId(user.workspaceId || "public") === workspaceId,
        )
        .map((user) => {
          const email = String(user.email || "").trim();
          return {
            value: email,
            label: user.displayName ? `${user.displayName} (${email})` : email,
          };
        })
        .filter((item) => item.value)
        .sort((left, right) => left.label.localeCompare(right.label));
    };

    const renderTeacherOptions = (selected = "") => {
      if (!(teacherSelect instanceof HTMLSelectElement)) {
        return;
      }

      const selectedValue = String(selected || "").trim();
      const teachers = getTeacherDirectory();
      const hasSelected = teachers.some((teacher) => teacher.value === selectedValue);
      teacherSelect.innerHTML = `
        <option value="">Select registered teacher</option>
        ${teachers
          .map(
            (teacher) => `
              <option value="${escapeHtml(teacher.value)}" ${teacher.value === selectedValue ? "selected" : ""}>
                ${escapeHtml(teacher.label)}
              </option>
            `,
          )
          .join("")}
        ${selectedValue && !hasSelected ? `<option value="${escapeHtml(selectedValue)}" selected>${escapeHtml(selectedValue)}</option>` : ""}
      `;
    };

    const getClassLevelOptions = () => {
      if (!classManager || typeof classManager.getClasses !== "function") {
        return [];
      }

      return Array.from(
        new Set(
          classManager
            .getClasses()
            .filter((record) => record.status !== "archived")
            .filter(
              (record) =>
                inferSchoolTypeFromLevel(record.level) !== "higher" ||
                isConfiguredHigherInstitutionLevel(record.level),
            )
            .map((record) => String(record.level || "").trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
    };

    const getLevelSchoolType = (level) => {
      const inferredType = inferSchoolTypeFromLevel(level);
      if (inferredType) return inferredType;
      return "other";
    };

    const getCourseGroupLabel = (level) => {
      const type = getLevelSchoolType(level);
      if (type === "nursery") return "Nursery";
      if (type === "primary") return "Primary";
      if (type === "secondary") return "Secondary";
      if (type === "higher") return "Higher Institution";
      return "Other";
    };

    const renderClassLevelOptions = (selected = []) => {
      if (!(levelSelect instanceof HTMLSelectElement)) {
        return;
      }

      const selectedValues = Array.isArray(selected) ? selected : [selected].filter(Boolean);
      const type = String(templateType?.value || "").trim();
      const options = getClassLevelOptions().filter((level) => !type || getLevelSchoolType(level) === type);
      levelSelect.innerHTML = options.length
        ? `<option value="">Select class / level</option>${options
            .map(
              (level) => `
                <option value="${escapeHtml(level)}" ${selectedValues.includes(level) ? "selected" : ""}>
                  ${escapeHtml(level)}
                </option>
              `,
            )
            .join("")}`
        : `<option value="">Generate classes first</option>`;
    };

    const setSelectOptions = (select, options = [], placeholder = "Select option") => {
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }
      select.innerHTML = `
        <option value="">${escapeHtml(placeholder)}</option>
        ${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
      `;
    };

    const getResolvedDepartment = () => {
      const selectedDepartment = String(departmentSelect?.value || "").trim();
      return selectedDepartment === "Other"
        ? String(customDepartmentField?.value || "").trim()
        : selectedDepartment;
    };

    const getSubjectOptionsForSelection = () => {
      const type = String(templateType?.value || "").trim();
      const template = subjectTemplates[type];

      if (!template) {
        return [];
      }

      if (type === "secondary") {
        const stream = String(categoryField?.value || "").trim();
        return stream ? template.categories[stream] || [] : [];
      }

      if (type === "higher") {
        const faculty = String(facultySelect?.value || "").trim();
        const department = getResolvedDepartment();
        const categoryKey = [faculty, department].filter(Boolean).join(" / ");
        return categoryKey ? template.categories[categoryKey] || [] : [];
      }

      return Array.from(new Set(Object.values(template.categories).flat()));
    };

    const syncSubjectNameFromPicker = () => {
      const type = String(templateType?.value || "").trim();

      if (!["nursery", "primary", "secondary", "higher"].includes(type)) {
        return;
      }

      const selectedSubject = String(subjectSelect?.value || "").trim();
      const isCustom = selectedSubject === "Other";

      if (customSubjectWrap) {
        customSubjectWrap.hidden = !isCustom;
      }

      if (form.elements.name) {
        form.elements.name.value = isCustom
          ? String(customSubjectField?.value || "").trim()
          : selectedSubject;
      }
    };

    const renderSubjectPickerOptions = (selected = "") => {
      if (!(subjectSelect instanceof HTMLSelectElement)) {
        return;
      }

      const options = getSubjectOptionsForSelection();
      const selectedValue = String(selected || "").trim();
      const type = String(templateType?.value || "").trim();
      const placeholder = type === "higher" ? "Select course" : "Select subject";
      subjectSelect.innerHTML = `
        <option value="">${escapeHtml(placeholder)}</option>
        ${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
        <option value="Other">Other</option>
      `;
      if (selectedValue) {
        const hasOption = Array.from(subjectSelect.options).some((option) => option.value === selectedValue);
        subjectSelect.value = hasOption ? selectedValue : "Other";
        if (!hasOption && customSubjectField) {
          customSubjectField.value = selectedValue;
        }
      }
      syncSubjectNameFromPicker();
    };

    const updateSubjectPickerVisibility = () => {
      const type = String(templateType?.value || "").trim();
      const selectedDepartment = getResolvedDepartment();
      const selectedLevel = String(levelSelect?.value || "").trim();
      const usesSubjectPicker =
        Boolean(selectedLevel) &&
        (type === "nursery" ||
          type === "primary" ||
          (type === "secondary" && Boolean(String(categoryField?.value || "").trim())) ||
          (type === "higher" && Boolean(String(facultySelect?.value || "").trim()) && Boolean(selectedDepartment)));

      if (nameFieldWrap) {
        nameFieldWrap.hidden = true;
      }
      if (subjectSelectWrap) {
        subjectSelectWrap.hidden = !usesSubjectPicker;
        const subjectLabel = subjectSelectWrap.querySelector("span");
        if (subjectLabel) {
          subjectLabel.textContent = type === "higher" ? "Course" : "Subject";
        }
      }
      if (customSubjectWrap) {
        customSubjectWrap.hidden = !usesSubjectPicker || subjectSelect?.value !== "Other";
        const customSubjectLabel = customSubjectWrap.querySelector("span");
        if (customSubjectLabel) {
          customSubjectLabel.textContent = type === "higher" ? "Custom course" : "Custom subject";
        }
        const customSubjectInput = customSubjectWrap.querySelector("input");
        if (customSubjectInput) {
          customSubjectInput.placeholder = type === "higher" ? "Enter course name or code" : "Enter subject name";
        }
      }
    };

    const renderFacultyOptions = (selected = "") => {
      setSelectOptions(
        facultySelect,
        Object.keys(facultyDepartments),
        `Select ${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType()).toLowerCase()}`,
      );
      if (facultySelect && selected) {
        facultySelect.value = selected;
      }
    };

    const renderDepartmentOptions = (selected = "") => {
      const faculty = String(facultySelect?.value || "").trim();
      setSelectOptions(departmentSelect, [...(facultyDepartments[faculty] || []), "Other"], "Select department");
      if (departmentSelect && selected) {
        const hasOption = Array.from(departmentSelect.options).some((option) => option.value === selected);
        departmentSelect.value = hasOption ? selected : "Other";
        if (!hasOption && customDepartmentField) {
          customDepartmentField.value = selected;
        }
      }
      if (customDepartmentFieldWrap) {
        customDepartmentFieldWrap.hidden = departmentSelect?.value !== "Other";
      }
    };

    const updateCourseTerminology = () => {
      const type = String(templateType?.value || "").trim();
      const template = subjectTemplates[type];
      const label = template?.label || "Subjects / courses";
      const heading = document.getElementById("portal-heading");
      const createButton = document.querySelector("[data-course-form-toggle]");
      const selectedSubject = String(form.elements.name?.value || "").trim();
      const selectedLevel = String(levelSelect?.value || "").trim();
      const canChooseLevel =
        type === "nursery" ||
        type === "primary" ||
        (type === "secondary" && Boolean(String(categoryField?.value || "").trim())) ||
        (type === "higher" &&
          Boolean(String(facultySelect?.value || "").trim()) &&
          Boolean(getResolvedDepartment()));
      const showFinalDetails = Boolean(selectedSubject && selectedLevel);

      if (heading) {
        heading.textContent = `${label} Management`;
      }
      if (createButton && form.hidden) {
        createButton.textContent = "Create";
      }
      if (creditField?.closest(".portal-field")) {
        creditField.closest(".portal-field").hidden = type !== "higher" || !showFinalDetails;
      }
      if (codeFieldWrap) {
        codeFieldWrap.hidden = !showFinalDetails;
      }
      if (levelFieldWrap) {
        levelFieldWrap.hidden = !canChooseLevel;
      }
      if (teacherFieldWrap) {
        teacherFieldWrap.hidden = !showFinalDetails;
      }
      if (descriptionFieldWrap) {
        descriptionFieldWrap.hidden = !showFinalDetails;
      }
      if (wizardActions) {
        wizardActions.hidden = !showFinalDetails;
      }
      if (categoryFieldWrap) {
        categoryFieldWrap.hidden = type !== "secondary";
      }
      if (facultyFieldWrap) {
        facultyFieldWrap.hidden = type !== "higher";
        const facultyLabel = facultyFieldWrap.querySelector("span");
        if (facultyLabel) {
          facultyLabel.textContent = getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType());
        }
      }
      if (departmentFieldWrap) {
        departmentFieldWrap.hidden = type !== "higher" || !String(facultySelect?.value || "").trim();
      }
      if (customDepartmentFieldWrap) {
        customDepartmentFieldWrap.hidden = type !== "higher" || departmentSelect?.value !== "Other";
      }
      updateSubjectPickerVisibility();
    };

    const renderTemplateCategories = () => {
      if (!(categoryField instanceof HTMLSelectElement)) {
        return;
      }

      const type = String(templateType?.value || "").trim();
      const template = subjectTemplates[type];
      const categories = template && type === "secondary" ? Object.keys(template.categories) : [];
      const selected = String(categoryField.value || "").trim();
      categoryField.innerHTML = `
        <option value="">Select stream</option>
        ${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
      `;
      if (selected && categories.includes(selected)) {
        categoryField.value = selected;
      }
    };

    const renderSubjectLibrary = () => {
      if (!templateList) {
        return;
      }

      const type = String(templateType?.value || "").trim();
      const template = subjectTemplates[type];

      if (!template) {
        templateList.innerHTML = `<p class="portal-course-library-empty">No subject selected</p>`;
        return;
      }

      const selectedSubject = String(form.elements.name?.value || "").trim();
      const selectedLevel = String(levelSelect?.value || "").trim();
      const selectedTeacher = String(teacherSelect?.value || "").trim();
      const selectedCategory =
        type === "secondary"
          ? String(categoryField?.value || "").trim()
          : type === "higher"
            ? [String(facultySelect?.value || "").trim(), getResolvedDepartment()].filter(Boolean).join(" / ")
            : "";
      const selectedTypeLabel = templateType instanceof HTMLSelectElement
        ? templateType.options[templateType.selectedIndex]?.text || ""
        : "";
      const summaryItems = [
        { label: "Type", value: template.label === "Courses" ? "Higher Institution" : selectedTypeLabel },
        { label: type === "higher" ? `${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType())} / department` : "Stream", value: selectedCategory },
        { label: "Class / level", value: selectedLevel },
        { label: type === "higher" ? "Course" : "Subject", value: selectedSubject },
        { label: "Teacher", value: selectedTeacher },
      ].filter((item) => String(item.value || "").trim());

      templateList.innerHTML = summaryItems.length
        ? summaryItems
            .map(
              (item) => `
                <span class="portal-course-library-chip is-summary">
                  <strong>${escapeHtml(item.value)}</strong>
                  <span>${escapeHtml(item.label)}</span>
                </span>
              `,
            )
            .join("")
        : `<p class="portal-course-library-empty">No subject selected</p>`;
    };

    const setCourseFormVisibility = (isVisible) => {
      form.hidden = false;

      if (formToggleButton) {
        formToggleButton.hidden = true;
        formToggleButton.textContent = isVisible ? "Hide form" : "Create";
        formToggleButton.setAttribute("aria-expanded", "true");
      }
    };

    const toggleCourseFormVisibility = () => {
      if (!isAdmin || !manager) {
        return;
      }

      const shouldOpen = form.hidden;
      setCourseFormVisibility(shouldOpen);

      if (!shouldOpen) {
        clearPortalCourseErrors(form);
        resetPortalCourseForm(form, isAdmin);
        setStatus(status, "", "");
      }
    };

    const resetCourseWizardState = () => {
      resetPortalCourseForm(form, isAdmin);
      renderTeacherOptions("");
      renderClassLevelOptions([]);
      renderCourseTemplateTypeOptions();
      renderTemplateCategories();
      renderFacultyOptions("");
      renderDepartmentOptions("");
      renderSubjectPickerOptions("");
      updateCourseTerminology();
      renderSubjectLibrary();
      setCourseFormVisibility(false);
    };

    form.addEventListener("input", () => {
      clearPortalCourseErrors(form);
      syncSubjectNameFromPicker();
      updateCourseTerminology();
      renderSubjectLibrary();

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    form.addEventListener("change", () => {
      clearPortalCourseErrors(form);
      syncSubjectNameFromPicker();
      updateCourseTerminology();
      renderSubjectLibrary();
    });

    const refreshCourseManagementSection = () => {
      renderPortalCourseManagementSection({
        isAdmin,
        manager,
        summaryTarget,
        form,
        status,
        listTarget,
      });
      renderTeacherOptions(teacherSelect?.value || "");
      renderClassLevelOptions(Array.from(levelSelect?.selectedOptions || []).map((option) => option.value));
      updateCourseTerminology();
      renderSubjectLibrary();
    };

    refreshCourseManagementSection();
    resetCourseWizardState();

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleCourseFormVisibility);
    }

    if (!manager) {
      setCourseFormVisibility(false);
      return;
    }

    if (templateType) {
      templateType.addEventListener("change", () => {
        if (categoryField) {
          categoryField.value = "";
        }
        if (customSubjectField) {
          customSubjectField.value = "";
        }
        if (form.elements.name) {
          form.elements.name.value = "";
        }
        renderSubjectPickerOptions("");
        renderFacultyOptions("");
        renderDepartmentOptions("");
        if (customDepartmentField) {
          customDepartmentField.value = "";
        }
        renderTemplateCategories();
        renderClassLevelOptions([]);
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (categoryField) {
      categoryField.addEventListener("change", () => {
        if (customSubjectField) {
          customSubjectField.value = "";
        }
        if (form.elements.name) {
          form.elements.name.value = "";
        }
        renderSubjectPickerOptions("");
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (subjectSelect) {
      subjectSelect.addEventListener("change", () => {
        syncSubjectNameFromPicker();
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (customSubjectField) {
      customSubjectField.addEventListener("input", () => {
        syncSubjectNameFromPicker();
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (facultySelect) {
      facultySelect.addEventListener("change", () => {
        if (form.elements.name) {
          form.elements.name.value = "";
        }
        if (customSubjectField) {
          customSubjectField.value = "";
        }
        renderDepartmentOptions("");
        renderSubjectPickerOptions("");
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (departmentSelect) {
      departmentSelect.addEventListener("change", () => {
        if (form.elements.name) {
          form.elements.name.value = "";
        }
        if (customSubjectField) {
          customSubjectField.value = "";
        }
        renderSubjectPickerOptions("");
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    if (customDepartmentField) {
      customDepartmentField.addEventListener("input", () => {
        if (form.elements.name) {
          form.elements.name.value = "";
        }
        renderSubjectPickerOptions("");
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can manage courses.");
        return;
      }

      clearPortalCourseErrors(form);
      setStatus(status, "", "");

      const courseId = form.elements.courseId.value;
      const selectedLevels = [String(form.elements.level.value || "").trim()].filter(Boolean);
      const isHigherCourse = String(templateType?.value || "").trim() === "higher" || getLevelSchoolType(selectedLevels[0]) === "higher";
      const faculty = String(form.elements.faculty?.value || "").trim();
      const selectedDepartment = String(form.elements.department?.value || "").trim();
      const department = selectedDepartment === "Other"
        ? String(form.elements.customDepartment?.value || "").trim()
        : selectedDepartment;
      const selectedType = String(templateType?.value || "").trim();
      const payload = {
        id: courseId || undefined,
        name: form.elements.name.value.trim(),
        code: form.elements.code.value.trim().toUpperCase(),
        category: isHigherCourse
          ? [faculty, department].filter(Boolean).join(" / ")
          : selectedType === "secondary"
            ? String(form.elements.category?.value || "").trim()
            : "",
        creditUnit: String(form.elements.creditUnit?.value || "").trim(),
        description: form.elements.description.value.trim(),
        level: selectedLevels[0] || "",
        teacherAssignments: form.elements.teacherAssignments.value.trim()
          ? [form.elements.teacherAssignments.value.trim()]
          : [],
        studentAssignments: [],
      };

      let hasError = false;

      if (!payload.name) {
        setPortalCourseError(form, "name", "Enter the course name.");
        hasError = true;
      }

      if (!payload.level) {
        setPortalCourseError(form, "level", "Select at least one class or level.");
        hasError = true;
      }

      if (isHigherCourse && (!faculty || !department)) {
        setPortalCourseError(
          form,
          "department",
          `Select ${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType()).toLowerCase()} and department.`,
        );
        hasError = true;
      }

      if (!isHigherCourse && selectedType === "secondary" && !payload.category) {
        setPortalCourseError(form, "category", "Select Science, Art, or Commercial.");
        hasError = true;
      }

      const duplicate = manager.getCourses().find((record) =>
        selectedLevels.some(
          (level) =>
            record.id !== courseId &&
            normalizeLevelToken(record.level) === normalizeLevelToken(level) &&
            ((payload.code && String(record.code || "").toLowerCase() === payload.code.toLowerCase()) ||
              String(record.name || "").toLowerCase() === payload.name.toLowerCase()),
        ),
      );

      if (duplicate) {
        setPortalCourseError(
          form,
          "name",
          "This subject/course already exists for one of the selected classes.",
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted course details and try again.");
        return;
      }

      const currentRecord = manager.getCourses().find((record) => record.id === courseId) || null;
      const levelsToSave = currentRecord ? [payload.level] : selectedLevels;
      levelsToSave.forEach((level, index) => {
        manager.upsertCourse({
          ...(index === 0 ? currentRecord : null),
          ...payload,
          id: index === 0 ? payload.id : undefined,
          level,
          status: currentRecord ? currentRecord.status : "active",
        });
      });
      recordAuditEvent({
        action: currentRecord ? "updated" : "created",
        entityType: "course",
        entityId: payload.code || payload.name,
        summary: currentRecord
          ? `Updated course ${payload.code} · ${payload.name}`
          : `Created course ${payload.code || "New"} · ${payload.name}`,
        details: `${levelsToSave.join(", ")} • ${payload.teacherAssignments.length} teacher assignment`,
      });

      resetCourseWizardState();
      clearFormDraftFor(form);
      setStatus(
        status,
        "success",
        currentRecord
          ? `Course <strong>${escapeHtml(payload.code || "New")} · ${escapeHtml(
              payload.name,
            )}</strong> updated and now controls assignment data.`
          : `Course <strong>${escapeHtml(payload.code || "New")} · ${escapeHtml(
              payload.name,
            )}</strong> created and assigned to ${levelsToSave.length} class${levelsToSave.length === 1 ? "" : "es"}.`,
      );
    });

    const courseCancelButton = form.querySelector("[data-course-cancel]");

    if (courseCancelButton) {
      courseCancelButton.addEventListener("click", () => {
        clearPortalCourseErrors(form);
        resetCourseWizardState();
        setStatus(status, "", "");
      });
    }

    listTarget.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-course-action]");

      if (!actionButton || !isAdmin) {
        return;
      }

      const courseId = actionButton.dataset.courseId;
      const action = actionButton.dataset.courseAction;
      const record = manager.getCourses().find((item) => item.id === courseId);

      if (!record) {
        return;
      }

      clearPortalCourseErrors(form);

      if (action === "edit") {
        if (templateType) {
          templateType.value = getLevelSchoolType(record.level);
        }
        renderTemplateCategories();
        renderClassLevelOptions([record.level || ""]);
        updateCourseTerminology();
        const [faculty = "", department = ""] = String(record.category || "")
          .split("/")
          .map((item) => item.trim());
        renderFacultyOptions(faculty);
        renderDepartmentOptions(department);
        populatePortalCourseForm(form, record, isAdmin);
        renderSubjectPickerOptions(record.name || "");
        renderTeacherOptions((record.teacherAssignments || [])[0] || "");
        updateCourseTerminology();
        renderSubjectLibrary();
        setCourseFormVisibility(true);
        setStatus(
          status,
          "info",
          `Editing <strong>${escapeHtml(record.code)} · ${escapeHtml(
            record.name,
          )}</strong>. Save to update this course.`,
        );
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (action === "archive") {
        manager.archiveCourse(record.id);
        recordAuditEvent({
          action: "archived",
          entityType: "course",
          entityId: record.id,
          summary: `Archived course ${record.code} · ${record.name}`,
          details: record.level,
        });
        resetCourseWizardState();
        setStatus(
          status,
          "success",
          `Course <strong>${escapeHtml(record.code)} · ${escapeHtml(
            record.name,
          )}</strong> archived and removed from active assignment options.`,
        );
        return;
      }

      if (action === "delete") {
        const confirmed = window.confirm(
          `Delete ${record.code || record.name} from ${record.level || "this level"}? This cannot be undone.`,
        );

        if (!confirmed) {
          return;
        }

        if (typeof manager.deleteCourse !== "function") {
          setStatus(status, "error", "Course deletion is not available right now.");
          return;
        }

        manager.deleteCourse(record.id);
        recordAuditEvent({
          action: "deleted",
          entityType: "course",
          entityId: record.id,
          summary: `Deleted course ${record.code || "NO-CODE"} · ${record.name}`,
          details: record.level,
        });
        resetCourseWizardState();
        setStatus(
          status,
          "success",
          `Course <strong>${escapeHtml(record.code || "NO-CODE")} · ${escapeHtml(record.name)}</strong> deleted.`,
        );
        return;
      }

      if (action === "activate") {
        manager.activateCourse(record.id);
        recordAuditEvent({
          action: "reactivated",
          entityType: "course",
          entityId: record.id,
          summary: `Reactivated course ${record.code} · ${record.name}`,
          details: record.level,
        });
        resetCourseWizardState();
        setStatus(
          status,
          "success",
          `Course <strong>${escapeHtml(record.code)} · ${escapeHtml(
            record.name,
          )}</strong> reactivated for new assignments.`,
        );
      }
    });

    window.addEventListener(manager.eventName, refreshCourseManagementSection);
    window.addEventListener(STORAGE_KEYS.users, () => renderTeacherOptions(teacherSelect?.value || ""));
    const settingsManager = getSchoolSettingsManager();
    if (settingsManager?.eventName) {
      window.addEventListener(settingsManager.eventName, () => {
        renderCourseTemplateTypeOptions();
        renderClassLevelOptions([]);
        renderSubjectPickerOptions("");
        updateCourseTerminology();
        renderSubjectLibrary();
      });
    }
  }

  function initAcademicCalendarControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const formToggleButton =
      form.parentElement?.querySelector("[data-calendar-form-toggle]") ||
      document.querySelector("[data-calendar-form-toggle]");

    const setCalendarFormVisibility = (isVisible) => {
      form.hidden = !isVisible;

      if (formToggleButton) {
        formToggleButton.textContent = isVisible ? "Hide calendar form" : "Create calendar event";
        formToggleButton.setAttribute("aria-expanded", String(isVisible));
      }
    };

    const refreshAcademicCalendarSection = () => {
      renderPortalAcademicCalendarSection({
        isAdmin,
        manager,
        summaryTarget,
        form,
        status,
        listTarget,
      });
    };

    const toggleCalendarFormVisibility = () => {
      if (!isAdmin || !manager) {
        return;
      }

      const shouldOpen = form.hidden;
      setCalendarFormVisibility(shouldOpen);

      if (!shouldOpen) {
        clearPortalCalendarErrors(form);
        resetPortalCalendarForm(form, isAdmin);
        setStatus(status, "", "");
      }
    };

    form.addEventListener("input", () => {
      clearPortalCalendarErrors(form);

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    refreshAcademicCalendarSection();
    resetPortalCalendarForm(form, isAdmin);
    setCalendarFormVisibility(false);

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleCalendarFormVisibility);
    }

    if (!manager) {
      setCalendarFormVisibility(false);
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can manage calendar events.");
        return;
      }

      clearPortalCalendarErrors(form);
      setStatus(status, "", "");

      const calendarEventId = form.elements.calendarEventId.value || "";
      const payload = {
        id: calendarEventId || undefined,
        title: form.elements.title.value.trim(),
        type: normalizeCalendarType(form.elements.type.value),
        startDate: form.elements.startDate.value || "",
        endDate: form.elements.endDate.value || "",
        notes: form.elements.notes.value.trim(),
        visibility: "all-roles",
      };

      let hasError = false;

      if (!payload.title) {
        setPortalCalendarError(form, "title", "Enter an event title.");
        hasError = true;
      }

      if (!payload.startDate) {
        setPortalCalendarError(form, "startDate", "Select the event start date.");
        hasError = true;
      }

      if (!payload.endDate) {
        setPortalCalendarError(form, "endDate", "Select the event end date.");
        hasError = true;
      } else if (payload.startDate && payload.endDate < payload.startDate) {
        setPortalCalendarError(form, "endDate", "End date must be the same day or after the start date.");
        hasError = true;
      }

      const conflicts = hasError ? [] : manager.findConflicts(payload);

      if (conflicts.length) {
        const conflictPreview = conflicts
          .slice(0, 3)
          .map((entry) => `${entry.title} (${formatCalendarRange(entry.startDate, entry.endDate)})`)
          .join(", ");
        setPortalCalendarError(
          form,
          "startDate",
          "Conflict detected with existing calendar dates.",
        );
        setStatus(
          status,
          "error",
          `This event overlaps with ${conflicts.length} existing event(s): ${escapeHtml(conflictPreview)}.`,
        );
        return;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted calendar details and try again.");
        return;
      }

      const currentRecord = manager.getEvents().find((entry) => entry.id === calendarEventId) || null;
      manager.upsertEvent({
        ...currentRecord,
        ...payload,
        status: currentRecord ? currentRecord.status : "active",
      });
      recordAuditEvent({
        action: currentRecord ? "updated" : "created",
        entityType: "academic-calendar",
        entityId: payload.title,
        summary: `${currentRecord ? "Updated" : "Created"} ${getCalendarTypeLabel(payload.type)}: ${payload.title}`,
        details: `${payload.startDate} to ${payload.endDate}`,
      });

      clearFormDraftFor(form);
      resetPortalCalendarForm(form, isAdmin);
      setCalendarFormVisibility(false);
      setStatus(
        status,
        "success",
        `${getCalendarTypeLabel(payload.type)} <strong>${escapeHtml(payload.title)}</strong> saved and visible to all roles.`,
      );
    });

    const cancelButton = form.querySelector("[data-calendar-cancel]");

    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        clearPortalCalendarErrors(form);
        resetPortalCalendarForm(form, isAdmin);
        setCalendarFormVisibility(false);
        setStatus(status, "", "");
      });
    }

    listTarget.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-calendar-action]");

      if (!actionButton || !isAdmin) {
        return;
      }

      const eventId = actionButton.dataset.calendarId;
      const action = actionButton.dataset.calendarAction;
      const eventRecord = manager.getEvents().find((entry) => entry.id === eventId);

      if (!eventRecord) {
        return;
      }

      clearPortalCalendarErrors(form);

      if (action === "edit") {
        populatePortalCalendarForm(form, eventRecord, isAdmin);
        setCalendarFormVisibility(true);
        setStatus(
          status,
          "info",
          `Editing <strong>${escapeHtml(eventRecord.title)}</strong>. Save to update this event.`,
        );
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (action === "archive") {
        manager.archiveEvent(eventRecord.id);
        recordAuditEvent({
          action: "archived",
          entityType: "academic-calendar",
          entityId: eventRecord.id,
          summary: `Archived calendar event: ${eventRecord.title}`,
          details: `${eventRecord.startDate} to ${eventRecord.endDate}`,
        });
        resetPortalCalendarForm(form, isAdmin);
        setCalendarFormVisibility(false);
        setStatus(
          status,
          "success",
          `Event <strong>${escapeHtml(eventRecord.title)}</strong> archived.`,
        );
        return;
      }

      if (action === "activate") {
        const conflicts = manager.findConflicts({
          ...eventRecord,
          status: "active",
        });

        if (conflicts.length) {
          const conflictPreview = conflicts
            .slice(0, 3)
            .map((entry) => `${entry.title} (${formatCalendarRange(entry.startDate, entry.endDate)})`)
            .join(", ");
          setStatus(
            status,
            "error",
            `Cannot reactivate due to date conflict with: ${escapeHtml(conflictPreview)}.`,
          );
          return;
        }

        manager.activateEvent(eventRecord.id);
        recordAuditEvent({
          action: "reactivated",
          entityType: "academic-calendar",
          entityId: eventRecord.id,
          summary: `Reactivated calendar event: ${eventRecord.title}`,
          details: `${eventRecord.startDate} to ${eventRecord.endDate}`,
        });
        resetPortalCalendarForm(form, isAdmin);
        setCalendarFormVisibility(false);
        setStatus(
          status,
          "success",
          `Event <strong>${escapeHtml(eventRecord.title)}</strong> reactivated and visible again.`,
        );
      }
    });

    window.addEventListener(manager.eventName, refreshAcademicCalendarSection);
  }

  function initAdmissionConfigurationControls({
    isAdmin,
    manager,
    summaryTarget,
    sessionForm,
    sessionStatus,
    sessionListTarget,
    classForm,
    classStatus,
    classListTarget,
    stageForm,
    stageStatus,
    stageListTarget,
    applyFormClassField = null,
  }) {
    if (
      !summaryTarget ||
      !sessionForm ||
      !sessionStatus ||
      !sessionListTarget ||
      !classForm ||
      !classStatus ||
      !classListTarget ||
      !stageForm ||
      !stageStatus ||
      !stageListTarget
    ) {
      return;
    }

    const resetSessionForm = () => {
      sessionForm.reset();
      if (sessionForm.elements.sessionId) {
        sessionForm.elements.sessionId.value = "";
      }
      if (sessionForm.elements.status) {
        sessionForm.elements.status.value = "closed";
      }
      const submitButton = sessionForm.querySelector("[data-admission-session-submit]");
      const cancelButton = sessionForm.querySelector("[data-admission-session-cancel]");
      if (submitButton) submitButton.textContent = "Save session";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(sessionForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) {
          field.disabled = !isAdmin;
        }
      });
    };

    const resetClassForm = () => {
      classForm.reset();
      if (classForm.elements.classOptionId) {
        classForm.elements.classOptionId.value = "";
      }
      if (classForm.elements.status) {
        classForm.elements.status.value = "active";
      }
      const submitButton = classForm.querySelector("[data-admission-class-submit]");
      const cancelButton = classForm.querySelector("[data-admission-class-cancel]");
      if (submitButton) submitButton.textContent = "Save class option";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(classForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) {
          field.disabled = !isAdmin;
        }
      });
    };

    const resetStageForm = () => {
      stageForm.reset();
      if (stageForm.elements.stageId) {
        stageForm.elements.stageId.value = "";
      }
      if (stageForm.elements.status) {
        stageForm.elements.status.value = "active";
      }
      const submitButton = stageForm.querySelector("[data-admission-stage-submit]");
      const cancelButton = stageForm.querySelector("[data-admission-stage-cancel]");
      if (submitButton) submitButton.textContent = "Save stage";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(stageForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) {
          field.disabled = !isAdmin;
        }
      });
    };

    const refresh = () => {
      renderAdmissionConfigurationSection({
        isAdmin,
        manager,
        summaryTarget,
        sessionListTarget,
        classListTarget,
        stageListTarget,
      });

      if (applyFormClassField && manager && typeof manager.summarize === "function") {
        const state = manager.summarize();
        const classOptions = (state.activeClasses || []).map((entry) => entry.name).filter(Boolean);
        if (classOptions.length) {
          applyFormClassField.setAttribute("list", "portal-admission-class-options");
          let datalist = document.getElementById("portal-admission-class-options");
          if (!datalist) {
            datalist = document.createElement("datalist");
            datalist.id = "portal-admission-class-options";
            applyFormClassField.insertAdjacentElement("afterend", datalist);
          }
          datalist.innerHTML = classOptions
            .map((option) => `<option value="${escapeHtml(option)}"></option>`)
            .join("");
        }
      }
    };

    clearPortalAdmissionConfigErrors(sessionForm);
    clearPortalAdmissionConfigErrors(classForm);
    clearPortalAdmissionConfigErrors(stageForm);
    resetSessionForm();
    resetClassForm();
    resetStageForm();
    refresh();

    if (!manager) {
      return;
    }

    sessionForm.addEventListener("input", () => {
      clearPortalAdmissionConfigErrors(sessionForm);
      if (isAdmin) setStatus(sessionStatus, "", "");
    });

    classForm.addEventListener("input", () => {
      clearPortalAdmissionConfigErrors(classForm);
      if (isAdmin) setStatus(classStatus, "", "");
    });

    stageForm.addEventListener("input", () => {
      clearPortalAdmissionConfigErrors(stageForm);
      if (isAdmin) setStatus(stageStatus, "", "");
    });

    sessionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(sessionStatus, "info", "Only administrators can configure admission sessions.");
        return;
      }

      clearPortalAdmissionConfigErrors(sessionForm);
      setStatus(sessionStatus, "", "");
      const payload = {
        id: sessionForm.elements.sessionId.value || undefined,
        name: String(sessionForm.elements.name.value || "").trim(),
        startDate: String(sessionForm.elements.startDate.value || "").trim(),
        endDate: String(sessionForm.elements.endDate.value || "").trim(),
        status: sessionForm.elements.status.value === "open" ? "open" : "closed",
      };

      let hasError = false;
      if (!payload.name) {
        setPortalAdmissionConfigError(sessionForm, "name", "Enter session name.");
        hasError = true;
      }
      if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
        setPortalAdmissionConfigError(sessionForm, "endDate", "End date must be after start date.");
        hasError = true;
      }
      if (hasError) {
        setStatus(sessionStatus, "error", "Fix the highlighted session fields.");
        return;
      }

      manager.upsertSession(payload);
      recordAuditEvent({
        action: payload.id ? "updated" : "created",
        entityType: "admission-session",
        entityId: payload.name,
        summary: `${payload.id ? "Updated" : "Created"} admission session ${payload.name}`,
        details: `${payload.status} • ${payload.startDate || "no start"} to ${payload.endDate || "no end"}`,
      });
      setStatus(sessionStatus, "success", `Admission session <strong>${escapeHtml(payload.name)}</strong> saved.`);
      clearFormDraftFor(sessionForm);
      resetSessionForm();
      refresh();
    });

    classForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(classStatus, "info", "Only administrators can configure admission classes.");
        return;
      }

      clearPortalAdmissionConfigErrors(classForm);
      setStatus(classStatus, "", "");
      const payload = {
        id: classForm.elements.classOptionId.value || undefined,
        name: String(classForm.elements.name.value || "").trim(),
        status: classForm.elements.status.value === "archived" ? "archived" : "active",
      };
      if (!payload.name) {
        setPortalAdmissionConfigError(classForm, "name", "Enter class option.");
        setStatus(classStatus, "error", "Class option is required.");
        return;
      }

      manager.upsertClassOption(payload);
      recordAuditEvent({
        action: payload.id ? "updated" : "created",
        entityType: "admission-class-option",
        entityId: payload.name,
        summary: `${payload.id ? "Updated" : "Added"} admission class option ${payload.name}`,
        details: `Status: ${payload.status}`,
      });
      setStatus(classStatus, "success", `Admission class option <strong>${escapeHtml(payload.name)}</strong> saved.`);
      clearFormDraftFor(classForm);
      resetClassForm();
      refresh();
    });

    stageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(stageStatus, "info", "Only administrators can configure application stages.");
        return;
      }

      clearPortalAdmissionConfigErrors(stageForm);
      setStatus(stageStatus, "", "");
      const payload = {
        id: stageForm.elements.stageId.value || undefined,
        name: String(stageForm.elements.name.value || "").trim(),
        order: Number.parseInt(stageForm.elements.order.value, 10) || 1,
        status: stageForm.elements.status.value === "archived" ? "archived" : "active",
      };

      if (!payload.name) {
        setPortalAdmissionConfigError(stageForm, "name", "Enter stage name.");
        setStatus(stageStatus, "error", "Stage name is required.");
        return;
      }

      manager.upsertStage(payload);
      recordAuditEvent({
        action: payload.id ? "updated" : "created",
        entityType: "admission-stage",
        entityId: payload.name,
        summary: `${payload.id ? "Updated" : "Added"} admission stage ${payload.name}`,
        details: `Order ${payload.order} • ${payload.status}`,
      });
      setStatus(stageStatus, "success", `Application stage <strong>${escapeHtml(payload.name)}</strong> saved.`);
      clearFormDraftFor(stageForm);
      resetStageForm();
      refresh();
    });

    const sessionCancel = sessionForm.querySelector("[data-admission-session-cancel]");
    if (sessionCancel) {
      sessionCancel.addEventListener("click", () => {
        clearPortalAdmissionConfigErrors(sessionForm);
        resetSessionForm();
        setStatus(sessionStatus, "", "");
      });
    }

    const classCancel = classForm.querySelector("[data-admission-class-cancel]");
    if (classCancel) {
      classCancel.addEventListener("click", () => {
        clearPortalAdmissionConfigErrors(classForm);
        resetClassForm();
        setStatus(classStatus, "", "");
      });
    }

    const stageCancel = stageForm.querySelector("[data-admission-stage-cancel]");
    if (stageCancel) {
      stageCancel.addEventListener("click", () => {
        clearPortalAdmissionConfigErrors(stageForm);
        resetStageForm();
        setStatus(stageStatus, "", "");
      });
    }

    sessionListTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admission-session-action]");
      if (!button || !isAdmin) {
        return;
      }
      const action = String(button.dataset.admissionSessionAction || "").trim();
      const sessionId = String(button.dataset.admissionSessionId || "").trim();
      const record = manager.getState().sessions.find((entry) => entry.id === sessionId);
      if (!record) {
        return;
      }

      if (action === "edit") {
        sessionForm.elements.sessionId.value = record.id;
        sessionForm.elements.name.value = record.name || "";
        sessionForm.elements.startDate.value = record.startDate || "";
        sessionForm.elements.endDate.value = record.endDate || "";
        sessionForm.elements.status.value = record.status || "closed";
        const submitButton = sessionForm.querySelector("[data-admission-session-submit]");
        const cancelButton = sessionForm.querySelector("[data-admission-session-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        setStatus(sessionStatus, "info", `Editing admission session <strong>${escapeHtml(record.name)}</strong>.`);
        return;
      }

      if (action === "open" || action === "close") {
        manager.setSessionStatus(record.id, action === "open" ? "open" : "closed");
        setStatus(sessionStatus, "success", `Session <strong>${escapeHtml(record.name)}</strong> ${action === "open" ? "opened" : "closed"}.`);
        recordAuditEvent({
          action: action === "open" ? "opened" : "closed",
          entityType: "admission-session",
          entityId: record.id,
          summary: `${action === "open" ? "Opened" : "Closed"} admission session ${record.name}`,
          details: "",
        });
        refresh();
      }
    });

    classListTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admission-class-action]");
      if (!button || !isAdmin) {
        return;
      }
      const action = String(button.dataset.admissionClassAction || "").trim();
      const classId = String(button.dataset.admissionClassId || "").trim();
      const record = manager.getState().classes.find((entry) => entry.id === classId);
      if (!record) {
        return;
      }

      if (action === "edit") {
        classForm.elements.classOptionId.value = record.id;
        classForm.elements.name.value = record.name || "";
        classForm.elements.status.value = record.status || "active";
        const submitButton = classForm.querySelector("[data-admission-class-submit]");
        const cancelButton = classForm.querySelector("[data-admission-class-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        setStatus(classStatus, "info", `Editing class option <strong>${escapeHtml(record.name)}</strong>.`);
        return;
      }

      if (action === "archive" || action === "activate") {
        manager.setClassOptionStatus(record.id, action === "archive" ? "archived" : "active");
        setStatus(classStatus, "success", `Class option <strong>${escapeHtml(record.name)}</strong> ${action === "archive" ? "archived" : "reactivated"}.`);
        recordAuditEvent({
          action: action === "archive" ? "archived" : "reactivated",
          entityType: "admission-class-option",
          entityId: record.id,
          summary: `${action === "archive" ? "Archived" : "Reactivated"} class option ${record.name}`,
          details: "",
        });
        refresh();
      }
    });

    stageListTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admission-stage-action]");
      if (!button || !isAdmin) {
        return;
      }
      const action = String(button.dataset.admissionStageAction || "").trim();
      const stageId = String(button.dataset.admissionStageId || "").trim();
      const record = manager.getState().stages.find((entry) => entry.id === stageId);
      if (!record) {
        return;
      }

      if (action === "edit") {
        stageForm.elements.stageId.value = record.id;
        stageForm.elements.name.value = record.name || "";
        stageForm.elements.order.value = record.order || 1;
        stageForm.elements.status.value = record.status || "active";
        const submitButton = stageForm.querySelector("[data-admission-stage-submit]");
        const cancelButton = stageForm.querySelector("[data-admission-stage-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        setStatus(stageStatus, "info", `Editing stage <strong>${escapeHtml(record.name)}</strong>.`);
        return;
      }

      if (action === "archive" || action === "activate") {
        manager.setStageStatus(record.id, action === "archive" ? "archived" : "active");
        setStatus(stageStatus, "success", `Stage <strong>${escapeHtml(record.name)}</strong> ${action === "archive" ? "archived" : "reactivated"}.`);
        recordAuditEvent({
          action: action === "archive" ? "archived" : "reactivated",
          entityType: "admission-stage",
          entityId: record.id,
          summary: `${action === "archive" ? "Archived" : "Reactivated"} stage ${record.name}`,
          details: "",
        });
        refresh();
      }
    });

    window.addEventListener(manager.eventName, refresh);
  }

  function getRecommendedAdmissionSessionName() {
    const year = new Date().getFullYear();
    return `${year}/${year + 1} Admissions`;
  }

  function parseAdmissionSetupStageNames(value) {
    const seen = new Set();
    return String(value || "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => {
        const key = item.toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function clearPortalAdmissionSetupErrors(form) {
    if (!form) {
      return;
    }
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-admission-setup-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalAdmissionSetupError(form, fieldName, message) {
    if (!form) {
      return;
    }
    const error = form.querySelector(`[data-admission-setup-error-for="${fieldName}"]`);
    const control =
      fieldName === "classes"
        ? form.querySelector("#portal-admission-class-picker")
        : form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }
    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function getAdmissionSetupClassGroups(manager) {
    const seen = new Set();
    const groups = getConfiguredStudentLevelGroups()
      .map((group) => {
        const levels = [];
        (group.levels || []).forEach((level) => {
          const name = String(level || "").trim();
          const key = normalizeLevelToken(name);
          if (!name || seen.has(key)) {
            return;
          }
          seen.add(key);
          levels.push(name);
        });
        return {
          label: group.label || "Classes",
          levels,
        };
      })
      .filter((group) => group.levels.length);

    const savedLevels = [];
    if (manager && typeof manager.summarize === "function") {
      const summary = manager.summarize();
      (summary.classes || []).forEach((entry) => {
        const name = String(entry.name || "").trim();
        const key = normalizeLevelToken(name);
        if (!name || seen.has(key)) {
          return;
        }
        seen.add(key);
        savedLevels.push(name);
      });
    }

    if (savedLevels.length) {
      groups.push({
        label: "Saved admission classes",
        levels: savedLevels.sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
      });
    }

    return groups;
  }

  function syncAdmissionClassFieldOptions(
    classNames,
    applyFormClassField,
    { placeholder = "Select level/class", emptyLabel = "No admission classes configured" } = {},
  ) {
    if (!applyFormClassField) {
      return;
    }

    const uniqueClassNames = Array.from(
      new Set(
        (classNames || [])
          .map((name) => String(name || "").trim())
          .filter(Boolean),
      ),
    );

    if (applyFormClassField instanceof HTMLSelectElement) {
      const previousValue = String(applyFormClassField.value || "").trim();
      const selectedOption =
        uniqueClassNames.find((name) => normalizeLevelToken(name) === normalizeLevelToken(previousValue)) || "";

      applyFormClassField.innerHTML = `
        <option value="">${escapeHtml(uniqueClassNames.length ? placeholder : emptyLabel)}</option>
        ${uniqueClassNames
          .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
          .join("")}
      `;
      applyFormClassField.value = selectedOption;
      applyFormClassField.disabled = !uniqueClassNames.length;
      return;
    }

    if (!uniqueClassNames.length) {
      applyFormClassField.removeAttribute("list");
      const existingDatalist = document.getElementById("portal-admission-class-options");
      if (existingDatalist) {
        existingDatalist.innerHTML = "";
      }
      return;
    }

    applyFormClassField.setAttribute("list", "portal-admission-class-options");
    let datalist = document.getElementById("portal-admission-class-options");
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "portal-admission-class-options";
      applyFormClassField.insertAdjacentElement("afterend", datalist);
    }
    datalist.innerHTML = uniqueClassNames
      .map((option) => `<option value="${escapeHtml(option)}"></option>`)
      .join("");
  }

  function renderAdmissionSetupSummary({ manager, summaryTarget, previewTarget }) {
    if (!summaryTarget) {
      return;
    }

    if (!manager || typeof manager.summarize !== "function") {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Admission settings unavailable</span>
          <strong>0</strong>
          <p>The admissions settings manager could not be loaded on this page.</p>
        </article>
      `;
      if (previewTarget) {
        previewTarget.innerHTML = "";
      }
      return;
    }

    const summary = manager.summarize();
    const activeClassNames = (summary.activeClasses || []).map((entry) => entry.name).filter(Boolean);
    const activeStageNames = (summary.activeStages || []).map((entry) => entry.name).filter(Boolean);
    const openSessionName = summary.openSession?.name || "";

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Application form</span>
        <strong>${openSessionName ? "Open" : "Closed"}</strong>
        <p>${openSessionName ? escapeHtml(openSessionName) : "No open admission session yet."}</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Classes open</span>
        <strong>${activeClassNames.length}</strong>
        <p>${activeClassNames.length ? "Applicants can choose these classes." : "Choose at least one class below."}</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Review stages</span>
        <strong>${activeStageNames.length}</strong>
        <p>${activeStageNames.length ? escapeHtml(activeStageNames.join(", ")) : "Use the recommended stages to start."}</p>
      </article>
    `;

    if (!previewTarget) {
      return;
    }

    previewTarget.innerHTML = `
      <article class="portal-admission-setup-card">
        <div>
          <span>Public application setup</span>
          <strong>${openSessionName ? escapeHtml(openSessionName) : "Applications closed"}</strong>
        </div>
        <p>${activeClassNames.length ? escapeHtml(activeClassNames.join(", ")) : "No classes have been opened for admission."}</p>
      </article>
      <article class="portal-admission-setup-card">
        <div>
          <span>Review flow</span>
          <strong>${activeStageNames.length ? `${activeStageNames.length} stage${activeStageNames.length === 1 ? "" : "s"}` : "Not set"}</strong>
        </div>
        <p>${activeStageNames.length ? escapeHtml(activeStageNames.join(" -> ")) : "Submitted, Screening, Interview, Approved is the recommended flow."}</p>
      </article>
    `;
  }

  function initAdmissionSetupControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    classPicker,
    previewTarget,
    applyFormClassField = null,
  }) {
    if (!summaryTarget || !form || !status || !classPicker) {
      return;
    }

    const recommendedStages = ["Submitted", "Screening", "Interview", "Approved"];

    const setControlsDisabled = () => {
      Array.from(form.elements).forEach((field) => {
        if (field instanceof HTMLElement) {
          field.disabled = !isAdmin;
        }
      });
    };

    const getSelectedClassNames = () =>
      Array.from(form.querySelectorAll('input[name="admissionClassOption"]:checked'))
        .map((input) => input.value.trim())
        .filter(Boolean);

    const renderClassPicker = (groups, activeClassNames) => {
      const activeTokens = new Set(activeClassNames.map((name) => normalizeLevelToken(name)));
      const shouldPreselectAll = !activeTokens.size;

      if (!groups.length) {
        classPicker.innerHTML = `
          <article class="portal-class-empty portal-admission-choice-empty">
            <strong>No classes found</strong>
            <p>Select your school structure in Settings or generate classes first.</p>
          </article>
        `;
        return;
      }

      classPicker.innerHTML = groups
        .map(
          (group) => `
            <section class="portal-admission-choice-group">
              <span>${escapeHtml(group.label)}</span>
              <div class="portal-admission-choice-options">
                ${group.levels
                  .map((level) => {
                    const checked = shouldPreselectAll || activeTokens.has(normalizeLevelToken(level));
                    return `
                      <label class="portal-admission-choice">
                        <input
                          type="checkbox"
                          name="admissionClassOption"
                          value="${escapeHtml(level)}"
                          ${checked ? "checked" : ""}
                        />
                        <span>${escapeHtml(level)}</span>
                      </label>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("");
    };

    const refresh = () => {
      if (!manager || typeof manager.summarize !== "function") {
        renderAdmissionSetupSummary({ manager, summaryTarget, previewTarget });
        setStatus(status, "error", "Admission settings are unavailable on this page.");
        setControlsDisabled();
        return;
      }

      const summary = manager.summarize();
      const sessionName = summary.openSession?.name || summary.sessions?.[0]?.name || getRecommendedAdmissionSessionName();
      const activeStageNames = (summary.activeStages || []).map((entry) => entry.name).filter(Boolean);
      const activeClassNames = (summary.activeClasses || []).map((entry) => entry.name).filter(Boolean);
      const groups = getAdmissionSetupClassGroups(manager);

      form.elements.sessionName.value = sessionName;
      form.elements.sessionStatus.value = summary.openSession ? "open" : summary.sessions?.[0]?.status || "open";
      form.elements.stages.value = (activeStageNames.length ? activeStageNames : recommendedStages).join(", ");
      renderClassPicker(groups, activeClassNames);
      setControlsDisabled();
      renderAdmissionSetupSummary({ manager, summaryTarget, previewTarget });
      syncAdmissionClassFieldOptions(
        activeClassNames.length ? activeClassNames : groups.flatMap((group) => group.levels),
        applyFormClassField,
      );

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can update admission settings.");
      }
    };

    const resetToRecommendedSetup = () => {
      clearPortalAdmissionSetupErrors(form);
      form.elements.sessionName.value = form.elements.sessionName.value.trim() || getRecommendedAdmissionSessionName();
      form.elements.sessionStatus.value = "open";
      form.elements.stages.value = recommendedStages.join(", ");
      form.querySelectorAll('input[name="admissionClassOption"]').forEach((input) => {
        input.checked = true;
      });
      setStatus(status, "info", "Recommended setup filled in. Save when it looks right.");
    };

    clearPortalAdmissionSetupErrors(form);
    refresh();

    if (!manager || typeof manager.saveState !== "function") {
      return;
    }

    form.addEventListener("input", () => {
      clearPortalAdmissionSetupErrors(form);
      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    const recommendedButton = form.querySelector("[data-admission-setup-recommended]");
    if (recommendedButton) {
      recommendedButton.addEventListener("click", resetToRecommendedSetup);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can update admission settings.");
        return;
      }

      clearPortalAdmissionSetupErrors(form);
      setStatus(status, "", "");

      const sessionName = String(form.elements.sessionName.value || "").trim();
      const sessionStatus = form.elements.sessionStatus.value === "closed" ? "closed" : "open";
      const selectedClassNames = getSelectedClassNames();
      const stageNames = parseAdmissionSetupStageNames(form.elements.stages.value);
      const allClassGroups = getAdmissionSetupClassGroups(manager);
      const allClassNames = allClassGroups.flatMap((group) => group.levels);
      let hasError = false;

      if (!sessionName) {
        setPortalAdmissionSetupError(form, "sessionName", "Enter the admission session name.");
        hasError = true;
      }

      if (!allClassNames.length) {
        setPortalAdmissionSetupError(form, "classes", "Set your school structure in Settings or create classes first.");
        hasError = true;
      } else if (!selectedClassNames.length) {
        setPortalAdmissionSetupError(form, "classes", "Select at least one class for admission.");
        hasError = true;
      }

      if (!stageNames.length) {
        setPortalAdmissionSetupError(form, "stages", "Add at least one review stage.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted admission settings.");
        return;
      }

      const currentState =
        typeof manager.getState === "function"
          ? manager.getState()
          : {
              sessions: [],
              classes: [],
              stages: [],
            };
      const timestamp = nowIso();
      const existingOpenSession = (currentState.sessions || []).find((entry) => entry.status === "open");
      const existingSession = existingOpenSession || currentState.sessions?.[0] || null;
      const sessionId = existingSession?.id || "";
      const nextSession = {
        ...(existingSession || {}),
        name: sessionName,
        status: sessionStatus,
        startDate: existingSession?.startDate || "",
        endDate: existingSession?.endDate || "",
        createdAt: existingSession?.createdAt || timestamp,
        updatedAt: timestamp,
      };
      if (sessionId) {
        nextSession.id = sessionId;
      }

      const nextSessions = [
        nextSession,
        ...(currentState.sessions || []).filter((entry) => (sessionId ? entry.id !== sessionId : true)),
      ].map((entry) =>
        sessionStatus === "open" && entry !== nextSession
          ? {
              ...entry,
              status: "closed",
              updatedAt: timestamp,
            }
          : entry,
      );

      const selectedClassTokens = new Set(selectedClassNames.map((name) => normalizeLevelToken(name)));
      const existingClassByToken = new Map(
        (currentState.classes || []).map((entry) => [normalizeLevelToken(entry.name), entry]),
      );
      const nextClasses = allClassNames.map((name) => {
        const existing = existingClassByToken.get(normalizeLevelToken(name));
        return {
          ...(existing || {}),
          name,
          status: selectedClassTokens.has(normalizeLevelToken(name)) ? "active" : "archived",
          createdAt: existing?.createdAt || timestamp,
          updatedAt: timestamp,
        };
      });

      const existingStageByName = new Map(
        (currentState.stages || []).map((entry) => [String(entry.name || "").trim().toLowerCase(), entry]),
      );
      const nextStages = stageNames.map((name, index) => {
        const existing = existingStageByName.get(name.toLowerCase());
        return {
          ...(existing || {}),
          name,
          order: index + 1,
          status: "active",
          createdAt: existing?.createdAt || timestamp,
          updatedAt: timestamp,
        };
      });

      const savedState = manager.saveState({
        sessions: nextSessions,
        classes: nextClasses,
        stages: nextStages,
      });
      const savedSummary = typeof manager.summarize === "function" ? manager.summarize() : savedState;
      const savedClassNames = (savedSummary.activeClasses || []).map((entry) => entry.name).filter(Boolean);
      syncAdmissionClassFieldOptions(savedClassNames, applyFormClassField);
      recordAuditEvent({
        action: "updated",
        entityType: "admission-settings",
        entityId: sessionName,
        summary: `Updated admission settings for ${sessionName}`,
        details: `${selectedClassNames.length} classes • ${stageNames.length} review stages • ${sessionStatus}`,
      });
      setStatus(status, "success", "Admission settings saved.");
      refresh();
    });

    window.addEventListener(manager.eventName, refresh);
  }

  function initTimetableControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const cycleManager = getAcademicCycleManager();
    const classManager = getClassManager();
    const courseManager = getCourseManager();
    const lessonOverlay = document.getElementById("portal-timetable-lesson-overlay");
    const periodOverlay = document.getElementById("portal-timetable-period-overlay");
    const periodForm = document.getElementById("portal-timetable-period-form");
    const periodTitle = document.getElementById("timetable-period-title");
    const sessionSelect = document.getElementById("timetable-session-id");
    const termSelect = document.getElementById("timetable-term-id");
    const viewModeSelect = document.getElementById("timetable-view-mode");
    const classSelect = document.getElementById("timetable-class-level");
    const teacherViewSelect = document.getElementById("timetable-teacher-view");
    const weekTypeSelect = document.getElementById("timetable-week-type");
    const copyTermButton = document.querySelector("[data-timetable-copy-term]");
    const addPeriodButton = document.querySelector("[data-timetable-period-add]");
    const saveClassButton = document.querySelector("[data-timetable-save-class]");
    const printButton = document.querySelector("[data-timetable-print]");
    const deleteButton = form.querySelector("[data-timetable-delete]");
    const formTitle = document.getElementById("timetable-form-title");
    const formContext = document.getElementById("timetable-form-context");
    const state = {
      selectedPeriodId: "",
      editingEntryId: "",
    };
    let timetableToastTimer = null;
    let timetableModalElement = null;
    let timetableModalBody = null;
    let activeTimetablePrintCriteria = null;

    const showTimetableToast = (message) => {
      if (!message) {
        return;
      }

      let toast = document.getElementById("portal-timetable-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "portal-timetable-toast";
        toast.className = "portal-toast portal-toast--success";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
      }

      toast.innerHTML = message;
      toast.hidden = false;
      window.clearTimeout(timetableToastTimer);
      timetableToastTimer = window.setTimeout(() => {
        toast.hidden = true;
      }, 3600);
    };

    const setTimetableStatus = (type, message) => {
      setStatus(status, type, message);
      if (type === "success" && message) {
        showTimetableToast(message);
      }
    };

    const setFormVisibility = (visible) => {
      form.hidden = !visible;
      if (lessonOverlay) {
        lessonOverlay.hidden = !visible;
      }
      document.body.classList.toggle("portal-overlay-open", visible || Boolean(periodOverlay && !periodOverlay.hidden));
    };

    const setPeriodFormVisibility = (visible) => {
      if (periodOverlay) {
        periodOverlay.hidden = !visible;
      }
      document.body.classList.toggle("portal-overlay-open", visible || Boolean(lessonOverlay && !lessonOverlay.hidden));
    };

    const setTimetableModalOpen = (visible) => {
      if (!timetableModalElement) {
        return;
      }
      timetableModalElement.hidden = !visible;
      document.body.classList.toggle("portal-overlay-open", visible || Boolean(lessonOverlay && !lessonOverlay.hidden) || Boolean(periodOverlay && !periodOverlay.hidden));
    };

    const ensureTimetableModal = () => {
      if (timetableModalElement) {
        return timetableModalElement;
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div id="portal-timetable-class-modal" class="portal-overlay portal-timetable-class-modal" hidden>
          <button class="portal-overlay-backdrop" type="button" data-timetable-class-close aria-label="Close timetable preview"></button>
          <section class="portal-overlay-panel portal-timetable-class-modal-panel" role="dialog" aria-modal="true" aria-labelledby="portal-timetable-class-modal-title">
            <header class="portal-overlay-head">
              <div>
                <h3 id="portal-timetable-class-modal-title">Class timetable</h3>
                <span>Preview the saved timetable before printing.</span>
              </div>
              <button class="portal-overlay-close" type="button" data-timetable-class-close aria-label="Close timetable preview">&times;</button>
            </header>
            <div id="portal-timetable-class-modal-body" class="portal-timetable-class-modal-body"></div>
            <div class="utility-actions portal-timetable-modal-actions">
              <button class="button button-primary" type="button" data-timetable-class-print-current>Print timetable</button>
              <button class="button button-outline" type="button" data-timetable-class-close>Close</button>
            </div>
          </section>
        </div>
      `;
      document.body.appendChild(wrapper.firstElementChild);
      timetableModalElement = document.getElementById("portal-timetable-class-modal");
      timetableModalBody = document.getElementById("portal-timetable-class-modal-body");
      timetableModalElement.addEventListener("click", (event) => {
        if (event.target.closest("[data-timetable-class-close]")) {
          setTimetableModalOpen(false);
          return;
        }
        if (event.target.closest("[data-timetable-class-print-current]") && activeTimetablePrintCriteria) {
          printClassTimetable(activeTimetablePrintCriteria);
        }
      });
      return timetableModalElement;
    };

    const clearTimetablePeriodErrors = () => {
      if (!periodForm) {
        return;
      }
      periodForm.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
      periodForm.querySelectorAll("[data-period-error-for]").forEach((error) => {
        error.textContent = "";
      });
    };

    const setTimetablePeriodError = (fieldName, message) => {
      if (!periodForm) {
        return;
      }
      const error = periodForm.querySelector(`[data-period-error-for="${fieldName}"]`);
      const control = periodForm.elements[fieldName];
      const field = control ? control.closest(".portal-field") : null;
      if (error) {
        error.textContent = message;
      }
      if (field) {
        field.classList.add("is-invalid");
      }
    };

    const resetTimetablePeriodForm = () => {
      if (!periodForm) {
        return;
      }
      periodForm.reset();
      if (periodForm.elements.periodIds) periodForm.elements.periodIds.value = "";
      if (periodForm.elements.sortOrder) periodForm.elements.sortOrder.value = "";
      clearTimetablePeriodErrors();
      Array.from(periodForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) field.disabled = !isAdmin;
      });
      if (periodTitle) {
        periodTitle.textContent = "Edit Period";
      }
    };

    const openTimetablePeriodForm = (options = {}) => {
      if (!periodForm || !isAdmin || !manager) {
        return;
      }
      resetTimetablePeriodForm();
      const periodIds = String(options.periodIds || "").trim();
      if (periodForm.elements.periodIds) periodForm.elements.periodIds.value = periodIds;
      if (periodForm.elements.sortOrder) periodForm.elements.sortOrder.value = String(options.sortOrder || "");
      if (periodForm.elements.name) periodForm.elements.name.value = String(options.name || (periodIds ? "" : "Period")).trim();
      if (periodForm.elements.startTime) periodForm.elements.startTime.value = String(options.startTime || "").trim();
      if (periodForm.elements.endTime) periodForm.elements.endTime.value = String(options.endTime || "").trim();
      if (periodTitle) {
        periodTitle.textContent = periodIds ? "Edit Period" : "Add Period";
      }
      setPeriodFormVisibility(true);
    };

    const getCycleState = () =>
      cycleManager && typeof cycleManager.getState === "function"
        ? cycleManager.getState()
        : { sessions: [], terms: [] };

    const getActiveClasses = () =>
      classManager && typeof classManager.getClasses === "function"
        ? classManager.getClasses().filter((item) => item.status !== "archived")
        : [];

    const getTeacherDirectory = () => {
      const workspaceId = getCurrentWorkspaceId();
      return getUsers()
        .filter(
          (user) =>
            normalizeRoleLabel(user.role) === "Teacher" &&
            !isUserDeactivated(user) &&
            normalizeWorkspaceId(user.workspaceId || "public") === workspaceId,
        )
        .map((user) => ({
          id: user.id,
          name: user.displayName || user.email || "Unnamed teacher",
          email: user.email || "",
          maxPeriodsPerWeek: Number.parseInt(user.maxPeriodsPerWeek, 10) || 24,
        }))
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
    };

    const getSelectedSessionId = () => String(sessionSelect?.value || "").trim();
    const getSelectedTermId = () => String(termSelect?.value || "").trim();
    const getSelectedWeekType = () => String(weekTypeSelect?.value || "all").trim() || "all";

    const getSelectedClass = () => {
      const classes = getActiveClasses();
      const selected = String(classSelect?.value || "").trim();
      return (
        classes.find((record) => record.id === selected) ||
        classes.find((record) => record.level === selected) ||
        null
      );
    };

    const getTimetableClassLabel = (classRecord = null) =>
      classRecord ? getClassDisplayName(classRecord) : "";

    const getSelectedTeacher = () => {
      const teachers = getTeacherDirectory();
      const selected = String(teacherViewSelect?.value || "").trim();
      return teachers.find((teacher) => teacher.id === selected) || teachers[0] || null;
    };

    const getClassTimetablePrintData = (criteria = {}) => {
      const cycleState = getCycleState();
      const days = manager.schoolDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const summary = manager.summarize();
      const sessionId = String(criteria.sessionId || getSelectedSessionId()).trim();
      const termId = String(criteria.termId || getSelectedTermId()).trim();
      const classId = String(criteria.classId || getSelectedClass()?.id || "").trim();
      const classLevel = String(criteria.classLevel || getTimetableClassLabel(getSelectedClass())).trim();
      const weekType = String(criteria.weekType || getSelectedWeekType()).trim() || "all";
      const entries = (summary.entries || []).filter(
        (entry) =>
          entry.status !== "archived" &&
          entry.sessionId === sessionId &&
          entry.termId === termId &&
          (classId
            ? String(entry.classId || "").trim() === classId
            : String(entry.classLevel || "").trim().toLowerCase() === classLevel.toLowerCase()) &&
          portalTimetableWeekTypesOverlap(entry.weekType, weekType),
      );
      const settings = getConfiguredSchoolSettings();

      return {
        schoolName: settings.schoolName || "School",
        classLevel,
        sessionName: getSessionLabelFromCycle(cycleState, sessionId),
        termName: getTermLabelFromCycle(cycleState, termId),
        weekType,
        days,
        slotRows: getPortalTimetableSlotRows(summary.activePeriods || [], days),
        entries,
        sessionId,
        termId,
        classId,
      };
    };

    const renderClassTimetableModal = (criteria = {}) => {
      const data = getClassTimetablePrintData(criteria);
      if (!data.sessionId || !data.termId || !data.classLevel) {
        setStatus(status, "info", "Select a session, term, and class before viewing a timetable.");
        return;
      }
      if (!data.entries.length) {
        setStatus(status, "info", "No timetable lessons have been saved for this class yet.");
        return;
      }

      ensureTimetableModal();
      activeTimetablePrintCriteria = {
        sessionId: data.sessionId,
        termId: data.termId,
        classLevel: data.classLevel,
        weekType: data.weekType,
      };
      timetableModalBody.innerHTML = renderPortalTimetablePrintSheet(data);
      setTimetableModalOpen(true);
    };

    const printClassTimetable = (criteria = {}) => {
      const data = getClassTimetablePrintData(criteria);
      if (!data.sessionId || !data.termId || !data.classLevel) {
        setStatus(status, "info", "Select a session, term, and class before printing.");
        return;
      }
      if (!data.entries.length) {
        setStatus(status, "info", "No timetable lessons have been saved for this class yet.");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setStatus(status, "info", "Allow popups for this page, then try printing again.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${escapeHtml(data.classLevel)} Timetable</title>
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; padding: 24px; font-family: Arial, sans-serif; color: #17233a; background: #ffffff; }
              .portal-timetable-print-head { text-align: center; margin-bottom: 18px; }
              .portal-timetable-print-head h1 { margin: 0 0 4px; font-size: 22px; }
              .portal-timetable-print-head h2 { margin: 0 0 6px; font-size: 18px; }
              .portal-timetable-print-head p { margin: 0; color: #526070; font-size: 12px; }
              .portal-timetable-print-grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
              .portal-timetable-print-grid th,
              .portal-timetable-print-grid td { border: 1px solid #aeb9c8; padding: 8px; min-height: 58px; vertical-align: top; font-size: 11px; }
              .portal-timetable-print-grid thead th { background: #17233a; color: #ffffff; text-align: center; }
              .portal-timetable-print-grid tbody th { width: 120px; background: #f1f5f9; text-align: left; }
              .portal-timetable-print-grid strong,
              .portal-timetable-print-grid span { display: block; overflow-wrap: anywhere; }
              .portal-timetable-print-empty { color: #8a95a7; }
              @page { size: landscape; margin: 12mm; }
            </style>
          </head>
          <body>
            ${renderPortalTimetablePrintSheet(data)}
            <script>
              window.addEventListener("load", function () {
                window.focus();
                window.print();
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    const getSubjectOptions = () => {
      const selectedClass = getSelectedClass();
      const classLevel = String(selectedClass?.level || "").trim();
      const courseOptions =
        courseManager && typeof courseManager.getCourses === "function"
          ? courseManager
              .getCourses()
              .filter(
                (course) =>
                  course.status !== "archived" &&
                  (!course.level || !classLevel || String(course.level || "").trim() === classLevel),
              )
              .map((course) => ({
                id: course.id,
                label: course.code ? `${course.code} - ${course.name}` : course.name,
                name: course.name,
              }))
          : [];
      const classSubjects = (selectedClass?.subjects || []).map((subject) => ({
        id: `subject:${subject}`,
        label: subject,
        name: subject,
      }));
      const seen = new Set();
      return courseOptions.concat(classSubjects).filter((subject) => {
        const key = String(subject.name || subject.label || "").trim().toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    };

    const applySessionTermClassOptions = () => {
      const cycles = cycleManager && typeof cycleManager.getState === "function"
        ? cycleManager.getState()
        : { sessions: [], terms: [] };
      const sessions = Array.isArray(cycles.sessions) ? cycles.sessions : [];
      const terms = Array.isArray(cycles.terms) ? cycles.terms : [];
      const classes = classManager && typeof classManager.getClasses === "function"
        ? classManager.getClasses().filter((item) => item.status !== "archived")
        : [];
      const teachers = getTeacherDirectory();
      const selectedSessionId = getSelectedSessionId();
      const selectedTermId = getSelectedTermId();
      const selectedClassValue = String(classSelect?.value || "").trim();
      const selectedTeacherValue = String(teacherViewSelect?.value || "").trim();
      const activeSessionId = sessions.find((session) => session.status === "open")?.id || "";
      const sessionId = selectedSessionId || activeSessionId || sessions[0]?.id || "";
      const termsForSession = terms.filter((term) => !sessionId || term.sessionId === sessionId);
      const activeTermId = termsForSession.find((term) => term.status === "open")?.id || "";
      const termId = termsForSession.some((term) => term.id === selectedTermId)
        ? selectedTermId
        : activeTermId || termsForSession[0]?.id || "";

      if (sessionSelect) {
        const sessionOptions = sessions
          .map((session) => `<option value="${escapeHtml(session.id)}">${escapeHtml(session.name)} ${session.status === "open" ? "(Open)" : ""}</option>`)
          .join("");
        sessionSelect.innerHTML = `<option value="">${sessions.length ? "Select session" : "Create session first"}</option>${sessionOptions}`;
        if (sessionId) {
          sessionSelect.value = sessionId;
        }
        sessionSelect.disabled = !isAdmin || !sessions.length;
      }

      if (termSelect) {
        const termOptions = termsForSession
          .map((term) => {
            const periodLabel = term.periodType === "semester" ? "Semester" : "Term";
            return `<option value="${escapeHtml(term.id)}">${periodLabel}: ${escapeHtml(term.name)} ${
              term.status === "open" ? "(Open)" : ""
            }</option>`;
          })
          .join("");
        termSelect.innerHTML = `<option value="">${termsForSession.length ? "Select term or semester" : "Create a term or semester first"}</option>${termOptions}`;
        if (termId) {
          termSelect.value = termId;
        }
        termSelect.disabled = !isAdmin || !termsForSession.length;
      }

      if (classSelect) {
        const classOptions = classes
          .map((record) => `<option value="${escapeHtml(record.id)}">${escapeHtml(getTimetableClassLabel(record))}</option>`)
          .join("");
        classSelect.innerHTML = `<option value="">${classes.length ? "Select class" : "Create classes first"}</option>${classOptions}`;
        if (selectedClassValue && classes.some((record) => record.id === selectedClassValue || record.level === selectedClassValue)) {
          const matched = classes.find((record) => record.id === selectedClassValue || record.level === selectedClassValue);
          classSelect.value = matched?.id || "";
        } else {
          classSelect.value = "";
        }
        classSelect.disabled = !isAdmin || !classes.length;
      }

      if (teacherViewSelect) {
        teacherViewSelect.innerHTML = `<option value="">${teachers.length ? "Select teacher" : "Create teacher first"}</option>${teachers
          .map((teacher) => `<option value="${escapeHtml(teacher.id)}">${escapeHtml(teacher.name)}</option>`)
          .join("")}`;
        if (selectedTeacherValue && teachers.some((teacher) => teacher.id === selectedTeacherValue)) {
          teacherViewSelect.value = selectedTeacherValue;
        } else if (teachers[0]) {
          teacherViewSelect.value = teachers[0].id;
        }
        teacherViewSelect.disabled = !isAdmin || !teachers.length;
      }

      if (form.elements.teacherId) {
        const currentTeacher = String(form.elements.teacherId.value || "").trim();
        form.elements.teacherId.innerHTML = `<option value="">${teachers.length ? "Select teacher" : "Create teacher first"}</option>${teachers
          .map((teacher) => `<option value="${escapeHtml(teacher.id)}">${escapeHtml(teacher.name)}</option>`)
          .join("")}`;
        if (currentTeacher && teachers.some((teacher) => teacher.id === currentTeacher)) {
          form.elements.teacherId.value = currentTeacher;
        } else if (viewModeSelect?.value === "teacher" && getSelectedTeacher()) {
          form.elements.teacherId.value = getSelectedTeacher().id;
        }
        form.elements.teacherId.disabled = !isAdmin || !teachers.length;
      }

      if (form.elements.subjectId) {
        const currentSubject = String(form.elements.subjectId.value || "").trim();
        const subjectOptions = getSubjectOptions();
        form.elements.subjectId.innerHTML = `<option value="">${subjectOptions.length ? "Select subject" : "Add custom subject"}</option>${subjectOptions
          .map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.label)}</option>`)
          .join("")}<option value="__custom">Other / custom</option>`;
        if (currentSubject && (currentSubject === "__custom" || subjectOptions.some((subject) => subject.id === currentSubject))) {
          form.elements.subjectId.value = currentSubject;
        }
        form.elements.subjectId.disabled = !isAdmin;
      }
    };

    const updateCustomSubjectVisibility = () => {
      const subjectField = form.elements.subject;
      const subjectSelect = form.elements.subjectId;
      const wrapper = subjectField?.closest(".portal-field");
      if (!subjectField || !subjectSelect || !wrapper) {
        return;
      }
      const isCustom = subjectSelect.value === "__custom" || !subjectSelect.value;
      wrapper.hidden = !isCustom;
      subjectField.disabled = !isAdmin || !isCustom;
      if (!isCustom) {
        subjectField.value = "";
      }
    };

    const getSelectedPeriod = () => {
      const periodId = String(form.elements.periodId?.value || state.selectedPeriodId || "").trim();
      const periods = manager && typeof manager.getPeriods === "function" ? manager.getPeriods() : [];
      return periods.find((period) => period.id === periodId) || null;
    };

    const buildEntryPayloadFromForm = () => {
      const selectedClass = getSelectedClass();
      const selectedTeacher = getTeacherDirectory().find((teacher) => teacher.id === String(form.elements.teacherId?.value || "").trim()) || null;
      const selectedPeriod = getSelectedPeriod();
      const subjectOptions = getSubjectOptions();
      const selectedSubjectId = String(form.elements.subjectId?.value || "").trim();
      const selectedSubject = subjectOptions.find((subject) => subject.id === selectedSubjectId) || null;
      const customSubject = String(form.elements.subject?.value || "").trim();
      return {
        id: String(form.elements.timetableEntryId?.value || "").trim() || undefined,
        sessionId: getSelectedSessionId(),
        termId: getSelectedTermId(),
        periodId: selectedPeriod?.id || "",
        classId: selectedClass?.id || "",
        classLevel: getTimetableClassLabel(selectedClass),
        subjectId: selectedSubject && selectedSubjectId !== "__custom" ? selectedSubject.id : "",
        subject: selectedSubject && selectedSubjectId !== "__custom" ? selectedSubject.name : customSubject,
        teacherId: selectedTeacher?.id || "",
        teacher: selectedTeacher?.name || "",
        roomId: "",
        room: "",
        weekType: getSelectedWeekType(),
        status: manager?.getEntries?.().find((entry) => entry.id === String(form.elements.timetableEntryId?.value || "").trim())?.status || "draft",
      };
    };

    const formatConflictSummary = (conflict) => {
      const messages = [];
      if (conflict.teacherConflict) messages.push("teacher is already assigned");
      if (conflict.classConflict) messages.push("class already has a lesson");
      return messages.join(", ");
    };

    const updateRealtimeConflictStatus = () => {
      if (!manager || form.hidden) {
        return;
      }
      const payload = buildEntryPayloadFromForm();
      if (!payload.termId || !payload.periodId || !payload.classLevel || !payload.teacher || !payload.subject) {
        return;
      }
      const conflict = manager.checkConflicts(payload);
      if (conflict.hasConflict) {
        setStatus(status, "error", `Conflict detected: ${escapeHtml(formatConflictSummary(conflict))}.`);
        return;
      }
      const teacher = getTeacherDirectory().find((entry) => entry.id === payload.teacherId);
      const load = manager.getTeacherLoad(payload);
      const nextCount = load.entries.some((entry) => entry.id === payload.id) ? load.count : load.count + 1;
      if (teacher && nextCount > teacher.maxPeriodsPerWeek) {
        setStatus(status, "info", `${escapeHtml(teacher.name)} will exceed ${teacher.maxPeriodsPerWeek} periods this week.`);
        return;
      }
      setStatus(status, "", "");
    };

    const refresh = () => {
      applySessionTermClassOptions();
      updateCustomSubjectVisibility();
      renderTimetableSection({
        isAdmin,
        manager,
        summaryTarget,
        listTarget,
        context: {
          sessionId: getSelectedSessionId(),
          termId: getSelectedTermId(),
          classRecord: getSelectedClass(),
          teacherRecord: getSelectedTeacher(),
          viewMode: String(viewModeSelect?.value || "class").trim() || "class",
          weekType: getSelectedWeekType(),
          teachers: getTeacherDirectory(),
        },
      });
    };

    clearPortalTimetableErrors(form);
    resetPortalTimetableForm(form, isAdmin);
    refresh();
    setFormVisibility(false);

    if (!manager) {
      return;
    }

    form.addEventListener("input", () => {
      clearPortalTimetableErrors(form);
      updateRealtimeConflictStatus();
    });

    form.addEventListener("change", () => {
      clearPortalTimetableErrors(form);
      updateCustomSubjectVisibility();
      updateRealtimeConflictStatus();
    });

    [sessionSelect, termSelect, viewModeSelect, classSelect, teacherViewSelect, weekTypeSelect].forEach((control) => {
      control?.addEventListener("change", () => {
        if (control === sessionSelect) {
          state.selectedPeriodId = "";
        }
        applySessionTermClassOptions();
        refresh();
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can create timetable lessons.");
        return;
      }

      clearPortalTimetableErrors(form);
      setStatus(status, "", "");

      const entryId = String(form.elements.timetableEntryId?.value || "").trim();
      const existing = manager.getEntries().find((row) => row.id === entryId) || null;
      const payload = buildEntryPayloadFromForm();
      payload.status = existing ? existing.status : "draft";

      let hasError = false;
      if (!payload.sessionId) {
        setStatus(status, "error", "Select a session.");
        hasError = true;
      }
      if (!payload.termId) {
        setStatus(status, "error", "Select a term or semester.");
        hasError = true;
      }
      if (!payload.periodId) {
        setStatus(status, "error", "Select a period slot from the grid.");
        hasError = true;
      }
      if (!payload.classLevel) {
        setStatus(status, "error", "Select a class.");
        hasError = true;
      }
      if (!payload.subject) {
        setPortalTimetableError(form, payload.subjectId ? "subjectId" : "subject", "Select or enter subject.");
        hasError = true;
      }
      if (!payload.teacher) {
        setPortalTimetableError(form, "teacherId", "Select teacher.");
        hasError = true;
      }

      if (hasError) {
        if (!status.hidden && status.innerHTML) return;
        setStatus(status, "error", "Fix the highlighted timetable fields.");
        return;
      }

      const conflicts = manager.checkConflicts(payload);
      if (conflicts.hasConflict) {
        setStatus(status, "error", `Conflict detected: ${escapeHtml(formatConflictSummary(conflicts))}.`);
        return;
      }

      manager.upsertEntry(payload);
      const teacher = getTeacherDirectory().find((entry) => entry.id === payload.teacherId);
      const load = manager.getTeacherLoad(payload);
      const workloadCopy =
        teacher && load.count > teacher.maxPeriodsPerWeek
          ? ` Workload warning: ${teacher.name} now has ${load.count}/${teacher.maxPeriodsPerWeek} periods.`
          : "";
      recordAuditEvent({
        action: existing ? "updated" : "created",
        entityType: "timetable",
        entityId: payload.classLevel,
        summary: `${existing ? "Updated" : "Created"} timetable lesson for ${payload.classLevel}`,
        details: `${payload.periodId} • ${payload.subject}`,
      });
      setTimetableStatus("success", `Lesson for <strong>${escapeHtml(payload.classLevel)}</strong> saved.${escapeHtml(workloadCopy)}`);
      clearFormDraftFor(form);
      resetPortalTimetableForm(form, isAdmin);
      state.selectedPeriodId = "";
      state.editingEntryId = "";
      setFormVisibility(false);
      refresh();
    });

    const cancelButton = form.querySelector("[data-timetable-cancel]");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        clearPortalTimetableErrors(form);
        resetPortalTimetableForm(form, isAdmin);
        state.selectedPeriodId = "";
        state.editingEntryId = "";
        setFormVisibility(false);
        setStatus(status, "", "");
      });
    }

    document.querySelectorAll("[data-timetable-lesson-close]").forEach((button) => {
      button.addEventListener("click", () => {
        clearPortalTimetableErrors(form);
        resetPortalTimetableForm(form, isAdmin);
        state.selectedPeriodId = "";
        state.editingEntryId = "";
        setFormVisibility(false);
        setStatus(status, "", "");
      });
    });

    document.querySelectorAll("[data-timetable-period-close]").forEach((button) => {
      button.addEventListener("click", () => {
        resetTimetablePeriodForm();
        setPeriodFormVisibility(false);
      });
    });

    if (periodForm) {
      periodForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!isAdmin || !manager) {
          return;
        }

        clearTimetablePeriodErrors();
        const name = String(periodForm.elements.name?.value || "").trim();
        const startTime = String(periodForm.elements.startTime?.value || "").trim();
        const endTime = String(periodForm.elements.endTime?.value || "").trim();
        const periodIds = String(periodForm.elements.periodIds?.value || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        const sortOrder = Number.parseInt(periodForm.elements.sortOrder?.value || "", 10);
        let hasError = false;

        if (!name) {
          setTimetablePeriodError("name", "Enter the period name.");
          hasError = true;
        }
        if (!startTime) {
          setTimetablePeriodError("startTime", "Enter the start time.");
          hasError = true;
        }
        if (!endTime || (startTime && endTime <= startTime)) {
          setTimetablePeriodError("endTime", "End time must be after the start time.");
          hasError = true;
        }
        if (hasError) {
          return;
        }

        const existingPeriods = manager.getPeriods ? manager.getPeriods() : [];
        const nextOrder = Number.isFinite(sortOrder) && sortOrder > 0
          ? sortOrder
          : Math.max(0, ...existingPeriods.map((period) => Number.parseInt(period.sortOrder, 10) || 0)) + 1;

        if (periodIds.length) {
          periodIds.forEach((periodId) => {
            const existing = existingPeriods.find((period) => period.id === periodId);
            if (!existing) {
              return;
            }
            manager.upsertPeriod({
              ...existing,
              name,
              startTime,
              endTime,
              sortOrder: nextOrder,
            });
          });
          setTimetableStatus("success", `<strong>${escapeHtml(name)}</strong> updated across the timetable grid.`);
        } else {
          (manager.schoolDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]).forEach((day) => {
            manager.upsertPeriod({
              id: `period-${day.toLowerCase()}-${Date.now()}`,
              name,
              day,
              startTime,
              endTime,
              sortOrder: nextOrder,
            });
          });
          setTimetableStatus("success", `<strong>${escapeHtml(name)}</strong> added across school days.`);
        }

        resetTimetablePeriodForm();
        setPeriodFormVisibility(false);
        refresh();
      });
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        const entryId = String(form.elements.timetableEntryId?.value || "").trim();
        if (!entryId || !isAdmin) return;
        manager.archiveEntry(entryId);
        resetPortalTimetableForm(form, isAdmin);
        state.selectedPeriodId = "";
        state.editingEntryId = "";
        setFormVisibility(false);
        setTimetableStatus("success", "Lesson archived.");
        refresh();
      });
    }

    listTarget.addEventListener("click", (event) => {
      const periodEditButton = event.target.closest("[data-timetable-period-edit]");
      const slotButton = event.target.closest("[data-timetable-slot]");
      const rowActionButton = event.target.closest("[data-timetable-action]");
      const classActionButton = event.target.closest("[data-timetable-class-action]");
      const groupActionButton = event.target.closest("[data-timetable-group-action]");

      if (!isAdmin) {
        return;
      }

      if (classActionButton) {
        const action = String(classActionButton.dataset.timetableClassAction || "").trim();
        const criteria = {
          sessionId: String(classActionButton.dataset.timetableSessionId || "").trim(),
          termId: String(classActionButton.dataset.timetableTermId || "").trim(),
          classId: String(classActionButton.dataset.timetableClassId || "").trim(),
          classLevel: String(classActionButton.dataset.timetableClass || "").trim(),
          weekType: getSelectedWeekType(),
        };
        if (action === "view") {
          renderClassTimetableModal(criteria);
        } else if (action === "print") {
          printClassTimetable(criteria);
        }
        return;
      }

      if (periodEditButton) {
        openTimetablePeriodForm({
          periodIds: periodEditButton.dataset.timetablePeriodIds || "",
          name: periodEditButton.dataset.timetablePeriodName || "",
          startTime: periodEditButton.dataset.timetablePeriodStart || "",
          endTime: periodEditButton.dataset.timetablePeriodEnd || "",
          sortOrder: periodEditButton.dataset.timetablePeriodSort || "",
        });
        return;
      }

      if (slotButton && !rowActionButton) {
        const selectedClass = getSelectedClass();
        if (!selectedClass) {
          setStatus(status, "info", "Select a class before adding lessons to the timetable grid.");
          return;
        }
        if (!getSelectedSessionId() || !getSelectedTermId()) {
          setStatus(status, "info", "Select a session and term or semester before adding lessons.");
          return;
        }
        const periodId = String(slotButton.dataset.timetablePeriodId || "").trim();
        const entryId = String(slotButton.dataset.timetableEntryId || "").trim();
        const entry = entryId ? manager.getEntries().find((record) => record.id === entryId) : null;
        state.selectedPeriodId = periodId;
        state.editingEntryId = entry?.id || "";
        resetPortalTimetableForm(form, isAdmin);
        applySessionTermClassOptions();
        if (entry) {
          populatePortalTimetableForm(form, entry, isAdmin, {
            classes: getActiveClasses(),
            subjects: getSubjectOptions(),
            teachers: getTeacherDirectory(),
          });
        } else {
          if (form.elements.periodId) form.elements.periodId.value = periodId;
          const period = getSelectedPeriod();
          if (formContext && period) {
            formContext.textContent = `${period.day} - ${period.name} (${period.startTime}-${period.endTime})`;
          }
          if (formTitle) {
            formTitle.textContent = "Assign lesson";
          }
          if (viewModeSelect?.value === "teacher" && getSelectedTeacher() && form.elements.teacherId) {
            form.elements.teacherId.value = getSelectedTeacher().id;
          }
        }
        updateCustomSubjectVisibility();
        if (deleteButton) deleteButton.hidden = !entry;
        setFormVisibility(true);
        return;
      }

      if (rowActionButton) {
        const action = String(rowActionButton.dataset.timetableAction || "").trim();
        const rowId = String(rowActionButton.dataset.timetableId || "").trim();
        const row = manager.getEntries().find((entry) => entry.id === rowId);
        if (!row) {
          return;
        }

        if (action === "edit") {
          state.selectedPeriodId = row.periodId;
          state.editingEntryId = row.id;
          resetPortalTimetableForm(form, isAdmin);
          applySessionTermClassOptions();
          populatePortalTimetableForm(form, row, isAdmin, {
            classes: getActiveClasses(),
            subjects: getSubjectOptions(),
            teachers: getTeacherDirectory(),
          });
          updateCustomSubjectVisibility();
          setFormVisibility(true);
          if (deleteButton) deleteButton.hidden = false;
          setStatus(status, "info", `Editing lesson for <strong>${escapeHtml(row.classLevel)}</strong>.`);
          return;
        }

        if (action === "substitute") {
          const teachers = getTeacherDirectory();
          const replacementName = window.prompt("Replacement teacher name");
          if (!replacementName) return;
          const reason = window.prompt("Reason for substitution", "Cover lesson") || "";
          const replacement = teachers.find(
            (teacher) => teacher.name.toLowerCase() === replacementName.trim().toLowerCase() || teacher.email.toLowerCase() === replacementName.trim().toLowerCase(),
          );
          manager.logSubstitution({
            entryId: row.id,
            periodId: row.periodId,
            termId: row.termId,
            classLevel: row.classLevel,
            subject: row.subject,
            originalTeacherId: row.teacherId,
            originalTeacher: row.teacher,
            replacementTeacherId: replacement?.id || "",
            replacementTeacher: replacement?.name || replacementName.trim(),
            reason,
            substitutionDate: new Date().toISOString().slice(0, 10),
          });
          setTimetableStatus("success", `Substitution logged for <strong>${escapeHtml(row.subject)}</strong>.`);
          refresh();
          return;
        }

        if (action === "archive" || action === "activate") {
          if (action === "archive") {
            manager.archiveEntry(row.id);
          } else {
            manager.activateEntry(row.id);
          }
          recordAuditEvent({
            action: action === "archive" ? "archived" : "reactivated",
            entityType: "timetable",
            entityId: row.id,
            summary: `${action === "archive" ? "Archived" : "Reactivated"} timetable lesson`,
            details: `${row.classLevel} • ${row.day} ${row.startTime}-${row.endTime}`,
          });
          setTimetableStatus("success", `Timetable lesson ${action === "archive" ? "archived" : "reactivated"}.`);
          refresh();
          return;
        }
      }

      if (groupActionButton) {
        const action = String(groupActionButton.dataset.timetableGroupAction || "").trim();
        const criteria = {
          sessionId: String(groupActionButton.dataset.timetableSessionId || "").trim(),
          termId: String(groupActionButton.dataset.timetableTermId || "").trim(),
          classLevel: String(groupActionButton.dataset.timetableClass || "").trim(),
        };
        if (!criteria.sessionId || !criteria.termId || !criteria.classLevel) {
          return;
        }

        if (action === "publish") {
          manager.publishGroup(criteria);
          recordAuditEvent({
            action: "published",
            entityType: "timetable",
            entityId: criteria.classLevel,
            summary: `Published timetable for ${criteria.classLevel}`,
            details: `${criteria.sessionId} • ${criteria.termId}`,
          });
          setTimetableStatus("success", `Timetable for <strong>${escapeHtml(criteria.classLevel)}</strong> published.`);
        } else if (action === "unpublish") {
          manager.unpublishGroup(criteria);
          recordAuditEvent({
            action: "unpublished",
            entityType: "timetable",
            entityId: criteria.classLevel,
            summary: `Unpublished timetable for ${criteria.classLevel}`,
            details: `${criteria.sessionId} • ${criteria.termId}`,
          });
          setTimetableStatus("success", `Timetable for <strong>${escapeHtml(criteria.classLevel)}</strong> moved back to draft.`);
        }
        refresh();
      }
    });

    if (copyTermButton) {
      copyTermButton.disabled = !isAdmin || !manager;
      copyTermButton.addEventListener("click", () => {
        const cycles = getCycleState();
        const termId = getSelectedTermId();
        const selectedTerm = (cycles.terms || []).find((term) => term.id === termId);
        const sameSessionTerms = (cycles.terms || [])
          .filter((term) => term.sessionId === selectedTerm?.sessionId)
          .sort((left, right) => String(left.startDate || left.createdAt || left.name).localeCompare(String(right.startDate || right.createdAt || right.name)));
        const currentIndex = sameSessionTerms.findIndex((term) => term.id === termId);
        const sourceTerm = sameSessionTerms[currentIndex - 1] || null;
        if (!sourceTerm) {
          setStatus(status, "info", "No previous term or semester found in this session to copy from.");
          return;
        }
        const selectedClass = getSelectedClass();
        const result = manager.copyTerm({
          sourceTermId: sourceTerm.id,
          targetTermId: termId,
          targetSessionId: getSelectedSessionId(),
          classId: selectedClass?.id || "",
          classLevel: getTimetableClassLabel(selectedClass),
          weekType: getSelectedWeekType(),
        });
        setTimetableStatus(result.copied ? "success" : "info", `Copied ${result.copied} lesson${result.copied === 1 ? "" : "s"} from ${escapeHtml(sourceTerm.name)}. Skipped ${result.skipped}.`);
        refresh();
      });
    }

    if (addPeriodButton) {
      addPeriodButton.disabled = !isAdmin || !manager;
      addPeriodButton.addEventListener("click", () => {
        const existingPeriods = manager.getPeriods();
        const nextOrder =
          Math.max(0, ...existingPeriods.map((period) => Number.parseInt(period.sortOrder, 10) || 0)) + 1;
        openTimetablePeriodForm({
          name: `Period ${nextOrder}`,
          sortOrder: nextOrder,
        });
      });
    }

    if (saveClassButton) {
      saveClassButton.disabled = !isAdmin || !manager;
      saveClassButton.addEventListener("click", () => {
        const selectedClass = getSelectedClass();
        const sessionId = getSelectedSessionId();
        const termId = getSelectedTermId();
        if (!selectedClass || !sessionId || !termId) {
          setStatus(status, "info", "Select a session, term, and class before saving the timetable.");
          return;
        }

        const printData = getClassTimetablePrintData({
          sessionId,
          termId,
          classId: selectedClass.id,
          classLevel: getTimetableClassLabel(selectedClass),
          weekType: getSelectedWeekType(),
        });
        if (!printData.entries.length) {
          setStatus(status, "info", "Add at least one lesson to this class grid before saving it.");
          return;
        }

        manager.publishGroup({
          sessionId,
          termId,
          classId: selectedClass.id,
          classLevel: getTimetableClassLabel(selectedClass),
        });
        const selectedClassLabel = getTimetableClassLabel(selectedClass);
        recordAuditEvent({
          action: "saved",
          entityType: "timetable",
          entityId: selectedClassLabel,
          summary: `Saved timetable for ${selectedClassLabel}`,
          details: `${sessionId} - ${termId}`,
        });
        clearPortalTimetableErrors(form);
        resetPortalTimetableForm(form, isAdmin);
        state.selectedPeriodId = "";
        state.editingEntryId = "";
        setFormVisibility(false);
        if (classSelect) {
          classSelect.value = "";
        }
        setTimetableStatus(
          "success",
          `Timetable for <strong>${escapeHtml(selectedClassLabel)}</strong> saved. Select another class to create the next timetable.`,
        );
        refresh();
      });
    }

    if (printButton) {
      printButton.addEventListener("click", () => {
        const selectedClass = getSelectedClass();
        if (!selectedClass) {
          setStatus(status, "info", "Select a class or use Print beside a saved class timetable.");
          return;
        }
        printClassTimetable({
          sessionId: getSelectedSessionId(),
          termId: getSelectedTermId(),
          classId: selectedClass.id,
          classLevel: getTimetableClassLabel(selectedClass),
          weekType: getSelectedWeekType(),
        });
      });
    }

    window.addEventListener(manager.eventName, refresh);
    if (cycleManager?.eventName) {
      window.addEventListener(cycleManager.eventName, refresh);
    }
    if (classManager?.eventName) {
      window.addEventListener(classManager.eventName, refresh);
    }
    if (courseManager?.eventName) {
      window.addEventListener(courseManager.eventName, refresh);
    }
  }

  function initFeeManagementControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
    setupNotice,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const formToggleButton =
      form.parentElement?.querySelector("[data-fee-form-toggle]") ||
      document.querySelector("[data-fee-form-toggle]");
    const cycleManager = getAcademicCycleManager();
    const classManager = getClassManager();
    const studentManager = getStudentManager();
    const invoiceStatus = document.getElementById("portal-fee-invoice-status");
    const invoiceListTarget = document.getElementById("portal-fee-invoice-list");
    const invoiceControls = {
      session: document.getElementById("fee-invoice-session"),
      term: document.getElementById("fee-invoice-term"),
      classLevel: document.getElementById("fee-invoice-class"),
      student: document.getElementById("fee-invoice-student"),
      dueDate: document.getElementById("fee-invoice-due-date"),
      singleButton: document.querySelector("[data-fee-invoice-generate-single]"),
      bulkButton: document.querySelector("[data-fee-invoice-generate-bulk]"),
    };
    const invoiceOverlay = document.getElementById("portal-fee-invoice-overlay");
    const invoiceModalBody = document.getElementById("portal-fee-invoice-modal-body");
    const invoiceModalTitle = document.getElementById("portal-fee-invoice-modal-title");
    const categoryOptionsTarget = document.getElementById("portal-fee-category-options");
    const formOverlay = document.getElementById("portal-fee-form-overlay");
    const formModalTitle = document.getElementById("portal-fee-form-modal-title");
    const feeState = {
      category: FEE_CATEGORY_FALLBACK,
    };
    let feeToastTimer = null;

    const syncOpenOverlayState = () => {
      document.body.classList.toggle("portal-overlay-open", Boolean(document.querySelector(".portal-overlay:not([hidden])")));
    };

    const showFeeToast = (message) => {
      if (!message) {
        return;
      }

      let toast = document.getElementById("portal-fee-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "portal-fee-toast";
        toast.className = "portal-toast portal-toast--success";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
      }

      toast.innerHTML = message;
      toast.hidden = false;
      window.clearTimeout(feeToastTimer);
      feeToastTimer = window.setTimeout(() => {
        toast.hidden = true;
      }, 3600);
    };

    const updateFeeFormTitle = () => {
      if (!formModalTitle) {
        return;
      }

      const category = normalizeFeeCategoryKey(form.elements.category?.value || feeState.category);
      const isEditing = Boolean(String(form.elements.feeItemId?.value || "").trim());
      formModalTitle.textContent = isEditing
        ? `Edit ${getFeeCategoryLabel(category)} item`
        : `Set ${getFeeCategoryLabel(category)} for a class`;
    };

    const setFormVisibility = (visible) => {
      form.hidden = !visible;
      if (formOverlay) {
        formOverlay.hidden = !visible;
      }
      if (formToggleButton) {
        formToggleButton.textContent = `Add ${getFeeCategoryLabel(feeState.category)} item`;
        formToggleButton.setAttribute("aria-expanded", String(visible));
      }
      if (visible) {
        updateFeeFormTitle();
      }
      syncOpenOverlayState();
    };

    const getCycleState = () =>
      cycleManager && typeof cycleManager.getState === "function"
        ? cycleManager.getState()
        : { sessions: [], terms: [] };

    const getActiveClassGroups = () => {
      const classes = classManager && typeof classManager.getClasses === "function"
        ? classManager.getClasses().filter((item) => item.status !== "archived")
        : [];

      return Array.from(
        classes
          .reduce((groups, record) => {
            const level = String(record.level || "").trim();
            if (!level) {
              return groups;
            }

            if (!groups.has(level)) {
              groups.set(level, { level, arms: new Set(), count: 0 });
            }

            const group = groups.get(level);
            const arm = String(record.name || "").trim();
            group.count += 1;
            if (arm && arm.toLowerCase() !== level.toLowerCase()) {
              group.arms.add(arm);
            }
            return groups;
          }, new Map())
          .values(),
      ).sort((left, right) => left.level.localeCompare(right.level, undefined, { numeric: true }));
    };

    const getActiveStudentsForFeeClass = (classLevel) => {
      if (!studentManager || typeof studentManager.getStudents !== "function" || !classLevel) {
        return [];
      }

      const classToken = normalizeLevelToken(classLevel);
      return studentManager
        .getStudents()
        .filter((student) => student.status === "active" && normalizeLevelToken(student.level) === classToken)
        .sort((left, right) => left.fullName.localeCompare(right.fullName, undefined, { numeric: true }));
    };

    const getActiveFeeItemsForInvoice = ({ sessionId, termId, classLevel }) => {
      if (!manager || typeof manager.getItems !== "function") {
        return [];
      }

      return manager
        .getItems()
        .filter(
          (item) =>
            item.status !== "archived" &&
            item.sessionId === sessionId &&
            item.termId === termId &&
            normalizeLevelToken(item.classLevel) === normalizeLevelToken(classLevel),
        );
    };

    const renderFeeCategoryOptions = () => {
      if (!categoryOptionsTarget) {
        return;
      }

      const items = manager && typeof manager.getItems === "function" ? manager.getItems() : [];
      const activeItems = items.filter((item) => item.status !== "archived");
      const options = getFeeCategoryOptionsForItems(items);
      const totals = activeItems.reduce((map, item) => {
        const category = normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK);
        const current = map.get(category) || { count: 0, amount: 0, classes: new Set() };
        current.count += 1;
        current.amount += Number(item.amount || 0);
        if (item.classLevel) {
          current.classes.add(normalizeLevelToken(item.classLevel));
        }
        map.set(category, current);
        return map;
      }, new Map());

      if (!options.some((option) => option.value === feeState.category)) {
        feeState.category = FEE_CATEGORY_FALLBACK;
      }

      categoryOptionsTarget.innerHTML = options
        .map((option) => {
          const categoryTotal = totals.get(option.value) || { count: 0, amount: 0, classes: new Set() };
          const classCount = categoryTotal.classes.size;
          const isActive = option.value === feeState.category;
          return `
            <button class="portal-fee-category-option ${isActive ? "is-active" : ""}" type="button" data-fee-category="${escapeHtml(
              option.value,
            )}" aria-pressed="${isActive ? "true" : "false"}">
              <span>${escapeHtml(option.label)}</span>
              <strong>${escapeHtml(formatCurrencyAmount(categoryTotal.amount))}</strong>
              <small>${classCount} class group${classCount === 1 ? "" : "s"} • ${categoryTotal.count} line${categoryTotal.count === 1 ? "" : "s"}</small>
              <em>${escapeHtml(option.copy)}</em>
            </button>
          `;
        })
        .join("");
    };

    const getSelectedInvoiceContext = () => {
      const cycleState = getCycleState();
      const sessionId = String(invoiceControls.session?.value || "").trim();
      const termId = String(invoiceControls.term?.value || "").trim();
      const classLevel = String(invoiceControls.classLevel?.value || "").trim();
      const studentId = String(invoiceControls.student?.value || "").trim();
      const session = (cycleState.sessions || []).find((item) => item.id === sessionId) || null;
      const term = (cycleState.terms || []).find((item) => item.id === termId) || null;
      const students = getActiveStudentsForFeeClass(classLevel);
      const student = students.find((item) => item.id === studentId) || null;
      const feeItems = getActiveFeeItemsForInvoice({ sessionId, termId, classLevel });

      return {
        cycleState,
        sessionId,
        termId,
        classLevel,
        studentId,
        session,
        term,
        students,
        student,
        feeItems,
        dueDate: String(invoiceControls.dueDate?.value || "").trim(),
      };
    };

    const buildFeeInvoiceRecord = ({ student, feeItems, context, existing = {} }) => {
      const timestamp = nowIso();
      const invoiceKey = `${context.sessionId}:${context.termId}:${context.classLevel}`;
      const totalDue = feeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const previousPaid =
        existing.invoiceKey === invoiceKey
          ? Math.max(0, Number(existing.totalDue || 0) - Number(existing.balance || 0))
          : 0;
      const invoiceSeed = String(student.admissionNo || student.id || "student")
        .replace(/[^a-z0-9]/gi, "")
        .slice(-6)
        .toUpperCase() || "STUDENT";
      const invoiceNo =
        existing.invoiceKey === invoiceKey && existing.invoiceNo
          ? existing.invoiceNo
          : `INV-${timestamp.slice(2, 10).replace(/-/g, "")}${timestamp.slice(11, 16).replace(":", "")}-${invoiceSeed}`;
      const itemDueDates = feeItems
        .map((item) => String(item.dueDate || "").trim())
        .filter(Boolean)
        .sort();
      const dueDate = context.dueDate || itemDueDates[itemDueDates.length - 1] || "Not set";

      return {
        ...existing,
        studentId: student.id,
        studentName: student.fullName,
        admissionNo: student.admissionNo,
        classLevel: context.classLevel,
        sessionId: context.sessionId,
        sessionName: context.session?.name || getSessionLabelFromCycle(context.cycleState, context.sessionId),
        termId: context.termId,
        termName: context.term?.name || getTermLabelFromCycle(context.cycleState, context.termId),
        invoiceNo,
        invoiceKey,
        invoiceStatus: "issued",
        invoiceGeneratedAt: existing.invoiceKey === invoiceKey ? existing.invoiceGeneratedAt || timestamp : timestamp,
        invoiceItems: feeItems.map((item) => ({
          feeItemId: item.id,
          category: normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK),
          name: item.name,
          amount: Number(item.amount || 0),
          description: item.description || "",
          dueDate: item.dueDate || "",
        })),
        totalDue,
        balance: Math.max(0, totalDue - previousPaid),
        dueDate,
        updatedAt: timestamp,
      };
    };

    const getInvoiceSchoolSettings = () => {
      const settingsManager = getSchoolSettingsManager();
      return settingsManager && typeof settingsManager.getSettings === "function"
        ? settingsManager.getSettings()
        : getDefaultAdminSchoolSettings();
    };

    const getFeeInvoiceByStudentId = (studentId) => {
      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      const invoice = readParentFeesState(workspaceId)[studentId];
      return invoice && invoice.invoiceNo ? invoice : null;
    };

    const renderFeeInvoiceDocument = (invoice) => {
      const settings = getInvoiceSchoolSettings();
      const items = Array.isArray(invoice.invoiceItems) ? invoice.invoiceItems : [];
      const totalDue = Number(invoice.totalDue || 0);
      const balance = Number(invoice.balance || 0);
      const paid = Math.max(0, totalDue - balance);
      const lineRows = items.length
        ? items
            .map(
              (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${escapeHtml(item.name || "Fee item")}</strong>
                    <span>${escapeHtml(
                      [getFeeCategoryLabel(item.category || FEE_CATEGORY_FALLBACK), item.description || "No note"].filter(Boolean).join(" • "),
                    )}</span>
                  </td>
                  <td>${escapeHtml(item.dueDate || invoice.dueDate || "Not set")}</td>
                  <td>${escapeHtml(formatCurrencyAmount(item.amount || 0))}</td>
                </tr>
              `,
            )
            .join("")
        : `<tr><td colspan="4">No invoice line items found.</td></tr>`;

      return `
        <section class="portal-fee-invoice-document">
          <header class="portal-fee-invoice-doc-head">
            <div>
              <span>Fee invoice</span>
              <h4>${escapeHtml(settings.schoolName || "SchoolSphere")}</h4>
              <p>${escapeHtml(settings.address || settings.campusDetails || "School account office")}</p>
            </div>
            <aside>
              <strong>${escapeHtml(invoice.invoiceNo || "Not generated")}</strong>
              <span>${escapeHtml(invoice.invoiceGeneratedAt ? formatTimestamp(invoice.invoiceGeneratedAt) : "Not generated")}</span>
            </aside>
          </header>

          <div class="portal-fee-invoice-doc-meta">
            <article><span>Student</span><strong>${escapeHtml(invoice.studentName || "Student")}</strong></article>
            <article><span>Admission No.</span><strong>${escapeHtml(invoice.admissionNo || "Not set")}</strong></article>
            <article><span>Class</span><strong>${escapeHtml(invoice.classLevel || "Class")}</strong></article>
            <article><span>Academic period</span><strong>${escapeHtml(
              [invoice.sessionName, invoice.termName].filter(Boolean).join(" • ") || "Not selected",
            )}</strong></article>
            <article><span>Due date</span><strong>${escapeHtml(invoice.dueDate || "Not set")}</strong></article>
            <article><span>Status</span><strong>${escapeHtml(invoice.invoiceStatus || "issued")}</strong></article>
          </div>

          <div class="portal-fee-invoice-lines-wrap">
            <table class="portal-fee-invoice-lines-table">
              <thead>
                <tr><th>#</th><th>Fee item</th><th>Due date</th><th>Amount</th></tr>
              </thead>
              <tbody>${lineRows}</tbody>
            </table>
          </div>

          <div class="portal-fee-invoice-total-box">
            <div><span>Total due</span><strong>${escapeHtml(formatCurrencyAmount(totalDue))}</strong></div>
            <div><span>Paid</span><strong>${escapeHtml(formatCurrencyAmount(paid))}</strong></div>
            <div><span>Balance</span><strong>${escapeHtml(formatCurrencyAmount(balance))}</strong></div>
          </div>
        </section>
      `;
    };

    const renderFeeInvoicePrintDocument = (invoice) => `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(invoice.invoiceNo || "Fee invoice")}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 28px; color: #17233a; font-family: Inter, Arial, sans-serif; background: #ffffff; }
            .portal-fee-invoice-document { display: grid; gap: 22px; max-width: 860px; margin: 0 auto; }
            .portal-fee-invoice-doc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 22px; padding-bottom: 18px; border-bottom: 2px solid #17233a; }
            .portal-fee-invoice-doc-head span, .portal-fee-invoice-doc-meta span, .portal-fee-invoice-total-box span { color: #667188; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
            .portal-fee-invoice-doc-head h4 { margin: 5px 0 6px; font-size: 26px; }
            .portal-fee-invoice-doc-head p { margin: 0; color: #4c5a73; }
            .portal-fee-invoice-doc-head aside { display: grid; gap: 5px; min-width: 190px; text-align: right; }
            .portal-fee-invoice-doc-head aside strong { font-size: 20px; }
            .portal-fee-invoice-doc-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
            .portal-fee-invoice-doc-meta article { min-height: 78px; padding: 13px; border: 1px solid #dfe7f2; border-radius: 10px; }
            .portal-fee-invoice-doc-meta strong { display: block; margin-top: 8px; font-size: 14px; overflow-wrap: anywhere; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px 10px; border-bottom: 1px solid #dfe7f2; text-align: left; vertical-align: top; }
            th { color: #667188; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
            td strong, td span { display: block; }
            td span { margin-top: 4px; color: #667188; font-size: 12px; }
            th:last-child, td:last-child { text-align: right; }
            .portal-fee-invoice-total-box { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-left: auto; width: min(520px, 100%); }
            .portal-fee-invoice-total-box div { padding: 14px; border: 1px solid #dfe7f2; border-radius: 10px; background: #f8fbff; }
            .portal-fee-invoice-total-box strong { display: block; margin-top: 8px; font-size: 18px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${renderFeeInvoiceDocument(invoice)}
          <script>
            window.addEventListener("load", function () {
              window.focus();
              window.print();
            });
          </script>
        </body>
      </html>
    `;

    const syncInvoiceOverlayState = () => {
      syncOpenOverlayState();
    };

    const closeInvoiceModal = () => {
      if (!invoiceOverlay) {
        return;
      }
      invoiceOverlay.hidden = true;
      if (invoiceModalBody) invoiceModalBody.innerHTML = "";
      syncInvoiceOverlayState();
    };

    const openInvoiceModal = (invoice) => {
      if (!invoiceOverlay || !invoiceModalBody) {
        return;
      }
      if (invoiceModalTitle) {
        invoiceModalTitle.textContent = invoice.invoiceNo || "Fee invoice";
      }
      invoiceModalBody.innerHTML = `
        ${renderFeeInvoiceDocument(invoice)}
        <div class="portal-fee-invoice-modal-actions">
          <button class="button button-primary" type="button" data-fee-invoice-print-current data-invoice-student-id="${escapeHtml(
            invoice.studentId || "",
          )}">Print invoice</button>
        </div>
      `;
      invoiceOverlay.hidden = false;
      syncInvoiceOverlayState();
      invoiceOverlay.querySelector("[data-fee-invoice-close]")?.focus();
    };

    const printFeeInvoice = (invoice) => {
      const printWindow = window.open("", "_blank", "width=920,height=760");
      if (!printWindow) {
        setStatus(invoiceStatus || status, "error", "Allow pop-ups for this page so the invoice can open for printing.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(renderFeeInvoicePrintDocument(invoice));
      printWindow.document.close();
    };

    const renderInvoiceList = () => {
      if (!invoiceListTarget) {
        return;
      }

      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      const invoices = Object.values(readParentFeesState(workspaceId) || {})
        .filter((entry) => entry && entry.invoiceNo)
        .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")))
        .slice(0, 12);

      if (!invoices.length) {
        invoiceListTarget.innerHTML = `
          <article class="portal-class-empty portal-fee-invoice-empty">
            <strong>No invoices generated yet</strong>
            <p>Select a session, term, class, and student to generate the first invoice.</p>
          </article>
        `;
        return;
      }

      invoiceListTarget.innerHTML = `
        <div class="portal-fee-invoice-table">
          ${invoices
            .map(
              (invoice) => `
                <article class="portal-fee-invoice-row">
                  <div>
                    <strong>${escapeHtml(invoice.invoiceNo)}</strong>
                    <span>${escapeHtml(invoice.studentName || "Student")} • ${escapeHtml(invoice.admissionNo || "No admission no.")}</span>
                  </div>
                  <div>
                    <span>${escapeHtml(invoice.classLevel || "Class")}</span>
                    <small>${escapeHtml(invoice.termName || "Period")} • ${escapeHtml(invoice.sessionName || "Session")}</small>
                  </div>
                  <div>
                    <strong>${escapeHtml(formatCurrencyAmount(invoice.totalDue || 0))}</strong>
                    <span>Balance ${escapeHtml(formatCurrencyAmount(invoice.balance || 0))}</span>
                  </div>
                  <div>
                    <span>Due ${escapeHtml(invoice.dueDate || "Not set")}</span>
                    <small>${(invoice.invoiceItems || []).length} item${(invoice.invoiceItems || []).length === 1 ? "" : "s"}</small>
                  </div>
                  <div class="portal-fee-invoice-row-actions">
                    <button class="portal-class-button" type="button" data-fee-invoice-action="view" data-invoice-student-id="${escapeHtml(
                      invoice.studentId || "",
                    )}">View</button>
                    <button class="portal-class-button" type="button" data-fee-invoice-action="print" data-invoice-student-id="${escapeHtml(
                      invoice.studentId || "",
                    )}">Print</button>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      `;
    };

    const applyInvoiceContextOptions = () => {
      const hasInvoiceControls = invoiceControls.session && invoiceControls.term && invoiceControls.classLevel && invoiceControls.student;
      if (!hasInvoiceControls) {
        return;
      }

      const cycles = getCycleState();
      const sessions = Array.isArray(cycles.sessions) ? cycles.sessions : [];
      const terms = Array.isArray(cycles.terms) ? cycles.terms : [];
      const classGroups = getActiveClassGroups();
      const selectedSessionId = String(invoiceControls.session.value || "").trim();
      const selectedTermId = String(invoiceControls.term.value || "").trim();
      const selectedClassLevel = String(invoiceControls.classLevel.value || "").trim();
      const selectedStudentId = String(invoiceControls.student.value || "").trim();
      const activeSessionId = sessions.find((session) => session.status === "open")?.id || "";
      const sessionId = selectedSessionId || activeSessionId || sessions[0]?.id || "";
      const termsForSession = terms.filter((term) => !sessionId || term.sessionId === sessionId);
      const activeTermId = termsForSession.find((term) => term.status === "open")?.id || "";
      const termId = termsForSession.some((term) => term.id === selectedTermId)
        ? selectedTermId
        : activeTermId || termsForSession[0]?.id || "";
      const classLevel = classGroups.some((group) => group.level === selectedClassLevel)
        ? selectedClassLevel
        : classGroups[0]?.level || "";
      const students = getActiveStudentsForFeeClass(classLevel);
      const studentId = students.some((student) => student.id === selectedStudentId)
        ? selectedStudentId
        : students[0]?.id || "";
      const feeItems = getActiveFeeItemsForInvoice({ sessionId, termId, classLevel });

      invoiceControls.session.innerHTML = `<option value="">${sessions.length ? "Select session" : "Create session first"}</option>${sessions
        .map(
          (session) =>
            `<option value="${escapeHtml(session.id)}">${escapeHtml(session.name)} ${session.status === "open" ? "(Open)" : ""}</option>`,
        )
        .join("")}`;
      if (sessionId) invoiceControls.session.value = sessionId;
      invoiceControls.session.disabled = !isAdmin || !sessions.length;

      invoiceControls.term.innerHTML = `<option value="">${
        termsForSession.length ? "Select term or semester" : "No terms or semesters for this session"
      }</option>${termsForSession
        .map((term) => {
          const periodLabel = term.periodType === "semester" ? "Semester" : "Term";
          return `<option value="${escapeHtml(term.id)}">${periodLabel}: ${escapeHtml(term.name)} ${
            term.status === "open" ? "(Open)" : ""
          }</option>`;
        })
        .join("")}`;
      if (termId) invoiceControls.term.value = termId;
      invoiceControls.term.disabled = !isAdmin || !termsForSession.length;

      invoiceControls.classLevel.innerHTML = `<option value="">${classGroups.length ? "Select class group" : "Create classes first"}</option>${classGroups
        .map((group) => `<option value="${escapeHtml(group.level)}">${escapeHtml(group.level)}</option>`)
        .join("")}`;
      if (classLevel) invoiceControls.classLevel.value = classLevel;
      invoiceControls.classLevel.disabled = !isAdmin || !classGroups.length;

      invoiceControls.student.innerHTML = `<option value="">${students.length ? "Select student" : "No active students in this class"}</option>${students
        .map((student) => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.fullName)} (${escapeHtml(student.admissionNo || "No admission no.")})</option>`)
        .join("")}`;
      if (studentId) invoiceControls.student.value = studentId;
      invoiceControls.student.disabled = !isAdmin || !students.length;

      if (invoiceControls.dueDate) {
        invoiceControls.dueDate.disabled = !isAdmin;
      }

      const canGenerate = isAdmin && Boolean(sessionId && termId && classLevel && students.length && feeItems.length);
      if (invoiceControls.singleButton) {
        invoiceControls.singleButton.disabled = !canGenerate || !studentId;
      }
      if (invoiceControls.bulkButton) {
        invoiceControls.bulkButton.disabled = !canGenerate;
      }
    };

    const generateInvoices = (studentsToInvoice) => {
      if (!isAdmin) {
        setStatus(invoiceStatus || status, "info", "Only administrators can generate invoices.");
        return;
      }

      const context = getSelectedInvoiceContext();
      if (!context.sessionId || !context.termId || !context.classLevel) {
        setStatus(invoiceStatus || status, "error", "Select session, term or semester, and class group.");
        return;
      }

      if (!context.feeItems.length) {
        setStatus(invoiceStatus || status, "error", "No active fee items match this class, session, and period.");
        return;
      }

      const studentsForInvoice = studentsToInvoice.filter(Boolean);
      if (!studentsForInvoice.length) {
        setStatus(invoiceStatus || status, "error", "No active students found for this invoice.");
        return;
      }

      const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
      const currentState = readParentFeesState(workspaceId);
      const nextState = { ...currentState };
      studentsForInvoice.forEach((student) => {
        nextState[student.id] = buildFeeInvoiceRecord({
          student,
          feeItems: context.feeItems,
          context,
          existing: currentState[student.id] || {},
        });
      });
      saveParentFeesState(nextState, workspaceId);

      recordAuditEvent({
        action: studentsForInvoice.length === 1 ? "generated" : "bulk-generated",
        entityType: "fee-invoice",
        entityId: `${context.classLevel}-${context.termId}`,
        summary: `Generated ${studentsForInvoice.length} fee invoice${studentsForInvoice.length === 1 ? "" : "s"}`,
        details: `${context.classLevel} • ${getTermLabelFromCycle(context.cycleState, context.termId)} • ${formatCurrencyAmount(
          context.feeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        )}`,
      });
      pushNotification(
        {
          title: `Fee invoices generated`,
          message: `${studentsForInvoice.length} invoice${studentsForInvoice.length === 1 ? "" : "s"} generated for ${context.classLevel}.`,
          entityType: "fee-invoice",
          entityId: `${context.classLevel}-${context.termId}`,
          action: "generated",
          visibleToRoles: ["Admin"],
        },
        workspaceId,
      );

      renderInvoiceList();
      setStatus(
        invoiceStatus || status,
        "success",
        `Generated <strong>${studentsForInvoice.length}</strong> invoice${studentsForInvoice.length === 1 ? "" : "s"} for <strong>${escapeHtml(
          context.classLevel,
        )}</strong>.`,
      );
    };

    const applyContextOptions = () => {
      const cycles = getCycleState();
      const sessions = Array.isArray(cycles.sessions) ? cycles.sessions : [];
      const terms = Array.isArray(cycles.terms) ? cycles.terms : [];
      const classGroups = getActiveClassGroups();

      if (form.elements.category) {
        const category = normalizeFeeCategoryKey(form.elements.category.value || feeState.category);
        form.elements.category.value = category;
        form.elements.category.disabled = !isAdmin;
      }

      const sessionSelect = form.elements.sessionId;
      const termSelect = form.elements.termId;
      const classSelect = form.elements.classLevel;
      const selectedSessionId = String(sessionSelect?.value || "").trim();
      const selectedTermId = String(termSelect?.value || "").trim();
      const selectedClassLevel = String(classSelect?.value || "").trim();
      const activeSessionId = sessions.find((session) => session.status === "open")?.id || "";
      const sessionId = selectedSessionId || activeSessionId || sessions[0]?.id || "";
      const termsForSession = terms.filter((term) => !sessionId || term.sessionId === sessionId);
      const activeTermId = termsForSession.find((term) => term.status === "open")?.id || "";
      const termId = termsForSession.some((term) => term.id === selectedTermId)
        ? selectedTermId
        : activeTermId || termsForSession[0]?.id || "";

      if (sessionSelect) {
        sessionSelect.innerHTML = `<option value="">${sessions.length ? "Select session" : "Create session in Settings first"}</option>${sessions
          .map(
            (session) =>
              `<option value="${escapeHtml(session.id)}">${escapeHtml(session.name)} ${session.status === "open" ? "(Open)" : ""}</option>`,
          )
          .join("")}`;
        if (sessionId) {
          sessionSelect.value = sessionId;
        }
        sessionSelect.disabled = !isAdmin || sessions.length === 0;
      }

      if (termSelect) {
        const termPlaceholder = sessions.length
          ? termsForSession.length
            ? "Select term or semester"
            : "No terms or semesters for this session"
          : "Create session first";
        termSelect.innerHTML = `<option value="">${termPlaceholder}</option>${termsForSession
          .map((term) => {
            const periodLabel = term.periodType === "semester" ? "Semester" : "Term";
            return `<option value="${escapeHtml(term.id)}">${periodLabel}: ${escapeHtml(term.name)} ${
              term.status === "open" ? "(Open)" : ""
            }</option>`;
          })
          .join("")}`;
        if (termId) {
          termSelect.value = termId;
        }
        termSelect.disabled = !isAdmin || termsForSession.length === 0;
      }

      if (classSelect) {
        classSelect.innerHTML = `<option value="">${classGroups.length ? "Select class group" : "Create classes first"}</option>${classGroups
          .map((group) => {
            const armsCopy = group.arms.size > 1 ? ` (all ${group.arms.size} arms)` : "";
            return `<option value="${escapeHtml(group.level)}">${escapeHtml(group.level)}${escapeHtml(armsCopy)}</option>`;
          })
          .join("")}`;
        if (selectedClassLevel && classGroups.some((group) => group.level === selectedClassLevel)) {
          classSelect.value = selectedClassLevel;
        }
        classSelect.disabled = !isAdmin || classGroups.length === 0;
      }

      if (setupNotice) {
        const setupMessages = [];

        if (!sessions.length) {
          setupMessages.push(
            `Create an academic session under <a href="./admin-settings-academic.html">Settings &gt; Sessions and Terms</a>, then return here to attach fee items to it.`,
          );
        } else if (!terms.length) {
          setupMessages.push(
            `Add at least one term or semester under <a href="./admin-settings-academic.html">Settings &gt; Sessions and Terms</a> so fee items can be billed by academic period.`,
          );
        } else if (sessionId && !termsForSession.length) {
          setupMessages.push(
            `This session has no terms or semesters yet. Add one in <a href="./admin-settings-academic.html">Settings &gt; Sessions and Terms</a> before saving a fee item.`,
          );
        }

        if (!classGroups.length) {
          setupMessages.push(`Create classes in <a href="./admin-classes.html">Classes</a> before assigning fee items.`);
        }

        setStatus(setupNotice, setupMessages.length ? "info" : "", setupMessages.join(" "));
      }
    };

    const refresh = () => {
      renderFeeCategoryOptions();
      renderFeeManagementSection({ isAdmin, manager, summaryTarget, listTarget, selectedCategory: feeState.category });
      applyContextOptions();
      applyInvoiceContextOptions();
      renderInvoiceList();
    };

    const toggleVisibility = () => {
      if (!isAdmin || !manager) {
        return;
      }
      clearPortalFeeErrors(form);
      resetPortalFeeForm(form, isAdmin);
      if (form.elements.category) {
        form.elements.category.value = feeState.category;
      }
      applyContextOptions();
      setStatus(status, "", "");
      setFormVisibility(true);
    };

    const closeFeeForm = () => {
      clearPortalFeeErrors(form);
      resetPortalFeeForm(form, isAdmin);
      if (form.elements.category) {
        form.elements.category.value = feeState.category;
      }
      setFormVisibility(false);
      setStatus(status, "", "");
    };

    const openFeeItemEditor = (record) => {
      if (!record || !isAdmin) {
        return;
      }

      feeState.category = normalizeFeeCategoryKey(record.category || FEE_CATEGORY_FALLBACK);
      populatePortalFeeForm(form, record, isAdmin);
      applyContextOptions();
      renderFeeCategoryOptions();
      setFormVisibility(true);
      setStatus(status, "info", `Editing fee item <strong>${escapeHtml(record.name)}</strong>.`);
    };

    const toggleFeeItemArchiveState = (record, action) => {
      if (!record || !isAdmin) {
        return;
      }

      if (action === "archive") {
        manager.archiveItem(record.id);
      } else {
        manager.activateItem(record.id);
      }
      recordAuditEvent({
        action: action === "archive" ? "archived" : "reactivated",
        entityType: "fee-item",
        entityId: record.id,
        summary: `${action === "archive" ? "Archived" : "Reactivated"} fee item ${record.name}`,
        details: `${getFeeCategoryLabel(record.category)} • ${record.classLevel} • ${formatCurrencyAmount(record.amount)}`,
      });
      const statusMessage = `Fee item <strong>${escapeHtml(record.name)}</strong> ${action === "archive" ? "archived" : "reactivated"}.`;
      setStatus(status, "success", statusMessage);
      showFeeToast(statusMessage);
      closeFeeForm();
      refresh();
    };

    clearPortalFeeErrors(form);
    resetPortalFeeForm(form, isAdmin);
    refresh();
    setFormVisibility(false);

    [invoiceControls.session, invoiceControls.term, invoiceControls.classLevel].forEach((control) => {
      control?.addEventListener("change", () => {
        applyInvoiceContextOptions();
        renderInvoiceList();
        setStatus(invoiceStatus || status, "", "");
      });
    });

    [invoiceControls.student, invoiceControls.dueDate].forEach((control) => {
      control?.addEventListener("change", () => {
        setStatus(invoiceStatus || status, "", "");
      });
    });

    invoiceControls.singleButton?.addEventListener("click", () => {
      const context = getSelectedInvoiceContext();
      generateInvoices(context.student ? [context.student] : []);
    });

    invoiceControls.bulkButton?.addEventListener("click", () => {
      const context = getSelectedInvoiceContext();
      generateInvoices(context.students);
    });

    invoiceListTarget?.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-fee-invoice-action]");
      if (!actionButton) {
        return;
      }

      const invoice = getFeeInvoiceByStudentId(String(actionButton.dataset.invoiceStudentId || "").trim());
      if (!invoice) {
        setStatus(invoiceStatus || status, "error", "Invoice record was not found.");
        return;
      }

      if (actionButton.dataset.feeInvoiceAction === "print") {
        printFeeInvoice(invoice);
        return;
      }

      openInvoiceModal(invoice);
    });

    invoiceOverlay?.addEventListener("click", (event) => {
      if (event.target.closest("[data-fee-invoice-close]")) {
        closeInvoiceModal();
        return;
      }

      const printButton = event.target.closest("[data-fee-invoice-print-current]");
      if (!printButton) {
        return;
      }

      const invoice = getFeeInvoiceByStudentId(String(printButton.dataset.invoiceStudentId || "").trim());
      if (invoice) {
        printFeeInvoice(invoice);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (formOverlay && !formOverlay.hidden) {
        closeFeeForm();
        return;
      }
      if (invoiceOverlay && !invoiceOverlay.hidden) {
        closeInvoiceModal();
      }
    });

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleVisibility);
    }

    categoryOptionsTarget?.addEventListener("click", (event) => {
      const categoryButton = event.target.closest("[data-fee-category]");
      if (!categoryButton) {
        return;
      }

      feeState.category = normalizeFeeCategoryKey(categoryButton.dataset.feeCategory || FEE_CATEGORY_FALLBACK);
      if (form.elements.category && form.hidden) {
        form.elements.category.value = feeState.category;
      }
      renderFeeCategoryOptions();
      renderFeeManagementSection({ isAdmin, manager, summaryTarget, listTarget, selectedCategory: feeState.category });
      if (formToggleButton) {
        formToggleButton.textContent = `Add ${getFeeCategoryLabel(feeState.category)} item`;
      }
    });

    formOverlay?.addEventListener("click", (event) => {
      if (event.target.closest("[data-fee-form-close]")) {
        closeFeeForm();
      }
    });

    if (!manager) {
      return;
    }

    form.addEventListener("input", () => {
      clearPortalFeeErrors(form);
      if (isAdmin) setStatus(status, "", "");
    });

    form.elements.category?.addEventListener("change", () => {
      feeState.category = normalizeFeeCategoryKey(form.elements.category.value || feeState.category);
      form.elements.category.value = feeState.category;
      updateFeeFormTitle();
      renderFeeCategoryOptions();
    });

    form.elements.sessionId?.addEventListener("change", () => {
      applyContextOptions();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can configure fee items.");
        return;
      }

      clearPortalFeeErrors(form);
      setStatus(status, "", "");

      const itemId = form.elements.feeItemId.value || "";
      const existing = manager.getItems().find((item) => item.id === itemId) || null;
      const payload = {
        id: itemId || undefined,
        category: normalizeFeeCategoryKey(form.elements.category?.value || feeState.category),
        name: String(form.elements.name.value || "").trim(),
        amount: Number.parseFloat(form.elements.amount.value || "0"),
        classLevel: String(form.elements.classLevel.value || "").trim(),
        sessionId: String(form.elements.sessionId.value || "").trim(),
        termId: String(form.elements.termId.value || "").trim(),
        dueDate: String(form.elements.dueDate.value || "").trim(),
        description: String(form.elements.description.value || "").trim(),
        status: existing ? existing.status : "active",
      };

      let hasError = false;
      if (!payload.name) {
        setPortalFeeError(form, "name", "Enter fee item name.");
        hasError = true;
      }
      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        setPortalFeeError(form, "amount", "Enter a valid amount.");
        hasError = true;
      }
      if (!payload.classLevel) {
        setPortalFeeError(form, "classLevel", "Select class.");
        hasError = true;
      }
      if (!payload.sessionId) {
        setPortalFeeError(form, "sessionId", "Select session.");
        hasError = true;
      }
      if (!payload.termId) {
        setPortalFeeError(form, "termId", "Select a term or semester.");
        hasError = true;
      }
      if (hasError) {
        setStatus(status, "error", "Fix the highlighted fee item fields.");
        return;
      }

      manager.upsertItem(payload);
      feeState.category = payload.category;
      recordAuditEvent({
        action: existing ? "updated" : "created",
        entityType: "fee-item",
        entityId: payload.name,
        summary: `${existing ? "Updated" : "Created"} fee item ${payload.name}`,
        details: `${getFeeCategoryLabel(payload.category)} • ${payload.classLevel} • ${formatCurrencyAmount(payload.amount)}`,
      });
      const successMessage = `${getFeeCategoryLabel(payload.category)} item <strong>${escapeHtml(payload.name)}</strong> saved for <strong>${escapeHtml(
        payload.classLevel,
      )}</strong>.`;
      setStatus(status, "success", successMessage);
      showFeeToast(successMessage);
      clearFormDraftFor(form);
      resetPortalFeeForm(form, isAdmin);
      setFormVisibility(false);
      refresh();
    });

    const cancelButton = form.querySelector("[data-fee-cancel]");
    if (cancelButton) {
      cancelButton.addEventListener("click", closeFeeForm);
    }

    const modalArchiveButton = form.querySelector("[data-fee-modal-archive]");
    if (modalArchiveButton) {
      modalArchiveButton.addEventListener("click", () => {
        const itemId = String(modalArchiveButton.dataset.feeModalArchiveId || "").trim();
        const action = String(modalArchiveButton.dataset.feeModalArchiveAction || "archive").trim();
        const record = manager.getItems().find((item) => item.id === itemId);
        toggleFeeItemArchiveState(record, action === "activate" ? "activate" : "archive");
      });
    }

    listTarget.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-fee-action]");
      if (!actionButton || !isAdmin) {
        return;
      }
      const action = String(actionButton.dataset.feeAction || "").trim();
      const itemId = String(actionButton.dataset.feeId || "").trim();
      const record = manager.getItems().find((item) => item.id === itemId);
      if (!record) {
        return;
      }

      if (action === "edit") {
        openFeeItemEditor(record);
        return;
      }

      if (action === "archive" || action === "activate") {
        toggleFeeItemArchiveState(record, action);
      }
    });

    listTarget.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const actionButton = event.target.closest("[data-fee-action='edit']");
      if (!actionButton || !isAdmin) {
        return;
      }

      event.preventDefault();
      const record = manager.getItems().find((item) => item.id === String(actionButton.dataset.feeId || "").trim());
      openFeeItemEditor(record);
    });

    window.addEventListener(manager.eventName, refresh);
    if (cycleManager?.eventName) {
      window.addEventListener(cycleManager.eventName, refresh);
    }
    if (classManager?.eventName) {
      window.addEventListener(classManager.eventName, refresh);
    }
    if (studentManager?.eventName) {
      window.addEventListener(studentManager.eventName, refresh);
    }
    window.addEventListener(PARENT_FEES_EVENT_NAME, (event) => {
      if (normalizeWorkspaceId(event.detail?.workspaceId || getCurrentWorkspaceId()) === normalizeWorkspaceId(getCurrentWorkspaceId())) {
        renderInvoiceList();
      }
    });
  }

  function initSchoolSettingsControls({
    isAdmin,
    manager,
    previewTarget,
    form,
    status,
    onSettingsUpdated,
  }) {
    if (!previewTarget || !form || !status) {
      return;
    }

    const logoFileInput = form.querySelector('input[name="logoFile"]');
    const clearLogoButton = form.querySelector("[data-clear-logo]");
    const schoolTypeAllInput = form.querySelector("[data-school-type-all]");
    const schoolTypeInputs = Array.from(form.querySelectorAll("[data-school-type-option]"));
    const higherInstitutionTypeSelect = form.elements.higherInstitutionType;

    const updateSchoolTypeAllState = () => {
      if (!(schoolTypeAllInput instanceof HTMLInputElement)) {
        return;
      }

      schoolTypeAllInput.checked = schoolTypeInputs.every(
        (input) => input instanceof HTMLInputElement && input.checked,
      );
      schoolTypeAllInput.indeterminate =
        schoolTypeInputs.some((input) => input instanceof HTMLInputElement && input.checked) &&
        !schoolTypeAllInput.checked;
    };

    form.addEventListener("input", () => {
      clearPortalSettingsErrors(form);
      if (isAdmin) setStatus(status, "", "");
      // Live preview
      if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
      // Live logo swatch
      updateLogoSwatch(form, form.elements.logoUrl?.value.trim() || "", form.elements.schoolName?.value.trim() || "");
      syncHigherInstitutionTypeField(form, getSelectedSchoolTypesFromForm(form), isAdmin);
    });

    if (schoolTypeAllInput instanceof HTMLInputElement) {
      schoolTypeAllInput.addEventListener("change", () => {
        schoolTypeAllInput.indeterminate = false;
        schoolTypeInputs.forEach((input) => {
          if (input instanceof HTMLInputElement) {
            input.checked = schoolTypeAllInput.checked;
          }
        });
        syncHigherInstitutionTypeField(form, getSelectedSchoolTypesFromForm(form), isAdmin);
        if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
      });
    }

    schoolTypeInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener("change", () => {
          updateSchoolTypeAllState();
          syncHigherInstitutionTypeField(form, getSelectedSchoolTypesFromForm(form), isAdmin);
          if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
        });
      }
    });

    if (higherInstitutionTypeSelect instanceof HTMLSelectElement) {
      higherInstitutionTypeSelect.addEventListener("change", () => {
        if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
      });
    }

    if (logoFileInput) {
      logoFileInput.addEventListener("change", async () => {
        if (!isAdmin) {
          return;
        }

        clearPortalSettingsErrors(form);

        const selectedFile = logoFileInput.files?.[0] || null;

        if (!selectedFile) {
          return;
        }

        if (!selectedFile.type.startsWith("image/")) {
          setPortalSettingsError(form, "logoFile", "Choose a valid image file.");
          setStatus(status, "error", "Only image files are allowed for school logos.");
          return;
        }

        if (selectedFile.size > 2 * 1024 * 1024) {
          setPortalSettingsError(form, "logoFile", "Logo file must be 2MB or smaller.");
          setStatus(status, "error", "Logo file is too large. Use an image up to 2MB.");
          return;
        }

        try {
          const dataUrl = await readFileAsDataUrl(selectedFile);
          form.elements.logoUrl.value = dataUrl;
          if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
          updateLogoSwatch(
            form,
            form.elements.logoUrl?.value.trim() || "",
            form.elements.schoolName?.value.trim() || "",
          );
          setStatus(
            status,
            "info",
            "Logo selected from your computer. Click Save settings to apply it site-wide.",
          );
        } catch {
          setPortalSettingsError(form, "logoFile", "Could not read this file. Try another image.");
          setStatus(status, "error", "Could not read the selected logo file.");
        }
      });
    }

    if (clearLogoButton) {
      clearLogoButton.addEventListener("click", () => {
        if (!isAdmin) {
          return;
        }

        if (logoFileInput) {
          logoFileInput.value = "";
        }

        form.elements.logoUrl.value = "";
        if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
        updateLogoSwatch(
          form,
          form.elements.logoUrl?.value.trim() || "",
          form.elements.schoolName?.value.trim() || "",
        );
        setStatus(status, "info", "Logo removed. Save settings to apply the change.");
      });
    }

    const refreshSchoolSettingsSection = () => {
      renderPortalSchoolSettingsSection({
        isAdmin,
        manager,
        previewTarget,
        form,
        status,
      });
    };

    refreshSchoolSettingsSection();

    if (!manager) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can update school settings.");
        return;
      }

      clearPortalSettingsErrors(form);
      setStatus(status, "", "");

      const schoolTypes = getSelectedSchoolTypesFromForm(form);
      const payload = {
        schoolName: (form.elements.schoolName?.value || "").trim(),
        logoUrl: (form.elements.logoUrl?.value || "").trim(),
        schoolProfile: (form.elements.schoolProfile?.value || "").trim(),
        phone: (form.elements.phone?.value || "").trim(),
        website: (form.elements.website?.value || "").trim(),
        address: (form.elements.address?.value || "").trim(),
        campusDetails: (form.elements.campusDetails?.value || "").trim(),
        academicYearStart: form.elements.academicYearStart?.value || "",
        academicYearEnd: form.elements.academicYearEnd?.value || "",
        schoolTypes,
        higherInstitutionType: schoolTypes.includes("higher")
          ? normalizeHigherInstitutionType(form.elements.higherInstitutionType?.value)
          : getDefaultAdminSchoolSettings().higherInstitutionType,
        hasNursery: schoolTypes.includes("nursery"),
        hasPrimary: schoolTypes.includes("primary"),
        hasSecondary: schoolTypes.includes("secondary"),
        hasHigherInstitution: schoolTypes.includes("higher"),
      };

      let hasError = false;

      if (!payload.schoolName) {
        setPortalSettingsError(form, "schoolName", "Enter the school name.");
        hasError = true;
      }

      if (!payload.schoolTypes.length) {
        setPortalSettingsError(form, "schoolTypes", "Select at least one school type.");
        hasError = true;
      }

      if (payload.academicYearStart && !payload.academicYearEnd) {
        setPortalSettingsError(form, "academicYearEnd", "Enter the academic year end date.");
        hasError = true;
      }

      if (payload.academicYearEnd && !payload.academicYearStart) {
        setPortalSettingsError(form, "academicYearStart", "Enter the academic year start date.");
        hasError = true;
      }

      if (
        payload.academicYearStart &&
        payload.academicYearEnd &&
        payload.academicYearEnd < payload.academicYearStart
      ) {
        setPortalSettingsError(
          form,
          "academicYearEnd",
          "The academic year end date must be after the start date.",
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted school settings and try again.");
        return;
      }

      if (isSupabaseConfigured()) {
        try {
          await persistSchoolSettingsToSupabase(payload);
        } catch (error) {
          setStatus(
            status,
            "error",
            escapeHtml(
              String(
                error?.message || "Could not save school settings to Supabase. Please retry.",
              ),
            ),
          );
          return;
        }
      }

      manager.saveSettings(payload);
      clearFormDraftFor(form);
      recordAuditEvent({
        action: "updated",
        entityType: "school-settings",
        summary: `Updated school settings for ${payload.schoolName || "SchoolSphere"}`,
        details: `Academic year: ${
          payload.academicYearStart && payload.academicYearEnd
            ? `${payload.academicYearStart} to ${payload.academicYearEnd}`
            : "not set"
        }`,
      });
      setStatus(
        status,
        "success",
        `School settings saved for <strong>${escapeHtml(payload.schoolName)}</strong>. The updated identity is now reflected across the app.`,
      );
    });

    const resetButton = form.querySelector("[data-reset-school-settings]");

    if (resetButton) {
      resetButton.addEventListener("click", async () => {
        if (!isAdmin) {
          setStatus(status, "info", "Only administrators can update school settings.");
          return;
        }

        clearPortalSettingsErrors(form);
        const defaultSettings =
          manager && typeof manager.defaults === "object"
            ? manager.defaults
            : getDefaultAdminSchoolSettings();

        if (isSupabaseConfigured()) {
          try {
            await persistSchoolSettingsToSupabase(defaultSettings);
          } catch (error) {
            setStatus(
              status,
              "error",
              escapeHtml(
                String(
                  error?.message || "Could not reset school settings in Supabase. Please retry.",
                ),
              ),
            );
            return;
          }
        }

        manager.resetSettings();
        clearFormDraftFor(form);
        recordAuditEvent({
          action: "reset",
          entityType: "school-settings",
          summary: "School settings reset to default branding",
          details: "School identity and branding fields were restored to defaults.",
        });
        setStatus(
          status,
          "success",
          "School settings have been reset to the default SchoolSphere branding.",
        );
      });
    }

    window.addEventListener(manager.eventName, refreshSchoolSettingsSection);

    if (typeof onSettingsUpdated === "function") {
      window.addEventListener(manager.eventName, onSettingsUpdated);
    }
  }

  function initFeatureToggleControls({
    isAdmin,
    manager,
    summaryTarget,
    gridTarget,
    statusTarget = null,
  }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

    let isHydratingSupabase = false;
    let syncTimer = null;

    const scheduleSupabaseSync = () => {
      if (!isAdmin || !manager || !isSupabaseConfigured() || isHydratingSupabase) {
        return;
      }

      if (syncTimer) {
        window.clearTimeout(syncTimer);
      }

      syncTimer = window.setTimeout(async () => {
        try {
          await saveWorkspaceStatePayloadToSupabase(
            SUPABASE_STATE_KEY_FEATURE_MODULES,
            manager.getState(),
          );
          if (statusTarget) {
            setStatus(statusTarget, "success", "Feature modules synced to Supabase.");
          }
        } catch (error) {
          if (statusTarget) {
            setStatus(statusTarget, "error", escapeHtml(String(error?.message || "Could not sync feature modules to Supabase.")));
          }
        }
      }, 320);
    };

    const refreshFeatureToggleSection = () => {
      renderPortalFeatureToggleSection({
        isAdmin,
        manager,
        summaryTarget,
        gridTarget,
      });
    };

    refreshFeatureToggleSection();

    if (!manager) {
      return;
    }

    if (isAdmin && isSupabaseConfigured()) {
      isHydratingSupabase = true;
      loadWorkspaceStatePayloadFromSupabase(SUPABASE_STATE_KEY_FEATURE_MODULES)
        .then(({ payload, synced }) => {
          if (synced && payload && typeof payload === "object") {
            manager.saveState(payload);
            if (statusTarget) {
              setStatus(statusTarget, "info", "Feature modules loaded from Supabase.");
            }
          } else if (statusTarget) {
            setStatus(statusTarget, "info", "Using local feature modules until first Supabase sync.");
          }
        })
        .catch((error) => {
          if (statusTarget) {
            setStatus(
              statusTarget,
              "error",
              escapeHtml(
                String(error?.message || "Could not load feature modules from Supabase."),
              ),
            );
          }
        })
        .finally(() => {
          isHydratingSupabase = false;
        });
    }

    window.addEventListener(manager.eventName, refreshFeatureToggleSection);
    window.addEventListener(manager.eventName, scheduleSupabaseSync);
  }

  function initRolePermissionControls({
    isAdmin,
    manager,
    summaryTarget,
    gridTarget,
    resetButton,
    statusTarget = null,
  }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

    let isHydratingSupabase = false;

    const syncPermissionsToSupabase = async (successMessage = "Role permissions synced to Supabase.") => {
      if (!isAdmin || !manager || !isSupabaseConfigured()) {
        return;
      }

      try {
        await saveWorkspaceStatePayloadToSupabase(
          SUPABASE_STATE_KEY_ROLE_PERMISSIONS,
          manager.getPermissions(),
        );
        if (statusTarget) {
          setStatus(statusTarget, "success", successMessage);
        }
      } catch (error) {
        if (statusTarget) {
          setStatus(
            statusTarget,
            "error",
            escapeHtml(String(error?.message || "Could not sync role permissions to Supabase.")),
          );
        }
      }
    };

    const refreshRolePermissionSection = () => {
      renderPortalRolePermissionSection({
        isAdmin,
        manager,
        summaryTarget,
        gridTarget,
      });
    };

    refreshRolePermissionSection();

    if (!manager) {
      return;
    }

    if (isAdmin && isSupabaseConfigured()) {
      isHydratingSupabase = true;
      loadWorkspaceStatePayloadFromSupabase(SUPABASE_STATE_KEY_ROLE_PERMISSIONS)
        .then(({ payload, synced }) => {
          if (synced && payload && typeof payload === "object") {
            manager.savePermissions(payload);
            if (statusTarget) {
              setStatus(statusTarget, "info", "Role permissions loaded from Supabase.");
            }
          } else if (statusTarget) {
            setStatus(statusTarget, "info", "Using local role permissions until first Supabase sync.");
          }
        })
        .catch((error) => {
          if (statusTarget) {
            setStatus(
              statusTarget,
              "error",
              escapeHtml(
                String(error?.message || "Could not load role permissions from Supabase."),
              ),
            );
          }
        })
        .finally(() => {
          isHydratingSupabase = false;
        });
    }

    gridTarget.addEventListener("change", (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      if (!input.matches("[data-role-permission-role][data-role-permission-key]") || !isAdmin) {
        return;
      }

      manager.setPermission(
        input.dataset.rolePermissionRole,
        input.dataset.rolePermissionKey,
        input.checked,
      );

      if (!isHydratingSupabase) {
        syncPermissionsToSupabase();
      }

      recordAuditEvent({
        action: input.checked ? "granted" : "revoked",
        entityType: "role-permission",
        entityId: `${input.dataset.rolePermissionRole}:${input.dataset.rolePermissionKey}`,
        summary: `${input.dataset.rolePermissionRole} permission ${input.checked ? "enabled" : "disabled"}`,
        details: input.dataset.rolePermissionKey || "",
      });
    });

    if (resetButton) {
      resetButton.disabled = !isAdmin;
      resetButton.addEventListener("click", () => {
        if (!isAdmin) {
          return;
        }
        manager.resetPermissions();
        if (!isHydratingSupabase) {
          syncPermissionsToSupabase("Role permissions reset and synced to Supabase.");
        }
        recordAuditEvent({
          action: "reset",
          entityType: "role-permission",
          summary: "Role permissions reset to defaults",
          details: "All role permission toggles were restored to system defaults.",
        });
      });
    }

    window.addEventListener(manager.eventName, refreshRolePermissionSection);
  }

  function initAcademicCycleControls({
    isAdmin,
    manager,
    summaryTarget,
    sessionForm,
    sessionStatus,
    sessionListTarget,
    termForm,
    termStatus,
    termListTarget,
  }) {
    if (
      !summaryTarget ||
      !sessionForm ||
      !sessionStatus ||
      !sessionListTarget ||
      !termForm ||
      !termStatus ||
      !termListTarget
    ) {
      return;
    }

    const schoolSettingsManager = getSchoolSettingsManager();
    const usesHigherInstitutionPeriods = () => getConfiguredSchoolTypes().includes("higher");
    const getAcademicPeriodType = (term = {}) => (term.periodType === "semester" ? "semester" : "term");
    const getAcademicPeriodLabel = (term = {}) => (getAcademicPeriodType(term) === "semester" ? "Semester" : "Term");
    const getAcademicPeriodNoun = (term = {}) => getAcademicPeriodLabel(term).toLowerCase();

    const updateTermPeriodTypeControl = () => {
      const control = termForm.elements.periodType;
      if (!(control instanceof HTMLSelectElement)) {
        return;
      }

      const supportsSemesters = usesHigherInstitutionPeriods();
      const wrapper = control.closest("[data-term-period-type-wrap]") || control.closest(".portal-field");
      if (wrapper instanceof HTMLElement) {
        wrapper.hidden = !supportsSemesters;
      }
      control.disabled = !isAdmin || !supportsSemesters;
      if (!supportsSemesters) {
        control.value = "term";
      }
    };

    const resetSessionForm = () => {
      sessionForm.reset();
      if (sessionForm.elements.sessionId) sessionForm.elements.sessionId.value = "";
      if (sessionForm.elements.status) sessionForm.elements.status.value = "closed";
      const submitButton = sessionForm.querySelector("[data-session-submit]");
      const cancelButton = sessionForm.querySelector("[data-session-cancel]");
      if (submitButton) submitButton.textContent = "Save session";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(sessionForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) field.disabled = !isAdmin;
      });
    };

    const resetTermForm = () => {
      termForm.reset();
      if (termForm.elements.termId) termForm.elements.termId.value = "";
      if (termForm.elements.periodType) termForm.elements.periodType.value = "term";
      if (termForm.elements.status) termForm.elements.status.value = "closed";
      const submitButton = termForm.querySelector("[data-term-submit]");
      const cancelButton = termForm.querySelector("[data-term-cancel]");
      if (submitButton) submitButton.textContent = "Save period";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(termForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) field.disabled = !isAdmin;
      });
      updateTermPeriodTypeControl();
    };

    const renderSessionOptionsForTerm = (sessions, selectedSessionId = "") => {
      const optionsHtml = sessions
        .map(
          (session) =>
            `<option value="${escapeHtml(session.id)}" ${
              selectedSessionId === session.id ? "selected" : ""
            }>${escapeHtml(session.name)} ${session.status === "open" ? "(Open)" : ""}</option>`,
        )
        .join("");

      termForm.elements.sessionId.innerHTML = optionsHtml;
    };

    const refreshAcademicCyclesSection = () => {
      if (!manager) {
        summaryTarget.innerHTML = `
          <strong>Academic cycle controls unavailable</strong>
          <span>The shared academic cycle manager could not be loaded on this page.</span>
        `;
        sessionListTarget.innerHTML = "";
        termListTarget.innerHTML = "";
        return;
      }

      const { sessions, terms, openSession, openTerm } = manager.summarize();
      const supportsSemesters = usesHigherInstitutionPeriods();
      const semesterCount = terms.filter((term) => getAcademicPeriodType(term) === "semester").length;
      const termCount = terms.length - semesterCount;
      const openPeriodCopy = openTerm
        ? `${getAcademicPeriodLabel(openTerm)}: ${openTerm.name}`
        : supportsSemesters
          ? "Open period: None"
          : "Open term: None";
      const periodTotalCopy = supportsSemesters
        ? `Terms: ${termCount} • Semesters: ${semesterCount}`
        : `Total terms: ${terms.length}`;

      summaryTarget.innerHTML = `
        <strong>Open session: ${escapeHtml(openSession?.name || "None")}</strong>
        <span>${escapeHtml(openPeriodCopy)} • Total sessions: ${
          sessions.length
        } • ${escapeHtml(periodTotalCopy)}</span>
      `;

      renderSessionOptionsForTerm(
        sessions,
        termForm.elements.sessionId?.value ||
          openSession?.id ||
          sessions[0]?.id ||
          "",
      );

      sessionListTarget.innerHTML = sessions.length
        ? sessions
            .map(
              (session) => `
                <article class="portal-class-card">
                  <div class="portal-class-meta">
                    <div class="portal-class-meta-item">
                      <span>Session</span>
                      <strong>${escapeHtml(session.name)}</strong>
                    </div>
                    <div class="portal-class-meta-item">
                      <span>Dates</span>
                      <strong>${escapeHtml(session.startDate || "—")} to ${escapeHtml(
                        session.endDate || "—",
                      )}</strong>
                    </div>
                    <div class="portal-class-meta-item">
                      <span>Status</span>
                      <strong>${session.status === "open" ? "Open" : "Closed"}</strong>
                    </div>
                  </div>
                  <div class="portal-class-actions">
                    <button class="portal-class-button" type="button" data-session-action="edit" data-session-id="${session.id}" ${
                isAdmin ? "" : "disabled"
              }>Edit</button>
                    <button class="portal-class-button ${
                      session.status === "open" ? "is-archive" : "is-restore"
                    }" type="button" data-session-action="${
                      session.status === "open" ? "close" : "open"
                    }" data-session-id="${session.id}" ${isAdmin ? "" : "disabled"}>
                      ${session.status === "open" ? "Close session" : "Open session"}
                    </button>
                  </div>
                </article>
              `,
            )
            .join("")
        : `
            <article class="portal-class-empty">
              <strong>No academic sessions yet</strong>
              <p>Create your first session to start controlling open or closed session windows.</p>
            </article>
          `;

      updateTermPeriodTypeControl();

      termListTarget.innerHTML = terms.length
        ? terms
            .map((term) => {
              const termSession = sessions.find((session) => session.id === term.sessionId);
              const periodLabel = getAcademicPeriodLabel(term);
              const periodNoun = getAcademicPeriodNoun(term);
              return `
                <article class="portal-class-card">
                  <div class="portal-class-meta">
                    <div class="portal-class-meta-item">
                      <span>${escapeHtml(periodLabel)}</span>
                      <strong>${escapeHtml(term.name)}</strong>
                    </div>
                    <div class="portal-class-meta-item">
                      <span>Session</span>
                      <strong>${escapeHtml(termSession?.name || "Unknown session")}</strong>
                    </div>
                    <div class="portal-class-meta-item">
                      <span>Status</span>
                      <strong>${term.status === "open" ? "Open" : "Closed"}</strong>
                    </div>
                  </div>
                  <div class="portal-class-actions">
                    <button class="portal-class-button" type="button" data-term-action="edit" data-term-id="${term.id}" ${
                isAdmin ? "" : "disabled"
              }>Edit</button>
                    <button class="portal-class-button ${
                      term.status === "open" ? "is-archive" : "is-restore"
                    }" type="button" data-term-action="${
                      term.status === "open" ? "close" : "open"
                    }" data-term-id="${term.id}" ${isAdmin ? "" : "disabled"}>
                      ${term.status === "open" ? `Close ${periodNoun}` : `Open ${periodNoun}`}
                    </button>
                  </div>
                </article>
              `;
            })
            .join("")
        : `
            <article class="portal-class-empty">
              <strong>No terms or semesters yet</strong>
              <p>Create periods inside sessions and mark one open when it becomes active.</p>
            </article>
          `;

      if (!isAdmin) {
        setStatus(
          sessionStatus,
          "info",
          "Only admin accounts with settings permission can open or close sessions and periods.",
        );
      }
    };

    clearPortalSessionErrors(sessionForm);
    clearPortalTermErrors(termForm);
    resetSessionForm();
    resetTermForm();
    refreshAcademicCyclesSection();

    sessionForm.addEventListener("input", () => {
      clearPortalSessionErrors(sessionForm);
      if (isAdmin) setStatus(sessionStatus, "", "");
    });

    termForm.addEventListener("input", () => {
      clearPortalTermErrors(termForm);
      if (isAdmin) setStatus(termStatus, "", "");
    });

    if (!manager) {
      return;
    }

    sessionForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(sessionStatus, "info", "Only administrators can manage academic sessions.");
        return;
      }

      clearPortalSessionErrors(sessionForm);
      setStatus(sessionStatus, "", "");

      const payload = {
        id: sessionForm.elements.sessionId.value || undefined,
        name: sessionForm.elements.name.value.trim(),
        startDate: sessionForm.elements.startDate.value || "",
        endDate: sessionForm.elements.endDate.value || "",
        status: sessionForm.elements.status.value === "open" ? "open" : "closed",
      };

      let hasError = false;

      if (!payload.name) {
        setPortalSessionError(sessionForm, "name", "Enter the academic session name.");
        hasError = true;
      }

      if (payload.endDate && payload.startDate && payload.endDate < payload.startDate) {
        setPortalSessionError(
          sessionForm,
          "endDate",
          "Session end date must be after the session start date.",
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(sessionStatus, "error", "Fix the highlighted session details and try again.");
        return;
      }

      const existing = manager.getState().sessions.find((session) => session.id === payload.id) || null;
      manager.upsertSession(payload);
      let promotionSummaryCopy = "";

      if (existing && existing.status === "open" && payload.status === "closed") {
        const studentManager = getStudentManager();
        const promotionSummary = runAutomaticPromotionForClosedSession(
          { id: existing.id, name: payload.name || existing.name },
          studentManager,
        );
        promotionSummaryCopy = ` Auto-promotion: ${promotionSummary.promoted} promoted, ${promotionSummary.repeated} repeated, ${promotionSummary.resit} resit, ${promotionSummary.retainedTopLevel} retained (top class), ${promotionSummary.skippedAlreadyProcessed} already processed.`;
      }

      recordAuditEvent({
        action: existing ? "updated" : "created",
        entityType: "academic-session",
        entityId: payload.name,
        summary: `${existing ? "Updated" : "Created"} session ${payload.name}`,
        details: `Status: ${payload.status}.${promotionSummaryCopy}`,
      });
      setStatus(
        sessionStatus,
        "success",
        `Session <strong>${escapeHtml(payload.name)}</strong> saved as ${
          payload.status === "open" ? "open" : "closed"
        }.${escapeHtml(promotionSummaryCopy)}`,
      );
      clearPortalSessionErrors(sessionForm);
      resetSessionForm();
      clearFormDraftFor(sessionForm);
    });

    termForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(termStatus, "info", "Only administrators can manage academic terms and semesters.");
        return;
      }

      clearPortalTermErrors(termForm);
      setStatus(termStatus, "", "");

      const periodType =
        usesHigherInstitutionPeriods() && termForm.elements.periodType?.value === "semester"
          ? "semester"
          : "term";
      const periodLabel = periodType === "semester" ? "semester" : "term";

      const payload = {
        id: termForm.elements.termId.value || undefined,
        sessionId: termForm.elements.sessionId.value || "",
        periodType,
        name: termForm.elements.name.value.trim(),
        startDate: termForm.elements.startDate.value || "",
        endDate: termForm.elements.endDate.value || "",
        status: termForm.elements.status.value === "open" ? "open" : "closed",
      };

      let hasError = false;

      if (!payload.sessionId) {
        setPortalTermError(termForm, "sessionId", `Select a session for this ${periodLabel}.`);
        hasError = true;
      }

      if (!payload.name) {
        setPortalTermError(termForm, "name", `Enter the ${periodLabel} name.`);
        hasError = true;
      }

      if (payload.endDate && payload.startDate && payload.endDate < payload.startDate) {
        setPortalTermError(termForm, "endDate", `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)} end date must be after the start date.`);
        hasError = true;
      }

      if (hasError) {
        setStatus(termStatus, "error", `Fix the highlighted ${periodLabel} details and try again.`);
        return;
      }

      const existing = manager.getState().terms.find((term) => term.id === payload.id) || null;
      manager.upsertTerm(payload);
      recordAuditEvent({
        action: existing ? "updated" : "created",
        entityType: `academic-${periodLabel}`,
        entityId: payload.name,
        summary: `${existing ? "Updated" : "Created"} ${periodLabel} ${payload.name}`,
        details: `Status: ${payload.status}`,
      });
      setStatus(
        termStatus,
        "success",
        `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)} <strong>${escapeHtml(payload.name)}</strong> saved as ${
          payload.status === "open" ? "open" : "closed"
        }.`,
      );
      clearPortalTermErrors(termForm);
      resetTermForm();
      clearFormDraftFor(termForm);
    });

    sessionListTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-session-action]");

      if (!button || !isAdmin) {
        return;
      }

      const action = button.dataset.sessionAction;
      const sessionId = button.dataset.sessionId;
      const session = manager.getState().sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      if (action === "edit") {
        sessionForm.elements.sessionId.value = session.id;
        sessionForm.elements.name.value = session.name;
        sessionForm.elements.startDate.value = session.startDate || "";
        sessionForm.elements.endDate.value = session.endDate || "";
        sessionForm.elements.status.value = session.status;
        const submitButton = sessionForm.querySelector("[data-session-submit]");
        const cancelButton = sessionForm.querySelector("[data-session-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        return;
      }

      manager.setSessionStatus(session.id, action === "open" ? "open" : "closed");
      let promotionSummaryCopy = "";

      if (action === "close") {
        const studentManager = getStudentManager();
        const promotionSummary = runAutomaticPromotionForClosedSession(session, studentManager);
        promotionSummaryCopy = ` Auto-promotion: ${promotionSummary.promoted} promoted, ${promotionSummary.repeated} repeated, ${promotionSummary.resit} resit, ${promotionSummary.retainedTopLevel} retained (top class), ${promotionSummary.skippedAlreadyProcessed} already processed.`;
      }

      recordAuditEvent({
        action: action === "open" ? "opened" : "closed",
        entityType: "academic-session",
        entityId: session.name,
        summary: `${action === "open" ? "Opened" : "Closed"} session ${session.name}`,
        details: promotionSummaryCopy.trim(),
      });
      setStatus(
        sessionStatus,
        "success",
        `${action === "open" ? "Opened" : "Closed"} <strong>${escapeHtml(session.name)}</strong>.${escapeHtml(
          promotionSummaryCopy,
        )}`,
      );
    });

    termListTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-term-action]");

      if (!button || !isAdmin) {
        return;
      }

      const action = button.dataset.termAction;
      const termId = button.dataset.termId;
      const term = manager.getState().terms.find((item) => item.id === termId);

      if (!term) {
        return;
      }

      if (action === "edit") {
        termForm.elements.termId.value = term.id;
        termForm.elements.sessionId.value = term.sessionId;
        if (termForm.elements.periodType) {
          termForm.elements.periodType.value = getAcademicPeriodType(term);
        }
        termForm.elements.name.value = term.name;
        termForm.elements.startDate.value = term.startDate || "";
        termForm.elements.endDate.value = term.endDate || "";
        termForm.elements.status.value = term.status;
        updateTermPeriodTypeControl();
        const submitButton = termForm.querySelector("[data-term-submit]");
        const cancelButton = termForm.querySelector("[data-term-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        return;
      }

      manager.setTermStatus(term.id, action === "open" ? "open" : "closed");
      const periodNoun = getAcademicPeriodNoun(term);
      recordAuditEvent({
        action: action === "open" ? "opened" : "closed",
        entityType: `academic-${periodNoun}`,
        entityId: term.name,
        summary: `${action === "open" ? "Opened" : "Closed"} ${periodNoun} ${term.name}`,
        details: "",
      });
    });

    const sessionCancel = sessionForm.querySelector("[data-session-cancel]");
    if (sessionCancel) {
      sessionCancel.addEventListener("click", () => {
        clearPortalSessionErrors(sessionForm);
        resetSessionForm();
        setStatus(sessionStatus, "", "");
      });
    }

    const termCancel = termForm.querySelector("[data-term-cancel]");
    if (termCancel) {
      termCancel.addEventListener("click", () => {
        clearPortalTermErrors(termForm);
        resetTermForm();
        setStatus(termStatus, "", "");
      });
    }

    window.addEventListener(manager.eventName, refreshAcademicCyclesSection);
    if (schoolSettingsManager?.eventName) {
      window.addEventListener(schoolSettingsManager.eventName, refreshAcademicCyclesSection);
    }
  }

  function parseCommaSeparatedValues(rawValue) {
    return String(rawValue || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseTeacherAssignments(rawValue) {
    const lines = String(rawValue || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const items = [];
    const invalidLines = [];

    lines.forEach((line) => {
      const match = line.match(/^(.+?)\s*[:\-]\s*(.+)$/);

      if (!match) {
        invalidLines.push(line);
        return;
      }

      const subject = match[1].trim();
      const teacher = match[2].trim();

      if (!subject || !teacher) {
        invalidLines.push(line);
        return;
      }

      items.push({ subject, teacher });
    });

    return { items, invalidLines };
  }

  function parseLineSeparatedValues(rawValue) {
    return String(rawValue || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function clearPortalSettingsErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll(".portal-structure-block").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-settings-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalSettingsError(form, fieldName, message) {
    const error = form.querySelector(`[data-settings-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control && typeof control.closest === "function"
      ? control.closest(".portal-field")
      : error?.closest(".portal-field, .portal-structure-block") || null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalSessionErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-session-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalSessionError(form, fieldName, message) {
    const error = form.querySelector(`[data-session-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalTermErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-term-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalTermError(form, fieldName, message) {
    const error = form.querySelector(`[data-term-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalClassErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-class-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalClassError(form, fieldName, message) {
    const error = form.querySelector(`[data-class-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalCalendarErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-calendar-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalCalendarError(form, fieldName, message) {
    const error = form.querySelector(`[data-calendar-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function normalizeCalendarType(type) {
    const normalized = String(type || "").trim().toLowerCase();

    if (normalized === "holiday") {
      return "holiday";
    }

    if (normalized === "exam" || normalized === "exam-period") {
      return "exam";
    }

    return "term";
  }

  function getCalendarTypeLabel(type) {
    if (normalizeCalendarType(type) === "holiday") {
      return "Holiday";
    }

    if (normalizeCalendarType(type) === "exam") {
      return "Exam Period";
    }

    return "Term";
  }

  function formatCalendarDate(value) {
    if (!value) {
      return "—";
    }

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  function formatCalendarRange(startDate, endDate) {
    const startLabel = formatCalendarDate(startDate);
    const endLabel = formatCalendarDate(endDate);

    if (startLabel === "—" && endLabel === "—") {
      return "Date not set";
    }

    if (startDate === endDate) {
      return startLabel;
    }

    return `${startLabel} - ${endLabel}`;
  }

  function clearPortalCourseErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-course-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalCourseError(form, fieldName, message) {
    const error = form.querySelector(`[data-course-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function resetPortalClassForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.classId) {
      form.elements.classId.value = "";
    }

    if (form.elements.arms) {
      form.elements.arms.value = "";
    }

    if (form.elements.subjects) {
      form.elements.subjects.value = "";
    }

    if (form.elements.teacherAssignments) {
      form.elements.teacherAssignments.value = "";
    }

    const submitButton = form.querySelector("[data-class-submit]");
    const cancelButton = form.querySelector("[data-class-cancel]");

    if (submitButton) {
      submitButton.textContent = "Create class";
    }

    if (cancelButton) {
      cancelButton.hidden = false;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalClassForm(form, record, isAdmin) {
    if (!form || !record) {
      return;
    }

    form.elements.classId.value = record.id;
    form.elements.name.value = record.name;
    form.elements.level.value = record.level;
    form.elements.capacity.value = record.capacity;
    form.elements.classTeacher.value = record.classTeacher || "";
    form.elements.arms.value = (record.arms || []).join(", ");
    form.elements.subjects.value = (record.subjects || []).join(", ");
    form.elements.teacherAssignments.value = (record.teacherAssignments || [])
      .map((item) => `${item.subject}: ${item.teacher}`)
      .join("\n");

    const submitButton = form.querySelector("[data-class-submit]");
    const cancelButton = form.querySelector("[data-class-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function resetPortalCourseForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.courseId) {
      form.elements.courseId.value = "";
    }

    if (form.elements.teacherAssignments) {
      form.elements.teacherAssignments.value = "";
    }

    if (form.elements.category) {
      form.elements.category.value = "";
    }

    const subjectSelect = form.querySelector("[data-course-subject-select]");
    const customSubject = form.querySelector("[data-course-custom-subject]");
    if (subjectSelect) {
      subjectSelect.value = "";
    }
    if (customSubject) {
      customSubject.value = "";
    }

    if (form.elements.creditUnit) {
      form.elements.creditUnit.value = "";
    }

    if (form.elements.faculty) {
      form.elements.faculty.value = "";
    }

    if (form.elements.department) {
      form.elements.department.value = "";
    }

    if (form.elements.customDepartment) {
      form.elements.customDepartment.value = "";
    }

    if (form.elements.studentAssignments) {
      form.elements.studentAssignments.value = "";
    }

    const submitButton = form.querySelector("[data-course-submit]");
    const cancelButton = form.querySelector("[data-course-cancel]");

    if (submitButton) {
      submitButton.textContent = "Create";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalCourseForm(form, record, isAdmin) {
    if (!form || !record) {
      return;
    }

    form.elements.courseId.value = record.id;
    form.elements.name.value = record.name;
    form.elements.code.value = record.code || "";
    if (form.elements.category) {
      form.elements.category.value = record.category || "";
    }
    if (form.elements.creditUnit) {
      form.elements.creditUnit.value = record.creditUnit || "";
    }
    if (form.elements.faculty || form.elements.department) {
      const [faculty = "", department = ""] = String(record.category || "")
        .split("/")
        .map((item) => item.trim());
      if (form.elements.faculty) {
        form.elements.faculty.value = faculty;
      }
      if (form.elements.department) {
        const hasDepartmentOption = Array.from(form.elements.department.options || []).some(
          (option) => option.value === department,
        );
        form.elements.department.value = hasDepartmentOption ? department : department ? "Other" : "";
      }
      if (form.elements.customDepartment) {
        const hasDepartmentOption = Array.from(form.elements.department?.options || []).some(
          (option) => option.value === department,
        );
        form.elements.customDepartment.value = hasDepartmentOption ? "" : department;
      }
    }
    form.elements.description.value = record.description || "";
    if (form.elements.level instanceof HTMLSelectElement) {
      Array.from(form.elements.level.options).forEach((option) => {
        option.selected = option.value === (record.level || "");
      });
    } else {
      form.elements.level.value = record.level || "";
    }
    if (form.elements.teacherAssignments) {
      form.elements.teacherAssignments.value = (record.teacherAssignments || [])[0] || "";
    }
    if (form.elements.studentAssignments) {
      form.elements.studentAssignments.value = (record.studentAssignments || []).join("\n");
    }

    const submitButton = form.querySelector("[data-course-submit]");
    const cancelButton = form.querySelector("[data-course-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function resetPortalCalendarForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.calendarEventId) {
      form.elements.calendarEventId.value = "";
    }

    if (form.elements.type) {
      form.elements.type.value = "term";
    }

    const submitButton = form.querySelector("[data-calendar-submit]");
    const cancelButton = form.querySelector("[data-calendar-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save event";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalCalendarForm(form, record, isAdmin) {
    if (!form || !record) {
      return;
    }

    form.elements.calendarEventId.value = record.id;
    form.elements.title.value = record.title;
    form.elements.type.value = normalizeCalendarType(record.type);
    form.elements.startDate.value = record.startDate || "";
    form.elements.endDate.value = record.endDate || "";
    form.elements.notes.value = record.notes || "";

    const submitButton = form.querySelector("[data-calendar-submit]");
    const cancelButton = form.querySelector("[data-calendar-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function clearPortalAdmissionConfigErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-admission-config-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalAdmissionConfigError(form, fieldName, message) {
    const error = form.querySelector(`[data-admission-config-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }
    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalTimetableErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-timetable-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalTimetableError(form, fieldName, message) {
    const error = form.querySelector(`[data-timetable-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }
    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function clearPortalFeeErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-fee-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalFeeError(form, fieldName, message) {
    const error = form.querySelector(`[data-fee-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }
    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function resetPortalTimetableForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.timetableEntryId) {
      form.elements.timetableEntryId.value = "";
    }

    if (form.elements.periodId) {
      form.elements.periodId.value = "";
    }

    const submitButton = form.querySelector("[data-timetable-submit]");
    const cancelButton = form.querySelector("[data-timetable-cancel]");
    const deleteButton = form.querySelector("[data-timetable-delete]");
    const formTitle = document.getElementById("timetable-form-title");
    const formContext = document.getElementById("timetable-form-context");

    if (submitButton) {
      submitButton.textContent = "Save lesson";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    if (deleteButton) {
      deleteButton.hidden = true;
    }

    if (formTitle) {
      formTitle.textContent = "Assign lesson";
    }

    if (formContext) {
      formContext.textContent = "Select a slot in the grid to begin.";
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalTimetableForm(form, record, isAdmin, options = {}) {
    if (!form || !record) {
      return;
    }

    const sessionSelect = document.getElementById("timetable-session-id");
    const termSelect = document.getElementById("timetable-term-id");
    const classSelect = document.getElementById("timetable-class-level");
    const teacherViewSelect = document.getElementById("timetable-teacher-view");
    const weekTypeSelect = document.getElementById("timetable-week-type");
    const formTitle = document.getElementById("timetable-form-title");
    const formContext = document.getElementById("timetable-form-context");
    const classes = Array.isArray(options.classes) ? options.classes : [];
    const subjects = Array.isArray(options.subjects) ? options.subjects : [];
    const teachers = Array.isArray(options.teachers) ? options.teachers : [];

    if (sessionSelect) sessionSelect.value = record.sessionId || sessionSelect.value;
    if (termSelect) termSelect.value = record.termId || termSelect.value;
    if (weekTypeSelect) weekTypeSelect.value = record.weekType || "all";
    if (classSelect) {
      const matchedClass = classes.find(
        (item) => item.id === record.classId || item.level === record.classLevel,
      );
      if (matchedClass) classSelect.value = matchedClass.id;
    }
    if (teacherViewSelect && record.teacherId) {
      teacherViewSelect.value = record.teacherId;
    }

    if (form.elements.timetableEntryId) form.elements.timetableEntryId.value = record.id;
    if (form.elements.periodId) form.elements.periodId.value = record.periodId || "";

    if (form.elements.subjectId) {
      const matchedSubject = subjects.find(
        (subject) => subject.id === record.subjectId || subject.name === record.subject,
      );
      form.elements.subjectId.value = matchedSubject ? matchedSubject.id : "__custom";
    }
    if (form.elements.subject) {
      const matchedSubject = subjects.find(
        (subject) => subject.id === record.subjectId || subject.name === record.subject,
      );
      form.elements.subject.value = matchedSubject ? "" : record.subject || "";
    }
    if (form.elements.teacherId) {
      const matchedTeacher = teachers.find(
        (teacher) => teacher.id === record.teacherId || teacher.name === record.teacher,
      );
      form.elements.teacherId.value = matchedTeacher?.id || "";
    }
    if (formTitle) {
      formTitle.textContent = "Edit lesson";
    }

    if (formContext) {
      formContext.textContent = `${record.day || "Day"} - ${record.startTime || ""}-${record.endTime || ""}`;
    }

    const submitButton = form.querySelector("[data-timetable-submit]");
    const cancelButton = form.querySelector("[data-timetable-cancel]");
    const deleteButton = form.querySelector("[data-timetable-delete]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    if (deleteButton) {
      deleteButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function resetPortalFeeForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.feeItemId) {
      form.elements.feeItemId.value = "";
    }

    if (form.elements.category) {
      form.elements.category.value = FEE_CATEGORY_FALLBACK;
    }

    const submitButton = form.querySelector("[data-fee-submit]");
    const cancelButton = form.querySelector("[data-fee-cancel]");
    const archiveButton = form.querySelector("[data-fee-modal-archive]");

    if (submitButton) {
      submitButton.textContent = "Save fee item";
    }

    if (archiveButton) {
      archiveButton.hidden = true;
      archiveButton.textContent = "Archive item";
      archiveButton.dataset.feeModalArchiveId = "";
      archiveButton.dataset.feeModalArchiveAction = "archive";
      archiveButton.classList.add("is-archive");
      archiveButton.classList.remove("is-restore");
    }

    if (cancelButton) {
      cancelButton.textContent = "Cancel";
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalFeeForm(form, record, isAdmin) {
    if (!form || !record) {
      return;
    }

    form.elements.feeItemId.value = record.id;
    if (form.elements.category) {
      form.elements.category.value = normalizeFeeCategoryKey(record.category || FEE_CATEGORY_FALLBACK);
    }
    form.elements.name.value = record.name || "";
    form.elements.amount.value = record.amount || "";
    form.elements.classLevel.value = record.classLevel || "";
    form.elements.sessionId.value = record.sessionId || "";
    form.elements.termId.value = record.termId || "";
    form.elements.dueDate.value = record.dueDate || "";
    form.elements.description.value = record.description || "";

    const submitButton = form.querySelector("[data-fee-submit]");
    const cancelButton = form.querySelector("[data-fee-cancel]");
    const archiveButton = form.querySelector("[data-fee-modal-archive]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (archiveButton) {
      const isArchived = record.status === "archived";
      archiveButton.hidden = !isAdmin;
      archiveButton.textContent = isArchived ? "Reactivate item" : "Archive item";
      archiveButton.dataset.feeModalArchiveId = record.id || "";
      archiveButton.dataset.feeModalArchiveAction = isArchived ? "activate" : "archive";
      archiveButton.classList.toggle("is-archive", !isArchived);
      archiveButton.classList.toggle("is-restore", isArchived);
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function formatCurrencyAmount(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  }

  function getSelectedSchoolTypesFromForm(form) {
    if (!form) {
      return [];
    }

    const selectedTypes = Array.from(form.querySelectorAll("[data-school-type-option]"))
      .filter((input) => input instanceof HTMLInputElement && input.checked)
      .map((input) => String(input.value || "").trim());

    return normalizeExplicitSchoolTypeList(selectedTypes);
  }

  function syncSchoolTypeControls(form, selectedTypes = []) {
    if (!form) {
      return;
    }

    const selectedSet = new Set(normalizeExplicitSchoolTypeList(selectedTypes));
    const typeInputs = Array.from(form.querySelectorAll("[data-school-type-option]"));

    typeInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = selectedSet.has(input.value);
      }
    });

    const allInput = form.querySelector("[data-school-type-all]");
    if (allInput instanceof HTMLInputElement) {
      const checkedCount = typeInputs.filter((input) => input instanceof HTMLInputElement && input.checked).length;
      allInput.checked = checkedCount === typeInputs.length && typeInputs.length > 0;
      allInput.indeterminate = checkedCount > 0 && checkedCount < typeInputs.length;
    }
  }

  function syncHigherInstitutionTypeField(form, selectedTypes = getSelectedSchoolTypesFromForm(form), isAdmin = true) {
    if (!form) {
      return;
    }

    const field = form.querySelector("[data-higher-institution-type-field]");
    const select = form.elements.higherInstitutionType;
    const hasHigher = normalizeExplicitSchoolTypeList(selectedTypes).includes("higher");

    if (field instanceof HTMLElement) {
      field.hidden = !hasHigher;
    }

    if (select instanceof HTMLSelectElement) {
      select.disabled = !isAdmin || !hasHigher;
      select.value = normalizeHigherInstitutionType(select.value);
    }
  }

  function buildSchoolPreviewHtml(settings, isAdmin) {
    const initial = (settings.schoolName || "S").charAt(0).toUpperCase();
    const yearLabel = settings.academicYearStart
      ? (settings.academicYearEnd
          ? `${settings.academicYearStart} – ${settings.academicYearEnd}`
          : `From ${settings.academicYearStart}`)
      : null;
    const schoolTypes = normalizeConfiguredSchoolTypes(settings);
    const structureLabel = schoolTypes
      .map((type) =>
        type === "higher"
          ? `${SCHOOL_TYPE_LABELS.higher} (${getHigherInstitutionTypeLabel(settings.higherInstitutionType)})`
          : SCHOOL_TYPE_LABELS[type] || type,
      )
      .join(" + ");

    const logoHtml = settings.logoUrl
      ? `<img src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(settings.schoolName)} logo" onerror="this.parentElement.textContent='${escapeHtml(initial)}';this.parentElement.classList.remove('is-image')" />`
      : escapeHtml(initial);

    const detailRow = (icon, text, href) => {
      if (!text) return "";
      const content = href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:2px">${escapeHtml(text)}</a>`
        : escapeHtml(text);
      return `
        <div class="portal-school-detail-row">
          <span class="portal-school-detail-icon" aria-hidden="true">${icon}</span>
          <span>${content}</span>
        </div>`;
    };

    const phoneIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.39 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    const webIcon  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const addrIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const campusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"></path><path d="M5 10v9"></path><path d="M19 10v9"></path><path d="M8 19v-5"></path><path d="M12 19v-5"></path><path d="M16 19v-5"></path><path d="M2 19h20"></path><path d="M12 3l10 5H2l10-5z"></path></svg>`;
    const yearIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    const structureIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-4 8 4-8 4-8-4z"></path><path d="M4 16l8 4 8-4"></path><path d="M4 6l8-4 8 4"></path></svg>`;

    const websiteHref = settings.website
      ? (settings.website.startsWith("http") ? settings.website : `https://${settings.website}`)
      : null;

    return `
      <div class="portal-school-preview-card">
        <div class="portal-school-preview-brand">
          <span class="portal-school-preview-mark ${settings.logoUrl ? "is-image" : ""}">${logoHtml}</span>
          <div class="portal-school-preview-copy">
            <strong>${escapeHtml(settings.schoolName || "School name not set")}</strong>
            <span style="font-size:.82rem;color:#8a93a8;font-weight:600;letter-spacing:.04em;text-transform:uppercase">School Profile</span>
          </div>
        </div>
        ${
          settings.schoolProfile
            ? `<p style="margin:0;font-size:.92rem;color:#525f7b;line-height:1.6">${escapeHtml(settings.schoolProfile)}</p>`
            : ""
        }
        <div class="portal-school-detail-grid">
          ${detailRow(phoneIcon, settings.phone, null)}
          ${detailRow(webIcon,  settings.website, websiteHref)}
          ${detailRow(addrIcon, settings.address, null)}
          ${detailRow(campusIcon, settings.campusDetails, null)}
          ${yearLabel ? detailRow(yearIcon, yearLabel, null) : ""}
          ${detailRow(structureIcon, structureLabel, null)}
          ${!settings.phone && !settings.website && !settings.address && !yearLabel
            ? `<p style="margin:0;color:#8a93a8;font-size:.88rem">No contact details added yet. Fill in the form below to complete the school profile.</p>`
            : ""}
        </div>
        <p style="margin:0;font-size:.85rem;color:#8a93a8;border-top:1px solid #eef0f5;padding-top:12px">
          ${isAdmin
            ? "Saved changes update the shared site branding and school identity immediately."
            : "Only administrators can edit these settings."}
        </p>
      </div>`;
  }

  function renderPortalSchoolSettingsSection({
    isAdmin,
    manager,
    previewTarget,
    form,
    status,
  }) {
    if (!previewTarget || !form) return;

    if (!manager) {
      previewTarget.innerHTML = `
        <div class="portal-school-preview-card">
          <div class="portal-school-preview-copy">
            <strong>School settings unavailable</strong>
            <span>The shared school settings manager could not be loaded on this page.</span>
          </div>
        </div>`;
      form.hidden = true;
      return;
    }

    form.hidden = false;
    const settings = manager.getSettings();
    previewTarget.innerHTML = buildSchoolPreviewHtml(settings, isAdmin);

    // Populate form fields
    form.elements.schoolName.value       = settings.schoolName;
    form.elements.logoUrl.value          = settings.logoUrl;
    if (form.elements.logoFile) {
      form.elements.logoFile.value = "";
    }
    form.elements.schoolProfile.value    = settings.schoolProfile || "";
    form.elements.phone.value            = settings.phone;
    form.elements.website.value          = settings.website;
    form.elements.address.value          = settings.address;
    form.elements.campusDetails.value    = settings.campusDetails || "";
    form.elements.academicYearStart.value = settings.academicYearStart;
    form.elements.academicYearEnd.value   = settings.academicYearEnd;
    if (form.elements.higherInstitutionType instanceof HTMLSelectElement) {
      form.elements.higherInstitutionType.value = normalizeHigherInstitutionType(settings.higherInstitutionType);
    }
    syncSchoolTypeControls(form, normalizeConfiguredSchoolTypes(settings));
    syncHigherInstitutionTypeField(form, normalizeConfiguredSchoolTypes(settings), isAdmin);

    // Update the logo swatch preview
    updateLogoSwatch(form, settings.logoUrl, settings.schoolName);

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) field.disabled = !isAdmin;
    });
    syncHigherInstitutionTypeField(form, normalizeConfiguredSchoolTypes(settings), isAdmin);

    if (!isAdmin) setStatus(status, "info", "Only admin accounts with settings permission can edit school settings.");
  }

  function updateLogoSwatch(form, logoUrl, schoolName) {
    const swatch = form.querySelector("[data-logo-swatch]");
    if (!swatch) return;
    const initial = (schoolName || "S").charAt(0).toUpperCase();
    if (logoUrl) {
      swatch.innerHTML = `<img src="${escapeHtml(logoUrl)}" alt="Logo preview" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.parentElement.innerHTML='${escapeHtml(initial)}';this.parentElement.classList.remove('is-image')" />`;
      swatch.classList.add("is-image");
    } else {
      swatch.textContent = initial;
      swatch.classList.remove("is-image");
    }
  }

  function buildLivePreviewFromForm(form, isAdmin) {
    const schoolTypes = getSelectedSchoolTypesFromForm(form);
    return buildSchoolPreviewHtml({
      schoolName:       form.elements.schoolName?.value.trim()        || "",
      logoUrl:          form.elements.logoUrl?.value.trim()           || "",
      schoolProfile:    form.elements.schoolProfile?.value.trim()     || "",
      phone:            form.elements.phone?.value.trim()             || "",
      website:          form.elements.website?.value.trim()           || "",
      address:          form.elements.address?.value.trim()           || "",
      campusDetails:    form.elements.campusDetails?.value.trim()     || "",
      academicYearStart: form.elements.academicYearStart?.value       || "",
      academicYearEnd:   form.elements.academicYearEnd?.value         || "",
      schoolTypes,
      higherInstitutionType: form.elements.higherInstitutionType?.value || getDefaultAdminSchoolSettings().higherInstitutionType,
      hasNursery: schoolTypes.includes("nursery"),
      hasPrimary: schoolTypes.includes("primary"),
      hasSecondary: schoolTypes.includes("secondary"),
      hasHigherInstitution: schoolTypes.includes("higher"),
    }, isAdmin);
  }

  function clearPortalAccessErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-access-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalAccessError(form, fieldName, message) {
    const error = form.querySelector(`[data-access-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function resetPortalAccessForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.accessId) {
      form.elements.accessId.value = "";
    }

    if (form.elements.role) {
      form.elements.role.value = "Teacher";
    }

    if (form.elements.authMethod) {
      form.elements.authMethod.value = "any";
    }

    if (form.elements.status) {
      form.elements.status.value = "active";
    }

    const submitButton = form.querySelector("[data-access-submit]");
    const cancelButton = form.querySelector("[data-access-cancel]");

    if (submitButton) {
      submitButton.textContent = "Grant access";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalAccessForm(form, grant, isAdmin) {
    if (!form || !grant) {
      return;
    }

    form.elements.accessId.value = grant.id;
    form.elements.email.value = grant.email;
    form.elements.role.value = normalizeRoleLabel(grant.role);
    form.elements.authMethod.value = normalizeAccessMethod(grant.authMethod);
    form.elements.status.value = normalizeAccessStatus(grant.status);

    const submitButton = form.querySelector("[data-access-submit]");
    const cancelButton = form.querySelector("[data-access-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save access";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function renderPortalAccessProvisioningSection({ isAdmin, summaryTarget, listTarget }) {
    if (!summaryTarget || !listTarget) {
      return;
    }

    const grants = getAccessGrants();
    const users = getUsers();
    const activeCount = grants.filter((entry) => entry.status === "active").length;
    const revokedCount = grants.filter((entry) => entry.status === "revoked").length;
    const claimedCount = grants.filter((entry) => entry.claimedAt).length;

    summaryTarget.innerHTML = `
      <strong>${activeCount} active access grants</strong>
      <span>${
        isAdmin
          ? `${claimedCount} claimed • ${revokedCount} revoked. Users can only create accounts when a matching grant exists.`
          : "Only administrators can create or update access grants."
      }</span>
    `;

    if (!grants.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No access grants yet</strong>
          <p>Add teacher, student, parent, or admin emails here to control who can create accounts.</p>
        </article>
      `;
      return;
    }

    listTarget.innerHTML = grants
      .map((grant) => {
        const existingUser =
          users.find(
            (entry) =>
              entry.normalizedEmail === grant.normalizedEmail &&
              normalizeWorkspaceId(entry.workspaceId || "public") === normalizeWorkspaceId(grant.workspaceId || "public"),
          ) || null;
        const claimLabel = grant.claimedAt
          ? `Claimed ${escapeHtml(formatTimestamp(grant.claimedAt))}`
          : "Not claimed yet";
        const statusLabel = grant.status === "active" ? "Active" : "Revoked";

        return `
          <article class="portal-class-card">
            <div class="portal-class-meta">
              <div class="portal-class-meta-item">
                <span>Email</span>
                <strong>${escapeHtml(grant.email)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Role</span>
                <strong>${escapeHtml(grant.role)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Method</span>
                <strong>${escapeHtml(grant.authMethod)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Status</span>
                <strong>${escapeHtml(statusLabel)}</strong>
              </div>
            </div>
            <div class="portal-class-extended">
              <div class="portal-class-extended-item">
                <span>Grant state</span>
                <strong>${escapeHtml(claimLabel)}</strong>
              </div>
              <div class="portal-class-extended-item">
                <span>Account record</span>
                <strong>${
                  existingUser
                    ? `${escapeHtml(normalizeRoleLabel(existingUser.role))} (${escapeHtml(
                        existingUser.provider || "password",
                      )})`
                    : "No account yet"
                }</strong>
              </div>
            </div>
            <div class="portal-class-actions">
              <button class="portal-class-button" type="button" data-access-action="edit" data-access-id="${grant.id}" ${
          isAdmin ? "" : "disabled"
        }>
                Edit
              </button>
              <button
                class="portal-class-button ${grant.status === "active" ? "is-archive" : "is-restore"}"
                type="button"
                data-access-action="${grant.status === "active" ? "revoke" : "activate"}"
                data-access-id="${grant.id}"
                ${isAdmin ? "" : "disabled"}
              >
                ${grant.status === "active" ? "Revoke" : "Activate"}
              </button>
              <button
                class="portal-class-button"
                type="button"
                data-access-action="delete"
                data-access-id="${grant.id}"
                ${isAdmin ? "" : "disabled"}
              >
                Delete
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function initAccessProvisioningControls({
    isAdmin,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const refreshAccessProvisioning = () => {
      renderPortalAccessProvisioningSection({
        isAdmin,
        summaryTarget,
        listTarget,
      });
    };

    form.addEventListener("input", () => {
      clearPortalAccessErrors(form);

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    refreshAccessProvisioning();
    resetPortalAccessForm(form, isAdmin);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can grant user access.");
        return;
      }

      clearPortalAccessErrors(form);
      setStatus(status, "", "");

      const accessId = form.elements.accessId.value || "";
      const payload = {
        id: accessId || undefined,
        email: form.elements.email.value.trim(),
        role: normalizeRoleLabel(form.elements.role.value),
        authMethod: normalizeAccessMethod(form.elements.authMethod.value),
        status: normalizeAccessStatus(form.elements.status.value),
      };

      let hasError = false;

      if (!payload.email) {
        setPortalAccessError(form, "email", "Enter a valid email to grant access.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(payload.email)) {
        setPortalAccessError(form, "email", "Enter a valid email format.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted access fields and try again.");
        return;
      }

      const grants = getAccessGrants();
      const duplicate = grants.find(
        (entry) =>
          entry.id !== accessId &&
          entry.normalizedEmail === normalizeEmail(payload.email),
      );

      if (duplicate) {
        setPortalAccessError(form, "email", "This email already has an access grant. Edit the existing grant instead.");
        setStatus(status, "error", "An access grant already exists for that email.");
        return;
      }

      const currentGrant = grants.find((entry) => entry.id === accessId) || null;
      upsertAccessGrant({
        ...currentGrant,
        ...payload,
      });
      recordAuditEvent({
        action: currentGrant ? "updated" : "granted",
        entityType: "user-access",
        entityId: payload.email,
        summary: currentGrant
          ? `Updated access for ${payload.email}`
          : `Granted ${payload.role} access to ${payload.email}`,
        details: `Method: ${payload.authMethod} • Status: ${payload.status}`,
      });
      const linkedUser = updateUserByEmail(payload.email, (currentUser) => ({
        ...currentUser,
        role: payload.role,
        status: payload.status === "revoked" ? "deactivated" : "active",
      }));

      if (linkedUser) {
        recordAuditEvent({
          action: "updated",
          entityType: "user-account",
          entityId: linkedUser.email,
          summary: `Updated account role/status for ${linkedUser.email}`,
          details: `Role: ${linkedUser.role} • Status: ${linkedUser.status}`,
        });
      }

      resetPortalAccessForm(form, isAdmin);
      clearFormDraftFor(form);
      refreshAccessProvisioning();
      setStatus(
        status,
        "success",
        `Access saved for <strong>${escapeHtml(payload.email)}</strong> as <strong>${escapeHtml(
          payload.role,
        )}</strong>.`,
      );
    });

    listTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-access-action]");

      if (!button || !isAdmin) {
        return;
      }

      const action = button.dataset.accessAction;
      const accessId = button.dataset.accessId;
      const grant = getAccessGrants().find((entry) => entry.id === accessId);

      if (!grant) {
        return;
      }

      if (action === "edit") {
        clearPortalAccessErrors(form);
        populatePortalAccessForm(form, grant, isAdmin);
        setStatus(
          status,
          "info",
          `Editing access for <strong>${escapeHtml(grant.email)}</strong>.`,
        );
        return;
      }

      if (action === "revoke" || action === "activate") {
        const nextStatus = action === "revoke" ? "revoked" : "active";
        setAccessGrantStatus(grant.id, nextStatus);
        const linkedUser = updateUserByEmail(grant.email, (currentUser) => ({
          ...currentUser,
          status: nextStatus === "active" ? "active" : "deactivated",
        }));
        recordAuditEvent({
          action: nextStatus,
          entityType: "user-access",
          entityId: grant.email,
          summary: `${nextStatus === "active" ? "Activated" : "Revoked"} access for ${grant.email}`,
          details: `Role: ${grant.role}`,
        });
        if (linkedUser) {
          recordAuditEvent({
            action: nextStatus === "active" ? "activated" : "deactivated",
            entityType: "user-account",
            entityId: linkedUser.email,
            summary: `${nextStatus === "active" ? "Activated" : "Deactivated"} account ${linkedUser.email}`,
            details: `Role: ${normalizeRoleLabel(linkedUser.role)} • Status: ${normalizeUserStatus(linkedUser.status)}`,
          });
        }
        refreshAccessProvisioning();
        setStatus(
          status,
          "success",
          `Access is now <strong>${escapeHtml(nextStatus)}</strong> for ${escapeHtml(grant.email)}.`,
        );
        return;
      }

      if (action === "delete") {
        removeAccessGrant(grant.id);
        const linkedUser = updateUserByEmail(grant.email, (currentUser) => ({
          ...currentUser,
          status: "deactivated",
        }));
        recordAuditEvent({
          action: "deleted",
          entityType: "user-access",
          entityId: grant.email,
          summary: `Deleted access grant for ${grant.email}`,
          details: `Role: ${grant.role}`,
        });
        if (linkedUser) {
          recordAuditEvent({
            action: "deactivated",
            entityType: "user-account",
            entityId: linkedUser.email,
            summary: `Deactivated account ${linkedUser.email} after grant deletion`,
            details: `Role: ${normalizeRoleLabel(linkedUser.role)}`,
          });
        }
        refreshAccessProvisioning();
        resetPortalAccessForm(form, isAdmin);
        setStatus(status, "success", `Deleted access grant for <strong>${escapeHtml(grant.email)}</strong>.`);
      }
    });

    const cancelButton = form.querySelector("[data-access-cancel]");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        clearPortalAccessErrors(form);
        resetPortalAccessForm(form, isAdmin);
        setStatus(status, "", "");
      });
    }
  }

  function clearPortalStaffErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-staff-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalStaffError(form, fieldName, message) {
    const error = form.querySelector(`[data-staff-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function resetPortalStaffForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.staffId) {
      form.elements.staffId.value = "";
    }
    if (form.elements.role) {
      form.elements.role.value = "Teacher";
    }

    const submitButton = form.querySelector("[data-staff-submit]");
    const cancelButton = form.querySelector("[data-staff-cancel]");

    if (submitButton) {
      submitButton.textContent = "Create staff account";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalStaffForm(form, user, isAdmin) {
    if (!form || !user) {
      return;
    }

    form.elements.staffId.value = user.id;
    form.elements.displayName.value = user.displayName || "";
    form.elements.email.value = user.email || "";
    if (form.elements.role) {
      form.elements.role.value = normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE);
    }
    if (form.elements.phone) {
      form.elements.phone.value = user.phone || "";
    }
    if (form.elements.department) {
      form.elements.department.value = user.department || "";
    }
    if (form.elements.title) {
      form.elements.title.value = user.title || "";
    }
    const submitButton = form.querySelector("[data-staff-submit]");
    const cancelButton = form.querySelector("[data-staff-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save staff account";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function getStaffSignInLabel(user) {
    if (!user) {
      return "Password";
    }
    if (user.provider === "google") {
      return "Google sign-in";
    }
    if (user.mustChangePassword) {
      return "Default password (change required)";
    }
    return "Owner-managed password";
  }

  function renderPortalStaffManagementSection({
    isAdmin,
    summaryTarget,
    listTarget,
    searchQuery = "",
    statusFilter = "all",
  }) {
    if (!summaryTarget || !listTarget) {
      return;
    }

    const allUsers = getUsers();
    const workspaceId = getCurrentWorkspaceId();
    const managedUsers = allUsers
      .filter(
        (user) =>
          normalizeWorkspaceId(user.workspaceId) === workspaceId &&
          normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) === "Teacher",
      )
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
    const activeCount = managedUsers.filter((user) => normalizeUserStatus(user.status) === "active").length;
    const inactiveCount = managedUsers.length - activeCount;
    const normalizedQuery = String(searchQuery || "").trim().toLowerCase();
    const normalizedStatusFilter = String(statusFilter || "all").trim().toLowerCase();
    const filteredUsers = managedUsers.filter((user) => {
      const statusToken = normalizeUserStatus(user.status) === "active" ? "active" : "deactivated";
      if (normalizedStatusFilter !== "all" && statusToken !== normalizedStatusFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const nameValue = String(user.displayName || "").toLowerCase();
      const emailValue = String(user.email || "").toLowerCase();
      return nameValue.includes(normalizedQuery) || emailValue.includes(normalizedQuery);
    });

    summaryTarget.innerHTML = `
      <strong>${activeCount} active staff account${activeCount === 1 ? "" : "s"}</strong>
      <span>${
        isAdmin
          ? `${inactiveCount} deactivated staff account${inactiveCount === 1 ? "" : "s"}.`
          : "Only administrators can create or update staff profiles."
      }</span>
    `;

    if (!managedUsers.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No staff accounts yet</strong>
          <p>Create the first staff account above.</p>
        </article>
      `;
      return;
    }

    if (!filteredUsers.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No staff match this filter</strong>
          <p>Try another name, email, or status option.</p>
        </article>
      `;
      return;
    }

    listTarget.innerHTML = `
      <div class="portal-staff-list">
        ${filteredUsers
      .map((user) => {
        const isActive = normalizeUserStatus(user.status) === "active";
        return `
          <button class="portal-staff-row" type="button" data-staff-open="${escapeHtml(user.id)}">
            <span class="portal-staff-avatar">${escapeHtml(getInitials(user.displayName || user.email || "T").slice(0, 2))}</span>
            <span class="portal-staff-main">
              <strong>${escapeHtml(user.displayName || user.email || "Teacher")}</strong>
              <small>${escapeHtml(user.email || "No email")}</small>
            </span>
            <span class="portal-staff-detail">
              <strong>${escapeHtml(user.title || "Staff")}</strong>
              <small>${escapeHtml(user.department || "No department")}</small>
            </span>
            <span class="portal-staff-detail">
              <strong>${escapeHtml(getStaffSignInLabel(user))}</strong>
              <small>Sign-in</small>
            </span>
            <span class="portal-class-status ${isActive ? "is-active" : "is-archived"}">
              ${isActive ? "Active" : "Deactivated"}
            </span>
          </button>
        `;
      })
      .join("")}
      </div>
    `;
  }

  function initStaffManagementControls({ isAdmin, summaryTarget, form, status, listTarget }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const filterSearchInput = document.getElementById("portal-staff-filter-search");
    const filterStatusSelect = document.getElementById("portal-staff-filter-status");
    let searchQuery = String(filterSearchInput?.value || "").trim();
    let statusFilter = String(filterStatusSelect?.value || "all").trim().toLowerCase() || "all";
    let selectedStaffId = "";
    let staffViewOverlay = null;
    let staffViewGrid = null;

    const ensureStaffViewOverlay = () => {
      if (staffViewOverlay) {
        return staffViewOverlay;
      }

      let overlay = document.getElementById("portal-staff-view-overlay");
      if (!overlay) {
        document.body.insertAdjacentHTML(
          "beforeend",
          `
          <div id="portal-staff-view-overlay" class="portal-overlay" hidden>
            <button class="portal-overlay-backdrop" type="button" data-staff-view-close aria-label="Close staff details"></button>
            <section class="portal-overlay-panel portal-overlay-panel-sm portal-staff-view-panel" role="dialog" aria-modal="true" aria-labelledby="portal-staff-view-title">
              <header class="portal-overlay-head portal-staff-view-head">
                <div>
                  <span class="portal-overlay-kicker">Teacher account</span>
                  <h3 id="portal-staff-view-title">Staff details</h3>
                </div>
                <button class="portal-overlay-close" type="button" data-staff-view-close aria-label="Close staff details">&times;</button>
              </header>
              <div class="portal-staff-view-content">
                <div id="portal-staff-view-grid" class="portal-staff-view-grid"></div>
                <div class="portal-staff-view-actions">
                  <button class="button button-primary" type="button" data-staff-view-edit>Edit profile</button>
                  <button class="portal-class-button is-archive" type="button" data-staff-view-status>Deactivate</button>
                  <button class="button button-outline" type="button" data-staff-view-close>Close</button>
                </div>
              </div>
            </section>
          </div>
          `,
        );
        overlay = document.getElementById("portal-staff-view-overlay");
      }

      staffViewOverlay = overlay;
      staffViewGrid = document.getElementById("portal-staff-view-grid");
      return overlay;
    };

    const setOverlayState = (isVisible) => {
      const overlay = ensureStaffViewOverlay();
      if (!overlay) {
        return;
      }
      overlay.hidden = !isVisible;
      const hasOpenOverlay = Boolean(document.querySelector(".portal-overlay:not([hidden])"));
      document.body.classList.toggle("portal-overlay-open", hasOpenOverlay);
      if (!isVisible) {
        selectedStaffId = "";
      }
    };

    const getStaffById = (staffId) => {
      const workspaceId = getCurrentWorkspaceId();
      return getUsers().find(
        (entry) =>
          entry.id === staffId &&
          normalizeWorkspaceId(entry.workspaceId) === workspaceId &&
          normalizeRoleLabel(entry.role || DEFAULT_AUTH_ROLE) === "Teacher",
      );
    };

    const renderStaffViewContent = (user) => {
      if (!staffViewGrid || !user) {
        return;
      }
      const isActive = normalizeUserStatus(user.status) === "active";
      const statusValue = isActive ? "Active" : "Deactivated";
      const profileName = user.displayName || user.email || "Teacher";
      const emailLabel = user.email || "No email";
      const initials = getInitials(profileName).slice(0, 2) || "T";
      const roleLabel = normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) || "Teacher";
      const titleLabel = user.title || "Staff";
      const departmentLabel = user.department || "Not assigned";
      const phoneLabel = user.phone || "Not provided";
      const createdLabel = user.createdAt ? formatTimestamp(user.createdAt) : "Not recorded";
      const updatedLabel = user.updatedAt ? formatTimestamp(user.updatedAt) : "Not recorded";
      const lastLoginLabel = user.lastLoginAt ? formatTimestamp(user.lastLoginAt) : "Not signed in";
      staffViewGrid.innerHTML = `
        <section class="portal-staff-profile-hero">
          <span class="portal-staff-profile-avatar">${escapeHtml(initials)}</span>
          <div class="portal-staff-profile-copy">
            <span>${escapeHtml(titleLabel)}</span>
            <h4>${escapeHtml(profileName)}</h4>
            <p>${escapeHtml(emailLabel)}</p>
          </div>
          <span class="portal-staff-profile-status ${isActive ? "is-active" : "is-archived"}">${escapeHtml(statusValue)}</span>
        </section>
        <div class="portal-staff-view-sections">
          <section class="portal-staff-view-card">
            <div class="portal-staff-view-card-head">
              <strong>Account access</strong>
              <span>Login, role, and status details.</span>
            </div>
            <div class="portal-staff-detail-grid">
              <article>
                <span>Status</span>
                <strong>${escapeHtml(statusValue)}</strong>
              </article>
              <article>
                <span>Sign-in</span>
                <strong>${escapeHtml(getStaffSignInLabel(user))}</strong>
              </article>
              <article>
                <span>Role</span>
                <strong>${escapeHtml(roleLabel)}</strong>
              </article>
              <article>
                <span>Last login</span>
                <strong>${escapeHtml(lastLoginLabel)}</strong>
              </article>
            </div>
          </section>
          <section class="portal-staff-view-card">
            <div class="portal-staff-view-card-head">
              <strong>Staff profile</strong>
              <span>Contact and teaching information.</span>
            </div>
            <div class="portal-staff-detail-grid">
              <article class="is-wide">
                <span>Email</span>
                <strong>${escapeHtml(emailLabel)}</strong>
              </article>
              <article>
                <span>Phone</span>
                <strong>${escapeHtml(phoneLabel)}</strong>
              </article>
              <article>
                <span>Department</span>
                <strong>${escapeHtml(departmentLabel)}</strong>
              </article>
              <article>
                <span>Title</span>
                <strong>${escapeHtml(titleLabel)}</strong>
              </article>
              <article>
                <span>Created</span>
                <strong>${escapeHtml(createdLabel)}</strong>
              </article>
              <article>
                <span>Updated</span>
                <strong>${escapeHtml(updatedLabel)}</strong>
              </article>
            </div>
          </section>
        </div>
      `;

      const overlay = ensureStaffViewOverlay();
      const editButton = overlay.querySelector("[data-staff-view-edit]");
      const statusButton = overlay.querySelector("[data-staff-view-status]");
      if (editButton) {
        editButton.disabled = !isAdmin;
      }
      if (statusButton) {
        statusButton.disabled = !isAdmin;
        statusButton.dataset.staffNextStatus = isActive ? "deactivated" : "active";
        statusButton.classList.toggle("is-archive", isActive);
        statusButton.classList.toggle("is-restore", !isActive);
        statusButton.textContent = isActive ? "Deactivate account" : "Activate account";
      }
    };

    const openStaffModal = (user) => {
      const overlay = ensureStaffViewOverlay();
      if (!overlay || !user) {
        return;
      }
      selectedStaffId = user.id;
      renderStaffViewContent(user);
      setOverlayState(true);
    };

    const applyStaffStatusAction = (user, nextStatus) => {
      const updatedUser = updateUser(user.id, (currentUser) => ({
        ...currentUser,
        status: nextStatus,
      }));
      const matchingGrant = getAccessGrants({ workspaceId: getCurrentWorkspaceId() }).find(
        (grant) => grant.normalizedEmail === normalizeEmail(user.email),
      );
      if (matchingGrant) {
        setAccessGrantStatus(
          matchingGrant.id,
          nextStatus === "active" ? "active" : "revoked",
          getCurrentWorkspaceId(),
        );
      }
      recordAuditEvent({
        action: nextStatus === "active" ? "activated" : "deactivated",
        entityType: "staff-account",
        entityId: user.email,
        summary: `${nextStatus === "active" ? "Activated" : "Deactivated"} staff account ${user.email}`,
        details: `Role: ${normalizeRoleLabel(updatedUser?.role || user.role)}`,
      });
      refreshStaff();
      setStatus(
        status,
        "success",
        `Staff account <strong>${escapeHtml(user.email)}</strong> is now <strong>${escapeHtml(nextStatus)}</strong>.`,
      );
    };

    const refreshStaff = () => {
      renderPortalStaffManagementSection({
        isAdmin,
        summaryTarget,
        listTarget,
        searchQuery,
        statusFilter,
      });
      if (selectedStaffId) {
        const user = getStaffById(selectedStaffId);
        if (user) {
          renderStaffViewContent(user);
        } else {
          setOverlayState(false);
        }
      }
    };

    form.addEventListener("input", () => {
      clearPortalStaffErrors(form);
      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    refreshStaff();
    resetPortalStaffForm(form, isAdmin);

    if (filterSearchInput) {
      filterSearchInput.addEventListener("input", () => {
        searchQuery = String(filterSearchInput.value || "").trim();
        refreshStaff();
      });
    }

    if (filterStatusSelect) {
      filterStatusSelect.addEventListener("change", () => {
        statusFilter = String(filterStatusSelect.value || "all").trim().toLowerCase() || "all";
        refreshStaff();
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can add staff accounts.");
        return;
      }

      clearPortalStaffErrors(form);
      setStatus(status, "", "");

      const staffId = String(form.elements.staffId?.value || "").trim();
      const displayName = form.elements.displayName.value.trim();
      const email = form.elements.email.value.trim();
      const role = "Teacher";
      const phone = String(form.elements.phone?.value || "").trim();
      const department = String(form.elements.department?.value || "").trim();
      const title = String(form.elements.title?.value || "").trim();
      const existingUserForEmail = findUserByEmail(email);

      let hasError = false;

      if (!displayName) {
        setPortalStaffError(form, "displayName", "Enter the staff name.");
        hasError = true;
      }

      if (!email) {
        setPortalStaffError(form, "email", "Enter the staff email.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(email)) {
        setPortalStaffError(form, "email", "Enter a valid email format.");
        hasError = true;
      } else if (staffId && existingUserForEmail && existingUserForEmail.id !== staffId) {
        setPortalStaffError(form, "email", "This email already belongs to another account.");
        hasError = true;
      }

      if (phone && !isValidPhoneNumber(phone)) {
        setPortalStaffError(form, "phone", "Wrong phone number format.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted fields and try again.");
        return;
      }

      const workspaceId = getCurrentWorkspaceId();
      const shouldIssueDefaultPassword =
        !staffId &&
        (!existingUserForEmail ||
          (existingUserForEmail.provider !== "google" && !existingUserForEmail.passwordHash));
      const activePassword = shouldIssueDefaultPassword ? DEFAULT_STAFF_PASSWORD : "";
      let result;

      if (staffId) {
        const existingStaff = getStaffById(staffId);
        if (!existingStaff) {
          setStatus(status, "error", "Could not find this staff account.");
          return;
        }

        result = {
          status: "updated",
          user: updateUser(staffId, (currentUser) => ({
            ...currentUser,
            email,
            normalizedEmail: normalizeEmail(email),
            displayName,
            role,
            phone,
            department,
            title,
            staffProfileManaged: true,
            updatedAt: nowIso(),
          })),
          passwordSet: false,
        };
      } else {
        result = isSupabaseConfigured() && shouldIssueDefaultPassword
          ? await provisionSupabaseManagedUser({
              email,
              displayName,
              role,
              password: activePassword,
              workspaceId,
              mustChangePassword: true,
            })
          : await upsertManagedPasswordUser({
              email,
              displayName,
              role,
              password: activePassword,
              workspaceId,
              preserveExistingPassword: true,
              forcePasswordReset: shouldIssueDefaultPassword,
            });
      }

      if (!result.user && isSupabaseConfigured() && !staffId) {
        const localFallback = await upsertManagedPasswordUser({
          email,
          displayName,
          role,
          password: activePassword,
          workspaceId,
          preserveExistingPassword: true,
          forcePasswordReset: shouldIssueDefaultPassword,
        });

        if (localFallback.user) {
          result = {
            ...localFallback,
            message: result.message || "Supabase staff provisioning failed. Local fallback account created.",
          };
        }
      }

      if (result.status === "existing_google") {
        setPortalStaffError(
          form,
          "email",
          "This account already uses Google sign-in. Use access provisioning if you want Google-only staff access.",
        );
        setStatus(status, "error", "This account uses Google sign-in, so password changes stay with the account owner.");
        return;
      }

      if (!result.user) {
        setStatus(status, "error", "Could not save this staff account.");
        return;
      }

      const updatedProfile = updateUser(result.user.id, (currentUser) => ({
        ...currentUser,
        role,
        phone,
        department,
        title,
        staffProfileManaged: true,
      }));

      upsertAccessGrant({
        email: result.user.email,
        role,
        authMethod: "password",
        status: "active",
      }, workspaceId);
      markAccessGrantClaimed(result.user.email, role, "password", result.user.id, workspaceId);

      recordAuditEvent({
        action: staffId ? "updated" : "created",
        entityType: "staff-account",
        entityId: result.user.email,
        summary: staffId
          ? `Updated staff account for ${result.user.displayName || result.user.email}`
          : `Created staff account for ${result.user.displayName || result.user.email}`,
        details: `${role} • ${
          shouldIssueDefaultPassword
            ? "Default password issued; owner must change it."
            : "Password unchanged; only the account owner can change it."
        }`,
      });

      resetPortalStaffForm(form, isAdmin);
      clearFormDraftFor(form);
      refreshStaff();
      setOverlayState(false);

      setStatus(
        status,
        "success",
        staffId
          ? `Updated staff profile for <strong>${escapeHtml(result.user.email)}</strong> as <strong>${escapeHtml(
              role,
            )}</strong>. Password unchanged; only the staff account owner can change it.`
          : `Staff account created for <strong>${escapeHtml(result.user.email)}</strong>. Default password: <strong>${escapeHtml(
              DEFAULT_STAFF_PASSWORD,
            )}</strong> • The staff member must change it from their portal.`,
      );
    });

    listTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-staff-open]");

      if (!button) {
        return;
      }

      const staffId = button.dataset.staffOpen;
      const user = getStaffById(staffId);

      if (!user) {
        return;
      }

      openStaffModal(user);
    });

    const overlay = ensureStaffViewOverlay();
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        const closeButton = event.target.closest("[data-staff-view-close]");
        if (closeButton) {
          setOverlayState(false);
          return;
        }

        const editButton = event.target.closest("[data-staff-view-edit]");
        if (editButton) {
          if (!isAdmin || !selectedStaffId) {
            return;
          }
          const user = getStaffById(selectedStaffId);
          if (!user) {
            setOverlayState(false);
            return;
          }
          clearPortalStaffErrors(form);
          populatePortalStaffForm(form, user, isAdmin);
          setStatus(status, "info", `Editing staff account for <strong>${escapeHtml(user.email)}</strong>.`);
          setOverlayState(false);
          return;
        }

        const statusButton = event.target.closest("[data-staff-view-status]");
        if (statusButton) {
          if (!isAdmin || !selectedStaffId) {
            return;
          }
          const user = getStaffById(selectedStaffId);
          if (!user) {
            setOverlayState(false);
            return;
          }
          const nextStatus = String(statusButton.dataset.staffNextStatus || "").trim().toLowerCase() === "active"
            ? "active"
            : "deactivated";
          applyStaffStatusAction(user, nextStatus);
          const refreshedUser = getStaffById(selectedStaffId);
          if (refreshedUser) {
            renderStaffViewContent(refreshedUser);
          } else {
            setOverlayState(false);
          }
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) {
          setOverlayState(false);
        }
      });
    }

    const cancelButton = form.querySelector("[data-staff-cancel]");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        clearPortalStaffErrors(form);
        resetPortalStaffForm(form, isAdmin);
        setStatus(status, "", "");
      });
    }
  }

  function renderPortalFeatureToggleSection({ isAdmin, manager, summaryTarget, gridTarget }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <strong>Feature controls unavailable</strong>
        <span>The shared module registry could not be loaded on this page.</span>
      `;
      gridTarget.innerHTML = "";
      return;
    }

    const { enabled, total, state } = manager.summarize();

    summaryTarget.innerHTML = `
      <strong>${enabled} of ${total} modules active</strong>
      <span>${
        isAdmin
          ? "Changes save immediately and update the visible module catalog without redeployment."
          : "Only administrator accounts can change which modules are exposed for this institution."
      }</span>
    `;

    gridTarget.innerHTML = manager.modules
      .map((module) => {
        const isEnabled = state[module.id] !== false;

        return `
          <label class="portal-toggle-card ${isEnabled ? "is-active" : ""}">
            <span class="portal-toggle-copy">
              <strong>${module.title}</strong>
              <span>${module.copy}</span>
            </span>
            <span class="portal-toggle-control">
              <input
                class="portal-toggle-input"
                type="checkbox"
                data-feature-toggle="${module.id}"
                aria-label="${module.title}"
                ${isEnabled ? "checked" : ""}
                ${isAdmin ? "" : "disabled"}
              />
              <span class="portal-toggle-switch" aria-hidden="true"></span>
            </span>
          </label>
        `;
      })
      .join("");

    gridTarget.querySelectorAll("[data-feature-toggle]").forEach((input) => {
      input.addEventListener("change", () => {
        manager.setFeatureEnabled(input.dataset.featureToggle, input.checked);
        if (isAdmin) {
          const feature = manager.modules.find((module) => module.id === input.dataset.featureToggle);
          recordAuditEvent({
            action: input.checked ? "enabled" : "disabled",
            entityType: "feature-module",
            entityId: input.dataset.featureToggle,
            summary: `${feature?.title || "Feature module"} ${input.checked ? "enabled" : "disabled"}`,
            details: feature?.copy || "",
          });
        }
      });
      });
  }

  function renderPortalRolePermissionSection({ isAdmin, manager, summaryTarget, gridTarget }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <strong>Role permissions unavailable</strong>
        <span>The shared role permission manager could not be loaded on this page.</span>
      `;
      gridTarget.innerHTML = "";
      return;
    }

    const { roles, options, rolePermissions, summary } = manager.summarize();
    const summaryText = summary
      .map((item) => `${item.role}: ${item.enabled}/${item.total}`)
      .join(" • ");

    summaryTarget.innerHTML = `
      <strong>Standard roles: ${roles.join(", ")}</strong>
      <span>${
        isAdmin
          ? `Permission changes save instantly. ${escapeHtml(summaryText)}`
          : "Only administrator accounts can change role permissions."
      }</span>
    `;

    gridTarget.innerHTML = roles
      .map((role) => {
        const enabledForRole = options.filter((option) => rolePermissions[role][option.key]).length;

        return `
          <article class="portal-role-permission-card">
            <header class="portal-role-permission-card-head">
              <strong>${escapeHtml(role)}</strong>
              <span>${enabledForRole} of ${options.length} enabled</span>
            </header>
            <div class="portal-role-permission-list">
              ${options
                .map(
                  (option) => `
                    <label class="portal-role-permission-item">
                      <span>${escapeHtml(option.label)}</span>
                      <input
                        type="checkbox"
                        data-role-permission-role="${escapeHtml(role)}"
                        data-role-permission-key="${escapeHtml(option.key)}"
                        ${rolePermissions[role][option.key] ? "checked" : ""}
                        ${isAdmin ? "" : "disabled"}
                      />
                    </label>
                  `,
                )
                .join("")}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderPortalClassManagementSection({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Class tools unavailable</span>
          <strong>0</strong>
          <p>The shared class registry could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }
    const { classes, activeCount, archivedCount, totalCapacity, totalArms, totalSubjects, totalAssignments } =
      manager.summarize();
    const studentManager = getStudentManager();
    const students = studentManager && typeof studentManager.getStudents === "function"
      ? studentManager.getStudents()
      : [];
    const countStudentsForLevel = (level) =>
      students.filter(
        (student) =>
          String(student.status || "active") === "active" &&
          normalizeLevelToken(student.level) === normalizeLevelToken(level),
      ).length;
    const normalizeClassArmName = (value) => String(value || "").trim().replace(/^Arm\s+/i, "");
    const getClassSegment = (level) => {
      const inferredType = inferSchoolTypeFromLevel(level);
      if (inferredType === "nursery") {
        return "Nursery";
      }
      if (inferredType === "primary") {
        return "Primary";
      }
      if (inferredType === "secondary") {
        return "Secondary";
      }
      if (inferredType === "higher") {
        return `Higher Institution - ${getHigherInstitutionTypeLabel(getConfiguredHigherInstitutionType())}`;
      }
      return "Other Classes";
    };
    const segmentOrder = {
      Nursery: 1,
      Primary: 2,
      Secondary: 3,
      [`Higher Institution - ${getHigherInstitutionTypeLabel(getConfiguredHigherInstitutionType())}`]: 4,
      "Other Classes": 5,
    };
    const getLevelSortValue = (level) => {
      const token = normalizeLevelToken(level);
      const nurseryMatch = token.match(/^nursery(\d+)/);
      const primaryMatch = token.match(/^primary(\d+)/);
      const jssMatch = token.match(/^jss(\d+)/);
      const sssMatch = token.match(/^sss(\d+)/);
      const levelMatch = token.match(/^(\d{3})level$/);
      const higherLevels = Object.values(HIGHER_INSTITUTION_LEVEL_TEMPLATES).flat();
      const higherLevelIndex = higherLevels.findIndex((item) => normalizeLevelToken(item) === token);

      if (nurseryMatch) {
        return 100 + Number(nurseryMatch[1]);
      }
      if (primaryMatch) {
        return 200 + Number(primaryMatch[1]);
      }
      if (jssMatch) {
        return 300 + Number(jssMatch[1]);
      }
      if (sssMatch) {
        return 400 + Number(sssMatch[1]);
      }
      if (levelMatch) {
        return 500 + Number(levelMatch[1]);
      }
      if (higherLevelIndex >= 0) {
        return 600 + higherLevelIndex;
      }
      return 999;
    };
    const sortClassRecords = (left, right) => {
      const leftSegment = getClassSegment(left.level);
      const rightSegment = getClassSegment(right.level);
      const segmentDifference = (segmentOrder[leftSegment] || 99) - (segmentOrder[rightSegment] || 99);

      if (segmentDifference) {
        return segmentDifference;
      }

      const levelDifference = getLevelSortValue(left.level) - getLevelSortValue(right.level);

      if (levelDifference) {
        return levelDifference;
      }

      return String(left.name || "").localeCompare(String(right.name || ""), undefined, { numeric: true });
    };

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active classes</span>
        <strong>${activeCount}</strong>
        <p>${isAdmin ? "Ready for student and teacher assignment." : "Visible for reference only."}</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Total arms</span>
        <strong>${totalArms}</strong>
        <p>Arms created across all active classes.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Subjects covered</span>
        <strong>${totalSubjects}</strong>
        <p>Total subject entries linked across active classes.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-amber">
        <span>Teacher assignments</span>
        <strong>${totalAssignments}</strong>
        <p>Subject-to-teacher links currently assigned.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-slate">
        <span>Total active capacity</span>
        <strong>${totalCapacity.toLocaleString()}</strong>
        <p>Each class card links directly to the timetable and course views.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Archived classes</span>
        <strong>${archivedCount}</strong>
        <p>Past classes kept for historical reference.</p>
      </article>
    `;

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });

    if (!classes.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No classes yet</strong>
          <p>Choose a school type above and generate classes to start assigning students, teachers, timetable slots, and course coverage.</p>
        </article>
      `;
    } else {
      const groupedClasses = classes.sort(sortClassRecords).reduce((segments, record) => {
        const segment = getClassSegment(record.level);
        const level = String(record.level || "Unassigned").trim() || "Unassigned";

        if (!segments.has(segment)) {
          segments.set(segment, new Map());
        }

        if (!segments.get(segment).has(level)) {
          segments.get(segment).set(level, []);
        }

        segments.get(segment).get(level).push(record);
        return segments;
      }, new Map());

      listTarget.innerHTML = Array.from(groupedClasses.entries())
        .map(([segment, levels]) => {
          const segmentRecords = Array.from(levels.values()).flat();
          return `
            <section class="portal-class-group">
              <div class="portal-class-group-head">
                <div>
                  <span>${escapeHtml(segment)}</span>
                  <strong>${segmentRecords.length} class${segmentRecords.length === 1 ? "" : "es"}</strong>
                </div>
                <small>${segmentRecords.filter((record) => record.status !== "archived").length} active</small>
              </div>
              <div class="portal-class-level-stack">
                ${Array.from(levels.entries())
                  .map(([level, records]) => {
                    const levelStudentCount = countStudentsForLevel(level);
                    return `
                      <details class="portal-class-level-group">
                        <summary>
                          <div>
                            <strong>${escapeHtml(level)}</strong>
                            <span>${records.length} arm${records.length === 1 ? "" : "s"} • ${levelStudentCount} student${
                              levelStudentCount === 1 ? "" : "s"
                            }</span>
                          </div>
                          <span class="portal-class-level-actions">
                            <button
                              class="portal-class-button portal-class-add-arm-button"
                              type="button"
                              data-class-action="add-arm"
                              data-class-level="${escapeHtml(level)}"
                              ${isAdmin ? "" : "disabled"}
                            >
                              Add arm
                            </button>
                            <button
                              class="portal-class-button portal-class-add-arm-button is-danger"
                              type="button"
                              data-class-action="delete-level"
                              data-class-level="${escapeHtml(level)}"
                              ${isAdmin ? "" : "disabled"}
                            >
                              Delete class
                            </button>
                          </span>
                        </summary>
                        <div class="portal-class-arm-grid">
                          ${records
                            .sort(sortClassRecords)
                            .map((record) => {
                              const isArchived = record.status === "archived";
                              const displayName = normalizeClassArmName(record.name) || "Unnamed class";
                              return `
                                <article class="portal-class-arm-card ${isArchived ? "is-archived" : ""}">
                                  <div class="portal-class-arm-card-head">
                                    <div>
                                      <strong>${escapeHtml(displayName)}</strong>
                                      <span>${Number(record.capacity).toLocaleString()} capacity • ${escapeHtml(
                                        record.classTeacher || "No class teacher",
                                      )}</span>
                                    </div>
                                    <span class="portal-class-status ${isArchived ? "is-archived" : "is-active"}">
                                      ${isArchived ? "Archived" : "Active"}
                                    </span>
                                  </div>
                                  <div class="portal-class-arm-meta">
                                    <span>Arms: ${escapeHtml((record.arms || []).join(", ") || "None")}</span>
                                    <span>Subjects: ${escapeHtml((record.subjects || []).join(", ") || "None")}</span>
                                  </div>
                                  <div class="portal-class-route-links">
                                    <a href="./admin-students.html">Students</a>
                                    <a href="./admin-courses.html">Subjects</a>
                                    <a href="./admin-attendance.html">Attendance</a>
                                    <a href="./admin-schedule.html">Timetable</a>
                                    <a href="./admin-reports.html">Results</a>
                                  </div>
                                  <div class="portal-class-actions">
                                    <button class="portal-class-button" type="button" data-class-action="view" data-class-id="${record.id}" ${
                                      isAdmin ? "" : "disabled"
                                    }>View</button>
                                    <button class="portal-class-button" type="button" data-class-action="promote" data-class-id="${record.id}" ${
                                      isAdmin ? "" : "disabled"
                                    }>Promote</button>
                                    <button class="portal-class-button ${isArchived ? "is-restore" : "is-archive"}" type="button" data-class-action="${
                                      isArchived ? "activate" : "archive"
                                    }" data-class-id="${record.id}" ${isAdmin ? "" : "disabled"}>
                                      ${isArchived ? "Reactivate" : "Archive"}
                                    </button>
                                    <button class="portal-class-button is-danger" type="button" data-class-action="delete" data-class-id="${record.id}" ${
                                      isAdmin ? "" : "disabled"
                                    }>Remove</button>
                                  </div>
                                </article>
                              `;
                            })
                            .join("")}
                        </div>
                      </details>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("");
    }

    if (!isAdmin) {
      setStatus(
        status,
        "info",
        "Only admin accounts with class permission can generate, adjust, archive, or reactivate classes.",
      );
    }
  }

  function renderPortalCourseManagementSection({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Course tools unavailable</span>
          <strong>0</strong>
          <p>The shared course registry could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }

    const {
      courses,
      activeCount,
      archivedCount,
      levelCount,
      teacherAssignmentCount,
    } = manager.summarize();
    const sortCourses = (left, right) => {
      const leftStatus = left.status === "archived" ? 1 : 0;
      const rightStatus = right.status === "archived" ? 1 : 0;

      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus;
      }

      const levelComparison = String(left.level || "").localeCompare(String(right.level || ""), undefined, { numeric: true });

      if (levelComparison) {
        return levelComparison;
      }

      return String(left.code || left.name || "").localeCompare(String(right.code || right.name || ""), undefined, {
        numeric: true,
      });
    };
    const getLevelSchoolType = (level) => {
      const inferredType = inferSchoolTypeFromLevel(level);
      if (inferredType === "nursery") return "Nursery";
      if (inferredType === "primary") return "Primary";
      if (inferredType === "secondary") return "Secondary";
      if (inferredType === "higher") {
        return `Higher Institution - ${getHigherInstitutionTypeLabel(getConfiguredHigherInstitutionType())}`;
      }
      return "Other";
    };
    const groupOrder = {
      Nursery: 1,
      Primary: 2,
      Secondary: 3,
      [`Higher Institution - ${getHigherInstitutionTypeLabel(getConfiguredHigherInstitutionType())}`]: 4,
      Other: 5,
    };

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active courses</span>
        <strong>${activeCount}</strong>
        <p>Available for class planning and teacher assignment flows.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Archived courses</span>
        <strong>${archivedCount}</strong>
        <p>Kept for history and planning consistency.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Levels covered</span>
        <strong>${levelCount}</strong>
        <p>Unique levels currently mapped by active courses.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-amber">
        <span>Teacher assignments</span>
        <strong>${teacherAssignmentCount}</strong>
        <p>Teacher entries linked directly to the course catalog.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Total courses</span>
        <strong>${courses.length}</strong>
        <p>Active and archived courses in the catalog.</p>
      </article>
    `;

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });

    if (!courses.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No courses yet</strong>
          <p>Create the first course to define code, level, and assignment ownership from one source of truth.</p>
        </article>
      `;
    } else {
      const groupedCourses = courses.sort(sortCourses).reduce((groups, record) => {
        const segment = getLevelSchoolType(record.level);
        const level = String(record.level || "Unassigned").trim() || "Unassigned";

        if (!groups.has(segment)) {
          groups.set(segment, new Map());
        }

        if (!groups.get(segment).has(level)) {
          groups.get(segment).set(level, []);
        }

        groups.get(segment).get(level).push(record);
        return groups;
      }, new Map());

      listTarget.innerHTML = Array.from(groupedCourses.entries())
        .sort(([left], [right]) => (groupOrder[left] || 99) - (groupOrder[right] || 99))
        .map(
          ([segment, levels]) => {
            const segmentRecords = Array.from(levels.values()).flat();
            return `
            <section class="portal-class-group">
              <div class="portal-class-group-head">
                <div>
                  <span>${escapeHtml(segment)}</span>
                  <strong>${segmentRecords.length} ${segment.startsWith("Higher Institution") ? "course" : "subject"}${
                    segmentRecords.length === 1 ? "" : "s"
                  }</strong>
                </div>
                <small>${segmentRecords.filter((record) => record.status !== "archived").length} active</small>
              </div>
              <div class="portal-class-level-stack">
                ${Array.from(levels.entries())
                  .map(
                    ([level, records]) => `
                      <details class="portal-class-level-group">
                        <summary>
                          <div>
                            <strong>${escapeHtml(level)}</strong>
                            <span>${records.length} ${segment.startsWith("Higher Institution") ? "course" : "subject"}${
                              records.length === 1 ? "" : "s"
                            }</span>
                          </div>
                        </summary>
                        <div class="portal-class-level-stack portal-course-level-stack-inner">
                          ${records
                            .map(
                              (record) => `
                      <details class="portal-class-card portal-class-list-item ${record.status === "archived" ? "is-archived" : ""}">
                        <summary class="portal-class-list-summary">
                          <div class="portal-class-list-main">
                            <strong>${escapeHtml(record.code || "NO-CODE")} · ${escapeHtml(record.name)}</strong>
                            <span>${escapeHtml(record.description || "No description yet")}</span>
                          </div>
                          <span class="portal-class-status ${record.status === "archived" ? "is-archived" : "is-active"}">
                            ${record.status === "archived" ? "Archived" : "Active"}
                          </span>
                        </summary>

                        <div class="portal-class-list-body">
                          <div class="portal-class-meta">
                            <div class="portal-class-meta-item">
                              <span>Code</span>
                              <strong>${escapeHtml(record.code || "Not set")}</strong>
                            </div>
                            <div class="portal-class-meta-item">
                              <span>Teacher</span>
                              <strong>${escapeHtml((record.teacherAssignments || [])[0] || "Not assigned")}</strong>
                            </div>
                            <div class="portal-class-meta-item">
                              <span>Category</span>
                              <strong>${escapeHtml(record.category || "General")}</strong>
                            </div>
                            ${
                              record.creditUnit
                                ? `<div class="portal-class-meta-item"><span>Credit unit</span><strong>${escapeHtml(record.creditUnit)}</strong></div>`
                                : ""
                            }
                            <div class="portal-class-meta-item">
                              <span>Updated</span>
                              <strong>${escapeHtml(formatTimestamp(record.updatedAt))}</strong>
                            </div>
                          </div>

                          <div class="portal-class-extended">
                            <div class="portal-class-extended-item portal-class-extended-item-span">
                              <span>Description</span>
                              <strong>${escapeHtml(record.description || "No description provided yet.")}</strong>
                            </div>
                          </div>

                          <div class="portal-class-actions">
                            <button class="portal-class-button" type="button" data-course-action="edit" data-course-id="${record.id}" ${
                              isAdmin ? "" : "disabled"
                            }>Edit</button>
                            <button
                              class="portal-class-button ${record.status === "archived" ? "is-restore" : "is-archive"}"
                              type="button"
                              data-course-action="${record.status === "archived" ? "activate" : "archive"}"
                              data-course-id="${record.id}"
                              ${isAdmin ? "" : "disabled"}
                            >
                              ${record.status === "archived" ? "Reactivate" : "Archive"}
                            </button>
                            <button
                              class="portal-class-button is-danger"
                              type="button"
                              data-course-action="delete"
                              data-course-id="${record.id}"
                              ${isAdmin ? "" : "disabled"}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </details>
                    `,
                            )
                            .join("")}
                        </div>
                      </details>
                    `,
                  )
                  .join("")}
              </div>
            </section>
          `;
          },
        )
        .join("");
    }

    if (!isAdmin) {
      setStatus(
        status,
        "info",
        "Only admin accounts with course permission can create, edit, archive, or reactivate courses.",
      );
    }
  }

  function renderPortalAcademicCalendarSection({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
  }) {
    if (!summaryTarget || !form || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Calendar tools unavailable</span>
          <strong>0</strong>
          <p>The shared academic calendar manager could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }

    const {
      events,
      activeCount,
      archivedCount,
      termCount,
      holidayCount,
      examCount,
      upcomingEvents,
    } = manager.summarize();

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active events</span>
        <strong>${activeCount}</strong>
        <p>Visible to Admin, Teacher, Student, and Parent roles.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Terms</span>
        <strong>${termCount}</strong>
        <p>Academic term windows currently scheduled.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Holidays</span>
        <strong>${holidayCount}</strong>
        <p>Breaks and closure periods shared across the platform.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-amber">
        <span>Exam periods</span>
        <strong>${examCount}</strong>
        <p>Exam windows visible to staff, students, and parents.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Upcoming events</span>
        <strong>${upcomingEvents.length}</strong>
        <p>Nearest calendar items from today onward.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-slate">
        <span>Archived events</span>
        <strong>${archivedCount}</strong>
        <p>Past records retained for notification and planning history.</p>
      </article>
    `;

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });

    if (!events.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No calendar events yet</strong>
          <p>Create the first term, holiday, or exam period so all roles can see key dates.</p>
        </article>
      `;
    } else {
      listTarget.innerHTML = events
        .map(
          (eventRecord) => `
            <details class="portal-class-card portal-class-list-item ${eventRecord.status === "archived" ? "is-archived" : ""}">
              <summary class="portal-class-list-summary">
                <div class="portal-class-list-main">
                  <strong>${escapeHtml(eventRecord.title)}</strong>
                  <span>${escapeHtml(getCalendarTypeLabel(eventRecord.type))} • ${escapeHtml(
                    formatCalendarRange(eventRecord.startDate, eventRecord.endDate),
                  )}</span>
                </div>
                <span class="portal-class-status ${eventRecord.status === "archived" ? "is-archived" : "is-active"}">
                  ${eventRecord.status === "archived" ? "Archived" : "Active"}
                </span>
              </summary>

              <div class="portal-class-list-body">
                <div class="portal-class-meta">
                  <div class="portal-class-meta-item">
                    <span>Type</span>
                    <strong>${escapeHtml(getCalendarTypeLabel(eventRecord.type))}</strong>
                  </div>
                  <div class="portal-class-meta-item">
                    <span>Date range</span>
                    <strong>${escapeHtml(formatCalendarRange(eventRecord.startDate, eventRecord.endDate))}</strong>
                  </div>
                  <div class="portal-class-meta-item">
                    <span>Audience</span>
                    <strong>All roles</strong>
                  </div>
                </div>

                <div class="portal-class-extended">
                  <div class="portal-class-extended-item portal-class-extended-item-span">
                    <span>Notes</span>
                    <strong>${escapeHtml(eventRecord.notes || "No additional notes.")}</strong>
                  </div>
                  <div class="portal-class-extended-item">
                    <span>Updated</span>
                    <strong>${escapeHtml(formatTimestamp(eventRecord.updatedAt))}</strong>
                  </div>
                  <div class="portal-class-extended-item">
                    <span>Visibility</span>
                    <strong>Admin, Teacher, Student, Parent</strong>
                  </div>
                </div>

                <div class="portal-class-actions">
                  <button
                    class="portal-class-button"
                    type="button"
                    data-calendar-action="edit"
                    data-calendar-id="${eventRecord.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    Edit
                  </button>
                  <button
                    class="portal-class-button ${eventRecord.status === "archived" ? "is-restore" : "is-archive"}"
                    type="button"
                    data-calendar-action="${eventRecord.status === "archived" ? "activate" : "archive"}"
                    data-calendar-id="${eventRecord.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    ${eventRecord.status === "archived" ? "Reactivate" : "Archive"}
                  </button>
                </div>
              </div>
            </details>
          `,
        )
        .join("");
    }

    if (!isAdmin) {
      setStatus(status, "info", "Only administrators can create or edit academic calendar events.");
    }
  }

  function renderAdmissionConfigurationSection({
    isAdmin,
    manager,
    summaryTarget,
    sessionListTarget,
    classListTarget,
    stageListTarget,
  }) {
    if (!summaryTarget || !sessionListTarget || !classListTarget || !stageListTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Admission config unavailable</span>
          <strong>0</strong>
          <p>The admissions configuration manager could not be loaded on this page.</p>
        </article>
      `;
      sessionListTarget.innerHTML = "";
      classListTarget.innerHTML = "";
      stageListTarget.innerHTML = "";
      return;
    }

    const {
      sessions,
      classes,
      stages,
      activeSessionCount,
      activeClassCount,
      activeStageCount,
      openSession,
    } = manager.summarize();

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Admission sessions</span>
        <strong>${sessions.length}</strong>
        <p>${activeSessionCount} currently open for applications.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Admission classes</span>
        <strong>${classes.length}</strong>
        <p>${activeClassCount} active class options for applicants.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Application stages</span>
        <strong>${stages.length}</strong>
        <p>${activeStageCount} active stages in the review pipeline.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-slate">
        <span>Open session</span>
        <strong>${escapeHtml(openSession?.name || "None")}</strong>
        <p>Applications can be tagged to this active admission cycle.</p>
      </article>
    `;

    sessionListTarget.innerHTML = sessions.length
      ? sessions
          .map(
            (entry) => `
              <article class="portal-class-card">
                <div class="portal-class-meta">
                  <div class="portal-class-meta-item"><span>Session</span><strong>${escapeHtml(entry.name)}</strong></div>
                  <div class="portal-class-meta-item"><span>Window</span><strong>${escapeHtml(entry.startDate || "—")} to ${escapeHtml(entry.endDate || "—")}</strong></div>
                  <div class="portal-class-meta-item"><span>Status</span><strong>${entry.status === "open" ? "Open" : "Closed"}</strong></div>
                </div>
                <div class="portal-class-actions">
                  <button class="portal-class-button" type="button" data-admission-session-action="edit" data-admission-session-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Edit</button>
                  <button class="portal-class-button ${entry.status === "open" ? "is-archive" : "is-restore"}" type="button" data-admission-session-action="${entry.status === "open" ? "close" : "open"}" data-admission-session-id="${entry.id}" ${isAdmin ? "" : "disabled"}>${entry.status === "open" ? "Close session" : "Open session"}</button>
                </div>
              </article>
            `,
          )
          .join("")
      : `
          <article class="portal-class-empty">
            <strong>No admission sessions yet</strong>
            <p>Create an admission session so applications can be organized by intake cycle.</p>
          </article>
        `;

    classListTarget.innerHTML = classes.length
      ? classes
          .map(
            (entry) => `
              <article class="portal-class-card">
                <div class="portal-class-meta">
                  <div class="portal-class-meta-item"><span>Class option</span><strong>${escapeHtml(entry.name)}</strong></div>
                  <div class="portal-class-meta-item"><span>Status</span><strong>${entry.status === "active" ? "Active" : "Archived"}</strong></div>
                  <div class="portal-class-meta-item"><span>Updated</span><strong>${escapeHtml(formatTimestamp(entry.updatedAt))}</strong></div>
                </div>
                <div class="portal-class-actions">
                  <button class="portal-class-button" type="button" data-admission-class-action="edit" data-admission-class-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Edit</button>
                  <button class="portal-class-button ${entry.status === "active" ? "is-archive" : "is-restore"}" type="button" data-admission-class-action="${entry.status === "active" ? "archive" : "activate"}" data-admission-class-id="${entry.id}" ${isAdmin ? "" : "disabled"}>${entry.status === "active" ? "Archive" : "Reactivate"}</button>
                </div>
              </article>
            `,
          )
          .join("")
      : `
          <article class="portal-class-empty">
            <strong>No class options yet</strong>
            <p>Add class options that should appear in the admission workflow.</p>
          </article>
        `;

    stageListTarget.innerHTML = stages.length
      ? stages
          .map(
            (entry) => `
              <article class="portal-class-card">
                <div class="portal-class-meta">
                  <div class="portal-class-meta-item"><span>Order</span><strong>${entry.order}</strong></div>
                  <div class="portal-class-meta-item"><span>Stage</span><strong>${escapeHtml(entry.name)}</strong></div>
                  <div class="portal-class-meta-item"><span>Status</span><strong>${entry.status === "active" ? "Active" : "Archived"}</strong></div>
                </div>
                <div class="portal-class-actions">
                  <button class="portal-class-button" type="button" data-admission-stage-action="edit" data-admission-stage-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Edit</button>
                  <button class="portal-class-button ${entry.status === "active" ? "is-archive" : "is-restore"}" type="button" data-admission-stage-action="${entry.status === "active" ? "archive" : "activate"}" data-admission-stage-id="${entry.id}" ${isAdmin ? "" : "disabled"}>${entry.status === "active" ? "Archive" : "Reactivate"}</button>
                </div>
              </article>
            `,
          )
          .join("")
      : `
          <article class="portal-class-empty">
            <strong>No stages configured</strong>
            <p>Add the stages your admissions team uses for screening and approval.</p>
          </article>
        `;
  }

  function getTermLabelFromCycle(cycleState, termId) {
    const target = (cycleState?.terms || []).find((term) => term.id === termId);
    if (!target) {
      return "Unmapped period";
    }
    const periodLabel = target.periodType === "semester" ? "Semester" : "Term";
    return `${periodLabel}: ${target.name}`;
  }

  function getSessionLabelFromCycle(cycleState, sessionId) {
    const target = (cycleState?.sessions || []).find((session) => session.id === sessionId);
    return target ? target.name : "Unmapped session";
  }

  function getPortalTimetableSlotKey(record = {}) {
    return [
      String(record.name || "").trim().toLowerCase(),
      String(record.startTime || "").trim(),
      String(record.endTime || "").trim(),
    ].join("|");
  }

  function portalTimetableWeekTypesOverlap(left, right) {
    const normalizedLeft = String(left || "all").trim() || "all";
    const normalizedRight = String(right || "all").trim() || "all";
    return normalizedLeft === "all" || normalizedRight === "all" || normalizedLeft === normalizedRight;
  }

  function getPortalTimetableSlotRows(activePeriods = [], days = []) {
    return Array.from(
      activePeriods
        .filter((period) => days.includes(period.day))
        .reduce((rows, period) => {
          const key = getPortalTimetableSlotKey(period);
          if (!rows.has(key)) {
            rows.set(key, {
              key,
              name: period.name,
              startTime: period.startTime,
              endTime: period.endTime,
              sortOrder: period.sortOrder,
              byDay: new Map(),
            });
          }
          rows.get(key).byDay.set(period.day, period);
          return rows;
        }, new Map())
        .values(),
    ).sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
      return left.startTime.localeCompare(right.startTime);
    });
  }

  function getPortalTimetableClassGroups(entries = [], criteria = {}) {
    const selectedSessionId = String(criteria.sessionId || "").trim();
    const selectedTermId = String(criteria.termId || "").trim();
    const selectedWeekType = String(criteria.weekType || "all").trim() || "all";
    const groups = new Map();

    entries
      .filter((entry) => {
        const sessionMatches = !selectedSessionId || entry.sessionId === selectedSessionId;
        const termMatches = !selectedTermId || entry.termId === selectedTermId;
        const weekMatches = portalTimetableWeekTypesOverlap(entry.weekType, selectedWeekType);
        return entry.status !== "archived" && sessionMatches && termMatches && weekMatches;
      })
      .forEach((entry) => {
        const key = [
          entry.sessionId || "",
          entry.termId || "",
          String(entry.classId || "").trim() || String(entry.classLevel || "").trim().toLowerCase(),
        ].join("|");
        if (!groups.has(key)) {
          groups.set(key, {
            key,
            classId: entry.classId || "",
            classLevel: entry.classLevel,
            sessionId: entry.sessionId,
            termId: entry.termId,
            rows: [],
          });
        }
        groups.get(key).rows.push(entry);
      });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        rows: group.rows.sort((left, right) => {
          const dayComparison = String(left.day || "").localeCompare(String(right.day || ""));
          if (dayComparison !== 0) return dayComparison;
          return String(left.startTime || "").localeCompare(String(right.startTime || ""));
        }),
        isPublished: group.rows.length > 0 && group.rows.every((row) => row.status === "published"),
      }))
      .sort((left, right) => left.classLevel.localeCompare(right.classLevel, undefined, { numeric: true }));
  }

  function renderPortalTimetablePrintSheet({
    schoolName = "School",
    classLevel = "Class",
    sessionName = "",
    termName = "",
    weekType = "all",
    days = [],
    slotRows = [],
    entries = [],
  } = {}) {
    const entryByPeriod = new Map(entries.map((entry) => [entry.periodId, entry]));
    const periodLabel = [sessionName, termName, weekType === "all" ? "Every week" : `Week ${weekType}`]
      .filter(Boolean)
      .join(" - ");

    return `
      <section class="portal-timetable-print-sheet">
        <header class="portal-timetable-print-head">
          <h1>${escapeHtml(schoolName)}</h1>
          <h2>${escapeHtml(classLevel)} Timetable</h2>
          <p>${escapeHtml(periodLabel || "Academic timetable")}</p>
        </header>
        <div class="portal-timetable-print-wrap">
          <table class="portal-timetable-print-grid">
            <thead>
              <tr>
                <th>Period</th>
                ${days.map((day) => `<th>${escapeHtml(day)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${
                slotRows.length
                  ? slotRows
                      .map(
                        (slot) => `
                          <tr>
                            <th>
                              <strong>${escapeHtml(slot.name)}</strong>
                              <span>${escapeHtml(slot.startTime)}-${escapeHtml(slot.endTime)}</span>
                            </th>
                            ${days
                              .map((day) => {
                                const period = slot.byDay.get(day);
                                const entry = period ? entryByPeriod.get(period.id) : null;
                                return `
                                  <td>
                                    ${
                                      entry
                                        ? `<strong>${escapeHtml(entry.subject)}</strong>
                                           <span>${escapeHtml(entry.teacher || "Teacher not assigned")}</span>`
                                        : `<span class="portal-timetable-print-empty">Free</span>`
                                    }
                                  </td>
                                `;
                              })
                              .join("")}
                          </tr>
                        `,
                      )
                      .join("")
                  : `<tr><td colspan="${days.length + 1}">No periods configured yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderTimetableSection({ isAdmin, manager, summaryTarget, listTarget, context = {} }) {
    if (!summaryTarget || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Timetable unavailable</span>
          <strong>0</strong>
          <p>The timetable manager could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }

    const {
      entries,
      publishedCount,
      draftCount,
      archivedCount,
      classCount,
      teacherCount,
      activePeriods,
      substitutions,
    } = manager.summarize();
    const cycleManager = getAcademicCycleManager();
    const cycleState = cycleManager && typeof cycleManager.getState === "function"
      ? cycleManager.getState()
      : { sessions: [], terms: [] };
    const days = manager.schoolDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const viewMode = context.viewMode === "teacher" ? "teacher" : "class";
    const selectedClass = context.classRecord || null;
    const selectedTeacher = context.teacherRecord || null;
    const selectedSessionId = String(context.sessionId || "").trim();
    const selectedTermId = String(context.termId || "").trim();
    const selectedWeekType = String(context.weekType || "all").trim() || "all";
    const selectedSessionName = getSessionLabelFromCycle(cycleState, selectedSessionId);
    const selectedTermName = getTermLabelFromCycle(cycleState, selectedTermId);
    const teacherLoad = selectedTeacher && typeof manager.getTeacherLoad === "function"
      ? manager.getTeacherLoad({
          teacherId: selectedTeacher.id,
          teacher: selectedTeacher.name,
          termId: selectedTermId,
          weekType: selectedWeekType,
        })
      : { count: 0, entries: [] };
    const teacherMax = selectedTeacher?.maxPeriodsPerWeek || 24;
    const selectedClassLabel = selectedClass ? getClassDisplayName(selectedClass) : "";
    const visibleEntries = entries.filter((entry) => {
      const termMatches = !selectedTermId || entry.termId === selectedTermId;
      const weekMatches =
        selectedWeekType === "all" ||
        entry.weekType === "all" ||
        entry.weekType === selectedWeekType;
      const scopeMatches =
        viewMode === "teacher"
          ? selectedTeacher && (entry.teacherId === selectedTeacher.id || entry.teacher === selectedTeacher.name)
          : selectedClass &&
            (entry.classId
              ? entry.classId === selectedClass.id
              : String(entry.classLevel || "").trim().toLowerCase() === selectedClassLabel.toLowerCase());
      return entry.status !== "archived" && termMatches && weekMatches && scopeMatches;
    });
    const entryByPeriod = new Map(visibleEntries.map((entry) => [entry.periodId, entry]));
    const slotRows = getPortalTimetableSlotRows(activePeriods, days);
    const classTimetableGroups = getPortalTimetableClassGroups(entries, {
      sessionId: selectedSessionId,
      termId: selectedTermId,
      weekType: selectedWeekType,
    });
    const setupMessages = [];
    const canAssignSlots = Boolean(isAdmin && selectedSessionId && selectedTermId && selectedClass);

    if (!selectedSessionId) setupMessages.push(`Create or select a session from <a href="./admin-settings-academic.html">Sessions and Terms</a>.`);
    if (!selectedTermId) setupMessages.push(`Create or select a term or semester before assigning timetable slots.`);
    if (!selectedClass) setupMessages.push(`Select a class before adding lessons to the timetable grid.`);
    if (!context.teachers?.length) setupMessages.push(`Create teacher accounts before assigning lessons.`);

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Lessons</span>
        <strong>${entries.filter((entry) => entry.status !== "archived").length}</strong>
        <p>Active timetable lessons across all views.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Published</span>
        <strong>${publishedCount}</strong>
        <p>Lessons visible to staff, students, and parents.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-amber">
        <span>Draft</span>
        <strong>${draftCount}</strong>
        <p>Rows awaiting publish action.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Classes covered</span>
        <strong>${classCount}</strong>
        <p>Unique classes with timetable rows.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-slate">
        <span>Teachers</span>
        <strong>${teacherCount}</strong>
        <p>Teachers with at least one active lesson.</p>
      </article>
      <article class="portal-class-stat">
        <span>Periods</span>
        <strong>${activePeriods.length}</strong>
        <p>Editable time slots available across school days.</p>
      </article>
    `;

    listTarget.innerHTML = `
      ${setupMessages.length ? `<div class="auth-status auth-status--info portal-timetable-setup">${setupMessages.join(" ")}</div>` : ""}
      <section class="portal-timetable-context">
        <div>
          <strong>${viewMode === "teacher" ? escapeHtml(selectedTeacher?.name || "Teacher grid") : escapeHtml(selectedClassLabel || "Select a class")}</strong>
          <span>${escapeHtml(selectedSessionName)} - ${escapeHtml(selectedTermName)} - ${selectedWeekType === "all" ? "Every week" : `Week ${escapeHtml(selectedWeekType)}`}</span>
        </div>
        <div>
          <strong>${viewMode === "teacher" ? `${teacherLoad.count}/${teacherMax}` : visibleEntries.length}</strong>
          <span>${viewMode === "teacher" && selectedTeacher ? "teacher workload" : "lessons in this class grid"}</span>
        </div>
      </section>
      <div class="portal-timetable-grid" style="--timetable-day-count:${days.length}">
        <div class="portal-timetable-grid-corner">Period</div>
        ${days.map((day) => `<div class="portal-timetable-day-head">${escapeHtml(day.slice(0, 3))}</div>`).join("")}
        ${
          slotRows.length
            ? slotRows
                .map(
                  (slot) => `
                    <div class="portal-timetable-period-label">
                      <div>
                        <strong>${escapeHtml(slot.name)}</strong>
                        <span>${escapeHtml(slot.startTime)}-${escapeHtml(slot.endTime)}</span>
                      </div>
                      <button class="portal-timetable-period-edit" type="button" data-timetable-period-edit data-timetable-period-ids="${escapeHtml(Array.from(slot.byDay.values()).map((period) => period.id).join(","))}" data-timetable-period-name="${escapeHtml(slot.name)}" data-timetable-period-start="${escapeHtml(slot.startTime)}" data-timetable-period-end="${escapeHtml(slot.endTime)}" data-timetable-period-sort="${escapeHtml(String(slot.sortOrder || ""))}" ${isAdmin ? "" : "disabled"}>Edit</button>
                    </div>
                    ${days
                      .map((day) => {
                        const period = slot.byDay.get(day);
                        const entry = period ? entryByPeriod.get(period.id) : null;
                        return `
                          <button class="portal-timetable-slot ${entry ? "has-entry" : ""}" type="button" data-timetable-slot data-timetable-period-id="${escapeHtml(period?.id || "")}" data-timetable-entry-id="${escapeHtml(entry?.id || "")}" ${!period || !canAssignSlots ? "disabled" : ""}>
                            ${
                              entry
                                ? `<span class="portal-timetable-entry-subject">${escapeHtml(entry.subject)}</span>
                                   <span>${escapeHtml(viewMode === "teacher" ? entry.classLevel : entry.teacher)}</span>
                                   <span>${entry.weekType === "all" ? "Every week" : `Week ${escapeHtml(entry.weekType)}`}</span>
                                   <span class="portal-class-status ${entry.status === "published" ? "is-active" : "is-archived"}">${escapeHtml(entry.status)}</span>`
                                : `<span class="portal-timetable-empty-slot">${selectedClass ? "Add lesson" : "Select class first"}</span>`
                            }
                          </button>
                        `;
                      })
                      .join("")}
                  `,
                )
                .join("")
            : `<div class="portal-timetable-grid-empty">No periods configured yet.</div>`
        }
      </div>
      <section class="portal-timetable-footer-panels">
        <article class="portal-class-card portal-timetable-panel">
          <div class="portal-class-card-head">
            <div class="portal-class-title">
              <strong>Class timetables</strong>
              <span>${classTimetableGroups.length} class${classTimetableGroups.length === 1 ? "" : "es"} with recorded lessons</span>
            </div>
          </div>
          <div class="portal-timetable-entry-list">
            ${
              classTimetableGroups.length
                ? classTimetableGroups
                    .map(
                      (group) => `
                        <div class="portal-timetable-entry-row portal-timetable-class-row">
                          <span>
                            <strong>${escapeHtml(group.classLevel)}</strong>
                            ${group.isPublished ? "Saved timetable" : "Draft timetable"}
                          </span>
                          <span>${group.rows.length} lesson${group.rows.length === 1 ? "" : "s"}</span>
                          <span>${escapeHtml(getTermLabelFromCycle(cycleState, group.termId))}</span>
                          <span class="portal-timetable-row-actions">
                            <button class="portal-class-button" type="button" data-timetable-class-action="view" data-timetable-session-id="${escapeHtml(group.sessionId)}" data-timetable-term-id="${escapeHtml(group.termId)}" data-timetable-class-id="${escapeHtml(group.classId || "")}" data-timetable-class="${escapeHtml(group.classLevel)}">View</button>
                            <button class="portal-class-button" type="button" data-timetable-class-action="print" data-timetable-session-id="${escapeHtml(group.sessionId)}" data-timetable-term-id="${escapeHtml(group.termId)}" data-timetable-class-id="${escapeHtml(group.classId || "")}" data-timetable-class="${escapeHtml(group.classLevel)}">Print</button>
                          </span>
                        </div>
                      `,
                    )
                    .join("")
                : `<p>No class timetables have been recorded for this period yet.</p>`
            }
          </div>
        </article>
        <article class="portal-class-card portal-timetable-panel">
          <div class="portal-class-title">
            <strong>Substitution log</strong>
            <span>${substitutions.length} recent replacement${substitutions.length === 1 ? "" : "s"}</span>
          </div>
          <div class="portal-timetable-entry-list">
            ${
              substitutions.length
                ? substitutions
                    .slice(0, 6)
                    .map(
                      (entry) => `
                        <div class="portal-timetable-entry-row">
                          <span>${escapeHtml(entry.substitutionDate || "Today")}</span>
                          <span>${escapeHtml(entry.classLevel)} - ${escapeHtml(entry.subject)}</span>
                          <span>${escapeHtml(entry.originalTeacher || "Original")} -> ${escapeHtml(entry.replacementTeacher)}</span>
                        </div>
                      `,
                    )
                    .join("")
                : `<p>No substitutions logged yet.</p>`
            }
          </div>
        </article>
      </section>
      ${archivedCount ? `<p class="auth-helper-text">${archivedCount} archived timetable lesson${archivedCount === 1 ? "" : "s"} retained for audit history.</p>` : ""}
    `;
  }

  function renderFeeManagementSection({ isAdmin, manager, summaryTarget, listTarget, selectedCategory = FEE_CATEGORY_FALLBACK }) {
    if (!summaryTarget || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Fee tools unavailable</span>
          <strong>0</strong>
          <p>The fee item manager could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }

    const { items, activeCount, archivedCount, classCount, activeAmount, categoryCount } = manager.summarize();
    const activeItems = items.filter((item) => item.status !== "archived");
    const category = normalizeFeeCategoryKey(selectedCategory);
    const categoryLabel = getFeeCategoryLabel(category);
    const selectedItems = items.filter((item) => normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK) === category);
    const activeSelectedItems = selectedItems.filter((item) => item.status !== "archived");
    const selectedAmount = activeSelectedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const activeCategoryCount =
      categoryCount || new Set(activeItems.map((item) => normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK))).size;
    const cycleManager = getAcademicCycleManager();
    const cycleState = cycleManager && typeof cycleManager.getState === "function"
      ? cycleManager.getState()
      : { sessions: [], terms: [] };

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active fee items</span>
        <strong>${activeCount}</strong>
        <p>Fee lines currently available to billing operations.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Fee categories</span>
        <strong>${activeCategoryCount}</strong>
        <p>Active billing categories currently in use.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Classes covered</span>
        <strong>${classCount}</strong>
        <p>Unique class levels with configured fees.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-amber">
        <span>${escapeHtml(categoryLabel)} value</span>
        <strong>${escapeHtml(formatCurrencyAmount(selectedAmount))}</strong>
        <p>${archivedCount} archived item${archivedCount === 1 ? "" : "s"} retained. Total active value: ${escapeHtml(
          formatCurrencyAmount(activeAmount),
        )}.</p>
      </article>
    `;

    if (!items.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No fee items yet</strong>
          <p>Create fee items and map each to class, session, and term.</p>
        </article>
      `;
      return;
    }

    const groupedFees = items.reduce((sessions, item) => {
      const sessionLabel = getSessionLabelFromCycle(cycleState, item.sessionId);
      const termLabel = getTermLabelFromCycle(cycleState, item.termId);
      const sessionKey = item.sessionId || sessionLabel;
      const classKey = item.classLevel || "Unassigned";
      const itemCategory = normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK);
      const itemCategoryLabel = getFeeCategoryLabel(itemCategory);

      if (!sessions.has(sessionKey)) {
        sessions.set(sessionKey, {
          label: sessionLabel,
          classes: new Map(),
          items: [],
        });
      }

      const sessionGroup = sessions.get(sessionKey);
      sessionGroup.items.push(item);

      if (!sessionGroup.classes.has(classKey)) {
        sessionGroup.classes.set(classKey, {
          label: classKey,
          categories: new Map(),
          items: [],
        });
      }

      const classGroup = sessionGroup.classes.get(classKey);
      classGroup.items.push(item);

      if (!classGroup.categories.has(itemCategory)) {
        classGroup.categories.set(itemCategory, {
          key: itemCategory,
          label: itemCategoryLabel,
          terms: new Set(),
          items: [],
        });
      }

      const categoryGroup = classGroup.categories.get(itemCategory);
      categoryGroup.terms.add(termLabel);
      categoryGroup.items.push(item);
      return sessions;
    }, new Map());

    listTarget.innerHTML = Array.from(groupedFees.values())
      .map((sessionGroup) => {
        const sessionActiveTotal = sessionGroup.items
          .filter((item) => item.status !== "archived")
          .reduce((sum, item) => sum + item.amount, 0);

        return `
          <section class="portal-class-group portal-fee-session-group">
            <div class="portal-class-group-head">
              <div>
                <span>Academic year</span>
                <strong>${escapeHtml(sessionGroup.label)}</strong>
              </div>
              <small>${sessionGroup.items.length} fee item${sessionGroup.items.length === 1 ? "" : "s"} • ${escapeHtml(
                formatCurrencyAmount(sessionActiveTotal),
              )}</small>
            </div>
            <div class="portal-class-level-stack">
              ${Array.from(sessionGroup.classes.values())
                .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }))
                .map((classGroup) => {
                  const classItems = classGroup.items;
                  const classTotal = classItems
                    .filter((item) => item.status !== "archived")
                    .reduce((sum, item) => sum + item.amount, 0);
                  return `
                  <details class="portal-class-level-group portal-fee-class-details" open>
                    <summary>
                      <div>
                        <strong>${escapeHtml(classGroup.label)}</strong>
                        <span>${classGroup.categories.size} fee categor${classGroup.categories.size === 1 ? "y" : "ies"} • ${
                          classGroup.items.length
                        } item${classGroup.items.length === 1 ? "" : "s"}</span>
                      </div>
                      <small>${escapeHtml(formatCurrencyAmount(classTotal))}</small>
                    </summary>
                    <div class="portal-fee-class-stack-inner">
                      <div class="portal-fee-category-stack">
                        ${Array.from(classGroup.categories.values())
                          .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }))
                          .map((classCategory) => {
                            const categoryItems = classCategory.items.sort((left, right) => {
                              const termComparison = getTermLabelFromCycle(cycleState, left.termId).localeCompare(
                                getTermLabelFromCycle(cycleState, right.termId),
                                undefined,
                                { numeric: true },
                              );
                              if (termComparison !== 0) return termComparison;
                              return left.name.localeCompare(right.name, undefined, { numeric: true });
                            });
                            const categoryTotal = categoryItems
                              .filter((item) => item.status !== "archived")
                              .reduce((sum, item) => sum + item.amount, 0);
                            return `
                              <section class="portal-fee-class-category-group">
                                <header class="portal-fee-class-category-head">
                                  <div>
                                    <span>Category</span>
                                    <strong>${escapeHtml(classCategory.label)}</strong>
                                  </div>
                                  <small>${categoryItems.length} item${categoryItems.length === 1 ? "" : "s"} • ${escapeHtml(
                                    formatCurrencyAmount(categoryTotal),
                                  )}</small>
                                </header>
                                <div class="portal-fee-item-grid">
                                  ${categoryItems
                                    .map((item) => {
                                      const itemTermLabel = getTermLabelFromCycle(cycleState, item.termId);
                                      return `
                                        <article class="portal-class-card portal-fee-item-card ${item.status === "archived" ? "is-archived" : ""}" data-fee-action="edit" data-fee-id="${
                                        escapeHtml(item.id)
                                      }" role="button" tabindex="${isAdmin ? "0" : "-1"}" aria-label="Edit ${escapeHtml(item.name)}">
                                          <div class="portal-class-card-head">
                                            <div class="portal-class-title">
                                              <strong>${escapeHtml(item.name)}</strong>
                                              <span>${escapeHtml(item.description || `${classCategory.label} item for ${classGroup.label}`)}</span>
                                            </div>
                                            <span class="portal-class-status ${item.status === "archived" ? "is-archived" : "is-active"}">
                                              ${item.status === "archived" ? "Archived" : "Active"}
                                            </span>
                                          </div>
                                          <div class="portal-class-meta">
                                            <div class="portal-class-meta-item"><span>Amount</span><strong>${escapeHtml(formatCurrencyAmount(item.amount))}</strong></div>
                                            <div class="portal-class-meta-item"><span>Period</span><strong>${escapeHtml(itemTermLabel)}</strong></div>
                                            <div class="portal-class-meta-item"><span>Due Date</span><strong>${escapeHtml(item.dueDate || "Not set")}</strong></div>
                                          </div>
                                          <div class="portal-fee-card-foot">
                                            <span>Click to edit or archive</span>
                                          </div>
                                        </article>
                                      `;
                                    })
                                    .join("")}
                                </div>
                              </section>
                            `;
                          })
                          .join("")}
                      </div>
                    </div>
                  </details>
                `;
                })
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderPortalStudentManagementSection({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
    classFiltersTarget = null,
    selectedClass = "all",
    searchQuery = "",
    expandedClassTokens = null,
  }) {
    if (!summaryTarget || !form || !listTarget) {
      return;
    }

    if (!manager) {
      summaryTarget.innerHTML = `
        <article class="portal-class-stat">
          <span>Student tools unavailable</span>
          <strong>0</strong>
          <p>The shared student registry could not be loaded on this page.</p>
        </article>
      `;
      listTarget.innerHTML = "";
      return;
    }

    const {
      students,
      activeCount,
      archivedCount,
      transferredCount,
      guardianContacts,
      studentsWithMultipleGuardians,
    } =
      manager.summarize();

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active students</span>
        <strong>${activeCount}</strong>
        <p>Students currently available for class and attendance operations.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Guardian contacts</span>
        <strong>${guardianContacts}</strong>
        <p>Total guardian contact entries linked to active students.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Multiple guardians</span>
        <strong>${studentsWithMultipleGuardians}</strong>
        <p>Students with more than one guardian relationship on file.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Transferred out</span>
        <strong>${transferredCount || 0}</strong>
        <p>Students moved out of this school workspace.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Archived students</span>
        <strong>${archivedCount || 0}</strong>
        <p>Inactive records retained for historical continuity.</p>
      </article>
    `;

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });

    const normalizedSearch = String(searchQuery || "").trim().toLowerCase();
    const normalizedSelectedClass = normalizeLevelToken(selectedClass === "all" ? "" : selectedClass);
    const classLevels = Array.from(
      new Set(
        students
          .map((record) => String(record.level || "").trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    if (classFiltersTarget) {
      const classButtons = [
        `<button class="portal-student-class-filter ${selectedClass === "all" ? "is-active" : ""}" type="button" data-student-class="all">All classes</button>`,
        ...classLevels.map(
          (level) => `
            <button class="portal-student-class-filter ${
              normalizeLevelToken(level) === normalizeLevelToken(selectedClass) ? "is-active" : ""
            }" type="button" data-student-class="${escapeHtml(level)}">${escapeHtml(level)}</button>
          `,
        ),
      ];
      classFiltersTarget.innerHTML = classButtons.join("");
    }

    const filteredStudents = students.filter((record) => {
      const classMatches =
        !normalizedSelectedClass || normalizeLevelToken(record.level) === normalizedSelectedClass;

      if (!classMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const guardians = Array.isArray(record.guardians) ? record.guardians : [];
      const guardianText = guardians
        .map((guardian) => `${guardian.name || ""} ${guardian.email || ""} ${guardian.phone || ""}`)
        .join(" ");
      const searchableText = [
        record.fullName,
        record.firstName,
        record.lastName,
        record.level,
        record.admissionNo,
        record.gender,
        record.promotionDecision,
        guardianText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });

    if (!filteredStudents.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No student records match this filter</strong>
          <p>Try another class option or search keyword (student name, class, admission number, or guardian details).</p>
        </article>
      `;
    } else {
      const groups = filteredStudents.reduce((map, record) => {
        const level = record.level || "Unassigned";
        if (!map.has(level)) {
          map.set(level, []);
        }
        map.get(level).push(record);
        return map;
      }, new Map());

      listTarget.innerHTML = Array.from(groups.entries())
        .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
        .map(([level, records], groupIndex) => {
          const levelToken = normalizeLevelToken(level) || `group-${groupIndex + 1}`;
          const isExpanded = expandedClassTokens instanceof Set ? expandedClassTokens.has(levelToken) : false;
          return `
            <section class="portal-student-group">
              <header class="portal-student-group-head">
                <div class="portal-student-group-title">
                  <h3>${escapeHtml(level)}</h3>
                  <span>${records.length} student${records.length === 1 ? "" : "s"}</span>
                </div>
                <button
                  class="portal-student-group-toggle"
                  type="button"
                  data-student-class-toggle="${escapeHtml(levelToken)}"
                  aria-expanded="${isExpanded ? "true" : "false"}"
                  aria-label="${isExpanded ? "Collapse class list" : "Expand class list"}"
                >
                  <span class="portal-student-group-toggle-arrow" aria-hidden="true">${isExpanded ? "▴" : "▾"}</span>
                </button>
              </header>
              <div class="portal-student-group-list" ${isExpanded ? "" : "hidden"}>
                ${records
                  .map(
                    (record) => {
                      const isArchived = record.status === "archived";
                      const isTransferred = record.status === "transferred";
                      const statusClass = isArchived || isTransferred ? "is-archived" : "is-active";
                      const statusLabel = isArchived
                        ? "Archived"
                        : isTransferred
                          ? "Transferred"
                          : "Active";
                      const documentCount = Array.isArray(record.documents) ? record.documents.length : 0;
                      const manageDocsAction = `
                        <button
                          class="portal-class-button"
                          type="button"
                          data-student-action="manage-docs"
                          data-student-id="${record.id}"
                        >
                          Documents
                        </button>
                      `;
                      const adminActions = !isAdmin
                        ? ""
                        : isArchived || isTransferred
                          ? `
                            ${manageDocsAction}
                            <button
                              class="portal-class-button is-restore"
                              type="button"
                              data-student-action="activate"
                              data-student-id="${record.id}"
                            >
                              Reactivate
                            </button>
                          `
                          : `
                            ${manageDocsAction}
                            <button
                              class="portal-class-button"
                              type="button"
                              data-student-action="edit"
                              data-student-id="${record.id}"
                            >
                              Edit
                            </button>
                            <button
                              class="portal-class-button"
                              type="button"
                              data-student-action="promote"
                              data-student-id="${record.id}"
                            >
                              Promote
                            </button>
                            <button
                              class="portal-class-button"
                              type="button"
                              data-student-action="mark-repeat"
                              data-student-id="${record.id}"
                            >
                              Set Repeat
                            </button>
                            <button
                              class="portal-class-button"
                              type="button"
                              data-student-action="mark-resit"
                              data-student-id="${record.id}"
                            >
                              Set Resit
                            </button>
                            <button
                              class="portal-class-button is-archive"
                              type="button"
                              data-student-action="transfer"
                              data-student-id="${record.id}"
                            >
                              Transfer Out
                            </button>
                            <button
                              class="portal-class-button is-archive"
                              type="button"
                              data-student-action="archive"
                              data-student-id="${record.id}"
                            >
                              Archive
                            </button>
                          `;
                      return `
                      <article class="portal-student-row ${record.status === "archived" || record.status === "transferred" ? "is-archived" : ""}">
                        <button
                          class="portal-student-row-main"
                          type="button"
                          data-student-action="view"
                          data-student-id="${record.id}"
                        >
                          <div class="portal-student-row-copy">
                            <strong>${escapeHtml(record.fullName)}</strong>
                            <span>Admission ${escapeHtml(record.admissionNo)} • ${record.guardians.length} guardian contact${
                              record.guardians.length === 1 ? "" : "s"
                            }</span>
                            <span>Session close: ${escapeHtml(
                              record.promotionDecision === "repeat"
                                ? "Repeat class"
                                : record.promotionDecision === "resit"
                                  ? "Resit required"
                                  : "Auto promote",
                            )}</span>
                            <span>${documentCount} document${documentCount === 1 ? "" : "s"}</span>
                          </div>
                          <span class="portal-class-status ${statusClass}">${statusLabel}</span>
                        </button>
                        <div class="portal-class-actions">
                          ${adminActions}
                        </div>
                      </article>
                    `;
                    },
                  )
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("");
    }

    if (!isAdmin) {
      setStatus(
        status,
        "info",
        "Only admin accounts with student permission can create, edit, promote, queue repeat/resit, transfer, archive, or reactivate student records.",
      );
    }
  }

  function backfillGuardianAccessFromStudents(manager) {
    if (!manager || typeof manager.getStudents !== "function") {
      return 0;
    }

    const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
    const grants = getAccessGrants({ workspaceId });
    const existingGrantEmails = new Set(grants.map((entry) => normalizeEmail(entry.email || "")));
    let createdCount = 0;

    manager.getStudents().forEach((student) => {
      const guardians = Array.isArray(student?.guardians) ? student.guardians : [];

      guardians.forEach((guardian) => {
        const email = String(guardian?.email || "").trim();

        if (!email || !EMAIL_REGEX.test(email)) {
          return;
        }

        const normalizedEmail = normalizeEmail(email);

        if (existingGrantEmails.has(normalizedEmail)) {
          return;
        }

        upsertAccessGrant(
          {
            email,
            role: "Parent",
            authMethod: "any",
            status: "active",
          },
          workspaceId,
        );
        existingGrantEmails.add(normalizedEmail);
        createdCount += 1;
      });
    });

    return createdCount;
  }

  function clearPortalStudentErrors(form) {
    form.querySelectorAll(".portal-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-student-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalStudentError(form, fieldName, message) {
    const error = form.querySelector(`[data-student-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.classList.add("is-invalid");
    }
  }

  function normalizePhoneValue(value) {
    return String(value || "").trim();
  }

  function isValidPhoneNumber(value) {
    const digits = normalizePhoneValue(value).replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function normalizeLevelToken(value) {
    const token = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const juniorSecondaryMatch = token.match(/(?:juniorsecondaryschool|jss)([1-3])/);
    if (juniorSecondaryMatch) {
      return `jss${juniorSecondaryMatch[1]}`;
    }

    const seniorSecondaryMatch = token.match(/(?:seniorsecondaryschool|sss|ss)([1-3])/);
    if (seniorSecondaryMatch) {
      return `sss${seniorSecondaryMatch[1]}`;
    }

    const romanLevelMap = { i: "1", ii: "2", iii: "3" };
    const higherDiplomaMatch = token.match(/^(nd|hnd|nce)(i{1,3}|[1-3])$/);
    if (higherDiplomaMatch) {
      return `${higherDiplomaMatch[1]}${romanLevelMap[higherDiplomaMatch[2]] || higherDiplomaMatch[2]}`;
    }

    return token;
  }

  function getTodayDateValue() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function normalizeAttendanceStatus(value) {
    const normalized = String(value || "present").trim().toLowerCase();
    return ATTENDANCE_STATUSES.includes(normalized) ? normalized : "present";
  }

  function getAttendanceStatusLabel(value) {
    const status = normalizeAttendanceStatus(value);
    if (status === "late") return "Late";
    if (status === "absent") return "Absent";
    if (status === "excused") return "Excused";
    return "Present";
  }

  function getAttendanceStatusClass(value) {
    return `is-${normalizeAttendanceStatus(value)}`;
  }

  function getActiveStudentsForClass(classRecord = {}) {
    const studentManager = getStudentManager();
    const students =
      studentManager && typeof studentManager.getStudents === "function"
        ? studentManager.getStudents()
        : [];
    const classTokens = [
      normalizeLevelToken(classRecord.level),
      normalizeLevelToken(classRecord.name),
      normalizeLevelToken(`${classRecord.level || ""} ${classRecord.name || ""}`),
    ].filter(Boolean);

    return students.filter((student) => {
      if (student.status !== "active") {
        return false;
      }

      const studentToken = normalizeLevelToken(student.level);
      return classTokens.includes(studentToken);
    });
  }

  function getClassDisplayName(classRecord = {}) {
    const level = String(classRecord.level || "").trim();
    const name = String(classRecord.name || "").trim();

    if (level && name && normalizeLevelToken(level) !== normalizeLevelToken(name)) {
      return `${level} ${name.replace(/^Arm\s+/i, "")}`.trim();
    }

    return level || name || "Class";
  }

  function getTeacherAssignedClasses(user = {}) {
    const classManager = getClassManager();
    const courseManager = getCourseManager();
    const teacherEmail = normalizeEmail(user.email || "");
    const teacherName = String(user.displayName || user.email || "").trim().toLowerCase();
    const classes =
      classManager && typeof classManager.getClasses === "function"
        ? classManager.getClasses().filter((record) => record.status !== "archived")
        : [];
    const courses =
      courseManager && typeof courseManager.getCourses === "function"
        ? courseManager.getCourses().filter((record) => record.status !== "archived")
        : [];
    const courseLevelTokens = new Set(
      courses
        .filter((course) =>
          (course.teacherAssignments || []).some((teacher) => {
            const value = String(teacher || "").trim();
            return normalizeEmail(value) === teacherEmail || value.toLowerCase() === teacherName;
          }),
        )
        .map((course) => normalizeLevelToken(course.level))
        .filter(Boolean),
    );
    const assigned = classes.filter((classRecord) => {
      const classTeacher = String(classRecord.classTeacher || "").trim();
      const isClassTeacher =
        normalizeEmail(classTeacher) === teacherEmail || classTeacher.toLowerCase() === teacherName;
      const hasSubjectAssignment = (classRecord.teacherAssignments || []).some((assignment) => {
        const assignmentTeacher = String(assignment?.teacher || "").trim();
        return normalizeEmail(assignmentTeacher) === teacherEmail || assignmentTeacher.toLowerCase() === teacherName;
      });
      const hasCourseAssignment = courseLevelTokens.has(normalizeLevelToken(classRecord.level));

      return isClassTeacher || hasSubjectAssignment || hasCourseAssignment;
    });
    const seen = new Set();

    return assigned.filter((classRecord) => {
      const key = classRecord.id || `${classRecord.level}:${classRecord.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function getAttendanceRecordEntryMap(record = null) {
    return new Map(
      (record?.entries || []).map((entry) => [
        String(entry.studentId || "").trim(),
        {
          status: normalizeAttendanceStatus(entry.status),
          note: String(entry.note || "").trim(),
        },
      ]),
    );
  }

  function summarizeAttendanceForStudents(students = [], records = []) {
    const latestEntryByStudent = new Map();

    records.forEach((record) => {
      (record.entries || []).forEach((entry) => {
        latestEntryByStudent.set(entry.studentId, {
          ...entry,
          classId: record.classId,
          className: record.className,
          level: record.level,
          submittedByName: record.submittedByName,
          submittedByEmail: record.submittedByEmail,
          takenAt: record.takenAt,
        });
      });
    });

    return students.reduce(
      (summary, student) => {
        const entry = latestEntryByStudent.get(student.id);
        const status = entry?.status || "unmarked";
        summary.counts[status] = (summary.counts[status] || 0) + 1;
        summary.rows.push({ student, entry, status });
        return summary;
      },
      {
        counts: { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 },
        rows: [],
      },
    );
  }

  function getActiveClassLevelTokenSet() {
    const classManager = window.SchoolSphereClasses;
    const set = new Set();

    getConfiguredStudentLevelOptions().forEach((level) => {
      const token = normalizeLevelToken(level);
      if (token) {
        set.add(token);
      }
    });

    if (!classManager || typeof classManager.getClasses !== "function") {
      return set;
    }

    return classManager.getClasses().reduce((tokens, record) => {
      if (record.status === "archived") {
        return tokens;
      }

      if (
        inferSchoolTypeFromLevel(record.level) === "higher" &&
        !isConfiguredHigherInstitutionLevel(record.level)
      ) {
        return tokens;
      }

      const recordTokens = [
        normalizeLevelToken(record.level),
        normalizeLevelToken(record.name),
        normalizeLevelToken(`${record.level || ""} ${record.name || ""}`),
      ].filter(Boolean);
      recordTokens.forEach((token) => tokens.add(token));
      return tokens;
    }, set);
  }

  function isKnownClassLevel(levelValue, tokenSet) {
    const levelToken = normalizeLevelToken(levelValue);
    if (!levelToken || !(tokenSet instanceof Set) || tokenSet.size === 0) {
      return true;
    }
    return tokenSet.has(levelToken);
  }

  function getSchoolAcronymForAdmission() {
    const settingsManager = getSchoolSettingsManager();
    const schoolName = settingsManager?.getSettings?.().schoolName || "SchoolSphere";
    const words = schoolName
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter(Boolean);

    if (words.length >= 2) {
      return words
        .slice(0, 3)
        .map((word) => word.charAt(0))
        .join("");
    }

    const fallback = (words[0] || "schoolsphere").slice(0, 3);
    return fallback.padEnd(3, "x");
  }

  function buildAdmissionPrefix(levelValue) {
    const schoolAcronym = getSchoolAcronymForAdmission();
    const yearCode = String(new Date().getFullYear()).slice(-2);
    const levelCode = normalizeLevelToken(levelValue) || "general";
    return `${schoolAcronym}${yearCode}/${levelCode}`;
  }

  function generateAdmissionNumber({
    manager,
    levelValue,
    excludeStudentId,
    takenAdmissions,
  }) {
    const prefix = buildAdmissionPrefix(levelValue);
    const used = new Set();

    if (takenAdmissions instanceof Set) {
      takenAdmissions.forEach((value) => used.add(String(value || "").toLowerCase()));
    }

    if (manager && typeof manager.getStudents === "function") {
      manager.getStudents().forEach((student) => {
        if (excludeStudentId && student.id === excludeStudentId) {
          return;
        }
        if (student.admissionNo) {
          used.add(String(student.admissionNo).toLowerCase());
        }
      });
    }

    let highestSequence = 0;
    const prefixLower = `${prefix.toLowerCase()}/`;
    used.forEach((entry) => {
      if (!entry.startsWith(prefixLower)) {
        return;
      }
      const maybeSequence = Number(entry.slice(prefixLower.length));
      if (Number.isFinite(maybeSequence) && maybeSequence > highestSequence) {
        highestSequence = maybeSequence;
      }
    });

    let nextSequence = highestSequence + 1;
    let candidate = `${prefix}/${String(nextSequence).padStart(3, "0")}`;
    while (used.has(candidate.toLowerCase())) {
      nextSequence += 1;
      candidate = `${prefix}/${String(nextSequence).padStart(3, "0")}`;
    }

    return candidate.toLowerCase();
  }

  function resolveGuardianRelationshipFields(row) {
    const relationshipType =
      row.querySelector('[data-guardian-field="relationshipType"]')?.value.trim() || "";
    const relationshipOther =
      row.querySelector('[data-guardian-field="relationshipOther"]')?.value.trim() || "";
    const relationship =
      relationshipType === "Other" ? relationshipOther : relationshipType;

    return {
      relationshipType,
      relationshipOther,
      relationship,
    };
  }

  function updateGuardianRelationshipCustomField(row) {
    if (!row) {
      return;
    }

    const relationshipTypeControl = row.querySelector('[data-guardian-field="relationshipType"]');
    const relationshipOtherControl = row.querySelector('[data-guardian-field="relationshipOther"]');

    if (!(relationshipTypeControl instanceof HTMLSelectElement) || !(relationshipOtherControl instanceof HTMLInputElement)) {
      return;
    }

    const isOther = relationshipTypeControl.value === "Other";
    relationshipOtherControl.classList.toggle("is-hidden", !isOther);
    relationshipOtherControl.disabled = !isOther;

    if (!isOther) {
      relationshipOtherControl.value = "";
    }
  }

  function appendGuardianRow(container, guardian = {}, isAdmin = true) {
    if (!container) {
      return;
    }

    const relationshipValue = String(guardian.relationship || "").trim();
    const hasPresetRelationship = GUARDIAN_RELATIONSHIP_TYPES
      .filter((type) => type !== "Other")
      .some((type) => type.toLowerCase() === relationshipValue.toLowerCase());
    const selectedRelationshipType = relationshipValue
      ? hasPresetRelationship
        ? GUARDIAN_RELATIONSHIP_TYPES.find(
            (type) => type.toLowerCase() === relationshipValue.toLowerCase(),
          ) || ""
        : "Other"
      : "";
    const customRelationship = selectedRelationshipType === "Other" ? relationshipValue : "";
    const relationshipOptions = [
      '<option value="">Relationship type</option>',
      ...GUARDIAN_RELATIONSHIP_TYPES.map(
        (type) =>
          `<option value="${escapeHtml(type)}" ${
            selectedRelationshipType === type ? "selected" : ""
          }>${escapeHtml(type)}</option>`,
      ),
    ].join("");

    const row = document.createElement("div");
    row.className = "portal-guardian-row";
    row.dataset.guardianId = guardian.id || createId();
    row.innerHTML = `
      <input type="text" data-guardian-field="name" placeholder="Guardian name" value="${escapeHtml(
        guardian.name || "",
      )}" ${isAdmin ? "" : "disabled"} />
      <select data-guardian-field="relationshipType" ${isAdmin ? "" : "disabled"}>
        ${relationshipOptions}
      </select>
      <input
        type="text"
        data-guardian-field="relationshipOther"
        class="${selectedRelationshipType === "Other" ? "" : "is-hidden"}"
        placeholder="Enter relationship type"
        value="${escapeHtml(customRelationship)}"
        ${isAdmin && selectedRelationshipType === "Other" ? "" : "disabled"}
      />
      <input type="text" data-guardian-field="phone" placeholder="+234 800 000 0000" value="${escapeHtml(
        guardian.phone || "",
      )}" ${isAdmin ? "" : "disabled"} />
      <input type="email" data-guardian-field="email" placeholder="guardian@email.com" value="${escapeHtml(
        guardian.email || "",
      )}" ${isAdmin ? "" : "disabled"} />
      <button type="button" class="portal-guardian-remove" data-remove-guardian ${isAdmin ? "" : "disabled"}>Remove</button>
    `;
    container.appendChild(row);
    updateGuardianRelationshipCustomField(row);
  }

  function parseGuardianRows(container, options = {}) {
    const { validatePhone = false } = options;
    const rows = Array.from(container.querySelectorAll(".portal-guardian-row"));
    const guardians = [];
    let hasInvalidRow = false;
    let hasInvalidPhone = false;

    rows.forEach((row) => {
      const name = row.querySelector('[data-guardian-field="name"]')?.value.trim() || "";
      const { relationshipType, relationship } = resolveGuardianRelationshipFields(row);
      const phone = row.querySelector('[data-guardian-field="phone"]')?.value.trim() || "";
      const email = row.querySelector('[data-guardian-field="email"]')?.value.trim() || "";

      if (!name && !relationship && !phone && !email) {
        return;
      }

      if (
        !name ||
        !relationship ||
        (relationshipType === "Other" && !relationship) ||
        (!phone && !email)
      ) {
        hasInvalidRow = true;
        return;
      }

      if (validatePhone && phone && !isValidPhoneNumber(phone)) {
        hasInvalidPhone = true;
      }

      guardians.push({
        id: row.dataset.guardianId || createId(),
        name,
        relationship,
        phone,
        email,
      });
    });

    return { guardians, hasInvalidRow, hasInvalidPhone };
  }

  function resetPortalStudentForm(form, guardianList, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.studentId) {
      form.elements.studentId.value = "";
    }

    if (form.elements.admissionNo) {
      form.elements.admissionNo.dataset.autoGenerated = "false";
    }
    if (form.elements.promotionDecision) {
      form.elements.promotionDecision.value = "promote";
    }
    if (form.elements.level instanceof HTMLSelectElement) {
      renderStudentLevelSelectOptions(form.elements.level);
    }

    if (guardianList) {
      guardianList.innerHTML = "";
      appendGuardianRow(guardianList, {}, isAdmin);
    }

    const submitButton = form.querySelector("[data-student-submit]");
    const cancelButton = form.querySelector("[data-student-cancel]");

    if (submitButton) {
      submitButton.textContent = "Create student";
    }

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function populatePortalStudentForm(form, guardianList, record, isAdmin) {
    if (!form || !record) {
      return;
    }

    form.elements.studentId.value = record.id;
    form.elements.firstName.value = record.firstName || "";
    form.elements.lastName.value = record.lastName || "";
    form.elements.admissionNo.value = record.admissionNo || "";
    form.elements.admissionNo.dataset.autoGenerated = "false";
    if (form.elements.level instanceof HTMLSelectElement) {
      renderStudentLevelSelectOptions(form.elements.level, record.level || "");
    }
    form.elements.level.value = record.level || "";
    if (form.elements.dateOfBirth) {
      form.elements.dateOfBirth.value = record.dateOfBirth || "";
    }
    if (form.elements.gender) {
      form.elements.gender.value = record.gender || "";
    }
    if (form.elements.promotionDecision) {
      const decision = String(record.promotionDecision || "promote").toLowerCase();
      form.elements.promotionDecision.value =
        decision === "repeat" || decision === "resit" ? decision : "promote";
    }

    if (guardianList) {
      guardianList.innerHTML = "";
      (record.guardians || []).forEach((guardian) => {
        appendGuardianRow(guardianList, guardian, isAdmin);
      });

      if (!record.guardians || !record.guardians.length) {
        appendGuardianRow(guardianList, {}, isAdmin);
      }
    }

    const submitButton = form.querySelector("[data-student-submit]");
    const cancelButton = form.querySelector("[data-student-cancel]");

    if (submitButton) {
      submitButton.textContent = "Save changes";
    }

    if (cancelButton) {
      cancelButton.hidden = !isAdmin;
    }

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });
  }

  function normalizeImportHeader(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];

      if (character === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
        continue;
      }

      current += character;
    }

    values.push(current.trim());
    return values;
  }

  function parseCsvRows(content) {
    const lines = String(content || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((line) => line.trim().length);

    if (!lines.length) {
      return [];
    }

    const headers = parseCsvLine(lines[0]).map(normalizeImportHeader);
    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      return headers.reduce((row, header, index) => {
        row[header] = values[index] || "";
        return row;
      }, {});
    });
  }

  function parseSpreadsheetXmlRows(content) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(String(content || ""), "application/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("Unable to read this Excel file. Please use the provided template or upload CSV.");
    }

    const rowNodes = Array.from(xml.getElementsByTagName("Row"));

    if (!rowNodes.length) {
      throw new Error("No worksheet rows found. Please use the provided template or upload CSV.");
    }

    const rows = rowNodes.map((rowNode) => {
      const result = [];
      let pointer = 1;

      Array.from(rowNode.children)
        .filter((child) => child.localName === "Cell" || child.tagName.endsWith(":Cell"))
        .forEach((cellNode) => {
          const indexAttr =
            cellNode.getAttribute("ss:Index") ||
            cellNode.getAttribute("Index") ||
            cellNode.getAttributeNS("urn:schemas-microsoft-com:office:spreadsheet", "Index");

          if (indexAttr) {
            pointer = Number(indexAttr);
          }

          const dataNode =
            cellNode.querySelector("Data") ||
            cellNode.querySelector("ss\\:Data") ||
            cellNode.getElementsByTagName("Data")[0] ||
            cellNode.getElementsByTagName("ss:Data")[0];
          result[pointer - 1] = dataNode ? String(dataNode.textContent || "").trim() : "";
          pointer += 1;
        });

      return result;
    });

    const [headerRow, ...dataRows] = rows;
    const headers = (headerRow || []).map(normalizeImportHeader);
    return dataRows
      .filter((row) => row.some((cell) => String(cell || "").trim()))
      .map((row) =>
        headers.reduce((record, header, index) => {
          record[header] = String(row[index] || "").trim();
          return record;
        }, {}),
      );
  }

  function toTemplateRows() {
    return [
      [
        "first name",
        "last name",
        "admission number",
        "level/class",
        "date of birth",
        "gender",
        "parent/guardian name",
        "parent/guardian number",
        "parent/guardian email",
      ],
      [
        "Amina",
        "Yusuf",
        "csa26/jss1/001",
        "Junior Secondary School 1 (JSS1)",
        "2013-10-08",
        "Female",
        "Mary Yusuf",
        "+2348000000000",
        "mary@example.com",
      ],
    ];
  }

  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadStudentCsvTemplate() {
    const rows = toTemplateRows();
    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(value || "");
            if (/[",\n]/.test(stringValue)) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(","),
      )
      .join("\n");
    downloadTextFile("students-import-template.csv", csv, "text/csv;charset=utf-8");
  }

  function downloadStudentExcelTemplate() {
    const rows = toTemplateRows();
    const escapedRows = rows
      .map(
        (row) => `
          <Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeHtml(cell)}</Data></Cell>`).join("")}</Row>`,
      )
      .join("");
    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Students">
    <Table>
      ${escapedRows}
    </Table>
  </Worksheet>
</Workbook>`;
    downloadTextFile(
      "students-import-template.xls",
      xml,
      "application/vnd.ms-excel;charset=utf-8",
    );
  }

  function getImportFieldValue(row, aliases) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeImportHeader(alias);
      if (row[normalizedAlias] !== undefined && row[normalizedAlias] !== null) {
        return String(row[normalizedAlias]).trim();
      }
    }
    return "";
  }

  function buildStudentPayloadFromImportRow(row, manager, takenAdmissions) {
    const firstName = getImportFieldValue(row, ["first name", "firstname"]);
    const lastName = getImportFieldValue(row, ["last name", "lastname"]);
    const level = getImportFieldValue(row, ["level/class", "level class", "level"]);
    const dateOfBirth = getImportFieldValue(row, ["date of birth", "dob"]);
    const gender = getImportFieldValue(row, ["gender"]);
    const guardianName = getImportFieldValue(row, ["parent/guardian name", "guardian name", "parent name"]);
    const guardianPhone = getImportFieldValue(row, ["parent/guardian number", "guardian number", "parent number", "phone"]);
    const guardianEmail = getImportFieldValue(row, ["parent/guardian email", "guardian email", "parent email", "email"]);
    let admissionNo = getImportFieldValue(row, ["admission number", "admission no", "admission"]);

    if (!admissionNo) {
      admissionNo = generateAdmissionNumber({ manager, levelValue: level, takenAdmissions });
    }

    if (takenAdmissions instanceof Set) {
      takenAdmissions.add(admissionNo.toLowerCase());
    }

    return {
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
      admissionNo,
      level,
      dateOfBirth,
      gender,
      promotionDecision: "promote",
      examOutcome: "pass",
      guardians: guardianName
        ? [
            {
              id: createId(),
              name: guardianName,
              relationship: "Guardian",
              phone: guardianPhone,
              email: guardianEmail,
            },
          ]
        : [],
    };
  }

  function validateImportPayload(payload, manager, classLevelSet, seenAdmissions) {
    const errors = [];

    if (!payload.firstName || !payload.lastName) {
      errors.push("Missing name");
    }

    if (!payload.level) {
      errors.push("Missing level/class");
    } else if (!isKnownClassLevel(payload.level, classLevelSet)) {
      errors.push("Invalid class");
    }

    if (!payload.admissionNo) {
      errors.push("Admission number missing");
    }

    if (payload.admissionNo) {
      const admissionLower = payload.admissionNo.toLowerCase();
      const duplicateExisting = manager
        ?.getStudents?.()
        .some((record) => String(record.admissionNo || "").toLowerCase() === admissionLower);
      if (duplicateExisting || seenAdmissions.has(admissionLower)) {
        errors.push("Duplicate admission number");
      }
      seenAdmissions.add(admissionLower);
    }

    const guardian = payload.guardians[0] || null;
    if (!guardian || !guardian.name) {
      errors.push("Missing parent/guardian name");
    }

    if (guardian?.phone && !isValidPhoneNumber(guardian.phone)) {
      errors.push("Wrong phone number format");
    }

    if (!guardian?.email) {
      errors.push("Missing parent/guardian email");
    }

    if (guardian?.email && !EMAIL_REGEX.test(guardian.email)) {
      errors.push("Invalid parent/guardian email");
    }

    if (payload.dateOfBirth) {
      const parsed = new Date(payload.dateOfBirth);
      if (Number.isNaN(parsed.getTime())) {
        errors.push("Invalid date of birth");
      }
    }

    return errors;
  }

  function renderImportPreview(target, previewRows) {
    if (!target) {
      return;
    }

    if (!previewRows.length) {
      target.innerHTML = "";
      return;
    }

    const validCount = previewRows.filter((item) => !item.errors.length).length;
    const invalidCount = previewRows.length - validCount;

    target.innerHTML = `
      <div class="portal-import-summary">
        ${previewRows.length} row(s) parsed • ${validCount} valid • ${invalidCount} with errors.
      </div>
      <div class="portal-import-table-wrap">
        <table class="portal-import-table">
          <thead>
            <tr>
              <th>#</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Admission no.</th>
              <th>Level/Class</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Guardian</th>
              <th>Guardian phone</th>
              <th>Guardian email</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            ${previewRows
              .map(
                (item, index) => `
                  <tr class="${item.errors.length ? "portal-import-row-error" : ""}">
                    <td>${index + 1}</td>
                    <td>${escapeHtml(item.payload.firstName || "—")}</td>
                    <td>${escapeHtml(item.payload.lastName || "—")}</td>
                    <td>${escapeHtml(item.payload.admissionNo || "—")}</td>
                    <td>${escapeHtml(item.payload.level || "—")}</td>
                    <td>${escapeHtml(item.payload.dateOfBirth || "—")}</td>
                    <td>${escapeHtml(item.payload.gender || "—")}</td>
                    <td>${escapeHtml(item.payload.guardians[0]?.name || "—")}</td>
                    <td>${escapeHtml(item.payload.guardians[0]?.phone || "—")}</td>
                    <td>${escapeHtml(item.payload.guardians[0]?.email || "—")}</td>
                    <td>
                      ${
                        item.errors.length
                          ? `<ul class="portal-import-errors">${item.errors
                              .map((error) => `<li>${escapeHtml(error)}</li>`)
                              .join("")}</ul>`
                          : "OK"
                      }
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function getActiveStudentClassLevels() {
    const classManager = getClassManager();
    if (!classManager || typeof classManager.getClasses !== "function") {
      return [];
    }

    return Array.from(
      new Set(
        classManager
          .getClasses()
          .filter((item) => item.status !== "archived")
          .filter(
            (item) =>
              inferSchoolTypeFromLevel(item.level) !== "higher" ||
              isConfiguredHigherInstitutionLevel(item.level),
          )
          .map((item) => String(item.level || "").trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  }

  function getNextStudentLevel(currentLevel) {
    const levels = getActiveStudentClassLevels();
    const normalizedCurrent = normalizeLevelToken(currentLevel);
    if (!normalizedCurrent || !levels.length) {
      return "";
    }

    const currentIndex = levels.findIndex((level) => normalizeLevelToken(level) === normalizedCurrent);
    if (currentIndex < 0 || currentIndex >= levels.length - 1) {
      return "";
    }

    return levels[currentIndex + 1];
  }

  function appendStudentProgression(record, entry = {}) {
    const existing = Array.isArray(record?.progressionHistory) ? record.progressionHistory : [];
    return [
      ...existing,
      {
        id: createId(),
        type: String(entry.type || "updated").trim() || "updated",
        fromLevel: String(entry.fromLevel || "").trim(),
        toLevel: String(entry.toLevel || "").trim(),
        note: String(entry.note || "").trim(),
        timestamp: nowIso(),
      },
    ];
  }

  function formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) {
      return "0 B";
    }
    if (value < 1024) {
      return `${Math.round(value)} B`;
    }
    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  }

  function runAutomaticPromotionForClosedSession(sessionRecord, studentManager) {
    const summary = {
      processed: 0,
      promoted: 0,
      repeated: 0,
      resit: 0,
      retainedTopLevel: 0,
      skippedAlreadyProcessed: 0,
    };

    if (
      !sessionRecord?.id ||
      !studentManager ||
      typeof studentManager.getStudents !== "function" ||
      typeof studentManager.updateStudentProgression !== "function"
    ) {
      return summary;
    }

    const sessionId = String(sessionRecord.id || "").trim();
    const sessionLabel = String(sessionRecord.name || "session").trim();
    const activeStudents = studentManager
      .getStudents()
      .filter((student) => String(student.status || "").toLowerCase() === "active");

    activeStudents.forEach((student) => {
      if (String(student.lastPromotionSessionId || "").trim() === sessionId) {
        summary.skippedAlreadyProcessed += 1;
        return;
      }

      const rawDecision = String(student.promotionDecision || "promote").trim().toLowerCase();
      const decision = rawDecision === "repeat" || rawDecision === "resit" ? rawDecision : "promote";
      summary.processed += 1;

      if (decision === "repeat") {
        studentManager.updateStudentProgression(student.id, (current) => ({
          ...current,
          status: "active",
          examOutcome: "fail",
          promotionDecision: "promote",
          lastPromotionSessionId: sessionId,
          lastPromotionOutcome: "repeated",
          progressionHistory: appendStudentProgression(current, {
            type: "auto-repeated",
            fromLevel: current.level,
            toLevel: current.level,
            note: `Repeated automatically after ${sessionLabel} close`,
          }),
        }));
        summary.repeated += 1;
        return;
      }

      if (decision === "resit") {
        studentManager.updateStudentProgression(student.id, (current) => ({
          ...current,
          status: "active",
          examOutcome: "resit",
          promotionDecision: "promote",
          lastPromotionSessionId: sessionId,
          lastPromotionOutcome: "resit",
          progressionHistory: appendStudentProgression(current, {
            type: "auto-resit",
            fromLevel: current.level,
            toLevel: current.level,
            note: `Marked for resit automatically after ${sessionLabel} close`,
          }),
        }));
        summary.resit += 1;
        return;
      }

      const nextLevel = getNextStudentLevel(student.level);

      if (!nextLevel) {
        studentManager.updateStudentProgression(student.id, (current) => ({
          ...current,
          status: "active",
          examOutcome: "pass",
          promotionDecision: "promote",
          lastPromotionSessionId: sessionId,
          lastPromotionOutcome: "retained-top-level",
          progressionHistory: appendStudentProgression(current, {
            type: "auto-retained",
            fromLevel: current.level,
            toLevel: current.level,
            note: `No next class level configured during ${sessionLabel} auto-promotion`,
          }),
        }));
        summary.retainedTopLevel += 1;
        return;
      }

      studentManager.updateStudentProgression(student.id, (current) => ({
        ...current,
        level: nextLevel,
        status: "active",
        examOutcome: "pass",
        promotionDecision: "promote",
        lastPromotionSessionId: sessionId,
        lastPromotionOutcome: "promoted",
        progressionHistory: appendStudentProgression(current, {
          type: "auto-promoted",
          fromLevel: current.level,
          toLevel: nextLevel,
          note: `Promoted automatically after ${sessionLabel} close`,
        }),
      }));
      summary.promoted += 1;
    });

    return summary;
  }

  function initStudentManagementControls({
    isAdmin,
    manager,
    summaryTarget,
    form,
    status,
    listTarget,
    guardianList,
    formToggleButton,
  }) {
    if (!summaryTarget || !form || !status || !listTarget || !guardianList) {
      return;
    }

    const addGuardianButton = form.querySelector("[data-add-guardian]");
    const quickAddForm = document.getElementById("portal-student-quick-add-form");
    const quickAddStatus = document.getElementById("portal-student-quick-add-status");
    const importToggleButton = document.querySelector("[data-student-import-toggle]");
    const importPanel = document.getElementById("portal-student-import-panel");
    const createOverlay = document.getElementById("portal-student-create-overlay");
    const importOverlay = document.getElementById("portal-student-import-overlay");
    const viewOverlay = document.getElementById("portal-student-view-overlay");
    const viewContent = document.getElementById("portal-student-view-content");
    const docsOverlay = document.getElementById("portal-student-docs-overlay");
    const docsStatus = document.getElementById("portal-student-docs-status");
    const docsList = document.getElementById("portal-student-doc-list");
    const docsStudentIdInput = document.getElementById("portal-student-docs-student-id");
    const docsStudentName = document.getElementById("portal-student-docs-student-name");
    const docsTypeSelect = document.getElementById("portal-student-doc-type");
    const docsFileInput = document.getElementById("portal-student-doc-file");
    const docsUploadButton = document.querySelector("[data-student-doc-upload]");
    const classFiltersTarget = document.getElementById("portal-student-class-filters");
    const searchInput = document.getElementById("portal-student-search");
    const importStatus = document.getElementById("portal-student-import-status");
    const importFileInput = document.getElementById("portal-student-import-file");
    const importPreviewButton = document.querySelector("[data-student-import-preview]");
    const importConfirmButton = document.querySelector("[data-student-import-confirm]");
    const importPreviewTarget = document.getElementById("portal-student-import-preview");
    const classManager = getClassManager();
    const settingsManager = getSchoolSettingsManager();
    const levelSelect = form.elements.level;
    const createTitle = document.getElementById("portal-student-create-title");
    let importPreviewRows = [];
    let selectedClass = "all";
    let searchQuery = "";
    const expandedClassTokens = new Set();

    const refreshStudentLevelOptions = () => {
      if (levelSelect instanceof HTMLSelectElement) {
        renderStudentLevelSelectOptions(levelSelect, levelSelect.value);
        levelSelect.disabled = !isAdmin;
      }
    };

    const setOverlayState = (overlay, isVisible) => {
      if (!overlay) {
        return;
      }
      overlay.hidden = !isVisible;
      const hasOpenOverlay = [createOverlay, importOverlay, viewOverlay, docsOverlay].some(
        (item) => item && !item.hidden,
      );
      document.body.classList.toggle("portal-overlay-open", hasOpenOverlay);
    };

    const setStudentFormVisibility = (isVisible) => {
      setOverlayState(createOverlay, isVisible);

      if (formToggleButton) {
        formToggleButton.textContent = "Create student";
        formToggleButton.setAttribute("aria-expanded", String(isVisible));
      }

      if (isVisible) {
        window.setTimeout(() => {
          form.elements.firstName?.focus?.();
        }, 0);
      }
    };

    const setImportPanelVisibility = (isVisible) => {
      if (!importOverlay) {
        return;
      }
      setOverlayState(importOverlay, isVisible);
      if (importToggleButton) {
        importToggleButton.textContent = "Import Students";
      }
    };

    const renderStudentDocuments = (record) => {
      if (!docsList) {
        return;
      }

      const documents = Array.isArray(record?.documents) ? record.documents : [];

      if (!documents.length) {
        docsList.innerHTML = `
          <article class="portal-student-doc-empty">
            <strong>No documents uploaded yet</strong>
            <p>Use the upload controls above to attach student files.</p>
          </article>
        `;
        return;
      }

      docsList.innerHTML = documents
        .map(
          (entry) => {
            const documentType = entry.documentType || "Other";
            const documentIcon = getInitials(documentType).slice(0, 2) || "DC";
            return `
            <article class="portal-student-doc-item">
              <span class="portal-student-doc-icon">${escapeHtml(documentIcon)}</span>
              <div class="portal-student-doc-copy">
                <strong>${escapeHtml(entry.name || "Document")}</strong>
                <div class="portal-student-doc-tags">
                  <span>${escapeHtml(documentType)}</span>
                  <span>${escapeHtml(formatFileSize(entry.sizeBytes))}</span>
                  <span>${escapeHtml(formatTimestamp(entry.uploadedAt || nowIso()))}</span>
                </div>
              </div>
              <div class="portal-student-doc-actions">
                <button
                  class="portal-class-button"
                  type="button"
                  data-student-doc-action="download"
                  data-student-doc-id="${escapeHtml(entry.id)}"
                >
                  Download
                </button>
                <button
                  class="portal-class-button is-archive"
                  type="button"
                  data-student-doc-action="delete"
                  data-student-doc-id="${escapeHtml(entry.id)}"
                  ${isAdmin ? "" : "disabled"}
                >
                  Delete
                </button>
              </div>
            </article>
          `;
          },
        )
        .join("");
    };

    const openStudentDocuments = (record) => {
      if (!docsOverlay || !docsStudentIdInput || !docsStudentName || !docsList) {
        return;
      }

      docsStudentIdInput.value = String(record?.id || "");
      docsStudentName.textContent = record?.fullName
        ? `${record.fullName} (${record.admissionNo || "No Admission No."})`
        : "Student documents";
      if (docsFileInput) {
        docsFileInput.value = "";
      }
      if (docsTypeSelect) {
        docsTypeSelect.value = "Passport Photograph";
      }
      setStatus(docsStatus, "", "");
      renderStudentDocuments(record);
      setOverlayState(docsOverlay, true);
    };

    const tryAutoFillAdmissionNo = () => {
      const admissionInput = form.elements.admissionNo;
      const levelInput = form.elements.level;
      const studentId = form.elements.studentId?.value || "";
      if (!admissionInput || !levelInput || !manager || !isAdmin) {
        return;
      }

      const currentValue = String(admissionInput.value || "").trim();
      const shouldGenerate =
        !currentValue || admissionInput.dataset.autoGenerated === "true";

      if (!shouldGenerate || !String(levelInput.value || "").trim()) {
        return;
      }

      const generated = generateAdmissionNumber({
        manager,
        levelValue: levelInput.value,
        excludeStudentId: studentId || undefined,
      });
      admissionInput.value = generated;
      admissionInput.dataset.autoGenerated = "true";
    };

    const toggleStudentFormVisibility = () => {
      if (!isAdmin || !manager) {
        return;
      }

      const shouldOpen = createOverlay ? createOverlay.hidden : false;
      setStudentFormVisibility(shouldOpen);

      if (!shouldOpen) {
        clearPortalStudentErrors(form);
        resetPortalStudentForm(form, guardianList, isAdmin);
        setStatus(status, "", "");
      }
    };

    const refreshStudentSection = () => {
      refreshStudentLevelOptions();
      renderPortalStudentManagementSection({
        isAdmin,
        manager,
        summaryTarget,
        form,
        status,
        listTarget,
        classFiltersTarget,
        selectedClass,
        searchQuery,
        expandedClassTokens,
      });
    };

    refreshStudentSection();
    resetPortalStudentForm(form, guardianList, isAdmin);
    setStudentFormVisibility(false);
    setImportPanelVisibility(false);

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", () => {
        if (createTitle) {
          createTitle.textContent = "Create Student";
        }
        if (createOverlay?.hidden) {
          clearPortalStudentErrors(form);
          resetPortalStudentForm(form, guardianList, isAdmin);
          setStatus(status, "", "");
        }
        toggleStudentFormVisibility();
      });
    }

    if (importToggleButton) {
      importToggleButton.disabled = !isAdmin || !manager;
      importToggleButton.addEventListener("click", () => {
        setImportPanelVisibility(importOverlay ? importOverlay.hidden : false);
        if (importStatus) {
          setStatus(importStatus, "", "");
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = String(searchInput.value || "").trim();
        refreshStudentSection();
      });
    }

    if (classFiltersTarget) {
      classFiltersTarget.addEventListener("click", (event) => {
        const button = event.target.closest("[data-student-class]");

        if (!button) {
          return;
        }

        selectedClass = String(button.dataset.studentClass || "all");
        refreshStudentSection();
      });
    }

    document.querySelectorAll("[data-student-create-close]").forEach((button) => {
      button.addEventListener("click", () => {
        clearPortalStudentErrors(form);
        resetPortalStudentForm(form, guardianList, isAdmin);
        setStudentFormVisibility(false);
        setStatus(status, "", "");
      });
    });

    document.querySelectorAll("[data-student-import-close]").forEach((button) => {
      button.addEventListener("click", () => {
        setImportPanelVisibility(false);
      });
    });

    document.querySelectorAll("[data-student-view-close]").forEach((button) => {
      button.addEventListener("click", () => {
        setOverlayState(viewOverlay, false);
      });
    });

    document.querySelectorAll("[data-student-docs-close]").forEach((button) => {
      button.addEventListener("click", () => {
        setOverlayState(docsOverlay, false);
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (createOverlay && !createOverlay.hidden) {
        setStudentFormVisibility(false);
      }
      if (importOverlay && !importOverlay.hidden) {
        setImportPanelVisibility(false);
      }
      if (viewOverlay && !viewOverlay.hidden) {
        setOverlayState(viewOverlay, false);
      }
      if (docsOverlay && !docsOverlay.hidden) {
        setOverlayState(docsOverlay, false);
      }
    });

    if (!manager) {
      setStudentFormVisibility(false);
      return;
    }

    if (docsUploadButton && docsStudentIdInput && docsFileInput) {
      docsUploadButton.disabled = !isAdmin;
      docsUploadButton.addEventListener("click", async () => {
        if (!isAdmin) {
          setStatus(docsStatus, "info", "Only administrators can upload student documents.");
          return;
        }

        const studentId = String(docsStudentIdInput.value || "").trim();
        const record = manager.getStudents().find((item) => item.id === studentId);
        const file = docsFileInput.files?.[0] || null;

        if (!record) {
          setStatus(docsStatus, "error", "Select a valid student first.");
          return;
        }

        if (!file) {
          setStatus(docsStatus, "error", "Choose a document file to upload.");
          return;
        }

        const maxBytes = 8 * 1024 * 1024;
        if (file.size > maxBytes) {
          setStatus(docsStatus, "error", "File too large. Max upload size is 8MB.");
          return;
        }

        let dataUrl = "";
        try {
          dataUrl = await readFileAsDataUrl(file);
        } catch {
          setStatus(docsStatus, "error", "Could not read the selected file.");
          return;
        }

        if (!dataUrl) {
          setStatus(docsStatus, "error", "Upload failed. Try another file.");
          return;
        }

        const documentType = String(docsTypeSelect?.value || "Other").trim() || "Other";
        const newDocument = {
          id: createId(),
          name: String(file.name || "Document").trim() || "Document",
          documentType,
          mimeType: String(file.type || "").trim(),
          sizeBytes: Number(file.size) || 0,
          dataUrl,
          uploadedAt: nowIso(),
          uploadedBy: getSession()?.email || "admin",
        };

        manager.updateStudentProgression(studentId, (current) => ({
          ...current,
          documents: [...(Array.isArray(current.documents) ? current.documents : []), newDocument],
        }));

        recordAuditEvent({
          action: "uploaded",
          entityType: "student-document",
          entityId: record.admissionNo || record.id,
          summary: `Uploaded ${newDocument.documentType} for ${record.fullName}`,
          details: newDocument.name,
        });

        if (docsFileInput) {
          docsFileInput.value = "";
        }

        const updated = manager.getStudents().find((item) => item.id === studentId) || record;
        renderStudentDocuments(updated);
        refreshStudentSection();
        setStatus(
          docsStatus,
          "success",
          `Uploaded <strong>${escapeHtml(newDocument.name)}</strong> for <strong>${escapeHtml(
            record.fullName,
          )}</strong>.`,
        );
      });
    }

    if (docsList) {
      docsList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-student-doc-action]");

        if (!button) {
          return;
        }

        const studentId = String(docsStudentIdInput?.value || "").trim();
        const record = manager.getStudents().find((item) => item.id === studentId);

        if (!record) {
          return;
        }

        const action = String(button.dataset.studentDocAction || "").trim();
        const docId = String(button.dataset.studentDocId || "").trim();
        const doc = (record.documents || []).find((item) => String(item.id || "") === docId);

        if (!doc) {
          return;
        }

        if (action === "download") {
          if (!doc.dataUrl) {
            setStatus(docsStatus, "error", "This file source is missing.");
            return;
          }
          const link = document.createElement("a");
          link.href = doc.dataUrl;
          link.download = doc.name || "document";
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          link.remove();
          return;
        }

        if (action === "delete") {
          if (!isAdmin) {
            return;
          }

          manager.updateStudentProgression(studentId, (current) => ({
            ...current,
            documents: (current.documents || []).filter(
              (entry) => String(entry.id || "") !== docId,
            ),
          }));

          recordAuditEvent({
            action: "deleted",
            entityType: "student-document",
            entityId: record.admissionNo || record.id,
            summary: `Deleted ${doc.documentType || "document"} for ${record.fullName}`,
            details: doc.name || "",
          });

          const updated = manager.getStudents().find((item) => item.id === studentId) || record;
          renderStudentDocuments(updated);
          refreshStudentSection();
          setStatus(
            docsStatus,
            "success",
            `Removed <strong>${escapeHtml(doc.name || "document")}</strong> from <strong>${escapeHtml(
              record.fullName,
            )}</strong>.`,
          );
        }
      });
    }

    if (isAdmin) {
      backfillGuardianAccessFromStudents(manager);
    }

    if (addGuardianButton) {
      addGuardianButton.disabled = !isAdmin;
      addGuardianButton.addEventListener("click", () => {
        appendGuardianRow(guardianList, {}, isAdmin);
      });
    }

    guardianList.addEventListener("change", (event) => {
      const relationshipControl = event.target.closest('[data-guardian-field="relationshipType"]');

      if (!(relationshipControl instanceof HTMLSelectElement)) {
        return;
      }

      const row = relationshipControl.closest(".portal-guardian-row");
      updateGuardianRelationshipCustomField(row);
    });

    guardianList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-guardian]");

      if (!removeButton || !isAdmin) {
        return;
      }

      const row = removeButton.closest(".portal-guardian-row");

      if (!row) {
        return;
      }

      row.remove();

      if (!guardianList.children.length) {
        appendGuardianRow(guardianList, {}, isAdmin);
      }
    });

    form.addEventListener("input", (event) => {
      clearPortalStudentErrors(form);

      if (event?.target === form.elements.admissionNo) {
        form.elements.admissionNo.dataset.autoGenerated = "false";
      }

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    if (form.elements.level) {
      form.elements.level.addEventListener("change", tryAutoFillAdmissionNo);
      form.elements.level.addEventListener("blur", tryAutoFillAdmissionNo);
    }

    if (form.elements.admissionNo) {
      form.elements.admissionNo.addEventListener("input", () => {
        form.elements.admissionNo.dataset.autoGenerated = "false";
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can manage student records.");
        return;
      }

      clearPortalStudentErrors(form);
      setStatus(status, "", "");

      const studentId = form.elements.studentId.value;
      const firstName = form.elements.firstName.value.trim();
      const lastName = form.elements.lastName.value.trim();
      const level = form.elements.level.value.trim();
      const admissionNoRaw = form.elements.admissionNo.value.trim();
      const promotionDecisionRaw = String(form.elements.promotionDecision?.value || "promote")
        .trim()
        .toLowerCase();
      const promotionDecision =
        promotionDecisionRaw === "repeat" || promotionDecisionRaw === "resit"
          ? promotionDecisionRaw
          : "promote";
      const payload = {
        id: studentId || undefined,
        firstName,
        lastName,
        fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
        admissionNo:
          admissionNoRaw ||
          generateAdmissionNumber({
            manager,
            levelValue: level,
            excludeStudentId: studentId || undefined,
          }),
        level,
        dateOfBirth: form.elements.dateOfBirth?.value || "",
        gender: form.elements.gender?.value || "",
        promotionDecision,
        examOutcome:
          promotionDecision === "resit"
            ? "resit"
            : promotionDecision === "repeat"
              ? "fail"
              : "pass",
      };
      const guardianParse = parseGuardianRows(guardianList, { validatePhone: true });
      payload.guardians = guardianParse.guardians;
      const hasGuardianEmail = payload.guardians.some((guardian) =>
        EMAIL_REGEX.test(String(guardian.email || "").trim()),
      );

      let hasError = false;

      if (!payload.firstName) {
        setPortalStudentError(form, "firstName", "Enter the first name.");
        hasError = true;
      }

      if (!payload.lastName) {
        setPortalStudentError(form, "lastName", "Enter the last name.");
        hasError = true;
      }

      if (!payload.admissionNo) {
        setPortalStudentError(form, "admissionNo", "Enter the admission number.");
        hasError = true;
      }

      if (!payload.level) {
        setPortalStudentError(form, "level", "Enter the student level or class.");
        hasError = true;
      } else if (!isKnownClassLevel(payload.level, getActiveClassLevelTokenSet())) {
        setPortalStudentError(form, "level", "Select a level or class from the school structure.");
        hasError = true;
      }

      if (guardianParse.hasInvalidRow) {
        setPortalStudentError(
          form,
          "guardians",
          "Each guardian row needs name, relationship, and at least one contact (phone or email).",
        );
        hasError = true;
      } else if (guardianParse.hasInvalidPhone) {
        setPortalStudentError(
          form,
          "guardians",
          "Wrong phone number format detected in guardian contacts.",
        );
        hasError = true;
      } else if (!payload.guardians.length) {
        setPortalStudentError(form, "guardians", "Add at least one guardian contact.");
        hasError = true;
      } else if (!hasGuardianEmail) {
        setPortalStudentError(
          form,
          "guardians",
          "Add at least one valid guardian email so a parent login can be created automatically.",
        );
        hasError = true;
      }

      const duplicateAdmission = manager
        .getStudents()
        .find(
          (record) =>
            record.id !== studentId &&
            record.admissionNo.toLowerCase() === payload.admissionNo.toLowerCase(),
        );

      if (duplicateAdmission) {
        setPortalStudentError(form, "admissionNo", "This admission number is already in use.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted student details and try again.");
        return;
      }

      const currentRecord = manager.getStudents().find((record) => record.id === studentId) || null;
      manager.upsertStudent({
        ...currentRecord,
        ...payload,
        status: currentRecord ? currentRecord.status : "active",
      });
      const parentProvisioning = await provisionParentAccountsForStudent(payload);

      recordAuditEvent({
        action: currentRecord ? "updated" : "created",
        entityType: "student",
        entityId: payload.admissionNo,
        summary: currentRecord
          ? `Updated student record for ${payload.fullName || payload.admissionNo}`
          : `Created student record for ${payload.fullName || payload.admissionNo}`,
        details: `${payload.level} • ${payload.guardians.length} guardian contact(s)`,
      });

      resetPortalStudentForm(form, guardianList, isAdmin);
      clearFormDraftFor(form);
      setStudentFormVisibility(false);
      const createdParentCopy = parentProvisioning.created.length
        ? ` Parent login created: <strong>${escapeHtml(
            parentProvisioning.created[0].email,
          )}</strong>${parentProvisioning.created.length > 1 ? ` +${parentProvisioning.created.length - 1} more` : ""}. Default password: <strong>${escapeHtml(
            DEFAULT_PARENT_PASSWORD,
          )}</strong>.`
        : "";
      const googleParentCopy = parentProvisioning.existingGoogle.length
        ? ` ${parentProvisioning.existingGoogle.length} guardian account(s) already use Google sign-in.`
        : "";
      const failedParentCopy = parentProvisioning.failed?.length
        ? ` ${parentProvisioning.failed.length} guardian account(s) could not be provisioned. Check Supabase function setup.`
        : "";
      setStatus(
        status,
        "success",
        currentRecord
          ? `Student <strong>${escapeHtml(payload.fullName || payload.admissionNo)}</strong> updated with guardian relationships.${createdParentCopy}${googleParentCopy}${failedParentCopy}`
          : `Student <strong>${escapeHtml(payload.fullName || payload.admissionNo)}</strong> created with guardian relationships.${createdParentCopy}${googleParentCopy}${failedParentCopy}`,
      );
    });

    const cancelButton = form.querySelector("[data-student-cancel]");

    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        clearPortalStudentErrors(form);
        resetPortalStudentForm(form, guardianList, isAdmin);
        setStudentFormVisibility(false);
        setStatus(status, "", "");
      });
    }

    listTarget.addEventListener("click", (event) => {
      const classToggleButton = event.target.closest("[data-student-class-toggle]");

      if (classToggleButton) {
        const classToken = String(classToggleButton.dataset.studentClassToggle || "").trim();

        if (classToken) {
          const shouldExpand = !expandedClassTokens.has(classToken);
          if (shouldExpand) {
            expandedClassTokens.add(classToken);
          } else {
            expandedClassTokens.delete(classToken);
          }

          const group = classToggleButton.closest(".portal-student-group");
          const groupList = group ? group.querySelector(".portal-student-group-list") : null;
          const arrow = classToggleButton.querySelector(".portal-student-group-toggle-arrow");

          classToggleButton.setAttribute("aria-expanded", shouldExpand ? "true" : "false");
          classToggleButton.setAttribute(
            "aria-label",
            shouldExpand ? "Collapse class list" : "Expand class list",
          );

          if (groupList) {
            groupList.hidden = !shouldExpand;
          }

          if (arrow) {
            arrow.textContent = shouldExpand ? "▴" : "▾";
          }
        }
        return;
      }

      const actionButton = event.target.closest("[data-student-action]");

      if (!actionButton) {
        return;
      }

      const studentId = actionButton.dataset.studentId;
      const action = actionButton.dataset.studentAction;
      const record = manager.getStudents().find((item) => item.id === studentId);

      if (!record) {
        return;
      }

      if (action === "view") {
        const statusLabel =
          record.status === "archived"
            ? "Archived"
            : record.status === "transferred"
              ? "Transferred Out"
              : "Active";
        const statusClass =
          record.status === "archived"
            ? "is-archived"
            : record.status === "transferred"
              ? "is-transferred"
              : "is-active";
        const guardians = Array.isArray(record.guardians) ? record.guardians : [];
        const documents = Array.isArray(record.documents) ? record.documents : [];
        const profileName = record.fullName || "Unnamed student";
        const initials = getInitials(profileName).slice(0, 2) || "ST";
        const admissionLabel = record.admissionNo ? `Admission No. ${record.admissionNo}` : "No admission number";
        const levelLabel = record.level || "No class assigned";
        const progressionLabel =
          record.promotionDecision === "repeat"
            ? "Repeat class"
            : record.promotionDecision === "resit"
              ? "Resit required"
              : "Auto promote";
        const guardianCards = guardians.length
          ? guardians
              .map((guardian) => {
                const guardianName = guardian.name || "Guardian";
                return `
                  <article class="portal-student-mini-card">
                    <span class="portal-student-mini-icon">${escapeHtml(
                      getInitials(guardianName).slice(0, 2) || "GC",
                    )}</span>
                    <div class="portal-student-mini-copy">
                      <strong>${escapeHtml(guardianName)}</strong>
                      <span>${escapeHtml(guardian.relationship || "Guardian")}</span>
                      <small>${escapeHtml(guardian.phone || "No phone")} &middot; ${escapeHtml(
                        guardian.email || "No email",
                      )}</small>
                    </div>
                  </article>
                `;
              })
              .join("")
          : `
              <article class="portal-student-view-empty">
                <strong>No guardian contacts saved</strong>
                <p>Add guardian contacts from the student profile form.</p>
              </article>
            `;
        const documentCards = documents.length
          ? documents
              .map((doc) => {
                const documentType = doc.documentType || "Other";
                return `
                  <article class="portal-student-mini-card">
                    <span class="portal-student-mini-icon">${escapeHtml(
                      getInitials(documentType).slice(0, 2) || "DC",
                    )}</span>
                    <div class="portal-student-mini-copy">
                      <strong>${escapeHtml(doc.name || "Document")}</strong>
                      <span>${escapeHtml(documentType)}</span>
                      <small>${escapeHtml(formatFileSize(doc.sizeBytes))} &middot; ${escapeHtml(
                        formatTimestamp(doc.uploadedAt || nowIso()),
                      )}</small>
                    </div>
                  </article>
                `;
              })
              .join("")
          : `
              <article class="portal-student-view-empty">
                <strong>No documents uploaded</strong>
                <p>Use the student documents action to keep files on this record.</p>
              </article>
            `;
        if (viewContent) {
          viewContent.innerHTML = `
            <section class="portal-student-profile-hero">
              <span class="portal-student-profile-avatar">${escapeHtml(initials)}</span>
              <div class="portal-student-profile-copy">
                <span>${escapeHtml(levelLabel)}</span>
                <h4>${escapeHtml(profileName)}</h4>
                <p>${escapeHtml(admissionLabel)}</p>
              </div>
              <span class="portal-student-profile-status ${statusClass}">${escapeHtml(statusLabel)}</span>
            </section>
            <div class="portal-student-view-sections">
              <section class="portal-student-view-card">
                <div class="portal-student-view-card-head">
                  <strong>Academic record</strong>
                  <span>Class, identity, and progression.</span>
                </div>
                <div class="portal-student-detail-grid">
                  <article>
                    <span>Admission No</span>
                    <strong>${escapeHtml(record.admissionNo || "Not recorded")}</strong>
                  </article>
                  <article>
                    <span>Level / Class</span>
                    <strong>${escapeHtml(record.level || "Not assigned")}</strong>
                  </article>
                  <article>
                    <span>Gender</span>
                    <strong>${escapeHtml(record.gender || "Not recorded")}</strong>
                  </article>
                  <article>
                    <span>Date of birth</span>
                    <strong>${escapeHtml(record.dateOfBirth || "Not recorded")}</strong>
                  </article>
                  <article>
                    <span>Session close</span>
                    <strong>${escapeHtml(progressionLabel)}</strong>
                  </article>
                  <article>
                    <span>Status</span>
                    <strong>${escapeHtml(statusLabel)}</strong>
                  </article>
                </div>
              </section>
              <section class="portal-student-view-card">
                <div class="portal-student-view-card-head">
                  <strong>Guardian contacts</strong>
                  <span>${guardians.length} saved contact${guardians.length === 1 ? "" : "s"}.</span>
                </div>
                <div class="portal-student-mini-list">
                  ${guardianCards}
                </div>
              </section>
              <section class="portal-student-view-card">
                <div class="portal-student-view-card-head">
                  <strong>Documents</strong>
                  <span>${documents.length} uploaded file${documents.length === 1 ? "" : "s"}.</span>
                </div>
                <div class="portal-student-mini-list">
                  ${documentCards}
                </div>
              </section>
            </div>
          `;
        }
        setOverlayState(viewOverlay, true);
        return;
      }

      if (action === "manage-docs") {
        if (!isAdmin) {
          return;
        }
        openStudentDocuments(record);
        return;
      }

      if (!isAdmin) {
        return;
      }

      clearPortalStudentErrors(form);

      if (action === "edit") {
        if (createTitle) {
          createTitle.textContent = "Edit Student";
        }
        populatePortalStudentForm(form, guardianList, record, isAdmin);
        setStudentFormVisibility(true);
        setStatus(
          status,
          "info",
          `Editing <strong>${escapeHtml(record.fullName)}</strong>. Save to update this student record.`,
        );
        return;
      }

      if (action === "promote") {
        const nextLevel = getNextStudentLevel(record.level);
        if (!nextLevel) {
          setStatus(
            status,
            "error",
            `No next class level found after <strong>${escapeHtml(
              record.level || "current level",
            )}</strong>. Add the next level in Class Management first.`,
          );
          return;
        }

        manager.updateStudentProgression(record.id, (current) => ({
          ...current,
          level: nextLevel,
          status: "active",
          promotionDecision: "promote",
          examOutcome: "pass",
          lastPromotionOutcome: "manual-promoted",
          archivedAt: null,
          transferredAt: null,
          transferReason: "",
          progressionHistory: appendStudentProgression(current, {
            type: "promoted",
            fromLevel: current.level,
            toLevel: nextLevel,
            note: "Promoted by admin",
          }),
        }));
        recordAuditEvent({
          action: "updated",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `Promoted ${record.fullName}`,
          details: `${record.level} → ${nextLevel}`,
        });
        setStatus(
          status,
          "success",
          `Student <strong>${escapeHtml(record.fullName)}</strong> promoted from <strong>${escapeHtml(
            record.level,
          )}</strong> to <strong>${escapeHtml(nextLevel)}</strong>.`,
        );
        return;
      }

      if (action === "mark-repeat") {
        manager.updateStudentProgression(record.id, (current) => ({
          ...current,
          status: "active",
          promotionDecision: "repeat",
          examOutcome: "fail",
          lastPromotionSessionId: "",
          lastPromotionOutcome: "queued-repeat",
          archivedAt: null,
          transferredAt: null,
          transferReason: "",
          progressionHistory: appendStudentProgression(current, {
            type: "repeat-queued",
            fromLevel: current.level,
            toLevel: current.level,
            note: "Queued to repeat class at next session close",
          }),
        }));
        recordAuditEvent({
          action: "updated",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `${record.fullName} set to repeat`,
          details: `${record.level}`,
        });
        setStatus(
          status,
          "success",
          `Student <strong>${escapeHtml(record.fullName)}</strong> will repeat <strong>${escapeHtml(
            record.level,
          )}</strong> when this session is closed.`,
        );
        return;
      }

      if (action === "mark-resit") {
        manager.updateStudentProgression(record.id, (current) => ({
          ...current,
          status: "active",
          promotionDecision: "resit",
          examOutcome: "resit",
          lastPromotionSessionId: "",
          lastPromotionOutcome: "queued-resit",
          archivedAt: null,
          transferredAt: null,
          transferReason: "",
          progressionHistory: appendStudentProgression(current, {
            type: "resit-queued",
            fromLevel: current.level,
            toLevel: current.level,
            note: "Queued for resit at next session close",
          }),
        }));
        recordAuditEvent({
          action: "updated",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `${record.fullName} set to resit`,
          details: `${record.level}`,
        });
        setStatus(
          status,
          "success",
          `Student <strong>${escapeHtml(record.fullName)}</strong> is set for resit and will stay in <strong>${escapeHtml(
            record.level,
          )}</strong> when this session is closed.`,
        );
        return;
      }

      if (action === "transfer") {
        const transferNote = window.prompt("Transfer note (optional)", record.transferReason || "");
        if (transferNote === null) {
          return;
        }
        manager.updateStudentProgression(record.id, (current) => ({
          ...current,
          status: "transferred",
          transferredAt: nowIso(),
          transferReason: String(transferNote || "").trim(),
          archivedAt: null,
          progressionHistory: appendStudentProgression(current, {
            type: "transferred",
            fromLevel: current.level,
            toLevel: "",
            note: String(transferNote || "").trim() || "Transferred out by admin",
          }),
        }));
        recordAuditEvent({
          action: "updated",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `Transferred out ${record.fullName}`,
          details: `${record.level}${transferNote ? ` • ${transferNote}` : ""}`,
        });
        setStatus(
          status,
          "success",
          `Student <strong>${escapeHtml(record.fullName)}</strong> transferred out successfully.`,
        );
        return;
      }

      if (action === "archive") {
        manager.archiveStudent(record.id);
        recordAuditEvent({
          action: "archived",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `Archived student record for ${record.fullName}`,
          details: `${record.level}`,
        });
        resetPortalStudentForm(form, guardianList, isAdmin);
        setStudentFormVisibility(false);
        setStatus(status, "success", `Student <strong>${escapeHtml(record.fullName)}</strong> archived.`);
        return;
      }

      if (action === "activate") {
        manager.activateStudent(record.id);
        recordAuditEvent({
          action: "reactivated",
          entityType: "student",
          entityId: record.admissionNo,
          summary: `Reactivated student record for ${record.fullName}`,
          details: `${record.level}`,
        });
        resetPortalStudentForm(form, guardianList, isAdmin);
        setStudentFormVisibility(false);
        setStatus(status, "success", `Student <strong>${escapeHtml(record.fullName)}</strong> reactivated.`);
      }
    });

    window.addEventListener(manager.eventName, refreshStudentSection);
    if (classManager?.eventName) {
      window.addEventListener(classManager.eventName, refreshStudentSection);
    }
    if (settingsManager?.eventName) {
      window.addEventListener(settingsManager.eventName, refreshStudentSection);
    }

    if (quickAddForm && quickAddStatus) {
      Array.from(quickAddForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) {
          field.disabled = !isAdmin;
        }
      });
      quickAddForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!isAdmin) {
          setStatus(quickAddStatus, "info", "Only administrators can add students.");
          return;
        }

        const firstName = quickAddForm.elements.firstName.value.trim();
        const lastName = quickAddForm.elements.lastName.value.trim();
        const level = quickAddForm.elements.level.value.trim();
        const guardianName = quickAddForm.elements.guardianName.value.trim();
        const guardianPhone = quickAddForm.elements.guardianPhone.value.trim();
        const guardianEmail = quickAddForm.elements.guardianEmail.value.trim();

        if (!firstName || !lastName || !level || !guardianName || !guardianEmail) {
          setStatus(
            quickAddStatus,
            "error",
            "First name, last name, level/class, parent/guardian name, and guardian email are required for quick add.",
          );
          return;
        }

        if (!isKnownClassLevel(level, getActiveClassLevelTokenSet())) {
          setStatus(quickAddStatus, "error", "Invalid class. Select a valid class from the school structure.");
          return;
        }

        if (guardianPhone && !isValidPhoneNumber(guardianPhone)) {
          setStatus(quickAddStatus, "error", "Wrong phone number format.");
          return;
        }

        if (guardianEmail && !EMAIL_REGEX.test(guardianEmail)) {
          setStatus(quickAddStatus, "error", "Invalid parent/guardian email format.");
          return;
        }

        const admissionNo = generateAdmissionNumber({ manager, levelValue: level });
        const payload = {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          admissionNo,
          level,
          dateOfBirth: "",
          gender: "",
          promotionDecision: "promote",
          examOutcome: "pass",
          guardians: [
            {
              id: createId(),
              name: guardianName,
              relationship: "Guardian",
              phone: guardianPhone,
              email: guardianEmail,
            },
          ],
          status: "active",
        };

        manager.upsertStudent(payload);
        const parentProvisioning = await provisionParentAccountsForStudent(payload);
        const failedParentCopy = parentProvisioning.failed?.length
          ? ` ${parentProvisioning.failed.length} guardian login(s) could not be provisioned.`
          : "";
        quickAddForm.reset();
        setStatus(
          quickAddStatus,
          "success",
          `Student <strong>${escapeHtml(payload.fullName)}</strong> added with admission number <strong>${escapeHtml(
            payload.admissionNo,
          )}</strong>.${
            parentProvisioning.created.length
              ? ` Parent login created with default password <strong>${escapeHtml(DEFAULT_PARENT_PASSWORD)}</strong>.`
              : ""
          }${failedParentCopy}`,
        );
        recordAuditEvent({
          action: "created",
          entityType: "student",
          entityId: payload.admissionNo,
          summary: `Quick-added student record for ${payload.fullName}`,
          details: `${payload.level} • 1 guardian contact`,
        });
      });
    }

    document.querySelectorAll("[data-student-template-download]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!isAdmin) {
          return;
        }
        if (button.dataset.studentTemplateDownload === "excel") {
          downloadStudentExcelTemplate();
        } else {
          downloadStudentCsvTemplate();
        }
      });
    });

    if (importPreviewButton && importStatus && importPreviewTarget && importFileInput) {
      importFileInput.disabled = !isAdmin;
      importPreviewButton.disabled = !isAdmin;
      importPreviewButton.addEventListener("click", async () => {
        if (!isAdmin) {
          setStatus(importStatus, "info", "Only administrators can import students.");
          return;
        }

        const selectedFile = importFileInput.files?.[0] || null;
        if (!selectedFile) {
          setStatus(importStatus, "error", "Choose a CSV or Excel file to preview.");
          return;
        }

        const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";
        if (!["csv", "xls", "xlsx"].includes(extension)) {
          setStatus(importStatus, "error", "Unsupported file type. Upload CSV or Excel file.");
          return;
        }

        if (extension === "xlsx") {
          setStatus(
            importStatus,
            "error",
            "For this build, upload CSV or the provided Excel template (.xls).",
          );
          return;
        }

        let rows = [];
        try {
          const content = await selectedFile.text();
          rows = extension === "csv" ? parseCsvRows(content) : parseSpreadsheetXmlRows(content);
        } catch (error) {
          setStatus(importStatus, "error", error?.message || "Could not parse the uploaded file.");
          return;
        }

        if (!rows.length) {
          setStatus(importStatus, "error", "No student rows found in the uploaded file.");
          importPreviewRows = [];
          renderImportPreview(importPreviewTarget, importPreviewRows);
          if (importConfirmButton) {
            importConfirmButton.disabled = true;
          }
          return;
        }

        const admissionTaken = new Set(
          manager.getStudents().map((student) => String(student.admissionNo || "").toLowerCase()),
        );
        const seenAdmissions = new Set();
        importPreviewRows = rows.map((row) => {
          const payload = buildStudentPayloadFromImportRow(row, manager, admissionTaken);
          const errors = validateImportPayload(payload, manager, classLevelSet, seenAdmissions);
          return { payload, errors };
        });

        renderImportPreview(importPreviewTarget, importPreviewRows);
        const validCount = importPreviewRows.filter((item) => !item.errors.length).length;
        const invalidCount = importPreviewRows.length - validCount;

        if (importConfirmButton) {
          importConfirmButton.disabled = validCount === 0;
        }

        if (invalidCount) {
          setStatus(
            importStatus,
            "error",
            `${invalidCount} row(s) have validation errors. Fix and upload again, or confirm to import valid rows only.`,
          );
        } else {
          setStatus(importStatus, "success", `${validCount} student row(s) ready for import.`);
        }
      });
    }

    if (importConfirmButton && importStatus && importPreviewTarget) {
      if (!isAdmin) {
        importConfirmButton.disabled = true;
      }
      importConfirmButton.addEventListener("click", async () => {
        if (!isAdmin) {
          setStatus(importStatus, "info", "Only administrators can import students.");
          return;
        }

        if (!importPreviewRows.length) {
          setStatus(importStatus, "error", "Preview records first before confirming import.");
          return;
        }

        const validRows = importPreviewRows.filter((item) => !item.errors.length);

        if (!validRows.length) {
          setStatus(importStatus, "error", "No valid rows to import.");
          return;
        }

        let createdParentLogins = 0;
        let failedParentLogins = 0;

        for (const row of validRows) {
          manager.upsertStudent({
            ...row.payload,
            status: "active",
          });
          const parentProvisioning = await provisionParentAccountsForStudent(row.payload);
          createdParentLogins += parentProvisioning.created.length;
          failedParentLogins += parentProvisioning.failed?.length || 0;
        }

        recordAuditEvent({
          action: "imported",
          entityType: "student",
          entityId: `bulk-${validRows.length}`,
          summary: `Imported ${validRows.length} student records`,
          details: "Bulk import from CSV/Excel template.",
        });

        const invalidCount = importPreviewRows.length - validRows.length;
        importPreviewRows = [];
        renderImportPreview(importPreviewTarget, importPreviewRows);
        if (importFileInput) {
          importFileInput.value = "";
        }
        importConfirmButton.disabled = true;
        setStatus(
          importStatus,
          "success",
          invalidCount
            ? `Imported ${validRows.length} valid students. ${invalidCount} invalid row(s) were skipped.${
                createdParentLogins
                  ? ` ${createdParentLogins} parent login account(s) were auto-created (default password: ${DEFAULT_PARENT_PASSWORD}).`
                  : ""
              }${
                failedParentLogins
                  ? ` ${failedParentLogins} parent login account(s) could not be provisioned.`
                  : ""
              }`
            : `Imported ${validRows.length} students successfully.${
                createdParentLogins
                  ? ` ${createdParentLogins} parent login account(s) were auto-created (default password: ${DEFAULT_PARENT_PASSWORD}).`
                  : ""
              }${
                failedParentLogins
                  ? ` ${failedParentLogins} parent login account(s) could not be provisioned.`
                  : ""
              }`,
        );
      });
    }

  }

  function findUserByEmail(email) {
    const normalized = normalizeEmail(email);
    return getUsers().find((user) => user.normalizedEmail === normalized) || null;
  }

  function getSelectedRole() {
    const activeRole = document.querySelector(".auth-role.is-active");

    if (!activeRole) {
      return DEFAULT_AUTH_ROLE;
    }

    if (activeRole.dataset.authRole) {
      return normalizeRoleLabel(activeRole.dataset.authRole);
    }

    const activeRoleLabel = activeRole.querySelector(".auth-role-label");
    return normalizeRoleLabel(activeRoleLabel ? activeRoleLabel.textContent : DEFAULT_AUTH_ROLE);
  }

  function initRoleButtons() {
    document.querySelectorAll(".auth-role").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".auth-role").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
      });
    });
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.passwordToggle;
        const input = document.getElementById(targetId);

        if (!input) {
          return;
        }

        const nextType = input.type === "password" ? "text" : "password";
        input.type = nextType;
        button.setAttribute("aria-label", nextType === "password" ? "Show password" : "Hide password");
        button.classList.toggle("is-active", nextType === "text");
      });
    });
  }

  function setStatus(target, type, message) {
    if (!target) {
      return;
    }

    if (!message) {
      target.hidden = true;
      target.className = "auth-status";
      target.innerHTML = "";
      return;
    }

    target.hidden = false;
    target.className = `auth-status auth-status--${type}`;
    target.innerHTML = message;
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".auth-line-field").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll(".auth-check").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll(".auth-field-error").forEach((error) => {
      error.textContent = "";
    });
  }

  function setFieldError(form, fieldName, message) {
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const target =
      control && control.closest(".auth-line-field")
        ? control.closest(".auth-line-field")
        : control && control.closest(".auth-check")
          ? control.closest(".auth-check")
          : null;

    if (error) {
      error.textContent = message;
    }

    if (target) {
      target.classList.add("is-invalid");
    }
  }

  function storeConfirmationMail(user) {
    const mailLog = getMailLog();
    mailLog.unshift({
      id: createId(),
      to: user.email,
      subject: "Confirm your SchoolSphere account",
      token: user.confirmationToken,
      confirmationUrl: buildConfirmationUrl(user.confirmationToken),
      sentAt: user.confirmationSentAt,
    });
    saveMailLog(mailLog.slice(0, 20));
  }

  function updateUser(userId, updater) {
    const users = getUsers();
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      return null;
    }

    const updatedUser = updater({ ...users[index] });
    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  }

  function updateUserByEmail(email, updater, workspaceId = null) {
    const normalized = normalizeEmail(email || "");
    const hasSession = Boolean(getSession());
    const targetWorkspaceId = workspaceId
      ? normalizeWorkspaceId(workspaceId)
      : hasSession
        ? normalizeWorkspaceId(getCurrentWorkspaceId())
        : null;
    const users = getUsers();
    const index = users.findIndex(
      (user) =>
        user.normalizedEmail === normalized &&
        (targetWorkspaceId ? normalizeWorkspaceId(user.workspaceId || "public") === targetWorkspaceId : true),
    );

    if (index === -1) {
      return null;
    }

    const updatedUser = normalizeUserRecord(updater({ ...users[index] }));
    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  }

  function initSignupFlow() {
    if (getPage() !== "signup") {
      return;
    }

    const form = document.getElementById("signup-form");
    const status = document.getElementById("signup-status");

    if (!form || !status) {
      return;
    }

    const guardNotice = getAccessGuardNotice();

    if (guardNotice) {
      setStatus(status, "info", guardNotice);
    }

    form.addEventListener("input", () => {
      clearFieldErrors(form);
      setStatus(status, "", "");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearFieldErrors(form);
      setStatus(status, "", "");

      const email = form.elements.email.value.trim();
      const signupWorkspaceId = normalizeWorkspaceId(normalizeEmail(email));
      const password = form.elements.password.value;
      const confirmPassword = form.elements.confirmPassword.value;
      const termsAccepted = form.elements.terms.checked;
      const grantedRole = "Admin";

      let hasError = false;

      if (!email) {
        setFieldError(form, "email", "Enter your school email address.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(email)) {
        setFieldError(form, "email", "Enter a valid email address.");
        hasError = true;
      }

      if (!password) {
        setFieldError(form, "password", "Create a password.");
        hasError = true;
      } else if (!isStrongPassword(password)) {
        setFieldError(form, "password", "Use at least 8 characters with letters and numbers.");
        hasError = true;
      }

      if (!confirmPassword) {
        setFieldError(form, "confirmPassword", "Confirm your password.");
        hasError = true;
      } else if (confirmPassword !== password) {
        setFieldError(form, "confirmPassword", "Passwords do not match.");
        hasError = true;
      }

      if (!termsAccepted) {
        setFieldError(form, "terms", "You need to accept the terms to continue.");
        hasError = true;
      }

      const existingUser = email ? findUserByEmail(email) : null;

      if (existingUser) {
        setFieldError(form, "email", "This email is already registered.");
        const confirmationLink =
          !existingUser.isConfirmed && existingUser.confirmationToken
            ? ` <a href="${buildConfirmationUrl(existingUser.confirmationToken)}">Open the latest confirmation link</a>.`
            : "";
        setStatus(
          status,
          "error",
          `We already have an account for <strong>${escapeHtml(email)}</strong>.${confirmationLink}`,
        );
        hasError = true;
      }

      if (hasError) {
        if (!status.hidden || status.innerHTML) {
          return;
        }
        setStatus(status, "error", "Fix the highlighted fields and try again.");
        return;
      }

      if (isSupabaseConfigured()) {
        setAuthPersistencePreference(true);
        rememberPendingRole(grantedRole);

        const client = await getSupabaseClient();
        let data;
        let error;

        try {
          ({ data, error } = await withNetworkTimeout(
            client.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: buildSupabaseEmailRedirectUrl(),
                data: {
                  display_name: buildDisplayName(email) || "School User",
                  role: grantedRole,
                  workspace_id: signupWorkspaceId,
                },
              },
            }),
          ));
        } catch (requestError) {
          setStatus(
            status,
            "error",
            formatSupabaseAuthError(requestError, "We couldn't create your account."),
          );
          return;
        }

        if (error) {
          setStatus(status, "error", formatSupabaseAuthError(error, "We couldn't create your account."));
          return;
        }

        if (data?.session) {
          await syncSupabaseSessionToLocal({
            preferredRole: grantedRole,
            preferredWorkspaceId: signupWorkspaceId,
            redirectAuthenticatedAuthPages: false,
          });
          clearFormDraftFor(form);
          window.location.assign(getRoleHomeRoute(grantedRole));
          return;
        }

        form.reset();
        clearFormDraftFor(form);
        markAccessGrantClaimed(email, grantedRole, "password", data?.user?.id || null, signupWorkspaceId);
        setStatus(
          status,
          "success",
          `Supabase has sent a confirmation email to <strong>${escapeHtml(
            email,
          )}</strong>. Confirm it, then return to sign in.`,
        );
        return;
      }

      const confirmationToken = createToken();
      const user = {
        id: createId(),
        email,
        normalizedEmail: normalizeEmail(email),
        workspaceId: signupWorkspaceId,
        displayName: buildDisplayName(email) || "School User",
        passwordHash: await hashSecret(password),
        provider: "password",
        role: grantedRole,
        isConfirmed: false,
        confirmationToken,
        confirmationSentAt: nowIso(),
        confirmedAt: null,
        createdAt: nowIso(),
        lastLoginAt: null,
        status: "active",
      };

      const users = getUsers();
      users.push(user);
      saveUsers(users);
      storeConfirmationMail(user);
      markAccessGrantClaimed(user.email, user.role, "password", user.id, user.workspaceId);

      form.reset();
      clearFormDraftFor(form);
      setStatus(
        status,
        "success",
        `Confirmation email sent to <strong>${escapeHtml(user.email)}</strong>. <a href="${buildConfirmationUrl(
          confirmationToken,
        )}">Open the confirmation link</a> to activate this prototype account.`,
      );
    });
  }

  function initLoginFlow() {
    if (getPage() !== "login") {
      return;
    }

    const form = document.getElementById("login-form");
    const status = document.getElementById("login-status");

    if (!form || !status) {
      return;
    }

    const guardNotice = getAccessGuardNotice();

    if (guardNotice) {
      setStatus(status, "info", guardNotice);
    }

    form.addEventListener("input", () => {
      clearFieldErrors(form);
      setStatus(status, "", "");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearFieldErrors(form);
      setStatus(status, "", "");

      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      const remember = form.elements.remember.checked;
      const selectedRole = getSelectedRole();

      let hasError = false;

      if (!email) {
        setFieldError(form, "email", "Enter your school email address.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(email)) {
        setFieldError(form, "email", "Enter a valid email address.");
        hasError = true;
      }

      if (!password) {
        setFieldError(form, "password", "Enter your password.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Enter your login details to continue.");
        return;
      }

      if (isSupabaseConfigured()) {
        setAuthPersistencePreference(remember);
        rememberPendingRole(selectedRole);

        const client = await getSupabaseClient();
        let data;
        let error;

        try {
          ({ data, error } = await withNetworkTimeout(
            client.auth.signInWithPassword({
              email,
              password,
            }),
          ));
        } catch (requestError) {
          setStatus(
            status,
            "error",
            formatSupabaseAuthError(requestError, "We could not sign you in with those credentials."),
          );
          return;
        }

        if (error) {
          const friendlyMessage = formatSupabaseAuthError(
            error,
            "We could not sign you in with those credentials.",
          );

          if (/incorrect|invalid login credentials/i.test(friendlyMessage)) {
            const fallbackUser = findUserByEmail(email);

            if (
              fallbackUser &&
              !isUserDeactivated(fallbackUser) &&
              fallbackUser.provider !== "google" &&
              fallbackUser.isConfirmed &&
              fallbackUser.passwordHash
            ) {
              const passwordHash = await hashSecret(password);

              if (passwordHash === fallbackUser.passwordHash) {
                const fallbackRole = normalizeRoleLabel(fallbackUser.role || DEFAULT_AUTH_ROLE);

                if (selectedRole !== fallbackRole) {
                  setStatus(
                    status,
                    "error",
                    `This account is registered as <strong>${escapeHtml(
                      fallbackRole,
                    )}</strong>. Switch role to continue.`,
                  );
                  return;
                }

                const updatedFallbackUser = updateUser(fallbackUser.id, (currentUser) => ({
                  ...currentUser,
                  lastLoginAt: nowIso(),
                }));

                setSession(
                  {
                    userId: updatedFallbackUser.id,
                    email: updatedFallbackUser.email,
                    displayName: updatedFallbackUser.displayName,
                    role: fallbackRole,
                    provider: updatedFallbackUser.provider,
                    workspaceId: updatedFallbackUser.workspaceId,
                    persistence: remember ? "persistent" : "session",
                    signedInAt: nowIso(),
                    source: "local-fallback",
                  },
                  remember,
                );

                clearFormDraftFor(form);
                window.location.assign(getPostLoginRoute(fallbackRole, updatedFallbackUser));
                return;
              }
            }

            setFieldError(form, "password", "Incorrect email or password.");
          }

          setStatus(status, "error", friendlyMessage);
          return;
        }

        const provisionedRole = getProvisioningGrant(email, null, "password")?.role || null;
        const localUserRole = findUserByEmail(email)?.role || null;
        const resolvedRole = normalizeRoleLabel(
          data?.user?.user_metadata?.role ||
            provisionedRole ||
            localUserRole ||
            DEFAULT_AUTH_ROLE,
        );

        if (selectedRole !== resolvedRole) {
          await client.auth.signOut();
          clearSession();
          setStatus(
            status,
            "error",
            `This account is registered as <strong>${escapeHtml(
              resolvedRole,
            )}</strong>. Switch role to continue.`,
          );
          return;
        }

        const authResult = await syncSupabaseSessionToLocal({
          preferredRole: resolvedRole,
          redirectAuthenticatedAuthPages: false,
        });

        if (!authResult?.user) {
          const guardMessage = sessionStorage.getItem(ACCESS_GUARD_NOTICE_KEY);
          setStatus(
            status,
            "error",
            guardMessage || "Sign-in could not be completed. Confirm your role and account access.",
          );
          return;
        }

        const signedInRole = normalizeRoleLabel(authResult.user.role || DEFAULT_AUTH_ROLE);

        if (signedInRole !== selectedRole) {
          await client.auth.signOut();
          clearSession();
          setStatus(
            status,
            "error",
            `This account is registered as <strong>${escapeHtml(
              signedInRole,
            )}</strong>. Switch role to continue.`,
          );
          return;
        }

        clearFormDraftFor(form);
        window.location.assign(getPostLoginRoute(signedInRole, authResult.user));
        return;
      }

      const user = findUserByEmail(email);

      if (!user) {
        setFieldError(form, "email", "No account was found with that email.");
        setStatus(status, "error", "We could not find an account with those credentials.");
        return;
      }

      if (isUserDeactivated(user)) {
        setStatus(status, "error", "This account is deactivated. Contact an administrator for reactivation.");
        return;
      }

      if (user.provider === "google") {
        setStatus(
          status,
          "info",
          `This account uses Google sign-in. Use <strong>Continue with Google</strong> instead.`,
        );
        return;
      }

      if (!user.isConfirmed && user.confirmationToken) {
        setStatus(
          status,
          "error",
          `Please confirm your email before signing in. <a href="${buildConfirmationUrl(
            user.confirmationToken,
          )}">Open the confirmation link</a>.`,
        );
        return;
      }

      const passwordHash = await hashSecret(password);

      if (passwordHash !== user.passwordHash) {
        setFieldError(form, "password", "Incorrect password.");
        setStatus(status, "error", "Your email or password is incorrect.");
        return;
      }

      const userRole = normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE);

      if (selectedRole !== userRole) {
        setStatus(
          status,
          "error",
          `This account is registered as <strong>${escapeHtml(
            userRole,
          )}</strong>. Switch role to continue.`,
        );
        return;
      }

      const updatedUser = updateUser(user.id, (currentUser) => ({
        ...currentUser,
        lastLoginAt: nowIso(),
      }));

      setSession(
        {
          userId: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          role: userRole,
          provider: updatedUser.provider,
          workspaceId: updatedUser.workspaceId,
          persistence: remember ? "persistent" : "session",
          signedInAt: nowIso(),
        },
        remember,
      );

      clearFormDraftFor(form);
      window.location.assign(getPostLoginRoute(userRole, updatedUser));
    });
  }

  function ensureGoogleModal() {
    let modal = document.getElementById("auth-google-modal");

    if (modal) {
      return modal;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="auth-modal" id="auth-google-modal" hidden>
        <div class="auth-modal-scrim" data-auth-modal-close></div>
        <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-google-title">
          <button class="auth-modal-close" type="button" data-auth-modal-close aria-label="Close">&times;</button>
          <span class="auth-modal-kicker">Google Account</span>
          <h2 id="auth-google-title" class="auth-modal-title">Continue with Google</h2>
          <p class="auth-modal-copy" id="auth-google-copy">
            Enter the Google account email you want to use with this prototype.
          </p>
          <form id="auth-google-form" class="auth-modal-form" novalidate>
            <input id="auth-google-email" name="email" type="email" placeholder="name@gmail.com" autocomplete="email" />
            <p id="auth-google-error" class="auth-field-error"></p>
            <div class="auth-modal-actions">
              <button class="button button-outline" type="button" data-auth-modal-close>Cancel</button>
              <button class="button button-primary" type="submit">Continue</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild);
    modal = document.getElementById("auth-google-modal");

    modal.querySelectorAll("[data-auth-modal-close]").forEach((button) => {
      button.addEventListener("click", () => closeGoogleModal());
    });

    modal.querySelector("#auth-google-form").addEventListener("submit", handleGoogleSubmit);

    return modal;
  }

  function openGoogleModal(mode) {
    const modal = ensureGoogleModal();
    const title = modal.querySelector("#auth-google-title");
    const copy = modal.querySelector("#auth-google-copy");
    const error = modal.querySelector("#auth-google-error");
    const emailInput = modal.querySelector("#auth-google-email");

    modal.dataset.mode = mode;
    title.textContent =
      mode === "signup" ? "Create your account with Google" : "Continue with Google";
    copy.textContent =
      mode === "signup"
        ? "Use any Google account you want to connect to this prototype school workspace."
        : "Use the Google account linked to your school workspace.";
    error.textContent = "";
    emailInput.value = "";
    modal.hidden = false;
    document.body.classList.add("auth-modal-open");
    emailInput.focus();
  }

  function closeGoogleModal() {
    const modal = document.getElementById("auth-google-modal");

    if (!modal) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("auth-modal-open");
  }

  async function startSupabaseGoogleAuth(mode) {
    const page = getPage();
    const status = document.getElementById(page === "signup" ? "signup-status" : "login-status");
    const rememberCheckbox = document.getElementById("login-remember");
    const remember = page === "login" ? Boolean(rememberCheckbox?.checked) : true;
    const selectedRole = page === "login" ? getSelectedRole() : null;

    setAuthPersistencePreference(remember);
    if (selectedRole) {
      rememberPendingRole(selectedRole);
    }

    const client = await getSupabaseClient();
    let error;

    try {
      ({ error } = await withNetworkTimeout(
        client.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: buildSupabaseRedirectUrl(),
          },
        }),
      ));
    } catch (requestError) {
      error = requestError;
    }

    if (error && status) {
      setStatus(
        status,
        "error",
        formatSupabaseAuthError(error, `We couldn't start Google ${mode === "signup" ? "sign up" : "sign in"}.`),
      );
    }
  }

  async function handleGoogleSubmit(event) {
    event.preventDefault();

    const modal = document.getElementById("auth-google-modal");
    const form = event.currentTarget;
    const error = modal.querySelector("#auth-google-error");
    const email = form.elements.email.value.trim();
    const mode = modal.dataset.mode || "login";
    const selectedRole = mode === "login" ? getSelectedRole() : null;

    error.textContent = "";

    if (!email) {
      error.textContent = "Enter your Google account email address.";
      return;
    }

    if (!isGoogleAuthEmail(email)) {
      error.textContent = "Enter a valid email address to continue with Google.";
      return;
    }

    const users = getUsers();
    const existingUser = users.find((user) => user.normalizedEmail === normalizeEmail(email)) || null;

    if (mode === "signup") {
      if (existingUser) {
        error.textContent =
          existingUser.provider === "google"
            ? "This Google account is already registered. Use login instead."
            : "This email already uses email and password. Sign in with that method instead.";
        return;
      }

      const grantedRole = "Admin";
      const signupWorkspaceId = normalizeWorkspaceId(normalizeEmail(email));

      const user = {
        id: createId(),
        email,
        normalizedEmail: normalizeEmail(email),
        workspaceId: signupWorkspaceId,
        displayName: buildDisplayName(email) || "School User",
        passwordHash: null,
        provider: "google",
        role: grantedRole,
        isConfirmed: true,
        confirmationToken: null,
        confirmationSentAt: null,
        confirmedAt: nowIso(),
        createdAt: nowIso(),
        lastLoginAt: null,
        status: "active",
      };

      users.push(user);

      user.lastLoginAt = nowIso();
      saveUsers(users);
      markAccessGrantClaimed(user.email, user.role, "google", user.id, user.workspaceId);
      setSession(
        {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          provider: user.provider,
          workspaceId: user.workspaceId,
          persistence: "persistent",
          signedInAt: nowIso(),
        },
        true,
      );

      closeGoogleModal();
      if (getPage() === "signup") {
        clearFormDraft("signup-form");
      }
      window.location.assign(getRoleHomeRoute(user.role));
      return;
    }

    if (!existingUser) {
      error.textContent = "No Google account was found with this email yet. Create one from the sign-up page first.";
      return;
    }

    if (existingUser.provider !== "google") {
      error.textContent = "This account was created with email and password. Use that login method instead.";
      return;
    }

    if (isUserDeactivated(existingUser)) {
      error.textContent = "This account is deactivated. Contact an administrator for reactivation.";
      return;
    }

    const existingRole = normalizeRoleLabel(existingUser.role || DEFAULT_AUTH_ROLE);

    if (selectedRole && selectedRole !== existingRole) {
      error.textContent = `This account is registered as ${existingRole}. Switch role and try again.`;
      return;
    }

    existingUser.lastLoginAt = nowIso();
    saveUsers(users);
    setSession(
      {
        userId: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.displayName,
        role: existingRole,
        provider: existingUser.provider,
        workspaceId: existingUser.workspaceId,
        persistence: "persistent",
        signedInAt: nowIso(),
      },
      true,
    );

    closeGoogleModal();
    if (getPage() === "login") {
      clearFormDraft("login-form");
    }
    window.location.assign(getRoleHomeRoute(existingRole));
  }

  function initGoogleButtons() {
    document.querySelectorAll("[data-google-auth]").forEach((button) => {
      button.addEventListener("click", async () => {
        const mode = button.dataset.googleAuth || "login";

        if (isSupabaseConfigured()) {
          await startSupabaseGoogleAuth(mode);
          return;
        }

        openGoogleModal(mode);
      });
    });
  }

  function initConfirmPage() {
    if (getPage() !== "confirm-email") {
      return;
    }

    const status = document.getElementById("confirm-status");
    const heading = document.getElementById("confirm-heading");
    const copy = document.getElementById("confirm-copy");
    const details = document.getElementById("confirm-details");
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!status || !heading || !copy || !details) {
      return;
    }

    if (!token) {
      setStatus(status, "error", "This confirmation link is missing a token.");
      heading.textContent = "We could not confirm this account.";
      copy.textContent = "Open the confirmation link from your registration message and try again.";
      return;
    }

    const users = getUsers();
    const user = users.find((entry) => entry.confirmationToken === token);

    if (!user) {
      setStatus(status, "error", "That confirmation link is no longer valid.");
      heading.textContent = "This link has expired or was already used.";
      copy.textContent = "If you still need access, register again or use the latest confirmation link.";
      return;
    }

    user.isConfirmed = true;
    user.confirmedAt = nowIso();
    user.confirmationToken = null;
    saveUsers(users);

    setStatus(status, "success", "Your email address is now confirmed.");
    heading.textContent = "Account confirmed.";
    copy.textContent = "You can now sign in with your email and password. Redirecting to login...";
    details.innerHTML = `
      <div class="utility-item">
        <span>Confirmed account</span>
        <strong>${escapeHtml(user.email)}</strong>
      </div>
      <div class="utility-item">
        <span>Auth method</span>
        <strong>Email and password</strong>
      </div>
    `;

    window.setTimeout(() => {
      window.location.assign("./login.html");
    }, 1400);
  }

  function initAdmissionsApplyPage() {
    if (getPage() !== "admissions-apply") {
      return;
    }

    const form = document.getElementById("admissions-apply-form");
    const status = document.getElementById("admissions-apply-status");
    const workspaceInput = document.getElementById("admissions-workspace-id");
    const pageCopy = document.getElementById("admissions-apply-copy");
    const stepIndicator = document.getElementById("admissions-step-indicator");
    const reviewPanel = document.getElementById("admissions-review-panel");
    const healthConditionSelect = document.getElementById("apply-health-condition");
    const healthConditionDetailsWrap = document.getElementById("health-condition-details-wrap");
    const healthConditionDetailsInput = document.getElementById("apply-health-condition-details");
    const admissionConfigManager = getAdmissionConfigManager();
    const applyingClassSelect = form?.elements?.academicClassApplyingFor || null;

    if (!form || !status || !workspaceInput) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const rawWorkspace = String(params.get("workspace") || "").trim();
    const rawInstitutionId = String(params.get("institution") || "").trim();
    const prefilledWorkspace = rawWorkspace ? normalizeWorkspaceId(rawWorkspace) : "";
    const prefilledInstitutionId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      rawInstitutionId,
    )
      ? rawInstitutionId
      : "";
    const lockedWorkspaceId =
      prefilledWorkspace && prefilledWorkspace !== "public" ? prefilledWorkspace : "";
    const lockedInstitutionId = prefilledInstitutionId;

    if (lockedWorkspaceId) {
      workspaceInput.value = lockedWorkspaceId;
      if (pageCopy) {
        pageCopy.textContent = "Complete the sections below and submit for school admin review.";
      }
    } else if (pageCopy) {
      pageCopy.textContent = "Use the official school application link to open this form.";
    }

    const stepSections = Array.from(form.querySelectorAll("[data-admissions-step]"));
    let activeStepIndex = 0;

    const refreshPublicAdmissionClassOptions = () => {
      const admissionConfig =
        admissionConfigManager && typeof admissionConfigManager.summarize === "function"
          ? admissionConfigManager.summarize()
          : null;
      const activeClassNames = (admissionConfig?.activeClasses || [])
        .map((entry) => entry.name)
        .filter(Boolean);
      syncAdmissionClassFieldOptions(activeClassNames, applyingClassSelect, {
        placeholder: "Select class applying for",
        emptyLabel: "No admission classes are open",
      });
    };

    const readFileName = (fieldName) => {
      const file = form.elements[fieldName]?.files?.[0];
      return file ? String(file.name || "").trim() : "";
    };

    const getPayload = () => {
      const firstName = String(form.elements.firstName?.value || "").trim();
      const middleName = String(form.elements.middleName?.value || "").trim();
      const lastName = String(form.elements.lastName?.value || "").trim();
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
      const academicClassApplyingFor = String(form.elements.academicClassApplyingFor?.value || "").trim();

      return {
        fullName,
        firstName,
        middleName,
        lastName,
        gender: String(form.elements.gender?.value || "").trim(),
        dateOfBirth: String(form.elements.dateOfBirth?.value || "").trim(),
        classApplyingFor: academicClassApplyingFor,
        previousSchool: String(form.elements.previousSchoolName?.value || "").trim(),
        passportPhotoName: readFileName("passportPhoto"),
        email: String(form.elements.email?.value || "").trim(),
        phone: String(form.elements.phone?.value || "").trim(),
        level: academicClassApplyingFor,
        guardianName: String(form.elements.guardianFullName?.value || "").trim(),
        guardianFullName: String(form.elements.guardianFullName?.value || "").trim(),
        guardianRelationship: String(form.elements.guardianRelationship?.value || "").trim(),
        guardianEmail: String(form.elements.guardianEmail?.value || "").trim(),
        guardianPhone: String(form.elements.guardianPhone?.value || "").trim(),
        guardianAddress: String(form.elements.guardianAddress?.value || "").trim(),
        guardianOccupation: String(form.elements.guardianOccupation?.value || "").trim(),
        lastClassAttended: String(form.elements.lastClassAttended?.value || "").trim(),
        academicClassApplyingFor,
        previousSchoolName: String(form.elements.previousSchoolName?.value || "").trim(),
        previousSchoolAddress: String(form.elements.previousSchoolAddress?.value || "").trim(),
        healthCondition: String(form.elements.healthCondition?.value || "").trim(),
        healthConditionDetails: String(form.elements.healthConditionDetails?.value || "").trim(),
        healthAllergies: String(form.elements.healthAllergies?.value || "").trim(),
        healthMedications: String(form.elements.healthMedications?.value || "").trim(),
        docPreviousReportName: readFileName("docPreviousReport"),
        docBirthCertificateName: readFileName("docBirthCertificate"),
        docPreviousSchoolResultName: readFileName("docPreviousSchoolResult"),
        docTransferCertificateName: readFileName("docTransferCertificate"),
        docPassportPhotographName: readFileName("docPassportPhotograph"),
        docOtherName: readFileName("docOther"),
        notes: String(form.elements.notes?.value || "").trim(),
        status: "pending",
        source: "public-apply",
      };
    };

    const toggleHealthConditionDetails = () => {
      if (!healthConditionSelect || !healthConditionDetailsWrap) {
        return;
      }

      const needsDetails = String(healthConditionSelect.value || "").trim().toLowerCase() === "yes";
      healthConditionDetailsWrap.hidden = !needsDetails;

      if (healthConditionDetailsInput) {
        healthConditionDetailsInput.toggleAttribute("required", needsDetails);
        if (!needsDetails) {
          healthConditionDetailsInput.value = "";
        }
      }
    };

    const renderReviewPanel = () => {
      if (!reviewPanel) {
        return;
      }

      const payload = getPayload();
      const documentNames = [
        payload.passportPhotoName,
        payload.docPreviousReportName,
        payload.docBirthCertificateName,
        payload.docPreviousSchoolResultName,
        payload.docTransferCertificateName,
        payload.docPassportPhotographName,
        payload.docOtherName,
      ].filter(Boolean);

      reviewPanel.innerHTML = `
        <div class="admissions-review-group">
          <h4>Student Details</h4>
          <p><strong>Name:</strong> ${escapeHtml(payload.fullName || "—")}</p>
          <p><strong>Gender:</strong> ${escapeHtml(payload.gender || "—")}</p>
          <p><strong>Date of Birth:</strong> ${escapeHtml(payload.dateOfBirth || "—")}</p>
        </div>
        <div class="admissions-review-group">
          <h4>Parent/Guardian</h4>
          <p><strong>Full Name:</strong> ${escapeHtml(payload.guardianFullName || "—")}</p>
          <p><strong>Relationship:</strong> ${escapeHtml(payload.guardianRelationship || "—")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(payload.guardianPhone || "—")}</p>
          <p><strong>Email:</strong> ${escapeHtml(payload.guardianEmail || "—")}</p>
          <p><strong>Address:</strong> ${escapeHtml(payload.guardianAddress || "—")}</p>
          <p><strong>Occupation:</strong> ${escapeHtml(payload.guardianOccupation || "—")}</p>
        </div>
        <div class="admissions-review-group">
          <h4>Academic Background</h4>
          <p><strong>Last Class Attended:</strong> ${escapeHtml(payload.lastClassAttended || "—")}</p>
          <p><strong>Class Applying For:</strong> ${escapeHtml(payload.academicClassApplyingFor || "—")}</p>
          <p><strong>Previous School Name:</strong> ${escapeHtml(payload.previousSchoolName || "—")}</p>
          <p><strong>Previous School Address:</strong> ${escapeHtml(payload.previousSchoolAddress || "—")}</p>
        </div>
        <div class="admissions-review-group">
          <h4>Health Information</h4>
          <p><strong>Existing Medical Condition:</strong> ${escapeHtml(payload.healthCondition || "—")}</p>
          <p><strong>Medical Condition Details:</strong> ${escapeHtml(payload.healthConditionDetails || "—")}</p>
          <p><strong>Allergies:</strong> ${escapeHtml(payload.healthAllergies || "—")}</p>
          <p><strong>Current Medications:</strong> ${escapeHtml(payload.healthMedications || "—")}</p>
        </div>
        <div class="admissions-review-group">
          <h4>Document Uploads</h4>
          <p>${escapeHtml(documentNames.join(", ") || "No documents selected.")}</p>
        </div>
      `;
    };

    const setStep = (index) => {
      if (!stepSections.length) {
        return;
      }

      const boundedIndex = Math.max(0, Math.min(index, stepSections.length - 1));
      activeStepIndex = boundedIndex;
      stepSections.forEach((section, sectionIndex) => {
        section.hidden = sectionIndex !== boundedIndex;
      });

      if (stepIndicator) {
        stepIndicator.textContent = `Section ${boundedIndex + 1} of ${stepSections.length}`;
      }

      if (boundedIndex === stepSections.length - 1) {
        renderReviewPanel();
      }
    };

    const validateStep = (stepIndex, focusStepOnError = true) => {
      const payload = getPayload();
      const workspaceId = lockedWorkspaceId;

      if (!workspaceId || workspaceId === "public") {
        setStatus(
          status,
          "error",
          "This application link is incomplete. Open the official school link/QR provided by the admin.",
        );
        return false;
      }

      if (stepIndex === 0) {
        if (!payload.firstName || !payload.lastName || !payload.gender || !payload.dateOfBirth) {
          setStatus(status, "error", "Complete all required fields in Section 1.");
          return false;
        }
      }

      if (stepIndex === 1) {
        if (
          !payload.guardianFullName ||
          !payload.guardianRelationship ||
          !payload.guardianPhone ||
          !payload.guardianEmail ||
          !payload.guardianAddress ||
          !payload.guardianOccupation
        ) {
          setStatus(status, "error", "Complete all required fields in Section 2.");
          return false;
        }

        if (!EMAIL_REGEX.test(payload.guardianEmail)) {
          setStatus(status, "error", "Guardian email format is invalid.");
          return false;
        }
      }

      if (stepIndex === 2) {
        if (!payload.lastClassAttended || !payload.academicClassApplyingFor) {
          setStatus(status, "error", "Complete all required fields in Section 3.");
          return false;
        }
      }

      if (stepIndex === 3) {
        if (!payload.healthCondition) {
          setStatus(status, "error", "Select whether the student has an existing medical condition.");
          return false;
        }

        if (payload.healthCondition.toLowerCase() === "yes" && !payload.healthConditionDetails) {
          setStatus(status, "error", "List the existing medical condition(s) in Section 4.");
          return false;
        }
      }

      if (focusStepOnError) {
        setStatus(status, "", "");
      }

      return true;
    };

    form.addEventListener("input", () => {
      setStatus(status, "", "");
      if (activeStepIndex === stepSections.length - 1) {
        renderReviewPanel();
      }
    });

    form.addEventListener("change", () => {
      toggleHealthConditionDetails();
      if (activeStepIndex === stepSections.length - 1) {
        renderReviewPanel();
      }
    });

    form.querySelectorAll("[data-admission-step-next]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!validateStep(activeStepIndex, false)) {
          return;
        }
        setStep(activeStepIndex + 1);
      });
    });

    form.querySelectorAll("[data-admission-step-prev]").forEach((button) => {
      button.addEventListener("click", () => {
        setStep(activeStepIndex - 1);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (activeStepIndex !== stepSections.length - 1) {
        if (validateStep(activeStepIndex, false)) {
          setStep(activeStepIndex + 1);
        }
        return;
      }

      for (let step = 0; step < stepSections.length - 1; step += 1) {
        if (!validateStep(step, false)) {
          setStep(step);
          return;
        }
      }

      const workspaceId = lockedWorkspaceId;
      const payload = getPayload();

      if (payload.email && !EMAIL_REGEX.test(payload.email)) {
        setStatus(status, "error", "Applicant email format is invalid.");
        return;
      }

      if (!EMAIL_REGEX.test(payload.guardianEmail)) {
        setStatus(status, "error", "Guardian email format is invalid.");
        return;
      }

      payload.level = payload.classApplyingFor || payload.academicClassApplyingFor;
      const admissionConfig =
        admissionConfigManager && typeof admissionConfigManager.summarize === "function"
          ? admissionConfigManager.summarize()
          : null;
      const openAdmissionSession = admissionConfig?.openSession || null;
      const firstActiveStage = (admissionConfig?.activeStages || [])[0] || null;
      payload.admissionSessionId = openAdmissionSession?.id || "";
      payload.admissionSessionName = openAdmissionSession?.name || "";
      payload.applicationStage = firstActiveStage?.name || "Submitted";

      let savedPayload = payload;

      if (isSupabaseConfigured()) {
        const remoteSubmitResult = await submitPublicAdmissionToSupabase({
          workspaceId,
          institutionId: lockedInstitutionId,
          payload,
        });

        if (!remoteSubmitResult.ok) {
          setStatus(status, "error", escapeHtml(remoteSubmitResult.message || "Could not submit application."));
          return;
        }

        if (remoteSubmitResult.record && typeof remoteSubmitResult.record === "object") {
          savedPayload = {
            ...payload,
            ...remoteSubmitResult.record,
          };
        }
      }

      const admissions = upsertAdmission(savedPayload, workspaceId);
      const latest = admissions[0] || savedPayload;
      pushNotification(
        {
          title: `New application: ${savedPayload.fullName}`,
          message: `${savedPayload.level} application submitted by guardian ${savedPayload.guardianFullName}.`,
          entityType: "admission-application",
          entityId: latest.id || "",
          action: "submitted",
          visibleToRoles: ["Admin"],
        },
        workspaceId,
      );

      form.reset();
      workspaceInput.value = workspaceId;
      toggleHealthConditionDetails();
      refreshPublicAdmissionClassOptions();
      setStep(0);
      clearFormDraftFor(form);
      setStatus(
        status,
        "success",
        `Application submitted successfully for <strong>${escapeHtml(savedPayload.fullName)}</strong>. The school admin will review and update the status.`,
      );
    });

    toggleHealthConditionDetails();
    refreshPublicAdmissionClassOptions();
    if (admissionConfigManager?.eventName) {
      window.addEventListener(admissionConfigManager.eventName, refreshPublicAdmissionClassOptions);
    }
    setStep(0);

    if (!lockedWorkspaceId) {
      setStatus(
        status,
        "info",
        "Open this form using the school-provided application link or QR so the workspace is auto-selected.",
      );
    }
  }

  function renderTeacherAttendanceWorkspace(target, user) {
    if (!target) {
      return;
    }

    const manager = getAttendanceManager();
    const assignedClasses = getTeacherAssignedClasses(user);
    const selectedDate = target.dataset.attendanceDate || getTodayDateValue();
    const flashMessage = target.dataset.attendanceFlash || "";
    delete target.dataset.attendanceFlash;
    const selectedClassId = assignedClasses.some((classRecord) => classRecord.id === target.dataset.attendanceClassId)
      ? target.dataset.attendanceClassId
      : assignedClasses[0]?.id || "";
    const selectedClass = assignedClasses.find((classRecord) => classRecord.id === selectedClassId) || null;
    const roster = selectedClass ? getActiveStudentsForClass(selectedClass) : [];
    const existingRecord =
      manager && selectedClass && typeof manager.getRecordForClassDate === "function"
        ? manager.getRecordForClassDate(selectedClass.id, selectedDate)
        : null;
    const existingEntries = getAttendanceRecordEntryMap(existingRecord);
    const submittedCount = existingRecord?.entries?.length || 0;
    const markedLabel = selectedClass
      ? `${submittedCount || 0}/${roster.length || 0}`
      : "0/0";

    target.hidden = false;
    target.dataset.attendanceDate = selectedDate;
    target.dataset.attendanceClassId = selectedClassId;

    if (!manager) {
      target.innerHTML = `
        <article class="admin-surface-card">
          <div class="admin-surface-head">
            <h2>Class Attendance</h2>
            <span>Unavailable</span>
          </div>
          <article class="portal-class-empty">
            <strong>Attendance tools unavailable</strong>
            <p>The attendance manager could not be loaded on this page.</p>
          </article>
        </article>
      `;
      return;
    }

    target.innerHTML = `
      <article class="admin-surface-card teacher-attendance-card">
        <div class="admin-surface-head">
          <div>
            <h2>Class Attendance</h2>
            <span>Take attendance for classes assigned to you.</span>
          </div>
          <span class="portal-class-status ${existingRecord ? "is-active" : "is-pending"}">
            ${existingRecord ? "Submitted" : "Not submitted"}
          </span>
        </div>

        <div class="portal-class-summary teacher-attendance-summary">
          <article class="portal-class-stat portal-class-stat-blue">
            <span>Assigned classes</span>
            <strong>${assignedClasses.length}</strong>
            <p>Classes where you are class teacher, subject teacher, or course teacher.</p>
          </article>
          <article class="portal-class-stat portal-class-stat-green">
            <span>Marked today</span>
            <strong>${escapeHtml(markedLabel)}</strong>
            <p>${selectedClass ? escapeHtml(getClassDisplayName(selectedClass)) : "Select a class to start."}</p>
          </article>
          <article class="portal-class-stat portal-class-stat-amber">
            <span>Register date</span>
            <strong>${escapeHtml(selectedDate)}</strong>
            <p>${existingRecord ? `Last submitted ${escapeHtml(formatTimestamp(existingRecord.takenAt))}` : "No register saved for this date yet."}</p>
          </article>
        </div>

        <div class="attendance-toolbar">
          <label class="portal-field" for="teacher-attendance-date">
            <span>Date</span>
            <input id="teacher-attendance-date" type="date" value="${escapeHtml(selectedDate)}" data-teacher-attendance-date />
          </label>
          <label class="portal-field" for="teacher-attendance-class">
            <span>Class</span>
            <select id="teacher-attendance-class" data-teacher-attendance-class>
              ${
                assignedClasses.length
                  ? assignedClasses
                      .map(
                        (classRecord) => `
                          <option value="${escapeHtml(classRecord.id)}" ${classRecord.id === selectedClassId ? "selected" : ""}>
                            ${escapeHtml(getClassDisplayName(classRecord))}
                          </option>
                        `,
                      )
                      .join("")
                  : `<option value="">No assigned classes</option>`
              }
            </select>
          </label>
          <div class="attendance-toolbar-actions">
            <button class="portal-class-button" type="button" data-attendance-mark-all ${roster.length ? "" : "disabled"}>
              Mark all present
            </button>
          </div>
        </div>

        <form class="teacher-attendance-form" data-teacher-attendance-form>
          ${
            selectedClass && roster.length
              ? `
                <div class="teacher-attendance-list">
                  ${roster
                    .map((student) => {
                      const existing = existingEntries.get(student.id) || {};
                      const selectedStatus = normalizeAttendanceStatus(existing.status || "present");
                      return `
                        <article class="attendance-student-row" data-attendance-student-row data-student-id="${escapeHtml(student.id)}">
                          <div class="attendance-student-main">
                            <strong>${escapeHtml(student.fullName)}</strong>
                            <span>${escapeHtml(student.admissionNo || "No admission no.")} • ${escapeHtml(student.level || selectedClass.level)}</span>
                          </div>
                          <div class="attendance-status-picker" role="radiogroup" aria-label="Attendance status for ${escapeHtml(student.fullName)}">
                            ${ATTENDANCE_STATUSES.map(
                              (status) => `
                                <label class="attendance-status-option ${status === selectedStatus ? "is-selected" : ""} ${getAttendanceStatusClass(status)}">
                                  <input type="radio" name="attendance-${escapeHtml(student.id)}" value="${escapeHtml(status)}" ${
                                    status === selectedStatus ? "checked" : ""
                                  } />
                                  <span>${escapeHtml(getAttendanceStatusLabel(status))}</span>
                                </label>
                              `,
                            ).join("")}
                          </div>
                          <input class="attendance-note-input" type="text" placeholder="Optional note" value="${escapeHtml(existing.note || "")}" data-attendance-note />
                        </article>
                      `;
                    })
                    .join("")}
                </div>
                <div class="attendance-submit-row">
                  <p id="teacher-attendance-status" class="auth-status" aria-live="polite" hidden></p>
                  <button class="portal-class-button is-restore" type="submit">
                    ${existingRecord ? "Update attendance" : "Submit attendance"}
                  </button>
                </div>
              `
              : `
                <article class="portal-class-empty">
                  <strong>${selectedClass ? "No enrolled students found" : "No class assigned yet"}</strong>
                  <p>${
                    selectedClass
                      ? "Add students to this class level from Student Management before taking attendance."
                      : "Ask an admin to assign you as class teacher, subject teacher, or course teacher."
                  }</p>
                </article>
              `
          }
        </form>
      </article>
    `;

    const dateInput = target.querySelector("[data-teacher-attendance-date]");
    const classSelect = target.querySelector("[data-teacher-attendance-class]");
    const form = target.querySelector("[data-teacher-attendance-form]");
    const statusTarget = target.querySelector("#teacher-attendance-status");

    if (flashMessage && statusTarget) {
      setStatus(statusTarget, "success", flashMessage);
    }

    if (dateInput instanceof HTMLInputElement) {
      dateInput.addEventListener("change", () => {
        target.dataset.attendanceDate = dateInput.value || getTodayDateValue();
        renderTeacherAttendanceWorkspace(target, user);
      });
    }

    if (classSelect instanceof HTMLSelectElement) {
      classSelect.addEventListener("change", () => {
        target.dataset.attendanceClassId = classSelect.value;
        renderTeacherAttendanceWorkspace(target, user);
      });
    }

    target.querySelectorAll(".attendance-status-option input").forEach((input) => {
      input.addEventListener("change", () => {
        const picker = input.closest(".attendance-status-picker");
        picker?.querySelectorAll(".attendance-status-option").forEach((label) => {
          label.classList.toggle("is-selected", label.contains(input) && input.checked);
        });
      });
    });

    const markAllButton = target.querySelector("[data-attendance-mark-all]");
    if (markAllButton) {
      markAllButton.addEventListener("click", () => {
        target.querySelectorAll('.attendance-status-option input[value="present"]').forEach((input) => {
          if (input instanceof HTMLInputElement) {
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    }

    if (form && selectedClass) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const studentLookup = new Map(roster.map((student) => [student.id, student]));
        const entries = Array.from(form.querySelectorAll("[data-attendance-student-row]"))
          .map((row) => {
            const studentId = String(row.dataset.studentId || "").trim();
            const student = studentLookup.get(studentId);
            const checked = row.querySelector('input[type="radio"]:checked');
            const note = row.querySelector("[data-attendance-note]")?.value || "";

            if (!student || !(checked instanceof HTMLInputElement)) {
              return null;
            }

            return {
              studentId: student.id,
              studentName: student.fullName,
              admissionNo: student.admissionNo,
              status: normalizeAttendanceStatus(checked.value),
              note,
            };
          })
          .filter(Boolean);

        if (!entries.length) {
          setStatus(statusTarget, "error", "No student rows are available for this class.");
          return;
        }

        const savedRecords = manager.upsertRecord({
          id: existingRecord?.id,
          date: selectedDate,
          classId: selectedClass.id,
          className: getClassDisplayName(selectedClass),
          level: selectedClass.level,
          submittedById: user.id,
          submittedByEmail: user.email,
          submittedByName: user.displayName || user.email,
          entries,
        });
        const savedRecord =
          savedRecords.find((record) => record.classId === selectedClass.id && record.date === selectedDate) || null;

        recordAuditEvent({
          action: existingRecord ? "updated" : "submitted",
          entityType: "attendance",
          entityId: savedRecord?.id || selectedClass.id,
          summary: `${existingRecord ? "Updated" : "Submitted"} attendance for ${getClassDisplayName(selectedClass)}`,
          details: `${entries.length} student${entries.length === 1 ? "" : "s"} marked by ${
            user.displayName || user.email
          }`,
        });

        target.dataset.attendanceFlash = `Attendance saved for <strong>${escapeHtml(getClassDisplayName(selectedClass))}</strong>.`;
        renderTeacherAttendanceWorkspace(target, user);
      });
    }
  }

  function initAttendanceReviewControls({
    isAdmin,
    manager,
    summaryTarget,
    statusTarget,
    listTarget,
    submissionTarget,
    dateInput,
    classSelect,
    statusSelect,
    searchInput,
  }) {
    if (!summaryTarget || !listTarget || !submissionTarget) {
      return;
    }

    const classManager = getClassManager();
    const studentManager = getStudentManager();
    const getClasses = () =>
      classManager && typeof classManager.getClasses === "function"
        ? classManager.getClasses().filter((record) => record.status !== "archived")
        : [];
    const getStudents = () =>
      studentManager && typeof studentManager.getStudents === "function"
        ? studentManager.getStudents().filter((student) => student.status === "active")
        : [];

    if (dateInput instanceof HTMLInputElement && !dateInput.value) {
      dateInput.value = getTodayDateValue();
    }

    const getState = () => ({
      date: dateInput instanceof HTMLInputElement ? dateInput.value || getTodayDateValue() : getTodayDateValue(),
      classId: classSelect instanceof HTMLSelectElement ? classSelect.value || "all" : "all",
      status: statusSelect instanceof HTMLSelectElement ? statusSelect.value || "all" : "all",
      search: searchInput instanceof HTMLInputElement ? searchInput.value.trim().toLowerCase() : "",
    });

    const render = () => {
      if (!manager || typeof manager.getRecords !== "function") {
        summaryTarget.innerHTML = "";
        listTarget.innerHTML = `
          <article class="portal-class-empty">
            <strong>Attendance tools unavailable</strong>
            <p>The attendance manager could not be loaded on this page.</p>
          </article>
        `;
        submissionTarget.innerHTML = "";
        return;
      }

      if (!isAdmin) {
        summaryTarget.innerHTML = "";
        listTarget.innerHTML = `
          <article class="portal-class-empty">
            <strong>Admin access required</strong>
            <p>Only administrators can review attendance for all enrolled students.</p>
          </article>
        `;
        submissionTarget.innerHTML = "";
        setStatus(statusTarget, "info", "Teachers can take attendance from their dashboard. Admin review is restricted to administrators.");
        return;
      }

      const state = getState();
      const classes = getClasses();
      const allStudents = getStudents();
      const selectedClass = classes.find((classRecord) => classRecord.id === state.classId) || null;
      const recordsForDate = manager.getRecords().filter((record) => record.date === state.date);
      const scopedRecords = selectedClass
        ? recordsForDate.filter((record) => record.classId === selectedClass.id)
        : recordsForDate;
      const scopedStudents = selectedClass ? getActiveStudentsForClass(selectedClass) : allStudents;
      const summary = summarizeAttendanceForStudents(scopedStudents, scopedRecords);
      const rate = scopedStudents.length
        ? Math.round(((summary.counts.present + summary.counts.late) / scopedStudents.length) * 100)
        : null;
      const submittedClassIds = new Set(recordsForDate.map((record) => record.classId));
      const classesWithStudents = classes.filter((classRecord) => getActiveStudentsForClass(classRecord).length > 0);
      const missingClasses = selectedClass
        ? selectedClass && getActiveStudentsForClass(selectedClass).length && !submittedClassIds.has(selectedClass.id)
          ? 1
          : 0
        : classesWithStudents.filter((classRecord) => !submittedClassIds.has(classRecord.id)).length;

      if (classSelect instanceof HTMLSelectElement) {
        const previousValue = state.classId;
        classSelect.innerHTML = `
          <option value="all">All classes</option>
          ${classes
            .map(
              (classRecord) => `
                <option value="${escapeHtml(classRecord.id)}" ${classRecord.id === previousValue ? "selected" : ""}>
                  ${escapeHtml(getClassDisplayName(classRecord))}
                </option>
              `,
            )
            .join("")}
        `;
        if (!classes.some((classRecord) => classRecord.id === previousValue)) {
          classSelect.value = "all";
        }
      }

      summaryTarget.innerHTML = `
        <article class="portal-class-stat portal-class-stat-blue">
          <span>Enrolled students</span>
          <strong>${scopedStudents.length}</strong>
          <p>${selectedClass ? escapeHtml(getClassDisplayName(selectedClass)) : "Active students across all classes."}</p>
        </article>
        <article class="portal-class-stat portal-class-stat-green">
          <span>Attendance rate</span>
          <strong>${rate === null ? "—" : `${rate}%`}</strong>
          <p>Present and late marks against active enrolment.</p>
        </article>
        <article class="portal-class-stat portal-class-stat-rose">
          <span>Absent</span>
          <strong>${summary.counts.absent || 0}</strong>
          <p>Students marked absent on ${escapeHtml(state.date)}.</p>
        </article>
        <article class="portal-class-stat portal-class-stat-amber">
          <span>Late</span>
          <strong>${summary.counts.late || 0}</strong>
          <p>Students marked late by teachers.</p>
        </article>
        <article class="portal-class-stat portal-class-stat-slate">
          <span>Unmarked</span>
          <strong>${summary.counts.unmarked || 0}</strong>
          <p>Enrolled students without a saved mark.</p>
        </article>
        <article class="portal-class-stat portal-class-stat-violet">
          <span>Missing registers</span>
          <strong>${missingClasses}</strong>
          <p>Classes with enrolled students and no teacher submission.</p>
        </article>
      `;

      const filteredRows = summary.rows.filter(({ student, entry, status }) => {
        if (state.status !== "all" && status !== state.status) {
          return false;
        }

        if (!state.search) {
          return true;
        }

        return [
          student.fullName,
          student.admissionNo,
          student.level,
          status,
          entry?.submittedByName,
          entry?.submittedByEmail,
          entry?.note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(state.search);
      });

      if (!filteredRows.length) {
        listTarget.innerHTML = `
          <article class="portal-class-empty">
            <strong>No attendance rows match this view</strong>
            <p>Try another date, class, status, or search keyword.</p>
          </article>
        `;
      } else {
        const groupedRows = filteredRows.reduce((groups, row) => {
          const level = row.student.level || "Unassigned";
          if (!groups.has(level)) {
            groups.set(level, []);
          }
          groups.get(level).push(row);
          return groups;
        }, new Map());

        listTarget.innerHTML = Array.from(groupedRows.entries())
          .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
          .map(
            ([level, rows]) => `
              <section class="attendance-review-group">
                <header class="attendance-review-group-head">
                  <strong>${escapeHtml(level)}</strong>
                  <span>${rows.length} student${rows.length === 1 ? "" : "s"}</span>
                </header>
                <div class="attendance-review-table">
                  ${rows
                    .map(({ student, entry, status }) => {
                      const chipClass = status === "unmarked" ? "is-unmarked" : getAttendanceStatusClass(status);
                      const label = status === "unmarked" ? "Unmarked" : getAttendanceStatusLabel(status);
                      return `
                        <article class="attendance-review-row">
                          <div class="attendance-review-student">
                            <strong>${escapeHtml(student.fullName)}</strong>
                            <span>${escapeHtml(student.admissionNo || "No admission no.")}</span>
                          </div>
                          <span class="attendance-chip ${chipClass}">${escapeHtml(label)}</span>
                          <div class="attendance-review-meta">
                            <span>Teacher</span>
                            <strong>${escapeHtml(entry?.submittedByName || entry?.submittedByEmail || "No submission")}</strong>
                          </div>
                          <div class="attendance-review-meta">
                            <span>Submitted</span>
                            <strong>${entry?.takenAt ? escapeHtml(formatTimestamp(entry.takenAt)) : "Not yet"}</strong>
                          </div>
                          <div class="attendance-review-note">
                            ${escapeHtml(entry?.note || "No note")}
                          </div>
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `,
          )
          .join("");
      }

      const submissionRecords = scopedRecords.slice().sort((left, right) => {
        return new Date(right.takenAt || right.updatedAt).getTime() - new Date(left.takenAt || left.updatedAt).getTime();
      });

      submissionTarget.innerHTML = submissionRecords.length
        ? submissionRecords
            .map((record) => {
              const counts = (record.entries || []).reduce(
                (sum, entry) => {
                  const status = normalizeAttendanceStatus(entry.status);
                  sum[status] += 1;
                  return sum;
                },
                { present: 0, absent: 0, late: 0, excused: 0 },
              );

              return `
                <article class="attendance-submission-row">
                  <div>
                    <strong>${escapeHtml(record.className || record.level || "Class")}</strong>
                    <span>${escapeHtml(record.submittedByName || record.submittedByEmail || "Unknown teacher")}</span>
                  </div>
                  <div class="attendance-submission-counts">
                    <span class="attendance-chip is-present">${counts.present}</span>
                    <span class="attendance-chip is-absent">${counts.absent}</span>
                    <span class="attendance-chip is-late">${counts.late}</span>
                    <span class="attendance-chip is-excused">${counts.excused}</span>
                  </div>
                  <small>${escapeHtml(formatTimestamp(record.takenAt || record.updatedAt))}</small>
                </article>
              `;
            })
            .join("")
        : `
          <article class="portal-class-empty">
            <strong>No teacher submissions yet</strong>
            <p>Submitted class registers will appear here immediately.</p>
          </article>
        `;

      setStatus(
        statusTarget,
        recordsForDate.length ? "success" : "info",
        recordsForDate.length
          ? `${recordsForDate.length} register${recordsForDate.length === 1 ? "" : "s"} submitted for ${escapeHtml(state.date)}.`
          : `No attendance registers submitted for ${escapeHtml(state.date)} yet.`,
      );
    };

    [dateInput, classSelect, statusSelect, searchInput].forEach((control) => {
      if (!control) {
        return;
      }
      const eventName = control instanceof HTMLInputElement && control.type === "search" ? "input" : "change";
      control.addEventListener(eventName, render);
    });

    if (manager?.eventName) {
      window.addEventListener(manager.eventName, render);
    }
    if (classManager?.eventName) {
      window.addEventListener(classManager.eventName, render);
    }
    if (studentManager?.eventName) {
      window.addEventListener(studentManager.eventName, render);
    }

    render();
  }

  function renderAdminMetricCards(target, snapshot) {
    if (!target) {
      return;
    }

    const cards = [
      {
        tone: "blue",
        label: "Active Students",
        value: formatMetricValue(snapshot.activeStudents),
        note: snapshot.activeStudents === null ? "Awaiting live data" : "Current active enrolment",
        icon: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9.5" cy="7" r="4"></circle>
            <path d="M20 8v6"></path>
            <path d="M23 11h-6"></path>
          </svg>
        `,
      },
      {
        tone: "violet",
        label: "Staff Count",
        value: formatMetricValue(snapshot.staffCount),
        note: snapshot.staffCount === null ? "Awaiting live data" : "Active teacher accounts",
        icon: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2"></rect>
            <circle cx="12" cy="8" r="2.5"></circle>
            <path d="M8.5 16c.8-1.7 2-2.6 3.5-2.6S14.7 14.3 15.5 16"></path>
          </svg>
        `,
      },
      {
        tone: "green",
        label: "Attendance Today",
        value: formatMetricValue(snapshot.attendanceRate, { suffix: "%" }),
        note: snapshot.attendanceRate === null ? "No register submitted yet" : "Present and late marks today",
        icon: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <path d="M16 2v4"></path>
            <path d="M8 2v4"></path>
            <path d="M3 10h18"></path>
            <path d="m9 14 2 2 4-4"></path>
          </svg>
        `,
      },
      {
        tone: "rose",
        label: "Active Incidents",
        value: formatMetricValue(snapshot.activeIncidents),
        note: snapshot.activeIncidents === null ? "Awaiting live data" : "Absent and late marks today",
        icon: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
        `,
      },
    ];

    target.innerHTML = cards
      .map(
        (card) => `
          <article class="admin-metric-card admin-metric-card-${card.tone}">
            <span class="admin-metric-icon" aria-hidden="true">${card.icon}</span>
            <strong>${card.value}</strong>
            <h3>${card.label}</h3>
            <p>${card.note}</p>
          </article>
        `,
      )
      .join("");
  }

  function formatMetricValue(value, options = {}) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "—";
    }

    const suffix = options.suffix || "";
    return `${value.toLocaleString()}${suffix}`;
  }

  function renderAdminEvents(target) {
    if (!target) {
      return;
    }
    const calendarManager = getAcademicCalendarManager();
    const liveEvents =
      calendarManager && typeof calendarManager.getUpcomingEvents === "function"
        ? calendarManager.getUpcomingEvents(4)
        : [];
    const toneByType = {
      term: "blue",
      holiday: "amber",
      exam: "violet",
    };

    if (liveEvents.length) {
      target.innerHTML = liveEvents
        .map((eventItem) => {
          const tone = toneByType[normalizeCalendarType(eventItem.type)] || "blue";
          const dateRange = formatCalendarRange(eventItem.startDate, eventItem.endDate);

          return `
            <article class="admin-event-row">
              <div class="admin-event-time">${escapeHtml(dateRange)}</div>
              <div class="admin-event-copy admin-event-copy-${tone}">
                <strong>${escapeHtml(eventItem.title)}</strong>
                <span>${escapeHtml(getCalendarTypeLabel(eventItem.type))} • Visible to all roles</span>
              </div>
              <button class="admin-event-button admin-event-button-${tone}" type="button">Calendar</button>
            </article>
          `;
        })
        .join("");
      return;
    }

    target.innerHTML = `
      <article class="admin-event-row admin-event-row-empty">
        <div class="admin-event-copy admin-event-copy-blue">
          <strong>No upcoming classes or events yet.</strong>
          <span>Create calendar items in Schedule to populate this section.</span>
        </div>
      </article>
    `;
  }

  function renderAdminActivity(target) {
    if (!target) {
      return;
    }
    const session = getSession();
    const roleLabel = session ? normalizeRoleLabel(session.role || DEFAULT_AUTH_ROLE) : "Guest access";
    const notifications = filterNotificationsByRole(getNotifications(), roleLabel).slice(0, 6);

    if (!notifications.length) {
      target.innerHTML = `
        <article class="admin-activity-row admin-activity-row-empty">
          <div class="admin-activity-copy">
            <p><strong>No recent activity yet.</strong></p>
            <small>School actions will appear here automatically.</small>
          </div>
        </article>
      `;
      return;
    }

    target.innerHTML = notifications
      .map((entry, index) => {
        const tone = ["blue", "violet", "green", "amber"][index % 4];
        return `
          <article class="admin-activity-row">
            <span class="admin-activity-avatar admin-activity-avatar-${tone}">${escapeHtml(
              getInitials(entry.actorName || "System"),
            )}</span>
            <div class="admin-activity-copy">
              <p><strong>${escapeHtml(entry.actorName || "System")}</strong> ${escapeHtml(
                entry.title || "updated the system",
              )}</p>
              <small>${escapeHtml(formatTimestamp(entry.createdAt || nowIso()))}</small>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function buildDashboardFallbackNotifications() {
    return [];
  }

  function renderNotificationList(target, notifications = []) {
    if (!target) {
      return;
    }

    if (!notifications.length) {
      target.innerHTML = `
        <article class="admin-notification-empty">
          <strong>No notifications yet</strong>
          <p>System activities will appear here as admins and users work in the platform.</p>
        </article>
      `;
      return;
    }

    target.innerHTML = notifications
      .map(
        (entry) => `
          <article class="admin-notification-item">
            <div class="admin-notification-item-main">
              <strong>${escapeHtml(entry.title || "System activity")}</strong>
              <span>${escapeHtml(
                `${entry.entityType || "system"} • ${entry.action || "updated"}`.replaceAll("_", " "),
              )}</span>
              <p>${escapeHtml(entry.message || "Activity captured in the school system.")}</p>
            </div>
            <small>${escapeHtml(entry.actorName || "System")} • ${escapeHtml(
              formatTimestamp(entry.createdAt || nowIso()),
            )}</small>
          </article>
        `,
      )
      .join("");
  }

  function ensureDashboardNotificationsOverlay() {
    let overlay = document.getElementById("admin-notification-overlay");

    if (overlay) {
      return overlay;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="admin-notification-overlay" class="admin-notification-overlay" hidden>
        <button class="admin-notification-backdrop" type="button" data-notification-close aria-label="Close notifications"></button>
        <section class="admin-notification-panel" role="dialog" aria-modal="true" aria-labelledby="admin-notification-title">
          <header class="admin-notification-head">
            <div>
              <span>Notifications</span>
              <h2 id="admin-notification-title">Recent notifications</h2>
            </div>
            <button class="admin-notification-close" type="button" data-notification-close aria-label="Close notifications">&times;</button>
          </header>
          <div id="admin-notification-list" class="admin-notification-list"></div>
          <div class="admin-notification-actions">
            <button class="admin-signout-button" type="button" data-notification-close>Cancel</button>
          </div>
        </section>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild);
    overlay = document.getElementById("admin-notification-overlay");
    return overlay;
  }

  function normalizeDashboardSearchText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function addDashboardSearchEntry(entries, entry = {}) {
    const title = String(entry.title || "").trim();

    if (!title) {
      return;
    }

    const subtitle = String(entry.subtitle || "").trim();
    const type = String(entry.type || "Result").trim();
    const href = String(entry.href || "./portal.html").trim();
    const keywords = [
      title,
      subtitle,
      type,
      entry.keywords || "",
      entry.icon || "",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    entries.push({
      title,
      subtitle,
      type,
      href,
      keywords,
      icon: String(entry.icon || getInitials(title).slice(0, 2) || "SR").trim(),
    });
  }

  function canSearchDashboardArea(session, roleLabel, permissionKey) {
    return !session || canAccessPermission(roleLabel, permissionKey);
  }

  function buildDashboardSearchEntries(session, roleLabel) {
    const entries = [];
    const workspaceId = normalizeWorkspaceId(session?.workspaceId || getCurrentWorkspaceId());
    const normalizedRole = normalizeRoleLabel(roleLabel || session?.role || DEFAULT_AUTH_ROLE);

    DASHBOARD_SECTION_LINKS.forEach((item) => {
      if (!canSearchDashboardArea(session, normalizedRole, item.permissionKey)) {
        return;
      }

      addDashboardSearchEntry(entries, {
        type: "Section",
        title: item.label,
        subtitle: item.copy,
        href: item.href,
        keywords: `${item.label} ${item.copy}`,
      });
    });

    if (canSearchDashboardArea(session, normalizedRole, "students_manage")) {
      const studentManager = getStudentManager();
      const students =
        studentManager && typeof studentManager.getStudents === "function"
          ? studentManager.getStudents()
          : [];

      students
        .filter((record) => record.status !== "archived")
        .forEach((record) => {
          addDashboardSearchEntry(entries, {
            type: "Student",
            title: record.fullName || [record.firstName, record.lastName].filter(Boolean).join(" "),
            subtitle: `${record.admissionNo || "No admission number"} · ${record.level || "No class assigned"}`,
            href: "./admin-students.html",
            keywords: `${record.firstName || ""} ${record.lastName || ""} ${record.fullName || ""} ${record.admissionNo || ""} ${record.level || ""} student learner`,
          });

          (record.guardians || []).forEach((guardian) => {
            addDashboardSearchEntry(entries, {
              type: "Guardian",
              title: guardian.name || "Guardian",
              subtitle: `${guardian.relationship || "Guardian"} for ${record.fullName || "student"}`,
              href: "./admin-students.html",
              keywords: `${guardian.name || ""} ${guardian.relationship || ""} ${guardian.phone || ""} ${guardian.email || ""} ${record.fullName || ""} guardian parent contact`,
            });
          });
        });
    }

    if (canSearchDashboardArea(session, normalizedRole, "teachers_manage")) {
      getUsers()
        .filter(
          (user) =>
            normalizeWorkspaceId(user.workspaceId) === workspaceId &&
            normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) === "Teacher",
        )
        .forEach((user) => {
          addDashboardSearchEntry(entries, {
            type: "Teacher",
            title: user.displayName || user.email,
            subtitle: `${user.email || "No email"} · ${user.department || user.title || "Staff account"}`,
            href: "./admin-teachers.html",
            keywords: `${user.displayName || ""} ${user.email || ""} ${user.phone || ""} ${user.department || ""} ${user.title || ""} teacher staff`,
          });
        });
    }

    if (canSearchDashboardArea(session, normalizedRole, "classes_manage")) {
      const classManager = getClassManager();
      const classes =
        classManager && typeof classManager.getClasses === "function"
          ? classManager.getClasses()
          : [];

      classes
        .filter((record) => record.status !== "archived")
        .forEach((record) => {
          addDashboardSearchEntry(entries, {
            type: "Class",
            title: getClassDisplayName(record),
            subtitle: `${record.classTeacher || "No class teacher"} · ${record.capacity || 0} capacity`,
            href: "./admin-classes.html",
            keywords: `${record.name || ""} ${record.level || ""} ${record.arms?.join(" ") || ""} class arm stream`,
          });
        });

      const timetableManager = getTimetableManager();
      const periods =
        timetableManager && typeof timetableManager.getPeriods === "function"
          ? timetableManager.getPeriods()
          : [];

      periods
        .filter((period) => period.status !== "archived")
        .forEach((period) => {
          addDashboardSearchEntry(entries, {
            type: "Period",
            title: period.name || "Timetable period",
            subtitle: `${period.dayOfWeek || "School day"} · ${period.startTime || "--:--"}-${period.endTime || "--:--"}`,
            href: "./admin-schedule.html",
            keywords: `${period.name || ""} ${period.dayOfWeek || ""} ${period.startTime || ""} ${period.endTime || ""} schedule timetable lesson`,
          });
        });
    }

    if (canSearchDashboardArea(session, normalizedRole, "courses_manage")) {
      const courseManager = getCourseManager();
      const courses =
        courseManager && typeof courseManager.getCourses === "function"
          ? courseManager.getCourses()
          : [];

      courses
        .filter((record) => record.status !== "archived")
        .forEach((record) => {
          const typeLabel = record.creditUnit ? "Course" : "Subject";
          addDashboardSearchEntry(entries, {
            type: typeLabel,
            title: record.name || record.code,
            subtitle: `${record.code || "No code"} · ${record.level || record.category || "Unassigned"}`,
            href: "./admin-courses.html",
            keywords: `${record.name || ""} ${record.code || ""} ${record.category || ""} ${record.level || ""} ${record.teacherAssignments?.join(" ") || ""} subject course`,
          });
        });
    }

    if (canSearchDashboardArea(session, normalizedRole, "fees_manage")) {
      const feeManager = getFeeItemManager();
      const feeItems =
        feeManager && typeof feeManager.getItems === "function"
          ? feeManager.getItems()
          : [];

      feeItems
        .filter((record) => record.status !== "archived")
        .forEach((record) => {
          addDashboardSearchEntry(entries, {
            type: "Fee",
            title: record.name || "Fee item",
            subtitle: `${record.classLevel || "No class"} · ${formatCurrencyAmount(record.amount || 0)}`,
            href: "./admin-fees.html",
            keywords: `${record.name || ""} ${record.description || ""} ${record.classLevel || ""} fee invoice billing payment`,
          });
        });
    }

    if (canSearchDashboardArea(session, normalizedRole, "classes_manage")) {
      const calendarManager = getAcademicCalendarManager();
      const calendarEvents =
        calendarManager && typeof calendarManager.getEvents === "function"
          ? calendarManager.getEvents()
          : [];

      calendarEvents
        .filter((record) => record.status !== "archived")
        .forEach((record) => {
          addDashboardSearchEntry(entries, {
            type: "Event",
            title: record.title || "Calendar event",
            subtitle: `${getCalendarTypeLabel(record.type)} · ${formatCalendarRange(record.startDate, record.endDate)}`,
            href: "./admin-schedule.html",
            keywords: `${record.title || ""} ${record.type || ""} ${record.startDate || ""} ${record.endDate || ""} event calendar term holiday exam`,
          });
        });
    }

    return entries;
  }

  function scoreDashboardSearchEntry(entry, query) {
    const normalizedQuery = normalizeDashboardSearchText(query);
    const searchable = normalizeDashboardSearchText(entry.keywords);
    const title = normalizeDashboardSearchText(entry.title);
    const subtitle = normalizeDashboardSearchText(entry.subtitle);
    const tokens = normalizedQuery.split(" ").filter(Boolean);

    if (!tokens.length || !tokens.every((token) => searchable.includes(token))) {
      return 0;
    }

    if (title === normalizedQuery) {
      return 120;
    }

    if (title.startsWith(normalizedQuery)) {
      return 100;
    }

    if (title.includes(normalizedQuery)) {
      return 80;
    }

    if (subtitle.includes(normalizedQuery)) {
      return 55;
    }

    return 35;
  }

  function renderDashboardSearchSuggestions(target, input, entries, query) {
    if (!target || !input) {
      return;
    }

    const normalizedQuery = normalizeDashboardSearchText(query);

    if (!normalizedQuery) {
      target.hidden = true;
      target.innerHTML = "";
      target.removeAttribute("data-first-href");
      input.setAttribute("aria-expanded", "false");
      return;
    }

    const results = entries
      .map((entry) => ({
        entry,
        score: scoreDashboardSearchEntry(entry, normalizedQuery),
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 8)
      .map((item) => item.entry);

    input.setAttribute("aria-expanded", "true");
    target.hidden = false;

    if (!results.length) {
      target.removeAttribute("data-first-href");
      target.innerHTML = `
        <article class="admin-search-empty">
          <span class="admin-search-empty-icon">?</span>
          <div class="admin-search-empty-copy">
            <strong>No matches found</strong>
            <span>Try a student name, teacher, class, guardian, fee, or page.</span>
          </div>
        </article>
      `;
      return;
    }

    target.dataset.firstHref = results[0].href;
    target.innerHTML = results
      .map(
        (entry) => `
          <a class="admin-search-suggestion" href="${escapeHtml(entry.href)}" role="option">
            <span class="admin-search-suggestion-icon">${escapeHtml(entry.icon)}</span>
            <span class="admin-search-suggestion-copy">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(entry.subtitle || entry.type)}</span>
            </span>
            <span class="admin-search-suggestion-type">${escapeHtml(entry.type)}</span>
          </a>
        `,
      )
      .join("");
  }

  function initDashboardGlobalSearch(input, session, roleLabel) {
    if (!input || input.dataset.globalSearchBound === "true") {
      return;
    }

    const suggestions = document.getElementById(input.getAttribute("aria-controls") || "admin-search-suggestions");

    if (!suggestions) {
      return;
    }

    const refresh = () => {
      renderDashboardSearchSuggestions(
        suggestions,
        input,
        buildDashboardSearchEntries(session, roleLabel),
        input.value,
      );
    };
    const hide = () => {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      suggestions.removeAttribute("data-first-href");
      input.setAttribute("aria-expanded", "false");
    };

    input.addEventListener("input", refresh);
    input.addEventListener("focus", refresh);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hide();
        input.blur();
        return;
      }

      if (event.key === "Enter" && suggestions.dataset.firstHref) {
        event.preventDefault();
        window.location.assign(suggestions.dataset.firstHref);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Node && (input.contains(target) || suggestions.contains(target))) {
        return;
      }
      hide();
    });

    input.dataset.globalSearchBound = "true";
  }

  function initPortalNotifications(button, session) {
    if (!button) {
      return;
    }

    const overlay = ensureDashboardNotificationsOverlay();
    const listTarget = document.getElementById("admin-notification-list");
    const workspaceId = normalizeWorkspaceId(session?.workspaceId || getCurrentWorkspaceId());
    const currentRole = session ? normalizeRoleLabel(session.role || DEFAULT_AUTH_ROLE) : "Guest access";
    const alreadyBound = button.dataset.notificationsBound === "true";

    const setOverlayState = (isOpen) => {
      overlay.hidden = !isOpen;
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("admin-notification-open", isOpen);
    };

    const refresh = () => {
      const notifications = getNotifications(workspaceId);
      const scopedNotifications = filterNotificationsByRole(notifications, currentRole);
      const fallbackEntries = filterNotificationsByRole(buildDashboardFallbackNotifications(), currentRole);
      const entries = (scopedNotifications.length ? scopedNotifications : fallbackEntries).slice(0, 12);
      renderNotificationList(listTarget, entries);

      const dot = document.getElementById("admin-notification-dot");
      if (dot) {
        const unreadCount = scopedNotifications.filter((entry) => isNotificationUnread(entry)).length;
        dot.hidden = unreadCount === 0;
        button.setAttribute(
          "aria-label",
          unreadCount ? `Open notifications, ${unreadCount} unread` : "Open notifications",
        );
      }
    };

    if (!alreadyBound) {
      button.addEventListener("click", () => {
        refresh();
        setOverlayState(true);
        const unreadIds = filterNotificationsByRole(getNotifications(workspaceId), currentRole)
          .filter((entry) => isNotificationUnread(entry))
          .map((entry) => entry.id);
        markNotificationsRead(unreadIds, workspaceId);
      });

      overlay.querySelectorAll("[data-notification-close]").forEach((node) => {
        node.addEventListener("click", () => {
          setOverlayState(false);
        });
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) {
          setOverlayState(false);
        }
      });

      button.dataset.notificationsBound = "true";
    }

    window.addEventListener(NOTIFICATION_EVENT_NAME, (event) => {
      const eventWorkspaceId = normalizeWorkspaceId(event?.detail?.workspaceId || workspaceId);
      if (eventWorkspaceId === workspaceId) {
        refresh();
      }
    });

    refresh();
    setOverlayState(false);
  }

  function slugifyAdminSectionTitle(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function initAdminSectionQuickNav() {
    if (!document.body.classList.contains("admin-dashboard-page")) {
      return;
    }

    const main = document.querySelector(".admin-dashboard-main");
    const topbar = main ? main.querySelector(".admin-dashboard-topbar") : null;

    if (!main || !topbar) {
      return;
    }

    const existingNav = main.querySelector(".admin-section-quick-nav");
    if (existingNav) {
      existingNav.remove();
    }

    if (ADMIN_SETTINGS_PAGES.has(getPage()) || getPage() === "admin-feature-modules") {
      const settingsLinks = Array.from(main.querySelectorAll(".admin-settings-subnav a"));

      const quickSettingsLinks = settingsLinks.filter((link) => link.textContent.trim() !== "All Settings");

      if (quickSettingsLinks.length > 1) {
        const nav = document.createElement("nav");
        nav.className = "admin-section-quick-nav";
        nav.setAttribute("aria-label", "Quick settings navigation");
        nav.innerHTML = `
          <span class="admin-section-quick-label">Quick jump</span>
          <div class="admin-section-quick-links">
            ${quickSettingsLinks
              .map(
                (link) => `
                  <a href="${escapeHtml(link.getAttribute("href") || "#")}" class="admin-section-quick-link ${
                    link.classList.contains("is-active") ? "is-active" : ""
                  }">
                    ${escapeHtml(link.textContent.trim())}
                  </a>
                `,
              )
              .join("")}
          </div>
        `;
        topbar.insertAdjacentElement("afterend", nav);
        return;
      }
    }

    const cards = Array.from(main.querySelectorAll(".admin-surface-card")).filter(
      (card) => card.querySelector(".admin-surface-head h2"),
    );

    if (cards.length < 2) {
      return;
    }

    const usedIds = new Set();
    const items = cards
      .map((card, index) => {
        const heading = card.querySelector(".admin-surface-head h2");
        const label = heading ? heading.textContent.trim() : `Section ${index + 1}`;

        if (!label) {
          return null;
        }

        const base = slugifyAdminSectionTitle(label) || `section-${index + 1}`;
        let id = `admin-section-${base}`;
        let suffix = 2;

        while (usedIds.has(id) || document.getElementById(id)) {
          id = `admin-section-${base}-${suffix}`;
          suffix += 1;
        }

        usedIds.add(id);
        card.id = id;
        return { id, label };
      })
      .filter(Boolean);

    if (items.length < 2) {
      return;
    }

    const nav = document.createElement("nav");
    nav.className = "admin-section-quick-nav";
    nav.setAttribute("aria-label", "Quick section navigation");
    nav.innerHTML = `
      <span class="admin-section-quick-label">Quick jump</span>
      <div class="admin-section-quick-links">
        ${items
          .map(
            (item, index) => `
              <a href="#${item.id}" class="admin-section-quick-link ${index === 0 ? "is-active" : ""}" data-section-target="${item.id}">
                ${escapeHtml(item.label)}
              </a>
            `,
          )
          .join("")}
      </div>
    `;

    topbar.insertAdjacentElement("afterend", nav);

    const links = Array.from(nav.querySelectorAll(".admin-section-quick-link"));
    const activate = (targetId) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.sectionTarget === targetId);
      });
    };

    links.forEach((link) => {
      link.addEventListener("click", () => {
        activate(link.dataset.sectionTarget || "");
      });
    });
  }

  function getParentLinkedStudents(parentEmail, manager = null) {
    if (!parentEmail || !EMAIL_REGEX.test(String(parentEmail).trim())) {
      return [];
    }

    const studentManager = manager || getStudentManager();

    if (!studentManager || typeof studentManager.getStudents !== "function") {
      return [];
    }

    const normalizedParentEmail = normalizeEmail(parentEmail);
    return studentManager
      .getStudents()
      .filter((student) => student.status === "active")
      .filter((student) =>
        (student.guardians || []).some(
          (guardian) => normalizeEmail(String(guardian.email || "").trim()) === normalizedParentEmail,
        ),
      )
      .sort((left, right) => left.fullName.localeCompare(right.fullName, undefined, { numeric: true }));
  }

  function getParentSelectionStorageKey(user = null) {
    const session = getSession();
    const workspaceId = normalizeWorkspaceId(user?.workspaceId || session?.workspaceId || getCurrentWorkspaceId());
    const userId = String(user?.id || session?.userId || "parent").trim() || "parent";
    return `${PARENT_SELECTION_STORAGE_PREFIX}:${workspaceId}:${userId}`;
  }

  function readParentSelectedChildId(user = null) {
    try {
      return localStorage.getItem(getParentSelectionStorageKey(user)) || "";
    } catch {
      return "";
    }
  }

  function saveParentSelectedChildId(childId, user = null) {
    try {
      localStorage.setItem(getParentSelectionStorageKey(user), String(childId || "").trim());
    } catch {
      // keep UI usable if storage is blocked
    }
  }

  function getParentFeesStorageKey(workspaceId = null) {
    return `${PARENT_FEES_STORAGE_PREFIX}:${normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId())}`;
  }

  function readParentFeesState(workspaceId = null) {
    const key = getParentFeesStorageKey(workspaceId);
    const stored = parseJSON(localStorage.getItem(key), {});
    return stored && typeof stored === "object" ? stored : {};
  }

  function saveParentFeesState(state, workspaceId = null) {
    const resolvedWorkspaceId = normalizeWorkspaceId(workspaceId || getCurrentWorkspaceId());
    const key = getParentFeesStorageKey(resolvedWorkspaceId);
    localStorage.setItem(key, JSON.stringify(state && typeof state === "object" ? state : {}));
    window.dispatchEvent(
      new CustomEvent(PARENT_FEES_EVENT_NAME, {
        detail: {
          workspaceId: resolvedWorkspaceId,
        },
      }),
    );
  }

  function buildConfiguredParentFeeSnapshot(student = null) {
    if (!student) {
      return null;
    }

    const feeManager = getFeeItemManager();
    if (!feeManager || typeof feeManager.getItems !== "function") {
      return null;
    }

    const cycleManager = getAcademicCycleManager();
    const cycleState = cycleManager && typeof cycleManager.getState === "function"
      ? cycleManager.getState()
      : { sessions: [], terms: [] };
    const studentClassToken = normalizeLevelToken(student.level);
    const matchingItems = feeManager
      .getItems()
      .filter(
        (item) =>
          item.status !== "archived" &&
          normalizeLevelToken(item.classLevel) === studentClassToken,
      );

    if (!matchingItems.length) {
      return null;
    }

    const sessions = Array.isArray(cycleState.sessions) ? cycleState.sessions : [];
    const terms = Array.isArray(cycleState.terms) ? cycleState.terms : [];
    const openSession = sessions.find((session) => session.status === "open") || null;
    const openTerm =
      terms.find((term) => term.status === "open" && (!openSession || term.sessionId === openSession.id)) ||
      terms.find((term) => term.status === "open") ||
      null;
    const periodScopedItems = openTerm
      ? matchingItems.filter((item) => item.termId === openTerm.id && (!openTerm.sessionId || item.sessionId === openTerm.sessionId))
      : openSession
        ? matchingItems.filter((item) => item.sessionId === openSession.id)
        : [];
    const displayItems = periodScopedItems.length ? periodScopedItems : matchingItems;
    const totalDue = displayItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const itemDueDates = displayItems
      .map((item) => String(item.dueDate || "").trim())
      .filter(Boolean)
      .sort();
    const sessionId = openTerm?.sessionId || openSession?.id || displayItems[0]?.sessionId || "";
    const termId = openTerm?.id || displayItems[0]?.termId || "";
    const invoiceKey = sessionId && termId && student.level ? `${sessionId}:${termId}:${student.level}` : "";

    return {
      studentId: student.id,
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      classLevel: student.level,
      sessionId,
      sessionName: sessionId ? getSessionLabelFromCycle(cycleState, sessionId) : "",
      termId,
      termName: termId ? getTermLabelFromCycle(cycleState, termId) : "",
      invoiceKey,
      invoiceStatus: "configured",
      invoiceItems: displayItems.map((item) => ({
        feeItemId: item.id,
        category: normalizeFeeCategoryKey(item.category || FEE_CATEGORY_FALLBACK),
        name: item.name,
        amount: Number(item.amount || 0),
        description: item.description || "",
        dueDate: item.dueDate || "",
      })),
      totalDue,
      balance: totalDue,
      dueDate: itemDueDates[itemDueDates.length - 1] || "Not set by admin yet",
      updatedAt: nowIso(),
    };
  }

  function deriveParentAttendanceSummary(student = null) {
    const cycleManager = getAcademicCycleManager();
    const cycleState = cycleManager && typeof cycleManager.getState === "function"
      ? cycleManager.getState()
      : { sessions: [], terms: [] };
    const openTerm = (cycleState.terms || []).find((term) => term.status === "open") || null;
    const currentTermLabel = openTerm?.name || "Current Term";
    const currentSession =
      openTerm
        ? (cycleState.sessions || []).find((session) => session.id === openTerm.sessionId)?.name || "Active Session"
        : "Active Session";
    const attendanceManager = getAttendanceManager();
    const attendanceRecords =
      attendanceManager && typeof attendanceManager.getRecords === "function"
        ? attendanceManager.getRecords()
        : [];
    const countStudentAttendance = (term = null) => {
      const startDate = String(term?.startDate || "").trim();
      const endDate = String(term?.endDate || "").trim();

      return attendanceRecords.reduce(
        (summary, record) => {
          if (startDate && record.date < startDate) {
            return summary;
          }
          if (endDate && record.date > endDate) {
            return summary;
          }

          const entry = (record.entries || []).find((item) => item.studentId === student?.id);

          if (!entry) {
            return summary;
          }

          const status = normalizeAttendanceStatus(entry.status);
          if (status === "present" || status === "late") {
            summary.present += 1;
          } else if (status === "absent") {
            summary.absent += 1;
          }

          return summary;
        },
        { present: 0, absent: 0 },
      );
    };
    const currentCounts = countStudentAttendance(openTerm);

    const history = (cycleState.terms || [])
      .slice()
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
      .map((term) => {
        const counts = countStudentAttendance(term);
        return {
          id: term.id,
          term: term.name,
          session: (cycleState.sessions || []).find((item) => item.id === term.sessionId)?.name || "Session",
          present: counts.present,
          absent: counts.absent,
        };
      });

    return {
      studentId: student?.id || "",
      currentTermLabel,
      currentSession,
      present: currentCounts.present,
      absent: currentCounts.absent,
      history,
    };
  }

  function getParentCoursesForStudent(student = null) {
    if (!student) {
      return [];
    }

    const classManager = getClassManager();
    const courseManager = getCourseManager();
    const classes = classManager && typeof classManager.getClasses === "function"
      ? classManager.getClasses().filter((item) => item.status !== "archived")
      : [];
    const courses = courseManager && typeof courseManager.getCourses === "function"
      ? courseManager.getCourses().filter((item) => item.status !== "archived")
      : [];
    const classMatch = classes.find((item) => String(item.level || "").trim() === String(student.level || "").trim()) || null;
    const subjectsFromClass = classMatch?.subjects || [];
    const matchedByLevel = courses.filter((course) => String(course.level || "").trim() === String(student.level || "").trim());

    const merged = [];
    const seen = new Set();
    matchedByLevel.forEach((course) => {
      const key = normalizeEmail(`${course.code || ""}-${course.name || ""}`);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push({
        name: course.name,
        code: course.code,
        level: course.level,
      });
    });

    subjectsFromClass.forEach((subject) => {
      const subjectName = String(subject || "").trim();
      if (!subjectName) {
        return;
      }
      const key = normalizeEmail(subjectName);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push({
        name: subjectName,
        code: "",
        level: student.level || "",
      });
    });

    return merged;
  }

  function getParentTeacherGroups(students = []) {
    const classManager = getClassManager();
    const classes = classManager && typeof classManager.getClasses === "function"
      ? classManager.getClasses().filter((item) => item.status !== "archived")
      : [];
    const users = getUsers();
    const teacherByEmail = users.reduce((lookup, user) => {
      if (normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) !== "Teacher") {
        return lookup;
      }
      lookup[normalizeEmail(user.email || "")] = user.displayName || user.email;
      return lookup;
    }, {});

    const levelSet = new Set(students.map((student) => String(student.level || "").trim()).filter(Boolean));
    const filteredClasses = classes.filter((item) => levelSet.has(String(item.level || "").trim()));

    return filteredClasses.map((classRecord) => {
      const teacherRows = [];

      if (classRecord.classTeacher) {
        const normalized = normalizeEmail(classRecord.classTeacher);
        teacherRows.push({
          role: "Class Teacher",
          name: teacherByEmail[normalized] || classRecord.classTeacher,
          subject: "General class oversight",
        });
      }

      (classRecord.teacherAssignments || []).forEach((assignment) => {
        const normalized = normalizeEmail(assignment.teacher || "");
        teacherRows.push({
          role: "Subject Teacher",
          name: teacherByEmail[normalized] || assignment.teacher || "Assigned teacher",
          subject: assignment.subject || "Subject",
        });
      });

      return {
        id: classRecord.id,
        className: `${classRecord.level || ""} ${classRecord.name || ""}`.trim() || classRecord.level || classRecord.name,
        teachers: teacherRows,
      };
    });
  }

  function renderParentChildSelector(container, children, selectedChildId, user) {
    if (!container) {
      return null;
    }

    const options = children
      .map(
        (child) => `<option value="${escapeHtml(child.id)}" ${child.id === selectedChildId ? "selected" : ""}>
          ${escapeHtml(child.fullName)} (${escapeHtml(child.level || "Class not set")})
        </option>`,
      )
      .join("");

    container.innerHTML = `
      <label class="portal-field parent-child-switch">
        <span>Switch child</span>
        <select id="parent-child-switch">
          ${options || '<option value="">No linked child</option>'}
        </select>
      </label>
    `;

    const select = container.querySelector("#parent-child-switch");

    if (!select) {
      return null;
    }

    select.disabled = !children.length;
    select.addEventListener("change", () => {
      saveParentSelectedChildId(select.value, user);
      window.location.reload();
    });

    return select;
  }

  function renderParentPerformancePage(target, student, children) {
    if (!target) {
      return;
    }

    if (!student) {
      const session = getSession();
      target.innerHTML = `
        <article class="admin-surface-card">
          <div class="admin-surface-head">
            <h2>No linked student yet</h2>
            <span>This parent account is active, but no student record is linked to this email in this school workspace.</span>
          </div>
          <div class="admin-session-grid">
            <div class="admin-session-card">
              <span>Parent email</span>
              <strong>${escapeHtml(session?.email || "Unknown")}</strong>
            </div>
            <div class="admin-session-card">
              <span>Workspace</span>
              <strong>${escapeHtml(session?.workspaceId || "public")}</strong>
            </div>
            <div class="admin-session-card">
              <span>Linked children found</span>
              <strong>${escapeHtml(String(children.length || 0))}</strong>
            </div>
          </div>
        </article>
      `;
      return;
    }

    const attendance = deriveParentAttendanceSummary(student);
    const courses = getParentCoursesForStudent(student);
    const feesState = readParentFeesState();
    const studentFee = feesState[student.id] || { totalDue: 0, balance: 0, dueDate: "Not set" };

    target.innerHTML = `
      <section class="admin-metrics-grid">
        <article class="admin-metric-card admin-metric-card-blue">
          <strong>${escapeHtml(student.fullName)}</strong>
          <h3>Student Performance View</h3>
          <p>Class: ${escapeHtml(student.level || "Not assigned")}</p>
        </article>
        <article class="admin-metric-card admin-metric-card-mint">
          <strong>${attendance.present}</strong>
          <h3>Present (Current Term)</h3>
          <p>${escapeHtml(attendance.currentTermLabel)}</p>
        </article>
        <article class="admin-metric-card admin-metric-card-violet">
          <strong>${courses.length}</strong>
          <h3>Active Courses</h3>
          <p>From class/course setup</p>
        </article>
        <article class="admin-metric-card admin-metric-card-rose">
          <strong>${escapeHtml(String(studentFee.balance || 0))}</strong>
          <h3>Outstanding Balance</h3>
          <p>Due: ${escapeHtml(studentFee.dueDate || "Not set")}</p>
        </article>
      </section>
      <section class="admin-primary-grid">
        <article class="admin-surface-card">
          <div class="admin-surface-head">
            <h2>Linked Children</h2>
            <span>Switch between your children from the top selector.</span>
          </div>
          <div class="admin-session-grid">
            ${children
              .map(
                (child) => `
                  <div class="admin-session-card">
                    <span>${escapeHtml(child.level || "Class")}</span>
                    <strong>${escapeHtml(child.fullName)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      </section>
    `;
  }

  function renderParentTeachersPage(target, students) {
    if (!target) {
      return;
    }

    const groups = getParentTeacherGroups(students);

    if (!groups.length) {
      target.innerHTML = `
        <article class="admin-surface-card">
          <div class="admin-surface-head">
            <h2>Teachers by Class</h2>
            <span>No teacher assignments found yet for your child's class levels.</span>
          </div>
        </article>
      `;
      return;
    }

    target.innerHTML = groups
      .map(
        (group) => `
          <article class="admin-surface-card">
            <div class="admin-surface-head">
              <h2>${escapeHtml(group.className || "Class")}</h2>
              <span>Teacher list grouped by class.</span>
            </div>
            <div class="admin-event-list">
              ${group.teachers
                .map(
                  (teacher) => `
                    <article class="admin-event-row">
                      <div class="admin-event-time">${escapeHtml(teacher.role)}</div>
                      <div class="admin-event-copy">
                        <strong>${escapeHtml(teacher.name)}</strong>
                        <span>${escapeHtml(teacher.subject)}</span>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderParentCoursesPage(target, student) {
    if (!target) {
      return;
    }

    if (!student) {
      target.innerHTML = `<article class="admin-surface-card"><div class="admin-surface-head"><h2>Courses</h2><span>No linked student selected.</span></div></article>`;
      return;
    }

    const courses = getParentCoursesForStudent(student);
    target.innerHTML = `
      <article class="admin-surface-card">
        <div class="admin-surface-head">
          <h2>Courses for ${escapeHtml(student.fullName)}</h2>
          <span>Only courses for this child are shown.</span>
        </div>
        ${
          courses.length
            ? `<div class="admin-session-grid">${courses
                .map(
                  (course) => `
                  <div class="admin-session-card">
                    <span>${escapeHtml(course.code || "Course")}</span>
                    <strong>${escapeHtml(course.name)}</strong>
                  </div>
                `,
                )
                .join("")}</div>`
            : `<p>No courses have been assigned yet for ${escapeHtml(student.level || "this class")}.</p>`
        }
      </article>
    `;
  }

  function renderParentAttendancePage(target, student) {
    if (!target) {
      return;
    }

    if (!student) {
      target.innerHTML = `<article class="admin-surface-card"><div class="admin-surface-head"><h2>Attendance</h2><span>No linked student selected.</span></div></article>`;
      return;
    }

    const attendance = deriveParentAttendanceSummary(student);
    const historyRows = attendance.history.length
      ? attendance.history
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.session)}</td>
                <td>${escapeHtml(row.term)}</td>
                <td>${escapeHtml(String(row.present))}</td>
                <td>${escapeHtml(String(row.absent))}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="4">No previous term attendance published yet.</td></tr>`;

    target.innerHTML = `
      <article class="admin-surface-card">
        <div class="admin-surface-head">
          <h2>Attendance: ${escapeHtml(student.fullName)}</h2>
          <span>${escapeHtml(attendance.currentSession)} • ${escapeHtml(attendance.currentTermLabel)}</span>
        </div>
        <div class="admin-session-grid">
          <div class="admin-session-card">
            <span>Present</span>
            <strong>${escapeHtml(String(attendance.present))}</strong>
          </div>
          <div class="admin-session-card">
            <span>Absent</span>
            <strong>${escapeHtml(String(attendance.absent))}</strong>
          </div>
        </div>
        <div class="portal-import-table-wrap">
          <table class="portal-import-table">
            <thead>
              <tr><th>Session</th><th>Term</th><th>Present</th><th>Absent</th></tr>
            </thead>
            <tbody>${historyRows}</tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderParentFeesPage(target, student, user) {
    if (!target) {
      return;
    }

    if (!student) {
      target.innerHTML = `<article class="admin-surface-card"><div class="admin-surface-head"><h2>Fees</h2><span>No linked student selected.</span></div></article>`;
      return;
    }

    const workspaceId = normalizeWorkspaceId(user?.workspaceId || getCurrentWorkspaceId());
    const allFees = readParentFeesState(workspaceId);
    const storedFeeRecord = allFees[student.id] || null;
    const configuredFeeRecord = buildConfiguredParentFeeSnapshot(student);
    const hasStoredFeeRecord = Boolean(storedFeeRecord?.invoiceNo || storedFeeRecord?.invoiceItems?.length);
    const current = hasStoredFeeRecord
      ? storedFeeRecord
      : configuredFeeRecord || {
          totalDue: 0,
          balance: 0,
          dueDate: "Not set by admin yet",
          updatedAt: nowIso(),
        };
    const invoiceItems = Array.isArray(current.invoiceItems) ? current.invoiceItems : [];
    const invoiceItemRows = invoiceItems.length
      ? invoiceItems
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(getFeeCategoryLabel(item.category || FEE_CATEGORY_FALLBACK))}</td>
                <td>${escapeHtml(item.name || "Fee item")}</td>
                <td>${escapeHtml(item.description || "No note")}</td>
                <td>${escapeHtml(item.dueDate || current.dueDate || "Not set")}</td>
                <td>${escapeHtml(formatCurrencyAmount(item.amount || 0))}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="5">No class fee items have been configured or generated yet.</td></tr>`;

    target.innerHTML = `
      <article class="admin-surface-card">
        <div class="admin-surface-head">
          <h2>Fees: ${escapeHtml(student.fullName)}</h2>
          <span>Fees are configured by school admin. Parents can pay and track balances here.</span>
        </div>
        <div class="admin-session-grid">
          <div class="admin-session-card"><span>Invoice</span><strong>${escapeHtml(
            current.invoiceNo || (current.invoiceStatus === "configured" ? "Configured fees" : "Not generated"),
          )}</strong></div>
          <div class="admin-session-card"><span>Total due</span><strong>${escapeHtml(formatCurrencyAmount(current.totalDue || 0))}</strong></div>
          <div class="admin-session-card"><span>Outstanding balance</span><strong>${escapeHtml(formatCurrencyAmount(current.balance || 0))}</strong></div>
          <div class="admin-session-card"><span>Due date</span><strong>${escapeHtml(String(current.dueDate || "Not set"))}</strong></div>
          <div class="admin-session-card"><span>Academic period</span><strong>${escapeHtml(
            [current.sessionName, current.termName].filter(Boolean).join(" • ") || "Not selected",
          )}</strong></div>
          <div class="admin-session-card"><span>Generated</span><strong>${escapeHtml(
            current.invoiceGeneratedAt ? formatTimestamp(current.invoiceGeneratedAt) : "Not generated",
          )}</strong></div>
        </div>
        <div class="portal-import-table-wrap parent-fee-invoice-lines">
          <table class="portal-import-table">
            <thead>
              <tr><th>Category</th><th>Fee item</th><th>Note</th><th>Due date</th><th>Amount</th></tr>
            </thead>
            <tbody>${invoiceItemRows}</tbody>
          </table>
        </div>
        <form id="parent-fee-payment-form" class="portal-settings-form" novalidate>
          <div id="parent-fee-payment-status" class="auth-status" role="alert" aria-live="polite" hidden></div>
          <div class="portal-settings-grid">
            <label class="portal-field" for="parent-fee-payment-amount">
              <span>Amount to pay</span>
              <input id="parent-fee-payment-amount" type="number" min="1" step="1" placeholder="e.g. 5000" />
            </label>
          </div>
          <div class="utility-actions">
            <button class="button button-primary" type="submit">Pay fee</button>
          </div>
        </form>
      </article>
    `;

    const paymentForm = target.querySelector("#parent-fee-payment-form");
    const paymentStatus = target.querySelector("#parent-fee-payment-status");

    if (!paymentForm || !paymentStatus) {
      return;
    }

    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const amountField = paymentForm.querySelector("#parent-fee-payment-amount");
      const amount = Number.parseFloat(String(amountField?.value || "0"));

      if (!Number.isFinite(amount) || amount <= 0) {
        setStatus(paymentStatus, "error", "Enter a valid amount.");
        return;
      }

      const nextBalance = Math.max(0, Number(current.balance || 0) - amount);
      const nextState = {
        ...allFees,
        [student.id]: {
          ...current,
          balance: nextBalance,
          updatedAt: nowIso(),
          lastPaymentAmount: amount,
          lastPaymentAt: nowIso(),
        },
      };
      saveParentFeesState(nextState, workspaceId);
      setStatus(
        paymentStatus,
        "success",
        `Payment of <strong>${escapeHtml(formatCurrencyAmount(amount))}</strong> recorded. New balance: <strong>${escapeHtml(
          formatCurrencyAmount(nextBalance),
        )}</strong>.`,
      );
      window.setTimeout(() => {
        renderParentFeesPage(target, student, user);
      }, 350);
    });
  }

  function renderParentReportsPage(target, student) {
    if (!target) {
      return;
    }

    if (!student) {
      target.innerHTML = `<article class="admin-surface-card"><div class="admin-surface-head"><h2>Reports</h2><span>No linked student selected.</span></div></article>`;
      return;
    }

    target.innerHTML = `
      <article class="admin-surface-card">
        <div class="admin-surface-head">
          <h2>Reports: ${escapeHtml(student.fullName)}</h2>
          <span>Only this child's report cards and summaries are visible.</span>
        </div>
        <div class="admin-event-list">
          <article class="admin-event-row">
            <div class="admin-event-time">Result</div>
            <div class="admin-event-copy">
              <strong>No published report yet</strong>
              <span>When teachers publish results, they will appear here for this child only.</span>
            </div>
          </article>
        </div>
      </article>
    `;
  }

  function initParentPages() {
    const page = getPage();

    if (!isParentPage(page)) {
      return;
    }

    const accessContext = getAdminAccessContext();
    const { session, roleLabel } = accessContext;
    let { user } = accessContext;

    if (!session || !user) {
      window.location.assign("./login.html");
      return;
    }

    if (normalizeRoleLabel(roleLabel) !== "Parent") {
      window.location.assign(getRoleHomeRoute(roleLabel));
      return;
    }

    user = alignParentWorkspaceFromGuardianLink(user, session);

    const brandMark = document.getElementById("admin-brand-mark");
    const brandName = document.getElementById("admin-brand-name");
    const brandSubtitle = document.getElementById("admin-brand-subtitle");
    const profileAvatar = document.getElementById("admin-profile-avatar");
    const profileName = document.getElementById("admin-profile-name");
    const profileRole = document.getElementById("admin-profile-role");
    const gate = document.getElementById("portal-gate");
    const lastUpdated = document.getElementById("portal-last-updated");
    const settingsManager = getSchoolSettingsManager();
    applyAdminBranding(brandMark, brandName, brandSubtitle, settingsManager);

    if (profileAvatar) {
      profileAvatar.textContent = getInitials(user.displayName || user.email);
    }
    if (profileName) {
      profileName.textContent = user.displayName || user.email;
    }
    if (profileRole) {
      profileRole.textContent = "Parent";
    }
    if (lastUpdated) {
      lastUpdated.textContent = `Updated ${formatTimestamp(nowIso())}`;
    }
    if (gate) {
      gate.innerHTML = `
        <a class="admin-signout-button" href="./user-settings.html">My settings</a>
        <button class="admin-signout-button" type="button" data-signout>Log out</button>
      `;
      wireSignOutButton(gate);
    }

    const children = getParentLinkedStudents(user.email, getStudentManager());
    const savedChildId = readParentSelectedChildId(user);
    const selectedChild = children.find((child) => child.id === savedChildId) || children[0] || null;

    if (selectedChild) {
      saveParentSelectedChildId(selectedChild.id, user);
    }

    const switcherHost = document.getElementById("parent-child-switcher");
    renderParentChildSelector(switcherHost, children, selectedChild?.id || "", user);

    const contentHost = document.getElementById("parent-page-content");
    if (!contentHost) {
      return;
    }

    if (page === "parent-portal") {
      renderParentPerformancePage(contentHost, selectedChild, children);
      return;
    }

    if (page === "parent-teachers") {
      renderParentTeachersPage(contentHost, children);
      return;
    }

    if (page === "parent-courses") {
      renderParentCoursesPage(contentHost, selectedChild);
      return;
    }

    if (page === "parent-attendance") {
      renderParentAttendancePage(contentHost, selectedChild);
      return;
    }

    if (page === "parent-fees") {
      renderParentFeesPage(contentHost, selectedChild, user);
      return;
    }

    if (page === "parent-reports") {
      renderParentReportsPage(contentHost, selectedChild);
    }
  }

  function initAdminShellPages() {
    if (!document.body.classList.contains("admin-dashboard-page") || getPage() === "portal" || isParentPage()) {
      return;
    }

    const brandMark = document.getElementById("admin-brand-mark");
    const brandName = document.getElementById("admin-brand-name");
    const brandSubtitle = document.getElementById("admin-brand-subtitle");
    const profileAvatar = document.getElementById("admin-profile-avatar");
    const profileName = document.getElementById("admin-profile-name");
    const profileRole = document.getElementById("admin-profile-role");
    const lastUpdated = document.getElementById("portal-last-updated");
    const gate = document.getElementById("portal-gate");
    const schoolSettingsManager = getSchoolSettingsManager();
    const settings = schoolSettingsManager
      ? schoolSettingsManager.getSettings()
      : getDefaultAdminSchoolSettings();
    const { session, user, roleLabel } = getAdminAccessContext();
    const normalizedRole = normalizeRoleLabel(roleLabel || DEFAULT_AUTH_ROLE);

    if (normalizedRole === "Parent" && !isParentPage()) {
      window.location.assign(getRoleHomeRoute(normalizedRole));
      return;
    }

    applyAdminBranding(brandMark, brandName, brandSubtitle, schoolSettingsManager);

    if (lastUpdated) {
      lastUpdated.textContent = session && user ? `Updated ${formatTimestamp(nowIso())}` : "Awaiting sign-in";
    }

    initAdminSectionQuickNav();

    if (!profileAvatar || !profileName || !profileRole || !gate) {
      return;
    }

    if (!session || !user) {
      profileAvatar.textContent = getInitials(settings.schoolName).charAt(0) || "S";
      profileName.textContent = settings.schoolName;
      profileRole.textContent = "Guest access";
      gate.innerHTML = `<a class="admin-signout-button" href="./login.html">Go to Login</a>`;
      return;
    }

    profileAvatar.textContent = getInitials(user.displayName || user.email);
    profileName.textContent = user.displayName || user.email;
    profileRole.textContent = roleLabel;
    gate.innerHTML = `
      <a class="admin-signout-button" href="./user-settings.html">My settings</a>
      <button class="admin-signout-button" type="button" data-signout>Log out</button>
    `;
    wireSignOutButton(gate);
  }

  function statusLabelForAdmission(value) {
    const status = normalizeAdmissionStatus(value);

    if (status === "review") {
      return "In Review";
    }
    if (status === "shortlisted") {
      return "Shortlisted";
    }
    if (status === "rejected") {
      return "Rejected";
    }
    if (status === "approved") {
      return "Approved";
    }
    return "Pending";
  }

  function renderAdmissionsSummary(target, admissions = []) {
    if (!target) {
      return;
    }

    const counts = admissions.reduce(
      (sum, entry) => {
        const status = normalizeAdmissionStatus(entry.status);
        sum[status] += 1;
        return sum;
      },
      { pending: 0, review: 0, shortlisted: 0, rejected: 0, approved: 0 },
    );

    target.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Total applications</span>
        <strong>${admissions.length}</strong>
        <p>${counts.pending} pending and ${counts.review} in review.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Shortlisted</span>
        <strong>${counts.shortlisted}</strong>
        <p>Applicants currently being considered.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Approved</span>
        <strong>${counts.approved}</strong>
        <p>Accepted applicants pending conversion or already processed.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-rose">
        <span>Declined</span>
        <strong>${counts.rejected}</strong>
        <p>Applications not moving forward.</p>
      </article>
    `;
  }

  function renderAdmissionsList(target, admissions = [], isAdmin = false) {
    if (!target) {
      return;
    }

    if (!admissions.length) {
      target.innerHTML = `
        <article class="portal-class-empty">
          <strong>No applications yet</strong>
          <p>Share the application link so prospective students can apply.</p>
        </article>
      `;
      return;
    }

    target.innerHTML = `
      <div class="portal-admission-name-list">
        ${admissions
          .map((entry) => {
            const status = normalizeAdmissionStatus(entry.status);
            const level = entry.academicClassApplyingFor || entry.classApplyingFor || entry.level || "Class not set";
            const guardian = entry.guardianFullName || entry.guardianName || "Guardian not set";
            return `
              <button class="portal-admission-name-item" type="button" data-admission-open="${escapeHtml(entry.id)}">
                <span class="portal-admission-name-copy">
                  <strong>${escapeHtml(entry.fullName)}</strong>
                  <small>${escapeHtml(level)} • ${escapeHtml(guardian)}</small>
                </span>
                <span class="portal-admission-name-meta">
                  <span class="portal-class-status is-${status === "approved" || status === "shortlisted" ? "active" : status === "rejected" ? "archived" : "pending"}">${escapeHtml(statusLabelForAdmission(status))}</span>
                  <small>${escapeHtml(formatTimestamp(entry.createdAt))}</small>
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function initAdmissionsControls({ isAdmin, form, status, summaryTarget, listTarget, applyLinkTarget }) {
    if (!form || !status || !summaryTarget || !listTarget) {
      return;
    }

    const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
    const studentManager = getStudentManager();
    const admissionConfigManager = getAdmissionConfigManager();
    const levelSelect = form.elements.level || null;

    const refreshApplicationLevelOptions = () => {
      const admissionConfig =
        admissionConfigManager && typeof admissionConfigManager.summarize === "function"
          ? admissionConfigManager.summarize()
          : null;
      const activeClassNames = (admissionConfig?.activeClasses || [])
        .map((entry) => entry.name)
        .filter(Boolean);
      syncAdmissionClassFieldOptions(
        activeClassNames.length ? activeClassNames : getConfiguredStudentLevelOptions(),
        levelSelect,
        {
          placeholder: "Select level/class",
          emptyLabel: "Configure admission classes first",
        },
      );
    };

    const buildStudentPayloadFromAdmission = (entry) => {
      const classLevelSet = getActiveClassLevelTokenSet();
      const level = String(entry.academicClassApplyingFor || entry.classApplyingFor || entry.level || "").trim();
      const firstName = String(entry.firstName || "").trim() || String(entry.fullName || "").trim().split(/\s+/)[0] || "";
      const lastName =
        String(entry.lastName || "").trim() ||
        String(entry.fullName || "")
          .trim()
          .split(/\s+/)
          .slice(1)
          .join(" ") ||
        "Applicant";
      const fullName = [entry.firstName, entry.middleName, entry.lastName]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
      const guardians = [
        {
          id: createId(),
          name: String(entry.guardianFullName || entry.guardianName || "").trim(),
          relationship: String(entry.guardianRelationship || "Guardian").trim() || "Guardian",
          phone: String(entry.guardianPhone || "").trim(),
          email: String(entry.guardianEmail || "").trim(),
        },
      ];

      if (!firstName || !lastName) {
        return { error: "Applicant name is incomplete; edit the application before converting." };
      }

      if (!level) {
        return { error: "Class applying for is missing. Update the application first." };
      }

      if (!isKnownClassLevel(level, classLevelSet)) {
        return { error: "Invalid class. Create this class in Class Management before converting." };
      }

      if (!guardians[0].name || !guardians[0].email) {
        return { error: "Guardian details are incomplete. A guardian email is required for parent login." };
      }

      if (!EMAIL_REGEX.test(guardians[0].email)) {
        return { error: "Guardian email format is invalid." };
      }

      if (guardians[0].phone && !isValidPhoneNumber(guardians[0].phone)) {
        return { error: "Guardian phone number format is invalid." };
      }

      const studentId = createId();
      const admissionNo = generateAdmissionNumber({
        manager: studentManager,
        levelValue: level,
      });

      return {
        payload: {
          id: studentId,
          firstName,
          lastName,
          fullName: fullName || [firstName, lastName].join(" ").trim(),
          admissionNo,
          level,
          dateOfBirth: String(entry.dateOfBirth || "").trim(),
          gender: String(entry.gender || "").trim(),
          promotionDecision: "promote",
          examOutcome: "pass",
          guardians,
          status: "active",
        },
      };
    };

    const refresh = () => {
      const admissions = getAdmissions(workspaceId).filter(
        (entry) => !String(entry.convertedAt || "").trim(),
      );
      renderAdmissionsSummary(summaryTarget, admissions);
      renderAdmissionsList(listTarget, admissions, isAdmin);
      refreshApplicationLevelOptions();
    };

    let modalElement = null;
    let modalBody = null;
    let activeAdmissionId = "";

    const setModalOpen = (isOpen) => {
      if (!modalElement) return;
      modalElement.hidden = !isOpen;
      document.body.classList.toggle("portal-admission-modal-open", isOpen);
    };

    const ensureModal = () => {
      if (modalElement) {
        return modalElement;
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div id="portal-admission-modal" class="portal-admission-modal" hidden>
          <button class="portal-admission-modal-backdrop" type="button" data-admission-close aria-label="Close application details"></button>
          <section class="portal-admission-modal-panel" role="dialog" aria-modal="true" aria-labelledby="portal-admission-modal-title">
            <header class="portal-admission-modal-head">
              <h2 id="portal-admission-modal-title">Application details</h2>
              <button class="portal-admission-modal-close" type="button" data-admission-close aria-label="Close">&times;</button>
            </header>
            <div id="portal-admission-modal-body" class="portal-admission-modal-body"></div>
          </section>
        </div>
      `;
      document.body.appendChild(wrapper.firstElementChild);
      modalElement = document.getElementById("portal-admission-modal");
      modalBody = document.getElementById("portal-admission-modal-body");

      modalElement.addEventListener("click", async (event) => {
        const closeButton = event.target.closest("[data-admission-close]");
        if (closeButton) {
          setModalOpen(false);
          return;
        }

        const actionButton = event.target.closest("[data-admission-action]");
        if (!actionButton || !isAdmin) {
          return;
        }

        const action = String(actionButton.dataset.admissionAction || "").trim().toLowerCase();
        const admissionId = String(actionButton.dataset.admissionId || activeAdmissionId || "").trim();
        if (!admissionId || !action) {
          return;
        }
        await handleAdmissionAction(admissionId, action);
      });

      return modalElement;
    };

    const renderModalBody = (admission) => {
      if (!modalBody || !admission) return;
      const isApproved = normalizeAdmissionStatus(admission.status) === "approved";
      const isConverted = Boolean(String(admission.convertedAt || "").trim());

      modalBody.innerHTML = `
        <div class="portal-admission-modal-grid">
          <div class="portal-admission-modal-item"><span>Applicant</span><strong>${escapeHtml(admission.fullName)}</strong></div>
          <div class="portal-admission-modal-item"><span>Class Applying For</span><strong>${escapeHtml(admission.classApplyingFor || admission.academicClassApplyingFor || admission.level || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Status</span><strong>${escapeHtml(statusLabelForAdmission(admission.status))}</strong></div>
          <div class="portal-admission-modal-item"><span>Stage</span><strong>${escapeHtml(admission.applicationStage || "Submitted")}</strong></div>
          <div class="portal-admission-modal-item"><span>Gender / DOB</span><strong>${escapeHtml(admission.gender || "—")} • ${escapeHtml(admission.dateOfBirth || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Applied</span><strong>${escapeHtml(formatTimestamp(admission.createdAt))}</strong></div>
          <div class="portal-admission-modal-item"><span>Email</span><strong>${escapeHtml(admission.email || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Guardian</span><strong>${escapeHtml(admission.guardianFullName || admission.guardianName || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Guardian Contact</span><strong>${escapeHtml(admission.guardianPhone || "—")} • ${escapeHtml(admission.guardianEmail || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Guardian Relationship</span><strong>${escapeHtml(admission.guardianRelationship || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Address</span><strong>${escapeHtml(admission.guardianAddress || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Academic Background</span><strong>${escapeHtml(admission.lastClassAttended || "—")} → ${escapeHtml(admission.academicClassApplyingFor || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Previous School</span><strong>${escapeHtml(admission.previousSchoolName || admission.previousSchool || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Health</span><strong>${escapeHtml(admission.healthCondition || "—")}${admission.healthConditionDetails ? ` • ${escapeHtml(admission.healthConditionDetails)}` : ""}</strong></div>
          <div class="portal-admission-modal-item"><span>Allergies / Medication</span><strong>${escapeHtml(admission.healthAllergies || "—")} • ${escapeHtml(admission.healthMedications || "—")}</strong></div>
          <div class="portal-admission-modal-item"><span>Documents</span><strong>${escapeHtml(
            [
              admission.passportPhotoName,
              admission.docPreviousReportName,
              admission.docBirthCertificateName,
              admission.docPreviousSchoolResultName,
              admission.docTransferCertificateName,
              admission.docPassportPhotographName,
              admission.docOtherName,
            ].filter(Boolean).join(", ") || "No uploaded document names",
          )}</strong></div>
          <div class="portal-admission-modal-item portal-admission-modal-item-wide"><span>Notes</span><strong>${escapeHtml(admission.notes || admission.statusNote || "—")}</strong></div>
        </div>
        <div class="portal-admission-modal-actions">
          <button class="portal-class-button" type="button" data-admission-action="review" data-admission-id="${escapeHtml(admission.id)}" ${isAdmin ? "" : "disabled"}>Review</button>
          <button class="portal-class-button" type="button" data-admission-action="shortlisted" data-admission-id="${escapeHtml(admission.id)}" ${isAdmin ? "" : "disabled"}>Shortlist</button>
          <button class="portal-class-button is-archive" type="button" data-admission-action="rejected" data-admission-id="${escapeHtml(admission.id)}" ${isAdmin ? "" : "disabled"}>Decline</button>
          <button class="portal-class-button is-restore" type="button" data-admission-action="approved" data-admission-id="${escapeHtml(admission.id)}" ${isAdmin ? "" : "disabled"}>Accept</button>
          <button class="portal-class-button" type="button" data-admission-action="convert" data-admission-id="${escapeHtml(admission.id)}" ${isAdmin && isApproved && !isConverted ? "" : "disabled"}>${isConverted ? "Added to Students" : "Add to Students"}</button>
        </div>
      `;
    };

    const openAdmissionModal = (admissionId) => {
      const admission = getAdmissions(workspaceId).find((entry) => entry.id === admissionId);
      if (!admission) {
        setStatus(status, "error", "Application not found.");
        return;
      }
      ensureModal();
      activeAdmissionId = admissionId;
      renderModalBody(admission);
      setModalOpen(true);
    };

    if (applyLinkTarget) {
      const linkValueInput = document.getElementById("portal-admission-link-value");
      const copyLinkButton = document.getElementById("portal-admission-copy-link");
      const qrImage = document.getElementById("portal-admission-qr-image");
      let currentApplyLink = "";

      const renderApplyLink = (institutionId = "") => {
        const linkUrl = new URL("./admissions-apply.html", window.location.href);
        linkUrl.searchParams.set("workspace", workspaceId);
        if (institutionId) {
          linkUrl.searchParams.set("institution", institutionId);
        }

        currentApplyLink = linkUrl.toString();
        applyLinkTarget.href = currentApplyLink;
        applyLinkTarget.textContent = "Open/Share Application Form";

        if (linkValueInput) {
          linkValueInput.value = currentApplyLink;
        }

        if (qrImage) {
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
            currentApplyLink,
          )}`;
        }
      };

      renderApplyLink();

      if (isSupabaseConfigured()) {
        getSupabaseInstitutionContext().then((context) => {
          if (context?.institutionId) {
            renderApplyLink(context.institutionId);
          }
        }).catch(() => {
          // Keep workspace-only apply link when institution lookup fails.
        });
      }

      if (copyLinkButton) {
        copyLinkButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(currentApplyLink);
            setStatus(status, "success", "Application link copied.");
          } catch {
            setStatus(status, "info", "Copy failed on this browser. You can copy the link from the input.");
          }
        });
      }
    }

    form.addEventListener("input", () => {
      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can create admission records here.");
        return;
      }

      const payload = {
        fullName: String(form.elements.fullName?.value || "").trim(),
        email: String(form.elements.email?.value || "").trim(),
        phone: String(form.elements.phone?.value || "").trim(),
        level: String(form.elements.level?.value || "").trim(),
        guardianName: String(form.elements.guardianName?.value || "").trim(),
        guardianEmail: String(form.elements.guardianEmail?.value || "").trim(),
        guardianPhone: String(form.elements.guardianPhone?.value || "").trim(),
        notes: String(form.elements.notes?.value || "").trim(),
        status: "pending",
        source: "admin",
      };

      const admissionConfig =
        admissionConfigManager && typeof admissionConfigManager.summarize === "function"
          ? admissionConfigManager.summarize()
          : null;
      const openAdmissionSession = admissionConfig?.openSession || null;
      const firstActiveStage = (admissionConfig?.activeStages || [])[0] || null;
      payload.admissionSessionId = openAdmissionSession?.id || "";
      payload.admissionSessionName = openAdmissionSession?.name || "";
      payload.applicationStage = firstActiveStage?.name || "Submitted";

      if (!payload.fullName || !payload.level || !payload.guardianName || !payload.guardianEmail) {
        setStatus(status, "error", "Full name, level, guardian name, and guardian email are required.");
        return;
      }

      if (payload.email && !EMAIL_REGEX.test(payload.email)) {
        setStatus(status, "error", "Applicant email format is invalid.");
        return;
      }

      if (!EMAIL_REGEX.test(payload.guardianEmail)) {
        setStatus(status, "error", "Guardian email format is invalid.");
        return;
      }

      const saved = upsertAdmission(payload, workspaceId)[0];
      recordAuditEvent({
        action: "created",
        entityType: "admission-application",
        entityId: saved?.id || payload.fullName,
        summary: `Admission application received for ${payload.fullName}`,
        details: `${payload.level} • ${payload.guardianName}`,
        workspaceId,
      });
      pushNotification(
        {
          title: `Admission application: ${payload.fullName}`,
          message: `${payload.level} applicant submitted and awaiting review.`,
          entityType: "admission-application",
          entityId: saved?.id || "",
          action: "submitted",
          visibleToRoles: ["Admin"],
        },
        workspaceId,
      );

      form.reset();
      clearFormDraftFor(form);
      refreshApplicationLevelOptions();
      refresh();
      setStatus(status, "success", `Application for <strong>${escapeHtml(payload.fullName)}</strong> added.`);
    });

    const convertAdmissionToStudent = async (admission) => {
        if (!studentManager || typeof studentManager.upsertStudent !== "function") {
          setStatus(status, "error", "Student manager is not available right now.");
          return null;
        }

        if (normalizeAdmissionStatus(admission.status) !== "approved") {
          setStatus(status, "error", "Only approved applications can be converted.");
          return null;
        }

        if (admission.convertedAt) {
          setStatus(status, "info", "This application has already been converted to a student.");
          return null;
        }

        const conversion = buildStudentPayloadFromAdmission(admission);
        if (conversion.error) {
          setStatus(status, "error", conversion.error);
          return null;
        }

        const studentPayload = conversion.payload;
        studentManager.upsertStudent(studentPayload);
        const parentProvisioning = await provisionParentAccountsForStudent(studentPayload);
        upsertAdmission(
          {
            ...admission,
            convertedStudentId: studentPayload.id,
            convertedAt: nowIso(),
            status: "approved",
            statusNote: "Converted to student record",
          },
          workspaceId,
        );

        recordAuditEvent({
          action: "converted",
          entityType: "admission-application",
          entityId: admission.id,
          summary: `Converted approved applicant ${admission.fullName} to student`,
          details: `${studentPayload.admissionNo} • ${studentPayload.level}`,
          workspaceId,
        });

        pushNotification(
          {
            title: `Applicant converted: ${admission.fullName}`,
            message: `Student record created as ${studentPayload.admissionNo}.`,
            entityType: "student",
            entityId: studentPayload.admissionNo,
            action: "created",
            visibleToRoles: ["Admin"],
          },
          workspaceId,
        );

        const createdParentCopy = parentProvisioning.created.length
          ? ` Parent login created with default password <strong>${escapeHtml(DEFAULT_PARENT_PASSWORD)}</strong>.`
          : "";
        const googleParentCopy = parentProvisioning.existingGoogle.length
          ? ` ${parentProvisioning.existingGoogle.length} guardian account(s) already use Google sign-in.`
          : "";
        const failedParentCopy = parentProvisioning.failed?.length
          ? ` ${parentProvisioning.failed.length} guardian account(s) could not be provisioned.`
          : "";

        refresh();
        if (modalElement && !modalElement.hidden) {
          openAdmissionModal(admission.id);
        }
        setStatus(
          status,
          "success",
          `Accepted <strong>${escapeHtml(admission.fullName)}</strong> and added them as student <strong>${escapeHtml(
            studentPayload.admissionNo,
          )}</strong> in <strong>${escapeHtml(studentPayload.level)}</strong>.${createdParentCopy}${googleParentCopy}${failedParentCopy}`,
        );
        return studentPayload;
    };

    const handleAdmissionAction = async (admissionId, action) => {
      if (action === "convert") {
        const admission = getAdmissions(workspaceId).find((entry) => entry.id === admissionId);
        if (!admission) {
          setStatus(status, "error", "Application not found.");
          return;
        }
        await convertAdmissionToStudent(admission);
        return;
      }

      const nextStatus = normalizeAdmissionStatus(action || "review");

      if (nextStatus === "approved") {
        const admission = getAdmissions(workspaceId).find((entry) => entry.id === admissionId);
        if (!admission) {
          setStatus(status, "error", "Application not found.");
          return;
        }

        if (!studentManager || typeof studentManager.upsertStudent !== "function") {
          setStatus(status, "error", "Student manager is not available right now.");
          return;
        }

        if (admission.convertedAt) {
          setStatus(status, "info", "This application has already been added to Students.");
          return;
        }

        const conversion = buildStudentPayloadFromAdmission(admission);
        if (conversion.error) {
          setStatus(status, "error", conversion.error);
          return;
        }
      }

      const updated = setAdmissionStatus(admissionId, nextStatus, {
        workspaceId,
        reviewedBy: getSession()?.email || "admin",
      });

      if (!updated) {
        setStatus(status, "error", "Could not update this application.");
        return;
      }

      recordAuditEvent({
        action: nextStatus,
        entityType: "admission-application",
        entityId: updated.id,
        summary: `${updated.fullName} marked as ${statusLabelForAdmission(nextStatus)}`,
        details: `${updated.level} • ${updated.guardianName}`,
        workspaceId,
      });
      pushNotification(
        {
          title: `${updated.fullName}: ${statusLabelForAdmission(nextStatus)}`,
          message: `Application status updated to ${statusLabelForAdmission(nextStatus)}.`,
          entityType: "admission-application",
          entityId: updated.id,
          action: nextStatus,
          visibleToRoles: ["Admin"],
        },
        workspaceId,
      );

      if (nextStatus === "approved") {
        await convertAdmissionToStudent(updated);
        return;
      }

      refresh();
      if (modalElement && !modalElement.hidden) {
        openAdmissionModal(updated.id);
      }
      setStatus(status, "success", `Application moved to <strong>${escapeHtml(statusLabelForAdmission(nextStatus))}</strong>.`);
    };

    listTarget.addEventListener("click", (event) => {
      const entryButton = event.target.closest("[data-admission-open]");
      if (!entryButton) {
        return;
      }
      const admissionId = String(entryButton.dataset.admissionOpen || "").trim();
      if (!admissionId) {
        return;
      }
      openAdmissionModal(admissionId);
    });

    window.addEventListener(ADMISSIONS_EVENT_NAME, (event) => {
      const eventWorkspaceId = normalizeWorkspaceId(event?.detail?.workspaceId || workspaceId);
      if (eventWorkspaceId === workspaceId) {
        refresh();
      }
    });

    if (admissionConfigManager?.eventName) {
      window.addEventListener(admissionConfigManager.eventName, refreshApplicationLevelOptions);
    }

    refresh();
  }

  function initAdminAdmissionsPage() {
    if (getPage() !== "admin-admissions") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageAdmissions = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-admissions"]);
    const form = document.getElementById("portal-admission-form");
    const status = document.getElementById("portal-admission-status");
    const summaryTarget = document.getElementById("portal-admission-summary");
    const listTarget = document.getElementById("portal-admission-list");
    const applyLinkTarget = document.getElementById("portal-admission-apply-link");
    const configManager = getAdmissionConfigManager();
    const configSummary = document.getElementById("portal-admission-config-summary");
    const setupForm = document.getElementById("portal-admission-setup-form");
    const setupStatus = document.getElementById("portal-admission-setup-status");
    const setupClassPicker = document.getElementById("portal-admission-class-picker");
    const setupPreview = document.getElementById("portal-admission-setup-preview");

    initAdmissionsControls({
      isAdmin: canManageAdmissions,
      form,
      status,
      summaryTarget,
      listTarget,
      applyLinkTarget,
    });

    initAdmissionSetupControls({
      isAdmin: canManageAdmissions,
      manager: configManager,
      summaryTarget: configSummary,
      form: setupForm,
      status: setupStatus,
      classPicker: setupClassPicker,
      previewTarget: setupPreview,
      applyFormClassField: form?.elements?.level || null,
    });
  }

  function initAdminStudentsPage() {
    if (getPage() !== "admin-students") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageStudents = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-students"]);
    const studentManager = getStudentManager();
    const studentSummary = document.getElementById("portal-student-summary");
    const studentForm = document.getElementById("portal-student-form");
    const studentStatus = document.getElementById("portal-student-status");
    const studentList = document.getElementById("portal-student-list");
    const guardianList = document.getElementById("portal-guardian-list");
    const studentFormToggle = document.querySelector("[data-student-form-toggle]");

    initStudentManagementControls({
      isAdmin: canManageStudents,
      manager: studentManager,
      summaryTarget: studentSummary,
      form: studentForm,
      status: studentStatus,
      listTarget: studentList,
      guardianList,
      formToggleButton: studentFormToggle,
    });
  }

  function initAdminTeachersPage() {
    if (getPage() !== "admin-teachers") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageTeachers = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-teachers"]);
    const staffSummary = document.getElementById("portal-staff-summary");
    const staffForm = document.getElementById("portal-staff-form");
    const staffStatus = document.getElementById("portal-staff-status");
    const staffList = document.getElementById("portal-staff-list");

    initStaffManagementControls({
      isAdmin: canManageTeachers,
      summaryTarget: staffSummary,
      form: staffForm,
      status: staffStatus,
      listTarget: staffList,
    });
  }

  function initAdminClassesPage() {
    if (getPage() !== "admin-classes") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageClasses = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-classes"]);
    const classManager = getClassManager();
    const classSummary = document.getElementById("portal-class-summary");
    const classForm = document.getElementById("portal-class-form");
    const classStatus = document.getElementById("portal-class-status");
    const classList = document.getElementById("portal-class-list");

    initClassManagementControls({
      isAdmin: canManageClasses,
      manager: classManager,
      summaryTarget: classSummary,
      form: classForm,
      status: classStatus,
      listTarget: classList,
    });
  }

  function initAdminCoursesPage() {
    if (getPage() !== "admin-courses") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageCourses = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-courses"]);
    const courseManager = getCourseManager();
    const courseSummary = document.getElementById("portal-course-summary");
    const courseForm = document.getElementById("portal-course-form");
    const courseStatus = document.getElementById("portal-course-status");
    const courseList = document.getElementById("portal-course-list");

    initCourseManagementControls({
      isAdmin: canManageCourses,
      manager: courseManager,
      summaryTarget: courseSummary,
      form: courseForm,
      status: courseStatus,
      listTarget: courseList,
    });
  }

  function initAdminSchedulePage() {
    if (getPage() !== "admin-schedule") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageSchedule = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-schedule"]);
    const calendarManager = getAcademicCalendarManager();
    const calendarSummary = document.getElementById("portal-calendar-summary");
    const calendarForm = document.getElementById("portal-academic-calendar-form");
    const calendarStatus = document.getElementById("portal-academic-calendar-status");
    const calendarList = document.getElementById("portal-academic-calendar-list");
    const timetableManager = getTimetableManager();
    const timetableSummary = document.getElementById("portal-timetable-summary");
    const timetableForm = document.getElementById("portal-timetable-form");
    const timetableStatus = document.getElementById("portal-timetable-status");
    const timetableList = document.getElementById("portal-timetable-list");

    initAcademicCalendarControls({
      isAdmin: canManageSchedule,
      manager: calendarManager,
      summaryTarget: calendarSummary,
      form: calendarForm,
      status: calendarStatus,
      listTarget: calendarList,
    });

    initTimetableControls({
      isAdmin: canManageSchedule,
      manager: timetableManager,
      summaryTarget: timetableSummary,
      form: timetableForm,
      status: timetableStatus,
      listTarget: timetableList,
    });
  }

  function initAdminFeesPage() {
    if (getPage() !== "admin-fees") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageFees = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-fees"]);
    const feeManager = getFeeItemManager();
    const feeSummary = document.getElementById("portal-fee-summary");
    const feeForm = document.getElementById("portal-fee-form");
    const feeStatus = document.getElementById("portal-fee-status");
    const feeList = document.getElementById("portal-fee-list");
    const feeSetupNotice = document.getElementById("portal-fee-setup-notice");

    initFeeManagementControls({
      isAdmin: canManageFees,
      manager: feeManager,
      summaryTarget: feeSummary,
      form: feeForm,
      status: feeStatus,
      listTarget: feeList,
      setupNotice: feeSetupNotice,
    });
  }

  function initAdminAttendancePage() {
    if (getPage() !== "admin-attendance") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canReviewAttendance = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-attendance"]);
    const attendanceManager = getAttendanceManager();

    initAttendanceReviewControls({
      isAdmin: canReviewAttendance,
      manager: attendanceManager,
      summaryTarget: document.getElementById("portal-attendance-summary"),
      statusTarget: document.getElementById("portal-attendance-status"),
      listTarget: document.getElementById("portal-attendance-review-list"),
      submissionTarget: document.getElementById("portal-attendance-submission-list"),
      dateInput: document.querySelector("[data-attendance-review-date]"),
      classSelect: document.querySelector("[data-attendance-review-class]"),
      statusSelect: document.querySelector("[data-attendance-review-status]"),
      searchInput: document.querySelector("[data-attendance-review-search]"),
    });
  }

  function formatReportNumber(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-NG").format(Number.isFinite(amount) ? amount : 0);
  }

  function formatReportPercent(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? `${Math.round(amount)}%` : "Not enough data";
  }

  function clampReportScore(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(amount)));
  }

  function getReportHealthLabel(score) {
    if (score >= 80) return "Healthy";
    if (score >= 55) return "Needs attention";
    return "At risk";
  }

  function buildAdminReportSnapshot() {
    const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
    const users = getUsers().filter((user) => normalizeWorkspaceId(user.workspaceId) === workspaceId);
    const studentManager = getStudentManager();
    const classManager = getClassManager();
    const feeManager = getFeeItemManager();
    const attendanceManager = getAttendanceManager();
    const timetableManager = getTimetableManager();
    const students = studentManager && typeof studentManager.getStudents === "function" ? studentManager.getStudents() : [];
    const activeStudents = students.filter((student) => student.status === "active");
    const classes = classManager && typeof classManager.getClasses === "function" ? classManager.getClasses() : [];
    const activeClasses = classes.filter((item) => item.status !== "archived");
    const teachers = users.filter(
      (user) => normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE) === "Teacher" && normalizeUserStatus(user.status) === "active",
    );
    const admissions = getAdmissions(workspaceId);
    const admissionCounts = admissions.reduce(
      (counts, entry) => {
        const status = normalizeAdmissionStatus(entry.status);
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      },
      { pending: 0, review: 0, shortlisted: 0, rejected: 0, approved: 0 },
    );
    const attendanceSummary =
      attendanceManager && typeof attendanceManager.summarize === "function"
        ? attendanceManager.summarize({ date: getTodayDateValue() })
        : {
            activeStudentCount: activeStudents.length,
            markedCount: 0,
            attendanceRate: null,
            counts: { present: 0, absent: 0, late: 0, excused: 0, unmarked: activeStudents.length },
          };
    const feeSummary =
      feeManager && typeof feeManager.summarize === "function"
        ? feeManager.summarize()
        : { activeCount: 0, classCount: 0, activeAmount: 0, archivedCount: 0 };
    const timetableSummary =
      timetableManager && typeof timetableManager.summarize === "function"
        ? timetableManager.summarize()
        : { entries: [], publishedCount: 0, draftCount: 0, classCount: 0, teacherCount: 0, activePeriods: [] };
    const invoices = Object.values(readParentFeesState(workspaceId) || {}).filter((invoice) => invoice && invoice.invoiceNo);
    const invoiceTotalDue = invoices.reduce((sum, invoice) => sum + Number(invoice.totalDue || 0), 0);
    const invoiceBalance = invoices.reduce((sum, invoice) => sum + Number(invoice.balance || 0), 0);
    const classTeacherCount = activeClasses.filter((item) => String(item.classTeacher || "").trim()).length;
    const attendanceMarkedScore = attendanceSummary.activeStudentCount
      ? (Number(attendanceSummary.markedCount || 0) / Number(attendanceSummary.activeStudentCount || 1)) * 100
      : 0;
    const classTeacherScore = activeClasses.length ? (classTeacherCount / activeClasses.length) * 100 : 0;
    const feeCoverageScore = activeClasses.length ? (Number(feeSummary.classCount || 0) / activeClasses.length) * 100 : 0;
    const timetableCoverageScore = activeClasses.length ? (Number(timetableSummary.classCount || 0) / activeClasses.length) * 100 : 0;
    const healthScores = [
      { key: "attendance", label: "Attendance marked today", score: clampReportScore(attendanceMarkedScore) },
      { key: "class-teachers", label: "Classes with class teachers", score: clampReportScore(classTeacherScore) },
      { key: "fee-coverage", label: "Classes with fees configured", score: clampReportScore(feeCoverageScore) },
      { key: "timetable", label: "Classes with timetable lessons", score: clampReportScore(timetableCoverageScore) },
    ];
    const overallScore = healthScores.length
      ? clampReportScore(healthScores.reduce((sum, item) => sum + item.score, 0) / healthScores.length)
      : 0;

    return {
      workspaceId,
      activeStudents,
      activeClasses,
      teachers,
      admissions,
      admissionCounts,
      attendanceSummary,
      feeSummary,
      timetableSummary,
      invoices,
      invoiceTotalDue,
      invoiceBalance,
      classTeacherCount,
      healthScores,
      overallScore,
    };
  }

  function renderAdminReportsDashboard() {
    if (getPage() !== "admin-reports") {
      return;
    }

    const kpiTarget = document.getElementById("admin-report-kpis");
    const insightsTarget = document.getElementById("admin-report-insights");
    const healthTarget = document.getElementById("admin-report-health");
    const areasTarget = document.getElementById("admin-report-areas");
    const checklistTarget = document.getElementById("admin-report-checklist");
    const actionsTarget = document.getElementById("admin-report-actions");

    if (!kpiTarget || !insightsTarget || !healthTarget || !areasTarget || !checklistTarget || !actionsTarget) {
      return;
    }

    const report = buildAdminReportSnapshot();
    const attendanceCounts = report.attendanceSummary.counts || {};
    const unmarkedCount = Number(attendanceCounts.unmarked || 0);
    const attendanceRateLabel = formatReportPercent(report.attendanceSummary.attendanceRate);
    const outstandingRate = report.invoiceTotalDue ? (report.invoiceBalance / report.invoiceTotalDue) * 100 : 0;
    const approvedAdmissions = Number(report.admissionCounts.approved || 0);
    const activePipeline =
      Number(report.admissionCounts.pending || 0) +
      Number(report.admissionCounts.review || 0) +
      Number(report.admissionCounts.shortlisted || 0);

    kpiTarget.innerHTML = `
      <article class="admin-report-kpi">
        <span>Active students</span>
        <strong>${formatReportNumber(report.activeStudents.length)}</strong>
        <p>${formatReportNumber(report.activeClasses.length)} active class group${report.activeClasses.length === 1 ? "" : "s"}</p>
      </article>
      <article class="admin-report-kpi">
        <span>Attendance today</span>
        <strong>${escapeHtml(attendanceRateLabel)}</strong>
        <p>${formatReportNumber(report.attendanceSummary.markedCount || 0)} of ${formatReportNumber(report.attendanceSummary.activeStudentCount || 0)} students marked</p>
      </article>
      <article class="admin-report-kpi">
        <span>Fees configured</span>
        <strong>${formatReportNumber(report.feeSummary.activeCount || 0)}</strong>
        <p>${formatCurrencyAmount(report.feeSummary.activeAmount || 0)} active billing value</p>
      </article>
      <article class="admin-report-kpi">
        <span>Outstanding balance</span>
        <strong>${formatCurrencyAmount(report.invoiceBalance)}</strong>
        <p>${formatReportNumber(report.invoices.length)} generated invoice${report.invoices.length === 1 ? "" : "s"}</p>
      </article>
      <article class="admin-report-kpi">
        <span>Timetable coverage</span>
        <strong>${formatReportNumber(report.timetableSummary.classCount || 0)}</strong>
        <p>${formatReportNumber(report.timetableSummary.publishedCount || 0)} published lesson${Number(report.timetableSummary.publishedCount || 0) === 1 ? "" : "s"}</p>
      </article>
      <article class="admin-report-kpi">
        <span>Admissions pipeline</span>
        <strong>${formatReportNumber(activePipeline)}</strong>
        <p>${formatReportNumber(approvedAdmissions)} approved applicant${approvedAdmissions === 1 ? "" : "s"}</p>
      </article>
    `;

    const insightRows = [
      {
        title: "Student population",
        body: report.activeStudents.length
          ? `The school currently has ${formatReportNumber(report.activeStudents.length)} active student${report.activeStudents.length === 1 ? "" : "s"} spread across ${formatReportNumber(report.activeClasses.length)} class group${report.activeClasses.length === 1 ? "" : "s"}. This explains the size of daily operations.`
          : "No active students have been added yet, so most reports will remain empty until student profiles are created.",
        tone: report.activeStudents.length ? "good" : "attention",
      },
      {
        title: "Attendance reliability",
        body: unmarkedCount
          ? `${formatReportNumber(unmarkedCount)} student${unmarkedCount === 1 ? "" : "s"} still need attendance marking today. When attendance is incomplete, absence and punctuality reports can mislead parents and leadership.`
          : "Attendance is fully marked for the students currently in the register today, so daily attendance reporting is ready for review.",
        tone: unmarkedCount ? "attention" : "good",
      },
      {
        title: "Finance position",
        body: report.invoices.length
          ? `Generated invoices total ${formatCurrencyAmount(report.invoiceTotalDue)}. Guardians have ${formatCurrencyAmount(report.invoiceBalance)} still outstanding, about ${formatReportPercent(outstandingRate)} of billed invoices.`
          : `Fee items worth ${formatCurrencyAmount(report.feeSummary.activeAmount || 0)} are configured, but invoices have not been generated yet. Generate invoices when guardians should start seeing balances.`,
        tone: report.invoiceBalance > 0 ? "attention" : "good",
      },
      {
        title: "Staff and timetable",
        body:
          report.activeClasses.length && report.classTeacherCount < report.activeClasses.length
            ? `${formatReportNumber(report.activeClasses.length - report.classTeacherCount)} class group${report.activeClasses.length - report.classTeacherCount === 1 ? "" : "s"} still need a class teacher. This can affect attendance follow-up, parent contact, and report ownership.`
            : `Teacher coverage looks organised: ${formatReportNumber(report.teachers.length)} active teacher account${report.teachers.length === 1 ? "" : "s"} and ${formatReportNumber(report.timetableSummary.teacherCount || 0)} teacher${Number(report.timetableSummary.teacherCount || 0) === 1 ? "" : "s"} already appear on timetable lessons.`,
        tone: report.activeClasses.length && report.classTeacherCount < report.activeClasses.length ? "attention" : "good",
      },
    ];

    insightsTarget.innerHTML = insightRows
      .map(
        (row) => `
          <article class="admin-report-insight is-${row.tone}">
            <strong>${escapeHtml(row.title)}</strong>
            <p>${escapeHtml(row.body)}</p>
          </article>
        `,
      )
      .join("");

    healthTarget.innerHTML = `
      <div class="admin-report-health-score" style="--score:${report.overallScore}">
        <strong>${formatReportPercent(report.overallScore)}</strong>
        <span>${escapeHtml(getReportHealthLabel(report.overallScore))}</span>
      </div>
      <div class="admin-report-health-bars">
        ${report.healthScores
          .map(
            (item) => `
              <div class="admin-report-health-row">
                <div>
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${formatReportPercent(item.score)}</span>
                </div>
                <div class="admin-report-progress" aria-hidden="true"><i style="width:${item.score}%"></i></div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;

    const reportAreas = [
      {
        title: "Students and Guardians",
        metric: `${formatReportNumber(report.activeStudents.length)} active students`,
        meaning: "Shows whether the school register is complete enough for attendance, fees, communication, and reports.",
        watch: report.activeStudents.length ? "Check students without complete guardian details before sending parent-facing reports." : "Create student profiles first.",
        href: "./admin-students.html",
        action: "Open students",
      },
      {
        title: "Attendance",
        metric: attendanceRateLabel,
        meaning: "Shows how many students were present or late out of the students expected today.",
        watch: unmarkedCount ? "Follow up classes that have not submitted attendance." : "Review absence patterns and repeated lateness.",
        href: "./admin-attendance.html",
        action: "Open attendance",
      },
      {
        title: "Fees and Invoices",
        metric: formatCurrencyAmount(report.invoiceBalance || report.feeSummary.activeAmount || 0),
        meaning: "Shows how much money is configured, billed, or still unpaid depending on invoice progress.",
        watch: report.invoices.length ? "Compare outstanding balances with payment follow-up." : "Generate invoices so guardians can see balances.",
        href: "./admin-fees.html",
        action: "Open fees",
      },
      {
        title: "Classes and Teachers",
        metric: `${formatReportNumber(report.classTeacherCount)}/${formatReportNumber(report.activeClasses.length)} assigned`,
        meaning: "Shows whether each class has an accountable teacher for daily follow-up and reporting.",
        watch: report.classTeacherCount < report.activeClasses.length ? "Assign missing class teachers." : "Keep teacher assignments updated when classes change.",
        href: "./admin-classes.html",
        action: "Open classes",
      },
      {
        title: "Timetable",
        metric: `${formatReportNumber(report.timetableSummary.classCount || 0)} classes covered`,
        meaning: "Shows whether classes have recorded lessons and whether the week is structured.",
        watch: Number(report.timetableSummary.draftCount || 0) ? "Publish draft lessons when the timetable is final." : "Review teacher workload before the term begins.",
        href: "./admin-schedule.html",
        action: "Open timetable",
      },
      {
        title: "Admissions",
        metric: `${formatReportNumber(activePipeline)} in progress`,
        meaning: "Shows how many applicants still need review before they become students.",
        watch: activePipeline ? "Move approved applicants into student records once admission is confirmed." : "Keep stages updated for the next admission window.",
        href: "./admin-admissions.html",
        action: "Open admissions",
      },
    ];

    areasTarget.innerHTML = reportAreas
      .map(
        (area) => `
          <article class="admin-report-area">
            <div>
              <span>${escapeHtml(area.title)}</span>
              <strong>${escapeHtml(area.metric)}</strong>
            </div>
            <p><b>Meaning:</b> ${escapeHtml(area.meaning)}</p>
            <p><b>Watch:</b> ${escapeHtml(area.watch)}</p>
            <a href="${escapeHtml(area.href)}">${escapeHtml(area.action)}</a>
          </article>
        `,
      )
      .join("");

    const checklist = [
      {
        label: "Students are entered",
        detail: report.activeStudents.length ? "Student register has active records." : "No active students are available for reports.",
        ready: report.activeStudents.length > 0,
      },
      {
        label: "Attendance is complete",
        detail: unmarkedCount ? `${formatReportNumber(unmarkedCount)} students are unmarked today.` : "Attendance has no unmarked students today.",
        ready: unmarkedCount === 0 && report.attendanceSummary.activeStudentCount > 0,
      },
      {
        label: "Class ownership is clear",
        detail:
          report.activeClasses.length && report.classTeacherCount < report.activeClasses.length
            ? `${formatReportNumber(report.activeClasses.length - report.classTeacherCount)} classes need class teachers.`
            : "Classes have assigned ownership.",
        ready: report.activeClasses.length > 0 && report.classTeacherCount >= report.activeClasses.length,
      },
      {
        label: "Fees are visible to guardians",
        detail: report.feeSummary.activeCount ? "Fee items are configured by class." : "No active fee items have been configured.",
        ready: Number(report.feeSummary.activeCount || 0) > 0,
      },
      {
        label: "Timetable is usable",
        detail: report.timetableSummary.classCount ? "Timetable lessons exist for class review." : "No class timetables have been recorded yet.",
        ready: Number(report.timetableSummary.classCount || 0) > 0,
      },
    ];

    checklistTarget.innerHTML = checklist
      .map(
        (item) => `
          <div class="admin-report-check">
            <span class="${item.ready ? "is-ready" : "is-pending"}">${item.ready ? "Ready" : "Needs work"}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </div>
          </div>
        `,
      )
      .join("");

    const actions = [
      { label: "Student register", href: "./admin-students.html", copy: "Review complete student and guardian profiles." },
      { label: "Attendance review", href: "./admin-attendance.html", copy: "Check present, absent, late, and unmarked students." },
      { label: "Fee configuration", href: "./admin-fees.html", copy: "Review class fees, invoices, and outstanding balances." },
      { label: "Timetable sheets", href: "./admin-schedule.html", copy: "View and print saved class timetables." },
      { label: "School identity", href: "./admin-settings-school.html", copy: "Confirm school name, address, logo, and structure." },
    ];

    actionsTarget.innerHTML = actions
      .map(
        (action) => `
          <a class="admin-report-action" href="${escapeHtml(action.href)}">
            <strong>${escapeHtml(action.label)}</strong>
            <span>${escapeHtml(action.copy)}</span>
          </a>
        `,
      )
      .join("");
  }

  function initAdminReportsPage() {
    if (getPage() !== "admin-reports") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canViewReports = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-reports"]);
    const reportsWorkspace = document.querySelector(".admin-report-workspace");

    if (!canViewReports && reportsWorkspace) {
      reportsWorkspace.innerHTML = `
        <article class="admin-surface-card">
          <div class="admin-surface-head"><h2>Reports unavailable</h2><span>Permission required</span></div>
          <p class="auth-helper-text">Your account does not currently have permission to view reports.</p>
        </article>
      `;
      return;
    }

    const refresh = () => renderAdminReportsDashboard();
    refresh();

    [
      getStudentManager()?.eventName,
      getClassManager()?.eventName,
      getFeeItemManager()?.eventName,
      getAttendanceManager()?.eventName,
      getTimetableManager()?.eventName,
      getAdmissionConfigManager()?.eventName,
      ADMISSIONS_EVENT_NAME,
      PARENT_FEES_EVENT_NAME,
    ]
      .filter(Boolean)
      .forEach((eventName) => {
        window.addEventListener(eventName, refresh);
      });
  }

  function initAdminFeatureModulesPage() {
    if (getPage() !== "admin-feature-modules") {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const canManageModules = isAdmin && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-feature-modules"]);
    const featureModuleManager = getFeatureModuleManager();
    const featureToggleSummary = document.getElementById("portal-feature-toggle-summary");
    const featureToggleGrid = document.getElementById("portal-feature-toggle-grid");
    const featureToggleStatus = document.getElementById("portal-feature-toggle-status");

    initFeatureToggleControls({
      isAdmin: canManageModules,
      manager: featureModuleManager,
      summaryTarget: featureToggleSummary,
      gridTarget: featureToggleGrid,
      statusTarget: featureToggleStatus,
    });
  }

  function initAdminSettingsPage() {
    const page = getPage();

    if (!ADMIN_SETTINGS_PAGES.has(page)) {
      return;
    }

    const { isAdmin, roleLabel } = getAdminAccessContext();
    const permissionKey = PAGE_PERMISSION_KEYS[page] || PAGE_PERMISSION_KEYS["admin-settings"];
    const canManageSettings = isAdmin && canAccessPermission(roleLabel, permissionKey);
    const schoolSettingsManager = getSchoolSettingsManager();
    const rolePermissionManager = getRolePermissionManager();
    const academicCycleManager = getAcademicCycleManager();
    const schoolSettingsPreview = document.getElementById("portal-school-settings-preview");
    const schoolSettingsForm = document.getElementById("portal-school-settings-form");
    const schoolSettingsStatus = document.getElementById("portal-school-settings-status");
    const accessSummary = document.getElementById("portal-access-summary");
    const accessForm = document.getElementById("portal-access-form");
    const accessStatus = document.getElementById("portal-access-status");
    const accessList = document.getElementById("portal-access-list");
    const rolePermissionSummary = document.getElementById("portal-role-permission-summary");
    const rolePermissionGrid = document.getElementById("portal-role-permission-grid");
    const rolePermissionStatus = document.getElementById("portal-role-permission-status");
    const resetRolePermissionsButton = document.querySelector("[data-reset-role-permissions]");
    const academicCycleSummary = document.getElementById("portal-academic-cycle-summary");
    const sessionForm = document.getElementById("portal-session-form");
    const sessionStatus = document.getElementById("portal-session-status");
    const sessionList = document.getElementById("portal-session-list");
    const termForm = document.getElementById("portal-term-form");
    const termStatus = document.getElementById("portal-term-status");
    const termList = document.getElementById("portal-term-list");
    const migrationButton = document.querySelector("[data-run-supabase-migration]");
    const migrationStatus = document.getElementById("portal-supabase-migration-status");

    initSchoolSettingsControls({
      isAdmin: canManageSettings,
      manager: schoolSettingsManager,
      previewTarget: schoolSettingsPreview,
      form: schoolSettingsForm,
      status: schoolSettingsStatus,
      onSettingsUpdated: () => {
        const brandMark = document.getElementById("admin-brand-mark");
        const brandName = document.getElementById("admin-brand-name");
        const brandSubtitle = document.getElementById("admin-brand-subtitle");
        applyAdminBranding(brandMark, brandName, brandSubtitle, schoolSettingsManager);
      },
    });

    initRolePermissionControls({
      isAdmin: canManageSettings,
      manager: rolePermissionManager,
      summaryTarget: rolePermissionSummary,
      gridTarget: rolePermissionGrid,
      resetButton: resetRolePermissionsButton,
      statusTarget: rolePermissionStatus,
    });

    initAccessProvisioningControls({
      isAdmin: canManageSettings,
      summaryTarget: accessSummary,
      form: accessForm,
      status: accessStatus,
      listTarget: accessList,
    });

    initAcademicCycleControls({
      isAdmin: canManageSettings,
      manager: academicCycleManager,
      summaryTarget: academicCycleSummary,
      sessionForm,
      sessionStatus,
      sessionListTarget: sessionList,
      termForm,
      termStatus,
      termListTarget: termList,
    });

    initWorkspaceStateMigrationControls({
      isAdmin: canManageSettings,
      triggerButton: migrationButton,
      statusTarget: migrationStatus,
    });
  }

  function initUserSettingsPage() {
    if (getPage() !== "user-settings") {
      return;
    }

    const form = document.getElementById("user-settings-form");
    const status = document.getElementById("user-settings-status");
    const profileName = document.getElementById("user-settings-name");
    const profileRole = document.getElementById("user-settings-role");
    const profileEmail = document.getElementById("user-settings-email");
    const hint = document.getElementById("user-settings-hint");
    const { session, user, roleLabel } = getAdminAccessContext();

    if (!form || !status || !profileName || !profileRole || !profileEmail || !hint) {
      return;
    }

    if (!session || !user) {
      setStatus(status, "error", "Your session has expired. Please sign in again.");
      form.querySelectorAll("input, button").forEach((field) => {
        field.disabled = true;
      });
      return;
    }

    profileName.textContent = user.displayName || "School User";
    profileRole.textContent = roleLabel;
    profileEmail.textContent = user.email;

    const isGoogleAccount = user.provider === "google";
    if (isGoogleAccount) {
      hint.textContent = "This account uses Google sign-in. Password changes should be done from your Google account.";
      form.querySelectorAll("input, button").forEach((field) => {
        field.disabled = true;
      });
      setStatus(status, "info", "Google accounts do not use local passwords in this app.");
      return;
    }

    if (user.mustChangePassword) {
      hint.textContent = "You are using a default password. Only you can change it from this page.";
    }

    form.addEventListener("input", () => {
      clearFieldErrors(form);
      setStatus(status, "", "");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearFieldErrors(form);
      setStatus(status, "", "");

      const currentPassword = form.elements.currentPassword.value;
      const nextPassword = form.elements.newPassword.value;
      const confirmPassword = form.elements.confirmPassword.value;
      let hasError = false;

      if (!currentPassword) {
        setFieldError(form, "currentPassword", "Enter your current password.");
        hasError = true;
      }

      if (!nextPassword) {
        setFieldError(form, "newPassword", "Enter your new password.");
        hasError = true;
      } else if (!isStrongPassword(nextPassword)) {
        setFieldError(form, "newPassword", "Use at least 8 characters with letters and numbers.");
        hasError = true;
      }

      if (!confirmPassword) {
        setFieldError(form, "confirmPassword", "Confirm your new password.");
        hasError = true;
      } else if (nextPassword !== confirmPassword) {
        setFieldError(form, "confirmPassword", "Passwords do not match.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted fields and try again.");
        return;
      }

      const currentPasswordHash = await hashSecret(currentPassword);

      if (user.passwordHash && currentPasswordHash !== user.passwordHash) {
        setFieldError(form, "currentPassword", "Current password is incorrect.");
        setStatus(status, "error", "Current password is incorrect.");
        return;
      }

      if (!user.passwordHash && session.source !== "supabase") {
        setFieldError(form, "currentPassword", "Sign in again before changing this password.");
        setStatus(status, "error", "We could not verify the current password for this account.");
        return;
      }

      const nextPasswordHash = await hashSecret(nextPassword);

      if (nextPasswordHash === currentPasswordHash) {
        setFieldError(form, "newPassword", "Choose a different password from your current one.");
        setStatus(status, "error", "New password must be different from the current password.");
        return;
      }

      if (isSupabaseConfigured() && session.source === "supabase") {
        const client = await getSupabaseClient();
        let error;

        try {
          ({ error } = await withNetworkTimeout(
            client.auth.updateUser({
              password: nextPassword,
            }),
          ));
        } catch (requestError) {
          error = requestError;
        }

        if (error) {
          setStatus(status, "error", formatSupabaseAuthError(error, "Could not update your password."));
          return;
        }
      }

      const updatedUser = updateUser(user.id, (record) => ({
        ...record,
        passwordHash: nextPasswordHash,
        mustChangePassword: false,
      }));

      recordAuditEvent({
        action: "updated",
        entityType: "user-password",
        entityId: updatedUser?.email || user.email,
        summary: `Password changed for ${updatedUser?.email || user.email}`,
        details: `Role: ${normalizeRoleLabel(updatedUser?.role || user.role)}`,
      });

      form.reset();
      clearFormDraftFor(form);
      hint.textContent = "Password updated. Keep it safe and private.";
      setStatus(status, "success", "Password changed successfully.");
    });
  }

  function initPortalPage() {
    if (getPage() !== "portal") {
      return;
    }

    const session = getSession();
    const brandMark = document.getElementById("admin-brand-mark");
    const brandName = document.getElementById("admin-brand-name");
    const brandSubtitle = document.getElementById("admin-brand-subtitle");
    const profileAvatar = document.getElementById("admin-profile-avatar");
    const profileName = document.getElementById("admin-profile-name");
    const profileRole = document.getElementById("admin-profile-role");
    const heading = document.getElementById("portal-heading");
    const copy = document.getElementById("portal-copy");
    const lastUpdated = document.getElementById("portal-last-updated");
    const notificationButton = document.getElementById("admin-notification-button");
    const dashboardSearchInput = document.getElementById("admin-global-search");
    const metrics = document.getElementById("portal-metrics");
    const events = document.getElementById("admin-events");
    const activity = document.getElementById("admin-activity");
    const links = document.getElementById("portal-links");
    const details = document.getElementById("portal-details");
    const teacherAttendance = document.getElementById("teacher-attendance-workspace");
    const gate = document.getElementById("portal-gate");
    const schoolSettingsManager = getSchoolSettingsManager();
    const academicCalendarManager = getAcademicCalendarManager();

    if (
      !brandMark ||
      !brandName ||
      !brandSubtitle ||
      !profileAvatar ||
      !profileName ||
      !profileRole ||
      !heading ||
      !copy ||
      !lastUpdated ||
      !metrics ||
      !events ||
      !gate
    ) {
      return;
    }

    const getActiveSchoolSettings = () =>
      schoolSettingsManager
        ? schoolSettingsManager.getSettings()
        : {
            schoolName: "SchoolSphere",
            logoUrl: "",
            schoolProfile: "",
            address: "",
            campusDetails: "",
            phone: "",
            website: "",
            academicYearStart: "",
            academicYearEnd: "",
            schoolTypes: ["primary", "secondary"],
            higherInstitutionType: "university",
            hasNursery: false,
            hasPrimary: true,
            hasSecondary: true,
            hasHigherInstitution: false,
          };

    const renderDashboardBrand = (settings) => {
      const academicYearLabel =
        schoolSettingsManager && schoolSettingsManager.formatAcademicYearLabel(settings)
          ? schoolSettingsManager.formatAcademicYearLabel(settings)
          : "Admin dashboard";

      brandName.textContent = settings.schoolName || "SchoolSphere";
      brandSubtitle.textContent = academicYearLabel || "Admin dashboard";

      if (settings.logoUrl) {
        brandMark.classList.add("is-image");
        brandMark.innerHTML = `<img src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(
          settings.schoolName,
        )} logo" />`;
      } else {
        brandMark.classList.remove("is-image");
        brandMark.textContent = getInitials(settings.schoolName).charAt(0) || "S";
      }
    };

    const renderDashboardChrome = (userRecord, roleLabel, snapshot) => {
      const settings = getActiveSchoolSettings();
      const schoolName = settings.schoolName || "SchoolSphere";

      renderDashboardBrand(settings);

      if (!userRecord) {
        heading.textContent = "You're not signed in yet.";
        copy.textContent = `Use the login or signup flow to access the ${schoolName} admin workspace.`;
        lastUpdated.textContent = "Awaiting sign-in";
        profileAvatar.textContent = getInitials(schoolName).charAt(0) || "S";
        profileName.textContent = schoolName;
        profileRole.textContent = "Guest access";
        return;
      }

      profileAvatar.textContent = getInitials(userRecord.displayName || userRecord.email);
      profileName.textContent = userRecord.displayName || userRecord.email;
      profileRole.textContent = roleLabel;
      heading.textContent = `${getDayGreeting()}, ${getFirstName(userRecord.displayName)}!`;
      copy.textContent = `Here's what's happening at ${schoolName} today.`;
      lastUpdated.textContent = `Updated ${formatTimestamp(snapshot.updatedAt)}`;
    };

    const renderLoggedOutState = (messageHeading, messageCopy, buttonLabel) => {
      const settings = getActiveSchoolSettings();

      renderDashboardChrome(null, "Guest access", { updatedAt: nowIso() });
      metrics.innerHTML = `
        <article class="admin-metric-card admin-metric-card-blue admin-metric-card-empty">
          <strong>0</strong>
          <h3>${messageHeading}</h3>
          <p>${messageCopy}</p>
        </article>
      `;
      events.innerHTML = `
        <article class="admin-event-row admin-event-row-empty">
          <div class="admin-event-copy admin-event-copy-blue">
            <strong>Admin access required</strong>
            <span>Sign in to see today's classes, meetings, and event schedule for ${escapeHtml(
              settings.schoolName,
            )}.</span>
          </div>
        </article>
      `;
      if (activity) {
        activity.innerHTML = `
          <article class="admin-activity-row admin-activity-row-empty">
            <div class="admin-activity-copy">
              <p><strong>No activity visible yet.</strong></p>
              <small>Recent actions appear here after sign-in.</small>
            </div>
          </article>
        `;
      }
      if (links) {
        links.innerHTML = "";
      }
      if (details) {
        details.innerHTML = "";
      }
      gate.innerHTML = `<a class="admin-signout-button" href="./login.html">${buttonLabel}</a>`;
    };

    if (!session) {
      renderLoggedOutState(
        "Sign in required",
        "Use the login or signup flow to load the live school dashboard.",
        "Go to Login",
      );
      initAdminSectionQuickNav();
      initDashboardGlobalSearch(dashboardSearchInput, null, "Guest access");
      initPortalNotifications(notificationButton, null);
      return;
    }

    const user = getUsers().find((entry) => entry.id === session.userId) || null;

    if (!user) {
      clearSession();
      renderLoggedOutState(
        "Session expired",
        "Your saved session is stale. Sign in again to reopen the admin dashboard.",
        "Sign in Again",
      );
      initAdminSectionQuickNav();
      initDashboardGlobalSearch(dashboardSearchInput, null, "Guest access");
      initPortalNotifications(notificationButton, null);
      return;
    }

    const snapshot = getDashboardSnapshot();
    const roleLabel = normalizeRoleLabel(session.role || user.role || DEFAULT_AUTH_ROLE);

    if (roleLabel === "Parent") {
      window.location.assign(getRoleHomeRoute(roleLabel));
      return;
    }

    const hasDashboardAccess = canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS.portal);

    renderDashboardChrome(user, roleLabel, snapshot);
    if (hasDashboardAccess) {
      renderAdminMetricCards(metrics, snapshot);
      renderAdminEvents(events);
      if (activity) {
        renderAdminActivity(activity);
      }
    } else {
      metrics.innerHTML = `
        <article class="admin-metric-card admin-metric-card-rose admin-metric-card-empty">
          <strong>Access restricted</strong>
          <h3>Dashboard permission required</h3>
          <p>Your role is active, but dashboard visibility is disabled in role permissions.</p>
        </article>
      `;
      events.innerHTML = "";
      if (activity) {
        activity.innerHTML = "";
      }
    }

    const refreshTeacherAttendanceWorkspace = () => {
      if (!teacherAttendance) {
        return;
      }

      if (roleLabel === "Teacher" && canAccessPermission(roleLabel, PAGE_PERMISSION_KEYS["admin-attendance"])) {
        renderTeacherAttendanceWorkspace(teacherAttendance, user);
      } else {
        teacherAttendance.hidden = true;
        teacherAttendance.innerHTML = "";
      }
    };

    refreshTeacherAttendanceWorkspace();

    if (academicCalendarManager?.eventName) {
      window.addEventListener(academicCalendarManager.eventName, () => {
        renderAdminEvents(events);
      });
    }

    const attendanceManager = getAttendanceManager();
    if (hasDashboardAccess && attendanceManager?.eventName) {
      window.addEventListener(attendanceManager.eventName, () => {
        renderAdminMetricCards(metrics, getDashboardSnapshot());
      });
    }

    [getClassManager(), getCourseManager(), getStudentManager()].forEach((manager) => {
      if (manager?.eventName && teacherAttendance) {
        window.addEventListener(manager.eventName, refreshTeacherAttendanceWorkspace);
      }
    });

    if (links) {
      const availableLinks = DASHBOARD_SECTION_LINKS.filter((item) => canAccessPermission(roleLabel, item.permissionKey));
      links.innerHTML = availableLinks.map(
        (item) => `
          <a class="admin-link-card" href="${item.href}">
            <strong>${item.label}</strong>
            <p>${item.copy}</p>
            <span>Open section</span>
          </a>
        `,
      ).join("");
    }

    if (details) {
      details.innerHTML = `
        <div class="admin-session-card">
          <span>Email</span>
          <strong>${escapeHtml(user.email)}</strong>
        </div>
        <div class="admin-session-card">
          <span>Sign-in method</span>
          <strong>${user.provider === "google" ? "Google" : "Email and password"}</strong>
        </div>
        <div class="admin-session-card">
          <span>Email confirmed</span>
          <strong>${user.isConfirmed ? "Yes" : "No"}</strong>
        </div>
        <div class="admin-session-card">
          <span>Selected role</span>
          <strong>${escapeHtml(normalizeRoleLabel(session.role || user.role || DEFAULT_AUTH_ROLE))}</strong>
        </div>
        <div class="admin-session-card">
          <span>Session type</span>
          <strong>${session.persistence === "persistent" ? "Stay logged in" : "Browser session only"}</strong>
        </div>
        <div class="admin-session-card">
          <span>Password status</span>
          <strong>${user.provider === "google" ? "Managed by Google" : user.mustChangePassword ? "Default password active" : "Updated password"}</strong>
        </div>
      `;
    }

    gate.innerHTML = `
      <a class="admin-signout-button" href="./user-settings.html">My settings</a>
      <button class="admin-signout-button" type="button" data-signout>Log out</button>
    `;
    const activeSignOutButton = gate.querySelector("[data-signout]");

    if (activeSignOutButton) {
      activeSignOutButton.addEventListener("click", async () => {
        await signOutCurrentUser();
        window.location.assign("./login.html");
      });
    }

    initAdminSectionQuickNav();
    initDashboardGlobalSearch(dashboardSearchInput, session, roleLabel);
    initPortalNotifications(notificationButton, session);
  }
})();
