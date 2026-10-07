import type { L } from "@/content/schema";

/**
 * The Privacy policy and the Website terms (brief sections 18 and 24).
 *
 * Both describe the website AS BUILT, and nothing else:
 *   - one first-party cookie, `pkh_lang`, written only when a visitor picks a language (LangSwitch.tsx);
 *   - a measurement choice kept in the browser's local storage under `pkh_consent`, only if measurement
 *     is configured (components/analytics); a session marker `pkh:seen` for the opening animation;
 *   - no analytics unless the `analytics` flag is on AND a measurement id is configured, and then only
 *     after the visitor agrees;
 *   - an enquiry form that sends nothing while the `enquiryDelivery` flag is off (it copies a message),
 *     and posts the listed fields to the resort when it is on;
 *   - bookings on the booking partner's own page; this site passes only dates and a number of adults;
 *   - links to Google Maps, Facebook and other places' own pages; no embedded map or widget;
 *   - fonts served from the site itself.
 *
 * A paragraph or item marked `when` is printed only in that configuration, so the page can never
 * describe a feature that is switched off. The page file reads the flags and filters.
 *
 * NOT STATED, because nothing publishable backs it (flagged for the owner in docs/HANDOFF.md): the
 * resort's legal entity name and registration, a data-protection officer, a legal basis, a retention
 * period, the hosting provider and its log retention, a governing-law clause, a universal cancellation
 * rule. These pages are review-ready, not legally reviewed. Third person. No middle dots, no dashes.
 */

export type LegalCondition = "analytics-on" | "analytics-off" | "delivery-on" | "delivery-off";

export interface LegalBlock {
  /** Printed only in this configuration; always when omitted. */
  when?: LegalCondition;
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
  intro: string;
  glance: Array<{ when?: LegalCondition; text: string }>;
  contents: string;
  sections: LegalSection[];
  /** The closing section: who to contact. `{address}` and `{phone}` are filled from site settings. */
  contact: { id: string; heading: string; text: string; address: string; phone: string; link: string };
}

