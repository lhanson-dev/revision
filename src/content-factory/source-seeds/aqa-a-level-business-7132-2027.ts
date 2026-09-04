import type { FoundationCurriculumRequirementInput } from '../foundation-compilation'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID = 'revision-aqa-7132-2027-course-truth-seed'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED = {
  schemaVersion: 2 as const,
  seedId: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
  status: 'governed_main_only' as const,
  purpose: 'Revision-owned structured curriculum and semantic evidence seed for the AQA A-level Business 7132 / 2027 Foundation proof. It is a compilation input, not an approved Course Foundation.',
  semanticEvidencePolicy: {
    authorship: 'REVISION_OWNED' as const,
    role: 'Provide substantive candidate subject semantics to the Foundation compiler so downstream workers do not need to invent definitions, methods, formulae or scope from model memory.',
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
    'This seed is Revision-owned candidate Course Truth evidence and is not a claim of qualified-human curriculum completeness.',
    'AQA REFERENCE_ONLY material is not an upstream curriculum-truth source for this seed; AQA contributes only controlled Board Alignment facts elsewhere in the live profile.',
    'The semantic statements deliberately define the generative scope of each atomic node. The compiler must not broaden a named method set, ratio set or formula set beyond this seed unless a later governed source update explicitly adds it.',
    'Independent Foundation review and qualified subject/assessment expert review remain mandatory before the resulting Course Truth can become an Approved Course Foundation.',
  ],
  requirements: [
    requirement('business-purpose-forms-environment', 'Business purpose, forms and external environment', [
      'Business objectives: distinguish financial and non-financial objectives, explain that objectives provide direction and decision criteria, and evaluate how priorities can change with ownership, scale, lifecycle, performance and stakeholder pressure.',
      'Profit and cash flow: distinguish profit from cash, explain that a profitable business can still face cash-flow difficulty, and connect revenue, costs, cash inflows, cash outflows and timing when interpreting business performance.',
      'Ownership forms: distinguish sole traders, partnerships and limited companies by ownership, control, liability, access to finance and continuity, and explain how the legal/ownership form can affect objectives and decision making.',
      'Shareholders and stakeholders: distinguish owners from wider stakeholder groups, identify their different interests and influence, and explain why decisions can create trade-offs between returns, employment, customers, suppliers, communities and other interests.',
      'External influences: analyse how economic, legal, political, technological, social, competitive and environmental changes can affect demand, costs, risk, opportunities and strategic choices; avoid treating external factors as automatically positive or negative.',
    ]),
    requirement('leadership-management-decisions', 'Management, leadership and decision making', [
      'Management and leadership: distinguish coordinating/planning organisational work from influencing and motivating people, while recognising that managers may perform both roles and that effectiveness depends on context rather than a single universal style.',
      'Leadership styles: compare more directive and more participative approaches by decision speed, employee involvement, expertise, motivation and situational fit; do not assume one style is always superior.',
      'Decision making: frame a decision around objectives, evidence, alternatives, constraints, likely consequences and uncertainty, then justify a choice rather than treating a model or calculation as an automatic answer.',
      'Risk and uncertainty: distinguish outcomes with estimable probabilities from deeper uncertainty, explain how both affect decision quality, and use sensitivity/scenario thinking without presenting forecasts as certainties.',
      'Stakeholder trade-offs: identify who gains, who bears costs or risks, how stakeholder power differs, and how short-term and long-term consequences can conflict when evaluating a decision.',
    ]),
    requirement('marketing-analysis', 'Marketing objectives, research, markets and demand', [
      'Marketing objectives: connect marketing goals such as sales growth, market share, customer retention, brand position or entry into a new segment to wider business objectives and measurable outcomes.',
      'Market research: distinguish primary from secondary and qualitative from quantitative evidence, evaluate sample/source reliability and relevance, and explain that research reduces uncertainty rather than guaranteeing demand.',
      'Segmentation and targeting: divide a market using meaningful customer characteristics, assess segment attractiveness and fit, and select target segments without assuming that the largest segment is automatically the best.',
      'Positioning: explain how a business seeks a distinctive place in customers\' perceptions relative to competitors and how product, price, promotion, distribution and brand signals must support the intended position.',
      'Price elasticity of demand: calculate PED = percentage change in quantity demanded / percentage change in price; interpret absolute magnitude as elastic (>1), unit elastic (=1) or inelastic (<1), use the sign to recognise the usual inverse relationship, and avoid claiming elasticity is fixed across all prices or time periods.',
      'Income elasticity of demand: calculate YED = percentage change in quantity demanded / percentage change in income; interpret positive values as normal-good behaviour and negative values as inferior-good behaviour in the observed context, while recognising magnitude and classification can vary by market and income range.',
    ]),
    requirement('marketing-decisions', 'Marketing mix and competitive marketing decisions', [
      'Product decisions: evaluate product features, quality, range, lifecycle, differentiation and development choices by customer needs, competitive position, cost and strategic fit rather than treating product change as inherently beneficial.',
      'Pricing: compare pricing approaches using objectives, demand sensitivity, costs, competition, positioning and capacity constraints, and explain how price changes can affect both volume and contribution/profit.',
      'Promotion: distinguish communication objectives and methods, assess reach, targeting, message, cost and measurable response, and evaluate promotion as part of an integrated marketing decision rather than an isolated activity.',
      'Distribution: compare direct and intermediary channels by market reach, control, convenience, speed, cost and customer experience; recognise that channel choices can differ across products and segments.',
      'Branding: explain how brand identity and associations can support recognition, differentiation, loyalty and price positioning, while recognising that brand investment does not guarantee customer preference or commercial success.',
      'Digital marketing: evaluate digital channels using targeting, interaction, data, reach, conversion, reputation and privacy/implementation considerations; avoid assuming digital channels are automatically cheaper or more effective.',
    ]),
    requirement('operations-decisions', 'Operational objectives, performance, quality and supply', [
      'Productivity: calculate productivity as output / input for the stated resource base, compare like-for-like measures, and explain that higher productivity can lower unit cost or raise capacity but may involve quality, workforce or investment trade-offs.',
      'Capacity utilisation: calculate capacity utilisation (%) = actual output / maximum possible output × 100; interpret spare versus highly utilised capacity and evaluate implications for unit cost, flexibility, queues, maintenance, quality and expansion decisions.',
      'Unit costs: calculate unit cost = total cost / units of output for the stated period and scope; explain economies/diseconomies and volume effects without assuming lower unit cost always means better overall performance.',
      'Quality: distinguish quality control from broader quality assurance/continuous improvement approaches, and evaluate prevention, inspection, consistency, customer expectations, cost and reputational consequences.',
      'Inventory: explain the role and cost of raw materials, work-in-progress and finished-goods inventory, and evaluate the trade-off between availability/resilience and holding, obsolescence and cash costs.',
      'Lean operations: explain waste reduction, flow, continuous improvement and inventory discipline as coordinated operating principles; evaluate implementation requirements and avoid equating lean with simply cutting resources.',
      'Supply chains: analyse supplier choice, lead times, dependency, logistics, quality, cost, resilience and ethical/environmental exposure, including the trade-off between efficiency and redundancy.',
      'Technology: evaluate automation, data systems and digital production/operations tools by productivity, quality, flexibility, capital cost, skills, integration, cyber/operational risk and strategic fit.',
    ]),
    requirement('financial-performance', 'Financial objectives, profit, cash flow and budgets', [
      'Revenue costs and profit: calculate revenue = selling price × quantity sold and profit = total revenue − total costs; distinguish fixed and variable costs for the stated context and interpret profit changes using both revenue and cost drivers.',
      'Cash flow: calculate net cash flow = cash inflows − cash outflows and closing balance = opening balance + net cash flow; distinguish cash timing from profit recognition and identify causes/consequences of cash shortages or surpluses.',
      'Budgets: explain budgets as quantified plans for revenues, costs, cash or resources, use them for coordination and control, and evaluate usefulness using realism, participation, flexibility and changing conditions.',
      'Variance analysis: calculate variance as actual − budget for a clearly stated measure, identify whether the business consequence is favourable or adverse from context rather than sign alone, and investigate causes before assigning responsibility.',
      'Cash-flow forecasting: construct and interpret forecast inflows, outflows, net cash flow and balances over time, identify projected liquidity pressure, and evaluate actions while recognising forecasts depend on assumptions.',
    ]),
    requirement('financial-decisions', 'Financial analysis, investment and funding decisions', [
      'Contribution: calculate unit contribution = selling price per unit − variable cost per unit and total contribution = unit contribution × output; use contribution to analyse product/volume decisions without treating contribution as profit because fixed costs remain.',
      'Break-even: calculate break-even output = fixed costs / contribution per unit and margin of safety = actual or forecast output − break-even output; interpret how price, variable cost and fixed cost changes move break-even and recognise the model assumes simplified cost/revenue behaviour.',
      'Profitability ratios: calculate gross profit = revenue − cost of sales, gross profit margin (%) = gross profit / revenue × 100, operating profit margin (%) = operating profit / revenue × 100, and ROCE (%) = operating profit / capital employed × 100; define capital employed consistently with the financial data supplied and interpret ratios comparatively rather than in isolation.',
      'Investment appraisal: calculate and interpret payback using cumulative net cash flows and average rate of return (ARR) = average annual accounting profit / initial investment × 100 where the supplied data supports it; compare methods by timing, profitability and risk rather than treating one metric as decisive.',
      'Sources of finance: distinguish internal and external, short- and long-term finance, and evaluate sources using amount, duration, cost, repayment/cash-flow impact, security, control, risk and business circumstances.',
      'Financial decision making: combine financial calculations with qualitative evidence, objectives, risk, time horizon and stakeholder consequences; check assumptions and data quality and avoid making a recommendation from one indicator alone.',
    ]),
    requirement('human-resources', 'Human-resource objectives, organisation, motivation and employee relations', [
      'Workforce performance: assess workforce outcomes using productivity, quality, absence, retention, skills, service and engagement evidence, recognising that one metric alone may not identify the underlying cause.',
      'Organisational design: compare spans of control, layers, centralisation/decentralisation and functional/divisional or team structures by communication, accountability, expertise, speed, control, motivation and scale.',
      'Motivation: explain how financial and non-financial factors can affect effort, satisfaction and retention, apply motivational ideas as context-dependent lenses, and avoid presenting any theory as a guaranteed prescription.',
      'Employee involvement: evaluate consultation, participation, teamworking and delegated responsibility by information quality, commitment, speed, management control and workforce capability.',
      'Employee relations: analyse cooperation, conflict, representation, communication, negotiation and change impacts, considering both employer objectives and employee interests.',
      'Labour productivity: calculate labour productivity = output / number of employees (or labour hours when that denominator is explicitly supplied), compare consistent periods/units, and interpret changes alongside quality, capital intensity and workforce conditions.',
      'Labour turnover: calculate labour turnover (%) = number of employees leaving during the period / average number employed during the period × 100; evaluate recruitment, training, knowledge-loss and morale consequences while recognising some turnover can be functional.',
    ]),
    requirement('strategic-position', 'Analysing the strategic position of a business', [
      'Mission and objectives: distinguish broad organisational purpose from specific strategic objectives, assess consistency between them, and explain how measurable objectives provide criteria for evaluating strategic options.',
      'Financial ratio analysis: for this Foundation, the explicitly modelled ratio set is gross profit margin, operating profit margin, ROCE and current ratio only. Calculate current ratio = current assets / current liabilities and use the profitability formulae defined in financial-decisions.k03; compare trends/benchmarks and interpret causes and limitations without introducing efficiency or gearing ratios unless later governed evidence explicitly adds them.',
      'SWOT: classify genuinely internal strengths/weaknesses and external opportunities/threats, connect factors to specific strategic implications, and avoid using SWOT as a substitute for evidence or prioritisation.',
      'External environment: analyse macroeconomic, political/legal, social, technological, competitive and environmental forces by their causal effect on demand, cost, capability, risk and opportunity, including interactions between factors.',
      'Competitive position: assess position using customer value, differentiation, cost, capabilities, market evidence and competitor behaviour, and distinguish a durable advantage from a temporary performance outcome.',
      'Investment appraisal: use the governed payback and ARR methods from financial-decisions.k04 when comparing strategic investments, combine results with risk and qualitative fit, and avoid introducing ungoverned appraisal methods.',
      'Decision trees: calculate expected monetary value for mutually exclusive branches as probability × monetary outcome summed across outcomes, subtract option costs where supplied, and use the result as one input while recognising probabilities and monetary estimates are uncertain.',
    ]),
    requirement('strategic-direction', 'Choosing strategic direction', [
      'Strategic objectives: translate mission and business priorities into longer-term measurable aims, identify tensions between growth, profit, risk, social or stakeholder objectives, and use them to evaluate options.',
      'Markets and products: compare deeper penetration, new-market development, product/service development and broader diversification choices by capability, demand, investment, risk and fit without assuming growth is always desirable.',
      'Competitive positioning: compare lower-cost and differentiated value propositions by customer needs, cost structure, capabilities, imitation risk and consistency of the activity system; avoid treating generic labels as complete strategies.',
      'Strategic choices and trade-offs: compare options against objectives, resources, risk, implementation feasibility, stakeholder effects and opportunity cost, making explicit what must be sacrificed or accepted with each choice.',
    ]),
    requirement('strategic-methods', 'Strategic methods for pursuing strategy', [
      'Organic growth: explain growth using internal expansion of products, capacity, customers or locations, and evaluate control, speed, finance, capability development and execution risk.',
      'Mergers and takeovers: distinguish negotiated combination from acquisition of control, evaluate strategic rationale and potential synergies against valuation, finance, integration, culture and execution risks.',
      'Internationalisation: evaluate entry into overseas markets using demand, competition, culture, regulation, exchange-rate/logistics exposure, scale, control and entry-mode risk.',
      'Innovation: distinguish product/service and process innovation, connect innovation to customer value, productivity or strategic renewal, and evaluate uncertainty, investment, capability and timing.',
      'Digital technology: evaluate how digital platforms, data, automation and connectivity can reshape channels, operations and business models while considering investment, skills, cybersecurity, dependency and adoption risk.',
      'Strategic alliances: explain cooperative arrangements between independent organisations, assess access to capabilities/markets/resources against coordination, control, knowledge-sharing and partner-dependency risks.',
    ]),
    requirement('strategic-change', 'Managing strategic change', [
      'Organisational culture: explain shared norms, assumptions and behaviours as influences on coordination and decision making, and evaluate how culture can enable or obstruct a strategy without treating it as easily changed by declaration.',
      'Change management: plan change around rationale, stakeholders, communication, participation, resources, sequencing, monitoring and adaptation, recognising that resistance can contain useful information rather than being purely irrational.',
      'Leadership of change: evaluate how leaders create direction, credibility, communication, participation and accountability during change, with approach adapted to urgency, capability and stakeholder impact.',
      'Barriers to change: identify structural, cultural, financial, capability, incentive, information and stakeholder barriers, diagnose causes and choose proportionate responses rather than applying generic change techniques.',
      'Implementation risk: identify execution dependencies, resource constraints, timing, unintended consequences and adoption risks, use milestones/contingencies where useful, and distinguish implementation failure from a flawed strategic choice.',
    ]),
    requirement('quantitative-skills', 'Quantitative skills in business', [
      'Ratios and averages: calculate a ratio from consistently defined numerator and denominator values and calculate an arithmetic mean = sum of observations / number of observations; interpret the measure in context and do not compare ratios built from inconsistent definitions.',
      'Percentages and percentage change: calculate percentage of a total = part / whole × 100 and percentage change = ((new value − original value) / original value) × 100; preserve the grouping around the change before division and interpret both direction and magnitude.',
      'Index numbers: interpret an index relative to its stated base (commonly 100) and calculate relative change consistently from the base or between indexed periods; do not mistake an index value for an absolute quantity.',
      'Cost revenue profit and break-even: apply revenue = price × quantity, profit = revenue − total cost, contribution per unit = price − variable cost per unit, break-even output = fixed costs / contribution per unit and margin of safety = actual or forecast output − break-even output, with consistent units.',
      'Investment appraisal: apply the governed payback and ARR methods defined in financial-decisions.k04, check the timing/meaning of cash-flow versus accounting-profit inputs, and interpret the result alongside risk and qualitative evidence.',
      'Elasticity: apply PED = percentage change in quantity demanded / percentage change in price and YED = percentage change in quantity demanded / percentage change in income using correctly grouped percentage changes; interpret sign and magnitude in the stated market context.',
      'Graphical and numerical interpretation: read axes, units, scales, totals, percentages and trends accurately; compare relevant values, identify relationships without automatically inferring causation, and use numerical evidence to support analysis or evaluation.',
    ]),
    requirement('synoptic-business-judgement', 'Synoptic business judgement', [
      'Interrelationships between business functions: trace how a decision in marketing, operations, finance or people management changes constraints and outcomes elsewhere, including feedback effects rather than analysing functions as isolated silos.',
      'Contextual analysis: select evidence that is material to the specific organisation, market, objective and time horizon, explain the causal chain from evidence to consequence, and avoid generic points detached from the case.',
      'Quantitative and qualitative evidence: combine calculations/data with non-numerical evidence, check reliability and assumptions, and explain where the two forms of evidence reinforce or qualify each other.',
      'Evaluation: compare the significance and limitations of competing arguments using context, objectives, risk, time and stakeholder effects, rather than adding an unsupported concluding assertion.',
      'Evidence-based judgement: reach a clear conditional or prioritised conclusion supported by the strongest relevant evidence, state decisive assumptions or contingencies, and show why rejected alternatives are less suitable in the stated context.',
    ]),
  ] satisfies FoundationCurriculumRequirementInput[],
}

function requirement(requirementId: string, revisionArea: string, skillsOrKnowledge: string[]): FoundationCurriculumRequirementInput {
  return {
    requirementId,
    officialReference: `Revision governed Course Truth seed requirement: ${requirementId}`,
    requirementSummary: revisionArea,
    skillsOrKnowledge,
    componentScope: ['paper-1', 'paper-2', 'paper-3'],
    revisionArea,
    sourceRefs: [AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID],
  }
}
