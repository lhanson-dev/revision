import { topicSchema, type Topic } from '../../../schema'

const rawTopics: Topic[] = [
  {
    id: 'business', order: 1, title: '1. What is Business?', shortTitle: 'Business', sections: [
      { id: 'purpose-objectives-profit', title: 'Purpose, objectives & profit', points: [
        'Businesses exist to satisfy needs and wants while pursuing objectives such as profit, growth, survival, cash flow, social or ethical aims.',
        'Mission describes broad purpose and direction; objectives turn that purpose into targets that can guide decisions and measure performance.',
        'Profit = revenue − total costs. Revenue is also called turnover or sales. Total costs combine fixed and variable costs.',
        'Objectives can conflict. Growth may require investment that reduces short-term profit or cash; ethical choices may raise cost while supporting reputation and long-term demand.',
      ] },
      { id: 'forms-ownership', title: 'Business forms & ownership', points: [
        'Sole traders have simple ownership and control but unlimited liability. Limited companies separate the business legal entity from its owners and provide limited liability.',
        'Private limited companies have privately held shares. Public limited companies can sell shares publicly and may access larger pools of equity finance, but face greater disclosure and shareholder pressure.',
        'Public-sector organisations are owned or controlled by government; non-profits and social enterprises may place service or social aims alongside financial sustainability.',
        'Ordinary share capital gives ownership rights. Market capitalisation = current share price × number of issued shares. Dividends distribute eligible profits to shareholders.',
      ] },
      { id: 'shareholders-share-price', title: 'Shareholders & share price', points: [
        'Shareholders invest for potential dividends and capital growth, although their priorities and time horizons can differ.',
        'Share prices can respond to expected future performance, interest rates, economic conditions, competitive events, strategy and investor confidence.',
        'A falling share price does not automatically prove poor current performance, but can influence confidence, financing options, management pressure and takeover vulnerability.',
      ] },
      { id: 'external-environment', title: 'External environment', points: [
        'Competition, market conditions, incomes and interest rates can change both demand and business costs.',
        'Demographic change can alter market size, customer needs, labour supply and location decisions.',
        'Environmental issues and fair trade can affect sourcing cost, operations, reputation, differentiation and willingness to pay.',
        'Strong analysis explains how an external change affects a specific decision rather than merely naming the factor.',
      ] },
    ],
  },
  {
    id: 'leadership', order: 2, title: '2. Managers, Leadership & Decision Making', shortTitle: 'Leadership', sections: [
      { id: 'management-leadership', title: 'Management & leadership', points: [
        'Management focuses on organising resources and achieving objectives; leadership focuses on direction, influence and people. In practice the roles overlap.',
        'Autocratic leadership concentrates decisions with the leader; paternalistic leadership retains leader control while considering employee welfare.',
        'Democratic leadership involves employees in decisions; laissez-faire leadership gives substantial autonomy. Effectiveness depends on context, urgency, skills and organisational culture.',
        'The Tannenbaum–Schmidt continuum presents leadership behaviour from manager-centred control towards greater subordinate freedom rather than treating styles as fixed boxes.',
      ] },
      { id: 'decision-making', title: 'Decision making under risk', points: [
        'Scientific decision making uses data, models and structured evidence. Intuition uses experience and judgement. Good decisions may combine both.',
        'Decision trees show choices, possible outcomes and probabilities. Expected value = sum of probability × outcome. Net gain = expected value − cost of the decision.',
        'Risk involves outcomes whose probabilities can be estimated; uncertainty is harder to quantify reliably. Expected value does not remove either.',
        'Opportunity cost is the value of the next best alternative sacrificed when a choice is made.',
      ] },
      { id: 'decision-influences', title: 'Influences on decisions', points: [
        'Mission, objectives, ethics, competition, the wider external environment and resource constraints can all alter which option is best.',
        'The quality of the input data matters: an apparently precise model can still produce a poor recommendation if assumptions or probabilities are weak.',
        'Managers should compare quantitative evidence with strategic fit, stakeholder effects, feasibility and the organisation’s attitude to risk.',
      ] },
      { id: 'stakeholders', title: 'Stakeholder relationships', points: [
        'Stakeholders include owners, employees, customers, suppliers, government and communities. Their needs may overlap or conflict.',
        'Power–interest mapping helps managers decide which stakeholders require close management, consultation, communication or monitoring.',
        'Communication and consultation can improve information and acceptance, but may add time and expose disagreement. The appropriate approach depends on stakeholder power and the decision.',
      ] },
    ],
  },
  {
    id: 'marketing', order: 3, title: '3. Marketing Management', shortTitle: 'Marketing', sections: [
      { id: 'objectives-research', title: 'Objectives, markets & research', points: [
        'Marketing objectives can cover sales volume/value, market size, market or sales growth, market share and brand loyalty.',
        'Primary research is collected for the current purpose; secondary research already exists. Qualitative data explores meanings and opinions; quantitative data is numerical.',
        'Random, stratified and quota sampling can reduce the time and cost of research, but sample design affects how confidently results can be generalised.',
        'Correlation shows association, not causation. Confidence intervals express uncertainty around estimates. Extrapolation projects an observed trend beyond the data and becomes less reliable when conditions change.',
      ] },
      { id: 'elasticity-data', title: 'Elasticity & marketing data', points: [
        'Price elasticity of demand describes how responsive demand is to a price change. AQA A-level requires interpretation rather than calculation of PED values.',
        'Income elasticity of demand describes how responsive demand is to changes in consumer income; the sign and magnitude help managers think about different products and economic conditions.',
        'Managers should use elasticity estimates cautiously because competitors, branding, time period, product differentiation and data quality can change actual responses.',
        'Market share = business sales ÷ total market sales × 100. Market growth and sales growth should be compared before drawing conclusions about competitive position.',
      ] },
      { id: 'stp', title: 'Segmentation, targeting & positioning', points: [
        'Segmentation divides a market into groups, including demographic, geographic, income and behavioural segments.',
        'Targeting selects which segment or segments to serve. Niche targeting offers specialisation and potential loyalty or premium pricing; mass targeting offers scale but usually greater direct competition.',
        'Positioning is how customers perceive the offer relative to competitors. Market mapping plots competing offers against two characteristics to reveal relative positions and possible gaps.',
      ] },
      { id: 'marketing-mix', title: 'The integrated marketing mix', points: [
        'The 7Ps are Product, Price, Promotion, Place, People, Process and Physical environment/evidence. They should reinforce a coherent target and position.',
        'Product decisions include the Boston Matrix, product life cycle, extension strategies and new product development. These models support judgement rather than predict outcomes automatically.',
        'Pricing decisions include penetration pricing and price skimming. Promotion includes branding, social media and viral marketing. Place includes multi-channel distribution.',
        'Digital marketing and e-commerce can increase reach, data and convenience but can intensify price transparency, competition, fulfilment demands and technology risk.',
      ] },
    ],
  },
  {
    id: 'operations', order: 4, title: '4. Operational Management', shortTitle: 'Operations', sections: [
      { id: 'objectives-performance', title: 'Objectives & performance', points: [
        'Operational objectives include cost, quality, speed of response, flexibility, environmental objectives and added value.',
        'Labour productivity = output ÷ labour input. Unit cost = total cost ÷ units produced. Capacity is maximum possible output in a period.',
        'Capacity utilisation = actual output ÷ maximum output × 100. High utilisation can spread fixed costs but reduce spare capacity for demand surges, maintenance or disruption.',
      ] },
      { id: 'efficiency-resources', title: 'Efficiency, productivity & resources', points: [
        'Efficiency is about minimising wasted resources; productivity measures output relative to an input. Raising one does not guarantee improved quality or profit.',
        'Lean production aims to remove waste. Just in Time minimises inventory and depends on reliable supply; Just in Case deliberately holds more protection against disruption.',
        'Labour-intensive processes rely relatively more on people; capital-intensive processes rely relatively more on machinery/technology. The best mix depends on scale, flexibility, quality, finance and the nature of the product or service.',
        'Automation, robotics and better information links can improve speed, consistency and control but require investment, skills and change management.',
      ] },
      { id: 'quality', title: 'Quality decisions', points: [
        'Quality control detects defects through inspection or checking; quality assurance builds prevention and standards into the process.',
        'Better quality can reduce rework and returns and support reputation, loyalty and pricing. Improvement may require training, process redesign, supplier changes or investment.',
        'Poor quality can damage cost, speed, customer trust and repeat purchase, so quality decisions connect operations directly to marketing and finance.',
      ] },
      { id: 'inventory-supply-chain', title: 'Inventory & supply chains', points: [
        'Inventory-control charts use ideas such as lead time, reorder level, buffer inventory and reorder quantity. Longer or less reliable lead times may justify earlier reordering or more buffer.',
        'Businesses can match supply to demand through outsourcing, temporary/part-time labour and producing to order. Each changes cost, control, speed and risk.',
        'Supplier choice should consider price, quality, reliability, capacity, flexibility, ethics and strategic dependence. Supply-chain performance can determine the competitiveness of the final business.',
      ] },
    ],
  },
  {
    id: 'finance', order: 5, title: '5. Financial Management', shortTitle: 'Finance', sections: [
      { id: 'objectives-profit', title: 'Objectives, cash & profit', points: [
        'Financial objectives include return on investment, revenue, cost, profit and cash-flow targets.',
        'Cash flow records the timing of money entering and leaving; profit measures revenue against costs. A profitable business can still fail if it cannot meet cash obligations.',
        'Gross profit = revenue − cost of sales. Operating profit deducts operating expenses. Profit for the year reflects the later finance/tax items relevant to the statement.',
      ] },
      { id: 'budgets-cash-flow', title: 'Budgets & cash-flow forecasts', points: [
        'Budgets set planned revenues and costs. Variance analysis compares actual with budget; whether a variance is favourable or adverse depends on what is being measured.',
        'Cash-flow forecasts track opening balance, inflows, outflows, net cash flow and closing balance. They expose timing shortages but remain forecasts based on assumptions.',
        'Managing receivables and payables changes the timing of cash flows. Faster collection can support liquidity; delaying suppliers too aggressively can damage relationships or supply reliability.',
      ] },
      { id: 'break-even-profitability', title: 'Break-even & profitability', points: [
        'Contribution per unit = selling price − variable cost per unit. Total contribution = contribution per unit × units sold, or revenue − total variable cost.',
        'Break-even output = fixed costs ÷ contribution per unit. Margin of safety = actual or forecast output − break-even output.',
        'Break-even charts show total revenue and total cost; their intersection is break-even. Changes in price, variable cost and fixed cost alter the position.',
        'Gross, operating and profit-for-year margins compare each profit measure with revenue. Trend and competitor context matter more than a ratio in isolation.',
      ] },
      { id: 'sources-improvement', title: 'Finance sources & improvement', points: [
        'Internal finance includes retained profit. External sources include debt factoring, overdrafts, share capital, loans, venture capital and crowdfunding.',
        'Choice depends on duration, cost, risk, cash-flow reliability, control, collateral, business form and the purpose of finance.',
        'Cash flow can be improved through timing, working-capital management, cost control or suitable finance. Profitability can be improved through revenue, contribution, productivity and avoidable-cost decisions.',
        'A short-term cash improvement can damage long-term profit or competitiveness, so financial decisions must be evaluated across functions and time horizons.',
      ] },
    ],
  },
  {
    id: 'hr', order: 6, title: '6. Human Resource Management', shortTitle: 'HR', sections: [
      { id: 'objectives-performance', title: 'Objectives & performance', points: [
        'HR objectives include engagement, talent development, training, diversity, value alignment and having the right number, skills and location of employees.',
        'Hard HRM treats labour primarily as a resource/cost to manage; soft HRM emphasises development, commitment and involvement.',
        'HR data includes labour turnover, labour productivity, employee costs as a percentage of turnover and labour cost per unit. Context is essential before judging whether a value is good or bad.',
      ] },
      { id: 'design-flow', title: 'Organisational design & HR flow', points: [
        'Structures include functional, product-based, regional and matrix. Design choices include authority, span of control, hierarchy, delegation, centralisation and decentralisation.',
        'Changing design can improve speed, accountability or local responsiveness but can weaken consistency, control or communication if poorly implemented.',
        'Human-resource flow connects workforce planning, recruitment, training, redeployment and redundancy as organisational needs change.',
      ] },
      { id: 'motivation-engagement', title: 'Motivation & engagement', points: [
        'Taylor emphasises financial reward linked to measurable output; Maslow describes a hierarchy of needs; Herzberg distinguishes hygiene factors from motivators.',
        'Financial methods include piece rate, commission, salary schemes and performance-related pay. Non-financial methods include empowerment, team working, flexible working, job enrichment and rotation.',
        'No method motivates everyone in every context. Task design, measurability, employee needs, fairness and culture influence effectiveness.',
      ] },
      { id: 'relations', title: 'Employee relations', points: [
        'Employee involvement may use direct consultation, trade unions, works councils and other communication routes.',
        'Good employee relations can support trust, retention, information flow and change implementation; poor relations can increase conflict, disruption, turnover and reputational risk.',
        'Technology and labour-market conditions can change required skills, working patterns, monitoring, wage pressure and recruitment difficulty.',
      ] },
    ],
  },
  {
    id: 'strategic-position', order: 7, title: '7. Analysing the Strategic Position', shortTitle: 'Strategic Position', sections: [
      { id: 'mission-objectives-strategy', title: 'Mission, objectives & strategy', points: [
        'Corporate objectives translate mission into organisation-wide priorities; functional objectives align marketing, operations, finance and HR with those priorities.',
        'Strategy is the long-term direction and approach used to achieve objectives; tactics are more immediate actions used to implement strategy.',
        'Objectives and decisions are influenced by ownership, short-term pressures and the internal/external environment. Strategic choices then reshape functional priorities.',
        'SWOT separates internal strengths/weaknesses from external opportunities/threats. Its value depends on evidence, prioritisation and honest interpretation rather than producing a long list.',
      ] },
      { id: 'financial-ratios', title: 'Financial ratio analysis', points: [
        'ROCE compares operating profit with capital employed to assess the return generated from long-term capital.',
        'The current ratio compares current assets with current liabilities as an indicator of short-term liquidity. A higher ratio is not automatically better because excess working capital may be inefficient.',
        'Gearing compares long-term debt with capital employed. Higher gearing can increase financial risk but the significance depends on cash flow, interest rates and investment returns.',
        'Efficiency ratios include payables days, receivables days and inventory turnover. Ratios should be compared over time, against competitors and with qualitative context.',
      ] },
      { id: 'overall-performance', title: 'Overall performance & core competences', points: [
        'Strategic analysis uses financial statements alongside marketing, operations and HR data. A single financial measure can hide causes or future risks.',
        'Core competences are capabilities that help the business compete and can influence strategic options.',
        'Short-term performance may conflict with long-term capability investment. Elkington’s Triple Bottom Line prompts consideration of Profit, People and Planet.',
      ] },
      { id: 'external-strategic-environment', title: 'Political, economic, social & technological environment', points: [
        'Political/legal analysis includes competition, labour-market and environmental law plus government policy on enterprise, regulators, infrastructure, environment and international trade.',
        'Economic analysis includes GDP, taxation, exchange rates, inflation, fiscal policy, monetary policy and open trade versus protectionism. Students must interpret economic data and its business implications.',
        'Social change includes demographics, migration, consumer lifestyles and the growth of online business. CSR includes arguments for/against, stakeholder versus shareholder perspectives and Carroll’s CSR pyramid.',
        'Technological change can transform costs, data, customer behaviour, jobs, processes and strategic possibilities across every function.',
      ] },
      { id: 'competition-investment', title: 'Competition & investment appraisal', points: [
        'Porter’s five forces are threat of entry, buyer power, supplier power, rivalry and threat of substitutes. Changes in the forces can alter industry profitability and strategic choices.',
        'Investment appraisal includes calculation and interpretation of payback, average rate of return and net present value.',
        'Investment decisions should also consider criteria, non-financial factors, risk and uncertainty. A financially attractive project can still be strategically unsuitable or infeasible.',
      ] },
    ],
  },
  {
    id: 'strategic-direction', order: 8, title: '8. Choosing Strategic Direction', shortTitle: 'Strategic Direction', sections: [
      { id: 'ansoff', title: 'Ansoff matrix', points: [
        'Ansoff’s matrix frames strategic direction by combining existing/new markets with existing/new products: market penetration, market development, new product development and diversification.',
        'Market penetration generally uses existing products in existing markets; market development takes existing products into new markets; product development creates new products for existing markets; diversification combines new products and new markets.',
        'Risk tends to rise as the organisation moves further from existing products, markets and competences, but the actual risk depends on knowledge, resources, competition and execution.',
      ] },
      { id: 'porter-positioning', title: 'Strategic positioning', points: [
        'Porter’s generic positioning approaches include low cost, differentiation and focus. Focus targets a narrower segment and may combine with a distinctive cost or benefit position.',
        'Low-cost advantage depends on a cost base that competitors cannot easily match without damaging their offer. Differentiation depends on benefits customers value enough to support preference or price.',
        'The right position depends on resources, capabilities, customers, competitors and industry conditions rather than on one universally best strategy.',
      ] },
      { id: 'competitive-advantage', title: 'Competitive advantage', points: [
        'Competitive advantage exists when the business creates superior value or cost performance that supports stronger competitive outcomes.',
        'Advantages can erode through imitation, technological change, shifting customer preferences, new entrants or rising supplier/buyer power.',
        'A sustainable strategy aligns positioning with capabilities, investment and changing market conditions rather than relying on a label alone.',
      ] },
    ],
  },
  {
    id: 'strategic-methods', order: 9, title: '9. Strategic Methods', shortTitle: 'Strategic Methods', sections: [
      { id: 'growth-scale', title: 'Growth, retrenchment & scale', points: [
        'Organic growth develops the existing business; external growth uses combinations or agreements with other organisations. Retrenchment deliberately reduces scope or scale.',
        'Growth can create technical, purchasing and managerial economies of scale and economies of scope, but can also create diseconomies, coordination problems and overtrading.',
        'Synergy exists when combined activities create greater value or efficiency than they would separately, but expected synergies may fail because of culture, systems, price paid or implementation.',
        'Methods include mergers, takeovers, ventures and franchising; integration may be horizontal, vertical backward/forward or conglomerate.',
      ] },
      { id: 'innovation', title: 'Innovation', points: [
        'Innovation may involve products or processes. Pressure can come from competition, technology, costs, customers or strategic opportunity.',
        'Innovative organisations may use Kaizen, research and development, intrapreneurship and benchmarking. Each has different cost, speed, cultural and risk implications.',
        'Patents and copyright can protect intellectual property, but protection has limits and does not guarantee commercial success.',
      ] },
      { id: 'globalisation', title: 'Globalisation & internationalisation', points: [
        'Globalisation can expand markets, sources of supply and competitive pressure. Emerging economies may offer growth, resources or production opportunities but introduce additional political, economic and cultural risks.',
        'International entry methods include exporting, licensing, alliances and direct investment. Control, commitment, speed, knowledge and risk differ between methods.',
        'Offshoring moves activity abroad; reshoring brings activity back. Location decisions should compare cost with quality, resilience, speed, skills and reputation.',
        'International businesses balance pressure for local responsiveness with pressure for cost reduction; the appropriate balance varies by market and product.',
      ] },
      { id: 'digital-strategy', title: 'Digital technology', points: [
        'Strategic digital technology includes automation, e-commerce, big data and data mining.',
        'Digital investment can improve scale, personalisation, information, speed and cost, but can create cyber, privacy, implementation, skills and dependency risks.',
        'The strategic value of technology depends on how it changes customer value, processes and competitive advantage rather than simply whether it is new.',
      ] },
    ],
  },
  {
    id: 'strategic-change', order: 10, title: '10. Managing Strategic Change', shortTitle: 'Strategic Change', sections: [
      { id: 'managing-change', title: 'Managing change', points: [
        'Change can be internal or external, incremental or disruptive. Its value depends on whether the organisation adapts faster and more effectively than the costs and disruption it creates.',
        'Lewin’s force-field analysis compares forces driving a proposed change with forces restraining it. Managers can strengthen drivers, reduce restraints or redesign the change.',
        'Flexible organisations may use restructuring, delayering, flexible employment contracts, organic rather than mechanistic structures and stronger knowledge/information management.',
      ] },
      { id: 'resistance-change', title: 'Resistance to change', points: [
        'Kotter and Schlesinger identify four broad reasons for resistance: self-interest; misunderstanding/fear/lack of trust; different assessments of the situation; and low tolerance or preference for the existing position.',
        'Their six approaches to overcoming resistance are education and communication; participation and involvement; facilitation and support; negotiation and agreement; manipulation and co-option; and explicit or implicit coercion.',
        'No response is automatically best. Urgency, trust, power, information, ethics and the cause of resistance should shape the method.',
      ] },
      { id: 'culture-implementation', title: 'Culture & implementation', points: [
        'Handy’s cultural types include task, role, power and person culture. Culture affects behaviour, communication, authority, risk-taking and receptiveness to strategy.',
        'Changing culture is difficult because routines, incentives, leadership behaviour, identity and informal norms can reinforce the existing system.',
        'Effective strategic implementation depends on leadership, communication and organisational structure as well as the quality of the strategy itself.',
      ] },
      { id: 'network-analysis', title: 'Network analysis', points: [
        'Network analysis represents activities and dependencies in a project so managers can estimate timing and identify the critical path.',
        'The critical path is the sequence of activities that determines the minimum project duration. A delay on a critical activity delays the project unless time is recovered elsewhere.',
        'Total float shows how long a non-critical activity can be delayed without delaying the overall project, subject to the network assumptions.',
        'Network analysis supports planning but durations are estimates and it does not by itself capture quality, resource conflicts or behavioural risks.',
      ] },
      { id: 'strategy-failure', title: 'Strategy problems & failure', points: [
        'Strategies can fail through weak assumptions, poor implementation, changing conditions, inadequate resources, resistance or a mismatch between objectives and capabilities.',
        'Planned strategy is deliberately formulated in advance; emergent strategy develops through learning and responses as events unfold.',
        'Strategic drift occurs when strategy fails to keep pace with environmental change. Regular performance evaluation can reveal drift but data can lag or be misinterpreted.',
        'Strategic planning, contingency planning and crisis management prepare different levels of response to uncertainty; excessive rigidity can still reduce adaptability.',
      ] },
    ],
  },
]

export const topics = rawTopics.map((topic) => topicSchema.parse(topic))
