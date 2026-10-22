import { describe, expect, it } from 'vitest'
import { contentPackSchema, type ContentPack } from '../../content/schema'
import {
  checkQualificationProjection,
  type QualificationProjectionCandidate,
  type QualificationProjectionProfile,
} from './qualification-projection-preflight'

// Fully fictional, planned-only, rights-safe specimens. No provider use,
// official questions, student content, or Foundation/publication approval.
const identity = {
  cohortId: 'fictional-cohort',
  subjectId: 'synthetic-business',
  qualificationId: 'synthetic-level-three',
  examBoardId: 'synthetic-board',
  specificationCode: 'SYN-01',
}

function paper(packId: string, paperId: string, paperNumber: number,
  weight: number, allowed: string[] = ['topic-one', 'topic-two']) {
  return {
    packId,
    paperId,
    paperNumber,
    totalMarks: 100,
    durationMinutes: 120,
    qualificationWeightPercent: weight,
    eligibleExamTopicIds: allowed,
  }
}

const profile: QualificationProjectionProfile = {
  ...identity,
  components: [
    paper('synthetic-one', 'paper-one', 1, 35),
    paper('synthetic-two', 'paper-two', 2, 35),
    paper('synthetic-three', 'paper-three', 3, 30),
  ],
}

function mockPack(id: string, paperId: string, paperNumber: number,
  topicId = 'topic-one'): ContentPack {
  return contentPackSchema.parse({
    manifest: {
      id,
      schemaVersion: 1,
      status: 'planned',
      subject: { id: identity.subjectId, name: 'Synthetic Business' },
      qualification: { id: identity.qualificationId, name: 'Synthetic A-level' },
      examBoard: { id: identity.examBoardId, name: 'Synthetic Board' },
      specificationCode: identity.specificationCode,
      paper: { id: paperId, name: paperId, number: paperNumber,
        durationMinutes: 120, totalMarks: 100 },
      learnerExperience: {
        title: 'Fictional mock',
        what_is_this: 'Original non-publishing exercise.',
        why_it_matters: 'Tests an exact profile projection.',
        what_you_are_trying_to_do: 'Compare synthetic content and declared profile.',
        how_results_are_worked_out: 'No results are stored.',
        what_to_do_next: 'Resolve gaps before real generation.',
      },
      topicIds: ['topic-one', 'topic-two'],
    },
    topics: ['topic-one', 'topic-two'].map((topic, index) => ({
      id: topic, order: index + 1, title: topic, shortTitle: topic,
      sections: [{ id: 'section-one', title: 'Synthetic chapter', points: ['Original example.'] }],
    })),
    formulas: [], topicLinks: [], flashcards: [], questions: [], caseStudies: [],
    dataDrills: [],
    exams: [{
      id: 'fictional-exam', title: 'Fictional paper', subtitle: 'Synthetic only',
      durationMinutes: 120, totalMarks: 100, caseHtml: '<p>Original context.</p>',
      questions: [{
        id: 'fictional-question', topic: topicId, marks: 100,
        assessmentObjectives: { ao1: 100, ao2: 0, ao3: 0, ao4: 0 },
        prompt: 'Discuss the fictional example.',
        markingGuidance: ['A synthetic scoring criterion, not a real mark scheme.'],
      }],
    }],
  })
}

function candidates(): QualificationProjectionCandidate[] {
  return [
    { pack: mockPack('synthetic-one', 'paper-one', 1),
      cohortId: identity.cohortId, qualificationWeightPercent: 35 },
    { pack: mockPack('synthetic-two', 'paper-two', 2),
      cohortId: identity.cohortId, qualificationWeightPercent: 35 },
    { pack: mockPack('synthetic-three', 'paper-three', 3),
      cohortId: identity.cohortId, qualificationWeightPercent: 30 },
  ]
}

function check(expected = profile, actual = candidates()) {
  return checkQualificationProjection({ expected, candidates: actual })
}

function has(result: ReturnType<typeof check>, code: string) {
  return result.problems.some((problem) => problem.code === code)
}

