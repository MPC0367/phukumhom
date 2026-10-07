import type { L } from "@/content/schema";

/**
 * Words for the motion lab: an internal page (noindex, not in the nav or the sitemap) that exercises
 * every component in src/components/motion with real photographs, so the motion can be judged by eye
 * in both languages.
 *
 * The specimen sentences are the glossary's own (docs/glossary.json: home.display, home.supporting,
 * home.sections.*, phrases.rooftopsAllRooms), so what moves here is what will move on the real pages.
 * The facts in the tiles are the contract's: three room types, check-in from 14:00, check-out until 12:00,
 * each "as currently listed". No middle dots, no dashes.
 */

interface LabCopy {
  kicker: string;
  resort: string;
  locality: string;
  /** Two lines; the last word of the English line is the italic accent. */
  heroLines: [string, string];
  heroAccent: string;
  supporting: string;
  index: { split: string; reveal: string; media: string; reel: string; sky: string; links: string };
  split: { kicker: string; title: string; intro: string; statement: string; statementAccent: string; body: string; otherNote: string };
  reveal: {
    kicker: string;
    title: string;
    intro: string;
    variants: { rise: string; fade: string; clip: string; scale: string };
    variantNote: string;
    tiles: { rooms: string; checkIn: string; checkOut: string };
    checkInTime: string;
    checkOutTime: string;
  };
  media: { kicker: string; title: string; intro: string; band: string };
  reel: { kicker: string; title: string; intro: string; label: string; last: string; none: string; overlayOff: string; overlayOn: string; photo: string };
  sky: { kicker: string; title: string; body: string; progress: string; clock: string };
  links: { kicker: string; title: string; intro: string; second: string; styleguide: string; home: string; other: string; top: string };
  /** The second page: the glossary's closing line, the locality line and the national park line. */
  second: { kicker: string; lines: [string, string]; accent: string; supporting: string; title: string; intro: string; back: string; backToReel: string };
}

