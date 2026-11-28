# Phukumhom Resort Khao Yai — website

A bilingual (Thai and English) website concept for Phukumhom Resort Khao Yai, in Wang Katha, Pak Chong,
designed and built by [O2 Design Studio](https://o2-designstudio.com/).

**Live at https://www.phukumhom.com since 28 November 2026**, the resort's own website (the resort paid for
it and supplied its hosting; `phukumhom.com` forwards to `www`). It is built from `main` by GitHub Actions as
the production site: indexable, no preview notice, the official wording of the privacy policy and terms.
**A push to `main` goes live.** The photographs and the information about the property belong to Phukumhom
Resort.

Until 28 November 2026 it was O2's labelled concept preview at https://mpc0367.github.io/phukumhom/ (that
address now forwards to the domain).

## What is in it

- A homepage in the "Open sky" direction: a day-to-dusk photograph sequence, the three room types, a rooftop
  chapter where a slider moves three real photographs of the same terrace from afternoon to dusk, the kitchen
  garden and restaurant, the grounds, places around Khao Yai, and how to get there.
- Thai and English as two complete trees (`/th`, `/en`) from one content model. Every fact carries its source
  and a publication status; only confirmed and source-listed facts are rendered.
- A stay planner that hands over to the resort's existing booking partner with a plain GET form, so it works
  without JavaScript. No prices, availability or reservations are handled by this site.
- Motion with GSAP over the browser's own scrolling, all of it optional: the pages read the same with JavaScript off and under
  `prefers-reduced-motion`.

- The inner pages: Stay with a room comparison, a page for each of the three room types, Dining, Around the
  resort, a filterable Gallery, Location, Contact, FAQ with a live search, Privacy and Terms.
- An enquiry form that does only what is true: no delivery service is connected, so it checks what was typed,
  composes a message and copies it for the visitor to send. It never says "sent".
- A group-stays page that is built but switched off (it answers 404) until the resort confirms what it hosts.

## Run it

Node 24 and npm.

```bash
npm ci
npm run dev        # http://127.0.0.1:8352
```

| Command | What it does |
|---|---|
| `npm run dev` | The Next.js app with locale routing and legacy-URL redirects (`src/proxy.ts`) |
| `npm run build` / `npm run start` | Production build for a Node host |
| `npm run pages` | Static export for GitHub Pages into `out/` (see below) |
| `npm run pages:serve` | A local stand-in for GitHub Pages on port 8353, to check the export |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run check:content` | Crawls the running site and checks titles, descriptions, links, alt text, JSON-LD |
| `npm run routes` | Re-reads which pages exist (run after adding or removing a page) |

## Hosting: GitHub Pages on www.phukumhom.com

`.github/workflows/pages.yml` builds the static export and publishes it on every push to `main`
(it is skipped while the repository is private), with
`--base "" --origin https://www.phukumhom.com --production`. GitHub Pages has no server, so the export leaves
out the request proxy and the catch-all 404 route, writes a small root page that chooses a language, and
copies the not-found page to `404.html`, where a script forwards the old site's addresses
(`src/content/legacy-redirects.json`: `/th/rate.php` and the rest) and bare page names (`/stay`) the way
the proxy does. `npm run pages` without `--production` still makes a labelled, `noindex` preview.

- Pages: **Settings → Pages → Source: GitHub Actions**, custom domain `www.phukumhom.com`, HTTPS enforced.
- DNS is in the resort's hosting panel (Plesk at its host, ITFeverHost; name servers `ns1/ns2.itfeverhost.com`):
  `phukumhom.com` A → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`; `www` CNAME → `mpc0367.github.io`.
  Mail stays on the resort's server (`mail`, `smtp`, `pop`, `webmail`, `ftp` keep their own A records).
- The way back: point the two website records at the old server again (`27.254.140.121`) and remove the
  custom domain in Settings → Pages.

## Where things are

| Path | Contents |
|---|---|
| `src/app/[lang]` | Routes. There is no `app/layout.tsx`: each language tree owns its `<html lang>` |
| `src/content` | The content model: site settings, rooms, experiences, dining, FAQ, places, SEO, the photograph catalogue |
| `src/components/ui` | Design-system primitives |
| `src/components/motion` | The motion system (reveals, reel, clock, sunset and moon). No loading screen (a 1.4 s opening on arrival lifts on its own, see site/Intro.tsx), no scroll library |
| `src/components/site` | Header, footer, menus, stay planner, booking link |
| `src/components/home`, `stay`, `media`, `places` | Homepage chapters and the modules they share |
| `src/components/page`, `room`, `gallery`, `faq`, `contact` | The inner pages' shared compositions and their interactive parts |
| `src/content/pages` | Page wording, Thai and English side by side |
| `src/app/api/enquiry` | The enquiry endpoint: answers "not configured" until a delivery service is set up |
| `src/styles` | Design tokens and the type system |
| `public/media` | The photographs as served: WebP and JPEG at fixed widths, each under 200 KB |
| `docs/INTEGRATIONS.md` | Environment variables and the honest status of every integration |

## Before this could be the resort's real website

The resort would need to confirm its contact details, room facts, policies and arrival pin; supply original
photographs and permission to use them; and choose how enquiries are delivered. Until then nothing here
should be read as the resort's own statement.

Website by [O2 Design Studio](https://o2-designstudio.com/).
