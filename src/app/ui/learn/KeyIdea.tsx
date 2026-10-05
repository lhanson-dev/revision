import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

/** `placement="margin"` puts the terms one above another (the right-hand margin on desktop). */
export function KeyIdea({ block, placement = 'full' }: { block: LearnBlockOf<'key-idea'>; placement?: 'full' | 'margin' }) {
  return (
    <section className={`learn-block learn-block--key-idea learn-block--${placement}`}>
      <BlockLabel>{block.label}</BlockLabel>
      <dl className="learn-key-idea__terms">
        {block.definitions.map((item) => (
          <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>
        ))}
      </dl>
    </section>
  )
}
