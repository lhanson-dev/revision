import { courseKnowledgeModelSchema } from './schema'
import {
  assessmentItemWorkerOutputSchema,
  markingPackWorkerOutputSchema,
} from './assessment-and-marking'
import {
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
} from './learning-and-practice'
import {
  createOpenAIModelAssistedWorkers as createRemediationHardenedWorkers,
} from './openai-remediation-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import type { WorkerExecution } from './intake-to-knowledge-model'

const optionLabels = ['A', 'B', 'C', 'D'] as const

const assessmentIntegrityInstruction = [
  'Do not make a learner prove or classify a property that the supplied wording or context does not establish.',
  'If a question depends on a research method being quantitative or qualitative, a sampling frame, a numerical baseline, a time horizon or another factual premise, state enough original scenario information for that premise to be established from the item itself.',
  'Do not frame an evaluation as a binary choice when supplied facts create another material feasible option unless the scenario explicitly rules that option out.',
  'When comparing one-off and recurring financial effects, provide or use a decision time horizon sufficient for a fair comparison.',
].join(' ')

const operationalMarkingInstruction = [
  'The rubric must operationalise mark award for every structured subquestion, not only the longest evaluative part.',
  'For each subquestion, return one or more rubric entries whose id begins with that exact subquestion id followed by a hyphen.',
  'Use local minMark/maxMark bands for that subquestion. Together those bands must cover every integer mark from 0 through that subquestion maxMark without gaps.',
  'Calculation subquestions must distinguish method/working credit from final-answer accuracy and state how consequential arithmetic errors are treated.',
  'Analysis and evaluation subquestions must distinguish materially different quality levels rather than providing only indicative content.',
].join(' ')

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown output-integrity error'
}

function combinedRepairExecution(
  first: WorkerExecution<unknown>,
  repair: WorkerExecution<unknown>,
): WorkerExecution<unknown> {
  return {
    ...repair,
    provenance: {
      ...repair.provenance,
      retryCount: (first.provenance.retryCount ?? 0) + (repair.provenance.retryCount ?? 0) + 1,
      usageCost: (first.provenance.usageCost ?? 0) + (repair.provenance.usageCost ?? 0),
    },
  }
}

export function canonicaliseKnownMathematicalFormulas(providerOutput: unknown) {
  const model = courseKnowledgeModelSchema.parse(providerOutput)
  return courseKnowledgeModelSchema.parse({
    ...model,
    nodes: model.nodes.map((node) => ({
      ...node,
      formulas: node.formulas.map((formula) => {
        if (/^percentage change\s*\(%\)\s*=\s*new value\s*-\s*original value\s*\/\s*original value\s*[×x*]\s*100$/i.test(formula.trim())) {
          return 'percentage change (%) = ((new value - original value) / original value) × 100'
        }
        return formula
      }),
    })),
  })
}

function targetCorrectLabel(index: number) {
  return optionLabels[index % optionLabels.length]
}

export function rebalanceMcqCorrectAnswerPositions(providerOutput: unknown) {
  const item = assessmentItemWorkerOutputSchema.parse(providerOutput)
  const selectionIndexes = item.subquestions
    .map((subquestion, index) => ({ subquestion, index }))
    .filter(({ subquestion }) => subquestion.responseDemands.includes('selection') && (subquestion.options?.length ?? 0) === 4)

  if (selectionIndexes.length < 4) return item

  let selectionPosition = 0
  const subquestions = item.subquestions.map((subquestion, index) => {
    const selection = selectionIndexes.some((entry) => entry.index === index)
    if (!selection || !subquestion.options) return subquestion

    const correct = subquestion.options.find((option) => option.correct)
    if (!correct) return subquestion
    const distractors = subquestion.options.filter((option) => !option.correct)
    const desiredLabel = targetCorrectLabel(selectionPosition)
    selectionPosition += 1
    const desiredIndex = optionLabels.indexOf(desiredLabel)
    const ordered = [...distractors]
    ordered.splice(desiredIndex, 0, correct)
    return {
      ...subquestion,
      options: ordered.map((option, optionIndex) => ({
        ...option,
        label: optionLabels[optionIndex],
      })),
    }
  })

  return assessmentItemWorkerOutputSchema.parse({ ...item, subquestions })
}

export function validateMcqCorrectAnswerDistribution(providerOutput: unknown) {
  const item = assessmentItemWorkerOutputSchema.parse(providerOutput)
  const labels = item.subquestions
    .filter((subquestion) => subquestion.responseDemands.includes('selection') && (subquestion.options?.length ?? 0) === 4)
    .map((subquestion) => subquestion.options?.find((option) => option.correct)?.label)
    .filter((label): label is typeof optionLabels[number] => label !== undefined)

  if (labels.length < 4) return labels
  const distinct = new Set(labels)
  if (labels.length >= 8 && distinct.size !== 4) {
    throw new Error(`MCQ answer-key distribution must use all four option positions across ${labels.length} questions`)
  }
  if (labels.length < 8 && distinct.size < 2) {
    throw new Error(`MCQ answer-key distribution is excessively concentrated across ${labels.length} questions`)
  }
  const counts = optionLabels.map((label) => labels.filter((value) => value === label).length)
  if (Math.max(...counts) > Math.ceil(labels.length / 2)) {
    throw new Error(`MCQ answer-key distribution places too many correct answers in one option position: ${counts.join('/')}`)
  }
  return labels
}

