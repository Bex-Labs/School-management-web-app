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
    studentEmail: String(record.studentEmail || record.email || "").trim(),
    profilePhotoUrl: String(record.profilePhotoUrl || record.photoUrl || "").trim(),
    profilePhotoName: String(record.profilePhotoName || "").trim(),
    profilePhotoMimeType: String(record.profilePhotoMimeType || "").trim(),
    profilePhotoSizeBytes: Math.max(0, Number.parseInt(record.profilePhotoSizeBytes, 10) || 0),
    profilePhotoRemoved: Boolean(record.profilePhotoRemoved),
    level: String(record.level || "").trim(),
    classId: String(record.classId || record.classRecordId || "").trim(),
    classRecordId: String(record.classRecordId || record.classId || "").trim(),
    classLevel: String(record.classLevel || record.baseLevel || "").trim(),
    baseLevel: String(record.baseLevel || record.classLevel || "").trim(),
    classArm: String(record.classArm || "").trim(),
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

function normalizeStudentLevelKey(value) {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  const juniorSecondaryMatch = token.match(/(?:juniorsecondaryschool|jss)([1-3])/);
  if (juniorSecondaryMatch) {
    return `jss${juniorSecondaryMatch[1]}`;
  }

  const seniorSecondaryMatch = token.match(/(?:seniorsecondaryschool|sss|ss)([1-3])/);
  if (seniorSecondaryMatch) {
    return `sss${seniorSecondaryMatch[1]}`;
  }

  return token;
}

function deleteSchoolStudent(studentId) {
  const normalizedStudentId = String(studentId || "").trim();

  if (!normalizedStudentId) {
    return { deletedCount: 0, students: getSchoolStudents() };
  }

  const students = getSchoolStudents();
  const nextStudents = students.filter((record) => record.id !== normalizedStudentId);

  return {
    deletedCount: students.length - nextStudents.length,
    students: saveSchoolStudents(nextStudents),
  };
}

function deleteSchoolStudentsByLevel(level) {
  const levelKey = normalizeStudentLevelKey(level);

  if (!levelKey) {
    return { deletedCount: 0, students: getSchoolStudents() };
  }

  const students = getSchoolStudents();
  const nextStudents = students.filter((record) => normalizeStudentLevelKey(record.level) !== levelKey);

  return {
    deletedCount: students.length - nextStudents.length,
    students: saveSchoolStudents(nextStudents),
  };
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
