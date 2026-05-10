(function () {
  const STORAGE_KEYS = {
    users: "schoolsphere.users.v1",
    mail: "schoolsphere.mail.v1",
    persistentSession: "schoolsphere.session.persistent.v1",
    transientSession: "schoolsphere.session.transient.v1",
  };
  const SUPABASE_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const SUPABASE_STORAGE_KEY = "schoolsphere.supabase.auth.v1";
  const AUTH_PERSIST_LOCAL_KEY = "schoolsphere.auth.persistence.local.v1";
  const AUTH_PERSIST_SESSION_KEY = "schoolsphere.auth.persistence.session.v1";
  const AUTH_PENDING_ROLE_KEY = "schoolsphere.auth.pending.role.v1";
  let supabaseClientPromise = null;

  const DASHBOARD_SECTION_LINKS = [
    {
      label: "Students",
      href: "./admin-students.html",
      copy: "Open the student records page for admissions, guardian links, and roster checks.",
    },
    {
      label: "Classes",
      href: "./admin-classes.html",
      copy: "Create classes, adjust capacity, and keep timetable and course links aligned.",
    },
    {
      label: "Teachers",
      href: "./admin-teachers.html",
      copy: "Review staff deployment, homeroom assignment, and teaching coverage.",
    },
    {
      label: "Schedule",
      href: "./admin-schedule.html",
      copy: "Manage timetable windows, room usage, and class-day sequencing.",
    },
    {
      label: "Attendance",
      href: "./admin-attendance.html",
      copy: "Track daily attendance snapshots, exceptions, and follow-up actions.",
    },
    {
      label: "Reports",
      href: "./admin-reports.html",
      copy: "Review printable summaries, exports, and school-wide reporting outputs.",
    },
    {
      label: "Feature Modules",
      href: "./admin-feature-modules.html",
      copy: "Turn major platform modules on or off without redeploying the application.",
    },
    {
      label: "Settings",
      href: "./admin-settings.html",
      copy: "Update school identity, logo, address, and academic-year dates.",
    },
  ];

  const DASHBOARD_EVENT_ITEMS = [
    {
      time: "09:00 AM",
      title: "Staff Meeting",
      location: "Main Hall",
      tone: "amber",
      action: "Details",
    },
    {
      time: "10:30 AM",
      title: "Parent-Teacher Conference",
      location: "Room 102",
      tone: "blue",
      action: "Details",
    },
    {
      time: "01:15 PM",
      title: "Science Fair Prep",
      location: "Gymnasium",
      tone: "green",
      action: "Details",
    },
    {
      time: "03:00 PM",
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
      timeAgo: "10m ago",
      tone: "blue",
    },
    {
      person: "Mrs. Smith",
      accent: "Tommy Hill",
      message: "marked absent:",
      timeAgo: "1h ago",
      tone: "violet",
    },
    {
      person: "Admin",
      accent: "Lunch Menu",
      message: "published new",
      timeAgo: "2h ago",
      tone: "green",
    },
    {
      person: "Coach T.",
      accent: "Main Field",
      message: "reserved",
      timeAgo: "3h ago",
      tone: "amber",
    },
  ];

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.addEventListener("DOMContentLoaded", async () => {
    await initSupabaseAuthBridge();
    initPasswordToggles();
    initRoleButtons();
    initSignupFlow();
    initLoginFlow();
    initGoogleButtons();
    initConfirmPage();
    initPortalPage();
    initAdminShellPages();
    initAdminClassesPage();
    initAdminFeatureModulesPage();
    initAdminSettingsPage();
  });

  function getPage() {
    return document.body.dataset.page || "";
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

  function getUsers() {
    return parseJSON(localStorage.getItem(STORAGE_KEYS.users), []);
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
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

    targetStorage.setItem(key, JSON.stringify(session));
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
    sessionStorage.setItem(AUTH_PENDING_ROLE_KEY, role || "Administrator");
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
    return buildSupabaseRedirectUrl(config?.emailRedirectPath || config?.redirectPath || "/portal.html");
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

  function buildDisplayName(email) {
    const localPart = normalizeEmail(email).split("@")[0];
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function upsertLocalUserFromSupabase(authUser, roleOverride) {
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
    const role =
      roleOverride ||
      authUser.user_metadata?.role ||
      "Administrator";
    const users = getUsers();
    const existingIndex = users.findIndex((user) => user.id === authUser.id || user.normalizedEmail === normalizedEmail);
    const record = {
      id: authUser.id,
      email,
      normalizedEmail,
      displayName,
      passwordHash: existingIndex >= 0 ? users[existingIndex].passwordHash : null,
      provider,
      role,
      isConfirmed: Boolean(authUser.email_confirmed_at || provider === "google"),
      confirmationToken: null,
      confirmationSentAt: existingIndex >= 0 ? users[existingIndex].confirmationSentAt : null,
      confirmedAt: authUser.email_confirmed_at || nowIso(),
      createdAt: authUser.created_at || (existingIndex >= 0 ? users[existingIndex].createdAt : nowIso()),
      lastLoginAt: nowIso(),
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

    return message;
  }

  async function syncSupabaseSessionToLocal(options = {}) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const {
      preferredRole = null,
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
    const mirroredUser = upsertLocalUserFromSupabase(
      session.user,
      preferredRole || consumePendingRole() || localSession?.role || null,
    );
    const remember = getAuthPersistencePreference() !== "session";

    setSession(
      {
        userId: mirroredUser.id,
        email: mirroredUser.email,
        displayName: mirroredUser.displayName,
        role: mirroredUser.role,
        provider: mirroredUser.provider,
        persistence: remember ? "persistent" : "session",
        signedInAt: session.created_at || nowIso(),
        source: "supabase",
      },
      remember,
    );

    if ((getPage() === "login" || getPage() === "signup") && redirectAuthenticatedAuthPages) {
      window.location.assign("./portal.html");
    }

    return session;
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

          if (getPage() === "portal" || getPage().startsWith("admin-")) {
            window.location.assign("./login.html");
          }

          return;
        }

        await syncSupabaseSessionToLocal();
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
    return {
      activeStudents: 1284,
      staffCount: 86,
      attendanceRate: 92,
      activeIncidents: 3,
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

  function getFeatureModuleManager() {
    return window.SchoolSphereFeatureModules || null;
  }

  function getSchoolSettingsManager() {
    return window.SchoolSphereSiteSettings || null;
  }

  function getClassManager() {
    return window.SchoolSphereClasses || null;
  }

  function getDefaultAdminSchoolSettings() {
    return {
      schoolName: "SchoolSphere",
      logoUrl: "",
      address: "",
      academicYearStart: "",
      academicYearEnd: "",
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

    const roleLabel = session.role || user.role || "Administrator";

    return {
      session,
      user,
      roleLabel,
      isAdmin: /admin/i.test(roleLabel),
    };
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
    };

    refreshClassManagementSection();
    resetPortalClassForm(form, isAdmin);

    if (!manager) {
      return;
    }

    form.addEventListener("submit", (event) => {
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
      };

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

      resetPortalClassForm(form, isAdmin);
      setStatus(
        status,
        "success",
        currentRecord
          ? `Class <strong>${escapeHtml(payload.level)} · ${escapeHtml(
              payload.name,
            )}</strong> updated. Timetable and course links remain connected.`
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
        resetPortalClassForm(form, isAdmin);
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
        resetPortalClassForm(form, isAdmin);
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

    form.addEventListener("input", () => {
      clearPortalSettingsErrors(form);

      if (isAdmin) {
        setStatus(status, "", "");
      }
    });

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
        schoolName: form.elements.schoolName.value.trim(),
        logoUrl: form.elements.logoUrl.value.trim(),
        address: form.elements.address.value.trim(),
        academicYearStart: form.elements.academicYearStart.value,
        academicYearEnd: form.elements.academicYearEnd.value,
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

  function resetPortalClassForm(form, isAdmin) {
    if (!form) {
      return;
    }

    form.reset();

    if (form.elements.classId) {
      form.elements.classId.value = "";
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

  function renderPortalSchoolSettingsSection({
    isAdmin,
    manager,
    previewTarget,
    form,
    status,
  }) {
    if (!previewTarget || !form) {
      return;
    }

    if (!manager) {
      previewTarget.innerHTML = `
        <div class="portal-school-preview-card">
          <div class="portal-school-preview-copy">
            <strong>School settings unavailable</strong>
            <span>The shared school settings manager could not be loaded on this page.</span>
          </div>
        </div>
      `;
      form.hidden = true;
      return;
    }

    form.hidden = false;

    const settings = manager.getSettings();
    const academicYearLabel = manager.formatAcademicYearLabel(settings) || "Academic year dates not set yet";
    const schoolInitial = (settings.schoolName || "S").charAt(0).toUpperCase();

    previewTarget.innerHTML = `
      <div class="portal-school-preview-card">
        <div class="portal-school-preview-brand">
          <span class="portal-school-preview-mark ${settings.logoUrl ? "is-image" : ""}">
            ${
              settings.logoUrl
                ? `<img src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(settings.schoolName)} logo" />`
                : escapeHtml(schoolInitial)
            }
          </span>
          <div class="portal-school-preview-copy">
            <strong>${escapeHtml(settings.schoolName)}</strong>
            <span>${escapeHtml(settings.address || "School address not added yet.")}</span>
            <span>${escapeHtml(academicYearLabel)}</span>
          </div>
        </div>
        <p>
          ${
            isAdmin
              ? "Saved changes repaint the shared site branding, footer details, and academic-year context immediately."
              : "Only administrators can edit these settings. The current institution identity is shown here for reference."
          }
        </p>
      </div>
    `;

    form.elements.schoolName.value = settings.schoolName;
    form.elements.logoUrl.value = settings.logoUrl;
    form.elements.address.value = settings.address;
    form.elements.academicYearStart.value = settings.academicYearStart;
    form.elements.academicYearEnd.value = settings.academicYearEnd;

    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.disabled = !isAdmin;
      }
    });

    if (!isAdmin) {
      setStatus(status, "info", "Switch to the administrator role to edit school settings.");
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
      });
    });
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
      form.hidden = true;
      listTarget.innerHTML = "";
      return;
    }

    form.hidden = false;
    const { classes, activeCount, archivedCount, totalCapacity } = manager.summarize();

    summaryTarget.innerHTML = `
      <article class="portal-class-stat portal-class-stat-blue">
        <span>Active classes</span>
        <strong>${activeCount}</strong>
        <p>${isAdmin ? "Ready for student and teacher assignment." : "Visible for reference only."}</p>
      </article>
      <article class="portal-class-stat portal-class-stat-violet">
        <span>Archived classes</span>
        <strong>${archivedCount}</strong>
        <p>Keep past groups available without exposing them in live allocations.</p>
      </article>
      <article class="portal-class-stat portal-class-stat-green">
        <span>Total active capacity</span>
        <strong>${totalCapacity.toLocaleString()}</strong>
        <p>Each class card links directly to the timetable and course views.</p>
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
            <article class="portal-class-card ${record.status === "archived" ? "is-archived" : ""}">
              <div class="portal-class-card-head">
                <div class="portal-class-title">
                  <strong>${escapeHtml(record.level)} · ${escapeHtml(record.name)}</strong>
                  <span>${
                    record.status === "archived"
                      ? "Archived from active assignment while keeping class history available."
                      : "Open for live student placement, staff assignment, and daily scheduling."
                  }</span>
                </div>
                <span class="portal-class-status ${record.status === "archived" ? "is-archived" : "is-active"}">
                  ${record.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>

              <div class="portal-class-meta">
                <div class="portal-class-meta-item">
                  <span>Capacity</span>
                  <strong>${Number(record.capacity).toLocaleString()} learners</strong>
                </div>
                <div class="portal-class-meta-item">
                  <span>Updated</span>
                  <strong>${escapeHtml(formatTimestamp(record.updatedAt))}</strong>
                </div>
              </div>

              <div class="portal-class-route-links">
                <a href="./workflows.html#classroom-rhythm">Timetable</a>
                <a href="./modules.html">Courses</a>
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
            </article>
          `,
        )
        .join("");
    }

    if (!isAdmin) {
      setStatus(
        status,
        "info",
        "Switch to the administrator role to create, edit, archive, or reactivate classes.",
      );
    }
  }

  function findUserByEmail(email) {
    const normalized = normalizeEmail(email);
    return getUsers().find((user) => user.normalizedEmail === normalized) || null;
  }

  function getSelectedRole() {
    const activeRole = document.querySelector(".auth-role.is-active .auth-role-label");
    return activeRole ? activeRole.textContent.trim() : "Administrator";
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

  function initSignupFlow() {
    if (getPage() !== "signup") {
      return;
    }

    const form = document.getElementById("signup-form");
    const status = document.getElementById("signup-status");

    if (!form || !status) {
      return;
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
      const confirmPassword = form.elements.confirmPassword.value;
      const termsAccepted = form.elements.terms.checked;

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
        rememberPendingRole("Administrator");

        const client = await getSupabaseClient();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildSupabaseEmailRedirectUrl(),
            data: {
              display_name: buildDisplayName(email) || "School User",
              role: "Administrator",
            },
          },
        });

        if (error) {
          setStatus(status, "error", formatSupabaseAuthError(error, "We couldn't create your account."));
          return;
        }

        if (data?.session) {
          await syncSupabaseSessionToLocal({
            preferredRole: "Administrator",
            redirectAuthenticatedAuthPages: false,
          });
          window.location.assign("./portal.html");
          return;
        }

        form.reset();
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
        displayName: buildDisplayName(email) || "School User",
        passwordHash: await hashSecret(password),
        provider: "password",
        role: "Administrator",
        isConfirmed: false,
        confirmationToken,
        confirmationSentAt: nowIso(),
        confirmedAt: null,
        createdAt: nowIso(),
        lastLoginAt: null,
      };

      const users = getUsers();
      users.push(user);
      saveUsers(users);
      storeConfirmationMail(user);

      form.reset();
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
        rememberPendingRole(getSelectedRole());

        const client = await getSupabaseClient();
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const friendlyMessage = formatSupabaseAuthError(
            error,
            "We could not sign you in with those credentials.",
          );

          if (/incorrect|invalid login credentials/i.test(friendlyMessage)) {
            setFieldError(form, "password", "Incorrect email or password.");
          }

          setStatus(status, "error", friendlyMessage);
          return;
        }

        await syncSupabaseSessionToLocal({
          preferredRole: getSelectedRole(),
          redirectAuthenticatedAuthPages: false,
        });
        window.location.assign("./portal.html");
        return;
      }

      const user = findUserByEmail(email);

      if (!user) {
        setFieldError(form, "email", "No account was found with that email.");
        setStatus(status, "error", "We could not find an account with those credentials.");
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

      const updatedUser = updateUser(user.id, (currentUser) => ({
        ...currentUser,
        lastLoginAt: nowIso(),
      }));

      setSession(
        {
          userId: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          role: getSelectedRole(),
          provider: updatedUser.provider,
          persistence: remember ? "persistent" : "session",
          signedInAt: nowIso(),
        },
        remember,
      );

      window.location.assign("./portal.html");
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

    setAuthPersistencePreference(remember);
    rememberPendingRole(page === "login" ? getSelectedRole() : "Administrator");

    const client = await getSupabaseClient();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildSupabaseRedirectUrl(),
      },
    });

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

      const user = {
        id: createId(),
        email,
        normalizedEmail: normalizeEmail(email),
        displayName: buildDisplayName(email) || "School User",
        passwordHash: null,
        provider: "google",
        role: "Administrator",
        isConfirmed: true,
        confirmationToken: null,
        confirmationSentAt: null,
        confirmedAt: nowIso(),
        createdAt: nowIso(),
        lastLoginAt: null,
      };

      users.push(user);

      user.lastLoginAt = nowIso();
      saveUsers(users);
      setSession(
        {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          provider: user.provider,
          persistence: "persistent",
          signedInAt: nowIso(),
        },
        true,
      );

      closeGoogleModal();
      window.location.assign("./portal.html");
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

    existingUser.lastLoginAt = nowIso();
    saveUsers(users);
    setSession(
      {
        userId: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.displayName,
        role: getSelectedRole(),
        provider: existingUser.provider,
        persistence: "persistent",
        signedInAt: nowIso(),
      },
      true,
    );

    closeGoogleModal();
    window.location.assign("./portal.html");
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
    copy.textContent = "You can now sign in with your email and password.";
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
  }

  function renderAdminMetricCards(target, snapshot) {
    if (!target) {
      return;
    }

    const cards = [
      {
        tone: "blue",
        label: "Active Students",
        value: snapshot.activeStudents.toLocaleString(),
        note: "+12 this month",
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
        value: snapshot.staffCount.toLocaleString(),
        note: "All positions filled",
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
        value: `${snapshot.attendanceRate}%`,
        note: "+1.2% from yesterday",
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
        value: snapshot.activeIncidents.toLocaleString(),
        note: "Requires attention",
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

  function renderAdminEvents(target) {
    if (!target) {
      return;
    }

    target.innerHTML = DASHBOARD_EVENT_ITEMS.map(
      (item) => `
        <article class="admin-event-row">
          <div class="admin-event-time">${item.time}</div>
          <div class="admin-event-copy admin-event-copy-${item.tone}">
            <strong>${item.title}</strong>
            <span>${item.location}</span>
          </div>
          <button class="admin-event-button admin-event-button-${item.tone}" type="button">${item.action}</button>
        </article>
      `,
    ).join("");
  }

  function renderAdminActivity(target) {
    if (!target) {
      return;
    }

    target.innerHTML = DASHBOARD_ACTIVITY_ITEMS.map(
      (item) => `
        <article class="admin-activity-row">
          <span class="admin-activity-avatar admin-activity-avatar-${item.tone}">${escapeHtml(
            getInitials(item.person),
          )}</span>
          <div class="admin-activity-copy">
            <p><strong>${item.person}</strong> ${item.message} <span>${item.accent}</span></p>
            <small>${item.timeAgo}</small>
          </div>
        </article>
      `,
    ).join("");
  }

  function initAdminShellPages() {
    if (!document.body.classList.contains("admin-dashboard-page") || getPage() === "portal") {
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
    gate.innerHTML = `<button class="admin-signout-button" type="button" data-signout>Log out</button>`;
    wireSignOutButton(gate);
  }

  function initAdminClassesPage() {
    if (getPage() !== "admin-classes") {
      return;
    }

    const { isAdmin } = getAdminAccessContext();
    const classManager = getClassManager();
    const classSummary = document.getElementById("portal-class-summary");
    const classForm = document.getElementById("portal-class-form");
    const classStatus = document.getElementById("portal-class-status");
    const classList = document.getElementById("portal-class-list");

    initClassManagementControls({
      isAdmin,
      manager: classManager,
      summaryTarget: classSummary,
      form: classForm,
      status: classStatus,
      listTarget: classList,
    });
  }

  function initAdminFeatureModulesPage() {
    if (getPage() !== "admin-feature-modules") {
      return;
    }

    const { isAdmin } = getAdminAccessContext();
    const featureModuleManager = getFeatureModuleManager();
    const featureToggleSummary = document.getElementById("portal-feature-toggle-summary");
    const featureToggleGrid = document.getElementById("portal-feature-toggle-grid");

    initFeatureToggleControls({
      isAdmin,
      manager: featureModuleManager,
      summaryTarget: featureToggleSummary,
      gridTarget: featureToggleGrid,
    });
  }

  function initAdminSettingsPage() {
    if (getPage() !== "admin-settings") {
      return;
    }

    const { isAdmin } = getAdminAccessContext();
    const schoolSettingsManager = getSchoolSettingsManager();
    const schoolSettingsPreview = document.getElementById("portal-school-settings-preview");
    const schoolSettingsForm = document.getElementById("portal-school-settings-form");
    const schoolSettingsStatus = document.getElementById("portal-school-settings-status");

    initSchoolSettingsControls({
      isAdmin,
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
    const metrics = document.getElementById("portal-metrics");
    const events = document.getElementById("admin-events");
    const activity = document.getElementById("admin-activity");
    const links = document.getElementById("portal-links");
    const details = document.getElementById("portal-details");
    const gate = document.getElementById("portal-gate");
    const schoolSettingsManager = getSchoolSettingsManager();

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
      !activity ||
      !links ||
      !details ||
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
            address: "",
            academicYearStart: "",
            academicYearEnd: "",
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
      activity.innerHTML = `
        <article class="admin-activity-row admin-activity-row-empty">
          <div class="admin-activity-copy">
            <p><strong>No activity visible yet.</strong></p>
            <small>Recent actions appear here after sign-in.</small>
          </div>
        </article>
      `;
      links.innerHTML = "";
      details.innerHTML = "";
      gate.innerHTML = `<a class="admin-signout-button" href="./login.html">${buttonLabel}</a>`;
    };

    if (!session) {
      renderLoggedOutState(
        "Sign in required",
        "Use the login or signup flow to load the live school dashboard.",
        "Go to Login",
      );
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
      return;
    }

    const snapshot = getDashboardSnapshot();
    const roleLabel = session.role || user.role || "Administrator";
    const isAdmin = /admin/i.test(roleLabel);

    renderDashboardChrome(user, roleLabel, snapshot);
    renderAdminMetricCards(metrics, snapshot);
    renderAdminEvents(events);
    renderAdminActivity(activity);

    links.innerHTML = DASHBOARD_SECTION_LINKS.map(
      (item) => `
        <a class="admin-link-card" href="${item.href}">
          <strong>${item.label}</strong>
          <p>${item.copy}</p>
          <span>Open section</span>
        </a>
      `,
    ).join("");

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
        <strong>${escapeHtml(session.role || user.role || "Administrator")}</strong>
      </div>
      <div class="admin-session-card">
        <span>Session type</span>
        <strong>${session.persistence === "persistent" ? "Stay logged in" : "Browser session only"}</strong>
      </div>
    `;

    const activeSignOutButton = document.querySelector("[data-signout]");

    if (activeSignOutButton) {
      activeSignOutButton.addEventListener("click", async () => {
        await signOutCurrentUser();
        window.location.assign("./login.html");
      });
    }
  }
})();
