import {
  caseStudySchema,
  dataDrillSchema,
  multipleChoiceQuestionSchema,
  type TopicId,
} from '../../../schema'

type McqTuple = [TopicId, string, string[], number, string]

const mcqs: McqTuple[] = [
['business','A business has revenue of £420,000 and total costs of £365,000. What is profit?',['£55,000','£785,000','£365,000','£45,000'],0,'Profit = revenue − total costs = £55,000.'],
['business','Which change is most likely to increase the cost of servicing a variable-rate business loan?',['Lower inflation','Higher interest rates','Lower market share','Higher capacity utilisation'],1,'Higher interest rates can increase the cost of borrowing.'],
['leadership','A manager needs an immediate decision during a serious safety incident. Which style is most likely to suit the situation?',['Laissez-faire','Democratic','Autocratic','No leadership'],2,'Autocratic leadership can be appropriate when speed, clarity and control are critical.'],
['leadership','Option A has a 60% chance of £100k and 40% chance of £20k. What is its expected value?',['£52k','£68k','£80k','£120k'],1,'0.6×100 + 0.4×20 = 68 (£000s).'],
['leadership','Why is the highest expected value not automatically the best decision?',['Expected value is always wrong','It ignores all numbers','Probabilities may be unreliable and qualitative/risk factors matter','Managers must always choose the cheapest option'],2,'Decision trees support judgement; they do not replace it.'],
['marketing','Which is primary research?',['Government statistics',"A competitor's annual report",'A survey commissioned by the business','An industry report'],2,'Primary research is collected first-hand for the current purpose.'],
['marketing','Which pairing best describes penetration pricing?',['High launch price; capture early high willingness to pay','Low launch price; encourage adoption/share','Cost plus a fixed percentage only','Price changes every hour'],1,'Penetration pricing uses a relatively low initial price to build sales or market share.'],
['marketing','A market is worth £50m and a firm sells £7.5m. Market share is:',['6.7%','15%','42.5%','57.5%'],1,'7.5 ÷ 50 × 100 = 15%.'],
['marketing','Which statement about correlation is correct?',['Correlation proves causation','Negative correlation means both variables rise','Correlation shows association, not necessarily cause','Only qualitative data can correlate'],2,'A relationship between variables does not prove one caused the other.'],
['operations','A factory produces 8,400 units against maximum capacity of 10,000. Capacity utilisation is:',['16%','84%','119%','1.19%'],1,'8,400 ÷ 10,000 × 100 = 84%.'],
['operations','Which is the strongest disadvantage of JIT in an unreliable supply chain?',['Higher buffer inventory','More cash tied up','Production may stop if deliveries fail','Guaranteed poor quality'],2,'Low buffers make the firm more exposed to delivery disruption.'],
['operations','A firm spends £240,000 producing 60,000 units. Unit cost is:',['£0.25','£4','£18','£300,000'],1,'£240,000 ÷ 60,000 = £4 per unit.'],
['operations','Which best distinguishes quality assurance from quality control?',['Assurance prevents through process; control detects through inspection','They are identical','Assurance only applies to services','Control always costs less'],0,'Quality assurance builds prevention into processes; control focuses more on checking output.'],
['finance','Selling price is £30 and variable cost is £18. Contribution per unit is:',['£12','£18','£30','£48'],0,'£30 − £18 = £12.'],
['finance','Fixed costs are £120,000 and contribution per unit is £12. Break-even output is:',['1,000','10,000','12,000','144,000'],1,'£120,000 ÷ £12 = 10,000 units.'],
['finance','Forecast sales are 14,500 units and break-even is 10,000. Margin of safety is:',['4,500 units','24,500 units','45%','1.45 units'],0,'14,500 − 10,000 = 4,500 units.'],
['finance','Which statement is correct?',['A profitable business can never run out of cash','Profit and cash are identical','A profitable business may face a cash shortage because of timing','Cash flow matters only to loss-making firms'],2,'Receipts and payments occur at different times from reported revenues/costs.'],
['finance','Which source is internal finance?',['Bank loan','Retained profit','Venture capital','Overdraft'],1,'Retained profit is generated and retained inside the business.'],
['hr','45 employees leave a business with an average workforce of 300. Labour turnover is:',['6.7%','15%','45%','150%'],1,'45 ÷ 300 × 100 = 15%.'],
['hr','Which is a non-financial method of motivation?',['Commission','Piece rate','Job enrichment','Performance-related pay'],2,'Job enrichment increases responsibility/challenge rather than direct financial reward.'],
['hr','Which structure gives an employee two or more reporting relationships across projects/functions?',['Matrix','Sole trader','Regional only','Flat pricing'],0,'Matrix structures commonly combine functional and project/product reporting.'],
['hr','A likely benefit of decentralisation is:',['Every decision becomes identical','Faster local decisions close to customers','No managers are needed','All risk disappears'],1,'Authority closer to the issue can improve speed and local responsiveness.'],
['hr','Herzberg suggests which is more likely to create positive motivation?',['Only removing poor hygiene factors','Achievement and responsibility','Reducing all autonomy','Ignoring job design'],1,'Herzberg distinguishes hygiene factors from motivators such as achievement and responsibility.'],
['business','A PLC has 5 million issued shares trading at £3.20 each. Its market capitalisation is:',['£1.56m','£8.2m','£16m','£32m'],2,'5m × £3.20 = £16m.'],
['marketing','Which Boston Matrix category has high market share in a low-growth market?',['Star','Cash Cow','Question Mark','Dog'],1,'A Cash Cow combines relatively high market share with a low-growth market.'],
['operations','Which is the clearest reason for holding buffer inventory?',['To guarantee zero storage cost','To protect against uncertainty in demand or supply','To maximise JIT dependence','To eliminate working capital'],1,'Buffer stock protects operations when actual demand or delivery differs from plan.'],
['finance','Contribution per unit is £9 and the business sells 20,000 units. Total contribution is:',['£2,222','£29,000','£180,000','£220,000'],2,'£9 × 20,000 = £180,000.'],
['hr','Employee costs are £450,000 and turnover is £1.8m. Employee costs as a percentage of turnover are:',['4%','20%','25%','40%'],2,'450,000 ÷ 1,800,000 × 100 = 25%.'],
['marketing','A hotel raises room prices automatically when occupancy reaches 90%. This is best described as:',['Market mapping','Dynamic pricing','Penetration pricing','Job enrichment'],1,'Dynamic pricing changes price as market/capacity conditions change.'],
['marketing','Which action is most clearly relationship marketing?',['A one-off launch discount','A loyalty programme using purchase history to tailor offers','Closing a distribution channel','Increasing buffer inventory'],1,'Relationship marketing focuses on retention and the ongoing customer relationship.'],
['marketing','If income rises by 5% and demand for a product rises by 10%, the product is relatively:',['Responsive to income changes','Completely unresponsive','Necessarily inferior','Price inelastic'],0,'Demand changed proportionately more than income, indicating relatively responsive positive income elasticity.'],
['operations','A supplier lead time becomes less reliable. Which inventory response is most likely to improve resilience?',['Lower the reorder level','Remove buffer stock','Raise the reorder level or buffer stock','Guarantee JIT with zero stock'],2,'Earlier reordering/more buffer gives greater protection from uncertain delivery.'],
['operations','Output rises from 12,000 to 13,800 units with the same 60 employees. Labour productivity rises by:',['3 units per employee','30 units per employee','23%','1800 employees'],1,'Productivity rises from 200 to 230 units per employee: an increase of 30.'],
['finance','Opening cash balance is £8,000, inflows £27,000 and outflows £31,500. Closing balance is:',['£3,500','£11,500','−£4,500','£66,500'],0,'Net cash flow = −£4,500; £8,000 − £4,500 = £3,500 closing balance.'],
['finance','Which change would normally reduce break-even output?',['Higher fixed costs','Lower contribution per unit','Higher contribution per unit','Higher rent with no other change'],2,'Break-even = fixed costs ÷ contribution per unit, so a larger contribution lowers break-even.'],
['finance','Budgeted revenue is £240,000 and actual revenue is £228,000. The revenue variance is:',['£12,000 favourable','£12,000 adverse','£468,000 adverse','5% favourable'],1,'Actual revenue is £12,000 below budget, so the revenue variance is adverse.'],
['hr','A tight labour market is most likely to cause:',['Easier recruitment at lower wages','Greater wage and retention pressure','Guaranteed lower labour turnover','No effect on HR decisions'],1,'Scarce suitable labour can make recruitment harder and increase wage/retention pressure.'],
['hr','Which sequence best represents human-resource flow?',['Redundancy → recruitment → no planning','HR plan → recruitment → training → redeployment/redundancy as needs change','Pricing → promotion → recruitment','JIT → training → market mapping'],1,'AQA expects HR flow to include planning, recruitment, training, redeployment and redundancy.'],
['business','Which objective is most likely to be especially important to a public-sector service?',['Dividend growth only','Service access and value for money','Share-price maximisation','Venture-capital exit'],1,'Public-sector organisations may prioritise service provision and value for money rather than shareholder returns.'],
]

