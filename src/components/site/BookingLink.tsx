import type { ReactNode } from "react";
import type { Locale, RoomId } from "@/content/schema";
import { Button, type ButtonIcon, type ButtonSize } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { t } from "@/i18n/ui";
import type { AnalyticsPlacement } from "@/lib/analytics";
import { bookingHref } from "@/lib/booking";

/**
 * The booking call to action: every "Check availability" on the site is this component.
 *
 *   <BookingLink lang={lang} placement="header" planner />                       opens the planner drawer
 *   <BookingLink lang={lang} placement="hero" planner variant="ghost" size="lg" />   the same, over a photograph
 *   <BookingLink lang={lang} placement="room-panel" room={room.id} size="lg" fullWidth>
 *     {ui.actions.checkResortAvailability}
 *   </BookingLink>                                                               straight to the booking page
 *   <BookingLink lang={lang} placement="closing" variant="text" />
 *
 * What it always is (BUILD-CONTRACT section 3): a plain <a href> to the verified booking page, in the
 * same tab, so it works with JavaScript off and the back button returns here. No dates, room or language
 * are added: the provider strips a room and a language, and dates belong to <StayPlanner>.
 *
 * `planner` marks the link with `data-open-planner`. With script, <PlannerDrawerHost> (mounted once in
 * the layout) catches a plain click on any such element and opens the stay planner in a drawer instead;
 * a modified click (new tab) and a page without script still follow the link. Any other link or button
 * may carry the same attribute: `<a href={bookingHref()} data-open-planner>`.
 *
 * - Without `planner` the arrow points up and out, the site's sign for a link that leaves it, and a
 *   visually hidden suffix says so in words ("opens the booking partner's page"). With `planner` the
 *   arrow points onward, because the next thing a guest sees is still this site.
 * - `placement` (a value from ANALYTICS_PLACEMENTS) and `room` are written as data attributes. A direct
 *   link is marked as a `booking_click`; a planner link is not, because it does not leave the site (the
 *   planner's own form is what records a search).
 * - variant "primary" | "secondary" | "ghost" | "quiet" wear the <Button> look; "text" is a <TextLink> arrow.
 * - `icon={null}` drops the arrow (the header pill).
 * - The default label is glossary actions.checkAvailability. On a room page pass
 *   actions.checkResortAvailability: never wording that suggests one room's availability is known.
 *
 * A Server Component by nature (it reads the string table). To show it inside a client island, render
 * it on the server and pass it in as a prop or as children.
 */
export interface BookingLinkProps {
  lang: Locale;
  placement: AnalyticsPlacement;
  variant?: "primary" | "secondary" | "ghost" | "quiet" | "text";
  size?: ButtonSize;
  /** Open the planner drawer when script is running (the link still leads to the booking page without it). */
  planner?: boolean;
  /** Overrides the trailing arrow; `null` renders none. */
  icon?: ButtonIcon;
  /** The room page or ledger entry this link sits in. */
  room?: RoomId;
  fullWidth?: boolean;
  className?: string;
  /** The label. Defaults to "Check availability" / "ตรวจสอบห้องว่าง". */
  children?: ReactNode;
}

export function BookingLink({ lang, placement, variant = "primary", size = "md", planner = false, icon, room, fullWidth = false, className, children }: BookingLinkProps) {
  const ui = t(lang);
  const label = (
    <>
      {children ?? ui.actions.checkAvailability}
      {planner ? null : <VisuallyHidden> ({ui.a11y.opensBookingPage})</VisuallyHidden>}
    </>
  );
  const attrs = planner
    ? { "data-open-planner": "", "data-placement": placement, "data-room": room }
    : { "data-analytics": "booking_click", "data-placement": placement, "data-room": room };

  if (variant === "text") {
    return (
      <TextLink href={bookingHref()} external variant="arrow" className={className} {...attrs}>
        {label}
      </TextLink>
    );
  }
  const glyph: ButtonIcon = icon === undefined ? (planner ? "arrow-right" : "arrow-up-right") : icon;
  return (
    <Button href={bookingHref()} external variant={variant} size={size} icon={glyph} fullWidth={fullWidth} className={className} {...attrs}>
      {label}
    </Button>
  );
}
