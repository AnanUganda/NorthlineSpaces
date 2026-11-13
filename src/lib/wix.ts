import { OAuthStrategy } from "@wix/sdk";

// Re-exported so pages only need to import from this one module.
export { createClient } from "@wix/sdk";

/**
 * Public Wix OAuth client id for the Northline headless site
 * (metaSiteId 5f03d924-…, the migration project that takes over
 * northlinespaces.com).
 *
 * This id is PUBLIC — it is safe to commit and ship to the browser. On its own
 * it only grants anonymous "visitor" access, i.e. read access to published
 * content. The client *secret* and any API key are admin credentials and must
 * NEVER live in this repo or be sent to the browser.
 */
export const WIX_CLIENT_ID = "a9a67701-6409-4381-ab78-5a1c108d9419";

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
