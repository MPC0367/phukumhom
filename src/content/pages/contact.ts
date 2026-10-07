import type { AssetId, L } from "@/content/schema";

/**
 * The Contact page (brief section 17): the wording around the contact facts and the enquiry form.
 *
 * The facts are not here: the phone number, the Facebook page and the map listing come from
 * src/content/site.ts through pub(). Shared words (field labels, validation messages, Copy enquiry,
 * Send enquiry) are read from src/i18n/ui.ts by the page and handed to the form.
 *
 * WHAT THE FORM DOES. While the `enquiryDelivery` flag is off (no receiving service is configured) the
 * form does not send anything: it checks what was typed, puts it into a tidy message and copies that
 * message to the clipboard, for the guest to paste into a message to the resort. The page says so in
 * plain words and never shows "sent". With the flag on, the same form posts to /api/enquiry and shows
 * "sent" only when the server has accepted the message.
 *
 * Kept (BUILD-CONTRACT sections 2 and 8): one phone number, no email address, no LINE, WhatsApp or
 * Instagram; no reply time is promised; an enquiry is not a reservation; the form never asks for
 * medical details. Glossary sentences used word for word: phrases.enquiryNotReservation.
 * Third person. No middle dots and no dashes.
 */

/** Legacy 05_02: the reception building at dusk. */
export const CONTACT_HERO: AssetId = "reception-building-front-dusk";

export interface ContactPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  /** The second paragraph differs with what the form can do. */
  body: { always: string; draft: string; delivery: string };
  glance: {
    /** `{phone}` is the published number. */
    phone: string;
    facebook: string;
    /** Glossary phrases.enquiryNotReservation. */
    notReservation: string;
    rates: string;
  };
  talk: { kicker: string; title: string; intro: string };
  enquiry: {
    kicker: string;
    title: string;
    intro: { draft: string; delivery: string };
  };
  form: {
    heading: string;
    /** Legends and labels the shared table does not have. */
    about: string;
    stayDetails: string;
    groupDetails: string;
    room: string;
    noPreference: string;
    guests: string;
    phoneField: string;
    emailField: string;
    datesHint: string;
    messageHint: string;
    guestsInvalid: string;
    /** Under the form: what pressing the button does. */
    draftNote: string;
    deliveryNote: string;
    privacyLead: string;
    privacyLink: string;
    /** The panel shown after a successful copy. */
    copiedHeading: string;
    copiedBody: string;
    /** When the clipboard is refused: the message is shown to be copied by hand. */
    manualHeading: string;
    manualBody: string;
    draftLabel: string;
    /** Shown in place of the form when the browser has no JavaScript. */
    noScript: string;
    sending: string;
    /** The failure messages for the (unexpected) case that no phone number is published. */
    failedPlain: string;
    tooManyPlain: string;
    /** The lines of the composed message. `{…}` are filled from the form. */
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
  };
}

