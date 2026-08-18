import { multipleChoiceQuestionSchema } from '../../../schema'

type McqTuple = [string, string, string[], number, string]

const mcqs: McqTuple[] = [
  ['business','A business has revenue of £680,000 and total costs of £612,000. What is profit?',['£68,000','£1,292,000','£612,000','£78,000'],0,'Profit = revenue − total costs = £68,000.'],
  ['business','A PLC has 8 million issued shares trading at £2.75. What is its market capitalisation?',['£2.91m','£10.75m','£22m','£27.5m'],2,'8m × £2.75 = £22m.'],
  ['business','Which business form can sell its shares publicly?',['Sole trader','Private limited company','Public limited company','Non-profit only'],2,'A public limited company can offer shares to the public.'],
  ['business','Which is most likely to be a conflict between objectives?',['Growth requiring investment that reduces short-term cash','Higher sales and higher revenue','Lower unit costs and higher efficiency','Faster payment from customers and stronger cash flow'],0,'Growth can require spending before the benefits arrive, creating a trade-off with short-term cash or profit.'],
  ['business','A rise in interest rates is most directly likely to:',['Guarantee higher market share','Increase the cost of variable-rate borrowing','Remove competition','Increase every household’s disposable income'],1,'Higher interest rates can raise borrowing costs and may also affect customer spending.'],

  ['leadership','Which leadership style gives employees the greatest autonomy?',['Autocratic','Paternalistic','Laissez-faire','Scientific'],2,'Laissez-faire leadership gives substantial freedom to employees.'],
  ['leadership','A project has a 0.7 chance of £140,000 and a 0.3 chance of £20,000. What is expected value?',['£104,000','£112,000','£98,000','£160,000'],0,'0.7 × £140,000 + 0.3 × £20,000 = £98,000 + £6,000 = £104,000.'],
  ['leadership','If the project in the previous style of calculation costs £65,000 and has an expected value of £104,000, its net gain is:',['£39,000','£65,000','£104,000','£169,000'],0,'Net gain = expected value − project cost = £39,000.'],
  ['leadership','Which statement best distinguishes risk from uncertainty?',['Risk has no possible outcomes','Risk can use estimable probabilities; uncertainty is harder to quantify','Uncertainty is always safer','Risk only applies to finance'],1,'Risk is associated with estimable probabilities; uncertainty is harder to measure reliably.'],
  ['leadership','A stakeholder with high power and high interest would usually require:',['Minimal attention','Close management and meaningful engagement','No communication','Automatic agreement with management'],1,'High-power, high-interest stakeholders usually need close management, although the exact response still depends on context.'],

  ['marketing','Which is primary research?',['Government statistics','A survey commissioned by the business','A competitor annual report','An existing industry report'],1,'Primary research is collected specifically for the current purpose.'],
  ['marketing','Which statement about a confidence interval is strongest?',['It proves a forecast is correct','It gives a range that reflects uncertainty around an estimate','It measures market share','It proves causation'],1,'A confidence interval expresses a range around an estimate rather than certainty.'],
  ['marketing','A firm has sales of £9m in a £60m market. Its market share is:',['6.7%','15%','51%','66.7%'],1,'£9m ÷ £60m × 100 = 15%.'],
  ['marketing','Which is an example of behavioural segmentation?',['Age group','Region','Income band','Frequency of purchase'],3,'Behavioural segmentation groups customers according to behaviour such as usage or purchase patterns.'],
  ['marketing','A high initial price designed to capture customers with strong willingness to pay is:',['Penetration pricing','Price skimming','Cost minimisation','Market mapping'],1,'Price skimming uses a relatively high initial price where sufficient customers are willing to pay.'],

  ['operations','A plant produces 42,000 units from capacity of 50,000. Capacity utilisation is:',['8%','42%','84%','119%'],2,'42,000 ÷ 50,000 × 100 = 84%.'],
  ['operations','Total production cost is £360,000 for 90,000 units. Unit cost is:',['£0.25','£4','£40','£450,000'],1,'£360,000 ÷ 90,000 = £4.'],
  ['operations','Which is the clearest risk of JIT?',['Always higher storage cost','Greater exposure to supply disruption','Guaranteed lower quality','Higher buffer stock'],1,'Low inventory means a delayed delivery can stop production or sales quickly.'],
  ['operations','Quality assurance is best described as:',['Only inspecting finished products','Building quality standards and prevention into processes','Holding more inventory','Reducing every price'],1,'Quality assurance focuses on preventing defects through the process rather than only detecting them afterwards.'],
  ['operations','If supplier lead time becomes longer and less predictable, a firm may reasonably:',['Lower its reorder level','Raise its reorder level or buffer inventory','Guarantee zero inventory','Ignore the change'],1,'Earlier reordering or additional buffer can provide protection against longer, uncertain replenishment.'],

  ['finance','Selling price is £48 and variable cost is £30. Contribution per unit is:',['£18','£30','£48','£78'],0,'£48 − £30 = £18.'],
  ['finance','Fixed costs are £270,000 and contribution is £18 per unit. Break-even output is:',['5,000','15,000','18,000','270,018'],1,'£270,000 ÷ £18 = 15,000 units.'],
  ['finance','Forecast output is 19,500 units and break-even is 15,000. Margin of safety is:',['4,500 units','34,500 units','23.1 units','76.9%'],0,'19,500 − 15,000 = 4,500 units.'],
  ['finance','Opening cash is £22,000, inflows are £74,000 and outflows £81,000. Closing balance is:',['−£7,000','£15,000','£29,000','£177,000'],1,'Net cash flow is −£7,000, so £22,000 − £7,000 = £15,000.'],
  ['finance','Which is an internal source of finance?',['Retained profit','Bank loan','Venture capital','Overdraft'],0,'Retained profit is generated and kept within the business.'],

  ['hr','30 employees leave a firm with an average workforce of 200. Labour turnover is:',['6.7%','15%','30%','150%'],1,'30 ÷ 200 × 100 = 15%.'],
  ['hr','Employee costs are £2.4m and turnover is £12m. Employee costs as a percentage of turnover are:',['5%','20%','24%','50%'],1,'£2.4m ÷ £12m × 100 = 20%.'],
  ['hr','Which structure commonly has employees reporting across more than one dimension?',['Matrix','Sole trader','Purely regional only','No hierarchy'],0,'A matrix structure combines reporting relationships such as function and project/product.'],
  ['hr','Which is a non-financial motivation method?',['Commission','Piece rate','Job enrichment','Performance-related pay'],2,'Job enrichment changes responsibility and challenge rather than directly changing financial reward.'],
  ['hr','A tight labour market is most likely to increase:',['Recruitment ease','Wage and retention pressure','Guaranteed productivity','Available skilled labour'],1,'Scarce suitable labour can make recruitment harder and increase pay and retention pressure.'],

  ['strategic-position','Operating profit is £3m and capital employed is £20m. ROCE is:',['6.7%','15%','17%','66.7%'],1,'£3m ÷ £20m × 100 = 15%.'],
  ['strategic-position','Current assets are £4.8m and current liabilities £3.2m. Current ratio is:',['0.67:1','1.5:1','2:1','8:1'],1,'£4.8m ÷ £3.2m = 1.5:1.'],
  ['strategic-position','Non-current liabilities are £9m and capital employed £30m. Gearing is:',['21%','30%','33.3%','70%'],1,'£9m ÷ £30m × 100 = 30%.'],
  ['strategic-position','Which is NOT one of Porter’s five forces?',['Buyer power','Supplier power','Rivalry','Employee motivation'],3,'Employee motivation can affect competitiveness but is not one of Porter’s five competitive forces.'],
  ['strategic-position','Which appraisal method explicitly discounts future cash flows into present values?',['Payback','ARR','NPV','Break-even'],2,'Net present value applies discount factors to future cash flows to reflect the time value of money.'],

  ['strategic-direction','Existing product in a new market is:',['Market penetration','Market development','Product development','Diversification'],1,'Market development takes existing products into new markets.'],
  ['strategic-direction','New product in an existing market is:',['Market penetration','Market development','New product development','Diversification'],2,'New product development creates new products for markets the business already serves.'],
  ['strategic-direction','Which Ansoff direction combines new products and new markets?',['Penetration','Market development','Product development','Diversification'],3,'Diversification combines new products with new markets.'],
  ['strategic-direction','Competing through distinctive customer benefits is closest to:',['Differentiation','Low cost only','Retrenchment','Vertical integration'],0,'Differentiation builds a position around valued differences.'],
  ['strategic-direction','A focus strategy primarily means:',['Serving every segment','Concentrating on a narrower segment','Always charging the lowest price','Only growing organically'],1,'Focus concentrates on a narrower target market.'],

  ['strategic-methods','Which is external rather than organic growth?',['Opening a new branch using retained profit','Increasing marketing to sell more current products','Acquiring a competitor','Developing staff skills internally'],2,'Acquiring another business is external growth.'],
  ['strategic-methods','Which is a purchasing economy of scale?',['Bulk-buying discounts','A faster machine','A taller hierarchy','A smaller product range'],0,'Larger purchasing volumes can strengthen buying power and reduce input price per unit.'],
  ['strategic-methods','Which best describes overtrading?',['Holding too much cash','Growing faster than finance and working capital can support','Never exporting','Falling labour turnover'],1,'Overtrading occurs when rapid growth creates cash and resource pressure beyond the firm’s ability to support it.'],
  ['strategic-methods','A UK firm granting a foreign business the right to produce its product in return for fees is:',['Licensing','Direct investment','Reshoring','Horizontal integration'],0,'Licensing grants rights to use intellectual property or a business format without the same capital commitment as direct investment.'],
  ['strategic-methods','Which is explicitly included in AQA’s digital technology content?',['Big data','Only handwritten records','No automation','Only physical retail'],0,'The specification explicitly names automation, e-commerce, big data and data mining.'],

  ['strategic-change','Which is a restraining force in force-field analysis?',['A factor that makes change easier','A factor opposing or making change harder','The critical path','A product life-cycle stage'],1,'Restraining forces work against the proposed change.'],
  ['strategic-change','Which response to resistance involves giving people a role in shaping the change?',['Participation and involvement','Coercion','Ignoring them','Market penetration'],0,'Participation and involvement can create ownership and improve information.'],
  ['strategic-change','Which is one of Handy’s culture types?',['Task culture','Penetration culture','Inventory culture','Elastic culture'],0,'Handy’s specified types are task, role, power and person culture.'],
  ['strategic-change','An activity on the critical path is delayed by two days and no time is recovered. What is the likely project effect?',['Project completion is delayed two days','No possible effect','Inventory doubles','ROCE automatically falls'],0,'A critical activity has no spare scheduling time under the network assumptions, so its delay delays completion unless time is recovered.'],
  ['strategic-change','Strategic drift occurs when:',['Strategy adapts faster than the environment','Strategy fails to keep pace with environmental change','Every plan is abandoned immediately','A business always chooses diversification'],1,'Strategic drift is growing misalignment between strategy and the changing environment.'],
]

export const questions = mcqs.map(([topic,prompt,options,correctOption,explanation], index) => multipleChoiceQuestionSchema.parse({
  id: `a-level-mcq-${String(index + 1).padStart(3, '0')}`,
  topic,
  prompt,
  options,
  correctOption,
  explanation,
}))
