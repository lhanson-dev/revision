import type { CSSProperties } from 'react'
import type { LearnPage } from '../../../../content/learn-schema'
import { subjectColourVars, type SubjectHue } from '../../subject-palette'
import { RevPresence } from '../../RevPresence'
import { Button } from '../controls'
import { Icon } from '../Icon'
import { LearnBlock } from './LearnBlock'
import { planLearnLayout, questionCountPhrase, readMinutes } from './layout-plan'

export type LearnPageNeighbour = {
  title: string
  /** "Next · page 5 of 6", or the group name when the neighbour sits in another group. */
  caption: string
}

export type LearnPageLayoutProps = {
  page: LearnPage
  chapterTitle: string
  groupTitle: string
  /** This page's place in its group. */
  position: { index: number; of: number }
  /** The subject hue from the course catalogue. Set once on the root; blocks only read `--accent*`. */
  hue: SubjectHue
  /** Real number of Practice questions for this topic. Omit when unknown. */
  practiceQuestionCount?: number
  /** Short topic name for the Practice and REV cards. Defaults to the page title. */
  topicName?: string
  previous?: LearnPageNeighbour | null
  next?: LearnPageNeighbour | null
  onPrevious?: () => void
  onNext?: () => void
  onOpenPractice?: () => void
  onOpenRev?: (draft: string) => void
}

/** CSS variables for the subject hue. Every block reads these and nothing subject-specific. */
export function accentStyle(hue: SubjectHue): CSSProperties {
  const vars = subjectColourVars(hue)
  return { '--accent': vars.solid, '--accent-tint': vars.tint, '--accent-ink': vars.ink, '--accent-on': vars.on } as CSSProperties
}

export function LearnPageLayout({
  page, chapterTitle, groupTitle, position, hue, practiceQuestionCount, topicName,
  previous, next, onPrevious, onNext, onOpenPractice, onOpenRev,
}: LearnPageLayoutProps) {
  const titleId = `learn-page-${page.id}`
  const topic = topicName ?? page.title
  const items = planLearnLayout(page.blocks)
  const minutes = readMinutes(page)
  const hasPractice = practiceQuestionCount !== 0 && Boolean(onOpenPractice)

  return (
    <div className="learn-reading-workspace" style={accentStyle(hue)}>
      <article className="learn-reading-page" aria-labelledby={titleId}>
        <header className="learn-reading-header">
          <nav className="learn-reading-context" aria-label="Learn location">
            {chapterTitle} <span aria-hidden="true">›</span> {groupTitle} · Page {position.index} of {position.of} · {minutes} min read
          </nav>
          <h2 id={titleId}>{page.title}</h2>
          <p className="learn-reading-orientation">{page.orientation}</p>
        </header>

        <div className="learn-reading-body">
          {items.map((item) => item.kind === 'margin-row'
            ? (
              <div className="learn-row" key={item.key}>
                <LearnBlock block={item.explanation} />
                <LearnBlock block={item.keyIdea} placement="margin" />
              </div>
            )
            : <LearnBlock key={item.key} block={item.block} />)}
        </div>

        <footer className="learn-end">
          <hr className="learn-end__divider" />
          <div className="learn-end__cards">
            <section className="learn-cta learn-cta--practice" aria-labelledby={`${titleId}-practice`}>
              <p className="learn-cta__eyebrow">Test yourself</p>
              <h3 id={`${titleId}-practice`}>Think you’ve got it?</h3>
              <p>{practiceQuestionCount && practiceQuestionCount > 0
                ? `${questionCountPhrase(practiceQuestionCount)} on ${topic}. These count towards Understanding.`
                : `Practice questions on ${topic} count towards Understanding.`}</p>
              {hasPractice && <Button onClick={onOpenPractice}>Practice this topic</Button>}
            </section>
            <section className="learn-cta learn-cta--rev" aria-labelledby={`${titleId}-rev`}>
              <p className="learn-cta__eyebrow"><span className="learn-cta__rev-mark"><RevPresence size="compact" decorative /></span>REV</p>
              <h3 id={`${titleId}-rev`}>Still not got it?</h3>
              <p>I’ll explain {page.title} another way, starting from what you’ve just read.</p>
              {onOpenRev && (
                <Button onClick={() => onOpenRev(`I’m reading “${page.title}” (${chapterTitle} › ${groupTitle}). Can you explain it another way, starting from what I’ve just read?`)}>Ask REV</Button>
              )}
            </section>
          </div>

          {(previous || next) && (
            <nav className="learn-pager" aria-label="Teaching page navigation">
              {previous && (
                <button type="button" className="learn-pager__button learn-pager__button--previous" onClick={onPrevious}>
                  <span className="learn-pager__arrow"><Icon name="arrow-right" size="compact" /></span>
                  <span><small>{previous.caption}</small><strong>{previous.title}</strong></span>
                </button>
              )}
              {next && (
                <button type="button" className="learn-pager__button learn-pager__button--next" onClick={onNext}>
                  <span className="learn-pager__arrow"><Icon name="arrow-right" size="compact" /></span>
                  <span><small>{next.caption}</small><strong>{next.title}</strong></span>
                </button>
              )}
            </nav>
          )}
        </footer>
      </article>
    </div>
  )
}
