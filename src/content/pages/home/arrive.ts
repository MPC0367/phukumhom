import type { AssetId, L } from "@/content/schema";

/**
 * Homepage chapter 07, "Getting here".
 *
 * Facts are not in this file. The address, the phone number, the Facebook page and the Google Maps
 * listing come from src/content/site.ts through pub(); the photograph's caption and alt text come from
 * the catalogue. What is here is wording only.
 *
 * Sources: glossary labels.address, actions.copyAddress, actions.openInMaps, actions.contactOnFacebook,
 * actions.callResort, messages.addressCopied, a11y.opensGoogleMaps, a11y.opensFacebook,
 * phrases.locality and phrases.enquiryNotReservation are used word for word. Written fresh for this
 * chapter: the kicker, title and intro, "Copied", "Share location", "Map link copied.", the note under
 * the map link, "Talk to the resort" and "Send an enquiry" (ART-DIRECTION section 6 names both).
 *
 * Rules: the map link is the resort's own Google Maps listing and is never called the entrance or the
 * gate; no coordinates, distances or journey times; no reply time is promised; one phone number only.
 * No middle dots and no dashes. Third person.
 */

/** Legacy frame 05_02: the reception building at dusk. One frame only from the set {05_02, 05_03, 05_04}. */
export const RECEPTION_ASSET: AssetId = "reception-building-front-dusk";

interface ArriveCopy {
  kicker: string;
  title: string;
  intro: string;
  address: {
    label: string;
    /** The copy button at rest, and its accessible name at all times. */
    copy: string;
    /** What the button shows for a moment once the address is on the clipboard. */
    copied: string;
    /** The toast. Only ever shown after the copy really happened. */
    copiedToast: string;
    share: string;
    /** The toast when sharing fell back to copying the map link. */
    linkCopiedToast: string;
    openInMaps: string;
    opensMaps: string;
    /** Says what the map link is, so nobody takes it for a checked arrival point. */
    mapsNote: string;
  };
  talk: {
    label: string;
    /** Read before the number by assistive technology. */
    call: string;
    facebook: string;
    opensFacebook: string;
    enquiry: string;
    enquiryNote: string;
  };
  /** Glossary phrases.locality. */
  locality: string;
}

export const copy = {
  en: {
    kicker: "Getting here",
    title: "Arrive",
    intro: "Copy the address, open the map listing or call the resort. If the journey raises a question, the team is the one to ask.",
    address: {
      label: "Address",
      copy: "Copy address",
      copied: "Copied",
      copiedToast: "Address copied.",
      share: "Share location",
      linkCopiedToast: "Map link copied.",
      openInMaps: "Open in Google Maps",
      opensMaps: "opens Google Maps",
      mapsNote: "The link opens the resort’s own listing on Google Maps.",
    },
    talk: {
      label: "Talk to the resort",
      call: "Call the resort",
      facebook: "Contact on Facebook",
      opensFacebook: "opens Facebook",
      enquiry: "Send an enquiry",
      enquiryNote: "An enquiry is a message to the resort, not a confirmed reservation.",
    },
    locality: "In Wang Katha, on the quieter side of the Khao Yai area.",
  },
  th: {
    kicker: "ที่อยู่และการติดต่อ",
    title: "การเดินทาง",
    intro: "คัดลอกที่อยู่ เปิดแผนที่ หรือโทรหารีสอร์ทได้จากตรงนี้ มีคำถามเรื่องเส้นทาง สอบถามทีมงานก่อนออกเดินทางได้",
    address: {
      label: "ที่อยู่",
      copy: "คัดลอกที่อยู่",
      copied: "คัดลอกแล้ว",
      copiedToast: "คัดลอกที่อยู่แล้ว",
      share: "แชร์ที่ตั้ง",
      linkCopiedToast: "คัดลอกลิงก์แผนที่แล้ว",
      openInMaps: "เปิดใน Google Maps",
      opensMaps: "เปิด Google Maps",
      mapsNote: "ลิงก์นี้เปิดหน้าของรีสอร์ทบน Google Maps",
    },
    talk: {
      label: "ติดต่อรีสอร์ท",
      call: "โทรหารีสอร์ท",
      facebook: "ติดต่อทาง Facebook",
      opensFacebook: "เปิด Facebook",
      enquiry: "ส่งข้อความสอบถาม",
      enquiryNote: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
    },
    locality: "อยู่ที่ตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่",
  },
} satisfies L<ArriveCopy>;
