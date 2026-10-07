"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import s from "./FaqBrowser.module.css";

/**
 * The questions, in their groups, with a search field that filters them as you type.
 *
 *   <FaqBrowser groups={…} labels={…} />
 *
 * Everything arrives as plain data from the Server Component (the answers are strings, the onward
 * links are resolved hrefs), so the content files never reach the browser bundle.
 *
 * WITHOUT JAVASCRIPT the whole list is there, grouped, on native <details>: nothing is hidden and the
 * search field is not shown, because a filter that cannot filter is worse than none.
 * WITH IT: the field filters on the question and the answer, the groups with no match step aside, the
 * number of questions showing is announced politely, and a link to /faq#pets opens that answer.
 */

export interface FaqEntry {
  id: string;
  question: string;
  answer: string[];
  link?: { href: string; label: string };
}

export interface FaqGroup {
  id: string;
  label: string;
  items: FaqEntry[];
}

export interface FaqBrowserProps {
  groups: FaqGroup[];
  labels: { search: string; countOne: string; countMany: string; none: string; clear: string; jump: string };
}

const neverChanges = () => () => {};

/** Case and spacing are ignored; Thai has no case, so the same test serves both languages. */
const fold = (text: string) => text.toLocaleLowerCase().replace(/\s+/g, " ").trim();

export function FaqBrowser({ groups, labels }: FaqBrowserProps) {
  const fieldId = useId();
  const [query, setQuery] = useState("");
  // false on the server and for the hydration pass, true from then on: the field appears once it can work.
  const live = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  // A link to /faq#pets lands on a closed <details>: open it, as a guest would expect.
  useEffect(() => {
    const openTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, []);

  const needle = fold(query);
  const shown = groups
    .map((group) => ({
      ...group,
      items: needle ? group.items.filter((item) => fold(`${item.question} ${item.answer.join(" ")}`).includes(needle)) : group.items,
    }))
    .filter((group) => group.items.length > 0);
  const total = shown.reduce((sum, group) => sum + group.items.length, 0);
  const count = (total === 1 ? labels.countOne : labels.countMany).replace("{count}", String(total));

  return (
    <div className={s.browser}>
      <div className={s.rail}>
        {live ? (
          <div className={s.search}>
            <label htmlFor={fieldId} className={cx("eyebrow", s.searchLabel)}>
              {labels.search}
            </label>
            <div className={s.field}>
              <Icon name="search" size={18} className={s.searchIcon} />
              <input
                id={fieldId}
                type="search"
                className={s.input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
              {query ? (
                <button type="button" className={s.clear} onClick={() => setQuery("")} aria-label={labels.clear}>
                  <Icon name="x" size={16} />
                </button>
              ) : null}
            </div>
            <p className={cx("small", "muted", "tabular", s.count)} role="status" aria-live="polite">
              {count}
            </p>
          </div>
        ) : null}

        <nav aria-label={labels.jump} className={s.jump}>
          <ul role="list" className={s.jumpList}>
            {shown.map((group) => (
              <li key={group.id}>
                <a href={`#${group.id}`} className={s.jumpLink}>
                  <span>{group.label}</span>
                  <span className={cx("tabular", s.jumpCount)}>{group.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={s.groups}>
        {shown.length === 0 ? <p className={cx("lead", s.none)}>{labels.none}</p> : null}
        {shown.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className={s.group}>
            <h2 id={`${group.id}-title`} className={cx("h3", s.groupTitle)}>
              {group.label}
            </h2>
            <Accordion
              items={group.items.map((item) => ({
                id: item.id,
                question: item.question,
                answer: (
                  <>
                    {item.answer.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {item.link ? (
                      <p>
                        <TextLink variant="arrow" href={item.link.href}>
                          {item.link.label}
                        </TextLink>
                      </p>
                    ) : null}
                  </>
                ),
              }))}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
