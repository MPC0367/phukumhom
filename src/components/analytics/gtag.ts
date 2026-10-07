import { reportablePageUrl, type CleanEvent } from "@/lib/analytics";

/**
 * The Google Analytics 4 transport. Browser-only functions, called from <AnalyticsRoot> effects.
 *
 * Nothing in this file runs until the visitor has accepted measurement: `startGtag()` is what first
 * creates `window.dataLayer` and adds the gtag.js <script>. Before that there is no request to
 * Google, no cookie and no global.
 *
 * Settings chosen here and why:
 *   - advertising storage, ad user data and ad personalisation are always "denied" — this site
 *     measures visits, it does not advertise;
 *   - Google signals and ad-personalisation signals are switched off;
 *   - automatic page views are off: page views are sent by hand with a cleaned address (path plus
 *     campaign parameters only), and that address is set for every later event as well.
 */

type GtagArgs = [command: string, ...rest: unknown[]];

/** The globals gtag.js reads: its queue, its entry point, and the documented per-stream opt-out flag. */
type GtagGlobals = {
  dataLayer?: unknown[];
  gtag?: (...args: GtagArgs) => void;
} & Record<`ga-disable-${string}`, boolean | undefined>;

const SCRIPT_ID = "pkh-gtag";
const SCRIPT_SRC = "https://www.googletagmanager.com/gtag/js";

let started = false;

function globals(): GtagGlobals {
  return window as unknown as GtagGlobals;
}

function gtag(...args: GtagArgs): void {
  globals().gtag?.(...args);
}

/** Creates the queue, declares consent and loads gtag.js. Safe to call again: it only re-enables. */
export function startGtag(measurementId: string): void {
  const g = globals();
  g[`ga-disable-${measurementId}`] = false;
  if (started) {
    gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  started = true;

  const queue: unknown[] = (g.dataLayer = g.dataLayer ?? []);
  // gtag.js only understands the `arguments` object itself on the queue, not an array copy of it.
  g.gtag = function gtagQueue() {
    // eslint-disable-next-line prefer-rest-params
    queue.push(arguments);
  };

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: reportablePageUrl(window.location),
  });

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `${SCRIPT_SRC}?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
}

/** Expires the analytics cookies (_ga, _ga_<stream>, _gid, _gat…) on this host and its parent domains. */
function clearAnalyticsCookies(): void {
  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0]?.trim() ?? "")
    .filter((name) => /^_(ga|gid|gat)(_|$)/.test(name));
  if (names.length === 0) return;
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i += 1) domains.push(`.${labels.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}; SameSite=Lax`;
    }
  }
}

/**
 * Stops measurement: used when the visitor rejects, withdraws an earlier acceptance, or has made no
 * choice. Sets the opt-out flag Google documents for a measurement id, withdraws storage consent if
 * the tag was loaded on this page, and removes analytics cookies left by an earlier acceptance.
 */
export function stopGtag(measurementId: string): void {
  globals()[`ga-disable-${measurementId}`] = true;
  if (started) gtag("consent", "update", { analytics_storage: "denied" });
  clearAnalyticsCookies();
}

/** The destination handed to `connectAnalytics()`: one allow-listed event, as built by `sanitizeEvent`. */
export function sendToGtag(event: CleanEvent): void {
  gtag("event", event.name, event.params);
}

/** A page view with the cleaned address. Also pins that address for the events that follow on this page. */
export function sendPageView(language: string): void {
  const pageLocation = reportablePageUrl(window.location);
  gtag("set", { page_location: pageLocation });
  gtag("event", "page_view", { page_location: pageLocation, language });
}
