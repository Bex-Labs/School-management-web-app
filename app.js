const homeNavLinks = [
  { label: "Products", href: "./products.html" },
  { label: "Explore", href: "./workflows.html" },
  { label: "Contact", href: "#site-footer" },
];

const whyCards = [
  {
    title: "One student record from admission to report card",
    copy:
      "Admissions, payments, attendance, and results all point back to the same learner history instead of sitting in separate silos.",
  },
  {
    title: "Less front desk traffic",
    copy:
      "Parents can see invoices, notices, attendance, and updates without turning every small request into a call or visit.",
  },
  {
    title: "Result week gets calmer",
    copy:
      "Teachers know what is pending, administrators know where the delays are, and the school stops managing grade entry through scattered sheets.",
  },
];

const standoutBullets = [
  "Clear admissions and student record trail",
  "Attendance and punctuality visible by class or cohort",
  "Invoices, receipts, waivers, and balances tied to each student",
  "Parent notices and internal communication from one system",
];

const offerings = [
  {
    id: "admissions-desk",
    title: "Admissions desk",
    tag: "Registrar workflow",
    description:
      "Handle inquiries, applications, document checks, admission numbers, class placement, and transfers from one lane instead of splitting the work across notebooks and chat threads.",
    bullets: [
      "Applicant intake and enrollment tracking",
      "Guardian and parent details attached to the student file",
      "Class, section, faculty, or department placement",
      "Transfer, withdrawal, and promotion history",
    ],
    metrics: [
      { label: "Focus", value: "Records and placement" },
      { label: "Output", value: "Clean student file" },
      { label: "Used by", value: "Registrar" },
    ],
  },
  {
    id: "classroom-rhythm",
    title: "Classroom rhythm",
    tag: "Teacher workflow",
    description:
      "Teachers need the day to open quickly: attendance, class notes, homework, marks, and report comments should sit within a short path.",
    bullets: [
      "Attendance and lateness entry",
      "Lesson planning and subject coverage",
      "Homework, tests, and classroom follow-up",
      "Marks entry and comment-ready reports",
    ],
    metrics: [
      { label: "Morning task", value: "Roll call" },
      { label: "Weekly task", value: "Coverage" },
      { label: "Term task", value: "Results" },
    ],
  },
  {
    id: "bursary-and-billing",
    title: "Bursary and billing",
    tag: "Finance workflow",
    description:
      "Schools need more than a payment button. They need fee plans, invoices, receipts, balances, waivers, defaulter lists, and exam clearance decisions tied to student records.",
    bullets: [
      "Term, session, and class-based invoice generation",
      "Receipt trail for full and partial payments",
      "Discounts, fines, waivers, and balance tracking",
      "Defaulter reports and clearance lists",
    ],
    metrics: [
      { label: "Focus", value: "Invoice to receipt" },
      { label: "Output", value: "Clear balance view" },
      { label: "Used by", value: "Bursary" },
    ],
  },
  {
    id: "family-communication",
    title: "Family communication",
    tag: "Parent workflow",
    description:
      "Parents mostly want clarity. If the system can answer fees, attendance, notices, and school messages well, it reduces office pressure immediately.",
    bullets: [
      "Fee reminders and receipt delivery",
      "Attendance alerts and follow-up visibility",
      "Announcements, circulars, and event notes",
      "Teacher-parent communication channel",
    ],
    metrics: [
      { label: "Focus", value: "Reduce office calls" },
      { label: "Output", value: "Parent clarity" },
      { label: "Used by", value: "Parents and admin" },
    ],
  },
  {
    id: "university-registration",
    title: "University registration",
    tag: "Faculty workflow",
    description:
      "For smaller universities, the software should shift from class-section logic to faculties, departments, programs, course registration, and semester clearance.",
    bullets: [
      "Faculty and department structure",
      "Course registration and lecturer allocation",
      "Semester billing and academic holds",
      "Cohort and departmental reporting",
    ],
    metrics: [
      { label: "Focus", value: "Programs and loads" },
      { label: "Output", value: "Registration trail" },
      { label: "Used by", value: "Faculty admin" },
    ],
  },
];

const features = [
  {
    id: "student-management",
    title: "Student management",
    tag: "Core records",
    copy:
      "Manage student biodata, class placement, guardian relationships, promotion history, and record lookups from one student ledger.",
  },
  {
    id: "employee-management",
    title: "Employee management",
    tag: "HR",
    copy:
      "Keep teaching and non-teaching staff records organized with roles, departments, and employment status in one place.",
  },
  {
    id: "parent-portal",
    title: "Parent portal",
    tag: "Communication",
    copy:
      "Give parents access to invoices, attendance updates, announcements, results, and school-home communication tools.",
  },
  {
    id: "admissions-management",
    title: "Admissions management",
    tag: "Registrar",
    copy:
      "Capture inquiries, process applications, review documents, and move approved applicants into active student records.",
  },
  {
    id: "attendance-management",
    title: "Attendance management",
    tag: "Daily operations",
    copy:
      "Track daily attendance, lateness, and absentee patterns with quick entry and summaries that admins can review at a glance.",
  },
  {
    id: "lms",
    title: "Learning management system",
    tag: "LMS",
    copy:
      "Support lesson notes, assignments, learning resources, and blended classroom activity from the same school platform.",
  },
  {
    id: "fees-bursary",
    title: "Fees and bursary",
    tag: "Finance",
    copy:
      "Manage tuition setup, invoices, receipts, discounts, balances, and clearance decisions without juggling manual ledgers.",
  },
  {
    id: "exams-results",
    title: "Exams and results",
    tag: "Assessment",
    copy:
      "Handle continuous assessment, exam marks, grading, comments, and result release from a cleaner reporting flow.",
  },
  {
    id: "timetable-scheduling",
    title: "Timetable and scheduling",
    tag: "Scheduling",
    copy:
      "Build class, teacher, and room schedules with fewer clashes and a clearer view of the school week.",
  },
  {
    id: "finance-reporting",
    title: "Finance and reporting",
    tag: "Analytics",
    copy:
      "Review payment summaries, expense direction, school performance reports, and printable records for daily decisions.",
  },
];

const FEATURE_TOGGLE_STORAGE_KEY = "schoolsphere.featureModules.v1";
const FEATURE_TOGGLE_EVENT = "schoolsphere:feature-modules-updated";
const DEFAULT_PLATFORM_NAME = "SchoolSphere";
const DEFAULT_SCHOOL_SETTINGS = {
  schoolName: DEFAULT_PLATFORM_NAME,
  logoUrl: "",
  schoolProfile: "",
  address: "",
  campusDetails: "",
  academicYearStart: "",
  academicYearEnd: "",
  phone: "",
  website: "",
  schoolTypes: ["primary", "secondary"],
  hasNursery: false,
  hasPrimary: true,
  hasSecondary: true,
  hasHigherInstitution: false,
};
const SCHOOL_SETTINGS_STORAGE_KEY = "schoolsphere.schoolSettings.v1";
const SCHOOL_SETTINGS_EVENT = "schoolsphere:school-settings-updated";
const DEFAULT_ACADEMIC_CYCLES = {
  sessions: [],
  terms: [],
};
const SCHOOL_ACADEMIC_CYCLES_STORAGE_KEY = "schoolsphere.academicCycles.v1";
const SCHOOL_ACADEMIC_CYCLES_EVENT = "schoolsphere:academic-cycles-updated";
const DEFAULT_ACADEMIC_CALENDAR_EVENTS = [];
const SCHOOL_ACADEMIC_CALENDAR_STORAGE_KEY = "schoolsphere.academicCalendar.v1";
const SCHOOL_ACADEMIC_CALENDAR_EVENT = "schoolsphere:academic-calendar-updated";
const DEFAULT_ADMISSION_CONFIGURATION = {
  sessions: [],
  classes: [],
  stages: [
    { id: "stage-submitted", name: "Submitted", order: 1, status: "active" },
    { id: "stage-review", name: "Review", order: 2, status: "active" },
    { id: "stage-shortlisted", name: "Shortlisted", order: 3, status: "active" },
    { id: "stage-approved", name: "Approved", order: 4, status: "active" },
  ],
};
const SCHOOL_ADMISSION_CONFIG_STORAGE_KEY = "schoolsphere.admissionConfig.v1";
const SCHOOL_ADMISSION_CONFIG_EVENT = "schoolsphere:admission-config-updated";
const DEFAULT_TIMETABLE_ENTRIES = [];
const SCHOOL_TIMETABLE_STORAGE_KEY = "schoolsphere.timetable.v1";
const SCHOOL_TIMETABLE_EVENT = "schoolsphere:timetable-updated";
const DEFAULT_FEE_ITEMS = [];
const SCHOOL_FEE_ITEMS_STORAGE_KEY = "schoolsphere.feeItems.v1";
const SCHOOL_FEE_ITEMS_EVENT = "schoolsphere:fee-items-updated";
const DEFAULT_CLASS_RECORDS = [];
const SCHOOL_CLASSES_STORAGE_KEY = "schoolsphere.classes.v1";
const SCHOOL_CLASSES_EVENT = "schoolsphere:classes-updated";
const DEFAULT_COURSE_RECORDS = [];
const SCHOOL_COURSES_STORAGE_KEY = "schoolsphere.courses.v1";
const SCHOOL_COURSES_EVENT = "schoolsphere:courses-updated";
const DEFAULT_STUDENT_RECORDS = [];
const SCHOOL_STUDENTS_STORAGE_KEY = "schoolsphere.students.v1";
const SCHOOL_STUDENTS_EVENT = "schoolsphere:students-updated";
const DEFAULT_ATTENDANCE_RECORDS = [];
const SCHOOL_ATTENDANCE_STORAGE_KEY = "schoolsphere.attendance.v1";
const SCHOOL_ATTENDANCE_EVENT = "schoolsphere:attendance-updated";
const LEGACY_MOCK_CLASS_IDS = new Set([
  "class-nursery-2-tulip",
  "class-primary-3-coral",
  "class-jss-1-north",
  "class-ss2-science",
]);
const AUDIT_TRAIL_STORAGE_KEY = "schoolsphere.auditTrail.v1";
const AUDIT_TRAIL_EVENT = "schoolsphere:audit-trail-updated";
const MAX_AUDIT_TRAIL_ENTRIES = 300;
const ROLE_PERMISSIONS_STORAGE_KEY = "schoolsphere.rolePermissions.v1";
const ROLE_PERMISSIONS_EVENT = "schoolsphere:role-permissions-updated";
const ROLE_PERMISSION_ROLES = ["Admin", "Teacher", "Parent", "Student"];
const ROLE_PERMISSION_OPTIONS = [
  { key: "dashboard_view", label: "View dashboard" },
  { key: "students_manage", label: "Manage students" },
  { key: "teachers_manage", label: "Manage staff and teachers" },
  { key: "classes_manage", label: "Manage classes" },
  { key: "courses_manage", label: "Manage courses" },
  { key: "attendance_manage", label: "Manage attendance" },
  { key: "results_manage", label: "Manage exams and results" },
  { key: "fees_manage", label: "Manage fees and bursary" },
  { key: "reports_view", label: "View reports" },
  { key: "settings_manage", label: "Manage school settings" },
];

const AUTH_SESSION_STORAGE_KEYS = {
  persistent: "schoolsphere.session.persistent.v1",
  transient: "schoolsphere.session.transient.v1",
};

function normalizeWorkspaceStorageId(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "public";
}

function getWorkspaceSessionSnapshot() {
  return (
    parseStoredJSON(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEYS.transient), null) ||
    parseStoredJSON(localStorage.getItem(AUTH_SESSION_STORAGE_KEYS.persistent), null)
  );
}

