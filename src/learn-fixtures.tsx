import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/brand-tokens.css'
import './app/living-e.css'
import './app/living-e-accessibility.css'
import './app/interface-system.css'
import './app/ui/ui-components.css'
import './app/ui/learner-v2-components.css'
import './app/learn-reading.css'
import { subjectHues, type SubjectHue } from './app/subject-palette'
import { LearnPageLayout } from './app/ui/learn'
import { breakEvenPage, everyBlockPage } from './app/ui/learn/fixtures'

/**
 * Dev-only fixture page: every Learn block type for several subject hues, in light and dark.
 * It proves a page renders from its content alone: nothing here styles a block by hand.
 *
 * Open /revision/learn-fixtures.html while developing. It is left out of the production build; the
 * Playwright run builds it in (vite build --mode learn-fixtures) so the e2e tests can screenshot it.
 *
 * Query: ?hue=blue|violet-bio|umber|... &theme=light|dark &page=every-block|break-even
 * With none of them, it shows blue, violet-bio and umber in both themes.
 */
const defaultHues: SubjectHue[] = ['blue', 'violet-bio', 'umber']
const params = new URLSearchParams(window.location.search)
const hueParam = params.get('hue')
const hues = subjectHues.find((hue) => hue === hueParam) ? [hueParam as SubjectHue] : defaultHues
const themeParam = params.get('theme')
const themes = themeParam === 'light' || themeParam === 'dark' ? [themeParam] : ['light', 'dark'] as const
const page = params.get('page') === 'break-even' ? breakEvenPage : everyBlockPage

function Fixtures() {
  return (
    <>
      {themes.map((theme) => hues.map((hue) => (
        <div className="planner-runtime learn-fixture" data-theme={theme} data-fixture={`${hue}-${theme}`} key={`${hue}-${theme}`}>
          <h1 className="learn-fixture__title">{hue} · {theme}</h1>
          <LearnPageLayout
            page={page}
            chapterTitle="Fixture chapter"
            groupTitle="Fixture group"
            position={{ index: 2, of: 3 }}
            hue={hue}
            practiceQuestionCount={6}
            previous={{ title: 'The page before', caption: 'Previous' }}
            next={{ title: 'The page after', caption: 'Next · page 3 of 3' }}
            onOpenPractice={() => undefined}
            onOpenRev={() => undefined}
          />
        </div>
      )))}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><Fixtures /></StrictMode>)
