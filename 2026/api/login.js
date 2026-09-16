/* ============================================================
   /api/login  —  Vercel Serverless Function
   ------------------------------------------------------------
   This is the ONLY place the password is checked. It compares
   the submitted password against APP_PASSWORD, which you set in
   Vercel → Settings → Environment Variables. That secret never
   reaches the browser.

   On success we set an HttpOnly cookie the browser can't read
   from JavaScript — only our other functions can verify it.
   ============================================================ */

export default function handler(request, response) {
  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  // Vercel parses JSON bodies automatically into request.body.
  const submitted = request.body?.password ?? "";

  // The password lives in an environment variable — in Vercel for
  // production, in .env.local for `vercel dev`. There is deliberately
  // no hardcoded fallback: a default password in the repo is a
  // password in the repo. If it's unset, every login fails closed.
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return response.status(500).json({ ok: false, error: "Not configured" });
  }

  if (submitted !== expected) {
    return response.status(401).json({ ok: false });
  }

  // Set an HttpOnly session cookie for 30 days.
  const thirtyDays = 60 * 60 * 24 * 30;
  response.setHeader(
    "Set-Cookie",
    [
      `hd_session=granted`,
      `Max-Age=${thirtyDays}`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      `Secure`,
    ].join("; "),
  );

  return response.status(200).json({ ok: true });
}
