/* ============================================================
   SHARED HELPERS — tiny utilities used across pages.
   ============================================================ */

/** Shorthand for document.querySelector. */
function $(selector, root = document) {
  return root.querySelector(selector);
}

/** Shorthand for querySelectorAll, returned as a real array. */
function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/* ---- Slide-out menu ----------------------------------------
   Shared by every page that includes the header + #menu markup
   (dashboard, clues, …). Wires up open/close, the reset-confirm
   and about sub-views, sign-out, and Escape-to-close.
   `onReset` runs after progress is wiped, so the calling page can
   re-render itself. Does nothing on pages without a #menu.
------------------------------------------------------------- */
function initSlideMenu(onReset) {
  const menu = $("#menu");
  if (!menu) return;

  const views = {
    main: $("#menu-main"),
    reset: $("#menu-reset"),
    about: $("#menu-about"),
  };

  function openMenu() {
    showMenuView("main");
    menu.hidden = false;
  }
  function closeMenu() {
    menu.hidden = true;
  }
  function showMenuView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  $("#menu-btn").addEventListener("click", openMenu);
  $$("[data-close-menu]").forEach((el) =>
    el.addEventListener("click", closeMenu)
  );
  $("#reset-open").addEventListener("click", () => showMenuView("reset"));
  $("#about-open").addEventListener("click", () => showMenuView("about"));
  $("[data-reset-cancel]").addEventListener("click", () => showMenuView("main"));
  $("[data-about-back]").addEventListener("click", () => showMenuView("main"));

  $("#reset-confirm").addEventListener("click", () => {
    State.reset();
    closeMenu();
    if (onReset) onReset();
  });

  $("#signout-btn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    window.location.href = "index.html";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) closeMenu();
  });
}
