import type { L } from "@/content/schema";

/**
 * The Privacy policy and the Website terms (brief sections 18 and 24; audit of 8 October 2026, finding B).
 *
 * WHO OPERATES THE SITE decides half of what these pages say, so every statement about identity,
 * responsibility and contact exists twice and the page prints the one that is true:
 *
 *   preview   an unofficial concept preview made and published by O2 Design Studio. The resort has not
 *             reviewed or approved it, does not operate it and receives nothing from it. This is the
 *             state of every deployment today.
 *   official  the resort's own website on its own domain (SITE_ENV=production). Not written for anyone
 *             to read yet: it needs the owner's and a lawyer's review before that switch is made.
 *
 * WHAT THE SITE DOES was read from the code and the built output, not assumed:
 *   - one first-party cookie, `pkh_lang`, written only when a visitor picks a language (LangSwitch.tsx);
 *   - a measurement choice in local storage under `pkh_consent`, only if measurement is configured;
 *   - no analytics unless the `analytics` flag is on AND a measurement id is set, and then only after
 *     the visitor agrees;
 *   - an enquiry composer that sends nothing while `enquiryDelivery` is off: it builds a message in the
 *     browser and copies it; with the flag on it posts the listed fields to the configured endpoint;
 *   - bookings on the booking partner's own page; this site passes only dates and a number of adults;
 *   - outbound links to the booking page, Google Maps, LINE, Facebook, the studio and other places' own pages;
 *     no embedded map, video, font or widget from another host (checked in the built pages);
 *   - typefaces and photographs served from the site itself.
 * The host is named only when the build knows it (the static export is made for GitHub Pages). No page
 * says "no data is collected": a host always receives the request it serves.
 *
 * A block marked `when` is printed only when every condition it names holds, so the page can never
 * describe a feature that is switched off or an operator that is not the operator.
 *
 * NOT STATED, because nothing publishable backs it (listed for the owner in docs/HANDOFF.md): the
 * resort's legal entity, a data-protection officer, a legal basis, a retention period, a governing-law
 * clause, any hotel policy, and any permission to use the photographs. Third person. No dots or dashes.
 */

export type LegalCondition = "preview" | "official" | "analytics-on" | "analytics-off" | "delivery-on" | "delivery-off" | "host-github-pages" | "host-unspecified";

export interface LegalBlock {
  /** Printed only when all of these hold; always when omitted. */
  when?: LegalCondition[];
  text?: string;
  /** A short list, printed after `text` when both are given. */
  list?: string[];
}

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalCopy {
  kicker: string;
  intro: { preview: string; official: string };
  glance: Array<{ when?: LegalCondition[]; text: string }>;
  contents: string;
  sections: LegalSection[];
  contact: {
    id: string;
    heading: string;
    /** Preview: questions about the preview go to the studio; the resort is reached through its own channels. */
    preview: { text: string; studioLink: string; resort: string; resortLink: string };
    /** Official: `{address}` and `{phone}` are filled from site settings. */
    official: { text: string; address: string; phone: string; link: string };
  };
}

