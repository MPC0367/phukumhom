# Next.js 16.3.5 — verified notes for this build

Checked 7 Oct 2026 against what is installed: `next` 16.3.5, `react` 19.2.8, `eslint-plugin-react-hooks` 7.1.1.
**Nothing here was executed** (the dev server is off-limits to tasks): every line is read from the shipped docs or source.
`D/` = `node_modules/next/dist/docs/01-app/` · `F/` = `D/03-api-reference/03-file-conventions/` · `C/` = `D/03-api-reference/05-config/01-next-config-js/` · `S/` = `node_modules/next/dist/`. "(src)" = read in source, not stated in the docs.
`cacheComponents` is **off** here (opt-in flag), so every "With Cache Components" paragraph in the docs does not apply.

## 1. File conventions

```tsx
// src/app/[lang]/layout.tsx — the root layout. There is no src/app/layout.tsx.
import "../globals.css";
import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/i18n/config";

export function generateStaticParams() { return LOCALES.map((lang) => ({ lang })); }

export default async function RootLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;            // string, never Locale — see §2
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <html lang={lang} data-scroll-behavior="smooth"><body>{children}</body></html>;
}
```
```tsx
// src/app/[lang]/[...rest]/page.tsx
import { notFound } from "next/navigation";
export default function CatchAll() { notFound(); }

// src/app/[lang]/error.tsx
"use client";
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) { /* … */ }
```
- Allowed: "The root layout can be under a dynamic segment … `app/[lang]/layout.js`". Any layout with no layout above it is a root layout and **must** render `<html>` and `<body>`; never hand-write `<head>` tags. `F/layout.md` §Root Layout.
- `/th` ↔ `/en` is a soft (client) navigation: root-layout identity ignores param values (src `S/client/components/router-reducer/is-navigating-to-new-root-layout.js`).
- Status code: `notFound()` → **404 if the response is not streamed, 200 once streaming has begun**; `<meta name="robots" content="noindex">` is injected either way. `F/not-found.md`, `F/loading.md` §Status Codes.
- `not-found.tsx` receives **no props**. To know the language: `import { lang } from "next/root-params"` then `await lang()` (Server Components only, added 16.3.0, no flag) or a client component with `useParams()`. It may export `metadata`; the page's metadata is discarded (src `S/lib/metadata/resolve-metadata.js` `collectMetadata`). `D/03-api-reference/04-functions/next-root-params.md`.
- `error.tsx` must be a Client Component. Props: `error`, `retry` (stable since 16.3.0: refetch + re-render), `reset` (re-render only). It does not wrap the layout of its own segment; root-layout errors need `app/global-error.tsx` with its own `<html>/<body>`. `F/error.md`.
- **Trap:** no `[lang]/loading.tsx`, and no `<Suspense>` above a `notFound()` call — streaming starts and unknown URLs answer 200.
- **Trap:** never `export const dynamicParams = false` from `[lang]/layout.tsx`. A route's flag is "every segment `!== false`" (src `S/build/static-paths/app.js:672`), so it would also govern `[...rest]`: unknown URLs would 404 without rendering our localized `not-found.tsx`.
- **Trap:** `notFound()` thrown *by the layout* (bad `lang`) cannot reach `[lang]/not-found.tsx` (the layout wraps it) → Next's bare built-in 404. Only proxy-excluded paths get there (`/media/missing.webp`, `/favicon.ico` when no icon file exists).
- **Trap:** `try/catch` around `notFound()` swallows it. `D/03-api-reference/04-functions/not-found.md`.

## 2. `params` / `searchParams` are Promises

