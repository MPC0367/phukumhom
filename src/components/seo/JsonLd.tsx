import type { JsonLdNode } from "@/lib/seo";

/**
 * Structured data as a native <script type="application/ld+json">. A Server Component: it renders
 * to static HTML and ships no JavaScript.
 *
 *   <JsonLd data={[webPageJsonLd(lang, "stay"), breadcrumbJsonLd(lang, trail)]} />
 *
 * Empty input (null, undefined, an empty list) renders nothing, so a caller can pass the result of
 * a builder that had nothing publishable to say.
 */

type Input = JsonLdNode | null | undefined | false;

/**
 * JSON that is safe inside a <script> element: `<`, `>` and `&` are written as unicode escapes, so
 * no string value can close the element or open a comment, and the two line separators that are
 * legal in JSON but not in older script parsers are escaped as well. The parsed value is unchanged.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: { data: Input | Input[] }) {
  const nodes = (Array.isArray(data) ? data : [data]).filter((node): node is JsonLdNode => typeof node === "object" && node !== null);
  if (nodes.length === 0) return null;
  const payload = nodes.length === 1 ? nodes[0] : nodes;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }} />;
}
