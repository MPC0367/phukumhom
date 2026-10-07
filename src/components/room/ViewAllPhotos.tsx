"use client";

import { Button } from "@/components/ui/Button";
import { useLightbox } from "@/components/ui/Lightbox";

/**
 * "View all photos": opens the photograph viewer at the first frame of the set it sits in.
 *
 *   <LightboxRoot items={…} labels={…}>
 *     <ViewAllPhotos label={ui.actions.viewAllPhotos} fallbackHref={items[0].src} />
 *     …the triggers…
 *   </LightboxRoot>
 *
 * It must be rendered inside a <LightboxRoot>. Focus returns to this button when the viewer closes.
 * Without script (and before the page is live) it is a plain link to the first photograph's file, so
 * the control is never dead.
 */
export interface ViewAllPhotosProps {
  label: string;
  /** The first photograph's largest file: where the control leads without script. */
  fallbackHref: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export function ViewAllPhotos({ label, fallbackHref, variant = "secondary", className }: ViewAllPhotosProps) {
  const lightbox = useLightbox();
  return (
    <Button
      href={fallbackHref}
      external
      variant={variant}
      icon="plus"
      className={className}
      aria-haspopup="dialog"
      onClick={(event) => {
        // A modified click (new tab) keeps the link's own behaviour.
        if (!lightbox || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        lightbox.open(0, event.currentTarget);
      }}
    >
      {label}
    </Button>
  );
}
