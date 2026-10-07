# Integrations — status and how to switch each one on

Written 7 Oct 2026 for the private preview. This file describes what the code does today, what was
actually tested, and what has to happen before each integration is real. Nothing here has been
deployed, no account was created, and no resort system was touched.

Environment variables are listed in `.env.example`. No secret lives in the repository.

## 1. Status today

| Integration | Status | What a guest sees | Switch |
|---|---|---|---|
| Booking handoff | **Live link.** The booking page answered 200 and the legacy link redirected to it (checked 7 Oct 2026). Date and adult parameters were tested on the receiving page (BUILD-CONTRACT §3). | "Check availability" opens the booking partner's page in the same tab. | none — always on |
| Enquiry delivery | **Not configured.** No receiving service exists. | By design: the phone, Facebook and "Copy enquiry" (a draft the guest sends themselves). No "Send". | `flags.enquiryDelivery` + `ENQUIRY_*` |
| Analytics | **Inert.** No script, no cookie, no request. | Nothing. | `flags.analytics` + `NEXT_PUBLIC_GA4_ID` |
| Consent banner | **Dormant.** It renders nothing while analytics is not configured. | Nothing (no optional cookies exist, so no banner). | follows analytics |
| Map embed | **Click-to-load** by design: no Google frame is requested until the visitor asks for it; "Open in Google Maps" is always there as a plain link. | A button to load the map, and the link. | `flags.mapEmbed` |
| Search indexing | **Closed.** Preview: `robots.txt` disallows everything, pages say `noindex`, `X-Robots-Tag` is sent. | — | `SITE_ENV=production` |

Feature flags live in `src/content/site.ts` (`site.flags`). A switched-off feature leaves no trace in the UI.

The contact form and the Location page (which carry the enquiry and map behaviour) belong to other tasks and were
not in the tree when this file was written; rows 2 and 5 state the agreed design, not something tested here.
Section 10 lists what was tested.

## 2. Environment variables

| Variable | Read by | What it switches on | Empty / unset means |
|---|---|---|---|
| `SITE_ENV` | `src/lib/seo.ts`, `next.config.ts` | `production` marks the one public deployment: canonical origin becomes `site.origin.production`, pages become indexable, `robots.txt` opens and names the sitemap, HSTS and `upgrade-insecure-requests` are sent, `X-Robots-Tag: noindex` is dropped. | Private preview. |
| `NEXT_PUBLIC_SITE_ORIGIN` | `src/lib/seo.ts` | The canonical origin of a preview or staging host (canonicals, hreflang, Open Graph, sitemap). Ignored on the public site. | `site.origin.preview` (`http://127.0.0.1:8352`). |
| `NEXT_PUBLIC_GA4_ID` | `src/content/site.ts` → `src/lib/analytics.ts`, `next.config.ts` | The GA4 measurement id (`G-…`). Needs `flags.analytics = true` as well. Also adds the Google hosts to the Content-Security-Policy. | Analytics inert, consent banner dormant. |
| `ENQUIRY_DELIVERY` | the enquiry route handler | Selects how an accepted enquiry leaves the server (webhook). Needs `flags.enquiryDelivery = true` as well. | Nothing is delivered; no "Send" is offered. |
| `ENQUIRY_WEBHOOK_URL` | the enquiry route handler | The HTTPS endpoint that receives accepted enquiries. **Secret.** | No delivery. |
| `ENQUIRY_WEBHOOK_SECRET` | the enquiry route handler | Shared secret used to sign each delivery. **Secret.** | No delivery. |
| `QA_BASE` | `scripts/check-content.mjs`, `_qa/shot.mjs` | Base URL for the QA tools. Never read by the site. | `http://127.0.0.1:8352`. |

`NEXT_PUBLIC_*` values are inlined when the site is built, and `SITE_ENV` shapes both the prerendered
pages and the response headers: set them **before `next build`** and keep them the same for `next start`.

## 3. Preview and public site

Only a deployment that sets `SITE_ENV=production` is the public site. Everything else is a preview and
is closed to search three ways, so no single mistake can open it: `robots.txt` (`Disallow: /`, no
sitemap line), a robots meta tag on every page (`noindex, nofollow`), and an `X-Robots-Tag` response
header. The sitemap still exists on a preview so the route list can be inspected; it is not advertised.

Every absolute URL the site prints (canonical, hreflang, Open Graph, sitemap, JSON-LD) is built from
one constant, `SITE_ORIGIN` in `src/lib/seo.ts`. It can only be `site.origin.production`,
`NEXT_PUBLIC_SITE_ORIGIN` or `site.origin.preview` — no other host can appear.

