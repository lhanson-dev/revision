import React from 'react';
export function ProgressBar({ value = 0, hue = 'teal', size = 'md', label, track = 'var(--line)', segments }) {
  const h = size === 'lg' ? 14 : size === 'sm' ? 8 : 10;
  const bar = segments
    ? <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(' + segments + ',1fr)', gap: 6 }}>
        {Array.from({ length: segments }, (_, i) => <i key={i} style={{ height: h, borderRadius: 6, background: i < value ? 'var(--' + hue + ')' : track }} />)}
      </div>
    : <div style={{ flex: 1, height: h, borderRadius: 9, background: track, overflow: 'hidden' }}>
        <div style={{ width: Math.max(0, Math.min(100, value)) + '%', height: '100%', borderRadius: 9, background: 'var(--' + hue + ')', transition: 'width 250ms var(--ease-out)' }} />
      </div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      {bar}
      {label !== null && <span style={{ font: '800 14px/1 var(--font-body)', color: 'var(--tx)', whiteSpace: 'nowrap' }}>{label ?? (segments ? value + ' / ' + segments : value + '%')}</span>}
    </div>
  );
}
