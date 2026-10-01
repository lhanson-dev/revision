import React from 'react';
import { Icon } from './Icon.jsx';
export const STATUS = {
  gotit:      { label: 'Got it',        hue: 'teal' },
  nearly:     { label: 'Nearly there',  hue: 'yellow' },
  needswork:  { label: 'Needs work',    hue: 'coral' },
  started:    { label: 'Just started',  hue: 'neutral' },
  notstarted: { label: 'Not started',   hue: 'neutral' }
};
export function StatusBadge({ status = 'notstarted', size = 'md', label }) {
  const s = STATUS[status], sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: sm ? 5 : 7, padding: sm ? '5px 9px 5px 6px' : '7px 12px 7px 8px', borderRadius: 999,
      background: 'var(--' + s.hue + '-tint)', color: 'var(--' + s.hue + '-ink)', font: '800 ' + (sm ? 12 : 13) + 'px/1 var(--font-body)', whiteSpace: 'nowrap' }}>
      <Icon name={status} size={sm ? 14 : 17} strokeWidth={2.4} />{label ?? s.label}
    </span>
  );
}
