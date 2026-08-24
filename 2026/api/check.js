/* ============================================================
   /api/check  —  is the visitor logged in?
   ------------------------------------------------------------
   Reads the HttpOnly session cookie (which the browser sends
   automatically) and reports whether it's valid. The private
   pages call this on load via js/guard.js.
   ============================================================ */

export default function handler(request, response) {
  const cookie = request.headers.cookie || "";
  const authenticated = cookie
    .split(";")
    .map((part) => part.trim())
    .includes("hd_session=granted");

  return response.status(200).json({ authenticated });
}
