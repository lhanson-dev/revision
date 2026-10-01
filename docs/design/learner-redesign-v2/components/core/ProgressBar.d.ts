/** Progress bar. Always shows a number next to it unless label is explicitly null. */
export interface ProgressBarProps {
  /** 0–100, or completed count when segments is set */
  value?: number;
  hue?: 'teal'|'coral'|'yellow'|'violet';
  size?: 'sm'|'md'|'lg';
  /** Custom label; null hides it (only when the number is shown elsewhere) */
  label?: string | null;
  track?: string;
  /** Render as N discrete steps (Learn cards, onboarding) */
  segments?: number;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