```tsx
type Props = {
  params: Promise<{ lang: string; room: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;  // pages only; touching it = dynamic
};
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang, room } = await params; /* … */ }
export default async function Page({ params }: Props) { const { lang, room } = await params; /* … */ }
// generateStaticParams gets the PARENT segment's params, synchronously:
export function generateStaticParams({ params }: { params: { lang: string } }) { /* … */ }
// route handlers: (request, ctx: { params: Promise<{…}> })
```
- Synchronous access is fully removed in 16. `D/02-guides/upgrading/version-16.md` §Async Request APIs.
- Global helpers `PageProps<'/[lang]/stay/[room]'>`, `LayoutProps<'/[lang]'>`, `RouteContext<'/…'>` exist (no import), but they are **generated** by `next dev | build | typegen` into `.next/dev/types` or `.next/types`. `F/page.md`, `F/layout.md`, `F/route.md`, `D/03-api-reference/05-config/02-typescript.md`.
- **Trap:** there is no `.next` yet, and a new route's literal is unknown until the running server regenerates types, so `tsc --noEmit` can fail on the helpers for reasons outside your file. Hand-typed props (above) always compile.
- **Trap:** dev writes `.next/dev/types/validator.ts` (tsconfig includes it) and checks each layout against `LayoutProps<Route>`, whose params are `string` (src `S/server/lib/router-utils/typegen.js`). A layout typed `Promise<{ lang: Locale }>` fails there. Type `string`, narrow with `isLocale()`. A tsc error *inside* that file is about your page/layout/route export shape.
- Client pages unwrap with `use(params)`; nested client components use `useParams()`.

## 3. `src/proxy.ts` (formerly middleware)

```ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {                    // named `proxy` or default export
  const cookie = request.cookies.get("pkh_lang")?.value;         // RequestCookies
  const accept = request.headers.get("accept-language") ?? "";   // plain Web Headers
  if (request.nextUrl.pathname === "/")
    return NextResponse.redirect(new URL("/th", request.url));    // 307 default; pass 308 as 2nd arg
  const url = request.nextUrl.clone(); url.pathname = `/th${url.pathname}`;
  return NextResponse.rewrite(url);                               // URL bar unchanged, other route answers
}
export const config = { matcher: ["/((?!api/|_next/|media/|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"] };
```
- Location: project root, or **inside `src/`** when `src/app` is used ("same level as `app`"). One file per project. `middleware.ts` and the `middleware` export are deprecated. `F/proxy.md`, `F/src-folder.md`.
- Runtime is Node.js and cannot be configured; exporting `runtime` throws. `F/proxy.md` §Runtime.
- Order: `headers()` → `redirects()` (next.config) → **proxy** → files and routes. `F/proxy.md` §Execution order.
- With no matcher it runs on *every* request including `_next/static` and `public/` files. Exclude: `api`, `_next/static`, `_next/image`, public asset folders, icons, `robots.txt`, `sitemap.xml`.
- redirect = new URL in the address bar (use for `/` and bare page names); rewrite = same URL, different route (use only where two URLs for one page cannot be indexed, e.g. the 404 path).
- **Trap:** matcher values must be literal constants — it is statically analysed and variables are silently ignored. It cannot be built from `LOCALES`.
- **Trap:** do not exclude "everything with a dot": legacy `/th/rate.php?page=rate` must reach the proxy.
- **Trap:** redirecting `/` to `/th/` costs a second hop — Next strips trailing slashes by default. `C/trailingSlash.md`.
- **Trap:** `NextResponse.next({ headers })` sends headers to the *browser*; request headers go in `next({ request: { headers } })`.
- Keep it fast and stateless: no shared module state with render code, no slow fetches. `D/01-getting-started/16-proxy.md`.

## 4. Static rendering

