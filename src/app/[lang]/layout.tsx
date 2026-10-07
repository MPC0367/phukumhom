import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { AnalyticsRoot, ConsentBanner } from "@/components/analytics";
import { Loader, MotionProvider, ScrollProgress } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { BackToTop, ChapterIndex, Footer, Header, MAIN_ID, PlannerDrawer, SkipLink, StickyActions, TOP_ID } from "@/components/site";
import shell from "@/components/site/Shell.module.css";
import { ToastRegion } from "@/components/ui/ToastRegion";
import { LOCALES, LOCALE_TAG, isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { lodgingJsonLd, pageMetadata } from "@/lib/seo";
import { fontVariables } from "@/styles/fonts";

/**
 * Root layout for one language tree (/th or /en). There is no app/layout.tsx: each tree owns its
 * <html lang>, and this file is the whole site shell (direction 2, ART-DIRECTION sections 5 to 7).
 *
 *   <body>
 *     Loader                 first: its boot script shows it before the first paint, and never without script
 *     MotionProvider         smooth scrolling for a mouse, ScrollTrigger kept measured, nothing rendered
 *       #top mark · ScrollProgress · SkipLink · ConsentBanner
 *       Header               fixed; transparent over a `data-header-over` hero, paper elsewhere
 *       <main id="main">     each page, wrapped by template.tsx (the page transition)
 *       Footer
 *       StickyActions        phones: Call, Rooms, Check availability
 *       ChapterIndex         wide screens: the dots at the right edge
 *       BackToTop
 *       PlannerDrawer        opened by any `data-open-planner` element
 *       ToastRegion · AnalyticsRoot · JSON-LD
 *
 * - <main> has no `tabIndex`. A permanently focusable <main> takes focus whenever a guest clicks any
 *   text in the page, and the next Tab then starts from the top of the page content. The skip link
 *   moves focus there itself, making <main> focusable only for the moment it is used
 *   (components/site/SkipLinkAnchor.tsx).
 * - <main> starts below the header unless the page opens with a `data-header-over` element, which runs
 *   up behind it (components/site/Shell.module.css). The page says which in its own markup, so this is
 *   right in the server's HTML.
 * - ConsentBanner sits straight after the skip link: it is a fixed panel, so its place in the source
 *   changes nothing on screen, but it is the first stop for a keyboard when it does appear. It and
 *   AnalyticsRoot render nothing while measurement is not configured.
 * - The resort's own structured data (LodgingBusiness) is emitted here, once, on every page. Pages
 *   add their own WebPage / BreadcrumbList / FAQPage nodes; they must not repeat this one.
 * - `generateMetadata` is only the fallback (the homepage's): every page returns its own complete
 *   `pageMetadata(lang, id)`, because Next replaces nested metadata objects rather than merging them.
 *
 * Nothing here reads cookies, headers or the query string, so every page below stays static.
 * `dynamicParams` is left at its default on purpose (docs/NEXT16-NOTES.md section 1).
 */

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets env(safe-area-inset-*) report the real insets, which the phone action bar pads itself with.
  viewportFit: "cover",
  themeColor: "#f6f2ea",
  colorScheme: "light",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home") : {};
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const ui = t(lang);
  return (
    <html lang={LOCALE_TAG[lang]} className={fontVariables} data-scroll-behavior="smooth">
      <body className={shell.body}>
        <Loader wordmark={ui.wordmark.name} sub={ui.wordmark.sub} label={ui.loader.label} />
        <MotionProvider>
          <span id={TOP_ID} className={shell.top} aria-hidden="true" />
          <ScrollProgress />
          <SkipLink lang={lang} />
          <ConsentBanner lang={lang} />
          <Header lang={lang} />
          <main id={MAIN_ID} className={shell.main}>
            {children}
          </main>
          <Footer lang={lang} />
          <StickyActions lang={lang} />
          <ChapterIndex label={ui.a11y.chapterIndex} />
          <BackToTop label={ui.actions.backToTop} />
          <PlannerDrawer lang={lang} />
          <ToastRegion />
          <AnalyticsRoot lang={lang} />
          <JsonLd data={lodgingJsonLd(lang)} />
        </MotionProvider>
      </body>
    </html>
  );
}
