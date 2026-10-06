import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

export function Comparison({ block }: { block: LearnBlockOf<'comparison'> }) {
  return (
    <section className="learn-block learn-block--comparison">
      <BlockLabel>{block.label}</BlockLabel>
      {block.title && <h4 className="learn-block__title">{block.title}</h4>}
      <div className="learn-comparison__columns" data-columns={block.columns.length}>
        {block.columns.map((column) => (
          <section className="learn-comparison__column" key={column.heading}>
            <h5>{column.heading}</h5>
            <dl>
              {column.items.map((item) => <div key={`${column.heading}-${item.label}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
            </dl>
          </section>
        ))}
      </div>
    </section>
  )
}
