import type { L } from "@/content/schema";

/**
 * Wording for the measurement choice, written to docs/VOICE.md: says what happens and what does not,
 * third person ("this site"), no urgency, and the two answers carry the same weight. Thai has no
 * particles and no full stops. None of these strings is in docs/glossary.json yet except the
 * privacy-policy label, which is copied from it.
 *
 * Shown only when analytics is configured; a preview without a measurement id never renders them.
 */
export interface ConsentCopy {
  /** Names the region for assistive technology and heads the panel. */
  title: string;
  body: string;
  accept: string;
  reject: string;
  privacy: string;
  /** Label of the control that re-opens the choice (footer). */
  settings: string;
  close: string;
  /** Shown when the panel is re-opened and a choice already exists. */
  current: { granted: string; denied: string };
}

export const CONSENT_COPY = {
  en: {
    title: "Analytics cookies",
    body: "With your permission, this site uses Google Analytics to count visits and see which pages are useful. Its cookies are set only if you accept. Booking, enquiries and every page work the same either way.",
    accept: "Accept",
    reject: "Reject",
    privacy: "Privacy policy",
    settings: "Cookie settings",
    close: "Close",
    current: { granted: "Current choice: accepted.", denied: "Current choice: rejected." },
  },
  th: {
    title: "คุกกี้เพื่อการวัดผล",
    body: "เว็บไซต์นี้ขอใช้ Google Analytics เพื่อนับจำนวนการเข้าชมและดูว่าหน้าใดมีประโยชน์ คุกกี้ส่วนนี้จะทำงานเมื่อกดยอมรับเท่านั้น การจอง การสอบถาม และทุกหน้าใช้งานได้เหมือนเดิมไม่ว่าจะเลือกแบบใด",
    accept: "ยอมรับ",
    reject: "ปฏิเสธ",
    privacy: "นโยบายความเป็นส่วนตัว",
    settings: "ตั้งค่าคุกกี้",
    close: "ปิด",
    current: { granted: "ตอนนี้เลือกไว้ว่า ยอมรับ", denied: "ตอนนี้เลือกไว้ว่า ปฏิเสธ" },
  },
} satisfies L<ConsentCopy>;
