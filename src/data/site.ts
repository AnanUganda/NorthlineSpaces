/**
 * Northline Spaces — single source of truth for site content.
 *
 * Everything the pages render comes from here, so copy, prices and FAQs are
 * edited in one place. Values that the client still needs to confirm are
 * listed in `placeholders` at the bottom (they're used as-is on the site until
 * replaced).
 */

import heroDriveway from "../assets/images/hero-driveway.jpg";
import unitOpenInterior from "../assets/images/unit-open-interior.jpg";
import detailBadgeTrim from "../assets/images/detail-badge-trim.jpg";
import unitStudioAngle from "../assets/images/unit-studio-angle.jpg";
import unitStudioFront from "../assets/images/unit-studio-front.jpg";
import logoLockupDark from "../assets/images/logo-lockup-dark.jpg";
import renovationLoaded from "../assets/images/renovation-loaded.jpg";
import gardenWorkshop from "../assets/images/garden-workshop.jpg";
import estateAerial from "../assets/images/estate-aerial.jpg";

export const images = {
  heroDriveway,
  unitOpenInterior,
  detailBadgeTrim,
  unitStudioAngle,
  unitStudioFront,
  logoLockupDark,
  /** Loaded unit outside a home mid-renovation (papered windows). */
  renovationLoaded,
  /** Unit in a backyard garden, side door open on a workshop. */
  gardenWorkshop,
  /** Aerial of a unit on an estate courtyard. */
  estateAerial,
};

/* ------------------------------------------------------------------ */
/* Routing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Builds a page URL. In production the site is built with
 * `build.format: "file"` for Wix static hosting, which serves `pricing.html`
 * rather than `/pricing/`, so links get a `.html` suffix. In dev, Astro
 * routes cleanly without it. This is the one place to change if hosting moves.
 */
export const href = (slug: string): string =>
  slug === "" ? "/" : `/${slug}${import.meta.env.PROD ? ".html" : ""}`;

export type NavItem = { slug: string; label: string; short?: string };

export const nav: NavItem[] = [
  { slug: "", label: "Home" },
  { slug: "unit", label: "The Unit" },
  { slug: "pricing", label: "Pricing" },
  { slug: "renovation-storage", label: "Renovation Storage", short: "Renovation" },
  { slug: "moving", label: "Moving" },
  { slug: "jobsite-storage", label: "Jobsite Storage", short: "Jobsite" },
  { slug: "buy", label: "Buy a Unit" },
  { slug: "about", label: "About" },
  { slug: "faq", label: "FAQ" },
  { slug: "quote", label: "Get a Quote" },
];

/** Links shown inline in the desktop header (the overlay menu shows all). */
export const headerLinks = ["unit", "pricing", "moving", "about", "faq"];

/* ------------------------------------------------------------------ */
/* Business facts                                                      */
/* ------------------------------------------------------------------ */

export const business = {
  name: "Northline Spaces",
  wordmark: "Northline",
  tagline: "Spaces delivered",
  town: "Fallbrook",
  region: "North County San Diego",
  area: "Fallbrook & North County San Diego",
  state: "CA",
  callbackMinutes: 15,
  hours: "Mon–Sat, 8am–6pm",
  deliveryFee: "$99",
  deliveryRadius: "10 miles",
  founded: 2026,
};

export type Size = {
  id: string;
  name: string;
  fits: string;
  fitsShort: string;
  rent: string;
  buy: string;
  featured?: boolean;
};

export const sizes: Size[] = [
  {
    id: "8x12",
    name: "8×12",
    fits: "A studio or one-bedroom, or one to two rooms",
    fitsShort: "Studio or one-bedroom",
    rent: "$179",
    buy: "$5,500",
  },
  {
    id: "8x16",
    name: "8×16",
    fits: "A two- to three-bedroom home",
    fitsShort: "Two- to three-bedroom home",
    rent: "$229",
    buy: "$6,900",
    featured: true,
  },
  {
    id: "8x20",
    name: "8×20",
    fits: "A three- to four-bedroom home, or a whole-house renovation",
    fitsShort: "Three- to four-bedroom home",
    rent: "$279",
    buy: "$8,500",
  },
];

/* ------------------------------------------------------------------ */
/* Audiences (the four services)                                       */
/* ------------------------------------------------------------------ */

export type Audience = {
  slug: string;
  index: "A" | "B" | "C" | "D";
  title: string;
  short: string;
  blurb: string;
  tags: string[];
  image: ImageMetadata;
};

