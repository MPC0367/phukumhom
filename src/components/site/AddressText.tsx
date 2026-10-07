import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { t } from "@/i18n/ui";
import styles from "./AddressText.module.css";

/**
 * The resort's published address as text that wraps only between its parts.
 *
 * The words printed are always the ruled string, `pub(site.address)[lang]` (BUILD-CONTRACT section 2).
 * This component only decides where a line may break: after the house and Moo number, after the
 * sub-district, after the district — never inside "28 Moo 22", and never between อำเภอ and ปากช่อง,
 * which is where a browser's Thai word-breaker would otherwise cut a narrow column.
 *
 * The groups are built from `site.addressParts`. If they ever stop adding up to the ruled string
 * (someone edits one and not the other), the ruled string is printed as plain text instead — the
 * wording is never taken from the parts.
 *
 * Renders nothing while the address is withheld. It is inline content: put it inside a <p> or an
 * <address>.
 */
function groups(lang: Locale): string[] {
  const p = site.addressParts;
  if (lang === "th") {
    return [p.streetAddress.th, p.subdistrict.th, p.district.th, `${p.province.th} ${p.postalCode}`];
  }
  return [`${p.streetAddress.en},`, `${p.subdistrict.en},`, `${p.district.en},`, `${p.province.en} ${p.postalCode},`, t("en").names.thailand];
}

export function AddressText({ lang }: { lang: Locale }) {
  const address = pub(site.address);
  if (!address) return null;
  const ruled = address[lang];
  const parts = groups(lang);
  if (parts.join(" ") !== ruled) return <>{ruled}</>;
  return (
    <>
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 ? " " : null}
          <span className={styles.group}>{part}</span>
        </span>
      ))}
    </>
  );
}
