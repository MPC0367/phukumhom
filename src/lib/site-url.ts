/**
 * Where the site lives, and the one way an absolute URL is built from that.
 *
 * Three facts decide every absolute address the site prints (canonicals, hreflang, Open Graph, JSON-LD,
 * the sitemap, the social image):
 *
 *   origin         the scheme and host: "https://mpc0367.github.io", later the resort's own domain
 *   basePath       the folder a project site is served under: "/phukumhom" on GitHub Pages, "" on a domain
 *   trailingSlash  whether a page's address ends in "/": true for the static export (every route is a
 *                  folder with an index.html), false for the Node server
 *
 * They are kept apart on purpose. The earlier build passed "origin + basePath" as one string and read it
 * back with `new URL(value).origin`, which silently drops the path: every canonical, alternate, social
 * image and sitemap entry then pointed at the host root and answered 404. Nothing here resolves a path
 * against a URL (`new URL("/en/", "https://host/phukumhom/")` discards "/phukumhom" too): addresses are
 * joined as strings, and a path that already carries the base path is never given it twice.
 *
 * This module has no imports, so it can be tested with plain Node:
 *   node --test tests/                        (tests/site-url.test.mjs)
 */

export interface SiteUrlInput {
  /** An http(s) address. A path on it is tolerated and treated as the base path when none is given. */
  origin: string | null | undefined;
  /** "", "/phukumhom", "phukumhom/": normalised to "" or "/segment". */
  basePath?: string | null;
  trailingSlash?: boolean;
}

export interface SiteUrls {
  origin: string;
  basePath: string;
  trailingSlash: boolean;
  /** origin + basePath, with no trailing slash: "https://mpc0367.github.io/phukumhom". */
  root: string;
  /** The absolute address of a page, given its path from the site root ("/en/stay"). No query, no fragment. */
  page(path: string): string;
  /** The absolute address of a file ("/og/card.jpg", "/sitemap.xml"). Never gains a trailing slash. */
  asset(path: string): string;
}

/** "" or "/segment[/segment]": a leading slash, no trailing slash, no empty or dot segments. */
export function cleanBasePath(value: string | null | undefined): string {
  if (!value) return "";
  const segments = value
    .trim()
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..");
  return segments.length > 0 ? `/${segments.join("/")}` : "";
}

/** The scheme and host of an http(s) address, and whatever path it carried. `null` when it is not one. */
export function splitOrigin(value: string | null | undefined): { origin: string; path: string } | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { origin: url.origin, path: cleanBasePath(url.pathname) };
  } catch {
    return null;
  }
}

/** True when `path` already sits under the base path ("/phukumhom" or "/phukumhom/…"). */
function underBase(path: string, basePath: string): boolean {
  return basePath !== "" && (path === basePath || path.startsWith(`${basePath}/`));
}

/** "/en/stay?x=1#top" → "/en/stay"; "en/stay" → "/en/stay"; "" → "/". Repeated slashes collapse. */
function cleanPath(path: string): string {
  const bare = path.replace(/[?#].*$/, "").replace(/\/{2,}/g, "/");
  return bare.startsWith("/") ? bare : `/${bare}`;
}

/**
 * The URL builder for one deployment. Returns `null` when the origin is not a usable http(s) address,
 * so a caller can fall back to another source rather than print a made-up host.
 */
export function createSiteUrls(input: SiteUrlInput): SiteUrls | null {
  const parts = splitOrigin(input.origin);
  if (!parts) return null;
  const basePath = cleanBasePath(input.basePath) || parts.path;
  const trailingSlash = input.trailingSlash === true;
  const root = `${parts.origin}${basePath}`;

  const join = (path: string): string => {
    const clean = cleanPath(path);
    return underBase(clean, basePath) ? `${parts.origin}${clean}` : `${root}${clean}`;
  };

  return {
    origin: parts.origin,
    basePath,
    trailingSlash,
    root,
    page(path) {
      const url = join(path).replace(/\/+$/, "");
      // The site root itself always ends in a slash; every other page follows the deployment's convention.
      if (url === root) return `${root}/`;
      return trailingSlash ? `${url}/` : url;
    },
    asset(path) {
      return join(path);
    },
  };
}
