import type { L, Locale } from "@/content/schema";
import styles from "./PreviewNotice.module.css";

/**
 * Shown only on the public concept preview (the GitHub Pages export sets NEXT_PUBLIC_PREVIEW_NOTICE=1).
 *
 * The preview is the studio's proposal, published before the resort has approved a word of it. A visitor
 * who lands on it must not mistake it for the resort's own website, so the footer says plainly whose work
 * it is and whose photographs they are. On the resort's real domain the variable is unset and nothing renders.
 */
const text: L = {
  en: "Concept preview by O2 Design Studio. This is not the official website of Phukumhom Resort. Photographs and information belong to the resort.",
  th: "เว็บไซต์ตัวอย่างโดย O2 Design Studio ยังไม่ใช่เว็บไซต์ทางการของภูคำหอม รีสอร์ท ภาพถ่ายและข้อมูลเป็นของรีสอร์ท",
};

export const PREVIEW_NOTICE = process.env.NEXT_PUBLIC_PREVIEW_NOTICE === "1";

export function PreviewNotice({ lang }: { lang: Locale }) {
  if (!PREVIEW_NOTICE) return null;
  return <p className={styles.notice}>{text[lang]}</p>;
}