### Going public — checklist

Do these on the real deployment only, and only once the content gaps in `docs/RESEARCH.md` are closed
(photograph rights are `preview-only` today; that alone keeps this build private).

1. Confirm `site.origin.production` in `src/content/site.ts` (today `https://www.phukumhom.com`, the legacy
   domain — nothing is deployed there by this build). Pick www or apex at the host and redirect the other with one 301.
2. Set `SITE_ENV=production` for the build and the running server of that deployment. Never on a preview or staging host.
3. After deploying, check from outside:
   - `/robots.txt` shows `Allow: /`, `Disallow: /api/`, `Disallow: /_qa/` and the `Sitemap:` line;
   - a page has `<meta name="robots" content="index, follow">` and no `X-Robots-Tag` header;
   - canonicals and hreflang use the production host;
   - `QA_BASE=https://www.phukumhom.com node scripts/check-content.mjs` passes (it reads the page list from the live sitemap).
4. Before enabling HSTS on the real domain, check the DNS zone for webmail or control-panel subdomains (`docs/redirects.md`).
5. Submit `/sitemap.xml` in the owner's Search Console property. (Not done here; needs the owner's account.)
6. Paste one page's JSON-LD into the Schema Markup Validator. (Not done here; see §8.)

## 4. Booking handoff

- One module: `src/lib/booking.ts` (`bookingHref()`, `BOOKING`, `BOOKING_FORM`), fed by `site.booking`.
- Destination: `https://letsbook.me/booking/phukumhomresort`. On 7 Oct 2026 it answered 200 and the older
  official link (`live.ipms247.com/booking/book-rooms-phukumhomresort`) answered 302 to it.
- Parameters sent, exactly as tested on the receiving page (BUILD-CONTRACT §3): `checkin`, `checkout`
  (date-only, `YYYY-MM-DD`) and `adults` (1–3). `children`, `lang`, `roomTypeId` and `currency` are never sent.
- It is a link. The site cannot see availability, prices, errors or a completed reservation, and reports none.
- To change provider or parameters: edit `site.booking` in `src/content/site.ts`, re-test on the provider's page,
  and update BUILD-CONTRACT §3. The analytics value `provider` follows automatically (it is the host of `baseUrl`).

## 5. Enquiry delivery

Not configured: there is no mailbox, CRM or webhook to receive a message, and the resort's email addresses
are unconfirmed (`site.email` is `needs-confirmation`). Until that changes the site must not show a Send
action or a "sent" message.

The enquiry route handler (`src/app/api/enquiry/route.ts`) belongs to the contact task and was not in the
tree when this file was written. The variable names above are the agreed interface; confirm the exact
accepted values of `ENQUIRY_DELIVERY` and the signature scheme against that file before configuring a host.

To enable, in this order:
1. Stand up a receiver the resort controls (a mail relay, a form-to-inbox service or a small webhook) and decide who reads it.
2. Set `ENQUIRY_DELIVERY`, `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_WEBHOOK_SECRET` in the host's environment (not in the repo).
3. Send a real test enquiry in both languages and confirm it arrives and is readable (Thai text, line breaks).
4. Only then set `flags.enquiryDelivery = true`. "Your enquiry has been sent" may appear only after the backend accepts a message.
5. Update the privacy page to say where enquiries go and how long they are kept.

`enquiry_submit_success` (analytics) must be fired by the form only after step 4's real acceptance:
`track({ name: "enquiry_submit_success", params: { type, page: "contact", locale } })`. The payload has no room for the message or contact details.

## 6. Analytics and consent

### What is built

- `src/lib/analytics.ts` — the adapter: configuration gate, the event schema (types **and** a runtime allow-list), `track()`.
- `src/components/analytics/` — `<AnalyticsRoot lang>` (delegated listeners, consent-gated loader),
  `<ConsentBanner lang>`, `<ConsentSettingsLink lang>`, the consent store and the GA4 transport.

All three components render nothing, attach nothing and load nothing unless **both** are true at build time:
`site.flags.analytics === true` and `NEXT_PUBLIC_GA4_ID` is a well-formed GA4 id (`G-` + letters/digits).
With both set, Google Analytics still does not load until a visitor presses **Accept**.