function getActiveWorkspaceStorageId() {
  const session = getWorkspaceSessionSnapshot();

  if (!session) {
    return "public";
  }

  if (session.workspaceId) {
    return normalizeWorkspaceStorageId(session.workspaceId);
  }

  const role = String(session.role || "").trim().toLowerCase();

  if (role === "admin" || role === "administrator") {
    return normalizeWorkspaceStorageId(session.userId || session.email || "admin");
  }

  return normalizeWorkspaceStorageId(session.userId || session.email || "public");
}

function resolveWorkspaceStorageKey(baseKey) {
  return `${baseKey}::${getActiveWorkspaceStorageId()}`;
}

function readWorkspaceState(baseKey, fallback, options = {}) {
  const { allowLegacyFallback = false } = options;
  const scopedKey = resolveWorkspaceStorageKey(baseKey);
  const scopedValue = localStorage.getItem(scopedKey);

  if (scopedValue !== null) {
    return parseStoredJSON(scopedValue, fallback);
  }

  if (!allowLegacyFallback) {
    return fallback;
  }

  const legacyValue = localStorage.getItem(baseKey);
  return legacyValue !== null ? parseStoredJSON(legacyValue, fallback) : fallback;
}

function writeWorkspaceState(baseKey, value) {
  localStorage.setItem(resolveWorkspaceStorageKey(baseKey), JSON.stringify(value));
}

function removeWorkspaceState(baseKey) {
  localStorage.removeItem(resolveWorkspaceStorageKey(baseKey));
}

function clearLegacySharedState() {
  [
    SCHOOL_SETTINGS_STORAGE_KEY,
    SCHOOL_ACADEMIC_CYCLES_STORAGE_KEY,
    SCHOOL_ACADEMIC_CALENDAR_STORAGE_KEY,
    SCHOOL_ADMISSION_CONFIG_STORAGE_KEY,
    SCHOOL_TIMETABLE_STORAGE_KEY,
    SCHOOL_FEE_ITEMS_STORAGE_KEY,
    SCHOOL_CLASSES_STORAGE_KEY,
    SCHOOL_COURSES_STORAGE_KEY,
    SCHOOL_STUDENTS_STORAGE_KEY,
    SCHOOL_ATTENDANCE_STORAGE_KEY,
    AUDIT_TRAIL_STORAGE_KEY,
    FEATURE_TOGGLE_STORAGE_KEY,
    ROLE_PERMISSIONS_STORAGE_KEY,
  ].forEach((baseKey) => {
    localStorage.removeItem(baseKey);
  });
}

clearLegacySharedState();

function isWorkspaceScopedStorageEventKey(eventKey, baseKey) {
  return eventKey === resolveWorkspaceStorageKey(baseKey);
}
const DEFAULT_ROLE_PERMISSIONS = {
  Admin: {
    dashboard_view: true,
    students_manage: true,
    teachers_manage: true,
    classes_manage: true,
    courses_manage: true,
    attendance_manage: true,
    results_manage: true,
    fees_manage: true,
    reports_view: true,
    settings_manage: true,
  },
  Teacher: {
    dashboard_view: true,
    students_manage: false,
    teachers_manage: false,
    classes_manage: false,
    courses_manage: false,
    attendance_manage: true,
    results_manage: true,
    fees_manage: false,
    reports_view: true,
    settings_manage: false,
  },
  Parent: {
    dashboard_view: true,
    students_manage: false,
    teachers_manage: false,
    classes_manage: false,
    courses_manage: false,
    attendance_manage: false,
    results_manage: false,
    fees_manage: true,
    reports_view: true,
    settings_manage: false,
  },
  Student: {
    dashboard_view: true,
    students_manage: false,
    teachers_manage: false,
    classes_manage: false,
    courses_manage: false,
    attendance_manage: false,
    results_manage: false,
    fees_manage: false,
    reports_view: true,
    settings_manage: false,
  },
};

const schoolTypes = [
  {
    id: "preschool-mode",
    title: "Preschool",
    tag: "Early years",
    copy:
      "Preschool mode should feel light and safe: guardian access, pickup authorization, care notes, and simple progress tracking matter more than heavy academic layers.",
    bullets: [
      "Pickup and guardian controls",
      "Care, meal, and wellbeing notes",
      "Simple progress snapshots",
    ],
  },
  {
    id: "nursery-mode",
    title: "Nursery",
    tag: "Care plus learning",
    copy:
      "Nursery sits between child-care and school operations. The system should keep daily routines visible without looking like a senior school dashboard.",
    bullets: [
      "Guardian handoff records",
      "Routine and milestone tracking",
      "Meals and service-linked billing",
    ],
  },
  {
    id: "primary-school-mode",
    title: "Primary School",
    tag: "Class based",
    copy:
      "Primary mode needs class and section structure, attendance, homework, term billing, parent communication, and report cards with minimal friction.",
    bullets: [
      "Class-section setup",
      "Homework and assessments",
      "Parent notices and invoices",
    ],
  },
  {
    id: "secondary-school-mode",
    title: "Secondary School",
    tag: "Exam driven",
    copy:
      "Secondary school needs stronger subject allocation, exam schedules, mark entry, punctuality tracking, and deeper reporting before promotion decisions.",
    bullets: [
      "Subject-teacher assignment",
      "Exam and result processing",
      "Punctuality and intervention insight",
    ],
  },
  {
    id: "university-mode",
    title: "University",
    tag: "Faculty based",
    copy:
      "University mode shifts the model from class and section to faculties, departments, course loads, lecturer assignments, and semester clearance.",
    bullets: [
      "Faculty and department structure",
      "Course registration and lecturer load",
      "Semester billing and holds",
    ],
  },
];

const practiceStories = [
  {
    title: "Monday morning attendance",
    label: "Class teachers",
    copy:
      "Before the first period starts, each teacher marks attendance. Admin can already see repeat absences and the classes with the weakest morning turnout.",
  },
  {
    title: "Mid-week bursary review",
    label: "Finance office",
    copy:
      "The bursary checks who has paid, who still owes, which parents made partial payments, and which students should not appear on an exam clearance list yet.",
  },
  {
    title: "Admissions and transfer handling",
    label: "Registrar",
    copy:
      "New students are placed in the right class or department, transfer notes are stored, and school records stay cleaner from the first day.",
  },
  {
    title: "Result week",
    label: "Admin and teachers",
    copy:
      "The school can see which marks are still missing, which comments are unfinished, and when report cards are ready for release.",
  },
];

function parseStoredJSON(raw, fallback) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const SCHOOL_TYPE_OPTIONS = [
  { value: "nursery", label: "Nursery" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "higher", label: "Higher Institution" },
];

function normalizeSchoolTypeList(value) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((item) => item.trim());
  const allowed = new Set(SCHOOL_TYPE_OPTIONS.map((option) => option.value));
  return Array.from(new Set(rawItems.map((item) => String(item || "").trim()).filter((item) => allowed.has(item))));
}

function deriveSchoolTypesFromLegacyFlags(settings = {}) {
  const hasNursery =
    settings.hasNursery === true ||
    settings.hasNursery === "true" ||
    settings.hasNursery === "1";
  const hasPrimary =
    settings.hasPrimary === false || settings.hasPrimary === "false" || settings.hasPrimary === "0"
      ? false
      : true;
  const hasSecondary =
    settings.hasSecondary === false || settings.hasSecondary === "false" || settings.hasSecondary === "0"
      ? false
      : true;
  const hasHigherInstitution =
    settings.hasHigherInstitution === true ||
    settings.hasHigherInstitution === "true" ||
    settings.hasHigherInstitution === "1";

  return [
    hasNursery ? "nursery" : null,
    hasPrimary ? "primary" : null,
    hasSecondary ? "secondary" : null,
    hasHigherInstitution ? "higher" : null,
  ].filter(Boolean);
}

function normalizeSchoolSettings(settings = {}) {
  const schoolTypes = normalizeSchoolTypeList(settings.schoolTypes).length
    ? normalizeSchoolTypeList(settings.schoolTypes)
    : deriveSchoolTypesFromLegacyFlags(settings);
  const normalizedSchoolTypes = schoolTypes.length ? schoolTypes : DEFAULT_SCHOOL_SETTINGS.schoolTypes;

  return {
    schoolName: String(settings.schoolName || "").trim() || DEFAULT_SCHOOL_SETTINGS.schoolName,
    logoUrl: String(settings.logoUrl || "").trim(),
    schoolProfile: String(settings.schoolProfile || "").trim(),
    address: String(settings.address || "").trim(),
    campusDetails: String(settings.campusDetails || "").trim(),
    phone: String(settings.phone || "").trim(),
    website: String(settings.website || "").trim(),
    academicYearStart: String(settings.academicYearStart || "").trim(),
    academicYearEnd: String(settings.academicYearEnd || "").trim(),
    schoolTypes: normalizedSchoolTypes,
    hasNursery: normalizedSchoolTypes.includes("nursery"),
    hasPrimary: normalizedSchoolTypes.includes("primary"),
    hasSecondary: normalizedSchoolTypes.includes("secondary"),
    hasHigherInstitution: normalizedSchoolTypes.includes("higher"),
  };
}

function getSchoolSettings() {
  return normalizeSchoolSettings(readWorkspaceState(SCHOOL_SETTINGS_STORAGE_KEY, {}));
}

function formatSchoolDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatAcademicYearLabel(settings = getSchoolSettings()) {
  const start = formatSchoolDate(settings.academicYearStart);
  const end = formatSchoolDate(settings.academicYearEnd);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || "";
}

function getSchoolInitial(schoolName) {
  return (String(schoolName || "").trim().charAt(0) || DEFAULT_PLATFORM_NAME.charAt(0)).toUpperCase();
}

function hasSchoolSettingsContext(settings = getSchoolSettings()) {
  return Boolean(
    settings.address ||
      settings.logoUrl ||
      settings.schoolProfile ||
      settings.campusDetails ||
      settings.phone ||
      settings.website ||
      JSON.stringify(settings.schoolTypes || []) !== JSON.stringify(DEFAULT_SCHOOL_SETTINGS.schoolTypes) ||
      settings.academicYearStart ||
      settings.academicYearEnd ||
      settings.schoolName !== DEFAULT_PLATFORM_NAME,
  );
}

function buildBrandMarkHtml(settings, markClass) {
  if (settings.logoUrl) {
    return `
      <span class="${markClass} ${markClass}--image">
        <img class="school-brand-image" src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(settings.schoolName)} logo" />
      </span>
    `;
  }

  return `<span class="${markClass}">${escapeHtml(getSchoolInitial(settings.schoolName))}</span>`;
}

function applySchoolSettingsBranding(settings = getSchoolSettings()) {
  const root = document.documentElement;
  const schoolContext = [settings.address, formatAcademicYearLabel(settings)]
    .filter(Boolean)
    .join(" • ");

  if (!root.dataset.baseTitle) {
    root.dataset.baseTitle = document.title;
  }

  document.querySelectorAll("[data-school-context]").forEach((node) => {
    node.textContent = schoolContext;
    node.hidden = !schoolContext;
  });
}

function emitSchoolSettingsUpdate(settings = getSchoolSettings()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_SETTINGS_EVENT, {
      detail: { settings },
    }),
  );
}

function saveSchoolSettings(nextSettings) {
  const normalized = normalizeSchoolSettings(nextSettings);
  writeWorkspaceState(SCHOOL_SETTINGS_STORAGE_KEY, normalized);
  emitSchoolSettingsUpdate(normalized);
  return normalized;
}

function resetSchoolSettings() {
  removeWorkspaceState(SCHOOL_SETTINGS_STORAGE_KEY);
  const normalized = getSchoolSettings();
  emitSchoolSettingsUpdate(normalized);
  return normalized;
}