export const questions = mcqs.map(([topic,prompt,options,correctOption,explanation], index) => multipleChoiceQuestionSchema.parse({
  id: `mcq-${String(index + 1).padStart(3, '0')}`,
  topic,
  prompt,
  options,
  correctOption,
  explanation,
}))

export const northPeakCaseStudy = caseStudySchema.parse({
  id: 'northpeak-bikes',
  title: 'NorthPeak Bikes Ltd',
  bodyHtml: 'NorthPeak Bikes Ltd is a privately owned UK bicycle manufacturer selling premium commuter and electric bikes online and through independent retailers. Revenue grew by 24% last year after a successful social-media campaign. The factory now operates at 94% capacity utilisation. Customer complaints about late deliveries and minor defects have risen.<br><br>NorthPeak employs 120 people. Labour turnover increased from 11% to 19%, particularly among skilled assembly staff. The operations director wants to spend £600,000 on automated equipment. She expects the equipment to reduce variable cost per bike and increase capacity, but staff representatives fear redundancies.<br><br>The finance director is concerned about cash. Retailers normally pay NorthPeak 45 days after delivery, while many suppliers require payment within 20 days. Management is considering either a five-year bank loan or bringing in a venture-capital investor. The managing director must decide whether to automate now or postpone the project for one year.',
  facts: ['Revenue +24%','94% capacity utilisation','Complaints rising','120 employees','Turnover 11% → 19%','Automation cost £600k','Customers pay in 45 days','Suppliers paid in 20 days'],
  questions: [
    { id:'northpeak-q1', prompt:'Identify two signs that operations may be under pressure.', guidance:'94% capacity utilisation plus rising late-delivery/defect complaints. The strongest answer uses the specific case evidence.' },
    { id:'northpeak-q2', prompt:'Explain one possible reason why high labour turnover could worsen NorthPeak’s quality.', guidance:'Skilled assemblers leaving can increase the proportion of inexperienced staff; while replacements learn, mistakes/defects may rise, which can add rework and complaints.' },
    { id:'northpeak-q3', prompt:'Analyse one benefit of investing in automation now.', guidance:'Automation may reduce variable cost and increase capacity. At 94% utilisation, extra capacity could help meet growing demand and reduce delivery pressure; lower variable cost can raise contribution per bike, potentially strengthening profit if volume is sufficient.' },
    { id:'northpeak-q4', prompt:'Analyse one drawback of investing in automation now.', guidance:'£600k creates financing/cash pressure, while staff fear redundancies. Poor handling could worsen employee relations and turnover, risking implementation/quality. The fixed investment is also risky if recent demand growth does not persist.' },
    { id:'northpeak-q5', prompt:'Why is cash-flow timing a concern even though revenue grew 24%?', guidance:'Retailers pay after 45 days but suppliers are paid within 20. Cash may leave before related receipts arrive. Growth can increase this working-capital gap because more materials/labour must be funded before cash is collected.' },
    { id:'northpeak-q6', prompt:'Assess bank loan versus venture capital for the investment.', guidance:'Loan: owners retain equity/control, but repayments/interest add pressure to already tight cash. Venture capital: can reduce scheduled repayment pressure and bring expertise, but owners surrender equity/control. Judgement should depend on cash-flow resilience, appetite for dilution, loan terms and investor value.' },
    { id:'northpeak-q7', prompt:'Recommend whether NorthPeak should automate now or postpone for one year.', guidance:'A strong judgement weighs 94% utilisation + demand growth + cost benefits against £600k cash exposure + quality/people risks. The best conclusion is conditional: automate now only if financing leaves sufficient liquidity and there is a credible workforce/quality transition plan; otherwise a short postponement or staged investment may be safer.' },
  ],
})

