import { contentManifestSchema } from '../../../schema'
import { psychologyTopicIds } from '../shared/course'

export const manifest = contentManifestSchema.parse({
  id: 'psychology-aqa-a-level-7182-paper-2',
  schemaVersion: 1,
  status: 'available',
  subject: { id: 'psychology', name: 'Psychology' },
  qualification: { id: 'aqa-a-level', name: 'AQA A-level' },
  examBoard: { id: 'aqa', name: 'AQA' },
  specificationCode: '7182',
  paper: { id: 'paper-2', name: 'Paper 2: Psychology in Context', number: 2, durationMinutes: 120, totalMarks: 96 },
  learnerExperience: {
    title: 'AQA A-level Psychology 7182',
    what_is_this: 'The complete Revision course for the revised AQA A-level Psychology 7182 specification, with Learn, Practice and paper-specific Exam Prep.',
    why_it_matters: 'AQA Psychology tests accurate subject knowledge, application, evaluation, Research Methods and quantitative skills across three papers.',
    what_you_are_trying_to_do: 'Build secure knowledge across your compulsory and chosen option topics, practise retrieval and application, then rehearse the real paper structure.',
    how_results_are_worked_out: 'Objective Practice can build evidence. Written exam work is self-assessed in the restricted pilot and is deliberately treated with lower confidence until Revision assisted marking is separately validated.',
    what_to_do_next: 'Use Learn to repair weak knowledge, Practice to retrieve it without notes, then use Exam Prep for paper-specific timed work.',
  },
  topicIds: psychologyTopicIds,
})
