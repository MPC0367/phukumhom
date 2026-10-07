import type { Asset, AssetId, Derivative, GalleryFilter, RoomId } from "@/content/schema";
import { withBase } from "@/lib/base-path";
import manifestJson from "./manifest.json";
import derivativesJson from "./derivatives.generated.json";

/**
 * Typed access to the photograph catalogue.
 *
 * manifest.json is the hand-reviewed record of every image (source, rights, what it shows, where it may be
 * used); derivatives.generated.json is written by `npm.cmd run images` and holds the files actually served.
 * Components never touch either file directly — they go through <Picture>/<Plate>, which call these helpers.
 */

export const assets: Asset[] = manifestJson as unknown as Asset[];

/**
 * The generated file stores URLs from the site root ("/media/…"). On a GitHub Pages project site the whole
 * site lives under a path prefix, which Next does not add to hand-written image URLs — so it is applied
 * here, once, and every <Picture>, srcset, lightbox item and social card picks it up.
 */
const derivatives: Record<AssetId, Derivative> = Object.fromEntries(
  Object.entries(derivativesJson as unknown as Record<AssetId, Derivative>).map(([id, d]) => [
    id,
    { ...d, variants: d.variants.map((v) => ({ ...v, webp: withBase(v.webp), jpg: v.jpg ? withBase(v.jpg) : v.jpg })) },
  ]),
);
const byId = new Map<AssetId, Asset>(assets.map((a) => [a.id, a]));

export function hasAsset(id: AssetId): boolean {
  return byId.has(id);
}

export function getAsset(id: AssetId): Asset {
  const asset = byId.get(id);
  if (!asset) throw new Error(`Unknown asset "${id}". Check src/content/assets/manifest.json.`);
  return asset;
}

export function getDerivative(id: AssetId): Derivative {
  const d = derivatives[id];
  if (!d) throw new Error(`No derivatives for asset "${id}". Run "npm.cmd run images".`);
  return d;
}

/** An asset is usable when the catalogue gives it at least one approved use. */
export function isUsable(asset: Asset): boolean {
  return asset.uses.length > 0 && asset.people !== "identifiable";
}

/** Photographs that may illustrate a room category: only those catalogued against that room. */
export function assetsForRoom(room: RoomId): Asset[] {
  return assets.filter((a) => isUsable(a) && a.rooms.includes(room)).sort((a, b) => b.quality - a.quality);
}

/** Gallery photographs, optionally narrowed to one filter, strongest first within the catalogue order. */
export function galleryAssets(filter?: GalleryFilter): Asset[] {
  return assets.filter((a) => isUsable(a) && a.uses.includes("gallery") && (filter ? a.gallery.includes(filter) : a.gallery.length > 0));
}

/** Filters that actually have photographs — an empty category is never offered. */
export function availableGalleryFilters(): GalleryFilter[] {
  const order: GalleryFilter[] = ["rooms", "rooftops", "gardens", "dining", "experiences"];
  return order.filter((f) => galleryAssets(f).length > 0);
}

export function srcSet(d: Derivative, format: "webp" | "jpg"): string {
  return d.variants
    .filter((v) => (format === "webp" ? v.webp : v.jpg))
    .map((v) => `${format === "webp" ? v.webp : v.jpg} ${v.width}w`)
    .join(", ");
}

/** The largest JPEG — the fallback `src`, and the file used for social cards and structured data. */
export function largest(d: Derivative): Derivative["variants"][number] {
  const withJpeg = d.variants.filter((v) => v.jpg);
  return withJpeg[withJpeg.length - 1];
}

/** True when the frame is cleared for full-bleed use and has the large derivatives. */
export function isBand(asset: Asset): boolean {
  return asset.uses.includes("hero") || asset.uses.includes("band");
}
