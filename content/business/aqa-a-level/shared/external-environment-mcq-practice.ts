/** Issue #698 — Original case-based, single-option MCQs for AQA 7132 v2.0 §3.1.3 (printed p13).
 * Scores one selected causal inference, not full written evaluation or independent skill mastery.
 * Source: REFERENCE_ONLY specification alignment; all stimuli and distractors Revision-authored.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessExternalEnvironmentCases = [
  {
    "id": "ethical-packaging-01",
    "target": "aqa-7132-3.1.3:environmental-issues",
    "context": "A ready-meal producer replaces its plastic trays with recyclable alternatives costing 18p more per meal. A local customer survey suggests some customers prefer lower-plastic packaging.",
    "prompt": "Which conclusion best distinguishes the immediate cost effect from a possible demand effect?",
    "choices": [
      "Material cost per meal may rise; demand could increase among environmentally concerned customers, but neither total sales nor profit is guaranteed.",
      "Because the packaging is recyclable, production costs must decrease and all customers will buy more.",
      "The higher packaging cost proves that demand must fall by exactly 18%.",
      "A change in packaging affects the environment but cannot affect business costs or demand."
    ],
    "correct": 0,
    "rationale": [
      "The higher material cost is direct; the survey suggests possible demand effects, not guaranteed sales or profit.",
      "Recyclability does not automatically make packaging cheaper or persuade every buyer.",
      "The 18p cost change does not imply an 18% or any fixed change in demand.",
      "Packaging can influence both costs and preferences."
    ]
  },
  {
    "id": "fair-trade-cocoa-02",
    "target": "aqa-7132-3.1.3:environmental-issues",
    "context": "An independent chocolate shop selects cocoa from a fair-trade supplier at a higher purchase price. It has not tested whether its customers will pay more.",
    "prompt": "What is the strongest supported interpretation of the sourcing decision?",
    "choices": [
      "A higher input price always increases the shop's profit because the sourcing is ethical.",
      "Fair trade guarantees the shop's packaging has a lower environmental impact.",
      "The shop's ingredient costs may rise while a demand benefit remains possible but unproven.",
      "Fair-trade sourcing cannot affect purchasing costs or customer decisions."
    ],
    "correct": 2,
    "rationale": [
      "Higher costs can reduce margins unless offset by price, volume or other changes.",
      "Fairer producer trading terms do not themselves prove a packaging impact.",
      "A higher supplier price is a plausible direct cost effect; customer demand needs separate evidence.",
      "Sourcing can affect both costs and some customers' preferences."
    ]
  },
  {
    "id": "demographic-care-01",
    "target": "aqa-7132-3.1.3:demographic-factors",
    "context": "A region's share of older residents is rising. A home-care provider is considering more accessible services, while qualified workers are hard to recruit locally.",
    "prompt": "Which cost-and-demand chain is most defensible?",
    "choices": [
      "Older residents always spend less, so demand for all care services will disappear.",
      "Demand for suitable home-care services could rise while scarcity of trained workers could raise recruitment costs.",
      "An older population must increase care supply and reduce all staffing costs.",
      "Demographic change can change demand but can never influence labour costs."
    ],
    "correct": 1,
    "rationale": [
      "Spending and care needs vary; a disappearance of demand is unsupported.",
      "Population needs may change demand while local labour scarcity creates a separate cost pressure.",
      "More potential clients does not automatically expand trained labour supply.",
      "Demographic shifts can affect labour markets as well as customers."
    ]
  },
  {
    "id": "interest-housebuilder-01",
    "target": "aqa-7132-3.1.3:interest-rates",
    "context": "A housebuilder uses variable-rate borrowing and many buyers depend on mortgages. Market interest rates rise.",
    "prompt": "Which combined effect is most plausible in this specific case?",
    "choices": [
      "Borrowing becomes cheaper for the builder and mortgages automatically become more affordable.",
      "Housebuilding costs cannot change because interest rates are outside the factory.",
      "Demand rises for every home because buyers will always rush to borrow more.",
      "The builder may pay more interest while mortgage affordability worsens and weakens buyer demand."
    ],
    "correct": 3,
    "rationale": [
      "Variable-rate debt and mortgages are likely to become costlier, not cheaper.",
      "Financing is a business cost and may change with rates.",
      "A rate rise does not guarantee higher home demand.",
      "Both the producer's finance costs and buyers' ability to finance purchases can be affected."
    ]
  },
  {
    "id": "income-premium-01",
    "target": "aqa-7132-3.1.3:incomes-and-demand",
    "context": "Household real incomes fall in a town. A premium furniture shop sells mainly optional, high-ticket items.",
    "prompt": "Which demand response should its manager investigate first?",
    "choices": [
      "Whether some customers postpone discretionary furniture purchases, while recognising that the impact depends on customers and alternatives.",
      "That all customers will buy exactly half as many sofas.",
      "That the shop's fixed rent must fall at the same percentage as household incomes.",
      "That customers' incomes cannot affect demand for premium furniture."
    ],
    "correct": 0,
    "rationale": [
      "Lower purchasing power may reduce discretionary demand, though the magnitude depends on circumstances.",
      "There is no basis for an exact proportional demand change.",
      "Customer income is not the same as the store's rent cost.",
      "Income changes can affect willingness and ability to buy discretionary goods."
    ]
  },
  {
    "id": "competition-restaurant-01",
    "target": "aqa-7132-3.1.3:competition-effects-on-costs-and-demand",
    "context": "A nearby independent restaurant faces a new rival offering comparable meals, lower prices and online booking. The first restaurant considers extra advertising and service training.",
    "prompt": "What is the most defensible chain of effects for the first restaurant?",
    "choices": [
      "A new competitor ensures the original restaurant's demand and costs are unchanged.",
      "The rival guarantees higher sales even if the first restaurant makes no changes.",
      "The original restaurant might lose customers and incur higher advertising or training costs in responding.",
      "A new rival can affect only costs, never demand."
    ],
    "correct": 2,
    "rationale": [
      "Comparable new alternatives can shift customers and stimulate spending on responses.",
      "No outcome is guaranteed without considering customer response.",
      "Rivalry may put demand under pressure while competitive responses add costs.",
      "Competition can influence both customers' choices and the costs of competing."
    ]
  }
] as const

export const businessExternalEnvironmentBank = businessExternalEnvironmentCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.1.3',
    label: 'Revision-original external environment applied MCQ',
    confidence_label: 'One option and each distractor checked; no examiner-grade or mastery claim',
    topic_id: 'business',
    target_item_ids: [item.target],
    target_node_ids: ['bus-fnd-009'],
    question: {
      id: item.id,
      family: 'MCQ',
      command_word: 'Select',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: item.prompt,
      table: null,
      options: item.choices.map((text, index) => ({ label: 'ABCD'[index]!, text })),
      calcs: [],
      mark_scheme: {
        type: 'single_option',
        correct_option: 'ABCD'[item.correct]!,
        option_rationale: [...item.rationale],
        points: [],
        levels: [],
        indicative_content: [],
        model_answer: item.choices[item.correct],
      },
    },
  }),
)
