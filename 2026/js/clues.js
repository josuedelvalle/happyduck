/* ============================================================
   CLUES — the postcards, grouped by case.
   ------------------------------------------------------------
   Each card stays locked until its room is investigated; once
   found, the clue text is revealed. Read together, a case's
   three clues should be enough to name it without finding them
   all — which is the whole point of the guess box.
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

    CONFIG.cases.forEach((theCase) => {
      const revealed = State.isCaseRevealed(theCase.id);

      // Section heading for the case
      const head = document.createElement("li");
      head.className = "clue-group";
      head.innerHTML = `
        <span class="eyebrow">${theCase.label} · ${theCase.codename}</span>
        <span class="clue-group__state">
          ${
            revealed
              ? "✓ " + theCase.word
              : State.countForCase(theCase.id) +
                "/" +
                State.totalForCase(theCase.id)
          }
        </span>`;
      list.appendChild(head);

      // Its postcards, in room order
      CONFIG.locations
        .map((loc) => ({
          loc,
          code: CONFIG.codes.find(
            (c) => c.locationId === loc.id && c.caseId === theCase.id,
          ),
        }))
        .filter((entry) => entry.code)
        .forEach(({ loc, code }) => {
          const done = State.isInvestigated(loc.id);

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
    });
  }

  /* ---- Go ---------------------------------------------------*/
  initSlideMenu(render); // slide-out menu lives in shared.js
  initTheme(); // dark mode toggle lives in shared.js
  render();
})();
