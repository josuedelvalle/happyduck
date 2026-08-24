# 🕵️ Happy Duck Investigation

A private birthday **mystery** web app, built with plain **HTML, CSS and
JavaScript** — plus one tiny serverless function so the password stays secret.

The player logs in, investigates rooms, finds hidden physical postcards, enters
their codes, and pieces together the coordinates that reveal the gift.

## What's inside

```
index.html          Login
intro.html          Briefing
dashboard.html      Main screen (progress, coordinates, rooms, menu)
final.html          Reveal
css/styles.css      All styles (organised with comments)
js/
  config.js         ← everything you edit each year
  shared.js         DOM helpers + the shared slide-out menu
  state.js          progress saved in localStorage
  guard.js          bounces you to login if not authenticated
  login.js          sends the password to the server
  dashboard.js      main screen logic (rooms, modal, menu)
  final.js          reveal logic
api/                ← the only server-side code (Vercel functions)
  login.js          checks the password, sets an HttpOnly cookie
  check.js          says whether you're logged in
  logout.js         clears the cookie
assets/             favicon.png (tab icon) + logo.png (header/menu duck)
                    — logo.svg/favicon.svg are unused leftovers
```

## The password is safe

The password is **never** in the browser code. It lives in a Vercel
**Environment Variable** called `APP_PASSWORD`. The serverless function
`api/login.js` reads it server-side and, if the code matches, sets an HttpOnly
session cookie the browser's JavaScript can't read. The private pages ask
`api/check.js` whether that cookie is valid. This is the standard "never trust
the client" pattern, in its simplest form.

> Everything else (which rooms are done, the clues, the coordinates) is _not_
> secret — it's a birthday game — so it lives happily in the browser.

## Run it locally

You need the free Vercel CLI so the `/api` functions work on your machine:

```bash
npm i -g vercel      # once
vercel dev           # runs the site + functions at http://localhost:3000
```

Local dev password: **`230993`** (the fallback in `api/login.js`).
To use your own locally, create `.env.local` with `APP_PASSWORD=yourcode`.

Test codes (enter all six to solve the case):
`8802` Bedroom · `1093` Kitchen · `2264` Laundry · `4571` Living ·
`6619` Dining · `3390` Basement.

> Opening `index.html` directly with a double-click will show the pages, but the
> login and the guard won't work without the functions — use `vercel dev`.

## Deploy to happyduck.dev

1. Push this folder to a Git repo (GitHub, GitLab…).
2. Go to [vercel.com/new](https://vercel.com/new) and import it.
   No framework, no build step — Vercel serves the files and detects `/api`.
3. In **Settings → Environment Variables**, add:
   `APP_PASSWORD` = your real password.
4. Redeploy (Vercel does this automatically on the next push).
5. In **Settings → Domains**, add `happyduck.dev`.

## Customise it (once a year)

Open **`js/config.js`**: change the case number, the rooms, the six postcard
codes with their clues and coordinate fragments, and the destination. Change the
password in Vercel. Print the postcards, hide them — done.

Made with care. 🦆
