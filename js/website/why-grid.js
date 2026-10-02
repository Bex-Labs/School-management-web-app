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
