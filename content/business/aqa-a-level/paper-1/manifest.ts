import { contentManifestSchema } from '../../../schema'

export const manifest = contentManifestSchema.parse({
  id: 'business-aqa-a-level-7132-paper-1',
  schemaVersion: 1,
  status: 'available',
  subject: { id: 'business', name: 'Business' },
  qualification: { id: 'aqa-a-level', name: 'AQA A-level' },
  examBoard: { id: 'aqa', name: 'AQA' },
  specificationCode: '7132',
  paper: { id: 'paper-1', name: 'Paper 1: Business 1', number: 1, durationMinutes: 120, totalMarks: 100 },
  learnerExperience: {
    title: 'AQA A-level Business Paper 1',
    what_is_this: 'Revision for the full AQA 7132 course, with Paper 1 practice covering MCQs, short answers and the two 25-mark essay sections.',
    why_it_matters: 'Paper 1 can assess any of the ten course areas, so success depends on secure knowledge plus the ability to analyse and evaluate unfamiliar business issues.',
    what_you_are_trying_to_do: 'Build full-course knowledge, practise calculations and short answers, then produce sustained judgements in essay questions.',
    how_results_are_worked_out: 'Revision combines evidence from recall, quick checks, application and exam work. Readiness needs enough evidence across topics and activity types rather than one strong score.',
    what_to_do_next: 'Repair the weakest evidenced topic, then use Paper 1 practice to prove you can retrieve and use it without relying on a case-study prompt.',
  },
  topicIds: ['business','leadership','marketing','operations','finance','hr','strategic-position','strategic-direction','strategic-methods','strategic-change'],
})
