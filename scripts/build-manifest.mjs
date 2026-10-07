#!/usr/bin/env node
// Assembles src/content/assets/manifest.json from the reviewed catalogue.
//
//   node scripts/build-manifest.mjs
//
// Inputs : _src/catalog/*.json   one entry per legacy photograph, written after each frame was viewed
//          _src/dims.json        intrinsic dimensions measured from the downloaded files
// Output : src/content/assets/manifest.json
//
// The catalogue records what each frame shows. This script adds provenance and the art director's
// decisions about what may be used — every override below carries its reason, so the choice survives
// the next person who wonders why a perfectly sharp photograph is switched off.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(root, "_src/catalog");
const dims = new Map(JSON.parse(fs.readFileSync(path.join(root, "_src/dims.json"), "utf8")).map((d) => [d.file, d]));

/** Frames switched off by the art director although the catalogue left them usable. */
const EXCLUDE = {
  "01_17": "near-duplicate of 01_18, which is the cleaner frame",
  "02_04": "shows two single beds; bed configuration is not confirmed and a photograph would imply it",
  "04_08": "shows two beds in a different decor; bed configuration is not confirmed",
  "04_26": "the tub water is visibly churned, which implies jets we may not claim",
  "04_32": "staged with rose petals and underwater light; implies a set-up the resort has not confirmed it offers",
  "04_33": "staged with rose petals; implies a set-up the resort has not confirmed it offers",
  "04_35": "staged with rose petals at night; implies a set-up the resort has not confirmed it offers",
  "05_10": "a guest child stands in frame",
  "05_11": "a guest child stands in frame",
  "05_42": "monochrome treatment sits apart from every other plate",
  "06_04": "cycling is its subject and is not confirmed as currently available",
  "06_06": "pedal boats and kayaks are its subject and are not confirmed as currently available",
  "07_06": "produce shown in a plastic bowl; weaker than the garden-bed frames",
  "07_13": "gateway photographed around 2015 with flags of that period and an unpaved approach; may not match today",
  "07_14": "heavy vintage filter; the sign may not match today",
  "07_15": "very small (1000×458) and heavily saturated",
  "07_20": "countryside with nothing that ties the frame to the resort",
  "07_22": "countryside with nothing that ties the frame to the resort",
  "07_24": "countryside showing other people's buildings; not the resort",
  "07_25": "countryside with nothing that ties the frame to the resort",
  "07_26": "countryside showing other people's buildings; not the resort",
};

/** Uses added by the art director (ART-DIRECTION §6). */
const ADD_USES = {
  "01_24": ["hero", "story", "gallery", "location"],
  "02_08": ["story", "gallery", "hero"],
  "02_07": ["story", "room-gallery", "gallery"],
  "04_24": ["room-lead", "room-gallery", "gallery", "story"],
  "04_27": ["room-gallery", "gallery", "story"],
  "02_13": ["room-lead", "room-gallery", "experiences", "gallery"],
  "05_01": ["location", "gallery", "story"],
  "01_25": ["dining", "gallery", "story"],
};

/** Frames cleared for full-bleed use (ART-DIRECTION §4). They receive the large derivatives. */
const BAND = ["01_24", "02_08", "04_24", "04_25", "04_27", "01_01", "01_12", "02_13", "01_25", "05_41", "03_11", "01_08", "05_02", "01_10", "04_20", "05_45"];

/** Sensor dust in the hero's pale sky, located by eye on a contrast-stretched crop (source pixels). */
const HEAL = {
  "01_24": [
    { x: 978, y: 62, r: 9 },
    { x: 898, y: 200, r: 9 },
  ],
};

/** Frames whose colour the visual review found too strong beside the hero; they join the gentle global grade. */
const GRADE_CALM = ["01_21"];

/** The Thai term agreed in docs/VOICE.md for the Executive rooftop tub; "อ่างสปา" reads as a jetted hot tub. */
const thaiTerms = (s) => s.replaceAll("อ่างสปา", "อ่างแช่ตัว");

