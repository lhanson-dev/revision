import React from 'react';
export function Tag({ children, hue = 'teal', style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: 'var(--' + hue + '-tint)', color: 'var(--' + hue + '-ink)', font: '800 12px/1 var(--font-body)', whiteSpace: 'nowrap', ...style }}>{children}</span>;
}
