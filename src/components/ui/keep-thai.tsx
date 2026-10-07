import { Fragment, type ReactNode } from "react";

/**
 * Thai display text whose proper names and compounds never break across lines.
 *
 *   keepThai("ห้องพัก 3 แบบ ที่พักเขาใหญ่พร้อมดาดฟ้าส่วนตัว")
 *
 * Thai is written without spaces between words, so a browser breaks a line wherever its dictionary
 * finds a word boundary. "เขาใหญ่" is two dictionary words (เขา, ใหญ่) and one place: left alone it can
 * end a line as "เขา" and start the next as "ใหญ่". Each term below is wrapped in an element wearing the
 * global .nowrap class (src/styles/base.css); everything else is left to the browser. Nothing is typed into the text: no manual break and
 * no zero-width character (docs/VOICE.md 2.4).
 *
 * For headings and other short display lines. Longest terms first, so a longer name is matched before
 * a shorter one inside it.
 */
const TERMS = [
  "อุทยานแห่งชาติเขาใหญ่",
  "คำถามที่พบบ่อย",
  "ความเป็นส่วนตัว",
  "นครราชสีมา",
  "สระว่ายน้ำ",
  "อ่างอาบน้ำ",
  "อ่างแช่ตัว",
  "ภูคำหอม",
  "เขาใหญ่",
  "วังกะทะ",
  "ปากช่อง",
  "เว็บไซต์",
  "รีสอร์ท",
  "ดาดฟ้า",
];

const PATTERN = new RegExp(`(${TERMS.join("|")})`, "g");

export function keepThai(text: string): ReactNode {
  return text.split(PATTERN).map((part, index) =>
    TERMS.includes(part) ? (
      <span key={index} className="nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
