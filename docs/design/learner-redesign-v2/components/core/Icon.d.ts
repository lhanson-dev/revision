export type IconName = 'home'|'plan'|'progress'|'courses'|'check'|'arrowRight'|'arrowUp'|'plus'|'close'|'bolt'|'shield'|'clock'|'moon'|'lock'|'gotit'|'nearly'|'needswork'|'started'|'notstarted';
/** Rounded line icon (24px grid, round caps). Takes the text colour of its context. */
export interface IconProps { name: IconName; size?: number; strokeWidth?: number; color?: string; style?: React.CSSProperties; }
export declare function Icon(props: IconProps): JSX.Element;
