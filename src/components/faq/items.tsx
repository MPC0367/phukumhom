import type { AccordionItem } from "@/components/ui/Accordion";
import { TextLink } from "@/components/ui/TextLink";
import { faq } from "@/content/faq";
import type { FaqItem, Locale } from "@/content/schema";
import { href, type RouteId } from "@/lib/routes";

/**
 * Turns FAQ entries (src/content/faq.ts) into accordion items: the answer's paragraphs as written, then
 * the entry's onward link when it has one. A Server Component helper, shared by the FAQ page and by any
 * page that answers a few of the same questions in place (Location), so an answer is never worded twice.
 *
 *   <Accordion items={faqAccordionItems(pickFaq(["parking", "check-in-out"]), lang)} />
 *
 * The onward link is built with `href()`, so it resolves in every environment.
 */

export function faqLinkHref(item: FaqItem, lang: Locale): string | null {
  if (!item.link) return null;
  const { id, room, hash, query } = item.link.route;
  return href(lang, id as RouteId, { room, hash, query });
}

export function faqAccordionItems(items: FaqItem[], lang: Locale, prefix = ""): AccordionItem[] {
  return items.map((item) => {
    const to = faqLinkHref(item, lang);
    return {
      id: `${prefix}${item.id}`,
      question: item.question[lang],
      answer: (
        <>
          {item.answer[lang].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {to && item.link ? (
            <p>
              <TextLink variant="arrow" href={to}>
                {item.link.label[lang]}
              </TextLink>
            </p>
          ) : null}
        </>
      ),
    };
  });
}

/** The entries with these ids, in the order given. An id that is not in the content file is skipped. */
export function pickFaq(ids: string[]): FaqItem[] {
  return ids.map((id) => faq.find((item) => item.id === id)).filter((item): item is FaqItem => item !== undefined);
}