function createStorageId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeAcademicSession(record = {}) {
  const timestamp = new Date().toISOString();
  const status = record.status === "open" ? "open" : "closed";

  return {
    id: String(record.id || createStorageId("session")),
    name: String(record.name || "").trim(),
    startDate: String(record.startDate || "").trim(),
    endDate: String(record.endDate || "").trim(),
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function normalizeAcademicTerm(record = {}) {
  const timestamp = new Date().toISOString();
  const status = record.status === "open" ? "open" : "closed";

  return {
    id: String(record.id || createStorageId("term")),
    sessionId: String(record.sessionId || "").trim(),
    name: String(record.name || "").trim(),
    startDate: String(record.startDate || "").trim(),
    endDate: String(record.endDate || "").trim(),
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function normalizeAcademicCycles(state = {}) {
  const sessions = Array.isArray(state.sessions)
    ? state.sessions.map((session) => normalizeAcademicSession(session)).filter((session) => session.name)
    : [];
  const sessionIds = new Set(sessions.map((session) => session.id));
  const terms = Array.isArray(state.terms)
    ? state.terms
        .map((term) => normalizeAcademicTerm(term))
        .filter((term) => term.name && term.sessionId && sessionIds.has(term.sessionId))
    : [];

  return { sessions, terms };
}

function getAcademicCycles() {
  const stored = readWorkspaceState(
    SCHOOL_ACADEMIC_CYCLES_STORAGE_KEY,
    DEFAULT_ACADEMIC_CYCLES,
  );
  return normalizeAcademicCycles(stored);
}

function emitAcademicCyclesUpdate(state = getAcademicCycles()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_ACADEMIC_CYCLES_EVENT, {
      detail: { state },
    }),
  );
}

function saveAcademicCycles(state) {
  const normalized = normalizeAcademicCycles(state);
  writeWorkspaceState(SCHOOL_ACADEMIC_CYCLES_STORAGE_KEY, normalized);
  emitAcademicCyclesUpdate(normalized);
  return normalized;
}

function upsertAcademicSession(record) {
  const state = getAcademicCycles();
  const timestamp = new Date().toISOString();
  const nextSession = normalizeAcademicSession({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = state.sessions.findIndex((session) => session.id === nextSession.id);

  if (existingIndex === -1) {
    state.sessions.push({
      ...nextSession,
      createdAt: nextSession.createdAt || timestamp,
    });
  } else {
    state.sessions[existingIndex] = {
      ...state.sessions[existingIndex],
      ...nextSession,
      createdAt: state.sessions[existingIndex].createdAt,
      updatedAt: timestamp,
    };
  }

  if (nextSession.status === "open") {
    state.sessions = state.sessions.map((session) =>
      session.id === nextSession.id
        ? session
        : {
            ...session,
            status: "closed",
            updatedAt: timestamp,
          },
    );
  }

  return saveAcademicCycles(state);
}

function setAcademicSessionStatus(sessionId, status) {
  const state = getAcademicCycles();
  const timestamp = new Date().toISOString();

  state.sessions = state.sessions.map((session) => {
    if (session.id === sessionId) {
      return {
        ...session,
        status: status === "open" ? "open" : "closed",
        updatedAt: timestamp,
      };
    }

    if (status === "open") {
      return {
        ...session,
        status: "closed",
        updatedAt: timestamp,
      };
    }

    return session;
  });

  if (status !== "open") {
    state.terms = state.terms.map((term) =>
      term.sessionId === sessionId && term.status === "open"
        ? {
            ...term,
            status: "closed",
            updatedAt: timestamp,
          }
        : term,
    );
  }

  return saveAcademicCycles(state);
}

function upsertAcademicTerm(record) {
  const state = getAcademicCycles();
  const timestamp = new Date().toISOString();
  const nextTerm = normalizeAcademicTerm({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = state.terms.findIndex((term) => term.id === nextTerm.id);

  if (existingIndex === -1) {
    state.terms.push({
      ...nextTerm,
      createdAt: nextTerm.createdAt || timestamp,
    });
  } else {
    state.terms[existingIndex] = {
      ...state.terms[existingIndex],
      ...nextTerm,
      createdAt: state.terms[existingIndex].createdAt,
      updatedAt: timestamp,
    };
  }

  if (nextTerm.status === "open") {
    state.sessions = state.sessions.map((session) =>
      session.id === nextTerm.sessionId
        ? {
            ...session,
            status: "open",
            updatedAt: timestamp,
          }
        : {
            ...session,
            status: "closed",
            updatedAt: timestamp,
          },
    );
    state.terms = state.terms.map((term) =>
      term.sessionId === nextTerm.sessionId
        ? {
            ...term,
            status: term.id === nextTerm.id ? "open" : "closed",
            updatedAt: timestamp,
          }
        : {
            ...term,
            status: "closed",
            updatedAt: timestamp,
          },
    );
  }

  return saveAcademicCycles(state);
}

function setAcademicTermStatus(termId, status) {
  const state = getAcademicCycles();
  const timestamp = new Date().toISOString();
  const targetTerm = state.terms.find((term) => term.id === termId);

  if (!targetTerm) {
    return saveAcademicCycles(state);
  }

  if (status === "open") {
    state.sessions = state.sessions.map((session) =>
      session.id === targetTerm.sessionId
        ? {
            ...session,
            status: "open",
            updatedAt: timestamp,
          }
        : {
            ...session,
            status: "closed",
            updatedAt: timestamp,
          },
    );
  }

  state.terms = state.terms.map((term) => {
    if (term.id === termId) {
      return {
        ...term,
        status: status === "open" ? "open" : "closed",
        updatedAt: timestamp,
      };
    }

    if (status === "open") {
      return {
        ...term,
        status: "closed",
        updatedAt: timestamp,
      };
    }

    return term;
  });

  return saveAcademicCycles(state);
}

function summarizeAcademicCycles() {
  const state = getAcademicCycles();
  const openSession = state.sessions.find((session) => session.status === "open") || null;
  const openTerm = state.terms.find((term) => term.status === "open") || null;
  return {
    ...state,
    openSession,
    openTerm,
  };
}

function normalizeAcademicCalendarType(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "holiday") {
    return "holiday";
  }

  if (normalized === "exam" || normalized === "exam-period") {
    return "exam";
  }

  return "term";
}

function normalizeAcademicCalendarStatus(value) {
  return String(value || "").trim().toLowerCase() === "archived" ? "archived" : "active";
}

function normalizeAcademicCalendarEvent(record = {}) {
  const timestamp = new Date().toISOString();
  const startDate = String(record.startDate || "").trim();
  const endDate = String(record.endDate || "").trim();
  const normalizedStart = startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : "";
  const normalizedEnd = endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : "";
  const visibility = String(record.visibility || "all-roles").trim() || "all-roles";
  const status = normalizeAcademicCalendarStatus(record.status);

  return {
    id: String(record.id || createStorageId("calendar")),
    title: String(record.title || "").trim(),
    type: normalizeAcademicCalendarType(record.type),
    startDate: normalizedStart,
    endDate: normalizedEnd || normalizedStart,
    notes: String(record.notes || "").trim(),
    visibility,
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
  };
}

function compareAcademicCalendarEvents(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }

  const startComparison = left.startDate.localeCompare(right.startDate);

  if (startComparison !== 0) {
    return startComparison;
  }

  const endComparison = left.endDate.localeCompare(right.endDate);

  if (endComparison !== 0) {
    return endComparison;
  }

  return left.title.localeCompare(right.title, undefined, { numeric: true });
}

function getAcademicCalendarEvents() {
  const stored = readWorkspaceState(
    SCHOOL_ACADEMIC_CALENDAR_STORAGE_KEY,
    DEFAULT_ACADEMIC_CALENDAR_EVENTS,
  );
  const source = Array.isArray(stored) ? stored : DEFAULT_ACADEMIC_CALENDAR_EVENTS;

  return source
    .map((event) => normalizeAcademicCalendarEvent(event))
    .filter((event) => event.title && event.startDate && event.endDate)
    .sort(compareAcademicCalendarEvents);
}

function emitAcademicCalendarUpdate(events = getAcademicCalendarEvents()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_ACADEMIC_CALENDAR_EVENT, {
      detail: { events },
    }),
  );
}

function saveAcademicCalendarEvents(events) {
  const normalized = events
    .map((event) => normalizeAcademicCalendarEvent(event))
    .filter((event) => event.title && event.startDate && event.endDate)
    .sort(compareAcademicCalendarEvents);
  writeWorkspaceState(SCHOOL_ACADEMIC_CALENDAR_STORAGE_KEY, normalized);
  emitAcademicCalendarUpdate(normalized);
  return normalized;
}

function upsertAcademicCalendarEvent(record) {
  const events = getAcademicCalendarEvents();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeAcademicCalendarEvent({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = events.findIndex((item) => item.id === nextRecord.id);

  if (existingIndex === -1) {
    events.push({
      ...nextRecord,
      createdAt: nextRecord.createdAt || timestamp,
    });
  } else {
    events[existingIndex] = {
      ...events[existingIndex],
      ...nextRecord,
      createdAt: events[existingIndex].createdAt,
      archivedAt: nextRecord.status === "archived" ? nextRecord.archivedAt || timestamp : null,
      updatedAt: timestamp,
    };
  }

  return saveAcademicCalendarEvents(events);
}

function setAcademicCalendarEventArchived(eventId, archived) {
  const events = getAcademicCalendarEvents();
  const nextEvents = events.map((event) => {
    if (event.id !== eventId) {
      return event;
    }

    return {
      ...event,
      status: archived ? "archived" : "active",
      archivedAt: archived ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
  });

  return saveAcademicCalendarEvents(nextEvents);
}

function findAcademicCalendarConflicts(candidate, options = {}) {
  const { includeArchived = false } = options;
  const nextEvent = normalizeAcademicCalendarEvent(candidate);
  const events = getAcademicCalendarEvents();

  if (!nextEvent.startDate || !nextEvent.endDate) {
    return [];
  }

  return events.filter((existing) => {
    if (existing.id === nextEvent.id) {
      return false;
    }

    if (!includeArchived && existing.status === "archived") {
      return false;
    }

    const startsBeforeOtherEnds = nextEvent.startDate <= existing.endDate;
    const endsAfterOtherStarts = nextEvent.endDate >= existing.startDate;
    return startsBeforeOtherEnds && endsAfterOtherStarts;
  });
}

function getUpcomingAcademicCalendarEvents(limit = 4, fromDate = new Date()) {
  const cutoff = `${fromDate.toISOString().slice(0, 10)}`;
  const activeEvents = getAcademicCalendarEvents().filter((event) => event.status !== "archived");

  return activeEvents
    .filter((event) => event.endDate >= cutoff)
    .sort((left, right) => {
      const startComparison = left.startDate.localeCompare(right.startDate);
      if (startComparison !== 0) {
        return startComparison;
      }
      return left.endDate.localeCompare(right.endDate);
    })
    .slice(0, Math.max(1, Number(limit) || 4));
}

function summarizeAcademicCalendarEvents() {
  const events = getAcademicCalendarEvents();
  const activeEvents = events.filter((event) => event.status !== "archived");

  return {
    events,
    activeCount: activeEvents.length,
    archivedCount: events.length - activeEvents.length,
    termCount: activeEvents.filter((event) => event.type === "term").length,
    holidayCount: activeEvents.filter((event) => event.type === "holiday").length,
    examCount: activeEvents.filter((event) => event.type === "exam").length,
    upcomingEvents: getUpcomingAcademicCalendarEvents(6),
  };
}

function normalizeAdmissionConfigStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "archived" || normalized === "inactive" ? "archived" : "active";
}

function normalizeAdmissionConfigSession(record = {}) {
  const timestamp = new Date().toISOString();
  const status = String(record.status || "").trim().toLowerCase() === "open" ? "open" : "closed";
  return {
    id: String(record.id || createStorageId("admission-session")),
    name: String(record.name || "").trim(),
    startDate: String(record.startDate || "").trim(),
    endDate: String(record.endDate || "").trim(),
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function normalizeAdmissionConfigClass(record = {}) {
  const timestamp = new Date().toISOString();
  return {
    id: String(record.id || createStorageId("admission-class")),
    name: String(record.name || "").trim(),
    status: normalizeAdmissionConfigStatus(record.status),
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function normalizeAdmissionConfigStage(record = {}) {
  const timestamp = new Date().toISOString();
  const parsedOrder = Number.parseInt(record.order, 10);
  return {
    id: String(record.id || createStorageId("admission-stage")),
    name: String(record.name || "").trim(),
    order: Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : 1,
    status: normalizeAdmissionConfigStatus(record.status),
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function normalizeAdmissionConfiguration(state = {}) {
  const sessions = Array.isArray(state.sessions)
    ? state.sessions
        .map((record) => normalizeAdmissionConfigSession(record))
        .filter((record) => record.name)
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    : [];
  const classes = Array.isArray(state.classes)
    ? state.classes
        .map((record) => normalizeAdmissionConfigClass(record))
        .filter((record) => record.name)
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))
    : [];
  const stagesSource = Array.isArray(state.stages) && state.stages.length
    ? state.stages
    : DEFAULT_ADMISSION_CONFIGURATION.stages;
  const stages = stagesSource
    .map((record) => normalizeAdmissionConfigStage(record))
    .filter((record) => record.name)
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
  return { sessions, classes, stages };
}

function getAdmissionConfiguration() {
  const stored = readWorkspaceState(
    SCHOOL_ADMISSION_CONFIG_STORAGE_KEY,
    DEFAULT_ADMISSION_CONFIGURATION,
  );
  return normalizeAdmissionConfiguration(stored);
}

function emitAdmissionConfigurationUpdate(state = getAdmissionConfiguration()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_ADMISSION_CONFIG_EVENT, {
      detail: { state },
    }),
  );
}

function saveAdmissionConfiguration(state) {
  const normalized = normalizeAdmissionConfiguration(state);
  writeWorkspaceState(SCHOOL_ADMISSION_CONFIG_STORAGE_KEY, normalized);
  emitAdmissionConfigurationUpdate(normalized);
  return normalized;
}

function upsertAdmissionConfigSession(record = {}) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeAdmissionConfigSession({
    ...record,
    updatedAt: timestamp,
  });
  const index = state.sessions.findIndex((entry) => entry.id === nextRecord.id);
  if (index >= 0) {
    state.sessions[index] = {
      ...state.sessions[index],
      ...nextRecord,
      createdAt: state.sessions[index].createdAt,
      updatedAt: timestamp,
    };
  } else {
    state.sessions.unshift(nextRecord);
  }
  if (nextRecord.status === "open") {
    state.sessions = state.sessions.map((entry) =>
      entry.id === nextRecord.id
        ? entry
        : {
            ...entry,
            status: "closed",
            updatedAt: timestamp,
          },
    );
  }
  return saveAdmissionConfiguration(state);
}

function setAdmissionConfigSessionStatus(sessionId, status) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  state.sessions = state.sessions.map((entry) => {
    if (entry.id === sessionId) {
      return {
        ...entry,
        status: status === "open" ? "open" : "closed",
        updatedAt: timestamp,
      };
    }
    if (status === "open") {
      return {
        ...entry,
        status: "closed",
        updatedAt: timestamp,
      };
    }
    return entry;
  });
  return saveAdmissionConfiguration(state);
}

function upsertAdmissionConfigClass(record = {}) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeAdmissionConfigClass({
    ...record,
    updatedAt: timestamp,
  });
  const index = state.classes.findIndex((entry) => entry.id === nextRecord.id);
  if (index >= 0) {
    state.classes[index] = {
      ...state.classes[index],
      ...nextRecord,
      createdAt: state.classes[index].createdAt,
      updatedAt: timestamp,
    };
  } else {
    state.classes.unshift(nextRecord);
  }
  return saveAdmissionConfiguration(state);
}

function setAdmissionConfigClassStatus(classId, status) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  state.classes = state.classes.map((entry) =>
    entry.id === classId
      ? {
          ...entry,
          status: normalizeAdmissionConfigStatus(status),
          updatedAt: timestamp,
        }
      : entry,
  );
  return saveAdmissionConfiguration(state);
}

function upsertAdmissionConfigStage(record = {}) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeAdmissionConfigStage({
    ...record,
    updatedAt: timestamp,
  });
  const index = state.stages.findIndex((entry) => entry.id === nextRecord.id);
  if (index >= 0) {
    state.stages[index] = {
      ...state.stages[index],
      ...nextRecord,
      createdAt: state.stages[index].createdAt,
      updatedAt: timestamp,
    };
  } else {
    state.stages.push(nextRecord);
  }
  state.stages = state.stages
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name))
    .map((entry, idx) => ({
      ...entry,
      order: idx + 1,
    }));
  return saveAdmissionConfiguration(state);
}

