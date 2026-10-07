"use client";

import { useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { copyText } from "@/components/home/arrive/clipboard";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, TextareaField } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { toast } from "@/components/ui/toast";
import type { Locale } from "@/content/schema";
import { todayInBangkok } from "@/lib/booking";
import {
  ENQUIRY_LIMITS,
  isEnquiryRoom,
  isEnquiryType,
  normaliseEnquiry,
  validateEnquiry,
  type EnquiryErrorCode,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryInput,
  type EnquiryRequest,
  type EnquiryResponse,
  type EnquiryType,
  type ReplyChannel,
} from "@/lib/enquiry";
import { formatDate } from "@/lib/format";
import s from "./EnquiryForm.module.css";

/**
 * The enquiry form (brief section 17).
 *
 * TWO MODES, chosen by the `delivery` prop (the `enquiryDelivery` flag):
 *   false  no receiving service is configured. The form checks what was typed, turns it into a tidy
 *          message and copies that to the clipboard; the guest pastes it into a message to the resort.
 *          It never says "sent". If the browser refuses the clipboard the message is shown, selected,
 *          to be copied by hand.
 *   true   the form posts the enquiry to `endpoint` and shows "sent" only when the server has accepted
 *          it. On failure everything typed stays in place, with a way to retry and the phone number.
 *
 * WHAT IT ASKS: what the enquiry is about; a name; one way to reply (phone or email, never both); for a
 * stay, optional dates, room type and number of guests; for a group, optional dates and a head count;
 * a message. Visible labels, required marks, autofill hints. Phone numbers may carry "+", spaces and
 * brackets. No reset button. No medical details are asked for.
 *
 * FROM A ROOM PAGE the address carries ?type=stay&room=<id>: the form opens on "A stay" with that room
 * chosen. The query is read in the browser only, so the page stays static; what the guest then picks
 * always wins over the query.
 *
 * WITHOUT JAVASCRIPT the form cannot do its work, so it must not pretend to: the button is disabled until
 * script is running, the form's method is POST (a stray submission can never put what was typed into the
 * address bar), and the page hides the form and shows the phone and Facebook routes instead (<noscript>).
 *
 * Every word arrives as a prop from the Server Component. Nothing typed here is stored: not in a
 * cookie, not in local storage.
 */

export interface EnquiryFormLabels {
  heading: string;
  about: string;
  types: Record<EnquiryType, string>;
  name: string;
  replyChannel: string;
  channels: Record<ReplyChannel, string>;
  phoneField: string;
  emailField: string;
  stayDetails: string;
  groupDetails: string;
  arrival: string;
  departure: string;
  datesHint: string;
  room: string;
  noPreference: string;
  guests: string;
  message: string;
  messageHint: string;
  optional: string;
  errors: Record<EnquiryErrorCode, string>;
  copy: string;
  send: string;
  sending: string;
  tryAgain: string;
  note: string;
  privacyLead: string;
  privacyLink: string;
  copiedToast: string;
  copiedHeading: string;
  copiedBody: string;
  manualHeading: string;
  manualBody: string;
  draftLabel: string;
  sent: string;
  failed: string;
  tooMany: string;
  facebook: string;
  call: string;
  draft: {
    title: string;
    about: string;
    name: string;
    reply: string;
    arrival: string;
    departure: string;
    room: string;
    guests: string;
    message: string;
  };
}

export interface EnquiryFormProps {
  lang: Locale;
  labels: EnquiryFormLabels;
  rooms: { id: string; name: string }[];
  delivery: boolean;
  endpoint: string;
  privacyHref: string;
  facebookUrl: string | null;
  telHref: string | null;
  id?: string;
}

type Outcome = { kind: "idle" } | { kind: "copied"; draft: string } | { kind: "manual"; draft: string } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; message: string };

const FIELD_ORDER: EnquiryField[] = ["name", "contact", "checkin", "checkout", "guests", "message"];

