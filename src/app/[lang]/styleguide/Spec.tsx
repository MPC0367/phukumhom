import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import s from "./styleguide.module.css";

/**
 * One labelled specimen: the name of the primitive (and a line on what to look for) in the margin
 * column, the specimen itself beside it. `wide` gives the specimen the whole measure.
 */
export function Spec({ label, note, wide = false, children }: { label: string; note?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cx(s.spec, wide && s.specWide)}>
      <div className={s.specLabel}>
        <p className={s.specName}>{label}</p>
        {note ? <p className={s.specNote}>{note}</p> : null}
      </div>
      <div className={s.specBody}>{children}</div>
    </div>
  );
}
