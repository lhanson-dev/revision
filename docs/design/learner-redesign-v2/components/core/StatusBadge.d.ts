/**
 * Understanding status for a topic. Always icon + text on the tint; never colour alone.
 * @startingPoint section="Core" subtitle="Five understanding states" viewport="700x200"
 */
export type Status = 'gotit'|'nearly'|'needswork'|'started'|'notstarted';
export interface StatusBadgeProps {
  /** gotit = teal · nearly = yellow · needswork = coral · started (some answers, too few to tell) = neutral · notstarted = neutral */
  status?: Status; size?: 'sm'|'md';
  /** Override text only for screen-specific wording; keep the meaning */
  label?: string;
}
export declare function StatusBadge(props: StatusBadgeProps): JSX.Element;
export declare const STATUS: Record<Status, { label: string; hue: string }>;
