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

## Content: edit it in the Wix CMS

Prices, FAQs, business details and page headlines/SEO live in the **Wix CMS**
(Northline site dashboard → CMS). Edits show on the live site within ~30 seconds,
no rebuild needed.

| Collection | Holds |
| --- | --- |
| Site Settings | phone, email, hours, callback time, delivery fee/radius, availability line |
| Sizes | each size: what it fits, rent + buy price, "most popular", display order |
| FAQs | question, answer, group, "show on homepage", display order |
| Unit Features | the features table on The Unit page |
| Page Content | per page: keyword line, headline + highlighted part, subheadline, SEO title/description, optional hero image |

`src/lib/content.ts` reads these on each request (30s cache) and falls back to
`src/data/site.ts` for anything missing or empty, so a blank field or a CMS
outage never empties a page. Design, layout and long-form section copy stay in
code. Don't rename collections or field keys, or change the `slug` in Page
Content — the code looks them up by those names.

## Hosting (Wix-managed Astro)

Pages are server-rendered on Wix hosting (`@wix/astro` + the Wix hosting
adapter, `output: "server"`). `wix.config.json` targets the Northline site
(`407e3184`, northlinespaces.com). Env vars come from Wix:

```bash
npm run env:pull          # writes .env.local (git-ignored)
npm run build && npm run release
```

- Images: Wix hosting doesn't run Astro's on-the-fly image service, so
  `scripts/optimize-images.mjs` pre-builds WebP sizes into `public/img/`
  (runs automatically before `build`/`dev`), and `src/components/Img.astro`
  serves them. Use `<Img>` for new images, not `astro:assets` `<Image>`.
- URLs are clean (`/pricing`); the old `/pricing.html` links 301-redirect.

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
