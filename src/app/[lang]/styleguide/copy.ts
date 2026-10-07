import type { L, Locale } from "@/content/schema";
import glossaryJson from "../../../../docs/glossary.json";

/**
 * Words for the style guide.
 *
 * Guest-facing specimens (button labels, headings, sentences) come from src/i18n/ui.ts through `t(lang)`
 * and, for the homepage lines and shared sentences that are not in that table, straight from
 * docs/glossary.json, so the guide always shows the canonical wording. `chrome` is the guide's own
 * labelling: it names the specimens and is never guest copy. Like every visible string on the site it
 * contains no middle dot and no long dash.
 */

export const glossary = glossaryJson;

/** Pick one language from a glossary leaf. */
export function g(leaf: { en: string; th: string }, lang: Locale): string {
  return leaf[lang];
}

interface Part {
  kicker: string;
  title: string;
  intro: string;
}

interface Chrome {
  title: string;
  lead: string;
  statement: string;
  jump: { label: string; hero: string; chapter: string; colour: string; type: string; surfaces: string; forms: string; media: string; overlays: string; lists: string };
  heroLine: { first: string; second: string; accent: string };
  heroMeta: { checkIn: string; checkOut: string };
  heroNote: string;
  chapter: { title: string; tileRooms: string; tileRoomsNote: string; tilesLabel: string; note: string };
  parts: { colour: Part; type: Part; forms: Part; media: Part; overlays: Part; lists: Part };
  surfaces: {
    kicker: string;
    note: string;
    paper: { title: string; intro: string };
    sand: { title: string; intro: string };
    white: { title: string; intro: string };
    twilight: { title: string; intro: string };
    forest: { title: string; intro: string };
    photo: { title: string; intro: string };
  };
  roles: Record<
    | "paper"
    | "sand"
    | "white"
    | "terracotta"
    | "terracottaDeep"
    | "clay"
    | "claySoft"
    | "clayDeep"
    | "forest"
    | "forestDeep"
    | "ink"
    | "inkMuted"
    | "stone"
    | "stoneDeep"
    | "twilight"
    | "twilightSoft"
    | "onDark"
    | "onDarkMuted",
    string
  >;
  type: {
    thisLanguage: string;
    otherLanguage: string;
    marks: string;
    marksNote: string;
    figureSample: string;
  };
  spec: {
    buttons: string;
    buttonsNote: string;
    sizes: string;
    links: string;
    linksNote: string;
    chips: string;
    chipsNote: string;
    labels: string;
    labelsNote: string;
    tiles: string;
    panels: string;
    panelsNote: string;
    focus: string;
    focusNote: string;
    switch: string;
    fields: string;
    fieldsNote: string;
    errors: string;
    errorsNote: string;
    onSand: string;
    frames: string;
    framesNote: string;
    linked: string;
    linkedNote: string;
    pair: string;
    pairNote: string;
    fill: string;
    fillNote: string;
    band: string;
    bandNote: string;
    drawer: string;
    drawerNote: string;
    dialog: string;
    dialogNote: string;
    lightbox: string;
    lightboxNote: string;
    toast: string;
    toastNote: string;
    facts: string;
    glance: string;
    accordion: string;
    accordionNote: string;
    breadcrumbs: string;
    horizon: string;
    icons: string;
  };
  demo: {
    openDrawer: string;
    openSheet: string;
    openDialog: string;
    drawerTitle: string;
    sheetTitle: string;
    dialogTitle: string;
    filters: string;
    openPhoto: string;
    toastSaved: string;
    panelWhite: string;
    panelSand: string;
    panelOutline: string;
    emailHint: string;
    fillLabel: string;
  };
}

