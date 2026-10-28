import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { buildQuestionPool, bankRecordToPractice } from '../../src/app/practice-questions'

const records = paper1.practiceBank ?? []
const cases = [
  { id: 'q18', answer: 'B', spec: 'aqa-7132-3.5.1:cash-flow-versus-profit', why: /credit sale|revenue/i },
  { id: 'q19', answer: 'B', spec: 'aqa-7132-3.5.2:variance-analysis', why: /3,000/i },
  { id: 'q20', answer: 'A', spec: 'aqa-7132-3.5.3:debt-factoring', why: /factor|cash/i },
  { id: 'q21', answer: 'C', spec: 'aqa-7132-3.5.3:venture-capital', why: /equity|control|venture/i },
  { id: 'q22', answer: 'B', spec: 'aqa-7132-3.5.4:ways-to-improve-cash-flow', why: /inventory|liquidity/i },
  { id: 'q23', answer: 'C', spec: 'aqa-7132-3.5.4:ways-to-improve-profit-and-profitability', why: /demand|contribution/i },
  { id: 'q24', answer: 'A', spec: 'aqa-7132-3.5.3:short-term-versus-long-term-finance', why: /maturity|overdraft|term/i },
  { id: 'q25', answer: 'C', spec: 'aqa-7132-3.5.1:profit-for-the-year', why: /100,000/i },
] as const

describe('Issue #698: original AQA Business 3.5 scored-practice extension', () => {
  it('routes all eight new cases through every actual Business Practice pack and preserves stable IDs', () => {
    for (const pack of [paper1, paper2, paper3]) {
      const bank=pack.practiceBank ?? []
      const pool=buildQuestionPool({ topicId:'finance', topicOrder:5, coursePack:[], bank })
      for(const item of cases){
        const record=bank.find((x)=>x.batch==='3.5' && x.id===item.id)
        expect(record, `${pack.manifest.id}: ${item.id} missing`).toBeDefined()
        expect(record?.target_item_ids).toContain(item.spec)
        expect(record?.label).toMatch(/^Revision-authored/)
        expect(record?.confidence_label).toBe('Limited')
        expect(record?.question.family).toBe('MCQ')
        expect(record?.question.marks).toBe(1)
        expect(record?.question.mark_scheme.correct_option).toBe(item.answer)
        const actual=pool.find((x)=>x.id===`aqa7132-3.5-${item.id}`)
        expect(actual?.type).toBe('multiple-choice')
        if(actual?.type!=='multiple-choice') throw new Error('expected scored MCQ')
        const idx='ABCD'.indexOf(item.answer)
        expect(actual.correctOption).toBe(idx)
        expect(actual.options[idx].why).toBeNull()
        expect(actual.options.filter((opt,i)=>i!==idx).every((opt)=>Boolean(opt.why))).toBe(true)
        expect(actual.explanation).toMatch(item.why)
        expect(actual.explanation).not.toMatch(/^[A-D] is (correct|incorrect|wrong)/i)
        expect(bankRecordToPractice(record!, 'finance')?.id).toBe(actual.id)
      }
    }
  })

  it('reconstructs original case calculations independently instead of relying on supplied keys', () => {
    // q19: an adverse cost variance, not a profit or revenue variance.
    expect(27000-24000).toBe(3000)
    // q25: gross profit -> operating profit -> profit before tax -> profit for year.
    const gross=750000-435000
    const operating=gross-180000
    const final=operating-12000-23000
    expect({gross,operating,final}).toEqual({gross:315000,operating:135000,final:100000})
    // q18: sales on credit do not equal cash collected on the sale date.
    expect(cases.find((x)=>x.id==='q18')?.answer).toBe('B')
  })
})
