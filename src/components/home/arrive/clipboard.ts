/**
 * Put text on the clipboard. Resolves true only when it really got there, so a caller never confirms a
 * copy that did not happen.
 *
 * The asynchronous clipboard API first (it needs a secure context and, in some browsers, a permission).
 * Where that is missing or refused, the older route: a throwaway, off-screen <textarea> and the copy
 * command, which works inside the click that called this.
 *
 * Browser only: call it from an event handler.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Refused or unavailable: try the older route below.
  }

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.setAttribute("aria-hidden", "true");
    field.style.position = "fixed";
    field.style.inset = "0 auto auto 0";
    field.style.opacity = "0";
    field.style.pointerEvents = "none";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

/** Select an element's text, so a guest whose browser refused the copy can still press Ctrl or Cmd and C. */
export function selectText(id: string): void {
  const el = document.getElementById(id);
  const selection = window.getSelection();
  if (!el || !selection) return;
  selection.removeAllRanges();
  selection.selectAllChildren(el);
}
