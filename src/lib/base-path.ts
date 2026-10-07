/**
 * The path prefix the site is served under: "" at a domain root, "/phukumhom" on a GitHub Pages
 * project site. Set by next.config.ts from the BASE_PATH environment variable.
 *
 * Next adds the prefix to <Link> and to its own build assets, but NOT to a raw <img src="/media/…">,
 * a raw <a href="/…"> or a URL written into a srcset. Anything that points at a file in /public by hand
 * goes through `withBase()`.
 */
export const BASE_PATH: string = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function withBase(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  return path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) ? path : `${BASE_PATH}${path}`;
}
