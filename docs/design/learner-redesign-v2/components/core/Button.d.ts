import type { IconName } from './Icon';
/**
 * Pill button. One primary per card; labels are verbs.
 * @startingPoint section="Core" subtitle="Pill buttons in all variants" viewport="700x260"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = teal (main action) · ink = dark fill (Continue/Next) · secondary = outlined · soft = teal tint · rev = translucent, only inside RevCard */
  variant?: 'primary'|'ink'|'secondary'|'soft'|'rev';
  size?: 'sm'|'md'|'lg';
  icon?: IconName; iconRight?: IconName;
  disabled?: boolean; onClick?: () => void; style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