function setAdmissionConfigStageStatus(stageId, status) {
  const state = getAdmissionConfiguration();
  const timestamp = new Date().toISOString();
  state.stages = state.stages.map((entry) =>
    entry.id === stageId
      ? {
          ...entry,
          status: normalizeAdmissionConfigStatus(status),
          updatedAt: timestamp,
        }
      : entry,
  );
  return saveAdmissionConfiguration(state);
}

function summarizeAdmissionConfiguration() {
  const state = getAdmissionConfiguration();
  const openSession = state.sessions.find((entry) => entry.status === "open") || null;
  const activeClasses = state.classes.filter((entry) => entry.status === "active");
  const activeStages = state.stages.filter((entry) => entry.status === "active");
  return {
    ...state,
    openSession,
    activeSessionCount: state.sessions.filter((entry) => entry.status === "open").length,
    activeClassCount: activeClasses.length,
    activeStageCount: activeStages.length,
    activeClasses,
    activeStages,
  };
}

const TIMETABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function normalizeTimetableStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "published") {
    return "published";
  }
  if (normalized === "archived") {
    return "archived";
  }
  return "draft";
}

function normalizeTimetableDay(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const matched = TIMETABLE_DAYS.find((day) => day.toLowerCase() === normalized);
  return matched || "Monday";
}

function normalizeSchoolTimetableEntry(record = {}) {
  const timestamp = new Date().toISOString();
  const status = normalizeTimetableStatus(record.status);
  return {
    id: String(record.id || createStorageId("timetable")),
    classLevel: String(record.classLevel || "").trim(),
    sessionId: String(record.sessionId || "").trim(),
    termId: String(record.termId || "").trim(),
    day: normalizeTimetableDay(record.day),
    startTime: String(record.startTime || "").trim(),
    endTime: String(record.endTime || "").trim(),
    subject: String(record.subject || "").trim(),
    teacher: String(record.teacher || "").trim(),
    room: String(record.room || "").trim(),
    status,
    publishedAt: status === "published" ? record.publishedAt || timestamp : null,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
  };
}

function compareSchoolTimetableEntries(left, right) {
  if (left.status !== right.status) {
    if (left.status === "published") return -1;
    if (right.status === "published") return 1;
    if (left.status === "draft") return -1;
    if (right.status === "draft") return 1;
  }
  const classComparison = left.classLevel.localeCompare(right.classLevel, undefined, { numeric: true });
  if (classComparison !== 0) {
    return classComparison;
  }
  const dayComparison = TIMETABLE_DAYS.indexOf(left.day) - TIMETABLE_DAYS.indexOf(right.day);
  if (dayComparison !== 0) {
    return dayComparison;
  }
  return left.startTime.localeCompare(right.startTime);
}

function getSchoolTimetableEntries() {
  const stored = readWorkspaceState(SCHOOL_TIMETABLE_STORAGE_KEY, DEFAULT_TIMETABLE_ENTRIES);
  const source = Array.isArray(stored) ? stored : DEFAULT_TIMETABLE_ENTRIES;
  return source
    .map((record) => normalizeSchoolTimetableEntry(record))
    .filter((record) => record.classLevel && record.subject && record.startTime && record.endTime)
    .sort(compareSchoolTimetableEntries);
}

function emitSchoolTimetableUpdate(entries = getSchoolTimetableEntries()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_TIMETABLE_EVENT, {
      detail: { entries },
    }),
  );
}

function saveSchoolTimetableEntries(entries) {
  const normalized = entries
    .map((record) => normalizeSchoolTimetableEntry(record))
    .filter((record) => record.classLevel && record.subject && record.startTime && record.endTime)
    .sort(compareSchoolTimetableEntries);
  writeWorkspaceState(SCHOOL_TIMETABLE_STORAGE_KEY, normalized);
  emitSchoolTimetableUpdate(normalized);
  return normalized;
}

function upsertSchoolTimetableEntry(record = {}) {
  const entries = getSchoolTimetableEntries();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeSchoolTimetableEntry({
    ...record,
    updatedAt: timestamp,
  });
  const index = entries.findIndex((entry) => entry.id === nextRecord.id);
  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      ...nextRecord,
      createdAt: entries[index].createdAt,
      updatedAt: timestamp,
    };
  } else {
    entries.push(nextRecord);
  }
  return saveSchoolTimetableEntries(entries);
}

function setSchoolTimetableEntryStatus(entryId, status) {
  const entries = getSchoolTimetableEntries();
  const timestamp = new Date().toISOString();
  const normalizedStatus = normalizeTimetableStatus(status);
  const nextEntries = entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }
    return {
      ...entry,
      status: normalizedStatus,
      publishedAt: normalizedStatus === "published" ? timestamp : null,
      archivedAt: normalizedStatus === "archived" ? timestamp : null,
      updatedAt: timestamp,
    };
  });
  return saveSchoolTimetableEntries(nextEntries);
}

function buildTimetableGroupKey(record = {}) {
  return [
    String(record.sessionId || "").trim(),
    String(record.termId || "").trim(),
    String(record.classLevel || "").trim().toLowerCase(),
  ].join("|");
}

function setTimetableGroupPublished(criteria = {}, published = true) {
  const entries = getSchoolTimetableEntries();
  const timestamp = new Date().toISOString();
  const classLevel = String(criteria.classLevel || "").trim().toLowerCase();
  const sessionId = String(criteria.sessionId || "").trim();
  const termId = String(criteria.termId || "").trim();

  const nextEntries = entries.map((entry) => {
    const matches =
      String(entry.classLevel || "").trim().toLowerCase() === classLevel &&
      String(entry.sessionId || "").trim() === sessionId &&
      String(entry.termId || "").trim() === termId;

    if (!matches || entry.status === "archived") {
      return entry;
    }

    return {
      ...entry,
      status: published ? "published" : "draft",
      publishedAt: published ? timestamp : null,
      updatedAt: timestamp,
    };
  });

  return saveSchoolTimetableEntries(nextEntries);
}

function summarizeSchoolTimetableEntries() {
  const entries = getSchoolTimetableEntries();
  const publishedCount = entries.filter((entry) => entry.status === "published").length;
  const draftCount = entries.filter((entry) => entry.status === "draft").length;
  const archivedCount = entries.filter((entry) => entry.status === "archived").length;
  const classCount = new Set(entries.map((entry) => entry.classLevel.toLowerCase())).size;
  const groups = new Map();
  entries
    .filter((entry) => entry.status !== "archived")
    .forEach((entry) => {
      const key = buildTimetableGroupKey(entry);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          classLevel: entry.classLevel,
          sessionId: entry.sessionId,
          termId: entry.termId,
          rows: [],
        });
      }
      groups.get(key).rows.push(entry);
    });
  const grouped = Array.from(groups.values()).map((group) => ({
    ...group,
    rows: group.rows.sort(compareSchoolTimetableEntries),
    isPublished:
      group.rows.length > 0 && group.rows.every((row) => row.status === "published"),
  }));

  return {
    entries,
    grouped,
    publishedCount,
    draftCount,
    archivedCount,
    classCount,
  };
}

function normalizeFeeItemStatus(value) {
  return String(value || "").trim().toLowerCase() === "archived" ? "archived" : "active";
}