```tsx
// [lang]/layout.tsx:            generateStaticParams() → [{ lang: "th" }, { lang: "en" }]
// [lang]/stay/[room]/page.tsx — runs once per parent params, returns only its own segment
export function generateStaticParams() { return ROOM_IDS.map((room) => ({ room })); }
export default async function Page({ params }: Props) {
  const { lang, room } = await params;
  if (!isLocale(lang) || !isRoomId(room)) notFound();   // dynamicParams stays at its default (true)
}
```
- `dynamicParams` default `true`: unlisted values render on demand, so every dynamic page validates and calls `notFound()`. `false` = unlisted values 404 "or match (in the case of catch-all routes)". `D/03-api-reference/04-functions/generate-static-params.md`.
- A route turns dynamic by accident through a Request-time API: `cookies()`, `headers()`, `draftMode()`, the `searchParams` prop (page **or** `generateMetadata`), plus `connection()`, `fetch(…, { cache: "no-store" })`, `dynamic = "force-dynamic"`, `revalidate = 0`. In a layout it hits every page below. `D/04-glossary.md` §Request-time APIs, `D/02-guides/caching-without-cache-components.md`.
- Optional guard: `export const dynamic = "error"` fails when a Request-time API is used (same guide; not exercised here).
- Query string on a static page — client island only:
```tsx
// page.tsx (Server Component; does NOT accept searchParams)
<Suspense fallback={<GalleryGrid filter={null} />}><GalleryFromQuery /></Suspense>
// GalleryFromQuery.tsx
"use client";
const filter = useSearchParams().get("filter");          // ReadonlyURLSearchParams
```
- **Trap:** everything from the hook up to the nearest `<Suspense>` is client-rendered only; the prerendered HTML holds the **fallback**. Without the boundary dev works and `next build` fails (`missing-suspense-with-csr-bailout`). `D/03-api-reference/04-functions/use-search-params.md`.
- For a form that must exist without JavaScript, make the fallback the same form unprefilled, or skip the hook: `useSyncExternalStore(subscribe, () => window.location.search, () => "")` (§9) keeps the form in static HTML and applies the prefill after hydration.
- In dev every route renders on demand; static-ness is only proven by the `next build` table (`○` static, `●` SSG, `ƒ` dynamic). `D/02-guides/building.md`.

## 5. Metadata

