import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { buildQuestionPool } from '../../src/app/practice-questions'

describe('Issue #698: Business AQA 7132 3.10 independent network analysis Practice', () => {
  it('makes all three new original network questions available and scoreable through each published course pack', () => {
    for (const pack of [paper1, paper2, paper3]) {
      const questions = buildQuestionPool({
        topicId: 'strategic-change',
        topicOrder: 10,
        coursePack: [],
        bank: pack.practiceBank,
      })
      const records = pack.practiceBank ?? []
      for (const id of ['q14','q15','q16']) {
        const source = records.find((record) => record.batch === '3.10' && record.id === id)
        expect(source, `Missing 3.10/${id} from ${pack.manifest.id}`).toBeDefined()
        expect(source?.target_node_ids).toContain('bus-evi-008')
        expect(source?.label).toMatch(/^Revision-authored/)
        expect(source?.confidence_label).toBe('Limited')
        expect(source?.question.marks).toBe(1)
        expect(source?.question.table).toBeNull()
        expect(questions.some((question) => question.id === `aqa7132-3.10-${id}`)).toBe(true)
      }
      const critical = questions.find((q)=>q.id==='aqa7132-3.10-q14')
      expect(critical?.type).toBe('multiple-choice')
      if (critical?.type==='multiple-choice') {
        expect(critical.correctOption).toBe(1)
        expect(critical.options.every((option,index)=>index===1 || Boolean(option.why))).toBe(true)
      }
      const float = questions.find((q)=>q.id==='aqa7132-3.10-q15')
      expect(float?.type).toBe('calculation')
      if (float?.type==='calculation') {
        expect(float.expected).toBe(2)
        expect(float.accepted).toContain(2)
        expect(float.workings).toContain('18 − 11 − 5 = 2')
      }
      const amended = questions.find((q)=>q.id==='aqa7132-3.10-q16')
      expect(amended?.type).toBe('multiple-choice')
      if (amended?.type==='multiple-choice') {
        expect(amended.correctOption).toBe(0)
        expect(amended.explanation).toMatch(/9 days/)
      }
    }
  })

  it('checks the timings independently with a parallel dependency, then re-routes critical work after delay', () => {
    const a=2, b=4, c=3, d=2
    const original=Math.max(a+b,a+c)+d
    const revised=Math.max(a+b,a+5)+d
    expect(original).toBe(8)
    expect(revised).toBe(9)
    expect(revised-(a+b+d)).toBe(1)
    const latestFinish=18, earliestStart=11, duration=5
    expect(latestFinish-earliestStart-duration).toBe(2)
  })
})
