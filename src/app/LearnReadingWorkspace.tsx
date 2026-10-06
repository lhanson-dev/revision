import type { LearnChapter, LearnGroup, LearnPage } from '../../content/learn-schema'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import { resolveSubjectIdentity } from './subject-palette'
import { LearnPageLayout, type LearnPageNeighbour } from './ui/learn'

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

/** Pages run in one sequence across the course; the caption says where the neighbour sits. */
function neighbour(target: LocatedPage | null, current: LocatedPage, direction: 'previous' | 'next'): LearnPageNeighbour | null {
  if (!target) return null
  const sameGroup = target.group.id === current.group.id && target.chapter.id === current.chapter.id
  const lead = direction === 'previous' ? 'Previous' : 'Next'
  if (!sameGroup) return { title: target.page.title, caption: `${lead} · ${target.group.title}` }
  if (direction === 'previous') return { title: target.page.title, caption: lead }
  const index = current.group.pages.findIndex((page) => page.id === target.page.id)
  return { title: target.page.title, caption: `${lead} · page ${index + 1} of ${current.group.pages.length}` }
}

export function LearnReadingWorkspace({ adapter, pageId, onOpenPage, onOpenPractice, onOpenRev }: LearnReadingWorkspaceProps) {
  const pages = locatePages(adapter)
  if (pages.length === 0) return null

  const requestedIndex = pageId ? pages.findIndex((item) => item.page.id === pageId) : -1
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0
  const current = pages[activeIndex]
  const previous = activeIndex > 0 ? pages[activeIndex - 1] : null
  const next = activeIndex < pages.length - 1 ? pages[activeIndex + 1] : null
  const { subject } = adapter.manifest
  const hue = resolveSubjectIdentity(subject.id, subject.name ?? subject.id).hue
  const topic = adapter.getTopic?.(current.page.topicId)
  const practiceQuestionCount = adapter.listQuestions ? adapter.listQuestions(current.page.topicId).length : undefined

  function openSequentialPage(nextPageId: string) {
    onOpenPage(nextPageId)
    scrollReadingSurfaceToTop()
  }

  return (
    <LearnPageLayout
      page={current.page}
      chapterTitle={current.chapter.title}
      groupTitle={current.group.title}
      position={{ index: current.group.pages.findIndex((page) => page.id === current.page.id) + 1, of: current.group.pages.length }}
      hue={hue}
      topicName={topic?.shortTitle ?? current.page.title}
      practiceQuestionCount={practiceQuestionCount}
      previous={neighbour(previous, current, 'previous')}
      next={neighbour(next, current, 'next')}
      onPrevious={previous ? () => openSequentialPage(previous.page.id) : undefined}
      onNext={next ? () => openSequentialPage(next.page.id) : undefined}
      onOpenPractice={onOpenPractice ? () => onOpenPractice(current.page.topicId) : undefined}
      onOpenRev={onOpenRev}
    />
  )
}
