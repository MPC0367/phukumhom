import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Notes, Onward, PageLead, PhotoMosaic, pageLayout } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactActions, notFoundPageMetadata } from "@/components/site";
import { Button, Chapter, PageHero } from "@/components/ui";
import { GATHERINGS_HERO, SETTING_FRAMES, copy } from "@/content/pages/gatherings";
import { getSeo } from "@/content/seo";
import { flag } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * Group stays and gatherings (brief section 14): a template, UNPUBLISHED.
 *
 * While the `gatherings` flag is off this route answers 404, exactly like an address that does not
 * exist, and nothing links to it (the route table hides a flagged-off page everywhere). The static
 * export does not ship it at all (scripts/export-pages.mjs prunes the folder while the flag is off).
 *
 * With the flag on it is a short page whose one job is to carry a well-formed enquiry to the contact
 * form: no capacity, package, price or venue promise appears, because none is confirmed
 * (src/content/pages/gatherings.ts). It stays out of search indexes even then (src/content/seo.ts).
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return flag("gatherings") ? pageMetadata(lang, "gatherings", { ogAsset: GATHERINGS_HERO }) : notFoundPageMetadata(lang);
}

export default async function GatheringsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang) || !flag("gatherings")) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("gatherings", lang);
  const enquireHref = href(lang, "contact", { query: { type: "group" } });

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "gatherings", { ogAsset: GATHERINGS_HERO }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.gatherings, route: "gatherings" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={GATHERINGS_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.gatherings }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={c.glance}
        actions={
          <Button href={enquireHref} icon="arrow-right" size="lg">
            {c.enquire}
          </Button>
        }
      />

      <Chapter
        lang={lang}
        id="enquire"
        number={1}
        kicker={c.tell.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.tell.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.tell.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          <Notes items={c.tell.items} ruled />
          <div className={pageLayout.row}>
            <Button href={enquireHref} icon="arrow-right">
              {c.enquire}
            </Button>
            <ContactActions lang={lang} include={["call"]} placement="contact" />
          </div>
        </div>
      </Chapter>

      <Chapter
        lang={lang}
        id="setting"
        number={2}
        tone="sand"
        divider={false}
        kicker={c.setting.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.setting.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.setting.intro} />
          </Reveal>
        }
      >
        <PhotoMosaic lang={lang} assets={SETTING_FRAMES} open={c.setting.open} label={c.setting.label} />
      </Chapter>

      <Onward lang={lang} page="gatherings" tone="paper" />
      <HomeClosing lang={lang} />
    </>
  );
}
