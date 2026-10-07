import { ROOM_IDS, type Locale, type RoomId } from "@/content/schema";
import { isIsoDate } from "@/lib/booking";

/**
 * The enquiry: its shape, its limits and its checks. One module, used by the form in the browser and by
 * the route handler on the server (src/app/api/enquiry/route.ts), so the two can never disagree about
 * what a valid enquiry is. Plain functions and constants only: nothing here reads a content file.
 *
 * What an enquiry is not: a booking, a payment, or a place for medical details. It carries a name, one
 * way to reply, a message, and for a stay or a group a few optional planning details.
 */

export const ENQUIRY_TYPES = ["stay", "dining", "group", "general"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const REPLY_CHANNELS = ["phone", "email"] as const;
export type ReplyChannel = (typeof REPLY_CHANNELS)[number];

/** Length limits, enforced in the form (maxLength) and again on the server. */
export const ENQUIRY_LIMITS = { name: 120, contact: 160, message: 4000, guests: 3 } as const;

export interface EnquiryInput {
  type: EnquiryType;
  name: string;
  channel: ReplyChannel;
  /** The phone number or the email address, whichever `channel` names. */
  contact: string;
  /** Date-only strings (YYYY-MM-DD), or empty. */
  checkin: string;
  checkout: string;
  /** A room id, or empty for no preference. */
  room: string;
  /** Digits, or empty. */
  guests: string;
  message: string;
}

export type EnquiryField = "name" | "contact" | "checkin" | "checkout" | "guests" | "message";

/** Keys of the validation messages in src/i18n/ui.ts → messages (and one in the contact copy). */
export type EnquiryErrorCode =
  | "nameRequired"
  | "messageRequired"
  | "contactRequired"
  | "emailInvalid"
  | "phoneInvalid"
  | "departureAfterArrival"
  | "arrivalNotPast"
  | "guestsInvalid";

export type EnquiryErrors = Partial<Record<EnquiryField, EnquiryErrorCode>>;

export function isEnquiryType(value: unknown): value is EnquiryType {
  return typeof value === "string" && (ENQUIRY_TYPES as readonly string[]).includes(value);
}

export function isReplyChannel(value: unknown): value is ReplyChannel {
  return typeof value === "string" && (REPLY_CHANNELS as readonly string[]).includes(value);
}

export function isEnquiryRoom(value: unknown): value is RoomId {
  return typeof value === "string" && (ROOM_IDS as readonly string[]).includes(value);
}

/** Something@something.tld: enough to catch a slip, never a reason to refuse a real address. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * International formats are welcome: a leading "+", spaces, brackets, dots and hyphens. What matters is
 * that there are between 8 and 15 digits (E.164 allows 15) and nothing that is not part of a number.
 */
export function looksLikePhone(value: string): boolean {
  const text = value.trim();
  const digits = text.replace(/\D/g, "").length;
  return /^\+?[\d\s().-]+$/.test(text) && digits >= 8 && digits <= 15;
}

/**
 * The checks, in the order a guest meets the fields. `today` is the current date at the resort
 * (todayInBangkok()), passed in so the function is pure. Dates and guests are optional: they are checked
 * only when given, and only for a stay or a group.
 */
export function validateEnquiry(input: EnquiryInput, today: string): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!input.name.trim()) errors.name = "nameRequired";

  const contact = input.contact.trim();
  if (!contact) errors.contact = "contactRequired";
  else if (input.channel === "email" && !looksLikeEmail(contact)) errors.contact = "emailInvalid";
  else if (input.channel === "phone" && !looksLikePhone(contact)) errors.contact = "phoneInvalid";

  if (input.type === "stay" || input.type === "group") {
    if (input.checkin && (!isIsoDate(input.checkin) || input.checkin < today)) errors.checkin = "arrivalNotPast";
    if (input.checkout && (!isIsoDate(input.checkout) || (input.checkin && input.checkout <= input.checkin))) errors.checkout = "departureAfterArrival";
    if (input.guests && !/^[1-9]\d{0,2}$/.test(input.guests.trim())) errors.guests = "guestsInvalid";
  }

  if (!input.message.trim()) errors.message = "messageRequired";
  return errors;
}

/** Trims everything, drops what does not apply to the type, and cuts each field to its limit. */
export function normaliseEnquiry(input: EnquiryInput): EnquiryInput {
  const planning = input.type === "stay" || input.type === "group";
  return {
    type: input.type,
    name: input.name.trim().slice(0, ENQUIRY_LIMITS.name),
    channel: input.channel,
    contact: input.contact.trim().slice(0, ENQUIRY_LIMITS.contact),
    checkin: planning ? input.checkin : "",
    checkout: planning ? input.checkout : "",
    room: input.type === "stay" && isEnquiryRoom(input.room) ? input.room : "",
    guests: planning ? input.guests.trim().slice(0, ENQUIRY_LIMITS.guests) : "",
    message: input.message.trim().slice(0, ENQUIRY_LIMITS.message),
  };
}

/** What the route handler answers with. */
export type EnquiryResponse = { ok: true } | { ok: false; error: "invalid" | "rate-limited" | "not-configured" | "failed"; fields?: EnquiryErrors };

export type EnquiryRequest = EnquiryInput & { lang: Locale; /** A field no person fills in. */ company?: string };
