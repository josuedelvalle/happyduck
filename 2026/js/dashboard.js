/* ============================================================
   DASHBOARD — the main screen logic.
   ------------------------------------------------------------
   - Renders the progress bar, coordinates and room grid from state
   - Opens a room modal and verifies codes
   (the slide-out menu itself lives in shared.js — initSlideMenu)
   ============================================================ */

(function () {
  /* ---- Render the whole screen from current state ---------- */
  function render() {
    // Progress
    $("#found-count").textContent = State.count();
    $("#total-count").textContent = CONFIG.total;
    $("#progress-pct").textContent = State.completion();
    $("#progress-bar").style.width = State.completion() + "%";

    // Coordinates
    const coords = State.coordinates();
    $("#coord-lat").textContent = coords.lat;
    $("#coord-lng").textContent = coords.lng;
    $("#coord-hint").textContent = State.isComplete()
      ? "All fragments found — tap to reveal the destination."
      : "Find postcards to complete the coordinates.";

    renderGrid();
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
    const done = State.isInvestigated(loc.id);

    $("#room-image").style.background =
      `center / cover no-repeat url('${loc.photo}')`;
    $("#room-name").textContent = loc.name;
    $("#room-desc").textContent = loc.description;

    const status = $("#room-status");
    status.textContent = done ? "Investigated" : "Not investigated";
    status.classList.toggle("is-done", done);

    $("#room-code").value = "";
    $("#room-feedback").hidden = true;

    modal.hidden = false;
  }

  function closeRoom() {
    modal.hidden = true;
    currentRoom = null;
  }

  function verifyRoomCode() {
    const value = $("#room-code").value.trim();
    if (!value) return;

    const result = State.verify(value);
    const box = $("#room-feedback");
    box.hidden = false;
    box.classList.remove("is-ok", "is-bad");

    if (result.ok) {
      box.classList.add("is-ok");
      box.innerHTML = `
        <strong>${result.already ? "Already discovered" : "Clue discovered!"}</strong><br />
        New clue: <em>“${result.clue}”</em>`;
      $("#room-code").value = "";
      render(); // refresh progress + this room's status
      // Keep the modal open on the (now investigated) room.
      if (currentRoom) {
        const status = $("#room-status");
        status.textContent = "Investigated";
        status.classList.add("is-done");
      }
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
