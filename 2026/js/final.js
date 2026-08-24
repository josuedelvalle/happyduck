/* ============================================================
   FINAL — shows either the "keep going" state or the reveal.
   ============================================================ */

(function () {
  initTheme(); // dark mode toggle lives in shared.js — logo wraps for both views

  const complete = State.isComplete();

  if (!complete) {
    // --- Locked view: gently nudge back to the dashboard ---
    $("#locked-view").hidden = false;
    $("#locked-found").textContent = State.count();
    $("#locked-total").textContent = CONFIG.total;
    const c = State.coordinates();
    $("#locked-coord").textContent = `${c.lat} , ${c.lng}`;
    return;
  }

  // --- Solved view ---
  $("#solved-view").hidden = false;

  const full = `${CONFIG.destination.lat}, ${CONFIG.destination.lng}`;
  $("#final-coord").textContent = full;
  $("#dest-name").textContent = CONFIG.destination.name;
  $("#dest-coord").textContent = full;
  $("#maps-link").href =
    `https://maps.google.com/?q=${CONFIG.destination.lat},${CONFIG.destination.lng}`;

  // Reveal button flips to the destination card.
  $("#reveal-btn").addEventListener("click", () => {
    $("#reveal-btn").hidden = true;
    $("#destination").hidden = false;
  });
})();
