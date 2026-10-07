"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ariaCurrent, currentState } from "./nav-state";

/**
 * A navigation link that knows whether it points at the page being shown.
 *
 * A layout never learns the pathname, so the lists in the header, the mobile menu and the footer are
 * rendered on the server with this one small client leaf in each item. It sets `aria-current="page"`
 * on an exact match and `aria-current="true"` on the section a deeper page belongs to (Stay, while a
 * room page is open). The visible mark is drawn by the caller's stylesheet from that attribute:
 *
 *   .link[aria-current] { … }
 *
 * `path` is the page the link stands for; pass `null` for an anchor inside another page.
 */
export interface NavLinkProps {
  href: string;
  path: string | null;
  className?: string;
  lang?: string;
  children: ReactNode;
}

export function NavLink({ href, path, className, lang, children }: NavLinkProps) {
  const pathname = usePathname();
  return (
    <Link href={href} className={className} lang={lang} aria-current={ariaCurrent(currentState(pathname, path))}>
      {children}
    </Link>
  );
}