function normalizeSchoolFeeItem(record = {}) {
  const timestamp = new Date().toISOString();
  const amount = Number.parseFloat(record.amount);
  return {
    id: String(record.id || createStorageId("fee-item")),
    name: String(record.name || "").trim(),
    description: String(record.description || "").trim(),
    amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
    classLevel: String(record.classLevel || "").trim(),
    sessionId: String(record.sessionId || "").trim(),
    termId: String(record.termId || "").trim(),
    dueDate: String(record.dueDate || "").trim(),
    status: normalizeFeeItemStatus(record.status),
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt:
      normalizeFeeItemStatus(record.status) === "archived" ? record.archivedAt || timestamp : null,
  };
}

function compareSchoolFeeItems(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }
  const classComparison = left.classLevel.localeCompare(right.classLevel, undefined, { numeric: true });
  if (classComparison !== 0) {
    return classComparison;
  }
  const nameComparison = left.name.localeCompare(right.name, undefined, { numeric: true });
  if (nameComparison !== 0) {
    return nameComparison;
  }
  return left.createdAt.localeCompare(right.createdAt);
}

function getSchoolFeeItems() {
  const stored = readWorkspaceState(SCHOOL_FEE_ITEMS_STORAGE_KEY, DEFAULT_FEE_ITEMS);
  const source = Array.isArray(stored) ? stored : DEFAULT_FEE_ITEMS;
  return source
    .map((record) => normalizeSchoolFeeItem(record))
    .filter((record) => record.name && record.classLevel && record.sessionId && record.termId)
    .sort(compareSchoolFeeItems);
}

function emitSchoolFeeItemsUpdate(items = getSchoolFeeItems()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_FEE_ITEMS_EVENT, {
      detail: { items },
    }),
  );
}

function saveSchoolFeeItems(items) {
  const normalized = items
    .map((record) => normalizeSchoolFeeItem(record))
    .filter((record) => record.name && record.classLevel && record.sessionId && record.termId)
    .sort(compareSchoolFeeItems);
  writeWorkspaceState(SCHOOL_FEE_ITEMS_STORAGE_KEY, normalized);
  emitSchoolFeeItemsUpdate(normalized);
  return normalized;
}

function upsertSchoolFeeItem(record = {}) {
  const items = getSchoolFeeItems();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeSchoolFeeItem({
    ...record,
    updatedAt: timestamp,
  });
  const index = items.findIndex((item) => item.id === nextRecord.id);
  if (index >= 0) {
    items[index] = {
      ...items[index],
      ...nextRecord,
      createdAt: items[index].createdAt,
      updatedAt: timestamp,
    };
  } else {
    items.push(nextRecord);
  }
  return saveSchoolFeeItems(items);
}

function setSchoolFeeItemArchived(itemId, archived) {
  const timestamp = new Date().toISOString();
  const items = getSchoolFeeItems();
  const nextItems = items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }
    return {
      ...item,
      status: archived ? "archived" : "active",
      archivedAt: archived ? timestamp : null,
      updatedAt: timestamp,
    };
  });
  return saveSchoolFeeItems(nextItems);
}

function summarizeSchoolFeeItems() {
  const items = getSchoolFeeItems();
  const activeItems = items.filter((item) => item.status === "active");
  const archivedItems = items.filter((item) => item.status === "archived");
  const activeAmount = activeItems.reduce((sum, item) => sum + item.amount, 0);
  const classCount = new Set(activeItems.map((item) => item.classLevel.toLowerCase())).size;
  return {
    items,
    activeCount: activeItems.length,
    archivedCount: archivedItems.length,
    classCount,
    activeAmount,
  };
}

function normalizeSchoolClass(record = {}) {
  const capacity = Number.parseInt(record.capacity, 10);
  const status = record.status === "archived" ? "archived" : "active";
  const timestamp = new Date().toISOString();
  const normalizeList = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [];
  const normalizeAssignments = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => ({
            subject: String(item?.subject || "").trim(),
            teacher: String(item?.teacher || "").trim(),
          }))
          .filter((item) => item.subject && item.teacher)
      : [];

  return {
    id: String(record.id || createStorageId("class")),
    name: String(record.name || "").trim(),
    level: String(record.level || "").trim(),
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 0,
    classTeacher: String(record.classTeacher || "").trim(),
    arms: normalizeList(record.arms),
    subjects: normalizeList(record.subjects),
    teacherAssignments: normalizeAssignments(record.teacherAssignments),
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
  };
}

function compareSchoolClasses(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }

  const levelComparison = left.level.localeCompare(right.level, undefined, { numeric: true });

  if (levelComparison !== 0) {
    return levelComparison;
  }

  return left.name.localeCompare(right.name, undefined, { numeric: true });
}

function getSchoolClasses() {
  const stored = readWorkspaceState(SCHOOL_CLASSES_STORAGE_KEY, DEFAULT_CLASS_RECORDS);
  const source = Array.isArray(stored) && stored.length ? stored : DEFAULT_CLASS_RECORDS;
  const withoutLegacyMockData = source.filter(
    (record) => !LEGACY_MOCK_CLASS_IDS.has(String(record?.id || "")),
  );

  if (withoutLegacyMockData.length !== source.length) {
    writeWorkspaceState(SCHOOL_CLASSES_STORAGE_KEY, withoutLegacyMockData);
  }

  return withoutLegacyMockData.map((record) => normalizeSchoolClass(record)).sort(compareSchoolClasses);
}

function emitSchoolClassesUpdate(classes = getSchoolClasses()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_CLASSES_EVENT, {
      detail: { classes },
    }),
  );
}

function saveSchoolClasses(classes) {
  const normalized = classes.map((record) => normalizeSchoolClass(record)).sort(compareSchoolClasses);
  writeWorkspaceState(SCHOOL_CLASSES_STORAGE_KEY, normalized);
  emitSchoolClassesUpdate(normalized);
  return normalized;
}

function upsertSchoolClass(record) {
  const classes = getSchoolClasses();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeSchoolClass({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = classes.findIndex((item) => item.id === nextRecord.id);

  if (existingIndex === -1) {
    classes.push({
      ...nextRecord,
      createdAt: nextRecord.createdAt || timestamp,
    });
  } else {
    classes[existingIndex] = {
      ...classes[existingIndex],
      ...nextRecord,
      createdAt: classes[existingIndex].createdAt,
      archivedAt: nextRecord.status === "archived" ? nextRecord.archivedAt || timestamp : null,
      updatedAt: timestamp,
    };
  }

  return saveSchoolClasses(classes);
}

function setSchoolClassArchived(classId, archived) {
  const classes = getSchoolClasses();
  const nextClasses = classes.map((record) => {
    if (record.id !== classId) {
      return record;
    }

    return {
      ...record,
      status: archived ? "archived" : "active",
      archivedAt: archived ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
  });

  return saveSchoolClasses(nextClasses);
}

function deleteSchoolClass(classId) {
  return saveSchoolClasses(getSchoolClasses().filter((record) => record.id !== classId));
}

function summarizeSchoolClasses() {
  const classes = getSchoolClasses();
  const active = classes.filter((record) => record.status !== "archived");
  const archived = classes.filter((record) => record.status === "archived");
  const totalArms = active.reduce((sum, record) => sum + record.arms.length, 0);
  const totalSubjects = active.reduce((sum, record) => sum + record.subjects.length, 0);
  const totalAssignments = active.reduce((sum, record) => sum + record.teacherAssignments.length, 0);

  return {
    classes,
    activeCount: active.length,
    archivedCount: archived.length,
    totalCapacity: active.reduce((sum, record) => sum + record.capacity, 0),
    totalArms,
    totalSubjects,
    totalAssignments,
  };
}

function normalizeCourseAssignmentList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen = new Set();

  return items
    .map((item) => String(item || "").trim())
    .filter((item) => {
      if (!item) {
        return false;
      }

      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function normalizeSchoolCourse(record = {}) {
  const timestamp = new Date().toISOString();
  const status = record.status === "archived" ? "archived" : "active";

  return {
    id: String(record.id || createStorageId("course")),
    name: String(record.name || "").trim(),
    code: String(record.code || "").trim().toUpperCase(),
    category: String(record.category || "").trim(),
    creditUnit: String(record.creditUnit || "").trim(),
    description: String(record.description || "").trim(),
    level: String(record.level || "").trim(),
    teacherAssignments: normalizeCourseAssignmentList(record.teacherAssignments),
    studentAssignments: normalizeCourseAssignmentList(record.studentAssignments),
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
  };
}

function compareSchoolCourses(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }

  const levelComparison = left.level.localeCompare(right.level, undefined, { numeric: true });

  if (levelComparison !== 0) {
    return levelComparison;
  }

  const codeComparison = left.code.localeCompare(right.code, undefined, { numeric: true });

  if (codeComparison !== 0) {
    return codeComparison;
  }

  return left.name.localeCompare(right.name, undefined, { numeric: true });
}

function getSchoolCourses() {
  const stored = readWorkspaceState(SCHOOL_COURSES_STORAGE_KEY, DEFAULT_COURSE_RECORDS);
  const source = Array.isArray(stored) ? stored : DEFAULT_COURSE_RECORDS;

  return source.map((record) => normalizeSchoolCourse(record)).sort(compareSchoolCourses);
}

function emitSchoolCoursesUpdate(courses = getSchoolCourses()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_COURSES_EVENT, {
      detail: { courses },
    }),
  );
}

function saveSchoolCourses(courses) {
  const normalized = courses.map((record) => normalizeSchoolCourse(record)).sort(compareSchoolCourses);
  writeWorkspaceState(SCHOOL_COURSES_STORAGE_KEY, normalized);
  emitSchoolCoursesUpdate(normalized);
  return normalized;
}

function upsertSchoolCourse(record) {
  const courses = getSchoolCourses();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeSchoolCourse({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = courses.findIndex((item) => item.id === nextRecord.id);

  if (existingIndex === -1) {
    courses.push({
      ...nextRecord,
      createdAt: nextRecord.createdAt || timestamp,
    });
  } else {
    courses[existingIndex] = {
      ...courses[existingIndex],
      ...nextRecord,
      createdAt: courses[existingIndex].createdAt,
      archivedAt: nextRecord.status === "archived" ? nextRecord.archivedAt || timestamp : null,
      updatedAt: timestamp,
    };
  }

  return saveSchoolCourses(courses);
}

function setSchoolCourseArchived(courseId, archived) {
  const courses = getSchoolCourses();
  const nextCourses = courses.map((record) => {
    if (record.id !== courseId) {
      return record;
    }

    return {
      ...record,
      status: archived ? "archived" : "active",
      archivedAt: archived ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
  });

  return saveSchoolCourses(nextCourses);
}

function deleteSchoolCourse(courseId) {
  return saveSchoolCourses(getSchoolCourses().filter((record) => record.id !== courseId));
}

function getActiveCourseCatalog() {
  return getSchoolCourses()
    .filter((course) => course.status !== "archived")
    .map((course) => {
      const label = course.code ? `${course.code} • ${course.name}` : course.name;
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        level: course.level,
        label,
      };
    });
}

function summarizeSchoolCourses() {
  const courses = getSchoolCourses();
  const active = courses.filter((record) => record.status !== "archived");
  const archived = courses.filter((record) => record.status === "archived");
  const levels = new Set(
    active
      .map((record) => record.level)
      .filter(Boolean)
      .map((level) => level.toLowerCase()),
  );
  const teacherAssignmentCount = active.reduce(
    (sum, record) => sum + (record.teacherAssignments || []).length,
    0,
  );
  const studentAssignmentCount = active.reduce(
    (sum, record) => sum + (record.studentAssignments || []).length,
    0,
  );

  return {
    courses,
    activeCount: active.length,
    archivedCount: archived.length,
    levelCount: levels.size,
    teacherAssignmentCount,
    studentAssignmentCount,
    activeCatalog: getActiveCourseCatalog(),
  };
}

function normalizeGuardianContact(contact = {}) {
  return {
    id: String(contact.id || createStorageId("guardian")),
    name: String(contact.name || "").trim(),
    relationship: String(contact.relationship || "").trim(),
    phone: String(contact.phone || "").trim(),
    email: String(contact.email || "").trim(),
  };
}

function normalizeStudentProgressionEntry(entry = {}) {
  return {
    id: String(entry.id || createStorageId("student-progress")),
    type: String(entry.type || "updated").trim() || "updated",
    fromLevel: String(entry.fromLevel || "").trim(),
    toLevel: String(entry.toLevel || "").trim(),
    note: String(entry.note || "").trim(),
    timestamp: entry.timestamp || new Date().toISOString(),
  };
}

function normalizeStudentDocumentRecord(record = {}) {
  const sizeBytes = Number.parseInt(record.sizeBytes, 10);
  return {
    id: String(record.id || createStorageId("student-document")),
    name: String(record.name || "").trim(),
    documentType: String(record.documentType || "Other").trim() || "Other",
    mimeType: String(record.mimeType || "").trim(),
    sizeBytes: Number.isFinite(sizeBytes) && sizeBytes >= 0 ? sizeBytes : 0,
    dataUrl: String(record.dataUrl || "").trim(),
    uploadedBy: String(record.uploadedBy || "").trim(),
    uploadedAt: String(record.uploadedAt || record.createdAt || new Date().toISOString()).trim(),
  };
}

function normalizeStudentRecord(record = {}) {
  const timestamp = new Date().toISOString();
  const status =
    record.status === "archived"
      ? "archived"
      : record.status === "transferred"
        ? "transferred"
        : "active";
  const normalizePromotionDecision = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "repeat" || normalized === "resit") {
      return normalized;
    }
    return "promote";
  };
  const normalizeExamOutcome = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "resit" || normalized === "fail") {
      return normalized;
    }
    return "pass";
  };
  const firstName = String(record.firstName || "").trim();
  const lastName = String(record.lastName || "").trim();
  const fallbackFullName = String(record.fullName || "").trim();
  const derivedFullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const fullName = derivedFullName || fallbackFullName;
  const guardians = Array.isArray(record.guardians)
    ? record.guardians
        .map((guardian) => normalizeGuardianContact(guardian))
        .filter(
          (guardian) =>
            guardian.name &&
            guardian.relationship &&
            (guardian.phone || guardian.email),
        )
    : [];
  const progressionHistory = Array.isArray(record.progressionHistory)
    ? record.progressionHistory.map((entry) => normalizeStudentProgressionEntry(entry))
    : [];
  const documents = Array.isArray(record.documents)
    ? record.documents
        .map((entry) => normalizeStudentDocumentRecord(entry))
        .filter((entry) => entry.name)
    : [];

  return {
    id: String(record.id || createStorageId("student")),
    firstName,
    lastName,
    fullName,
    admissionNo: String(record.admissionNo || "").trim(),
    level: String(record.level || "").trim(),
    dateOfBirth: String(record.dateOfBirth || "").trim(),
    gender: String(record.gender || "").trim(),
    guardians,
    progressionHistory,
    documents,
    status,
    promotionDecision: normalizePromotionDecision(record.promotionDecision),
    examOutcome: normalizeExamOutcome(record.examOutcome),
    lastPromotionSessionId: String(record.lastPromotionSessionId || "").trim(),
    lastPromotionOutcome: String(record.lastPromotionOutcome || "").trim(),
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
    transferredAt: status === "transferred" ? record.transferredAt || timestamp : null,
    transferReason: String(record.transferReason || "").trim(),
  };
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function compareSchoolStudents(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }

  const levelComparison = left.level.localeCompare(right.level, undefined, { numeric: true });

  if (levelComparison !== 0) {
    return levelComparison;
  }

  return left.fullName.localeCompare(right.fullName, undefined, { numeric: true });
}

