/**
 * Whether a navigation item stands for the page being shown. A plain module (no "use client", no
 * content imports) so the client islands that mark the current page can share it without pulling
 * the string tables or the site settings into their bundle.
 */

export type CurrentState = "page" | "section" | null;

/**
 * `path` is the locale-prefixed path an item links to ("/th/stay"), or `null` for an item that is
 * an anchor inside another page ("Our story") and so is never the current page.
 *
 *   "page"     the pathname is exactly this path
 *   "section"  the pathname is beneath it ("/th/stay/deluxe-bathtub" under "/th/stay")
 */
export function currentState(pathname: string | null, path: string | null): CurrentState {
  if (!pathname || !path) return null;
  const here = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (here === path) return "page";
  // A locale root ("/th") is a prefix of every page, so only an exact match counts for it.
  if (/^\/[a-z]{2}$/.test(path)) return null;
  return here.startsWith(`${path}/`) ? "section" : null;
}

/** The value for `aria-current`: the page itself, or "true" for the section a deeper page sits in. */
export function ariaCurrent(state: CurrentState): "page" | "true" | undefined {
  if (state === "page") return "page";
  if (state === "section") return "true";
  return undefined;
}
