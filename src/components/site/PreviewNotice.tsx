import type { L, Locale } from "@/content/schema";
import { IS_PREVIEW } from "@/content/site-public";
import styles from "./PreviewNotice.module.css";

/**
 * Shown on every deployment that is not the resort's own production site (IS_PREVIEW, site-public.ts).
 *
 * The preview is the studio's proposal, published before the resort has approved a word of it. A visitor
 * who lands on it must not mistake it for the resort's own website, so the footer says plainly whose work
 * it is and whose photographs they are. In production mode nothing renders.
 */
const text: L = {
  en: "Concept preview by O2 Design Studio. This is not the official website of Phukumhom Resort. Photographs and information belong to the resort.",
  th: "เว็บไซต์ตัวอย่างโดย O2 Design Studio ยังไม่ใช่เว็บไซต์ทางการของภูคำหอม รีสอร์ท ภาพถ่ายและข้อมูลเป็นของรีสอร์ท",
};


export function PreviewNotice({ lang }: { lang: Locale }) {
  if (!IS_PREVIEW) return null;
  return <p className={styles.notice}>{text[lang]}</p>;
}
