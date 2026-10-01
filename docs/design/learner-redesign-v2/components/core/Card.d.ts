/** Flat container. surface = white + 1px line; tint = pale hue panel with ink eyebrow. No shadows. */
export interface CardProps {
  children?: React.ReactNode; tone?: 'surface'|'tint'; hue?: 'teal'|'coral'|'yellow'|'violet';
  eyebrow?: string; title?: string; padding?: number; radius?: number; style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
export interface StatProps { value: React.ReactNode; unit?: string; caption?: string; }
/** Big Bricolage number with unit + caption, for tint cards (Next exam, Study time). */
export declare function Stat(props: StatProps): JSX.Element;