function galleryFilters(entry, legacyPrefix) {
  if (!entry.uses.includes("gallery")) return [];
  const c = entry.category;
  if (c === "rooftop" || c === "spa-tub") return ["rooftops"];
  if (c === "room-interior" || c === "bathroom" || c === "balcony") return entry.rooms.length ? ["rooms"] : [];
  if (c === "grounds" || c === "architecture") return ["gardens"];
  if (c === "restaurant" || c === "food") return ["dining"];
  if (c === "pool" || c === "reception" || c === "activity") return ["experiences"];
  if (c === "detail") {
    if (entry.uses.includes("dining")) return ["dining"];
    if (entry.rooms.includes("executive-pool-spa")) return ["rooftops"];
    if (["02", "03", "04"].includes(legacyPrefix)) return ["rooms"];
    if (legacyPrefix === "05") return ["dining"];
    return ["gardens"];
  }
  return [];
}

const entries = fs
  .readdirSync(catalogDir)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(catalogDir, f), "utf8")))
  .sort((a, b) => a.id.localeCompare(b.id));

const seen = new Set();
const manifest = [];
const problems = [];

for (const e of entries) {
  const d = dims.get(e.source);
  if (!d || !d.valid) {
    problems.push(`${e.id}: no valid source file`);
    continue;
  }
  if (seen.has(e.slug)) problems.push(`${e.id}: slug "${e.slug}" is not unique`);
  seen.add(e.slug);

  let uses = [...new Set([...(e.uses ?? []), ...(ADD_USES[e.id] ?? []), ...(BAND.includes(e.id) ? ["band"] : [])])];
  let exclusion = e.exclude ?? "";
  if (EXCLUDE[e.id]) {
    uses = [];
    exclusion = EXCLUDE[e.id];
  }
  if (e.people === "identifiable" || e.quality <= 2 || exclusion) uses = [];

  const prefix = e.id.slice(0, 2);
  const withUses = { ...e, uses };
  const asset = {
    id: e.slug,
    legacyId: e.id,
    source: e.source,
    sourceUrl: `https://www.phukumhom.com/images/g-picture/${e.id}.jpg`,
    rights: "preview-only",
    captured: null,
    currentCondition: "unverified",
    subject: e.subject,
    description: e.description,
    category: e.category,
    rooms: e.rooms,
    timeOfDay: e.timeOfDay,
    people: e.people,
    quality: e.quality,
    hdr: e.hdr,
    grade: GRADE_CALM.includes(e.id) ? "calm" : e.grade,
    showsSteps: Boolean(e.showsSteps),
    ...(HEAL[e.id] ? { heal: HEAL[e.id] } : {}),
    width: d.w,
    height: d.h,
    orientation: d.w > d.h ? "landscape" : d.w < d.h ? "portrait" : "square",
    focal: e.focal,
    mobileCrop: e.mobileCrop,
    alt: { en: e.alt.en, th: thaiTerms(e.alt.th) },
    caption: { en: e.caption.en, th: thaiTerms(e.caption.th) },
    uses,
    gallery: galleryFilters(withUses, prefix),
    excluded: exclusion,
    dated: e.dated ?? "",
  };
  for (const lang of ["en", "th"]) {
    if ([...asset.alt[lang]].length > 125) problems.push(`${e.id}: alt.${lang} is longer than 125 characters`);
    if (/\b(villa|jacuzzi|luxur|stunning|paradise)/i.test(asset.alt[lang] + asset.caption[lang])) problems.push(`${e.id}: banned word in ${lang} text`);
  }
  if (/pool/i.test(asset.alt.en + asset.caption.en) && (e.category === "spa-tub")) problems.push(`${e.id}: a spa-tub frame mentions "pool"`);
  manifest.push(asset);
}

fs.mkdirSync(path.join(root, "src/content/assets"), { recursive: true });
fs.writeFileSync(path.join(root, "src/content/assets/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const usable = manifest.filter((a) => a.uses.length);
const count = (fn) => usable.filter(fn).length;
console.log(`${manifest.length} catalogued · ${usable.length} usable · ${manifest.length - usable.length} switched off`);
console.log(
  `gallery: rooms ${count((a) => a.gallery.includes("rooms"))} · rooftops ${count((a) => a.gallery.includes("rooftops"))} · gardens ${count((a) => a.gallery.includes("gardens"))} · dining ${count((a) => a.gallery.includes("dining"))} · experiences ${count((a) => a.gallery.includes("experiences"))}`,
);
for (const room of ["deluxe-balcony", "deluxe-bathtub", "executive-pool-spa"]) console.log(`${room}: ${count((a) => a.rooms.includes(room))} usable frames`);
if (problems.length) {
  console.error("\nProblems:\n" + problems.join("\n"));
  process.exitCode = 1;
}
