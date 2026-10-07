import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryBrowser, type GalleryFilterOption, type GalleryItem } from "@/components/gallery/GalleryBrowser";
import { HomeClosing } from "@/components/home/closing";
import { Onward, PageLead } from "@/components/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingLink } from "@/components/site";
import { PageHero, Section, lightboxItems, lightboxLabels } from "@/components/ui";
import { availableGalleryFilters, galleryAssets, getAsset } from "@/content/assets";
import { GALLERY_HERO, GALLERY_TWINS, WEAVE, copy } from "@/content/pages/gallery";
import { getRoom } from "@/content/rooms";
import type { Asset, GalleryFilter } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { isLocale } from "@/i18n/config";
import { fill, t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The Gallery page (brief section 15).
 *
 *   hero     the carved standing stone, a pink building and the lawn
 *   lead     the statement, one paragraph, Check availability, and the short answer
 *   wall     every gallery photograph, with filter chips (Rooms, Rooftops, Gardens, Dining, Around the
 *            resort) and the photograph viewer
 *   onward · closing
 *
 * WHICH FRAMES. Only frames the catalogue clears for the gallery (`uses` includes "gallery", no
 * identifiable people), less the near twins named in the copy file. A filter with no frames is not
 * offered. A room photograph's caption is led by the room type it is catalogued against.
 *
 * THE ORDER, with no filter: the groups take turns (gardens, rooftops, rooms, dining, around the
 * resort), strongest frames first within each, so the page opens varied instead of as thirty garden
 * frames and then thirty plates.
 *
 * THE FILTER lives in the query string and is read in the browser only: this page reads no request
 * data, stays static, answers 200 for any `filter` value and canonicalises to /{lang}/gallery.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "gallery", { ogAsset: GALLERY_HERO }) : {};
}

/** The photographs in display order: the groups take turns; each frame appears once, under its first group. */
function woven(): Asset[] {
  const twins = new Set(GALLERY_TWINS);
  const pool = galleryAssets().filter((asset) => !twins.has(asset.legacyId));
  const queues = WEAVE.map((group) => pool.filter((asset) => asset.gallery[0] === group).sort((a, b) => b.quality - a.quality));
  const out: Asset[] = [];
  while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) out.push(next);
    }
  }
  // Anything whose first group is not in the weave still belongs in the gallery.
  for (const asset of pool) if (!out.includes(asset)) out.push(asset);
  return out;
}

export default async function GalleryPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("gallery", lang);

  const assets = woven();
  const items: GalleryItem[] = lightboxItems(
    assets.map((asset) => asset.id),
    lang,
  ).map((item) => {
    const asset = getAsset(item.id);
    const caption = asset.rooms.length === 1 ? fill(c.room, { room: getRoom(asset.rooms[0]).name, caption: item.caption }) : item.caption;
    return { ...item, caption, groups: asset.gallery };
  });

  const groups: GalleryFilter[] = availableGalleryFilters().filter((group) => items.some((item) => item.groups.includes(group)));
  const filters: GalleryFilterOption[] = [
    { id: "all", label: ui.gallery.all, count: items.length },
    ...groups.map((group) => ({ id: group, label: ui.gallery[group], count: items.filter((item) => item.groups.includes(group)).length })),
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "gallery", { ogAsset: GALLERY_HERO }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.gallery, route: "gallery" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={GALLERY_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.gallery }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={[fill(c.glance.count, { count: items.length }), c.glance.rooms, c.glance.ask]}
        actions={<BookingLink lang={lang} placement="gallery" planner size="lg" />}
      />

      <Section tone="white" id="photographs">
        <div className="container-wide">
          <GalleryBrowser
            items={items}
            filters={filters}
            labels={{ filterLabel: c.filterLabel, countOne: c.countOne, countMany: c.countMany, open: c.open, gridLabel: c.gridLabel }}
            viewer={lightboxLabels(lang)}
          />
        </div>
      </Section>

      <Onward lang={lang} page="gallery" />
      <HomeClosing lang={lang} />
    </>
  );
}
