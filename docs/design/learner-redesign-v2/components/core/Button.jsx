import React from 'react';
import { Icon } from './Icon.jsx';
const V = {
  primary:   { background: 'var(--teal)', color: 'var(--teal-on)' },
  ink:       { background: 'var(--tx)', color: 'var(--bg)' },
  secondary: { background: 'var(--sf)', color: 'var(--tx)', boxShadow: 'inset 0 0 0 1px var(--line)' },
  soft:      { background: 'var(--teal-tint)', color: 'var(--teal-ink)' },
  rev:       { background: 'var(--rev-button)', color: 'var(--rev-text)' }
};
const S = { sm: { height: 34, padding: '0 14px', font: '800 13px/1 var(--font-body)' }, md: { height: 44, padding: '0 20px', font: '800 14px/1 var(--font-body)' }, lg: { height: 52, padding: '0 26px', font: '800 16px/1 var(--font-body)' } };
export function Button({ children, variant = 'primary', size = 'md', icon, iconRight, disabled, onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 0, borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', transition: 'filter 150ms var(--ease-out), transform 150ms var(--ease-out)', ...S[size], ...V[variant],
        filter: hover && !disabled ? 'brightness(0.95)' : 'none', opacity: disabled ? 0.45 : 1,
        outline: focus ? '2px solid var(--teal)' : 'none', outlineOffset: 2, ...style }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 18} strokeWidth={2.6} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 18} strokeWidth={2.6} />}
    </button>
  );
}
