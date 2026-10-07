/**
 * Element ids the shell's parts use to find one another. A plain module, so server components and
 * client islands can both import it.
 */

/** A zero-size mark at the very top of the document: the target of every "Back to top" link (href="#top"). */
export const TOP_ID = "top";

/** The <main> landmark: the skip link's target. */
export const MAIN_ID = "main";

/** The site footer: its arrival on screen hides the phone action bar, the chapter index and the back-to-top button. */
export const FOOTER_ID = "site-footer";

/** The site header. */
export const HEADER_ID = "site-header";

/** The heading inside the planner drawer, which names the drawer. */
export const PLANNER_TITLE_ID = "planner-title";

/**
 * The attribute that makes any link or button open the planner drawer:
 * `<a href={bookingHref()} data-open-planner>`. Read by <PlannerDrawerHost>.
 */
export const OPEN_PLANNER_ATTR = "data-open-planner";
