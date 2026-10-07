import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqBrowser, type FaqGroup } from "@/components/faq/FaqBrowser";
import { faqLinkHref, pickFaq } from "@/components/faq/items";
import { HomeClosing } from "@/components/home/closing";
import { Reveal } from "@/components/motion";
import { Onward, PageLead } from "@/components/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactActions } from "@/components/site";
import { Kicker, PageHero, Section, TextLink, cx } from "@/components/ui";
import { faq } from "@/content/faq";
import { FAQ_HERO, GLANCE_ANSWERS, GROUP_ORDER, copy } from "@/content/pages/faq";
import { getSeo } from "@/content/seo";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import s from "./faq.module.css";

/**
 * The FAQ page (brief section 18).
 *
 *   hero       rooftop pergolas over an entrance at blue hour
 *   lead       the statement, one paragraph, and four answers in a sentence each beside them
 *   questions  every question in its group, on native <details>, with a search that filters as you type
 *   ask        the invitation to contact the resort, with the ways to do it
 *   onward · closing
 *
 * The questions and answers are data (src/content/faq.ts) and are handed to the browser island as plain
 * strings with their onward links already resolved. The same entries feed the FAQPage structured data,
 * so what a search engine reads is exactly what the page shows.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "faq") : {};
}

export default async function FaqPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("faq", lang);

  const groups: FaqGroup[] = GROUP_ORDER.map((group) => ({
    id: `group-${group}`,
    label: c.groups[group],
    items: faq
      .filter((item) => item.group === group)
      .map((item) => {
        const to = faqLinkHref(item, lang);
        return {
          id: item.id,
          question: item.question[lang],
          answer: item.answer[lang],
          ...(to && item.link ? { link: { href: to, label: item.link.label[lang] } } : {}),
        };
      }),
  })).filter((group) => group.items.length > 0);

  const glance = pickFaq(GLANCE_ANSWERS).map((item) => item.answer[lang][0]);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "faq"),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.faq, route: "faq" },
          ]),
          faqJsonLd(lang, faq),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={FAQ_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.faq }]}
      />

      <PageLead lang={lang} statement={c.statement} accent={c.accent} body={c.body} glance={glance} />

      <Section tone="white" id="questions">
        <div className="container">
          <FaqBrowser groups={groups} labels={{ search: c.search.label, countOne: c.search.countOne, countMany: c.search.countMany, none: c.search.none, clear: c.search.clear, jump: c.search.jump }} />
        </div>
      </Section>

      <Section tone="sand" spacing="tight" labelledBy="faq-ask">
        <div className={cx("container", s.ask)}>
          <Reveal className={s.askWords}>
            <Kicker>{c.ask.kicker}</Kicker>
            <h2 id="faq-ask" className="h2">
              {c.ask.heading}
            </h2>
            <p className={cx("lead", s.askLead)}>{c.ask.lead}</p>
          </Reveal>
          <Reveal delay={0.15} className={s.askActions}>
            <ContactActions lang={lang} include={["call", "facebook"]} placement="faq" />
            <TextLink variant="arrow" href={href(lang, "contact")}>
              {ui.actions.contactResort}
            </TextLink>
          </Reveal>
        </div>
      </Section>

      <Onward lang={lang} page="faq" tone="paper" />
      <HomeClosing lang={lang} />
    </>
  );
}
