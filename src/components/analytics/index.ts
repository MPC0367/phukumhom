/**
 * Measurement and consent — everything a layout or footer needs:
 *
 *   import { AnalyticsRoot, ConsentBanner, ConsentSettingsLink } from "@/components/analytics";
 *
 * All three render nothing while analytics is not configured (see docs/INTEGRATIONS.md).
 * To record an event from a client component, import `track` from "@/lib/analytics".
 */
export { AnalyticsRoot } from "./AnalyticsRoot";
export { ConsentBanner } from "./ConsentBanner";
export { ConsentSettingsLink } from "./ConsentSettingsLink";