export const privacy = {
  en: {
    kicker: "Privacy",
    intro: {
      preview: "This page says, in plain words, what this preview website does with information about the people who visit it. It describes the website as it works today.",
      official: "This page says, in plain words, what this website does with information about the people who use it. It describes the website as it works today.",
    },
    glance: [
      { when: ["preview"], text: "This is a concept preview by O2 Design Studio. It is not operated by Phukumhom Resort." },
      { when: ["analytics-off"], text: "The website does not use analytics or tracking." },
      { when: ["analytics-on"], text: "Visits are measured only after you agree, and you can change your mind at any time." },
      { when: ["delivery-off"], text: "The enquiry page sends nothing: it prepares a message for you to copy and send yourself." },
      { when: ["delivery-on"], text: "The enquiry form sends what you type to the resort, so the team can reply." },
      { text: "Bookings and payments are made on the booking partner’s page, not on this website." },
      { text: "One small cookie remembers the language you choose." },
    ],
    contents: "On this page",
    sections: [
      {
        id: "who",
        heading: "Who is behind this website",
        blocks: [
          {
            when: ["preview"],
            text: "This website is a concept preview made and published by O2 Design Studio to show a design proposal. It is not the official website of Phukumhom Resort Khao Yai.",
          },
          {
            when: ["preview"],
            text: "The resort has not reviewed or approved the preview, does not operate it and receives nothing from it. Its real contact details and booking page are linked here so that the preview works as a real website would.",
          },
          {
            when: ["official"],
            text: "This is the website of Phukumhom Resort Khao Yai. The resort is responsible for the information handled through it. The contact details are at the foot of this page.",
          },
        ],
      },
      {
        id: "browsing",
        heading: "When you read the website",
        blocks: [
          { text: "You can read every page without giving your name or any contact detail." },
          {
            when: ["host-github-pages"],
            text: "The preview is hosted on GitHub Pages. Like any web host, GitHub receives the technical details of each request, such as the address of your device and the page you asked for, in order to send it to you. GitHub handles that information under its own privacy statement. The studio has no access to it.",
          },
          {
            when: ["host-unspecified"],
            text: "As with any website, the server that delivers these pages receives the address of your device and the page you asked for, in order to send it to you.",
          },
          { text: "The typefaces and photographs are served from this website itself. No page loads a map, a video or a social media widget from another company." },
        ],
      },
      {
        id: "storage",
        heading: "What is kept in your browser",
        blocks: [
          {
            text: "One thing, and only if you ask for it: a cookie named pkh_lang, written when you choose a language. It holds the letters th or en, lasts up to a year, and is used to open the website in that language next time. It does not identify you.",
          },
          { when: ["analytics-on"], text: "Your choice about measurement is kept under the name pkh_consent, together with the date you made it, and is asked again after twelve months." },
          { text: "You can delete it at any time from your browser’s settings. The website keeps working without it." },
        ],
      },
      {
        id: "measurement",
        heading: "Measurement",
        blocks: [
          { when: ["analytics-off"], text: "The website uses no analytics, advertising tags or tracking pixels. If measurement is ever switched on, the website will ask first and load nothing until you agree, and this page will be updated." },
          { when: ["analytics-on"], text: "With your agreement, the website uses Google Analytics to count visits and to see which pages are useful. Nothing is loaded and nothing is counted until you agree. If you decline, or say nothing, the website works in exactly the same way." },
          { when: ["analytics-on"], text: "What is recorded: the pages viewed, and a small set of actions such as opening the booking page or pressing a phone link. Dates you choose, messages you write and contact details are never sent to the measurement service." },
          { when: ["analytics-on"], text: "You can change your choice at any time with the cookie settings link at the foot of every page." },
        ],
      },
      {
        id: "enquiries",
        heading: "Enquiries",
        blocks: [
          {
            when: ["delivery-off"],
            text: "The enquiry page works entirely in your browser. It turns what you type into a message and, when you press Copy enquiry, puts that message on your device’s clipboard. Nothing is sent, stored or seen by this website, by the studio or by the resort.",
          },
          {
            when: ["delivery-off"],
            text: "The message reaches the resort only if you send it yourself, for example by pasting it into a chat with the resort on LINE or Facebook. A draft on your clipboard is not an enquiry the resort has received.",
          },
          {
            when: ["delivery-on"],
            text: "When you send the enquiry form, the website passes these details to the resort so the team can reply:",
            list: ["what the enquiry is about", "your name", "the phone number or email address you gave for the reply", "dates, room type and number of guests, if you filled them in", "your message"],
          },
          { when: ["delivery-on"], text: "They are used to answer your enquiry and for nothing else. The form does not ask for medical details, and there is no need to give any." },
          { text: "If you call the resort or write to it on LINE or Facebook, what you share is handled by the resort directly, and the policy of LINE or Facebook applies to messages sent there." },
        ],
      },
      {
        id: "booking",
        heading: "Bookings",
        blocks: [
          { text: "Rooms are booked on the page of the resort’s booking partner, which is a separate website. When you use the stay planner here, this website passes only your dates and the number of adults in the link that takes you there." },
          { text: "Your name, contact details and payment details are entered on the booking partner’s page and are handled under that page’s own terms and privacy policy. This website never receives them and never handles card details." },
        ],
      },
      {
        id: "links",
        heading: "Links to other websites",
        blocks: [
          { text: "This website links to the booking page, to the resort’s listing on Google Maps, to its LINE account and Facebook page and to the websites of places to visit. Those websites have their own policies, which apply once you follow a link." },
        ],
      },
      {
        id: "choices",
        heading: "Your choices",
        blocks: [
          { when: ["preview"], text: "O2 Design Studio keeps no personal information from this preview, so there is nothing for the studio to look up, correct or delete." },
          { when: ["preview"], text: "If you have booked with the resort or sent it a message, questions about that information go to the resort, through its own channels." },
          { when: ["official"], text: "To ask what personal information the resort holds about you from a booking or an enquiry, or to ask for it to be corrected or deleted, contact the resort using the details below." },
          { text: "When this policy changes, the date at the top of the page changes with it." },
        ],
      },
    ],
    contact: {
      id: "contact",
      heading: "Contact",
      preview: {
        text: "Questions about this preview go to O2 Design Studio, through the studio’s website.",
        studioLink: "O2 Design Studio",
        resort: "To reach the resort itself, use the phone numbers, LINE or the Facebook page on the contact page.",
        resortLink: "Contact the resort",
      },
      official: {
        text: "Questions about this policy, or about your own information, go to the resort:",
        address: "Phukumhom Resort Khao Yai, {address}",
        phone: "Phone {phone}",
        link: "Contact the resort",
      },
    },
  },
  th: {
    kicker: "ความเป็นส่วนตัว",
    intro: {
      preview: "หน้านี้อธิบายด้วยภาษาเรียบง่ายว่าเว็บไซต์ตัวอย่างนี้ทำอะไรกับข้อมูลของผู้เข้าชมบ้าง โดยอธิบายตามการทำงานจริงของเว็บไซต์ในปัจจุบัน",
      official: "หน้านี้อธิบายด้วยภาษาเรียบง่ายว่าเว็บไซต์นี้ทำอะไรกับข้อมูลของผู้ใช้งานบ้าง โดยอธิบายตามการทำงานจริงของเว็บไซต์ในปัจจุบัน",
    },
    glance: [
      { when: ["preview"], text: "เว็บไซต์นี้เป็นเว็บไซต์ตัวอย่างโดย O2 Design Studio ไม่ได้ดำเนินการโดยภูคำหอม รีสอร์ท" },
      { when: ["analytics-off"], text: "เว็บไซต์นี้ไม่ได้ใช้ระบบเก็บสถิติหรือการติดตามใดๆ" },
      { when: ["analytics-on"], text: "เว็บไซต์จะเก็บสถิติการเข้าชมก็ต่อเมื่อคุณยินยอม และเปลี่ยนใจได้ทุกเมื่อ" },
      { when: ["delivery-off"], text: "หน้าสอบถามไม่ได้ส่งข้อความใดๆ แต่จะเตรียมข้อความไว้ให้คุณคัดลอกไปส่งเอง" },
      { when: ["delivery-on"], text: "แบบฟอร์มสอบถามจะส่งข้อมูลที่กรอกไปยังรีสอร์ท เพื่อให้ทีมงานติดต่อกลับได้" },
      { text: "การจองและการชำระเงินทำในหน้าของผู้ให้บริการระบบจอง ไม่ได้ทำบนเว็บไซต์นี้" },
      { text: "มีคุกกี้ขนาดเล็กหนึ่งรายการ ไว้จำภาษาที่คุณเลือก" },
    ],
    contents: "ในหน้านี้",
    sections: [
      {
        id: "who",
        heading: "ใครเป็นผู้จัดทำเว็บไซต์นี้",
        blocks: [
          { when: ["preview"], text: "เว็บไซต์นี้เป็นเว็บไซต์ตัวอย่างที่ O2 Design Studio จัดทำและเผยแพร่เพื่อนำเสนอแนวทางการออกแบบ ยังไม่ใช่เว็บไซต์ทางการของภูคำหอม รีสอร์ท เขาใหญ่" },
          { when: ["preview"], text: "รีสอร์ทยังไม่ได้ตรวจสอบหรืออนุมัติเว็บไซต์ตัวอย่างนี้ ไม่ได้เป็นผู้ดำเนินการ และไม่ได้รับข้อมูลใดจากเว็บไซต์นี้ ช่องทางติดต่อจริงและหน้าจองจริงของรีสอร์ทถูกใส่ไว้ เพื่อให้เว็บไซต์ตัวอย่างทำงานได้เหมือนเว็บไซต์จริง" },
          { when: ["official"], text: "เว็บไซต์นี้เป็นของภูคำหอม รีสอร์ท เขาใหญ่ รีสอร์ทเป็นผู้รับผิดชอบข้อมูลที่ผ่านเว็บไซต์นี้ ช่องทางติดต่ออยู่ท้ายหน้านี้" },
        ],
      },
      {
        id: "browsing",
        heading: "เมื่อคุณเข้าชมเว็บไซต์",
        blocks: [
          { text: "คุณอ่านได้ทุกหน้าโดยไม่ต้องให้ชื่อหรือข้อมูลติดต่อใดๆ" },
          {
            when: ["host-github-pages"],
            text: "เว็บไซต์ตัวอย่างนี้ให้บริการผ่าน GitHub Pages เช่นเดียวกับผู้ให้บริการเว็บไซต์ทั่วไป GitHub จะได้รับข้อมูลทางเทคนิคของแต่ละคำขอ เช่น ที่อยู่ของอุปกรณ์และหน้าที่คุณเรียกดู เพื่อส่งหน้านั้นกลับไปให้คุณ GitHub ดูแลข้อมูลดังกล่าวตามนโยบายความเป็นส่วนตัวของ GitHub เอง ทางสตูดิโอเข้าถึงข้อมูลนี้ไม่ได้",
          },
          { when: ["host-unspecified"], text: "เช่นเดียวกับเว็บไซต์ทั่วไป เซิร์ฟเวอร์ที่ส่งหน้าเว็บจะได้รับที่อยู่ของอุปกรณ์และหน้าที่คุณเรียกดู เพื่อส่งหน้านั้นกลับไปให้คุณ" },
          { text: "ตัวอักษรและภาพถ่ายให้บริการจากเว็บไซต์นี้เอง ไม่มีหน้าใดโหลดแผนที่ วิดีโอ หรือส่วนเสริมโซเชียลมีเดียจากบริษัทอื่น" },
        ],
      },
      {
        id: "storage",
        heading: "สิ่งที่เก็บไว้ในเบราว์เซอร์ของคุณ",
        blocks: [
          { text: "มีเพียงอย่างเดียว และจะเก็บก็ต่อเมื่อคุณเลือกเอง คือคุกกี้ชื่อ pkh_lang ซึ่งถูกบันทึกเมื่อคุณเลือกภาษา คุกกี้นี้เก็บเพียงตัวอักษร th หรือ en มีอายุไม่เกินหนึ่งปี ใช้เปิดเว็บไซต์เป็นภาษานั้นในครั้งถัดไป และไม่ได้ระบุตัวคุณ" },
          { when: ["analytics-on"], text: "การตัดสินใจเรื่องการเก็บสถิติจะถูกเก็บไว้ในชื่อ pkh_consent พร้อมวันที่ที่คุณเลือก และจะถามใหม่เมื่อครบสิบสองเดือน" },
          { text: "คุณลบได้ทุกเมื่อจากการตั้งค่าของเบราว์เซอร์ และเว็บไซต์ยังใช้งานได้ตามปกติ" },
        ],
      },
      {
        id: "measurement",
        heading: "การเก็บสถิติ",
        blocks: [
          { when: ["analytics-off"], text: "เว็บไซต์นี้ไม่ได้ใช้ระบบวิเคราะห์สถิติ แท็กโฆษณา หรือพิกเซลติดตาม หากมีการเปิดใช้การเก็บสถิติในอนาคต เว็บไซต์จะถามก่อนและจะไม่โหลดสิ่งใดจนกว่าคุณจะยินยอม พร้อมทั้งปรับปรุงหน้านี้" },
          { when: ["analytics-on"], text: "เมื่อคุณยินยอม เว็บไซต์จะใช้ Google Analytics เพื่อนับจำนวนการเข้าชมและดูว่าหน้าใดเป็นประโยชน์ เว็บไซต์จะไม่โหลดและไม่นับสิ่งใดจนกว่าคุณจะยินยอม หากคุณปฏิเสธหรือไม่เลือก เว็บไซต์ยังใช้งานได้เหมือนเดิมทุกประการ" },
          { when: ["analytics-on"], text: "สิ่งที่บันทึก ได้แก่ หน้าที่เข้าชม และการกระทำบางอย่าง เช่น การเปิดหน้าจองหรือการกดลิงก์โทรศัพท์ ส่วนวันที่ที่เลือก ข้อความที่เขียน และข้อมูลติดต่อ จะไม่ถูกส่งไปยังบริการเก็บสถิติ" },
          { when: ["analytics-on"], text: "คุณเปลี่ยนการตัดสินใจได้ทุกเมื่อจากลิงก์ตั้งค่าคุกกี้ที่ท้ายทุกหน้า" },
        ],
      },
      {
        id: "enquiries",
        heading: "ข้อความสอบถาม",
        blocks: [
          { when: ["delivery-off"], text: "หน้าสอบถามทำงานในเบราว์เซอร์ของคุณทั้งหมด หน้านี้จะเรียบเรียงสิ่งที่คุณพิมพ์เป็นข้อความ และเมื่อกดคัดลอกข้อความสอบถาม ข้อความนั้นจะถูกคัดลอกไว้ในอุปกรณ์ของคุณ เว็บไซต์นี้ ทางสตูดิโอ และรีสอร์ท ไม่ได้ส่ง ไม่ได้เก็บ และไม่เห็นข้อความดังกล่าว" },
          { when: ["delivery-off"], text: "ข้อความจะถึงรีสอร์ทก็ต่อเมื่อคุณส่งเอง เช่น นำไปวางในแชตกับรีสอร์ททาง LINE หรือ Facebook ข้อความที่คัดลอกไว้ยังไม่ใช่ข้อความสอบถามที่รีสอร์ทได้รับ" },
          {
            when: ["delivery-on"],
            text: "เมื่อคุณส่งแบบฟอร์มสอบถาม เว็บไซต์จะส่งข้อมูลต่อไปนี้ถึงรีสอร์ท เพื่อให้ทีมงานติดต่อกลับได้",
            list: ["เรื่องที่สอบถาม", "ชื่อของคุณ", "หมายเลขโทรศัพท์หรืออีเมลที่ให้ไว้สำหรับติดต่อกลับ", "วันที่ ประเภทห้องพัก และจำนวนผู้เข้าพัก หากกรอกไว้", "ข้อความของคุณ"],
          },
          { when: ["delivery-on"], text: "ข้อมูลเหล่านี้ใช้เพื่อตอบคำถามของคุณเท่านั้น แบบฟอร์มไม่ได้ขอข้อมูลทางการแพทย์ และไม่จำเป็นต้องให้" },
          { text: "หากคุณโทรหารีสอร์ทหรือส่งข้อความทาง LINE หรือ Facebook รีสอร์ทจะเป็นผู้ดูแลข้อมูลที่คุณให้โดยตรง และข้อความที่ส่งทางช่องทางเหล่านั้นอยู่ภายใต้นโยบายของ LINE หรือ Facebook" },
        ],
      },
      {
        id: "booking",
        heading: "การจองห้องพัก",
        blocks: [
          { text: "การจองห้องพักทำในหน้าของผู้ให้บริการระบบจองของรีสอร์ท ซึ่งเป็นเว็บไซต์แยกต่างหาก เมื่อคุณใช้ตัวช่วยวางแผนการเข้าพักบนเว็บไซต์นี้ เว็บไซต์จะส่งเพียงวันที่และจำนวนผู้ใหญ่ไปกับลิงก์ที่พาคุณไปยังหน้านั้น" },
          { text: "ชื่อ ข้อมูลติดต่อ และข้อมูลการชำระเงิน กรอกในหน้าของผู้ให้บริการระบบจอง และอยู่ภายใต้ข้อกำหนดและนโยบายความเป็นส่วนตัวของหน้านั้น เว็บไซต์นี้ไม่ได้รับข้อมูลดังกล่าว และไม่ได้จัดการข้อมูลบัตรใดๆ" },
        ],
      },
      {
        id: "links",
        heading: "ลิงก์ไปยังเว็บไซต์อื่น",
        blocks: [{ text: "เว็บไซต์นี้มีลิงก์ไปยังหน้าจอง หน้าของรีสอร์ทบน Google Maps บัญชี LINE และหน้า Facebook ของรีสอร์ท และเว็บไซต์ของสถานที่น่าแวะ เว็บไซต์เหล่านั้นมีนโยบายของตัวเอง ซึ่งมีผลเมื่อคุณกดลิงก์ไปแล้ว" }],
      },
      {
        id: "choices",
        heading: "สิทธิ์และทางเลือกของคุณ",
        blocks: [
          { when: ["preview"], text: "O2 Design Studio ไม่ได้เก็บข้อมูลส่วนบุคคลใดจากเว็บไซต์ตัวอย่างนี้ จึงไม่มีข้อมูลให้ทางสตูดิโอค้นหา แก้ไข หรือลบ" },
          { when: ["preview"], text: "หากคุณเคยจองห้องพักหรือส่งข้อความถึงรีสอร์ท คำถามเกี่ยวกับข้อมูลนั้นให้ติดต่อรีสอร์ทผ่านช่องทางของรีสอร์ทเอง" },
          { when: ["official"], text: "หากต้องการทราบว่ารีสอร์ทมีข้อมูลส่วนบุคคลใดของคุณจากการจองหรือการสอบถาม หรือต้องการให้แก้ไขหรือลบข้อมูลนั้น ติดต่อรีสอร์ทได้ตามช่องทางด้านล่าง" },
          { text: "เมื่อมีการแก้ไขนโยบายนี้ วันที่ด้านบนของหน้าจะเปลี่ยนตาม" },
        ],
      },
    ],
    contact: {
      id: "contact",
      heading: "ติดต่อ",
      preview: {
        text: "หากมีคำถามเกี่ยวกับเว็บไซต์ตัวอย่างนี้ ติดต่อ O2 Design Studio ได้ทางเว็บไซต์ของสตูดิโอ",
        studioLink: "O2 Design Studio",
        resort: "หากต้องการติดต่อรีสอร์ทโดยตรง ใช้เบอร์โทรศัพท์ LINE หรือหน้า Facebook ในหน้าติดต่อรีสอร์ท",
        resortLink: "ติดต่อรีสอร์ท",
      },
      official: {
        text: "หากมีคำถามเกี่ยวกับนโยบายนี้หรือข้อมูลของคุณ ติดต่อรีสอร์ทได้ที่",
        address: "ภูคำหอม รีสอร์ท เขาใหญ่ {address}",
        phone: "โทร {phone}",
        link: "ติดต่อรีสอร์ท",
      },
    },
  },
} satisfies L<LegalCopy>;

