import type { LearnBlock, LearnChapter, LearnGroup, LearnPage } from '../../content/learn-schema'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import { Button, EducationalTreatment } from './ui'

type LearnReadingWorkspaceProps = {
  adapter: LearningContentAdapter
  pageId?: string | null
  onOpenPage: (pageId: string) => void
  onOpenPractice?: (topicId: string) => void
  onOpenRev?: (draft?: string) => void
}

type LocatedPage = {
  chapter: LearnChapter
  group: LearnGroup
  page: LearnPage
}

function locatePages(adapter: LearningContentAdapter): LocatedPage[] {
  return adapter.listLearnChapters().flatMap((chapter) => chapter.groups.flatMap((group) => (
    group.pages.map((page) => ({ chapter, group, page }))
  )))
}

function scrollReadingSurfaceToTop() {
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
}

function renderExplanation(block: Extract<LearnBlock, { type: 'explanation' }>, key: string) {
  return (
    <section className="learn-reading-explanation" key={key}>
      {block.heading && <h3>{block.heading}</h3>}
      {block.paragraphs.map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}
    </section>
  )
}

function renderRelationship(block: Extract<LearnBlock, { type: 'relationship' }>, key: string) {
  return (
    <EducationalTreatment kind="relationship" label={block.label} title={block.title} key={key}>
      <ol className="learn-relationship-chain" aria-label={block.title ?? block.label}>
        {block.items.map((item) => <li key={item}><span>{item}</span></li>)}
      </ol>
      {block.explanation && <p>{block.explanation}</p>}
    </EducationalTreatment>
  )
}

