import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Callout, Feature, Features, Notes, Onward, PageLead, PhotoMosaic, ReelBand, pageLayout } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactActions } from "@/components/site";
import { Button, Chapter, PageHero, TextLink } from "@/components/ui";
import { dining } from "@/content/dining";
import { DINING_HERO, DINING_REEL, GARDEN_FRAMES, PAVILION_FRAMES, copy } from "@/content/pages/dining";
import { isPublishable, pub } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The Dining page (brief section 11).
 *
 *   hero         the open-sided dining pavilion at dusk
 *   lead         the statement, two paragraphs, "Ask the team about meals", and the short answer
 *   01  garden   the resort's own account of its kitchen garden, in two photograph features and a note
 *   02  pavilion the restaurant as the photographs show it: a small set that opens the viewer
 *   03  meals    the breakfast sentence and who to ask about hours, the menu and dietary requests
 *   reel         plates and garden beds, captioned as what they show and labelled "not a menu"
 *   onward · closing
 *
 * FACTS. The kitchen-garden sentences are printed from `dining.kitchenGarden.points` and vanish with
 * their chapter if that record is ever withdrawn. The breakfast sentence is `dining.breakfast` through
 * pub(). Nothing on the page names the restaurant, an hour, a dish on a menu, a wine or a price.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "dining") : {};
}

export default async function DiningPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("dining", lang);

  const breakfast = pub(dining.breakfast)?.[lang] ?? null;
  const garden = isPublishable(dining.kitchenGarden.status) ? dining.kitchenGarden.points[lang] : [];
  const [gardenOpening, gardenGrows, gardenMade, gardenDrink, gardenSeason] = garden;

  const glance = [c.glance.restaurant, breakfast, garden.length > 0 ? c.glance.garden : null, c.glance.ask].filter((item): item is string => Boolean(item));
  const askHref = href(lang, "contact", { query: { type: "dining" } });

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "dining"),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.dining, route: "dining" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={DINING_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.dining }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={glance}
        actions={
          <>
            <Button href={askHref} icon="arrow-right" size="lg">
              {c.askMeals}
            </Button>
            <TextLink variant="arrow" href={href(lang, "faq", { hash: "breakfast" })}>
              {ui.nav.faq}
            </TextLink>
          </>
        }
      />

      {garden.length > 0 ? (
        <Chapter
          lang={lang}
          id="kitchen-garden"
          number={1}
          kicker={c.garden.kicker}
          title={
            <SplitReveal as="span" lang={lang}>
              {c.garden.title}
            </SplitReveal>
          }
          intro={
            <Reveal as="span" variant="fade" delay={0.2}>
              <Phrases lang={lang} text={c.garden.intro} />
            </Reveal>
          }
        >
          <div className={pageLayout.stack}>
            <Features>
              <Feature lang={lang} asset={GARDEN_FRAMES.grows} title={c.garden.growsTitle}>
                {[gardenOpening, gardenGrows].filter(Boolean).map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </Feature>
              <Feature lang={lang} asset={GARDEN_FRAMES.season} title={c.garden.seasonTitle} flip ratio="4/5">
                {[gardenMade, gardenDrink].filter(Boolean).map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </Feature>
            </Features>
            {gardenSeason ? (
              <Callout lang={lang} label={c.garden.seasonLabel}>
                {gardenSeason}
              </Callout>
            ) : null}
          </div>
        </Chapter>
      ) : null}

      <Chapter
        lang={lang}
        id="pavilion"
        number={2}
        tone="sand"
        divider={false}
        kicker={c.pavilion.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.pavilion.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.pavilion.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          <Reveal variant="fade" className="prose">
            {c.pavilion.body.map((text) => (
              <p key={text} className="lead">
                {text}
              </p>
            ))}
          </Reveal>
          <PhotoMosaic lang={lang} assets={PAVILION_FRAMES.map((frame) => frame.asset)} open={c.pavilion.open} label={c.pavilion.label} />
        </div>
      </Chapter>

      <Chapter
        lang={lang}
        id="meals"
        number={3}
        divider={false}
        kicker={c.meals.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.meals.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.meals.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          <Notes items={[breakfast, ...c.meals.notes].filter((item): item is string => Boolean(item))} ruled />
          <ContactActions lang={lang} include={["call", "facebook", "contact"]} placement="dining" />
        </div>
      </Chapter>

      <ReelBand
        lang={lang}
        kicker={c.reel.kicker}
        line={c.reel.line}
        accent={c.reel.accent}
        lead={c.reel.lead}
        label={c.reel.label}
        hint={c.reel.hint}
        frames={DINING_REEL}
        heights={{ min: 15, max: 22 }}
      />

      <Onward lang={lang} page="dining" tone="paper" />
      <HomeClosing lang={lang} />
    </>
  );
}