```tsx
// [lang]/layout.tsx
export const viewport: Viewport = { themeColor: THEME_COLOR, colorScheme: "light" };  // NOT inside metadata
export const metadata: Metadata = { metadataBase: new URL(site.origin) };
// any page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "Rooms with a private rooftop | Phukumhom Resort Khao Yai",   // full string, no template
    description: "…",
    alternates: {
      canonical: `/${lang}/stay`,                                         // resolved against metadataBase
      languages: { th: "/th/stay", en: "/en/stay", "x-default": "/th/stay" },
    },
    openGraph: { type: "website", url: `/${lang}/stay`, siteName: "…", locale: OG_LOCALE[lang], title: "…", description: "…",
      images: [{ url: "/og/stay.jpg", width: 1200, height: 630, alt: "…" }] },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  };
}
```
- `metadata` **or** `generateMetadata` per segment, never both; Server Components only. A relative URL field with no `metadataBase` is a build error. `D/03-api-reference/04-functions/generate-metadata.md`.
- `"x-default"` and bare `th` / `en` are valid `languages` keys (src `S/lib/metadata/types/alternative-urls-types.d.ts`).
- **Trap (titles):** `title.template` "will not apply to a `title` defined in a `page.js` of the same route segment". A template in `[lang]/layout.tsx` reaches `/th/stay` but **not** the home page `[lang]/page.tsx` (docs + src `accumulateMetadata`). Use full strings; if a template exists anywhere, `title: { absolute }` ignores it.
- **Trap (merging):** nested objects are replaced, not merged — a page that sets `openGraph` or `alternates` drops the parent's whole object. Build both completely in one helper (`lib/seo.ts`).
- **Trap (streaming):** on dynamically rendered responses — which is *every* response in dev — tags from an async `generateMetadata` can be appended to `<body>` for non-bot user agents. Prerendered pages carry them in `<head>`. `htmlLimitedBots: /.*/` in next.config turns streaming metadata off. Matters to any script that greps `<head>` from the dev server. Same doc §Streaming metadata.
- `themeColor`, `colorScheme`, `viewport` inside `metadata` are deprecated (14) → `viewport` export. `D/03-api-reference/04-functions/generate-viewport.md`.
- Icons: `favicon.ico` only at `src/app/`; `icon.*` / `apple-icon.*` files, or `metadata.icons` (file icons are used only when `metadata.icons` is unset, src). Never the same file in `public/` and `app/`. `F/01-metadata/app-icons.md`.

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${origin}/th/stay`, lastModified: "2026-10-07", changeFrequency: "monthly", priority: 0.8,
    alternates: { languages: { th: `${origin}/th/stay`, en: `${origin}/en/stay`, "x-default": `${origin}/th/stay` } } }];
}
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${origin}/sitemap.xml` };
}
```
- One sitemap entry per locale URL, each listing every language including itself. **Trap:** URLs are written verbatim — absolute only, no `metadataBase`, no XML escaping of `&` (src `S/build/webpack/loaders/metadata/resolve-route-data.js`). `F/01-metadata/sitemap.md`, `F/01-metadata/robots.md`.
- Both are cached special Route Handlers; they live at `src/app/` (outside `[lang]`) and must be excluded from the proxy matcher.

## 6. Fonts

```ts
// src/styles/fonts.ts — module scope, `const`, literal options
import { Cormorant_Garamond, Noto_Sans_Thai } from "next/font/google";
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--font-cormorant",
});
export const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"], display: "swap", variable: "--font-noto-thai",
});
// layout: <html lang={lang} className={`${cormorant.variable} ${notoThai.variable}`}>
// tokens.css already composes: --font-display: var(--font-cormorant), …;  --font-sans: var(--font-noto-thai), …;
```
| Export (verified) | Weights | Styles | Subsets | Axes |
|---|---|---|---|---|
| `Cormorant_Garamond` | **variable** 300–700 (or `'300'`…`'700'`) | normal, italic | latin, latin-ext, cyrillic, cyrillic-ext, vietnamese | wght |
| `Noto_Sans_Thai` | **variable** 100–900 | normal only | thai, latin, latin-ext | wght (+ optional `axes: ["wdth"]`) |

Source: `S/compiled/@next/font/dist/google/font-data.json` and `index.d.ts`. Options: `D/03-api-reference/02-components/font.md`.
- Both are variable: omit `weight` and every weight in range is available from one file per subset and style.
- `subsets` chooses what is **preloaded** (omitting it with `preload: true` warns). Defaults: `display: "swap"`, `preload: true`, `adjustFontFallback: true`.
- `adjustFontFallback` generates a metric-matched "`<Family> Fallback`" face from local Times New Roman (serif) or Arial (sans); metrics for both families ship in `S/server/capsize-font-metrics.json`. `fallback: [...]` appends families after it.
- Files are fetched at compile time and self-hosted: no browser request to Google, `font-src 'self'` suffices, the compiling machine needs network.
- **Trap:** Cormorant has no Thai subset and Noto Sans Thai has no italic — an italic Thai run is a synthesized slant. Keep `:lang(th)` headings on `--font-sans` and never italicize Thai.
- **Trap (inference, check by eye):** the adjusted fallback is Arial, which has no Thai glyphs, so Thai text before swap uses the OS Thai font unadjusted. Look at first paint in Thai at 390 px.
- **Trap:** the compiler rejects loaders that are not "called and assigned to a const in the module scope", and spreads in options (strings in the SWC binary). Call each loader once, in one module.
- A font used in the root layout is preloaded on every route.

## 7. Route handler — `src/app/api/enquiry/route.ts`

```ts
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return Response.json({ ok: false, error: "unsupported-media-type" }, { status: 415 });
  let raw: unknown;
  try { raw = await request.json(); }                    // throws on empty or malformed bodies
  catch { return Response.json({ ok: false, error: "invalid-json" }, { status: 400 }); }
  const parsed = EnquirySchema.safeParse(raw);           // zod schema from lib/enquiry
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 422 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return Response.json({ ok: true }, { status: 202 });
}
export function GET() { return new Response(null, { status: 405, headers: { Allow: "POST" } }); }   // optional
```
- Exports are the method names `GET POST PUT PATCH DELETE HEAD OPTIONS`. A method you do not export gets an **automatic 405** — with an empty body and **no `Allow` header** (src `S/server/route-modules/app-route/helpers/auto-implement-methods.js`). `OPTIONS` is auto-implemented (204 + `Allow`); `HEAD` falls back to `GET`. `D/01-getting-started/15-route-handlers.md`.
- Not cached by default; non-GET methods are never cached. Nothing to export for that.
- `runtime` defaults to `"nodejs"`; `"edge"` is deprecated. Export nothing. `F/02-route-segment-config/runtime.md`.
- Client IP: `NextRequest.ip` and `.geo` were removed in 15 (`D/03-api-reference/04-functions/next-request.md`). Read `x-forwarded-for`. Next's server only fills it with the socket address when the header is **absent** (`??=`, src `S/server/base-server.js:612`), so a client-sent value survives unless a trusted reverse proxy overwrites it. Good enough for coarse rate limiting, not for trust.
- No body-size limit is documented for Route Handlers: check length yourself before parsing.
- `route.ts` cannot share a segment with `page.tsx`, takes no layout, and `next/root-params` is unavailable in it — the language must arrive in the body.

## 8. `next.config.ts`

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,                 // drops x-powered-by
  devIndicators: false,                   // hides the dev badge (it is in every dev screenshot otherwise)
  images: { unoptimized: true },          // only matters if next/image is ever used
  async redirects() {
    return [
      { source: "/:lang(th|en)/rate.php", destination: "/:lang/stay", permanent: true },
      { source: "/index.php", has: [{ type: "query", key: "page", value: "rate" }], destination: "/th/stay", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: csp }] }];
  },
};
export default nextConfig;
```
- `has` / `missing` item: `{ type: "header" | "cookie" | "query", key, value? }` or `{ type: "host", value }`. `value` is a regex-like string matched as `^value$` (src `matchHas`); omitted = any value; a named group `(?<x>…)` becomes `:x` in the destination. `source` is the path only — the query string is matched with `has`, never inside `source`. `C/redirects.md`.
- `permanent: true` → 308, `false` → 307; `statusCode: 301` may replace `permanent` (type `Redirect`, `S/lib/load-custom-routes.d.ts`).
- **Trap:** `redirects()` always forwards the incoming query string (`{ ...requestQuery, ...destinationQuery }`, src `S/shared/lib/router/utils/prepare-destination.js`). `/th/rate.php?page=rate` would land on `/th/stay?page=rate`. Dropping legacy parameters is only possible in the proxy — which is what `src/proxy.ts` does. Keep it there.
- CSP: static pages cannot carry a nonce (nonces need dynamic rendering), so the header is set here with `'unsafe-inline'`; dev also needs `'unsafe-eval'`. `D/02-guides/content-security-policy.md` §Without Nonces.
- **Trap:** the docs' sample CSP has `form-action 'self'` (would block the planner's GET to letsbook.me) and `upgrade-insecure-requests` (wrong for a preview served over plain `http://127.0.0.1`).
- For one header key, the last matching rule wins. `C/headers.md`.
- `public/` files are served `Cache-Control: public, max-age=0` unless `headers()` overrides it. `F/public-folder.md`.
- We ship pre-encoded files through `<Picture>`, so `next/image` is not imported and `images.*` is inert. If it ever is: 16 allows only `qualities: [75]` by default and local `src` with a query string needs `images.localPatterns`.
- `typedRoutes` is stable and top-level (default off). Its types come from `.next/types` and non-literal hrefs need `as Route`, which fights `href(lang, id)`. Leave off.
- Renamed or removed in 16: `experimental.turbopack` → `turbopack`; `eslint` key removed; `serverRuntimeConfig` / `publicRuntimeConfig` removed; `experimental.ppr | dynamicIO | useCache` → `cacheComponents`; `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`; `images.domains` deprecated; a custom `webpack()` fails the Turbopack build.

