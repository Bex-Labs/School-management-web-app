(() => {
  function createController({
    document,
    window,
    HTMLSelectElement,
    Event,
    getClassManager,
    getAcademicCycleManager,
    getConfiguredHigherInstitutionDepartmentMap,
    renderConfiguredSchoolTypeSelect,
    escapeHtml,
    normalizeWorkspaceId,
    getCurrentWorkspaceId,
    getUsers,
    normalizeRoleLabel,
    DEFAULT_AUTH_ROLE,
    isUserDeactivated,
    buildDisplayName,
    getSelectSelectedValues,
    getTeacherDisplayNameForValue,
    inferSchoolTypeFromLevel,
    isConfiguredHigherInstitutionLevel,
    normalizeLevelToken,
    getClassDisplayName,
    getHigherInstitutionUnitLabel,
    getConfiguredHigherInstitutionType,
    formatTeacherAssignmentNames,
    getSessionLabelFromCycle,
    getTermLabelFromCycle,
    clearPortalCourseErrors,
    resetPortalCourseForm,
    setStatus,
    renderPortalCourseManagementSection,
    setPortalCourseError,
    courseAppliesToClassRecord,
    courseEditableByRegistrar,
    recordAuditEvent,
    clearFormDraftFor,
    populatePortalCourseForm,
    showAppConfirm,
    STORAGE_KEYS,
    getSchoolSettingsManager,
  }) {
    function initCourseManagementControls({
      isAdmin,
      canManageAllCourses = isAdmin,
      managedClassRecords = [],
      currentUser = null,
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
      const classArmSelect = form.elements.classId;
      const sessionSelect = form.elements.sessionId;
      const termSelect = form.elements.termId;
      const categoryField = form.elements.category;
      const creditField = form.elements.creditUnit;
      const codeFieldWrap = document.querySelector("[data-course-code-field]");
      const levelFieldWrap = document.querySelector("[data-course-level-field]");
      const classArmFieldWrap = document.querySelector("[data-course-arm-field]");
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
      const cycleManager = getAcademicCycleManager();
      const allClassArmsValue = "__all_class_arms__";
      const scopedManagedClassRecords = Array.isArray(managedClassRecords) ? managedClassRecords : [];
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

      const getCycleState = () =>
        cycleManager && typeof cycleManager.getState === "function"
          ? cycleManager.getState()
          : { sessions: [], terms: [] };

      const getCourseOpenPeriod = () => {
        const cycleState = getCycleState();
        const openTerm = (cycleState.terms || []).find((term) => term.status === "open") || null;
        const openSession = openTerm
          ? (cycleState.sessions || []).find((session) => session.id === openTerm.sessionId) || null
          : (cycleState.sessions || []).find((session) => session.status === "open") || null;
        return { cycleState, openSession, openTerm };
      };

      const renderCourseSessionOptions = (selectedSessionId = "") => {
        if (!(sessionSelect instanceof HTMLSelectElement)) {
          return;
        }

        const { cycleState, openSession, openTerm } = getCourseOpenPeriod();
        const sessions = cycleState.sessions || [];
        const selected = String(selectedSessionId || sessionSelect.value || openTerm?.sessionId || openSession?.id || "").trim();
        sessionSelect.innerHTML = sessions.length
          ? `<option value="">Select session</option>${sessions
              .map(
                (session) => `
                <option value="${escapeHtml(session.id)}" ${session.id === selected ? "selected" : ""}>
                  ${escapeHtml(session.name || "Academic session")}
                </option>
              `,
              )
              .join("")}`
          : `<option value="">Create a session in Settings first</option>`;
        sessionSelect.value = sessions.some((session) => session.id === selected) ? selected : "";
      };

      const renderCourseTermOptions = (selectedTermId = "") => {
        if (!(termSelect instanceof HTMLSelectElement)) {
          return;
        }

        const { cycleState, openTerm } = getCourseOpenPeriod();
        const selectedSessionId = String(sessionSelect?.value || openTerm?.sessionId || "").trim();
        const terms = (cycleState.terms || []).filter((term) => !selectedSessionId || term.sessionId === selectedSessionId);
        const selected = String(selectedTermId || termSelect.value || (openTerm?.sessionId === selectedSessionId ? openTerm.id : "") || "").trim();
        termSelect.innerHTML = terms.length
          ? `<option value="">Select term / semester</option>${terms
              .map(
                (term) => `
                <option value="${escapeHtml(term.id)}" ${term.id === selected ? "selected" : ""}>
                  ${escapeHtml(term.periodType === "semester" ? `Semester: ${term.name}` : `Term: ${term.name}`)}
                </option>
              `,
              )
              .join("")}`
          : `<option value="">Create terms or semesters in Settings first</option>`;
        termSelect.value = terms.some((term) => term.id === selected) ? selected : "";
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
              label: user.displayName || buildDisplayName(email) || "Teacher",
            };
          })
          .filter((item) => item.value)
          .sort((left, right) => left.label.localeCompare(right.label));
      };

      const getSelectedCourseTeacherValues = () => getSelectSelectedValues(teacherSelect);

      const renderTeacherOptions = (selected = []) => {
        if (!(teacherSelect instanceof HTMLSelectElement)) {
          return;
        }

        const selectedValues = (Array.isArray(selected) ? selected : [selected])
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        const selectedSet = new Set(selectedValues);
        const teachers = getTeacherDirectory();
        const teacherValues = new Set(teachers.map((teacher) => teacher.value));
        const missingSelected = selectedValues.filter((value) => value && !teacherValues.has(value));
        teacherSelect.size = Math.min(6, Math.max(3, teachers.length || missingSelected.length || 1));
        teacherSelect.innerHTML = teachers.length || missingSelected.length
          ? `
        ${teachers
            .map(
              (teacher) => `
              <option value="${escapeHtml(teacher.value)}" ${selectedSet.has(teacher.value) ? "selected" : ""}>
                ${escapeHtml(teacher.label)}
              </option>
            `,
            )
            .join("")}
        ${missingSelected
            .map(
              (value) => `<option value="${escapeHtml(value)}" selected>${escapeHtml(
                getTeacherDisplayNameForValue(value),
              )}</option>`,
            )
            .join("")}
      `
          : `<option value="" disabled>Create teacher first</option>`;
      };

      if (teacherSelect instanceof HTMLSelectElement) {
        teacherSelect.addEventListener("mousedown", (event) => {
          const option = event.target.closest("option");
          if (!option || option.disabled) {
            return;
          }
          event.preventDefault();
          option.selected = !option.selected;
          teacherSelect.focus();
          teacherSelect.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }

      const getClassLevelOptions = () => {
        if (!classManager || typeof classManager.getClasses !== "function") {
          return [];
        }

        const sourceRecords = canManageAllCourses
          ? classManager.getClasses().filter((record) => record.status !== "archived")
          : scopedManagedClassRecords;

        return Array.from(
          new Set(
            sourceRecords
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

      const getClassArmOptionsForLevel = (level = "") => {
        if (!classManager || typeof classManager.getClasses !== "function") {
          return [];
        }

        const levelToken = normalizeLevelToken(level);
        if (!levelToken) {
          return [];
        }

        const sourceRecords = canManageAllCourses
          ? classManager.getClasses().filter((record) => record.status !== "archived")
          : scopedManagedClassRecords;

        return sourceRecords
          .filter(
            (record) =>
              normalizeLevelToken(record.level) === levelToken ||
              normalizeLevelToken(getClassDisplayName(record)) === levelToken,
          )
          .sort((left, right) => getClassDisplayName(left).localeCompare(getClassDisplayName(right), undefined, { numeric: true }));
      };

      const getSelectedCourseClassRecord = () => {
        const classId = String(classArmSelect?.value || "").trim();
        if (classId === allClassArmsValue) {
          return null;
        }
        const options = getClassArmOptionsForLevel(String(levelSelect?.value || "").trim());
        return options.find((record) => String(record.id || "").trim() === classId) || null;
      };

      const isAllClassArmsSelected = () => String(classArmSelect?.value || "").trim() === allClassArmsValue;

      const renderCourseArmOptions = (selectedClassId = "") => {
        if (!(classArmSelect instanceof HTMLSelectElement)) {
          return [];
        }

        const options = getClassArmOptionsForLevel(String(levelSelect?.value || "").trim());
        const selected = String(selectedClassId || classArmSelect.value || "").trim();
        const hasSelected = options.some((record) => String(record.id || "").trim() === selected);
        classArmSelect.innerHTML = options.length
          ? `<option value="">${canManageAllCourses ? "Choose all arms or one arm" : "Choose your assigned arm"}</option>
            ${
                canManageAllCourses
                  ? `<option value="${allClassArmsValue}" ${selected === allClassArmsValue ? "selected" : ""}>All arms for this class</option>`
                  : ""
              }
            ${options
              .map((record) => {
                const id = String(record.id || "").trim();
                return `<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(getClassDisplayName(record))}</option>`;
              })
              .join("")}`
          : `<option value="">No class arms found</option>`;
        classArmSelect.value = hasSelected || (canManageAllCourses && selected === allClassArmsValue) ? selected : "";
        classArmSelect.disabled = !isAdmin || !options.length;
        if (classArmFieldWrap) {
          classArmFieldWrap.hidden = !String(levelSelect?.value || "").trim() || !options.length;
        }
        return options;
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
        const classArmOptions = getClassArmOptionsForLevel(selectedLevel);
        const armSelectionReady = !classArmOptions.length || Boolean(String(classArmSelect?.value || "").trim());
        const usesSubjectPicker =
          Boolean(selectedLevel) &&
          armSelectionReady &&
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
        const classArmOptions = getClassArmOptionsForLevel(selectedLevel);
        const selectedClassArm = String(classArmSelect?.value || "").trim();
        const hasClassArmOptions = Boolean(classArmOptions.length);
        const armSelectionReady = !hasClassArmOptions || Boolean(selectedClassArm);
        const canChooseLevel =
          type === "nursery" ||
          type === "primary" ||
          (type === "secondary" && Boolean(String(categoryField?.value || "").trim())) ||
          (type === "higher" &&
            Boolean(String(facultySelect?.value || "").trim()) &&
            Boolean(getResolvedDepartment()));
        const showFinalDetails = Boolean(selectedSubject && selectedLevel && armSelectionReady);

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
        if (classArmFieldWrap) {
          classArmFieldWrap.hidden = !selectedLevel || !hasClassArmOptions;
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
        const selectedClassRecord = getSelectedCourseClassRecord();
        const selectedClassArmLabel = isAllClassArmsSelected()
          ? "All arms for this class"
          : selectedClassRecord
            ? getClassDisplayName(selectedClassRecord)
            : "";
        const { cycleState } = getCourseOpenPeriod();
        const selectedSessionId = String(sessionSelect?.value || "").trim();
        const selectedTermId = String(termSelect?.value || "").trim();
        const selectedTeacherValues = getSelectedCourseTeacherValues();
        const selectedTeacherLabel = formatTeacherAssignmentNames(selectedTeacherValues);
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
          { label: "Academic session", value: selectedSessionId ? getSessionLabelFromCycle(cycleState, selectedSessionId) : "" },
          { label: "Term / semester", value: selectedTermId ? getTermLabelFromCycle(cycleState, selectedTermId) : "" },
          { label: "Type", value: template.label === "Courses" ? "Higher Institution" : selectedTypeLabel },
          { label: type === "higher" ? `${getHigherInstitutionUnitLabel(getConfiguredHigherInstitutionType())} / department` : "Stream", value: selectedCategory },
          { label: "Class / level", value: selectedLevel },
          { label: "Arm selection", value: selectedClassArmLabel },
          { label: type === "higher" ? "Course" : "Subject", value: selectedSubject },
          { label: "Teachers", value: selectedTeacherLabel },
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
        renderCourseSessionOptions("");
        renderCourseTermOptions("");
        renderClassLevelOptions([]);
        renderCourseArmOptions("");
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
          canManageAllCourses,
          managedClassRecords: scopedManagedClassRecords,
          manager,
          summaryTarget,
          form,
          status,
          listTarget,
        });
        renderTeacherOptions(getSelectedCourseTeacherValues());
        renderCourseSessionOptions(sessionSelect?.value || "");
        renderCourseTermOptions(termSelect?.value || "");
        renderClassLevelOptions(Array.from(levelSelect?.selectedOptions || []).map((option) => option.value));
        renderCourseArmOptions(classArmSelect?.value || "");
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

      if (sessionSelect) {
        sessionSelect.addEventListener("change", () => {
          renderCourseTermOptions("");
          updateCourseTerminology();
          renderSubjectLibrary();
        });
      }

      if (termSelect) {
        termSelect.addEventListener("change", () => {
          updateCourseTerminology();
          renderSubjectLibrary();
        });
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
          renderCourseArmOptions("");
          updateCourseTerminology();
          renderSubjectLibrary();
        });
      }

      if (levelSelect) {
        levelSelect.addEventListener("change", () => {
          if (form.elements.name) {
            form.elements.name.value = "";
          }
          if (customSubjectField) {
            customSubjectField.value = "";
          }
          renderCourseArmOptions("");
          renderSubjectPickerOptions("");
          updateCourseTerminology();
          renderSubjectLibrary();
        });
      }

      if (classArmSelect) {
        classArmSelect.addEventListener("change", () => {
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
        const selectedClassRecord = getSelectedCourseClassRecord();
        const selectedArmValue = String(classArmSelect?.value || "").trim();
        const classArmOptions = getClassArmOptionsForLevel(selectedLevels[0] || "");
        const isAllArmsCourse = canManageAllCourses && selectedArmValue === allClassArmsValue;
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
          sessionId: String(form.elements.sessionId?.value || "").trim(),
          sessionName: "",
          termId: String(form.elements.termId?.value || "").trim(),
          termName: "",
          category: isHigherCourse
            ? [faculty, department].filter(Boolean).join(" / ")
            : selectedType === "secondary"
              ? String(form.elements.category?.value || "").trim()
              : "",
          creditUnit: String(form.elements.creditUnit?.value || "").trim(),
          description: form.elements.description.value.trim(),
          level: selectedLevels[0] || "",
          classScope: isAllArmsCourse ? "all-arms" : "",
          classId: isAllArmsCourse ? "" : selectedClassRecord?.id || "",
          classRecordId: isAllArmsCourse ? "" : selectedClassRecord?.id || "",
          classLabel: isAllArmsCourse ? `${selectedLevels[0] || "Class"} - All arms` : selectedClassRecord ? getClassDisplayName(selectedClassRecord) : "",
          classArm: isAllArmsCourse ? "All arms" : selectedClassRecord?.name || "",
          teacherAssignments: getSelectedCourseTeacherValues(),
          studentAssignments: [],
        };
        const cycleState = getCycleState();
        payload.sessionName = payload.sessionId ? getSessionLabelFromCycle(cycleState, payload.sessionId) : "";
        payload.termName = payload.termId ? getTermLabelFromCycle(cycleState, payload.termId) : "";

        let hasError = false;

        if (!payload.name) {
          setPortalCourseError(form, "name", "Enter the course name.");
          hasError = true;
        }

        if (!payload.sessionId) {
          setPortalCourseError(form, "sessionId", "Select the academic session for this subject/course.");
          hasError = true;
        }

        if (!payload.termId) {
          setPortalCourseError(form, "termId", "Select the term or semester for this subject/course.");
          hasError = true;
        }

        if (!payload.level) {
          setPortalCourseError(form, "level", "Select at least one class or level.");
          hasError = true;
        }

        if (classArmOptions.length && !selectedArmValue) {
          setPortalCourseError(form, "classId", "Choose all arms or one class arm for this subject/course.");
          hasError = true;
        }

        if (selectedArmValue === allClassArmsValue && !canManageAllCourses) {
          setPortalCourseError(form, "classId", "Class teachers can register courses only for their assigned class arm.");
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
          (() => {
            const recordClassId = String(record.classId || record.classRecordId || "").trim();
            const recordScope = String(record.classScope || "").trim().toLowerCase();
            const sameTarget = isAllArmsCourse
              ? normalizeLevelToken(record.level) === normalizeLevelToken(payload.level)
              : payload.classId
                ? selectedClassRecord
                  ? courseAppliesToClassRecord(record, selectedClassRecord)
                  : recordClassId === payload.classId
                : !recordClassId && recordScope !== "all-arms";
            return (
              record.id !== courseId &&
              String(record.sessionId || "").trim() === payload.sessionId &&
              String(record.termId || "").trim() === payload.termId &&
              normalizeLevelToken(record.level) === normalizeLevelToken(payload.level) &&
              sameTarget &&
              ((payload.code && String(record.code || "").toLowerCase() === payload.code.toLowerCase()) ||
                String(record.name || "").toLowerCase() === payload.name.toLowerCase())
            );
          })(),
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
        if (currentRecord && !courseEditableByRegistrar(currentRecord, canManageAllCourses, scopedManagedClassRecords)) {
          setStatus(status, "error", "You can update only subjects/courses for class arms where you are the class teacher.");
          return;
        }
        const targetSummary = isAllArmsCourse ? "all arms" : payload.classLabel || "class / level";
        manager.upsertCourse({
          ...(currentRecord || null),
          ...payload,
          id: currentRecord ? currentRecord.id : payload.id,
          status: currentRecord ? currentRecord.status : "active",
        });
        recordAuditEvent({
          action: currentRecord ? "updated" : "created",
          entityType: "course",
          entityId: payload.code || payload.name,
          summary: currentRecord
            ? `Updated course ${payload.code} · ${payload.name}`
            : `Created course ${payload.code || "New"} · ${payload.name}`,
          details: `${payload.sessionName} • ${payload.termName} • ${payload.level} • ${targetSummary} • ${payload.teacherAssignments.length} teacher assignment${
            payload.teacherAssignments.length === 1 ? "" : "s"
          }`,
        });

        resetCourseWizardState();
        clearFormDraftFor(form);
        setStatus(
          status,
          "success",
          currentRecord
            ? `Course <strong>${escapeHtml(payload.code || "New")} · ${escapeHtml(
                payload.name,
              )}</strong> updated for ${escapeHtml(payload.termName || "the selected period")}.`
            : `Course <strong>${escapeHtml(payload.code || "New")} · ${escapeHtml(
                payload.name,
              )}</strong> created for ${escapeHtml(payload.termName || "the selected period")} and assigned to ${targetSummary}.`,
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

      listTarget.addEventListener("click", async (event) => {
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

        const canManageRecord = courseEditableByRegistrar(record, canManageAllCourses, scopedManagedClassRecords);
        if (!canManageRecord) {
          setStatus(status, "error", "You can manage only subjects/courses for class arms where you are the class teacher.");
          return;
        }

        clearPortalCourseErrors(form);

        if (action === "edit") {
          const courseArmValue =
            String(record.classScope || "").trim().toLowerCase() === "all-arms"
              ? allClassArmsValue
              : record.classId || record.classRecordId || "";
          if (templateType) {
            templateType.value = getLevelSchoolType(record.level);
          }
          renderTemplateCategories();
          renderClassLevelOptions([record.level || ""]);
          renderCourseSessionOptions(record.sessionId || "");
          renderCourseTermOptions(record.termId || "");
          renderCourseArmOptions(courseArmValue);
          updateCourseTerminology();
          const [faculty = "", department = ""] = String(record.category || "")
            .split("/")
            .map((item) => item.trim());
          renderFacultyOptions(faculty);
          renderDepartmentOptions(department);
          populatePortalCourseForm(form, record, isAdmin);
          renderCourseArmOptions(courseArmValue);
          renderSubjectPickerOptions(record.name || "");
          renderTeacherOptions(record.teacherAssignments || []);
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
          const confirmed = await showAppConfirm({
            title: "Delete subject/course?",
            message: `Delete ${record.code || record.name} from ${record.level || "this level"}?`,
            details: "This permanently removes it from the subject/course list.",
            confirmLabel: "Delete",
            variant: "danger",
          });

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
      window.addEventListener(STORAGE_KEYS.users, () => renderTeacherOptions(getSelectedCourseTeacherValues()));
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
      if (cycleManager?.eventName) {
        window.addEventListener(cycleManager.eventName, () => {
          renderCourseSessionOptions(sessionSelect?.value || "");
          renderCourseTermOptions(termSelect?.value || "");
          renderPortalCourseManagementSection({
            isAdmin,
            canManageAllCourses,
            managedClassRecords: scopedManagedClassRecords,
            manager,
            summaryTarget,
            form,
            status,
            listTarget,
          });
          updateCourseTerminology();
          renderSubjectLibrary();
        });
      }
    }

    return { initCourseManagementControls };
  }

  window.SchoolSphereCoursesUI = { createController };
})();
