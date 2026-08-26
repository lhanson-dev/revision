import {
  boardAlignmentSchema,
  coverageMapSchema,
  questionFamilySchema,
  type ContentFactoryJob,
} from './schema'
import {
  fingerprintValue,
  type CurriculumRequirementInput,
  type SourceRightsPolicyRule,
  type WorkerExecution,
} from './intake-to-knowledge-model'
import {
  assessmentItemWorkerOutputSchema,
  executableAssessmentBlueprintSchema,
} from './assessment-and-marking'
import {
  continueContentFactoryToExpertReviewReady,
  type ContentFactoryEndToEndArtifactKind,
  type ContentFactoryEndToEndProofReport,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'
import { createRequestedJob } from './orchestrator'
import {
  createOpenAIModelAssistedWorkers,
  type OpenAIContentFactoryAdapterConfig,
} from './openai-live-adapter'
import type { ExpertReviewPackage } from './expert-review-handoff'

export const AQA_AS_BUSINESS_7131_URLS = {
  specification: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification',
  assessment: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification/specification-at-a-glance',
  subjectContent: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification/subject-content',
  dfeSubjectContent: 'https://www.gov.uk/government/publications/gce-as-and-a-level-for-business',
  ofqualAssessmentObjectives: 'https://www.gov.uk/government/publications/assessment-objectives-ancient-languages-geography-and-mfl/gcse-as-and-a-level-assessment-objectives',
  libreTextsBusiness: 'https://biz.libretexts.org/Courses/Cosumnes_River_College/Bus_300%3A_Business_Fundamentals_%28Brown%29',
  libreTextsTerms: 'https://libretexts.org/terms-conditions',
} as const

const permittedCurriculumSources = ['dfe-business-subject-content', 'libretexts-business-fundamentals']

const pilotRequirements: CurriculumRequirementInput[] = [
  {
    requirementId: 'business-foundations',
    summary: 'Explain why businesses exist and set objectives, how profit is measured, and how ownership form changes control, liability, access to finance, distribution of returns and stakeholder relationships. Learners must compare multiple relevant business forms rather than treating one form as representative of all businesses, and explain how competition and the external environment affect decisions.',
    skillsOrKnowledge: ['business purpose and objectives', 'profit and cost/revenue relationships', 'multiple business forms and ownership trade-offs', 'limited and unlimited liability', 'shareholders and returns', 'stakeholders', 'external influences'],
    componentScope: [], revisionArea: 'Business foundations', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'leadership-and-management',
    summary: 'Compare management and leadership, leadership styles and their suitability, and how organisational context affects leadership choices.',
    skillsOrKnowledge: ['management', 'leadership', 'leadership styles', 'organisational context'],
    componentScope: [], revisionArea: 'Managers and leaders', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'decision-making-and-stakeholders',
    summary: 'Use qualitative and quantitative evidence to make and justify business decisions under risk and uncertainty, including stakeholder interests and trade-offs.',
    skillsOrKnowledge: ['decision making', 'risk and uncertainty', 'qualitative and quantitative evidence', 'stakeholders', 'opportunity cost'],
    componentScope: [], revisionArea: 'Decision making', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-research',
    summary: 'Use marketing objectives and research evidence, distinguish primary and secondary and qualitative and quantitative data, and judge the usefulness and limitations of samples and data relationships.',
    skillsOrKnowledge: ['marketing objectives', 'market research', 'data types', 'sampling', 'data interpretation'],
    componentScope: [], revisionArea: 'Marketing research', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-demand-and-positioning',
    summary: 'Analyse customer needs, segmentation, targeting, positioning and demand responsiveness, including the business implications of price and income elasticity.',
    skillsOrKnowledge: ['customer needs', 'segmentation', 'targeting', 'positioning', 'price elasticity', 'income elasticity'],
    componentScope: [], revisionArea: 'Markets and demand', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-mix-and-digital',
    summary: 'Evaluate coordinated product, price, promotion and distribution choices, product life-cycle decisions, branding and the effects of digital channels on marketing.',
    skillsOrKnowledge: ['marketing mix', 'product life cycle', 'pricing', 'promotion', 'distribution', 'branding', 'digital marketing'],
    componentScope: [], revisionArea: 'Marketing decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'operations-performance',
    summary: 'Analyse operational objectives and performance using productivity, capacity, unit-cost and efficiency evidence, and judge labour- versus capital-intensive choices.',
    skillsOrKnowledge: ['operations objectives', 'productivity', 'capacity utilisation', 'unit costs', 'efficiency', 'labour and capital intensity'],
    componentScope: [], revisionArea: 'Operations performance', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'operations-quality-and-supply',
    summary: 'Evaluate quality management, inventory and lean approaches, technology, supplier relationships, supply chains and outsourcing in operational decisions.',
    skillsOrKnowledge: ['quality', 'inventory', 'lean operations', 'technology', 'suppliers', 'supply chain', 'outsourcing'],
    componentScope: [], revisionArea: 'Operations decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'finance-profit-cash-budgeting',
    summary: 'Distinguish revenue, profit and cash. Sales revenue is generated by sales, while customer payment timing affects cash receipts rather than the amount of sales revenue. Use revenue and cost information, construct and interpret budgets and cash-flow forecasts, analyse meaningful variances, and explain causes and consequences of cash-flow problems.',
    skillsOrKnowledge: ['revenue generated by sales versus timing of cash receipts', 'costs and profit', 'cash flow', 'budgets', 'sales-volume and selling-price variance causes', 'cash-flow forecasting'],
    componentScope: [], revisionArea: 'Financial performance', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'finance-analysis-and-funding',
    summary: 'Use contribution, break-even and profitability evidence, evaluate internal and external finance options, and recommend actions to improve financial performance.',
    skillsOrKnowledge: ['contribution', 'break-even', 'margin of safety', 'profitability ratios', 'sources of finance', 'financial improvement'],
    componentScope: [], revisionArea: 'Financial decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'people-performance-and-structure',
    summary: 'Analyse human-resource objectives and performance, organisational design and workforce choices using measures such as labour productivity and labour turnover.',
    skillsOrKnowledge: ['HR objectives', 'workforce performance', 'labour productivity', 'labour turnover', 'organisational design', 'workforce planning'],
    componentScope: [], revisionArea: 'People and organisation', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'motivation-and-employee-relations',
    summary: 'Evaluate financial and non-financial motivation, employee involvement, leadership and workplace relationships, including the effects of different approaches on performance.',
    skillsOrKnowledge: ['motivation', 'financial and non-financial incentives', 'employee involvement', 'employee relations', 'leadership'],
    componentScope: [], revisionArea: 'Motivation and relations', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'quantitative-business-skills',
    summary: 'Calculate and interpret ratios, averages, percentages and changes, graphical and index information, costs, revenue, profit and break-even. Calculate sales revenue from price and quantity sold, keep revenue and profit measures distinct from cash receipts, and combine numerical and non-numerical evidence to support decisions.',
    skillsOrKnowledge: ['ratios', 'averages', 'percentages', 'graphs', 'index numbers', 'cost revenue profit', 'revenue versus cash receipts', 'break-even', 'decision evidence'],
    componentScope: [], revisionArea: 'Quantitative skills', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
]

const officialReferences: Record<string, string> = {
  'business-foundations': 'AQA 7131 section 3.1 — structured alignment reference only',
  'leadership-and-management': 'AQA 7131 section 3.2 — structured alignment reference only',
  'decision-making-and-stakeholders': 'AQA 7131 section 3.2 — structured alignment reference only',
  'marketing-research': 'AQA 7131 section 3.3 — structured alignment reference only',
  'marketing-demand-and-positioning': 'AQA 7131 section 3.3 — structured alignment reference only',
  'marketing-mix-and-digital': 'AQA 7131 section 3.3 — structured alignment reference only',
  'operations-performance': 'AQA 7131 section 3.4 — structured alignment reference only',
  'operations-quality-and-supply': 'AQA 7131 section 3.4 — structured alignment reference only',
  'finance-profit-cash-budgeting': 'AQA 7131 section 3.5 — structured alignment reference only',
  'finance-analysis-and-funding': 'AQA 7131 section 3.5 — structured alignment reference only',
  'people-performance-and-structure': 'AQA 7131 section 3.6 — structured alignment reference only',
  'motivation-and-employee-relations': 'AQA 7131 section 3.6 — structured alignment reference only',
  'quantitative-business-skills': 'AQA 7131 quantitative-skills annex — structured alignment reference only',
}

export const AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES: SourceRightsPolicyRule[] = [
  {
    id: 'govuk-dfe-ogl-v3', issuer: 'Department for Education', hostnames: ['www.gov.uk'], sourceTypes: ['subject_content'], useClass: 'OPEN',
    permissionBasis: 'Crown copyright publication distributed on GOV.UK under the Open Government Licence v3.0; live preflight verifies the publication and licence marker.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'], restrictions: ['Check identified third-party material separately.'],
    revalidationConditions: ['Publication or licence wording changes.'],
  },
  {
    id: 'govuk-ofqual-ogl-v3', issuer: 'Ofqual', hostnames: ['www.gov.uk'], sourceTypes: ['assessment_objectives'], useClass: 'OPEN',
    permissionBasis: 'Ofqual GOV.UK publication under the Open Government Licence v3.0; live preflight verifies the current page and licence marker.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'], restrictions: ['Check identified third-party material separately.'],
    revalidationConditions: ['Assessment-objective publication or licence wording changes.'],
  },
  {
    id: 'libretexts-business-cc-by-4', issuer: 'LibreTexts', hostnames: ['biz.libretexts.org'], sourceTypes: ['secondary_supplement'], useClass: 'OPEN',
    permissionBasis: 'Business Fundamentals (Brown) is marked CC BY 4.0 by LibreTexts; current LibreTexts terms state content may be copied consistently with the material licence. Live preflight verifies both markers before the source is admitted.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Business Fundamentals (Brown), Cornelius Brown and Hannah Wong / LibreTexts, under CC BY 4.0, and preserve attribution for any separately noted material actually reused.'],
    restrictions: ['Do not ingest or reproduce third-party material separately marked under a different licence; this pilot passes only manually curated structured facts to the model.'],
    revalidationConditions: ['Resource licence, detailed licensing, LibreTexts terms or source composition changes.'],
  },
  {
    id: 'aqa-reference-only-alignment', issuer: 'AQA', hostnames: ['www.aqa.org.uk'], sourceTypes: ['specification', 'assessment', 'subject_content'], useClass: 'REFERENCE_ONLY',
    permissionBasis: 'Founder-approved Content Factory v2 boundary permits awarding-body material only as controlled structured Board Alignment; source prose is not supplied to generative workers.',
    aiInputPermitted: false, derivedCommercialUsePermitted: false,
    attributionRequirements: [], restrictions: ['alignment-facts-only', 'no-generative-source-text', 'no-protected-question-or-mark-scheme-ingestion'],
    revalidationConditions: ['AQA specification, terms, copyright policy or qualification cohort changes.'],
  },
]

