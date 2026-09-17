# 🕵️ Happy Duck Investigation

A private birthday **mystery** web app, built with plain **HTML, CSS and
JavaScript** — plus one tiny serverless function so the password stays secret.

The 2026 edition runs **two parallel cases**: two gifts, in two places. The
player logs in, investigates rooms, finds hidden physical postcards and enters
their codes. Each postcard reveals a clue and a slice of its case's **codeword**,
which fills in letter by letter.

She can also try to **name a case** at any point. Guessing `PERFUME` from two
clues is recorded and credited at the end — but it does not open the file.
Only finding every postcard does. Naming is a bragging right, not a shortcut,
so no lucky guess makes the rest of the hunt pointless.

## What's inside

```
index.html          Login
intro.html          Briefing
dashboard.html      Main screen (progress, the two case files, rooms, menu)
clues.html          All clues, grouped by case
final.html          Reveal
css/styles.css      All styles (organised with comments)
js/
  config.js         ← everything you edit each year
  shared.js         DOM helpers + the shared slide-out menu + dark mode
  state.js          progress saved in localStorage
  guard.js          bounces you to login if not authenticated
  login.js          sends the password to the server
  dashboard.js      main screen logic (cases, guessing, rooms, modal)
  clues.js          clue list, grouped by case
  final.js          reveal logic
api/                ← the only server-side code (Vercel functions)
  login.js          checks the password, sets an HttpOnly cookie
  check.js          says whether you're logged in
  logout.js         clears the cookie
assets/             favicon.png (tab icon) + logo.png (header/menu duck)
                    + one photo per room
```

## How the two cases work

Each entry in `CONFIG.cases` has a `word` (the codeword), an `accept` list of
guesses that count as correct, and a `reveal` block with the workshop details
shown at the end.

Each postcard in `CONFIG.codes` names its `caseId` and carries a
`fragment: { at, value }` — the position in that word and the letters it fills.
Three postcards per case, `LE · AT · HER` and `PE · RF · UME`.

Guesses are normalised before comparison (lowercased, accents stripped, a
leading article dropped), so `Perfume`, `perfumería` and `el parfum` all match.

Progress lives in localStorage under `happyduck.progress.v2` as
`{ found: [...], solved: [{ caseId, foundAt }] }` — the codes found, and each
case she named along with how many postcards she had at the time. Everything
else is derived from those two lists, so a reset is one `removeItem`.

## The password is safe

The password is **never** in the browser code. It lives in a Vercel
**Environment Variable** called `APP_PASSWORD`. The serverless function
`api/login.js` reads it server-side and, if the code matches, sets an HttpOnly
session cookie the browser's JavaScript can't read. The private pages ask
`api/check.js` whether that cookie is valid. This is the standard "never trust
the client" pattern, in its simplest form.

There is no hardcoded fallback password: if `APP_PASSWORD` is unset the login
fails closed. A default password committed to a repo is a password in the repo.

> Everything else (which rooms are done, the clues, the codewords) is _not_
> secret — it's a birthday game, and `config.js` is served to the browser — so it
> lives happily on the client.

## Run it locally

You need the free Vercel CLI so the `/api` functions work on your machine:

```bash
npm i -g vercel                          # once
echo "APP_PASSWORD=yourcode" > .env.local  # once, and never commit it
vercel dev                               # site + functions at localhost:3000
```

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

Open **`js/config.js`**: change the case number, the two cases (codeword,
accepted guesses, reveal details), the rooms, and the six postcard codes with
their clues and letter fragments. Change `APP_PASSWORD` in Vercel. Print the
postcards, hide them — done.

The postcard codes and the login password are **not** written down in this file
on purpose. Keep them somewhere that isn't the repo.

Made with care. 🦆
