import type { LegalBlock, LegalCondition, LegalCopy } from "@/content/pages/legal";
import { pub, type Locale } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { PREVIEW_OPERATOR } from "@/content/site-public";
import { Reveal } from "@/components/motion";
import { AddressText } from "@/components/site/AddressText";
import { AtAGlance, Breadcrumbs, Kicker, LastUpdated, Section, TextLink, cx } from "@/components/ui";
import { keepThai } from "@/components/ui/keep-thai";
import { t } from "@/i18n/ui";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import s from "./LegalPage.module.css";

/**
 * A policy page: Privacy, Terms. Words, not photographs.
 *
 *   header   the breadcrumb trail, a kicker, the page topic as the <h1>, one introductory sentence and
 *            the date the content was last updated
 *   body     "At a glance" and the list of sections in a rail that stays beside the text from 64rem;
 *            the sections as running prose; the resort's contact details last
 *
 * `conditions` says how the site stands right now: preview or official, measurement on or off, enquiry
 * delivery on or off, which host. A paragraph is printed only when every condition it names holds, so the
 * page never describes a feature that is switched off or an operator that is not the operator
 * (src/content/pages/legal.ts). In a preview the contact section names the studio, not the resort, as the
 * one to ask about the preview itself.
 *
 * The page has no hero behind the header, so the header is solid and <main> starts below it.
 */

export interface LegalPageProps {
  lang: Locale;
  route: "privacy" | "terms";
  copy: LegalCopy;
  conditions: LegalCondition[];
}

export function LegalPage({ lang, route, copy: c, conditions }: LegalPageProps) {
  const ui = t(lang);
  const seo = getSeo(route, lang);
  const applies = (block: { when?: LegalCondition[] }) => !block.when || block.when.every((condition) => conditions.includes(condition));
  const preview = conditions.includes("preview");

  const sections = c.sections.map((section) => ({ ...section, blocks: section.blocks.filter(applies) })).filter((section) => section.blocks.length > 0);
  const glance = c.glance.filter(applies).map((item) => item.text);

  const phone = pub(site.phone);
  const number = formatPhone(phone, lang);
  const tel = telHref(phone);
  const hasAddress = pub(site.address) !== null;

  return (
    <>
      <Section spacing="tight" className={s.head}>
        <div className={cx("container", s.headInner)}>
          <Breadcrumbs lang={lang} trail={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames[route] }]} />
          <Reveal trigger="load" className={s.title}>
            <Kicker>{c.kicker}</Kicker>
            <h1 className={cx("h1", s.h1)}>{lang === "th" ? keepThai(seo.h1) : seo.h1}</h1>
            <p className={cx("lead", s.intro)}>{preview ? c.intro.preview : c.intro.official}</p>
            <LastUpdated lang={lang} date={site.lastUpdated} />
          </Reveal>
        </div>
      </Section>

      <Section tone="white">
        <div className={cx("container", s.body)}>
          <aside className={s.rail}>
            <AtAGlance title={ui.terms.atAGlance} items={glance} />
            <nav aria-label={c.contents} className={s.contents}>
              <p className={cx("eyebrow", s.contentsTitle)}>{c.contents}</p>
              <ol role="list" className={s.contentsList}>
                {[...sections, { id: c.contact.id, heading: c.contact.heading }].map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={s.contentsLink}>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className={s.article}>
            {sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={s.section}>
                <h2 id={`${section.id}-title`} className={cx("h3", s.heading)}>
                  {section.heading}
                </h2>
                <div className="prose">
                  {section.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <section id={c.contact.id} aria-labelledby={`${c.contact.id}-title`} className={s.section}>
              <h2 id={`${c.contact.id}-title`} className={cx("h3", s.heading)}>
                {c.contact.heading}
              </h2>
              {preview ? (
                <div className="prose">
                  <p>{c.contact.preview.text}</p>
                  <p>
                    <TextLink variant="arrow" href={PREVIEW_OPERATOR.url} external target="_blank">
                      {c.contact.preview.studioLink}
                    </TextLink>
                  </p>
                  <p>{c.contact.preview.resort}</p>
                  <p>
                    <TextLink variant="arrow" href={href(lang, "contact")}>
                      {c.contact.preview.resortLink}
                    </TextLink>
                  </p>
                </div>
              ) : (
                <div className="prose">
                  <p>{c.contact.official.text}</p>
                  {hasAddress ? (
                    <address className={s.address}>
                      {c.contact.official.address.split("{address}")[0]}
                      <AddressText lang={lang} />
                    </address>
                  ) : null}
                  {number && tel ? (
                    <p>
                      {c.contact.official.phone.split("{phone}")[0]}
                      <a href={tel} className="tabular">
                        {number}
                      </a>
                    </p>
                  ) : null}
                  <p>
                    <TextLink variant="arrow" href={href(lang, "contact")}>
                      {c.contact.official.link}
                    </TextLink>
                  </p>
                </div>
              )}
            </section>
          </article>
        </div>
      </Section>
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  return (
    <>
      {block.text ? <p>{block.text}</p> : null}
      {block.list ? (
        <ul>
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
