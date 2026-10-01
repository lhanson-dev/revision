/**
 * The three progress measures. Never collapse these into one mastery %.
 * @startingPoint section="Subjects" subtitle="Topics covered · Understanding · Exam readiness" viewport="900x260"
 */
export interface ProgressMeasuresProps {
  /** Subject hue (topics-covered bar only) */
  hue?: string;
  covered: number; total: number;
  understanding: { gotit?: number; nearly?: number; needswork?: number; started?: number; notstarted?: number };
  /** e.g. "Grade 6–7". Omit when there isn't enough evidence → shows "Not enough evidence yet". */
  readiness?: string;
  readinessNote?: string;
  /** Single column (≤1100px) */
  stack?: boolean;
}
export declare function ProgressMeasures(props: ProgressMeasuresProps): JSX.Element;
