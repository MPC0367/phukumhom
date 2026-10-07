import type { ReactNode } from "react";

/**
 * A sentence with its one italic accent word (English display type only; Thai is never italic).
 *
 *   withAccent("Three kinds of room, each with a rooftop of its own.", "rooftop")
 *
 * An empty accent returns the text as it is. An accent that is not in the text is a mistake in the copy
 * file, so it throws instead of silently printing a plain line.
 */
export function withAccent(text: string, accent: string): ReactNode {
  if (!accent) return text;
  const at = text.indexOf(accent);
  if (at < 0) throw new Error(`withAccent: "${accent}" does not occur in "${text}".`);
  return (
    <>
      {text.slice(0, at)}
      <em>{accent}</em>
      {text.slice(at + accent.length)}
    </>
  );
}