function subscribeToAddress(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const searchNow = () => window.location.search;
const searchOnServer = () => "";
const neverChanges = () => () => {};

const put = (pattern: string, values: Record<string, string>) => pattern.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

export function EnquiryForm({ lang, labels, rooms, delivery, endpoint, privacyHref, facebookUrl, telHref, id }: EnquiryFormProps) {
  const uid = useId();
  const fieldId = (field: EnquiryField) => `${uid}-${field}`;
  const statusRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // What the address asks for (a room page's "Ask about this room"); what the guest picks wins over it.
  const search = useSyncExternalStore(subscribeToAddress, searchNow, searchOnServer);
  const query = new URLSearchParams(search);
  const queryType = query.get("type");
  const queryRoom = query.get("room");

  // false on the server and for the hydration pass, true from then on: the button works only once script does.
  const live = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  const [typeChoice, setTypeChoice] = useState<EnquiryType | null>(null);
  const [roomChoice, setRoomChoice] = useState<string | null>(null);
  const [channel, setChannel] = useState<ReplyChannel>("phone");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const type: EnquiryType = typeChoice ?? (isEnquiryType(queryType) ? queryType : "general");
  const room = roomChoice ?? (isEnquiryRoom(queryRoom) ? queryRoom : "");
  const planning = type === "stay" || type === "group";
  const today = todayInBangkok();

  const input: EnquiryInput = { type, name, channel, contact, checkin, checkout, room, guests, message };

  function compose(clean: EnquiryInput): string {
    const d = labels.draft;
    const lines = [d.title, "", put(d.about, { value: labels.types[clean.type] }), put(d.name, { value: clean.name }), put(d.reply, { channel: labels.channels[clean.channel].toLocaleLowerCase(), value: clean.contact })];
    if (clean.checkin) lines.push(put(d.arrival, { value: formatDate(clean.checkin, lang) }));
    if (clean.checkout) lines.push(put(d.departure, { value: formatDate(clean.checkout, lang) }));
    if (clean.room) lines.push(put(d.room, { value: rooms.find((option) => option.id === clean.room)?.name ?? clean.room }));
    if (clean.guests) lines.push(put(d.guests, { value: clean.guests }));
    lines.push("", d.message, clean.message);
    return lines.join("\n");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (outcome.kind === "sending") return;

    const found = validateEnquiry(input, today);
    setErrors(found);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      setOutcome({ kind: "idle" });
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    const clean = normaliseEnquiry(input);

    if (!delivery) {
      const draft = compose(clean);
      if (await copyText(draft)) {
        setOutcome({ kind: "copied", draft });
        toast(labels.copiedToast);
      } else {
        setOutcome({ kind: "manual", draft });
        // The message is shown for copying by hand: select it once it is on the page.
        requestAnimationFrame(() => draftRef.current?.select());
      }
      requestAnimationFrame(() => statusRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
      return;
    }

    setOutcome({ kind: "sending" });
    try {
      const body: EnquiryRequest = { ...clean, lang, company };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json().catch(() => null)) as EnquiryResponse | null;
      if (response.ok && result?.ok) {
        setOutcome({ kind: "sent" });
        return;
      }
      if (result && !result.ok && result.error === "invalid" && result.fields) setErrors(result.fields);
      setOutcome({ kind: "failed", message: response.status === 429 ? labels.tooMany : labels.failed });
    } catch {
      setOutcome({ kind: "failed", message: labels.failed });
    }
  }

  const error = (field: EnquiryField) => (errors[field] ? labels.errors[errors[field]] : undefined);
  const clear = (field: EnquiryField) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const sending = outcome.kind === "sending";

  if (outcome.kind === "sent") {
    return (
      <div id={id} className={s.form}>
        <div ref={statusRef} role="status" className={cx(s.status, s.done)}>
          <p className="lead">{labels.sent}</p>
        </div>
      </div>
    );
  }

  return (
    <form id={id} className={s.form} method="post" onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-heading`}>
      <h3 id={`${uid}-heading`} className={cx("h3", s.heading)}>
        {labels.heading}
      </h3>

      <SelectField label={labels.about} name="type" value={type} onChange={(event) => isEnquiryType(event.target.value) && setTypeChoice(event.target.value)}>
        {(Object.keys(labels.types) as EnquiryType[]).map((option) => (
          <option key={option} value={option}>
            {labels.types[option]}
          </option>
        ))}
      </SelectField>

      <Field
        id={fieldId("name")}
        label={labels.name}
        name="name"
        autoComplete="name"
        required
        maxLength={ENQUIRY_LIMITS.name}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          clear("name");
        }}
        error={error("name")}
      />

      <div className={s.reply}>
        <Segmented
          name="channel"
          legend={labels.replyChannel}
          defaultValue="phone"
          options={[
            { value: "phone", label: labels.channels.phone },
            { value: "email", label: labels.channels.email },
          ]}
          onChange={(event) => {
            // The change bubbles up from the radio that was chosen.
            const chosen: EventTarget = event.target;
            const value = chosen instanceof HTMLInputElement ? chosen.value : "";
            if (value === "phone" || value === "email") {
              setChannel(value);
              setContact("");
              clear("contact");
            }
          }}
        />
        {/* Keyed by the channel: a different kind of field, with its own autofill and keyboard. */}
        <Field
          key={channel}
          id={fieldId("contact")}
          label={channel === "phone" ? labels.phoneField : labels.emailField}
          name={channel === "phone" ? "tel" : "email"}
          type={channel === "phone" ? "tel" : "email"}
          inputMode={channel === "phone" ? "tel" : "email"}
          autoComplete={channel === "phone" ? "tel" : "email"}
          required
          maxLength={ENQUIRY_LIMITS.contact}
          value={contact}
          onChange={(event) => {
            setContact(event.target.value);
            clear("contact");
          }}
          error={error("contact")}
        />
      </div>

      {planning ? (
        <fieldset className={s.group}>
          <legend className={cx("eyebrow", s.legend)}>{type === "stay" ? labels.stayDetails : labels.groupDetails}</legend>
          <div className={s.pair}>
            <Field
              id={fieldId("checkin")}
              label={labels.arrival}
              optionalLabel={labels.optional}
              name="checkin"
              type="date"
              min={today}
              value={checkin}
              onChange={(event) => {
                setCheckin(event.target.value);
                clear("checkin");
              }}
              error={error("checkin")}
            />
            <Field
              id={fieldId("checkout")}
              label={labels.departure}
              optionalLabel={labels.optional}
              name="checkout"
              type="date"
              min={checkin || today}
              value={checkout}
              onChange={(event) => {
                setCheckout(event.target.value);
                clear("checkout");
              }}
              error={error("checkout")}
            />
          </div>
          <p className={cx("small", "muted")}>{labels.datesHint}</p>
          <div className={s.pair}>
            {type === "stay" ? (
              <SelectField label={labels.room} optionalLabel={labels.optional} name="room" value={room} onChange={(event) => setRoomChoice(event.target.value)}>
                <option value="">{labels.noPreference}</option>
                {rooms.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </SelectField>
            ) : null}
            <Field
              id={fieldId("guests")}
              label={labels.guests}
              optionalLabel={labels.optional}
              name="guests"
              inputMode="numeric"
              maxLength={ENQUIRY_LIMITS.guests}
              value={guests}
              onChange={(event) => {
                setGuests(event.target.value);
                clear("guests");
              }}
              error={error("guests")}
            />
          </div>
        </fieldset>
      ) : null}

      <TextareaField
        id={fieldId("message")}
        label={labels.message}
        name="message"
        required
        rows={6}
        maxLength={ENQUIRY_LIMITS.message}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          clear("message");
        }}
        hint={labels.messageHint}
        error={error("message")}
      />

      {/* A field no person sees or fills in; a script that fills every field gives itself away. */}
      <div className={s.trap} aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
        </label>
      </div>

      <div className={s.foot}>
        <Button type="submit" size="lg" icon={delivery ? "arrow-right" : "copy"} disabled={!live} aria-busy={sending ? "true" : undefined}>
          {delivery ? (sending ? labels.sending : labels.send) : labels.copy}
        </Button>
        <div className={s.notes}>
          <p className="small">{labels.note}</p>
          <p className={cx("small", "muted")}>
            {labels.privacyLead}{" "}
            <TextLink href={privacyHref}>{labels.privacyLink}</TextLink>
          </p>
        </div>
      </div>

      <div ref={statusRef} role="status" aria-live="polite" className={s.statusSlot}>
        {outcome.kind === "copied" || outcome.kind === "manual" ? (
          <div className={cx(s.status, outcome.kind === "copied" && s.done)}>
            <p className={cx("h3", s.statusHeading)}>{outcome.kind === "copied" ? labels.copiedHeading : labels.manualHeading}</p>
            <p>{outcome.kind === "copied" ? labels.copiedBody : labels.manualBody}</p>
            <textarea ref={draftRef} className={s.draft} readOnly rows={8} value={outcome.draft} aria-label={labels.draftLabel} />
            <div className={s.next}>
              {facebookUrl ? (
                <Button href={facebookUrl} external variant="secondary" icon="arrow-up-right" target="_blank" data-analytics="social_contact_click" data-network="facebook" data-placement="contact">
                  {labels.facebook}
                </Button>
              ) : null}
              {telHref ? (
                <Button href={telHref} external variant="quiet" data-analytics="call_click" data-placement="contact">
                  {labels.call}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {outcome.kind === "failed" ? (
          <div className={cx(s.status, s.problem)}>
            <p>{outcome.message}</p>
            <div className={s.next}>
              <Button type="submit" variant="secondary">
                {labels.tryAgain}
              </Button>
              {telHref ? (
                <Button href={telHref} external variant="quiet" data-analytics="call_click" data-placement="contact">
                  {labels.call}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
