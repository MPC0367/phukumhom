import { fact, pub, type ReviewReference } from "./schema";
import { site } from "./site";

/**
 * Where guests can read reviews — links out, never quotations.
 *
 * Contract §2 and §8, RESEARCH §3.7 and §4.7: no quoted reviews, reviewer names, portraits, composite
 * scores, or review / rating JSON-LD, ever. Exactly one figure may render, behind the `reviewRating` flag
 * and always with its date and a link to the listing: Google's, read directly on 7 Oct 2026. Every other
 * platform's figure is `needs-confirmation` — stored as what a source said, returned as `null` by `pub()`.
 * If the Google figure cannot be re-read at release time, turn the flag off; the link then reads
 * "Read guest reviews".
 *
 * Keep this module on the server: it stores the other platforms' unpublished figures, so it must never be
 * imported from a "use client" file (site.ts is; see the note on `email` there).
 */

// The resort's own Google listing (RESEARCH ID-26): the same address the map link uses, stored once in
// site.ts and read through `pub()`. If that fact is ever withheld, the Google line goes with it.
const googleListing = pub(site.maps.listingUrl);

const googleReview: ReviewReference[] = googleListing
  ? [
      {
        id: "google",
        platform: "Google",
        url: googleListing,
        // RP-01
        rating: fact(
          { score: 4.6, scale: 5, count: 308 },
          "source-listed",
          ["S-02"],
          "Read directly on the Google listing on 7 Oct 2026: 4.6 from 308 reviews. Snapshot — re-read before every release. Owner question Q-33.",
          "2026-10-07",
        ),
      },
    ]
  : [];

export const reviews: ReviewReference[] = [
  ...googleReview,
  {
    id: "booking",
    platform: "Booking.com",
    url: "https://www.booking.com/hotel/th/phukumhom.html",
    // RP-04
    rating: fact(
      { score: 8.2, scale: 10, count: 37 },
      "needs-confirmation",
      ["S-20", "S-27"],
      "Second-hand: from our report S-27, not re-read (the listing returned an empty response on 7 Oct 2026). The score varies by locale. Never displayed.",
    ),
  },
  {
    id: "tripcom",
    platform: "Trip.com",
    url: "https://www.trip.com/hotels/pak-chong-hotel-detail-710943/phukumhom-khao-yai/",
    // RP-02
    rating: fact(
      { score: 9.3, scale: 10, count: 14 },
      "needs-confirmation",
      ["S-19"],
      "Read on 7 Oct 2026 through an automated page summariser, not by eye. Never displayed.",
    ),
  },
  {
    id: "tripadvisor",
    platform: "Tripadvisor",
    url: "https://th.tripadvisor.com/Hotel_Review-g641719-d2672033-Reviews-Phukumhom-Pak_Chong_Pak_Chong_District_Nakhon_Ratchasima_Province.html",
    // RP-05
    rating: fact(
      { score: 4.4, scale: 5, count: 25 },
      "needs-confirmation",
      ["S-23", "S-27", "S-02"],
      "Second-hand: from our report S-27; the listing answered HTTP 403 on 7 Oct 2026. Mostly old reviews. Never displayed.",
    ),
  },
];
