/** Selectable pill: suggested prompts, filters, onboarding level / subject / board picks. */
export interface ChipProps {
  children?: React.ReactNode; selected?: boolean;
  /** Hue when selected. Subject chips use the subject's hue; everything else teal. */
  hue?: string;
  /** Selected state fills with the solid subject hue (onboarding) */
  solid?: boolean; size?: 'md'|'lg';
  /** Subject or board not offered yet: still selectable, shown with a neutral "Coming soon" tag */
  comingSoon?: boolean;
  onClick?: () => void;
}
export declare function Chip(props: ChipProps): JSX.Element;
