import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { learnBlockSchema, learnPageSchema } from '../../../../content/learn-schema'
import { LearnBlock } from './LearnBlock'
import { LearnPageLayout, accentStyle } from './LearnPageLayout'
import { findCrossing, describeCrossing } from './chart-geometry'
import { breakEvenPage, comparisonBlock, everyBlockPage, exampleBlock } from './fixtures'
import { planLearnLayout, questionCountPhrase, readMinutes } from './layout-plan'

/** Every `type` the schema's discriminated union defines, read from the schema itself. */
const schemaTypes = learnBlockSchema.options.map((option) => option.shape.type.value as string)

describe('LearnBlock covers the schema', () => {
  it('has a case for every type in learnBlockSchema (the switch itself is checked by TypeScript)', () => {
    expect(schemaTypes.length).toBeGreaterThanOrEqual(10)
    for (const type of schemaTypes) {
      const sample = everyBlockPage.blocks.find((block) => block.type === type)
      expect(sample, `fixture sample for ${type}`).toBeDefined()
      expect(() => renderToStaticMarkup(<LearnBlock block={sample!} />), type).not.toThrow()
    }
  })

  it('fixture content is valid against the schema', () => {
    expect(learnPageSchema.safeParse(breakEvenPage).success).toBe(true)
    expect(learnPageSchema.safeParse(everyBlockPage).success).toBe(true)
  })

  it('fails content validation for an unknown type and never falls back to a generic style', () => {
    expect(learnBlockSchema.safeParse({ type: 'sidebar', paragraphs: ['x'] }).success).toBe(false)
    expect(() => renderToStaticMarkup(<LearnBlock block={{ type: 'sidebar' } as never} />)).toThrow(/Unknown Learn block type/)
  })
})

describe('block markup', () => {
  it('gives each type its own class, not one shared box', () => {
    const classes = everyBlockPage.blocks.map((block) => /class="([^"]*)"/.exec(renderToStaticMarkup(<LearnBlock block={block} />))?.[1] ?? '')
    expect(new Set(classes).size).toBe(classes.length)
  })

  it('contains no colour value or subject name in any class or style (the course supplies only its hue)', () => {
    const html = everyBlockPage.blocks.map((block) => renderToStaticMarkup(<LearnBlock block={block} />)).join('')
    const attributes = [...html.matchAll(/(?:class|style)="([^"]*)"/g)].map((match) => match[1]).join(' ')
    expect(attributes).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|business|biology|psychology/i)
  })

  it('steps through a worked example: only step 1 and a dashed prompt for the rest', () => {
    const html = renderToStaticMarkup(<LearnBlock block={breakEvenPage.blocks[3]} />)
    expect(html).toContain('Step 1 of 3')
    expect(html).toContain('A café pays £1,800 rent')
    expect(html.indexOf('A café pays £1,800 rent')).toBeLessThan(html.indexOf('Fixed costs per month'))
    expect(html).toContain('Rent £1,800 + wages £3,240 = £5,040')
    expect(html).not.toContain('£3.20 − £1.10 = £2.10')
    expect(html).toContain('Work this one out, then show it')
    expect(html).toContain('Show step 2')
    expect(html).toContain('Show all')
    expect(html).not.toContain('about 80 a day')
  })

  it('draws the chart as an image with a label, marks the break-even and offers the data as a button', () => {
    const html = renderToStaticMarkup(<LearnBlock block={breakEvenPage.blocks[4]} />)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="The café’s costs and revenue.')
    expect(html).toContain('Break-even · 2,400')
    expect(html).toContain('>Loss<')
    expect(html).toContain('>Profit<')
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*>Show the data<\/button>/)
  })

  it('renders the quick check as the governed, unscored component', () => {
    const html = renderToStaticMarkup(<LearnBlock block={breakEvenPage.blocks[7]} />)
    expect(html).toContain('Not scored')
    expect(html).toContain('aria-live="polite"')
  })

  it('uses a neutral surface and an icon for a misconception, never a warning', () => {
    const html = renderToStaticMarkup(<LearnBlock block={breakEvenPage.blocks[8]} />)
    expect(html).toContain('learn-block--misconception')
    expect(html).not.toMatch(/coral|warning|alert/i)
  })

  it('numbers the recap', () => {
    const html = renderToStaticMarkup(<LearnBlock block={breakEvenPage.blocks[9]} />)
    expect(html).toContain('What to remember')
    expect(html.match(/<li>/g)).toHaveLength(4)
  })

  it('renders example and comparison', () => {
    expect(renderToStaticMarkup(<LearnBlock block={exampleBlock} />)).toContain('Two bakeries, same rent')
    expect(renderToStaticMarkup(<LearnBlock block={comparisonBlock} />)).toContain('data-columns="2"')
  })
})

