import React from 'react';
export function AnswerOption({ letter, children, state = 'idle', onClick }) {
  const s = {
    idle:     { bg: 'var(--sf)', border: 'var(--line)', chipBg: 'var(--bg)', chipFg: 'var(--tx2)' },
    selected: { bg: 'var(--sf)', border: 'var(--tx)', chipBg: 'var(--tx)', chipFg: 'var(--bg)' },
    correct:  { bg: 'var(--teal-tint)', border: 'var(--teal)', chipBg: 'var(--teal)', chipFg: 'var(--teal-on)', note: 'Correct', noteC: 'var(--teal-ink)' },
    wrong:    { bg: 'var(--coral-tint)', border: 'var(--coral)', chipBg: 'var(--coral)', chipFg: 'var(--coral-on)', note: 'Not quite', noteC: 'var(--coral-ink)' }
  }[state];
  const icon = state === 'correct' ? 'm5 12 5 5 9-10' : state === 'wrong' ? 'M6 6l12 12M18 6 6 18' : null;
  return (
    <div role="button" tabIndex={0} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', borderRadius: 20, background: s.bg, border: '2px solid ' + s.border, cursor: 'pointer', transition: 'background 150ms var(--ease-out), border-color 150ms var(--ease-out)' }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: s.chipBg, color: s.chipFg, display: 'grid', placeItems: 'center', flex: 'none', font: '800 15px var(--font-body)' }}>
        {icon ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg> : letter}
      </span>
      <span style={{ flex: 1, font: (state === 'idle' ? '700' : '800') + ' 18px var(--font-body)', color: 'var(--tx)' }}>{children}</span>
      {s.note && <span style={{ font: '800 15px var(--font-body)', color: s.noteC }}>{s.note}</span>}
    </div>
  );
}
