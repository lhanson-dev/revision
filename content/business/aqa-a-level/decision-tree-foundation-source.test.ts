import { describe, expect, it } from 'vitest'
import source from '../../../content-factory/slices/aqa-7132-3.1-3.2/learn-practice/bus-evi-004.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'

const packs = [paper1, paper2, paper3]
const requiredTargets = [
  'aqa-7132-3.2.2:decision-trees',
  'aqa-7132-3.2.2:expected-value',
  'aqa-7132-3.2.2:net-gain',
  'aqa-7132-3.2.2:risk',
  'aqa-7132-3.2.2:uncertainty',
  'aqa-7132-3.2.2:opportunity-cost',
]

describe('#705 source-first Business 7132 3.2.2 conditional net-gain teaching', () => {
  it('retains real AQA requirements including risk, uncertainty and opportunity cost', () => {
    // These are specified explicitly on printed page 14, not invented extension IDs.
    const mapped = source.learn.sections[0].item_ids
    expect(requiredTargets.every(target => mapped.includes(target))).toBe(true)
    expect(source.node_id).toBe('bus-evi-004')
  })

  it('never suggests subtracting an already included certain option cost', () => {
    const explanation = source.learn.sections[0].body
    const term = source.learn.key_terms.find(t => t.term === 'net gain')
    const worked = source.learn.worked_examples.find(w => w.id === 'we-net-gain-regional-launch')
    const exercise = source.practice.items.find(x => x.id === 'p-calculation-net-gain')
    expect(explanation).toContain('not already been included')
    expect(explanation).toContain('do not subtract it again')
    expect(term?.definition).toContain('not already included')
    expect(worked?.scenario).toContain('not included')
    expect(worked?.steps.join(' ')).toContain('If already included, do not subtract again')
    expect(exercise?.prompt).toContain('not already been counted')
    expect(exercise?.explanation).toContain('Never subtract an already included cost')
    expect(exercise?.calc?.stated_answer).toBe(57000)
  })

  it('labels broader decision appraisal as optional, not an invented section obligation', () => {
    const sections = source.learn.sections
    expect(sections.find(x => x.treatment === 'guided_example')?.heading).toMatch(/^Optional extension:/)
    expect(sections.find(x => x.treatment === 'example_non_example')?.heading).toMatch(/^Optional wider appraisal:/)
    expect(sections.find(x => x.treatment === 'self_explanation_prompt')?.heading).toMatch(/^Optional unscored/)
    const tree = sections.find(x => x.treatment === 'purposeful_visual')
    expect(tree?.heading).toContain('schematic')
    expect(tree?.body).toContain('not a conventionally drawn')
  })

  it('delivers the corrected source teaching through all three actual published Business packs', () => {
    for (const pack of packs) {
      const page = pack.learn.chapters.flatMap(c => c.groups.flatMap(g => g.pages))
        .find(page => page.id === 'bus-evi-004')
      expect(page?.topicId).toBe('leadership')
      const text = page?.blocks.map(block => {
        if (block.type === 'explanation') return block.paragraphs.join(' ')
        if (block.type === 'key-idea') return block.definitions.map(d => d.definition).join(' ')
        return ''
      }).join(' ') ?? ''
      expect(text).toContain('do not subtract it again')
      expect(text).toContain('not already included')
      expect(text).toContain('Optional broader business appraisal practice')
    }
  })
})
