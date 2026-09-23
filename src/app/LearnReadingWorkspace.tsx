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

function renderExplanation(block: Extract<LearnBlock, { type: 'explanation' }>, key: string) {
  return (
    <section className="learn-reading-explanation" key={key}>
      {block.heading && <h3>{block.heading}</h3>}
      {block.paragraphs.map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}
    </section>
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

  if (block.type === 'relationship') {
    return (
      <EducationalTreatment kind="relationship" label={block.label} title={block.title} key={key}>
        <ol className="learn-relationship-chain">
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ol>
        {block.explanation && <p>{block.explanation}</p>}
      </EducationalTreatment>
    )
  }

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

  return (
    <div className="learn-reading-workspace" data-subject-accent={adapter.manifest.subject.id}>
      <article className="learn-reading-page" aria-labelledby={titleId}>
        <nav className="learn-reading-context" aria-label="Learn location">
          <span>{current.chapter.title}</span><span aria-hidden="true">›</span><span>{current.group.title}</span>
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
          <div><strong>Not quite clicking?</strong><span>Ask REV to explain {current.page.title.toLowerCase()} another way.</span></div>
          <Button variant="tertiary" onClick={() => onOpenRev(revDraft)}>Ask REV</Button>
        </aside>}

        {recaps.map((block, index) => renderRecap(block, `recap-${index}`))}

        <nav className="learn-page-navigation" aria-label="Teaching page navigation">
          <div>
            {previous && <Button variant="tertiary" onClick={() => onOpenPage(previous.page.id)}>← Previous<span>{previous.page.title}</span></Button>}
          </div>
          <div>
            {next && <Button variant="tertiary" onClick={() => onOpenPage(next.page.id)}>Next →<span>{next.page.title}</span></Button>}
          </div>
        </nav>

        {onOpenPractice && <section className="learn-practice-handoff" aria-label="Practice this topic">
          <div><strong>Ready to see what you know?</strong><span>Test {current.page.title.toLowerCase()} in Practice.</span></div>
          <Button onClick={() => onOpenPractice(current.page.topicId)}>Start Practice</Button>
        </section>}
      </article>
    </div>
  )
}
