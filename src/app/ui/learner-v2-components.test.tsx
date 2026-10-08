import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'
import { CourseIdentity } from './CourseIdentity'
import { ExaminerGuide } from './ExaminerGuide'
import { FeedbackBar } from './FeedbackBar'
import { learningStatusMeta, learningStatusOrder } from './learning-status'
import { ProgressMeasures } from './ProgressMeasures'
import { QuickCheck } from './QuickCheck'
import { RevMark } from './RevMark'
import { StatusBadge } from './StatusBadge'
import { SubjectBadge } from './SubjectBadge'
import { Tag } from './Tag'
import { UnderstandingBar } from './UnderstandingBar'
import { breakpointForWidth } from './useBreakpoint'

const noop = () => undefined
const navItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'plan' },
  { key: 'progress', label: 'Progress', icon: 'progress' },
  { key: 'courses', label: 'Courses', icon: 'courses' },
] as const

const phoneNavItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'plan' },
  { key: 'courses', label: 'Courses', icon: 'courses' },
  { key: 'progress', label: 'Progress', icon: 'progress' },
] as const

describe('learning status', () => {
  it('uses the five fixed labels, each with its own icon', () => {
    expect(learningStatusOrder.map((status) => learningStatusMeta[status].label)).toEqual([
      'Got it', 'Nearly there', 'Needs work', 'Just started', 'Not started',
    ])
    expect(new Set(learningStatusOrder.map((status) => learningStatusMeta[status].icon)).size).toBe(5)
  })

  it('always renders an icon with the text, never colour alone', () => {
    const markup = renderToStaticMarkup(<StatusBadge status="needswork" />)
    expect(markup).toContain('<svg')
    expect(markup).toContain('Needs work')
    expect(markup).toContain('ui-status-badge--needswork')
  })

  it('writes the understanding bar as text and leaves empty statuses out', () => {
    const markup = renderToStaticMarkup(<UnderstandingBar counts={{ gotit: 1, nearly: 2, needswork: 1, notstarted: 6 }} />)
    expect(markup).toContain('Understanding: 1 got it · 2 nearly there · 1 needs work · 6 not started')
    expect(markup).not.toContain('just started')
  })
})

describe('progress measures', () => {
  it('keeps the three measures separate and never blends them into one percentage', () => {
    const markup = renderToStaticMarkup(
      <ProgressMeasures hue="blue" covered={3} total={12} understanding={{ gotit: 1, notstarted: 11 }} />,
    )
    expect(markup).toContain('Topics covered')
    expect(markup).toContain('Understanding')
    expect(markup).toContain('Exam readiness')
    expect(markup).toContain('Not enough evidence yet')
    expect(markup).not.toMatch(/predicted|grade/i)
  })

  it('shows only an engine-supplied readiness value', () => {
    const markup = renderToStaticMarkup(
      <ProgressMeasures covered={0} total={0} understanding={{}} readiness="Building" readinessNote="Answer a few exam questions to unlock this." />,
    )
    expect(markup).toContain('Building')
    expect(markup).not.toContain('Not enough evidence yet')
  })
})

describe('subject badge', () => {
  it('is hidden from screen readers because the subject name carries the meaning', () => {
    const markup = renderToStaticMarkup(<SubjectBadge hue="blue" mark="B" />)
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('var(--subject-blue)')
    expect(markup).toContain('>B<')
  })
})

describe('course identity', () => {
  it('uses the governed subject mark with visible course context instead of a subject pictogram', () => {
    const markup = renderToStaticMarkup(
      <CourseIdentity subjectId="business" subjectName="Business" qualificationName="A-level" examBoardName="AQA" specificationCode="7132" />,
    )
    expect(markup).toContain('>B<')
    expect(markup).toContain('Business')
    expect(markup).toContain('AQA A-level · 7132')
    expect(markup).not.toContain('briefcase')
  })
})

describe('REV mark', () => {
  it('gives every state as text for screen readers', () => {
    expect(renderToStaticMarkup(<RevMark state="thinking" />)).toContain('REV is thinking')
    expect(renderToStaticMarkup(<RevMark state="listening" />)).toContain('REV is listening')
    expect(renderToStaticMarkup(<RevMark state="waiting" />)).toContain('aria-live="polite"')
  })
})

describe('quick check', () => {
  it('is labelled Not scored and exposes no way to record an answer', () => {
    const markup = renderToStaticMarkup(
      <QuickCheck
        question="Which one is a fixed cost?"
        options={[{ id: 'a', text: 'Rent' }, { id: 'b', text: 'Raw materials' }]}
        correctOptionId="a"
        explanation="Rent stays the same however much you make."
      />,
    )
    expect(markup).toContain('Not scored')
    expect(markup).toContain('aria-live="polite"')
    expect(QuickCheck.length).toBe(1)
  })
})

