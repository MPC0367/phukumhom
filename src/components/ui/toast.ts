/**
 * Say a short confirmation: "Address copied."
 *
 *   import { toast } from "@/components/ui/toast";
 *   toast(labels.addressCopied);
 *
 * It dispatches window CustomEvent "pkh:toast" { detail: { message } }; the one <ToastRegion> on the page
 * shows it as a pill at the bottom centre and announces it politely. Call it from client code only (an
 * event handler); the wording comes from a Server Component as a prop (ui.messages.*).
 *
 * A toast confirms something the guest just did. It never carries an error, a link or anything that has
 * to be read: it is gone in a few seconds. The control that was pressed should show the result too
 * (the copy button turns into a tick).
 */

export const TOAST_EVENT = "pkh:toast";

export interface ToastDetail {
  message: string;
}

export function toast(message: string): void {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message } }));
}
