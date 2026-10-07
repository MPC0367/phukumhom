"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Locale } from "@/content/schema";
import { Chip } from "@/components/ui/Chip";
import { addDays, isIsoDate, stayError, todayInBangkok } from "@/lib/booking";
import { formatDate } from "@/lib/format";

/**
 * What script adds to <StayPlanner>. It renders the message line (and, in the drawer, the stay-length
 * chips and the summary line) and finds the form it sits in; the fields themselves stay server-rendered
 * HTML.
 *
 * THE RULE THAT KEEPS TYPING SAFE. Chromium rebuilds a date field's segmented editor whenever its
 * `value`, `min` or `max` is assigned, even to what it already holds, and whatever was being typed is
 * lost. The first build wrote `min` on every keystroke and a guest could not type a year. So:
 *   - nothing is ever written to a field that has focus. A limit that is due while a field is being
 *     edited is written when it loses focus;
 *   - an `input` event only takes an old message away (aria attributes, never value / min / max);
 *   - while a year is typed the field passes through 0002, 0020 and 0202, which are dates but not ones
 *     to plan a stay from: nothing is concluded from a date before today.
 *
 * WHEN IT ACTS
 *   on mount            takes over validation from the browser (`noValidate`, and the two `required`
 *                       attributes that protect the no-JavaScript form are lifted), and sets the
 *                       earliest arrival to today at the resort
 *   arrival changes     once it is a complete date from today onwards: if departure is empty or no
 *                       longer after it, departure (which does not have focus) moves to arrival + 1
 *   a field loses focus limits are brought up to date, and a complete but impossible date is marked
 *                       with its message, without moving focus
 *   on submit           a search without dates goes through (the empty date fields are left out of the
 *                       URL); a partly typed date or an impossible range is stopped, the field is marked
 *                       `aria-invalid`, described by the message, and given focus
 *
 * STAY LENGTH (`nights`, the drawer only). Three chips, "1 night", "2 nights", "3 nights": pressing one
 * sets the departure that many nights after the arrival (today, when no possible arrival is chosen yet).
 * The chip that matches the chosen dates is shown pressed. A line beneath restates the stay in words,
 * "17 Oct 2026 to 19 Oct 2026, 2 nights", and is announced politely when it changes. Both exist only
 * once script is running (they are not in the server's HTML), so a page without script shows no dead
 * buttons. They say nothing about availability or a minimum stay: the booking page decides both.
 *
 * The message line is a live region (`role="alert"`) that is in the page from the start and simply
 * empty until there is something to say, so the words are announced even when the refused field
 * already has focus (Enter pressed inside it) and no focus change happens to read them out.
 *
 * Dates are date-only strings compared in the resort's calendar (Asia/Bangkok) by lib/booking, never
 * `Date` objects in the visitor's timezone.
 *
 * The submit listener is on the form itself, so by the time the analytics root sees the event (on
 * the document) a refused search is already `defaultPrevented` and is not counted.
 */

type DateField = "checkin" | "checkout";

/** `turn` counts refusals, so the same words shown twice are two announcements. */
type Notice = { text: string; turn: number };

/** A stay that can be handed over: both dates complete, arrival today or later, departure after it. */
type Stay = { from: string; to: string; nights: number };

export interface StayPlannerEnhancerProps {
  errorId: string;
  className?: string;
  /** The provider's parameter names for the two date fields. */
  fields: Record<DateField, string>;
  /** Glossary messages.arrivalNotPast and messages.departureAfterArrival. */
  messages: { arrivalNotPast: string; departureAfterArrival: string };
  /** The stay-length chips and the summary line. Omit to leave both out (the dock, the compact card). */
  nights?: {
    lang: Locale;
    /** Name of the group of chips: "Length of stay". */
    label: string;
    /** "1 night". */
    one: string;
    /** "{n} nights". */
    many: string;
    /** "{from} to {to}, 1 night". */
    stayOne: string;
    /** "{from} to {to}, {n} nights". */
    stayMany: string;
    chipsClassName?: string;
    summaryClassName?: string;
  };
}

const LENGTHS = [1, 2, 3];

const subscribeNever = () => () => {};

function nightsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

