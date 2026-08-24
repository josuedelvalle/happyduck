/* ============================================================
   GUARD — protects the private pages.
   ------------------------------------------------------------
   Asks the server (a tiny serverless function) whether the
   current visitor has a valid session cookie. If not, we send
   them back to the login page.

   The cookie is HttpOnly, so JavaScript can't read it directly —
   that's the point: only the server can confirm it. This mirrors
   the "never trust the client" best practice.
   ============================================================ */

(async function guard() {
  try {
    const res = await fetch("/api/check", { credentials: "same-origin" });
    const data = await res.json();
    if (!data.authenticated) {
      window.location.replace("index.html");
    }
  } catch {
    // If the check fails (e.g. offline), fail safe → back to login.
    window.location.replace("index.html");
  }
})();
