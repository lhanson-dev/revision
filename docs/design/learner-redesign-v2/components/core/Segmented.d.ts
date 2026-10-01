/** Pill segmented control (Day / Week / Month). Selected = ink fill. */
export interface SegmentedProps { options: string[]; value: string; onChange?: (v: string) => void; }
export declare function Segmented(props: SegmentedProps): JSX.Element;
