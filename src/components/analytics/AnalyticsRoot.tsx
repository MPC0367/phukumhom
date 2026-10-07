"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BOOKING_PROVIDER } from "@/content/site-public";
import type { Locale } from "@/content/schema";
import { ANALYTICS_ID, connectAnalytics, eventFromDataset, eventFromHref, roomFromPath, track } from "@/lib/analytics";
import { sendPageView, sendToGtag, startGtag, stopGtag } from "./gtag";
import { useConsent } from "./useConsent";

/**
 * Mount once, in the language layout: <AnalyticsRoot lang={lang} />.
 *
 * Without a configured measurement id this renders nothing and attaches nothing. With one, it still
 * does nothing that reaches Google until the visitor accepts in <ConsentBanner>; only then is
 * gtag.js loaded and the adapter in lib/analytics connected. Rejecting, or withdrawing later,
 * disconnects it again. Links and forms never depend on any of this.
 *
 * Events are read from the page by delegation, so server-rendered markup needs no handlers:
 *   - a click on (or inside) an element with `data-analytics="…"` — see `eventFromDataset`;
 *   - a click on a plain link to the booking page, the phone number, the map listing or Facebook;
 *   - a submit of the stay planner (a form posting to the booking page) → `availability_search`,
 *     recording only whether dates were chosen and the number of adults;
 *   - arriving on a room page → `room_view`.
 */
export function AnalyticsRoot({ lang }: { lang: Locale }) {
  return ANALYTICS_ID ? <ActiveAnalytics lang={lang} measurementId={ANALYTICS_ID} /> : null;
}

/** The path a page view was last sent for — keeps development double-effects and re-renders from counting twice. */
let lastViewed: string | null = null;

function fieldValue(form: HTMLFormElement, name: string): string {
  const control = form.elements.namedItem(name);
  return control instanceof HTMLInputElement || control instanceof HTMLSelectElement ? control.value : "";
}

function ActiveAnalytics({ lang, measurementId }: { lang: Locale; measurementId: string }) {
  const consent = useConsent();
  const pathname = usePathname();

  // 1. Follow the visitor's choice.
  useEffect(() => {
    if (consent === "granted") {
      startGtag(measurementId);
      connectAnalytics(sendToGtag);
      return () => connectAnalytics(null);
    }
    if (consent !== "unknown") stopGtag(measurementId);
  }, [consent, measurementId]);

  // 2. Page views (and room views) on arrival and on every client-side navigation.
  useEffect(() => {
    if (consent !== "granted" || lastViewed === pathname) return;
    // One tick later, so the new page's <title> is in place when the view is recorded. The path is
    // marked as viewed only when the view is really sent, so a cancelled timer leaves nothing behind.
    const timer = window.setTimeout(() => {
      lastViewed = pathname;
      sendPageView(lang);
      const roomId = roomFromPath(pathname);
      if (roomId) track({ name: "room_view", params: { roomId, locale: lang, page: "room" } });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [consent, pathname, lang]);

  // 3. One delegated listener per event type for the whole document.
  useEffect(() => {
    const context = { locale: lang };

    const onClick = (event: MouseEvent) => {
      // Primary clicks, and middle clicks that open a link in a new tab.
      if (event.type === "auxclick" && event.button !== 1) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const marked = target.closest<HTMLElement>("[data-analytics]");
      if (marked) {
        const fromMarkup = eventFromDataset(marked.dataset, context);
        if (fromMarkup) track(fromMarkup);
        return;
      }
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const fromLink = eventFromHref(link.href, context);
      if (fromLink) track(fromLink);
    };

    const onSubmit = (event: SubmitEvent) => {
      // Bubble phase: a planner that refused the dates has already called preventDefault().
      if (event.defaultPrevented || !(event.target instanceof HTMLFormElement)) return;
      const form = event.target;
      const isPlanner = form.dataset.analytics === "availability_search" || (form.getAttribute("action") ?? "").startsWith(BOOKING_PROVIDER.baseUrl);
      if (!isPlanner) return;
      const { checkin, checkout, adults } = BOOKING_PROVIDER.params;
      track({
        name: "availability_search",
        params: {
          hasDates: fieldValue(form, checkin) !== "" && fieldValue(form, checkout) !== "",
          adults: Number.parseInt(fieldValue(form, adults), 10),
        },
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
      document.removeEventListener("submit", onSubmit);
    };
  }, [lang]);

  return null;
}
