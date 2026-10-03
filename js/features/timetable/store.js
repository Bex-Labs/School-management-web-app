const TIMETABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMETABLE_SCHOOL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMETABLE_WEEK_TYPES = ["all", "A", "B"];
const DEFAULT_TIMETABLE_SLOT_TEMPLATES = [
  { name: "Period 1", startTime: "08:00", endTime: "08:45" },
  { name: "Period 2", startTime: "08:45", endTime: "09:30" },
  { name: "Period 3", startTime: "09:30", endTime: "10:15" },
  { name: "Period 4", startTime: "10:45", endTime: "11:30" },
  { name: "Period 5", startTime: "11:30", endTime: "12:15" },
  { name: "Period 6", startTime: "12:15", endTime: "13:00" },
  { name: "Period 7", startTime: "14:00", endTime: "14:45" },
  { name: "Period 8", startTime: "14:45", endTime: "15:30" },
];
const DEFAULT_TIMETABLE_PERIODS = TIMETABLE_SCHOOL_DAYS.flatMap((day) =>
  DEFAULT_TIMETABLE_SLOT_TEMPLATES.map((slot, index) => ({
    id: `period-${day.toLowerCase()}-${index + 1}`,
    name: slot.name,
    day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    sortOrder: index + 1,
    status: "active",
  })),
);
const DEFAULT_TIMETABLE_ROOMS = [];
const DEFAULT_TIMETABLE_SUBSTITUTIONS = [];

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

function normalizeTimetableWeekType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "a" || normalized === "week-a") {
    return "A";
  }
  if (normalized === "b" || normalized === "week-b") {
    return "B";
  }
  return "all";
}

function getTimetableSlotKey(record = {}) {
  return [
    String(record.name || "").trim().toLowerCase(),
    String(record.startTime || record.start_time || "").trim(),
    String(record.endTime || record.end_time || "").trim(),
  ].join("|");
}

function normalizeTimetablePeriod(record = {}) {
  const sortOrder = Number.parseInt(record.sortOrder || record.sort_order, 10);
  const startTime = String(record.startTime || record.start_time || "").trim();
  const endTime = String(record.endTime || record.end_time || "").trim();
  const name = String(record.name || "").trim();
  const day = normalizeTimetableDay(record.day || record.dayOfWeek || record.day_of_week);
  return {
    id: String(record.id || createStorageId("period")),
    name,
    day,
    startTime,
    endTime,
    sortOrder: Number.isFinite(sortOrder) && sortOrder > 0 ? sortOrder : 1,
    status: String(record.status || "active").trim().toLowerCase() === "archived" ? "archived" : "active",
  };
}

function compareTimetablePeriods(left, right) {
  const dayComparison = TIMETABLE_DAYS.indexOf(left.day) - TIMETABLE_DAYS.indexOf(right.day);
  if (dayComparison !== 0) {
    return dayComparison;
  }

  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.startTime.localeCompare(right.startTime);
}

function getSchoolTimetablePeriods() {
  const stored = readWorkspaceState(SCHOOL_TIMETABLE_PERIODS_STORAGE_KEY, DEFAULT_TIMETABLE_PERIODS);
  const source = Array.isArray(stored) && stored.length ? stored : DEFAULT_TIMETABLE_PERIODS;
  return source
    .map((record) => normalizeTimetablePeriod(record))
    .filter((period) => period.name && period.startTime && period.endTime)
    .sort(compareTimetablePeriods);
}

function saveSchoolTimetablePeriods(periods) {
  const normalized = periods
    .map((record) => normalizeTimetablePeriod(record))
    .filter((period) => period.name && period.startTime && period.endTime)
    .sort(compareTimetablePeriods);
  writeWorkspaceState(SCHOOL_TIMETABLE_PERIODS_STORAGE_KEY, normalized);
  emitSchoolTimetableUpdate();
  return normalized;
}

function upsertSchoolTimetablePeriod(record = {}) {
  const periods = getSchoolTimetablePeriods();
  const nextPeriod = normalizeTimetablePeriod(record);
  const index = periods.findIndex((period) => period.id === nextPeriod.id);
  if (index >= 0) {
    periods[index] = {
      ...periods[index],
      ...nextPeriod,
    };
  } else {
    periods.push(nextPeriod);
  }
  return saveSchoolTimetablePeriods(periods);
}

function normalizeTimetableRoom(record = {}) {
  const capacity = Number.parseInt(record.capacity, 10);
  return {
    id: String(record.id || createStorageId("room")),
    name: String(record.name || "").trim(),
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 0,
    status: String(record.status || "active").trim().toLowerCase() === "archived" ? "archived" : "active",
  };
}