describe('placement rules', () => {
  it('puts a key idea that follows an explanation in the margin row; everything else is full width', () => {
    const items = planLearnLayout(breakEvenPage.blocks)
    expect(items[0].kind).toBe('margin-row')
    expect(items.filter((item) => item.kind === 'margin-row')).toHaveLength(1)
    expect(items.slice(1).every((item) => item.kind === 'block')).toBe(true)
  })

  it('keeps content order but always renders the recap last', () => {
    const recap = breakEvenPage.blocks[9]
    const items = planLearnLayout([recap, breakEvenPage.blocks[0], breakEvenPage.blocks[8]])
    const order = items.map((item) => (item.kind === 'margin-row' ? 'margin-row' : item.block.type))
    expect(order).toEqual(['explanation', 'misconception', 'recap'])
  })

  it('puts a key idea beside the whole run of explanations before it (factory pages put key terms after every section)', () => {
    const [first, , second] = [breakEvenPage.blocks[0], breakEvenPage.blocks[2], breakEvenPage.blocks[5]]
    const items = planLearnLayout([first, second, breakEvenPage.blocks[1], breakEvenPage.blocks[4]])
    expect(items[0].kind).toBe('margin-row')
    if (items[0].kind === 'margin-row') {
      expect(items[0].main).toHaveLength(2)
      expect(items[0].keyIdeaFirst).toBe(false)
    }
    expect(items[1].kind).toBe('block')
  })

  it('puts a key idea that opens the page beside the worked example that follows it', () => {
    const items = planLearnLayout([breakEvenPage.blocks[1], breakEvenPage.blocks[3], breakEvenPage.blocks[9]])
    expect(items.map((item) => item.kind)).toEqual(['margin-row', 'block'])
    if (items[0].kind === 'margin-row') {
      expect(items[0].keyIdeaFirst).toBe(true)
      expect(items[0].main[0].type).toBe('worked-example')
    }
  })

  it('leaves a key idea full width when there is nothing it can sit beside, and never narrows a chart', () => {
    expect(planLearnLayout([breakEvenPage.blocks[1], breakEvenPage.blocks[4]]).map((item) => item.kind)).toEqual(['block', 'block'])
    expect(planLearnLayout([breakEvenPage.blocks[1]]).map((item) => item.kind)).toEqual(['block'])
  })

  it('estimates reading time from the words, at least a minute', () => {
    expect(readMinutes({ orientation: 'Short.', blocks: [breakEvenPage.blocks[0]] })).toBe(1)
    expect(readMinutes(breakEvenPage)).toBeGreaterThanOrEqual(2)
  })

  it('says the real number of questions in words up to ten', () => {
    expect(questionCountPhrase(6)).toBe('Six questions')
    expect(questionCountPhrase(1)).toBe('One question')
    expect(questionCountPhrase(14)).toBe('14 questions')
  })
})

describe('chart helpers', () => {
  it('finds where two lines cross', () => {
    const [revenue, costs] = breakEvenPage.blocks[4].type === 'quantitative' ? breakEvenPage.blocks[4].series : []
    const hit = findCrossing(revenue.points, costs.points)
    expect(Math.round(hit?.x ?? 0)).toBe(2400)
    expect(Math.round(hit?.y ?? 0)).toBe(7680)
  })

  it('returns null for lines that never cross', () => {
    expect(findCrossing([{ x: 0, y: 0 }, { x: 1, y: 1 }], [{ x: 0, y: 5 }, { x: 1, y: 6 }])).toBeNull()
  })

  it('only calls it a break-even point for revenue against costs', () => {
    expect(describeCrossing([{ name: 'Total revenue', points: [] }, { name: 'Total costs', points: [] }]).regions).not.toBeNull()
    expect(describeCrossing([{ name: 'Supply', points: [] }, { name: 'Demand', points: [] }])).toEqual({ label: 'Crossing point', regions: null })
  })
})

describe('LearnPageLayout', () => {
  const render = (overrides: Partial<Parameters<typeof LearnPageLayout>[0]> = {}) => renderToStaticMarkup(
    <LearnPageLayout
      page={breakEvenPage}
      chapterTitle="Financial performance"
      groupTitle="Analysing financial performance"
      position={{ index: 4, of: 6 }}
      hue="blue"
      practiceQuestionCount={6}
      previous={{ title: 'Contribution', caption: 'Previous' }}
      next={{ title: 'Margin of safety', caption: 'Next · page 5 of 6' }}
      onOpenPractice={() => undefined}
      onOpenRev={() => undefined}
      {...overrides}
    />,
  )

  it('sets the subject hue once, as --accent variables on the root', () => {
    const style = accentStyle('violet-bio') as Record<string, string>
    expect(style['--accent']).toBe('var(--subject-violet-bio)')
    expect(style['--accent-tint']).toBe('var(--subject-violet-bio-tint)')
    expect(style['--accent-ink']).toBe('var(--subject-violet-bio-ink)')
    expect(style['--accent-on']).toBe('var(--subject-violet-bio-on)')
    expect(render()).toContain('--accent:var(--subject-blue)')
  })

  it('shows the context line and the end of page in the agreed order', () => {
    const html = render()
    expect(html).toContain('Financial performance')
    expect(html).toMatch(/Page 4 of 6 · \d+ min read/)
    const order = ['What to remember', 'Think you’ve got it?', 'Still not got it?', 'Previous', 'Next · page 5 of 6'].map((text) => html.indexOf(text))
    expect(order.every((position) => position > 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(html.indexOf('Common mix-up')).toBeLessThan(html.indexOf('What to remember'))
  })

  it('uses the real question count and shows no inline REV prompts', () => {
    const html = render()
    expect(html).toContain('Six questions on Break-even output. These count towards Understanding.')
    expect(html).toContain('Practice this topic')
    expect(html).toContain('I’ll explain Break-even output another way, starting from what you’ve just read.')
    expect(html).not.toContain('Ask REV about this')
    expect(html).not.toContain('Stuck? Ask REV')
  })

  it('does not invent a question count, and hides the Practice button when there is no practice', () => {
    expect(render({ practiceQuestionCount: undefined })).not.toMatch(/Six questions|\d+ questions/)
    expect(render({ practiceQuestionCount: 0 })).not.toContain('Practice this topic')
  })

  it('hides the side that does not exist', () => {
    const html = render({ previous: null })
    expect(html).not.toContain('learn-pager__button--previous')
    expect(html).toContain('learn-pager__button--next')
    expect(render({ previous: null, next: null })).not.toContain('learn-pager')
  })
})