function expectedResponseDeniesCashDeficit(expectedResponse: string) {
  return /\b(no cash deficit|no deficit|does not show a cash deficit|none of the months? (?:has|have|shows?|show) a cash deficit)\b/i.test(expectedResponse)
}

function repairCashDeficitPrompt(prompt: string, expectedResponse: string) {
  if (!expectedResponseDeniesCashDeficit(expectedResponse)) return prompt
  const definiteDeficit = /identify the month with a cash deficit and state one suitable action before that month\.?/i
  if (!definiteDeficit.test(prompt)) return prompt
  return prompt.replace(
    definiteDeficit,
    'Determine whether any month has a cash deficit. If one does, identify it and state one suitable action before that month.',
  )
}

export function repairPracticePromptPresuppositions(providerOutput: unknown) {
  const output = practiceCollateralWorkerOutputSchema.parse(providerOutput)
  const replacements = new Map<string, string>()
  const activities = output.activities.map((activity) => {
    const prompt = repairCashDeficitPrompt(activity.prompt, activity.expectedResponse)
    if (prompt !== activity.prompt) replacements.set(activity.prompt, prompt)
    return { ...activity, prompt }
  })
  const coverageEvidence = output.coverageEvidence.map((entry) => ({
    ...entry,
    evidence: replacements.get(entry.evidence) ?? entry.evidence,
  }))
  return practiceCollateralWorkerOutputSchema.parse({ ...output, activities, coverageEvidence })
}

function hasLatinLetter(value: string) {
  return /\p{Script=Latin}/u.test(value)
}

function isAllNonLatinLetters(value: string) {
  return /\p{Letter}/u.test(value)
    && !hasLatinLetter(value)
    && [...value].every((character) => !/\p{Letter}/u.test(character) || !/\p{Script=Latin}/u.test(character))
}

function cleanTrailingUnexpectedScriptToken(value: string) {
  const match = value.match(/^(.*?)(\s+)([\p{Letter}\p{Mark}]{2,20})\s*$/u)
  if (!match || !hasLatinLetter(match[1]) || !isAllNonLatinLetters(match[3])) return value
  return match[1].trimEnd()
}

export function cleanTrailingLearnerLanguageContamination(providerOutput: unknown) {
  const output = learningCollateralWorkerOutputSchema.parse(providerOutput)
  const clean = cleanTrailingUnexpectedScriptToken
  const replacements = new Map<string, string>()
  const remember = (value: string) => {
    const cleaned = clean(value)
    if (cleaned !== value) replacements.set(value, cleaned)
    return cleaned
  }
  return learningCollateralWorkerOutputSchema.parse({
    ...output,
    title: remember(output.title),
    introduction: remember(output.introduction),
    sections: output.sections.map((section) => ({
      ...section,
      title: remember(section.title),
      explanation: remember(section.explanation),
      keyPoints: section.keyPoints.map(remember),
    })),
    workedExamples: output.workedExamples.map((example) => ({
      ...example,
      title: remember(example.title),
      setup: remember(example.setup),
      steps: example.steps.map(remember),
      conclusion: remember(example.conclusion),
    })),
    misconceptions: output.misconceptions.map((entry) => ({
      misconception: remember(entry.misconception),
      correction: remember(entry.correction),
    })),
    nextAction: remember(output.nextAction),
    coverageEvidence: output.coverageEvidence.map((entry) => ({
      ...entry,
      evidence: replacements.get(entry.evidence) ?? clean(entry.evidence),
    })),
  })
}

