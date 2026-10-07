import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * The page measure: 82rem plus gutters (`wide`: 96rem). A thin wrapper over the global `.container`
 * helpers for authors who prefer a component; `<div className="container">` is the same thing.
 */
export interface ContainerProps {
  as?: "div" | "header" | "footer" | "nav" | "article";
  wide?: boolean;
  /** Adds the 4 → 8 → 12 column grid to the same element. */
  grid?: boolean;
  className?: string;
  children: ReactNode;
}

export function Container({ as: Tag = "div", wide = false, grid = false, className, children }: ContainerProps) {
  return <Tag className={cx(wide ? "container-wide" : "container", grid && "grid", className)}>{children}</Tag>;
}
