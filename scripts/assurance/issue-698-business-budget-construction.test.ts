import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { buildQuestionPool } from '../../src/app/practice-questions'

const slice = JSON.parse(readFileSync(join(process.cwd(),
  'content-factory/slices/aqa-7132-3.5/learn-practice/bus-fin-007.json'), 'utf8')) as {
  node_id: string
  learn: { sections: Array<{ heading: string; body: string; item_ids: string[] }> }
  practice: { items: Array<{ id: string; prompt: string; answer: string; capability: string }> }
}
const heading='Construct a complete budget and investigate actual variances'

describe('Issue #698 — constructing and analysing an AQA Business 7132 budget', () => {
  it('recomputes each line, a favourable cost variance and the adverse profit variance independently', () => {
    const incomeBudget=80000, incomeActual=75000
    const budgetCosts=[28000,24000,12000]
    const actualCosts=[30000,25000,11000]
    const sum=(xs:number[])=>xs.reduce((a,b)=>a+b,0)
    const costBudget=sum(budgetCosts), costActual=sum(actualCosts)
    const profitBudget=incomeBudget-costBudget, profitActual=incomeActual-costActual
    expect([costBudget,costActual,profitBudget,profitActual]).toEqual([64000,66000,16000,9000])
    expect(actualCosts.map((n,i)=>n-budgetCosts[i])).toEqual([2000,1000,-1000])
    expect(incomeActual-incomeBudget).toBe(-5000)
    expect(profitActual-profitBudget).toBe(-7000)
    expect((incomeActual-incomeBudget)-(costActual-costBudget)).toBe(-7000)
    const worked=slice.learn.sections.find((x)=>x.heading===heading)
    expect(worked?.body).toContain('−£7,000')
    expect(worked?.body).toContain('£9,000')
    expect(worked?.item_ids).toContain('aqa-7132-3.5.2:variance-analysis')
    const construct=slice.practice.items.find((x)=>x.id==='p-construct-and-reconcile-march-budget')
    expect(construct?.capability).toBe('construction')
    expect(construct?.prompt).toContain('Budget, Actual and Variance')
    expect(construct?.answer).toContain('−£7,000 adverse')
  })

  it('delivers the worked lesson, paper-based construction and independently marked questions through all three canonical packs', () => {
    for (const pack of [paper1,paper2,paper3]) {
      const page=pack.learn.chapters.flatMap((c)=>c.groups.flatMap((g)=>g.pages)).find((p)=>p.id===slice.node_id)
      expect(page,pack.manifest.id).toBeDefined()
      expect(page?.blocks.some((b)=>b.type==='explanation' && b.heading===heading)).toBe(true)
      const construction=pack.flashcards.find((c)=>c.id==='fast-bus-fin-007-p-construct-and-reconcile-march-budget')
      expect(construction,pack.manifest.id).toBeDefined()
      const pool=buildQuestionPool({topicId:'finance',topicOrder:5,coursePack:[],bank:pack.practiceBank??[]})
      const actual=pool.find((q)=>q.id==='aqa7132-3.5-q26')
      expect(actual?.type).toBe('calculation')
      if(actual?.type==='calculation') {
        expect(actual.expected).toBe(9000)
        expect(actual.workings).toContain('£9,000')
      }
      const variance=pool.find((q)=>q.id==='aqa7132-3.5-q27')
      expect(variance?.type).toBe('multiple-choice')
      if(variance?.type==='multiple-choice') {
        expect(variance.correctOption).toBe(2)
        expect(variance.explanation).toMatch(/7,000/)
      }
    }
  })
})