export const terms = {
  en: {
    kicker: "Terms",
    intro: {
      preview: "These terms explain what this preview is, what it does not do, and where the terms of a real booking are set.",
      official: "These terms explain what this website is for, what it does not do, and where the terms of a booking are set.",
    },
    glance: [
      { when: ["preview"], text: "This is a concept preview by O2 Design Studio, not the resort’s official website." },
      { when: ["official"], text: "This website gives information about the resort. It does not take bookings or payments itself." },
      { text: "Rates, availability and the terms of each rate are shown on the booking partner’s page before you confirm." },
      { text: "An enquiry is a message to the resort, not a confirmed reservation." },
      { when: ["preview"], text: "Before you rely on a detail, check it with the resort or on the booking page." },
      { when: ["official"], text: "Photographs show the resort as photographed. If a detail matters, ask the resort before you book." },
    ],
    contents: "On this page",
    sections: [
      {
        id: "about",
        heading: "About this website",
        blocks: [
          {
            when: ["preview"],
            text: "This website is a concept preview made and published by O2 Design Studio. It shows how a website for Phukumhom Resort Khao Yai could look and work. It is not the resort’s official website, and the resort has not reviewed or approved it.",
          },
          { when: ["preview"], text: "Using it is free and needs no account. The booking links lead to the resort’s real booking page, and the phone numbers, LINE account and Facebook page are the resort’s own." },
          { when: ["official"], text: "This website gives information about Phukumhom Resort Khao Yai: its rooms, restaurant, grounds and location. Using it is free and needs no account." },
          { when: ["official"], text: "By using the website you accept these terms. If you do not accept them, please do not use it." },
        ],
      },
      {
        id: "information",
        heading: "The information here",
        blocks: [
          {
            when: ["preview"],
            text: "The information was gathered from the resort’s own public channels and its booking page, and each page shows the date it was last checked. The resort has not confirmed it, so treat it as a careful summary and not as the resort’s own statement.",
          },
          { when: ["official"], text: "The resort takes care to keep this website accurate, and each content page shows the date it was last updated." },
          { text: "Details can change. For anything your plans depend on, your booking confirmation or the resort’s own answer is the reference, not this website." },
          { text: "The photographs show the resort as it was photographed. They are not a promise about the furnishing, view or condition of a particular room on a particular date." },
        ],
      },
      {
        id: "booking",
        heading: "Bookings and rates",
        blocks: [
          { text: "This website does not show prices or availability, and it does not take bookings or payments. Its booking links lead to the page of the resort’s booking partner, a separate website." },
          { text: "The rooms available, the rates, what a rate includes, taxes and fees, and the payment, deposit and cancellation terms of that rate are shown on the booking page before you confirm. Those terms, and your booking confirmation, are what govern a booking." },
          { text: "The stay planner on this website only carries your dates and number of adults to the booking page. It does not hold a room for you." },
        ],
      },
      {
        id: "enquiries",
        heading: "Enquiries",
        blocks: [
          { when: ["delivery-off"], text: "The enquiry page prepares a message for you to copy. It does not send it. The resort receives nothing until you send the message yourself." },
          { text: "An enquiry is a message to the resort, not a confirmed reservation. A request made in an enquiry is confirmed only when the resort confirms it to you." },
        ],
      },
      {
        id: "links",
        heading: "Links to other websites",
        blocks: [
          { text: "This website links to the booking partner’s page, to Google Maps, to LINE, to Facebook and to the websites of places to visit. Those websites are run by others and have their own terms. Check opening times and details with each place before you set out." },
        ],
      },
      {
        id: "content",
        heading: "Photographs and text",
        blocks: [
          {
            when: ["preview"],
            text: "The photographs were published by the resort on its own website and remain the property of their owners. They are shown here to evaluate a design and for no other purpose. The words and the design of this preview are the work of O2 Design Studio.",
          },
          { when: ["preview"], text: "Please do not copy or reuse the photographs, the words or the design." },
          { when: ["official"], text: "The photographs and text on this website may not be copied or reused without the resort’s permission." },
        ],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        blocks: [{ text: "When these terms change, the date at the top of the page changes with them." }],
      },
    ],
    contact: {
      id: "contact",
      heading: "Contact",
      preview: {
        text: "Questions about this preview go to O2 Design Studio, through the studio’s website.",
        studioLink: "O2 Design Studio",
        resort: "To reach the resort itself, use the phone numbers, LINE or the Facebook page on the contact page.",
        resortLink: "Contact the resort",
      },
      official: {
        text: "Questions about these terms go to the resort:",
        address: "Phukumhom Resort Khao Yai, {address}",
        phone: "Phone {phone}",
        link: "Contact the resort",
      },
    },
  },
  th: {
    kicker: "ข้อกำหนด",
    intro: {
      preview: "ข้อกำหนดนี้อธิบายว่าเว็บไซต์ตัวอย่างนี้คืออะไร ไม่ได้ทำอะไร และเงื่อนไขของการจองจริงกำหนดไว้ที่ใด",
      official: "ข้อกำหนดนี้อธิบายว่าเว็บไซต์นี้มีไว้เพื่ออะไร ไม่ได้ทำอะไร และเงื่อนไขของการจองกำหนดไว้ที่ใด",
    },
    glance: [
      { when: ["preview"], text: "เว็บไซต์นี้เป็นเว็บไซต์ตัวอย่างโดย O2 Design Studio ยังไม่ใช่เว็บไซต์ทางการของรีสอร์ท" },
      { when: ["official"], text: "เว็บไซต์นี้ให้ข้อมูลเกี่ยวกับรีสอร์ท ไม่ได้รับจองหรือรับชำระเงินเอง" },
      { text: "ราคา ห้องว่าง และเงื่อนไขของแต่ละราคา แสดงในหน้าของผู้ให้บริการระบบจองก่อนที่คุณจะยืนยัน" },
      { text: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง" },
      { when: ["preview"], text: "ก่อนตัดสินใจจากรายละเอียดใด ควรตรวจสอบกับรีสอร์ทหรือในหน้าจองอีกครั้ง" },
      { when: ["official"], text: "ภาพถ่ายแสดงรีสอร์ทตามที่ถ่ายไว้ หากรายละเอียดใดมีผลต่อการตัดสินใจ สอบถามรีสอร์ทก่อนจอง" },
    ],
    contents: "ในหน้านี้",
    sections: [
      {
        id: "about",
        heading: "เกี่ยวกับเว็บไซต์นี้",
        blocks: [
          { when: ["preview"], text: "เว็บไซต์นี้เป็นเว็บไซต์ตัวอย่างที่ O2 Design Studio จัดทำและเผยแพร่ เพื่อแสดงว่าเว็บไซต์ของภูคำหอม รีสอร์ท เขาใหญ่ จะมีหน้าตาและการใช้งานอย่างไรได้บ้าง ยังไม่ใช่เว็บไซต์ทางการของรีสอร์ท และรีสอร์ทยังไม่ได้ตรวจสอบหรืออนุมัติ" },
          { when: ["preview"], text: "การใช้งานไม่มีค่าใช้จ่ายและไม่ต้องสมัครสมาชิก ลิงก์จองจะพาไปยังหน้าจองจริงของรีสอร์ท ส่วนเบอร์โทรศัพท์ บัญชี LINE และหน้า Facebook เป็นของรีสอร์ทเอง" },
          { when: ["official"], text: "เว็บไซต์นี้ให้ข้อมูลเกี่ยวกับภูคำหอม รีสอร์ท เขาใหญ่ ทั้งห้องพัก ร้านอาหาร บริเวณรีสอร์ท และที่ตั้ง การใช้งานไม่มีค่าใช้จ่ายและไม่ต้องสมัครสมาชิก" },
          { when: ["official"], text: "การใช้เว็บไซต์นี้ถือว่าคุณยอมรับข้อกำหนดนี้ หากไม่ยอมรับ กรุณางดใช้เว็บไซต์" },
        ],
      },
      {
        id: "information",
        heading: "ข้อมูลบนเว็บไซต์",
        blocks: [
          { when: ["preview"], text: "ข้อมูลรวบรวมจากช่องทางสาธารณะของรีสอร์ทและหน้าจองของรีสอร์ท แต่ละหน้าระบุวันที่ตรวจสอบล่าสุดไว้ รีสอร์ทยังไม่ได้ยืนยันข้อมูลเหล่านี้ จึงควรถือเป็นการสรุปอย่างระมัดระวัง ไม่ใช่คำชี้แจงจากรีสอร์ทเอง" },
          { when: ["official"], text: "รีสอร์ทดูแลให้ข้อมูลบนเว็บไซต์นี้ถูกต้อง และหน้าเนื้อหาแต่ละหน้าระบุวันที่ปรับปรุงล่าสุดไว้" },
          { text: "รายละเอียดอาจเปลี่ยนแปลงได้ เรื่องใดที่มีผลต่อแผนการเดินทาง ให้ยึดใบยืนยันการจองหรือคำตอบจากรีสอร์ทเป็นหลัก ไม่ใช่เว็บไซต์นี้" },
          { text: "ภาพถ่ายแสดงรีสอร์ทตามที่ถ่ายไว้ ไม่ใช่การรับรองเรื่องเฟอร์นิเจอร์ วิว หรือสภาพของห้องใดห้องหนึ่งในวันใดวันหนึ่ง" },
        ],
      },
      {
        id: "booking",
        heading: "การจองและราคา",
        blocks: [
          { text: "เว็บไซต์นี้ไม่ได้แสดงราคาหรือห้องว่าง และไม่ได้รับจองหรือรับชำระเงิน ลิงก์จองจะพาไปยังหน้าของผู้ให้บริการระบบจองของรีสอร์ท ซึ่งเป็นเว็บไซต์แยกต่างหาก" },
          { text: "ห้องที่ว่าง ราคา สิ่งที่รวมอยู่ในราคา ภาษีและค่าธรรมเนียม รวมถึงเงื่อนไขการชำระเงิน เงินมัดจำ และการยกเลิกของราคานั้น จะแสดงในหน้าจองก่อนที่คุณจะยืนยัน เงื่อนไขดังกล่าวและใบยืนยันการจองคือสิ่งที่ใช้บังคับกับการจอง" },
          { text: "ตัวช่วยวางแผนการเข้าพักบนเว็บไซต์นี้ทำหน้าที่ส่งวันที่และจำนวนผู้ใหญ่ไปยังหน้าจองเท่านั้น ไม่ได้กันห้องไว้ให้" },
        ],
      },
      {
        id: "enquiries",
        heading: "ข้อความสอบถาม",
        blocks: [
          { when: ["delivery-off"], text: "หน้าสอบถามเตรียมข้อความไว้ให้คุณคัดลอก ไม่ได้ส่งข้อความให้ รีสอร์ทจะยังไม่ได้รับสิ่งใดจนกว่าคุณจะส่งข้อความเอง" },
          { text: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง คำขอในข้อความสอบถามจะถือว่ายืนยันก็ต่อเมื่อรีสอร์ทยืนยันกลับมาถึงคุณ" },
        ],
      },
      {
        id: "links",
        heading: "ลิงก์ไปยังเว็บไซต์อื่น",
        blocks: [
          { text: "เว็บไซต์นี้มีลิงก์ไปยังหน้าของผู้ให้บริการระบบจอง Google Maps LINE Facebook และเว็บไซต์ของสถานที่น่าแวะ เว็บไซต์เหล่านั้นดำเนินการโดยผู้อื่นและมีข้อกำหนดของตัวเอง ควรตรวจสอบเวลาเปิดปิดและรายละเอียดกับแต่ละแห่งก่อนเดินทาง" },
        ],
      },
      {
        id: "content",
        heading: "ภาพถ่ายและข้อความ",
        blocks: [
          { when: ["preview"], text: "ภาพถ่ายเป็นภาพที่รีสอร์ทเผยแพร่บนเว็บไซต์ของรีสอร์ทเอง และยังเป็นของเจ้าของภาพ ภาพเหล่านี้นำมาแสดงเพื่อประกอบการพิจารณางานออกแบบเท่านั้น ส่วนข้อความและงานออกแบบของเว็บไซต์ตัวอย่างนี้เป็นผลงานของ O2 Design Studio" },
          { when: ["preview"], text: "กรุณาอย่าคัดลอกหรือนำภาพถ่าย ข้อความ หรืองานออกแบบไปใช้ต่อ" },
          { when: ["official"], text: "ภาพถ่ายและข้อความบนเว็บไซต์นี้ ห้ามคัดลอกหรือนำไปใช้ต่อโดยไม่ได้รับอนุญาตจากรีสอร์ท" },
        ],
      },
      {
        id: "changes",
        heading: "การแก้ไขข้อกำหนด",
        blocks: [{ text: "เมื่อมีการแก้ไขข้อกำหนดนี้ วันที่ด้านบนของหน้าจะเปลี่ยนตาม" }],
      },
    ],
    contact: {
      id: "contact",
      heading: "ติดต่อ",
      preview: {
        text: "หากมีคำถามเกี่ยวกับเว็บไซต์ตัวอย่างนี้ ติดต่อ O2 Design Studio ได้ทางเว็บไซต์ของสตูดิโอ",
        studioLink: "O2 Design Studio",
        resort: "หากต้องการติดต่อรีสอร์ทโดยตรง ใช้เบอร์โทรศัพท์ LINE หรือหน้า Facebook ในหน้าติดต่อรีสอร์ท",
        resortLink: "ติดต่อรีสอร์ท",
      },
      official: {
        text: "หากมีคำถามเกี่ยวกับข้อกำหนดนี้ ติดต่อรีสอร์ทได้ที่",
        address: "ภูคำหอม รีสอร์ท เขาใหญ่ {address}",
        phone: "โทร {phone}",
        link: "ติดต่อรีสอร์ท",
      },
    },
  },
} satisfies L<LegalCopy>;
