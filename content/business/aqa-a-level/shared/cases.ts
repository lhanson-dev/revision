import { caseStudySchema } from '../../../schema'

export const northstarMealsCase = caseStudySchema.parse({
  id: 'northstar-meals',
  title: 'Northstar Meals plc',
  bodyHtml: 'Northstar Meals plc manufactures chilled ready meals for UK supermarkets. Revenue has grown quickly after winning two national contracts, but its main factory now operates at 96% capacity utilisation. Retail customers impose strict delivery and quality targets. Northstar is considering a £14m automated production line that would increase capacity and reduce labour cost per unit. The project has a positive forecast NPV, although the forecasts assume supermarket volumes continue to grow. Employee representatives are concerned about job losses. Northstar also imports several ingredients, so exchange-rate movements can change input costs.',
  facts: ['UK food manufacturer','PLC','96% capacity utilisation','Strict retailer quality/delivery targets','£14m automation proposal','Positive forecast NPV','Employee job concerns','Imported inputs create exchange-rate exposure'],
  questions: [
    { id:'northstar-q1', prompt:'Analyse one benefit and one risk of operating at 96% capacity utilisation.', guidance:'Benefit may include strong use of resources/lower fixed cost per unit. Risk may include little spare capacity, maintenance pressure, delays or quality failures. Apply the chain to strict supermarket contracts.' },
    { id:'northstar-q2', prompt:'Assess how useful the positive NPV is when deciding whether to automate.', guidance:'NPV accounts for the time value of forecast cash flows and gives a financial benchmark. Evaluate forecast reliability, strategic fit, financing, workforce implementation and the consequence if supermarket growth is weaker than expected.' },
    { id:'northstar-q3', prompt:'Explain how exchange-rate changes could affect Northstar’s decisions.', guidance:'A weaker pound could raise the sterling cost of imported ingredients, changing margins, supplier choices, pricing or sourcing. Avoid claiming the effect is certain without knowing the direction and currencies.' },
    { id:'northstar-q4', prompt:'Recommend how Northstar should manage employee resistance to automation.', guidance:'Identify likely reason for resistance, then match a Kotter/Schlesinger response. Consultation/support may improve acceptance and information; urgency and the scale of job impact affect the appropriate method.' },
    { id:'northstar-q5', prompt:'To what extent should Northstar prioritise operational efficiency over employee engagement?', guidance:'Connect automation/capacity/cost with skill, quality, implementation and retention. A strong judgement recognises interdependence rather than treating efficiency and engagement as mutually exclusive.' },
  ],
})

export const willowHealthCase = caseStudySchema.parse({
  id: 'willow-health',
  title: 'Willow Health Clinics Ltd',
  bodyHtml: 'Willow Health Clinics Ltd operates 18 private physiotherapy clinics. It has grown organically for six years and has a strong reputation for specialist treatment. Labour turnover among physiotherapists has risen to 22% as a national competitor expands. Willow is considering acquiring a smaller chain of nine clinics. Management expects purchasing and managerial economies of scale, but the target company has a more centralised culture and lower employee engagement scores. Willow would need a large bank loan to fund the acquisition.',
  facts: ['Private healthcare service','18 clinics','Organic growth history','22% professional staff turnover','Nine-clinic acquisition target','Different organisational culture','Expected scale economies','Large loan required'],
  questions: [
    { id:'willow-q1', prompt:'Analyse how 22% labour turnover could affect Willow’s competitive position.', guidance:'Develop recruitment/training cost, capacity, continuity of care, specialist skills or customer experience. Context matters because employees deliver the service.' },
    { id:'willow-q2', prompt:'Assess whether external growth is preferable to continued organic growth.', guidance:'External growth may add clinics, customers and scale faster; risks include acquisition price, debt, culture integration and implementation. Organic growth may preserve culture/control but be slower.' },
    { id:'willow-q3', prompt:'Analyse one possible economy of scale from the acquisition.', guidance:'Use a specified economy such as purchasing or managerial. Show how greater scale could reduce cost or improve expertise, then recognise that realisation depends on integration.' },
    { id:'willow-q4', prompt:'How should Willow assess the effect of the acquisition on gearing?', guidance:'Calculate/compare gearing when figures are provided, then interpret debt exposure in relation to cash-flow reliability, interest rates, returns and risk. Do not label all higher gearing automatically bad.' },
    { id:'willow-q5', prompt:'Recommend how Willow should approach the cultural integration.', guidance:'Use culture, communication, leadership and change concepts. A strong answer identifies differences before imposing a single approach and links implementation to retention and service quality.' },
  ],
})

