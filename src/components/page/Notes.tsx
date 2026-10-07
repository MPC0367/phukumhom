import type { ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { Reveal } from "@/components/motion";
import { Icon, Kicker, cx } from "@/components/ui";
import s from "./page.module.css";

/**
 * Plain practical lines, each with a small mark: what a guest should know before booking.
 *
 *   <Notes items={room.goodToKnow[lang]} />
 *   <Notes items={[…]} ruled />          a hairline under each line, for a longer list
 *
 * Each item is one complete, publishable sentence (BUILD-CONTRACT section 2). The lines arrive one
 * after another as the list scrolls in.
 */

export interface NotesProps {
  items: ReactNode[];
  ruled?: boolean;
  className?: string;
}

export function Notes({ items, ruled = false, className }: NotesProps) {
  if (items.length === 0) return null;
  return (
    <Reveal as="ul" stagger={0.07} className={cx(s.notes, ruled && s.ruled, className)}>
      {items.map((item, index) => (
        <li key={index} className={s.note}>
          <span className={s.noteMark} aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Reveal>
  );
}

/**
 * The one thing a guest must not misread, set apart: the pool and spa-tub clarification, the line that a
 * photograph is not a menu. A label in the kicker style and one or two sentences.
 */
export interface CalloutProps {
  lang: Locale;
  label: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ lang, label, children, className }: CalloutProps) {
  return (
    <Reveal variant="fade" className={cx(s.callout, className)}>
      <Kicker className={s.calloutLabel}>{label}</Kicker>
      <p lang={lang} className={s.calloutText}>
        {children}
      </p>
    </Reveal>
  );
}
