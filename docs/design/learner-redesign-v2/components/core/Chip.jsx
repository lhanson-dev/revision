import React from 'react';
import { Icon } from './Icon.jsx';
export function Chip({ children, selected = false, hue = 'teal', solid = false, size = 'md', comingSoon = false, onClick }) {
  const lg = size === 'lg';
  const font = (selected ? '800 ' : '700 ') + (lg ? '16px' : '14px') + '/1 var(--font-body)';
  const on = solid && !comingSoon ? { background: 'var(--' + hue + ')', color: 'var(--' + hue + '-on)' }
    : { background: 'var(--' + (comingSoon ? 'neutral' : hue) + '-tint)', color: comingSoon ? 'var(--tx)' : 'var(--' + hue + '-ink)' };
  const off = { background: 'var(--sf)', color: comingSoon ? 'var(--tx2)' : 'var(--tx)', boxShadow: 'inset 0 0 0 ' + (lg ? 2 : 1) + 'px var(--line)' };
  return (
    <span role="button" tabIndex={0} aria-pressed={selected} onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: lg ? '12px 16px' : '10px 14px', borderRadius: 999, font, cursor: 'pointer', boxSizing: 'border-box', ...(selected ? on : off) }}>
      {selected && <Icon name="check" size={16} strokeWidth={3.2} />}
      {children}
      {comingSoon && <span style={{ padding: '4px 8px', borderRadius: 999, background: selected ? 'var(--sf)' : 'var(--neutral-tint)', color: 'var(--neutral-ink)', font: '800 11px/1 var(--font-body)', letterSpacing: '.04em' }}>Coming soon</span>}
    </span>
  );
}
