import type { AssetId, Locale } from "@/content/schema";
import { getAsset, getDerivative, isUsable, largest, srcSet } from "@/content/assets";
import { t } from "@/i18n/ui";
import type { LightboxItem, LightboxLabels } from "./lightbox-types";

/**
 * SERVER helpers for the lightbox. Call them in a Server Component and pass the result to <LightboxRoot>:
 *
 *   const ids = galleryAssets().map((a) => a.id);
 *   <LightboxRoot items={lightboxItems(ids, lang)} labels={lightboxLabels(lang)}>
 *     {ids.map((id, i) => (
 *       <LightboxTrigger key={id} index={i} label={…}>
 *         <Picture asset={id} lang={lang} ratio="4/3" sizes="…" />
 *       </LightboxTrigger>
 *     ))}
 *   </LightboxRoot>
 *
 * The index a trigger opens is its position in the array passed here, so build the triggers from the
 * same array. A frame the catalogue has switched off (no approved use, or identifiable people) throws:
 * a lightbox must never be the back door for a photograph that is not cleared.
 *
 * This module reads the catalogue (about 380 KB of JSON). Never import it from a "use client" file.
 */

export function lightboxItems(assetIds: AssetId[], lang: Locale): LightboxItem[] {
  return assetIds.map((id) => {
    const a = getAsset(id);
    if (!isUsable(a)) throw new Error(`lightboxItems: "${id}" is not cleared for use (see its "excluded" note in the manifest).`);
    const d = getDerivative(id);
    const jpegs = d.variants.filter((v) => v.jpg);
    return {
      id,
      webp: srcSet(d, "webp"),
      jpg: srcSet(d, "jpg"),
      src: largest(d).jpg,
      thumb: jpegs[0].jpg,
      width: d.width,
      height: d.height,
      alt: a.alt[lang],
      caption: a.caption[lang],
      ground: d.dominant,
    };
  });
}

/** The viewer's interface strings, straight from the shared table (src/i18n/ui.ts). */
export function lightboxLabels(lang: Locale): LightboxLabels {
  const ui = t(lang);
  return {
    viewer: ui.a11y.photoViewer,
    close: ui.actions.close,
    previous: ui.actions.previous,
    next: ui.actions.next,
    count: ui.patterns.photoCount,
    failed: ui.messages.photoFailed,
  };
}
