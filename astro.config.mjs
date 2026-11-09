// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
// Standard, self-managed Astro site. Builds to static files by default, so it
// hosts anywhere (Wix, Netlify, Vercel, Cloudflare, any static host). Add an
// SSR adapter later if/when a page needs server-side rendering.
export default defineConfig({
  integrations: [react()],

  image: {
    // Allow Astro to optimize images served from Wix media,
    // for when we start pulling in Wix content.
    domains: ["static.wixstatic.com"],
  },
});