export const chrome = {
  en: {
    title: "Design system",
    lead: "Every primitive the site is built from, on every surface, with real photographs and the glossary’s own words.",
    statement: "Pills, rounded photographs, one terracotta action colour and a serif set as large as the screen allows.",
    jump: {
      label: "On this page",
      hero: "Hero",
      chapter: "Chapter",
      colour: "Colour",
      type: "Type",
      surfaces: "Surfaces",
      forms: "Forms",
      media: "Photographs",
      overlays: "Overlays",
      lists: "Lists",
    },
    heroLine: { first: "A little closer", second: "to", accent: "nature." },
    heroMeta: { checkIn: "Check-in from", checkOut: "Check-out until" },
    heroNote: "Band at screen height with the hero scrim and grain. The line is .hero-line, the two actions are a primary and a ghost pill, and the meta strip is divided by Rule elements, never by typed dots.",
    chapter: {
      title: "Garden",
      tileRooms: "Room types",
      tileRoomsNote: "each with a private rooftop",
      tilesLabel: "The stay at a glance",
      note: "Chapter with a sticky rail, a statement, a TileRow and a Frame pair. Scroll: the rail holds under the header while the column moves.",
    },
    parts: {
      colour: { kicker: "Palette", title: "Colour", intro: "Warm paper, the terracotta of the buildings for actions, forest for structure and a deep twilight blue. Clay is atmosphere and never carries text on a light ground." },
      type: { kicker: "Two voices", title: "Type", intro: "A giant serif for English, Noto Serif Thai for Thai display, one sans for everything a guest reads or presses. Thai keeps its own smaller scale and taller lines." },
      forms: { kicker: "Fields and switches", title: "Forms", intro: "White wells with a floating label, a native date input left fully usable, a radio group drawn as a switch. All of it works with scripting off." },
      media: { kicker: "Frames and bands", title: "Photographs", intro: "Framed photographs are rounded and stay near their true size. Frames catalogued for full-bleed use fill bands and tiles." },
      overlays: { kicker: "Drawer, viewer, toast", title: "Overlays", intro: "All on the native dialog: focus is held inside, Escape and the backdrop close, focus returns to the control that opened it." },
      lists: { kicker: "Facts and answers", title: "Lists", intro: "Ledgers, short answers, native disclosures and the small parts every page shares." },
    },
    surfaces: {
      kicker: "Six grounds",
      note: "The same markup on each ground. Only the surface helper class changes.",
      paper: { title: "Paper", intro: "The main ground. Ink for reading, terracotta for the action, forest for structure." },
      sand: { title: "Sand", intro: "The alternate band: reels, tiles and quiet interludes." },
      white: { title: "White", intro: "Raised surfaces: the planner dock, drawers and forms." },
      twilight: { title: "Twilight", intro: "The rooftop chapter at dusk. Every token is re-pointed and the markup stays as it is." },
      forest: { title: "Forest", intro: "The closing band and the footer." },
      photo: { title: "Photograph", intro: "Text over a picture always sits on a scrim and is measured against the lightest pixels behind it." },
    },
    roles: {
      paper: "Main ground",
      sand: "Alternate band, tiles",
      white: "Raised panels, fields",
      terracotta: "Primary action",
      terracottaDeep: "Action, hover and pressed",
      clay: "Atmosphere, never text on light",
      claySoft: "Accents on dark",
      clayDeep: "Numerals",
      forest: "Titles, outlines, focus",
      forestDeep: "Toast, footer depth",
      ink: "Text",
      inkMuted: "Secondary text",
      stone: "Hairlines",
      stoneDeep: "Control borders",
      twilight: "The dusk ground, scrims",
      twilightSoft: "Raised on twilight",
      onDark: "Text on dark",
      onDarkMuted: "Secondary text on twilight",
    },
    type: {
      thisLanguage: "English",
      otherLanguage: "Thai",
      marks: "Mark clearance",
      marksNote: "Each line sits in a box that clips at its own line height. A cropped vowel or tone mark would show here first.",
      figureSample: "14:00",
    },
    spec: {
      buttons: "Button",
      buttonsNote: "Primary, secondary, ghost and quiet. Hover them: the fill deepens or rises, the arrow slides 4px.",
      sizes: "Sizes and states",
      links: "TextLink",
      linksNote: "The line draws from the left on hover and on keyboard focus.",
      chips: "Chip",
      chipsNote: "Facts, a selected filter, a filter at rest and a link.",
      labels: "Kicker and Rule",
      labelsNote: "The rule is an element. Nothing is typed between the items.",
      tiles: "Tile and TileRow",
      panels: "Panel",
      panelsNote: "White and sand panels are always ink on light. An outline panel takes the ground it is on.",
      focus: "Focus ring",
      focusNote: "Drawn permanently here so it can be judged on each ground.",
      switch: "Segmented",
      fields: "Field, SelectField, TextareaField",
      fieldsNote: "Empty, the label rests on the centre line. With focus or a value it rises. Dates and selects keep it raised.",
      errors: "Error state",
      errorsNote: "A second pixel of border, a drawn mark and the message beneath, wired with aria-describedby.",
      onSand: "The same fields on a sand panel",
      frames: "Frame",
      framesNote: "Six crops around the catalogued focal point, each asking for a file large enough for its crop.",
      linked: "Frame, linked",
      linkedNote: "The picture is the link. It eases to 1.04 inside its corners and a badge arrives.",
      pair: "Frame pair",
      pairNote: "One wide frame and one portrait, offset and overlapping. Never two equal halves.",
      fill: "Picture, fill",
      fillNote: "The picture covers a box the layout made. No width cap, and the large files are used.",
      band: "Band",
      bandNote: "Full-bleed, half height, the hero scrim, one line set in .statement and a meta line with a Rule.",
      drawer: "Drawer",
      drawerNote: "From the right on wide screens, a bottom sheet with a handle on phones.",
      dialog: "Dialog",
      dialogNote: "The centred sheet, for short decisions.",
      lightbox: "Lightbox",
      lightboxNote: "Press a photograph. Arrow keys, swipe, thumbnails on wide screens, Escape. Without scripting each one is a link to the file.",
      toast: "Toast",
      toastNote: "One polite live region. The copy button turns into a tick as the toast rises.",
      facts: "FactList",
      glance: "AtAGlance",
      accordion: "Accordion",
      accordionNote: "Native details. The height eases where the browser can animate to auto.",
      breadcrumbs: "Breadcrumbs and LastUpdated",
      horizon: "Horizon and SectionHeader",
      icons: "Icon",
    },
    demo: {
      openDrawer: "Open the drawer",
      openSheet: "Open as a bottom sheet",
      openDialog: "Open the dialog",
      drawerTitle: "Plan your stay",
      sheetTitle: "Compare rooms",
      dialogTitle: "Before you book",
      filters: "Photograph filters",
      openPhoto: "Open photograph",
      toastSaved: "Enquiry copied.",
      panelWhite: "White",
      panelSand: "Sand",
      panelOutline: "Outline",
      emailHint: "The resort replies to this address.",
      fillLabel: "Rooftops",
    },
  },
  th: {
    title: "ระบบออกแบบ",
    lead: "องค์ประกอบทุกชิ้นที่ใช้สร้างเว็บไซต์ แสดงบนทุกพื้นผิว ด้วยภาพถ่ายจริงและถ้อยคำจากอภิธานศัพท์",
    statement: "ปุ่มทรงแคปซูล ภาพถ่ายมุมมน สีดินเผาสำหรับปุ่มหลัก และตัวอักษรมีเชิงขนาดใหญ่เท่าที่จอจะรับได้",
    jump: {
      label: "ในหน้านี้",
      hero: "ฮีโร่",
      chapter: "บท",
      colour: "สี",
      type: "ตัวอักษร",
      surfaces: "พื้นผิว",
      forms: "แบบฟอร์ม",
      media: "ภาพถ่าย",
      overlays: "หน้าต่างซ้อน",
      lists: "รายการ",
    },
    heroLine: { first: "", second: "", accent: "" },
    heroMeta: { checkIn: "เช็กอินตั้งแต่", checkOut: "เช็กเอาต์ภายใน" },
    heroNote: "แถบภาพสูงเต็มจอ พร้อมฉากมืดไล่ระดับและเกรน บรรทัดหลักใช้ .hero-line ปุ่มสองปุ่มคือปุ่มหลักและปุ่มโปร่ง แถบข้อมูลด้านล่างคั่นด้วยเส้น ไม่ได้พิมพ์จุดคั่น",
    chapter: {
      title: "สวน",
      tileRooms: "แบบห้องพัก",
      tileRoomsNote: "ทุกแบบมีดาดฟ้าส่วนตัว",
      tilesLabel: "ข้อมูลการเข้าพักโดยสรุป",
      note: "บทที่มีแถบซ้ายแบบเกาะจอ ประโยคเปิด แถวตัวเลข และภาพคู่ ลองเลื่อนดู แถบซ้ายจะอยู่ใต้ส่วนหัวขณะที่คอลัมน์ขวาเลื่อนไป",
    },
    parts: {
      colour: { kicker: "ชุดสี", title: "สี", intro: "สีกระดาษอุ่น สีดินเผาของอาคารสำหรับปุ่มหลัก สีเขียวป่าสำหรับโครงสร้าง และสีฟ้ายามค่ำ สีดินอ่อนใช้สร้างบรรยากาศเท่านั้น ไม่ใช้กับตัวอักษรบนพื้นสว่าง" },
      type: { kicker: "สองน้ำเสียง", title: "ตัวอักษร", intro: "ตัวมีเชิงขนาดใหญ่สำหรับภาษาอังกฤษ Noto Serif Thai สำหรับหัวเรื่องภาษาไทย และตัวไม่มีเชิงหนึ่งตระกูลสำหรับทุกอย่างที่ผู้เข้าพักอ่านหรือกด ภาษาไทยมีสเกลของตัวเองที่เล็กกว่าและระยะบรรทัดสูงกว่า" },
      forms: { kicker: "ช่องกรอกและตัวเลือก", title: "แบบฟอร์ม", intro: "ช่องกรอกพื้นขาวพร้อมป้ายลอย ช่องวันที่ของเบราว์เซอร์ที่ใช้งานได้ครบ และตัวเลือกแบบสวิตช์ ทั้งหมดใช้ได้แม้ปิดสคริปต์" },
      media: { kicker: "กรอบภาพและแถบภาพ", title: "ภาพถ่าย", intro: "ภาพในกรอบมีมุมมนและแสดงใกล้ขนาดจริง ส่วนภาพที่คลังภาพอนุญาตให้ใช้เต็มความกว้าง ใช้กับแถบภาพและแผ่นภาพ" },
      overlays: { kicker: "ลิ้นชัก ตัวดูภาพ ข้อความแจ้ง", title: "หน้าต่างซ้อน", intro: "ทั้งหมดใช้ dialog ของเบราว์เซอร์ โฟกัสอยู่ภายใน ปิดได้ด้วย Escape หรือคลิกพื้นหลัง แล้วโฟกัสกลับไปที่ปุ่มที่เปิด" },
      lists: { kicker: "ข้อเท็จจริงและคำตอบ", title: "รายการ", intro: "รายการข้อมูล สรุปสั้นๆ ส่วนพับเปิดได้ และชิ้นส่วนเล็กที่ทุกหน้าใช้ร่วมกัน" },
    },
    surfaces: {
      kicker: "หกพื้นผิว",
      note: "โครงสร้างเดียวกันบนทุกพื้น เปลี่ยนเฉพาะคลาสของพื้นผิว",
      paper: { title: "กระดาษ", intro: "พื้นหลักของเว็บไซต์ สีหมึกสำหรับอ่าน สีดินเผาสำหรับปุ่มหลัก สีเขียวป่าสำหรับโครงสร้าง" },
      sand: { title: "ทราย", intro: "แถบสลับ ใช้กับแถวภาพเลื่อน แผ่นข้อมูล และช่วงพัก" },
      white: { title: "ขาว", intro: "พื้นผิวที่ยกขึ้น ได้แก่แถบวางแผนเข้าพัก ลิ้นชัก และแบบฟอร์ม" },
      twilight: { title: "ยามค่ำ", intro: "บทดาดฟ้าช่วงพลบค่ำ โทเคนทุกตัวชี้ไปชุดสีเข้ม โดยโครงสร้างไม่เปลี่ยน" },
      forest: { title: "เขียวป่า", intro: "แถบปิดท้ายและส่วนท้ายของหน้า" },
      photo: { title: "บนภาพ", intro: "ข้อความบนภาพวางบนฉากมืดไล่ระดับเสมอ และวัดความต่างสีกับจุดที่สว่างที่สุดด้านหลัง" },
    },
    roles: {
      paper: "พื้นหลัก",
      sand: "แถบสลับ แผ่นข้อมูล",
      white: "แผงที่ยกขึ้น ช่องกรอก",
      terracotta: "ปุ่มหลัก",
      terracottaDeep: "ปุ่มหลักเมื่อชี้และกด",
      clay: "บรรยากาศ ไม่ใช้กับตัวอักษรบนพื้นสว่าง",
      claySoft: "สีเน้นบนพื้นเข้ม",
      clayDeep: "ตัวเลขกำกับ",
      forest: "ชื่อบท เส้นขอบ โฟกัส",
      forestDeep: "ข้อความแจ้ง ส่วนท้าย",
      ink: "ข้อความ",
      inkMuted: "ข้อความรอง",
      stone: "เส้นบาง",
      stoneDeep: "ขอบช่องกรอก",
      twilight: "พื้นยามค่ำ ฉากมืด",
      twilightSoft: "พื้นยกบนยามค่ำ",
      onDark: "ข้อความบนพื้นเข้ม",
      onDarkMuted: "ข้อความรองบนพื้นยามค่ำ",
    },
    type: {
      thisLanguage: "ภาษาไทย",
      otherLanguage: "ภาษาอังกฤษ",
      marks: "ระยะสระและวรรณยุกต์",
      marksNote: "แต่ละบรรทัดอยู่ในกรอบที่ตัดขอบพอดีระยะบรรทัดของตัวเอง หากสระหรือวรรณยุกต์ถูกตัด จะเห็นที่นี่ก่อน",
      figureSample: "14:00",
    },
    spec: {
      buttons: "Button",
      buttonsNote: "ปุ่มหลัก ปุ่มรอง ปุ่มโปร่ง และปุ่มแบบข้อความ ลองชี้ดู สีพื้นเข้มขึ้นหรือไหลขึ้นมาเต็มปุ่ม ลูกศรเลื่อน 4 พิกเซล",
      sizes: "ขนาดและสถานะ",
      links: "TextLink",
      linksNote: "เส้นใต้ลากจากซ้ายเมื่อชี้หรือเมื่อโฟกัสด้วยแป้นพิมพ์",
      chips: "Chip",
      chipsNote: "ข้อเท็จจริง ตัวกรองที่เลือกอยู่ ตัวกรองปกติ และลิงก์",
      labels: "Kicker และ Rule",
      labelsNote: "เส้นคั่นเป็นองค์ประกอบ ไม่มีการพิมพ์เครื่องหมายคั่นระหว่างข้อความ",
      tiles: "Tile และ TileRow",
      panels: "Panel",
      panelsNote: "แผงสีขาวและสีทรายเป็นตัวอักษรสีหมึกบนพื้นสว่างเสมอ ส่วนแผงเส้นขอบใช้สีของพื้นที่วางอยู่",
      focus: "กรอบโฟกัส",
      focusNote: "แสดงค้างไว้ที่นี่ เพื่อดูความชัดบนแต่ละพื้น",
      switch: "Segmented",
      fields: "Field, SelectField, TextareaField",
      fieldsNote: "เมื่อว่าง ป้ายอยู่กลางช่อง เมื่อโฟกัสหรือมีค่า ป้ายลอยขึ้น ช่องวันที่และช่องเลือกแสดงป้ายลอยไว้เสมอ",
      errors: "สถานะผิดพลาด",
      errorsNote: "ขอบหนาขึ้นหนึ่งพิกเซล มีเครื่องหมาย และมีข้อความด้านล่างที่ผูกกับช่องด้วย aria-describedby",
      onSand: "ช่องกรอกชุดเดียวกันบนแผงสีทราย",
      frames: "Frame",
      framesNote: "หกสัดส่วน ครอบรอบจุดสนใจที่บันทึกไว้ในคลังภาพ แต่ละภาพขอไฟล์ที่ใหญ่พอสำหรับสัดส่วนนั้น",
      linked: "Frame แบบลิงก์",
      linkedNote: "ตัวภาพคือลิงก์ ภาพขยายเป็น 1.04 เท่าภายในกรอบมุมมน และมีป้ายลูกศรปรากฏที่มุม",
      pair: "ภาพคู่",
      pairNote: "ภาพกว้างหนึ่งภาพกับภาพแนวตั้งหนึ่งภาพ วางเหลื่อมและซ้อนกัน ไม่แบ่งครึ่งเท่ากัน",
      fill: "Picture แบบ fill",
      fillNote: "ภาพครอบเต็มกล่องที่เลย์เอาต์กำหนด ไม่จำกัดความกว้าง และใช้ไฟล์ขนาดใหญ่",
      band: "Band",
      bandNote: "เต็มความกว้าง สูงครึ่งจอ ฉากมืดไล่ระดับแบบเดียวกับฮีโร่ หนึ่งบรรทัดในแบบ .statement และแถบข้อมูลที่คั่นด้วยเส้น",
      drawer: "Drawer",
      drawerNote: "เลื่อนเข้าจากขวาบนจอกว้าง และเป็นแผ่นเลื่อนขึ้นจากด้านล่างพร้อมขีดจับบนโทรศัพท์",
      dialog: "Dialog",
      dialogNote: "แผ่นกลางจอ สำหรับการตัดสินใจสั้นๆ",
      lightbox: "Lightbox",
      lightboxNote: "กดที่ภาพ ใช้ปุ่มลูกศร ปัดนิ้ว แถบภาพย่อบนจอกว้าง และปุ่ม Escape หากปิดสคริปต์ ภาพแต่ละภาพเป็นลิงก์ไปยังไฟล์",
      toast: "Toast",
      toastNote: "พื้นที่ประกาศเพียงจุดเดียว ปุ่มคัดลอกเปลี่ยนเป็นเครื่องหมายถูกพร้อมกับข้อความแจ้ง",
      facts: "FactList",
      glance: "AtAGlance",
      accordion: "Accordion",
      accordionNote: "ใช้ details ของเบราว์เซอร์ ความสูงค่อยๆ เปิดในเบราว์เซอร์ที่รองรับ",
      breadcrumbs: "Breadcrumbs และ LastUpdated",
      horizon: "Horizon และ SectionHeader",
      icons: "Icon",
    },
    demo: {
      openDrawer: "เปิดลิ้นชัก",
      openSheet: "เปิดแบบแผ่นด้านล่าง",
      openDialog: "เปิดหน้าต่าง",
      drawerTitle: "วางแผนเข้าพัก",
      sheetTitle: "เปรียบเทียบห้องพัก",
      dialogTitle: "ก่อนจอง",
      filters: "ตัวกรองภาพ",
      openPhoto: "เปิดดูภาพ",
      toastSaved: "คัดลอกข้อความแล้ว",
      panelWhite: "ขาว",
      panelSand: "ทราย",
      panelOutline: "เส้นขอบ",
      emailHint: "รีสอร์ทจะตอบกลับที่อีเมลนี้",
      fillLabel: "ดาดฟ้า",
    },
  },
} satisfies L<Chrome>;
