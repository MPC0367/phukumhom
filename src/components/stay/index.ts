/**
 * The room stage and the room comparison. Built for the homepage's chapter 02 and reusable on the stay page.
 *
 * Server Components: import from here.
 *   import { HomeStay } from "@/components/stay";                       the whole chapter, drawer included
 *   import { RoomStage, CompareTable, CompareDrawerHost } from "@/components/stay";
 *
 *   HomeStay({ lang, id?, leads? })                 chapter 02 with its rail, the stage and the comparison drawer
 *   RoomStage({ lang, leads?, initial?, headingLevel?, placement?, className? })
 *                                                   the selectable list beside the sticky photograph
 *   CompareTable({ lang, headingLevel?, placement?, className? })
 *                                                   the comparison: a table when it has 46rem, stacked groups below
 *   CompareDrawerHost({ title, intro?, closeLabel, children })   (client)
 *                                                   opens a drawer for any link carrying data-open-compare
 *
 * RoomStage and CompareTable read the room ledger and the photograph catalogue: render them in Server
 * Components only. CompareDrawerHost is the one client entry point; pass it the rendered table as children.
 */

export { HomeStay, type HomeStayProps } from "./HomeStay";
export { RoomStage, type RoomStageProps } from "./RoomStage";
export { CompareTable, type CompareTableProps } from "./CompareTable";
export { CompareDrawerHost, type CompareDrawerHostProps } from "./CompareDrawerHost";