export const kestrelBikesCase = caseStudySchema.parse({
  id: 'kestrel-bikes',
  title: 'Kestrel Bikes Ltd',
  bodyHtml: 'Kestrel Bikes Ltd is a small UK manufacturer of premium cargo bicycles. It sells mainly online and has differentiated through custom design and durable components. A distributor in the Netherlands wants exclusive rights to sell Kestrel bikes in three European countries. Management could license the brand and designs to a European producer instead, or invest directly in a small assembly facility. The owners have limited retained profit and are worried that rapid international growth could cause overtrading and weaken quality.',
  facts: ['Small UK manufacturer','Premium differentiation','Online sales','European market opportunity','Export/distribution option','Licensing option','Direct-investment option','Overtrading and quality concerns'],
  questions: [
    { id:'kestrel-q1', prompt:'Analyse why Kestrel’s differentiation may support international growth.', guidance:'Connect custom design/durability to customer value, pricing power and a reason to choose Kestrel. Evaluate whether the value transfers to different markets.' },
    { id:'kestrel-q2', prompt:'Compare licensing with direct investment as an entry method.', guidance:'Licensing can reduce capital commitment and speed entry but sacrifices control; direct investment provides more control but needs finance, knowledge and management capacity.' },
    { id:'kestrel-q3', prompt:'Explain how overtrading could occur even if international sales are profitable.', guidance:'Rapid sales growth can require inventory, labour and other spending before receipts arrive, creating a working-capital shortage.' },
    { id:'kestrel-q4', prompt:'Assess whether Kestrel should use a focus strategy as it expands.', guidance:'A narrow premium segment can reinforce specialist capability and differentiation; the market may be limited and international expansion may tempt the firm to broaden too quickly.' },
    { id:'kestrel-q5', prompt:'Recommend an international entry method.', guidance:'Make a conditional judgement using finance, control, quality, speed, local knowledge and risk. Do not assume the highest-control option is automatically best.' },
  ],
})

export const pulseLearningCase = caseStudySchema.parse({
  id: 'pulse-learning',
  title: 'Pulse Learning Ltd',
  bodyHtml: 'Pulse Learning Ltd provides subscription-based workplace training software. Customer numbers have risen, but several larger technology firms now offer competing products. Pulse holds large amounts of customer usage data and is considering using data mining to personalise training recommendations. Management also wants to enter the US market using an alliance with a local provider. Software developers favour a task culture and high autonomy, while the new chief operating officer wants clearer processes and performance targets.',
  facts: ['Subscription software service','Customer growth','Larger new competitors','Large usage-data set','Data-mining proposal','US alliance proposal','Task-culture preference','Pressure for clearer processes'],
  questions: [
    { id:'pulse-q1', prompt:'Use Porter’s five forces to analyse one threat to Pulse.', guidance:'Select a relevant force such as rivalry, substitutes or entry. Explain how it changes pricing, acquisition cost, retention, investment or likely profitability.' },
    { id:'pulse-q2', prompt:'Assess the strategic value of data mining.', guidance:'Potential benefits include personalisation, retention, product decisions and efficiency. Risks include data quality, privacy/trust, capability, investment and competitor imitation.' },
    { id:'pulse-q3', prompt:'Analyse one benefit of using an alliance to enter the US market.', guidance:'Local knowledge, distribution or lower capital commitment may help. Push the chain into speed/risk/customer acquisition and recognise dependence/control trade-offs.' },
    { id:'pulse-q4', prompt:'Assess whether Pulse should change its organisational culture.', guidance:'Task culture may support innovation and specialist autonomy; more process may improve scale and consistency. The answer should distinguish helpful discipline from a culture change that damages innovation.' },
    { id:'pulse-q5', prompt:'Recommend how Pulse can sustain competitive advantage.', guidance:'Bring together differentiation, data/capabilities, innovation, customer value and the competitive environment. A sustainable answer requires continued adaptation rather than one static resource.' },
  ],
})

