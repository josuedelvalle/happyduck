# 🦆 happyduck

A different surprise every year. Each folder is a self-contained edition -with its own tech stack- deployed to [happyduck.dev](https://happyduck.dev) / [patofeliz.com](https://patofeliz.com)

## Editions

| Year | What it is                 | Tech          | Status           |
| ---- | -------------------------- | ------------- | ---------------- |
| 2026 | House clue-hunt (gymkhana) | HTML, CSS, JS | 🚧 In progress   |
| 2027 | -                          | -             | 💡 To be planned |

## How it's organized

Each year lives in its own folder (`2026/`, `2027/`, ...) and is fully independent: it can use whatever technology it wants without affecting the others.

```
happyduck/
├── 2026/     ← plain HTML/CSS/JS (the deployed edition)
├── 2027/     ← (whatever comes next)
└── README.md ← this index
```

## Deployment (Vercel)

The main domain `happyduck.dev` serves the current year's edition. In Vercel, the project's **Root Directory** points to that year's folder (e.g. `2026/`). Vercel auto-detects each folder's stack: plain HTML is served as static files; if a `package.json` is present, it runs that folder's build.

To keep older editions online at the same time, create one Vercel project per folder and publish them on subdomains (e.g. `2026.happyduck.dev`).

## Freezing an edition

When each year is done, tag its state in git to preserve it as-is:

```bash
git tag v2026
git push origin v2026
```

---

Domains: `happyduck.dev` (main) - `patofeliz.com` (backup / projects)
