import { dataDrillSchema } from '../../../schema'

const extendedDrills = [
  ['Market share','A market is worth £48m. A business has sales of £6.24m. Calculate market share and interpret it.','Market share = £6.24m ÷ £48m × 100 = 13%. This means the business accounts for about 13% of total market sales by value.'],
  ['Operating profit margin','Revenue is £7.5m and operating profit is £525,000. Calculate the operating profit margin.','£525,000 ÷ £7,500,000 × 100 = 7%. The business earns 7p operating profit for every £1 of revenue before later finance/tax items.'],
  ['Employee cost percentage','Employee costs are £1.26m and turnover is £4.2m. Calculate employee costs as a percentage of turnover.','£1.26m ÷ £4.2m × 100 = 30%. The figure needs context before judging whether this is efficient because labour intensity and service quality differ by business.'],
  ['Labour turnover','During the year 36 employees leave. Average employment is 240. Calculate labour turnover and give one interpretation.','36 ÷ 240 × 100 = 15%. Whether 15% is problematic depends on the sector, replacement difficulty, skills lost and the cost/quality impact.'],
  ['Decision tree','A launch has a 0.65 chance of producing £180,000 contribution and a 0.35 chance of producing £40,000. The launch costs £70,000. Calculate expected value and net gain.','Expected value = (0.65 × £180,000) + (0.35 × £40,000) = £131,000. Net gain = £131,000 − £70,000 = £61,000. The result supports a decision but does not remove uncertainty or qualitative risk.'],
  ['Capacity utilisation','A service centre can handle 2,400 appointments per month and currently handles 2,160. Calculate capacity utilisation and interpret one risk.','2,160 ÷ 2,400 × 100 = 90%. High utilisation may spread fixed costs well, but little spare capacity remains for demand spikes, absence or disruption.'],
  ['Cash-flow timing','A business opens the month with £12,000. It expects £38,000 cash inflows and £55,000 outflows. Calculate the closing balance and state one action management could consider.','Closing balance = £12,000 + £38,000 − £55,000 = −£5,000. Management may alter timing/spending, accelerate receipts or arrange suitable finance; the best action depends on why the shortfall occurs.'],
  ['Break-even scenario','Fixed costs are £150,000 and contribution is £15 per unit. Calculate break-even. Then explain what happens if contribution falls to £12 with fixed costs unchanged.','Original break-even = 10,000 units. At £12 contribution, break-even = 12,500 units. Lower contribution means more units are required to cover the same fixed costs.'],
  ['Productivity comparison','Site A produces 9,600 units with 48 employees. Site B produces 11,000 units with 50 employees. Compare labour productivity.','Site A = 200 units per employee. Site B = 220 units per employee. Site B is 10% more productive on this measure, but managers still need to consider quality, wage cost and other inputs.'],
  ['Index and market position','A market index moves from 100 to 112 while a firm sales index moves from 100 to 106. Interpret the likely competitive implication.','Both grew, but the market grew faster. The firm is likely to have lost relative market share even though its own sales increased. Index numbers show relative movement from a base; they are not percentages by themselves.'],
] as const

export const extendedDataDrills = extendedDrills.map(([title, prompt, answer], index) => dataDrillSchema.parse({
  id: `extended-data-drill-${String(index + 1).padStart(2, '0')}`,
  title,
  prompt,
  answer,
}))
