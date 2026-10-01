/** Multiple-choice answer row. */
export interface AnswerOptionProps { letter: string; children?: React.ReactNode; state?: 'idle'|'selected'|'correct'|'wrong'; onClick?: () => void; }
export declare function AnswerOption(props: AnswerOptionProps): JSX.Element;
