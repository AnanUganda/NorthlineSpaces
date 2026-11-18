/**
 * Page-by-page content registry — the single source of truth for every piece of
 * editable text on the site.
 *
 * Each page maps to one Wix CMS collection ("Page: Home", "Page: About", …) that
 * holds ONE entry. Its fields appear in the CMS in the order listed here, with
 * these labels, so the editor reads top-to-bottom like the page itself.
 *
 * - `default` is what the site shows when the CMS field is empty.
 * - Text may contain {deliveryFee}, {deliveryRadius}, {town} or {callbackMinutes};
 *   they're filled in from "Site-wide: Business details & footer", so a price
 *   change there updates every sentence that mentions it.
 * - `scripts/cms-sync.mjs` creates/updates the CMS collections from this file
 *   (it only ever fills EMPTY fields — it never overwrites the client's edits).
 *
 * To make new text editable: add a field here, use `t("key")` in the page, run
 * `node scripts/cms-sync.mjs`.
 */
import { seo } from "./seo.ts";

export type FieldType = "TEXT" | "IMAGE";
export type Field = { key: string; label: string; default: string; type?: FieldType };
export type PageDef = { collection: string; title: string; slug: string; fields: Field[] };

const f = (key: string, label: string, def: string, type: FieldType = "TEXT"): Field => ({
  key,
  label,
  default: def,
  type,
});

/** Section label + two-part heading (the second part is set in bronze). */
const head = (n: number, name: string, p: string, label: string, heading: string, accent: string): Field[] => [
  f(`${p}Label`, `${n} · ${name} — Small label`, label),
  f(`${p}Heading`, `${n} · ${name} — Heading`, heading),
  f(`${p}Accent`, `${n} · ${name} — Heading, bronze part`, accent),
];

/** Inner-page hero: keyword line (Google), headline, bronze part, intro, optional photo. */
const hero = (keyword: string, headline: string, accent: string, sub: string, image = true): Field[] => [
  f("heroKeyword", "1 · Top of page — Keyword line (small text, helps Google)", keyword),
  f("heroHeadline", "1 · Top of page — Headline", headline),
  f("heroAccent", "1 · Top of page — Headline, bronze part", accent),
  f("heroSub", "1 · Top of page — Intro text", sub),
  ...(image ? [f("heroImage", "1 · Top of page — Photo (optional; leave empty to keep the current one)", "", "IMAGE")] : []),
];

/** "Bold start. The rest of the sentence." bullet pairs. */
const pairs = (n: number, name: string, p: string, items: [string, string][]): Field[] =>
  items.flatMap(([lead, rest], i) => [
    f(`${p}${i + 1}Lead`, `${n} · ${name} — Point ${i + 1}, bold start`, lead),
    f(`${p}${i + 1}Text`, `${n} · ${name} — Point ${i + 1}, rest of the sentence`, rest),
  ]);

const list = (n: number, name: string, p: string, items: string[], noun = "Point"): Field[] =>
  items.map((t, i) => f(`${p}${i + 1}`, `${n} · ${name} — ${noun} ${i + 1}`, t));

const titled = (n: number, name: string, p: string, items: [string, string][], noun = "Card"): Field[] =>
  items.flatMap(([title, text], i) => [
    f(`${p}${i + 1}Title`, `${n} · ${name} — ${noun} ${i + 1} title`, title),
    f(`${p}${i + 1}Text`, `${n} · ${name} — ${noun} ${i + 1} text`, text),
  ]);

const seoFields = (slug: string): Field[] => [
  f("seoTitle", "SEO — Google title (about 50–60 characters)", seo[slug]?.title ?? ""),
  f("seoDescription", "SEO — Google description (about 150–160 characters)", seo[slug]?.description ?? ""),
];

/* ------------------------------------------------------------------ */

