import { NextResponse, type NextRequest } from "next/server";
import { FLAGS } from "@/content/site-public";
import { isLocale } from "@/i18n/config";
import { todayInBangkok } from "@/lib/booking";
import { isEnquiryType, isReplyChannel, normaliseEnquiry, validateEnquiry, type EnquiryInput, type EnquiryResponse } from "@/lib/enquiry";

/**
 * POST /api/enquiry — receives the contact form when (and only when) delivery is configured.
 *
 * DELIVERY needs two things, and without both the handler answers 503 "not-configured" and the form
 * never shows "sent":
 *   1. the `enquiryDelivery` flag on (src/content/site-public.ts), which is also what makes the form
 *      offer "Send enquiry" instead of "Copy enquiry";
 *   2. ENQUIRY_WEBHOOK_URL in the server environment: an HTTPS endpoint that accepts the enquiry as
 *      JSON (a mail relay, a help desk, a sheet). ENQUIRY_WEBHOOK_TOKEN, if set, is sent as a bearer
 *      token. The enquiry is forwarded once; "sent" is reported only if that endpoint answers 2xx.
 *
 * WHAT IT CHECKS, in this order: the request comes from this site (Origin), is JSON and is small; the
 * caller is not hammering it (five accepted attempts per address in ten minutes, held in memory, which
 * is right for one server process and should move to a shared store if the site is ever scaled out);
 * the hidden field is empty; every field passes the same checks the form runs (src/lib/enquiry.ts).
 *
 * WHAT IT NEVER DOES: log a name, a contact detail or a message; store anything; answer a GET (Next
 * answers 405 for the methods this file does not export). No cookie is read, so there is no session to
 * forge a request against.
 */

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Attempt times by caller address. Pruned on every request, so it cannot grow without bound. */
const attempts = new Map<string, number[]>();

function rateLimited(key: string, now: number): boolean {
  for (const [address, times] of attempts) {
    const recent = times.filter((time) => now - time < WINDOW_MS);
    if (recent.length === 0) attempts.delete(address);
    else attempts.set(address, recent);
  }
  const mine = attempts.get(key) ?? [];
  if (mine.length >= MAX_ATTEMPTS) return true;
  attempts.set(key, [...mine, now]);
  return false;
}

function answer(body: EnquiryResponse, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");

export async function POST(request: NextRequest) {
  // A browser sends Origin on a cross-site POST: anything that is not this site is refused.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return answer({ ok: false, error: "invalid" }, 403);
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return answer({ ok: false, error: "invalid" }, 415);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return answer({ ok: false, error: "invalid" }, 413);

  const caller = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(caller, Date.now())) return answer({ ok: false, error: "rate-limited" }, 429);

  let data: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    data = parsed as Record<string, unknown>;
  } catch {
    return answer({ ok: false, error: "invalid" }, 400);
  }

  // The hidden field: a person never fills it in. Answer as if all were well, and deliver nothing.
  if (text(data.company).trim() !== "") return answer({ ok: true }, 200);

  if (!isEnquiryType(data.type) || !isReplyChannel(data.channel) || !isLocale(text(data.lang))) return answer({ ok: false, error: "invalid" }, 400);

  const input: EnquiryInput = normaliseEnquiry({
    type: data.type,
    name: text(data.name),
    channel: data.channel,
    contact: text(data.contact),
    checkin: text(data.checkin),
    checkout: text(data.checkout),
    room: text(data.room),
    guests: text(data.guests),
    message: text(data.message),
  });
  const fields = validateEnquiry(input, todayInBangkok());
  if (Object.keys(fields).length > 0) return answer({ ok: false, error: "invalid", fields }, 422);

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!FLAGS.enquiryDelivery || !webhook) return answer({ ok: false, error: "not-configured" }, 503);

  try {
    const token = process.env.ENQUIRY_WEBHOOK_TOKEN;
    const delivered = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ ...input, lang: text(data.lang), receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!delivered.ok) return answer({ ok: false, error: "failed" }, 502);
  } catch {
    return answer({ ok: false, error: "failed" }, 502);
  }
  return answer({ ok: true }, 200);
}
