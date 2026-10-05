import { useState } from 'react'
import { BlockLabel } from './BlockLabel'
import type { LearnBlockOf } from './types'

/**
 * Step-through: step 1 first, then "Show step N" and "Show all". Hidden steps keep their label and
 * show a dashed "Work this one out, then show it". The conclusion appears once every step is shown.
 */
export function WorkedExample({ block }: { block: LearnBlockOf<'worked-example'> }) {
  const total = block.steps.length
  const [shown, setShown] = useState(1)
  const visible = Math.min(shown, total)
  const stepping = total > 1
  const done = visible >= total

  return (
    <section className="learn-block learn-block--worked-example">
      <header className="learn-worked__head">
        <div>
          <BlockLabel>{block.label}</BlockLabel>
          {block.title && <h4 className="learn-block__title learn-block__title--display">{block.title}</h4>}
        </div>
        {stepping && <span className="learn-worked__counter">Step {visible} of {total}</span>}
      </header>
      <ol className="learn-worked__steps">
        {block.steps.map((step, index) => {
          const isShown = index < visible
          return (
            <li key={`${index}-${step.label}`} data-shown={isShown}>
              <span className="learn-worked__number" aria-hidden="true">{index + 1}</span>
              <div>
                <span className="learn-worked__label">{step.label}</span>
                {isShown
                  ? <span className="learn-worked__value">{step.value}</span>
                  : <span className="learn-worked__hidden">Work this one out, then show it</span>}
              </div>
            </li>
          )
        })}
      </ol>
      <div className="learn-sr-only" aria-live="polite">{stepping ? `Showing step ${visible} of ${total}.` : ''}</div>
      {!done && (
        <div className="learn-worked__actions">
          <button type="button" className="learn-pill learn-pill--strong" onClick={() => setShown(visible + 1)}>Show step {visible + 1}</button>
          <button type="button" className="learn-pill" onClick={() => setShown(total)}>Show all</button>
        </div>
      )}
      {done && block.conclusion && <p className="learn-worked__conclusion">{block.conclusion}</p>}
    </section>
  )
}
