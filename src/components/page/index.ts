/**
 * The inner pages' shared compositions, built on the primitives (components/ui) and the motion system.
 *
 *   import { Callout, Feature, Features, Notes, Onward, PageLead, withAccent } from "@/components/page";
 *
 *   PageLead   the statement, body and first action under a page hero, with "At a glance" beside them
 *   Feature    a photograph that unveils beside its words; <Features> stacks them
 *   Notes      plain practical lines, each with a small mark
 *   Callout    the one thing a guest must not misread
 *   PhotoMosaic  a small set of photographs in columns, each opening the viewer
 *   Onward     the page's onward links from the internal link plan
 *   StatementBand  a full-bleed photograph between chapters, with one line over it
 *   ReelBand   a band with a row of photographs drifting through it, which opens the viewer
 *
 * Server Components: Feature and Onward read the photograph catalogue and the link plan.
 */
export { Feature, Features, type FeatureProps } from "./Feature";
export { Callout, Notes, type CalloutProps, type NotesProps } from "./Notes";
export { Onward, type OnwardProps } from "./Onward";
export { PageLead, type PageLeadProps } from "./PageLead";
export { PhotoMosaic, type PhotoMosaicProps } from "./PhotoMosaic";
export { ReelBand, type ReelBandProps, type ReelFrame } from "./ReelBand";
export { StatementBand, type StatementBandProps } from "./StatementBand";
export { pageLayout } from "./layout";
export { withAccent } from "./text";
