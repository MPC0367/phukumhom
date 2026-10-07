import type { Locale } from "@/content/schema";
import { pub } from "@/content/schema";
import { amenities, getRoom } from "@/content/rooms";
import { site } from "@/content/site";
import { t } from "@/i18n/ui";
import { bookingHref } from "@/lib/booking";
import { formatTime } from "@/lib/format";
import { href } from "@/lib/routes";
import { Button, Chip, Kicker, Panel, Rule, TextLink, Tile, TileRow, VisuallyHidden } from "@/components/ui";
import { cx } from "@/components/ui/cx";
import { chrome, g, glossary as G } from "./copy";
import { FilterDemo } from "./Demos";
import { Spec } from "./Spec";
import s from "./styleguide.module.css";

export type Surface = "paper" | "sand" | "white" | "twilight" | "forest" | "photo";

/**
 * The surface kit: every colour-dependent primitive, in the same markup, rendered once per ground by the
 * page. Nothing here knows which ground it is on. That is the point.
 */
export function Kit({ lang, surface }: { lang: Locale; surface: Surface }) {
  const ui = t(lang);
  const c = chrome[lang];
  const room = getRoom("executive-pool-spa");
  const mapsUrl = pub(site.maps.listingUrl);
  const checkIn = formatTime(pub(site.checkIn), lang);
  const checkOut = formatTime(pub(site.checkOut), lang);
  // For the tiles: the bare times, with the Thai clock suffix set small beside them.
  const checkInTime = pub(site.checkIn);
  const checkOutTime = pub(site.checkOut);
  const clockUnit = lang === "th" ? "น." : undefined;
  const locality = lang === "th" ? `${ui.names.wangKatha} ${ui.names.pakChong}` : `${ui.names.wangKatha}, ${ui.names.pakChong}`;

  return (
    <div className={s.specs}>
      <Spec label={c.spec.labels} note={c.spec.labelsNote}>
        <div className={s.stackTight}>
          <p className="eyebrow">
            <span className={s.item}>{locality}</span>
            {checkIn ? (
              <>
                <Rule />
                <span className={s.item}>
                  {ui.terms.checkIn} {checkIn}
                </span>
              </>
            ) : null}
            {checkOut ? (
              <>
                <Rule />
                <span className={s.item}>
                  {ui.terms.checkOut} {checkOut}
                </span>
              </>
            ) : null}
          </p>
          <Kicker number={3}>{g(G.home.sections.rooftop.label, lang)}</Kicker>
          <p className="h3">{g(G.home.sections.rooftop.heading, lang)}</p>
          <p className="body">{g(G.phrases.rooftopsAllRooms, lang)}</p>
          <p className="small muted">{g(G.phrases.stargazing, lang)}</p>
        </div>
      </Spec>

      <Spec label={c.spec.buttons} note={c.spec.buttonsNote}>
        <div className={s.row}>
          <Button href={href(lang, "stay")} icon="arrow-right">
            {ui.actions.exploreRooms}
          </Button>
          <Button variant="secondary" href={href(lang, "stay", { hash: "compare" })}>
            {ui.actions.compareRooms}
          </Button>
          <Button variant="ghost" href={bookingHref()} external>
            {ui.actions.checkAvailability}
            <VisuallyHidden> ({ui.a11y.opensBookingPage})</VisuallyHidden>
          </Button>
          <Button variant="quiet" href={href(lang, "contact")} icon="arrow-right">
            {ui.actions.askTheResort}
          </Button>
        </div>
      </Spec>

      <Spec label={c.spec.sizes}>
        <div className={s.row}>
          <Button size="lg" href={bookingHref()} external icon="arrow-right">
            {ui.actions.checkRates}
          </Button>
          <Button size="lg" variant="ghost" href={href(lang, "gallery")}>
            {ui.actions.viewAllPhotos}
          </Button>
          <Button disabled>{ui.actions.sendEnquiry}</Button>
          <Button variant="secondary" disabled>
            {ui.actions.copyAddress}
          </Button>
          <Button variant="secondary" aria-busy="true">
            {ui.actions.sendEnquiry}
          </Button>
        </div>
      </Spec>

      <Spec label={c.spec.links} note={c.spec.linksNote}>
        <div className={s.stackTight}>
          <p className="body">
            {g(G.phrases.kitchenGardenSeasonal, lang)} <TextLink href={href(lang, "dining")}>{ui.pageNames.dining}</TextLink>
          </p>
          <div className={s.row}>
            <TextLink variant="arrow" href={href(lang, "experiences")}>
              {ui.pageNames.experiences}
            </TextLink>
            {mapsUrl ? (
              <TextLink variant="arrow" href={mapsUrl} external>
                {ui.actions.openInMaps}
              </TextLink>
            ) : null}
          </div>
        </div>
      </Spec>

      <Spec label={c.spec.chips} note={c.spec.chipsNote}>
        <div className={s.stackTight}>
          <div className={s.chips}>
            <Chip>{room.outdoors[lang]}</Chip>
            <Chip>{room.bathing[lang]}</Chip>
            <Chip>{amenities["coffee-tea"].label[lang]}</Chip>
          </div>
          <FilterDemo
            label={c.demo.filters}
            options={[
              { id: "all", label: ui.gallery.all },
              { id: "rooms", label: ui.gallery.rooms },
              { id: "rooftops", label: ui.gallery.rooftops },
              { id: "gardens", label: ui.gallery.gardens },
            ]}
          />
          <div className={s.chips}>
            <Chip as="a" href={href(lang, "gallery")}>
              {ui.pageNames.gallery}
            </Chip>
            <Chip as="button" disabled>
              {ui.gallery.dining}
            </Chip>
          </div>
        </div>
      </Spec>

      <Spec label={c.spec.tiles}>
        <TileRow label={c.chapter.tilesLabel}>
          <Tile figure="3" label={c.chapter.tileRooms} note={c.chapter.tileRoomsNote} />
          {checkInTime ? <Tile figure={checkInTime} unit={clockUnit} label={ui.terms.checkIn} note={ui.terms.asCurrentlyListed} /> : null}
          {checkOutTime ? <Tile figure={checkOutTime} unit={clockUnit} label={ui.terms.checkOut} note={ui.terms.asCurrentlyListed} /> : null}
        </TileRow>
      </Spec>

      {surface !== "photo" ? (
        <Spec label={c.spec.panels} note={c.spec.panelsNote}>
          <div className={s.panels}>
            {(["white", "sand", "outline"] as const).map((tone) => (
              <Panel key={tone} tone={tone}>
                <div className={s.panelBody}>
                  <Kicker number={tone === "white" ? 1 : tone === "sand" ? 2 : 3}>
                    {tone === "white" ? c.demo.panelWhite : tone === "sand" ? c.demo.panelSand : c.demo.panelOutline}
                  </Kicker>
                  <p className="small muted">{g(G.phrases.roomChosenOnBookingPage, lang)}</p>
                  <Button variant="secondary" href={href(lang, "stay")}>
                    {ui.actions.rooms}
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        </Spec>
      ) : null}

      <Spec label={c.spec.focus} note={c.spec.focusNote}>
        <div className={cx(s.row, s.focusRow)}>
          <Button href={href(lang, "stay")} className={s.focusPill}>
            {ui.actions.exploreRooms}
          </Button>
          <Button variant="ghost" href={href(lang, "stay")} className={s.focusPill}>
            {ui.actions.rooms}
          </Button>
          <Chip as="a" href={href(lang, "gallery")} className={s.focusPill}>
            {ui.gallery.gardens}
          </Chip>
          <TextLink variant="arrow" href={href(lang, "location")} className={s.focusText}>
            {ui.nav.location}
          </TextLink>
        </div>
      </Spec>
    </div>
  );
}
