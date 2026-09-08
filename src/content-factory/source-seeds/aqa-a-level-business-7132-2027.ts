import type { FoundationCurriculumRequirementInput } from '../foundation-compilation'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID } from './aqa-a-level-business-7132-2027-coverage'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID = 'revision-aqa-7132-2027-course-truth-seed'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED = {
  schemaVersion: 4 as const,
  seedId: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
  coverageProfileId: AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID,
  status: 'governed_main_only' as const,
  purpose: 'Revision-owned structured semantic evidence seed for the AQA A-level Business 7132 / 2027 Foundation. It is reconciled to an independent source-led coverage profile and is a compilation input, not an approved Course Foundation.',
  semanticEvidencePolicy: {
    authorship: 'REVISION_OWNED' as const,
    role: 'Provide substantive candidate subject semantics after source-led curriculum reconciliation so downstream workers do not invent definitions, methods, formulae or scope from model memory.',
    upstreamEvidenceRefs: ['dfe-business-subject-content', 'libretexts-business-fundamentals'],
    assuranceStatus: 'candidate_only_pending_independent_and_expert_review' as const,
  },
  upstreamEvidence: [
    {
      sourceRef: 'dfe-business-subject-content',
      role: 'OPEN common GCE AS/A-level Business subject-content scope under the Open Government Licence, subject to live revalidation.',
    },
    {
      sourceRef: 'libretexts-business-fundamentals',
      role: 'OPEN CC BY 4.0 secondary business-knowledge cross-checking source, subject to live licence/terms revalidation.',
    },
  ],
  limitations: [
    'This seed is Revision-owned candidate Course Truth evidence and is not qualified-human approval.',
    'AQA REFERENCE_ONLY material controls course/cohort alignment and the source-led coverage profile; protected AQA prose is not a generative source and is not reproduced here.',
    'The independent coverage profile defines what must be represented. The semantic seed must not narrow that requirement universe or broaden named method sets from model memory.',
    'Independent Foundation review, fresh external-source challenge and qualified subject/assessment expert review remain mandatory before Course Truth can become an Approved Course Foundation.',
  ],
  requirements: [
    requirement('aqa-3-0-course-context', '3.0', 'Course-wide business context', [
      'Across the course, apply business ideas to varied business contexts and analyse interrelated functional decisions rather than isolated silos. Evaluate competition, technology, stakeholders, uncertainty, data quality, ethical and environmental consequences, and use quantitative and non-quantitative evidence including index numbers where relevant.',
    ]),
    requirement('aqa-3-0-strategic-context', '3.0 Strategic decision making', 'Strategic decision-making context', [
      'Strategic decisions build on functional decision making and should consider technology, Corporate Social Responsibility, ethical and environmental consequences, forecasting, feasibility, risk, uncertainty and stakeholders. Conclusions should be evidence-based and conditional on context rather than model-driven.',
    ]),

    requirement('aqa-3-1-1', '3.1.1', 'Business nature and purpose', [
      'Explain business purpose and distinguish objectives such as profit, growth, survival, cash flow, social and ethical aims. Connect objectives to mission, explain why businesses set objectives and how circumstances can change them. Calculate and interpret revenue, fixed costs, variable costs, total costs and profit while distinguishing accounting profit from cash flow.',
    ]),
    requirement('aqa-3-1-2', '3.1.2', 'Business forms', [
      'Compare sole traders, private limited companies, public limited companies, private and public sector organisations, non-profit organisations and social enterprises. Explain unlimited liability and limited liability, ordinary share capital, market capitalisation and dividends. Analyse why different business forms are chosen or changed, the role of shareholders and why they invest, influences on share price and the significance of share-price changes, and how ownership affects mission and objectives.',
    ]),
    requirement('aqa-3-1-3', '3.1.3', 'External business environment', [
      'Analyse how competition, market conditions, incomes, interest rates, demographic change, environmental pressures and fair trade can alter business costs, demand, opportunities, constraints and objectives. External influences are contextual rather than automatically favourable or adverse.',
    ]),

    requirement('aqa-3-2-1', '3.2.1', 'Management and leadership', [
      'Distinguish management from leadership and compare autocratic, paternalistic, democratic and laissez-faire leadership. Analyse influences on the choice of management and leadership style. Use the Tannenbaum Schmidt continuum to analyse how leader freedom and subordinate participation can vary, and judge effectiveness from the situation rather than assuming one style is universally best.',
    ]),
    requirement('aqa-3-2-2', '3.2.2', 'Management decision making', [
      'Compare scientific or data-led decision making with intuition. Construct and interpret decision trees using probabilities, expected value and net gains where appropriate, and evaluate the use and value of decision trees. Evaluate risks, rewards, uncertainty and opportunity cost, and analyse how mission, objectives, ethics, the external environment including competition, and resource constraints affect decisions.',
    ]),
    requirement('aqa-3-2-3', '3.2.3', 'Stakeholder management', [
      'Identify stakeholder needs and potential overlap or conflict, distinguish stakeholder power and interest, and use power-interest reasoning to judge management priorities. Evaluate communication and consultation as relationship-management choices rather than automatic solutions.',
    ]),

    requirement('aqa-3-3-cross-cutting', '3.3', 'Marketing cross-cutting context', [
      'Marketing decisions should integrate technology, ethical and environmental considerations, market conditions and competition, competitiveness and the interrelationship between marketing and operations, finance and human resources.',
    ]),
    requirement('aqa-3-3-1', '3.3.1', 'Marketing objectives', [
      'Explain the value of setting marketing objectives and evaluate objectives using measures such as sales volume, sales value, market size, market and sales growth, market share and brand loyalty. Calculate relevant growth, share and size measures where data permit and connect them to wider business objectives.',
    ]),
    requirement('aqa-3-3-2', '3.3.2', 'Markets and customers', [
      'Evaluate the value of primary and secondary research and qualitative and quantitative data. Compare random, stratified and quota sampling and evaluate the value of sampling. Interpret positive and negative correlation and its strength, confidence intervals and extrapolation while recognising uncertainty and avoiding automatic causal claims. For price elasticity and income elasticity, interpret, not calculate, the supplied elasticity information, analyse effects on demand and revenue, and evaluate the value of elasticity evidence and data in marketing decisions and planning.',
    ]),
    requirement('aqa-3-3-3', '3.3.3', 'Segmentation targeting and positioning', [
      'Explain the process and value of segmentation, targeting and positioning. Segment markets using demographic, geographic, income and behavioural variables. Compare niche and mass marketing, analyse influences on target-market and positioning choices, and use market mapping to assess positioning and competitive gaps.',
    ]),
    requirement('aqa-3-3-4', '3.3.4', 'Marketing mix', [
      'Use the full 7Ps as an integrated marketing mix for goods and services in industrial and consumer markets: product, price, promotion, place/distribution, people, process and physical environment. Analyse influences on and effects of changes in the mix. Apply product portfolio analysis and the Boston Matrix; use the product life cycle including extension strategies; and evaluate the influences on and value of new product development. Evaluate penetration and price skimming, branding, social media and viral marketing, and multi-channel distribution. Evaluate people, process and physical environment, and the importance of and influences on an integrated marketing mix including life-cycle position, Boston Matrix position, product type, objectives, target market, competition and positioning. Evaluate digital marketing and e-commerce in context.',
    ]),

    requirement('aqa-3-4-cross-cutting', '3.4', 'Operations cross-cutting context', [
      'Operational decisions should integrate technology, ethical and environmental considerations, market conditions and competition, competitiveness and the interrelationship between operations and marketing, finance and human resources.',
    ]),
    requirement('aqa-3-4-1', '3.4.1', 'Operational objectives', [
      'Explain the value of setting operational objectives and evaluate objectives for costs, quality, speed of response, flexibility, environmental objectives and added value. Explain how operational choices can create added value and how objectives can conflict.',
    ]),
    requirement('aqa-3-4-2', '3.4.2', 'Operational performance', [
      'Calculate, interpret and use labour productivity, unit costs or average costs, capacity and capacity utilisation in operational decision making and planning. Use consistent units and periods, diagnose causes of change, and evaluate consequences for cost, quality, flexibility, service and investment decisions.',
    ]),
    requirement('aqa-3-4-3', '3.4.3', 'Efficiency and productivity', [
      'Analyse the importance of capacity and how to use it efficiently. Explain how to increase efficiency and labour productivity and evaluate the difficulties of doing so. Evaluate the benefits and difficulties of lean production, comparing Just in Time and Just in Case operations. Compare labour intensive and capital intensive resource mixes and evaluate how technology can improve operational efficiency, quality, flexibility and risk.',
    ]),
    requirement('aqa-3-4-4', '3.4.4', 'Quality', [
      'Distinguish quality assurance from quality control and evaluate their contribution, benefits, cost and implementation difficulty. Analyse the operational, financial, customer and reputational consequences of poor quality.',
    ]),
    requirement('aqa-3-4-5', '3.4.5', 'Inventory and supply chains', [
      'Evaluate ways to manage supply to match demand and the value of doing so, including outsourcing, temporary and part time labour and producing to order. Interpret inventory control charts using lead time, re-order levels, buffer inventory and re-order quantities and analyse influences on inventory held. Evaluate influences on supplier choice, effective and efficient supply-chain management and the value of outsourcing.',
    ]),

    requirement('aqa-3-5-cross-cutting', '3.5', 'Finance cross-cutting context', [
      'Financial decisions should integrate technology, market conditions and competition, ethical and environmental considerations, competitiveness and the interrelationship between finance and marketing, operations and human resources.',
    ]),
    requirement('aqa-3-5-1', '3.5.1', 'Financial objectives', [
      'Explain the value of setting financial objectives and evaluate objectives including return on investment, revenue, costs, profit and cash flow. Distinguish cash flow from profit and distinguish gross profit, operating profit and profit for the year.',
    ]),
    requirement('aqa-3-5-2', '3.5.2', 'Financial performance', [
      'Construct and interpret budgets and cash-flow forecasts, calculate variance and judge favourable or adverse meaning from context, and evaluate the value of budgeting. Construct and interpret break-even charts, apply break-even output, margin of safety, contribution per unit and total contribution, analyse effects of changes in price, output and cost, and evaluate the value of break-even analysis. Calculate and interpret gross profit, profit from operations and profit for the year margins where appropriate, analyse payables and receivables timing, and use financial data for decision making and planning.',
    ]),
    requirement('aqa-3-5-3', '3.5.3', 'Sources of finance', [
      'Compare internal and external, short- and long-term sources including debt factoring, overdrafts, retained profits, share capital, loans, venture capital and crowd funding. Evaluate advantages and disadvantages using amount, duration, cost, repayment and cash-flow effect, security, control and risk.',
    ]),
    requirement('aqa-3-5-4', '3.5.4', 'Improving cash flow and profits', [
      'Evaluate methods of improving cash flow, profits and profitability and the difficulties or trade-offs attached to them. A recommendation should combine quantitative effects with operational, marketing, workforce and strategic consequences.',
    ]),

    requirement('aqa-3-6-cross-cutting', '3.6', 'Human resources cross-cutting context', [
      'Human-resource decisions should integrate technology, ethical and environmental considerations, market conditions including the labour market and competition, competitiveness and the interrelationship between people decisions and marketing, operations and finance.',
    ]),
    requirement('aqa-3-6-1', '3.6.1', 'Human resource objectives', [
      'Explain the value of setting HR objectives and evaluate objectives including employee engagement, talent development, training, diversity, alignment of employee and employer values, and the number, skills and location of employees. Compare soft and hard HRM approaches as methods of achieving HR objectives and judge their situational implications.',
    ]),
    requirement('aqa-3-6-2', '3.6.2', 'Human resource performance', [
      'Calculate and interpret labour turnover, labour productivity, employee costs as percentage of turnover and labour cost per unit. Use the data for human-resource decision making and planning, compare consistent periods and diagnose business causes and consequences rather than treating any single measure as a complete judgement.',
    ]),
    requirement('aqa-3-6-3', '3.6.3', 'Organisational design and HR flow', [
      'Compare functional, product-based, regional and matrix structures. Analyse influences on organisational design through authority, span of control, hierarchy, delegation, centralisation and decentralisation and evaluate the value of changing organisational design. Use a human resource plan to consider recruitment, training, redeployment and redundancy as the workforce changes and explain how human-resource flow can support objectives.',
    ]),
    requirement('aqa-3-6-4', '3.6.4', 'Motivation and engagement', [
      'Explain the benefits of motivated and engaged employees and apply Taylor, Maslow and Herzberg as context-dependent motivation theories. Evaluate financial methods including piece rate, commission, salary and performance-related pay, and non-financial methods including empowerment, team working, flexible working, job enrichment and job rotation. Analyse influences on the choice and effectiveness of these methods rather than treating any theory or method as universally effective.',
    ]),
    requirement('aqa-3-6-5', '3.6.5', 'Employer-employee relations', [
      'Evaluate influences on employee involvement in decision making and employer-employee relations, including trade unions and works councils. Analyse communication, representation and relations from both employer and employee perspectives, and evaluate the value of good employer-employee relations.',
    ]),

    requirement('aqa-3-7-1', '3.7.1', 'Mission objectives and strategy', [
      'Analyse influences on mission and internal and external influences on corporate objectives and decisions, including short termism, ownership and the external and internal environment. Explain links between mission, corporate objectives and strategy, distinguish strategy from tactics, analyse the impact of strategic decisions on functional decisions and internal and external influences on functional objectives, and use SWOT to connect evidence to strategic implications.',
    ]),
    requirement('aqa-3-7-2', '3.7.2', 'Strategic financial ratio analysis', [
      'Assess financial performance using balance sheets, income statements and required ratios. Calculate and interpret return on capital employed (ROCE) = operating profit / capital employed × 100 and current ratio = current assets / current liabilities. Calculate gearing (%) = non-current liabilities / (total equity + non-current liabilities) × 100. Calculate payables days = payables / cost of sales × 365, receivables days = receivables / revenue × 365, and inventory turnover = cost of sales / average inventories. Evaluate the value and limitations of ratio analysis using trends and comparisons with other businesses, and never add an acid-test ratio unless a future governed specification explicitly requires it.',
    ]),
    requirement('aqa-3-7-3', '3.7.3', 'Overall business performance', [
      'Assess strengths and weaknesses using operations, human resource and marketing data as well as finance, comparing evidence over time or with other businesses where useful. Identify core competences, compare short- and long-term performance, and evaluate different performance measures including Elkington Triple Bottom Line using Profit, People and Planet.',
    ]),
    requirement('aqa-3-7-4', '3.7.4', 'Political and legal change', [
      'Analyse how political and legal change affects strategic and functional decisions through competition policy, labour market rules, environmental legislation, support for enterprise, regulators, infrastructure, the environment and international trade. Explain causal impacts on demand, cost, capability, risk and strategic choice.',
    ]),
    requirement('aqa-3-7-5', '3.7.5', 'Economic change', [
      'Interpret UK and global economic change using GDP, taxation, exchange rates and inflation and analyse fiscal and monetary policy effects. Compare open trade and protectionism and evaluate consequences for strategic and functional decisions, demand, costs, investment, competitiveness and risk.',
    ]),
    requirement('aqa-3-7-6', '3.7.6', 'Social and technological change', [
      'Analyse migration, consumer lifestyle and buying-behaviour change and the growth of online businesses. Evaluate reasons for and against Corporate Social Responsibility, pressures for socially responsible behaviour and the stakeholder versus shareholder debate, and apply Carroll CSR Pyramid as a structured lens. Analyse technological change for functional areas, strategy, cost, demand, capability and risk.',
    ]),
    requirement('aqa-3-7-7', '3.7.7', 'Competitive environment', [
      'Apply Porter Five Forces through entry threat including barriers to entry, buyer power, supplier power, rivalry and substitute threat. Analyse how and why the forces can change and use them to judge competitive intensity, profit potential and strategic and functional choices.',
    ]),
    requirement('aqa-3-7-8', '3.7.8', 'Investment appraisal', [
      'Calculate and interpret payback using cumulative net cash flows, average rate of return (ARR) using average annual accounting profit / initial investment × 100, and net present value (NPV) by applying supplied discount factors to future net cash flows and deducting the initial investment. Evaluate investment criteria using non-financial factors, risk and uncertainty; no single appraisal result is automatically decisive.',
    ]),

    requirement('aqa-3-8-1', '3.8.1', 'Markets and products strategic direction', [
      'Analyse factors influencing which markets to compete in and which products to offer. Apply Ansoff to compare market penetration, market development, new product development and diversification and evaluate the reasons for choosing and value of each strategic direction using demand, capability, investment, risk and strategic fit.',
    ]),
    requirement('aqa-3-8-2', '3.8.2', 'Strategic positioning', [
      'Apply Porter strategic positioning through low cost, differentiation and focus. Analyse influences on positioning, the value of different strategies, benefits of competitive advantage and difficulties maintaining it, and judge whether the chosen activity system can sustain advantage.',
    ]),

    requirement('aqa-3-9-1', '3.9.1', 'Change in scale', [
      'Evaluate reasons why businesses grow or retrench and distinguish organic and external growth. Analyse technical, purchasing and managerial economies, economies of scope, diseconomies, synergy and overtrading and how to manage growth/retrenchment issues. Analyse impacts on functional areas. Compare mergers, takeovers, ventures and franchising and distinguish vertical backward/forward, horizontal and conglomerate integration.',
    ]),
    requirement('aqa-3-9-2', '3.9.2', 'Innovation', [
      'Distinguish product and process innovation and evaluate pressures for and value of innovation. Analyse Kaizen, research and development, intrapreneurship and benchmarking as ways to become innovative, explain patents and copyrights as intellectual-property protections, and evaluate impacts of an innovation strategy on functional areas.',
    ]),
    requirement('aqa-3-9-3', '3.9.3', 'Globalisation and internationalisation', [
      'Analyse reasons for greater globalisation, its importance for business and the importance of emerging economies. Evaluate reasons for targeting, operating in and trading with international markets and factors affecting market attractiveness. Compare export, licensing, alliances and direct investment, evaluate reasons for overseas sourcing/production including off-shoring and re-shoring, analyse influences on buying, selling and producing abroad, and evaluate multinational management pressures for local responsiveness and cost reduction.',
    ]),
    requirement('aqa-3-9-4', '3.9.4', 'Digital technology', [
      'Evaluate the pressures to adopt and strategic value of automation, e-commerce, big data and data mining, including capability, investment, skills, privacy/cyber risk, dependency and competitive consequences.',
    ]),

    requirement('aqa-3-10-1', '3.10.1', 'Managing change', [
      'Distinguish internal and external change and incremental from disruptive change, and analyse causes and pressures for change. Apply Lewin force-field analysis, evaluate the value of change and flexible organisations including restructuring, delayering, flexible employment contracts and organic versus mechanistic structures, and evaluate knowledge and information management. Apply Kotter and Schlesinger reasons for resistance and approaches to overcoming barriers in context.',
    ]),
    requirement('aqa-3-10-2', '3.10.2', 'Organisational culture', [
      'Explain the importance and influences of organisational culture and the reasons for and problems of changing it. Apply Handy culture types: task culture, role culture, power culture and person culture, using them as diagnostic lenses rather than deterministic prescriptions.',
    ]),
    requirement('aqa-3-10-3', '3.10.3', 'Strategic implementation', [
      'Evaluate how strategy is implemented effectively, including the value of leadership and communications and the importance of organisational structure. Evaluate network analysis, interpret network diagrams, perform amendment of a network diagram where required, identify the critical path and calculate or identify total float. Do not introduce EST/LFT calculation as a mandatory requirement unless future governed evidence explicitly requires it.',
    ]),
    requirement('aqa-3-10-4', '3.10.4', 'Strategy problems and failure', [
      'Analyse difficulties of strategic decisions and implementation, distinguish planned and emergent strategy, diagnose reasons for strategic drift and evaluate strategic performance, and evaluate the value of strategic planning, contingency planning and crisis management.',
    ]),

    requirement('aqa-annex-quantitative', 'Annex: quantitative skills in business', 'Quantitative skills in business', [
      'Apply course-required quantitative skills including ratios, averages, percentages, percentage change and index numbers; market size, market share and market growth; cost/revenue/profit and break-even; labour productivity, capacity utilisation and labour turnover; ROCE, current ratio, gearing, payables days, receivables days and inventory turnover; expected value and net gain; and payback, average rate of return and net present value. For price and income elasticity, interpret, not calculate, the supplied elasticity evidence. Use quantitative evidence in context and check assumptions, units and data quality.',
    ]),
  ] satisfies FoundationCurriculumRequirementInput[],
}

function requirement(
  requirementId: string,
  officialReference: string,
  revisionArea: string,
  skillsOrKnowledge: string[],
): FoundationCurriculumRequirementInput {
  return {
    requirementId,
    officialReference,
    requirementSummary: revisionArea,
    skillsOrKnowledge,
    componentScope: ['paper-1', 'paper-2', 'paper-3'],
    revisionArea,
    sourceRefs: [AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID],
  }
}
