import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ExaminerGuide({ points = [], timed = false }) {
  if (timed) return null;
  return (
    <div style={{ padding: 20, borderRadius: 24, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ font: '800 16px/1.2 var(--font-body)', color: 'var(--tx)' }}>What examiners look for</span>
        <span style={{ font: '600 13px/1.4 var(--font-body)', color: 'var(--tx2)' }}>A guide to strong answers, not a mark. Your teacher or the exam board decides marks.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map(([t, met]) => <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, font: '700 14px/1.35 var(--font-body)', color: met ? 'var(--tx)' : 'var(--tx2)' }}>
          <span style={{ color: met ? 'var(--teal-ink)' : 'var(--neutral-ink)', display: 'flex', marginTop: -1 }}><Icon name={met ? 'gotit' : 'notstarted'} size={18} /></span>{t}</div>)}
      </div>
    </div>
  );
}
