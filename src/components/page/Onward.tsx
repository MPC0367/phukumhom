import Link from "next/link";
import { internalLinks, type SeoKey } from "@/content/seo";
import type { Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Reveal } from "@/components/motion";
import { Icon, Kicker, Section } from "@/components/ui";
import { href, isRouteEnabled } from "@/lib/routes";
import s from "./page.module.css";

/**
 * Where to go next: the page's onward links from the internal link plan (src/content/seo.ts,
 * docs/seo-map.md section 5), as a ruled list set in the display face.
 *
 *   <Onward lang={lang} page="dining" />
 *   <Onward lang={lang} page="room:deluxe-bathtub" />
 *
 * Every destination is built with `href()`, so a page behind a switched-off flag is left out and a
 * link can never be dead. The anchor text is the plan's own, written to name the destination.
 * It is a list of links, not a heading: nothing here carries a heading-level keyword.
 */

const LABEL: Record<Locale, string> = { en: "Keep reading", th: "อ่านต่อ" };

export interface OnwardProps {
  lang: Locale;
  page: SeoKey;
  /** The ground it sits on. Sand by default, so it reads as the page's last quiet band. */
  tone?: "paper" | "sand" | "white";
}

export function Onward({ lang, page, tone = "sand" }: OnwardProps) {
  const links = internalLinks[page].filter((link) => isRouteEnabled(link.to.id, site.flags));
  if (links.length === 0) return null;
  return (
    <Section tone={tone} spacing="tight">
      <nav aria-label={LABEL[lang]} className={`container ${s.onward}`}>
        <Kicker>{LABEL[lang]}</Kicker>
        <Reveal as="ul" stagger={0.06} className={s.onwardList}>
          {links.map((link) => {
            const to = href(lang, link.to.id, { room: link.to.room });
            return (
              <li key={`${link.to.id}-${link.to.room ?? ""}`} className={s.onwardItem}>
                <Link href={to} className={s.onwardLink}>
                  <span>{sentenceCase(link.anchor[lang], lang)}</span>
                  <span className={s.onwardArrow} aria-hidden="true">
                    <Icon name="arrow-right" size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </Reveal>
      </nav>
    </Section>
  );
}

/** The plan's anchors are written for the middle of a sentence; standing alone they take a capital. */
function sentenceCase(text: string, lang: Locale): string {
  return lang === "en" ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