export const privacy = {
  en: {
    kicker: "Privacy",
    intro: "This page says, in plain words, what this website does with information about the people who use it. It describes the website as it works today.",
    glance: [
      { when: "analytics-off", text: "This website does not measure or track its visitors." },
      { when: "analytics-on", text: "Visits are measured only after you agree, and you can change your mind at any time." },
      { when: "delivery-off", text: "The enquiry form sends nothing by itself: it prepares a message for you to copy." },
      { when: "delivery-on", text: "The enquiry form sends what you type to the resort, so the team can reply." },
      { text: "Bookings and payments are made on the page of the resort’s booking partner, not on this website." },
      { text: "One small cookie remembers the language you choose." },
    ],
    contents: "On this page",
    sections: [
      {
        id: "who",
        heading: "Who this policy is from",
        blocks: [
          { text: "This is the website of Phukumhom Resort Khao Yai. The resort is responsible for the information handled through it. The contact details are at the foot of this page." },
        ],
      },
      {
        id: "browsing",
        heading: "When you read the website",
        blocks: [
          { text: "You can read every page without giving your name or any contact detail." },
          { text: "As with any website, the server that delivers these pages receives the address of your device and the page you asked for, in order to send it to you." },
          { text: "The typefaces and photographs are served from this website itself. No page loads a map, a video or a social media widget from another company." },
        ],
      },
      {
        id: "storage",
        heading: "What is kept in your browser",
        blocks: [
          {
            text: "The website keeps very little in your browser, and nothing that identifies you:",
            list: [
              "A cookie named pkh_lang, written only if you choose a language. It holds the letters th or en, lasts up to a year, and is used to open the website in that language next time.",
              "A marker named pkh:seen, kept only until you close the tab, so the opening animation is shown in full once and briefly after that.",
            ],
          },
          { when: "analytics-on", text: "Your choice about measurement is kept under the name pkh_consent, together with the date you made it, and is asked again after twelve months." },
          { text: "You can delete these at any time from your browser’s settings. The website keeps working without them." },
        ],
      },
      {
        id: "measurement",
        heading: "Measurement",
        blocks: [
          { when: "analytics-off", text: "This website does not use analytics, advertising tags or tracking pixels. If measurement is ever switched on, the website will ask first and load nothing until you agree, and this page will be updated." },
          { when: "analytics-on", text: "With your agreement, the website uses Google Analytics to count visits and to see which pages are useful. Nothing is loaded and nothing is counted until you agree. If you decline, or say nothing, the website works in exactly the same way." },
          { when: "analytics-on", text: "What is recorded: the pages viewed, and a small set of actions such as opening the booking page or pressing a phone link. Dates you choose, messages you write and contact details are never sent to the measurement service." },
          { when: "analytics-on", text: "You can change your choice at any time with the cookie settings link at the foot of every page." },
        ],
      },
      {
        id: "enquiries",
        heading: "Enquiries",
        blocks: [
          { when: "delivery-off", text: "The enquiry form on the contact page works entirely in your browser. It checks what you typed, turns it into a message and copies that message for you. The website does not send it, store it or see it. You decide whether to send it to the resort and how." },
          {
            when: "delivery-on",
            text: "When you send the enquiry form, the website passes these details to the resort so the team can reply:",
            list: ["what the enquiry is about", "your name", "the phone number or email address you gave for the reply", "dates, room type and number of guests, if you filled them in", "your message"],
          },
          { when: "delivery-on", text: "They are used to answer your enquiry and for nothing else. The form does not ask for medical details, and there is no need to give any." },
          { text: "If you call the resort or write to it on Facebook, what you share is handled by the resort directly, and Facebook’s own policy applies to messages sent there." },
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
          { text: "This website links to the resort’s listing on Google Maps, to its Facebook page and to the websites of places to visit. Those websites have their own policies, which apply once you follow a link." },
        ],
      },
      {
        id: "choices",
        heading: "Your choices",
        blocks: [
          { text: "To ask what personal information the resort holds about you from a booking or an enquiry, or to ask for it to be corrected or deleted, contact the resort using the details below." },
          { text: "When this policy changes, the date at the top of the page changes with it." },
        ],
      },
    ],
    contact: {
      id: "contact",
      heading: "Contact",
      text: "Questions about this policy, or about your own information, go to the resort:",
      address: "Phukumhom Resort Khao Yai, {address}",
      phone: "Phone {phone}",
      link: "Contact the resort",
    },
  },
  th: {
    kicker: "ความเป็นส่วนตัว",
    intro: "หน้านี้อธิบายด้วยภาษาเรียบง่ายว่าเว็บไซต์นี้ทำอะไรกับข้อมูลของผู้ใช้งานบ้าง โดยอธิบายตามการทำงานจริงของเว็บไซต์ในปัจจุบัน",
    glance: [
      { when: "analytics-off", text: "เว็บไซต์นี้ไม่ได้เก็บสถิติหรือติดตามผู้เข้าชม" },
      { when: "analytics-on", text: "เว็บไซต์จะเก็บสถิติการเข้าชมก็ต่อเมื่อคุณยินยอม และเปลี่ยนใจได้ทุกเมื่อ" },
      { when: "delivery-off", text: "แบบฟอร์มสอบถามไม่ได้ส่งข้อความให้เอง แต่จะเรียบเรียงข้อความไว้ให้คุณคัดลอก" },
      { when: "delivery-on", text: "แบบฟอร์มสอบถามจะส่งข้อมูลที่กรอกไปยังรีสอร์ท เพื่อให้ทีมงานติดต่อกลับได้" },
      { text: "การจองและการชำระเงินทำในหน้าของผู้ให้บริการระบบจองของรีสอร์ท ไม่ได้ทำบนเว็บไซต์นี้" },
      { text: "มีคุกกี้ขนาดเล็กหนึ่งรายการ ไว้จำภาษาที่คุณเลือก" },
    ],
    contents: "ในหน้านี้",
    sections: [
      {
        id: "who",
        heading: "นโยบายนี้เป็นของใคร",
        blocks: [{ text: "เว็บไซต์นี้เป็นของภูคำหอม รีสอร์ท เขาใหญ่ รีสอร์ทเป็นผู้รับผิดชอบข้อมูลที่ผ่านเว็บไซต์นี้ ช่องทางติดต่ออยู่ท้ายหน้านี้" }],
      },
      {
        id: "browsing",
        heading: "เมื่อคุณเข้าชมเว็บไซต์",
        blocks: [
          { text: "คุณอ่านได้ทุกหน้าโดยไม่ต้องให้ชื่อหรือข้อมูลติดต่อใดๆ" },
          { text: "เช่นเดียวกับเว็บไซต์ทั่วไป เซิร์ฟเวอร์ที่ส่งหน้าเว็บจะได้รับที่อยู่ของอุปกรณ์และหน้าที่คุณเรียกดู เพื่อส่งหน้านั้นกลับไปให้คุณ" },
          { text: "ตัวอักษรและภาพถ่ายให้บริการจากเว็บไซต์นี้เอง ไม่มีหน้าใดโหลดแผนที่ วิดีโอ หรือส่วนเสริมโซเชียลมีเดียจากบริษัทอื่น" },
        ],
      },
      {
        id: "storage",
        heading: "สิ่งที่เก็บไว้ในเบราว์เซอร์ของคุณ",
        blocks: [
          {
            text: "เว็บไซต์เก็บข้อมูลไว้ในเบราว์เซอร์น้อยมาก และไม่มีข้อมูลใดระบุตัวคุณได้",
            list: [
              "คุกกี้ชื่อ pkh_lang จะถูกบันทึกเมื่อคุณเลือกภาษาเท่านั้น เก็บเพียงตัวอักษร th หรือ en มีอายุไม่เกินหนึ่งปี และใช้เปิดเว็บไซต์เป็นภาษานั้นในครั้งถัดไป",
              "เครื่องหมายชื่อ pkh:seen เก็บไว้จนกว่าจะปิดแท็บ เพื่อให้ภาพเคลื่อนไหวตอนเปิดเว็บไซต์แสดงเต็มเพียงครั้งเดียว และแสดงสั้นลงในครั้งถัดไป",
            ],
          },
          { when: "analytics-on", text: "การตัดสินใจเรื่องการเก็บสถิติจะถูกเก็บไว้ในชื่อ pkh_consent พร้อมวันที่ที่คุณเลือก และจะถามใหม่เมื่อครบสิบสองเดือน" },
          { text: "คุณลบข้อมูลเหล่านี้ได้ทุกเมื่อจากการตั้งค่าของเบราว์เซอร์ และเว็บไซต์ยังใช้งานได้ตามปกติ" },
        ],
      },
      {
        id: "measurement",
        heading: "การเก็บสถิติ",
        blocks: [
          { when: "analytics-off", text: "เว็บไซต์นี้ไม่ได้ใช้ระบบวิเคราะห์สถิติ แท็กโฆษณา หรือพิกเซลติดตาม หากมีการเปิดใช้การเก็บสถิติในอนาคต เว็บไซต์จะถามก่อนและจะไม่โหลดสิ่งใดจนกว่าคุณจะยินยอม พร้อมทั้งปรับปรุงหน้านี้" },
          { when: "analytics-on", text: "เมื่อคุณยินยอม เว็บไซต์จะใช้ Google Analytics เพื่อนับจำนวนการเข้าชมและดูว่าหน้าใดเป็นประโยชน์ เว็บไซต์จะไม่โหลดและไม่นับสิ่งใดจนกว่าคุณจะยินยอม หากคุณปฏิเสธหรือไม่เลือก เว็บไซต์ยังใช้งานได้เหมือนเดิมทุกประการ" },
          { when: "analytics-on", text: "สิ่งที่บันทึก ได้แก่ หน้าที่เข้าชม และการกระทำบางอย่าง เช่น การเปิดหน้าจองหรือการกดลิงก์โทรศัพท์ ส่วนวันที่ที่เลือก ข้อความที่เขียน และข้อมูลติดต่อ จะไม่ถูกส่งไปยังบริการเก็บสถิติ" },
          { when: "analytics-on", text: "คุณเปลี่ยนการตัดสินใจได้ทุกเมื่อจากลิงก์ตั้งค่าคุกกี้ที่ท้ายทุกหน้า" },
        ],
      },
      {
        id: "enquiries",
        heading: "ข้อความสอบถาม",
        blocks: [
          { when: "delivery-off", text: "แบบฟอร์มสอบถามในหน้าติดต่อรีสอร์ททำงานในเบราว์เซอร์ของคุณทั้งหมด แบบฟอร์มจะตรวจสิ่งที่กรอก เรียบเรียงเป็นข้อความ แล้วคัดลอกข้อความนั้นให้ เว็บไซต์ไม่ได้ส่ง ไม่ได้เก็บ และไม่เห็นข้อความดังกล่าว คุณเป็นผู้ตัดสินใจเองว่าจะส่งถึงรีสอร์ทหรือไม่ และทางใด" },
          {
            when: "delivery-on",
            text: "เมื่อคุณส่งแบบฟอร์มสอบถาม เว็บไซต์จะส่งข้อมูลต่อไปนี้ถึงรีสอร์ท เพื่อให้ทีมงานติดต่อกลับได้",
            list: ["เรื่องที่สอบถาม", "ชื่อของคุณ", "หมายเลขโทรศัพท์หรืออีเมลที่ให้ไว้สำหรับติดต่อกลับ", "วันที่ ประเภทห้องพัก และจำนวนผู้เข้าพัก หากกรอกไว้", "ข้อความของคุณ"],
          },
          { when: "delivery-on", text: "ข้อมูลเหล่านี้ใช้เพื่อตอบคำถามของคุณเท่านั้น แบบฟอร์มไม่ได้ขอข้อมูลทางการแพทย์ และไม่จำเป็นต้องให้" },
          { text: "หากคุณโทรหารีสอร์ทหรือส่งข้อความทาง Facebook รีสอร์ทจะเป็นผู้ดูแลข้อมูลที่คุณให้โดยตรง และข้อความที่ส่งทาง Facebook อยู่ภายใต้นโยบายของ Facebook" },
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
        blocks: [{ text: "เว็บไซต์นี้มีลิงก์ไปยังหน้าของรีสอร์ทบน Google Maps หน้า Facebook ของรีสอร์ท และเว็บไซต์ของสถานที่น่าแวะ เว็บไซต์เหล่านั้นมีนโยบายของตัวเอง ซึ่งมีผลเมื่อคุณกดลิงก์ไปแล้ว" }],
      },
      {
        id: "choices",
        heading: "สิทธิ์และทางเลือกของคุณ",
        blocks: [
          { text: "หากต้องการทราบว่ารีสอร์ทมีข้อมูลส่วนบุคคลใดของคุณจากการจองหรือการสอบถาม หรือต้องการให้แก้ไขหรือลบข้อมูลนั้น ติดต่อรีสอร์ทได้ตามช่องทางด้านล่าง" },
          { text: "เมื่อมีการแก้ไขนโยบายนี้ วันที่ด้านบนของหน้าจะเปลี่ยนตาม" },
        ],
      },
    ],
    contact: {
      id: "contact",
      heading: "ติดต่อ",
      text: "หากมีคำถามเกี่ยวกับนโยบายนี้หรือข้อมูลของคุณ ติดต่อรีสอร์ทได้ที่",
      address: "ภูคำหอม รีสอร์ท เขาใหญ่ {address}",
      phone: "โทร {phone}",
      link: "ติดต่อรีสอร์ท",
    },
  },
} satisfies L<LegalCopy>;

export const terms = {
  en: {
    kicker: "Terms",
    intro: "These terms explain what this website is for, what it does not do, and where the terms of a booking are set.",
    glance: [
      { text: "This website gives information about the resort. It does not take bookings or payments itself." },
      { text: "Rates, availability and the terms of each rate are shown on the booking partner’s page before you confirm." },
      { text: "An enquiry is a message to the resort, not a confirmed reservation." },
      { text: "Photographs show the resort as photographed. If a detail matters, ask the resort before you book." },
    ],
    contents: "On this page",
    sections: [
      {
        id: "about",
        heading: "About this website",
        blocks: [
          { text: "This website gives information about Phukumhom Resort Khao Yai: its rooms, restaurant, grounds and location. Using it is free and needs no account." },
          { text: "By using the website you accept these terms. If you do not accept them, please do not use it." },
        ],
      },
      {
        id: "information",
        heading: "The information here",
        blocks: [
          { text: "The resort takes care to keep this website accurate. Practical details such as check-in and check-out times are given as currently listed, and each content page shows the date it was last updated." },
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
          { text: "An enquiry is a message to the resort, not a confirmed reservation. A request made in an enquiry is confirmed only when the resort confirms it to you." },
          { when: "delivery-off", text: "The enquiry form on this website prepares a message for you to copy. It does not send it." },
        ],
      },
      {
        id: "links",
        heading: "Links to other websites",
        blocks: [
          { text: "This website links to the booking partner’s page, to Google Maps, to Facebook and to the websites of places to visit. Those websites are run by others and have their own terms. Check opening times and details with each place before you set out." },
        ],
      },
      {
        id: "content",
        heading: "Photographs and text",
        blocks: [{ text: "The photographs and text on this website may not be copied or reused without the resort’s permission." }],
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
      text: "Questions about these terms go to the resort:",
      address: "Phukumhom Resort Khao Yai, {address}",
      phone: "Phone {phone}",
      link: "Contact the resort",
    },
  },
  th: {
    kicker: "ข้อกำหนด",
    intro: "ข้อกำหนดนี้อธิบายว่าเว็บไซต์นี้มีไว้เพื่ออะไร ไม่ได้ทำอะไร และเงื่อนไขของการจองกำหนดไว้ที่ใด",
    glance: [
      { text: "เว็บไซต์นี้ให้ข้อมูลเกี่ยวกับรีสอร์ท ไม่ได้รับจองหรือรับชำระเงินเอง" },
      { text: "ราคา ห้องว่าง และเงื่อนไขของแต่ละราคา แสดงในหน้าของผู้ให้บริการระบบจองก่อนที่คุณจะยืนยัน" },
      { text: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง" },
      { text: "ภาพถ่ายแสดงรีสอร์ทตามที่ถ่ายไว้ หากรายละเอียดใดมีผลต่อการตัดสินใจ สอบถามรีสอร์ทก่อนจอง" },
    ],
    contents: "ในหน้านี้",
    sections: [
      {
        id: "about",
        heading: "เกี่ยวกับเว็บไซต์นี้",
        blocks: [
          { text: "เว็บไซต์นี้ให้ข้อมูลเกี่ยวกับภูคำหอม รีสอร์ท เขาใหญ่ ทั้งห้องพัก ร้านอาหาร บริเวณรีสอร์ท และที่ตั้ง การใช้งานไม่มีค่าใช้จ่ายและไม่ต้องสมัครสมาชิก" },
          { text: "การใช้เว็บไซต์นี้ถือว่าคุณยอมรับข้อกำหนดนี้ หากไม่ยอมรับ กรุณางดใช้เว็บไซต์" },
        ],
      },
      {
        id: "information",
        heading: "ข้อมูลบนเว็บไซต์",
        blocks: [
          { text: "รีสอร์ทดูแลให้ข้อมูลบนเว็บไซต์นี้ถูกต้อง รายละเอียดอย่างเวลาเช็กอินและเช็กเอาต์เป็นไปตามข้อมูลปัจจุบัน และหน้าเนื้อหาแต่ละหน้าระบุวันที่ปรับปรุงล่าสุดไว้" },
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
          { text: "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง คำขอในข้อความสอบถามจะถือว่ายืนยันก็ต่อเมื่อรีสอร์ทยืนยันกลับมาถึงคุณ" },
          { when: "delivery-off", text: "แบบฟอร์มสอบถามบนเว็บไซต์นี้เรียบเรียงข้อความไว้ให้คุณคัดลอก ไม่ได้ส่งข้อความให้" },
        ],
      },
      {
        id: "links",
        heading: "ลิงก์ไปยังเว็บไซต์อื่น",
        blocks: [
          { text: "เว็บไซต์นี้มีลิงก์ไปยังหน้าของผู้ให้บริการระบบจอง Google Maps Facebook และเว็บไซต์ของสถานที่น่าแวะ เว็บไซต์เหล่านั้นดำเนินการโดยผู้อื่นและมีข้อกำหนดของตัวเอง ควรตรวจสอบเวลาเปิดปิดและรายละเอียดกับแต่ละแห่งก่อนเดินทาง" },
        ],
      },
      {
        id: "content",
        heading: "ภาพถ่ายและข้อความ",
        blocks: [{ text: "ภาพถ่ายและข้อความบนเว็บไซต์นี้ ห้ามคัดลอกหรือนำไปใช้ต่อโดยไม่ได้รับอนุญาตจากรีสอร์ท" }],
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
      text: "หากมีคำถามเกี่ยวกับข้อกำหนดนี้ ติดต่อรีสอร์ทได้ที่",
      address: "ภูคำหอม รีสอร์ท เขาใหญ่ {address}",
      phone: "โทร {phone}",
      link: "ติดต่อรีสอร์ท",
    },
  },
} satisfies L<LegalCopy>;
