/**
 * Issue #698 — bounded, ORIGINAL AQA 7182 v1.4 §4.1.1 Social Influence
 * application/evaluation Practice for the existing canonical /revision/app/.
 *
 * Source: exact Founder PDF, printed p17, SHA-256
 * db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d.
 * AQA content rights REFERENCE_ONLY; no official exam questions or marks copied.
 *
 * A correctly selected option is evidence of ONE scenario decision on ONE
 * provisional source skill, not an independently written AO2/AO3 response,
 * mastery, complete study-method competence or a qualified examiner award.
 * Written drills are answer-revealed/self-checked, NEVER software-marked.
 * Fresh-context independent A3 review is required before publication.
 */
import { dataDrillSchema } from '../../../schema'
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

const originalCases = [
  {
    id: 'si-unanimity-ally-01', target: 'SI06', page: 'psy0101', ao: 'AO2',
    context: 'A pupil sees five classmates publicly choose the same incorrect answer to an unambiguous perception task. In a second round the same five classmates remain, but one openly disagrees with the other four. The task and number of classmates do not change.',
    stem: 'Which explanation best predicts why the pupil may now give an independent answer?',
    options: [
      'The task became easier, removing informational uncertainty.',
      'The dissent breaks unanimity and can reduce the pressure to agree publicly with the majority.',
      'There are fewer classmates present, so group size must be the cause.',
      'The pupil has necessarily internalised the original majority answer.',
    ],
    key: 1,
    rationales: [
      'Task difficulty was held constant; the distinctive change is disagreement within the majority.',
      'Correct. A dissenting ally changes unanimity without changing group size or task difficulty; normative pressure may decrease.',
      'The same five classmates are present in both rounds; group size has not been manipulated.',
      'A change in a public response does not prove that any belief was privately internalised.',
    ],
  },
  {
    id: 'si-task-difficulty-01', target: 'SI07', page: 'psy0101', ao: 'AO2',
    context: 'A student compares faint pairs of lines. The majority gives a unanimous answer in every round. In later rounds the lines become much harder to distinguish, while the group remains identical.',
    stem: 'Which prediction and mechanism best fit this change?',
    options: [
      'Conformity might rise because uncertainty makes others seem informative, although it will not happen for everyone.',
      'Conformity must fall because the number of majority members has decreased.',
      'Conformity must rise because the student can no longer experience normative influence.',
      'There is no possible influence because the majority did not change membership.',
    ],
    key: 0,
    rationales: [
      'Correct. Increased ambiguity can make informational social influence more plausible; the result is a tendency, not a guarantee.',
      'The majority size is unchanged, so this is not a group-size manipulation.',
      'Normative influence does not disappear simply because the task becomes harder.',
      'Task difficulty can affect confidence and informational influence even if group membership remains the same.',
    ],
  },
  {
    id: 'si-milgram-location-01', target: 'SI13', page: 'psy0102', ao: 'AO2',
    context: 'Two versions of an original authority study use equivalent instructions, clothing, participant roles and distances. One is conducted in a respected university; the other takes place in an ordinary office building.',
    stem: 'Which interpretation most accurately connects the changed condition to Milgram-style evidence?',
    options: [
      'It tests proximity because the learner is necessarily placed closer to the participant.',
      'It tests a personality change created by the building, which proves the cause of obedience.',
      'It tests location and possible institutional legitimacy; an average difference would not prove each individual’s motive.',
      'It isolates uniform because the building determines the experimenter’s clothing.',
    ],
    key: 2,
    rationales: [
      'Learner and experimenter distances have been held constant; the setting changes.',
      'A location comparison cannot demonstrate a change of enduring personality or every individual’s reason for obeying.',
      'Correct. This changes institutional location while other named factors are held constant; legitimacy is one cautious explanation.',
      'Clothing is held constant, so uniform is not the variable being manipulated.',
    ],
  },
  {
    id: 'si-uniform-evidence-01', target: 'SI14', page: 'psy0102', ao: 'AO3',
    context: 'In an original street scenario, adults are more likely to follow a simple request from a person dressed as a uniformed guard than from someone in ordinary clothes. A researcher claims this proves that Milgram experimentally isolated lab-coat fabric as the sole cause of obedience.',
    stem: 'Which evaluation is best supported?',
    options: [
      'The claim is justified: all uniform and Milgram experiments are the same research.',
      'The finding can suggest an authority-role cue, but guard attire and its implied social role are not the same as an isolated Milgram lab-coat effect.',
      'The result proves personality explains all obedience.',
      'The result cannot say anything relevant because a street setting has no social influence.',
    ],
    key: 1,
    rationales: [
      'Bickman-style uniform field evidence and Milgram obedience conditions are distinct; neither demonstrates a pure fabric effect.',
      'Correct. Uniform may signal role and legitimate authority; do not conflate a guard-versus-civilian field manipulation with Milgram’s different conditions.',
      'No personality trait was measured or independently manipulated in the scenario.',
      'The street setting can be informative, but its context and request stakes limit generalisation.',
    ],
  },
  {
    id: 'si-fscale-causality-01', target: 'SI15', page: 'psy0102', ao: 'AO3',
    context: 'In a sixth-form survey, participants scoring highly on an authoritarian-attitudes questionnaire also report more willingness to follow instructions. Most questionnaire items are worded so agreement yields a higher score.',
    stem: 'What is the most defensible conclusion about Authoritarian Personality?',
    options: [
      'The correlation proves strict parenting caused obedience in every participant.',
      'The questionnaire directly observed participants’ behaviour under authority.',
      'The correlation proves that the situation and authority cues cannot matter.',
      'The association is relevant but cannot establish causation; agreement-response bias is a plausible measurement weakness.',
    ],
    key: 3,
    rationales: [
      'Questionnaire correlation does not establish the proposed parenting cause, especially for each individual.',
      'Self-report willingness is not the same as observing real acts of obedience.',
      'Situational and dispositional explanations may both contribute; a survey does not exclude situational effects.',
      'Correct. Correlation is not proof of cause, and an agree-weighted F-scale-like instrument can inflate scores through acquiescence.',
    ],
  },
  {
    id: 'si-disobedient-peers-01', target: 'SI17', page: 'psy0103', ao: 'AO2',
    context: 'A volunteer initially follows a supervisor’s increasingly uncomfortable instructions. Two other volunteers openly refuse the same instruction. The first volunteer then refuses as well; no locus-of-control measure was taken.',
    stem: 'Which explanation most directly uses the observed change?',
    options: [
      'The refusing peers provide social support and show that disobedience is possible.',
      'The first volunteer must have an internal locus of control, now proved by the refusal.',
      'The supervisor lost all legitimate authority because the building changed.',
      'The first volunteer adopted the others’ private beliefs by internalisation.',
    ],
    key: 0,
    rationales: [
      'Correct. Disobedient models give a directly observed social-support cue against obedience.',
      'Locus of control was not measured and cannot be inferred as a proven trait from one refusal.',
      'The setting and supervisor did not change; social support is the observed difference.',
      'One public act does not reveal a change of private belief.',
    ],
  },
  {
    id: 'si-locus-correlation-01', target: 'SI18', page: 'psy0103', ao: 'AO3',
    context: 'A researcher reports that students with more internal locus-of-control questionnaire scores more often refuse peer pressure. The study is observational, and the students belong to different friendship groups.',
    stem: 'Which evaluation best addresses what this study cannot establish?',
    options: [
      'It proves internal locus of control is an inherited cause of refusal.',
      'It proves that social support never matters when people resist conformity.',
      'It identifies an association but cannot rule out friendship-group support or prove locus of control caused the resistance.',
      'It proves the results apply identically to obedience to authority and to all cultures.',
    ],
    key: 2,
    rationales: [
      'Inheritance and causation were not established by this observational questionnaire comparison.',
      'The scenario does not exclude support from friends; it is one possible confound.',
      'Correct. An observational link is not causal and friendship-group differences provide a plausible alternative.',
      'One study cannot warrant universal generalisation or conflate conformity and obedience conditions.',
    ],
  },
  {
    id: 'si-minority-flexibility-01', target: 'SI21', page: 'psy0104', ao: 'AO2',
    context: 'A small group consistently advocates a safer laboratory routine at several meetings. After colleagues raise a legitimate timing problem, the group keeps the central safety requirement but changes the proposed order of two steps.',
    stem: 'Which minority-influence factor is most clearly demonstrated by the group’s response to the objection?',
    options: [
      'Unanimous majority pressure, because the whole organisation already agrees.',
      'Commitment only, because the group must be making a personal sacrifice.',
      'Synchronic consistency only, because the group has changed the practical steps.',
      'Flexibility: the group accommodates a reasonable objection without abandoning its central position.',
    ],
    key: 3,
    rationales: [
      'The scenario describes a minority proposal rather than demonstrated unanimous majority agreement.',
      'There is no stated personal sacrifice or cost that would specifically demonstrate commitment.',
      'Consistent core advocacy is present, but the question singles out the response to a reasonable objection.',
      'Correct. Adaptation of negotiable details while keeping the core case demonstrates flexibility rather than rigidity.',
    ],
  },
] as const