Mounting (shell task): in `src/app/[lang]/layout.tsx` render `<ConsentBanner lang={lang} />` early in `<body>` and
`<AnalyticsRoot lang={lang} />` once; in the footer render `<ConsentSettingsLink lang={lang} />` (pass a `className`
to match the footer links). Each returns `null` today, so they can be mounted now.

### Events

| Event | Parameters sent | Source |
|---|---|---|
| `page_view` | `page_location` (origin + path + `utm_*`/`gclid` only), `language` | automatic, on arrival and on each client navigation |
| `room_view` | `room_id`, `locale`, `page` | automatic on room pages |
| `room_compare` | `room_ids` (comma-joined, catalogue order) | `data-analytics="room_compare" data-rooms="a,b"` or `track()` |
| `availability_search` | `has_dates` (true/false), `adults` (1–3) | automatic on submit of a form posting to the booking URL |
| `booking_click` | `placement`, `room_id` (optional), `locale`, `provider` | `data-analytics="booking_click" data-placement="…" data-room="…"`, or any plain link to the booking URL |
| `enquiry_submit_success` | `enquiry_type`, `page`, `locale` | `track()` from the form, after backend acceptance only |
| `call_click` | `placement`, `locale` | `data-analytics="call_click"`, or any `tel:` link |
| `map_click` | `placement`, `locale` | `data-analytics="map_click"`, or any link to the map listing |
| `social_contact_click` | `network`, `placement`, `locale` | `data-analytics="social_contact_click" data-network="facebook"`, or any link to the Facebook page |

Server-rendered links need no handlers: one delegated listener reads the attributes from the clicked element or
its ancestors. `data-placement` values are a closed list (`ANALYTICS_PLACEMENTS` in `src/lib/analytics.ts`:
`header`, `mobile-menu`, `hero`, `planner`, `sticky-bar`, `room-ledger`, `room-panel`, `room-alternatives`,
`compare`, `rooftop`, `dining`, `experiences`, `gallery`, `journey`, `location`, `contact`, `faq`, `closing`,
`footer`, `not-found`, `inline`); anything else is recorded as `other`. A link without attributes is still
counted, with placement `other`.

### What can never be collected

`track()` rebuilds each payload from the schema. An unknown event is dropped; a key outside the schema is
dropped; a value that is not on its allow-list drops the whole event. No parameter accepts free text, so a
name, an email address, a phone number, a message, a child's age or a stay date cannot enter a payload.
About dates the only thing recorded is whether a search had both of them. The reported page address is the
path plus campaign parameters; `type`, `room`, `filter` and any other query parameter are removed.

A `booking_click` is a click on an outbound link. It is **not** a booking, and no purchase or revenue is sent.
A completed booking may only be recorded if the booking provider one day supplies an authorised callback.

### Consent

- First visit (when configured): a small panel, not a wall. The page, the header and the mobile action bar stay
  usable. **Accept** and **Reject** are the same button style; nothing is pre-selected; scrolling or closing is not consent.
- The choice is stored in `localStorage` under `pkh_consent` as `v1:granted:YYYY-MM-DD` or `v1:denied:YYYY-MM-DD`
  (a choice and its date, nothing about the visitor) and asked again after twelve months.
- **Reject**: nothing is loaded. Booking, enquiries and navigation are unaffected.
- **Cookie settings** (footer) re-opens the panel, shows the current choice, and offers Close / Escape.
- Withdrawing after accepting: events stop at once, Google's opt-out flag for the stream is set, storage consent is
  updated to denied and the `_ga*` cookies are removed.
- Advertising storage, ad user data and ad personalisation are always denied; Google signals are off.
- Wording is in `src/components/analytics/consent-copy.ts` (both languages; not yet in `docs/glossary.json`).

### To enable

1. The owner creates a GA4 property and a web data stream (their account; not done here).
2. In that data stream's **Enhanced measurement**, switch off *Page changes based on browser history events*
   (the site sends its own page views), *Outbound clicks* (it would record the full booking URL, stay dates
   included) and *Form interactions*. Leave Google signals off.
3. Register the parameters above as custom dimensions if they should appear in reports. `booking_click` may be
   marked a key event; it must not be given a value or called a purchase.
4. Update the privacy page: what is measured, by whom, the cookie names, how to change the choice.
5. Set `NEXT_PUBLIC_GA4_ID` and set `flags.analytics = true` in `src/content/site.ts`; rebuild.
6. In a browser: confirm nothing loads before Accept (Network tab), accept, confirm events arrive in GA4 DebugView,
   and watch the console for Content-Security-Policy reports. `next.config.ts` allows `www.googletagmanager.com`,
   `www.google-analytics.com` and `region1.google-analytics.com`; if Google serves the collect endpoint from another
   host for this property, add exactly that host.