## 9. Client / server boundary

```tsx
"use client";                                       // first line of the file, before imports
import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}                                                   // client snapshot ^            server + hydration snapshot ^
// localStorage: subscribe to "storage" (fires in OTHER tabs only — dispatch your own event after setItem);
// getSnapshot must return a primitive or a cached reference, never a fresh object.
```
- A function prop from a Server Component to a Client Component **throws**: `onClick`, render props, `onNavigate` on `<Link>`. Pass data, or rendered elements (`children`, `icon={<Icon />}`). `D/02-guides/server-and-client-boundary.md` §Crossing the boundary.
- `"use client"` marks an entry point; everything that file imports joins the client bundle. Add it only to files rendered directly from Server Components. `D/03-api-reference/01-directives/use-client.md`.
- A Server Component importing from a `"use client"` file gets a *client reference*, not the value: static members (`Menu.Item`) are `undefined`, constants and helpers are unusable. Shared constants live in plain `.ts` modules.
- `import "server-only"` works without installing the package (Next resolves it itself). **Trap:** the package is not in `node_modules`, so a module carrying that import cannot be loaded by plain-Node `scripts/*.mjs`. `D/01-getting-started/05-server-and-client-components.md`.
- `metadata`, `generateMetadata`, `viewport` cannot be exported from a `"use client"` file.
- Lint **errors** active beside `react-hooks/set-state-in-effect`: `purity` (no known-impure calls in render, e.g. `Date.now()`, `Math.random()`), `refs` (no `ref.current` during render), `immutability`, `static-components` (no component declared inside a component), and `@next/next/no-html-link-for-pages`. Verified in the installed plugin configs.
- Client Components are still server-rendered: anything read from `window`, the clock or the visitor's locale goes through the server-snapshot pattern above. Format dates in Server Components with an explicit locale and `timeZone: "Asia/Bangkok"`.

