const navMenus = [
  {
    type: "menu",
    label: "Learn",
    items: [
      { label: "Benefits", href: "./why-it-works.html" },
      { label: "Features", href: "./modules.html" },
      { label: "School Types", href: "./school-types.html" },
      { label: "Help Center", href: "#", placeholder: true },
      { label: "About Us", href: "./in-practice.html" },
    ],
  },
  { type: "link", label: "Pricing", href: "./products.html" },
  { type: "link", label: "Pro Edition", href: "./school-types.html#university-mode" },
  { type: "link", label: "Demo", href: "./workflows.html" },
  { type: "link", label: "Affiliate", href: "#", placeholder: true },
];

const signInLinks = [
  { label: "To Your School Portal", href: "./login.html" },
  { label: "To Subscriber / Affiliate Account", href: "./login.html" },
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
  hasNursery: false,
  hasHigherInstitution: false,
};
const SCHOOL_SETTINGS_STORAGE_KEY = "schoolsphere.schoolSettings.v1";
const SCHOOL_SETTINGS_EVENT = "schoolsphere:school-settings-updated";
const DEFAULT_CLASS_RECORDS = [];
const SCHOOL_CLASSES_STORAGE_KEY = "schoolsphere.classes.v1";
const SCHOOL_CLASSES_EVENT = "schoolsphere:classes-updated";
const DEFAULT_STUDENT_RECORDS = [];
const SCHOOL_STUDENTS_STORAGE_KEY = "schoolsphere.students.v1";
const SCHOOL_STUDENTS_EVENT = "schoolsphere:students-updated";
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
const ROLE_PERMISSION_ROLES = ["Administrator", "Employee", "Parent", "Student"];
const ROLE_PERMISSION_OPTIONS = [
  { key: "dashboard_view", label: "View dashboard" },
  { key: "students_manage", label: "Manage students" },
  { key: "teachers_manage", label: "Manage staff and teachers" },
  { key: "classes_manage", label: "Manage classes" },
  { key: "attendance_manage", label: "Manage attendance" },
  { key: "results_manage", label: "Manage exams and results" },
  { key: "fees_manage", label: "Manage fees and bursary" },
  { key: "reports_view", label: "View reports" },
  { key: "settings_manage", label: "Manage school settings" },
];
const DEFAULT_ROLE_PERMISSIONS = {
  Administrator: {
    dashboard_view: true,
    students_manage: true,
    teachers_manage: true,
    classes_manage: true,
    attendance_manage: true,
    results_manage: true,
    fees_manage: true,
    reports_view: true,
    settings_manage: true,
  },
  Employee: {
    dashboard_view: true,
    students_manage: false,
    teachers_manage: false,
    classes_manage: false,
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

function normalizeSchoolSettings(settings = {}) {
  const hasNursery =
    settings.hasNursery === true ||
    settings.hasNursery === "true" ||
    settings.hasNursery === "1";
  const hasHigherInstitution =
    settings.hasHigherInstitution === true ||
    settings.hasHigherInstitution === "true" ||
    settings.hasHigherInstitution === "1";

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
    hasNursery,
    hasHigherInstitution,
  };
}

function getSchoolSettings() {
  return normalizeSchoolSettings(parseStoredJSON(localStorage.getItem(SCHOOL_SETTINGS_STORAGE_KEY), {}));
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
      settings.hasNursery ||
      settings.hasHigherInstitution ||
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
  const academicYearLabel = formatAcademicYearLabel(settings);
  const schoolStructure = [
    settings.hasNursery ? "Nursery" : null,
    "Primary 1-6",
    "JSS 1-3",
    "SS 1-3",
    settings.hasHigherInstitution ? "Higher Institution" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  const schoolContext = [settings.address, academicYearLabel, schoolStructure]
    .filter(Boolean)
    .join(" • ");

  if (!root.dataset.baseTitle) {
    root.dataset.baseTitle = document.title;
  }

  document.title = root.dataset.baseTitle.replaceAll(DEFAULT_PLATFORM_NAME, settings.schoolName);

  document.querySelectorAll(".auth-brand").forEach((node) => {
    node.setAttribute("aria-label", `${settings.schoolName} home`);
  });

  document.querySelectorAll(".auth-brand-text").forEach((node) => {
    node.textContent = settings.schoolName;
  });

  document.querySelectorAll(".auth-brand-mark").forEach((node) => {
    if (settings.logoUrl) {
      node.classList.add("auth-brand-mark--image");
      node.innerHTML = `<img class="school-brand-image" src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(settings.schoolName)} logo" />`;
      return;
    }

    node.classList.remove("auth-brand-mark--image");
    node.textContent = getSchoolInitial(settings.schoolName);
  });

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
  localStorage.setItem(SCHOOL_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  emitSchoolSettingsUpdate(normalized);
  return normalized;
}

function resetSchoolSettings() {
  localStorage.removeItem(SCHOOL_SETTINGS_STORAGE_KEY);
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
  const stored = parseStoredJSON(localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY), DEFAULT_CLASS_RECORDS);
  const source = Array.isArray(stored) && stored.length ? stored : DEFAULT_CLASS_RECORDS;
  const withoutLegacyMockData = source.filter(
    (record) => !LEGACY_MOCK_CLASS_IDS.has(String(record?.id || "")),
  );

  if (withoutLegacyMockData.length !== source.length) {
    localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(withoutLegacyMockData));
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
  localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(normalized));
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

function normalizeGuardianContact(contact = {}) {
  return {
    id: String(contact.id || createStorageId("guardian")),
    name: String(contact.name || "").trim(),
    relationship: String(contact.relationship || "").trim(),
    phone: String(contact.phone || "").trim(),
    email: String(contact.email || "").trim(),
  };
}

function normalizeStudentRecord(record = {}) {
  const timestamp = new Date().toISOString();
  const status = record.status === "archived" ? "archived" : "active";
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

  return {
    id: String(record.id || createStorageId("student")),
    fullName: String(record.fullName || "").trim(),
    admissionNo: String(record.admissionNo || "").trim(),
    level: String(record.level || "").trim(),
    guardians,
    status,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    archivedAt: status === "archived" ? record.archivedAt || timestamp : null,
  };
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
  const stored = parseStoredJSON(localStorage.getItem(SCHOOL_STUDENTS_STORAGE_KEY), DEFAULT_STUDENT_RECORDS);
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
  localStorage.setItem(SCHOOL_STUDENTS_STORAGE_KEY, JSON.stringify(normalized));
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
      updatedAt: new Date().toISOString(),
    };
  });

  return saveSchoolStudents(nextStudents);
}

