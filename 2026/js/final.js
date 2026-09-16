/* ============================================================
   FINAL — shows either the "keep going" state or the reveal.
   ------------------------------------------------------------
   Two cases now, so the reveal is two cards: what each workshop
   is, what she walks out with, where it is, and a Google Maps
   link built from the case's `mapsQuery`.
   ============================================================ */

(function () {
  initTheme(); // dark mode toggle lives in shared.js — logo wraps for both views

  /** Google Maps deep link from a plain search string. */
  function mapsUrl(query) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(query)
    );
  }

  if (!State.isComplete()) {
    /* ---- Locked view: gently nudge back to the dashboard ---- */
    $("#locked-view").hidden = false;
    $("#locked-found").textContent = State.count();
    $("#locked-total").textContent = CONFIG.total;

    $("#locked-words").innerHTML = CONFIG.cases
      .map((theCase) => {
        const revealed = State.isCaseRevealed(theCase.id);
        const slots = Array.from(State.wordFor(theCase.id), (ch) => {
          const filled = ch !== "_";
          return `<span class="slot${filled ? " is-filled" : ""}">${
            filled ? ch : "&nbsp;"
          }</span>`;
        }).join("");
        return `
          <div class="locked-words__row${revealed ? " is-solved" : ""}">
            <span class="eyebrow">${theCase.label}</span>
            <div class="case__word case__word--sm">${slots}</div>
          </div>`;
      })
      .join("");
    return;
  }

  /* ---- Solved view ----------------------------------------- */
  $("#solved-view").hidden = false;

  // A little credit where it's due: did she call it early?
  const guessedEarly = CONFIG.cases.filter(
    (c) => State.isCaseGuessed(c.id) && !State.isCaseComplete(c.id),
  ).length;
  if (guessedEarly > 0) {
    $("#final-subtitle").textContent =
      guessedEarly === CONFIG.cases.length
        ? "You named both cases before the clues ran out."
        : "You named one of them before the clues ran out.";
  }

  $("#destinations").innerHTML = CONFIG.cases
    .map((theCase) => {
      const r = theCase.reveal;
      return `
        <article class="destination__box">
          <p class="eyebrow">${theCase.label} · ${theCase.word}</p>
          <h2 class="destination__name">${r.title}</h2>
          <p class="destination__kicker">${r.kicker}</p>
          <p class="destination__body">${r.body}</p>
          <p class="destination__takeaway">${r.takeaway}</p>
          <p class="destination__where">
            <span aria-hidden="true">📍</span> ${r.where}
          </p>
          <p class="destination__transport">${r.transport}</p>
          <div class="destination__links">
            <a
              class="btn btn--primary btn--block"
              href="${mapsUrl(r.mapsQuery)}"
              target="_blank"
              rel="noopener noreferrer"
            >Open in Maps ↗</a>
            <a
              class="btn btn--ghost btn--block"
              href="${r.siteUrl}"
              target="_blank"
              rel="noopener noreferrer"
            >Visit the atelier ↗</a>
          </div>
        </article>`;
    })
    .join("");

  // Reveal button flips to the two destination cards.
  $("#reveal-btn").addEventListener("click", () => {
    $("#reveal-btn").hidden = true;
    $("#destinations").hidden = false;
  });
})();
