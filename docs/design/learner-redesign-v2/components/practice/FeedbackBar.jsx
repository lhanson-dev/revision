import React from 'react';
import { RevMark } from '../rev/RevMark.jsx';
export function FeedbackBar({ correct = true, title, children, onNext, nextLabel = 'Next' }) {
  const bg = correct ? 'var(--teal)' : 'var(--coral)', fg = correct ? 'var(--teal-on)' : 'var(--coral-on)';
  return (
    <div style={{ width: '100%', padding: '20px clamp(20px, 4vw, 40px)', boxSizing: 'border-box', background: bg, color: fg, display: 'flex', justifyContent: 'center', animation: 'fbUp 300ms var(--ease-out)' }}>
      <style>{'@keyframes fbUp{from{transform:translateY(100%)}to{transform:none}}'}</style>
      <div style={{ width: '100%', maxWidth: 820, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <span style={{ filter: 'brightness(.35)' }}><RevMark size={44} /></span>
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ font: '800 24px/1 var(--font-display)' }}>{title ?? (correct ? "Nice — that's the one." : 'Not this time.')}</div>
          <div style={{ font: '700 15px/1.4 var(--font-body)' }}>{children}{!correct && ' This will come back later.'}</div>
        </div>
        <button type="button" onClick={onNext} style={{ height: 52, padding: '0 28px', border: 0, borderRadius: 999, background: fg, color: correct ? 'var(--rev-text)' : '#fff', font: '800 16px var(--font-body)', cursor: 'pointer' }}>{nextLabel}</button>
      </div>
    </div>
  );
}
