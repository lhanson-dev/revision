/**
 * Responsive learner shell: sidebar (>960px) → 84px icon rail (621–960) → bottom tab bar (≤620).
 * Centres content in the 1100px canvas with breakpoint gutters. Never scrolls horizontally.
 * @startingPoint section="Navigation" subtitle="Responsive app shell" viewport="1180x720"
 */
export interface AppShellProps {
  active?: 'home'|'plan'|'progress'|'courses'|'rev';
  onNavigate?: (k: string) => void;
  /** From useBreakpoint().bp */
  bp?: 'desktop'|'laptop'|'tablet'|'phone';
  children?: React.ReactNode;
  /** Sticky bottom slot (e.g. FeedbackBar); sits above the tab bar on phone */
  footer?: React.ReactNode;
  /** Hide all navigation (Exam Prep) */
  focus?: boolean;
  /** Content max width incl. gutters. Default 1180 (1100 canvas + 2×40). */
  maxWidth?: number;
}
export declare function AppShell(props: AppShellProps): JSX.Element;
/** Viewport hook. bp: desktop >1160 · laptop 961–1160 · tablet 621–960 · phone ≤620. stack = ≤1100 (collapse 2-col grids). */
export declare function useBreakpoint(): { width: number; bp: 'desktop'|'laptop'|'tablet'|'phone'; stack: boolean; phone: boolean };
export interface NavProps { active?: string; onNavigate?: (k: string) => void; }
/** Tablet icon rail (84px). */
export declare function Rail(props: NavProps): JSX.Element;
/** Phone bottom tab bar with raised REV centre button. */
export declare function TabBar(props: NavProps): JSX.Element;
