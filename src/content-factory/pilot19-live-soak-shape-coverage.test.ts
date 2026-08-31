import { describe, expect, it } from 'vitest'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'

describe('post-Pilot #19 bounded live-soak shape coverage', () => {
  it('keeps the 20-sample five-shape envelope while explicitly sampling the previously missed MCQ semantics', () => {
    expect(soakHarnessText).toContain('const governedSampleCount = 20')
    expect(soakHarnessText).toContain("demand: 'knowledge'")
    expect(soakHarnessText).toContain("demand: 'application'")
    expect(soakHarnessText).toContain("mcq: true")
    expect(soakHarnessText).toContain("quantitativeBusinessEconomicsAssessmentSamples: ['knowledge_mcq', 'application_mcq']")
  })

  it('retains live Assessment Item coverage for explicit calculation and interpretation demand guards', () => {
    expect(soakHarnessText).toContain("demand: 'calculation'")
    expect(soakHarnessText).toContain("demand: 'interpretation'")
    expect(soakHarnessText).toContain("scienceAssessmentSamples: ['analysis', 'interpretation']")
    expect(soakHarnessText).toContain('providerRetriesPerRequest: 0')
  })

  it('continues to sample both Assessment Item and Marking Pack production boundaries for every governed shape', () => {
    expect(soakHarnessText).toContain("await runSample(scenario, 'assessment_item_generation', 1)")
    expect(soakHarnessText).toContain("await runSample(scenario, 'assessment_item_generation', 2)")
    expect(soakHarnessText).toContain("await runSample(scenario, 'marking_pack_generation', 1)")
    expect(soakHarnessText).toContain("await runSample(scenario, 'marking_pack_generation', 2)")
    expect(soakHarnessText).toContain('fullCourseAssembly: false')
    expect(soakHarnessText).toContain('learnerPublication: false')
  })
})
