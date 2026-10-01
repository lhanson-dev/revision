/** Stacked bar of topic understanding, always with text labels (e.g. "1 got it · 2 nearly there · 1 needs work · 6 not started"). */
export interface UnderstandingBarProps {
  counts: { gotit?: number; nearly?: number; needswork?: number; started?: number; notstarted?: number };
  /** Text labels under the bar. Only hide when the same counts are written next to it. */
  labels?: boolean; size?: 'sm'|'md';
}
export declare function UnderstandingBar(props: UnderstandingBarProps): JSX.Element;
