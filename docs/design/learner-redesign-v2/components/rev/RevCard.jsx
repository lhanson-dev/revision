import React from 'react';
import { RevMark } from './RevMark.jsx';
export function RevCard({ eyebrow = 'REV suggests', title, children, reason, actions, prompts, hero = false, watermark = true, state = 'waiting', style }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: hero ? 30 : 22, borderRadius: hero ? 28 : 24, background: 'var(--deep)', color: 'var(--rev-text)',
      display: 'flex', flexDirection: 'column', gap: hero ? 22 : 14, boxSizing: 'border-box', ...style }}>
      {hero && watermark && <span style={{ position: 'absolute', right: -40, top: -50, opacity: .9, pointerEvents: 'none' }}><RevMark size={260} halo onDark state={state} /></span>}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!hero && <RevMark size={30} state={state} />}
          <span style={{ font: '800 12px/1 var(--font-body)', letterSpacing: hero ? '.14em' : '.12em', textTransform: 'uppercase', color: 'var(--rev-label)' }}>{eyebrow}</span>
        </div>
        {title && <h2 style={{ margin: 0, maxWidth: 520, font: 'var(--type-h2)', letterSpacing: '-.02em' }}>{title}</h2>}
        {reason && <p style={{ margin: 0, maxWidth: 520, font: '600 15px/1.5 var(--font-body)', color: 'var(--rev-muted)' }}>{reason}</p>}
        {children && !hero && <div style={{ font: '700 15px/1.5 var(--font-body)' }}>{children}</div>}
      </div>
      {children && hero && <div style={{ position: 'relative', font: '700 16px/1.5 var(--font-body)' }}>{children}</div>}
      {prompts && <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prompts.map(p => <span key={p} role="button" tabIndex={0} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--rev-row)', font: '700 14px/1.35 var(--font-body)', cursor: 'pointer' }}>{p}</span>)}
      </div>}
      {actions && <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
export function StepRow({ label, meta, status = 'upcoming' }) {
  const done = status === 'done', cur = status === 'current';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16,
      background: cur ? 'var(--rev-row-active)' : 'var(--rev-row)', boxShadow: cur ? 'inset 0 0 0 2px var(--teal)' : 'none' }}>
      <span style={{ width: 28, height: 28, borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center', flex: 'none',
        background: done ? 'var(--teal)' : 'transparent', border: done ? 0 : '2px solid ' + (cur ? 'var(--teal)' : 'rgba(255,255,255,.3)') }}>
        {done && <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--teal-on)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>}
      </span>
      <span style={{ flex: 1, minWidth: 0, font: '700 16px/1.25 var(--font-body)', textDecoration: done ? 'line-through' : 'none', opacity: done ? .6 : 1 }}>{label}</span>
      <span style={{ font: '700 13px/1 var(--font-body)', color: 'var(--rev-muted)' }}>{done ? 'Done' : meta}</span>
    </div>
  );
}