export const audiences: Audience[] = [
  {
    slug: "renovation-storage",
    index: "A",
    title: "Renovation storage",
    short: "Renovation",
    blurb:
      "Clear the room, protect your furniture, and get to it any time — a few steps from the work, not across town.",
    tags: ["Homeowners", "Businesses", "Month to month"],
    image: renovationLoaded,
  },
  {
    slug: "moving",
    index: "B",
    title: "Moving",
    short: "Moving",
    blurb:
      "Load at your own pace with no rental truck and no deadline, or let our team do the heavy lifting.",
    tags: ["Self-move", "Full service", "No deadline"],
    image: unitOpenInterior,
  },
  {
    slug: "jobsite-storage",
    index: "C",
    title: "Jobsite storage",
    short: "Jobsite",
    blurb:
      "Secure, insulated storage right on site, so your crew spends less time hauling and more time building.",
    tags: ["Contractors", "Secure", "Looks professional"],
    image: unitStudioAngle,
  },
  {
    slug: "buy",
    index: "D",
    title: "Buy a unit",
    short: "Buy a unit",
    blurb:
      "A permanent, good-looking space for your property — insulated, secure and built by our family.",
    tags: ["Own it", "Workshop", "Backyard office"],
    image: gardenWorkshop,
  },
];

/* ------------------------------------------------------------------ */
/* Shared blocks                                                       */
/* ------------------------------------------------------------------ */

export const closing = {
  title: ["Ready for storage that", "looks the part?"],
  sub: "We'll call you within 15 minutes with your price.",
  button: "Get My Free Quote",
  secondary: "See pricing",
  availability: "(Now delivering across Fallbrook & North County)",
  facts: [
    { no: "(01)", value: "15 minutes", label: "to a real person with your price" },
    { no: "(02)", value: "Fallbrook & North County", label: "delivered to your driveway or jobsite" },
    { no: "(03)", value: "From $179 / month", label: "$99 delivery within 10 miles" },
  ],
};

export const beliefs = [
  {
    title: "Storage can look good.",
    desc: "Your driveway deserves better than an eyesore.",
  },
  {
    title: "Prices should be honest.",
    desc: "What you see is what you pay. No hidden fees, no fine print.",
  },
  {
    title: "People should come first.",
    desc: "You'll always talk to us, not a call center.",
  },
];

export const process = [
  {
    title: "Tell us what you need",
    desc: "Your project dates, your address and what you're storing. Not sure on size? We'll help you choose.",
  },
  {
    title: "We call within 15 minutes",
    desc: "A real person confirms your price during business hours — no obligation, no 'call for pricing'.",
  },
  {
    title: "We deliver and place it",
    desc: "A flat $99 within 10 miles of Fallbrook. We set the unit exactly where you want it.",
  },
  {
    title: "Keep it as long as you need",
    desc: "Month to month, with no penalty for extra time. Projects run long — your storage flexes with them.",
  },
];

