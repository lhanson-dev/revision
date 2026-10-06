import { Icon } from '../Icon'
import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

export function Relationship({ block }: { block: LearnBlockOf<'relationship'> }) {
  const last = block.items.length - 1
  return (
    <section className="learn-block learn-block--relationship">
      <BlockLabel>{block.label}</BlockLabel>
      {block.title && <h4 className="learn-block__title">{block.title}</h4>}
      <ol className="learn-relationship__chain" aria-label={block.title ?? block.label}>
        {block.items.map((item, index) => (
          <li key={`${index}-${item}`}>
            <span className={index === last ? 'learn-relationship__pill learn-relationship__pill--result' : 'learn-relationship__pill'}>{item}</span>
            {index < last && <Icon name="arrow-right" size="compact" className="learn-relationship__arrow" />}
          </li>
        ))}
      </ol>
      {block.explanation && <p>{block.explanation}</p>}
    </section>
  )
}
