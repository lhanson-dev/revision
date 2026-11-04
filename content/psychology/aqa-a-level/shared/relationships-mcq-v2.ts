import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * #787 / LF-03: original, case-dependent one-mark AQA Psychology 7182
 * §4.3.2 Relationships questions, mapped to PSY-09-01...PSY-09-04.
 *
 * Old generic V1 identities and source answers remain immutable in history;
 * V2 requires independent blinded A3 and separate explanation review.
 * One choice is not proof of multi-part AO2/AO3 or source-item mastery.
 */
export const relationshipsMcqV2 = {
  'PSY-09-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0901-check-v2',
    topic: 'relationships',
    prompt: "Nina and Alex first meet through the same volunteering group. They discover similar attitudes, gradually exchange more personal information, and form a relationship. Which explanation best fits the evidence?",
    options: [
      "The matching hypothesis explains the relationship because meeting repeatedly establishes equal physical attractiveness.",
      "Social exchange theory is demonstrated because the shared attitudes directly measure each person's costs and rewards.",
      "Opportunity and shared attitudes may act as filters, while reciprocal self-disclosure can increase intimacy.",
      "Equity theory is shown because similarity of values establishes that both receive equal benefits from the relationship.",
    ],
    correctOption: 2,
    explanation: "Filter theory considers who can meet through social-demographic opportunity and the role of attitude similarity; reciprocal and appropriately paced self-disclosure may build closeness. The scenario does not measure attractiveness or show deliberate matching, calculate perceived relationship rewards/costs, or establish fairness of contributions. Similar attitudes alone do not prove equity.",
  }),
  'PSY-09-02': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0902-check-v2',
    topic: 'relationships',
    prompt: "Leah is unhappy with her current relationship but shares a home, future plans and close friendship networks with her partner. She thinks other partners would offer little improvement and remains committed. Which account best explains that combination?",
    options: [
      "The investment model predicts continued commitment where shared investments are large and alternatives seem poor.",
      "Equity theory predicts commitment chiefly because partners' contributions must have become identical.",
      "Duck's phase model predicts commitment because grave-dressing precedes any discussion of dissatisfaction.",
      "The matching hypothesis predicts commitment from partners having similar levels of physical attractiveness.",
    ],
    correctOption: 0,
    explanation: "Rusbult's investment model distinguishes commitment from satisfaction: substantial investments and low-quality alternatives can sustain commitment despite dissatisfaction. Equity addresses perceived fairness, for which the scenario provides no contribution/reward comparison. Duck's grave-dressing concerns accounts following breakdown, not a required precondition of commitment. The scenario gives no physical-attractiveness data for the matching hypothesis.",
  }),
  'PSY-09-03': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0903-check-v2',
    topic: 'relationships',
    prompt: "Sam finds face-to-face socialising difficult but becomes close to someone through months of messages. They have not met, and Sam chooses when to share personal details without providing false information. Which interpretation is most defensible?",
    options: [
      "Controlling the timing of truthful self-disclosure is deception because the other person cannot verify every detail.",
      "Absence of gating means online relationships face no barriers involving access, reputation or distance.",
      "Online contact always follows physical-attractiveness filtering before any personal information is exchanged.",
      "Delayed appearance cues may reduce some early gates; selective but truthful disclosure need not be deception.",
    ],
    correctOption: 3,
    explanation: "Absence of gating refers to the reduction or postponement of some face-to-face constraints, such as appearance cues or social anxiety. Truthful selective disclosure differs from deliberately misleading presentation. Online communication still has gates such as access, profile signals and trust; the scenario does not demonstrate that appearance filtering occurred before messaging. It also cannot establish that online relationships are free of barriers.",
  }),
  'PSY-09-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0904-check-v2',
    topic: 'relationships',
    prompt: "Finn watches a commentator's videos, feels encouraged by them and talks to friends about the commentator. The commentator does not know Finn personally, while Finn maintains other interests and friendships. Which conclusion is best supported?",
    options: [
      "The absorption-addiction account is established because repeated viewing shows escalating psychological dependence.",
      "This can be a parasocial bond without proving intense-personal or borderline-pathological involvement.",
      "Insecure attachment is established because the commentator cannot provide individual reciprocal support.",
      "The relationship is reciprocal because public videos give every follower direct personal interaction.",
    ],
    correctOption: 1,
    explanation: "A parasocial relationship is a psychologically meaningful but one-sided bond with a media figure. Entertainment-social interest and discussion can be ordinary, not evidence of the extreme end of celebrity worship. The scenario contains no evidence that involvement is escalating as an addiction, no attachment assessment, and no individual reciprocity from the commentator. Neither an attachment explanation nor the absorption-addiction model is proved by viewing alone.",
  }),
} as const