function renderComparison(block: Extract<LearnBlock, { type: 'comparison' }>, key: string) {
  return (
    <EducationalTreatment kind="comparison" label={block.label} title={block.title} key={key}>
      <div className="learn-comparison-grid">
        {block.columns.map((column) => (
          <section className="learn-comparison-column" key={column.heading}>
            <h4>{column.heading}</h4>
            <dl>
              {column.items.map((item) => <div key={`${column.heading}-${item.label}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
            </dl>
          </section>
        ))}
      </div>
    </EducationalTreatment>
  )
}

function chartGeometry(block: Extract<LearnBlock, { type: 'quantitative' }>) {
  const allPoints = block.series.flatMap((series) => series.points)
  const xs = allPoints.map((point) => point.x)
  const ys = allPoints.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(0, ...ys)
  const maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const left = 54
  const top = 20
  const width = 500
  const height = 210
  const point = (x: number, y: number) => ({
    x: left + ((x - minX) / rangeX) * width,
    y: top + height - ((y - minY) / rangeY) * height,
  })
  return { left, top, width, height, point, minX, maxX, minY, maxY }
}

function renderQuantitative(block: Extract<LearnBlock, { type: 'quantitative' }>, key: string) {
  const geometry = chartGeometry(block)
  return (
    <EducationalTreatment kind="quantitative" label={block.label} title={block.title} key={key}>
      <figure className="learn-quantitative-figure">
        <svg className="learn-quantitative-chart" viewBox="0 0 590 280" role="img" aria-label={`${block.title}. ${block.explanation ?? ''}`}>
          <line x1={geometry.left} y1={geometry.top} x2={geometry.left} y2={geometry.top + geometry.height} className="learn-chart-axis" />
          <line x1={geometry.left} y1={geometry.top + geometry.height} x2={geometry.left + geometry.width} y2={geometry.top + geometry.height} className="learn-chart-axis" />
          {block.series.map((series, seriesIndex) => {
            const coordinates = series.points.map((item) => geometry.point(item.x, item.y))
            const path = coordinates.map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x} ${coordinate.y}`).join(' ')
            return (
              <g key={series.name} data-series-index={seriesIndex}>
                <path d={path} className="learn-chart-series" />
                {coordinates.map((coordinate, pointIndex) => <circle key={`${series.name}-${pointIndex}`} cx={coordinate.x} cy={coordinate.y} r="4" className="learn-chart-point" />)}
              </g>
            )
          })}
          <text x={geometry.left + geometry.width / 2} y="270" textAnchor="middle" className="learn-chart-label">{block.xLabel}</text>
          <text x="14" y={geometry.top + geometry.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${geometry.top + geometry.height / 2})`} className="learn-chart-label">{block.yLabel}</text>
        </svg>
        <div className="learn-chart-legend" aria-hidden="true">
          {block.series.map((series, index) => <span key={series.name} data-series-index={index}>{series.name}</span>)}
        </div>
        <div className="learn-quantitative-data" aria-label={`${block.title} data`}>
          {block.series.map((series) => (
            <details key={series.name}>
              <summary>{series.name} data</summary>
              <ul>{series.points.map((point) => <li key={`${series.name}-${point.x}-${point.y}`}>{point.label ?? block.xLabel} {point.x}: {point.y}</li>)}</ul>
            </details>
          ))}
        </div>
        {block.explanation && <figcaption>{block.explanation}</figcaption>}
      </figure>
    </EducationalTreatment>
  )
}

function renderTreatment(block: Exclude<LearnBlock, { type: 'explanation' | 'recap' }>, key: string) {
  if (block.type === 'key-idea') {
    return (
      <EducationalTreatment kind="key-idea" label={block.label} key={key}>
        <dl className="learn-definition-grid">
          {block.definitions.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}
        </dl>
      </EducationalTreatment>
    )
  }

  if (block.type === 'example') {
    return (
      <EducationalTreatment kind="example" label={block.label} title={block.title} key={key}>
        {block.paragraphs.map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}
      </EducationalTreatment>
    )
  }

  if (block.type === 'worked-example') {
    return (
      <EducationalTreatment kind="worked-example" label={block.label} title={block.title} key={key}>
        <dl className="learn-worked-steps">
          {block.steps.map((step) => <div key={step.label}><dt>{step.label}</dt><dd>{step.value}</dd></div>)}
        </dl>
        {block.conclusion && <p className="learn-worked-conclusion">{block.conclusion}</p>}
      </EducationalTreatment>
    )
  }

  if (block.type === 'relationship') return renderRelationship(block, key)
  if (block.type === 'comparison') return renderComparison(block, key)
  if (block.type === 'quantitative') return renderQuantitative(block, key)

  return (
    <EducationalTreatment kind="misconception" label={block.label} title={block.title} key={key}>
      {block.paragraphs.map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}
    </EducationalTreatment>
  )
}

function renderRecap(block: Extract<LearnBlock, { type: 'recap' }>, key: string) {
  return (
    <EducationalTreatment kind="recap" label={block.label} key={key}>
      <ul className="learn-recap-list">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
    </EducationalTreatment>
  )
}

export function LearnReadingWorkspace({ adapter, pageId, onOpenPage, onOpenPractice, onOpenRev }: LearnReadingWorkspaceProps) {
  const pages = locatePages(adapter)
  if (pages.length === 0) return null

  const requestedIndex = pageId ? pages.findIndex((item) => item.page.id === pageId) : -1
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0
  const current = pages[activeIndex]
  const previous = activeIndex > 0 ? pages[activeIndex - 1] : null
  const next = activeIndex < pages.length - 1 ? pages[activeIndex + 1] : null
  const recaps = current.page.blocks.filter((block): block is Extract<LearnBlock, { type: 'recap' }> => block.type === 'recap')
  const teachingBlocks = current.page.blocks.filter((block) => block.type !== 'recap')
  const titleId = `learn-page-${current.page.id}`
  const revDraft = `Can you explain ${current.page.title} another way?`

  function openSequentialPage(nextPageId: string) {
    onOpenPage(nextPageId)
    scrollReadingSurfaceToTop()
  }

  return (
    <div className="learn-reading-workspace" data-subject-accent={adapter.manifest.subject.id}>
      <article className="learn-reading-page" aria-labelledby={titleId}>
        <nav className="learn-reading-context" aria-label="Learn location">
          <span>Learn</span><span aria-hidden="true">›</span><span>{current.chapter.title}</span><span aria-hidden="true">›</span><span>{current.group.title}</span>
        </nav>

        <header className="learn-reading-header">
          <h2 id={titleId}>{current.page.title}</h2>
          <p>{current.page.orientation}</p>
        </header>

        <div className="learn-reading-body">
          {teachingBlocks.map((block, index) => block.type === 'explanation'
            ? renderExplanation(block, `${block.type}-${index}`)
            : renderTreatment(block, `${block.type}-${index}`))}
        </div>

        {onOpenRev && <aside className="learn-contextual-rev" aria-label="Ask REV about this page">
          <div><strong>Still not clicking?</strong><span>Ask REV to explain {current.page.title.toLowerCase()} another way.</span></div>
          <Button variant="tertiary" onClick={() => onOpenRev(revDraft)}>Ask REV</Button>
        </aside>}

        {recaps.map((block, index) => renderRecap(block, `recap-${index}`))}

        <nav className="learn-page-navigation" aria-label="Teaching page navigation">
          <div>
            {previous && <Button variant="tertiary" onClick={() => openSequentialPage(previous.page.id)}>← Previous<span>{previous.page.title}</span></Button>}
          </div>
          <div>
            {next && <Button variant="tertiary" onClick={() => openSequentialPage(next.page.id)}>Next →<span>{next.page.title}</span></Button>}
          </div>
        </nav>

        {onOpenPractice && <section className="learn-practice-handoff" aria-label="Practice this topic">
          <div><strong>Think you’ve got this?</strong><span>Test what you know about {current.page.title.toLowerCase()}.</span></div>
          <Button onClick={() => onOpenPractice(current.page.topicId)}>Practice this topic</Button>
        </section>}
      </article>
    </div>
  )
}
