import { contentManifestSchema } from '../../../schema'

export const manifest = contentManifestSchema.parse({
  id: 'business-aqa-a-level-7132-paper-2',
  schemaVersion: 1,
  status: 'preview',
  subject: { id: 'business', name: 'Business' },
  qualification: { id: 'aqa-a-level', name: 'AQA A-level' },
  examBoard: { id: 'aqa', name: 'AQA' },
  specificationCode: '7132',
  paper: { id: 'paper-2', name: 'Paper 2: Business 2', number: 2, durationMinutes: 120, totalMarks: 100 },
  learnerExperience: {
    title: 'AQA A-level Business Paper 2',
    what_is_this: 'Revision for the full AQA 7132 course, with Paper 2 practice built around three compulsory data-response contexts.',
    why_it_matters: 'Paper 2 can assess any course area and puts strong emphasis on using business data and context to explain, analyse and judge decisions.',
    what_you_are_trying_to_do: 'Turn figures and case evidence into accurate calculations, contextual analysis and evidence-based recommendations.',
    how_results_are_worked_out: 'Revision combines recall, quick checks, quantitative work and data-response performance. A single calculation or essay is not enough evidence of paper readiness.',
    what_to_do_next: 'Start with the weakest evidenced topic, then practise using data from an unfamiliar business so the knowledge becomes usable under Paper 2 conditions.',
  },
  topicIds: ['business','leadership','marketing','operations','finance','hr','strategic-position','strategic-direction','strategic-methods','strategic-change'],
})
