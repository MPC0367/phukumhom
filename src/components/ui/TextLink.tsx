import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./TextLink.module.css";

/**
 * A link that is read as text.
 *
 *   inline  sits inside a sentence. A hairline marks it at rest (never colour alone); on hover and on
 *           keyboard focus a full-strength line draws over it from the left.
 *   arrow   stands on its own line as an onward link ("Dining"), 44px tall, with a trailing arrow that
 *           slides as the line draws. An external arrow link points up and out.
 *
 * Internal hrefs (built with `href()` from lib/routes) render next/link; `external` renders a plain <a>
 * in the same tab. Pass `target="_blank"` to open a new tab and `rel="noopener"` is added for you.
 * The label must name the destination: "Dining", "Open in Google Maps", never "Read more".
 */

export interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  href: string;
  external?: boolean;
  variant?: "inline" | "arrow";
  children: ReactNode;
}

export function TextLink({ href, external = false, variant = "inline", className, children, ...rest }: TextLinkProps) {
  const classes = cx(styles.link, styles[variant], className);
  const content =
    variant === "arrow" ? (
      <>
        <span className={styles.label}>{children}</span>
        <Icon name={external ? "arrow-up-right" : "arrow-right"} size={18} className={cx(styles.icon, external && styles.iconDiagonal)} />
      </>
    ) : (
      children
    );

  if (external) {
    const rel = rest.target === "_blank" ? (rest.rel ?? "noopener") : rest.rel;
    return (
      <a {...rest} href={href} rel={rel} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link {...rest} href={href} className={classes}>
      {content}
    </Link>
  );
}
