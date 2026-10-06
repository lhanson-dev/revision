import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

export function Recap({ block }: { block: LearnBlockOf<'recap'> }) {
  return (
    <section className="learn-block learn-block--recap">
      <BlockLabel>{block.label}</BlockLabel>
      <ol className="learn-recap__list">
        {block.items.map((item, index) => <li key={`${index}-${item}`}><span aria-hidden="true">{index + 1}</span><p>{item}</p></li>)}
      </ol>
    </section>
  )
}
