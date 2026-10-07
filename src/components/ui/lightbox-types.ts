/**
 * The plain data the lightbox works with. A Server Component builds it from the catalogue with
 * `lightboxItems()` and `lightboxLabels()` (lightbox-items.ts) and hands it to the client island:
 * strings and numbers only, so the photograph catalogue never travels in a client bundle.
 */

export interface LightboxItem {
  /** The catalogue id of the frame. */
  id: string;
  /** Full WebP srcset ("…-480.webp 480w, …"). */
  webp: string;
  /** Full JPEG srcset. */
  jpg: string;
  /** The largest JPEG: the <img src>, and where a trigger links to when JavaScript is off. */
  src: string;
  /** The smallest JPEG, for the thumbnail strip. */
  thumb: string;
  /** Intrinsic size of the master frame. */
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** The frame's average colour, painted while the file arrives. */
  ground: string;
}

export interface LightboxLabels {
  /** Accessible name of the dialog: ui.a11y.photoViewer. */
  viewer: string;
  close: string;
  previous: string;
  next: string;
  /** Pattern with {current} and {total}: ui.patterns.photoCount. */
  count: string;
  /** Shown in place of a photograph that did not load: ui.messages.photoFailed. */
  failed: string;
}
