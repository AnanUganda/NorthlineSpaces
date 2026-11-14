// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// Wix-managed Astro: pages render on request on Wix hosting, so content edited
// in the Wix CMS (see src/lib/content.ts) shows on the live site without a
// rebuild. `@wix/astro` signs Wix SDK calls in automatically; its env vars come
// from `npx wix env pull` (.env.local, git-ignored).
//
// Release: `npm run build && npm run release` (wix.config.json targets the
// Northline site, 407e3184, which serves northlinespaces.com).

const oldStaticPages = [
  "unit",
  "pricing",
  "renovation-storage",
  "moving",
  "jobsite-storage",
  "buy",
  "about",
  "faq",
  "quote",
];

export default defineConfig({
  // Public origin, used for canonical URLs, og:url and og:image.
  // www is the primary host (the apex redirects to it).
  site: "https://www.northlinespaces.com",

  integrations: [wix()],
  adapter: wixHostingAdapter(),
  output: "server",
  security: { checkOrigin: false },

  // The site used to be static files at /<page>.html — keep those links working.
  redirects: Object.fromEntries(
    oldStaticPages.map((p) => [`/${p}.html`, { status: 301, destination: `/${p}` }])
  ),

  image: {
    // Allow Astro to optimize images served from Wix media (CMS hero images).
    domains: ["static.wixstatic.com"],
  },
});
