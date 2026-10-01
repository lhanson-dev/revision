import React from 'react';
export function Segmented({ options = [], value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      {options.map(o => (
        <span key={o} role="button" tabIndex={0} onClick={() => onChange && onChange(o)}
          style={{ padding: '10px 18px', borderRadius: 999, cursor: 'pointer', font: (o === value ? '800' : '700') + ' 14px/1 var(--font-body)',
            background: o === value ? 'var(--tx)' : 'transparent', color: o === value ? 'var(--bg)' : 'var(--tx2)' }}>{o}</span>
      ))}
    </div>
  );
}
