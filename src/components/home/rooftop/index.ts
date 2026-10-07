/**
 * Homepage chapter 03, "The rooftop": the band whose colours follow the time of day.
 *
 *   import { HomeRooftop } from "@/components/home/rooftop";
 *   <HomeRooftop lang={lang} />
 *
 * A Server Component. It renders its own <section id="rooftop" data-chapter data-chapter-number="03">,
 * full-bleed, with its own vertical padding: place it directly in the page, between chapters 02 and 04,
 * with nothing wrapped round it. No ancestor may set `overflow: hidden` (the rail is sticky).
 */
export { HomeRooftop } from "./HomeRooftop";
