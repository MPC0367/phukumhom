import type { ReactNode } from "react";
import type { AssetId, Locale } from "@/content/schema";
import { Band } from "./Band";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { cx } from "./cx";
import { Kicker } from "./Kicker";
import { Picture } from "./Picture";
import styles from "./PageHero.module.css";

/**
 * How an inner page opens: a half-height full-bleed band with the page's lead photograph, the kicker
 * and the <h1> at the bottom left over a scrim, and the breadcrumb trail in a strip beneath.
 *
 *   <PageHero lang={lang} kicker={ui.names.resortFull} title={ui.pageNames.dining}
 *             lead="…" asset="open-dining-pavilion-lawn-dusk"
 *             breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.dining }]} />
 *
 * - The band is about 62svh (never under 22rem) and runs behind the header: its root carries
 *   data-header-over, so the header is transparent until the band has scrolled past.
 * - `title` is the page's one <h1>, in plain words (it carries the keyword). It wears .h1.
 * - `asset` must be a frame catalogued for full-bleed use (uses: "band" or "hero"), so the large files
 *   exist. It is the page's largest first paint: `priority` defaults to true.
 * - The photograph is described by its catalogued alt text. Words over it are checked for 4.5:1 against
 *   the lightest pixels behind them (docs/contrast.md): the hero scrim is always on.
 * - `titleAs="p"` is for the style guide only, where a second <h1> would be wrong.
 */

export interface PageHeroProps {
  lang: Locale;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  asset: AssetId;
  /** The trail, last item = this page. Omit on a first-level page that needs none. */
  breadcrumbs?: Crumb[];
  priority?: boolean;
  /** id for the heading. */
  titleId?: string;
  titleAs?: "h1" | "p";
  className?: string;
}

export function PageHero({ lang, kicker, title, lead, asset, breadcrumbs, priority = true, titleId, titleAs: Title = "h1", className }: PageHeroProps) {
  return (
    <>
      <Band
        as="header"
        overHeader
        height="half"
        scrim="hero"
        className={className}
        media={<Picture asset={asset} lang={lang} fill priority={priority} />}
      >
        <div className={styles.text}>
          <Kicker className={styles.kicker}>{kicker}</Kicker>
          <Title id={titleId} className={cx("h1", styles.title)}>
            {title}
          </Title>
          {lead ? <p className={cx("lead", styles.lead)}>{lead}</p> : null}
        </div>
      </Band>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className={styles.strip}>
          <div className="container">
            <Breadcrumbs lang={lang} trail={breadcrumbs} />
          </div>
        </div>
      ) : null}
    </>
  );
}
