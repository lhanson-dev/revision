import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

/** Two arrows swapping places: the "mix-up" icon. Neutral, never a warning sign. */
function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 8h15M15 4l4 4-4 4" /><path d="M20 16H5M9 12l-4 4 4 4" />
    </svg>
  )
}

export function Misconception({ block }: { block: LearnBlockOf<'misconception'> }) {
  return (
    <section className="learn-block learn-block--misconception">
      <span className="learn-misconception__icon"><SwapIcon /></span>
      <div className="learn-misconception__body">
        <BlockLabel>{block.label}</BlockLabel>
        <h4 className="learn-block__title">{block.title}</h4>
        {block.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </section>
  )
}
