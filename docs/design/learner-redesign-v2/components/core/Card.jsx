import React from 'react';
export function Card({ children, tone = 'surface', hue = 'teal', eyebrow, title, padding = 22, radius = 24, style }) {
  const bg = tone === 'tint' ? { background: 'var(--' + hue + '-tint)' } : { background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)' };
  return (
    <div style={{ padding, borderRadius: radius, display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box', ...bg, ...style }}>
      {eyebrow && <div style={{ font: '800 12px/1 var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase', color: tone === 'tint' ? 'var(--' + hue + '-ink)' : 'var(--tx2)' }}>{eyebrow}</div>}
      {title && <div style={{ font: '800 18px/1 var(--font-body)', color: 'var(--tx)' }}>{title}</div>}
      {children}
    </div>
  );
}
export function Stat({ value, unit, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ font: '800 56px/1 var(--font-display)', letterSpacing: '-.03em', color: 'var(--tx)' }}>{value}</span>
        {unit && <span style={{ font: '800 18px var(--font-body)', color: 'var(--tx)' }}>{unit}</span>}
      </div>
      {caption && <div style={{ font: '700 14px/1.4 var(--font-body)', color: 'var(--tx2)' }}>{caption}</div>}
    </div>
  );
}
