/**
 * The design-system primitives, direction 2 ("Open sky"). Everything a guest sees is assembled from these;
 * the living reference is /{lang}/styleguide and the measured colour pairs are in docs/contrast.md.
 *
 * Server Components: import from here.
 *   import { Band, Button, Chapter, Frame, Picture, Tile, TileRow } from "@/components/ui";
 *
 * Client islands ("use client" files): import the one file you need instead:
 *   import { Button } from "@/components/ui/Button";
 *   import { Drawer } from "@/components/ui/Drawer";
 *   import { toast } from "@/components/ui/toast";
 * so the island's bundle never pulls in <Picture>/<Frame>/lightboxItems and, with them, the photograph
 * catalogue (about 380 KB of JSON). Pass pictures into an island as rendered children.
 *
 * Client components here: Dialog, Drawer, LightboxRoot, LightboxTrigger, ToastRegion. None of them
 * accepts a function from a Server Component: see the docblock in Drawer.tsx for the pattern.
 *
 * Motion (Reveal, SplitReveal, MediaReveal, Parallax, CountUp, …) lives in src/components/motion, not here.
 *
 * Surfaces: .on-sand, .on-white, .on-twilight, .on-forest and .on-photo (src/styles/base.css) re-point the
 * semantic tokens, and every primitive follows them. A light panel inside a dark band (Panel, Drawer,
 * Dialog, AtAGlance) restates the light tokens and carries data-ground="light".
 */

export { Accordion, type AccordionItem, type AccordionProps } from "./Accordion";
export { AtAGlance, type AtAGlanceProps } from "./AtAGlance";
export { Band, type BandProps } from "./Band";
export { Breadcrumbs, type BreadcrumbsProps, type Crumb } from "./Breadcrumbs";
export { Button, type ButtonIcon, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";
export { Chapter, type ChapterProps } from "./Chapter";
export { Chip, type ChipProps } from "./Chip";
export { Container, type ContainerProps } from "./Container";
export { Dialog, type DialogProps } from "./Dialog";
export { Drawer, type DrawerProps } from "./Drawer";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { FactList, type FactItem, type FactListProps } from "./FactList";
export { Field, SelectField, TextareaField, type FieldProps, type SelectFieldProps, type TextareaFieldProps } from "./Field";
export { Frame, type FrameProps } from "./Frame";
export { Horizon, type HorizonProps } from "./Horizon";
export { Icon, ICON_NAMES, type IconName, type IconProps } from "./Icon";
export { Kicker, formatNumeral, type KickerProps } from "./Kicker";
export { LastUpdated, type LastUpdatedProps } from "./LastUpdated";
export { LightboxRoot, LightboxTrigger, useLightbox, type LightboxRootProps, type LightboxTriggerProps } from "./Lightbox";
export { lightboxItems, lightboxLabels } from "./lightbox-items";
export type { LightboxItem, LightboxLabels } from "./lightbox-types";
export { OVERLAY_EVENT, announceOverlay, isOverlayOpen, type OverlayDetail } from "./overlay";
export { PageHero, type PageHeroProps } from "./PageHero";
export { Panel, type PanelProps } from "./Panel";
export { Picture, pictureMaxWidth, type PictureProps, type PictureRatio } from "./Picture";
export { Plate, type PlateProps } from "./Plate";
export { Rule, type RuleProps } from "./Rule";
export { Section, type SectionProps } from "./Section";
export { SectionHeader, type SectionHeaderProps } from "./SectionHeader";
export { Segmented, type SegmentedOption, type SegmentedProps } from "./Segmented";
export { TextLink, type TextLinkProps } from "./TextLink";
export { Tile, TileRow, type TileProps, type TileRowProps } from "./Tile";
export { TOAST_EVENT, toast, type ToastDetail } from "./toast";
export { ToastRegion, type ToastRegionProps } from "./ToastRegion";
export { VisuallyHidden, type VisuallyHiddenProps } from "./VisuallyHidden";
export { cx } from "./cx";
