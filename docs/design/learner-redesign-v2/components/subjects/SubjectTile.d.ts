/** Subject hues: violet (Science) + violet-bio / violet-chem / violet-phys, blue, sky, magenta + magenta-lang / magenta-lit, plum, green, olive, umber, slate, navy. Never teal, yellow or coral. */
type SubjectHue = string;
/**
 * Subject tile: solid hue badge, name, topics-covered bar. The hue comes from the subject catalogue.
 * @startingPoint section="Subjects" subtitle="Subject tiles and course cards" viewport="700x460"
 */
export interface SubjectTileProps { hue?: SubjectHue; letter: string; name: string; covered?: number; total?: number; onClick?: () => void; }
export declare function SubjectTile(props: SubjectTileProps): JSX.Element;
export interface SubjectBadgeProps { hue?: SubjectHue; letter: string; size?: number; }
/** Letter mark (periodic-table style): THE subject icon. No pictograms. Always shown next to the subject name. */
export declare function SubjectBadge(props: SubjectBadgeProps): JSX.Element;
export interface CourseCardProps {
  hue?: SubjectHue; letter: string; name: string; board: string; level?: string;
  covered?: number; total?: number;
  understanding?: { gotit?: number; nearly?: number; needswork?: number; started?: number; notstarted?: number };
  next?: string; onContinue?: () => void;
  /** Phone: hue panel becomes a top band */
  compact?: boolean;
}
/** Wide course card with solid hue side panel (Courses screen). */
export declare function CourseCard(props: CourseCardProps): JSX.Element;
