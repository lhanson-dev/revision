import type { Checklist } from '../../src/content-factory/fast-path-review'

export const MOCK_SET_CHECKLIST: Checklist = {
  stage: 'aqa-7132-mock-whole-set',
  version: 'mock-whole-set-v1',
  checks: [
    { id: 'full_set_breadth', question: 'Across all three papers, is there credible breadth across the course rather than repeated emphasis on a narrow set of themes?' },
    { id: 'cross_paper_duplication', question: 'Across all three papers, are questions and required reasoning meaningfully distinct rather than semantic repeats with cosmetic context changes?' },
    { id: 'quantitative_balance', question: 'Across the complete set, is quantitative demand naturally integrated and appropriately distributed rather than tokenistic or implausibly concentrated?' },
    { id: 'synoptic_balance', question: 'Across the complete set, are synoptic demands credible and are all named targets genuinely needed for full-credit responses?' },
    { id: 'difficulty_balance', question: 'Across all three papers, is the overall mix of response demand and difficulty plausible for a full A-level Business mock series?' },
    { id: 'assessment_model_fit', question: 'Does the complete set resemble the approved AQA assessment model while remaining clearly Revision-authored rather than imitating a particular protected paper?' },
    { id: 'rights_originality', question: 'Is there no sign that protected AQA question wording, cases, datasets, distinctive fact combinations or mark-scheme prose have been reproduced or closely paraphrased?' },
  ],
}

export const MOCK_SET_REVIEW_INSTRUCTIONS = [
  'Review the complete three-paper Revision-authored A-level Business mock set against the fixed checklist only.',
  'Software has already proved paper structures, marks, AO arithmetic, quantitative totals, choice paths, target links and deterministic near-duplicate checks.',
  'Judge only semantic whole-set qualities that software cannot prove, especially cross-paper breadth and semantic duplication.',
  'Do not compare wording against remembered AQA questions. Judge whether the set fits the approved assessment model without signs of copying protected content.',
].join('\n')
