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
