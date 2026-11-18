/**
 * Live site content from the Wix CMS, merged over the defaults in src/data/site.ts.
 *
 * The client edits these in the Wix dashboard (CMS):
 *   Page: Home, Page: About, …  — one entry per page holding every piece of its text, in page
 *                                 order (fields defined in src/data/pages.ts; read with getPage)
 *   Site-wide (SiteSettings)    — contact details, hours, delivery fee/radius, closing CTA, footer
 *   List: Sizes & prices        — unit sizes, what they fit, rent + buy prices, "most popular", order
 *   List: FAQs                  — question, answer, group, "show on homepage", order
 *   List: Unit features         — the features table on The Unit page
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
import { pages, pageIdBySlug, siteWideFields, type PageId } from "../data/pages";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type Business = typeof d.business & {
  phone: string;
  email: string;
};

/** Site-wide text: the closing section on every page + the footer blurb. */
export type SiteText = Record<(typeof siteWideFields)[number]["key"], string>;

export type Content = {
  business: Business;
  sizes: d.Size[];
  faq: d.FaqGroup[];
  homeFaq: d.FaqItem[];
  features: typeof d.features;
  closing: typeof d.closing;
  site: SiteText;
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

function mapFaq(rows: Raw[] | null, b: Business): { faq: d.FaqGroup[]; homeFaq: d.FaqItem[] } {
  if (!rows?.length) return { faq: d.faq, homeFaq: d.homeFaq };
  const groups: d.FaqGroup[] = [];
  for (const r of rows) {
    const q = str(r.title);
    const a = str(r.answer) && fillTokens(str(r.answer)!, b);
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

/** The closing block's facts follow the settings and the cheapest rent. */
function mapClosing(business: Business, sizes: d.Size[], rows: Raw[] | null): typeof d.closing {
  const rents = sizes
    .map((s) => ({ label: s.rent, value: Number(s.rent.replace(/[^0-9.]/g, "")) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => a.value - b.value);
  const from = rents[0]?.label ?? d.sizes[0].rent;
  const site = mapSite(business, rows);
  return {
    ...d.closing,
    availability: site.closingAvailability,
    title: [site.closingHeading, site.closingAccent],
    sub: site.closingText,
    facts: [
      { no: "(01)", value: "Double wall", label: "insulated, high-grade aluminum construction" },
      { no: "(02)", value: d.closing.facts[1].value, label: d.closing.facts[1].label },
      { no: "(03)", value: `From ${from} / month`, label: `${business.deliveryFee} delivery within ${business.deliveryRadius}` },
    ],
  };
}

/** Fill {deliveryFee}, {deliveryRadius}, {town}, {callbackMinutes}, {businessHours} from Business details. */
export function fillTokens(text: string, b: Business): string {
  const tokens: Record<string, string> = {
    deliveryFee: b.deliveryFee,
    deliveryRadius: b.deliveryRadius,
    town: b.town,
    callbackMinutes: String(b.callbackMinutes),
    businessHours: b.hours,
    serviceArea: b.area,
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => tokens[k] ?? m);
}

function mapSite(business: Business, rows: Raw[] | null): SiteText {
  const s = rows?.[0] ?? {};
  // "availability" is the field's original key; prefer the new one, then the old.
  const out: Record<string, string> = {};
  for (const fld of siteWideFields) {
    const legacy = fld.key === "closingAvailability" ? str(s.availability) : undefined;
    out[fld.key] = fillTokens(str(s[fld.key]) ?? legacy ?? fld.default, business);
  }
  return out as SiteText;
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/** All site content, CMS-first with site.ts fallbacks. Cached for CACHE_MS. */
export async function getContent(): Promise<Content> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const [settings, sizeRows, faqRows, featureRows] = await Promise.all([
    load("SiteSettings", false),
    load("Sizes"),
    load("FAQs"),
    load("UnitFeatures"),
  ]);

  const business = mapBusiness(settings);
  const sizes = mapSizes(sizeRows);
  const { faq, homeFaq } = mapFaq(faqRows, business);

  const value: Content = {
    business,
    sizes,
    faq,
    homeFaq,
    features: mapFeatures(featureRows),
    closing: mapClosing(business, sizes, settings),
    site: mapSite(business, settings),
    live: [settings, sizeRows, faqRows, featureRows].some((r) => r !== null),
  };

  cache = { at: Date.now(), value };
  return value;
}

/* ------------------------------------------------------------------ */
/* Pages                                                              */
/* ------------------------------------------------------------------ */

/** A page's text: `t("key")` → CMS value, else the registry default, with tokens filled. */
export type PageText = {
  t: (key: string) => string;
  /** CMS image URL for an IMAGE field, or undefined when empty. */
  image: (key: string) => string | undefined;
  /** Split a "a · b · c" field into a list. */
  items: (key: string) => string[];
};

const pageCache = new Map<PageId, { at: number; row: Raw }>();

async function pageRow(id: PageId): Promise<Raw> {
  const hit = pageCache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.row;
  const rows = await load(pages[id].collection, false);
  const row = rows?.[0] ?? {};
  pageCache.set(id, { at: Date.now(), row });
  return row;
}

/** Load one page's editable text from its CMS entry ("Page: Home", …). */
export async function getPage(id: PageId): Promise<PageText> {
  const [row, content] = await Promise.all([pageRow(id), getContent()]);
  const defaults = new Map(pages[id].fields.map((fld) => [fld.key, fld.default] as const));
  const t = (key: string) => {
    if (!defaults.has(key)) console.warn(`[content] page "${id}" has no field "${key}" in pages.ts`);
    return fillTokens(str(row[key]) ?? defaults.get(key) ?? "", content.business);
  };
  return {
    t,
    image: (key) => imageUrl(row[key]),
    items: (key) => t(key).split("·").map((x) => x.trim()).filter(Boolean),
  };
}

/** SEO title/description for a page slug ("" = home): its page entry, then the defaults. */
export async function seoFor(slug: string): Promise<{ title: string; description: string }> {
  const id = pageIdBySlug[slug];
  const fallback = d.seo[slug] ?? d.seo[""];
  if (!id) return fallback;
  const p = await getPage(id);
  return { title: p.t("seoTitle") || fallback.title, description: p.t("seoDescription") || fallback.description };
}
