import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Section.module.css";

/**
 * A plain page section: the ground it sits on and its vertical rhythm. For a section with the sticky
 * rail use <Chapter>; for a photograph edge to edge use <Band>. Section is what is left: a form page, a
 * policy, a closing block.
 *
 * It adds no container. Put a `.container` (or <Container>) inside, so a toned band can run edge to edge
 * while its content keeps the page measure.
 *
 *   tone     paper (default) · sand · white · twilight · forest
 *   spacing  normal = --section-y · tight = --section-y-tight · none
 *
 * Neighbours on the same light ground do not add their paddings: when one paper (or sand, or white)
 * section directly follows another, the gap between them is one rhythm, the larger of the two, not two.
 * Where the ground changes each band keeps its own padding (Section.module.css). So pages do not tune
 * `spacing` to avoid a double gap. This works on direct siblings: keep sections next to each other in
 * the markup, not each inside its own wrapper.
 *
 * Name the section for assistive technology with `labelledBy` (the id of its heading).
 */

export interface SectionProps {
  id?: string;
  tone?: "paper" | "sand" | "white" | "twilight" | "forest";
  spacing?: "normal" | "tight" | "none";
  /** id of the heading that names this section. */
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

// The global helper paints the ground or sets the rhythm; the local class beside it only names it, so the
// stylesheet can see when two neighbours share a ground and which rhythm each one has.
const TONE = {
  paper: styles.paper,
  sand: cx("on-sand", styles.sand),
  white: cx("on-white", styles.white),
  twilight: "on-twilight",
  forest: "on-forest",
} as const;
const SPACING = { normal: cx("section", styles.normal), tight: cx("section-tight", styles.tight), none: undefined } as const;

export function Section({ id, tone = "paper", spacing = "normal", labelledBy, className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx(TONE[tone], SPACING[spacing], className)}>
      {children}
    </section>
  );
}
