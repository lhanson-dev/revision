/** Exam Prep side panel: what examiners look for. Practice mode only. Renders nothing in timed mocks. */
export interface ExaminerGuideProps {
  /** [text, coveredYet] */
  points: [string, boolean][];
  /** Timed mock: hidden */
  timed?: boolean;
}
export declare function ExaminerGuide(props: ExaminerGuideProps): JSX.Element | null;
