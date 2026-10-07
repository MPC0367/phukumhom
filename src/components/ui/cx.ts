/** Joins class names, skipping anything falsy. Shared by the primitives; no dependency needed. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
