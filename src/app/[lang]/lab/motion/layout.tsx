import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Loader, MotionProvider, ScrollProgress } from "@/components/motion";
import { MotionState } from "./LabProbes";

/**
 * The motion lab's shell: the loader, the provider and the progress hairline, in the order the language
 * layout will mount them.
 *
 *   <Loader />                     first, outside the provider
 *   <MotionProvider>
 *     <ScrollProgress />
 *     {pages}                      each wrapped by ./template.tsx (PageTransition)
 *   </MotionProvider>
 *
 * The provider stays mounted while the pages under it change, which is what makes route changes worth
 * testing here: smooth scrolling has to let go of the old page and take up the new one.
 *
 * Once the language layout carries these three itself, the copies here step aside: a second loader
 * never boots, and a nested provider passes straight through.
 */
export default async function MotionLabLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <Loader wordmark="PHUKUMHOM" sub={lang === "th" ? "รีสอร์ท เขาใหญ่" : "Resort Khao Yai"} label={lang === "th" ? "กำลังโหลด" : "Loading"} />
      <MotionProvider>
        <ScrollProgress />
        <MotionState />
        {children}
      </MotionProvider>
    </>
  );
}
