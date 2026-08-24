/* ============================================================
   /api/logout  —  clears the session cookie.
   ============================================================ */

export default function handler(request, response) {
  // Overwrite the cookie with an immediate expiry.
  response.setHeader(
    "Set-Cookie",
    "hd_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure"
  );
  return response.status(200).json({ ok: true });
}
