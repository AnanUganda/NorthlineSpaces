# Northline — website frontend

A standard, **self-managed Astro site**. It starts as a Coming Soon page; build
the rest of the site out from here. It can optionally read live content from the
Northline Wix site (`northlinespaces.com`) through the Wix SDK — no secrets are
required for public reads.

## Stack

- **Astro 7** — static output by default (hosts anywhere).
- **React** (`@astrojs/react`) — for interactive "islands" when you need them.
- **Wix SDK** (`@wix/sdk`) — wired and ready, using only the public client id.

No Wix CLI, no managed-hosting integration, no secret env vars needed to run or
build. (The old project was locked to an agency-owned headless project we
couldn't access — that's all been removed.)

## Requirements

- **Node ≥ 20.3.** A user-local build is installed at
  `~/.local/nodes/node-v24.22.1-darwin-arm64/bin`. Put it first on PATH:

  ```bash
  export PATH="$HOME/.local/nodes/node-v24.22.1-darwin-arm64/bin:$PATH"
  ```

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server → http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Project layout

- `src/pages/index.astro` — the Coming Soon landing page.
- `src/pages/*.astro` — add new pages here (file-based routing: `about.astro` → `/about`).
- `src/layouts/Layout.astro` — shared shell: fonts, global design tokens, light/dark.
- `src/lib/wix.ts` — ready-to-use Wix client + usage example.

## Connecting Wix content (when you're ready)

Public reads need **only** the public client id, which already lives in
`src/lib/wix.ts`. To pull in live data:

1. Install the solution package you need, e.g. `npm install @wix/bookings`
   (or `@wix/stores`, `@wix/data`, `@wix/ecom`, …).
2. Build a client and query — see the example in `src/lib/wix.ts`.

- **Site:** `northlinespaces.com` (metaSiteId `407e3184-dee5-4e40-a0df-f5f31c6071d0`).
- **Secrets:** the client *secret* and API key are admin-only. If a future
  server-side feature needs one, keep it in a local `.env` (git-ignored, see
  `.env.example`) — never in the repo and never shipped to the browser.

## Hosting

The static build in `dist/` deploys to any static host. If you later need
server-rendered pages, add an Astro adapter (`@astrojs/node`, Vercel, Netlify,
or Cloudflare) and set `output: "server"` in `astro.config.mjs`.
