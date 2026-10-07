import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * A template, unlike a layout, is mounted again for every navigation. That is the whole reason this file
 * exists: each page that arrives by client-side navigation rises and fades in (PageTransition). On a
 * hard load it does nothing, and under reduced motion it does nothing.
 *
 * It adds one plain <div> between <main> and the page. Nothing here reads the request, so pages stay static.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
