/** Full-width answer feedback that slides up from the bottom of Practice. Always explains why. */
export interface FeedbackBarProps { correct?: boolean; title?: string; children?: React.ReactNode; onNext?: () => void; nextLabel?: string; }
export declare function FeedbackBar(props: FeedbackBarProps): JSX.Element;
