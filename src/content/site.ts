import { fact, unknown, type Fact, type FlagId, type L, type Phone, type SiteSettings } from "./schema";
import { BOOKING_PROVIDER, FLAGS, GA4_MEASUREMENT_ID } from "./site-public";

/**
 * Site settings: identity, the one canonical contact, the booking provider, feature flags.
 *
 * Every value is a row in docs/RESEARCH.md (ids in the comments) under a ruling in
 * docs/BUILD-CONTRACT.md §2, §3 or §8. Guest-facing code reads facts through `pub()` only.
 * No fact here has been confirmed by the owner; "confirmed" means we followed it end to end
 * on a channel the resort controls.
 */
export const site: SiteSettings = {
  // ID-01, ID-02
  name: { en: "Phukumhom Resort Khao Yai", th: "ภูคำหอม รีสอร์ท เขาใหญ่" },
  // ID-03
  shortName: { en: "Phukumhom", th: "ภูคำหอม" },
  locality: { en: "Wang Katha, Khao Yai", th: "วังกะทะ เขาใหญ่" },
  defaultLocale: "th",
  origin: {
    // ID-05. The legacy domain; nothing is deployed there by this build.
    production: "https://www.phukumhom.com",
    preview: "http://127.0.0.1:8352",
  },
  lastUpdated: "2026-10-07",

  // ID-06, ID-07
  address: fact<L>(
    {
      en: "28 Moo 22, Wang Katha, Pak Chong, Nakhon Ratchasima 30130, Thailand",
      th: "28 หมู่ 22 ตำบลวังกะทะ อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
    },
    "source-listed",
    ["S-12", "S-01", "S-19", "S-22", "S-06", "S-29"],
    "House number, Moo, sub-district, district, province and postcode agree across the legacy contact page, Google, Trip.com, Traveloka and the Facebook mirror; only the romanisation differs. No resort channel prints the full Thai string (owner question Q-32). Google's address also inserts the village Phoem Sombat (ID-08), which is not part of the ruled address.",
  ),
  addressParts: {
    streetAddress: { en: "28 Moo 22", th: "28 หมู่ 22" },
    subdistrict: { en: "Wang Katha", th: "ตำบลวังกะทะ" },
    district: { en: "Pak Chong", th: "อำเภอปากช่อง" },
    province: { en: "Nakhon Ratchasima", th: "จังหวัดนครราชสีมา" },
    postalCode: "30130",
    countryCode: "TH",
  },

  // ID-10
  phone: fact<Phone>(
    { national: "065 542 9451", international: "+66 65 542 9451", e164: "+66655429451" },
    "source-listed",
    ["S-01", "S-06"],
    "The only number printed anywhere (contract §2). On the Google listing re-read 7 Oct 2026 and first in the signature of the resort's Sept 2026 posts. Four other numbers circulate (ledger rows ID-11 to ID-14, RESEARCH §4.5): a second mobile in the post signature, two landlines on the legacy contact page and a mobile inside an HTML comment there. They are deliberately not copied into this module, which can reach the browser bundle. Owner questions Q-01, Q-02.",
  ),

  // ID-16, ID-17. Withheld (contract §2: "Not rendered"), so the value is null here, like the other phone numbers.
  email: unknown<string>(
    "Two legacy addresses exist; see ledger rows ID-16 and ID-17. Deliberately not copied into this module, which reaches the browser bundle. Owner question Q-04.",
    ["S-07", "S-08", "S-12", "S-28"],
  ),

  social: {
    // ID-18
    facebook: fact<string>(
      "https://www.facebook.com/PhukumhomResort",
      "confirmed",
      ["S-07", "S-08", "S-12", "S-06"],
      "Linked from the resort's own home and contact pages; the mirror shows the page posting through Sept 2026. No m.me address was seen (ID-19): do not derive one.",
    ),
    // ID-21
    instagram: unknown<string>(
      "No link or handle on any crawled page or in the Facebook mirror. That does not show none exists. Flag off until a real URL is supplied (Q-30).",
      ["S-06", "S-29"],
    ),
    // ID-20
    line: unknown<string>(
      "The resort's post signature carries the label 'Line:' with nothing after it in the mirror; no LINE address or ID on any crawled page. Flag off (Q-30).",
      ["S-06"],
    ),
    // ID-21
    whatsapp: unknown<string>(
      "No number or link published for WhatsApp on any source. Never derive one from the phone number. Flag off (Q-30).",
      ["S-06", "S-29"],
    ),
  },

  maps: {
    // ID-26
    listingUrl: fact<string>(
      "https://www.google.com/maps?cid=18118211451784483914",
      "confirmed",
      ["S-01", "S-14", "S-06"],
      "The resort's own Google Maps listing: the legacy site's map link and the map link in the Sept 2026 posts both resolve to this feature id. Label it 'Open in Google Maps'. It is not a checked arrival-gate pin.",
    ),
    // ID-27
    coordinates: unknown<{ lat: number; lng: number }>(
      "Nobody has checked that the listing's pin is the entrance. Coordinates circulate in our reports and in the legacy map link; they are not printed and never go into JSON-LD (no geo). Owner question Q-14.",
      ["S-01", "S-27"],
    ),
  },

  // ID-22 … ID-25, contract §3
  // The values live in site-public.ts so browser code can read them without the notes in this file.
  booking: BOOKING_PROVIDER,

  // PO-01, PO-02. Shown with "as currently listed; your booking confirmation is the reference".
  checkIn: fact<string>(
    "14:00",
    "source-listed",
    ["S-02", "S-19", "S-22", "S-20"],
    "From 14:00. Google 2:00 PM, Trip.com after 14:00, Traveloka 14:00, Booking.com per the contract. Owner question Q-08.",
  ),
  checkOut: fact<string>(
    "12:00",
    "source-listed",
    ["S-02", "S-19", "S-22", "S-20"],
    "Until 12:00. Google 12:00 PM, Trip.com before 12:00, Traveloka 12:00. Owner question Q-08.",
  ),

  flags: FLAGS,

  analytics: { ga4MeasurementId: GA4_MEASUREMENT_ID },
};