export const copy = {
  en: {
    kicker: "Motion lab",
    resort: "Phukumhom Resort Khao Yai",
    locality: "Wang Katha, Pak Chong",
    heroLines: ["A little closer", "to"],
    heroAccent: "nature.",
    supporting: "Garden stays and private rooftops in Wang Katha, on the quieter side of the Khao Yai area.",
    index: { split: "Headlines", reveal: "Blocks", media: "Photographs", reel: "Reel", sky: "Sky", links: "Pages" },
    split: {
      kicker: "SplitReveal",
      title: "Garden",
      intro: "Lines rise out of their masks, one after another.",
      statement: "A garden, a pond and a great deal of",
      statementAccent: "sky",
      body: "Phukumhom is a garden resort in Wang Katha, on the quieter side of the Khao Yai area. The resort is in the Khao Yai area, not inside the national park.",
      otherNote: "The same reveal in Thai: one block, never split.",
    },
    reveal: {
      kicker: "Reveal, CountUp",
      title: "Stay",
      intro: "Three kinds of room, each with one clear difference.",
      variants: { rise: "Rise", fade: "Fade", clip: "Clip", scale: "Scale" },
      variantNote: "Once, as it arrives.",
      tiles: {
        rooms: "room types, each with a private rooftop",
        checkIn: "check-in, as currently listed",
        checkOut: "check-out, as currently listed",
      },
      checkInTime: "14:00",
      checkOutTime: "12:00",
    },
    media: {
      kicker: "MediaReveal, Parallax",
      title: "Rooftop",
      intro: "A photograph unveils from its lower edge and settles. With a mouse it also drifts inside its frame.",
      band: "A rooftop of your own",
    },
    reel: {
      kicker: "DriftReel",
      title: "Table",
      intro: "Drag it, throw it, or tab through it. It holds still under a mouse and while an overlay is open.",
      label: "Photographs of the kitchen garden and the grounds",
      last: "Last photograph activated",
      none: "None yet",
      overlayOff: "Simulate an open overlay",
      overlayOn: "Overlay open. Close it",
      photo: "Photograph",
    },
    sky: {
      kicker: "Stars, Clock, SunsetTime, MoonTonight",
      title: "Evening",
      body: "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa.",
      progress: "The day so far, from 0 in the afternoon to 1 at dusk",
      clock: "At the resort now",
    },
    links: {
      kicker: "PageTransition, anchors",
      title: "Onward",
      intro: "Each link below is a client-side navigation, so the next page rises and fades in.",
      second: "A second page",
      styleguide: "Design system",
      home: "Home",
      other: "This page in Thai",
      top: "Back to top",
    },
    second: {
      kicker: "Second page",
      lines: ["Pick your dates.", "The garden will be"],
      accent: "here.",
      supporting: "In Wang Katha, on the quieter side of the Khao Yai area.",
      title: "Arrive",
      intro: "The resort is in the Khao Yai area, not inside the national park.",
      back: "Back to the lab",
      backToReel: "Back to the reel",
    },
  },
  th: {
    kicker: "ห้องทดลองการเคลื่อนไหว",
    resort: "ภูคำหอม รีสอร์ท เขาใหญ่",
    locality: "วังกะทะ ปากช่อง",
    heroLines: ["ใกล้ธรรมชาติ", "ขึ้นอีกนิด"],
    heroAccent: "",
    supporting: "ที่พักกลางสวนในวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่ ทุกห้องมีดาดฟ้าส่วนตัว",
    index: { split: "พาดหัว", reveal: "กล่องเนื้อหา", media: "ภาพถ่าย", reel: "แถบภาพ", sky: "ท้องฟ้า", links: "เปลี่ยนหน้า" },
    split: {
      kicker: "SplitReveal",
      title: "สวน",
      intro: "ข้อความภาษาไทยเลื่อนขึ้นทั้งก้อน ไม่ตัดเป็นบรรทัดหรือตัวอักษร",
      statement: "สวน สระน้ำ และท้องฟ้ากว้าง",
      statementAccent: "",
      body: "ภูคำหอมเป็นรีสอร์ทกลางสวนในตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่ รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่",
      otherNote: "แบบเดียวกันในภาษาอังกฤษ แต่ละบรรทัดเลื่อนขึ้นจากขอบของตัวเอง",
    },
    reveal: {
      kicker: "Reveal, CountUp",
      title: "ห้องพัก",
      intro: "ห้องพักสามแบบ ต่างกันตรงไหน",
      variants: { rise: "เลื่อนขึ้น", fade: "ค่อยๆ ปรากฏ", clip: "เปิดออก", scale: "ขยายเข้าที่" },
      variantNote: "ครั้งเดียว เมื่อเลื่อนมาถึง",
      tiles: {
        rooms: "แบบห้องพัก ทุกแบบมีดาดฟ้าส่วนตัว",
        checkIn: "เช็กอิน ตามข้อมูลปัจจุบัน",
        checkOut: "เช็กเอาต์ ตามข้อมูลปัจจุบัน",
      },
      checkInTime: "14:00 น.",
      checkOutTime: "12:00 น.",
    },
    media: {
      kicker: "MediaReveal, Parallax",
      title: "ดาดฟ้า",
      intro: "ภาพเปิดขึ้นจากขอบล่างแล้วค่อยๆ เข้าที่ เมื่อใช้เมาส์ ภาพจะขยับช้าๆ อยู่ในกรอบด้วย",
      band: "ยามเย็นบนดาดฟ้าส่วนตัว",
    },
    reel: {
      kicker: "DriftReel",
      title: "ร้านอาหาร",
      intro: "ลากได้ เหวี่ยงได้ หรือกด Tab ไล่ดูทีละภาพ แถบภาพจะหยุดเมื่อเมาส์อยู่เหนือภาพ และเมื่อมีหน้าต่างเปิดซ้อนอยู่",
      label: "ภาพสวนครัวและบริเวณรีสอร์ท",
      last: "ภาพที่กดล่าสุด",
      none: "ยังไม่มี",
      overlayOff: "จำลองการเปิดหน้าต่างซ้อน",
      overlayOn: "หน้าต่างซ้อนเปิดอยู่ กดเพื่อปิด",
      photo: "ภาพที่",
    },
    sky: {
      kicker: "Stars, Clock, SunsetTime, MoonTonight",
      title: "ยามเย็น",
      body: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa",
      progress: "ช่วงของวันในตอนนี้ จาก 0 ตอนบ่าย ถึง 1 ตอนพลบค่ำ",
      clock: "ที่รีสอร์ทตอนนี้",
    },
    links: {
      kicker: "PageTransition, anchors",
      title: "ไปต่อ",
      intro: "ลิงก์ด้านล่างเปลี่ยนหน้าโดยไม่โหลดใหม่ทั้งหน้า หน้าถัดไปจึงเลื่อนขึ้นและค่อยๆ ปรากฏ",
      second: "หน้าที่สอง",
      styleguide: "ระบบออกแบบ",
      home: "หน้าแรก",
      other: "หน้านี้ภาษาอังกฤษ",
      top: "กลับขึ้นด้านบน",
    },
    second: {
      kicker: "หน้าที่สอง",
      lines: ["เลือกวันที่สะดวก", "แล้วมาพักกลางสวน"],
      accent: "",
      supporting: "อยู่ที่ตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่",
      title: "การเดินทาง",
      intro: "รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่",
      back: "กลับไปห้องทดลอง",
      backToReel: "กลับไปที่แถบภาพ",
    },
  },
} satisfies L<LabCopy>;
