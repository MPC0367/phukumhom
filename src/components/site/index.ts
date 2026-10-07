/**
 * The site shell and the shared, site-wide blocks, direction 2. Built on the primitives in
 * components/ui and the motion system in components/motion.
 *
 * Server Components: import from here.
 *   import { BookingLink, ContactActions, StayPlanner } from "@/components/site";
 *
 * Mounted once by src/app/[lang]/layout.tsx:
 *   SkipLink · Header · Footer · StickyActions · PlannerDrawer · ChapterIndex · BackToTop
 * For pages:
 *   BookingLink · StayPlanner · ContactActions · AddressText · RoomName · NavLink
 * Navigation data (server only):
 *   primaryNav · exploreNav · roomNav · footerNav
 * Metadata for a page that calls notFound():
 *   notFoundPageMetadata
 *
 * THE PLANNER DRAWER. Any link or button may open it: give it `data-open-planner` and, if it is a link,
 * the booking page as its href so it still works without script:
 *   <BookingLink lang={lang} placement="hero" planner variant="ghost" size="lg" />
 *   <a href={bookingHref()} data-open-planner>…</a>
 *
 * THE HEADER OVER A PHOTOGRAPH. A page that opens with a full-bleed photograph puts `data-header-over`
 * on that element (ui/Band `overHeader`, ui/PageHero): the header is transparent while it is behind the
 * bar, and <main> then starts at the very top of the window instead of below the header. Use the
 * attribute on the element at the top of a page and nowhere else.
 *
 * THE CHAPTER INDEX reads every `[data-chapter]` section inside <main> (ui/Chapter writes it).
 *
 * Client islands ("use client" files) should not import this barrel: BookingLink, ContactActions,
 * StayPlanner, Header and Footer read the string tables and the site settings. Render them in a
 * Server Component and pass the result into the island as a prop or as children. Islands that need
 * the shell's signals import the one file: "@/components/site/shell-signals".
 */

export { AddressText } from "./AddressText";
export { BackToTop } from "./BackToTop";
export { BookingLink, type BookingLinkProps } from "./BookingLink";
export { ChapterIndex } from "./ChapterIndex";
export { ContactActions, type ContactAction, type ContactActionsProps } from "./ContactActions";
export { Footer } from "./Footer";
export { Header } from "./Header";
export { LangSwitch, type LangSwitchProps } from "./LangSwitch";
export { NavLink, type NavLinkProps } from "./NavLink";
export { PlannerDrawer } from "./PlannerDrawer";
export { RoomName } from "./RoomName";
export { SkipLink } from "./SkipLink";
export { StayPlanner, type StayPlannerProps } from "./StayPlanner";
export { StickyActions } from "./StickyActions";
export { Wordmark, type WordmarkProps } from "./Wordmark";
export { FOOTER_ID, HEADER_ID, MAIN_ID, OPEN_PLANNER_ATTR, PLANNER_TITLE_ID, TOP_ID } from "./ids";
export { notFoundPageMetadata } from "./not-found-metadata";
export { exploreNav, footerNav, primaryNav, roomNav, type NavItem, type RoomNavItem } from "./nav";
export { ariaCurrent, currentState, type CurrentState } from "./nav-state";
