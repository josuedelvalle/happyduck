/* ============================================================
   CLUES — one card per postcard, in room order. Each stays
   locked until its room is investigated; once found, the actual
   clue text is revealed. Together they hint at the destination.
   (the slide-out menu itself lives in shared.js — initSlideMenu)
   ============================================================ */

(function () {
  function render() {
    // Progress (same numbers as the dashboard)
    $("#found-count").textContent = State.count();
    $("#total-count").textContent = CONFIG.total;
    $("#progress-pct").textContent = State.completion();
    $("#progress-bar").style.width = State.completion() + "%";

    renderClueList();
  }

  function renderClueList() {
    const list = $("#clue-list");
    list.innerHTML = "";

    CONFIG.locations.forEach((loc) => {
      const done = State.isInvestigated(loc.id);
      const code = CONFIG.codes.find((c) => c.locationId === loc.id);

      const li = document.createElement("li");
      li.className = "clue-card" + (done ? " is-done" : " is-locked");
      li.innerHTML = done
        ? `
          <div class="clue-card__head">
            <span class="clue-card__icon">💡</span>
            <span class="clue-card__loc">${loc.name}</span>
          </div>
          <p class="clue-card__text">“${code.clue}”</p>`
        : `
          <div class="clue-card__head">
            <span class="clue-card__icon">🔒</span>
            <span class="clue-card__loc">${loc.name}</span>
          </div>
          <p class="clue-card__text clue-card__text--locked">
            Investigate this room to reveal its clue.
          </p>`;
      list.appendChild(li);
    });
  }

  /* ---- Go ---------------------------------------------------*/
  initSlideMenu(render); // slide-out menu lives in shared.js
  render();
})();
