# Northline Spaces — website

The marketing site for Northline Spaces: insulated portable storage units in
Fallbrook / North County San Diego, to rent by the month or buy.

A standard, **self-managed Astro site** that builds to static files. Wix is the
business backend (dashboard, forms, data); this repo is the frontend.

## Stack

- **Astro 7** — static output, `build.format: "file"` (see *Hosting* below).
- **Vanilla CSS + JS** — one design-system stylesheet, one small interaction
  script. No animation libraries. React is installed but not enabled; add
  `react()` to `astro.config.mjs` when an interactive island is needed.
- **Wix SDK** (`@wix/sdk`) — wired in `src/lib/wix.ts` with the public client
  id only, ready for live data.

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

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/site.ts` | **All content** — copy, prices, sizes, FAQs, nav, SEO. Edit here, not in pages. |
| `src/styles/global.css` | The design system: tokens, type scale, every component class. |
| `src/layouts/Layout.astro` | Page shell: SEO, fonts, header, closing CTA, footer, global script. |
| `src/components/` | Header + menu, Footer, Button, Eyebrow, PageHero, SizeTable, Faq, Cta, Logo, Icon. |
| `src/pages/` | The 10 pages (home, unit, pricing, renovation-storage, moving, jobsite-storage, buy, about, faq, quote). |
| `src/assets/images/` | Web-ready renders (≤ 2400px JPEG). Astro optimizes them to webp at build. |
| `raw-images/` | Original multi-MB renders. **Git-ignored.** |

## Design system (short version)

Warm editorial. Linen background `#F3F0EB`, warm near-black ink `#161412`, one
bronze accent `#8A6742`, sand `#F1DFC2` on dark. Inter with optical sizing.
Signature moves: parenthetical numbering `(01)`, accent on the last words of a
headline, pill buttons with an inset arrow circle, hairline rules, big tight
type. Motion is CSS-only and respects `prefers-reduced-motion`.

## Hosting (Wix Headless, static)

The site deploys to a **Wix-managed Headless** site as static files. Wix static
hosting serves `pricing.html`, not `/pricing/`, so:

- `astro.config.mjs` sets `build.format: "file"` → `dist/pricing.html`.
- `href()` in `src/data/site.ts` appends `.html` to links **in production
  builds only**; dev keeps clean `/pricing` routes.

If the site ever moves to server rendering, change those two spots and nothing
else.

**Deploying:** build, zip `dist/`, and drop it on the headless site
(`metaSiteId 5f03d924-e3d6-4ca4-9ac6-1f5fc8948b31`, the migration project for
northlinespaces.com). The whole build is ~6 MB, under Wix's 20 MiB cap.

```bash
npm run build && (cd dist && zip -r -q ../site.zip .)
TOKEN=$(npx -y @wix/cli@latest token | grep ^OauthNG)
curl -X POST "https://www.wixapis.com/headless-business-setup/v1/headless-business/5f03d924-e3d6-4ca4-9ac6-1f5fc8948b31/drop" \
  -H "Authorization: Bearer $TOKEN" -F "files=@site.zip"
```

**At domain launch:** set `site` in `astro.config.mjs` to
`https://northlinespaces.com`, rebuild and redeploy, so canonical URLs and
share images use the real domain.

## Still to do

- **Wire the quote form to Wix Forms** so submissions land in the Northline Wix
  dashboard (`src/pages/quote.astro` validates on the client only for now).
- **Confirm placeholder facts** with the client — the list is `placeholders`
  at the bottom of `src/data/site.ts` (prices, which sizes have the window and
  side door, minimum term, hours, the family story, etc.).
- Replace the default favicon with the Northline mark.
- Privacy / Terms pages (footer links are placeholders).

## Connecting Wix content

Public reads need only the public client id in `src/lib/wix.ts`:

1. `npm install @wix/bookings` (or `@wix/stores`, `@wix/data`, `@wix/forms`, …)
2. Build a client and query — see the example in `src/lib/wix.ts`.

Secrets (client secret / API key) are admin-only: keep them in a local `.env`
(git-ignored), never in the repo or the browser.
