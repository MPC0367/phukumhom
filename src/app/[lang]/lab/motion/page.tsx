import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AssetId, Locale } from "@/content/schema";
import { isLocale, otherLocale } from "@/i18n/config";
import { href } from "@/lib/routes";
import { MAIN_ID } from "@/components/site/ids";
import { Picture, type PictureRatio } from "@/components/ui/Picture";
import { Clock, CountUp, DriftReel, MediaReveal, MoonTonight, Parallax, Reveal, SkyTonight, SplitReveal, Stars, SunsetTime } from "@/components/motion";
import { copy } from "./copy";
import { DayReadout, OverlayToggle, ReelProbe, TopButton } from "./LabProbes";
import s from "./lab.module.css";

/**
 * The motion lab: every component in src/components/motion on one long page, with real photographs,
 * in both languages. Internal: not in the route table, the navigation or the sitemap, and noindex.
 *
 * The loader, the provider and the progress hairline come from ./layout.tsx, arranged exactly as the
 * language layout will arrange them, and ./template.tsx gives this folder its own page transition, so
 * moving between this page and ./second is the real thing in miniature.
 */

export const metadata: Metadata = {
  title: "Motion lab | Phukumhom Resort",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ lang: string }> };

const HERO: AssetId = "clay-buildings-rooftop-pergolas-hazy-lane"; // legacy 01_24
const POND: AssetId = "pink-building-lily-pond-rocks"; // 02_08
const BALCONY: AssetId = "balcony-woven-table-chair-steps"; // 02_07
const ROOFTOP: AssetId = "rooftop-round-table-lounger-field-view"; // 02_13
const DUSK: AssetId = "rooftop-terrace-dusk-wall-lamps-spa-tub"; // 04_27

const REEL: Array<{ asset: AssetId; ratio: PictureRatio }> = [
  { asset: "open-dining-pavilion-lawn-dusk", ratio: "3/2" },
  { asset: "serrated-salad-greens-garden-bed", ratio: "4/5" },
  { asset: "gac-fruit-hanging-on-vine", ratio: "1/1" },
  { asset: "shared-pool-open-pavilion-blue-sky", ratio: "3/2" },
  { asset: "red-lettuce-leaves-water-droplets", ratio: "4/5" },
  { asset: "gourds-hanging-from-garden-trellis", ratio: "4/3" },
  { asset: "frilly-green-lettuce-garden-bed", ratio: "1/1" },
  { asset: "red-edged-lettuce-leaves-close-up", ratio: "4/5" },
];

const ratioStyle = (ratio: PictureRatio) => ({ "--ratio": ratio.replace("/", " / ") }) as CSSProperties;

/** Numeral, kicker, chapter title and intro: the sticky rail of a chapter, in miniature. */
function Rail({ n, kicker, title, intro, lang }: { n: string; kicker: string; title: string; intro: string; lang: Locale }) {
  return (
    <header className={s.rail}>
      <p className="numeral">{n}</p>
      <p className={`eyebrow ${s.railKicker}`} lang="en">
        {kicker}
      </p>
      <SplitReveal as="h2" lang={lang} className={`chapter-title ${s.railTitle}`}>
        {title}
      </SplitReveal>
      <Reveal as="p" delay={0.15} className={`lead ${s.railIntro}`}>
        {intro}
      </Reveal>
    </header>
  );
}

