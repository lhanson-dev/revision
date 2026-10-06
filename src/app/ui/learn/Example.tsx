import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

export function Example({ block }: { block: LearnBlockOf<'example'> }) {
  return (
    <section className="learn-block learn-block--example">
      <BlockLabel>{block.label}</BlockLabel>
      {block.title && <h4 className="learn-block__title">{block.title}</h4>}
      {block.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </section>
  )
}