export function validateOperationalRubricCoverage(
  markingPackInput: unknown,
  assessmentItemInput: unknown,
) {
  const pack = markingPackWorkerOutputSchema.parse(markingPackInput)
  const item = assessmentItemWorkerOutputSchema.parse(assessmentItemInput)

  for (const subquestion of item.subquestions) {
    const prefix = `${subquestion.id}-`
    const entries = pack.rubric.filter((entry) => entry.id.startsWith(prefix))
    if (entries.length === 0) throw new Error(`Marking rubric has no operational entries for subquestion ${subquestion.id}`)
    if (entries.some((entry) => entry.minMark === undefined || entry.maxMark === undefined)) {
      throw new Error(`Marking rubric for ${subquestion.id} must use explicit local minMark/maxMark bands`)
    }
    const covered = new Set<number>()
    for (const entry of entries) {
      const minMark = entry.minMark!
      const maxMark = entry.maxMark!
      if (minMark > maxMark || maxMark > subquestion.maxMark) {
        throw new Error(`Marking rubric band ${entry.id} is outside the 0-${subquestion.maxMark} range for ${subquestion.id}`)
      }
      for (let mark = minMark; mark <= maxMark; mark += 1) covered.add(mark)
    }
    for (let mark = 0; mark <= subquestion.maxMark; mark += 1) {
      if (!covered.has(mark)) throw new Error(`Marking rubric for ${subquestion.id} does not operationalise mark ${mark}`)
    }

    const descriptors = entries.map((entry) => entry.descriptor.toLowerCase()).join(' ')
    if (subquestion.responseDemands.includes('calculation')) {
      if (!/(method|working|process)/.test(descriptors) || !/(accuracy|answer|consequential|follow-through)/.test(descriptors)) {
        throw new Error(`Calculation rubric for ${subquestion.id} must distinguish method and accuracy/consequential-error treatment`)
      }
    }
    if ((subquestion.responseDemands.includes('analysis') || subquestion.responseDemands.includes('evaluation')) && subquestion.maxMark >= 6 && entries.length < 2) {
      throw new Error(`Extended-response rubric for ${subquestion.id} must distinguish more than one quality level`)
    }
  }
  return pack
}

function assessmentInputWithIntegrityInstruction(input: Parameters<OpenAIModelAssistedWorkers['generateAssessmentItem']>[0]) {
  return {
    ...input,
    questionFamily: {
      ...input.questionFamily,
      responseShape: `${input.questionFamily.responseShape} ${assessmentIntegrityInstruction}`,
    },
    assessmentBlueprint: {
      ...input.assessmentBlueprint,
      evidenceExpectations: [...input.assessmentBlueprint.evidenceExpectations, assessmentIntegrityInstruction],
    },
  }
}

function markingInputWithInstruction(
  input: Parameters<OpenAIModelAssistedWorkers['generateMarkingPack']>[0],
  instruction: string,
) {
  return {
    ...input,
    questionFamily: {
      ...input.questionFamily,
      responseShape: `${input.questionFamily.responseShape} ${instruction}`,
    },
    assessmentBlueprint: {
      ...input.assessmentBlueprint,
      evidenceExpectations: [...input.assessmentBlueprint.evidenceExpectations, instruction],
    },
  }
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createRemediationHardenedWorkers(config)

  return {
    ...workers,
    async compileKnowledgeModel(input) {
      const execution = await workers.compileKnowledgeModel(input)
      if (execution.status !== 'success') return execution
      return { ...execution, output: canonicaliseKnownMathematicalFormulas(execution.output) }
    },
    async generateLearningCollateral(input) {
      const execution = await workers.generateLearningCollateral(input)
      if (execution.status !== 'success') return execution
      return { ...execution, output: cleanTrailingLearnerLanguageContamination(execution.output) }
    },
    async generatePracticeCollateral(input) {
      const execution = await workers.generatePracticeCollateral(input)
      if (execution.status !== 'success') return execution
      return { ...execution, output: repairPracticePromptPresuppositions(execution.output) }
    },
    async generateAssessmentItem(input) {
      const execution = await workers.generateAssessmentItem(assessmentInputWithIntegrityInstruction(input))
      if (execution.status !== 'success') return execution
      try {
        const output = rebalanceMcqCorrectAnswerPositions(execution.output)
        validateMcqCorrectAnswerDistribution(output)
        return { ...execution, output }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: assessment_output_integrity: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
    async generateMarkingPack(input) {
      const hardenedInput = markingInputWithInstruction(input, operationalMarkingInstruction)
      const firstExecution = await workers.generateMarkingPack(hardenedInput)
      if (firstExecution.status !== 'success') return firstExecution
      try {
        return {
          ...firstExecution,
          output: validateOperationalRubricCoverage(firstExecution.output, input.assessmentItem),
        }
      } catch (firstError) {
        const repairInstruction = [
          operationalMarkingInstruction,
          'TARGETED OPERATIONAL RUBRIC REPAIR REQUIRED.',
          `The first completed Marking Pack failed deterministic rubric coverage with this exact error: ${errorMessage(firstError)}`,
          'Return the complete corrected Marking Pack, preserving valid content and changing only the missing or invalid operational rubric logic.',
        ].join(' ')
        const repairExecution = combinedRepairExecution(
          firstExecution,
          await workers.generateMarkingPack(markingInputWithInstruction(input, repairInstruction)),
        )
        if (repairExecution.status !== 'success') return repairExecution
        try {
          return {
            ...repairExecution,
            output: validateOperationalRubricCoverage(repairExecution.output, input.assessmentItem),
          }
        } catch (repairError) {
          return {
            status: 'failure',
            error: `provider_contract_failure: marking_pack_operational_rubric_after_targeted_repair: initial=${errorMessage(firstError)}; repair=${errorMessage(repairError)}`,
            provenance: repairExecution.provenance,
          }
        }
      }
    },
  }
}