export default async function MotionLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = copy[lang];
  const other = otherLocale(lang);
  const o = copy[other];
  const here = `/${lang}/lab/motion`;

  return (
    <>

      {/* ── First screen: what waits for the loader ── */}
      <section className={`container ${s.hero}`}>
        <div className={s.heroText}>
          <h1 className={`eyebrow ${s.heroEyebrow}`}>
            <span>{c.kicker}</span>
            <span className={s.heroResort}>{c.resort}</span>
          </h1>
          <SplitReveal as="p" lang={lang} trigger="loader" className={`hero-line ${s.heroLine}`}>
            {c.heroLines[0]}
            <br />
            {c.heroLines[1]}
            {c.heroAccent ? (
              <>
                {" "}
                <em>{c.heroAccent}</em>
              </>
            ) : null}
          </SplitReveal>
          <Reveal as="p" trigger="loader" delay={0.35} className={`lead ${s.heroSupporting}`}>
            {c.supporting}
          </Reveal>
          <Reveal trigger="loader" delay={0.55} variant="fade" className={`eyebrow ${s.meta}`}>
            <span>{c.locality}</span>
            <span className={s.metaRule} aria-hidden="true" />
            <Clock lang={lang} label="visible" />
            <span className={s.metaRule} aria-hidden="true" />
            <SunsetTime lang={lang} />
          </Reveal>
        </div>
        <MediaReveal trigger="loader" delay={0.1} className={s.heroMedia}>
          <Parallax speed={0.08} className={s.fillFrame}>
            <Picture asset={HERO} lang={lang} fill priority ratio="4/5" sizes="(min-width: 64rem) 36rem, 100vw" />
          </Parallax>
        </MediaReveal>
      </section>

      <nav className={`container ${s.index}`} aria-label={c.kicker}>
        <a href="#split">{c.index.split}</a>
        <a href="#reveal">{c.index.reveal}</a>
        <a href="#media">{c.index.media}</a>
        <a href="#reel">{c.index.reel}</a>
        <a href="#sky">{c.index.sky}</a>
        <a href="#links">{c.index.links}</a>
      </nav>

      {/* ── 01 SplitReveal ── */}
      <section id="split" className={`container ${s.chapter}`}>
        <Rail n="01" kicker={c.split.kicker} title={c.split.title} intro={c.split.intro} lang={lang} />
        <div className={s.content}>
          <SplitReveal as="p" lang={lang} className={`statement ${s.statement}`}>
            {c.split.statement}
            {c.split.statementAccent ? (
              <>
                {" "}
                <em>{c.split.statementAccent}</em>
              </>
            ) : null}
          </SplitReveal>
          <Reveal as="p" className="body">
            {c.split.body}
          </Reveal>
          <div className={s.specimen}>
            <p className="small muted">{c.split.otherNote}</p>
            <SplitReveal as="p" lang={other} className={`statement ${s.statement}`}>
              {o.split.statement}
              {o.split.statementAccent ? (
                <>
                  {" "}
                  <em>{o.split.statementAccent}</em>
                </>
              ) : null}
            </SplitReveal>
          </div>
        </div>
      </section>

      {/* ── 02 Reveal + CountUp ── */}
      <section id="reveal" className={`container ${s.chapter}`}>
        <Rail n="02" kicker={c.reveal.kicker} title={c.reveal.title} intro={c.reveal.intro} lang={lang} />
        <div className={s.content}>
          <Reveal as="ul" stagger={0.09} className={s.tiles}>
            <li className={s.tile}>
              <CountUp value={3} className="figure" />
              <p className="small">{c.reveal.tiles.rooms}</p>
            </li>
            <li className={s.tile}>
              <p className="figure">{c.reveal.checkInTime}</p>
              <p className="small">{c.reveal.tiles.checkIn}</p>
            </li>
            <li className={s.tile}>
              <p className="figure">{c.reveal.checkOutTime}</p>
              <p className="small">{c.reveal.tiles.checkOut}</p>
            </li>
          </Reveal>
          <div className={s.variants}>
            {(["rise", "fade", "clip", "scale"] as const).map((variant, i) => (
              <Reveal key={variant} variant={variant} delay={i * 0.09} className={s.variant}>
                <p className="numeral">{`0${i + 1}`}</p>
                <p className="h3">{c.reveal.variants[variant]}</p>
                <p className="small muted">{c.reveal.variantNote}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 MediaReveal + Parallax ── */}
      <section id="media" className={`container ${s.chapter}`}>
        <Rail n="03" kicker={c.media.kicker} title={c.media.title} intro={c.media.intro} lang={lang} />
        <div className={`${s.content} ${s.duo}`}>
          <MediaReveal className={s.duoWide}>
            <Parallax speed={0.1} className={s.fillFrame}>
              <Picture asset={POND} lang={lang} fill ratio="3/2" sizes="(min-width: 64rem) 55rem, 100vw" />
            </Parallax>
          </MediaReveal>
          <MediaReveal delay={0.15} className={s.duoTall}>
            <Parallax speed={-0.08} className={s.fillFrame}>
              <Picture asset={BALCONY} lang={lang} fill ratio="4/5" sizes="(min-width: 64rem) 20rem, 60vw" />
            </Parallax>
          </MediaReveal>
        </div>
      </section>

      {/* ── Band: parallax on a full-bleed photograph, a statement over a scrim ── */}
      <section className={s.band}>
        <div className={s.bandMedia}>
          <Parallax speed={0.14} className={s.fillFrame}>
            <Picture asset={ROOFTOP} lang={lang} fill />
          </Parallax>
        </div>
        <div className={s.bandScrim} aria-hidden="true" />
        <div className={`container on-photo ${s.bandText}`}>
          <SplitReveal as="p" lang={lang} className={`statement ${s.bandLine}`}>
            {c.media.band}
          </SplitReveal>
        </div>
      </section>

      {/* ── 04 DriftReel ── */}
      <section id="reel" className={`on-sand ${s.reelBand}`}>
        <div className={`container ${s.reelHead}`}>
          <Rail n="04" kicker={c.reel.kicker} title={c.reel.title} intro={c.reel.intro} lang={lang} />
          <OverlayToggle off={c.reel.overlayOff} on={c.reel.overlayOn} />
        </div>
        <ReelProbe last={c.reel.last} none={c.reel.none} photo={c.reel.photo}>
          <DriftReel label={c.reel.label} gap="1rem" className={s.reel}>
            {REEL.map(({ asset, ratio }, i) => (
              <button key={asset} type="button" className={s.reelItem} style={ratioStyle(ratio)} data-reel-item={i + 1}>
                <Picture asset={asset} lang={lang} fill ratio={ratio} sizes="(min-width: 64rem) 30rem, 70vw" />
              </button>
            ))}
          </DriftReel>
        </ReelProbe>
      </section>

      {/* ── 05 Stars and the sky ── */}
      <section id="sky" className={`on-twilight ${s.skyBand}`}>
        <Stars className={s.stars} />
        <div className={`container ${s.chapter} ${s.skyChapter}`}>
          <Rail n="05" kicker={c.sky.kicker} title={c.sky.title} intro={c.sky.body} lang={lang} />
          <div className={`${s.content} ${s.skyContent}`}>
            <MediaReveal className={s.skyMedia}>
              <Picture asset={DUSK} lang={lang} fill ratio="3/2" sizes="(min-width: 64rem) 34rem, 100vw" />
            </MediaReveal>
            <Reveal className={s.skyPanel}>
              <SkyTonight lang={lang} />
            </Reveal>
            <Reveal as="dl" stagger={0.09} className={s.skyFacts}>
              <div>
                <dt className="eyebrow">{c.sky.clock}</dt>
                <dd className={`figure ${s.skyFigure}`}>
                  <Clock lang={lang} />
                </dd>
              </div>
              <div>
                <dt className="eyebrow">SunsetTime</dt>
                <dd className="lead">
                  <SunsetTime lang={lang} />
                </dd>
              </div>
              <div>
                <dt className="eyebrow">MoonTonight</dt>
                <dd className="lead">
                  <MoonTonight lang={lang} label="visible" />
                </dd>
              </div>
            </Reveal>
            <Reveal>
              <DayReadout label={c.sky.progress} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 06 PageTransition and anchors ── */}
      <section id="links" className={`container ${s.chapter}`}>
        <Rail n="06" kicker={c.links.kicker} title={c.links.title} intro={c.links.intro} lang={lang} />
        <Reveal as="ul" stagger={0.09} className={`${s.content} ${s.linkList}`}>
          <li>
            <Link href={`${here}/second`}>{c.links.second}</Link>
          </li>
          <li>
            <Link href={`/${lang}/styleguide`}>{c.links.styleguide}</Link>
          </li>
          <li>
            <Link href={href(lang, "home")}>{c.links.home}</Link>
          </li>
          <li>
            <Link href={`/${other}/lab/motion`}>{c.links.other}</Link>
          </li>
          <li>
            <Link href={`${here}#split`}>{c.index.split}</Link>
          </li>
          <li>
            <a href={`#${MAIN_ID}`}>{c.links.top}</a>
          </li>
          <li>
            <TopButton label={c.links.top} />
          </li>
        </Reveal>
      </section>
    </>
  );
}
