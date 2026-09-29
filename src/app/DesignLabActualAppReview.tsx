import { useMemo, useState, type SyntheticEvent } from 'react'
import { learnerCourseRoute, routeHash } from './navigation'
import { Button, Icon } from './ui'

type PreviewTheme = 'light' | 'dark'
type PreviewViewport = 'desktop' | 'tablet' | 'mobile'

const businessCourseId = 'aqa:aqa-a-level:7132'

const previewPages = [
  { id: 'home', label: 'Home', hash: '#/home' },
  { id: 'plan', label: 'Plan', hash: '#/plan' },
  { id: 'progress', label: 'Progress', hash: '#/progress' },
  { id: 'courses', label: 'Courses', hash: '#/courses' },
  { id: 'course-overview', label: 'Course overview', hash: routeHash(learnerCourseRoute(businessCourseId, 'overview')) },
  { id: 'course-learn', label: 'Learn', hash: routeHash(learnerCourseRoute(businessCourseId, 'learn')) },
  { id: 'course-practice', label: 'Practice', hash: routeHash(learnerCourseRoute(businessCourseId, 'practice')) },
  { id: 'course-exam-prep', label: 'Exam Prep', hash: routeHash(learnerCourseRoute(businessCourseId, 'exam-prep')) },
  { id: 'course-progress', label: 'Course progress', hash: routeHash(learnerCourseRoute(businessCourseId, 'progress')) },
] as const

const viewportLabels: Record<PreviewViewport, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
}

function forcePreviewTheme(event: SyntheticEvent<HTMLIFrameElement>, theme: PreviewTheme) {
  try {
    const frameWindow = event.currentTarget.contentWindow
    const frameDocument = event.currentTarget.contentDocument
    if (!frameWindow || !frameDocument) return

    const applyTheme = () => {
      frameDocument.documentElement.dataset.revisionTheme = theme
      const runtime = frameDocument.querySelector<HTMLElement>('.planner-runtime')
      if (runtime?.dataset.theme !== theme) runtime?.setAttribute('data-theme', theme)
    }

    applyTheme()
    const observer = new frameWindow.MutationObserver(applyTheme)
    observer.observe(frameDocument.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      childList: true,
      subtree: true,
    })
  } catch {
    // The deployed Design Lab and learner runtime are same-origin. If a local host
    // changes that boundary, the preview still shows the runtime's persisted theme.
  }
}

function RuntimeFrame({ src, theme, viewport, pageLabel }: { src: string; theme: PreviewTheme; viewport: PreviewViewport; pageLabel: string }) {
  return (
    <article className="design-lab-runtime-reference-card" data-preview-theme={theme}>
      <header className="design-lab-runtime-reference-card-head">
        <div>
          <span className="design-lab-runtime-reference-theme">{theme === 'light' ? 'Light' : 'Dark'}</span>
          <strong>{pageLabel}</strong>
        </div>
        <span>{viewportLabels[viewport]}</span>
      </header>
      <div className="design-lab-runtime-reference-frame-shell" data-viewport={viewport}>
        <iframe
          key={`${src}-${theme}-${viewport}`}
          className="design-lab-runtime-reference-frame"
          src={src}
          title={`${pageLabel} · ${theme} Revision runtime preview`}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          onLoad={(event) => forcePreviewTheme(event, theme)}
        />
        <div className="design-lab-runtime-reference-shield" aria-hidden="true" />
      </div>
    </article>
  )
}

export function DesignLabActualAppReview() {
  const [pageId, setPageId] = useState<(typeof previewPages)[number]['id']>('home')
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const selectedPage = useMemo(() => previewPages.find((page) => page.id === pageId) ?? previewPages[0], [pageId])
  const appBase = `${import.meta.env.BASE_URL}app/`
  const previewUrl = `${appBase}?designPreview=1${selectedPage.hash}`
  const liveUrl = `${appBase}${selectedPage.hash}`

  return (
    <section className="planner-runtime design-lab-runtime-reference" data-theme="light" data-preview-page={selectedPage.id} aria-labelledby="actual-app-review-title">
      <div className="design-lab-runtime-reference-inner">
        <header className="design-lab-runtime-reference-heading">
          <div>
            <p className="eyebrow">Founder review surface · actual implementation</p>
            <h1 id="actual-app-review-title">Current Revision app</h1>
            <p>
              This is the real learner runtime from the current governed implementation, not a reconstructed mock. Choose a page and viewport to compare its current light and dark rendering.
            </p>
          </div>
          <a className="design-lab-runtime-reference-open" href={liveUrl} target="_blank" rel="noreferrer">
            Open live page <Icon name="arrow-right" size="inline" />
          </a>
        </header>

        <div className="design-lab-runtime-reference-notice" role="note">
          <Icon name="info" size="compact" />
          <span>The embedded views use your current authenticated learner context. Pointer interaction and the normal background activity-reconciliation writer are disabled in preview mode.</span>
        </div>

        <div className="design-lab-runtime-reference-controls">
          <div>
            <span className="design-lab-runtime-reference-control-label">Page</span>
            <div className="design-lab-runtime-reference-page-tabs" role="group" aria-label="Actual app page">
              {previewPages.map((page) => (
                <Button
                  key={page.id}
                  variant={page.id === pageId ? 'primary' : 'secondary'}
                  size="compact"
                  onClick={() => setPageId(page.id)}
                  aria-pressed={page.id === pageId}
                >
                  {page.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <span className="design-lab-runtime-reference-control-label">Viewport</span>
            <div className="design-lab-runtime-reference-viewports" role="group" aria-label="Actual app viewport">
              {(Object.keys(viewportLabels) as PreviewViewport[]).map((option) => (
                <Button
                  key={option}
                  variant={option === viewport ? 'primary' : 'secondary'}
                  size="compact"
                  onClick={() => setViewport(option)}
                  aria-pressed={option === viewport}
                >
                  {viewportLabels[option]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="design-lab-runtime-reference-stack">
          <RuntimeFrame src={previewUrl} theme="light" viewport={viewport} pageLabel={selectedPage.label} />
          <RuntimeFrame src={previewUrl} theme="dark" viewport={viewport} pageLabel={selectedPage.label} />
        </div>
      </div>
    </section>
  )
}
