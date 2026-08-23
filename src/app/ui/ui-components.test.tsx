import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BrandAsset, brandAssetSources } from './BrandAsset'
import { Button, SelectField, TextAreaField, TextField } from './controls'
import { Status } from './feedback'
import { Icon } from './Icon'
import { EmptyState, PageHeader, Surface } from './layout'
import { DrawerShell, Menu, MenuItem, ModalShell, PopoverShell } from './overlays'

describe('Revision reusable interface components', () => {
  it('renders the shared page hierarchy and named surface variants', () => {
    const markup = renderToStaticMarkup(
      <>
        <PageHeader titleId="page-title" eyebrow="Context" title="Page title" description="Purpose and next useful action." />
        <Surface variant="quiet">Supporting context</Surface>
        <EmptyState title="Nothing here yet" description="The learner can take a useful next step." />
      </>,
    )

    expect(markup).toContain('class="ui-page-header"')
    expect(markup).toContain('id="page-title"')
    expect(markup).toContain('class="ui-surface-quiet ui-surface-component"')
    expect(markup).toContain('class="ui-empty-state"')
  })

  it('renders controlled button and field anatomy', () => {
    const markup = renderToStaticMarkup(
      <>
        <Button variant="secondary" size="large">Continue</Button>
        <TextField label="Assessment name" hint="Use the name shown on your timetable." defaultValue="Mock" />
        <TextAreaField label="Draft answer" hint="Write the answer before comparing guidance." defaultValue="Draft" />
        <SelectField label="Importance" error="Choose an importance level." defaultValue="normal">
          <option value="normal">Normal</option>
        </SelectField>
      </>,
    )

    expect(markup).toContain('ui-button ui-button--secondary ui-button--large')
    expect(markup).toContain('class="ui-field-label">Assessment name')
    expect(markup).toContain('class="ui-field-support">Use the name shown on your timetable.')
    expect(markup).toContain('ui-field ui-field--textarea')
    expect(markup).toContain('class="ui-field-support">Write the answer before comparing guidance.')
    expect(markup).toContain('ui-field ui-field--error')
    expect(markup).toContain('aria-invalid="true"')
  })

  it('makes semantic feedback understandable without colour alone', () => {
    const markup = renderToStaticMarkup(<Status tone="warning">Capacity is limited this week.</Status>)

    expect(markup).toContain('ui-status--warning')
    expect(markup).toContain('>Warning</strong>')
    expect(markup).toContain('Capacity is limited this week.')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('uses one controlled rounded-line icon registry', () => {
    const markup = renderToStaticMarkup(<Icon name="progress" size="compact" title="Progress" />)

    expect(markup).toContain('stroke="currentColor"')
    expect(markup).toContain('ui-icon ui-icon--compact')
    expect(markup).toContain('<title>Progress</title>')
  })

  it('renders accessible overlay and menu shells without feature-specific styling', () => {
    const markup = renderToStaticMarkup(
      <>
        <ModalShell label="Settings">Modal</ModalShell>
        <DrawerShell label="Navigation">Drawer</DrawerShell>
        <PopoverShell label="Account options">Popover</PopoverShell>
        <Menu label="Page menu"><MenuItem current>Current page</MenuItem></Menu>
      </>,
    )

    expect(markup).toContain('role="dialog" aria-modal="true" aria-label="Settings"')
    expect(markup).toContain('ui-drawer-shell')
    expect(markup).toContain('ui-popover-shell')
    expect(markup).toContain('aria-label="Page menu"')
    expect(markup).toContain('aria-current="page"')
  })

  it('selects canonical theme-paired brand assets rather than redrawing identity', () => {
    const wordmark = brandAssetSources('wordmark')
    const livingE = brandAssetSources('living-e-nav')
    const markup = renderToStaticMarkup(<BrandAsset asset="wordmark" alt="Revision" />)

    expect(wordmark.light).toBeTruthy()
    expect(wordmark.dark).toBeTruthy()
    expect(wordmark.light).not.toBe(wordmark.dark)
    expect(livingE.light).toBeTruthy()
    expect(livingE.dark).toBeTruthy()
    expect(livingE.light).not.toBe(livingE.dark)
    expect(markup).toContain('data-brand-asset="wordmark"')
    expect(markup).toContain('ui-brand-asset__image--light')
    expect(markup).toContain('ui-brand-asset__image--dark')
  })
})
