import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cx } from "./cx";
import styles from "./Chip.module.css";

/**
 * A pill with a 1px outline: a fact on a card, a filter, a jump link.
 *
 *   <Chip>Balcony and private rooftop</Chip>                          a fact: a <span>, 32px, not interactive
 *   <Chip as="button" selected={filter === "nature"} onClick={…}>Nature</Chip>   a filter (client parent)
 *   <Chip as="a" href={href(lang, "gallery")}>Gallery</Chip>          a link (internal → next/link)
 *
 * Interactive chips are 44px tall. `selected` fills the pill; on a <button> it is also written as
 * aria-pressed, on a link as aria-current="true". Pass your own aria-* to override (a role="tab" set).
 * A row of fact chips replaces "Outdoors, Bathing, In the room" written with dots between them: the
 * chips are separate elements and nothing is typed between them.
 *
 * A function (onClick) can only come from a client parent; a Server Component passes data and links.
 */

interface CommonProps {
  selected?: boolean;
  className?: string;
  children: ReactNode;
}

type AsSpan = CommonProps & { as?: "span"; href?: undefined } & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">;
type AsButton = CommonProps & { as: "button"; href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;
type AsAnchor = CommonProps & { as: "a"; href: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

export type ChipProps = AsSpan | AsButton | AsAnchor;

/** A shallow copy of `props` without the listed keys: what is left is spread onto the element. */
function without<T extends object, K extends keyof T>(props: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...props };
  for (const key of keys) delete copy[key];
  return copy;
}

export function Chip(props: ChipProps) {
  const { selected = false, className, children } = props;
  const label = <span className={styles.label}>{children}</span>;

  if (props.as === "button") {
    const rest = without(props, "as", "selected", "className", "children");
    return (
      <button aria-pressed={selected} type="button" {...rest} className={cx(styles.chip, styles.interactive, selected && styles.selected, className)}>
        {label}
      </button>
    );
  }

  if (props.as === "a") {
    const rest = without(props, "as", "selected", "className", "children", "href", "external");
    const classes = cx(styles.chip, styles.interactive, selected && styles.selected, className);
    const current = selected ? ("true" as const) : undefined;
    if (props.external || !props.href.startsWith("/")) {
      const rel = rest.target === "_blank" ? (rest.rel ?? "noopener") : rest.rel;
      return (
        <a aria-current={current} {...rest} href={props.href} rel={rel} className={classes}>
          {label}
        </a>
      );
    }
    return (
      <Link aria-current={current} {...rest} href={props.href} className={classes}>
        {label}
      </Link>
    );
  }

  const rest = without(props, "as", "selected", "className", "children", "href");
  return (
    <span {...rest} className={cx(styles.chip, selected && styles.selected, className)}>
      {label}
    </span>
  );
}