export const pages = {
  home: {
    collection: "PageHome",
    title: "Page: Home",
    slug: "",
    fields: [
      f("heroKeyword", "0 · Top of page — Keyword line (small text, helps Google)", "Premium portable storage serving Southern California"),
      f("heroHeadline", "0 · Top of page — Headline", "Storage you'll be proud to see in your driveway."),
      f("heroAccent", "0 · Top of page — Headline, bronze part (optional)", ""),
      f("heroSub", "0 · Top of page — Intro text", "Insulated storage, delivered to your home or jobsite. Honest prices, and a real person responds within {callbackMinutes} minutes during business hours."),
      f("heroCardLabel", "0 · Top of page — Photo card, small label", "Most popular"),
      f("heroCardTitle", "0 · Top of page — Photo card, title", "8×16 insulated unit"),
      f("heroImage", "0 · Top of page — Background photo (optional; leave empty to keep the current one)", "", "IMAGE"),

      ...head(1, "About us", "about", "About Northline", "We built the storage we'd want in", "our own driveway."),
      f("aboutText", "1 · About us — Text", "We're a {town} family, and we know how much care goes into a home. So we build our own units: small, insulated, secure rooms that look like they belong, and we run things the way we'd want to be treated."),
      f("stat1Value", "1 · About us — Number box 1, number", "{callbackMinutes}"),
      f("stat1Unit", "1 · About us — Number box 1, small unit", "min"),
      f("stat1Label", "1 · About us — Number box 1, label", "Response time"),
      f("stat1Sub", "1 · About us — Number box 1, small text", "During business hours"),
      f("stat2Value", "1 · About us — Number box 2, number", "{deliveryFee}"),
      f("stat2Label", "1 · About us — Number box 2, label", "Delivery & pickup"),
      f("stat2Sub", "1 · About us — Number box 2, small text", "Within {deliveryRadius} of {town}"),
      f("stat3Value", "1 · About us — Number box 3, number", "3"),
      f("stat3Label", "1 · About us — Number box 3, label", "Sizes"),
      f("stat3Sub", "1 · About us — Number box 3, small text", "8×12, 8×16 and 8×20"),
      f("stat4Value", "1 · About us — Number box 4, number", "0"),
      f("stat4Label", "1 · About us — Number box 4, label", "Hidden fees"),
      f("stat4Sub", "1 · About us — Number box 4, small text", "The price you see is the price you pay"),

      ...head(2, "How we can help", "services", "How we can help", "Whatever you're working on,", "we've got space for it."),
      f("servicesText", "2 · How we can help — Text", "Renovating, moving, building or just out of room? One well-built unit, delivered to your driveway or jobsite."),
      f("service1Title", "2 · How we can help — Card 1 (Renovation) title", "Renovation storage"),
      f("service1Short", "2 · How we can help — Card 1 short name (shortcut under the top photo)", "Renovation"),
      f("service1Text", "2 · How we can help — Card 1 text", "Clear the room, protect your furniture, and get to it any time. It's a few steps from the work, not across town."),
      f("service1Tags", "2 · How we can help — Card 1 tags (separate with ·)", "Homeowners · Businesses · Month to month"),
      f("service2Title", "2 · How we can help — Card 2 (Moving) title", "Moving"),
      f("service2Short", "2 · How we can help — Card 2 short name", "Moving"),
      f("service2Text", "2 · How we can help — Card 2 text", "Load at your own pace with no rental truck and no deadline, or let our team do the heavy lifting."),
      f("service2Tags", "2 · How we can help — Card 2 tags (separate with ·)", "Self-move · Full service · No deadline"),
      f("service3Title", "2 · How we can help — Card 3 (Jobsite) title", "Jobsite storage"),
      f("service3Short", "2 · How we can help — Card 3 short name", "Jobsite"),
      f("service3Text", "2 · How we can help — Card 3 text", "Secure, insulated storage right on site, so your crew spends less time hauling and more time building."),
      f("service3Tags", "2 · How we can help — Card 3 tags (separate with ·)", "Contractors · Secure · Looks professional"),
      f("service4Title", "2 · How we can help — Card 4 (Buy) title", "Buy a unit"),
      f("service4Short", "2 · How we can help — Card 4 short name", "Buy a unit"),
      f("service4Text", "2 · How we can help — Card 4 text", "A permanent, good-looking space for your property. Insulated, secure and built by our family."),
      f("service4Tags", "2 · How we can help — Card 4 tags (separate with ·)", "Own it · Workshop · Backyard office"),

      ...head(3, "Your unit", "unit", "Your unit", "Built to protect.", "Designed to look good doing it."),
      ...titled(3, "Your unit", "benefit", [
        ["Your things stay protected.", "Insulated walls and ceiling guard furniture, electronics and paperwork against {town}'s heat."],
        ["Your home still looks good.", "Charcoal siding and cedar-tone trim that suit a beautiful driveway."],
        ["Loading is easy.", "A wide roll-up door at ground level, with no ramps to wrestle."],
      ], "Benefit"),
      ...[
        ["Walk right in", "Interior", "Ground-level loading through a wide roll-up door. Lined and insulated inside, with optional interior lighting.", "Roll-up door · Insulated · Ground level"],
        ["Built like it's meant to stay", "Detail", "Durable double wall construction in high-grade aluminum, with clean, simple lines.", "Double wall · High-grade aluminum"],
        ["At home on any property", "On site", "Designed to sit in front of a beautiful home without looking out of place.", "Driveway or courtyard · Secure locking"],
        ["Window and side door", "Select sizes", "Natural light to see what you're doing, and a walk-in door so you can grab something without opening the main one.", "Window · Side door · 8×16 · 8×20"],
      ].flatMap(([title, tag, text, chips], i) => [
        f(`photo${i + 1}Title`, `3 · Your unit — Photo ${i + 1} title`, title),
        f(`photo${i + 1}Tag`, `3 · Your unit — Photo ${i + 1} small tag`, tag),
        f(`photo${i + 1}Text`, `3 · Your unit — Photo ${i + 1} text`, text),
        f(`photo${i + 1}Chips`, `3 · Your unit — Photo ${i + 1} chips (separate with ·)`, chips),
      ]),

      ...head(4, "Sizes & pricing", "pricing", "Sizes & pricing", "Simple pricing.", "No surprises."),
      f("pricingText", "4 · Sizes & pricing — Text", "The price you see is the price you pay. Month to month, keep it as long as you need. {deliveryFee} delivery and pickup within {deliveryRadius} of {town}."),
      f("pricingNote", "4 · Sizes & pricing — Small note under the prices", "Not sure which size? Tell us what you're storing and we'll help you choose when we call."),

      ...head(5, "How it works", "steps", "How it works", "Three simple steps.", "One phone call."),
      f("stepsText", "5 · How it works — Text", "No forms that go nowhere, no \"call for pricing\". Tell us what you need and a real person calls you back."),
      ...titled(5, "How it works", "step", [
        ["Get your free quote", "Tell us what you need. A real person responds within {callbackMinutes} minutes during business hours with your price."],
        ["We deliver and place it", "Your unit arrives for a flat {deliveryFee} within {deliveryRadius} of {town}, set exactly where you want it."],
        ["Load at your own pace", "Keep it month to month, for as long as you need. Call us when you're done."],
      ], "Step"),

      ...head(6, "What we believe", "beliefs", "What we believe", "A family business,", "not a franchise."),
      f("beliefsText", "6 · What we believe — Text", "When you call Northline, you talk to us. Honest prices, a real person on the phone, and care for every property we visit."),
      ...titled(6, "What we believe (also shown on About)", "belief", [
        ["Storage can look good.", "Your driveway deserves better than an eyesore."],
        ["Prices should be honest.", "What you see is what you pay. No hidden fees, no fine print."],
        ["People should come first.", "You'll always talk to us, not a call center."],
      ], "Belief"),

      ...head(7, "Picture it", "outcomes", "Picture it", "Your project with one less thing", "to worry about."),
      f("withLabel", "7 · Picture it — Left column title", "With Northline"),
      ...list(7, "Picture it", "with", [
        "Your furniture is safe, dry and a few steps from your door",
        "You know exactly what you're paying, from day one",
        "Your driveway still looks like part of your home",
        "A real person answers when you call",
      ], "With Northline, point"),
      f("withoutLabel", "7 · Picture it — Right column title", "Without it"),
      ...list(7, "Picture it", "without", [
        "Heat-warped furniture and damaged electronics",
        "Fees you only discover on the bill",
        "An eyesore your neighbors are counting the days on",
      ], "Without it, point"),

      ...head(8, "FAQ", "faq", "FAQ", "Questions,", "answered."),
      f("faqText", "8 · FAQ — Text (the questions themselves are in “List: FAQs”)", "Sizes, delivery, permits, buying: the things people ask us most."),

      ...seoFields(""),
    ],
  },

  about: {
    collection: "PageAbout",
    title: "Page: About",
    slug: "about",
    fields: [
      ...hero("About Northline Spaces", "A family business,", "not a franchise.", "We build storage we'd be proud to put in our own driveway."),
      ...head(2, "Our story", "story", "Our story", "Beautiful homes deserve better than", "a beat-up box."),
      f("ownerPhoto", "2 · Our story — Family photo (upload to replace the placeholder)", "", "IMAGE"),
      f("ownerName", "2 · Our story — Photo caption, name", "The Northline family"),
      f("ownerCaption", "2 · Our story — Photo caption, small line", "Founders, {town}, CA"),
      f("storyIntro", "2 · Our story — Opening line (large)", "We kept seeing the same thing: beautiful homes, and a beat-up metal storage box parked out front."),
      f("storyText1", "2 · Our story — Paragraph 1", "Storage is something almost everyone needs at some point, whether it's a move, a remodel or just a busy year. It shouldn't have to look like an afterthought."),
      f("storyText2", "2 · Our story — Paragraph 2", "So we started building our own. Units that are insulated to protect what's inside, and designed to look good outside. And we decided to run the business the way we'd want to be treated: honest prices, a real person on the phone, and care for every property we visit."),
      ...head(3, "What we believe (the three beliefs are edited on Page: Home)", "beliefs", "What we believe", "Three things", "we won't bend on."),
      ...head(4, "The name", "name", "The name", "Why the", "compass star."),
      f("nameText", "4 · The name — Text", "There's a compass star in our logo. For us it's a simple reminder: do the job right, and do it the same way every time."),
      ...seoFields("about"),
    ],
  },

  unit: {
    collection: "PageUnit",
    title: "Page: The Unit",
    slug: "unit",
    fields: [
      ...hero("Insulated portable storage units", "Built to protect your things.", "Designed to look good doing it.", "Most portable storage is a metal box. Ours is closer to a small, well-built room: insulated, secure and handsome enough for any driveway."),
      ...head(2, "Design", "design", "Designed for beautiful homes", "Built to sit in front of a home", "you're proud of."),
      f("designIntro", "2 · Design — Opening line (large)", "Charcoal ribbed siding. Warm cedar-tone trim. Clean, simple lines."),
      f("designText", "2 · Design — Text", "We designed Northline units to sit in front of a beautiful home without looking out of place, so you're never counting the days until it's gone."),
      ...head(3, "Insulation", "insulated", "Insulated, inside and out", "Inland summers are hard on", "stored belongings."),
      f("insulatedText", "3 · Insulation — Text", "Insulated walls and ceiling help keep the inside cooler and more stable, which helps protect:"),
      ...list(3, "Insulation", "protect", [
        "Wood furniture from warping and cracking",
        "Electronics and appliances from heat damage",
        "Artwork, photos and paperwork from fading and curling",
        "Clothing and fabrics from that stale, stuffy smell",
      ]),
      ...head(4, "Features (table rows are in “List: Unit features”)", "features", "Features", "What's built in,", "and what it means for you."),
      ...head(5, "Sizes", "sizes", "Choose your size", "Three sizes.", "One build quality."),
      f("sizesText", "5 · Sizes — Text", "Not sure which size? Tell us what you're storing and we'll help you choose when we call."),
      ...head(6, "Delivery", "placed", "Placed with care", "Exactly where", "you want it."),
      f("placedText", "6 · Delivery — Text", "We deliver to your driveway or jobsite and set the unit exactly where you want it. Delivery is {deliveryFee} within {deliveryRadius} of {town}. Further out, we quote the distance fee before you book."),
      ...seoFields("unit"),
    ],
  },

  pricing: {
    collection: "PagePricing",
    title: "Page: Pricing",
    slug: "pricing",
    fields: [
      ...hero("Portable storage pricing in Fallbrook", "Simple pricing.", "No surprises.", "The price you see is the price you pay. No hidden fees, no fine print, and no \"call for pricing.\""),
      ...head(2, "Rent", "rent", "Rent by the month", "Month to month.", "Keep it as long as you need."),
      f("rentText", "2 · Rent — Text (the prices are in “List: Sizes & prices”)", "Three sizes, one flat monthly price each. Most people choose the 8×16."),
      ...head(3, "Buy", "buy", "Buy your own", "Or make it", "yours for keeps."),
      f("buyText", "3 · Buy — Text", "A permanent, good-looking space for your property."),
      f("buyLink", "3 · Buy — Link text", "Learn more about buying a unit"),
      f("deliveryTitle", "4 · Extras — Card 1 title", "Delivery and pickup"),
      f("deliveryNearLead", "4 · Extras — Card 1, line 1 bold start", "Within {deliveryRadius} of {town}:"),
      f("deliveryNearText", "4 · Extras — Card 1, line 1 rest", "a flat {deliveryFee} for delivery and pickup."),
      f("deliveryFarLead", "4 · Extras — Card 1, line 2 bold start", "Beyond {deliveryRadius}:"),
      f("deliveryFarText", "4 · Extras — Card 1, line 2 rest", "we'll quote your distance fee upfront, before you book."),
      f("fullServiceTitle", "4 · Extras — Card 2 title", "Full-service moves"),
      f("fullServiceText", "4 · Extras — Card 2 text", "Want us to load and unload for you? Every move is different, so we'll put together a custom quote."),
      f("includedTitle", "4 · Extras — Card 3 title", "What's always included"),
      ...list(4, "Extras", "included", [
        "Insulated, weatherproof unit",
        "Secure locking",
        "Placement exactly where you want it",
        "A real person responds within {callbackMinutes} minutes during business hours",
      ], "Card 3, item"),
      f("upgradeLead", "4 · Extras — Card 3, optional upgrade bold start", "Optional upgrade:"),
      f("upgradeText", "4 · Extras — Card 3, optional upgrade rest", "solar-powered motion lights inside the unit, a flat $50 for the whole rental."),
      ...seoFields("pricing"),
    ],
  },

  renovation: {
    collection: "PageRenovation",
    title: "Page: Renovation Storage",
    slug: "renovation-storage",
    fields: [
      ...hero("Renovation storage in Fallbrook", "Renovating? Keep your things safe, dry and", "right outside.", "Clear the room, protect your furniture, and get to it any time, without hauling everything across town to a storage facility."),
      ...head(2, "Why homeowners choose us", "why", "Why homeowners choose Northline", "Storage that stays", "out of the way."),
      ...pairs(2, "Why homeowners choose us", "reason", [
        ["It's right outside.", "Need something mid-project? It's a few steps away."],
        ["It protects what matters.", "Insulation helps keep dust, heat and weather away from furniture, rugs and electronics."],
        ["It doesn't look like a construction site.", "Your home still looks cared for while the work gets done."],
        ["It flexes with your project.", "Renovations run long. Keep it month to month, with no penalty for extra time."],
      ]),
      ...head(3, "For businesses", "biz", "For businesses too", "Remodeling an office, shop", "or restaurant?"),
      f("bizText", "3 · For businesses — Text", "Store furniture, stock and equipment on site so you can keep things moving."),
      ...head(4, "How it works", "how", "How it works", "Four steps,", "start to finish."),
      ...list(4, "How it works", "how", [
        "Tell us your project dates and address",
        "We respond within {callbackMinutes} minutes during business hours to confirm your price",
        "We deliver for {deliveryFee} and place it where you want",
        "Load it up, then keep it as long as the project needs",
      ], "Step"),
      ...seoFields("renovation-storage"),
    ],
  },

  moving: {
    collection: "PageMoving",
    title: "Page: Moving",
    slug: "moving",
    fields: [
      ...hero("Portable moving & storage", "Move on your schedule, or let us do", "the heavy lifting.", "Load at your own pace with no rental truck and no deadline. Or let our team pack the unit for you."),
      ...head(2, "Two ways to move", "ways", "Two ways to move", "Do it yourself,", "or full service."),
      f("waysColA", "2 · Two ways to move — Table, column 1 title", "Do it yourself"),
      f("waysColB", "2 · Two ways to move — Table, column 2 title", "Full-service move"),
      ...[
        ["Who loads", "You, at your own pace", "Our team"],
        ["Who unloads", "You", "Our team"],
        ["Pricing", "Monthly rent + mileage fee (custom quote)", "Custom quote"],
        ["Best for", "Flexible timelines, saving money", "Busy families, heavy furniture, people who'd rather not lift a thing"],
      ].flatMap(([k, a, b], i) => [
        f(`row${i + 1}Label`, `2 · Two ways to move — Row ${i + 1}, label`, k),
        f(`row${i + 1}A`, `2 · Two ways to move — Row ${i + 1}, do it yourself`, a),
        f(`row${i + 1}B`, `2 · Two ways to move — Row ${i + 1}, full service`, b),
      ]),
      ...head(3, "Why move with us", "why", "Why move with Northline", "Less hauling.", "Less hurry."),
      ...pairs(3, "Why move with us", "reason", [
        ["No rental truck.", "No white-knuckle driving, no rushed return."],
        ["Load at ground level.", "No steep ramps."],
        ["Double wall construction.", "Sturdy aluminum walls protect your things on the road."],
        ["Insulated protection.", "Your things travel and wait in a more stable environment."],
      ]),
      ...head(4, "Mileage fee", "distance", "Mileage fee", "Every move includes a mileage fee,", "quoted upfront."),
      f("distanceText", "4 · Mileage fee — Text", "Moves are priced by distance, so you get a custom quote before you book, never after. Tell us where you're headed and we'll confirm it on the call."),
      ...seoFields("moving"),
    ],
  },

  jobsite: {
    collection: "PageJobsite",
    title: "Page: Jobsite Storage",
    slug: "jobsite-storage",
    fields: [
      ...hero("Jobsite storage containers", "Secure, insulated storage", "right on your jobsite.", "Keep tools, materials and equipment safe, dry and close, so your crew spends less time hauling and more time building."),
      ...head(2, "Built for contractors", "pros", "Built for contractors", "Everything on site,", "nothing in the truck."),
      ...pairs(2, "Built for contractors", "reason", [
        ["Secure.", "Lockable and solid, to help keep tools and materials safe overnight."],
        ["Insulated.", "Helps protect heat-sensitive materials, adhesives, finishes and electronics."],
        ["Looks professional.", "A clean unit on site reflects well on your business, especially in upscale neighborhoods."],
        ["Easy access.", "Wide roll-up door, plus a walk-in side door on select sizes."],
        ["Doubles as a site office.", "With a window and side door, the larger units work as a simple on-site workspace."],
      ]),
      ...head(3, "Flexible terms", "terms", "Flexible terms", "Month to month, for as long as", "the job runs."),
      f("termsText", "3 · Flexible terms — Text", "Working on more than one site? Ask about multiple units."),
      ...seoFields("jobsite-storage"),
    ],
  },

  buy: {
    collection: "PageBuy",
    title: "Page: Buy a Unit",
    slug: "buy",
    fields: [
      ...hero("Buy a portable storage unit", "Make it", "yours.", "A permanent, good-looking space for your property. Insulated, secure and built by our family."),
      ...head(2, "Uses", "uses", "What people use theirs for", "More than", "storage."),
      ...list(2, "Uses", "use", [
        "Extra storage for the garage overflow",
        "A workshop or hobby space",
        "Garden and outdoor equipment storage",
        "A simple backyard office",
        "Permanent storage on a farm, ranch or business property",
      ]),
      ...head(3, "Prices", "prices", "Prices", "Three sizes,", "transparent prices."),
      f("pricesText", "3 · Prices — Text (the prices are in “List: Sizes & prices”)", "Delivery is {deliveryFee} within {deliveryRadius} of {town}. Further away, we'll quote your distance fee upfront."),
      ...titled(4, "Extras", "extra", [
        ["Renting first?", "Try before you buy. Rent a unit, and if you love it, ask us about buying it."],
        ["Good to know", "A permanent unit may be treated differently from a temporary one by your city or HOA. We recommend checking local rules before you buy."],
        ["Built by our family", "Made with care in {town}, not mass-produced. All-metal siding and roof give greater fire resistance."],
      ]),
      ...seoFields("buy"),
    ],
  },

  faq: {
    collection: "PageFaq",
    title: "Page: FAQ",
    slug: "faq",
    fields: [
      ...hero("Portable storage FAQ", "Questions?", "We've got answers.", "Sizes, pricing, delivery, permits and buying: the things people ask us most. Don't see yours? Ask us anything when we call.", false),
      ...seoFields("faq"),
    ],
  },

  quote: {
    collection: "PageQuote",
    title: "Page: Get a Quote",
    slug: "quote",
    fields: [
      ...hero("Free portable storage quote", "Get your", "free quote.", "Tell us what you need. We'll respond within {callbackMinutes} minutes during business hours with your price, no obligation.", false),
      f("nextLabel", "2 · Form — Steps, small label", "What happens next"),
      ...pairs(2, "Form", "next", [
        ["We respond", "within {callbackMinutes} minutes during business hours to confirm your price"],
        ["We book your delivery", "for a date that works for you"],
        ["We deliver it", "and place it exactly where you want"],
      ]),
      f("formNote", "2 · Form — Small print under the button", "We'll respond within {callbackMinutes} minutes during business hours ({businessHours}). Outside those hours, first thing the next morning. Your details stay with us. No spam, ever."),
      f("thanksTitle", "2 · Form — Thank-you message, title", "Thanks, we've got your request."),
      f("thanksText", "2 · Form — Thank-you message, text", "Keep your phone close. We'll respond within {callbackMinutes} minutes during business hours."),
      ...seoFields("quote"),
    ],
  },

  contact: {
    collection: "PageContact",
    title: "Page: Contact",
    slug: "contact",
    fields: [
      ...hero("Contact Northline Spaces", "Get in", "touch.", "Questions about a unit, a booking or anything else? Call, email or send us a message.", false),
      f("waysLabel", "2 · Ways to reach us — Small label", "Ways to reach us"),
      f("callTitle", "2 · Ways to reach us — Phone, title (the number is in Site-wide: Business details)", "Call or text"),
      f("email1Label", "2 · Ways to reach us — Email 1, what it's for", "General questions"),
      f("email1", "2 · Ways to reach us — Email 1, address", "info@northlinespaces.com"),
      f("email2Label", "2 · Ways to reach us — Email 2, what it's for", "Sales and buying a unit"),
      f("email2", "2 · Ways to reach us — Email 2, address", "sales@northlinespaces.com"),
      f("hoursTitle", "2 · Ways to reach us — Hours, title (hours are in Site-wide: Business details)", "Business hours"),
      f("hoursText", "2 · Ways to reach us — Hours, note", "We respond within {callbackMinutes} minutes during business hours."),
      f("areaTitle", "2 · Ways to reach us — Area, title", "Where we deliver"),
      f("areaText", "2 · Ways to reach us — Area, text", "Based in {town}, serving Southern California."),
      f("quoteLead", "2 · Ways to reach us — Quote nudge, bold start", "Need a price?"),
      f("quoteText", "2 · Ways to reach us — Quote nudge, rest", "The free quote form is the fastest way to get one."),
      f("formTitle", "3 · Message form — Title", "Send us a message"),
      f("formNote", "3 · Message form — Small print under the button", "We respond within {callbackMinutes} minutes during business hours ({businessHours}). Your details stay with us. No spam, ever."),
      f("thanksTitle", "3 · Message form — Thank-you message, title", "Thanks, we've got your message."),
      f("thanksText", "3 · Message form — Thank-you message, text", "We'll get back to you within {callbackMinutes} minutes during business hours."),
      ...seoFields("contact"),
    ],
  },
} satisfies Record<string, PageDef>;

export type PageId = keyof typeof pages;

/** Site-wide fields added to the existing "Site Settings" collection (closing CTA + footer). */
export const siteWideFields: Field[] = [
  f("closingAvailability", "Closing section (bottom of every page) — Small line above", "(Now delivering across Southern California)"),
  f("closingHeading", "Closing section — Heading", "Ready for storage that"),
  f("closingAccent", "Closing section — Heading, bronze part", "looks the part?"),
  f("closingText", "Closing section — Text", "Get your price within {callbackMinutes} minutes during business hours, and get your driveway back to looking like home."),
  f("footerBlurb", "Footer — Short description under the logo", "Beautiful, insulated storage. Delivered to your door."),
];

/** Page slug ("" = home) → page id, for the layout's SEO lookup. */
export const pageIdBySlug: Record<string, PageId> = Object.fromEntries(
  Object.entries(pages).map(([id, p]) => [p.slug, id as PageId])
);