function summarizeSchoolStudents() {
  const students = getSchoolStudents();
  const active = students.filter((record) => record.status !== "archived");
  const archived = students.filter((record) => record.status === "archived");
  const guardianContacts = active.reduce((sum, record) => sum + record.guardians.length, 0);
  const studentsWithMultipleGuardians = active.filter((record) => record.guardians.length > 1).length;

  return {
    students,
    activeCount: active.length,
    archivedCount: archived.length,
    guardianContacts,
    studentsWithMultipleGuardians,
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
  const stored = parseStoredJSON(localStorage.getItem(AUDIT_TRAIL_STORAGE_KEY), []);
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
  localStorage.setItem(AUDIT_TRAIL_STORAGE_KEY, JSON.stringify(normalized));
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
  localStorage.removeItem(AUDIT_TRAIL_STORAGE_KEY);
  const cleared = getAuditTrailEntries();
  emitAuditTrailUpdate(cleared);
  return cleared;
}

function getFeatureToggleDefaults() {
  return Object.fromEntries(features.map((feature) => [feature.id, true]));
}

function getFeatureToggleState() {
  const defaults = getFeatureToggleDefaults();
  const stored = parseStoredJSON(localStorage.getItem(FEATURE_TOGGLE_STORAGE_KEY), {});

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
  localStorage.setItem(FEATURE_TOGGLE_STORAGE_KEY, JSON.stringify(nextState));
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
  return ROLE_PERMISSION_ROLES.reduce((next, role) => {
    const legacyRoleSource =
      role === "Employee" && raw.Teacher && typeof raw.Teacher === "object" ? raw.Teacher : null;
    const source = raw[role] && typeof raw[role] === "object" ? raw[role] : legacyRoleSource || {};
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
  const stored = parseStoredJSON(localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY), {});
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
  localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(normalized));
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
  localStorage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
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
  getSettings: getSchoolSettings,
  saveSettings: saveSchoolSettings,
  resetSettings: resetSchoolSettings,
  formatAcademicYearLabel,
  hasContext: hasSchoolSettingsContext,
  eventName: SCHOOL_SETTINGS_EVENT,
};

window.SchoolSphereClasses = {
  defaults: DEFAULT_CLASS_RECORDS,
  getClasses: getSchoolClasses,
  summarize: summarizeSchoolClasses,
  saveClasses: saveSchoolClasses,
  upsertClass: upsertSchoolClass,
  archiveClass: (classId) => setSchoolClassArchived(classId, true),
  activateClass: (classId) => setSchoolClassArchived(classId, false),
  eventName: SCHOOL_CLASSES_EVENT,
};

window.SchoolSphereStudents = {
  defaults: DEFAULT_STUDENT_RECORDS,
  getStudents: getSchoolStudents,
  summarize: summarizeSchoolStudents,
  saveStudents: saveSchoolStudents,
  upsertStudent: upsertSchoolStudent,
  archiveStudent: (studentId) => setSchoolStudentArchived(studentId, true),
  activateStudent: (studentId) => setSchoolStudentArchived(studentId, false),
  eventName: SCHOOL_STUDENTS_EVENT,
};

window.SchoolSphereAuditTrail = {
  getEntries: getAuditTrailEntries,
  saveEntries: saveAuditTrailEntries,
  record: recordAuditTrailEntry,
  clear: clearAuditTrailEntries,
  eventName: AUDIT_TRAIL_EVENT,
};

window.addEventListener("storage", (event) => {
  if (event.key === FEATURE_TOGGLE_STORAGE_KEY) {
    emitFeatureToggleUpdate(getFeatureToggleState());
  }

  if (event.key === SCHOOL_SETTINGS_STORAGE_KEY) {
    emitSchoolSettingsUpdate(getSchoolSettings());
  }

  if (event.key === SCHOOL_CLASSES_STORAGE_KEY) {
    emitSchoolClassesUpdate(getSchoolClasses());
  }

  if (event.key === SCHOOL_STUDENTS_STORAGE_KEY) {
    emitSchoolStudentsUpdate(getSchoolStudents());
  }

  if (event.key === AUDIT_TRAIL_STORAGE_KEY) {
    emitAuditTrailUpdate(getAuditTrailEntries());
  }

  if (event.key === ROLE_PERMISSIONS_STORAGE_KEY) {
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
  const settings = getSchoolSettings();
  const academicYearLabel = formatAcademicYearLabel(settings);
  const schoolStructureLabel = [
    settings.hasNursery ? "Nursery" : null,
    "Primary 1-6",
    "JSS 1-3",
    "SS 1-3",
    settings.hasHigherInstitution ? "Higher Institution" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  const campusDetailLabel = settings.campusDetails || "Campus details not added yet.";
  const showContext = hasSchoolSettingsContext(settings);

  header.innerHTML = `
    <div class="site-header-shell">
      <a class="logo-link logo-link-full" href="./index.html" aria-label="${escapeHtml(settings.schoolName)} home">
        ${buildBrandMarkHtml(settings, "logo-mark")}
        <span class="logo-word">${escapeHtml(settings.schoolName)}</span>
      </a>

      <nav class="nav-center" aria-label="Primary">
        ${navMenus
          .map(
            (menu) =>
              menu.type === "menu"
                ? `
                    <details class="nav-menu">
                      <summary>${menu.label}</summary>
                      <div class="dropdown-panel">
                        ${menu.items
                          .map((item) =>
                            item.placeholder
                              ? `<span class="dropdown-placeholder">${item.label}</span>`
                              : `<a href="${item.href}" class="${hrefMatchesCurrentFile(item.href, currentFile) ? "is-active" : ""}">${item.label}</a>`,
                          )
                          .join("")}
                      </div>
                    </details>
                  `
                : menu.placeholder
                  ? `<span class="nav-direct-link nav-direct-link-muted">${menu.label}</span>`
                  : `<a class="nav-direct-link ${hrefMatchesCurrentFile(menu.href, currentFile) ? "is-active" : ""}" href="${menu.href}">${menu.label}</a>`,
          )
          .join("")}
      </nav>

      <div class="nav-auth">
        <details class="nav-menu nav-menu-signin">
          <summary>Sign In</summary>
          <div class="dropdown-panel dropdown-panel-right">
            ${signInLinks
              .map(
                (item) =>
                  `<a href="${item.href}" class="${hrefMatchesCurrentFile(item.href, currentFile) ? "is-active" : ""}">${item.label}</a>`,
              )
              .join("")}
          </div>
        </details>
        <a class="button button-primary" href="./signup.html">Get Started</a>
      </div>
    </div>
    ${
      showContext
        ? `
          <div class="site-context-shell">
            <div class="site-context-card">
              <span>Institution</span>
              <strong>${escapeHtml(settings.schoolName)}</strong>
              <small>${escapeHtml(settings.address || "School address not added yet.")}</small>
            </div>
            <div class="site-context-card">
              <span>Academic year</span>
              <strong>${escapeHtml(academicYearLabel || "Not set yet")}</strong>
              <small>${escapeHtml(schoolStructureLabel)}</small>
            </div>
            <div class="site-context-card">
              <span>Campus details</span>
              <strong>${escapeHtml(campusDetailLabel)}</strong>
              <small>${settings.logoUrl ? "Custom logo active across the site." : "Default brand mark active."}</small>
            </div>
          </div>
        `
        : ""
    }
  `;
}

function renderFooter() {
  const footer = document.getElementById("site-footer");

  if (!footer) {
    return;
  }

  const settings = getSchoolSettings();
  const academicYearLabel = formatAcademicYearLabel(settings);
  const schoolStructureLabel = [
    settings.hasNursery ? "Nursery" : null,
    "Primary 1-6",
    "JSS 1-3",
    "SS 1-3",
    settings.hasHigherInstitution ? "Higher Institution" : null,
  ]
    .filter(Boolean)
    .join(" + ");

  footer.innerHTML = `
    <div class="site-footer-shell">
      <div class="site-footer-meta focus-footer-meta">
        <a class="logo-link logo-link-full" href="./index.html" aria-label="${escapeHtml(settings.schoolName)} home">
          ${buildBrandMarkHtml(settings, "logo-mark")}
          <span class="logo-word">${escapeHtml(settings.schoolName)}</span>
        </a>
        <p>
          ${escapeHtml(settings.schoolName)} runs on one shared digital
          workspace for records, finance, academics, parent communication, and
          daily school operations.
        </p>
        <div class="site-footer-school-meta">
          <span>${escapeHtml(settings.address || "School address not added yet.")}</span>
          <span>${escapeHtml(academicYearLabel || "Academic year dates not set yet.")}</span>
          <span>${escapeHtml(settings.campusDetails || "Campus details not added yet.")}</span>
          <span>${escapeHtml(schoolStructureLabel)}</span>
        </div>
        <a class="button button-primary" href="./signup.html">Get Started</a>
      </div>

      <div class="site-footer-links focus-footer-links">
        <div>
          <h4>Learn</h4>
          <a href="./why-it-works.html">Benefits</a>
          <a href="./modules.html">Features</a>
          <a href="./workflows.html">Demo Walkthrough</a>
        </div>
        <div>
          <h4>Solutions</h4>
          <a href="./school-types.html">K-12 Schools</a>
          <a href="./school-types.html#university-mode">Higher Institutions</a>
          <a href="./products.html">Pricing and Setup</a>
        </div>
        <div>
          <h4>Support</h4>
          <span>Help Center</span>
          <span>Onboarding</span>
          <span>Affiliate</span>
        </div>
        <div>
          <h4>Contact</h4>
          <span>${escapeHtml(settings.address || "Address pending setup")}</span>
          <span>${escapeHtml(academicYearLabel || "Academic year pending setup")}</span>
          <span>[email protected]</span>
          <span>+234 805 617 6947</span>
          <a href="./in-practice.html">About the Platform</a>
          <a href="./login.html">Login</a>
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
