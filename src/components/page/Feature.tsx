import type { CSSProperties, ReactNode } from "react";
import { getAsset } from "@/content/assets";
import type { AssetId, Locale } from "@/content/schema";
import { MediaReveal, Parallax, Reveal } from "@/components/motion";
import { Kicker, Picture, cx, type PictureRatio } from "@/components/ui";
import s from "./page.module.css";

/**
 * A photograph beside its words: the building block of the inner pages' chapters.
 *
 *   <Features>
 *     <Feature lang={lang} asset={id} title="The gardens and the pond">…paragraphs, a link…</Feature>
 *     <Feature lang={lang} asset={id} title="…" flip ratio="4/5">…</Feature>
 *   </Features>
 *
 * The photograph unveils as it scrolls in and drifts a little inside its rounded frame; the words rise
 * beside it. Under it sits the catalogue's caption: a fact about the frame, never a promise
 * (BUILD-CONTRACT section 8). `flip` puts the photograph on the right from 48rem, so a stack of
 * features alternates. Below 48rem the photograph is always first.
 *
 *   title         an <h3> by default (a feature lives under a chapter's <h2>); headingLevel={2} otherwise
 *   ratio         the photograph's box. Default 4/3. Use 4/5 or 3/4 for an upright frame.
 *   caption       defaults to the catalogued caption; `false` prints none
 */

export interface FeatureProps {
  lang: Locale;
  asset: AssetId;
  ratio?: PictureRatio;
  flip?: boolean;
  kicker?: string;
  title: string;
  headingLevel?: 2 | 3;
  caption?: string | false;
  actions?: ReactNode;
  id?: string;
  children: ReactNode;
}

export function Feature({ lang, asset, ratio = "4/3", flip = false, kicker, title, headingLevel = 3, caption, actions, id, children }: FeatureProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const text = caption === false ? null : (caption ?? getAsset(asset).caption[lang]);
  return (
    <article id={id} className={cx(s.feature, flip && s.flip)}>
      {/* The ratio is a custom property on the figure: the frame inside reads it, and MediaReveal takes a class only. */}
      <figure className={s.featureMedia} style={{ "--feature-ratio": ratio.replace("/", " / ") } as CSSProperties}>
        <MediaReveal className={s.featureFrame}>
          <Parallax speed={0.07} className={s.featureDrift}>
            <Picture asset={asset} lang={lang} fill ratio={ratio} sizes="(min-width: 64rem) 30rem, (min-width: 48rem) 52vw, 100vw" />
          </Parallax>
        </MediaReveal>
        {text ? <figcaption className={s.featureCaption}>{text}</figcaption> : null}
      </figure>
      <Reveal delay={0.15} className={s.featureText}>
        {kicker ? <Kicker className={s.featureKicker}>{kicker}</Kicker> : null}
        <Heading className={cx("h3", s.featureTitle)}>{title}</Heading>
        <div className={cx("prose", s.featureBody)}>{children}</div>
        {actions ? <div className={s.featureActions}>{actions}</div> : null}
      </Reveal>
    </article>
  );
}

/** A stack of features with the rhythm between them. */
export function Features({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(s.features, className)}>{children}</div>;
}