const drills = [
  ['Index numbers','A market index rises from 100 to 118 while a business sales index rises from 100 to 109. What does this suggest?','The market has grown faster than the business. The business may have lost relative market share even though its own sales increased.'],
  ['Cash-flow forecast','Opening balance £5,000; inflows £24,000; outflows £31,000. Calculate the closing balance and interpret it.','Closing balance = £5,000 + £24,000 − £31,000 = −£2,000. The business forecasts a cash shortage and needs to change timing/spending or arrange finance.'],
  ['Break-even change','Fixed costs rise from £80,000 to £100,000 while contribution stays £10 per unit. What happens to break-even?','It rises from 8,000 units to 10,000 units. The business must sell 2,000 more units before total contribution covers fixed costs.'],
  ['Inventory chart','A supplier lead time increases from 5 to 9 days while usage remains similar. What inventory control change may be sensible?','Reorder earlier (raise the reorder level) and/or hold a larger buffer, because stock must last longer before replenishment arrives.'],
  ['Market data','Market size grows 12% but a firm’s sales grow 4%. What is the likely market-share direction?','Down. The business is growing more slowly than the overall market, so its share is likely to fall.'],
  ['Productivity','A business makes 18,000 units with 90 employees, then 21,000 with 84 employees. Compare productivity.','It rises from 200 to 250 units per employee. This is a 25% productivity improvement, which may reduce labour cost per unit if labour cost does not rise too much.'],
  ['Margin interpretation','Gross margin rises while operating margin falls. Give one plausible explanation.','Direct/product costs improved relative to revenue, but operating expenses such as marketing, salaries, rent or administration rose enough to reduce operating profitability.'],
  ['Correlation','A scatter graph shows strong positive correlation between advertising and sales. What can a manager conclude?','There is a strong association, but not proof that advertising caused the sales increase; other variables may explain both.'],
]

export const dataDrills = drills.map(([title,prompt,answer], index) => dataDrillSchema.parse({
  id: `data-drill-${String(index + 1).padStart(2, '0')}`,
  title,
  prompt,
  answer,
}))
