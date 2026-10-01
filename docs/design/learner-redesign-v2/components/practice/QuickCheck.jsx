import React from 'react';
import { AnswerOption } from './AnswerOption.jsx';
export function QuickCheck({ question, options = [], answer = 0, explain }) {
  const [pick, setPick] = React.useState(null);
  const done = pick !== null;
  return (
    <div style={{ padding: 24, borderRadius: 24, background: 'var(--sf)', border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ font: '800 12px/1 var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tx2)' }}>Quick check</span>
        <span style={{ padding: '6px 10px', borderRadius: 999, background: 'var(--neutral-tint)', color: 'var(--neutral-ink)', font: '800 12px/1 var(--font-body)' }}>Not scored</span>
      </div>
      <div style={{ font: '800 20px/1.3 var(--font-body)', color: 'var(--tx)', textWrap: 'pretty' }}>{question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((o, i) => <AnswerOption key={o} letter={'ABCD'[i]} state={!done ? 'idle' : i === answer ? 'correct' : i === pick ? 'wrong' : 'idle'} onClick={() => !done && setPick(i)}>{o}</AnswerOption>)}
      </div>
      {done && <div style={{ font: '600 15px/1.5 var(--font-body)', color: 'var(--tx2)' }}><b style={{ color: 'var(--tx)' }}>{pick === answer ? 'Yep.' : 'Not quite.'}</b> {explain} This doesn't count towards your progress.</div>}
    </div>
  );
}