export const psychologySocialInfluenceScoredCaseContracts = originalCases

export const psychologySocialInfluenceAppliedPracticeBank = originalCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    batch: '4.1.1',
    namespace: 'rev7182',
    label: 'Original Social Influence single-decision scenario check',
    confidence_label: 'Source-targeted pilot; separate fresh A3 educational review required',
    topic_id: 'social-influence',
    // One provisional source-to-skill observation, not an official AQA atomic mark.
    target_item_ids: [`PSY-SRC-411-${item.target}`],
    target_node_ids: [`social-influence-${item.page}`],
    question: {
      id: item.id,
      family: 'MCQ',
      command_word: 'Select',
      marks: 1,
      ao_tags: [item.ao],
      context: item.context,
      stem: item.stem,
      table: null,
      options: item.options.map((text, i) => ({ label: 'ABCD'[i], text })),
      calcs: [],
      mark_scheme: {
        type: 'single_option',
        correct_option: 'ABCD'[item.key],
        option_rationale: [...item.rationales],
        points: [], levels: [], indicative_content: [],
        model_answer: item.rationales[item.key],
      },
    },
  }),
)

/** On-paper, learner-revealed model responses. NOT automatic AO2/AO3 marks. */
export const psychologySocialInfluenceWrittenDrills = [
  dataDrillSchema.parse({
    id: 'psy-si-asch-apply-evaluate-01',
    topic: 'social-influence',
    title: 'Apply and evaluate Asch: a dissenting voice',
    prompt: 'Write an original short response before revealing the answer. In a student committee, six members publicly reject an obviously correct proposal. One member then openly supports it and another member becomes willing to disagree. Explain (1) the precise majority factor that changed, (2) a plausible social-influence mechanism, and (3) one reason why Asch’s laboratory findings cannot predict every real committee vote. This is SELF-CHECKED; no independently marked written score is produced.',
    answer: 'Self-check three distinct elements: (1) Unanimity was broken when one of the six publicly dissented; the original number of people remained six. (2) Social support reduces pressure to stand alone, a plausible reduction in normative pressure; one public choice does not prove a private belief change. (3) Asch’s simplified controlled line-judgement research differs from a real committee with personal stakes, relationships and history, so the exact rate is not transferable. A strong response explicitly links the scenario cue to each explanation, not merely names Asch. This model is guidance, not an examiner-assigned mark.',
  }),
  dataDrillSchema.parse({
    id: 'psy-si-obedience-apply-evaluate-01',
    topic: 'social-influence',
    title: 'Compare obedience explanations and evidence',
    prompt: 'Write two developed paragraphs before revealing the answer. A volunteer follows a senior researcher’s instruction in a well-known university, but another volunteer in an ordinary office questions the same instruction. A third person says they followed instructions because the researcher would take responsibility. Explain how location, legitimacy and agentic state differ. Then evaluate why neither this comparison nor a high F-scale questionnaire score proves a single cause of obedience. SELF-CHECKED only; no written mark is awarded.',
    answer: 'Self-check: (1) Location changes the institution (university versus office); perceived legitimacy might vary with it, but the scenario alone cannot establish the person’s motive. (2) Agentic state concerns perceived transfer of responsibility to the authority; it is conceptually different from granting that authority a right to instruct. (3) The individuals could differ before the situation; the two cases alone cannot isolate location causally. (4) A high Authoritarian Personality/F-scale score is self-report and may reflect agreement-response bias; correlational scores do not show a personality trait caused one obedient act. For research support, distinguish the Milgram location conditions from separate uniform field evidence. This is a self-check rubric, not an objective score.',
  }),
  dataDrillSchema.parse({
    id: 'psy-si-resistance-apply-evaluate-01',
    topic: 'social-influence',
    title: 'Explain resistance with social support and locus',
    prompt: 'Without viewing the answer, compare two cases in writing: (A) an unsure student sees one peer refuse to copy a unanimous answer; (B) a participant sees two peers refuse instructions from an authority. Explain how support works in each. Then evaluate why internal locus-of-control questionnaires do not prove who will resist. SELF-CHECKED, not automatically marked.',
    answer: 'Self-check: (1) In A, a dissenter breaks apparent majority unanimity and can reduce normative conformity pressure. (2) In B, disobedient role models show authority can be challenged, as in Milgram’s peer-rebellion condition; these are different contexts. (3) An internal locus of control describes expecting personal actions to influence outcomes, not guaranteed independence. (4) Correlations between locus scores and resistance cannot prove cause, and differing social support or setting could explain the observed behaviour. Developed answers should use the exact cue rather than list unrelated definitions; the revealed model is not an externally graded response.',
  }),
  dataDrillSchema.parse({
    id: 'psy-si-minority-apply-evaluate-01',
    topic: 'social-influence',
    title: 'Analyse how a consistent minority can persuade',
    prompt: 'On paper, a small science club proposes a school waste-reduction change across several months. The members agree on a common goal, spend their own time trialling it, and modify the collection schedule after a credible objection. Identify and apply diachronic/synchronic consistency, commitment and flexibility. Evaluate why this does not guarantee conversion of the majority. SELF-CHECKED only.',
    answer: 'Self-check: (1) Diachronic consistency = repeating the core position over months; synchronic consistency = members agreeing with each other. (2) Commitment = giving up their own time to trial the idea, a possible costly signal of sincerity; it is not merely repeating words. (3) Flexibility = revising the schedule while keeping the core waste-reduction objective. (4) Minority influence can prompt closer consideration, but rigidity, weak evidence and wider social conditions can limit it. Moscovici’s artificial blue/green-slide procedure offers bounded evidence for consistency, not proof that every real policy minority will win. This is guidance, not marks or demonstrated mastery.',
  }),
]

/** Metadata only: no false automation of the four written prompts or per-atom AO3 mastery. */
export const psychologySocialInfluencePracticeCandidateBindings = Object.fromEntries([
  ...psychologySocialInfluenceAppliedPracticeBank.map((item) => [
    `${item.namespace}-${item.batch}-${item.id}`,
    { kind: 'single-option-objective', targets: item.target_item_ids },
  ]),
  ...psychologySocialInfluenceWrittenDrills.map((item, i) => [
    item.id,
    { kind: 'self-check-no-mark', targets: ['PSY-7182-411-B0' + (i + 1)] },
  ]),
])
