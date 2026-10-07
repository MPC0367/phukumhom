import type { SourceId, SourceRecord } from "./schema";

/**
 * The source register. Every `Fact` in src/content points at one or more of these ids.
 *
 * S-01 … S-31 mirror docs/sources.json and the register in docs/RESEARCH.md §2 (same ids, same order).
 * S-32 … S-39 are the first-party and government pages behind the places in src/content/nearby.ts;
 * their evidence is written up in docs/nearby-research.md (S-31).
 *
 * Nothing in this file is guest copy and nothing here is rendered.
 */
export const sources: SourceRecord[] = [
  {
    id: "S-01",
    label: "Google Business Profile (Google Maps listing): identity, phone, address, pin",
    url: "https://www.google.com/maps?cid=18118211451784483914",
    kind: "official-current",
    read: "2026-10-07",
  },
  {
    id: "S-02",
    label: "Google hotel listing: Google-compiled times, amenities, class, description, review score and count",
    url: "https://www.google.com/travel/hotels/entity/CgsIyqid6KKqtLj7ARAB",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-03",
    label: "Booking engine (eZee / LetsBook): room names, occupancy and size fields, amenity lists, rate-plan labels",
    url: "https://letsbook.me/booking/phukumhomresort",
    kind: "provider",
    read: "2026-10-07",
  },
  {
    id: "S-04",
    label: "Legacy booking entry (eZee ipms247), redirects to S-03",
    url: "https://live.ipms247.com/booking/book-rooms-phukumhomresort",
    kind: "provider",
    read: "2026-10-07",
  },
  {
    id: "S-05",
    label: "Facebook page (identity only; timeline read through S-06)",
    url: "https://www.facebook.com/PhukumhomResort",
    kind: "official-current",
    read: "2026-10-07",
  },
  {
    id: "S-06",
    label: "Mirror of the Facebook page (findglocal): nine posts, 2-14 Sep 2026, with contact signature",
    url: "https://www.findglocal.com/TH/Amphoe-Pak-Chong/145125185576403/Phukumhom-Resort--%E0%B8%A0%E0%B8%B9%E0%B8%84%E0%B8%B3%E0%B8%AB%E0%B8%AD%E0%B8%A1-%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B9%83%E0%B8%AB%E0%B8%8D%E0%B9%88",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-07",
    label: "Legacy website: home page, Thai",
    url: "https://www.phukumhom.com/th/index.php?page=index",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-08",
    label: "Legacy website: home page, English",
    url: "https://www.phukumhom.com/en/index.php?page=index",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-09",
    label: "Legacy website: About, Thai (kitchen garden, room totals, sizes, activities)",
    url: "https://www.phukumhom.com/th/about.php?page=about",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-10",
    label: "Legacy website: About, English (rooftops, activities, restaurant)",
    url: "https://www.phukumhom.com/en/about.php?page=about",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-11",
    label: "Legacy website: Room & Rate page (the /th/ page carries the same English text)",
    url: "https://www.phukumhom.com/en/rate.php?page=rate",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-12",
    label: "Legacy website: Contact page (/th/ and /en/ identical)",
    url: "https://www.phukumhom.com/th/contact.php?page=contact",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-13",
    label: "Legacy website: directions, Thai",
    url: "https://www.phukumhom.com/th/howto-get-here.php?page=howto-get-here",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-14",
    label: "Legacy website: directions, English",
    url: "https://www.phukumhom.com/en/howto-get-here.php?page=howto-get-here",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-15",
    label: "Legacy website: Special Offer page",
    url: "https://www.phukumhom.com/en/special-offer.php?page=special-offer",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-16",
    label: "Legacy website: gallery and photographs (uploaded 22 May 2015; preview-only)",
    url: "https://www.phukumhom.com/en/gallery.php?page=gallery",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-17",
    label: "Legacy website: resort layout map image",
    url: "https://www.phukumhom.com/images/phukumhom-layout.jpg",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-18",
    label: "Legacy website: route map image",
    url: "https://www.phukumhom.com/images/full-map.jpg",
    kind: "official-legacy",
    read: "2026-10-07",
  },
  {
    id: "S-19",
    label: "Trip.com listing (read through an automated summariser)",
    url: "https://www.trip.com/hotels/pak-chong-hotel-detail-710943/phukumhom-khao-yai/",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-20",
    label: "Booking.com listing (as read for our reports; not re-read)",
    url: "https://www.booking.com/hotel/th/phukumhom.html",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-21",
    label: "Agoda reviews page (indexed statistics only)",
    url: "https://www.agoda.com/phukumhom-resort/reviews/khao-yai-th.html",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-22",
    label: "Traveloka listing, th-th (read through an automated summariser)",
    url: "https://www.traveloka.com/th-th/hotel/thailand/phukumhom-resort-khaoyai-1000000492041",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-23",
    label: "TripAdvisor listing (small, mostly historical sample)",
    url: "https://th.tripadvisor.com/Hotel_Review-g641719-d2672033-Reviews-Phukumhom-Pak_Chong_Pak_Chong_District_Nakhon_Ratchasima_Province.html",
    kind: "third-party-old",
    read: "2026-10-07",
  },
  {
    id: "S-24",
    label: "centerwedding.com venue listing (undated; resort not found at this address on re-read)",
    url: "https://www.centerwedding.com/nakhon-ratchasima/venues/?district=3341&event=13",
    kind: "third-party-old",
    read: "2026-10-07",
  },
  {
    id: "S-25",
    label: "chillpainai feature, January 2018 (cited by S-27; article address not recorded)",
    url: "https://www.chillpainai.com/",
    kind: "third-party-old",
    read: "2026-10-07",
  },
  {
    id: "S-26",
    label: "Pantip review thread 36131723 (cited by S-27; not re-read)",
    url: "https://pantip.com/topic/36131723",
    kind: "third-party-old",
    read: "2026-10-07",
  },
  {
    id: "S-27",
    label: "Our report: business and market intelligence",
    url: "docs/brief/business-intelligence.html",
    kind: "own-research",
    read: "2026-10-07",
  },
  {
    id: "S-28",
    label: "Our report: website audit",
    url: "docs/brief/website-audit.html",
    kind: "own-research",
    read: "2026-10-07",
  },
  {
    id: "S-29",
    label: "The build brief (instruction; fixes the canonical brand spelling)",
    url: "docs/brief/master-prompt.txt",
    kind: "own-research",
    read: "2026-10-07",
  },
  {
    id: "S-30",
    label: "Live checks recorded in the build contract (booking parameters, Google profile)",
    url: "docs/BUILD-CONTRACT.md",
    kind: "own-research",
    read: "2026-10-07",
  },
  {
    id: "S-31",
    label: "Nearby-places check",
    url: "docs/nearby-research.md",
    kind: "own-research",
    read: "2026-10-07",
  },

  /* ───────────── Places around the resort (evidence in docs/nearby-research.md) ───────────── */

  {
    id: "S-32",
    label: "Alcidini Winery: its own website (address in Wang Katha, visiting statement)",
    url: "https://www.alcidini.com/",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-33",
    label: "GranMonte Vineyard and Winery: its own website (address in Phaya Yen, tour page)",
    url: "https://www.granmonte.com/",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-34",
    label: "Wat Pa Phu Hai Long: the temple's own Facebook page",
    url: "https://www.facebook.com/phuhailong",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-35",
    label: "Pak Chong district Community Development Office: page placing Wat Pa Phu Hai Long in Wang Katha",
    url: "https://pakchong.cdd.go.th/th/content/category/detail/id/8/iid/327416",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-36",
    label: "Department of National Parks: Khao Yai National Park page",
    url: "https://nps.dnp.go.th/parksdetail.php?id=1",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-37",
    label: "Tellus Cafe Khaoyai: the cafe's own Facebook page",
    url: "https://www.facebook.com/telluscafe.khaoyai/",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-38",
    label: "Lucine.Khaoyai: the restaurant's own Facebook page (held: newest visible post January 2026)",
    url: "https://www.facebook.com/lucine.khaoyai",
    kind: "third-party-current",
    read: "2026-10-07",
  },
  {
    id: "S-39",
    label: "PB Valley Khao Yai Winery: its own website (held: no first-party content dated 2026)",
    url: "https://www.pbvalley.com/",
    kind: "third-party-current",
    read: "2026-10-07",
  },
];

const byId = new Map<SourceId, SourceRecord>(sources.map((s) => [s.id, s]));

export function getSource(id: SourceId): SourceRecord {
  const record = byId.get(id);
  if (!record) throw new Error(`Unknown source "${id}". Register it in src/content/sources.ts.`);
  return record;
}
