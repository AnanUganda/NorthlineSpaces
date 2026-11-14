/**
 * Live site content from the Wix CMS, merged over the defaults in src/data/site.ts.
 *
 * The client edits five collections in the Wix dashboard (CMS):
 *   SiteSettings  — one entry: phone, email, hours, callback time, delivery fee/radius, availability
 *   Sizes         — unit sizes, what they fit, rent + buy prices, "most popular", order
 *   FAQs          — question, answer, group, "show on homepage", order
 *   UnitFeatures  — the features table on The Unit page
 *   PageContent   — per page: keyword line, headline, highlighted part, subheadline, SEO, hero image
 *
 * Pages render on request (Wix-managed Astro, `output: "server"`), so an edit shows on the live site
 * without a rebuild — after at most CACHE_MS. `@wix/astro` signs the `@wix/data` calls in as a site
 * visitor automatically; the collections are public-read, owner-write.
 *
 * Resilience: any collection that fails to load, or comes back empty, falls back to the defaults in
 * site.ts, and empty CMS fields fall back field by field — a half-filled entry never blanks a page.
 */
import { items } from "@wix/data";
import { media } from "@wix/sdk";
import * as d from "../data/site";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type Business = typeof d.business & { phone: string; email: string };

export type PageEntry = {
  keyword?: string;
  headline?: string;
  headlineAccent?: string;
  subheadline?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Absolute image URL when the client set a hero image in the CMS. */
  heroImage?: string;
};

