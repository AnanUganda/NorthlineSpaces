// @ts-check
import { defineConfig } from "astro/config";
// React is installed and ready — add it back here as `integrations: [react()]`
// (import react from "@astrojs/react") the moment you build an interactive
// island. The site currently needs only small vanilla scripts, so it's left
// off to keep the build lean.

// https://astro.build/config
// Standard, self-managed Astro site that builds to static files.
//
// `build.format: "file"` emits `pricing.html` instead of `pricing/index.html`.
// Wix static hosting serves files, not folder indexes, so links in production
// point at `/pricing.html` (see `href()` in src/data/site.ts). If the site ever
// moves to server rendering, switch this back to "directory" and drop the
// `.html` suffix in that one helper.
export default defineConfig({
  integrations: [],

  build: {
    format: "file",
  },

  image: {
    // Allow Astro to optimize images served from Wix media,
    // for when we start pulling in Wix content.
    domains: ["static.wixstatic.com"],
  },
});