function compareTimetableRooms(left, right) {
  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }
  return left.name.localeCompare(right.name, undefined, { numeric: true });
}

function getSchoolTimetableRooms() {
  const stored = readWorkspaceState(SCHOOL_TIMETABLE_ROOMS_STORAGE_KEY, DEFAULT_TIMETABLE_ROOMS);
  const source = Array.isArray(stored) ? stored : DEFAULT_TIMETABLE_ROOMS;
  return source
    .map((record) => normalizeTimetableRoom(record))
    .filter((room) => room.name)
    .sort(compareTimetableRooms);
}

function saveSchoolTimetableRooms(rooms) {
  const normalized = rooms
    .map((record) => normalizeTimetableRoom(record))
    .filter((room) => room.name)
    .sort(compareTimetableRooms);
  writeWorkspaceState(SCHOOL_TIMETABLE_ROOMS_STORAGE_KEY, normalized);
  emitSchoolTimetableUpdate();
  return normalized;
}

function upsertSchoolTimetableRoom(record = {}) {
  const rooms = getSchoolTimetableRooms();
  const nextRoom = normalizeTimetableRoom(record);
  const index = rooms.findIndex((room) => room.id === nextRoom.id);
  if (index >= 0) {
    rooms[index] = {
      ...rooms[index],
      ...nextRoom,
    };
  } else {
    rooms.push(nextRoom);
  }
  return saveSchoolTimetableRooms(rooms);
}

function getTimetablePeriodForRecord(record = {}) {
  const periods = getSchoolTimetablePeriods();
  const periodId = String(record.periodId || record.period_id || "").trim();
  if (periodId) {
    const matched = periods.find((period) => period.id === periodId);
    if (matched) {
      return matched;
    }
  }

  const day = normalizeTimetableDay(record.day || record.dayOfWeek || record.day_of_week);
  const startTime = String(record.startTime || record.start_time || "").trim();
  const endTime = String(record.endTime || record.end_time || "").trim();
  return periods.find((period) => period.day === day && period.startTime === startTime && period.endTime === endTime) || null;
}

function createLegacyTimetablePeriodId(record = {}) {
  const day = normalizeTimetableDay(record.day || record.dayOfWeek || record.day_of_week).toLowerCase();
  const startTime = String(record.startTime || record.start_time || "").replace(/[^0-9]/g, "") || "start";
  const endTime = String(record.endTime || record.end_time || "").replace(/[^0-9]/g, "") || "end";
  return `legacy-${day}-${startTime}-${endTime}`;
}

