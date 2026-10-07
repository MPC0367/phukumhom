import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * The page transition for navigation inside the lab. The language tree's own template only remounts
 * when the visitor leaves this folder; this one remounts for every page within it, so going from the
 * lab to ./second and back shows the transition under a provider that stays put.
 */
export default function MotionLabTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
