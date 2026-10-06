import { useId, useState } from 'react'
import { useBreakpoint } from '../useBreakpoint'
import { BlockLabel } from './BlockLabel'
import { describeCrossing, findCrossing, formatTick, niceAxis } from './chart-geometry'
import type { LearnBlockOf } from './types'

const wideView = { width: 760, height: 300, left: 64, top: 14, right: 20, bottom: 44 }
/** Phones draw the chart on a smaller canvas so the labels stay readable instead of shrinking with it. */
const compactView = { width: 360, height: 260, left: 46, top: 14, right: 16, bottom: 44 }

/** Legend and line styles come from CSS by series position: 1 accent solid, 2 ink solid, 3 muted dashed. */
export function Quantitative({ block }: { block: LearnBlockOf<'quantitative'> }) {
  const tableId = useId()
  const view = useBreakpoint().phone ? compactView : wideView
  const [showData, setShowData] = useState(false)

  const points = block.series.flatMap((series) => series.points)
  const maxX = Math.max(...points.map((point) => point.x)) || 1
  const axis = niceAxis(Math.max(...points.map((point) => point.y)))
  const plotWidth = view.width - view.left - view.right
  const plotHeight = view.height - view.top - view.bottom
  const sx = (x: number) => view.left + (x / maxX) * plotWidth
  const sy = (y: number) => view.top + plotHeight - (y / axis.max) * plotHeight
  const baseline = view.top + plotHeight
  const currency = /^[£$€]$/.test(block.yLabel.trim()) ? block.yLabel.trim() : ''

  const crossing = block.series.length >= 2 ? findCrossing(block.series[0].points, block.series[1].points) : null
  const crossingText = describeCrossing(block.series)
  const crossingLabel = crossing ? `${crossingText.label} · ${Math.round(crossing.x).toLocaleString('en-GB')}` : ''
  const labelWidth = crossingLabel.length * 7.4 + 20

  const yTicks: number[] = []
  for (let value = 0; value <= axis.max; value += axis.step) yTicks.push(value)

  return (
    <section className="learn-block learn-block--quantitative">
      <BlockLabel>{block.label}</BlockLabel>
      <ul className="learn-chart__legend" aria-hidden="true">
        {block.series.map((series, index) => <li key={series.name} data-series={index + 1}>{series.name}</li>)}
      </ul>
      <figure className="learn-chart__figure">
        <svg viewBox={`0 0 ${view.width} ${view.height}`} role="img" aria-label={`${block.title}. ${block.explanation ?? ''}`.trim()} className="learn-chart__svg">
          {yTicks.map((value) => (
            <g key={value}>
              <line x1={view.left} x2={view.width - view.right} y1={sy(value)} y2={sy(value)} className="learn-chart__grid" />
              <text x={view.left - 10} y={sy(value) + 4} textAnchor="end" className="learn-chart__tick">{`${currency}${formatTick(value)}`}</text>
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((step) => (
            <text key={step} x={sx((maxX / 4) * step)} y={baseline + 20} textAnchor="middle" className="learn-chart__tick">{((maxX / 4) * step).toLocaleString('en-GB')}</text>
          ))}
          <text x={view.left + plotWidth / 2} y={view.height - 4} textAnchor="middle" className="learn-chart__axis-label">{block.xLabel}</text>
          {block.series.map((series, index) => (
            <path
              key={series.name}
              data-series={index + 1}
              className="learn-chart__line"
              d={series.points.map((point, step) => `${step ? 'L' : 'M'}${sx(point.x)} ${sy(point.y)}`).join(' ')}
            />
          ))}
          {crossing && (
            <g>
              <line x1={sx(crossing.x)} x2={sx(crossing.x)} y1={sy(crossing.y)} y2={baseline} className="learn-chart__drop" />
              <circle cx={sx(crossing.x)} cy={sy(crossing.y)} r="7" className="learn-chart__dot" />
              <rect x={sx(crossing.x) - labelWidth / 2} y={sy(crossing.y) - 44} width={labelWidth} height="28" rx="14" className="learn-chart__flag" />
              <text x={sx(crossing.x)} y={sy(crossing.y) - 25} textAnchor="middle" className="learn-chart__flag-text">{crossingLabel}</text>
              {crossingText.regions && (
                <>
                  <text x={(view.left + sx(crossing.x)) / 2} y={baseline - 12} textAnchor="middle" className="learn-chart__region">{crossingText.regions.left}</text>
                  <text x={(sx(crossing.x) + view.width - view.right) / 2} y={baseline - 12} textAnchor="middle" className="learn-chart__region">{crossingText.regions.right}</text>
                </>
              )}
            </g>
          )}
          <line x1={view.left} x2={view.width - view.right} y1={baseline} y2={baseline} className="learn-chart__axis" />
        </svg>
        <figcaption>{block.title}{block.explanation ? `. ${block.explanation}` : ''}</figcaption>
      </figure>
      <button type="button" className="learn-pill" aria-expanded={showData} aria-controls={tableId} onClick={() => setShowData((open) => !open)}>
        {showData ? 'Hide the data' : 'Show the data'}
      </button>
      {showData && (
        <div id={tableId} className="learn-chart__data">
          {block.series.map((series) => (
            <table key={series.name}>
              <caption>{series.name}</caption>
              <thead><tr><th scope="col">{block.xLabel}</th><th scope="col">{block.yLabel}</th></tr></thead>
              <tbody>{series.points.map((point, index) => <tr key={index}><td>{point.label ?? point.x.toLocaleString('en-GB')}</td><td>{`${currency}${point.y.toLocaleString('en-GB')}`}</td></tr>)}</tbody>
            </table>
          ))}
        </div>
      )}
    </section>
  )
}