describe('examiner guide', () => {
  const points = [
    { id: 'p1', text: 'Defines the term', met: true, why: 'Your first sentence defines it.' },
    { id: 'p2', text: 'Reaches a judgement', met: false },
  ]

  it('says it is a guide, not a mark, and shows why a point ticked', () => {
    const markup = renderToStaticMarkup(<ExaminerGuide points={points} mode="practice" />)
    expect(markup).toContain('A guide to strong answers, not a mark.')
    expect(markup).toContain('Why this ticked')
    expect(markup).toContain('(covered)')
    expect(markup).toContain('(not covered yet)')
  })

  it('is hidden during timed mock papers', () => {
    expect(renderToStaticMarkup(<ExaminerGuide points={points} mode="timed" />)).toBe('')
  })
})

describe('app shell', () => {
  it('maps widths to the sidebar, rail and tab bar bands', () => {
    expect(breakpointForWidth(1440)).toBe('desktop')
    expect(breakpointForWidth(1160)).toBe('laptop')
    expect(breakpointForWidth(961)).toBe('laptop')
    expect(breakpointForWidth(960)).toBe('tablet')
    expect(breakpointForWidth(621)).toBe('tablet')
    expect(breakpointForWidth(620)).toBe('phone')
    expect(breakpointForWidth(320)).toBe('phone')
  })

  const render = (breakpoint: 'desktop' | 'tablet' | 'phone', focus = false) => renderToStaticMarkup(
    <AppShell items={navItems} phoneItems={phoneNavItems} active="home" onNavigate={noop} onAskRev={noop} breakpoint={breakpoint} focus={focus}>Content</AppShell>,
  )

  it('shows the matching navigation for each band', () => {
    const desktop = render('desktop')
    expect(desktop).toContain('runtime-sidebar')
    expect(desktop).toContain('aria-label="Ask REV"')
    expect(render('tablet')).toContain('ui-rail')
    const phone = render('phone')
    expect(phone).toContain('ui-tabbar')
    expect(phone).toContain('aria-label="Ask REV"')
  })

  it('hides all navigation in focused exam-performance mode', () => {
    const markup = render('desktop', true)
    expect(markup).not.toContain('runtime-sidebar')
    expect(markup).not.toContain('Primary navigation')
    expect(render('phone', true)).not.toContain('ui-tabbar')
  })

  it('marks the current destination for assistive technology', () => {
    expect(render('desktop')).toContain('aria-current="page"')
  })
})

describe('feedback bar', () => {
  it('right answers are teal and wrong answers coral, each with an icon and words, never error red or yellow', () => {
    const right = renderToStaticMarkup(<FeedbackBar tone="correct" title="Correct" explanation="Because revenue minus costs is profit." />)
    const wrong = renderToStaticMarkup(<FeedbackBar tone="wrong" title="Not quite" explanation="Fixed costs do not change with output." />)
    expect(right).toContain('ui-feedback-bar--correct')
    expect(wrong).toContain('ui-feedback-bar--wrong')
    for (const markup of [right, wrong]) {
      expect(markup).toContain('<svg')
      expect(markup).not.toMatch(/error|warning|danger/i)
    }
    expect(right).toContain('Correct')
    expect(wrong).toContain('Not quite')
  })

  it('shows the content\'s explanation, an optional note and the next step', () => {
    const markup = renderToStaticMarkup(
      <FeedbackBar tone="wrong" title="Not quite" explanation="Fixed costs do not change with output." note="This will come back later in this session."><button type="button">Next question</button></FeedbackBar>,
    )
    expect(markup).toContain('Fixed costs do not change with output.')
    expect(markup).toContain('This will come back later in this session.')
    expect(markup).toContain('Next question')
  })

  it('leaves out the note and actions when there are none', () => {
    const picked = renderToStaticMarkup(<FeedbackBar tone="wrong" title="Not quite." picked="You picked B: this is a moving average." explanation="Fixed costs do not change." />)
    expect(picked).toContain('ui-feedback-bar__picked')
    expect(picked).toContain('You picked B: this is a moving average.')
    const markup = renderToStaticMarkup(<FeedbackBar tone="correct" title="Correct" explanation="Yes." />)
    expect(markup).not.toContain('ui-feedback-bar__note')
    expect(markup).not.toContain('ui-feedback-bar__actions')
  })
})

describe('Tag', () => {
  it('renders its text as a plain label', () => {
    expect(renderToStaticMarkup(<Tag>REV pick</Tag>)).toBe('<span class="ui-tag">REV pick</span>')
  })
})
