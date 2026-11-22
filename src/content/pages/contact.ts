import type { AssetId, L } from "@/content/schema";

/**
 * The Contact page (brief section 17; audit of 8 October 2026, finding C): the wording around the
 * contact facts and the enquiry composer.
 *
 * The facts are not here: the phone numbers, the LINE account, the Facebook page and the map listing come from
 * src/content/site.ts through pub(). Shared words (field labels, validation messages, Copy enquiry,
 * Prepare an enquiry) are read from src/i18n/ui.ts by the page and handed to the form.
 *
 * WHAT THE COMPOSER DOES. While the `enquiryDelivery` flag is off (no receiving service is configured)
 * nothing is sent. The page is a two-step task and says so beside the button:
 *   1  write the message and copy it;
 *   2  open the resort's LINE account (or its Facebook page) and paste it into a chat there.
 * Every link that leads here says "Prepare an enquiry", never "Send"; the button says "Copy enquiry";
 * the success state says the message was COPIED and what to do next. Only the message is required: a
 * name and a reply contact help the resort but must not block a guest who will send through LINE or Facebook.
 * With the flag on, the same form posts to /api/enquiry and shows "sent" only when the server has
 * accepted the message; the labels then say "Send".
 *
 * Kept (BUILD-CONTRACT sections 2 and 8, updated by the resort's message of 22 Nov 2026): the main phone
 * number and a second one, no email address, the LINE Official account the resort supplied, the verified
 * Facebook page and no guessed Messenger or WhatsApp address; no reply time is promised; an enquiry is not a
 * reservation; the form never asks for medical details. Glossary sentence used word for word:
 * phrases.enquiryNotReservation. Third person. No middle dots and no dashes.
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
    /** `{phone}` is the main number. */
    phone: string;
    /** `{id}` is the LINE account id, with its @. */
    line: string;
    facebook: string;
    draft: string;
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
    /** The two steps of the copy flow, shown above the fields. */
    steps: { label: string; one: string; two: string };
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
    /** Beside the button: what pressing it does. */
    draftNote: string;
    deliveryNote: string;
    privacyLead: string;
    privacyLink: string;
    /** The status shown after a successful copy, and its next action. */
    copiedHeading: string;
    copiedBody: string;
    openLine: string;
    openFacebook: string;
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
    statement: "Call, chat on LINE, or put your question in a few lines.",
    accent: "question",
    body: {
      always: "The quickest way to reach the resort is by phone. The team can also be reached on LINE and through the resort’s Facebook page.",
      draft: "Further down you can prepare an enquiry: write it here, copy it, then paste it into a chat with the resort on LINE or Facebook. Nothing is sent from this page.",
      delivery: "Further down you can send an enquiry to the resort, and the team replies by the channel you choose.",
    },
    glance: {
      phone: "The resort’s main number is {phone}.",
      line: "The resort’s LINE Official account is {id}.",
      facebook: "The resort can also be reached through its Facebook page.",
      draft: "The enquiry page prepares a message for you to copy. It does not send it.",
      notReservation: "An enquiry is a message to the resort, not a confirmed reservation.",
      rates: "Rates and rooms for your dates are shown on the booking page.",
    },
    talk: {
      kicker: "Talk to the resort",
      title: "Talk",
      intro: "The address, the phone numbers, LINE, and the time at the resort right now.",
    },
    enquiry: {
      kicker: "Prepare an enquiry",
      title: "Write",
      intro: {
        draft: "Two steps: write and copy your message here, then send it to the resort yourself.",
        delivery: "Fill in what applies and send it. The team replies by the channel you choose.",
      },
    },
    form: {
      heading: "Write your enquiry",
      steps: {
        label: "How it works",
        one: "Write your message and press Copy enquiry.",
        two: "Open the resort’s LINE account or Facebook page and paste it into a chat.",
      },
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
      draftNote: "Copy your message, then paste it into a chat with the resort on LINE or Facebook. Nothing is sent from this page.",
      deliveryNote: "An enquiry is a message to the resort, not a confirmed reservation.",
      privacyLead: "How this page handles what you type:",
      privacyLink: "privacy policy",
      copiedHeading: "Message copied",
      copiedBody: "Open LINE or Facebook and paste it into your chat with the resort.",
      openLine: "Open the resort’s LINE",
      openFacebook: "Open the resort’s Facebook page",
      manualHeading: "Copy your message",
      manualBody: "Your browser did not allow copying. The message is below: select it, copy it, then paste it into a chat with the resort on LINE or Facebook.",
      draftLabel: "Your enquiry, ready to copy",
      noScript: "The enquiry page needs JavaScript, which is switched off in this browser. Please call the resort, or write on LINE or Facebook instead.",
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
    statement: "จะโทร แชตทาง LINE หรือเขียนคำถามสั้นๆ ก็ได้",
    accent: "",
    body: {
      always: "ช่องทางที่ติดต่อรีสอร์ทได้เร็วที่สุดคือโทรศัพท์ และยังติดต่อทีมงานทาง LINE หรือหน้า Facebook ของรีสอร์ทได้ด้วย",
      draft: "ด้านล่างมีส่วนสำหรับเตรียมข้อความสอบถาม เขียนข้อความที่นี่ คัดลอก แล้วนำไปวางในแชตกับรีสอร์ททาง LINE หรือ Facebook หน้านี้ไม่ได้ส่งข้อความใดๆ",
      delivery: "ด้านล่างมีแบบฟอร์มสำหรับส่งข้อความสอบถามถึงรีสอร์ท และทีมงานจะติดต่อกลับตามช่องทางที่เลือกไว้",
    },
    glance: {
      phone: "เบอร์หลักของรีสอร์ทคือ {phone}",
      line: "LINE Official ของรีสอร์ทคือ {id}",
      facebook: "ติดต่อรีสอร์ทผ่านหน้า Facebook ของรีสอร์ทได้อีกช่องทางหนึ่ง",
      draft: "หน้าสอบถามจะเตรียมข้อความไว้ให้คัดลอก ไม่ได้ส่งข้อความให้",
      notReservation: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
      rates: "ราคาและห้องพักของช่วงวันที่ต้องการ ดูได้ในหน้าจอง",
    },
    talk: {
      kicker: "ติดต่อรีสอร์ท",
      title: "ติดต่อ",
      intro: "ที่อยู่ เบอร์โทรศัพท์ LINE และเวลาที่รีสอร์ทในขณะนี้",
    },
    enquiry: {
      kicker: "เตรียมข้อความสอบถาม",
      title: "สอบถาม",
      intro: {
        draft: "มีสองขั้นตอน เขียนและคัดลอกข้อความที่นี่ แล้วนำไปส่งถึงรีสอร์ทด้วยตัวเอง",
        delivery: "กรอกเฉพาะส่วนที่เกี่ยวข้องแล้วกดส่ง ทีมงานจะติดต่อกลับตามช่องทางที่เลือกไว้",
      },
    },
    form: {
      heading: "เขียนข้อความสอบถาม",
      steps: {
        label: "ขั้นตอน",
        one: "เขียนข้อความ แล้วกดคัดลอกข้อความสอบถาม",
        two: "เปิด LINE หรือหน้า Facebook ของรีสอร์ท แล้ววางข้อความลงในแชต",
      },
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
      draftNote: "คัดลอกข้อความ แล้วนำไปวางในแชตกับรีสอร์ททาง LINE หรือ Facebook หน้านี้ไม่ได้ส่งข้อความใดๆ",
      deliveryNote: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
      privacyLead: "หน้านี้ดูแลข้อมูลที่พิมพ์อย่างไร อ่านได้ที่",
      privacyLink: "นโยบายความเป็นส่วนตัว",
      copiedHeading: "คัดลอกข้อความแล้ว",
      copiedBody: "เปิด LINE หรือ Facebook แล้ววางข้อความลงในแชตกับรีสอร์ท",
      openLine: "เปิด LINE ของรีสอร์ท",
      openFacebook: "เปิดหน้า Facebook ของรีสอร์ท",
      manualHeading: "คัดลอกข้อความ",
      manualBody: "เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ ข้อความอยู่ด้านล่าง เลือกข้อความ คัดลอก แล้วนำไปวางในแชตกับรีสอร์ททาง LINE หรือ Facebook",
      draftLabel: "ข้อความสอบถามที่พร้อมคัดลอก",
      noScript: "หน้าสอบถามต้องใช้ JavaScript ซึ่งปิดอยู่ในเบราว์เซอร์นี้ กรุณาโทรหารีสอร์ท หรือติดต่อทาง LINE หรือ Facebook แทน",
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