export type Content = {
  business: Business;
  sizes: d.Size[];
  faq: d.FaqGroup[];
  homeFaq: d.FaqItem[];
  features: typeof d.features;
  closing: typeof d.closing;
  /** Keyed by page slug ("" = home). */
  pages: Record<string, PageEntry>;
  /** True when at least one collection was read from the CMS. */
  live: boolean;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const CACHE_MS = 30_000;
let cache: { at: number; value: Content } | null = null;

type Raw = Record<string, any>;

/** Non-empty trimmed string, else undefined (so `??` falls back to the default). */
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

/** Read a whole collection sorted by `sortOrder` when it has one. null = unavailable. */
async function load(collectionId: string, sorted = true): Promise<Raw[] | null> {
  try {
    let q = items.query(collectionId).limit(100);
    if (sorted) q = q.ascending("sortOrder");
    const res = await q.find();
    return res.items as Raw[];
  } catch (err) {
    console.warn(`[content] CMS collection "${collectionId}" unavailable, using defaults:`, String(err));
    return null;
  }
}

/** A Wix Media value (wix:image://… or an https URL) → absolute https URL. */
function imageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (value.startsWith("http")) return value;
  try {
    return media.getImageUrl(value).url;
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Mapping                                                            */
/* ------------------------------------------------------------------ */

function mapBusiness(rows: Raw[] | null): Business {
  const s = rows?.[0] ?? {};
  return {
    ...d.business,
    hours: str(s.businessHours) ?? d.business.hours,
    callbackMinutes: num(s.callbackMinutes) ?? d.business.callbackMinutes,
    deliveryFee: str(s.deliveryFee) ?? d.business.deliveryFee,
    deliveryRadius: str(s.deliveryRadius) ?? d.business.deliveryRadius,
    area: str(s.serviceArea) ?? d.business.area,
    phone: str(s.phone) ?? "",
    email: str(s.email) ?? "",
  };
}

function mapSizes(rows: Raw[] | null): d.Size[] {
  if (!rows?.length) return d.sizes;
  return rows.map((r, i) => {
    const fallback = d.sizes[i] ?? d.sizes[0];
    const name = str(r.title) ?? fallback.name;
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
      name,
      fits: str(r.fits) ?? fallback.fits,
      fitsShort: str(r.fitsShort) ?? str(r.fits) ?? fallback.fitsShort,
      rent: str(r.rentPrice) ?? fallback.rent,
      buy: str(r.buyPrice) ?? fallback.buy,
      featured: Boolean(r.featured),
    };
  });
}

function mapFaq(rows: Raw[] | null): { faq: d.FaqGroup[]; homeFaq: d.FaqItem[] } {
  if (!rows?.length) return { faq: d.faq, homeFaq: d.homeFaq };
  const groups: d.FaqGroup[] = [];
  for (const r of rows) {
    const q = str(r.title);
    const a = str(r.answer);
    if (!q || !a) continue;
    const name = str(r.group) ?? "More questions";
    let g = groups.find((x) => x.group === name);
    if (!g) groups.push((g = { group: name, items: [] }));
    g.items.push({ q, a, home: Boolean(r.showOnHome) });
  }
  if (!groups.length) return { faq: d.faq, homeFaq: d.homeFaq };
  const all = groups.flatMap((g) => g.items);
  const home = all.filter((i) => i.home);
  return { faq: groups, homeFaq: home.length ? home : all.slice(0, 5) };
}

function mapFeatures(rows: Raw[] | null): typeof d.features {
  if (!rows?.length) return d.features;
  const out = rows
    .map((r) => ({ feature: str(r.title) ?? "", benefit: str(r.benefit) ?? "" }))
    .filter((f) => f.feature);
  return out.length ? out : d.features;
}

function mapPages(rows: Raw[] | null): Record<string, PageEntry> {
  const pages: Record<string, PageEntry> = {};
  for (const r of rows ?? []) {
    const raw = str(r.slug);
    if (!raw) continue;
    const slug = raw === "home" ? "" : raw;
    pages[slug] = {
      keyword: str(r.keyword),
      headline: str(r.headline),
      headlineAccent: str(r.headlineAccent),
      subheadline: str(r.subheadline),
      seoTitle: str(r.seoTitle),
      seoDescription: str(r.seoDescription),
      heroImage: imageUrl(r.heroImage),
    };
  }
  return pages;
}

/** The closing block's facts follow the settings and the cheapest rent. */
function mapClosing(business: Business, sizes: d.Size[], rows: Raw[] | null): typeof d.closing {
  const rents = sizes
    .map((s) => ({ label: s.rent, value: Number(s.rent.replace(/[^0-9.]/g, "")) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => a.value - b.value);
  const from = rents[0]?.label ?? d.sizes[0].rent;
  const availability = str(rows?.[0]?.availability) ?? d.closing.availability;
  return {
    ...d.closing,
    availability,
    sub: `We'll call you within ${business.callbackMinutes} minutes with your price.`,
    facts: [
      { no: "(01)", value: `${business.callbackMinutes} minutes`, label: "to a real person with your price" },
      { no: "(02)", value: d.closing.facts[1].value, label: d.closing.facts[1].label },
      { no: "(03)", value: `From ${from} / month`, label: `${business.deliveryFee} delivery within ${business.deliveryRadius}` },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/** All site content, CMS-first with site.ts fallbacks. Cached for CACHE_MS. */
export async function getContent(): Promise<Content> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const [settings, sizeRows, faqRows, featureRows, pageRows] = await Promise.all([
    load("SiteSettings", false),
    load("Sizes"),
    load("FAQs"),
    load("UnitFeatures"),
    load("PageContent", false),
  ]);

  const business = mapBusiness(settings);
  const sizes = mapSizes(sizeRows);
  const { faq, homeFaq } = mapFaq(faqRows);

  const value: Content = {
    business,
    sizes,
    faq,
    homeFaq,
    features: mapFeatures(featureRows),
    closing: mapClosing(business, sizes, settings),
    pages: mapPages(pageRows),
    live: [settings, sizeRows, faqRows, featureRows, pageRows].some((r) => r !== null),
  };

  cache = { at: Date.now(), value };
  return value;
}

/** SEO title/description for a page: CMS first, then site.ts. */
export function seoFor(content: Content, slug: string): { title: string; description: string } {
  const fallback = d.seo[slug] ?? d.seo[""];
  const p = content.pages[slug] ?? {};
  return {
    title: p.seoTitle ?? fallback.title,
    description: p.seoDescription ?? fallback.description,
  };
}
