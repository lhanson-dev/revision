import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { RevMark } from '../rev/RevMark.jsx';
import { Sidebar } from './Sidebar.jsx';
export function useBreakpoint() {
  const get = () => { if (typeof window === 'undefined') return 1440; const v = document.documentElement.clientWidth || window.innerWidth; return v > 0 ? v : null; };
  const [w, setW] = React.useState(() => get() ?? 1440);
  React.useEffect(() => {
    const f = () => { const v = get(); if (v) setW(v); };
    f();
    const raf = requestAnimationFrame(f);
    let n = 0;
    const poll = setInterval(() => { f(); if (++n > 12) clearInterval(poll); }, 250);
    const mqs = ['(max-width:620px)', '(max-width:960px)', '(max-width:1100px)', '(max-width:1160px)'].map(q => window.matchMedia(q));
    mqs.forEach(m => m.addEventListener('change', f));
    const evs = ['resize', 'load', 'pageshow', 'focus', 'visibilitychange'];
    evs.forEach(e => (e === 'visibilitychange' ? document : window).addEventListener(e, f));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(f) : null;
    if (ro) ro.observe(document.documentElement);
    return () => { cancelAnimationFrame(raf); clearInterval(poll); mqs.forEach(m => m.removeEventListener('change', f)); evs.forEach(e => (e === 'visibilitychange' ? document : window).removeEventListener(e, f)); if (ro) ro.disconnect(); };
  }, []);
  const bp = w <= 620 ? 'phone' : w <= 960 ? 'tablet' : w <= 1160 ? 'laptop' : 'desktop';
  return { width: w, bp, stack: w <= 1100, phone: bp === 'phone' };
}
const NAV = [['home', 'Home'], ['plan', 'Plan'], ['progress', 'Progress'], ['courses', 'Courses']];
export function Rail({ active, onNavigate }) {
  const go = k => onNavigate && onNavigate(k);
  return (
    <aside style={{ width: 84, flex: 'none', height: '100vh', position: 'sticky', top: 0, boxSizing: 'border-box', padding: '24px 0', background: 'var(--sf)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <span role="button" aria-label="Ask REV" tabIndex={0} onClick={() => go('rev')} style={{ width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', cursor: 'pointer', background: active === 'rev' ? 'var(--deep)' : 'var(--teal)', boxShadow: '0 8px 22px rgba(43,182,163,.22)' }}><RevMark size={26} color={active === 'rev' ? '#2bb6a3' : 'var(--teal-on)'} /></span>
      {NAV.map(([k, l]) => { const on = active === k; return (
        <span key={k} role="button" aria-label={l} tabIndex={0} onClick={() => go(k)} style={{ width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center', cursor: 'pointer', background: on ? 'var(--teal-tint)' : 'transparent', color: on ? 'var(--teal-ink)' : 'var(--tx2)' }}><Icon name={k} size={22} strokeWidth={2} /></span>); })}
    </aside>
  );
}
export function TabBar({ active, onNavigate }) {
  const go = k => onNavigate && onNavigate(k);
  const items = [['home', 'Home'], ['plan', 'Plan'], ['rev', 'REV'], ['courses', 'Courses'], ['progress', 'Progress']];
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, height: 76, boxSizing: 'border-box', padding: '8px 8px 14px', background: 'var(--sf)', borderTop: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', alignItems: 'end' }}>
      {items.map(([k, l]) => {
        const on = active === k;
        if (k === 'rev') return <span key={k} role="button" aria-label="Ask REV" tabIndex={0} onClick={() => go(k)} style={{ justifySelf: 'center', marginTop: -26, width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', background: on ? 'var(--deep)' : 'var(--teal)', boxShadow: '0 0 0 5px var(--sf), 0 8px 22px rgba(43,182,163,.28)' }}><RevMark size={30} color={on ? '#2bb6a3' : 'var(--teal-on)'} /></span>;
        return <span key={k} role="button" tabIndex={0} onClick={() => go(k)} style={{ minHeight: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: on ? 'var(--teal-ink)' : 'var(--tx2)', font: (on ? '800' : '700') + ' 11px/1 var(--font-body)' }}><Icon name={k} size={22} strokeWidth={2} />{l}</span>;
      })}
    </nav>
  );
}
const PAD = { desktop: '36px 40px', laptop: '32px 28px', tablet: '28px 24px', phone: '20px 20px' };
export function AppShell({ active, onNavigate, bp = 'desktop', children, footer, focus = false, maxWidth = 1180 }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflowX: 'clip' }}>
      {!focus && (bp === 'desktop' || bp === 'laptop') && <div style={{ position: 'sticky', top: 0, height: '100vh', flex: 'none' }}><Sidebar active={active} onNavigate={onNavigate} /></div>}
      {!focus && bp === 'tablet' && <Rail active={active} onNavigate={onNavigate} />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', paddingBottom: !focus && bp === 'phone' ? 76 : 0 }}>
        <main style={{ flex: 1, width: '100%', maxWidth, margin: '0 auto', padding: PAD[bp], boxSizing: 'border-box', minWidth: 0 }}>{children}</main>
        {footer && <div style={{ position: 'sticky', bottom: !focus && bp === 'phone' ? 76 : 0, zIndex: 10 }}>{footer}</div>}
      </div>
      {!focus && bp === 'phone' && <TabBar active={active} onNavigate={onNavigate} />}
    </div>
  );
}