## 10. CSS

```css
/* Plate.module.css */
.caption { line-height: 1.5; }
.caption:lang(th) { line-height: 1.8; }        /* fine */
:lang(th) .caption { letter-spacing: 0; }      /* fine: the selector contains a local class */
.plate :global(.is-open) { opacity: 1; }       /* function form only */
/* :lang(th) p { }   :root { }   html { }   * { }   → compile error in a module */
```
- Global CSS may be imported from any layout, page or component under `app/`, but it is never unloaded on navigation: import `globals.css` once, in `[lang]/layout.tsx`. `D/01-getting-started/11-css.md`.
- **Trap:** Turbopack enforces purity — `Selector "…" is not pure. Pure selectors must contain at least one local class or id.` (string in the SWC binary). Element-only and `:lang()`-only rules belong in `src/styles/*.css`.
- Turbopack compiles with Lightning CSS: nesting and `@import` work; **not** supported: bare `:global` / `:local`, `@value`, `:import` / `:export`; `composes` from or `@import` of a plain `.css` inside a module treats that file as global. `D/03-api-reference/08-turbopack.md`.
- Token custom properties are global at runtime: modules just use `var(--token)`, no import.
- Order follows JS import order and "can behave differently in development" — avoid two modules fighting over one property at equal specificity. Numbers are emitted with 5 decimals.
- **Trap:** "CSS still loads with JavaScript disabled in production, but JavaScript is required in development". Trust `--nojs` screenshots only against a production build.

## 11. `<Link>`

