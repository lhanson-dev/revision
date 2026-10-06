import { useId, useState, type CSSProperties } from 'react'
import type { ExamContentCheck, ExamPapersContent } from '../../../../content/exam-papers-schema'
import { CHECK_MINUTES, durationLabel, pacedSections, timeSegments, type LastMock, type MockRow, type MockSuggestion } from '../../exam-prep'
import { Icon } from '../Icon'
import { RevSuggestionCard } from '../RevSuggestionCard'
import { classNames } from '../classNames'

export type ExamMockMode = 'timed' | 'untimed'

export interface ExamPrepFirstExam {
  /** The exam's title from the student's own exam dates, e.g. "Paper 1". */
  title: string
  /** Already worded: "Tue 11 May 2027". */
  dateLabel: string
  /** Already worded: "31 weeks away". */
  away: string
}

export interface ExamPrepPageProps {
  courseName: string
  boardName: string
  /** `--accent*` variables for the subject hue (see `accentStyle`). */
  accentStyle: CSSProperties
  /** From the student's exam dates. Null shows an honest line instead of a date. */
  firstExam: ExamPrepFirstExam | null
  /** The paper guide for this board and spec. Null when none is published yet: the page says so, honestly. */
  guide: ExamPapersContent | null
  /** "9 of 10 topics covered" for each paper number. */
  topicsCovered: Readonly<Record<number, string>>
  mocks: readonly MockRow[]
  suggestion: MockSuggestion | null
  lastMock: LastMock | null
  onStartMock: (mockId: string, mode: ExamMockMode) => void
}

/**
 * The Exam Prep tab (v2.2): your papers, what examiners look for, mock exams. It lives in the normal learner
 * shell. Only a mock opens in a pop-up. Presentation only: every number and sentence arrives as a prop.
 */
