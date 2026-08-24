/* ============================================================
   LOGIN — sends the typed password to the server for checking.
   ------------------------------------------------------------
   We never compare the password here in the browser. We POST it
   to /api/login; the server checks it against its secret env var
   and, if correct, sets the session cookie. Then we go to /intro.
   ============================================================ */

(function () {
  const form = $("#login-form");
  const input = $("#password");
  const error = $("#error");
  const submit = $("#submit");
  const toggle = $("#toggle-pw");

  initTheme(); // dark mode toggle lives in shared.js

  // Show / hide the password field.
  toggle.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = input.value.trim();
    if (!password) return;

    error.hidden = true;
    submit.disabled = true;
    $(".btn__label", submit).textContent = "Checking…";

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Cookie is set by the server; move to the briefing.
        window.location.href = "intro.html";
        return;
      }
      showError();
    } catch {
      showError();
    }

    function showError() {
      error.hidden = false;
      submit.disabled = false;
      $(".btn__label", submit).textContent = "Enter";
    }
  });
})();
