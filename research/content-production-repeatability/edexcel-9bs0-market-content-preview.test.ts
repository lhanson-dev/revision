import { describe, expect, it } from 'vitest'
import { contentPackSchema } from '../../content/schema'
import { createLearningContentAdapter } from '../../src/engine/content/content-adapter'
import { buildQuestionPool } from '../../src/app/practice-questions'
import { edexcelMarketTrialEvidence, edexcelMarketTrialPack } from './edexcel-9bs0-market-content-preview'

describe('Edexcel 9BS0: isolated original Market authoring → real site content contract', () => {
  const adapter = createLearningContentAdapter(edexcelMarketTrialPack)

  it('passes the normal learner pack schema with no AQA or Psychology application modification', () => {
    expect(() => contentPackSchema.parse(edexcelMarketTrialPack)).not.toThrow()
    expect(adapter.manifest.status).toBe('planned')
    expect(adapter.manifest.specificationCode).toBe('9BS0')
    expect(adapter.manifest.examBoard.id).toBe('edexcel')
    expect(adapter.listTopics().map((topic) => topic.id)).toEqual(['markets'])
    expect(adapter.listLearnChapters()).toHaveLength(1)
    expect(adapter.getLearnCourse().chapters[0].groups).toHaveLength(2)
  })

  it('projects existing original specimen teaching and exercises through the normal adapter', () => {
    const pages = adapter.getLearnCourse().chapters.flatMap((chapter) =>
      chapter.groups.flatMap((group) => group.pages))
    expect(pages).toHaveLength(23)
    expect(pages.filter((page) => page.id.startsWith('edexcel-market-l'))).toHaveLength(5)
    expect(pages.filter((page) => page.blocks.some((block) => block.type === 'misconception'))).toHaveLength(18)
    expect(adapter.listQuestions('markets')).toHaveLength(7)
    expect(adapter.listDataDrills()).toHaveLength(22) // 4 worked numbers + 18 original contextual exercises
    expect(adapter.getLearnPage('edexcel-market-l1')).toBeDefined()
    const practice = buildQuestionPool({
      topicId: 'markets', topicOrder: 1,
      coursePack: adapter.listQuestions('markets'), bank: adapter.listPracticeBank(),
      includeWritten: true,
    })
    expect(practice.some((question) => question.source === 'course-pack')).toBe(true)
    expect(practice.every((question) => question.topicId === 'markets')).toBe(true)
  })

  it('does not disguise unassured exam candidates as scored Exam Prep', () => {
    expect(adapter.listExams()).toEqual([])
    expect(adapter.listPracticeBank()).toEqual([])
    expect(edexcelMarketTrialEvidence.graphicalConstructionTested).toBe(false)
    expect(edexcelMarketTrialEvidence.revisedOriginalTenMarkQuestion.markingAllowed).toBe(false)
    expect(edexcelMarketTrialEvidence.revisedOriginalTenMarkQuestion.learnerReleased).toBe(false)
    expect(edexcelMarketTrialEvidence.provisionalSkillCount).toBe(26)
    expect(edexcelMarketTrialEvidence.exactCourseAiAssured).toBe(false)
    expect(edexcelMarketTrialEvidence.foundationApproved).toBe(false)
    expect(edexcelMarketTrialEvidence.published).toBe(false)
    expect(edexcelMarketTrialEvidence.generatedProviderCallsThisRun).toBe(0)
  })

  it('does not mistake mathematical worked examples for subject educational assurance', () => {
    // Recalculate the original hypothetical market equations rather than trusting copied answers.
    const demand = (price: number) => 120 - 4 * price
    const supply = (price: number) => 20 + price
    const supplyAfterCostIncrease = (price: number) => 10 + price
    const originalPrice = (120 - 20) / 5
    const revisedPrice = (120 - 10) / 5
    expect([originalPrice, demand(originalPrice), supply(originalPrice)]).toEqual([20, 40, 40])
    expect([revisedPrice, demand(revisedPrice), supplyAfterCostIncrease(revisedPrice)]).toEqual([22, 32, 32])
    expect(revisedPrice - originalPrice).toBe(2)
    expect(demand(revisedPrice) - demand(originalPrice)).toBe(-8)
    expect(edexcelMarketTrialEvidence.missing.length).toBeGreaterThan(0)
  })
})
