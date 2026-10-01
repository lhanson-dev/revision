import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { RevMark } from '../rev/RevMark.jsx';
import { ProgressBar } from '../core/ProgressBar.jsx';
const ITEMS = [['home', 'Home'], ['plan', 'Plan'], ['progress', 'Progress'], ['courses', 'Courses']];
export function Sidebar({ active = 'home', onNavigate, name = 'Maya', weekDone = '3h 10m', weekGoal = '5h 15m', weekPct = 60 }) {
  const go = k => onNavigate && onNavigate(k);
  return (
    <aside style={{ width: 248, height: '100%', boxSizing: 'border-box', padding: '28px 16px 18px', background: 'var(--sf)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 20, flex: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: 10, color: 'var(--tx)', font: '800 24px/1 var(--font-body)', letterSpacing: '.045em' }}>
        <span>R</span><span style={{ width: 18, display: 'grid', gap: 3, margin: '0 1px' }}>{[0, 1, 2].map(i => <i key={i} style={{ display: 'block', height: 3, borderRadius: 9, background: 'var(--teal)' }} />)}</span><span>VISION</span>
      </div>
      <div role="button" tabIndex={0} onClick={() => go('rev')} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 14px', borderRadius: 16, cursor: 'pointer',
        background: active === 'rev' ? 'var(--deep)' : 'var(--teal)', color: active === 'rev' ? 'var(--rev-text)' : '#132026', font: '700 15px/1 var(--font-body)', boxShadow: '0 8px 22px rgba(43,182,163,.22)' }}>
        <RevMark size={22} color={active === 'rev' ? '#2bb6a3' : 'var(--teal-on)'} /><span style={{ flex: 1 }}>Ask REV</span><span style={{ font: '600 11px/1 var(--font-body)', opacity: .7 }}>⌘K</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ITEMS.map(([k, l]) => {
          const on = active === k;
          return (
            <div key={k} role="button" tabIndex={0} onClick={() => go(k)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height: 44, padding: '0 14px', borderRadius: 14, cursor: 'pointer',
              background: on ? 'var(--teal-tint)' : 'transparent', color: on ? 'var(--teal-ink)' : 'var(--tx2)', font: '700 15px/1 var(--font-body)' }}>
              <span style={{ position: 'absolute', left: -10, top: 10, bottom: 10, width: 3, borderRadius: 3, background: on ? 'var(--teal)' : 'transparent' }} />
              <Icon name={k} size={20} strokeWidth={2} /><span>{l}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ padding: 16, borderRadius: 18, background: 'var(--teal-tint)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 12px/1 var(--font-body)', color: 'var(--tx2)', letterSpacing: '.08em', textTransform: 'uppercase' }}><span>This week</span><span style={{ letterSpacing: 0, color: 'var(--teal-ink)' }}>{weekPct}%</span></div>
        <div style={{ font: '800 20px/1 var(--font-body)', color: 'var(--tx)' }}>{weekDone} <span style={{ font: '600 13px var(--font-body)', color: 'var(--tx2)' }}>of {weekGoal}</span></div>
        <ProgressBar value={weekPct} size="sm" label={null} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 0', borderTop: '1px solid var(--line)' }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#bce8cf', color: '#0f2f36', font: '800 14px/1 var(--font-body)' }}>{name[0]}</span>
        <span style={{ flex: 1, font: '700 15px/1 var(--font-body)', color: 'var(--tx)' }}>{name}</span>
        <Icon name="moon" size={20} strokeWidth={2} color="var(--tx2)" />
      </div>
    </aside>
  );
}
