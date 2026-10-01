import React from 'react';
const KF = '@keyframes revBreathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.05);opacity:1}}'
 + '@keyframes revBar{0%,100%{transform:scaleX(.92)}50%{transform:scaleX(1)}}'
 + '@keyframes revLean{0%,100%{transform:translateX(0) scale(1.07)}50%{transform:translateX(4%) scale(1.11)}}'
 + '@keyframes revThink{0%,100%{transform:translateX(-7%) scaleX(.84)}50%{transform:translateX(7%) scaleX(1)}}'
 + '@keyframes revSettle{0%{transform:translateX(var(--o)) scaleX(.86)}60%{transform:translateX(0) scaleX(1.04)}100%{transform:none}}'
 + '@keyframes revHalo{0%,100%{transform:scale(.94);opacity:.75}50%{transform:scale(1.05);opacity:1}}';
function ensureKF() {
  if (typeof document === 'undefined' || document.getElementById('rev-living-e-kf')) return;
  const s = document.createElement('style'); s.id = 'rev-living-e-kf'; s.textContent = KF; document.head.appendChild(s);
}
const LABEL = { listening: 'REV is listening', thinking: 'REV is thinking', responding: 'REV is answering' };
const OFF = ['-8%', '6%', '-4%'];
export function RevMark({ size = 32, state = 'waiting', halo = false, onDark = false, color = '#2bb6a3', showLabel = true, labelColor = 'currentColor', reducedMotion, onSettled }) {
  ensureKF();
  const [st, setSt] = React.useState(state);
  React.useEffect(() => setSt(state), [state]);
  React.useEffect(() => {
    if (st !== 'responding') return;
    const t = setTimeout(() => { setSt('waiting'); onSettled && onSettled(); }, 1100);
    return () => clearTimeout(t);
  }, [st]);
  const reduced = reducedMotion ?? (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const A = (v) => (reduced ? 'none' : v);
  const period = { waiting: 4.2, listening: 1.6, thinking: 1.1, responding: 4.2 }[st];
  const wrap = st === 'waiting' ? A('revBreathe 4.2s ease-in-out infinite') : st === 'listening' ? A('revLean 1.6s ease-in-out infinite') : 'none';
  const bar = i => st === 'thinking' ? A('revThink 1.1s ' + (i * .12) + 's ease-in-out infinite')
    : st === 'responding' ? A('revSettle .9s ' + (i * .06) + 's cubic-bezier(.2,.8,.2,1) both')
    : A('revBar ' + period + 's ' + (i * .22) + 's ease-in-out infinite');
  return (
    <span role="img" aria-label={LABEL[st] || 'REV'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 'none' }}>
      <span style={{ position: 'relative', width: size, height: size, display: 'inline-grid', placeItems: 'center', flex: 'none' }}>
        {halo && <span style={{ position: 'absolute', inset: '8%', borderRadius: '46% 54% 52% 48% / 50% 46% 54% 50%', animation: A('revHalo ' + period + 's ease-in-out infinite'),
          background: 'radial-gradient(circle at 50% 48%, rgba(43,182,163,' + (onDark ? .34 : .2) + ') 0 16%, ' + (onDark ? 'rgba(43,182,163,.16)' : 'var(--halo-mid)') + ' 38%, transparent 72%)' }} />}
        <svg viewBox="0 0 120 88" style={{ position: 'relative', width: halo ? '46%' : '78%', overflow: 'visible', animation: wrap, filter: st === 'listening' ? 'brightness(1.15) saturate(1.1)' : 'none', transition: 'filter 250ms var(--ease-out)' }}>
          {[12, 38, 64].map((y, i) => <rect key={i} x="16" y={y} width="88" height="12" rx="6" fill={color}
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: bar(i), '--o': OFF[i] }} />)}
        </svg>
      </span>
      {reduced && showLabel && LABEL[st] && <span style={{ font: '700 13px/1 var(--font-body)', color: labelColor, whiteSpace: 'nowrap' }}>{LABEL[st]}</span>}
    </span>
  );
}
