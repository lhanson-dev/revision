import type { LearnBlockOf } from './types'

export function Explanation({ block }: { block: LearnBlockOf<'explanation'> }) {
  return (
    <section className="learn-block learn-block--explanation learn-reading-explanation">
      {block.heading && <h3>{block.heading}</h3>}
      {block.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </section>
  )
}
