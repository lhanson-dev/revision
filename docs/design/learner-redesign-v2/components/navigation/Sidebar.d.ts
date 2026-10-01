/**
 * Desktop sidebar (248px): wordmark, Ask REV button, nav, weekly goal, profile.
 * @startingPoint section="Navigation" subtitle="Desktop sidebar" viewport="700x620"
 */
export interface SidebarProps { active?: 'home'|'plan'|'progress'|'courses'|'rev'; onNavigate?: (k: string) => void; name?: string; weekDone?: string; weekGoal?: string; weekPct?: number; }
export declare function Sidebar(props: SidebarProps): JSX.Element;
