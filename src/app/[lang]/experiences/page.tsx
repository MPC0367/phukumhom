import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SkyTonight, SplitReveal } from "@/components/motion";
import { Callout, Feature, Features, Onward, PageLead, PhotoMosaic, StatementBand, pageLayout } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, Chapter, Chip, PageHero, Section, TextLink, cx } from "@/components/ui";
import { experiences } from "@/content/experiences";
import { EXPERIENCES_HERO, GARDEN_MOSAIC, POOL_MOSAIC, ROOFTOP_BAND, copy } from "@/content/pages/experiences";
import { pub, type Experience } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import s from "./experiences.module.css";

/**
 * "Around the resort" (brief section 12): four editorial entries, none of them a bookable activity.
 *
 *   hero         sunset over the buildings and the clipped hedges
 *   lead         the statement, two paragraphs, "Ask the team", and the short answer
 *   01  gardens  the gardens and the pond, the kitchen garden, and a small set of garden photographs
 *   band         a rooftop terrace at dusk, with the glossary's clear-evening sentence
 *   02  rooftop  mornings and evenings on the private rooftop, beside tonight's sunset and moon
 *   03  pool     the shared pool, told apart from the Executive rooftop spa tub
 *   note         before you plan
 *   onward · closing
 *
 * FACTS. Each entry's name, description and photograph come from src/content/experiences.ts. An
 * entry carries its id as a fragment target (the homepage's tiles link to /experiences#shared-pool and
 * the like). An entry's note is printed (as a chip) only when it is publishable; hours, charges and booking rules are
 * all withheld there, so none has a row here. No activity is named.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "experiences", { ogAsset: EXPERIENCES_HERO }) : {};
}

function entry(id: string): Experience {
  const found = experiences.find((item) => item.id === id);
  if (!found) throw new Error(`Experiences page: no entry "${id}" in src/content/experiences.ts.`);
  return found;
}

export default async function ExperiencesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("experiences", lang);

  const gardens = entry("gardens-and-pond");
  const kitchen = entry("kitchen-garden");
  const rooftop = entry("private-rooftop");
  const pool = entry("shared-pool");
  const rooftopNote = pub(rooftop.notes)?.[lang] ?? null;

  const askHref = href(lang, "contact", { query: { type: "general" } });

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "experiences", { ogAsset: EXPERIENCES_HERO }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.experiences, route: "experiences" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={EXPERIENCES_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.experiences }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={[c.glance.grounds, c.glance.pool, c.glance.rooftops, c.glance.ask]}
        actions={
          <Button href={askHref} icon="arrow-right" size="lg">
            {c.askTeam}
          </Button>
        }
      />

      <Chapter
        lang={lang}
        id="gardens"
        number={1}
        kicker={c.gardens.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.gardens.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.gardens.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          <Features>
            {gardens.asset ? (
              <Feature lang={lang} id={gardens.id} asset={gardens.asset} title={gardens.name[lang]}>
                <p>{gardens.description[lang]}</p>
              </Feature>
            ) : null}
            {kitchen.asset ? (
              <Feature
                lang={lang}
                id={kitchen.id}
                asset={kitchen.asset}
                title={kitchen.name[lang]}
                flip
                actions={
                  <TextLink variant="arrow" href={href(lang, "dining")}>
                    {c.gardens.diningLink}
                  </TextLink>
                }
              >
                <p>{kitchen.description[lang]}</p>
              </Feature>
            ) : null}
          </Features>
          <PhotoMosaic lang={lang} assets={GARDEN_MOSAIC} open={c.open} label={c.gardens.mosaicLabel} />
        </div>
      </Chapter>

      <StatementBand lang={lang} asset={ROOFTOP_BAND} kicker={c.band.kicker} line={c.band.line} />

      <Chapter
        lang={lang}
        id="rooftop"
        number={2}
        divider={false}
        kicker={c.rooftop.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.rooftop.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.rooftop.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          {rooftop.asset ? (
            <Feature
              lang={lang}
              id={rooftop.id}
              asset={rooftop.asset}
              title={rooftop.name[lang]}
              actions={
                <>
                  {rooftopNote ? <Chip>{rooftopNote}</Chip> : null}
                  <TextLink variant="arrow" href={href(lang, "room", { room: "executive-pool-spa" })}>
                    {c.rooftop.roomLink}
                  </TextLink>
                </>
              }
            >
              <p>{rooftop.description[lang]}</p>
            </Feature>
          ) : null}
          <Reveal variant="clip" className={cx("on-twilight", s.sky)}>
            <h3 className={cx("h3", s.skyHeading)}>{c.rooftop.skyHeading}</h3>
            <SkyTonight lang={lang} className={s.skyPanel} />
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        lang={lang}
        id="pool"
        number={3}
        tone="sand"
        divider={false}
        kicker={c.pool.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.pool.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.pool.intro} />
          </Reveal>
        }
      >
        <div className={pageLayout.stack}>
          {pool.asset ? (
            <Feature lang={lang} id={pool.id} asset={pool.asset} title={pool.name[lang]} flip>
              <p>{pool.description[lang]}</p>
            </Feature>
          ) : null}
          <PhotoMosaic lang={lang} assets={POOL_MOSAIC} open={c.open} label={c.pool.mosaicLabel} />
        </div>
      </Chapter>

      <Section spacing="tight">
        <div className="container">
          <Callout lang={lang} label={c.plan.label} className={s.plan}>
            {c.plan.text}
          </Callout>
        </div>
      </Section>

      <Onward lang={lang} page="experiences" />
      <HomeClosing lang={lang} />
    </>
  );
}
