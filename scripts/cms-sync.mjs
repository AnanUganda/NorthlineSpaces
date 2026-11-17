// Builds / updates the client-friendly Wix CMS from src/data/pages.ts.
//
//   WIX_TOKEN=$(npx -y @wix/cli@latest token --site 407e3184-dee5-4e40-a0df-f5f31c6071d0 | grep ^OauthNG) \
//     node scripts/cms-sync.mjs
//
// Safe to re-run: it creates what's missing, puts fields in page order with
// plain-language labels, and fills EMPTY fields with defaults. It never
// overwrites text the client has edited, and it never deletes data.
import { pages, siteWideFields } from "../src/data/pages.ts";

const TOKEN = process.env.WIX_TOKEN;
if (!TOKEN) throw new Error("Set WIX_TOKEN (see the comment at the top of this file).");

const api = async (method, path, body) => {
  const res = await fetch(`https://www.wixapis.com${path}`, {
    method,
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${method} ${path}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
};

const PUBLIC_READ = { insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ANYONE" };
const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const listCollections = async () =>
  Object.fromEntries((await api("GET", "/wix-data/v2/collections?paging.limit=100")).collections.map((c) => [c.id, c]));

/** Put `wanted` fields first, in order, with these labels; keep every other existing field after them. */
async function upsertCollection(cols, id, displayName, wanted, { drop = [], markUnused = false } = {}) {
  const existing = cols[id];
  const asField = (w) => ({ key: w.key, displayName: w.label, type: w.type ?? "TEXT" });
  if (!existing) {
    await api("POST", "/wix-data/v2/collections", {
      collection: { id, displayName, fields: wanted.map(asField), permissions: PUBLIC_READ },
    });
    return "created";
  }
  const byKey = new Map(existing.fields.map((fld) => [fld.key, fld]));
  const ordered = wanted.map((w) => (byKey.has(w.key) ? { ...byKey.get(w.key), displayName: w.label } : asField(w)));
  const wantedKeys = new Set(wanted.map((w) => w.key));
  const UNUSED = "Not used on the site — ";
  // Fields the site no longer reads stay (no data is deleted) but are clearly labeled and sorted last.
  const rest = existing.fields
    .filter((fld) => !wantedKeys.has(fld.key) && !drop.includes(fld.key))
    .map((fld) =>
      markUnused && !fld.key.startsWith("_") && !String(fld.displayName ?? "").startsWith(UNUSED)
        ? { ...fld, displayName: UNUSED + (fld.displayName ?? fld.key) }
        : fld
    );
  const upd = Object.fromEntries(
    Object.entries(existing).filter(([k]) => ["id", "displayName", "fields", "permissions", "revision", "collectionType"].includes(k))
  );
  await api("PUT", "/wix-data/v2/collections", { collection: { ...upd, displayName, fields: [...ordered, ...rest] } });
  return "updated";
}

async function firstItem(collectionId) {
  const r = await api("POST", "/wix-data/v2/items/query", { dataCollectionId: collectionId, query: { paging: { limit: 1 } } });
  return r.dataItems?.[0] ?? null;
}

/** Make sure the collection has exactly one entry; fill only empty fields from `values`. */
async function ensureSingleItem(collectionId, values) {
  const item = await firstItem(collectionId);
  if (!item) {
    await api("POST", "/wix-data/v2/items", { dataCollectionId: collectionId, dataItem: { data: values } });
    return `entry created (${Object.keys(values).length} fields)`;
  }
  const data = { ...item.data };
  let filled = 0;
  for (const [k, v] of Object.entries(values)) {
    if (isEmpty(data[k]) && !isEmpty(v)) {
      data[k] = v;
      filled++;
    }
  }
  if (filled) await api("PUT", `/wix-data/v2/items/${item.id}`, { dataCollectionId: collectionId, dataItem: { id: item.id, data } });
  return filled ? `${filled} empty field(s) filled` : "entry already complete";
}

/* ------------------------------------------------------------------ */

let cols = await listCollections();

// Values already edited in the old one-table "Page Content" collection carry over.
const legacy = {};
if (cols.PageContent) {
  const r = await api("POST", "/wix-data/v2/items/query", { dataCollectionId: "PageContent", query: { paging: { limit: 50 } } });
  for (const it of r.dataItems ?? []) {
    const d = it.data;
    legacy[d.slug === "home" ? "" : d.slug] = {
      heroKeyword: d.keyword,
      heroHeadline: d.headline,
      heroAccent: d.headlineAccent,
      heroSub: d.subheadline,
      heroImage: d.heroImage,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
    };
  }
}

// Owner photo/caption move from Site Settings to Page: About.
const settings = cols.SiteSettings ? await firstItem("SiteSettings") : null;
const moved = {
  ownerPhoto: settings?.data?.ownerPhoto,
  ownerName: settings?.data?.ownerName,
  ownerCaption: settings?.data?.ownerCaption,
};

console.log("Pages:");
for (const [pid, page] of Object.entries(pages)) {
  const status = await upsertCollection(cols, page.collection, page.title, page.fields, { markUnused: true });
  const carried = legacy[page.slug] ?? {};
  const values = {};
  for (const fld of page.fields) {
    const fromLegacy = carried[fld.key];
    const fromMoved = pid === "about" ? moved[fld.key] : undefined;
    values[fld.key] = !isEmpty(fromMoved) ? fromMoved : !isEmpty(fromLegacy) ? fromLegacy : fld.default;
  }
  const entry = await ensureSingleItem(page.collection, values);
  console.log(`  ${page.title.padEnd(28)} ${status}, ${entry}`);
}

cols = await listCollections();

console.log("Site-wide + lists:");
const siteFields = [
  { key: "title", label: "Business name" },
  { key: "phone", label: "Phone number (shown in the footer)" },
  { key: "email", label: "Email address (shown in the footer)" },
  { key: "businessHours", label: "Business hours (e.g. Mon–Sat, 8am–6pm)" },
  { key: "callbackMinutes", label: "Call-back time in minutes — used across the site as {callbackMinutes}", type: "NUMBER" },
  { key: "deliveryFee", label: "Delivery fee (e.g. $99) — used across the site as {deliveryFee}" },
  { key: "deliveryRadius", label: "Delivery radius (e.g. 10 miles) — used across the site as {deliveryRadius}" },
  { key: "serviceArea", label: "Service area (shown in the footer)" },
  ...siteWideFields,
];
console.log(
  "  Site-wide: Business details  ",
  await upsertCollection(cols, "SiteSettings", "Site-wide: Business details & footer", siteFields, {
    drop: ["ownerPhoto", "ownerName", "ownerCaption", "availability"],
  })
);
const siteValues = Object.fromEntries(siteWideFields.map((fld) => [fld.key, fld.default]));
if (!isEmpty(settings?.data?.availability)) siteValues.closingAvailability = settings.data.availability;
console.log("    ", await ensureSingleItem("SiteSettings", siteValues));

const lists = [
  ["Sizes", "List: Sizes & prices", [
    { key: "title", label: "Size (e.g. 8×12)" },
    { key: "fits", label: "What it fits" },
    { key: "fitsShort", label: "What it fits, short version" },
    { key: "rentPrice", label: "Monthly rent (e.g. $179)" },
    { key: "buyPrice", label: "Purchase price, from (e.g. $5,500)" },
    { key: "featured", label: "Show the “Most popular” badge", type: "BOOLEAN" },
    { key: "sortOrder", label: "Order on the page (1 = first)", type: "NUMBER" },
  ]],
  ["FAQs", "List: FAQs", [
    { key: "title", label: "Question" },
    { key: "answer", label: "Answer" },
    { key: "group", label: "Group heading (e.g. Delivery)" },
    { key: "showOnHome", label: "Also show on the homepage", type: "BOOLEAN" },
    { key: "sortOrder", label: "Order on the page (lower = higher up)", type: "NUMBER" },
  ]],
  ["UnitFeatures", "List: Unit features (The Unit page table)", [
    { key: "title", label: "Feature" },
    { key: "benefit", label: "What it means for you" },
    { key: "sortOrder", label: "Order on the page (1 = first)", type: "NUMBER" },
  ]],
];
for (const [id, name, fields] of lists) {
  if (cols[id]) console.log(`  ${name.padEnd(30)}`, await upsertCollection(cols, id, name, fields));
}

if (cols.PageContent) {
  const c = cols.PageContent;
  await api("PUT", "/wix-data/v2/collections", {
    collection: { ...Object.fromEntries(Object.entries(c).filter(([k]) => ["id", "fields", "permissions", "revision", "collectionType"].includes(k))), displayName: "Old: Page Content (no longer used)" },
  });
  console.log("  Old Page Content               renamed (kept, not deleted)");
}
console.log("Done.");
