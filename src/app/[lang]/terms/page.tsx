import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/page/LegalPage";
import { Onward } from "@/components/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { terms } from "@/content/pages/legal";
import type { LegalCondition } from "@/content/pages/legal";
import { flag, site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The website terms (brief section 18): what the website is for, and where the terms of a booking are set.
 *
 * The page describes the website as it is configured right now: the two conditions below are read from
 * the feature flags and the measurement id, and src/content/pages/legal.ts prints only the paragraphs
 * that apply. It is review-ready content, not legally reviewed text; what the owner still has to supply
 * is listed in docs/HANDOFF.md, never on the page.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "terms") : {};
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const ui = t(lang);

  const measuring = flag("analytics") && Boolean(site.analytics.ga4MeasurementId);
  const conditions: LegalCondition[] = [measuring ? "analytics-on" : "analytics-off", flag("enquiryDelivery") ? "delivery-on" : "delivery-off"];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "terms"),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.terms, route: "terms" },
          ]),
        ]}
      />
      <LegalPage lang={lang} route="terms" copy={terms[lang]} conditions={conditions} />
      <Onward lang={lang} page="terms" />
    </>
  );
}
