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
  const NOTIFICATION_STORAGE_PREFIX = "schoolsphere.notifications.v1";
  const NOTIFICATION_EVENT_NAME = "schoolsphere:notifications:updated";
  const FORM_DRAFT_STORAGE_PREFIX = "schoolsphere.form-draft.v1";
  const NETWORK_RESILIENCE_BANNER_ID = "network-resilience-banner";
  const STUDENT_STORAGE_KEY_BASE = "schoolsphere.students.v1";
  const AUTH_ROLES = ["Admin", "Teacher", "Student", "Parent"];
  const PARENT_SELECTION_STORAGE_PREFIX = "schoolsphere.parent.selected-child.v1";
  const PARENT_FEES_STORAGE_PREFIX = "schoolsphere.parent.fees.v1";
  const ADMISSIONS_STORAGE_KEY_BASE = "schoolsphere.admissions.v1";
  const ADMISSIONS_EVENT_NAME = "schoolsphere:admissions:updated";
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
      copy: "Define course catalog, manage codes and levels, and control teacher/student assignment from one source.",
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
      copy: "Manage timetable windows, room usage, and class-day sequencing.",
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
      label: "Feature Modules",
      href: "./admin-feature-modules.html",
      permissionKey: "settings_manage",
      copy: "Turn major platform modules on or off without redeploying the application.",
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

  document.addEventListener("DOMContentLoaded", async () => {
    await initSupabaseAuthBridge();
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
    initAdminFeatureModulesPage();
    initAdminSettingsPage();
    initUserSettingsPage();
    initAdmissionsApplyPage();
    initFormDraftPersistence();
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
      { formId: "portal-school-settings-form" },
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
    admissions[index] = normalizeAdmissionRecord(
      {
        ...admissions[index],
        status: normalizedStatus,
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
      return normalizedIncoming;
    }

    const existingAll = getAccessGrants({ allWorkspaces: true });
    const preserved = existingAll.filter(
      (record) => normalizeWorkspaceId(record.workspaceId || "public") !== targetWorkspaceId,
    );
    const merged = [...preserved, ...normalizedIncoming];
    localStorage.setItem(ACCESS_GRANTS_STORAGE_KEY, JSON.stringify(merged));
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

  function normalizeAuthProvider(value) {
    return String(value || "").trim().toLowerCase() === "google" ? "google" : "password";
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
    const activeStaffCount = users.filter(
      (user) =>
        normalizeRoleLabel(user.role) === "Teacher" &&
        normalizeUserStatus(user.status) === "active" &&
        normalizeWorkspaceId(user.workspaceId) === workspaceId,
    ).length;

    return {
      activeStudents: studentSummary ? studentSummary.activeCount : null,
      staffCount: activeStaffCount,
      attendanceRate: null,
      activeIncidents: null,
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

    const existingButton = document.querySelector("[data-sidebar-toggle]");
    const toggleButton = existingButton || document.createElement("button");

    if (!existingButton) {
      toggleButton.type = "button";
      toggleButton.className = "admin-sidebar-toggle";
      toggleButton.setAttribute("data-sidebar-toggle", "");
      toggleButton.setAttribute("aria-label", "Toggle sidebar");
      toggleButton.innerHTML = `
        <span class="admin-sidebar-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 7h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 17h16"></path>
          </svg>
        </span>
      `;
      document.body.append(toggleButton);
    }

    const setCollapsed = (collapsed) => {
      document.body.classList.toggle("admin-sidebar-collapsed", collapsed);
      toggleButton.setAttribute("aria-expanded", String(!collapsed));
      toggleButton.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
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

  function getClassManager() {
    return window.SchoolSphereClasses || null;
  }

  function getCourseManager() {
    return window.SchoolSphereCourses || null;
  }

  function getStudentManager() {
    return window.SchoolSphereStudents || null;
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
      hasNursery: false,
      hasHigherInstitution: false,
    };
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

    const normalizeLookupToken = (value) => String(value || "").trim().toLowerCase();

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
          ? "Use active course names from Course Management (comma separated)"
          : "Create active courses first on the Courses page, then list them here";
      }
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

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleClassFormVisibility);
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
        .filter((assignment) => !courseLookup.has(normalizeLookupToken(assignment.subject)))
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

      if (!payload.arms.length) {
        setPortalClassError(form, "arms", "Enter at least one arm.");
        hasError = true;
      }

      if (!payload.subjects.length) {
        setPortalClassError(form, "subjects", "Enter at least one subject.");
        hasError = true;
      } else if (!activeCourseCatalog.length) {
        setPortalClassError(form, "subjects", "Create at least one active course before assigning subjects.");
        hasError = true;
      } else if (unknownSubjects.length) {
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
      } else if (!payload.teacherAssignments.length) {
        setPortalClassError(form, "teacherAssignments", "Enter at least one teacher assignment.");
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
      const record = manager.getClasses().find((item) => item.id === classId);

      if (!record) {
        return;
      }

      clearPortalClassErrors(form);

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

    const setCourseFormVisibility = (isVisible) => {
      form.hidden = !isVisible;

      if (formToggleButton) {
        formToggleButton.textContent = isVisible ? "Hide course form" : "Create course";
        formToggleButton.setAttribute("aria-expanded", String(isVisible));
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

    form.addEventListener("input", () => {
      clearPortalCourseErrors(form);

      if (isAdmin) {
        setStatus(status, "", "");
      }
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
    };

    refreshCourseManagementSection();
    resetPortalCourseForm(form, isAdmin);
    setCourseFormVisibility(false);

    if (formToggleButton) {
      formToggleButton.disabled = !isAdmin || !manager;
      formToggleButton.addEventListener("click", toggleCourseFormVisibility);
    }

    if (!manager) {
      setCourseFormVisibility(false);
      return;
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
      const payload = {
        id: courseId || undefined,
        name: form.elements.name.value.trim(),
        code: form.elements.code.value.trim().toUpperCase(),
        description: form.elements.description.value.trim(),
        level: form.elements.level.value.trim(),
        teacherAssignments: parseLineSeparatedValues(form.elements.teacherAssignments.value),
        studentAssignments: parseLineSeparatedValues(form.elements.studentAssignments.value),
      };

      let hasError = false;

      if (!payload.name) {
        setPortalCourseError(form, "name", "Enter the course name.");
        hasError = true;
      }

      if (!payload.code) {
        setPortalCourseError(form, "code", "Enter the course code.");
        hasError = true;
      }

      if (!payload.description) {
        setPortalCourseError(form, "description", "Add a short course description.");
        hasError = true;
      }

      if (!payload.level) {
        setPortalCourseError(form, "level", "Enter the level for this course.");
        hasError = true;
      }

      const duplicate = manager
        .getCourses()
        .find(
          (record) =>
            record.id !== courseId &&
            (record.code.toLowerCase() === payload.code.toLowerCase() ||
              (record.name.toLowerCase() === payload.name.toLowerCase() &&
                record.level.toLowerCase() === payload.level.toLowerCase())),
        );

      if (duplicate) {
        setPortalCourseError(
          form,
          "code",
          "This course code or same name-level combination already exists.",
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted course details and try again.");
        return;
      }

      const currentRecord = manager.getCourses().find((record) => record.id === courseId) || null;
      manager.upsertCourse({
        ...currentRecord,
        ...payload,
        status: currentRecord ? currentRecord.status : "active",
      });
      recordAuditEvent({
        action: currentRecord ? "updated" : "created",
        entityType: "course",
        entityId: payload.code || payload.name,
        summary: currentRecord
          ? `Updated course ${payload.code} · ${payload.name}`
          : `Created course ${payload.code} · ${payload.name}`,
        details: `${payload.level} • ${payload.teacherAssignments.length} teacher assignments • ${payload.studentAssignments.length} student assignments`,
      });

      resetPortalCourseForm(form, isAdmin);
      clearFormDraftFor(form);
      setCourseFormVisibility(false);
      setStatus(
        status,
        "success",
        currentRecord
          ? `Course <strong>${escapeHtml(payload.code)} · ${escapeHtml(
              payload.name,
            )}</strong> updated and now controls assignment data.`
          : `Course <strong>${escapeHtml(payload.code)} · ${escapeHtml(
              payload.name,
            )}</strong> created and ready for assignment.`,
      );
    });

    const courseCancelButton = form.querySelector("[data-course-cancel]");

    if (courseCancelButton) {
      courseCancelButton.addEventListener("click", () => {
        clearPortalCourseErrors(form);
        resetPortalCourseForm(form, isAdmin);
        setCourseFormVisibility(false);
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
        populatePortalCourseForm(form, record, isAdmin);
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
        resetPortalCourseForm(form, isAdmin);
        setCourseFormVisibility(false);
        setStatus(
          status,
          "success",
          `Course <strong>${escapeHtml(record.code)} · ${escapeHtml(
            record.name,
          )}</strong> archived and removed from active assignment options.`,
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
        resetPortalCourseForm(form, isAdmin);
        setCourseFormVisibility(false);
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

    form.addEventListener("input", () => {
      clearPortalSettingsErrors(form);
      if (isAdmin) setStatus(status, "", "");
      // Live preview
      if (previewTarget) previewTarget.innerHTML = buildLivePreviewFromForm(form, isAdmin);
      // Live logo swatch
      updateLogoSwatch(form, form.elements.logoUrl?.value.trim() || "", form.elements.schoolName?.value.trim() || "");
    });

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

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setStatus(status, "info", "Only administrators can update school settings.");
        return;
      }

      clearPortalSettingsErrors(form);
      setStatus(status, "", "");

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
        hasNursery: Boolean(form.elements.hasNursery?.checked),
        hasHigherInstitution: Boolean(form.elements.hasHigherInstitution?.checked),
      };

      let hasError = false;

      if (!payload.schoolName) {
        setPortalSettingsError(form, "schoolName", "Enter the school name.");
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
        `School settings saved for <strong>${escapeHtml(payload.schoolName)}</strong>. The updated identity is now reflected across the site.`,
      );
    });

    const resetButton = form.querySelector("[data-reset-school-settings]");

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (!isAdmin) {
          setStatus(status, "info", "Only administrators can update school settings.");
          return;
        }

        clearPortalSettingsErrors(form);
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

  function initFeatureToggleControls({ isAdmin, manager, summaryTarget, gridTarget }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

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

    window.addEventListener(manager.eventName, refreshFeatureToggleSection);
  }

  function initRolePermissionControls({
    isAdmin,
    manager,
    summaryTarget,
    gridTarget,
    resetButton,
  }) {
    if (!summaryTarget || !gridTarget) {
      return;
    }

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
      if (termForm.elements.status) termForm.elements.status.value = "closed";
      const submitButton = termForm.querySelector("[data-term-submit]");
      const cancelButton = termForm.querySelector("[data-term-cancel]");
      if (submitButton) submitButton.textContent = "Save term";
      if (cancelButton) cancelButton.hidden = true;
      Array.from(termForm.elements).forEach((field) => {
        if (field instanceof HTMLElement) field.disabled = !isAdmin;
      });
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

      summaryTarget.innerHTML = `
        <strong>Open session: ${escapeHtml(openSession?.name || "None")}</strong>
        <span>Open term: ${escapeHtml(openTerm?.name || "None")} • Total sessions: ${
          sessions.length
        } • Total terms: ${terms.length}</span>
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

      termListTarget.innerHTML = terms.length
        ? terms
            .map((term) => {
              const termSession = sessions.find((session) => session.id === term.sessionId);
              return `
                <article class="portal-class-card">
                  <div class="portal-class-meta">
                    <div class="portal-class-meta-item">
                      <span>Term</span>
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
                      ${term.status === "open" ? "Close term" : "Open term"}
                    </button>
                  </div>
                </article>
              `;
            })
            .join("")
        : `
            <article class="portal-class-empty">
              <strong>No terms yet</strong>
              <p>Create terms inside sessions and mark a term open when it becomes active.</p>
            </article>
          `;

      if (!isAdmin) {
        setStatus(
          sessionStatus,
          "info",
          "Only admin accounts with settings permission can open or close sessions and terms.",
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
        setStatus(termStatus, "info", "Only administrators can manage academic terms.");
        return;
      }

      clearPortalTermErrors(termForm);
      setStatus(termStatus, "", "");

      const payload = {
        id: termForm.elements.termId.value || undefined,
        sessionId: termForm.elements.sessionId.value || "",
        name: termForm.elements.name.value.trim(),
        startDate: termForm.elements.startDate.value || "",
        endDate: termForm.elements.endDate.value || "",
        status: termForm.elements.status.value === "open" ? "open" : "closed",
      };

      let hasError = false;

      if (!payload.sessionId) {
        setPortalTermError(termForm, "sessionId", "Select a session for this term.");
        hasError = true;
      }

      if (!payload.name) {
        setPortalTermError(termForm, "name", "Enter the term name.");
        hasError = true;
      }

      if (payload.endDate && payload.startDate && payload.endDate < payload.startDate) {
        setPortalTermError(termForm, "endDate", "Term end date must be after the term start date.");
        hasError = true;
      }

      if (hasError) {
        setStatus(termStatus, "error", "Fix the highlighted term details and try again.");
        return;
      }

      const existing = manager.getState().terms.find((term) => term.id === payload.id) || null;
      manager.upsertTerm(payload);
      recordAuditEvent({
        action: existing ? "updated" : "created",
        entityType: "academic-term",
        entityId: payload.name,
        summary: `${existing ? "Updated" : "Created"} term ${payload.name}`,
        details: `Status: ${payload.status}`,
      });
      setStatus(
        termStatus,
        "success",
        `Term <strong>${escapeHtml(payload.name)}</strong> saved as ${
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
        termForm.elements.name.value = term.name;
        termForm.elements.startDate.value = term.startDate || "";
        termForm.elements.endDate.value = term.endDate || "";
        termForm.elements.status.value = term.status;
        const submitButton = termForm.querySelector("[data-term-submit]");
        const cancelButton = termForm.querySelector("[data-term-cancel]");
        if (submitButton) submitButton.textContent = "Save changes";
        if (cancelButton) cancelButton.hidden = false;
        return;
      }

      manager.setTermStatus(term.id, action === "open" ? "open" : "closed");
      recordAuditEvent({
        action: action === "open" ? "opened" : "closed",
        entityType: "academic-term",
        entityId: term.name,
        summary: `${action === "open" ? "Opened" : "Closed"} term ${term.name}`,
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
    form.querySelectorAll("[data-settings-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setPortalSettingsError(form, fieldName, message) {
    const error = form.querySelector(`[data-settings-error-for="${fieldName}"]`);
    const control = form.elements[fieldName];
    const field = control ? control.closest(".portal-field") : null;

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
      cancelButton.hidden = true;
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

    if (form.elements.studentAssignments) {
      form.elements.studentAssignments.value = "";
    }

    const submitButton = form.querySelector("[data-course-submit]");
    const cancelButton = form.querySelector("[data-course-cancel]");

    if (submitButton) {
      submitButton.textContent = "Create course";
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
    form.elements.description.value = record.description || "";
    form.elements.level.value = record.level || "";
    form.elements.teacherAssignments.value = (record.teacherAssignments || []).join("\n");
    form.elements.studentAssignments.value = (record.studentAssignments || []).join("\n");

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

  function buildSchoolPreviewHtml(settings, isAdmin) {
    const initial = (settings.schoolName || "S").charAt(0).toUpperCase();
    const yearLabel = settings.academicYearStart
      ? (settings.academicYearEnd
          ? `${settings.academicYearStart} – ${settings.academicYearEnd}`
          : `From ${settings.academicYearStart}`)
      : null;
    const structureLabel = [
      settings.hasNursery ? "Nursery" : null,
      "Primary 1-6",
      "JSS 1-3",
      "SS 1-3",
      settings.hasHigherInstitution ? "Higher Institution" : null,
    ]
      .filter(Boolean)
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
    if (form.elements.hasNursery) {
      form.elements.hasNursery.checked = Boolean(settings.hasNursery);
    }
    if (form.elements.hasHigherInstitution) {
      form.elements.hasHigherInstitution.checked = Boolean(settings.hasHigherInstitution);
    }

    // Update the logo swatch preview
    updateLogoSwatch(form, settings.logoUrl, settings.schoolName);

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) field.disabled = !isAdmin;
    });

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
      hasNursery:       Boolean(form.elements.hasNursery?.checked),
      hasHigherInstitution: Boolean(form.elements.hasHigherInstitution?.checked),
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
    form.elements.tempPassword.value = "";

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

  function renderPortalStaffManagementSection({ isAdmin, summaryTarget, listTarget }) {
    if (!summaryTarget || !listTarget) {
      return;
    }

    const allUsers = getUsers();
    const workspaceId = getCurrentWorkspaceId();
    const managedUsers = allUsers
      .filter(
        (user) =>
          normalizeWorkspaceId(user.workspaceId) === workspaceId &&
          (user.staffProfileManaged === true || normalizeRoleLabel(user.role) === "Teacher"),
      )
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
    const activeCount = managedUsers.filter((user) => normalizeUserStatus(user.status) === "active").length;
    const inactiveCount = managedUsers.length - activeCount;
    const roleCount = AUTH_ROLES.reduce((acc, role) => {
      acc[role] = managedUsers.filter((user) => normalizeRoleLabel(user.role) === role).length;
      return acc;
    }, {});

    summaryTarget.innerHTML = `
      <strong>${activeCount} active staff account${activeCount === 1 ? "" : "s"}</strong>
      <span>${
        isAdmin
          ? `${inactiveCount} deactivated • Roles: Admin ${roleCount.Admin || 0}, Teacher ${
              roleCount.Teacher || 0
            }, Student ${roleCount.Student || 0}, Parent ${roleCount.Parent || 0}.`
          : "Only administrators can create or update staff profiles and role assignments."
      }</span>
    `;

    if (!managedUsers.length) {
      listTarget.innerHTML = `
        <article class="portal-class-empty">
          <strong>No staff profiles yet</strong>
          <p>Create the first staff profile and assign one of the four standard roles.</p>
        </article>
      `;
      return;
    }

    listTarget.innerHTML = managedUsers
      .map((user) => {
        const status = normalizeUserStatus(user.status) === "active" ? "Active" : "Deactivated";
        const role = normalizeRoleLabel(user.role || DEFAULT_AUTH_ROLE);
        const passwordMode =
          user.provider === "google"
            ? "Google sign-in"
            : user.mustChangePassword
              ? "Default password (change required)"
              : "Custom password";

        return `
          <article class="portal-class-card">
            <div class="portal-class-meta">
              <div class="portal-class-meta-item">
                <span>Name</span>
                <strong>${escapeHtml(user.displayName || "Staff User")}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Email</span>
                <strong>${escapeHtml(user.email)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Status</span>
                <strong>${escapeHtml(status)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Role</span>
                <strong>${escapeHtml(role)}</strong>
              </div>
              <div class="portal-class-meta-item">
                <span>Sign-in</span>
                <strong>${escapeHtml(passwordMode)}</strong>
              </div>
            </div>
            <div class="portal-class-extended">
              <div class="portal-class-extended-item">
                <span>Phone</span>
                <strong>${escapeHtml(user.phone || "—")}</strong>
              </div>
              <div class="portal-class-extended-item">
                <span>Department</span>
                <strong>${escapeHtml(user.department || "—")}</strong>
              </div>
              <div class="portal-class-extended-item">
                <span>Title</span>
                <strong>${escapeHtml(user.title || "—")}</strong>
              </div>
            </div>
            <div class="portal-class-actions">
              <button class="portal-class-button" type="button" data-staff-action="edit" data-staff-id="${user.id}" ${
          isAdmin ? "" : "disabled"
        }>
                Edit
              </button>
              <button class="portal-class-button ${status === "Active" ? "is-archive" : "is-restore"}" type="button" data-staff-action="${
          status === "Active" ? "deactivate" : "activate"
        }" data-staff-id="${user.id}" ${isAdmin ? "" : "disabled"}>
                ${status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function initStaffManagementControls({ isAdmin, summaryTarget, form, status, listTarget }) {
    if (!summaryTarget || !form || !status || !listTarget) {
      return;
    }

    const refreshStaff = () => {
      renderPortalStaffManagementSection({
        isAdmin,
        summaryTarget,
        listTarget,
      });
    };

    form.addEventListener("input", () => {
      clearPortalStaffErrors(form);
      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

    refreshStaff();
    resetPortalStaffForm(form, isAdmin);

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
      const role = normalizeRoleLabel(form.elements.role?.value || DEFAULT_AUTH_ROLE);
      const phone = String(form.elements.phone?.value || "").trim();
      const department = String(form.elements.department?.value || "").trim();
      const title = String(form.elements.title?.value || "").trim();
      const tempPassword = form.elements.tempPassword.value;

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
      }

      if (!AUTH_ROLES.includes(role)) {
        setPortalStaffError(form, "role", "Select a valid role.");
        hasError = true;
      }

      if (phone && !isValidPhoneNumber(phone)) {
        setPortalStaffError(form, "phone", "Wrong phone number format.");
        hasError = true;
      }

      if (tempPassword && !isStrongPassword(tempPassword)) {
        setPortalStaffError(form, "tempPassword", "Use at least 8 characters with letters and numbers.");
        hasError = true;
      }

      if (hasError) {
        setStatus(status, "error", "Fix the highlighted fields and try again.");
        return;
      }

      const workspaceId = getCurrentWorkspaceId();
      const activePassword = tempPassword || DEFAULT_STAFF_PASSWORD;
      let result = isSupabaseConfigured()
        ? await provisionSupabaseManagedUser({
            email,
            displayName,
            role,
            password: activePassword,
            workspaceId,
            mustChangePassword: !tempPassword,
          })
        : await upsertManagedPasswordUser({
            email,
            displayName,
            role,
            password: activePassword,
            workspaceId,
            preserveExistingPassword: !tempPassword,
            forcePasswordReset: !tempPassword,
          });

      if (!result.user && isSupabaseConfigured()) {
        const localFallback = await upsertManagedPasswordUser({
          email,
          displayName,
          role,
          password: activePassword,
          workspaceId,
          preserveExistingPassword: !tempPassword,
          forcePasswordReset: !tempPassword,
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
        setStatus(status, "error", "Could not set a password for an existing Google-only account.");
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
        details: `${role} • ${tempPassword ? "Custom password set by admin." : "Default password issued."}`,
      });

      resetPortalStaffForm(form, isAdmin);
      clearFormDraftFor(form);
      refreshStaff();

      setStatus(
        status,
        "success",
        staffId
          ? `Updated staff profile for <strong>${escapeHtml(result.user.email)}</strong> as <strong>${escapeHtml(
              role,
            )}</strong>.`
          : `Staff account created for <strong>${escapeHtml(result.user.email)}</strong>. Default password: <strong>${escapeHtml(
              DEFAULT_STAFF_PASSWORD,
            )}</strong> • Role: <strong>${escapeHtml(role)}</strong>.`,
      );
    });

    listTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-staff-action]");

      if (!button || !isAdmin) {
        return;
      }

      const staffId = button.dataset.staffId;
      const action = button.dataset.staffAction;
      const user = getUsers().find((entry) => entry.id === staffId);

      if (!user || normalizeRoleLabel(user.role) !== "Teacher") {
        return;
      }

      if (action === "edit") {
        clearPortalStaffErrors(form);
        populatePortalStaffForm(form, user, isAdmin);
        setStatus(status, "info", `Editing staff account for <strong>${escapeHtml(user.email)}</strong>.`);
        return;
      }

      if (action === "deactivate" || action === "activate") {
        const nextStatus = action === "activate" ? "active" : "deactivated";
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
      }
    });

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
          <p>Create the first class here to start assigning students, teachers, timetable slots, and course coverage.</p>
        </article>
      `;
    } else {
      listTarget.innerHTML = classes
        .map(
          (record) => `
            <details class="portal-class-card portal-class-list-item ${record.status === "archived" ? "is-archived" : ""}">
              <summary class="portal-class-list-summary">
                <div class="portal-class-list-main">
                  <strong>${escapeHtml(record.level)} · ${escapeHtml(record.name)}</strong>
                  <span>${Number(record.capacity).toLocaleString()} learners • ${escapeHtml(
                    record.classTeacher || "No class teacher yet",
                  )}</span>
                </div>
                <span class="portal-class-status ${record.status === "archived" ? "is-archived" : "is-active"}">
                  ${record.status === "archived" ? "Archived" : "Active"}
                </span>
              </summary>

              <div class="portal-class-list-body">
                <div class="portal-class-meta">
                  <div class="portal-class-meta-item">
                    <span>Capacity</span>
                    <strong>${Number(record.capacity).toLocaleString()} learners</strong>
                  </div>
                  <div class="portal-class-meta-item">
                    <span>Class teacher</span>
                    <strong>${escapeHtml(record.classTeacher || "Not assigned yet")}</strong>
                  </div>
                  <div class="portal-class-meta-item">
                    <span>Updated</span>
                    <strong>${escapeHtml(formatTimestamp(record.updatedAt))}</strong>
                  </div>
                </div>

                <div class="portal-class-extended">
                  <div class="portal-class-extended-item">
                    <span>Arms</span>
                    <strong>${escapeHtml((record.arms || []).join(", ") || "None")}</strong>
                  </div>
                  <div class="portal-class-extended-item">
                    <span>Subjects</span>
                    <strong>${escapeHtml((record.subjects || []).join(", ") || "None")}</strong>
                  </div>
                  <div class="portal-class-extended-item portal-class-extended-item-span">
                    <span>Teacher assignments</span>
                    <ul>
                      ${(record.teacherAssignments || [])
                        .map(
                          (assignment) =>
                            `<li>${escapeHtml(assignment.subject)}: ${escapeHtml(assignment.teacher)}</li>`,
                        )
                        .join("") || "<li>No assignments yet.</li>"}
                    </ul>
                  </div>
                </div>

                <div class="portal-class-route-links">
                  <a href="./workflows.html#classroom-rhythm">Timetable</a>
                  <a href="./admin-courses.html">Courses</a>
                </div>

                <div class="portal-class-actions">
                  <button
                    class="portal-class-button"
                    type="button"
                    data-class-action="edit"
                    data-class-id="${record.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    Edit
                  </button>
                  <button
                    class="portal-class-button ${record.status === "archived" ? "is-restore" : "is-archive"}"
                    type="button"
                    data-class-action="${record.status === "archived" ? "activate" : "archive"}"
                    data-class-id="${record.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    ${record.status === "archived" ? "Reactivate" : "Archive"}
                  </button>
                </div>
              </div>
            </details>
          `,
        )
        .join("");
    }

    if (!isAdmin) {
      setStatus(
        status,
        "info",
        "Only admin accounts with class permission can create, edit, archive, or reactivate classes.",
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
      studentAssignmentCount,
    } = manager.summarize();

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active courses</span>
        <strong>${activeCount}</strong>
        <p>Available for teacher and student assignment flows.</p>
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
        <span>Student assignments</span>
        <strong>${studentAssignmentCount}</strong>
        <p>Student entries linked directly to each course.</p>
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
      listTarget.innerHTML = courses
        .map(
          (record) => `
            <details class="portal-class-card portal-class-list-item ${record.status === "archived" ? "is-archived" : ""}">
              <summary class="portal-class-list-summary">
                <div class="portal-class-list-main">
                  <strong>${escapeHtml(record.code || "NO-CODE")} · ${escapeHtml(record.name)}</strong>
                  <span>${escapeHtml(record.level || "No level selected")} • ${escapeHtml(
                    record.description || "No description yet",
                  )}</span>
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
                    <span>Level</span>
                    <strong>${escapeHtml(record.level || "Not set")}</strong>
                  </div>
                  <div class="portal-class-meta-item">
                    <span>Updated</span>
                    <strong>${escapeHtml(formatTimestamp(record.updatedAt))}</strong>
                  </div>
                </div>

                <div class="portal-class-extended">
                  <div class="portal-class-extended-item">
                    <span>Description</span>
                    <strong>${escapeHtml(record.description || "No description provided yet.")}</strong>
                  </div>
                  <div class="portal-class-extended-item">
                    <span>Teacher assignments</span>
                    <strong>${(record.teacherAssignments || []).length}</strong>
                    <ul>
                      ${(record.teacherAssignments || [])
                        .map((entry) => `<li>${escapeHtml(entry)}</li>`)
                        .join("") || "<li>No teacher assignments yet.</li>"}
                    </ul>
                  </div>
                  <div class="portal-class-extended-item">
                    <span>Student assignments</span>
                    <strong>${(record.studentAssignments || []).length}</strong>
                    <ul>
                      ${(record.studentAssignments || [])
                        .map((entry) => `<li>${escapeHtml(entry)}</li>`)
                        .join("") || "<li>No student assignments yet.</li>"}
                    </ul>
                  </div>
                </div>

                <div class="portal-class-actions">
                  <button
                    class="portal-class-button"
                    type="button"
                    data-course-action="edit"
                    data-course-id="${record.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    Edit
                  </button>
                  <button
                    class="portal-class-button ${record.status === "archived" ? "is-restore" : "is-archive"}"
                    type="button"
                    data-course-action="${record.status === "archived" ? "activate" : "archive"}"
                    data-course-id="${record.id}"
                    ${isAdmin ? "" : "disabled"}
                  >
                    ${record.status === "archived" ? "Reactivate" : "Archive"}
                  </button>
                </div>
              </div>
            </details>
          `,
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
                      const adminActions = !isAdmin
                        ? ""
                        : isArchived || isTransferred
                          ? `
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
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function getActiveClassLevelTokenSet() {
    const classManager = window.SchoolSphereClasses;

    if (!classManager || typeof classManager.getClasses !== "function") {
      return new Set();
    }

    return classManager.getClasses().reduce((set, record) => {
      if (record.status === "archived") {
        return set;
      }

      const tokens = [
        normalizeLevelToken(record.level),
        normalizeLevelToken(record.name),
        normalizeLevelToken(`${record.level || ""} ${record.name || ""}`),
      ].filter(Boolean);
      tokens.forEach((token) => set.add(token));
      return set;
    }, new Set());
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
        "JSS 1",
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
    const classFiltersTarget = document.getElementById("portal-student-class-filters");
    const searchInput = document.getElementById("portal-student-search");
    const importStatus = document.getElementById("portal-student-import-status");
    const importFileInput = document.getElementById("portal-student-import-file");
    const importPreviewButton = document.querySelector("[data-student-import-preview]");
    const importConfirmButton = document.querySelector("[data-student-import-confirm]");
    const importPreviewTarget = document.getElementById("portal-student-import-preview");
    const classLevelSet = getActiveClassLevelTokenSet();
    let importPreviewRows = [];
    let selectedClass = "all";
    let searchQuery = "";
    const expandedClassTokens = new Set();

    const setOverlayState = (overlay, isVisible) => {
      if (!overlay) {
        return;
      }
      overlay.hidden = !isVisible;
      const hasOpenOverlay = [createOverlay, importOverlay, viewOverlay].some(
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
      formToggleButton.addEventListener("click", toggleStudentFormVisibility);
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
    });

    if (!manager) {
      setStudentFormVisibility(false);
      return;
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
      } else if (!isKnownClassLevel(payload.level, classLevelSet)) {
        setPortalStudentError(form, "level", "Invalid class. Use a class already created in Class Management.");
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
          if (expandedClassTokens.has(classToken)) {
            expandedClassTokens.delete(classToken);
          } else {
            expandedClassTokens.add(classToken);
          }
          refreshStudentSection();
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
        if (viewContent) {
          viewContent.innerHTML = `
            <div class="portal-student-view-grid">
              <div><span>Full name</span><strong>${escapeHtml(record.fullName || "—")}</strong></div>
              <div><span>Admission No</span><strong>${escapeHtml(record.admissionNo || "—")}</strong></div>
              <div><span>Level / Class</span><strong>${escapeHtml(record.level || "—")}</strong></div>
              <div><span>Gender</span><strong>${escapeHtml(record.gender || "—")}</strong></div>
              <div><span>Date of birth</span><strong>${escapeHtml(record.dateOfBirth || "—")}</strong></div>
              <div><span>Status</span><strong>${escapeHtml(statusLabel)}</strong></div>
              <div><span>Session close</span><strong>${escapeHtml(
                record.promotionDecision === "repeat"
                  ? "Repeat class"
                  : record.promotionDecision === "resit"
                    ? "Resit required"
                    : "Auto promote",
              )}</strong></div>
            </div>
            <div class="portal-student-view-guardians">
              <h4>Guardian contacts</h4>
              ${
                (record.guardians || []).length
                  ? (record.guardians || [])
                      .map(
                        (guardian) => `
                          <article class="portal-student-guardian-chip">
                            <strong>${escapeHtml(guardian.name || "—")}</strong>
                            <span>${escapeHtml(guardian.relationship || "Guardian")}</span>
                            <small>${escapeHtml(guardian.phone || "No phone")} • ${escapeHtml(
                              guardian.email || "No email",
                            )}</small>
                          </article>
                        `,
                      )
                      .join("")
                  : `<p>No guardian contacts saved for this student.</p>`
              }
            </div>
          `;
        }
        setOverlayState(viewOverlay, true);
        return;
      }

      if (!isAdmin) {
        return;
      }

      clearPortalStudentErrors(form);

      if (action === "edit") {
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

        if (!isKnownClassLevel(level, classLevelSet)) {
          setStatus(quickAddStatus, "error", "Invalid class. Create/select a valid class first.");
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
                window.location.assign(getRoleHomeRoute(fallbackRole));
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
        window.location.assign(getRoleHomeRoute(signedInRole));
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
      window.location.assign(getRoleHomeRoute(userRole));
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

    if (!form || !status || !workspaceInput) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const rawWorkspace = String(params.get("workspace") || "").trim();
    const prefilledWorkspace = rawWorkspace ? normalizeWorkspaceId(rawWorkspace) : "";

    if (prefilledWorkspace && prefilledWorkspace !== "public") {
      workspaceInput.value = prefilledWorkspace;
      if (pageCopy) {
        pageCopy.textContent = `Applying to workspace: ${prefilledWorkspace}`;
      }
    }

    const stepSections = Array.from(form.querySelectorAll("[data-admissions-step]"));
    let activeStepIndex = 0;

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
      const workspaceId = normalizeWorkspaceId(workspaceInput.value || "");

      if (!workspaceId || workspaceId === "public") {
        setStatus(status, "error", "Enter the school workspace ID provided by the school.");
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

    form.addEventListener("submit", (event) => {
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

      const workspaceId = normalizeWorkspaceId(workspaceInput.value || "");
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

      const admissions = upsertAdmission(payload, workspaceId);
      const latest = admissions[0] || payload;
      pushNotification(
        {
          title: `New application: ${payload.fullName}`,
          message: `${payload.level} application submitted by guardian ${payload.guardianFullName}.`,
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
      setStep(0);
      clearFormDraftFor(form);
      setStatus(
        status,
        "success",
        `Application submitted successfully for <strong>${escapeHtml(payload.fullName)}</strong>. The school admin will review and update the status.`,
      );
    });

    toggleHealthConditionDetails();
    setStep(0);
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
        note: "Awaiting live data",
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
        note: "Awaiting live data",
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
        note: "Awaiting live data",
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
        note: "Awaiting live data",
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
            <h2 id="admin-notification-title">Notifications</h2>
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
      const entries = scopedNotifications.length ? scopedNotifications : fallbackEntries;
      renderNotificationList(listTarget, entries);

      const dot = document.getElementById("admin-notification-dot");
      if (dot) {
        dot.hidden = scopedNotifications.length === 0;
      }
    };

    if (!alreadyBound) {
      button.addEventListener("click", () => {
        refresh();
        setOverlayState(true);
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
    const key = getParentFeesStorageKey(workspaceId);
    localStorage.setItem(key, JSON.stringify(state && typeof state === "object" ? state : {}));
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

    const history = (cycleState.terms || [])
      .slice()
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
      .map((term) => ({
        id: term.id,
        term: term.name,
        session: (cycleState.sessions || []).find((item) => item.id === term.sessionId)?.name || "Session",
        present: 0,
        absent: 0,
      }));

    return {
      studentId: student?.id || "",
      currentTermLabel,
      currentSession,
      present: 0,
      absent: 0,
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
    const current = allFees[student.id] || {
      totalDue: 0,
      balance: 0,
      dueDate: "Not set by admin yet",
      updatedAt: nowIso(),
    };

    target.innerHTML = `
      <article class="admin-surface-card">
        <div class="admin-surface-head">
          <h2>Fees: ${escapeHtml(student.fullName)}</h2>
          <span>Fees are configured by school admin. Parents can pay and track balances here.</span>
        </div>
        <div class="admin-session-grid">
          <div class="admin-session-card"><span>Total due</span><strong>${escapeHtml(String(current.totalDue || 0))}</strong></div>
          <div class="admin-session-card"><span>Outstanding balance</span><strong>${escapeHtml(String(current.balance || 0))}</strong></div>
          <div class="admin-session-card"><span>Due date</span><strong>${escapeHtml(String(current.dueDate || "Not set"))}</strong></div>
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
        `Payment of <strong>${escapeHtml(String(amount))}</strong> recorded. New balance: <strong>${escapeHtml(
          String(nextBalance),
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
    initAdminSectionQuickNav();
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
      <span><strong>${admissions.length}</strong> applications</span>
      <span>${counts.pending} pending • ${counts.review} in review • ${counts.shortlisted} shortlisted • ${counts.approved} approved • ${counts.rejected} rejected</span>
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

    target.innerHTML = admissions
      .map(
        (entry) => {
          const isApproved = normalizeAdmissionStatus(entry.status) === "approved";
          const isConverted = Boolean(String(entry.convertedAt || "").trim());
          return `
          <article class="portal-class-card">
            <div class="portal-class-meta">
              <div class="portal-class-meta-item"><span>Applicant</span><strong>${escapeHtml(entry.fullName)}</strong></div>
              <div class="portal-class-meta-item"><span>Class Applying For</span><strong>${escapeHtml(entry.classApplyingFor || entry.academicClassApplyingFor || entry.level)}</strong></div>
              <div class="portal-class-meta-item"><span>Gender / DOB</span><strong>${escapeHtml(entry.gender || "—")} • ${escapeHtml(entry.dateOfBirth || "—")}</strong></div>
              <div class="portal-class-meta-item"><span>Status</span><strong>${escapeHtml(statusLabelForAdmission(entry.status))}</strong></div>
              <div class="portal-class-meta-item"><span>Applied</span><strong>${escapeHtml(formatTimestamp(entry.createdAt))}</strong></div>
            </div>
            <div class="portal-class-extended">
              <div class="portal-class-extended-item"><span>Email</span><strong>${escapeHtml(entry.email || "—")}</strong></div>
              <div class="portal-class-extended-item"><span>Guardian</span><strong>${escapeHtml(entry.guardianFullName || entry.guardianName || "—")} (${escapeHtml(entry.guardianRelationship || "—")})</strong></div>
              <div class="portal-class-extended-item"><span>Guardian Contact</span><strong>${escapeHtml(entry.guardianPhone || "—")} • ${escapeHtml(entry.guardianEmail || "—")}</strong></div>
              <div class="portal-class-extended-item"><span>Guardian Address</span><strong>${escapeHtml(entry.guardianAddress || "—")}</strong></div>
              <div class="portal-class-extended-item"><span>Academic Background</span><strong>${escapeHtml(entry.lastClassAttended || "—")} → ${escapeHtml(entry.academicClassApplyingFor || "—")}</strong></div>
              <div class="portal-class-extended-item"><span>Previous School</span><strong>${escapeHtml(entry.previousSchool || entry.previousSchoolName || "—")}</strong></div>
              <div class="portal-class-extended-item"><span>Health</span><strong>${escapeHtml(`${entry.healthCondition || "—"}${entry.healthConditionDetails ? ` • Condition: ${entry.healthConditionDetails}` : ""}${entry.healthAllergies ? ` • Allergies: ${entry.healthAllergies}` : ""}`)}</strong></div>
              <div class="portal-class-extended-item"><span>Uploaded Documents</span><strong>${escapeHtml(
                [
                  entry.passportPhotoName,
                  entry.docBirthCertificateName,
                  entry.docPreviousReportName,
                  entry.docPreviousSchoolResultName,
                  entry.docTransferCertificateName,
                  entry.docPassportPhotographName,
                  entry.docOtherName,
                ]
                  .filter(Boolean)
                  .join(", ") || "None",
              )}</strong></div>
              <div class="portal-class-extended-item"><span>Student Conversion</span><strong>${isConverted ? `Converted on ${escapeHtml(formatTimestamp(entry.convertedAt))}` : "Not converted yet"}</strong></div>
            </div>
            <div class="portal-class-actions">
              <button class="portal-class-button" type="button" data-admission-action="review" data-admission-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Review</button>
              <button class="portal-class-button" type="button" data-admission-action="shortlisted" data-admission-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Shortlist</button>
              <button class="portal-class-button is-archive" type="button" data-admission-action="rejected" data-admission-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Reject</button>
              <button class="portal-class-button is-restore" type="button" data-admission-action="approved" data-admission-id="${entry.id}" ${isAdmin ? "" : "disabled"}>Accept</button>
              <button class="portal-class-button" type="button" data-admission-action="convert" data-admission-id="${entry.id}" ${isAdmin && isApproved && !isConverted ? "" : "disabled"}>${isConverted ? "Converted" : "Convert to Student"}</button>
            </div>
          </article>
        `;
        },
      )
      .join("");
  }

  function initAdmissionsControls({ isAdmin, form, status, summaryTarget, listTarget, applyLinkTarget }) {
    if (!form || !status || !summaryTarget || !listTarget) {
      return;
    }

    const workspaceId = normalizeWorkspaceId(getCurrentWorkspaceId());
    const studentManager = getStudentManager();

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
    };

    if (applyLinkTarget) {
      const linkUrl = new URL("./admissions-apply.html", window.location.href);
      linkUrl.searchParams.set("workspace", workspaceId);
      applyLinkTarget.href = linkUrl.toString();
      applyLinkTarget.textContent = "Open/Share Application Form";

      const linkValueInput = document.getElementById("portal-admission-link-value");
      const copyLinkButton = document.getElementById("portal-admission-copy-link");
      const qrImage = document.getElementById("portal-admission-qr-image");
      const normalizedLink = linkUrl.toString();

      if (linkValueInput) {
        linkValueInput.value = normalizedLink;
      }

      if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
          normalizedLink,
        )}`;
      }

      if (copyLinkButton) {
        copyLinkButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(normalizedLink);
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
      refresh();
      setStatus(status, "success", `Application for <strong>${escapeHtml(payload.fullName)}</strong> added.`);
    });

    listTarget.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-admission-action]");

      if (!button || !isAdmin) {
        return;
      }

      const admissionId = String(button.dataset.admissionId || "");
      const action = String(button.dataset.admissionAction || "").trim().toLowerCase();

      if (action === "convert") {
        if (!studentManager || typeof studentManager.upsertStudent !== "function") {
          setStatus(status, "error", "Student manager is not available right now.");
          return;
        }

        const admission = getAdmissions(workspaceId).find((entry) => entry.id === admissionId);
        if (!admission) {
          setStatus(status, "error", "Application not found.");
          return;
        }

        if (normalizeAdmissionStatus(admission.status) !== "approved") {
          setStatus(status, "error", "Only approved applications can be converted.");
          return;
        }

        if (admission.convertedAt) {
          setStatus(status, "info", "This application has already been converted to a student.");
          return;
        }

        const conversion = buildStudentPayloadFromAdmission(admission);
        if (conversion.error) {
          setStatus(status, "error", conversion.error);
          return;
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
        setStatus(
          status,
          "success",
          `Converted <strong>${escapeHtml(admission.fullName)}</strong> into student <strong>${escapeHtml(
            studentPayload.admissionNo,
          )}</strong> without retyping.${createdParentCopy}${googleParentCopy}${failedParentCopy}`,
        );
        return;
      }

      const nextStatus = normalizeAdmissionStatus(action || "review");
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

      refresh();
      setStatus(status, "success", `Application moved to <strong>${escapeHtml(statusLabelForAdmission(nextStatus))}</strong>.`);
    });

    window.addEventListener(ADMISSIONS_EVENT_NAME, (event) => {
      const eventWorkspaceId = normalizeWorkspaceId(event?.detail?.workspaceId || workspaceId);
      if (eventWorkspaceId === workspaceId) {
        refresh();
      }
    });

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

    initAdmissionsControls({
      isAdmin: canManageAdmissions,
      form,
      status,
      summaryTarget,
      listTarget,
      applyLinkTarget,
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

    initAcademicCalendarControls({
      isAdmin: canManageSchedule,
      manager: calendarManager,
      summaryTarget: calendarSummary,
      form: calendarForm,
      status: calendarStatus,
      listTarget: calendarList,
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

    initFeatureToggleControls({
      isAdmin: canManageModules,
      manager: featureModuleManager,
      summaryTarget: featureToggleSummary,
      gridTarget: featureToggleGrid,
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
    const resetRolePermissionsButton = document.querySelector("[data-reset-role-permissions]");
    const academicCycleSummary = document.getElementById("portal-academic-cycle-summary");
    const sessionForm = document.getElementById("portal-session-form");
    const sessionStatus = document.getElementById("portal-session-status");
    const sessionList = document.getElementById("portal-session-list");
    const termForm = document.getElementById("portal-term-form");
    const termStatus = document.getElementById("portal-term-status");
    const termList = document.getElementById("portal-term-list");

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
      hint.textContent = "You are using a default password. Update it now from this page.";
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

      if (currentPasswordHash !== user.passwordHash) {
        setFieldError(form, "currentPassword", "Current password is incorrect.");
        setStatus(status, "error", "Current password is incorrect.");
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
    const metrics = document.getElementById("portal-metrics");
    const events = document.getElementById("admin-events");
    const activity = document.getElementById("admin-activity");
    const links = document.getElementById("portal-links");
    const details = document.getElementById("portal-details");
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
            hasNursery: false,
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

    if (academicCalendarManager?.eventName) {
      window.addEventListener(academicCalendarManager.eventName, () => {
        renderAdminEvents(events);
      });
    }

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
    initPortalNotifications(notificationButton, session);
  }
})();
