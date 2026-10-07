import type { L } from "@/content/schema";

/**
 * The homepage's closing band.
 *
 * The line is glossary home.closing, word for word, kept in the pieces the band sets on separate lines:
 *   EN  "Pick your dates." / "The garden will be" + "here."   (the last word is the one italic accent)
 *   TH  "เลือกวันที่สะดวก" / "แล้วมาพักกลางสวน"                    (no accent: Thai is never italic)
 * The buttons are glossary actions.checkAvailability and actions.exploreRooms; the note under them is
 * glossary phrases.bookingPartnerNotice; "Read guest reviews" is glossary actions.readReviews.
 *
 * The review sentence is a pattern only. Its figures (the score, the scale, the number of reviews, the
 * date they were read) are facts in src/content/reviews.ts and are filled in by the component, which
 * prints the sentence only while the `reviewRating` flag is on and the Google figure is publishable.
 * The contract's wording for it is the glossary's patterns.reviewFigure; this band writes it as a
 * sentence ("4.6 out of 5 on Google…") because a slash between the numbers reads as a fraction when set
 * large. No star strip, no quotation, no other platform.
 *
 * No middle dots and no dashes. Third person.
 */

interface ClosingCopy {
  /** The band's heading, set as a small label. Plain words: it names what the band is for. */
  heading: string;
  line: {
    first: string;
    second: string;
    /** English only: the last word, set in italics. Empty in Thai. */
    accent: string;
  };
  availability: string;
  rooms: string;
  /** Glossary phrases.bookingPartnerNotice. */
  bookingNote: string;
  review: {
    /** `{rating}` is set as a large figure; the rest of the sentence follows it. */
    figure: string;
    read: string;
    opensMaps: string;
  };
}

export const copy = {
  en: {
    heading: "Plan your stay",
    line: { first: "Pick your dates.", second: "The garden will be", accent: "here." },
    availability: "Check availability",
    rooms: "Explore rooms",
    bookingNote: "Booking is completed on the page of the resort’s booking partner. Your browser’s back button brings you back here.",
    review: {
      figure: "{rating} out of {scale} on Google from {count} reviews, checked {date}",
      read: "Read guest reviews",
      opensMaps: "opens Google Maps",
    },
  },
  th: {
    heading: "วางแผนเข้าพัก",
    line: { first: "เลือกวันที่สะดวก", second: "แล้วมาพักกลางสวน", accent: "" },
    availability: "ตรวจสอบห้องว่าง",
    rooms: "ดูห้องพัก",
    bookingNote: "การจองจะทำต่อในหน้าจองของผู้ให้บริการระบบจองของรีสอร์ท กดย้อนกลับเมื่อต้องการกลับมาหน้านี้",
    review: {
      figure: "{rating} เต็ม {scale} บน Google จาก {count} รีวิว ตรวจสอบเมื่อ {date}",
      read: "อ่านรีวิวจากผู้เข้าพัก",
      opensMaps: "เปิด Google Maps",
    },
  },
} satisfies L<ClosingCopy>;
