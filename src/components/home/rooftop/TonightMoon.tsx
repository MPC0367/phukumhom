"use client";

import { MoonIcon, useResortNow } from "@/components/motion";
import { moonPhase, tonight } from "@/lib/sky";

/**
 * The moon in the band's sky, drawn in tonight's real phase (the same reading the "Moon tonight" tile
 * names). Decoration only: it is hidden from assistive technology, the stylesheet fades it in with the
 * stars, and nothing is drawn until the phase is known. Where it hangs in the band says nothing about
 * where the moon is in the sky.
 */
export function TonightMoon({ className }: { className?: string }) {
  const now = useResortNow();
  const phase = now ? moonPhase(tonight(now)) : null;
  return (
    <span className={className} aria-hidden="true">
      {phase ? <MoonIcon phase={phase} /> : null}
    </span>
  );
}