export const AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES: NonNullable<OpenAIContentFactoryAdapterConfig['questionFamilyPolicies']> = {
  'paper1-mcq-10': { title: 'Paper 1 Section A multiple choice', componentId: 'paper-1', maxMark: 10, assessmentObjectiveIds: ['ao1', 'ao2'], responseShape: 'exactly 10 one-mark multiple-choice questions, each with four plausible options and one unambiguous best answer', contextRequired: false },
  'paper1-short-answer-20': { title: 'Paper 1 Section B short answer', componentId: 'paper-1', maxMark: 20, assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'], responseShape: 'a set of concise short-answer questions totalling 20 marks with clear command demands', contextRequired: false },
  'paper1-data-response-a-25': { title: 'Paper 1 Section C data response stimulus A', componentId: 'paper-1', maxMark: 25, assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'], responseShape: 'one original data-response stimulus with several linked questions totalling 25 marks, including quantitative application and analysis', contextRequired: true },
  'paper1-data-response-b-25': { title: 'Paper 1 Section C data response stimulus B', componentId: 'paper-1', maxMark: 25, assessmentObjectiveIds: ['ao2', 'ao3', 'ao4'], responseShape: 'one original data-response stimulus with several linked questions totalling 25 marks, including contextual analysis and supported evaluation', contextRequired: true },
  'paper2-case-study-80': { title: 'Paper 2 compulsory case study', componentId: 'paper-2', maxMark: 80, assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'], responseShape: 'one shared original case study followed by approximately seven linked questions totalling 80 marks and spanning knowledge, application, quantitative reasoning, analysis and evaluation', contextRequired: true },
}

export const AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES: NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']> = {
  'paper1-mcq-10': { requirementIds: ['business-foundations', 'leadership-and-management', 'quantitative-business-skills'], maxMark: 10, format: 'mixed' },
  'paper1-short-answer-20': { requirementIds: ['marketing-research', 'marketing-demand-and-positioning', 'marketing-mix-and-digital'], maxMark: 20, format: 'written_question' },
  'paper1-data-response-a-25': { requirementIds: ['operations-performance', 'operations-quality-and-supply', 'finance-profit-cash-budgeting'], maxMark: 25, format: 'mixed' },
  'paper1-data-response-b-25': { requirementIds: ['finance-analysis-and-funding', 'people-performance-and-structure', 'motivation-and-employee-relations', 'decision-making-and-stakeholders'], maxMark: 25, format: 'case_question' },
  'paper2-case-study-80': { requirementIds: ['business-foundations', 'decision-making-and-stakeholders', 'marketing-demand-and-positioning', 'operations-performance', 'operations-quality-and-supply', 'finance-profit-cash-budgeting', 'finance-analysis-and-funding', 'people-performance-and-structure', 'motivation-and-employee-relations', 'quantitative-business-skills'], maxMark: 80, format: 'case_question' },
}

type FixedAssessmentContext = {
  id: string
  title: string
  body: string
  dataPoints: Array<{ label: string; value: string; unit?: string }>
}

export const AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS: Record<string, FixedAssessmentContext> = {
  'paper1-data-response-a-25': {
    id: 'urbanpod-lunchboxes',
    title: 'UrbanPod Lunchboxes',
    body: 'UrbanPod makes reusable lunchboxes for UK sixth-form and workplace customers. It is testing a direct-to-school channel. All figures below refer to the same 12-month forecast and the proposed school-channel sales are additional to current sales.',
    dataPoints: [
      { label: 'Current annual units sold', value: '40000', unit: 'units' },
      { label: 'Current selling price', value: '18', unit: 'GBP per unit' },
      { label: 'Proposed school-channel selling price', value: '16', unit: 'GBP per unit' },
      { label: 'Expected additional school-channel sales', value: '10000', unit: 'units' },
      { label: 'Variable cost', value: '9', unit: 'GBP per unit' },
      { label: 'Annual digital campaign cost', value: '45000', unit: 'GBP' },
      { label: 'Survey sample size', value: '600', unit: 'respondents' },
      { label: 'Respondents who would consider buying at GBP 16', value: '58', unit: 'percent' },
    ],
  },
  'paper1-data-response-b-25': {
    id: 'northstar-meals',
    title: 'Northstar Meals',
    body: 'Northstar Meals supplies prepared lunches to offices. Sales revenue is recorded when sales are made; cash receipts can arrive later. The monthly figures below are intentionally separated so candidates can distinguish profit performance from cash-flow timing.',
    dataPoints: [
      { label: 'Monthly sales revenue', value: '240000', unit: 'GBP' },
      { label: 'Monthly variable costs', value: '132000', unit: 'GBP' },
      { label: 'Monthly fixed costs', value: '78000', unit: 'GBP' },
      { label: 'Opening cash balance', value: '55000', unit: 'GBP' },
      { label: 'Monthly cash receipts', value: '225000', unit: 'GBP' },
      { label: 'Monthly cash outflows', value: '235000', unit: 'GBP' },
      { label: 'Annual employee turnover', value: '18', unit: 'percent' },
      { label: 'Annual training proposal', value: '24000', unit: 'GBP' },
    ],
  },
  'paper2-case-study-80': {
    id: 'refillworks-growth-case',
    title: 'RefillWorks Ltd',
    body: 'RefillWorks Ltd sells reusable refill packs to independent retailers and online customers. Current output already includes all existing sales. A new supermarket contract would add demand beyond current output. Management is comparing automation with outsourcing while considering customers, employees, finance, quality and capacity.',
    dataPoints: [
      { label: 'Current annual output', value: '72000', unit: 'packs' },
      { label: 'Current practical annual capacity', value: '90000', unit: 'packs' },
      { label: 'Additional annual supermarket demand', value: '24000', unit: 'packs' },
      { label: 'Current selling price', value: '3.40', unit: 'GBP per pack' },
      { label: 'Current variable cost', value: '1.55', unit: 'GBP per pack' },
      { label: 'Automation one-off investment', value: '60000', unit: 'GBP' },
      { label: 'Cash available for investment', value: '85000', unit: 'GBP' },
      { label: 'Capacity after automation', value: '120000', unit: 'packs' },
      { label: 'Variable cost after automation', value: '1.30', unit: 'GBP per pack' },
      { label: 'Automation training cost', value: '12000', unit: 'GBP' },
      { label: 'Outsourcing cost for additional packs', value: '1.70', unit: 'GBP per pack' },
      { label: 'Maximum outsourced supply', value: '30000', unit: 'packs' },
      { label: 'Current in-house defect rate', value: '1.2', unit: 'percent' },
      { label: 'Supplier defect rate', value: '2.5', unit: 'percent' },
      { label: 'Annual employee turnover', value: '11', unit: 'percent' },
    ],
  },
}

const questionFamilyDemandGuardrails: Record<string, {
  contextRequirements: string[]
  applicationRequirements: string[]
  analysisRequirements: string[]
  evaluationRequirements: string[]
}> = {
  'paper1-mcq-10': {
    contextRequirements: [],
    applicationRequirements: ['Where a question uses a short business situation, apply the relevant concept directly without inventing missing facts.'],
    analysisRequirements: [],
    evaluationRequirements: [],
  },
  'paper1-short-answer-20': {
    contextRequirements: [],
    applicationRequirements: ['Use concise business examples only where the command requires application.'],
    analysisRequirements: ['Any analysis question must require a clear cause-and-effect chain rather than a recommendation.'],
    evaluationRequirements: [],
  },
  'paper1-data-response-a-25': {
    contextRequirements: ['Use one coherent original data stimulus and keep every numerical claim consistent with its structured data.'],
    applicationRequirements: ['Candidates must use supplied business data rather than receive AO credit for generic knowledge alone.'],
    analysisRequirements: ['Analysis must connect the supplied data to business consequences.'],
    evaluationRequirements: [],
  },
  'paper1-data-response-b-25': {
    contextRequirements: ['Use one coherent original data stimulus and keep revenue, profit and cash-flow measures explicitly distinct.'],
    applicationRequirements: ['Candidates must use supplied case evidence in their reasoning.'],
    analysisRequirements: ['Analysis must develop contextual chains of reasoning from the supplied evidence.'],
    evaluationRequirements: ['Evaluation must weigh contextual evidence and reach a supported judgement.'],
  },
  'paper2-case-study-80': {
    contextRequirements: ['All subquestions must use one shared original Revision-owned case study; do not introduce unrelated business contexts.'],
    applicationRequirements: ['Use specific case facts across the question set.'],
    analysisRequirements: ['Include developed cause-and-effect reasoning on operational, financial and people implications.'],
    evaluationRequirements: ['Include at least one substantial judgement that weighs evidence and reaches a supported contextual conclusion.'],
  },
}

const assessmentItemGenerationGuardrails: Record<string, string[]> = {
  'paper1-mcq-10': [
    'Write exactly 10 one-mark MCQs numbered 1 to 10.',
    'Give four options A-D for every MCQ and only one unambiguous best answer.',
    'Do not add a case stimulus or turn the section into short-response questions.',
  ],
  'paper1-short-answer-20': [
    'Write several short-answer questions whose marks total exactly 20.',
    'Do not require an evaluative recommendation; keep commands within knowledge, application and analysis demand.',
  ],
  'paper1-data-response-a-25': [
    'Use only the exact fixed context and data supplied for this pilot instantiation.',
    'Do not invent additional numerical scenario facts.',
    'Write linked subquestions totalling exactly 25 marks with quantitative application and analysis but no evaluative recommendation.',
  ],
  'paper1-data-response-b-25': [
    'Use only the exact fixed context and data supplied for this pilot instantiation.',
    'Do not invent financing terms, repayment schedules or additional numerical scenario facts.',
    'Write linked subquestions totalling exactly 25 marks, including contextual analysis and supported evaluation.',
  ],
  'paper2-case-study-80': [
    'Use only the exact fixed RefillWorks context and data supplied for this pilot instantiation.',
    'Do not introduce a second business, contradictory prose, loan terms or additional numerical scenario facts.',
    'Write approximately seven linked subquestions whose marks total exactly 80 and collectively include calculation/application, analysis and evaluation.',
  ],
}

const assessmentItemCommandPolicy: Record<string, string> = {
  'paper1-mcq-10': 'select',
  'paper1-short-answer-20': 'mixed short answer',
  'paper1-data-response-a-25': 'mixed data response',
  'paper1-data-response-b-25': 'mixed data response',
  'paper2-case-study-80': 'mixed case study',
}

function deterministicExecution(output: unknown, id: string): WorkerExecution<unknown> {
  return { status: 'success', output, provenance: { id, contextId: `deterministic-${id}`, contractVersion: '1', provider: 'revision-deterministic' } }
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function strengthenPilotKnowledgeNodes<T extends {
  id: string
  summary: string
  misconceptions: string[]
  applicationContexts: string[]
}>(nodes: T[]): T[] {
  return nodes.map((node) => {
    if (node.id === 'finance-profit-cash-budgeting') {
      return {
        ...node,
        summary: `${node.summary} Revenue generated by sales must remain distinct from the timing of customer cash receipts; delayed payment changes cash timing, not the sales-revenue amount.`,
        misconceptions: uniqueStrings([...node.misconceptions, 'Delayed customer payment reduces sales revenue rather than delaying cash receipts.']),
        applicationContexts: uniqueStrings([...node.applicationContexts, 'Separate a sales-revenue variance caused by price or volume from a cash-receipts variance caused by payment timing.']),
      }
    }
    if (node.id === 'quantitative-business-skills') {
      return {
        ...node,
        summary: `${node.summary} Revenue is calculated from sales activity such as price multiplied by quantity sold; it is not defined as the cash received during the period.`,
        misconceptions: uniqueStrings([...node.misconceptions, 'Revenue is simply the cash received from customers during the period.']),
      }
    }
    if (node.id === 'business-foundations') {
      return {
        ...node,
        summary: `${node.summary} Learners must compare multiple relevant ownership forms and their trade-offs in control, liability, finance, continuity and returns rather than treating a sole trader as the only form.`,
        applicationContexts: uniqueStrings([...node.applicationContexts, 'Compare sole-trader, limited-company, public/private-sector and mission-led or non-profit forms in context.']),
      }
    }
    return node
  })
}

function fixedContextInstruction(context: FixedAssessmentContext) {
  const data = context.dataPoints.map((point) => `${point.label}=${point.value}${point.unit ? ` ${point.unit}` : ''}`).join('; ')
  return `For this pilot instantiation use exactly this Revision-owned context: ${context.title}. ${context.body} Structured data: ${data}. Do not change these facts or add scenario numbers not supplied here.`
}

function pilotInstantiationFamily(familyInput: unknown) {
  const family = questionFamilySchema.parse(familyInput)
  const constraints = assessmentItemGenerationGuardrails[family.id] ?? []
  const fixedContext = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS[family.id]
  return questionFamilySchema.parse({
    ...family,
    responseShape: [family.responseShape, ...constraints].join(' '),
    contextRequirements: uniqueStrings([
      ...family.contextRequirements,
      ...(fixedContext ? [fixedContextInstruction(fixedContext)] : []),
    ]),
  })
}

function normalisePilotQuestionFamilies(output: unknown) {
  return questionFamilySchema.array().parse(output).map((family) => {
    const policy = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[family.id]
    if (!policy) return family
    const demand = questionFamilyDemandGuardrails[family.id] ?? { contextRequirements: [], applicationRequirements: [], analysisRequirements: [], evaluationRequirements: [] }
    return questionFamilySchema.parse({
      ...family,
      title: policy.title,
      assessmentObjectiveIds: policy.assessmentObjectiveIds,
      componentScope: [policy.componentId],
      markRange: { min: policy.maxMark, max: policy.maxMark },
      responseShape: policy.responseShape,
      contextRequirements: policy.contextRequired ? demand.contextRequirements : [],
      applicationRequirements: demand.applicationRequirements,
      analysisRequirements: demand.analysisRequirements,
      evaluationRequirements: demand.evaluationRequirements,
    })
  })
}

async function checkedText(fetchImpl: typeof fetch, url: string, markers: string[]) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'Revision-Content-Factory-Live-Pilot/1.0' } })
  if (!response.ok) throw new Error(`Live source preflight failed for ${url}: HTTP ${response.status}`)
  const text = (await response.text()).toLowerCase()
  for (const marker of markers) if (!text.includes(marker.toLowerCase())) throw new Error(`Live source preflight marker missing for ${url}: ${marker}`)
}

