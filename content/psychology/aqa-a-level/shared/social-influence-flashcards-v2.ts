import { flashcardSchema } from '../../../schema'

const topic = 'social-influence'

/** LF-06 original short retrieval prompts. Never reassign historic generic-card ratings. */
export const socialInfluenceAtomicCardsByRequirement: Record<string, Array<ReturnType<typeof flashcardSchema.parse>>> = {
  'PSY-01-01': [
    flashcardSchema.parse({
      id: 'psy-psy0101-conformity-card-v2', topic,
      prompt: 'What does conformity mean in social psychology?',
      answer: 'Changing behaviour or expressed judgement in response to actual or perceived group pressure.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0101-compliance-card-v2', topic,
      prompt: 'How is compliance different from private agreement?',
      answer: 'Compliance is an outward change to meet a request or social pressure; the person need not privately accept the group view.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0101-internalisation-card-v2', topic,
      prompt: 'What is internalisation in conformity?',
      answer: 'A person accepts a view or norm as their own, rather than merely appearing to agree because of external pressure.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0101-normative-influence-card-v2', topic,
      prompt: 'Why might normative social influence cause conformity?',
      answer: 'Someone may conform to gain approval or avoid social rejection, even without believing the majority is right.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0101-informational-influence-card-v2', topic,
      prompt: 'When can informational social influence increase conformity?',
      answer: 'When someone is unsure what is correct, they may use other people’s judgements as evidence, especially in ambiguous tasks.',
    }),
  ],
  'PSY-01-02': [
    flashcardSchema.parse({
      id: 'psy-psy0102-obedience-card-v2', topic,
      prompt: 'What is obedience?',
      answer: 'Following a direct instruction from someone perceived to have authority.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0102-agentic-card-v2', topic,
      prompt: 'What does the agentic-state explanation propose?',
      answer: 'A person may see themselves as acting for an authority and experience reduced personal responsibility for following its instruction.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0102-legitimacy-card-v2', topic,
      prompt: 'What does legitimacy of authority mean?',
      answer: 'The authority is regarded as properly entitled to give instructions. Role and setting can influence that perception.',
    }),
  ],
  'PSY-01-03': [
    flashcardSchema.parse({
      id: 'psy-psy0103-social-support-card-v2', topic,
      prompt: 'How can a dissenter reduce conformity?',
      answer: 'Someone resisting the majority breaks unanimity and can make it easier for another person to disagree.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0103-locus-card-v2', topic,
      prompt: 'What is an internal locus of control?',
      answer: 'A tendency to see outcomes as influenced by one’s own actions rather than mainly by outside forces. It is an association with resistance, not a guarantee.',
    }),
  ],
  'PSY-01-04': [
    flashcardSchema.parse({
      id: 'psy-psy0104-consistency-card-v2', topic,
      prompt: 'Why can consistency help a minority influence a majority?',
      answer: 'Maintaining a clear, stable position can make the minority appear confident and encourage others to reconsider it.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0104-commitment-card-v2', topic,
      prompt: 'What does commitment signal in minority influence?',
      answer: 'Visible investment or persistence can suggest the minority genuinely holds its position rather than taking it opportunistically.',
    }),
    flashcardSchema.parse({
      id: 'psy-psy0104-flexibility-card-v2', topic,
      prompt: 'Why can flexibility strengthen minority influence?',
      answer: 'Willingness to consider evidence and adapt reasonably can avoid rigidity while retaining a coherent minority position.',
    }),
  ],
}

export const socialInfluenceAtomicCards = Object.values(socialInfluenceAtomicCardsByRequirement).flat()
