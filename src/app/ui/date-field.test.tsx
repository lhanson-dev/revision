import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TextField } from './controls'

describe('shared date field', () => {
  it('uses the standard field contract and a readable UK date presentation', () => {
    const markup = renderToStaticMarkup(
      <TextField label="Exam date" type="date" required value="2026-09-27" onChange={() => undefined} />,
    )

    expect(markup).toContain('ui-field ui-date-field-trigger')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-label="Exam date (required)"')
    expect(markup).not.toContain('aria-required=')
    expect(markup).toContain('27 / 09 / 2026')
    expect(markup).toContain('ui-icon ui-icon--compact')
  })
})
