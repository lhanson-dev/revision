/**
 * The signature REV card: deep teal, teal-mint eyebrow, reason from real data, max one primary action.
 * @startingPoint section="REV" subtitle="REV suggestion / noticed / advice cards" viewport="700x420"
 */
export interface RevCardProps {
  /** REV suggests · REV's advice · Stuck? Ask REV. ("REV noticed" pattern cards are out for launch.) */
  eyebrow?: string;
  /** Hero only: Bricolage headline */
  title?: string;
  children?: React.ReactNode;
  /** The "because" line. Required for suggestions. */
  reason?: string;
  /** Usually <Button variant="primary" size="sm"> + <Button variant="rev" size="sm"> */
  actions?: React.ReactNode;
  /** Tappable suggested questions */
  prompts?: string[];
  /** Large Home version with the big living-e watermark */
  hero?: boolean;
  /** Hero only: show the big living-e watermark. Turn off on phone so it never sits behind the title. */
  watermark?: boolean;
  /** Living E state on the card's mark */
  state?: 'waiting'|'listening'|'thinking'|'responding';
  style?: React.CSSProperties;
}
export declare function RevCard(props: RevCardProps): JSX.Element;
export interface StepRowProps { label: string; meta?: string; status?: 'done'|'current'|'upcoming'; }
/** One step of a guided session, used inside a hero RevCard. */
export declare function StepRow(props: StepRowProps): JSX.Element;
