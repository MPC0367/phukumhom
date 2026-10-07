import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/page/LegalPage";
import { Onward } from "@/components/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { privacy } from "@/content/pages/legal";
import type { LegalCondition } from "@/content/pages/legal";
import { flag, site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The privacy policy (brief sections 18 and 24): what the website does with information about its visitors.
 *
 * The page describes the website as it is configured right now: the two conditions below are read from
 * the feature flags and the measurement id, and src/content/pages/legal.ts prints only the paragraphs
 * that apply. It is review-ready content, not legally reviewed text; what the owner still has to supply
 * is listed in docs/HANDOFF.md, never on the page.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "privacy") : {};
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const ui = t(lang);

  const measuring = flag("analytics") && Boolean(site.analytics.ga4MeasurementId);
  const conditions: LegalCondition[] = [measuring ? "analytics-on" : "analytics-off", flag("enquiryDelivery") ? "delivery-on" : "delivery-off"];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "privacy"),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.privacy, route: "privacy" },
          ]),
        ]}
      />
      <LegalPage lang={lang} route="privacy" copy={privacy[lang]} conditions={conditions} />
      <Onward lang={lang} page="privacy" />
    </>
  );
}
