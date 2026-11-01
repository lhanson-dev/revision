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
        'In Asch’s classic line-judgement arrangement, one genuine participant sat with several people who were working with the researcher. They compared a standard line with three comparison lines and answered aloud, with the genuine participant speaking after the others. On 12 critical trials within an 18-trial sequence, the confederates deliberately agreed on a clearly incorrect answer; other trials did not carry that unanimous error. In Asch’s reported sample of 123 participants, incorrect agreement with the majority occurred on about 36.8% of these critical judgements, compared with fewer than 1% errors when people made comparable judgements without that pressure. This is a percentage of judgements, not a claim that 36.8% of people always conformed; around one quarter did not yield on any critical trial.',
        'Three changes to Asch-style conformity must be separated. Group size is the number of people opposing the genuine participant: Asch reported roughly 3.6% incorrect agreement with one opponent, 13.6% with two and 31.8% with three, with relatively little extra effect from adding further opponents in that series. Unanimity is agreement within the majority: introducing another person who disagrees with the mistaken majority can substantially reduce conformity; a dissenter makes standing apart less socially isolating, but the exact effect depends on the partner and task. Task difficulty is uncertainty in the judgement: closer or less distinguishable line lengths make a correct answer less obvious and can increase reliance on what others appear to know. Keep a change in what was manipulated separate from a proposed psychological explanation.',
        'Normative social influence means going along with a group to gain acceptance or avoid rejection; an openly incorrect line judgement may reflect outward compliance without changed private belief. Informational social influence means accepting a group as useful evidence when uncertain; it could contribute to internalisation if a person genuinely adopts the judgement. Asch’s public-answer behaviour by itself cannot establish which motive operated or whether participants changed their private belief. Apply motive labels as cautious explanations, not results measured directly by one public answer.',
      ],
    },
    {
      type: 'explanation',
      heading: 'Using and evaluating the conformity evidence',
      paragraphs: [
        'Worked application: a student first sees four classmates make the same clearly wrong judgement; when one classmate openly disagrees, the student answers independently. The manipulated factor is unanimity, not majority size or a suddenly easier task; a possible mechanism is reduced fear of standing alone. If instead the lines become hard to distinguish while everyone else agrees, uncertainty may make informational influence more plausible. A sound answer names the change, gives the mechanism, uses specific study evidence and then states why the same effect may not hold in all groups.',
        'Asch’s controlled but artificial line-matching task isolates majority pressure and allows comparison with low error rates when people judge independently. Its limited real-world stakes and historical, culturally narrow participant sample reduce confidence that precisely the same rate would apply to all ages, cultures or high-stakes judgements. A strong evaluation balances controlled evidence of the pressure effect against this limited generalisability and avoids treating an observed association as proof that every wrong answer was motivated by wanting to belong.',
      ],
    },
  ],
  'PSY-01-02': [
    {
      type: 'explanation',
      heading: 'Milgram: separate the obedience variations',
      paragraphs: [
        'In Milgram’s obedience experiments, a genuine volunteer assigned the teacher role was instructed by an authority figure to deliver apparently increasing electric shocks to a learner after incorrect answers. The shock generator was labelled in steps up to 450 volts, although the learner was an actor and received no real shocks. Teachers heard protests and were pressed by the experimenter to continue. In the widely reported initial condition 26 of 40 teachers (65%) continued to the maximum indicated 450 volts. A closely related voice-feedback condition had 62.5% at the same endpoint, so results must be tied to the exact experimental condition rather than mixed as if there were one universal baseline.',
        'Proximity refers to the physical relationship, not the building. When the learner was seated in the same room as the teacher, the proportion reaching 450 volts was about 40%; when the teacher had to press the learner’s hand onto a shock plate, it fell to about 30%. In a separate experimenter-proximity change, the authority figure gave later instructions by telephone instead of remaining physically present, and the maximum-shock rate was about one fifth (approximately 20.5%). These were separate changes to learner proximity, direct physical involvement and experimenter presence; a result for one should never be labelled as the effect of another.',
        'Location changes the institutional setting rather than the learner’s position. In Milgram’s Bridgeport office variation, carried out away from Yale in a less prestigious commercial building, 47.5% of teachers reached 450 volts. The closely comparable voice-feedback condition at Yale recorded 62.5%; the often-quoted 65% refers to the distinct widely reported initial condition. The office comparison supports the interpretation that institutional prestige may contribute to obedience, but it cannot by itself prove the precise private reason any individual obeyed.',
        'Uniform and authority-role cues must be kept separate from proximity and location. In a Milgram authority-status variation, the original experimenter left and an apparently ordinary participant, dressed in everyday clothes, assumed the role of issuing instructions; approximately 20% continued to 450 volts. The key comparison changes the person’s apparent authority as well as clothing: it does not isolate a lab coat as the sole cause. A lab coat can signal scientific legitimacy, but do not claim that merely taking off an experimenter’s coat proves the whole effect or that uniforms always cause obedience.',
      ],
    },
    {
      type: 'explanation',
      heading: 'The Authoritarian Personality: a dispositional account',
      paragraphs: [
        'The Authoritarian Personality account, developed by Adorno and colleagues, proposes a relatively enduring cluster of rigid conventional attitudes, submission to established authority and aggression towards people seen as deviating from rules. Its original psychodynamic developmental explanation proposes that harsh, punitive parenting encourages fear and resentment of parents, while hostility towards them is suppressed and may be displaced onto less powerful outgroups. This is a historical theoretical proposal, not an established rule that strict parents inevitably produce authoritarian children. It is a dispositional account, in contrast to explanations based on immediate authority, setting or group pressure.',
        'Adorno’s F-scale is a questionnaire intended to indicate authoritarian attitudes. Its predominantly agree-with-the-statement format can suffer from acquiescence bias: a person inclined to agree with prompts may receive a higher score regardless of their true outlook. Self-report is also affected by interpretation and social desirability. Associations between questionnaire scores and obedience are correlational, not evidence that upbringing or a stable disposition caused any particular act; Milgram’s large situational differences also show that context matters. Compare methods and rival explanations rather than treating F-scale scores as a direct measurement of the cause of obedience.',
        'For an exam scenario, explain whether evidence points to an agentic state, legitimate authority, a specific situational variable or an authoritarian disposition. Develop the mechanism and a limitation instead of treating all explanations as interchangeable.',
      ],
    },
  ],
  'PSY-01-03': [
    {
      type: 'explanation',
      heading: 'Resistance to both conformity and obedience',
      paragraphs: [
        'Social support can reduce conformity when another person challenges a majority: in Asch-style line tasks a dissenting partner breaks unanimity and reduces the sense of being the only person opposing the group. The partner need not always give the objectively correct answer; however, different kinds of dissent can have different effects, so do not assume any disagreement works equally well. In Milgram’s obedience research, a separate condition used two fellow teachers who refused to continue. Only about 10% of genuine participants then administered the maximum 450-volt apparent shock. Their defiance demonstrated that refusal was possible and could weaken the perceived obligation to obey. Conformity-support evidence and disobedient-peer evidence concern different forms of social pressure.',
        'Rotter’s locus-of-control idea concerns a general expectation about what determines outcomes. With an internal locus, a person tends to expect that their own actions influence outcomes; with an external locus, they place more weight on luck, fate or powerful others. It is plausible that someone who expects personal control would feel more able to refuse pressure, but the research evidence is mixed and varies with task and circumstances. Questionnaire associations are correlational and do not show that locus of control caused resistance: experience of social support, authority cues and previous events could affect both reported control and behaviour.',
        'Worked evaluation: in a group judgement, an ally disputes the majority’s answer and a student begins to resist. The observed change is social support; a claim about that student’s internal locus of control would require different evidence. If a volunteer refuses a supervisor’s instruction after seeing two others refuse, Milgram’s disobedient-peers finding is the more directly relevant parallel. An AO3 answer can evaluate the controlled demonstration of support against the artificial settings and point out that correlations between locus-of-control scales and resistance do not determine cause. Neither mechanism guarantees resistance in every setting.',
      ],
    },
  ],
  'PSY-01-04': [
    {
      type: 'explanation',
      heading: 'How minority influence can change a majority',
      paragraphs: [
        'Minority influence involves related conditions rather than three independent guarantees. Diachronic consistency means maintaining a position over time; synchronic consistency means different minority members agree with each other. Both can make the alternative harder to dismiss and create a conflict that encourages others to think more deeply about the issue. Commitment can signal sincerity when supporters make a meaningful sacrifice for their position, sometimes called the augmentation principle: costly behaviour is harder to explain as casual agreement. Flexibility means considering objections and adapting negotiable details, avoiding a rigid appearance while keeping the core position understandable.',
        'Worked application: two students jointly propose a safer laboratory routine at successive meetings. Agreeing with each other shows synchronic consistency; repeating their core evidence-based recommendation over several weeks shows diachronic consistency. Volunteering time to trial the change shows costly commitment and can strengthen perceived sincerity. Revising the order of two steps after hearing a practical objection shows flexibility rather than abandoning the core safety case. A strong explanation connects these conditions to deeper consideration by the majority rather than merely labelling the students persistent.',
        'Moscovici and colleagues’ blue-slide research offers a named example of consistency: two minority confederates in groups of six repeatedly labelled blue slides green. Genuine participants gave green responses on about 8.42% of trials when the minority consistently said green, compared with about 1.25% when its responses were inconsistent and about 0.25% in a no-minority control. These figures are percentages of public judgements, not percentages of people privately converted. The artificial colour task and narrow sample limit transfer to complex real-life campaigns; consistency does not automatically win acceptance, and rigidity may undermine the effect. Evidence on minority dissent also suggests it can stimulate broader consideration, but flexibility, commitment and consistency interact rather than working as isolated switches.',
      ],
    },
  ],
}
