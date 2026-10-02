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