function normalizeSchoolTimetableEntry(record = {}) {
  const timestamp = new Date().toISOString();
  const status = normalizeTimetableStatus(record.status);
  const matchedPeriod = getTimetablePeriodForRecord(record);
  const periodId = String(record.periodId || record.period_id || matchedPeriod?.id || "").trim() || createLegacyTimetablePeriodId(record);
  const day = matchedPeriod?.day || normalizeTimetableDay(record.day || record.dayOfWeek || record.day_of_week);
  const startTime = matchedPeriod?.startTime || String(record.startTime || record.start_time || "").trim();
  const endTime = matchedPeriod?.endTime || String(record.endTime || record.end_time || "").trim();
  return {
    id: String(record.id || createStorageId("timetable")),
    periodId,
    classId: String(record.classId || record.class_id || "").trim(),
    classLevel: String(record.classLevel || "").trim(),
    subjectId: String(record.subjectId || record.subject_id || "").trim(),
    teacherId: String(record.teacherId || record.teacher_id || "").trim(),
    roomId: String(record.roomId || record.room_id || "").trim(),
    sessionId: String(record.sessionId || "").trim(),
    termId: String(record.termId || "").trim(),
    day,
    startTime,
    endTime,
    subject: String(record.subject || "").trim(),
    teacher: String(record.teacher || "").trim(),
    room: String(record.room || "").trim(),
    weekType: normalizeTimetableWeekType(record.weekType || record.week_type),
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
  const timeComparison = left.startTime.localeCompare(right.startTime);
  if (timeComparison !== 0) {
    return timeComparison;
  }
  return left.weekType.localeCompare(right.weekType);
}

function getTimetableClassIdentity(record = {}) {
  return String(record.classId || record.class_id || "").trim() ||
    String(record.classLevel || "").trim().toLowerCase();
}

function getSchoolTimetableEntries() {
  const stored = readWorkspaceState(SCHOOL_TIMETABLE_STORAGE_KEY, DEFAULT_TIMETABLE_ENTRIES);
  const source = Array.isArray(stored) ? stored : DEFAULT_TIMETABLE_ENTRIES;
  return source
    .map((record) => normalizeSchoolTimetableEntry(record))
    .filter((record) => record.classLevel && record.subject && record.periodId && record.startTime && record.endTime)
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
    .filter((record) => record.classLevel && record.subject && record.periodId && record.startTime && record.endTime)
    .sort(compareSchoolTimetableEntries);
  writeWorkspaceState(SCHOOL_TIMETABLE_STORAGE_KEY, normalized);
  emitSchoolTimetableUpdate(normalized);
  return normalized;
}

function timetableWeekTypesOverlap(left, right) {
  const normalizedLeft = normalizeTimetableWeekType(left);
  const normalizedRight = normalizeTimetableWeekType(right);
  return normalizedLeft === "all" || normalizedRight === "all" || normalizedLeft === normalizedRight;
}

function valuesMatchByIdOrLabel(leftId, leftLabel, rightId, rightLabel) {
  const normalizedLeftId = String(leftId || "").trim();
  const normalizedRightId = String(rightId || "").trim();
  if (normalizedLeftId && normalizedRightId) {
    return normalizedLeftId === normalizedRightId;
  }
  return (
    String(leftLabel || "").trim().toLowerCase() &&
    String(leftLabel || "").trim().toLowerCase() === String(rightLabel || "").trim().toLowerCase()
  );
}

function checkSchoolTimetableConflicts(record = {}) {
  const target = normalizeSchoolTimetableEntry(record);
  const entries = getSchoolTimetableEntries().filter(
    (entry) =>
      entry.status !== "archived" &&
      entry.id !== target.id &&
      entry.termId === target.termId &&
      entry.periodId === target.periodId &&
      timetableWeekTypesOverlap(entry.weekType, target.weekType),
  );
  const teacherConflicts = entries.filter((entry) =>
    valuesMatchByIdOrLabel(entry.teacherId, entry.teacher, target.teacherId, target.teacher),
  );
  const roomConflicts = target.room || target.roomId
    ? entries.filter((entry) => valuesMatchByIdOrLabel(entry.roomId, entry.room, target.roomId, target.room))
    : [];
  const classConflicts = entries.filter((entry) =>
    valuesMatchByIdOrLabel(entry.classId, entry.classLevel, target.classId, target.classLevel),
  );

  return {
    teacherConflict: teacherConflicts.length > 0,
    roomConflict: roomConflicts.length > 0,
    classConflict: classConflicts.length > 0,
    teacherConflicts,
    roomConflicts,
    classConflicts,
    hasConflict: teacherConflicts.length > 0 || roomConflicts.length > 0 || classConflicts.length > 0,
  };
}

function getTeacherTimetableLoad(criteria = {}) {
  const teacherId = String(criteria.teacherId || "").trim();
  const teacher = String(criteria.teacher || "").trim();
  const termId = String(criteria.termId || "").trim();
  const weekType = normalizeTimetableWeekType(criteria.weekType || "all");
  const entries = getSchoolTimetableEntries().filter((entry) => {
    const teacherMatches = valuesMatchByIdOrLabel(entry.teacherId, entry.teacher, teacherId, teacher);
    const termMatches = !termId || entry.termId === termId;
    const weekMatches = timetableWeekTypesOverlap(entry.weekType, weekType);
    return entry.status !== "archived" && teacherMatches && termMatches && weekMatches;
  });

  return {
    count: entries.length,
    entries,
  };
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
    getTimetableClassIdentity(record),
  ].join("|");
}

