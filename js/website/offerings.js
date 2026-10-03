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
