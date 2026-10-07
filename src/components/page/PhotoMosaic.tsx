import { getDerivative } from "@/content/assets";
import type { AssetId, Locale } from "@/content/schema";
import { Reveal } from "@/components/motion";
import { LightboxRoot, LightboxTrigger, Picture, cx, lightboxItems, lightboxLabels } from "@/components/ui";
import s from "./page.module.css";

/**
 * A small set of photographs at their own shapes, in two columns (three on request), each with its
 * catalogued caption and each opening the photograph viewer.
 *
 *   <PhotoMosaic lang={lang} assets={ids} open={c.open} label={c.label} />
 *
 *   open    the accessible name of one photograph, a pattern with {caption}
 *   label   the accessible name of the list
 *
 * The viewer moves through this set only. A frame that is not cleared for use throws (lightboxItems
 * refuses it). The frames arrive one after another as the list scrolls in. One column on a small phone.
 */

export interface PhotoMosaicProps {
  lang: Locale;
  assets: AssetId[];
  open: string;
  label: string;
  columns?: 2 | 3;
  className?: string;
}

export function PhotoMosaic({ lang, assets, open, label, columns = 2, className }: PhotoMosaicProps) {
  if (assets.length === 0) return null;
  const items = lightboxItems(assets, lang);
  const wide = columns === 3 ? "(min-width: 64rem) 17rem, (min-width: 30rem) 46vw, 92vw" : "(min-width: 64rem) 26rem, (min-width: 30rem) 46vw, 92vw";

  return (
    <LightboxRoot items={items} labels={lightboxLabels(lang)}>
      <div role="group" aria-label={label} className={className}>
        <Reveal as="ul" stagger={0.08} variant="scale" className={cx(s.mosaic, columns === 3 && s.mosaicThree)}>
        {items.map((item, index) => {
          const d = getDerivative(item.id);
          return (
            <li key={item.id} className={s.mosaicCell}>
              <LightboxTrigger index={index} label={open.replace("{caption}", item.caption)}>
                <Picture asset={item.id} lang={lang} sizes={d.height > d.width ? "(min-width: 64rem) 17rem, (min-width: 30rem) 46vw, 92vw" : wide} />
              </LightboxTrigger>
              <p className={s.mosaicCaption}>{item.caption}</p>
            </li>
          );
        })}
        </Reveal>
      </div>
    </LightboxRoot>
  );
}
