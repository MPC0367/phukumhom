import type { ReactNode } from "react";

/**
 * Text for assistive technology only — the suffix on an outbound link ("opens Google Maps"),
 * the heading of a region that needs a name but not a visible title.
 */
export interface VisuallyHiddenProps {
  as?: "span" | "p" | "h2" | "h3";
  id?: string;
  children: ReactNode;
}

export function VisuallyHidden({ as: Tag = "span", id, children }: VisuallyHiddenProps) {
  return (
    <Tag id={id} className="vh">
      {children}
    </Tag>
  );
}