export async function preflightAqaAsBusiness7131Sources(fetchImpl: typeof fetch = fetch) {
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.dfeSubjectContent, ['gce as and a level', 'business', 'open government licence'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.ofqualAssessmentObjectives, ['assessment objectives', 'business', 'open government licence'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness, ['business fundamentals', 'cc by 4.0', 'marketing', 'accounting and finance', 'operations', 'human resources'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.libreTextsTerms, ['content can be downloaded or copied', 'licensing of the material'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.specification, ['as business', '7131', '2026'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.assessment, ['10 multiple choice questions', 'short answer questions', 'two data response stimuli', 'one compulsory case study', '80 marks'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.subjectContent, ['what is business', 'different business forms', 'sole traders', 'social enterprises', 'financial management'])
}

export class LivePilotArtifactStore {
  private readonly values = new Map<string, unknown>()
  private readonly refsByValue = new Map<string, string>()
  private sequence = 0

  async writeJson(input: { jobId: string; kind: ContentFactoryEndToEndArtifactKind; fingerprint: string; value: unknown }) {
    this.sequence += 1
    const ref = `pilot-artifact:${input.jobId}:${input.kind}:${this.sequence}:${input.fingerprint.slice(0, 16)}`
    const value = structuredClone(input.value)
    this.values.set(ref, value)
    this.refsByValue.set(JSON.stringify(value), ref)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Unknown live-pilot artifact reference: ${ref}`)
    return structuredClone(this.values.get(ref))
  }

  findRef(value: unknown) {
    return this.refsByValue.get(JSON.stringify(value))
  }

  exportArtifacts() {
    return [...this.values.entries()].map(([ref, value]) => ({ ref, value: structuredClone(value) }))
  }
}

async function buildBoardAlignment(jobId: string) {
  const value = {
    schemaVersion: 1 as const,
    jobId,
    fingerprint: await fingerprintValue({ jobId, profile: 'aqa-as-business-7131-2026-v2' }),
    courseIdentity: { subject: 'Business', qualification: 'AS Level', awardingBody: 'AQA', specificationId: '7131' },
    cohortValidity: { status: 'outgoing' as const, lastAssessment: '2026', notes: ['AQA states the current AS Business 7131 specification continues for cohorts taking examinations in 2026.'] },
    components: [
      { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
      { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
    ],
    assessmentObjectives: [
      { id: 'ao1', name: 'Knowledge and understanding of business terms, concepts, theories, methods and models', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao2', name: 'Application of business knowledge and understanding to contexts', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao3', name: 'Analysis of business issues and influences', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao4', name: 'Evaluation of quantitative and qualitative information to make informed judgements and propose evidence-based solutions', sourceRefs: ['ofqual-business-assessment-objectives'] },
    ],
    assessmentRequirements: [
      { id: 'paper1-section-a', summary: 'Paper 1 Section A contains 10 one-mark multiple-choice questions.', componentScope: ['paper-1'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'paper1-section-b', summary: 'Paper 1 Section B contains short-answer questions worth approximately 20 marks.', componentScope: ['paper-1'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'paper1-section-c', summary: 'Paper 1 Section C contains two data-response stimuli with questions worth approximately 25 marks per stimulus.', componentScope: ['paper-1'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'paper2-structure', summary: 'Paper 2 contains one compulsory case study with approximately seven questions across the 80-mark paper.', componentScope: ['paper-2'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'both-papers-required', summary: 'Both Paper 1 and Paper 2 are compulsory and each contributes half of the AS qualification.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'quantitative-minimum', summary: 'Quantitative skills must be assessed across the AS qualification and form at least 10% of overall marks.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['dfe-business-subject-content'] },
    ],
    sourceRefs: ['aqa-7131-specification', 'aqa-7131-assessment', 'ofqual-business-assessment-objectives', 'dfe-business-subject-content'],
    verificationStatus: 'verified' as const,
  }
  return boardAlignmentSchema.parse(value)
}

async function buildAssessmentBlueprint(jobId: string, boardAlignmentFingerprint: string) {
  return executableAssessmentBlueprintSchema.parse({
    schemaVersion: 1,
    jobId,
    fingerprint: await fingerprintValue({ jobId, boardAlignmentFingerprint, profile: 'aqa-as-business-assessment-v2' }),
    boardAlignmentFingerprint,
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    components: [
      {
        componentId: 'paper-1',
        questionFamilyIds: ['paper1-mcq-10', 'paper1-short-answer-20', 'paper1-data-response-a-25', 'paper1-data-response-b-25'],
        markTotal: 80,
        timingMinutes: 90,
        constraints: [
          'Section A = 10 one-mark MCQs.',
          'Section B = short-answer questions normalised to 20 marks for this Revision-owned simulation.',
          'Section C = two distinct data-response stimuli normalised to 25 marks each for this Revision-owned simulation.',
          '10 + 20 + 25 + 25 marks = 80.',
        ],
      },
      {
        componentId: 'paper-2',
        questionFamilyIds: ['paper2-case-study-80'],
        markTotal: 80,
        timingMinutes: 90,
        constraints: ['One compulsory shared case study with approximately seven linked questions totalling 80 marks.'],
      },
    ],
    quantitativeRequirements: ['Include quantitative interpretation and calculation demand in the learning/practice package and generated assessment set.'],
    synopticRequirements: ['Assess connections between functional areas and require contextual business judgement.'],
    commandDemands: [
      { command: 'calculate', cognitiveDemand: 'apply structured quantitative methods accurately', componentScope: ['paper-1', 'paper-2'] },
      { command: 'analyse', cognitiveDemand: 'develop connected contextual chains of reasoning without implying a recommendation unless evaluation is intended', componentScope: ['paper-1', 'paper-2'] },
      { command: 'evaluate', cognitiveDemand: 'weigh evidence and reach a supported contextual judgement', componentScope: ['paper-1', 'paper-2'] },
    ],
    evidenceExpectations: [
      'Questions and Marking Packs must remain Revision-owned and non-exhaustive.',
      'All thirteen non-deferred curriculum requirements must appear across the generated assessment set.',
      'Paper 1 must preserve the MCQ, short-answer and two-stimulus data-response structure.',
      'Paper 2 must preserve one shared case-study context across its complete question set.',
    ],
  })
}

export function createAqaAsBusiness7131LivePilotWorkers(input: {
  openAI: Omit<OpenAIContentFactoryAdapterConfig, 'resolveArtifactRef' | 'questionFamilyPolicies' | 'assessmentItemPolicies'>
  artifactStore: LivePilotArtifactStore
  fetchImpl?: typeof fetch
}): ContentFactoryEndToEndWorkers {
  const fetchImpl = input.fetchImpl ?? fetch
  const ai = createOpenAIModelAssistedWorkers({
    ...input.openAI,
    resolveArtifactRef: (value) => input.artifactStore.findRef(value),
    questionFamilyPolicies: AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES,
    assessmentItemPolicies: AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  })

  return {
    ...ai,
    async planLearningBlueprint(workerInput) {
      return ai.planLearningBlueprint({ ...workerInput, knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes) })
    },
    async generateLearningCollateral(workerInput) {
      return ai.generateLearningCollateral({ ...workerInput, knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes) })
    },
    async generatePracticeCollateral(workerInput) {
      return ai.generatePracticeCollateral({ ...workerInput, knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes) })
    },
    async generateQuestionFamilies(workerInput) {
      const execution = await ai.generateQuestionFamilies({ ...workerInput, knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes) })
      if (execution.status !== 'success') return execution
      return { ...execution, output: normalisePilotQuestionFamilies(execution.output) }
    },
    async generateAssessmentItem(workerInput) {
      const instantiationFamily = pilotInstantiationFamily(workerInput.questionFamily)
      const execution = await ai.generateAssessmentItem({
        ...workerInput,
        questionFamily: instantiationFamily,
        knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes),
      })
      if (execution.status !== 'success') return execution
      const item = assessmentItemWorkerOutputSchema.parse(execution.output)
      const policy = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[item.questionFamilyId]
      const fixedContext = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS[item.questionFamilyId]
      const command = assessmentItemCommandPolicy[item.questionFamilyId] ?? item.command
      if (fixedContext) return { ...execution, output: assessmentItemWorkerOutputSchema.parse({ ...item, command, context: fixedContext }) }
      if (policy && !policy.contextRequired) {
        const { context: _generatedContext, ...withoutContext } = item
        return { ...execution, output: assessmentItemWorkerOutputSchema.parse({ ...withoutContext, command }) }
      }
      return { ...execution, output: assessmentItemWorkerOutputSchema.parse({ ...item, command }) }
    },
    async generateMarkingPack(workerInput) {
      return ai.generateMarkingPack({ ...workerInput, knowledgeNodes: strengthenPilotKnowledgeNodes(workerInput.knowledgeNodes) })
    },
    async resolveIdentity({ jobId }) {
      return deterministicExecution({
        courseIdentity: { subject: 'Business', qualification: 'AS Level', awardingBody: 'AQA', specificationId: '7131' },
        cohortValidity: { status: 'outgoing', lastAssessment: '2026', notes: ['Outgoing specification retained for 2026 examination cohort.'] },
        components: [
          { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
          { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
        ],
        unresolvedChoices: [],
      }, `pilot-identity-${jobId}`)
    },
    async discoverSources({ jobId }) {
      try {
        await preflightAqaAsBusiness7131Sources(fetchImpl)
      } catch (error) {
        return {
          status: 'infrastructure_failure',
          error: error instanceof Error ? error.message : 'live source preflight failed',
          provenance: { id: `pilot-source-${jobId}`, contextId: `deterministic-pilot-source-${jobId}`, contractVersion: '1', provider: 'revision-live-source-preflight' },
        }
      }
      return deterministicExecution([
        { id: 'dfe-business-subject-content', url: AQA_AS_BUSINESS_7131_URLS.dfeSubjectContent, title: 'GCE AS and A level subject content for business', issuer: 'Department for Education', sourceType: 'subject_content', educationalRole: ['permitted common AS Business curriculum truth', 'quantitative skills'], versionOrDate: 'DFE-00358-2014' },
        { id: 'ofqual-business-assessment-objectives', url: AQA_AS_BUSINESS_7131_URLS.ofqualAssessmentObjectives, title: 'GCSE, AS and A level assessment objectives — Business', issuer: 'Ofqual', sourceType: 'assessment_objectives', educationalRole: ['permitted assessment-objective truth'] },
        { id: 'libretexts-business-fundamentals', url: AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness, title: 'Bus 300: Business Fundamentals (Brown)', issuer: 'LibreTexts', sourceType: 'secondary_supplement', educationalRole: ['permitted reusable business subject explanation and cross-checking'], versionOrDate: 'current CC BY 4.0 resource; preflight checked at run time' },
        { id: 'aqa-7131-specification', url: AQA_AS_BUSINESS_7131_URLS.specification, title: 'AQA AS Business 7131 specification', issuer: 'AQA', sourceType: 'specification', educationalRole: ['course identity', 'cohort alignment'] },
        { id: 'aqa-7131-assessment', url: AQA_AS_BUSINESS_7131_URLS.assessment, title: 'AQA AS Business 7131 specification at a glance', issuer: 'AQA', sourceType: 'assessment', educationalRole: ['component and assessment-format alignment'] },
        { id: 'aqa-7131-subject-content', url: AQA_AS_BUSINESS_7131_URLS.subjectContent, title: 'AQA AS Business 7131 subject content', issuer: 'AQA', sourceType: 'subject_content', educationalRole: ['structured section-level curriculum alignment only'] },
      ], `pilot-source-${jobId}`)
    },
    async resolveStructuredEvidence({ jobId }) {
      return deterministicExecution({
        boardAlignmentFacts: [
          { id: 'identity-7131', sourceRef: 'aqa-7131-specification', category: 'course_identity', value: 'AQA AS Business 7131', verificationStatus: 'verified' },
          { id: 'cohort-2026', sourceRef: 'aqa-7131-specification', category: 'cohort', value: 'Outgoing specification continues for cohorts taking examinations in 2026.', verificationStatus: 'verified' },
          { id: 'paper1-fact', sourceRef: 'aqa-7131-assessment', category: 'component', value: 'Paper 1: 90 minutes, 80 marks, 50% of AS, all course content.', verificationStatus: 'verified' },
          { id: 'paper1-section-a', sourceRef: 'aqa-7131-assessment', category: 'assessment_requirement', value: 'Paper 1 Section A has 10 one-mark multiple-choice questions.', verificationStatus: 'verified' },
          { id: 'paper1-section-b', sourceRef: 'aqa-7131-assessment', category: 'assessment_requirement', value: 'Paper 1 Section B has short-answer questions worth approximately 20 marks.', verificationStatus: 'verified' },
          { id: 'paper1-section-c', sourceRef: 'aqa-7131-assessment', category: 'assessment_requirement', value: 'Paper 1 Section C has two data-response stimuli with questions worth approximately 25 marks per stimulus.', verificationStatus: 'verified' },
          { id: 'paper2-fact', sourceRef: 'aqa-7131-assessment', category: 'component', value: 'Paper 2: 90 minutes, 80 marks, 50% of AS, all course content.', verificationStatus: 'verified' },
          { id: 'paper2-case-study', sourceRef: 'aqa-7131-assessment', category: 'assessment_requirement', value: 'Paper 2 is one compulsory case study with approximately seven questions.', verificationStatus: 'verified' },
          { id: 'ao-source', sourceRef: 'ofqual-business-assessment-objectives', category: 'assessment_objective', value: 'AS Business uses AO1 knowledge, AO2 application, AO3 analysis and AO4 evaluation.', verificationStatus: 'verified' },
          { id: 'quantitative-source', sourceRef: 'dfe-business-subject-content', category: 'quantitative_requirement', value: 'Quantitative skills form at least 10% of overall AS marks.', verificationStatus: 'verified' },
        ],
        curriculumRequirements: pilotRequirements,
      }, `pilot-evidence-${jobId}`)
    },
    async compileBoardAlignment({ jobId }) {
      return deterministicExecution(await buildBoardAlignment(jobId), `pilot-board-alignment-${jobId}`)
    },
    async compileCoverage({ jobId, sourceLicenceRegister, requirements }) {
      const coverage = coverageMapSchema.parse({
        schemaVersion: 1,
        jobId,
        sourceSetFingerprint: sourceLicenceRegister.fingerprint,
        requirements: requirements.map((requirement) => ({
          requirementId: requirement.requirementId,
          officialReference: officialReferences[requirement.requirementId] ?? 'AQA 7131 structured alignment reference only',
          requirementSummary: requirement.summary,
          skillsOrKnowledge: requirement.skillsOrKnowledge,
          componentScope: requirement.componentScope,
          revisionArea: requirement.revisionArea,
          learnRequired: requirement.learnRequired,
          practiceRequired: requirement.practiceRequired,
          examPrepRequired: requirement.examPrepRequired,
          coverageStatus: 'planned',
          contentRefs: [],
          sourceRefs: requirement.sourceRefs,
        })),
      })
      return deterministicExecution(coverage, `pilot-coverage-${jobId}`)
    },
    async compileAssessmentBlueprint({ jobId, components }) {
      if (components.length !== 2 || !components.some((component) => component.id === 'paper-1') || !components.some((component) => component.id === 'paper-2')) {
        return {
          status: 'failure',
          error: 'AQA AS Business live pilot expected exact Paper 1 and Paper 2 component structure',
          provenance: { id: `pilot-assessment-blueprint-${jobId}`, contextId: `deterministic-pilot-assessment-blueprint-${jobId}`, contractVersion: '1', provider: 'revision-deterministic' },
        }
      }
      const boardAlignmentFingerprint = await fingerprintValue({ jobId, profile: 'aqa-as-business-7131-2026-v2' })
      return deterministicExecution(await buildAssessmentBlueprint(jobId, boardAlignmentFingerprint), `pilot-assessment-blueprint-${jobId}`)
    },
  }
}

export async function runAqaAsBusiness7131LivePilot(input: {
  jobId: string
  contentHeadSha: string
  now: string
  openAI: Omit<OpenAIContentFactoryAdapterConfig, 'resolveArtifactRef' | 'questionFamilyPolicies' | 'assessmentItemPolicies'>
  artifactStore?: LivePilotArtifactStore
  fetchImpl?: typeof fetch
}): Promise<{ job: ContentFactoryJob; report: ContentFactoryEndToEndProofReport; package?: ExpertReviewPackage; artifactStore: LivePilotArtifactStore }> {
  const artifactStore = input.artifactStore ?? new LivePilotArtifactStore()
  const job = createRequestedJob({
    jobId: input.jobId,
    officialUrls: [AQA_AS_BUSINESS_7131_URLS.specification],
    founderInstruction: 'Run the governed rights-safe live adapter pilot for AQA AS Business 7131, 2026 examination cohort, through expert_review_ready without publishing learner content.',
    createdAt: input.now,
    schemaVersion: 2,
  })
  const result = await continueContentFactoryToExpertReviewReady({
    job,
    workers: createAqaAsBusiness7131LivePilotWorkers({ openAI: input.openAI, artifactStore, fetchImpl: input.fetchImpl }),
    artifactStore,
    sourceRightsRules: AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
    versionPersister: { async persist() { throw new Error('Live pilot does not fabricate remediation commits; a material independent-review finding must reopen governed repository remediation.') } },
    contentHeadSha: input.contentHeadSha,
    now: input.now,
    proofMode: 'live_adapter',
    maxRemediationCycles: 0,
    limitations: [
      'Live pilot is an internal Content Factory proof and does not publish learner content.',
      'AQA sources remain REFERENCE_ONLY; generative workers receive only controlled structured alignment facts, never AQA source prose.',
      'The secondary CC BY source is admitted only after live licence/terms preflight and only manually curated structured facts are passed downstream.',
    ],
  })
  return { ...result, artifactStore }
}
