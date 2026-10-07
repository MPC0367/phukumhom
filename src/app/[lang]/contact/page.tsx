import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryForm, type EnquiryFormLabels } from "@/components/contact/EnquiryForm";
import { ContactPanels } from "@/components/home/arrive";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Onward, PageLead } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingLink, ContactActions } from "@/components/site";
import { activeRooms } from "@/components/stay/room-facts";
import { Chapter, PageHero, Panel } from "@/components/ui";
import { CONTACT_HERO, copy } from "@/content/pages/contact";
import { pub } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { flag, site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { fill, t } from "@/i18n/ui";
import { withBase } from "@/lib/base-path";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import s from "./contact.module.css";

/**
 * The Contact page (brief section 17).
 *
 *   hero         the reception building at dusk
 *   lead         the statement, two paragraphs, Call and Contact on Facebook, and the short answer
 *   01  talk     the address panel and the "talk to the resort" panel (the same pair as the homepage)
 *   02  write    the enquiry form on a white panel, with Check availability beside it for the guests
 *                whose question is really "is there a room"
 *   onward · closing
 *
 * THE FORM does only what is true (see components/contact/EnquiryForm.tsx): while no receiving service
 * is configured it builds a message and copies it; it never shows "sent". The page reads the
 * `enquiryDelivery` flag and words itself to match.
 *
 * FACTS. One phone number, the Facebook page and the map listing, each through pub(). No email address
 * is published, so none is shown. No reply time is promised.
 *
 * The query string (?type=stay&room=…) is read by the form in the browser, never here: the page is static.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "contact") : {};
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("contact", lang);
  const delivery = flag("enquiryDelivery");
  const phone = pub(site.phone);
  const number = formatPhone(phone, lang);
  const facebook = pub(site.social.facebook);

  const glance = [number ? fill(c.glance.phone, { phone: number }) : null, facebook ? c.glance.facebook : null, c.glance.notReservation, c.glance.rates].filter(
    (item): item is string => item !== null,
  );

  const labels: EnquiryFormLabels = {
    heading: c.form.heading,
    about: c.form.about,
    types: { stay: ui.labels.enquiryStay, dining: ui.labels.enquiryDining, group: ui.labels.enquiryGroup, general: ui.labels.enquiryGeneral },
    name: ui.labels.name,
    replyChannel: ui.labels.replyChannel,
    channels: { phone: ui.labels.phone, email: ui.labels.email },
    phoneField: c.form.phoneField,
    emailField: c.form.emailField,
    stayDetails: c.form.stayDetails,
    groupDetails: c.form.groupDetails,
    arrival: ui.terms.arrival,
    departure: ui.terms.departure,
    datesHint: c.form.datesHint,
    room: c.form.room,
    noPreference: c.form.noPreference,
    guests: c.form.guests,
    message: ui.labels.message,
    messageHint: c.form.messageHint,
    optional: ui.labels.optional,
    errors: {
      nameRequired: ui.messages.nameRequired,
      messageRequired: ui.messages.messageRequired,
      contactRequired: ui.messages.contactRequired,
      emailInvalid: ui.messages.emailInvalid,
      phoneInvalid: ui.messages.phoneInvalid,
      departureAfterArrival: ui.messages.departureAfterArrival,
      arrivalNotPast: ui.messages.arrivalNotPast,
      guestsInvalid: c.form.guestsInvalid,
    },
    copy: ui.actions.copyEnquiry,
    send: ui.actions.sendEnquiry,
    sending: c.form.sending,
    tryAgain: ui.actions.tryAgain,
    note: delivery ? c.form.deliveryNote : c.form.draftNote,
    privacyLead: c.form.privacyLead,
    privacyLink: c.form.privacyLink,
    copiedToast: ui.messages.enquiryCopied,
    copiedHeading: c.form.copiedHeading,
    copiedBody: c.form.copiedBody,
    manualHeading: c.form.manualHeading,
    manualBody: c.form.manualBody,
    draftLabel: c.form.draftLabel,
    sent: ui.messages.enquirySent,
    failed: number ? fill(ui.messages.enquiryFailed, { phone: number }) : c.form.failedPlain,
    tooMany: number ? fill(ui.messages.tooManyAttempts, { phone: number }) : c.form.tooManyPlain,
    facebook: ui.actions.contactOnFacebook,
    call: number ? fill(ui.patterns.callOn, { phone: number }) : ui.actions.callResort,
    draft: c.form.draft,
  };

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "contact"),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.contact, route: "contact" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={CONTACT_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.contact }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={[c.body.always, delivery ? c.body.delivery : c.body.draft]}
        glance={glance}
        actions={<ContactActions lang={lang} include={["call", "facebook"]} placement="contact" />}
      />

      <Chapter
        lang={lang}
        id="talk"
        number={1}
        kicker={c.talk.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.talk.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.talk.intro} />
          </Reveal>
        }
      >
        <ContactPanels lang={lang} placement="contact" enquiryHref="#enquiry" />
      </Chapter>

      <Chapter
        lang={lang}
        id="enquiry"
        number={2}
        tone="sand"
        divider={false}
        kicker={c.enquiry.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.enquiry.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={delivery ? c.enquiry.intro.delivery : c.enquiry.intro.draft} />
          </Reveal>
        }
        actions={<BookingLink lang={lang} placement="contact" planner variant="secondary" />}
      >
        {/* Without script the form cannot work: it is hidden, and the direct routes are offered in its place. */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: `[class~="${s.formSlot}"]{display:none}` }} />
          <Panel padding="lg" className={s.panel}>
            <p className="lead">{c.form.noScript}</p>
            <ContactActions lang={lang} include={["call", "facebook"]} placement="contact" className={s.noScriptActions} />
          </Panel>
        </noscript>
        <Reveal variant="fade" className={s.formSlot}>
          <Panel padding="lg" className={s.panel}>
            <EnquiryForm
              lang={lang}
              labels={labels}
              rooms={activeRooms().map((room) => ({ id: room.id, name: room.name }))}
              delivery={delivery}
              endpoint={withBase("/api/enquiry")}
              privacyHref={href(lang, "privacy")}
              facebookUrl={facebook}
              telHref={telHref(phone)}
            />
          </Panel>
        </Reveal>
      </Chapter>

      <Onward lang={lang} page="contact" tone="paper" />
      <HomeClosing lang={lang} />
    </>
  );
}
