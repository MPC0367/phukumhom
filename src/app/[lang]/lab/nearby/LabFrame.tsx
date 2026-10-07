import type { ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/content/schema";
import { otherLocale } from "@/i18n/config";
import { MotionProvider } from "@/components/motion";
import { ToastRegion } from "@/components/ui/ToastRegion";
import s from "./lab.module.css";

/**
 * The frame the three H5 lab pages share (nearby, arrive, closing): a screen of paper above the section
 * so its scroll entrance can be judged, the section itself, and a screen below (left out for the
 * closing band, which is followed directly by the site footer, as on the real page).
 *
 * It mounts the motion provider and the toast region itself, so the section behaves here as it will on
 * the homepage whatever state the language layout is in: an inner provider steps aside for an outer one,
 * and a second toast region stays silent.
 *
 * Internal: noindex, not in the route table, the navigation or the sitemap.
 */
export function LabFrame({ lang, name, tail = true, children }: { lang: Locale; name: string; tail?: boolean; children: ReactNode }) {
  const other = otherLocale(lang);
  return (
    <MotionProvider>
      <ToastRegion />
      <div className={`container ${s.lead}`}>
        <h1 className="eyebrow">Lab, {name}</h1>
        <p className={s.hint}>Scroll down. The section starts below this screen so that its entrance can be seen.</p>
        <p className={s.links}>
          <Link href={`/${other}/lab/${name}`} lang={other} hrefLang={other}>
            {other === "th" ? "ไทย" : "English"}
          </Link>
          <Link href={`/${lang}/lab/nearby`}>nearby</Link>
          <Link href={`/${lang}/lab/arrive`}>arrive</Link>
          <Link href={`/${lang}/lab/closing`}>closing</Link>
        </p>
      </div>
      {children}
      {tail ? <div className={s.tail} aria-hidden="true" /> : null}
    </MotionProvider>
  );
}
