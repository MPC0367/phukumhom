/**
 * The homepage hero (ART-DIRECTION section 5).
 *
 *   import { HomeHero } from "@/components/home/hero";
 *   <HomeHero lang={lang} />        the first thing inside <main>
 *
 * It renders the photograph section AND, from 64rem, the planner dock that follows it in normal flow.
 * Nothing after it needs to reserve room for the dock: the next section simply begins below it.
 *
 * HERO_ID is the section's id and HERO_TITLE_ID the id of its <h1>. HERO_FRAMES are the four catalogue
 * ids, in order, for a page that must not show a near-identical frame again (BUILD-CONTRACT section 8).
 */
export { HomeHero } from "./HomeHero";
export { HERO_FRAMES, HERO_ID, HERO_TITLE_ID } from "./frames";
