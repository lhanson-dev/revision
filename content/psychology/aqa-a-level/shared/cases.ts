import { caseStudySchema } from '../../../schema'

/**
 * LF-04: source-grounded, Revision-original untimed application warm-ups.
 * Each case is explicitly paired with its own topic and guided questions.
 * They are not exam questions, have no authored mark tariff and must not be
 * treated as independently assessed skill or readiness evidence.
 */
export const psychologyCaseStudies = [
  caseStudySchema.parse({
    id: 'psy-social-influence-supervisor-case',
    topicIds: ['social-influence'],
    title: 'Instructions at a training centre',
    bodyHtml: 'During a training exercise, an employee is told by a senior supervisor wearing an official staff badge to continue a task after a colleague says it is uncomfortable. The employee pauses, looks at the supervisor and then continues. Other employees nearby can see the exchange. The supervisor has formal authority over the training exercise, but the employee has not explained their decision.',
    facts: [
      'Supervisor has an official role',
      'Colleague objects to the task',
      'Employee hesitates but continues',
      'Other employees are present',
      'Reason for compliance is not known',
    ],
    questions: [
      {
        id: 'psy-social-influence-supervisor-q1',
        prompt: 'Explain how legitimacy of authority could help explain the employee’s behaviour. Use two details from the case.',
        guidance: 'A recognised supervisor has a formal position and visible badge, which may make the instruction appear legitimate. The employee continues after looking to the supervisor despite hesitating. These observations are consistent with obedience to authority; they do not prove an agentic state or establish the employee’s private reasoning.',
      },
      {
        id: 'psy-social-influence-supervisor-q2',
        prompt: 'Give one alternative explanation for the behaviour and say what extra information would help distinguish it.',
        guidance: 'For example, the employee may expect social approval from colleagues or fear a poor evaluation. Asking about perceived consequences, or comparing responses when a supervisor rather than a peer gives the instruction, could help distinguish explanations. Other employees are present but their behaviour is not described, so peer-following has not been observed. Do not infer a unique cause from one observation.',
      },
    ],
  }),
  caseStudySchema.parse({
    id: 'psy-memory-dual-task-case',
    topicIds: ['memory'],
    title: 'Two tasks at once',
    bodyHtml: 'Students are asked to remember a short spoken number while following a route on a simple map. Recall becomes noticeably harder when another spoken message is played at the same time. Following the map is more disrupted when an additional visual pattern must be tracked than when the spoken message is played.',
    facts: [
      'Spoken-number recall',
      'Map-route following',
      'Additional speech reduces verbal recall',
      'Additional visual pattern disrupts route tracking',
    ],
    questions: [
      {
        id: 'psy-memory-dual-task-q1',
        prompt: 'Apply the working memory model to explain why the two additional tasks have different effects.',
        guidance: 'The phonological loop is associated with temporary verbal/auditory information, so concurrent speech can compete with retaining the spoken number. The visuospatial sketchpad supports visual/spatial material, so tracking an extra visual pattern can interfere with route tracking. Use the two different interference patterns from the case.',
      },
      {
        id: 'psy-memory-dual-task-q2',
        prompt: 'Explain one limit of drawing conclusions about memory components from this observation.',
        guidance: 'This is consistent with partly separable verbal and visuospatial working-memory processes, but it is not a decisive test on its own: task difficulty, attention and how students respond could contribute. A controlled comparison needs equivalent difficulty, clear operationalised measures and counterbalancing where appropriate.',
      },
    ],
  }),
  caseStudySchema.parse({
    id: 'psy-attachment-caregiver-case',
    topicIds: ['attachment'],
    title: 'A child in an unfamiliar nursery',
    bodyHtml: 'A toddler explores unfamiliar toys while a familiar caregiver stays nearby. When the caregiver moves out of the room, the toddler becomes distressed and pauses playing. After the caregiver returns, the toddler approaches them, settles and then starts exploring again. The observation covers only one short visit.',
    facts: [
      'Child explores with caregiver nearby',
      'Distress follows caregiver leaving',
      'Child approaches caregiver at reunion',
      'Exploration resumes',
      'Only one brief observation',
    ],
    questions: [
      {
        id: 'psy-attachment-caregiver-q1',
        prompt: 'Use the case to explain how the familiar caregiver might act as a secure base.',
        guidance: 'The caregiver’s presence is associated with confident exploration; after reunion, the toddler approaches them and resumes exploring. This is consistent with secure-base and proximity-seeking behaviour described in attachment theories. Explain the observed links rather than assuming motives.',
      },
      {
        id: 'psy-attachment-caregiver-q2',
        prompt: 'Why is it unsafe to assign a definitive attachment classification from this account?',
        guidance: 'One brief narrative lacks the full controlled observation, behavioural coding and comparison needed for a reliable classification. Distress at separation alone does not establish an attachment type; alternative explanations include familiarity, tiredness and the novel setting.',
      },
    ],
  }),
  caseStudySchema.parse({
    id: 'psy-clinical-ocd-case',
    topicIds: ['clinical-psychology-and-mental-health'],
    title: 'Intrusive thoughts and repeated washing',
    bodyHtml: 'A student reports distressing, unwanted thoughts that they may have touched something contaminated. They spend long periods washing their hands to reduce the anxiety. The student says that they know the washing is excessive but find it difficult to stop, and their routines are interfering with college attendance. This is a fictional learning case, not a clinical assessment.',
    facts: [
      'Unwanted contamination-related thoughts',
      'Anxiety and repeated washing',
      'Student recognises the washing is excessive',
      'Daily functioning is disrupted',
    ],
    questions: [
      {
        id: 'psy-clinical-ocd-q1',
        prompt: 'Identify an example of a cognitive, an emotional and a behavioural characteristic shown in the case.',
        guidance: 'Cognitive: unwanted intrusive contamination thoughts. Emotional: anxiety or distress. Behavioural: repeated hand-washing. These are characteristics consistent with OCD, not enough information for a real diagnosis.',
      },
      {
        id: 'psy-clinical-ocd-q2',
        prompt: 'Give one operational definition that would make a study of the washing behaviour more repeatable.',
        guidance: 'For example, record the number of separate hand-washing episodes during a defined observation period, using a clear rule for when an episode starts and ends. Explain how this improves repeatability; it does not establish that episode count alone measures the full disorder.',
      },
    ],
  }),
  caseStudySchema.parse({
    id: 'psy-research-methods-memory-cues-case',
    topicIds: ['research-methods'],
    title: 'Comparing two revision cues',
    bodyHtml: 'A researcher recruits 24 student volunteers to compare memory for a list of ten words. Twelve students choose to revise with a picture beside each word and twelve choose to hear each word spoken. All are tested after the same delay by writing down as many words as they remember. The researcher records each participant’s number of correct words out of ten.',
    facts: [
      'Twenty-four volunteers',
      'Students choose their own cue type',
      'Picture versus spoken-word conditions',
      'Same ten-word list and delay',
      'Outcome is correct recall out of ten',
    ],
    questions: [
      {
        id: 'psy-research-methods-memory-cues-q1',
        prompt: 'Identify the independent and dependent variables, including an operational definition of the dependent variable.',
        guidance: 'The independent variable is cue condition (picture beside a word or spoken word). The dependent variable is the count of correctly recalled words from the ten-word list after the fixed delay, scored from 0 to 10. Do not mistake the number of volunteers for a variable.',
      },
      {
        id: 'psy-research-methods-memory-cues-q2',
        prompt: 'Explain one reason why these results would not by themselves prove that the cue type caused any difference.',
        guidance: 'Students selected their own condition, so pre-existing group differences could influence recall. Random allocation or matching participants on relevant characteristics could help. Volunteers may also limit generalisability beyond this sample.',
      },
    ],
  }),
]