export const features: { feature: string; benefit: string }[] = [
  { feature: "Insulated walls and ceiling", benefit: "A more stable temperature for your belongings" },
  { feature: "Wide roll-up door", benefit: "Easy, ground-level loading, no ramps to wrestle" },
  { feature: "Window", benefit: "Natural light, so you can see what you're doing" },
  { feature: "Walk-in side door", benefit: "Grab something without opening the main door" },
  { feature: "Secure locking", benefit: "Your things stay safe" },
  { feature: "Weatherproof build", benefit: "Dry inside, whatever the weather" },
  { feature: "Built by our family", benefit: "Made with care, not mass-produced" },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type FaqItem = { q: string; a: string; home?: boolean };
export type FaqGroup = { group: string; items: FaqItem[] };

export const faq: FaqGroup[] = [
  {
    group: "Choosing a unit",
    items: [
      {
        q: "Which size do I need?",
        a: "Most one-bedroom moves fit in an 8×12, two to three bedrooms in an 8×16, and larger homes in an 8×20. Not sure? We'll help you choose when we call.",
        home: true,
      },
      {
        q: "What does insulated actually protect against?",
        a: "Heat and big temperature swings, which can warp wood furniture and damage electronics, artwork and documents — especially during inland San Diego County summers.",
        home: true,
      },
      {
        q: "Can I see a unit before I book?",
        a: "Ask us when we call — we're happy to arrange a look.",
      },
    ],
  },
  {
    group: "Pricing and payment",
    items: [
      {
        q: "Are there any hidden fees?",
        a: "No. You pay the monthly rent, plus $99 for delivery and pickup within 10 miles of Fallbrook. Beyond that, we'll quote your distance fee before you book.",
        home: true,
      },
      {
        q: "Is there a minimum rental period?",
        a: "Units are month to month. We'll confirm any minimum when we call with your price.",
      },
      {
        q: "How do I pay?",
        a: "We'll walk you through payment options when we confirm your booking.",
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      {
        q: "How much space do I need for delivery?",
        a: "Enough firm, level ground for the unit plus room for our truck to place it. Tell us about your driveway when we call and we'll confirm it fits.",
      },
      {
        q: "Where can you place the unit?",
        a: "On a driveway or other firm, level surface. Ask us about other spots — we'll tell you what works.",
      },
      {
        q: "Do I need a permit or HOA approval?",
        a: "Usually not, if the unit sits on your own driveway. Some HOAs and towns have their own rules, so it's worth a quick check. We're happy to help.",
        home: true,
      },
      {
        q: "Do I need to be home for delivery?",
        a: "It helps, so we can place the unit exactly where you want it. If you can't be there, we'll agree the spot in advance.",
      },
    ],
  },
  {
    group: "Using your unit",
    items: [
      {
        q: "How long can I keep it?",
        a: "As long as you need, month to month.",
        home: true,
      },
      {
        q: "Can I move it once it's loaded?",
        a: "Yes. We can move it to your new home. We'll confirm distances when we quote.",
      },
      {
        q: "Is it secure?",
        a: "Yes. Units lock securely, with a solid build that helps keep tools, furniture and belongings safe overnight.",
      },
      {
        q: "What can't I store?",
        a: "For safety, no hazardous, flammable or perishable items, and no people or pets.",
      },
    ],
  },
  {
    group: "Buying",
    items: [
      {
        q: "Can I buy the unit I'm renting?",
        a: "Ask us — if you love it, we'll talk you through buying it.",
      },
    ],
  },
];

export const homeFaq: FaqItem[] = faq.flatMap((g) => g.items).filter((i) => i.home);

/* ------------------------------------------------------------------ */
/* Quote form                                                          */
/* ------------------------------------------------------------------ */

export const quoteForm = {
  needs: ["Storage", "Moving", "Storage and moving", "Buy a unit", "Full-service move"],
  sizes: ["8×12", "8×16", "8×20", "Not sure"],
  button: "Get My Free Quote",
  note: "We'll call you within 15 minutes during business hours (Mon–Sat, 8am–6pm). Outside those hours, first thing the next morning. Your details stay with us. No spam, ever.",
  next: [
    { title: "We call you", desc: "within 15 minutes to confirm your price" },
    { title: "We book your delivery", desc: "for a date that works for you" },
    { title: "We deliver it", desc: "and place it exactly where you want" },
  ],
  thanks: {
    title: "Thanks, we've got your request.",
    body: "Keep your phone close. We'll call you within 15 minutes during business hours.",
  },
};

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export const seo: Record<string, { title: string; description: string }> = {
  "": {
    title: "Northline Spaces | Insulated Portable Storage in Fallbrook",
    description:
      "Insulated portable storage units that look good in any driveway. Rent by the month or buy. $99 delivery within 10 miles of Fallbrook. We call within 15 minutes.",
  },
  unit: {
    title: "Insulated Portable Storage Units | Northline Spaces",
    description:
      "Insulated, weatherproof storage units designed to look good in any driveway. Three sizes, built by a Fallbrook family.",
  },
  pricing: {
    title: "Portable Storage Pricing in Fallbrook | Northline Spaces",
    description:
      "Transparent pricing for portable storage rental and purchase. $99 delivery within 10 miles of Fallbrook. No hidden fees.",
  },
  "renovation-storage": {
    title: "Renovation Storage in Fallbrook | Northline Spaces",
    description:
      "Keep furniture safe and close during your remodel with insulated portable storage delivered to your driveway.",
  },
  moving: {
    title: "Portable Storage for Moving | Northline Spaces",
    description:
      "Load at your own pace or let us do it. Portable moving and storage in Fallbrook and North County.",
  },
  "jobsite-storage": {
    title: "Jobsite Storage Containers | Northline Spaces",
    description:
      "Secure, insulated jobsite storage for contractors in Fallbrook and North County San Diego.",
  },
  buy: {
    title: "Buy a Portable Storage Unit | Northline Spaces",
    description:
      "Own a premium insulated storage unit for your property. Three sizes, transparent prices.",
  },
  about: {
    title: "About Our Family | Northline Spaces",
    description:
      "A Fallbrook family building storage that looks good, with honest prices and real service.",
  },
  faq: {
    title: "Portable Storage FAQ | Northline Spaces",
    description: "Answers on sizes, pricing, delivery, permits and buying a unit.",
  },
  quote: {
    title: "Get a Free Storage Quote | Northline Spaces",
    description:
      "Request a free quote and we'll call you within 15 minutes during business hours.",
  },
};

/* ------------------------------------------------------------------ */
/* Still to confirm with the client                                    */
/* ------------------------------------------------------------------ */

/** Draft values used on the site until the client confirms them. */
export const placeholders = [
  "Rental and purchase prices, and what each size fits",
  "Which sizes have the window and side door",
  "Minimum rental period, payment methods, and whether a lock is included",
  "Delivery method and space needed for delivery",
  "Whether units can be stored at a Northline yard",
  "How far they'll move units",
  "Whether rent can go toward buying a unit",
  "Any contractor or multi-unit pricing",
  "Business hours, phone and email",
  "Family story, the meaning of the name, and a family photo",
  "Whether customers can view a unit in person",
];