export const flag = (id: FlagId): boolean => site.flags[id];

/**
 * Property-level facts the FAQ answers from. They sit beside `site` rather than inside it because
 * `SiteSettings` (schema.ts) has no fields for them yet; read them through `pub()` like any other fact.
 *
 * Wi-Fi and parking are published at property level only and only "as currently listed" (contract §2):
 * never as a room amenity, never a speed, coverage or capacity claim.
 */
export interface PropertyFacts {
  /** Free Wi-Fi somewhere on the property. Not an in-room amenity. */
  wifi: Fact<boolean>;
  /** Free parking on site. */
  parking: Fact<boolean>;
  /** `false` = current listings say pets are not accepted. */
  petsAccepted: Fact<boolean>;
}

export const propertyFacts: PropertyFacts = {
  // Contract §2 "Wi-Fi, parking". Ledger row RM-22 withholds Wi-Fi as an in-room amenity; that stands.
  wifi: fact<boolean>(
    true,
    "source-listed",
    ["S-03", "S-02", "S-19"],
    "Property level only, contract §2: the booking engine, the Google listing and Trip.com list free Wi-Fi (Oct 2026). Published as 'as currently listed'. Never a room amenity (RM-22, RESEARCH §5), never a speed or coverage claim. Owner question Q-22.",
  ),
  // FA-13
  parking: fact<boolean>(
    true,
    "source-listed",
    ["S-03", "S-02", "S-19", "S-17"],
    "Property level only, contract §2: the booking engine, the Google listing and Trip.com list free parking; the layout map marks a car park. Published as 'as currently listed'. Capacity unknown. Owner question Q-28.",
  ),
  // PO-03
  petsAccepted: fact<boolean>(
    false,
    "source-listed",
    ["S-02", "S-19", "S-20"],
    "Google says 'No pets' and Trip.com says pets are not allowed. Guest copy uses the contract's wording, which asks guests to check with the resort before travelling with an animal.",
  ),
};
