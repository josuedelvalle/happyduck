/* ============================================================
   DASHBOARD — the main screen logic.
   ------------------------------------------------------------
   - Renders overall progress, the two case files and the room grid
   - Each case file shows its codeword filling in letter by letter,
     and lets you unlock it early by naming it
   - Opens a room modal and verifies postcard codes
   (the slide-out menu itself lives in shared.js — initSlideMenu)
   ============================================================ */

(function () {
  /* ---- Render the whole screen from current state ---------- */
  function render() {
    // Overall progress
    $("#found-count").textContent = State.count();
    $("#total-count").textContent = CONFIG.total;
    $("#progress-pct").textContent = State.completion();
    $("#progress-bar").style.width = State.completion() + "%";

    renderCases();
    renderGrid();
  }

  /* ---- Case files ------------------------------------------ */

  /**
   * The bottom half of a case card. Three states:
   *   all postcards found  → the file opens
   *   named but not found  → credit, and keep hunting
   *   neither              → the guess box
   */
  function caseFooter(theCase, { revealed, guessed, found, total, left }) {
    if (revealed) {
      const credit =
        guessed && State.guessedAt(theCase.id) !== null
          ? ` — you called it with ${State.guessedAt(theCase.id)} of ${total} clues`
          : "";
      return `
        <p class="case__solved">
          <span aria-hidden="true">✓</span> Solved${credit}
        </p>
        <a href="final.html" class="btn btn--ghost btn--block case__cta">
          Open the file →
        </a>`;
    }

    if (guessed) {
      return `
        <p class="case__called">
          <span aria-hidden="true">✓</span> You called it.
          ${left} postcard${left === 1 ? "" : "s"} still out there.
        </p>`;
    }

    return `
      <label class="field-label" for="guess-${theCase.id}">
        Name this case
      </label>
      <div class="case__guess">
        <div class="input-wrap">
          <span class="input-wrap__icon" aria-hidden="true">?</span>
          <input
            id="guess-${theCase.id}"
            class="input"
            autocomplete="off"
            placeholder="What is it?"
          />
        </div>
        <button class="btn btn--primary" data-guess="${theCase.id}">
          Guess
        </button>
      </div>
      <div class="feedback" id="guess-feedback-${theCase.id}" hidden></div>`;
  }

  function renderCases() {
    const wrap = $("#cases");
    wrap.innerHTML = "";

    CONFIG.cases.forEach((theCase) => {
      const revealed = State.isCaseRevealed(theCase.id);
      const guessed = State.isCaseGuessed(theCase.id);
      const found = State.countForCase(theCase.id);
      const total = State.totalForCase(theCase.id);
      const left = total - found;

      const section = document.createElement("section");
      section.className =
        "case" + (revealed ? " is-solved" : guessed ? " is-called" : "");

      // One <span> per letter, so the gaps stay visually separate
      // (a run of "_" in a mono font can otherwise read as a rule).
      const slots = Array.from(State.wordFor(theCase.id), (ch) => {
        const filled = ch !== "_";
        return `<span class="slot${filled ? " is-filled" : ""}">${
          filled ? ch : "&nbsp;"
        }</span>`;
      }).join("");

      section.innerHTML = `
        <div class="row-between">
          <span class="eyebrow">${theCase.label} · ${theCase.codename}</span>
          <span class="case__count">${found}/${total}</span>
        </div>

        <div class="case__word" aria-label="Codeword">${slots}</div>

        ${caseFooter(theCase, { revealed, guessed, found, total, left })}`;

      wrap.appendChild(section);
    });

    // Wire up whichever guess boxes are still on screen
    $$("[data-guess]").forEach((button) => {
      const id = button.getAttribute("data-guess");
      const input = $("#guess-" + id);
      button.addEventListener("click", () => submitGuess(id));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitGuess(id);
      });
    });
  }

  function submitGuess(caseId) {
    const input = $("#guess-" + caseId);
    const value = input.value.trim();
    if (!value) return;

    const result = State.guess(caseId, value);
    if (result.ok) {
      render(); // the card flips to its solved state
      return;
    }

    const box = $("#guess-feedback-" + caseId);
    box.hidden = false;
    box.classList.remove("is-ok");
    box.classList.add("is-bad");
    box.textContent = "Not it. The duck says keep looking.";
    input.select();
  }

  /* ---- Build the room cards -------------------------------- */
  function renderGrid() {
    const grid = $("#grid");
    grid.innerHTML = "";

    CONFIG.locations.forEach((loc) => {
      const done = State.isInvestigated(loc.id);
      // Single-quoted url() — this gets embedded inside a double-quoted
      // style="..." HTML attribute below, so double quotes would break it.
      const photo = `center / cover no-repeat url('${loc.photo}')`;

      const button = document.createElement("button");
      button.className = "room";
      button.innerHTML = `
        <div class="room__img" style="background:${photo}">
          ${done ? '<span class="room__check">✓</span>' : ""}
        </div>
        <div class="room__body">
          <div class="room__name">📍 ${loc.name}</div>
          <div class="room__status ${done ? "is-done" : "is-todo"}">
            ${done ? "Investigated" : "Not investigated"}
          </div>
        </div>`;
      button.addEventListener("click", () => openRoom(loc));
      grid.appendChild(button);
    });
  }

  /* ---- Room modal ------------------------------------------ */
  const modal = $("#room-modal");
  let currentRoom = null;

  function openRoom(loc) {
    currentRoom = loc;

    $("#room-image").style.background =
      `center / cover no-repeat url('${loc.photo}')`;
    $("#room-name").textContent = loc.name;
    $("#room-desc").textContent = loc.description;

    syncRoomStatus();

    $("#room-code").value = "";
    $("#room-feedback").hidden = true;

    modal.hidden = false;
  }

  function closeRoom() {
    modal.hidden = true;
    currentRoom = null;
  }

  /** Paint the modal's status line from what's actually true. */
  function syncRoomStatus() {
    if (!currentRoom) return;
    const done = State.isInvestigated(currentRoom.id);
    const status = $("#room-status");
    status.textContent = done ? "Investigated" : "Not investigated";
    status.classList.toggle("is-done", done);
  }

  function verifyRoomCode() {
    const value = $("#room-code").value.trim();
    if (!value || !currentRoom) return;

    const box = $("#room-feedback");
    box.hidden = false;
    box.classList.remove("is-ok", "is-bad");

    // A postcard belongs to the room it was hidden in. Accepting it from
    // any room meant typing the bedroom code while standing in the kitchen
    // ticked off the bedroom — the grid lit up somewhere you weren't, which
    // reads as a bug. Check the room first and say so plainly.
    const match = State.findCode(value);
    if (match && match.locationId !== currentRoom.id) {
      box.classList.add("is-bad");
      box.textContent =
        "That code belongs to a different room. Try it where you found it.";
      $("#room-code").select();
      return;
    }

    const result = State.verify(value);

    if (result.ok) {
      const theCase = CONFIG.caseById(result.caseId);
      box.classList.add("is-ok");
      box.innerHTML = `
        <strong>${result.already ? "Already discovered" : "Clue discovered!"}</strong>
        <span class="feedback__tag">${theCase ? theCase.label : ""}</span><br />
        New clue: <em>“${result.clue}”</em>`;
      $("#room-code").value = "";
      render(); // refresh progress, case files and the grid
      syncRoomStatus(); // and this room's own status line
    } else {
      box.classList.add("is-bad");
      box.textContent = "The duck doesn't recognize this code. Try again.";
    }
  }

  $("#room-verify").addEventListener("click", verifyRoomCode);
  $("#room-code").addEventListener("keydown", (e) => {
    if (e.key === "Enter") verifyRoomCode();
  });
  $$("[data-close-modal]").forEach((el) =>
    el.addEventListener("click", closeRoom)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeRoom();
  });

  /* ---- Go ---------------------------------------------------*/
  initSlideMenu(render); // slide-out menu lives in shared.js
  initTheme(); // dark mode toggle lives in shared.js
  render();
})();
