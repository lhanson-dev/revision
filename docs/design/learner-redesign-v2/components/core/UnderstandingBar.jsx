import React from 'react';
import { Icon } from './Icon.jsx';
import { STATUS } from './StatusBadge.jsx';
const ORDER = ['gotit', 'nearly', 'needswork', 'started', 'notstarted'];
const FILL = { gotit: 'var(--teal)', nearly: 'var(--yellow)', needswork: 'var(--coral)', started: 'var(--neutral)', notstarted: 'var(--line)' };
export function UnderstandingBar({ counts = {}, labels = true, size = 'md' }) {
  const items = ORDER.map(k => [k, counts[k] || 0]).filter(([, n]) => n > 0);
  const h = size === 'sm' ? 8 : 12;
  const text = items.map(([k, n]) => n + ' ' + STATUS[k].label.toLowerCase()).join(' · ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <div role="img" aria-label={'Understanding: ' + text} style={{ display: 'flex', gap: 3, height: h }}>
        {items.map(([k, n]) => <i key={k} style={{ flex: n + ' 1 0', minWidth: 6, borderRadius: 9, background: FILL[k] }} />)}
      </div>
      {labels && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {items.map(([k, n]) => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 13px/1.2 var(--font-body)', color: 'var(--tx2)' }}>
          <span style={{ color: 'var(--' + STATUS[k].hue + '-ink)', display: 'inline-flex' }}><Icon name={k} size={15} strokeWidth={2.4} /></span>
          <b style={{ color: 'var(--tx)', fontWeight: 800 }}>{n}</b> {STATUS[k].label.toLowerCase()}</span>)}
      </div>}
    </div>
  );
}