export function StayPlannerEnhancer({ errorId, className, fields, messages, nights }: StayPlannerEnhancerProps) {
  const line = useRef<HTMLParagraphElement>(null);
  /** Set by the effect: how a chip reaches the form. */
  const pick = useRef<((length: number) => void) | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [stay, setStay] = useState<Stay | null>(null);
  // False on the server and while hydrating: the chips are script's own and never part of the server's HTML.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const { checkin: checkinName, checkout: checkoutName } = fields;
  const { arrivalNotPast, departureAfterArrival } = messages;

  useEffect(() => {
    const form = line.current?.closest("form");
    if (!form) return;
    const arrival = form.elements.namedItem(checkinName);
    const departure = form.elements.namedItem(checkoutName);
    if (!(arrival instanceof HTMLInputElement) || !(departure instanceof HTMLInputElement)) return;

    form.noValidate = true;
    arrival.required = false;
    departure.required = false;

    let turn = 0;

    const editing = (input: HTMLInputElement) => document.activeElement === input;

    /** Written only when it changes, and never to the field being edited (see the rule above). */
    const setMin = (input: HTMLInputElement, value: string) => {
      if (!editing(input) && input.min !== value) input.min = value;
    };

    /** An arrival the planner can act on: a complete date, today or later. */
    const arrivalIsUsable = (today: string) => isIsoDate(arrival.value) && arrival.value >= today;

    const syncLimits = () => {
      const today = todayInBangkok();
      setMin(arrival, today);
      setMin(departure, addDays(arrivalIsUsable(today) ? arrival.value : today, 1));
    };

    /** Reads the two fields and publishes the stay they describe, or none. Reading never disturbs typing. */
    const readStay = () => {
      const usable = arrivalIsUsable(todayInBangkok()) && isIsoDate(departure.value) && departure.value > arrival.value;
      const next: Stay | null = usable ? { from: arrival.value, to: departure.value, nights: nightsBetween(arrival.value, departure.value) } : null;
      setStay((current) => (current?.from === next?.from && current?.to === next?.to ? current : next));
    };

    const unmark = (input: HTMLInputElement) => {
      if (!input.hasAttribute("aria-invalid")) return false;
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      return true;
    };

    const clear = () => {
      const a = unmark(arrival);
      const d = unmark(departure);
      if (a || d) setNotice(null);
    };

    /** Marks the field and says why. `focus` moves the guest there (a refused search); without it the mark is quiet. */
    const refuse = (input: HTMLInputElement, text: string, focus: boolean) => {
      unmark(input === arrival ? departure : arrival);
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errorId);
      turn += 1;
      const next: Notice = { text, turn };
      if (focus) {
        // Committed before focus moves, so the field's description is on the page when the field is read.
        flushSync(() => setNotice(next));
        input.focus();
      } else {
        setNotice(next);
      }
    };

    // Typing: an old message goes, and nothing else is touched.
    const onInput = () => clear();

    const onArrivalChange = () => {
      clear();
      const today = todayInBangkok();
      if (arrivalIsUsable(today)) {
        const next = addDays(arrival.value, 1);
        // Departure cannot have focus here (arrival does, or a picker over it), but it is asked all the same.
        if (!editing(departure) && (!isIsoDate(departure.value) || departure.value <= arrival.value)) departure.value = next;
        setMin(departure, next);
      }
      readStay();
    };

    const onDepartureChange = () => {
      clear();
      readStay();
    };

    const onArrivalBlur = () => {
      syncLimits();
      readStay();
      if (arrival.validity.badInput || !isIsoDate(arrival.value)) return;
      if (arrival.value < todayInBangkok()) refuse(arrival, arrivalNotPast, false);
    };

    const onDepartureBlur = () => {
      syncLimits();
      readStay();
      if (departure.validity.badInput || !isIsoDate(departure.value) || !arrivalIsUsable(todayInBangkok())) return;
      if (departure.value <= arrival.value) refuse(departure, departureAfterArrival, false);
    };

    const enableDates = () => {
      arrival.disabled = false;
      departure.disabled = false;
    };

    const onSubmit = (event: SubmitEvent) => {
      clear();
      const today = todayInBangkok();

      // A partly typed date ("15" for the day and nothing else) reports an empty value. Taking that for
      // "no dates" would send the guest to the booking page without the date they were entering.
      if (arrival.validity.badInput) {
        event.preventDefault();
        refuse(arrival, arrivalNotPast, true);
        return;
      }
      if (departure.validity.badInput) {
        event.preventDefault();
        refuse(departure, departureAfterArrival, true);
        return;
      }

      // A possible arrival chosen, departure cleared: the shortest stay, rather than a refusal. The value
      // is complete (or empty) at this point, so nothing a guest was typing can be lost by writing it.
      if (arrivalIsUsable(today) && !departure.value) departure.value = addDays(arrival.value, 1);

      const problem = stayError({ checkin: arrival.value || undefined, checkout: departure.value || undefined }, today);
      if (problem) {
        event.preventDefault();
        // Arrival is put right first; only once it stands can the departure be the one that is wrong.
        if (arrivalIsUsable(today)) refuse(departure, departureAfterArrival, true);
        else refuse(arrival, arrivalNotPast, true);
        return;
      }

      // No dates at all: leave the two empty parameters out, so the booking page opens on its own picker.
      if (!arrival.value && !departure.value) {
        arrival.disabled = true;
        departure.disabled = true;
        // The form data has been read by the time this runs.
        window.setTimeout(enableDates, 0);
      }
    };

    /** A stay-length chip. The chip has focus, so neither field is being edited and both may be written. */
    pick.current = (length: number) => {
      const today = todayInBangkok();
      clear();
      if (!arrivalIsUsable(today)) arrival.value = today;
      departure.value = addDays(arrival.value, length);
      syncLimits();
      readStay();
    };

    // The browser may have restored the fields (a reload, the back button): read them once the page has settled.
    const onPageShow = () => {
      enableDates();
      readStay();
    };
    const settle = window.requestAnimationFrame(readStay);

    syncLimits();
    arrival.addEventListener("input", onInput);
    arrival.addEventListener("change", onArrivalChange);
    arrival.addEventListener("blur", onArrivalBlur);
    departure.addEventListener("input", onInput);
    departure.addEventListener("change", onDepartureChange);
    departure.addEventListener("blur", onDepartureBlur);
    form.addEventListener("submit", onSubmit);
    // Coming back from the booking page through the back/forward cache: make sure nothing stayed disabled.
    window.addEventListener("pageshow", onPageShow);

    return () => {
      pick.current = null;
      window.cancelAnimationFrame(settle);
      arrival.removeEventListener("input", onInput);
      arrival.removeEventListener("change", onArrivalChange);
      arrival.removeEventListener("blur", onArrivalBlur);
      departure.removeEventListener("input", onInput);
      departure.removeEventListener("change", onDepartureChange);
      departure.removeEventListener("blur", onDepartureBlur);
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [checkinName, checkoutName, errorId, arrivalNotPast, departureAfterArrival]);

  const count = (n: number, one: string, many: string) => (n === 1 ? one : many.replace("{n}", String(n)));
  const summary =
    nights && stay
      ? count(stay.nights, nights.stayOne, nights.stayMany)
          .replace("{from}", formatDate(stay.from, nights.lang, "short"))
          .replace("{to}", formatDate(stay.to, nights.lang, "short"))
      : "";

  return (
    <>
      {nights && hydrated ? (
        <div role="group" aria-label={nights.label} className={nights.chipsClassName}>
          {LENGTHS.map((length) => (
            <Chip key={length} as="button" selected={stay?.nights === length} onClick={() => pick.current?.(length)}>
              {count(length, nights.one, nights.many)}
            </Chip>
          ))}
        </div>
      ) : null}
      {/* Always rendered, empty until a search is refused (the stylesheet gives an empty line no space).
          The words sit in an element keyed by the refusal, so repeating a message replaces the node and
          assistive technology hears it again. */}
      <p ref={line} id={errorId} className={className} role="alert">
        {notice ? <span key={notice.turn}>{notice.text}</span> : null}
      </p>
      {nights && hydrated ? (
        <p className={nights.summaryClassName} aria-live="polite">
          {summary}
        </p>
      ) : null}
    </>
  );
}
