import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

/**
 * The one action control. Always a pill.
 *
 *   <Button href={href(lang, "stay")}>Explore rooms</Button>                              internal → next/link
 *   <Button href={bookingHref()} external icon="arrow-right">Check availability</Button>  external → <a>, same tab
 *   <Button type="submit" variant="secondary" aria-busy={sending}>Send enquiry</Button>   no href → <button>
 *
 *   primary    terracotta fill, paper label. The one action a screen is asking for. The fill deepens on hover.
 *   secondary  1px outline in the accent colour (forest on light grounds); the accent rises through it on hover.
 *   ghost      1px outline in the text colour. Made for .on-photo, .on-twilight and .on-forest, where it is a
 *              paper line that fills with paper and turns its label ink. On a light ground it is the ink twin.
 *   quiet      label and a drawn underline, no box: it aligns with the text edge around it.
 *
 *   size       md = 48px tall (default) · lg = 56px
 *   icon       a trailing arrow that slides 4px on hover; `null` (the default) renders none
 *
 * Any other attribute (data-*, aria-*, target, event handlers from a client parent) is passed through.
 * An external link opens in the same tab unless `target="_blank"` is passed; `rel="noopener"` is then added.
 * Disable a link with `aria-disabled="true"` (and leave its href off the tab order yourself); a <button>
 * takes `disabled`. `aria-busy="true"` shows the working state and ignores further presses.
 *
 * Every variant reads the surface tokens, so the same markup is correct on paper, sand, white, twilight,
 * forest and over a photograph. A light panel inside a dark band (Panel, Drawer, Dialog) carries
 * data-ground="light", which puts its buttons back on light rules.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";
export type ButtonSize = "md" | "lg";
export type ButtonIcon = "arrow-right" | "arrow-up-right" | "arrow-left" | "plus" | "check" | "copy" | "share" | "play" | null;

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A trailing icon. `null` (the default) renders none. */
  icon?: ButtonIcon;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type AsLink = CommonProps & {
  href: string;
  /** Renders a plain <a> instead of next/link: other origins, `tel:`, files. */
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children" | "type">;

type AsButton = CommonProps & {
  href?: undefined;
  external?: undefined;
  type?: "button" | "submit" | "reset";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className" | "children">;

export type ButtonProps = AsLink | AsButton;

/** How each icon answers a hover: arrows travel their own way, the rest stay put. */
const ICON_MOTION: Partial<Record<NonNullable<ButtonIcon>, string>> = {
  "arrow-right": styles.iconForward,
  "arrow-up-right": styles.iconDiagonal,
  "arrow-left": styles.iconBack,
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon = null, fullWidth = false, className, children, ...rest } = props;
  const classes = cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, className);
  const glyph = icon ? <Icon name={icon} size={size === "lg" ? 20 : 18} className={cx(styles.icon, ICON_MOTION[icon])} /> : null;
  const content =
    icon === "arrow-left" ? (
      <>
        {glyph}
        <span className={styles.label}>{children}</span>
      </>
    ) : (
      <>
        <span className={styles.label}>{children}</span>
        {glyph}
      </>
    );

  if (typeof rest.href === "string") {
    const { href, external, ...anchor } = rest;
    if (external) {
      const rel = anchor.target === "_blank" ? (anchor.rel ?? "noopener") : anchor.rel;
      return (
        <a {...anchor} href={href} rel={rel} className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link {...anchor} href={href} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...button } = rest;
  return (
    <button {...button} type={type} className={classes}>
      {content}
    </button>
  );
}
