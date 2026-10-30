/** Issue #698: seven Revision-original AQA 7132 v2.0 §3.1.3 single-target
 * application MCQs on external influences on costs and demand. These measure
 * selected-option reasoning only, not independently marked explanatory chains
 * or demonstrated specification-wide mastery. Official AQA PDF REFERENCE_ONLY.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessExternalEnvironmentCases = [
  {
    "id": "competition",
    "target": "aqa-7132-3.1.3:competition-effects-on-costs-and-demand",
    "node": "bus-fnd-009",
    "context": "An independent dog-grooming salon opens beside two established salons. Both established businesses respond by paying for local adverts and offering introductory discounts.",
    "stem": "Which is the strongest explanation of how this competitive change may affect an established salon?",
    "options": [
      "Its fixed costs must fall and demand is guaranteed to increase.",
      "Promotion may increase its operating costs while customers may switch between salons.",
      "All three salons must earn the same profit because they serve the same town.",
      "Rivalry removes the need to consider service quality."
    ],
    "correct": "B",
    "why": [
      "A is incorrect: neither lower fixed costs nor higher demand is guaranteed by more competition.",
      "B is correct: extra advertising may raise costs while discounts and additional customer choice can change demand.",
      "C is incorrect: the businesses have different costs, prices and customer bases.",
      "D is incorrect: service quality is one way businesses compete."
    ]
  },
  {
    "id": "market-conditions",
    "target": "aqa-7132-3.1.3:market-conditions",
    "node": "bus-fnd-009",
    "context": "A furniture retailer faces weaker local orders during a downturn. At the same time, two timber suppliers with spare capacity offer lower prices to retain buyers.",
    "stem": "Which combination is most plausible for the furniture retailer?",
    "options": [
      "Demand may remain weak while some input costs fall.",
      "Demand must rise because timber is cheaper.",
      "Every production cost must rise while sales are unchanged.",
      "Supplier discounts guarantee the retailer a higher net profit."
    ],
    "correct": "A",
    "why": [
      "A is correct: weak consumer orders can coexist with lower input prices when suppliers have excess capacity.",
      "B is incorrect: lower input costs do not guarantee more customers.",
      "C is incorrect: the suppliers are offering lower, not higher, timber prices.",
      "D is incorrect: profits also depend on sales volumes, other costs and prices."
    ]
  },
  {
    "id": "incomes",
    "target": "aqa-7132-3.1.3:incomes-and-demand",
    "node": "bus-fnd-009",
    "context": "Household disposable incomes increase in a town where a small business sells discretionary weekend adventure experiences.",
    "stem": "Which effect on demand for the business is most likely, other things equal?",
    "options": [
      "The business must face higher loan interest charges.",
      "All customers will stop buying non-essential experiences.",
      "The price of every input must fall.",
      "More households may be willing and able to purchase the experiences."
    ],
    "correct": "D",
    "why": [
      "A is incorrect: a change in customers' incomes does not itself determine the firm's loan rate.",
      "B is incorrect: rising disposable income does not imply lower discretionary spending.",
      "C is incorrect: input prices depend on supply conditions and other factors.",
      "D is correct: higher disposable income may increase demand for a discretionary service."
    ]
  },
  {
    "id": "interest-rates",
    "target": "aqa-7132-3.1.3:interest-rates",
    "node": "bus-fnd-009",
    "context": "A home-improvement business has a variable-rate loan. Many customers also borrow to fund major renovations. Market interest rates rise.",
    "stem": "Which pair of effects gives the most defensible business analysis?",
    "options": [
      "The firm's loan payments must fall and renovations become cheaper to finance.",
      "Its debt balance disappears and customer incomes must rise.",
      "Borrowing costs may increase for the firm while finance-sensitive customer demand may weaken.",
      "Interest rates affect only banks and not household or business choices."
    ],
    "correct": "C",
    "why": [
      "A is incorrect: a variable loan typically becomes more costly when its rate rises.",
      "B is incorrect: higher interest rates neither erase debt nor guarantee higher incomes.",
      "C is correct: rates can affect the firm's costs and customers' affordability through separate channels.",
      "D is incorrect: interest rates influence borrowing, saving, investment and spending."
    ]
  },
  {
    "id": "demographics",
    "target": "aqa-7132-3.1.3:demographic-factors",
    "node": "bus-fnd-009",
    "context": "A town's population is ageing. A local care-support provider considers more home visits but faces a shortage of suitably trained staff.",
    "stem": "Which conclusion best links the demographic shift to demand and cost?",
    "options": [
      "Demand for home visits may rise, while competing for qualified staff may increase recruitment or wage costs.",
      "An ageing population proves the care provider's labour costs will fall.",
      "Demographic change affects staffing but cannot affect consumer demand.",
      "Every business in the town must experience the same effect."
    ],
    "correct": "A",
    "why": [
      "A is correct: an older population can increase the need for some services while scarce workers create cost pressure.",
      "B is incorrect: staffing shortages can increase rather than reduce recruitment costs.",
      "C is incorrect: age composition can influence what customers need.",
      "D is incorrect: effects depend on each firm's customers and resources."
    ]
  },
  {
    "id": "environment",
    "target": "aqa-7132-3.1.3:environmental-issues",
    "node": "bus-fnd-009",
    "context": "A refillable household-cleaning product is growing in popularity. A small manufacturer considers replacing its existing single-use packaging, but new filling equipment would require investment.",
    "stem": "What is the best assessment of the external environmental influence?",
    "options": [
      "Consumer preferences cannot affect demand for cleaning products.",
      "The equipment must pay for itself immediately because consumers value sustainability.",
      "Environmental changes always reduce both demand and business costs.",
      "Demand may shift towards refillable products, but meeting it could increase short-run investment costs."
    ],
    "correct": "D",
    "why": [
      "A is incorrect: purchasing preferences can change demand.",
      "B is incorrect: expected return and payback depend on costs, prices and sales, not on one trend alone.",
      "C is incorrect: costs and demand can move in different directions.",
      "D is correct: the firm may face a demand opportunity and an investment cost at the same time."
    ]
  },
  {
    "id": "fair-trade",
    "target": "aqa-7132-3.1.3:fair-trade",
    "node": "bus-fnd-009",
    "context": "A small chocolate maker is considering certified fair-trade cocoa from a supplier whose price is above its current input price. Some of its customers say ethical sourcing matters when they choose chocolate.",
    "stem": "Which judgement gives the most balanced effect on costs and potential demand?",
    "options": [
      "The switch must lower cocoa input costs and guarantee more sales.",
      "Cocoa purchasing costs may rise, but ethical appeal could attract some customers if they value and trust the sourcing.",
      "Fair trade removes every environmental and labour concern in the supply chain.",
      "A higher input price means customer demand is always unchanged."
    ],
    "correct": "B",
    "why": [
      "A is incorrect: the offered cocoa costs more and extra sales are uncertain.",
      "B is correct: higher input costs may be weighed against possible demand from ethically motivated buyers.",
      "C is incorrect: a sourcing arrangement cannot guarantee the absence of every supply-chain concern.",
      "D is incorrect: consumer preferences and pricing decisions can affect demand."
    ]
  }
] as const

export const businessExternalEnvironmentBank = businessExternalEnvironmentCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.1.3',
    label: 'Revision-original Business external-environment application',
    confidence_label: 'Mechanism and option checks in code; qualified educational review pending',
    topic_id: 'business',
    target_item_ids: [item.target],
    target_node_ids: [item.node],
    question: {
      id: item.id,
      family: 'MCQ',
      command_word: 'Identify',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: item.stem,
      table: null,
      options: item.options.map((text, index) => ({label: 'ABCD'[index], text})),
      calcs: [],
      mark_scheme: {
        type: 'single_option',
        correct_option: item.correct,
        option_rationale: [...item.why],
        points: [], levels: [], indicative_content: [],
        model_answer: item.why['ABCD'.indexOf(item.correct)],
      },
    },
  }),
)
