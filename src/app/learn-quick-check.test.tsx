import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LearnChapter } from '../../content/learn-schema'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import { LearnReadingWorkspace } from './LearnReadingWorkspace'

const chapters: LearnChapter[] = [{
  id: 'finance', topicId: 'finance', title: 'Finance',
  groups: [{
    id: 'costs', title: 'Costs',
    pages: [{
      id: 'contribution', topicId: 'finance', title: 'Contribution', orientation: 'What each sale adds.',
      blocks: [
        { type: 'explanation', paragraphs: ['Contribution is selling price minus variable cost.'] },
        {
          type: 'quick-check',
          question: 'Contribution per unit is…',
          options: [{ id: 'a', text: 'Price minus variable cost' }, { id: 'b', text: 'Price minus fixed cost' }],
          correctOptionId: 'a',
          explanation: 'It is what each sale adds towards fixed costs.',
        },
      ],
    }],
  }],
}]

const adapter = {
  listLearnChapters: () => chapters,
  manifest: { subject: { id: 'business' } },
} as unknown as LearningContentAdapter

describe('Learn page with a quick check', () => {
  const html = renderToStaticMarkup(<LearnReadingWorkspace adapter={adapter} pageId="contribution" onOpenPage={() => undefined} />)

  it('shows the quick check inside the page, labelled "Not scored"', () => {
    expect(html).toContain('Quick check')
    expect(html).toContain('Not scored')
    expect(html).toContain('Contribution per unit is…')
    expect(html).toContain('Price minus variable cost')
  })

  it('does not reveal the answer or explanation before the student answers', () => {
    expect(html).not.toContain('Correct')
    expect(html).not.toContain('It is what each sale adds towards fixed costs.')
  })

  it('keeps the page content in order: the explanation comes before the check', () => {
    expect(html.indexOf('Contribution is selling price')).toBeLessThan(html.indexOf('Quick check'))
  })
})
