import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TextField } from './controls'

describe('shared date field', () => {
  it('supports direct date entry and echoes the selected date unambiguously', () => {
    const markup = renderToStaticMarkup(
      <TextField label="Exam date" type="date" required value="2026-09-27" onChange={() => undefined} />,
    )

    expect(markup).toContain('type="date"')
    expect(markup).toContain('class="ui-field ui-date-field-input"')
    expect(markup).toContain('required=""')
    expect(markup).toContain('value="2026-09-27"')
    expect(markup).toContain('Selected date: 27 September 2026')
    expect(markup).not.toContain('aria-haspopup="dialog"')
    expect(markup).not.toContain('type="hidden"')
  })
})
