/**
 * The Living E: REV's signature. Always gently moving.
 * @startingPoint section="REV" subtitle="Living E in its four states" viewport="700x260"
 */
export interface RevMarkProps {
  size?: number;
  /** waiting = slow breathing (default) · listening = student typing: leans in, brighter, quicker · thinking = bars sway · responding = settles, then returns to waiting */
  state?: 'waiting'|'listening'|'thinking'|'responding';
  halo?: boolean; onDark?: boolean;
  /** Bar colour. Use "var(--teal-on)" when the mark sits on a teal button. */
  color?: string;
  /** Reduced motion: show "REV is thinking" etc. next to the still mark (default true) */
  showLabel?: boolean; labelColor?: string;
  /** Force reduced-motion behaviour (defaults to the OS setting) */
  reducedMotion?: boolean;
  /** Called when responding has settled back to waiting */
  onSettled?: () => void;
}
export declare function RevMark(props: RevMarkProps): JSX.Element;
