/** #698: AQA 7132 v2.0 §3.3.3 (printed p16), original market-map
 * construction rehearsal. AQA source is REFERENCE_ONLY.
 * A DataDrill model-answer reveal is NOT independently marked evidence.
 */
import { dataDrillSchema } from '../../../schema'

export const businessPositioningMapDrills = [
  dataDrillSchema.parse({
    id: 'rev7132-333-positioning-map-01',
    topic: 'marketing',
    title: 'Draw and interpret a market-positioning map',
    prompt: 'Extension exercise: this drawing task helps with market-map interpretation, but it is not stated as a specific AQA exam command. Work on paper before revealing the answer. BrewLoop is considering a reusable travel cup. Customers rate perceived durability from 0 (low) to 10 (high). Draw a market map with price in pounds on the horizontal axis from £0 to £40 and durability rating on the vertical axis from 0 to 10. Use equal, labelled intervals. Plot three competitors: CupGo (£12, 3), DailySip (£20, 6) and LongLife (£38, 8). Plot BrewLoop’s proposal (£28, 9) with a different symbol. Label all four positions. Interpret which rival is nearest in price, how BrewLoop compares on durability, and whether the apparent market-map gap proves that the proposed position is commercially attractive. Explain one further piece of evidence needed before launch.',
    answer: 'Model sketch checks: horizontal axis = price (£), 0 to 40, with £10 equal intervals; vertical axis = perceived durability, 0 to 10, with 2-point equal intervals. Plot and label CupGo at (12, 3), DailySip at (20, 6), LongLife at (38, 8), and the proposed BrewLoop at (28, 9). DailySip is £8 cheaper than BrewLoop and LongLife is £10 more expensive; DailySip is therefore the nearest rival by price. BrewLoop has the highest perceived durability (9/10), one point above LongLife. A position between £20 and £38 at very high durability may differentiate the proposal, but no dot in that region does not establish demand or profitability. Survey whether enough customers would pay £28, and check whether the business can actually deliver the promised durability. Check your own two axes, scale, four correctly plotted coordinates, labels, comparisons and conditional decision. This answer-reveal activity cannot score or independently verify a student-drawn graph or written evaluation.',
  }),
]
