import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { faqAccordionItems, pickFaq } from "@/components/faq/items";
import { ContactPanels } from "@/components/home/arrive";
import { HomeClosing } from "@/components/home/closing";
import nearbyStyles from "@/components/home/nearby/HomeNearby.module.css";
import { Reveal, SplitReveal } from "@/components/motion";
import { Feature, Onward, PageLead, pageLayout } from "@/components/page";
import { PlacesFilter } from "@/components/places";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactActions } from "@/components/site";
import { Accordion, Chapter, Kicker, PageHero } from "@/components/ui";
import { copy as nearbyCopy } from "@/content/pages/home/nearby";
import { ARRIVAL_QUESTIONS, LOCATION_HERO, RECEPTION_FRAME, copy } from "@/content/pages/location";
import { pub } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { fill, t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The Location page (brief section 13).
 *
 *   hero         the buildings and their rooftop pergolas in late-afternoon light
 *   lead         the locality sentence, two paragraphs, Open in Google Maps and Call, and the short answer
 *   01  address  the address panel (copy, share, the map link) and the "talk to the resort" panel
 *   02  arrival  the reception building, and the arrival questions answered in place (from the FAQ)
 *   03  around   places to visit around Khao Yai: the filterable list
 *   onward · closing
 *
 * FACTS. The address, phone and map link pass through pub(); a withheld one leaves no trace. The map
 * link is the resort's own Google Maps listing and is never called the entrance. No coordinates,
 * distances or journey times are printed and no map is embedded (the `mapEmbed` flag is off). The
 * arrival answers are the FAQ's own entries, so the two pages cannot disagree.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "location", { ogAsset: LOCATION_HERO }) : {};
}

export default async function LocationPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const n = nearbyCopy[lang];
  const ui = t(lang);
  const seo = getSeo("location", lang);
  const address = pub(site.address);
  const map = pub(site.maps.listingUrl);
  const phone = pub(site.phone);

  const glance = [
    address ? fill(c.glance.address, { address: address[lang].replace(/, Thailand$/, "") }) : null,
    c.glance.notInPark,
    map ? c.glance.maps : null,
    phone ? c.glance.call : null,
  ].filter((item): item is string => item !== null);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "location", { ogAsset: LOCATION_HERO }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.location, route: "location" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={LOCATION_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.location }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={glance}
        actions={<ContactActions lang={lang} include={["directions", "call"]} placement="location" />}
      />

      <Chapter
        lang={lang}
        id="address"
        number={1}
        kicker={c.address.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.address.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.address.intro} />
          </Reveal>
        }
      >
        <ContactPanels lang={lang} placement="location" />
      </Chapter>

      <Chapter
        lang={lang}
        id="arrival"
        number={2}
        tone="sand"
        divider={false}
        kicker={c.arrival.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.arrival.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.arrival.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          <Feature lang={lang} asset={RECEPTION_FRAME} title={c.arrival.receptionTitle} ratio="3/2">
            {c.arrival.receptionBody.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </Feature>
          <Reveal variant="fade">
            <Kicker>{c.arrival.questionsHeading}</Kicker>
            <Accordion items={faqAccordionItems(pickFaq(ARRIVAL_QUESTIONS), lang, "arrival-")} exclusive="arrival" />
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        lang={lang}
        id="around"
        number={3}
        divider={false}
        kicker={n.kicker}
        className={nearbyStyles.chapter}
        title={
          <SplitReveal as="span" lang={lang} className={nearbyStyles.railTitle}>
            {n.title.accent ? (
              <>
                <em>{n.title.accent}</em> <span className={nearbyStyles.keep}>{n.title.rest}</span>
              </>
            ) : (
              n.title.rest
            )}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2} className={nearbyStyles.railIntro}>
            <Phrases lang={lang} text={n.intro} />
          </Reveal>
        }
      >
        <PlacesFilter lang={lang} />
      </Chapter>

      <Onward lang={lang} page="location" />
      <HomeClosing lang={lang} />
    </>
  );
}
