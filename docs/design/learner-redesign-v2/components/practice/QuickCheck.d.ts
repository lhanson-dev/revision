/** Unscored check inside Learn. Dashed neutral card + "Not scored" tag; never affects progress. */
export interface QuickCheckProps { question: string; options: string[]; answer?: number; explain?: string; }
export declare function QuickCheck(props: QuickCheckProps): JSX.Element;