function getSchoolStudents() {
  const stored = readWorkspaceState(SCHOOL_STUDENTS_STORAGE_KEY, DEFAULT_STUDENT_RECORDS);
  const source = Array.isArray(stored) ? stored : DEFAULT_STUDENT_RECORDS;

  return source.map((record) => normalizeStudentRecord(record)).sort(compareSchoolStudents);
}

function emitSchoolStudentsUpdate(students = getSchoolStudents()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_STUDENTS_EVENT, {
      detail: { students },
    }),
  );
}

function saveSchoolStudents(students) {
  const normalized = students.map((record) => normalizeStudentRecord(record)).sort(compareSchoolStudents);
  writeWorkspaceState(SCHOOL_STUDENTS_STORAGE_KEY, normalized);
  emitSchoolStudentsUpdate(normalized);
  return normalized;
}

function upsertSchoolStudent(record) {
  const students = getSchoolStudents();
  const timestamp = new Date().toISOString();
  const nextRecord = normalizeStudentRecord({
    ...record,
    updatedAt: timestamp,
  });
  const existingIndex = students.findIndex((item) => item.id === nextRecord.id);

  if (existingIndex === -1) {
    students.push({
      ...nextRecord,
      createdAt: nextRecord.createdAt || timestamp,
    });
  } else {
    students[existingIndex] = {
      ...students[existingIndex],
      ...nextRecord,
      createdAt: students[existingIndex].createdAt,
      archivedAt: nextRecord.status === "archived" ? nextRecord.archivedAt || timestamp : null,
      updatedAt: timestamp,
    };
  }

  return saveSchoolStudents(students);
}

function setSchoolStudentArchived(studentId, archived) {
  const students = getSchoolStudents();
  const nextStudents = students.map((record) => {
    if (record.id !== studentId) {
      return record;
    }

    return {
      ...record,
      status: archived ? "archived" : "active",
      archivedAt: archived ? new Date().toISOString() : null,
      transferredAt: null,
      transferReason: "",
      updatedAt: new Date().toISOString(),
    };
  });

  return saveSchoolStudents(nextStudents);
}

function setSchoolStudentTransferred(studentId, transferReason = "") {
  const students = getSchoolStudents();
  const timestamp = new Date().toISOString();
  const nextStudents = students.map((record) => {
    if (record.id !== studentId) {
      return record;
    }

    return {
      ...record,
      status: "transferred",
      transferredAt: timestamp,
      transferReason: String(transferReason || "").trim(),
      archivedAt: null,
      updatedAt: timestamp,
    };
  });

  return saveSchoolStudents(nextStudents);
}

function updateSchoolStudentProgression(studentId, updater) {
  if (typeof updater !== "function") {
    return getSchoolStudents();
  }

  const students = getSchoolStudents();
  const timestamp = new Date().toISOString();
  const nextStudents = students.map((record) => {
    if (record.id !== studentId) {
      return record;
    }

    const updated = updater(record);
    return normalizeStudentRecord({
      ...record,
      ...updated,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: timestamp,
    });
  });

  return saveSchoolStudents(nextStudents);
}

function summarizeSchoolStudents() {
  const students = getSchoolStudents();
  const active = students.filter((record) => record.status === "active");
  const archived = students.filter((record) => record.status === "archived");
  const transferred = students.filter((record) => record.status === "transferred");
  const guardianContacts = active.reduce((sum, record) => sum + record.guardians.length, 0);
  const studentsWithMultipleGuardians = active.filter((record) => record.guardians.length > 1).length;

  return {
    students,
    activeCount: active.length,
    archivedCount: archived.length,
    transferredCount: transferred.length,
    guardianContacts,
    studentsWithMultipleGuardians,
  };
}

function normalizeAttendanceEntry(entry = {}) {
  const status = String(entry.status || "present").trim().toLowerCase();
  const normalizedStatus = ["present", "absent", "late", "excused"].includes(status) ? status : "present";

  return {
    studentId: String(entry.studentId || "").trim(),
    studentName: String(entry.studentName || "").trim(),
    admissionNo: String(entry.admissionNo || "").trim(),
    status: normalizedStatus,
    note: String(entry.note || "").trim(),
  };
}

function normalizeAttendanceRecord(record = {}) {
  const timestamp = new Date().toISOString();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(record.date || "").trim())
    ? String(record.date).trim()
    : getLocalDateValue();
  const classId = String(record.classId || "").trim();
  const entries = Array.isArray(record.entries)
    ? record.entries
        .map((entry) => normalizeAttendanceEntry(entry))
        .filter((entry) => entry.studentId && entry.studentName)
    : [];

  return {
    id: String(record.id || createStorageId("attendance")),
    date,
    classId,
    className: String(record.className || "").trim(),
    level: String(record.level || "").trim(),
    submittedById: String(record.submittedById || "").trim(),
    submittedByEmail: String(record.submittedByEmail || "").trim(),
    submittedByName: String(record.submittedByName || "").trim(),
    status: "submitted",
    entries,
    takenAt: String(record.takenAt || record.createdAt || timestamp),
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
  };
}

function compareAttendanceRecords(left, right) {
  const dateComparison = right.date.localeCompare(left.date);

  if (dateComparison) {
    return dateComparison;
  }

  return String(left.className || left.level || "").localeCompare(
    String(right.className || right.level || ""),
    undefined,
    { numeric: true },
  );
}

function getAttendanceRecords() {
  const stored = readWorkspaceState(SCHOOL_ATTENDANCE_STORAGE_KEY, DEFAULT_ATTENDANCE_RECORDS);
  const source = Array.isArray(stored) ? stored : DEFAULT_ATTENDANCE_RECORDS;

  return source.map((record) => normalizeAttendanceRecord(record)).sort(compareAttendanceRecords);
}

function emitAttendanceUpdate(records = getAttendanceRecords()) {
  window.dispatchEvent(
    new CustomEvent(SCHOOL_ATTENDANCE_EVENT, {
      detail: { records },
    }),
  );
}

function saveAttendanceRecords(records) {
  const normalized = records.map((record) => normalizeAttendanceRecord(record)).sort(compareAttendanceRecords);
  writeWorkspaceState(SCHOOL_ATTENDANCE_STORAGE_KEY, normalized);
  emitAttendanceUpdate(normalized);
  return normalized;
}

function upsertAttendanceRecord(record) {
  const records = getAttendanceRecords();
  const timestamp = new Date().toISOString();
  const incoming = normalizeAttendanceRecord({
    ...record,
    updatedAt: timestamp,
    takenAt: record.takenAt || timestamp,
  });
  const existingIndex = records.findIndex(
    (entry) => entry.id === incoming.id || (entry.classId === incoming.classId && entry.date === incoming.date),
  );

  if (existingIndex === -1) {
    records.push({
      ...incoming,
      createdAt: incoming.createdAt || timestamp,
    });
  } else {
    records[existingIndex] = {
      ...records[existingIndex],
      ...incoming,
      id: records[existingIndex].id,
      createdAt: records[existingIndex].createdAt,
      updatedAt: timestamp,
      takenAt: timestamp,
    };
  }

  return saveAttendanceRecords(records);
}

function getAttendanceRecordForClassDate(classId, date) {
  const normalizedClassId = String(classId || "").trim();
  const normalizedDate = String(date || "").trim();

  return (
    getAttendanceRecords().find(
      (record) => record.classId === normalizedClassId && record.date === normalizedDate,
    ) || null
  );
}