```tsx
<Link href={href(lang, "stay")}>…</Link>                              {/* every internal link */}
<Link href={href(lang, "faq", { hash: "pets" })} prefetch={false}>…</Link>
<a href={bookingHref()}>…</a>                                         {/* external, tel:, mailto:, files */}
```
- Prefetch is **production only**. Default `"auto"` / `null`: a link entering the viewport prefetches a static route in full. `false`: never, not even on hover. `D/03-api-reference/02-components/link.md`.
- `scroll` defaults to `true`: if the new page is outside the viewport Next scrolls to its first element, skipping sticky / fixed ones — `scroll-padding-top` on `html` handles the sticky header (already in `base.css`). Hash hrefs work.
- **Trap (new in 16):** Next no longer suspends `scroll-behavior: smooth` during navigation. `base.css` sets it on `html`, so `<html>` needs `data-scroll-behavior="smooth"` or every route change glides to the top. `D/02-guides/upgrading/version-16.md` §Scroll Behavior Override.
- `<Link>` renders the `<a>` itself; `legacyBehavior` is deprecated. An internal `<a href>` is a lint **error**.
- Do **not** use: `onNavigate` / `onClick` on a Link rendered by a Server Component; `transitionTypes` and `<ViewTransition>`; `useLinkStatus`; `next/form` (client navigation for internal search forms — the planner posts cross-origin, keep the native `<form>`); `partialPrefetching`, segment exports `instant` / `prefetch`, `"use cache"`, `cacheLife`, `cacheTag` (all need `cacheComponents`); experimental `useOffline`, `staleTimes`, `inlineCss`, `globalNotFound`, `sri`.

## 12. What version 16 changed that we lean on

Source for all: `D/02-guides/upgrading/version-16.md` (and `version-15.md` for the caching defaults).
- **Turbopack is the default** for `next dev` and `next build` (no flag); filesystem cache is on. `--webpack` opts out.
- Node ≥ 20.9, TypeScript ≥ 5.1; browsers Chrome / Edge / Firefox 111+, Safari 16.4+.
- Async Request APIs only (§2) — also `params` / `id` in icon and OG image functions, and `id` in `sitemap`.
- Caching defaults (since 15, unchanged): `fetch` is uncached, `GET` Route Handlers are uncached; `sitemap.ts`, `robots.ts` and icons stay cached. With `cacheComponents` off, pages that touch no Request-time API are prerendered — the model we rely on. Turning it on removes `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`.
- `middleware` → `proxy` (Node.js runtime only).
- `next lint` is **removed** and `next build` no longer lints: run `npm.cmd run lint` (ESLint CLI, flat config).
- React Compiler: stable, **off by default**; needs `reactCompiler: true` plus `babel-plugin-react-compiler` (not installed). Its lint rules are on regardless (§9).
- `next dev` writes to `.next/dev`, `next build` to `.next`; a lockfile refuses a second instance of the same command; each rewrites `next-env.d.ts` to point at its own types folder.
- `next dev` creates `AGENTS.md` and `CLAUDE.md` in the project root (neither exists yet) when it detects a coding agent, and re-adds its managed block if removed (src `S/server/lib/generate-agent-files.js`). Expect them as untracked files; commit rather than delete.
- Removed: AMP, runtime config, `experimental_ppr`, `unstable_rootParams` (→ `next/root-params`), `devIndicators.buildActivity*`; build output no longer prints route sizes.

## Most likely mistakes

1. Reading `params.lang` without `await`, or typing `params` as a plain object (or as `Locale` in a layout).
2. Passing a callback, render prop or component function from a Server Component to a Client Component.
3. Touching `searchParams`, `cookies()` or `headers()` in a page, layout or `generateMetadata` — the route silently goes dynamic.
4. `useSearchParams()` without `<Suspense>` (build fails), or with it and forgetting the island is absent from no-JS HTML.
5. `useEffect(() => setState(…))` for `matchMedia`, `localStorage` or scroll instead of `useSyncExternalStore`.
6. An impure selector in a `.module.css` (`:root`, `html`, `:lang(th) p`).
7. An internal link written as `<a href>`, or an `onClick` handed to `<Link>` from a Server Component.
8. Expecting `title.template` to reach the home page, or setting half of `openGraph` / `alternates` in a page.
9. Adding `[lang]/loading.tsx`, or `dynamicParams = false` on the root layout — both break the localized 404.
10. A proxy matcher built from variables, one that swallows `/api`, `/media`, `robots.txt`, `sitemap.xml`, or legacy redirects moved into `redirects()` (query strings ride along).
