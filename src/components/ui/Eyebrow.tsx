import { Kicker, type KickerProps } from "./Kicker";

/**
 * The first build's name for <Kicker>. Same element, same class; kept so existing imports keep working.
 * New code should import Kicker.
 */
export type EyebrowProps = Pick<KickerProps, "id" | "className" | "children"> & { as?: "p" | "span" };

export function Eyebrow(props: EyebrowProps) {
  return <Kicker {...props} />;
}