function summarizeAttendanceRecords(options = {}) {
  const records = getAttendanceRecords();
  const date = String(options.date || getLocalDateValue()).trim();
  const scopedRecords = records.filter((record) => record.date === date);
  const activeStudents = getSchoolStudents().filter((student) => student.status === "active");
  const latestEntryByStudent = new Map();

  scopedRecords.forEach((record) => {
    record.entries.forEach((entry) => {
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

  const counts = activeStudents.reduce(
    (summary, student) => {
      const entry = latestEntryByStudent.get(student.id);
      const status = entry?.status || "unmarked";
      summary[status] = (summary[status] || 0) + 1;
      return summary;
    },
    { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 },
  );
  const markedCount = activeStudents.length - counts.unmarked;
  const attendanceRate = activeStudents.length
    ? Math.round(((counts.present + counts.late) / activeStudents.length) * 100)
    : null;

  return {
    records,
    date,
    recordsForDate: scopedRecords,
    activeStudentCount: activeStudents.length,
    markedCount,
    attendanceRate,
    counts,
  };
}

function normalizeAuditTrailEntry(entry = {}) {
  return {
    id: String(entry.id || createStorageId("audit")),
    timestamp: entry.timestamp || new Date().toISOString(),
    actorName: String(entry.actorName || "System").trim() || "System",
    actorRole: String(entry.actorRole || "System").trim() || "System",
    action: String(entry.action || "updated").trim() || "updated",
    entityType: String(entry.entityType || "record").trim() || "record",
    entityId: String(entry.entityId || "").trim(),
    summary: String(entry.summary || "Update recorded").trim() || "Update recorded",
    details: String(entry.details || "").trim(),
  };
}

function getAuditTrailEntries() {
  const stored = readWorkspaceState(AUDIT_TRAIL_STORAGE_KEY, []);
  const source = Array.isArray(stored) ? stored : [];
  return source
    .map((entry) => normalizeAuditTrailEntry(entry))
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

function emitAuditTrailUpdate(entries = getAuditTrailEntries()) {
  window.dispatchEvent(
    new CustomEvent(AUDIT_TRAIL_EVENT, {
      detail: { entries },
    }),
  );
}

function saveAuditTrailEntries(entries) {
  const normalized = entries
    .map((entry) => normalizeAuditTrailEntry(entry))
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, MAX_AUDIT_TRAIL_ENTRIES);
  writeWorkspaceState(AUDIT_TRAIL_STORAGE_KEY, normalized);
  emitAuditTrailUpdate(normalized);
  return normalized;
}

function recordAuditTrailEntry(entry) {
  const entries = getAuditTrailEntries();
  const nextEntry = normalizeAuditTrailEntry(entry);
  entries.unshift(nextEntry);
  saveAuditTrailEntries(entries);
  return nextEntry;
}

function clearAuditTrailEntries() {
  removeWorkspaceState(AUDIT_TRAIL_STORAGE_KEY);
  const cleared = getAuditTrailEntries();
  emitAuditTrailUpdate(cleared);
  return cleared;
}

function getFeatureToggleDefaults() {
  return Object.fromEntries(features.map((feature) => [feature.id, true]));
}

function getFeatureToggleState() {
  const defaults = getFeatureToggleDefaults();
  const stored = readWorkspaceState(FEATURE_TOGGLE_STORAGE_KEY, {});

  return features.reduce((state, feature) => {
    state[feature.id] = typeof stored[feature.id] === "boolean" ? stored[feature.id] : defaults[feature.id];
    return state;
  }, {});
}

function emitFeatureToggleUpdate(state = getFeatureToggleState()) {
  window.dispatchEvent(
    new CustomEvent(FEATURE_TOGGLE_EVENT, {
      detail: { state },
    }),
  );
}

function setFeatureEnabled(featureId, enabled) {
  const nextState = getFeatureToggleState();

  if (!(featureId in nextState)) {
    return;
  }

  nextState[featureId] = Boolean(enabled);
  writeWorkspaceState(FEATURE_TOGGLE_STORAGE_KEY, nextState);
  emitFeatureToggleUpdate(nextState);
}

function getEnabledFeatures(items = features) {
  const state = getFeatureToggleState();
  return items.filter((item) => state[item.id] !== false);
}

function summarizeFeatureToggleState() {
  const state = getFeatureToggleState();
  const enabled = features.filter((feature) => state[feature.id] !== false).length;

  return {
    state,
    enabled,
    total: features.length,
  };
}

function normalizeRolePermissions(raw = {}) {
  const roleAliases = {
    Admin: ["Admin", "Administrator"],
    Teacher: ["Teacher", "Employee"],
    Parent: ["Parent"],
    Student: ["Student"],
  };

  return ROLE_PERMISSION_ROLES.reduce((next, role) => {
    const aliasKeys = roleAliases[role] || [role];
    const sourceKey = aliasKeys.find((key) => raw[key] && typeof raw[key] === "object");
    const source = sourceKey ? raw[sourceKey] : {};

    next[role] = ROLE_PERMISSION_OPTIONS.reduce((rolePermissions, option) => {
      const fallback = DEFAULT_ROLE_PERMISSIONS[role][option.key];
      rolePermissions[option.key] =
        typeof source[option.key] === "boolean" ? source[option.key] : fallback;
      return rolePermissions;
    }, {});
    return next;
  }, {});
}

function getRolePermissions() {
  const stored = readWorkspaceState(ROLE_PERMISSIONS_STORAGE_KEY, {});
  return normalizeRolePermissions(stored);
}

function emitRolePermissionsUpdate(rolePermissions = getRolePermissions()) {
  window.dispatchEvent(
    new CustomEvent(ROLE_PERMISSIONS_EVENT, {
      detail: { rolePermissions },
    }),
  );
}

function saveRolePermissions(rolePermissions) {
  const normalized = normalizeRolePermissions(rolePermissions);
  writeWorkspaceState(ROLE_PERMISSIONS_STORAGE_KEY, normalized);
  emitRolePermissionsUpdate(normalized);
  return normalized;
}

function setRolePermission(role, permissionKey, enabled) {
  if (!ROLE_PERMISSION_ROLES.includes(role)) {
    return null;
  }

  if (!ROLE_PERMISSION_OPTIONS.some((option) => option.key === permissionKey)) {
    return null;
  }

  const next = getRolePermissions();
  next[role][permissionKey] = Boolean(enabled);
  return saveRolePermissions(next);
}

function resetRolePermissions() {
  removeWorkspaceState(ROLE_PERMISSIONS_STORAGE_KEY);
  const normalized = getRolePermissions();
  emitRolePermissionsUpdate(normalized);
  return normalized;
}

function summarizeRolePermissions() {
  const rolePermissions = getRolePermissions();
  const total = ROLE_PERMISSION_OPTIONS.length;
  const summary = ROLE_PERMISSION_ROLES.map((role) => {
    const enabled = ROLE_PERMISSION_OPTIONS.filter(
      (option) => rolePermissions[role][option.key],
    ).length;
    return { role, enabled, total };
  });

  return {
    rolePermissions,
    roles: ROLE_PERMISSION_ROLES,
    options: ROLE_PERMISSION_OPTIONS,
    summary,
  };
}

window.SchoolSphereFeatureModules = {
  modules: features,
  getState: getFeatureToggleState,
  getEnabledFeatures,
  setFeatureEnabled,
  summarize: summarizeFeatureToggleState,
  eventName: FEATURE_TOGGLE_EVENT,
};

window.SchoolSphereRolePermissions = {
  roles: ROLE_PERMISSION_ROLES,
  permissions: ROLE_PERMISSION_OPTIONS,
  defaults: DEFAULT_ROLE_PERMISSIONS,
  getPermissions: getRolePermissions,
  setPermission: setRolePermission,
  savePermissions: saveRolePermissions,
  resetPermissions: resetRolePermissions,
  summarize: summarizeRolePermissions,
  eventName: ROLE_PERMISSIONS_EVENT,
};

window.SchoolSphereSiteSettings = {
  defaults: DEFAULT_SCHOOL_SETTINGS,
  schoolTypeOptions: SCHOOL_TYPE_OPTIONS,
  getSettings: getSchoolSettings,
  getEnabledSchoolTypes: () => getSchoolSettings().schoolTypes,
  saveSettings: saveSchoolSettings,
  resetSettings: resetSchoolSettings,
  formatAcademicYearLabel,
  hasContext: hasSchoolSettingsContext,
  eventName: SCHOOL_SETTINGS_EVENT,
};

window.SchoolSphereAcademicCycles = {
  defaults: DEFAULT_ACADEMIC_CYCLES,
  getState: getAcademicCycles,
  summarize: summarizeAcademicCycles,
  saveState: saveAcademicCycles,
  upsertSession: upsertAcademicSession,
  setSessionStatus: setAcademicSessionStatus,
  upsertTerm: upsertAcademicTerm,
  setTermStatus: setAcademicTermStatus,
  eventName: SCHOOL_ACADEMIC_CYCLES_EVENT,
};

window.SchoolSphereAcademicCalendar = {
  defaults: DEFAULT_ACADEMIC_CALENDAR_EVENTS,
  types: ["term", "holiday", "exam"],
  getEvents: getAcademicCalendarEvents,
  summarize: summarizeAcademicCalendarEvents,
  saveEvents: saveAcademicCalendarEvents,
  upsertEvent: upsertAcademicCalendarEvent,
  archiveEvent: (eventId) => setAcademicCalendarEventArchived(eventId, true),
  activateEvent: (eventId) => setAcademicCalendarEventArchived(eventId, false),
  findConflicts: findAcademicCalendarConflicts,
  getUpcomingEvents: getUpcomingAcademicCalendarEvents,
  eventName: SCHOOL_ACADEMIC_CALENDAR_EVENT,
};

window.SchoolSphereAdmissionConfig = {
  defaults: DEFAULT_ADMISSION_CONFIGURATION,
  getState: getAdmissionConfiguration,
  summarize: summarizeAdmissionConfiguration,
  saveState: saveAdmissionConfiguration,
  upsertSession: upsertAdmissionConfigSession,
  setSessionStatus: setAdmissionConfigSessionStatus,
  upsertClassOption: upsertAdmissionConfigClass,
  setClassOptionStatus: setAdmissionConfigClassStatus,
  upsertStage: upsertAdmissionConfigStage,
  setStageStatus: setAdmissionConfigStageStatus,
  eventName: SCHOOL_ADMISSION_CONFIG_EVENT,
};

window.SchoolSphereTimetable = {
  defaults: DEFAULT_TIMETABLE_ENTRIES,
  days: TIMETABLE_DAYS,
  getEntries: getSchoolTimetableEntries,
  summarize: summarizeSchoolTimetableEntries,
  saveEntries: saveSchoolTimetableEntries,
  upsertEntry: upsertSchoolTimetableEntry,
  archiveEntry: (entryId) => setSchoolTimetableEntryStatus(entryId, "archived"),
  activateEntry: (entryId) => setSchoolTimetableEntryStatus(entryId, "draft"),
  publishGroup: (criteria) => setTimetableGroupPublished(criteria, true),
  unpublishGroup: (criteria) => setTimetableGroupPublished(criteria, false),
  eventName: SCHOOL_TIMETABLE_EVENT,
};

window.SchoolSphereFeeItems = {
  defaults: DEFAULT_FEE_ITEMS,
  getItems: getSchoolFeeItems,
  summarize: summarizeSchoolFeeItems,
  saveItems: saveSchoolFeeItems,
  upsertItem: upsertSchoolFeeItem,
  archiveItem: (itemId) => setSchoolFeeItemArchived(itemId, true),
  activateItem: (itemId) => setSchoolFeeItemArchived(itemId, false),
  eventName: SCHOOL_FEE_ITEMS_EVENT,
};

window.SchoolSphereClasses = {
  defaults: DEFAULT_CLASS_RECORDS,
  getClasses: getSchoolClasses,
  summarize: summarizeSchoolClasses,
  saveClasses: saveSchoolClasses,
  upsertClass: upsertSchoolClass,
  archiveClass: (classId) => setSchoolClassArchived(classId, true),
  activateClass: (classId) => setSchoolClassArchived(classId, false),
  deleteClass: deleteSchoolClass,
  eventName: SCHOOL_CLASSES_EVENT,
};

window.SchoolSphereCourses = {
  defaults: DEFAULT_COURSE_RECORDS,
  getCourses: getSchoolCourses,
  summarize: summarizeSchoolCourses,
  saveCourses: saveSchoolCourses,
  upsertCourse: upsertSchoolCourse,
  archiveCourse: (courseId) => setSchoolCourseArchived(courseId, true),
  activateCourse: (courseId) => setSchoolCourseArchived(courseId, false),
  deleteCourse: deleteSchoolCourse,
  getActiveCatalog: getActiveCourseCatalog,
  eventName: SCHOOL_COURSES_EVENT,
};

window.SchoolSphereStudents = {
  defaults: DEFAULT_STUDENT_RECORDS,
  getStudents: getSchoolStudents,
  summarize: summarizeSchoolStudents,
  saveStudents: saveSchoolStudents,
  upsertStudent: upsertSchoolStudent,
  updateStudentProgression: updateSchoolStudentProgression,
  transferStudentOut: setSchoolStudentTransferred,
  archiveStudent: (studentId) => setSchoolStudentArchived(studentId, true),
  activateStudent: (studentId) => setSchoolStudentArchived(studentId, false),
  eventName: SCHOOL_STUDENTS_EVENT,
};

window.SchoolSphereAttendance = {
  defaults: DEFAULT_ATTENDANCE_RECORDS,
  getRecords: getAttendanceRecords,
  summarize: summarizeAttendanceRecords,
  saveRecords: saveAttendanceRecords,
  upsertRecord: upsertAttendanceRecord,
  getRecordForClassDate: getAttendanceRecordForClassDate,
  eventName: SCHOOL_ATTENDANCE_EVENT,
};

window.SchoolSphereAuditTrail = {
  getEntries: getAuditTrailEntries,
  saveEntries: saveAuditTrailEntries,
  record: recordAuditTrailEntry,
  clear: clearAuditTrailEntries,
  eventName: AUDIT_TRAIL_EVENT,
};

window.addEventListener("storage", (event) => {
  if (isWorkspaceScopedStorageEventKey(event.key, FEATURE_TOGGLE_STORAGE_KEY)) {
    emitFeatureToggleUpdate(getFeatureToggleState());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_SETTINGS_STORAGE_KEY)) {
    emitSchoolSettingsUpdate(getSchoolSettings());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_ACADEMIC_CYCLES_STORAGE_KEY)) {
    emitAcademicCyclesUpdate(getAcademicCycles());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_ACADEMIC_CALENDAR_STORAGE_KEY)) {
    emitAcademicCalendarUpdate(getAcademicCalendarEvents());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_ADMISSION_CONFIG_STORAGE_KEY)) {
    emitAdmissionConfigurationUpdate(getAdmissionConfiguration());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_TIMETABLE_STORAGE_KEY)) {
    emitSchoolTimetableUpdate(getSchoolTimetableEntries());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_FEE_ITEMS_STORAGE_KEY)) {
    emitSchoolFeeItemsUpdate(getSchoolFeeItems());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_CLASSES_STORAGE_KEY)) {
    emitSchoolClassesUpdate(getSchoolClasses());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_COURSES_STORAGE_KEY)) {
    emitSchoolCoursesUpdate(getSchoolCourses());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_STUDENTS_STORAGE_KEY)) {
    emitSchoolStudentsUpdate(getSchoolStudents());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, SCHOOL_ATTENDANCE_STORAGE_KEY)) {
    emitAttendanceUpdate(getAttendanceRecords());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, AUDIT_TRAIL_STORAGE_KEY)) {
    emitAuditTrailUpdate(getAuditTrailEntries());
  }

  if (isWorkspaceScopedStorageEventKey(event.key, ROLE_PERMISSIONS_STORAGE_KEY)) {
    emitRolePermissionsUpdate(getRolePermissions());
  }
});

