import React from 'react';
import { ProgressBar } from '../core/ProgressBar.jsx';
import { UnderstandingBar } from '../core/UnderstandingBar.jsx';
import { Icon } from '../core/Icon.jsx';
const Head = ({ children }) => <div style={{ font: '800 12px/1 var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tx2)' }}>{children}</div>;
export function ProgressMeasures({ hue = 'violet', covered = 0, total = 0, understanding = {}, readiness, readinessNote, stack = false }) {
  const cell = { display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, padding: 22, borderRadius: 24, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: stack ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
      <div style={cell}>
        <Head>Topics covered</Head>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: '800 56px/1 var(--font-display)', letterSpacing: '-.03em', color: 'var(--tx)' }}>{covered}</span>
          <span style={{ font: '800 18px var(--font-body)', color: 'var(--tx)' }}>of {total}</span>
        </div>
        <ProgressBar value={total ? covered / total * 100 : 0} hue={hue} size="sm" label={null} />
      </div>
      <div style={cell}><Head>Understanding</Head><UnderstandingBar counts={understanding} /></div>
      <div style={cell}>
        <Head>Exam readiness</Head>
        {readiness
          ? <span style={{ font: '800 32px/1.05 var(--font-display)', letterSpacing: '-.02em', color: 'var(--tx)' }}>{readiness}</span>
          : <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '800 16px/1.3 var(--font-body)', color: 'var(--tx)' }}><span style={{ color: 'var(--neutral-ink)', display: 'flex' }}><Icon name="started" size={20} /></span>Not enough evidence yet</span>}
        {readinessNote && <span style={{ font: '600 14px/1.45 var(--font-body)', color: 'var(--tx2)' }}>{readinessNote}</span>}
      </div>
    </div>
  );
}
