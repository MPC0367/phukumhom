import type { ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { AtAGlance, LastUpdated, Section, cx } from "@/components/ui";
import { t } from "@/i18n/ui";
import { withAccent } from "./text";
import s from "./page.module.css";

/**
 * How an inner page begins under its hero: the sentence the page opens with, a paragraph or two, the
 * page's first action, and beside them the short answer ("At a glance") with the date the content was
 * last checked (BUILD-CONTRACT section 5, "Content pages").
 *
 *   <PageLead lang={lang} statement={c.statement} accent={c.accent} body={c.body}
 *             glance={c.glance} actions={<BookingLink … />} />
 *
 *   statement  one sentence, set in the statement face; lines rise as it arrives
 *   accent     the one word of it set in italics (English only; empty in Thai)
 *   body       paragraphs of running text
 *   glance     three to five complete, publishable sentences. A bullet may be a node (an inline link).
 *
 * From 64rem the short answer stays beside the text while it is read, then scrolls away with it.
 */

export interface PageLeadProps {
  lang: Locale;
  statement: string;
  accent?: string;
  body?: string[];
  glance: ReactNode[];
  actions?: ReactNode;
  id?: string;
}

export function PageLead({ lang, statement, accent = "", body = [], glance, actions, id }: PageLeadProps) {
  const ui = t(lang);
  return (
    <Section id={id} spacing="tight">
      <div className={cx("container", s.leadGrid)}>
        <div className={s.leadMain}>
          <SplitReveal as="p" lang={lang} trigger="load" className={cx("statement", s.leadStatement)}>
            {lang === "th" ? <Phrases lang={lang} text={statement} /> : withAccent(statement, accent)}
          </SplitReveal>
          {body.length > 0 ? (
            <Reveal variant="fade" delay={0.2} trigger="load" className={cx("prose", s.leadBody)}>
              {body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Reveal>
          ) : null}
          {actions ? <div className={s.leadActions}>{actions}</div> : null}
        </div>
        <Reveal delay={0.25} trigger="load" className={s.leadAside}>
          <AtAGlance title={ui.terms.atAGlance} items={glance} />
          <LastUpdated lang={lang} date={site.lastUpdated} />
        </Reveal>
      </div>
    </Section>
  );
}