No other tag, pixel or advertising script is installed, and none should be added without the same review.

## 7. Map embed

`flags.mapEmbed` allows a click-to-load map on the Location page (built by the Location task): the Google frame is
requested only after the visitor presses "Load the map", and "Open in Google Maps" (`site.maps.listingUrl`, the
resort's own listing) is always present as a plain link. With the flag off, only the link remains. The Content-Security-Policy permits frames from `www.google.com` and
`maps.google.com` only. The listing is not a checked arrival pin: no coordinates are printed and none are in JSON-LD.

## 8. Search metadata and structured data

- **Per page:** `pageMetadata(lang, id, { room?, noindex?, ogAsset? })` in `src/lib/seo.ts` returns the complete
  metadata object (title without template, description, canonical, hreflang `th` / `en` / `x-default` → Thai page,
  Open Graph, Twitter card, robots). Return it whole from `generateMetadata`; do not set `alternates` or
  `openGraph` separately — Next replaces nested objects instead of merging them. The 404 page uses `notFoundMetadata(lang)`.
- **Titles and descriptions** come from `src/content/seo.ts` (source: `docs/seo-map.json`).
- **Social card:** `public/og/<assetId>.jpg`, 1200×630. A card exists for frames catalogued with the `hero` use;
  any other `ogAsset` falls back to the home hero card.
- **Structured data** (`<JsonLd data={…} />` from `src/components/seo/JsonLd.tsx`):
  `lodgingJsonLd` (home), `webPageJsonLd` (any page, carries `dateModified = site.lastUpdated`),
  `breadcrumbJsonLd`, `faqJsonLd`, `roomJsonLd`. Every value passes through `pub()`.
  Deliberately absent, because nothing publishable backs them: `geo`, `starRating`, `aggregateRating`, `review`,
  `priceRange`, `amenityFeature`, `numberOfRooms`, email, and for rooms `occupancy`, `bed`, `floorSize`.
  The Google review figure shown behind `flags.reviewRating` is visible text only and is never marked up.
  Marking up FAQs describes the page; it does not promise any search feature.
- **Sitemap / robots:** `src/app/sitemap.ts`, `src/app/robots.ts`. The sitemap lists published, indexable routes ×
  both languages with alternates and `lastmod = site.lastUpdated`; flagged-off routes, pages marked `noindex` in
  `src/content/seo.ts` and `/styleguide` are never listed.
- **Icons:** `src/app/icon.svg` and `src/app/apple-icon.png` (180 px). There is no `favicon.ico`; browsers use the linked icons.

## 9. Content checks

`npm.cmd run check:content` (or `node scripts/check-content.mjs [--json] [--only /en/stay] [--base URL]`) crawls the
running site: status, one `<h1>`, `lang`, title 50–60 and description 140–160 code points (unique), canonical,
reciprocal hreflang, Open Graph, image `alt` / `width` / `height`, placeholder and banned words, dead `href`s,
internal link and image targets, JSON-LD (parses; no rating, review, geo, star or price keys), the robots signal
for the environment, the sitemap against the route table, and 404s for unknown and flagged-off URLs.
It exits non-zero on any failure. Its header comment lists every check.

## 10. What was verified, and what was not

Verified on 7 Oct 2026, on this machine:
- `tsc --noEmit` and ESLint clean for the integration files.
- `/robots.txt` and `/sitemap.xml` from the running preview (disallow-all; 26 URLs with alternates).
- `src/lib/seo.ts`, `src/lib/analytics.ts`, `src/lib/format.ts` and the consent parser under plain Node in three
  configurations: preview, `SITE_ENV=production`, and analytics configured.
- The real consent and analytics components in Chromium and WebKit (Playwright) against a local harness with
  analytics forced on and Google's script stubbed: nothing loads before Accept; Reject and withdrawal stop
  everything; payloads hold only allow-listed values; the banner covers neither the booking link nor the action bar.
- `scripts/check-content.mjs` against a fixture site with one planted defect per check.

Not verified — needs things this build does not have:
- A real GA4 property (DebugView, real cookies, the live CSP).
- The public configuration on a real host (`SITE_ENV=production` behind the production domain).
- Enquiry delivery of any kind.
- External validators (Rich Results Test, Schema Markup Validator, Facebook / LINE link previews) — they need a public URL.