export function ExamPrepPage(props: ExamPrepPageProps) {
  const { courseName, boardName, accentStyle, firstExam, guide, topicsCovered, mocks, suggestion, lastMock, onStartMock } = props
  const titleId = useId()
  const panelId = useId()
  const [openPaper, setOpenPaper] = useState<number | null>(null)
  const [revHidden, setRevHidden] = useState(false)
  const opened = guide?.papers.find((paper) => paper.number === openPaper) ?? null

  return (
    <div className="exam-prep" style={accentStyle}>
      <header className="exam-prep__head">
        <div className="exam-prep__intro">
          <p className="ui-eyebrow">Exam Prep · {courseName} · {boardName}</p>
          <h2 id={titleId} className="exam-prep__title">Get ready for the exams</h2>
          <p className="exam-prep__lead">Know what is in each paper, how the time runs and what examiners give marks for. Then sit a mock the way you will sit the real thing.</p>
          <p className="exam-prep__next">
            <Icon name="plan" size="compact" />
            <span>{firstExam ? `First exam: ${firstExam.title} · ${firstExam.dateLabel} · ${firstExam.away}` : 'No exam date set yet. Add your exam dates in Plan and they will show here.'}</span>
          </p>
        </div>
        {suggestion && !revHidden && (
          <RevSuggestionCard
            className="exam-prep__rev"
            eyebrow={`REV suggests · ${durationLabel(suggestion.mock.minutes)}`}
            reason={`${suggestion.mock.name}. ${suggestion.reason}`}
            primaryAction={{ label: 'Start it', onClick: () => onStartMock(suggestion.mock.id, 'timed') }}
            secondaryAction={{ label: 'Not now', onClick: () => setRevHidden(true) }}
          />
        )}
      </header>

      <section className="exam-prep__section" aria-labelledby={`${titleId}-papers`}>
        <h3 id={`${titleId}-papers`} className="exam-prep__heading">Your papers</h3>
        {guide ? (
          <>
            <div className="exam-prep__papers">
              {guide.papers.map((paper) => {
                const isOpen = openPaper === paper.number
                return (
                  <button
                    key={paper.number}
                    type="button"
                    className={classNames('exam-paper', isOpen && 'is-open')}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenPaper(isOpen ? null : paper.number)}
                  >
                    <span className="exam-paper__top">
                      <span className="ui-eyebrow">Paper {paper.number}</span>
                      {topicsCovered[paper.number] && <span className="exam-chip">{topicsCovered[paper.number]}</span>}
                    </span>
                    <span className="exam-paper__what">{paper.what}</span>
                    <span className="exam-paper__meta">{durationLabel(paper.durationMinutes)} · {paper.totalMarks} marks · {paper.weighting}</span>
                    <span className="exam-paper__link"><span>How it runs</span><Icon name="chevron-right" size="inline" className="exam-paper__chevron" /></span>
                  </button>
                )
              })}
            </div>
            <div id={panelId} role="region" aria-label={opened ? `How ${opened.name} runs` : 'How a paper runs'} hidden={!opened}>
              {opened && <PaperRuns paper={opened} dayRules={guide.dayRules ?? []} />}
            </div>
          </>
        ) : (
          <p className="exam-prep__empty">The paper guide for {courseName} ({boardName}) has not been published yet, so there is nothing to show here. Mock exams below still work.</p>
        )}
      </section>

      {guide && (
        <section className="exam-prep__section" aria-labelledby={`${titleId}-examiners`}>
          <h3 id={`${titleId}-examiners`} className="exam-prep__heading">What examiners look for</h3>
          <ul className="exam-prep__aos">
            {guide.assessmentObjectives.map((ao) => (
              <li key={ao.id} className="exam-ao">
                <span className="exam-ao__head"><span className="exam-ao__chip">{ao.id}</span></span>
                <span className="exam-ao__name">{ao.capability}</span>
                <span className="exam-ao__weight">{ao.overallPercentRange[0]}–{ao.overallPercentRange[1]}% of your A-level marks</span>
                {ao.coaching && (
                  <span className="exam-ao__coaching">
                    <span className="exam-ao__does">{ao.coaching.does}</span>
                    <span className="exam-ao__show"><strong>How you show it</strong><span>{ao.coaching.show}</span></span>
                    <BeingChecked check={ao.coaching.check} />
                  </span>
                )}
              </li>
            ))}
          </ul>
          {guide.commandWords && guide.commandWords.length > 0 && (
            <div className="exam-commands">
              <h4 className="exam-commands__title">Command words</h4>
              <ul className="exam-commands__list">
                {guide.commandWords.map((command) => (
                  <li key={command.word} className="exam-command">
                    <strong className="exam-command__word">{command.word}</strong>
                    <span className="exam-command__asks">{command.asks}</span>
                    <span className="exam-command__marks"><span>{command.marks}</span><span>{command.aos}</span></span>
                    <BeingChecked check={command.check} className="exam-command__check" />
                  </li>
                ))}
              </ul>
              {guide.levelsNote && <p className="exam-commands__levels"><Icon name="info" size="compact" /><span>{guide.levelsNote.text}</span><BeingChecked check={guide.levelsNote.check} /></p>}
            </div>
          )}
        </section>
      )}

      <section className="exam-prep__section" aria-labelledby={`${titleId}-mocks`}>
        <h3 id={`${titleId}-mocks`} className="exam-prep__heading">Mock exams</h3>
        {mocks.length === 0 ? (
          <p className="exam-prep__empty">No mock exam is published for this course yet.</p>
        ) : (
          <ul className="exam-mocks">
            {mocks.map((mock) => (
              <li key={mock.id} className="exam-mock">
                <div className="exam-mock__copy">
                  <strong className="exam-mock__name">{mock.name}</strong>
                  <span className="exam-mock__meta">{mock.meta}</span>
                  <span className="exam-mock__time"><Icon name="clock" size="inline" /><span>{durationLabel(mock.minutes)}</span></span>
                  {mock.claim && <span className="exam-mock__claim">{mock.claim}</span>}
                  {mock.note && <span className="exam-mock__note">{mock.note}</span>}
                </div>
                <div className="exam-mock__actions">
                  <button type="button" className="exam-button exam-button--primary" onClick={() => onStartMock(mock.id, 'timed')}>Start timed</button>
                  <button type="button" className="exam-button exam-button--secondary" onClick={() => onStartMock(mock.id, 'untimed')}>Practise untimed</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {lastMock && <p className="exam-prep__last">Last mock: {lastMock.name} · {lastMock.marks} · {lastMock.mode} · {lastMock.date}</p>}
      </section>
    </div>
  )
}

function PaperRuns({ paper, dayRules }: { paper: ExamPapersContent['papers'][number]; dayRules: NonNullable<ExamPapersContent['dayRules']> }) {
  const segments = timeSegments(paper)
  return (
    <div className="exam-runs">
      <div className="exam-runs__head">
        <p className="ui-eyebrow">How {paper.name} runs</p>
        <h4 className="exam-runs__title">{durationLabel(paper.durationMinutes)}, start to finish</h4>
      </div>
      <div className="exam-bar" aria-hidden="true">
        {segments.map((segment) => (
          <span key={segment.id} className={`exam-bar__segment exam-bar__segment--${segment.tone}`} style={{ flexGrow: segment.minutes }} title={`${segment.label}: about ${segment.minutes} min`}>
            {segment.kind === 'section' && <span className="exam-bar__label">{segment.label}</span>}
          </span>
        ))}
      </div>
      <ul className="exam-runs__rows">
        {pacedSections(paper).map((section) => (
          <li key={section.name} className="exam-run">
            <strong className="exam-run__name">{section.name}</strong>
            <span className="exam-run__type">{section.type}</span>
            <span className="exam-run__marks">{section.marks} marks</span>
            <span className="exam-run__time"><Icon name="clock" size="inline" /><span>about {section.minutes} min</span></span>
          </li>
        ))}
      </ul>
      <p className="exam-runs__spare">Leaves {CHECK_MINUTES} minutes to check. Minutes are a suggestion: the paper’s time shared out by marks.</p>
      {paper.notes && paper.notes.length > 0 && (
        <ul className="exam-day__list exam-runs__notes">
          {paper.notes.map((note) => <li key={note.text}><Icon name="info" size="compact" /><span>{note.text}</span><BeingChecked check={note.check} /></li>)}
        </ul>
      )}
      {dayRules.length > 0 && <div className="exam-day">
        <h5 className="exam-day__title">On the day</h5>
        <ul className="exam-day__list">
          {dayRules.map((rule) => <li key={rule.text}><Icon name="check" size="compact" /><span>{rule.text}</span><BeingChecked check={rule.check} /></li>)}
        </ul>
      </div>}
    </div>
  )
}

/**
 * The flag on wording that is not yet approved through the Content Factory or checked against the exam board.
 * Neutral, icon plus words (never colour alone). The reason is in the accessible name for reviewers.
 */
function BeingChecked({ check, className }: { check: ExamContentCheck; className?: string }) {
  return (
    <span className={classNames('exam-checking', className)} title={check.why}>
      <Icon name="info" size="inline" />
      <span>Being checked</span>
      <span className="ui-visually-hidden">: {check.why}</span>
    </span>
  )
}
