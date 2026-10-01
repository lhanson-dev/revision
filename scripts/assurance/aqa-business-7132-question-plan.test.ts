// AQA 7132 question plans for every course batch, by software only (no AI, no spend).
// Run with CONTENT_FACTORY_WRITE_QUESTION_PLANS=1 to rewrite the committed plans; otherwise the test checks they are current and sound.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ESTIMATED_USD_PER_QUESTION, buildQuestionPlan, checkQuestionPlan, type QuestionPlanFile } from './aqa-business-7132-question-plan'
import { FORMULA_LIBRARY, formulaIdForItem, type Blueprint } from './aqa-business-7132-slice-learn-practice'

const CONFIG = 'content-factory/slices/aqa-7132-batches.json'
const blueprintPath = (id: string) => `content-factory/slices/aqa-7132-${id}/BLUEPRINT.json`
const planPath = (id: string) => `content-factory/slices/aqa-7132-${id}/QUESTION_PLAN.json`
const readJson = <T>(path: string) => JSON.parse(readFileSync(path, 'utf8')) as T
const write = process.env.CONTENT_FACTORY_WRITE_QUESTION_PLANS === '1'

const config = readJson<{ batches: Array<{ id: string }>; top_up: { id: string } }>(CONFIG)
const builtBlueprint = readJson<Blueprint>(blueprintPath('3.5'))

// The top-up batch rebuilds some 3.5 nodes; the 3.5 questions already cover their original items, so only the extra items need new questions.
const targets = [
  ...config.batches.map((batch) => ({ id: batch.id, blueprint: readJson<Blueprint>(blueprintPath(batch.id)), excludeItemIds: new Set<string>(), essay: true })),
  { id: config.top_up.id, blueprint: readJson<Blueprint>(blueprintPath(config.top_up.id)), excludeItemIds: new Set(builtBlueprint.items.map((item) => item.id)), essay: false },
]

describe('AQA 7132 question plans (software only)', () => {
  for (const target of targets) {
    describe(`batch ${target.id}`, () => {
      const plan = buildQuestionPlan({ blueprint: target.blueprint, batch: target.id, excludeItemIds: target.excludeItemIds, essay: target.essay })

      it('covers every planned item, every formula and every owner node, and stays inside the spend cap', () => {
        expect(checkQuestionPlan(target.blueprint, plan)).toEqual([])
        expect(plan.summary.questions).toBeGreaterThan(0)
        expect(plan.summary.estimated_spend_usd).toBeLessThan(6)
        expect(plan.summary.estimated_spend_usd).toBe(Number((plan.summary.questions * ESTIMATED_USD_PER_QUESTION).toFixed(2)))
        const formulaItems = target.blueprint.items.filter((item) => !target.excludeItemIds.has(item.id) && formulaIdForItem(item.id))
        expect(plan.summary.formulas).toBe(new Set(formulaItems.map((item) => formulaIdForItem(item.id))).size)
      })

      it('is deterministic and matches the committed plan (rewrite with CONTENT_FACTORY_WRITE_QUESTION_PLANS=1)', () => {
        expect(buildQuestionPlan({ blueprint: target.blueprint, batch: target.id, excludeItemIds: target.excludeItemIds, essay: target.essay })).toEqual(plan)
        if (write) writeFileSync(planPath(target.id), `${JSON.stringify(plan, null, 2)}\n`)
        expect(existsSync(planPath(target.id)), `${planPath(target.id)} is missing: run with CONTENT_FACTORY_WRITE_QUESTION_PLANS=1`).toBe(true)
        expect(readJson<QuestionPlanFile>(planPath(target.id))).toEqual(plan)
      })
    })
  }

  it('catches a plan that misses an item, a formula or a node', () => {
    const target = targets.find((t) => t.id === '3.4')!
    const plan = buildQuestionPlan({ blueprint: target.blueprint, batch: target.id })
    const withoutFormula = { ...plan, questions: plan.questions.filter((q) => !q.formulaIds.includes('labour_productivity')) }
    expect(checkQuestionPlan(target.blueprint, withoutFormula).some((problem) => problem.includes('labour_productivity'))).toBe(true)
    expect(checkQuestionPlan(target.blueprint, { ...plan, questions: plan.questions.slice(1) }).length).toBeGreaterThan(0)
    expect(checkQuestionPlan(target.blueprint, { ...plan, questions: plan.questions.map((q) => ({ ...q, itemSuffixes: ['not-an-item'] })) }).length).toBeGreaterThan(0)
  })

  it('plans every named formula outside 3.5 exactly through the formula library', () => {
    const covered = new Set(targets.flatMap((t) => buildQuestionPlan({ blueprint: t.blueprint, batch: t.id, excludeItemIds: t.excludeItemIds, essay: t.essay }).questions.flatMap((q) => q.formulaIds)))
    const outside35 = new Set(FORMULA_LIBRARY.map((formula) => formula.id))
    const in35 = new Set(['gross_profit', 'operating_profit', 'profit_for_the_year', 'return_on_investment', 'variance', 'break_even_output', 'margin_of_safety', 'contribution_per_unit', 'total_contribution', 'gross_profit_margin', 'operating_profit_margin', 'profit_for_the_year_margin'])
    for (const id of in35) outside35.delete(id)
    for (const id of outside35) expect(covered, id).toContain(id)
  })
})
