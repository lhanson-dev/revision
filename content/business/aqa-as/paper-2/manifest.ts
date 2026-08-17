import { contentManifestSchema } from '../../../schema'

export const manifest = contentManifestSchema.parse({
  id: 'business-aqa-as-paper-2',
  schemaVersion: 1,
  status: 'available',
  subject: { id: 'business', name: 'Business' },
  qualification: { id: 'aqa-as', name: 'AQA AS' },
  examBoard: { id: 'aqa', name: 'AQA' },
  specificationCode: '7131',
  paper: {
    id: 'paper-2',
    name: 'Paper 2: Business 2',
    number: 2,
    durationMinutes: 90,
    totalMarks: 80,
  },
  learnerExperience: {
    title: 'AQA AS Business Paper 2',
    what_is_this: 'A complete revision pack for AQA AS Business Paper 2, organised around the six subject areas and the skills needed to answer case-study questions.',
    why_it_matters: 'Paper 2 tests whether you can recall business ideas, apply them to a case, analyse consequences and make justified judgements.',
    what_you_are_trying_to_do: 'Build secure knowledge, connect topics, practise quantitative skills and prove you can use the knowledge in exam-style answers.',
    how_results_are_worked_out: 'Revision combines evidence from recall, quick checks and exam work. A score should only be treated as strong when there is enough evidence across more than one activity type.',
    what_to_do_next: 'Start with the weakest evidenced topic, repair knowledge gaps, then prove the improvement in case-study and exam questions.',
  },
  topicIds: ['business', 'leadership', 'marketing', 'operations', 'finance', 'hr'],
})
