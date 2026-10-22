import type { ContentPack } from '../../content/schema'

/**
 * Provider-free structural preflight, NOT a publication gate or educational
 * approval. The expected profile must be independently sourced and assured.
 * It cannot establish source rights, specification completeness, teaching
 * accuracy, actual practical-skill content or qualified-human approval.
 */
export type QualificationProjectionProfile = {
  cohortId: string
  subjectId: string
  qualificationId: string
  examBoardId: string
  specificationCode: string
  components: ReadonlyArray<{
    packId: string
    paperId: string
    paperNumber: number
    totalMarks: number
    durationMinutes: number
    qualificationWeightPercent: number
    eligibleExamTopicIds: readonly string[]
    /** A publishing adapter must explicitly support the variant/tier first. */
    requiredVariantId?: string
    /** Stable identifier only; this checker does not ingest source wording. */
    preReleaseContextRef?: string
    /** Only when a governed exact-paper/mock rule supplies the required marks. */
    minimumPracticalMarks?: number
  }>
}

export type QualificationProjectionCandidate = {
  pack: ContentPack
  cohortId: string
  /** Release-sidecar projection data, not a learner-runtime guarantee. */
  qualificationWeightPercent?: number
  preReleaseContextRef?: string
  /** Explicit proposed attribution; semantic validity needs independent review. */
  practicalQuestionIds?: readonly string[]
}

export type QualificationProjectionProblem = {
  code: string
  componentId: string
  detail: string
}

export type QualificationProjectionResult = {
  status: 'pass' | 'hold'
  problems: QualificationProjectionProblem[]
}

const nonEmpty = (value: string) => value.trim().length > 0

