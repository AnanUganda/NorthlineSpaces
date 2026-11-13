import { OAuthStrategy } from "@wix/sdk";

// Re-exported so pages only need to import from this one module.
export { createClient } from "@wix/sdk";

/**
 * Public Wix OAuth client id of the Northline site (metaSiteId 407e3184-…,
 * northlinespaces.com). This is the site that owns the business data, the
 * domain and the Premium plan; after the headless migration it also serves
 * this frontend.
 *
 * This id is PUBLIC — it is safe to commit and ship to the browser. On its own
 * it only grants anonymous "visitor" access, i.e. read access to published
 * content. The client *secret* and any API key are admin credentials and must
 * NEVER live in this repo or be sent to the browser.
 */
export const WIX_CLIENT_ID = "394b74a7-9238-42ab-9142-5542181b68fb";

/** Anonymous (visitor) auth strategy for the Northline site. */
export const wixAuth = () => OAuthStrategy({ clientId: WIX_CLIENT_ID });

/**
 * Build a Wix client wherever you need live data. Install the solution
 * module(s) you want first, e.g.:
 *
 *   npm install @wix/bookings
 *
 * Then, in a page or a React island:
 *
 *   import { services } from "@wix/bookings";
 *   import { createClient, wixAuth } from "../lib/wix";
 *
 *   const wix = createClient({ modules: { services }, auth: wixAuth() });
 *   const { items } = await wix.services.queryServices().find();
 */