describe('provider-free, non-publishing qualification projection preflight', () => {
  it('passes three structurally consistent papers with unequal 35/35/30 qualification weights', () => {
    expect(check()).toEqual({ status: 'pass', problems: [] })
  })

  it('holds missing, duplicate and unexpected paper packs', () => {
    const all = candidates()
    expect(has(check(profile, all.slice(0, 2)), 'missing_component')).toBe(true)
    expect(has(check(profile, [...all, all[0]!]), 'duplicate_candidate')).toBe(true)
    const unexpected = { ...all[0]!, pack: mockPack('extra', 'paper-four', 4) }
    expect(has(check(profile, [...all, unexpected]), 'unexpected_component')).toBe(true)
  })

  it('holds mismatched identity, cohort and paper metadata', () => {
    const all = candidates()
    all[0] = { ...all[0]!, cohortId: 'different-cohort' }
    expect(has(check(profile, all), 'course_identity_mismatch')).toBe(true)
    const mismatch = { ...profile, components: [
      { ...profile.components[0]!, durationMinutes: 90 },
      ...profile.components.slice(1),
    ] }
    expect(has(check(mismatch), 'component_mismatch')).toBe(true)
  })

  it('holds missing or incorrectly projected per-paper weighting despite valid qualification totals', () => {
    const all = candidates()
    all[2] = { ...all[2]!, qualificationWeightPercent: undefined }
    expect(has(check(profile, all), 'qualification_weight_projection_mismatch')).toBe(true)
    all[2] = { ...all[2]!, qualificationWeightPercent: 35 }
    expect(has(check(profile, all), 'qualification_weight_projection_mismatch')).toBe(true)
  })

  it('rejects weights that do not total 100 even when all raw marks match', () => {
    const faulty = { ...profile, components: [
      { ...profile.components[0]!, qualificationWeightPercent: 34 },
      ...profile.components.slice(1),
    ] }
    expect(has(check(faulty), 'qualification_weight_total')).toBe(true)
  })

  it('holds questions in a legitimate course topic not eligible for the paper', () => {
    const all = candidates()
    all[0] = { ...all[0]!, pack: mockPack('synthetic-one', 'paper-one', 1, 'topic-two') }
    const expected = { ...profile, components: [
      { ...profile.components[0]!, eligibleExamTopicIds: ['topic-one'] },
      ...profile.components.slice(1),
    ] }
    expect(has(check(expected, all), 'paper_topic_mismatch')).toBe(true)
  })

  it('holds missing paper-specific topic scope rather than guessing it', () => {
    const expected = { ...profile, components: [
      { ...profile.components[0]!, eligibleExamTopicIds: [] },
      ...profile.components.slice(1),
    ] }
    expect(has(check(expected), 'missing_component_topic_scope')).toBe(true)
  })

  it('holds tier/variant demands until the published learner identity supports them', () => {
    const expected = { ...profile, components: [
      { ...profile.components[0]!, requiredVariantId: 'synthetic-higher' },
      ...profile.components.slice(1),
    ] }
    expect(has(check(expected), 'variant_projection_unsupported')).toBe(true)
  })

  it('holds absent or mismatched cohort-specific pre-release evidence references', () => {
    const expected = { ...profile, components: [
      ...profile.components.slice(0, 2),
      { ...profile.components[2]!, preReleaseContextRef: 'official-context-fingerprint' },
    ] }
    expect(has(check(expected), 'pre_release_context_mismatch')).toBe(true)
    const all = candidates()
    all[2] = { ...all[2]!, preReleaseContextRef: 'official-context-fingerprint' }
    expect(check(expected, all).status).toBe('pass')
  })

  it('holds practical coverage without an exact identified and sufficient question set', () => {
    const expected = { ...profile, components: [
      { ...profile.components[0]!, minimumPracticalMarks: 15 },
      ...profile.components.slice(1),
    ] }
    expect(has(check(expected), 'missing_practical_attribution')).toBe(true)
    const all = candidates()
    all[0] = { ...all[0]!, practicalQuestionIds: [] }
    expect(has(check(expected, all), 'practical_marks_shortfall')).toBe(true)
    all[0] = { ...all[0]!, practicalQuestionIds: ['unknown-question'] }
    expect(has(check(expected, all), 'unknown_practical_question')).toBe(true)
    all[0] = { ...all[0]!, practicalQuestionIds: ['fictional-question', 'fictional-question'] }
    expect(has(check(expected, all), 'duplicate_practical_question')).toBe(true)
    all[0] = { ...all[0]!, practicalQuestionIds: ['fictional-question'] }
    expect(check(expected, all).status).toBe('pass')
    // The PASS establishes structural attribution only, NOT that this mock's
    // question genuinely assesses a practical skill. Human/AI assessment
    // assurance must independently establish the educational truth.
  })

  it('holds practical attribution when alternative questions make printed vs attempted counting ambiguous', () => {
    const all = candidates()
    const original = all[0]!.pack
    const base = original.exams[0]!
    const option = {
      ...base.questions[0]!,
      id: 'optional-a',
      marks: 4,
      assessmentObjectives: { ao1: 4, ao2: 0, ao3: 0, ao4: 0 },
      choiceGroup: 'optional-pair',
      choiceOption: 'choose-a',
      choiceKind: 'paper-alternative' as const,
      sectionLabel: 'B', sectionTitle: 'Options', sectionMarks: 4,
    }
    const alternate = { ...option, id: 'optional-b', choiceOption: 'choose-b' }
    const compulsory = { ...base.questions[0]!, marks: 96,
      assessmentObjectives: { ao1: 96, ao2: 0, ao3: 0, ao4: 0 } }
    const pack = contentPackSchema.parse({
      ...original,
      exams: [{ ...base, questions: [compulsory, option, alternate], printedMarks: 104 }],
    })
    all[0] = { ...all[0]!, pack, practicalQuestionIds: ['optional-a'] }
    const expected = { ...profile, components: [
      { ...profile.components[0]!, minimumPracticalMarks: 2 },
      ...profile.components.slice(1),
    ] }
    expect(has(check(expected, all), 'practical_choice_arithmetic_unproven')).toBe(true)
  })

  it('rejects different packs that claim the same paper ID or paper number', () => {
    const sameId = { ...profile, components: [
      profile.components[0]!,
      { ...profile.components[1]!, paperId: 'paper-one' },
      profile.components[2]!,
    ] }
    const sameNumber = { ...profile, components: [
      profile.components[0]!,
      { ...profile.components[1]!, paperNumber: 1 },
      profile.components[2]!,
    ] }
    expect(has(check(sameId), 'duplicate_expected_paper')).toBe(true)
    expect(has(check(sameNumber), 'duplicate_expected_paper')).toBe(true)
  })

  it('checks every mock rather than treating the first as assurance for the rest', () => {
    const all = candidates()
    const pack = all[0]!.pack
    const primary = pack.exams[0]!
    const extra = { ...primary, id: 'second-mock', questions: [
      { ...primary.questions[0]!, topic: 'topic-two' },
    ] }
    all[0] = { ...all[0]!, pack: contentPackSchema.parse({
      ...pack, exams: [primary, extra],
    }) }
    const restricted = { ...profile, components: [
      { ...profile.components[0]!, eligibleExamTopicIds: ['topic-one'] },
      ...profile.components.slice(1),
    ] }
    expect(has(check(restricted, all), 'paper_topic_mismatch')).toBe(true)
    // The later mock's question is rejected even though the first is valid.
  })

  it('rejects repeated question IDs that would obscure practical attribution', () => {
    const all = candidates()
    const pack = all[0]!.pack
    const primary = pack.exams[0]!
    const half = { ...primary.questions[0]!, marks: 50,
      assessmentObjectives: { ao1: 50, ao2: 0, ao3: 0, ao4: 0 } }
    all[0] = { ...all[0]!, pack: contentPackSchema.parse({
      ...pack, exams: [{ ...primary, questions: [half, { ...half }] }],
    }) }
    expect(has(check(profile, all), 'duplicate_mock_question')).toBe(true)
  })

  it('holds practical mark attribution spanning multiple mocks without a mock identifier', () => {
    const all = candidates()
    const pack = all[0]!.pack
    const primary = pack.exams[0]!
    all[0] = { ...all[0]!, pack: contentPackSchema.parse({
      ...pack, exams: [primary, { ...primary, id: 'second-mock' }],
    }), practicalQuestionIds: ['fictional-question'] }
    const required = { ...profile, components: [
      { ...profile.components[0]!, minimumPracticalMarks: 10 },
      ...profile.components.slice(1),
    ] }
    expect(has(check(required, all), 'practical_multiple_mocks_unsupported')).toBe(true)
  })

  it('rejects missing qualification cohort, expected components and invalid facts', () => {
    const invalid = { ...profile, cohortId: '', components: [
      { ...profile.components[0]!, qualificationWeightPercent: -2 },
      ...profile.components.slice(1),
    ] }
    const result = check(invalid)
    expect(has(result, 'missing_identity')).toBe(true)
    expect(has(result, 'invalid_component_profile')).toBe(true)
    expect(has(check({ ...profile, components: [] }), 'missing_components')).toBe(true)
  })
})