function currentPage() {
  return document.body.dataset.page || "home";
}

function hrefMatchesCurrentFile(href, currentFile) {
  const targetFile = href.split("#")[0].replace("./", "") || "index.html";
  return targetFile === currentFile;
}

function renderHeader() {
  const header = document.getElementById("site-header");

  if (!header) {
    return;
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const platformName = DEFAULT_PLATFORM_NAME;

  const primaryNavHtml = homeNavLinks
    .map(
      (item) =>
        `<a class="nav-direct-link ${hrefMatchesCurrentFile(item.href, currentFile) ? "is-active" : ""}" href="${item.href}">${item.label}</a>`,
    )
    .join("");

  const navAuthHtml = `
    <a class="button button-outline" href="./login.html">Login</a>
    <a class="button button-primary" href="./signup.html">Get Started</a>
  `;

  const utilityLinks = [
    { label: "School Portal", href: "./portal.html" },
    { label: "Saved Workflows", href: "./workflows.html" },
    { label: "Talent Community", href: "./signup.html" },
  ];

  header.innerHTML = `
    <div class="site-header-stack">
      <div class="site-utility-bar">
        <div class="site-utility-inner">
          <a class="site-utility-home" href="./index.html">Visit ${escapeHtml(platformName)}</a>
          <div class="utility-links">
            ${utilityLinks.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
          </div>
        </div>
      </div>
      <div class="site-header-shell">
        <a class="logo-link logo-link-full" href="./index.html" aria-label="${escapeHtml(platformName)} home">
          ${buildBrandMarkHtml({ schoolName: platformName, logoUrl: "" }, "logo-mark")}
          <span class="logo-word">${escapeHtml(platformName)}</span>
        </a>

        <nav class="nav-center" aria-label="Primary">
          ${primaryNavHtml}
        </nav>

        <div class="nav-auth">
          ${navAuthHtml}
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  const footer = document.getElementById("site-footer");

  if (!footer) {
    return;
  }

  const platformName = DEFAULT_PLATFORM_NAME;

  footer.innerHTML = `
    <div class="site-footer-shell careers-footer-shell">
      <div class="careers-footer-brand">
        <a class="logo-link logo-link-full" href="./index.html" aria-label="${escapeHtml(platformName)} home">
          ${buildBrandMarkHtml({ schoolName: platformName, logoUrl: "" }, "logo-mark")}
          <span class="logo-word">${escapeHtml(platformName)}</span>
        </a>
        <p>Simple, clean school management for teams that want less friction and better visibility.</p>
        <a class="button button-primary" href="./signup.html">Get Started</a>
      </div>

      <div class="careers-footer-links">
        <div>
          <h4>Explore</h4>
          <a href="./products.html">Products</a>
          <a href="./workflows.html">Explore workflows</a>
          <a href="./modules.html">Feature modules</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="./why-it-works.html">Why it works</a>
          <a href="./in-practice.html">In practice</a>
          <a href="./login.html">Login</a>
        </div>
        <div>
          <h4>Platform</h4>
          <span>SchoolSphere SaaS</span>
          <span>Modern school operations platform</span>
          <span>Multi-role dashboard and workflow tools</span>
        </div>
      </div>
    </div>
  `;
}

function closeMenusOnOutsideClick() {
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".nav-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });
}

function renderWhyGrid(targetId, items) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML = items
    .map(
      (item, index) => `
        <article class="info-card">
          <span class="card-badge">0${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `,
    )
    .join("");
}

function renderOfferingPreviewGrid(targetId, items) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML = items
    .map(
      (item) => `
        <article class="info-card">
          <span class="card-badge">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `,
    )
    .join("");
}

function renderStandoutList(targetId) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML = standoutBullets.map((item) => `<li>${item}</li>`).join("");
}

function renderFeatureGrid(targetId, items) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const visibleItems = getEnabledFeatures(items);

  if (!visibleItems.length) {
    target.innerHTML = `
      <article class="feature-card feature-card-empty">
        <span class="feature-tag">Modules hidden</span>
        <h3>No active modules are exposed right now.</h3>
        <p>Use the admin dashboard feature toggles to turn the needed modules back on for this institution.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = visibleItems
    .map(
      (feature) => `
        <article class="feature-card" data-feature-id="${feature.id}">
          <span class="feature-tag">${feature.tag}</span>
          <h3>${feature.title}</h3>
          <p>${feature.copy}</p>
        </article>
      `,
    )
    .join("");
}

function renderSchoolGrid(targetId, items) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML = items
    .map(
      (school) => `
        <article class="school-card" id="${school.id}">
          <span class="school-badge">${school.tag}</span>
          <h3>${school.title}</h3>
          <p>${school.copy}</p>
          <ul>
            ${school.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderPracticeGrid(targetId, items) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML = items
    .map(
      (story) => `
        <article class="quote-card">
          <div class="quote-meta">
            <strong>${story.title}</strong>
            <span>${story.label}</span>
          </div>
          <p>${story.copy}</p>
        </article>
      `,
    )
    .join("");
}

let activeOfferingId = offerings[0].id;

function renderOfferingTabs() {
  const tabs = document.getElementById("home-offering-tabs");
  const panel = document.getElementById("home-offering-panel");

  if (!tabs || !panel) {
    return;
  }

  tabs.innerHTML = offerings
    .map(
      (offering) => `
        <button
          type="button"
          class="button button-soft ${offering.id === activeOfferingId ? "is-active" : ""}"
          data-offering="${offering.id}"
        >
          ${offering.title}
        </button>
      `,
    )
    .join("");

  const activeOffering = offerings.find((offering) => offering.id === activeOfferingId) || offerings[0];

  panel.innerHTML = `
    <span class="workflow-badge">${activeOffering.tag}</span>
    <h3>${activeOffering.title}</h3>
    <p>${activeOffering.description}</p>

    <div class="tab-metrics">
      ${activeOffering.metrics
        .map(
          (metric) => `
            <div class="tab-mini">
              <strong>${metric.value}</strong>
              <span>${metric.label}</span>
            </div>
          `,
        )
        .join("")}
    </div>

    <ul>
      ${activeOffering.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
    </ul>
  `;

  tabs.querySelectorAll("[data-offering]").forEach((button) => {
    button.addEventListener("click", () => {
      activeOfferingId = button.dataset.offering;
      renderOfferingTabs();
    });
  });
}

function renderWorkflowPage() {
  const target = document.getElementById("workflow-page-grid");

  if (!target) {
    return;
  }

  target.innerHTML = offerings
    .slice(0, 3)
    .map(
      (offering) => `
        <article class="workflow-card" id="${offering.id}">
          <div>
            <span class="workflow-badge">${offering.tag}</span>
            <h3>${offering.title}</h3>
            <p>${offering.description}</p>
            <ul>
              ${offering.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
            </ul>
          </div>
          <div class="workflow-mini-grid">
            ${offering.metrics
              .map(
                (metric) => `
                  <div class="tab-mini">
                    <strong>${metric.value}</strong>
                    <span>${metric.label}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderFeatureSurfaces() {
  renderFeatureGrid("home-feature-grid", features.slice(0, 8));
  renderFeatureGrid("module-page-grid", features);
}

function initPageContent() {
  renderWhyGrid("why-preview-grid", whyCards);
  renderWhyGrid("why-page-grid", whyCards);
  renderOfferingPreviewGrid("products-lane-grid", offerings.slice(0, 3));
  renderStandoutList("standout-preview-list");
  renderStandoutList("standout-page-list");
  renderOfferingTabs();
  renderWorkflowPage();
  renderFeatureSurfaces();
  renderSchoolGrid("home-level-grid", schoolTypes);
  renderSchoolGrid("school-type-page-grid", schoolTypes);
  renderPracticeGrid("home-practice-grid", practiceStories.slice(0, 3));
  renderPracticeGrid("practice-page-grid", practiceStories.slice(0, 3));
}

renderHeader();
renderFooter();
closeMenusOnOutsideClick();
initPageContent();
applySchoolSettingsBranding();
window.addEventListener(SCHOOL_SETTINGS_EVENT, () => {
  renderHeader();
  renderFooter();
  applySchoolSettingsBranding();
});
window.addEventListener(FEATURE_TOGGLE_EVENT, renderFeatureSurfaces);
