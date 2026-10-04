(() => {
  function createController({
    document,
    window,
    HTMLElement,
    HTMLSelectElement,
    getAcademicCycleManager,
    getClassManager,
    getCourseManager,
    setStatus,
    getCurrentWorkspaceId,
    getUsers,
    normalizeRoleLabel,
    isUserDeactivated,
    normalizeWorkspaceId,
    getClassDisplayName,
    portalTimetableWeekTypesOverlap,
    getConfiguredSchoolSettings,
    getSessionLabelFromCycle,
    getTermLabelFromCycle,
    getPortalTimetableSlotRows,
    renderPortalTimetablePrintSheet,
    escapeHtml,
    clearPortalTimetableErrors,
    resetPortalTimetableForm,
    courseMatchesAcademicPeriod,
    courseAppliesToClassRecord,
    normalizeEmail,
    renderTimetableSection,
    renderTimetableSubstitutionLog,
    setPortalTimetableError,
    recordAuditEvent,
    clearFormDraftFor,
    populatePortalTimetableForm,
    showAppPrompt,
  }) {
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
      const substitutionLogTarget = document.getElementById("portal-calendar-substitution-log");
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
      let lastTimetableInlineStatus = { type: "", message: "" };
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

      const syncTimetableInlineStatus = () => {
        const inlineStatus = document.getElementById("portal-timetable-inline-status");
        if (inlineStatus) {
          setStatus(inlineStatus, lastTimetableInlineStatus.type, lastTimetableInlineStatus.message);
        }
      };

      const setTimetableStatus = (type, message) => {
        lastTimetableInlineStatus = { type, message };
        setStatus(status, type, message);
        syncTimetableInlineStatus();
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
          classId: data.classId,
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

      const findClassRecordForTimetable = (criteria = {}) => {
        const classId = String(criteria.classId || "").trim();
        const classLevel = String(criteria.classLevel || "").trim().toLowerCase();
        const classes = getActiveClasses();

        return (
          (classId ? classes.find((record) => String(record.id || "").trim() === classId) : null) ||
          classes.find((record) => getTimetableClassLabel(record).toLowerCase() === classLevel) ||
          classes.find((record) => String(record.level || "").trim().toLowerCase() === classLevel) ||
          null
        );
      };

      const openClassTimetableForEdit = (criteria = {}) => {
        const classRecord = findClassRecordForTimetable(criteria);

        if (!classRecord) {
          setStatus(status, "info", "This timetable is saved, but the class is not active. Reactivate the class before editing it.");
          return;
        }

        if (viewModeSelect) {
          viewModeSelect.value = "class";
        }
        if (sessionSelect) {
          sessionSelect.value = String(criteria.sessionId || "").trim();
        }
        applySessionTermClassOptions();
        if (termSelect) {
          termSelect.value = String(criteria.termId || "").trim();
        }
        if (weekTypeSelect) {
          weekTypeSelect.value = "all";
        }
        applySessionTermClassOptions();
        if (classSelect) {
          classSelect.value = classRecord.id;
        }

        clearPortalTimetableErrors(form);
        resetPortalTimetableForm(form, isAdmin);
        state.selectedPeriodId = "";
        state.editingEntryId = "";
        setFormVisibility(false);
        refresh();
        setStatus(
          status,
          "info",
          `Editing <strong>${escapeHtml(getTimetableClassLabel(classRecord))}</strong>. Click any lesson slot in the grid to update it.`,
        );
        window.setTimeout(() => {
          listTarget.querySelector(".portal-timetable-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      };

      const getSubjectOptions = () => {
        const selectedClass = getSelectedClass();
        const getSubjectTeacherAssignments = (subjectName = "") => {
          const normalizedSubject = String(subjectName || "").trim().toLowerCase();
          if (!selectedClass || !normalizedSubject) {
            return [];
          }
          return (selectedClass.teacherAssignments || [])
            .filter((assignment) => String(assignment.subject || "").trim().toLowerCase() === normalizedSubject)
            .map((assignment) => assignment.teacher)
            .filter(Boolean);
        };
        const courseOptions =
          courseManager && typeof courseManager.getCourses === "function"
            ? courseManager
                .getCourses()
                .filter(
                  (course) =>
                    course.status !== "archived" &&
                    courseMatchesAcademicPeriod(course) &&
                    (!selectedClass || courseAppliesToClassRecord(course, selectedClass)),
                )
                .map((course) => ({
                  id: course.id,
                  label: course.code ? `${course.code} - ${course.name}` : course.name,
                  name: course.name,
                  teacherAssignments: Array.isArray(course.teacherAssignments) ? [...course.teacherAssignments] : [],
                }))
            : [];
        const classSubjects = (selectedClass?.subjects || []).map((subject) => ({
          id: `subject:${subject}`,
          label: subject,
          name: subject,
          teacherAssignments: getSubjectTeacherAssignments(subject),
        }));
        const merged = new Map();
        courseOptions.concat(classSubjects).forEach((subject) => {
          const key = String(subject.name || subject.label || "").trim().toLowerCase();
          if (!key) {
            return;
          }
          if (!merged.has(key)) {
            merged.set(key, {
              ...subject,
              teacherAssignments: Array.isArray(subject.teacherAssignments) ? [...subject.teacherAssignments] : [],
            });
            return;
          }
          const existing = merged.get(key);
          const nextTeachers = Array.isArray(subject.teacherAssignments) ? subject.teacherAssignments : [];
          const seenTeachers = new Set(existing.teacherAssignments.map((teacher) => String(teacher || "").trim().toLowerCase()));
          nextTeachers.forEach((teacher) => {
            const teacherKey = String(teacher || "").trim().toLowerCase();
            if (teacherKey && !seenTeachers.has(teacherKey)) {
              seenTeachers.add(teacherKey);
              existing.teacherAssignments.push(teacher);
            }
          });
        });
        return Array.from(merged.values());
      };

      const resolveTeacherDirectoryValue = (value = "") => {
        const raw = String(value || "").trim();
        if (!raw) {
          return null;
        }
        const rawLower = raw.toLowerCase();
        const emailValue = normalizeEmail(raw);
        return (
          getTeacherDirectory().find(
            (teacher) =>
              String(teacher.id || "").trim().toLowerCase() === rawLower ||
              normalizeEmail(teacher.email || "") === emailValue ||
              String(teacher.name || "").trim().toLowerCase() === rawLower,
          ) || null
        );
      };

      const getTeacherPersistenceValue = (teacher = {}) =>
        String(teacher.email || teacher.name || teacher.id || "").trim();

      const getClassTeacherForTimetable = (classRecord = getSelectedClass()) =>
        classRecord ? resolveTeacherDirectoryValue(classRecord.classTeacher || "") : null;

      const syncSelectedClassTeacherControls = (options = {}) => {
        const classTeacher = getClassTeacherForTimetable();
        const teacherSelect = form.elements.teacherId;
        const shouldForce = Boolean(options.force);
        if (teacherSelect instanceof HTMLSelectElement) {
          if (classTeacher) {
            teacherSelect.value = classTeacher.id;
            teacherSelect.dataset.classTeacherAuto = "true";
          } else if (shouldForce || teacherSelect.dataset.classTeacherAuto === "true") {
            teacherSelect.value = "";
            delete teacherSelect.dataset.classTeacherAuto;
          }
        }
        if (teacherViewSelect instanceof HTMLSelectElement && options.syncTeacherView) {
          teacherViewSelect.value = classTeacher ? classTeacher.id : "";
        }
        return classTeacher;
      };

      const assignClassTeacherFromTimetable = (classRecord = null, teacherId = "", options = {}) => {
        if (!classRecord || !classManager || typeof classManager.upsertClass !== "function") {
          return false;
        }
        if (String(classRecord.classTeacher || "").trim()) {
          return false;
        }
        if (options.skipSubjectTeacher) {
          return false;
        }

        const teacher = getTeacherDirectory().find((entry) => entry.id === String(teacherId || "").trim()) || null;
        const teacherValue = getTeacherPersistenceValue(teacher);
        if (!teacherValue) {
          return false;
        }

        classManager.upsertClass({
          ...classRecord,
          classTeacher: teacherValue,
        });
        return true;
      };

      const getAssignedTeacherRecordsForSubject = () => {
        const subjectSelect = form.elements.subjectId;
        const selectedSubjectId = String(subjectSelect?.value || "").trim();
        if (!selectedSubjectId || selectedSubjectId === "__custom") {
          return [];
        }
        const selectedSubject = getSubjectOptions().find((subject) => subject.id === selectedSubjectId) || null;
        const assignedValues = Array.isArray(selectedSubject?.teacherAssignments)
          ? selectedSubject.teacherAssignments
          : [];
        const seen = new Set();
        const teachers = [];
        for (const teacherValue of assignedValues) {
          const teacher = resolveTeacherDirectoryValue(teacherValue);
          const key = String(teacher?.id || teacher?.email || teacher?.name || "").trim().toLowerCase();
          if (teacher && key && !seen.has(key)) {
            seen.add(key);
            teachers.push(teacher);
          }
        }
        return teachers;
      };

      const getAutoAssignedTeacherForSubject = () => {
        const assignedTeachers = getAssignedTeacherRecordsForSubject();
        return assignedTeachers.length === 1 ? assignedTeachers[0] : null;
      };

      const updateTimetableTeacherAssignment = () => {
        const teacherSelect = form.elements.teacherId;
        if (!(teacherSelect instanceof HTMLSelectElement)) {
          return;
        }
        const teacherField = teacherSelect.closest(".portal-field");
        const assignedSubjectTeachers = getAssignedTeacherRecordsForSubject();
        const autoTeacher = getAutoAssignedTeacherForSubject();
        if (autoTeacher) {
          teacherSelect.value = autoTeacher.id;
          teacherSelect.dataset.autoAssignedTeacher = autoTeacher.id;
          delete teacherSelect.dataset.classTeacherAuto;
          teacherSelect.disabled = true;
          if (teacherField) {
            teacherField.hidden = true;
          }
          return;
        }
        if (assignedSubjectTeachers.length > 1) {
          const assignedIds = new Set(assignedSubjectTeachers.map((teacher) => teacher.id));
          if (!assignedIds.has(teacherSelect.value)) {
            teacherSelect.value = assignedSubjectTeachers[0]?.id || "";
          }
          delete teacherSelect.dataset.classTeacherAuto;
          delete teacherSelect.dataset.autoAssignedTeacher;
          teacherSelect.disabled = !isAdmin;
          if (teacherField) {
            teacherField.hidden = false;
          }
          return;
        }
        const classTeacher = getClassTeacherForTimetable();
        if (classTeacher) {
          teacherSelect.value = classTeacher.id;
          teacherSelect.dataset.classTeacherAuto = "true";
          delete teacherSelect.dataset.autoAssignedTeacher;
          teacherSelect.disabled = true;
          if (teacherField) {
            teacherField.hidden = false;
          }
          return;
        }
        delete teacherSelect.dataset.classTeacherAuto;
        const previousAutoTeacher = String(teacherSelect.dataset.autoAssignedTeacher || "").trim();
        if (previousAutoTeacher && teacherSelect.value === previousAutoTeacher) {
          teacherSelect.value = "";
        }
        delete teacherSelect.dataset.autoAssignedTeacher;
        if (teacherSelect.value && !getTeacherDirectory().some((teacher) => teacher.id === teacherSelect.value)) {
          teacherSelect.value = "";
        }
        if (!teacherSelect.value) {
          syncSelectedClassTeacherControls();
        }
        if (teacherField) {
          teacherField.hidden = false;
        }
        teacherSelect.disabled = !isAdmin || !getTeacherDirectory().length;
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

        updateTimetableTeacherAssignment();
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
        const selectedPeriod = getSelectedPeriod();
        const subjectOptions = getSubjectOptions();
        const selectedSubjectId = String(form.elements.subjectId?.value || "").trim();
        const selectedSubject = subjectOptions.find((subject) => subject.id === selectedSubjectId) || null;
        const assignedSubjectTeachers = getAssignedTeacherRecordsForSubject();
        const selectedTeacherId = String(form.elements.teacherId?.value || "").trim();
        const manualTeacher = getTeacherDirectory().find((teacher) => teacher.id === selectedTeacherId) || null;
        const selectedSubjectTeacher =
          assignedSubjectTeachers.length === 1
            ? assignedSubjectTeachers[0]
            : assignedSubjectTeachers.find((teacher) => teacher.id === selectedTeacherId) || null;
        const selectedTeacher =
          selectedSubjectTeacher ||
          manualTeacher ||
          getClassTeacherForTimetable(selectedClass) ||
          null;
        const customSubject = String(form.elements.subject?.value || "").trim();
        return {
          id: String(form.elements.timetableEntryId?.value || "").trim() || undefined,
          sessionId: getSelectedSessionId(),
          termId: getSelectedTermId(),
          periodId: selectedPeriod?.id || "",
          day: selectedPeriod?.day || "",
          startTime: selectedPeriod?.startTime || "",
          endTime: selectedPeriod?.endTime || "",
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
        updateTimetableTeacherAssignment();
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
        renderTimetableSubstitutionLog(manager, substitutionLogTarget);
        syncTimetableInlineStatus();
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
        updateTimetableTeacherAssignment();
        updateRealtimeConflictStatus();
      });

      [sessionSelect, termSelect, viewModeSelect, classSelect, teacherViewSelect, weekTypeSelect].forEach((control) => {
        control?.addEventListener("change", () => {
          if (control === sessionSelect) {
            state.selectedPeriodId = "";
          }
          applySessionTermClassOptions();
          if (control === classSelect) {
            syncSelectedClassTeacherControls({ force: true, syncTeacherView: true });
          }
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
        const selectedClassForTeacherSync = getSelectedClass();
        const hasSubjectTeacherAssignment = getAssignedTeacherRecordsForSubject().length > 0;
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
        const classTeacherUpdated = assignClassTeacherFromTimetable(selectedClassForTeacherSync, payload.teacherId, {
          skipSubjectTeacher: hasSubjectTeacherAssignment,
        });
        const teacher = getTeacherDirectory().find((entry) => entry.id === payload.teacherId);
        const load = manager.getTeacherLoad(payload);
        const workloadCopy =
          teacher && load.count > teacher.maxPeriodsPerWeek
            ? ` Workload warning: ${teacher.name} now has ${load.count}/${teacher.maxPeriodsPerWeek} periods.`
            : "";
        const classTeacherCopy = classTeacherUpdated ? " Class teacher updated." : "";
        recordAuditEvent({
          action: existing ? "updated" : "created",
          entityType: "timetable",
          entityId: payload.classLevel,
          summary: `${existing ? "Updated" : "Created"} timetable lesson for ${payload.classLevel}`,
          details: `${payload.periodId} • ${payload.subject}`,
        });
        setTimetableStatus(
          "success",
          `Lesson for <strong>${escapeHtml(payload.classLevel)}</strong> saved.${classTeacherCopy}${escapeHtml(workloadCopy)}`,
        );
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

      const handleCopyPreviousTimetablePeriod = () => {
        const cycles = getCycleState();
        const termId = getSelectedTermId();
        const selectedTerm = (cycles.terms || []).find((term) => term.id === termId);
        const sameSessionTerms = (cycles.terms || [])
          .filter((term) => term.sessionId === selectedTerm?.sessionId)
          .sort((left, right) => String(left.startDate || left.createdAt || left.name).localeCompare(String(right.startDate || right.createdAt || right.name)));
        const currentIndex = sameSessionTerms.findIndex((term) => term.id === termId);
        const sourceTerm = sameSessionTerms[currentIndex - 1] || null;
        if (!sourceTerm) {
          setTimetableStatus("info", "No previous term or semester found in this session to copy from.");
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
      };

      const handleAddTimetablePeriod = () => {
        const existingPeriods = manager.getPeriods();
        const nextOrder =
          Math.max(0, ...existingPeriods.map((period) => Number.parseInt(period.sortOrder, 10) || 0)) + 1;
        openTimetablePeriodForm({
          name: `Period ${nextOrder}`,
          sortOrder: nextOrder,
        });
      };

      const handleSaveClassTimetable = () => {
        const selectedClass = getSelectedClass();
        const sessionId = getSelectedSessionId();
        const termId = getSelectedTermId();
        if (!selectedClass || !sessionId || !termId) {
          setTimetableStatus("info", "Select a session, term, and class before saving the timetable.");
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
          setTimetableStatus("info", "Add at least one lesson to this class grid before saving it.");
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
      };

      const handlePrintSelectedClassTimetable = () => {
        const selectedClass = getSelectedClass();
        if (!selectedClass) {
          setTimetableStatus("info", "Select a class or use Print beside a saved class timetable.");
          return;
        }
        printClassTimetable({
          sessionId: getSelectedSessionId(),
          termId: getSelectedTermId(),
          classId: selectedClass.id,
          classLevel: getTimetableClassLabel(selectedClass),
          weekType: getSelectedWeekType(),
        });
      };

      listTarget.addEventListener("click", async (event) => {
        const inlineActionButton = event.target.closest("[data-timetable-inline-action]");
        const periodEditButton = event.target.closest("[data-timetable-period-edit]");
        const slotButton = event.target.closest("[data-timetable-slot]");
        const rowActionButton = event.target.closest("[data-timetable-action]");
        const classActionButton = event.target.closest("[data-timetable-class-action]");
        const groupActionButton = event.target.closest("[data-timetable-group-action]");

        if (!isAdmin) {
          return;
        }

        if (inlineActionButton) {
          const action = String(inlineActionButton.dataset.timetableInlineAction || "").trim();
          if (action === "copy") {
            handleCopyPreviousTimetablePeriod();
          } else if (action === "period") {
            handleAddTimetablePeriod();
          } else if (action === "save") {
            handleSaveClassTimetable();
          } else if (action === "print") {
            handlePrintSelectedClassTimetable();
          }
          return;
        }

        if (classActionButton) {
          const action = String(classActionButton.dataset.timetableClassAction || "").trim();
          const criteria = {
            sessionId: String(classActionButton.dataset.timetableSessionId || "").trim(),
            termId: String(classActionButton.dataset.timetableTermId || "").trim(),
            classId: String(classActionButton.dataset.timetableClassId || "").trim(),
            classLevel: String(classActionButton.dataset.timetableClass || "").trim(),
            weekType: String(classActionButton.dataset.timetableWeekType || getSelectedWeekType()).trim() || "all",
          };
          if (action === "view") {
            renderClassTimetableModal(criteria);
          } else if (action === "edit") {
            openClassTimetableForEdit(criteria);
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
          updateTimetableTeacherAssignment();
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
            updateTimetableTeacherAssignment();
            setFormVisibility(true);
            if (deleteButton) deleteButton.hidden = false;
            setStatus(status, "info", `Editing lesson for <strong>${escapeHtml(row.classLevel)}</strong>.`);
            return;
          }

          if (action === "substitute") {
            const teachers = getTeacherDirectory();
            const replacementName = await showAppPrompt({
              title: "Log substitution",
              message: `Who will cover ${row.subject || "this lesson"}?`,
              inputLabel: "Replacement teacher",
              placeholder: "Teacher name or email",
              confirmLabel: "Continue",
              required: true,
              variant: "primary",
            });
            if (!replacementName) return;
            const reason = await showAppPrompt({
              title: "Substitution reason",
              message: "Add a short reason for the substitution.",
              inputLabel: "Reason",
              defaultValue: "Cover lesson",
              placeholder: "Cover lesson",
              confirmLabel: "Log substitution",
              variant: "primary",
            });
            if (reason === null) return;
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
        copyTermButton.addEventListener("click", handleCopyPreviousTimetablePeriod);
      }

      if (addPeriodButton) {
        addPeriodButton.disabled = !isAdmin || !manager;
        addPeriodButton.addEventListener("click", handleAddTimetablePeriod);
      }

      if (saveClassButton) {
        saveClassButton.disabled = !isAdmin || !manager;
        saveClassButton.addEventListener("click", handleSaveClassTimetable);
      }

      if (printButton) {
        printButton.addEventListener("click", handlePrintSelectedClassTimetable);
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

    return { initTimetableControls };
  }

  window.SchoolSphereTimetableUI = { createController };
})();
