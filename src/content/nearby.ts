import { isPublishable, type NearbyPlace } from "./schema";

/**
 * Places to visit around Khao Yai — the rows of docs/nearby.json, with their status.
 *
 * Evidence for every row is in docs/nearby-research.md (S-31) and each place's own page (S-32 … S-39).
 * Rules the blurbs follow (contract §8): no distances, journey times, hours, prices or "nearby";
 * "in Wang Katha" only where an address says so; the two vineyards are described as estates to visit,
 * with no tasting or drinking language.
 *
 * Seven rows are kept: five `source-listed` and two held as `needs-confirmation`. Guest pages read
 * `publishedNearby` only. Rows are ordered by group (vineyards, temples, nature, cafes) so the list can
 * be rendered as it stands.
 */
export const nearby: NearbyPlace[] = [
  /* ───────────── Vineyards ───────────── */
  {
    id: "alcidini-winery",
    name: { en: "Alcidini Winery", th: "ไร่องุ่นอัลซิดินี่ (Alcidini Winery)" },
    group: "vineyards",
    blurb: {
      en: "A vineyard and winery in Wang Katha that makes its wines from Shiraz and Muscat Blue grapes grown on its own land. Check opening times before you go.",
      th: "ไร่องุ่นและโรงผลิตไวน์ในตำบลวังกะทะ ผลิตไวน์จากองุ่นชีราซและมัสแคตบลูที่ปลูกในไร่ของตัวเอง ควรตรวจสอบเวลาเปิดทำการก่อนเดินทาง",
    },
    url: "https://www.alcidini.com/",
    status: "source-listed",
    sources: ["S-31", "S-32"],
  },
  {
    id: "granmonte",
    name: { en: "GranMonte Vineyard and Winery", th: "ไร่องุ่นกราน-มอนเต้ (GranMonte)" },
    group: "vineyards",
    blurb: {
      en: "A vineyard and winery in Phaya Yen, Pak Chong, with guided tours of the vines and winery in Thai and English and a restaurant on the estate. Check tour times before you go.",
      th: "ไร่องุ่นและโรงผลิตไวน์ในตำบลพญาเย็น อำเภอปากช่อง มีทัวร์ชมไร่และโรงผลิตไวน์ที่บรรยายทั้งภาษาไทยและภาษาอังกฤษ และมีร้านอาหารภายในไร่ ควรตรวจสอบรอบทัวร์ก่อนเดินทาง",
    },
    url: "https://www.granmonte.com/",
    status: "source-listed",
    sources: ["S-31", "S-33"],
  },
  {
    // Held: no first-party content dated 2026, and an unrelated injected outbound link on its home page.
    id: "pb-valley",
    name: { en: "PB Valley Khao Yai Winery", th: "PB Valley Khao Yai Winery" },
    group: "vineyards",
    blurb: {
      en: "A vineyard and winery in Phaya Yen, Pak Chong, with guided vineyard tours and a restaurant. Check tour times before you go.",
      th: "ไร่องุ่นและโรงผลิตไวน์ในตำบลพญาเย็น อำเภอปากช่อง มีทัวร์ชมไร่พร้อมผู้นำชมและมีร้านอาหาร ควรตรวจสอบรอบทัวร์ก่อนเดินทาง",
    },
    url: "https://www.pbvalley.com/",
    status: "needs-confirmation",
    sources: ["S-31", "S-39"],
  },

  /* ───────────── Temples ───────────── */
  {
    // The sub-district comes from the district government office (S-35), not from the temple's own page.
    id: "wat-pa-phu-hai-long",
    name: { en: "Wat Pa Phu Hai Long", th: "วัดป่าภูหายหลง" },
    group: "temples",
    blurb: {
      en: "A forest monastery on a hilltop at Ban Sap Samran in Wang Katha, with an ordination hall and an upper terrace that looks out over the surrounding hills. Check visiting hours before you go.",
      th: "วัดป่าบนยอดเขาที่บ้านซับสำราญ ตำบลวังกะทะ มีอุโบสถและลานด้านบนที่มองเห็นทิวเขาโดยรอบ ควรตรวจสอบเวลาเปิดให้เข้าชมก่อนเดินทาง",
    },
    url: "https://www.facebook.com/phuhailong",
    status: "source-listed",
    sources: ["S-31", "S-34", "S-35"],
  },

  /* ───────────── Nature ───────────── */
  {
    // The resort is not inside the park (RESEARCH LO-02); the blurb makes no closeness claim.
    id: "khao-yai-national-park",
    name: { en: "Khao Yai National Park", th: "อุทยานแห่งชาติเขาใหญ่" },
    group: "nature",
    blurb: {
      en: "A national park of forested mountains and waterfalls, home to wild elephants and deer, managed by the Department of National Parks, Wildlife and Plant Conservation. Ask the park which sites are open before you go.",
      th: "อุทยานแห่งชาติที่เป็นเทือกเขาและผืนป่า มีน้ำตกหลายแห่ง และเป็นถิ่นอาศัยของช้างป่าและกวาง อยู่ในความดูแลของกรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช ควรสอบถามอุทยานฯ ว่าแหล่งท่องเที่ยวใดเปิดอยู่ก่อนเดินทาง",
    },
    url: "https://nps.dnp.go.th/parksdetail.php?id=1",
    status: "source-listed",
    sources: ["S-31", "S-36"],
  },

  /* ───────────── Cafes ───────────── */
  {
    id: "tellus-cafe-khaoyai",
    name: { en: "Tellus Cafe Khaoyai", th: "Tellus Cafe Khaoyai" },
    group: "cafes",
    blurb: {
      en: "A café at Ban Sap Samran in Wang Katha serving drinks, desserts and food. Check opening times before you go.",
      th: "คาเฟ่ที่บ้านซับสำราญ ตำบลวังกะทะ มีเครื่องดื่ม ของหวาน และอาหาร ควรตรวจสอบเวลาเปิดทำการก่อนเดินทาง",
    },
    url: "https://www.facebook.com/telluscafe.khaoyai/",
    status: "source-listed",
    sources: ["S-31", "S-37"],
  },
  {
    // Held: newest visible post is January 2026; shares an address with Tellus Cafe; and whether the
    // resort wants to point guests to another restaurant is the owner's decision.
    id: "lucine-khaoyai",
    name: { en: "Lucine.Khaoyai", th: "Lucine.Khaoyai" },
    group: "cafes",
    blurb: {
      en: "A restaurant at 98 Moo 11, Wang Katha, serving Thai fusion dishes, steak, pasta and Korean barbecue. Check opening days and times before you go.",
      th: "ร้านอาหารที่ 98 หมู่ 11 ตำบลวังกะทะ มีอาหารไทยฟิวชัน สเต๊ก สปาเกตตี และบาร์บีคิวเกาหลี ควรตรวจสอบวันและเวลาเปิดทำการก่อนเดินทาง",
    },
    url: "https://www.facebook.com/lucine.khaoyai",
    status: "needs-confirmation",
    sources: ["S-31", "S-38"],
  },
];

/** The only list a guest page renders: five places, in group order. */
export const publishedNearby: NearbyPlace[] = nearby.filter((place) => isPublishable(place.status));