export const emberHomeCase = caseStudySchema.parse({
  id: 'ember-home',
  title: 'Ember Home plc',
  bodyHtml: 'Ember Home plc sells furniture through 70 UK stores and online. Store revenue has been flat while e-commerce has grown strongly. The board is considering closing 20 stores, investing in a highly automated national distribution centre and expanding its online range. Some directors see this as necessary response to technological and social change; others worry about redundancy costs, customer reaction and the risk of concentrating distribution in one site. Ember also wants to reduce its environmental impact and has published People, Planet and Profit targets.',
  facts: ['Large omnichannel retailer','70 stores','Store revenue flat','E-commerce growing','20-store closure proposal','Automated distribution-centre proposal','Concentration risk','Triple Bottom Line targets'],
  questions: [
    { id:'ember-q1', prompt:'Analyse how social and technological change may create strategic pressure for Ember.', guidance:'Connect online buying behaviour and e-commerce technology to channel economics, customer expectations, store role and investment decisions.' },
    { id:'ember-q2', prompt:'Use SWOT thinking to classify the main issues in the case.', guidance:'Internal strengths/weaknesses should be separated from external opportunities/threats. The value comes from prioritising which issues change the strategy, not simply filling four boxes.' },
    { id:'ember-q3', prompt:'Assess the value of the Triple Bottom Line when evaluating the proposal.', guidance:'It broadens performance beyond profit to people and planet. Evaluate trade-offs, measurement quality, stakeholder priorities and whether targets affect actual decisions.' },
    { id:'ember-q4', prompt:'Analyse one risk of concentrating distribution in one automated centre.', guidance:'Centralisation may improve scale and control but can increase disruption concentration, delivery dependence and implementation risk.' },
    { id:'ember-q5', prompt:'Recommend whether Ember should close 20 stores.', guidance:'Compare cost/capacity/channel evidence with customer coverage, brand, redundancy, implementation and long-term demand. A strong judgement can support selective closure rather than all-or-nothing thinking.' },
  ],
})

export const tideRenewablesCase = caseStudySchema.parse({
  id: 'tide-renewables',
  title: 'Tide Renewables plc',
  bodyHtml: 'Tide Renewables plc develops and maintains offshore wind projects. A proposed new project requires a large up-front investment and has a payback period of seven years, positive NPV and an ARR above the board’s target. However, construction depends on planning approvals, specialised suppliers and a network of linked activities. Government environmental policy supports renewable energy, but interest rates have risen and managers expect some equipment costs to remain volatile. The project team is using network analysis and contingency plans.',
  facts: ['Renewable-energy developer','Large capital investment','Seven-year payback','Positive NPV','ARR above target','Planning and supplier dependencies','Higher interest rates','Network and contingency planning'],
  questions: [
    { id:'tide-q1', prompt:'Assess what the three investment-appraisal results tell Tide.', guidance:'Payback addresses speed/liquidity exposure; ARR addresses average return; NPV incorporates timing through discounting. None removes forecast, regulatory or implementation risk.' },
    { id:'tide-q2', prompt:'Analyse how higher interest rates could affect the strategic decision.', guidance:'Borrowing may be more expensive and discount rates/opportunity cost may change. Link to financing, NPV interpretation and the required return rather than assuming the project must be cancelled.' },
    { id:'tide-q3', prompt:'Explain the value of network analysis to Tide.', guidance:'Dependencies and critical path can reveal minimum duration and where delays threaten completion; this supports scheduling and resource attention but relies on duration estimates.' },
    { id:'tide-q4', prompt:'Assess the value of contingency planning.', guidance:'Plans can reduce reaction time if approvals, suppliers or costs change. They consume management effort and cannot anticipate every scenario.' },
    { id:'tide-q5', prompt:'Recommend whether Tide should proceed.', guidance:'Combine financial appraisal with policy, financing, supplier, project, risk and strategic-fit evidence. The conclusion should state which uncertainties would change the decision.' },
  ],
})

export const caseStudies = [northstarMealsCase, willowHealthCase, kestrelBikesCase, pulseLearningCase, emberHomeCase, tideRenewablesCase]
