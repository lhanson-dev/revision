import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SelectField, TextField } from './controls'

describe('shared form controls', () => {
  it('uses the same field anatomy for selects and dates', () => {
    const markup = renderToStaticMarkup(
      <>
        <SelectField label="Exam" defaultValue="paper-1">
          <option value="paper-1">Paper 1</option>
        </SelectField>
        <TextField label="Exam date" type="date" value="2026-09-27" onChange={() => undefined} />
      </>,
    )

    expect(markup).toContain('ui-select-control')
    expect(markup).toContain('ui-select-field')
    expect(markup).toContain('ui-date-control')
    expect(markup).toContain('ui-date-input')
    expect(markup).toContain('value="27 / 09 / 2026"')
    expect(markup).toContain('aria-haspopup="dialog"')
  })
})
