import React from 'react';
import { ProgressBar } from '../core/ProgressBar.jsx';
import { UnderstandingBar } from '../core/UnderstandingBar.jsx';
import { Button } from '../core/Button.jsx';
export function SubjectBadge({ hue = 'violet', letter, size = 40 }) {
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 12, background: 'var(--' + hue + ')', color: 'var(--' + hue + '-on)', display: 'grid', placeItems: 'center', flex: 'none', font: '800 ' + Math.round(size * .42) + 'px/1 var(--font-display)' }}>{letter}</span>;
}
export function SubjectTile({ hue = 'violet', letter, name, covered = 0, total = 0, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: 18, borderRadius: 20, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, cursor: onClick ? 'pointer' : 'default' }}>
      <SubjectBadge hue={hue} letter={letter} />
      <div style={{ font: '800 16px/1.2 var(--font-body)', color: 'var(--tx)', overflowWrap: 'anywhere' }}>{name}</div>
      <ProgressBar value={total ? covered / total * 100 : 0} hue={hue} size="sm" label={null} />
      <div style={{ font: '700 13px var(--font-body)', color: 'var(--tx2)' }}>{covered} of {total} topics covered</div>
    </div>
  );
}
export function CourseCard({ hue = 'violet', letter, name, board, level = 'A-level', covered = 0, total = 0, understanding, next, onContinue, compact = false }) {
  return (
    <div style={{ borderRadius: 28, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)', overflow: 'hidden', display: 'flex', flexDirection: compact ? 'column' : 'row' }}>
      <div style={{ width: compact ? 'auto' : 150, flex: 'none', background: 'var(--' + hue + ')', color: 'var(--' + hue + '-on)', display: 'flex', flexDirection: compact ? 'row' : 'column', alignItems: compact ? 'center' : 'stretch', justifyContent: 'space-between', gap: 12, padding: 20 }}>
        <span style={{ font: '800 ' + (compact ? 36 : 56) + 'px/1 var(--font-display)' }}>{letter}</span>
        <span style={{ font: '800 13px/1.3 var(--font-body)' }}>{board}<br />{level}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: compact ? 20 : 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ margin: 0, font: '800 24px/1.1 var(--font-display)', color: 'var(--tx)', overflowWrap: 'anywhere' }}>{name}</h3>
        <ProgressBar value={total ? covered / total * 100 : 0} hue={hue} label={covered + ' of ' + total + ' topics'} />
        {understanding && <UnderstandingBar counts={understanding} size="sm" />}
        {next && <div style={{ font: '600 14px/1.4 var(--font-body)', color: 'var(--tx2)' }}>Up next: <b style={{ color: 'var(--tx)' }}>{next}</b></div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Button variant="ink" size="sm" onClick={onContinue}>Continue</Button><Button variant="soft" size="sm">Practice</Button></div>
      </div>
    </div>
  );
}
