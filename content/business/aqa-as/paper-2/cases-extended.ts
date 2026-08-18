import { caseStudySchema } from '../../../schema'

export const harbourStreetCafeCase = caseStudySchema.parse({
  id: 'harbour-street-cafe',
  title: 'Harbour Street Café',
  bodyHtml: 'Harbour Street Café is a small independent café owned by Priya. It employs 11 people, most of them part-time. Sales are strongest at weekends, but weekday demand has fallen as two national coffee chains have opened nearby. Priya is considering a loyalty app and later opening a second site. Staff turnover is high and several experienced baristas have left for competitors offering higher hourly pay. Ingredient costs have also risen. Priya has limited retained profit and is deciding whether to use a bank loan or crowdfunding to finance the second site.',
  facts: ['Independent owner-managed service business','11 employees','Weekday demand falling','Two national chains opened nearby','Staff turnover high','Ingredient costs rising','Considering loyalty app','Second-site finance decision'],
  questions: [
    { id: 'harbour-cafe-q1', prompt: 'Explain one reason why the entry of two national chains may change Priya’s marketing decisions.', guidance: 'Apply competition directly: stronger alternatives may reduce footfall or pricing power, so Priya may need clearer differentiation, loyalty activity, service quality or a more targeted offer.' },
    { id: 'harbour-cafe-q2', prompt: 'Analyse one possible effect of high staff turnover on the café.', guidance: 'Build a chain through recruitment/training cost, service consistency, speed or customer experience. Strong answers recognise that in a small service business experienced employees directly affect the product customers receive.' },
    { id: 'harbour-cafe-q3', prompt: 'Assess whether a loyalty app is likely to improve performance.', guidance: 'Consider repeat purchase and customer data against setup cost, adoption and whether the underlying offer is differentiated enough. Make the judgement depend on customer behaviour and implementation quality.' },
    { id: 'harbour-cafe-q4', prompt: 'Assess bank loan versus crowdfunding for the second site.', guidance: 'Loan may preserve ownership but create repayments when demand is uncertain; crowdfunding may raise finance and publicity but success is uncertain and rewards/communication can consume time. Link the judgement to Priya’s cash position and appetite for growth risk.' },
    { id: 'harbour-cafe-q5', prompt: 'Recommend whether Priya should open the second site now.', guidance: 'Weigh growth opportunity against weak weekday demand, rising costs, staff retention and finance risk. A strong answer states what evidence would make expansion sensible rather than treating growth as automatically positive.' },
  ],
})

export const northCityCareCase = caseStudySchema.parse({
  id: 'north-city-care',
  title: 'North City Care Services',
  bodyHtml: 'North City Care Services provides home-care visits under contracts with local authorities and private families. It employs 240 carers across three towns. Demand is rising, but recruitment is difficult and agency-worker costs have increased. Managers are considering more decentralised scheduling so local teams can respond faster to clients. A new digital rostering system could reduce travel time and missed visits, but some employees are worried about monitoring and changing shift patterns. Service quality is central to contract renewal and reputation.',
  facts: ['Service business','240 carers','Demand rising','Recruitment difficult','Agency costs increasing','Considering decentralisation','Digital rostering proposed','Quality affects contract renewal'],
  questions: [
    { id: 'care-q1', prompt: 'Explain one reason why a tight labour market may increase North City Care’s costs.', guidance: 'Link recruitment difficulty to higher wages, agency use, overtime, recruitment spend or retention measures. Apply to a labour-intensive care service.' },
    { id: 'care-q2', prompt: 'Analyse one benefit of decentralising scheduling decisions.', guidance: 'Local managers may know staff/client circumstances and respond faster, reducing missed visits or travel. Push the chain into quality, cost, employee satisfaction or contract performance.' },
    { id: 'care-q3', prompt: 'Analyse one risk of introducing digital rostering.', guidance: 'Consider implementation cost, employee resistance, data quality, training and inappropriate optimisation. Link poor implementation to morale, absenteeism, service quality or client trust.' },
    { id: 'care-q4', prompt: 'Assess whether North City Care should prioritise cost efficiency or service quality.', guidance: 'Avoid treating them as completely separate. Better scheduling may improve both, while excessive cost cutting can worsen continuity and quality. Make a contextual judgement based on contract renewal and labour scarcity.' },
    { id: 'care-q5', prompt: 'Recommend how management should implement the new system.', guidance: 'Use leadership/employee-involvement ideas. A strong recommendation balances consultation and local knowledge with the need for consistent standards and timely implementation.' },
  ],
})

export const atlasOutdoorCase = caseStudySchema.parse({
  id: 'atlas-outdoor',
  title: 'Atlas Outdoor plc',
  bodyHtml: 'Atlas Outdoor plc sells hiking clothing in the UK and several European markets. Revenue has grown, but shipping disruption and supplier unreliability have made material costs and delivery times less predictable. The business is considering switching part of its supply chain to higher-cost certified sustainable suppliers. Marketing research suggests younger customers value environmental credentials, but price competition is intense. Atlas is also considering closing one UK warehouse and using a larger automated distribution centre in the Netherlands.',
  facts: ['PLC','UK and European customers','Shipping disruption','Supplier reliability pressure','Sustainable supplier option','Price competition intense','Warehouse consolidation proposal','Automation and location decision'],
  questions: [
    { id: 'atlas-q1', prompt: 'Explain one way shipping disruption could affect Atlas Outdoor’s operational decisions.', guidance: 'Unreliable deliveries can increase the risk of shortages and missed customer orders, so management may reconsider supplier choice, inventory buffers, reorder decisions or supply-chain arrangements. Keep the chain tied to cost, speed, flexibility or customer service.' },
    { id: 'atlas-q2', prompt: 'Analyse one benefit of using certified sustainable suppliers.', guidance: 'Potential differentiation, reputation and willingness to pay may strengthen demand/loyalty. Balance this against higher input costs rather than assuming ethics automatically raise profit.' },
    { id: 'atlas-q3', prompt: 'Analyse one possible drawback of warehouse consolidation.', guidance: 'Automation and a larger centre may reduce unit cost, but concentration can reduce resilience, increase implementation risk or worsen delivery to some markets. Link to customer service and working capital where useful.' },
    { id: 'atlas-q4', prompt: 'Assess whether Atlas should pass higher material costs on through higher prices.', guidance: 'Use elasticity, competition, positioning and sustainability differentiation. Judgement should depend on customer willingness to pay and competitor behaviour.' },
    { id: 'atlas-q5', prompt: 'Recommend whether Atlas should move to the Netherlands distribution centre.', guidance: 'Weigh cost/capacity benefits against transition risk, workforce effects, resilience and service. Make the final judgement conditional on quantified savings and implementation reliability.' },
  ],
})

export const extendedCaseStudies = [harbourStreetCafeCase, northCityCareCase, atlasOutdoorCase]
