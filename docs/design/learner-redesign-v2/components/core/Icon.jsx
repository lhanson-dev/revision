import React from 'react';
const RING = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z';
const PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6',
  plan: 'M5.5 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 3v4M16 3v4M3.5 9.5h17M9 14l2 2 4-4',
  progress: 'M4 20V10M10 20V5M16 20v-8M22 20V3M2 20h20',
  courses: 'M4 5.5c3.3 0 5.8.7 8 2v12c-2.2-1.3-4.7-2-8-2zM20 5.5c-3.3 0-5.8.7-8 2v12c2.2-1.3 4.7-2 8-2z',
  check: 'm5 12 5 5 9-10',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  bolt: [{ d: 'M13 2 4 14h7l-1 8 9-12h-7z', fill: true }],
  shield: 'M12 3 4 7v5c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V7z',
  clock: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2.5 2M9 2h6',
  moon: 'M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  /* status */
  gotit: RING + 'M8 12.4l2.8 2.8L16.2 9.6',
  nearly: [{ d: RING }, { d: 'M12 3a9 9 0 0 1 0 18Z', fill: true }],
  needswork: 'M6 21V4.5M6 4.5h11l-2.4 4.25L17 13H6',
  started: RING + 'M8.2 12h.01M12 12h.01M15.8 12h.01',
  notstarted: [{ d: RING, dash: '2.6 3.1' }]
};
export function Icon({ name, size = 20, strokeWidth = 2.4, color = 'currentColor', style }) {
  const p = PATHS[name] || '';
  const parts = typeof p === 'string' ? [{ d: p }] : p;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', ...style }} aria-hidden="true">
      {parts.map((x, i) => <path key={i} d={x.d} fill={x.fill ? color : 'none'} stroke={x.fill ? 'none' : color} strokeWidth={strokeWidth} strokeDasharray={x.dash} />)}
    </svg>
  );
}
