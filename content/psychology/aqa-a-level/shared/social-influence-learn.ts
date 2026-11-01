/**
 * #698 AQA 7182 v1.4, Section 4.1.1, printed page 17.
 *
 * Original, bounded LEARN enrichment for the existing four Social Influence
 * pages. Source PDF is REFERENCE_ONLY: no AQA passages or official items copied.
 * Wider source mapping is independently maintained in the #767 crosswalk.
 *
 * A2 editorial candidates; they do not establish independent student mastery
 * or per-skill marking. Independent fresh-context educational review is required
 * before these additions can be published.
 */
type OriginalLearnExplanation = {
  type: 'explanation'
  heading: string
  paragraphs: string[]
}

export const psychologySocialInfluenceLearnAdditions: Record<string, OriginalLearnExplanation[]> = {
  'PSY-01-01': [
    {
      type: 'explanation',
      heading: 'Asch: what was investigated and why it matters',
      paragraphs: [
        'In Asch’s line-judgement research, a participant gave an answer aloud after hearing several people working with the researcher give the same clearly incorrect answer. The participant had to choose a line matching a comparison line. The situation isolated the pressure of an apparently unanimous majority: the participant could see the answer but might still agree publicly with the group.',
        'The variables are not interchangeable. Group size concerns how many people give the majority judgement; influence does not necessarily rise forever with each added person. Unanimity concerns whether all majority members agree: one dissenter can reduce pressure. Task difficulty concerns how certain the correct answer seems; uncertainty can increase the relevance of informational influence.',
        'When a student copies an obviously mistaken majority response to avoid rejection, normative influence and outward compliance are plausible. When an uncertain student believes the group has better information, informational influence is plausible; private acceptance may become internalisation. A public answer alone does not prove a private belief change.',
      ],
    },
    {
      type: 'explanation',
      heading: 'Using and evaluating the conformity evidence',
      paragraphs: [
        'In an unfamiliar example, identify the precise change made to the majority, the presence of an ally or the task ambiguity, then explain why that change would affect conformity. Do not merely name Asch without linking the procedure to the prediction.',
        'The artificial line task helps control alternative explanations but may not represent every real social judgement. Cultural, historical and individual differences matter, so treat the observed tendency as evidence of social influence in a particular setting rather than a universal rate of conformity.',
      ],
    },
  ],
  'PSY-01-02': [
    {
      type: 'explanation',
      heading: 'Milgram: separate the obedience variations',
      paragraphs: [
        'Milgram’s original obedience procedure involved a participant acting as a teacher who was directed by an experimenter to administer escalating apparent electric shocks to a learner after incorrect answers. The learner was not actually harmed by real shocks. The conflict was between the experimenter’s instructions and the participant’s distress about the learner.',
        'Proximity changes physical or psychological distance. In variations where the learner was brought nearer to the teacher, or the experimenter issued instructions from farther away, obedience tended to decline. This is different from a change of location.',
        'Location changes the perceived legitimacy of the setting. When the procedure moved from a prestigious university to an ordinary office building, obedience decreased. The comparison suggests that institutional prestige can increase the perceived authority of instructions, but location by itself does not prove why each participant acted as they did.',
        'Uniform is a separate visible cue to authority. A lab coat or other role-associated clothing can make an instruction appear more legitimate; a clothing cue should not be mistaken for an absolute cause of obedience. Distinguish a uniform manipulation from changing distance or the building.',
      ],
    },
    {
      type: 'explanation',
      heading: 'The Authoritarian Personality: a dispositional account',
      paragraphs: [
        'The Authoritarian Personality account, associated with Adorno and colleagues, proposes that some individuals have a relatively rigid respect for established authority and conventional rules, alongside hostility towards people judged to challenge those rules. It is a dispositional explanation because it concerns the person’s attitudes rather than a feature of the immediate setting.',
        'The F-scale was developed to measure authoritarian attitudes. A link between such scores and obedience would be correlational: it does not establish that a personality trait caused compliance, nor that everyone with the trait will obey. Milgram’s situational variations also show that changes in the context can affect obedience without changing a participant’s personality.',
        'For an exam scenario, explain whether evidence points to an agentic state, legitimate authority, a specific situational variable or an authoritarian disposition. Develop the mechanism and a limitation instead of treating all explanations as interchangeable.',
      ],
    },
  ],
  'PSY-01-03': [
    {
      type: 'explanation',
      heading: 'Resistance to both conformity and obedience',
      paragraphs: [
        'Social support can weaken conformity when someone else disagrees with the majority, breaking its apparent unanimity. It can also weaken obedience when another person refuses an authority’s instruction: observing defiance provides a model and can make resistance feel possible. An ally need not give the objectively correct answer for breaking unanimity to matter.',
        'An internal locus of control is a greater tendency to see outcomes as influenced by one’s own actions; an external locus of control places more weight on luck, fate or powerful others. Internal control can be associated with resisting social pressure, but it is not immunity from conformity or obedience.',
        'For an unseen scenario, distinguish a support mechanism (the presence of a dissenter or disobedient model) from a dispositional explanation (the individual’s locus of control), then explain which detail in the scenario provides evidence. Neither mechanism guarantees resistance.',
      ],
    },
  ],
  'PSY-01-04': [
    {
      type: 'explanation',
      heading: 'How minority influence can change a majority',
      paragraphs: [
        'Consistency gives a minority position continuity, both across time and among the people expressing it. Commitment makes the position appear sincerely held, sometimes because its supporters are prepared to invest effort or accept a cost. Flexibility means listening and adapting reasonable details without abandoning the core argument.',
        'Imagine a small group proposing a safer laboratory routine. Repeating a clear evidence-based case shows consistency; volunteering to trial the routine shows commitment; revising one step in response to colleagues’ objections shows flexibility. These are different mechanisms, not three names for persistence.',
        'A minority can lose influence if consistency becomes inflexible repetition, while too much compromise can obscure the original case. In an evaluation, link the predicted influence to the particular majority response rather than claiming that every committed minority will succeed.',
      ],
    },
  ],
}