function setTimetableGroupPublished(criteria = {}, published = true) {
  const entries = getSchoolTimetableEntries();
  const timestamp = new Date().toISOString();
  const classId = String(criteria.classId || "").trim();
  const classLevel = String(criteria.classLevel || "").trim().toLowerCase();
  const sessionId = String(criteria.sessionId || "").trim();
  const termId = String(criteria.termId || "").trim();

  const nextEntries = entries.map((entry) => {
    const matches =
      (classId ? String(entry.classId || "").trim() === classId : String(entry.classLevel || "").trim().toLowerCase() === classLevel) &&
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

function copyTimetableTerm(criteria = {}) {
  const sourceTermId = String(criteria.sourceTermId || "").trim();
  const targetTermId = String(criteria.targetTermId || "").trim();
  const targetSessionId = String(criteria.targetSessionId || criteria.sessionId || "").trim();
  const classId = String(criteria.classId || "").trim();
  const classLevel = String(criteria.classLevel || "").trim().toLowerCase();
  const weekType = normalizeTimetableWeekType(criteria.weekType || "all");

  if (!sourceTermId || !targetTermId || sourceTermId === targetTermId) {
    return { copied: 0, skipped: 0, conflicts: [] };
  }

  const sourceEntries = getSchoolTimetableEntries().filter((entry) => {
    const classMatches =
      (!classId && !classLevel) ||
      (classId && entry.classId === classId) ||
      (classLevel && String(entry.classLevel || "").trim().toLowerCase() === classLevel);
    return (
      entry.status !== "archived" &&
      entry.termId === sourceTermId &&
      classMatches &&
      timetableWeekTypesOverlap(entry.weekType, weekType)
    );
  });
  const nextEntries = getSchoolTimetableEntries();
  const copied = [];
  const conflicts = [];

  sourceEntries.forEach((entry) => {
    const draft = normalizeSchoolTimetableEntry({
      ...entry,
      id: createStorageId("timetable"),
      sessionId: targetSessionId || entry.sessionId,
      termId: targetTermId,
      status: "draft",
      publishedAt: null,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const conflict = checkSchoolTimetableConflicts(draft);
    if (conflict.hasConflict) {
      conflicts.push({ entry: draft, conflict });
      return;
    }
    copied.push(draft);
  });

  if (copied.length) {
    saveSchoolTimetableEntries(nextEntries.concat(copied));
  }

  return {
    copied: copied.length,
    skipped: sourceEntries.length - copied.length,
    conflicts,
  };
}

function normalizeTimetableSubstitution(record = {}) {
  const timestamp = new Date().toISOString();
  return {
    id: String(record.id || createStorageId("substitution")),
    entryId: String(record.entryId || record.entry_id || "").trim(),
    periodId: String(record.periodId || record.period_id || "").trim(),
    termId: String(record.termId || record.term_id || "").trim(),
    classLevel: String(record.classLevel || "").trim(),
    subject: String(record.subject || "").trim(),
    originalTeacherId: String(record.originalTeacherId || record.original_teacher_id || "").trim(),
    originalTeacher: String(record.originalTeacher || "").trim(),
    replacementTeacherId: String(record.replacementTeacherId || record.replacement_teacher_id || "").trim(),
    replacementTeacher: String(record.replacementTeacher || "").trim(),
    reason: String(record.reason || "").trim(),
    substitutionDate: String(record.substitutionDate || record.substitution_date || "").trim(),
    createdAt: record.createdAt || timestamp,
  };
}

function getSchoolTimetableSubstitutions() {
  const stored = readWorkspaceState(SCHOOL_TIMETABLE_SUBSTITUTIONS_STORAGE_KEY, DEFAULT_TIMETABLE_SUBSTITUTIONS);
  const source = Array.isArray(stored) ? stored : DEFAULT_TIMETABLE_SUBSTITUTIONS;
  return source
    .map((record) => normalizeTimetableSubstitution(record))
    .filter((record) => record.entryId && record.replacementTeacher)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

function saveSchoolTimetableSubstitutions(substitutions) {
  const normalized = substitutions
    .map((record) => normalizeTimetableSubstitution(record))
    .filter((record) => record.entryId && record.replacementTeacher);
  writeWorkspaceState(SCHOOL_TIMETABLE_SUBSTITUTIONS_STORAGE_KEY, normalized);
  emitSchoolTimetableUpdate();
  return normalized;
}

function logSchoolTimetableSubstitution(record = {}) {
  const substitutions = getSchoolTimetableSubstitutions();
  const nextRecord = normalizeTimetableSubstitution(record);
  substitutions.unshift(nextRecord);
  return saveSchoolTimetableSubstitutions(substitutions);
}

function summarizeSchoolTimetableEntries() {
  const entries = getSchoolTimetableEntries();
  const periods = getSchoolTimetablePeriods();
  const activePeriods = periods.filter((period) => period.status !== "archived");
  const rooms = getSchoolTimetableRooms();
  const activeRooms = rooms.filter((room) => room.status !== "archived");
  const substitutions = getSchoolTimetableSubstitutions();
  const publishedCount = entries.filter((entry) => entry.status === "published").length;
  const draftCount = entries.filter((entry) => entry.status === "draft").length;
  const archivedCount = entries.filter((entry) => entry.status === "archived").length;
  const classCount = new Set(entries.map((entry) => getTimetableClassIdentity(entry)).filter(Boolean)).size;
  const teacherCount = new Set(
    entries
      .filter((entry) => entry.status !== "archived")
      .map((entry) => entry.teacherId || entry.teacher.toLowerCase())
      .filter(Boolean),
  ).size;
  const groups = new Map();
  entries
    .filter((entry) => entry.status !== "archived")
    .forEach((entry) => {
      const key = buildTimetableGroupKey(entry);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          classId: entry.classId,
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
    periods,
    activePeriods,
    rooms,
    activeRooms,
    substitutions,
    grouped,
    publishedCount,
    draftCount,
    archivedCount,
    classCount,
    teacherCount,
  };
}
