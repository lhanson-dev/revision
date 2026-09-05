import type { FoundationCurriculumRequirementInput } from '../foundation-compilation'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID } from './aqa-a-level-business-7132-2027-coverage'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID = 'revision-aqa-7132-2027-course-truth-seed'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED = {
  schemaVersion: 3 as const,
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
    'Independent Foundation review and qualified subject/assessment expert review remain mandatory before Course Truth can become an Approved Course Foundation.',
  ],
  requirements: [
    requirement('aqa-3-0-course-context', '3.0', 'Course-wide business context', [
      'Across the course, apply business ideas to varied business contexts and analyse interrelated functional decisions rather than isolated silos. Evaluate competition, technology, stakeholders, uncertainty, data quality, ethical and environmental consequences, and use quantitative and non-quantitative evidence including index numbers where relevant.',
    ]),
    requirement('aqa-3-0-strategic-context', '3.0 Strategic decision making', 'Strategic decision-making context', [
      'Strategic decisions build on functional decision making and should consider technology, Corporate Social Responsibility, ethical and environmental consequences, forecasting, feasibility, risk, uncertainty and stakeholders. Conclusions should be evidence-based and conditional on context rather than model-driven.',
    ]),

    requirement('aqa-3-1-1', '3.1.1', 'Business nature and purpose', [
      'Explain business purpose and distinguish objectives such as profit, growth, survival, cash flow, social and ethical aims. Connect objectives to mission and changing circumstances. Calculate and interpret revenue, fixed costs, variable costs, total costs and profit while distinguishing accounting profit from cash flow.',
    ]),
    requirement('aqa-3-1-2', '3.1.2', 'Business forms', [
      'Compare sole traders, private limited companies, public limited companies, public sector organisations, non-profit organisations and social enterprises. Explain unlimited liability and limited liability, ordinary share capital, market capitalisation and dividends, and analyse how ownership, control, finance and performance can affect share price and objectives.',
    ]),
    requirement('aqa-3-1-3', '3.1.3', 'External business environment', [
      'Analyse how competition, market conditions, incomes, interest rates, demographic change, environmental pressures and fair trade can alter business costs, demand, opportunities, constraints and objectives. External influences are contextual rather than automatically favourable or adverse.',
    ]),

    requirement('aqa-3-2-1', '3.2.1', 'Management and leadership', [
      'Distinguish management from leadership and compare autocratic, paternalistic, democratic and laissez-faire leadership. Use the Tannenbaum Schmidt continuum to analyse how leader freedom and subordinate participation can vary, and judge effectiveness from the situation rather than assuming one style is universally best.',
    ]),
    requirement('aqa-3-2-2', '3.2.2', 'Management decision making', [
      'Compare scientific or data-led decision making with intuition. Construct and interpret decision trees using probabilities, expected value and net gains where appropriate. Evaluate risks, rewards, uncertainty and opportunity cost, and analyse how mission, objectives, ethics and resource constraints affect decisions.',
    ]),
    requirement('aqa-3-2-3', '3.2.3', 'Stakeholder management', [
      'Identify stakeholder interests and potential conflict, distinguish stakeholder power and interest, and use power-interest reasoning to judge management priorities. Evaluate communication and consultation as relationship-management choices rather than automatic solutions.',
    ]),

    requirement('aqa-3-3-cross-cutting', '3.3', 'Marketing cross-cutting context', [
      'Marketing decisions should integrate technology, ethical and environmental considerations, competition, competitiveness and the interrelationship between marketing and operations, finance and human resources.',
    ]),
    requirement('aqa-3-3-1', '3.3.1', 'Marketing objectives', [
      'Set and evaluate marketing objectives using measures such as sales volume, sales value, market size, market and sales growth, market share and brand loyalty. Calculate relevant growth/share/size measures where data permit and connect them to wider business objectives.',
    ]),
    requirement('aqa-3-3-2', '3.3.2', 'Markets and customers', [
      'Evaluate primary and secondary research and qualitative and quantitative data. Compare random, stratified and quota sampling. Interpret correlation, confidence intervals and extrapolation while recognising uncertainty and avoiding automatic causal claims. For price elasticity and income elasticity, interpret, not calculate, the supplied elasticity information and analyse effects on demand and revenue.',
    ]),
    requirement('aqa-3-3-3', '3.3.3', 'Segmentation targeting and positioning', [
      'Segment markets using demographic, geographic, income and behavioural variables. Compare niche and mass marketing, select target segments using attractiveness and capability fit, and use market mapping to assess positioning and competitive gaps.',
    ]),
    requirement('aqa-3-3-4', '3.3.4', 'Marketing mix', [
      'Use the full 7Ps as an integrated marketing mix: product, price, promotion, place/distribution, people, process and physical environment. Apply the Boston Matrix and product life cycle to product decisions; evaluate penetration and price skimming; analyse branding, social media and viral marketing; compare multi-channel distribution; and evaluate integrated marketing mix choices, digital marketing and e-commerce in context.',
    ]),

    requirement('aqa-3-4-cross-cutting', '3.4', 'Operations cross-cutting context', [
      'Operational decisions should integrate technology, ethical and environmental considerations, competition, competitiveness and the interrelationship between operations and marketing, finance and human resources.',
    ]),
    requirement('aqa-3-4-1', '3.4.1', 'Operational objectives', [
      'Evaluate operational objectives for costs, quality, speed of response, flexibility and environmental objectives. Explain how operational choices can create added value and how objectives can conflict.',
    ]),
    requirement('aqa-3-4-2', '3.4.2', 'Operational performance', [
      'Calculate and interpret labour productivity, unit costs, capacity and capacity utilisation. Use consistent units and periods, diagnose causes of change, and evaluate consequences for cost, quality, flexibility, service and investment decisions.',
    ]),
    requirement('aqa-3-4-3', '3.4.3', 'Efficiency and productivity', [
      'Analyse efficiency and labour productivity, capacity decisions and lean operations. Compare Just in Time and Just in Case inventory approaches, labour intensive and capital intensive resource mixes, and the effects of technology on efficiency, quality, flexibility and risk.',
    ]),
    requirement('aqa-3-4-4', '3.4.4', 'Quality', [
      'Distinguish quality assurance from quality control and evaluate their contribution, cost and implementation difficulty. Analyse the operational, financial, customer and reputational consequences of poor quality.',
    ]),
    requirement('aqa-3-4-5', '3.4.5', 'Inventory and supply chains', [
      'Evaluate ways to match supply and demand, including outsourcing, temporary and part time labour and producing to order. Interpret inventory control charts using lead time, re-order levels, buffer inventory and re-order quantities. Evaluate suppliers and supply chain choices for cost, quality, speed, dependency and resilience.',
    ]),

    requirement('aqa-3-5-cross-cutting', '3.5', 'Finance cross-cutting context', [
      'Financial decisions should integrate technology, competition, ethical and environmental considerations, competitiveness and the interrelationship between finance and marketing, operations and human resources.',
    ]),
    requirement('aqa-3-5-1', '3.5.1', 'Financial objectives', [
      'Set and evaluate financial objectives including return on investment, revenue, costs, profit and cash flow. Distinguish gross profit, operating profit and profit for the year and explain why profit and cash can move differently.',
    ]),
    requirement('aqa-3-5-2', '3.5.2', 'Financial performance', [
      'Construct and interpret budgets and cash-flow forecasts and calculate variance, judging favourable or adverse meaning from context. Apply break-even, margin of safety, contribution per unit and total contribution. Calculate and interpret gross profit and profit from operations/profit for the year where appropriate, and analyse payables and receivables timing when assessing cash-flow performance.',
    ]),
    requirement('aqa-3-5-3', '3.5.3', 'Sources of finance', [
      'Compare internal and external, short- and long-term sources including debt factoring, overdrafts, retained profits, share capital, loans, venture capital and crowd funding. Evaluate amount, duration, cost, repayment/cash-flow effect, security, control and risk.',
    ]),
    requirement('aqa-3-5-4', '3.5.4', 'Improving cash flow and profits', [
      'Evaluate methods of improving cash flow, profits and profitability and the difficulties or trade-offs attached to them. A recommendation should combine quantitative effects with operational, marketing, workforce and strategic consequences.',
    ]),

    requirement('aqa-3-6-cross-cutting', '3.6', 'Human resources cross-cutting context', [
      'Human-resource decisions should integrate technology, ethical and environmental considerations, labour market conditions, competition, competitiveness and the interrelationship between people decisions and marketing, operations and finance.',
    ]),
    requirement('aqa-3-6-1', '3.6.1', 'Human resource objectives', [
      'Evaluate HR objectives including employee engagement, talent development, training, diversity and the number, skills and location of employees. Compare soft and hard HRM approaches and their situational implications.',
    ]),
    requirement('aqa-3-6-2', '3.6.2', 'Human resource performance', [
      'Calculate and interpret labour turnover, labour productivity, employee costs as percentage of turnover and labour cost per unit. Compare consistent periods and diagnose business causes and consequences rather than treating any single measure as a complete judgement.',
    ]),
    requirement('aqa-3-6-3', '3.6.3', 'Organisational design and HR flow', [
      'Compare functional, product-based, regional and matrix structures. Analyse authority, span of control, hierarchy, delegation, centralisation and decentralisation. Use a human resource plan to consider recruitment, training, redeployment and redundancy as the workforce changes.',
    ]),
    requirement('aqa-3-6-4', '3.6.4', 'Motivation and engagement', [
      'Apply Taylor, Maslow and Herzberg as context-dependent motivation theories. Evaluate financial methods including piece rate, commission, salary and performance-related pay, and non-financial methods including empowerment, team working, flexible working, job enrichment and job rotation. Do not treat any theory or method as universally effective.',
    ]),
    requirement('aqa-3-6-5', '3.6.5', 'Employer-employee relations', [
      'Evaluate employee involvement and employer-employee relations, including the role of trade unions and works councils. Analyse communication, representation, negotiation and relations from both employer and employee perspectives.',
    ]),

    requirement('aqa-3-7-1', '3.7.1', 'Mission objectives and strategy', [
      'Distinguish mission, corporate objectives, functional objectives, strategy and tactics. Analyse ownership influences and short termism, and use SWOT to connect internal strengths/weaknesses and external opportunities/threats to strategic implications rather than as a substitute for evidence.',
    ]),
    requirement('aqa-3-7-2', '3.7.2', 'Strategic financial ratio analysis', [
      'Calculate and interpret return on capital employed (ROCE) = operating profit / capital employed × 100 and current ratio = current assets / current liabilities. Calculate gearing (%) = non-current liabilities / (total equity + non-current liabilities) × 100. Calculate payables days = payables / cost of sales × 365, receivables days = receivables / revenue × 365, and inventory turnover = cost of sales / average inventories. Compare trends and benchmarks, explain causes and limitations, and never add an acid-test ratio unless a future governed specification explicitly requires it.',
    ]),
    requirement('aqa-3-7-3', '3.7.3', 'Overall business performance', [
      'Assess overall performance using operations, human resource and marketing evidence as well as finance. Identify core competences, compare short- and long-term performance, and apply Elkington Triple Bottom Line using Profit, People and Planet as a balanced performance lens rather than a mechanical answer.',
    ]),
    requirement('aqa-3-7-4', '3.7.4', 'Political and legal change', [
      'Analyse political and legal change through competition policy, labour market rules, environmental legislation, support for enterprise, regulators, infrastructure and international trade. Explain causal impacts on demand, cost, capability, risk and strategic choice.',
    ]),
    requirement('aqa-3-7-5', '3.7.5', 'Economic change', [
      'Interpret UK and global economic change using GDP, taxation, exchange rates and inflation and analyse fiscal and monetary policy effects. Compare open trade and protectionism and evaluate consequences for demand, costs, investment, competitiveness and risk.',
    ]),
    requirement('aqa-3-7-6', '3.7.6', 'Social and technological change', [
      'Analyse migration, consumer lifestyle change and online businesses. Evaluate Corporate Social Responsibility and the stakeholder versus shareholder debate, and apply Carroll CSR Pyramid as a structured lens. Analyse technological change for cost, demand, capability, risk and strategic position.',
    ]),
    requirement('aqa-3-7-7', '3.7.7', 'Competitive environment', [
      'Apply Porter Five Forces through entry threat, buyer power, supplier power, rivalry and substitute threat. Use the forces to analyse competitive intensity, profit potential and strategic options while recognising that market conditions can change.',
    ]),
    requirement('aqa-3-7-8', '3.7.8', 'Investment appraisal', [
      'Calculate and interpret payback using cumulative net cash flows, average rate of return (ARR) using average annual accounting profit / initial investment × 100, and net present value (NPV) by applying supplied discount factors to future net cash flows and deducting the initial investment. Evaluate investment criteria using non-financial factors, risk and uncertainty; no single appraisal result is automatically decisive.',
    ]),

    requirement('aqa-3-8-1', '3.8.1', 'Markets and products strategic direction', [
      'Apply Ansoff to compare market penetration, market development, new product development and diversification. Evaluate each direction using demand, capability, investment, risk and strategic fit rather than assuming growth is always desirable.',
    ]),
    requirement('aqa-3-8-2', '3.8.2', 'Strategic positioning', [
      'Apply Porter strategic positioning through low cost, differentiation and focus. Evaluate influences on positioning and whether the chosen activity system can create and sustain competitive advantage.',
    ]),

    requirement('aqa-3-9-1', '3.9.1', 'Change in scale', [
      'Evaluate organic and external growth and retrenchment. Analyse technical, purchasing and managerial economies, diseconomies, economies of scope, synergy and overtrading. Compare mergers, takeovers, ventures and franchising and distinguish vertical, horizontal and conglomerate integration.',
    ]),
    requirement('aqa-3-9-2', '3.9.2', 'Innovation', [
      'Distinguish product and process innovation and evaluate pressures for innovation. Analyse Kaizen, research and development, intrapreneurship and benchmarking as ways to support innovation, and explain the role of patents and copyrights in protecting intellectual property.',
    ]),
    requirement('aqa-3-9-3', '3.9.3', 'Globalisation and internationalisation', [
      'Analyse globalisation and emerging economies. Compare international entry through export, licensing, alliances and direct investment. Evaluate off-shoring and re-shoring and the implications of becoming a multinational, including local responsiveness and cost reduction.',
    ]),
    requirement('aqa-3-9-4', '3.9.4', 'Digital technology', [
      'Evaluate the pressures for and strategic value of automation, e-commerce, big data and data mining, including capability, investment, skills, privacy/cyber risk, dependency and competitive consequences.',
    ]),

    requirement('aqa-3-10-1', '3.10.1', 'Managing change', [
      'Distinguish internal change and external change and incremental change from disruptive change. Apply Lewin force-field analysis to pressures for and against change. Evaluate restructuring, delayering, flexible employment contracts and organic versus mechanistic organisation. Analyse knowledge as a change capability and apply Kotter and Schlesinger approaches to resistance in context.',
    ]),
    requirement('aqa-3-10-2', '3.10.2', 'Organisational culture', [
      'Explain the importance and influences of organisational culture and the difficulty of changing it. Apply Handy culture types: task culture, role culture, power culture and person culture, using them as diagnostic lenses rather than deterministic prescriptions.',
    ]),
    requirement('aqa-3-10-3', '3.10.3', 'Strategic implementation', [
      'Evaluate leadership, communications and organisational structure in implementation. For network analysis, interpret network diagrams, perform amendment of a network diagram where required, identify the critical path and calculate or identify total float. Do not introduce EST/LFT calculation as a mandatory requirement unless future governed evidence explicitly requires it.',
    ]),
    requirement('aqa-3-10-4', '3.10.4', 'Strategy problems and failure', [
      'Analyse the difficulty of strategic decisions and implementation, distinguish planned and emergent strategy, diagnose strategic drift and strategic performance, and evaluate strategic planning, contingency planning and crisis management.',
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
