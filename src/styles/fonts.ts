import { Cormorant_Garamond, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";

/**
 * Three families, self-hosted at build time by next/font (no browser request to Google).
 * All are variable fonts, so every weight in range comes from one file per subset and style.
 *
 * Cormorant Garamond — English display (hero line, chapter titles, statements). No Thai glyphs.
 * Noto Serif Thai    — Thai display, so Thai headings carry the same serif voice at their own scale.
 *                      Not preloaded: only Thai pages paint it, and it swaps in over the sans.
 * Noto Sans Thai     — all body and interface text in both languages. No italic: never italicize Thai.
 *
 * tokens.css composes the stacks: --font-display, --font-display-th, --font-sans.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai"],
  display: "swap",
  preload: false,
  variable: "--font-noto-serif-thai",
});

export const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-thai",
});

export const fontVariables = `${cormorant.variable} ${notoSerifThai.variable} ${notoThai.variable}`;