export function checkQualificationProjection(input: {
  expected: QualificationProjectionProfile
  candidates: readonly QualificationProjectionCandidate[]
}): QualificationProjectionResult {
  const { expected, candidates } = input
  const problems: QualificationProjectionProblem[] = []
  const issue = (code: string, componentId: string, detail: string) => {
    problems.push({ code, componentId, detail })
  }

  if (!nonEmpty(expected.cohortId) || !nonEmpty(expected.subjectId)
    || !nonEmpty(expected.qualificationId) || !nonEmpty(expected.examBoardId)
    || !nonEmpty(expected.specificationCode)) {
    issue('missing_identity', 'course', 'Exact course identity and cohort must be declared')
  }
  if (expected.components.length === 0) {
    issue('missing_components', 'course', 'Expected exact paper components are required')
  }

  const seenExpected = new Set<string>()
  const seenPaperIds = new Set<string>()
  const seenPaperNumbers = new Set<number>()
  const seenCandidates = new Set<string>()
  const byPackId = new Map<string, QualificationProjectionCandidate>()
  const expectedIds = new Set(expected.components.map((component) => component.packId))

  for (const candidate of candidates) {
    const id = candidate.pack.manifest.id
    if (seenCandidates.has(id)) issue('duplicate_candidate', id, 'Duplicate candidate pack')
    seenCandidates.add(id)
    byPackId.set(id, candidate)
    if (!expectedIds.has(id)) issue('unexpected_component', id, 'Candidate is not in the exact-course profile')
  }

  let summedWeights = 0
  for (const component of expected.components) {
    const id = component.packId
    if (seenExpected.has(id)) {
      issue('duplicate_expected_component', id, 'Profile contains duplicate pack identifiers')
      continue
    }
    seenExpected.add(id)
    if (seenPaperIds.has(component.paperId) || seenPaperNumbers.has(component.paperNumber)) {
      issue('duplicate_expected_paper', id, 'Distinct packs cannot represent the same paper ID or paper number')
    }
    seenPaperIds.add(component.paperId)
    seenPaperNumbers.add(component.paperNumber)
    if (!nonEmpty(id) || !nonEmpty(component.paperId)
      || !Number.isInteger(component.paperNumber) || component.paperNumber <= 0
      || !Number.isInteger(component.totalMarks) || component.totalMarks <= 0
      || !Number.isInteger(component.durationMinutes) || component.durationMinutes <= 0
      || !Number.isFinite(component.qualificationWeightPercent)
      || component.qualificationWeightPercent <= 0 || component.qualificationWeightPercent > 100) {
      issue('invalid_component_profile', id, 'Missing or invalid component facts')
    }
    summedWeights += component.qualificationWeightPercent
    if (component.eligibleExamTopicIds.length === 0) {
      issue('missing_component_topic_scope', id, 'Paper topic scope cannot be silently unspecified')
    }
    if (component.minimumPracticalMarks !== undefined
      && (!Number.isInteger(component.minimumPracticalMarks)
        || component.minimumPracticalMarks < 0
        || component.minimumPracticalMarks > component.totalMarks)) {
      issue('invalid_practical_minimum', id, 'Practical mark minimum must fit the exact paper')
    }

    const candidate = byPackId.get(id)
    if (!candidate) {
      issue('missing_component', id, 'Required projected paper is absent')
      continue
    }
    const pack = candidate.pack
    const m = pack.manifest
    if (candidate.cohortId !== expected.cohortId
      || m.subject.id !== expected.subjectId
      || m.qualification.id !== expected.qualificationId
      || m.examBoard.id !== expected.examBoardId
      || m.specificationCode !== expected.specificationCode) {
      issue('course_identity_mismatch', id, 'Candidate is not the exact planned course/cohort')
    }
    if (m.paper.id !== component.paperId || m.paper.number !== component.paperNumber
      || m.paper.totalMarks !== component.totalMarks
      || m.paper.durationMinutes !== component.durationMinutes) {
      issue('component_mismatch', id, 'Paper identity, marks or duration differ from exact Exam Truth')
    }
    if (candidate.qualificationWeightPercent !== component.qualificationWeightPercent) {
      issue('qualification_weight_projection_mismatch', id,
        'Projected component weight is missing or differs from exact-course profile')
    }

    // No tier/variant identity exists in the current public manifest. A
    // sidecar assertion would NOT prove correct student selection/eligibility.
    if (component.requiredVariantId !== undefined) {
      issue('variant_projection_unsupported', id,
        'Existing learner pack manifest cannot prove published tier/variant identity')
    }
    if (component.preReleaseContextRef !== undefined
      && (!nonEmpty(component.preReleaseContextRef)
        || candidate.preReleaseContextRef !== component.preReleaseContextRef)) {
      issue('pre_release_context_mismatch', id,
        'No matching exact-cohort pre-release-context evidence reference')
    }

    if (pack.exams.length === 0) {
      issue('missing_mock', id, 'Projected pack contains no representative exam')
      continue
    }
    // The learner schema only checks the first mock against manifest timing
    // and marks. Inspect every mock here so later mocks cannot silently drift.
    for (const exam of pack.exams) {
      if (exam.totalMarks !== component.totalMarks
        || exam.durationMinutes !== component.durationMinutes) {
        issue('exam_metadata_mismatch', id,
          `Mock ${exam.id} differs from approved component marks or duration`)
      }
      const eligible = new Set(component.eligibleExamTopicIds)
      const questionIds = new Set<string>()
      for (const question of exam.questions) {
        if (questionIds.has(question.id)) {
          issue('duplicate_mock_question', id,
            `Question ${question.id} is repeated within mock ${exam.id}`)
        }
        questionIds.add(question.id)
        if (!eligible.has(question.topic)) {
          issue('paper_topic_mismatch', id,
            `Mock ${exam.id} question ${question.id} belongs to topic ${question.topic}, outside this paper's scope`)
        }
      }
    }

    if (component.minimumPracticalMarks !== undefined) {
      // Practical IDs currently carry no mock identity. Never infer which
      // exam they refer to when multiple mocks exist in one pack.
      if (pack.exams.length !== 1) {
        issue('practical_multiple_mocks_unsupported', id,
          'Practical attribution requires explicit mock identity when a pack has multiple mocks')
      } else {
        const exam = pack.exams[0]!
        // Choice routes cannot be counted by summing printed alternatives.
        if (exam.questions.some((question) => question.choiceGroup)) {
          issue('practical_choice_arithmetic_unproven', id,
            'Practical marks across optional exam routes need explicit attempted-choice assurance')
        } else {
          const ids = candidate.practicalQuestionIds
          if (!ids) {
            issue('missing_practical_attribution', id, 'No practical-question attribution was supplied')
          } else {
            const known = new Map(exam.questions.map((question) => [question.id, question.marks]))
            const selected = new Set<string>()
            let practicalMarks = 0
            for (const questionId of ids) {
              if (selected.has(questionId)) {
                issue('duplicate_practical_question', id, `Question ${questionId} counted more than once`)
                continue
              }
              selected.add(questionId)
              const marks = known.get(questionId)
              if (marks === undefined) {
                issue('unknown_practical_question', id, `Question ${questionId} not in the primary mock`)
              } else {
                practicalMarks += marks
              }
            }
            if (practicalMarks < component.minimumPracticalMarks) {
              issue('practical_marks_shortfall', id,
                `Attributed practical marks ${practicalMarks} below minimum ${component.minimumPracticalMarks}`)
            }
          }
        }
      }
    }
  }
  if (Math.abs(summedWeights - 100) > 0.000001) {
    issue('qualification_weight_total', 'course',
      `Declared component weights total ${summedWeights}, expected 100`)
  }
  return { status: problems.length === 0 ? 'pass' : 'hold', problems }
}