export const copy = {
  en: {
    heroKicker: "Contact",
    statement: "Call, write on Facebook, or put your question in a few lines.",
    accent: "question",
    body: {
      always: "The quickest way to reach the resort is by phone. The team can also be reached through the resort’s Facebook page.",
      draft: "The form further down helps you put an enquiry together. It does not send anything itself: it copies your message, ready to paste into a message to the resort.",
      delivery: "The form further down sends your enquiry to the resort, and the team replies by the channel you choose.",
    },
    glance: {
      phone: "The resort’s phone number is {phone}.",
      facebook: "The resort can also be reached through its Facebook page.",
      notReservation: "An enquiry is a message to the resort, not a confirmed reservation.",
      rates: "Rates and rooms for your dates are shown on the booking page.",
    },
    talk: {
      kicker: "Talk to the resort",
      title: "Talk",
      intro: "The address, the one phone number, and the time at the resort right now.",
    },
    enquiry: {
      kicker: "Write an enquiry",
      title: "Write",
      intro: {
        draft: "Fill in what applies. The form turns it into a message you can copy and send yourself.",
        delivery: "Fill in what applies and send it. The team replies by the channel you choose.",
      },
    },
    form: {
      heading: "Your enquiry",
      about: "What is your enquiry about?",
      stayDetails: "About the stay",
      groupDetails: "About the group",
      room: "Room type",
      noPreference: "No preference yet",
      guests: "Number of guests",
      phoneField: "Phone number",
      emailField: "Email address",
      datesHint: "Leave the dates empty if you have not decided.",
      messageHint: "Practical needs are welcome. There is no need to share medical details.",
      guestsInvalid: "Please enter a number of guests, or leave it empty.",
      draftNote: "Nothing is sent from this page. The button copies your message so you can paste it into a message to the resort.",
      deliveryNote: "An enquiry is a message to the resort, not a confirmed reservation.",
      privacyLead: "How the website handles what you type:",
      privacyLink: "privacy policy",
      copiedHeading: "Your message is copied",
      copiedBody: "Paste it into a message to the resort on Facebook, or read it out on the phone. Nothing has been sent from this page.",
      manualHeading: "Copy your message",
      manualBody: "Your browser did not allow copying. The message is below: select it, copy it, and paste it into a message to the resort.",
      draftLabel: "Your enquiry, ready to copy",
      noScript: "The enquiry form needs JavaScript, which is switched off in this browser. Please call the resort or write on Facebook instead.",
      sending: "Sending",
      failedPlain: "Your enquiry could not be sent just now. What you wrote is still here. Please try again.",
      tooManyPlain: "That was several attempts in a short time. Please wait a moment and try again.",
      draft: {
        title: "Enquiry for Phukumhom Resort Khao Yai",
        about: "About: {value}",
        name: "Name: {value}",
        reply: "Please reply by {channel}: {value}",
        arrival: "Arrival: {value}",
        departure: "Departure: {value}",
        room: "Room type: {value}",
        guests: "Guests: {value}",
        message: "Message:",
      },
    },
  },
  th: {
    heroKicker: "ติดต่อรีสอร์ท",
    statement: "จะโทร ติดต่อทาง Facebook หรือเขียนคำถามสั้นๆ ก็ได้",
    accent: "",
    body: {
      always: "ช่องทางที่ติดต่อรีสอร์ทได้เร็วที่สุดคือโทรศัพท์ และยังติดต่อทีมงานผ่านหน้า Facebook ของรีสอร์ทได้ด้วย",
      draft: "แบบฟอร์มด้านล่างช่วยเรียบเรียงข้อความสอบถาม แบบฟอร์มนี้ไม่ได้ส่งข้อความให้เอง แต่จะคัดลอกข้อความไว้ให้นำไปวางในข้อความถึงรีสอร์ท",
      delivery: "แบบฟอร์มด้านล่างจะส่งข้อความสอบถามถึงรีสอร์ท และทีมงานจะติดต่อกลับตามช่องทางที่เลือกไว้",
    },
    glance: {
      phone: "หมายเลขโทรศัพท์ของรีสอร์ทคือ {phone}",
      facebook: "ติดต่อรีสอร์ทผ่านหน้า Facebook ของรีสอร์ทได้อีกช่องทางหนึ่ง",
      notReservation: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
      rates: "ราคาและห้องพักของช่วงวันที่ต้องการ ดูได้ในหน้าจอง",
    },
    talk: {
      kicker: "ติดต่อรีสอร์ท",
      title: "ติดต่อ",
      intro: "ที่อยู่ หมายเลขโทรศัพท์ และเวลาที่รีสอร์ทในขณะนี้",
    },
    enquiry: {
      kicker: "เขียนข้อความสอบถาม",
      title: "สอบถาม",
      intro: {
        draft: "กรอกเฉพาะส่วนที่เกี่ยวข้อง แบบฟอร์มจะเรียบเรียงเป็นข้อความให้คัดลอกไปส่งเอง",
        delivery: "กรอกเฉพาะส่วนที่เกี่ยวข้องแล้วกดส่ง ทีมงานจะติดต่อกลับตามช่องทางที่เลือกไว้",
      },
    },
    form: {
      heading: "ข้อความสอบถามของคุณ",
      about: "เรื่องที่ต้องการสอบถาม",
      stayDetails: "รายละเอียดการเข้าพัก",
      groupDetails: "รายละเอียดของหมู่คณะ",
      room: "ประเภทห้องพัก",
      noPreference: "ยังไม่ได้เลือก",
      guests: "จำนวนผู้เข้าพัก",
      phoneField: "หมายเลขโทรศัพท์",
      emailField: "อีเมล",
      datesHint: "หากยังไม่ได้กำหนดวันที่ เว้นว่างไว้ได้",
      messageHint: "บอกความต้องการในทางปฏิบัติได้ โดยไม่จำเป็นต้องให้ข้อมูลทางการแพทย์",
      guestsInvalid: "กรุณากรอกจำนวนผู้เข้าพักเป็นตัวเลข หรือเว้นว่างไว้",
      draftNote: "หน้านี้ไม่ได้ส่งข้อความใดๆ ปุ่มด้านล่างจะคัดลอกข้อความ เพื่อนำไปวางในข้อความถึงรีสอร์ท",
      deliveryNote: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
      privacyLead: "เว็บไซต์ดูแลข้อมูลที่กรอกอย่างไร อ่านได้ที่",
      privacyLink: "นโยบายความเป็นส่วนตัว",
      copiedHeading: "คัดลอกข้อความแล้ว",
      copiedBody: "นำไปวางในข้อความถึงรีสอร์ททาง Facebook หรือใช้อ่านขณะโทรศัพท์ได้ หน้านี้ยังไม่ได้ส่งข้อความใดๆ",
      manualHeading: "คัดลอกข้อความ",
      manualBody: "เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ ข้อความอยู่ด้านล่าง เลือกข้อความ คัดลอก แล้วนำไปวางในข้อความถึงรีสอร์ท",
      draftLabel: "ข้อความสอบถามที่พร้อมคัดลอก",
      noScript: "แบบฟอร์มสอบถามต้องใช้ JavaScript ซึ่งปิดอยู่ในเบราว์เซอร์นี้ กรุณาโทรหารีสอร์ทหรือติดต่อทาง Facebook แทน",
      sending: "กำลังส่ง",
      failedPlain: "ยังส่งข้อความไม่สำเร็จ ข้อความที่กรอกไว้ยังอยู่ครบ กรุณาลองส่งอีกครั้ง",
      tooManyPlain: "ส่งหลายครั้งในเวลาสั้นๆ กรุณารอสักครู่แล้วลองอีกครั้ง",
      draft: {
        title: "ข้อความสอบถามถึงภูคำหอม รีสอร์ท เขาใหญ่",
        about: "เรื่อง {value}",
        name: "ชื่อ {value}",
        reply: "กรุณาติดต่อกลับทาง{channel} {value}",
        arrival: "วันเช็กอิน {value}",
        departure: "วันเช็กเอาต์ {value}",
        room: "ประเภทห้องพัก {value}",
        guests: "จำนวนผู้เข้าพัก {value}",
        message: "ข้อความ",
      },
    },
  },
} satisfies L<ContactPageCopy>;
