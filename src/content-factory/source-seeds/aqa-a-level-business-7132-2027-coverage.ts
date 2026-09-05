import type {
  FoundationCoverageObligation,
  FoundationSemanticCoverageItem,
} from '../requirement-led-coverage'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID = 'aqa-7132-2027-source-led-curriculum'

type SourceRequirement = {
  requirementId: string
  officialReference: string
  path: string[]
  summary: string
  requiredTerms?: string[]
  sourceRefs?: string[]
}

const sourceRequirements: SourceRequirement[] = [
  source('aqa-3-0-course-context', '3.0', ['Subject content', 'Course-wide context'], 'Apply business knowledge across varied contexts, interrelated functions, competition, ethics/environment, uncertainty, technology, stakeholders and quantitative/non-quantitative evidence.', ['varied business contexts', 'interrelated', 'ethical and environmental', 'uncertainty', 'technology', 'stakeholders', 'index numbers']),
  source('aqa-3-0-strategic-context', '3.0 Strategic decision making', ['Subject content', 'Strategic decision making'], 'Build strategic judgement on functional decision making and consider technology, CSR/ethics/environment, forecasting, feasibility/risk and stakeholders.', ['Corporate Social Responsibility', 'forecasting', 'feasibility', 'risk', 'stakeholders']),

  source('aqa-3-1-1', '3.1.1', ['3.1 What is business?', 'Nature and purpose'], 'Business purpose, objectives, mission links and profit measurement.', ['profit', 'growth', 'survival', 'cash flow', 'social', 'ethical', 'revenue', 'fixed costs', 'variable costs', 'total costs']),
  source('aqa-3-1-2', '3.1.2', ['3.1 What is business?', 'Business forms'], 'Business forms, ownership, liability, shareholder finance and share-price implications.', ['sole traders', 'private limited companies', 'public limited companies', 'public sector', 'non-profit', 'social enterprises', 'unlimited liability', 'limited liability', 'ordinary share capital', 'market capitalisation', 'dividends', 'share price']),
  source('aqa-3-1-3', '3.1.3', ['3.1 What is business?', 'External environment'], 'External influences on business costs and demand.', ['competition', 'market conditions', 'incomes', 'interest rates', 'demographic', 'environmental', 'fair trade']),

  source('aqa-3-2-1', '3.2.1', ['3.2 Managers, leadership and decision making', 'Management and leadership'], 'Management/leadership distinction, styles, Tannenbaum-Schmidt and situational effectiveness.', ['autocratic', 'paternalistic', 'democratic', 'laissez-faire', 'Tannenbaum Schmidt']),
  source('aqa-3-2-2', '3.2.2', ['3.2 Managers, leadership and decision making', 'Management decision making'], 'Scientific/data-led and intuitive decision making, decision trees and decision influences.', ['decision trees', 'expected value', 'net gains', 'risks', 'rewards', 'uncertainty', 'opportunity cost', 'mission', 'objectives', 'ethics', 'resource constraints']),
  source('aqa-3-2-3', '3.2.3', ['3.2 Managers, leadership and decision making', 'Stakeholders'], 'Stakeholder needs, conflict, power/interest mapping and relationship management.', ['power', 'interest', 'conflict', 'communication', 'consultation']),

  source('aqa-3-3-cross-cutting', '3.3', ['3.3 Marketing management', 'Cross-cutting'], 'Marketing decisions consider technology, ethics/environment, competition, competitiveness and interrelationships with other functions.', ['technology', 'ethical and environmental', 'competition', 'competitiveness', 'interrelationship']),
  source('aqa-3-3-1', '3.3.1', ['3.3 Marketing management', 'Marketing objectives'], 'Marketing objective setting and relevant market/sales measures.', ['sales volume', 'sales value', 'market size', 'market and sales growth', 'market share', 'brand loyalty']),
  source('aqa-3-3-2', '3.3.2', ['3.3 Marketing management', 'Markets and customers'], 'Research, sampling, quantitative market measures, interpretation and elasticity boundaries.', ['primary', 'secondary', 'qualitative', 'quantitative', 'random', 'stratified', 'quota', 'correlation', 'confidence intervals', 'extrapolation', 'interpret, not calculate', 'price elasticity', 'income elasticity', 'revenue']),
  source('aqa-3-3-3', '3.3.3', ['3.3 Marketing management', 'Segmentation targeting positioning'], 'STP, segment methods, niche/mass targeting and market mapping.', ['demographic', 'geographic', 'income', 'behavioural', 'niche', 'mass marketing', 'market mapping']),
  source('aqa-3-3-4', '3.3.4', ['3.3 Marketing management', 'Marketing mix'], 'Full 7Ps and the named product, pricing, promotion, distribution and digital methods required by the specification.', ['7Ps', 'Boston Matrix', 'product life cycle', 'penetration', 'price skimming', 'branding', 'social media', 'viral marketing', 'multi-channel distribution', 'people', 'process', 'physical environment', 'integrated marketing mix', 'digital marketing', 'e-commerce']),

  source('aqa-3-4-cross-cutting', '3.4', ['3.4 Operational management', 'Cross-cutting'], 'Operational decisions consider technology, ethics/environment, competition, competitiveness and interrelationships.', ['technology', 'ethical and environmental', 'competition', 'competitiveness', 'interrelationship']),
  source('aqa-3-4-1', '3.4.1', ['3.4 Operational management', 'Operational objectives'], 'Operational objectives and added value.', ['costs', 'quality', 'speed of response', 'flexibility', 'environmental objectives', 'added value']),
  source('aqa-3-4-2', '3.4.2', ['3.4 Operational management', 'Operational performance'], 'Calculate, interpret and use core operations performance data.', ['labour productivity', 'unit costs', 'capacity', 'capacity utilisation']),
  source('aqa-3-4-3', '3.4.3', ['3.4 Operational management', 'Efficiency and productivity'], 'Capacity, efficiency/productivity, lean, resource mix and technology.', ['Just in Time', 'Just in Case', 'labour intensive', 'capital intensive', 'efficiency', 'labour productivity', 'capacity']),
  source('aqa-3-4-4', '3.4.4', ['3.4 Operational management', 'Quality'], 'Quality improvement methods, value, difficulty and consequences of poor quality.', ['quality assurance', 'quality control', 'poor quality']),
  source('aqa-3-4-5', '3.4.5', ['3.4 Operational management', 'Inventory and supply chains'], 'Supply-demand matching, inventory control, suppliers, supply chains and outsourcing.', ['outsourcing', 'temporary', 'part time', 'producing to order', 'inventory control charts', 'lead time', 're-order levels', 'buffer', 're-order quantities', 'suppliers', 'supply chain']),

  source('aqa-3-5-cross-cutting', '3.5', ['3.5 Financial management', 'Cross-cutting'], 'Financial decisions consider technology, competition, ethics/environment, competitiveness and interrelationships.', ['technology', 'competition', 'ethical and environmental', 'competitiveness', 'interrelationship']),
  source('aqa-3-5-1', '3.5.1', ['3.5 Financial management', 'Financial objectives'], 'Financial objectives, return on investment, cash/profit and profit-level distinctions.', ['return on investment', 'revenue', 'costs', 'profit', 'cash flow', 'gross profit', 'operating profit', 'profit for the year']),
  source('aqa-3-5-2', '3.5.2', ['3.5 Financial management', 'Financial performance'], 'Budgets, cash-flow forecasts, break-even, profitability and cash-timing analysis.', ['variance', 'adverse', 'favourable', 'break-even', 'margin of safety', 'contribution per unit', 'total contribution', 'gross profit', 'profit from operations', 'profit for the year', 'payables', 'receivables']),
  source('aqa-3-5-3', '3.5.3', ['3.5 Financial management', 'Sources of finance'], 'Internal/external and short/long-term finance choices.', ['debt factoring', 'overdrafts', 'retained profits', 'share capital', 'loans', 'venture capital', 'crowd funding']),
  source('aqa-3-5-4', '3.5.4', ['3.5 Financial management', 'Improving cash flow and profits'], 'Methods and difficulties of improving cash flow, profit and profitability.', ['cash flow', 'profits', 'profitability', 'difficulties']),

  source('aqa-3-6-cross-cutting', '3.6', ['3.6 Human resource management', 'Cross-cutting'], 'HR decisions consider technology, ethics/environment, labour markets/competition, competitiveness and interrelationships.', ['technology', 'ethical and environmental', 'labour market', 'competition', 'competitiveness', 'interrelationship']),
  source('aqa-3-6-1', '3.6.1', ['3.6 Human resource management', 'HR objectives'], 'HR objectives and soft/hard HRM.', ['employee engagement', 'talent development', 'training', 'diversity', 'number', 'skills', 'location', 'soft', 'hard']),
  source('aqa-3-6-2', '3.6.2', ['3.6 Human resource management', 'HR performance'], 'Calculate and interpret required HR performance measures.', ['labour turnover', 'labour productivity', 'employee costs as percentage of turnover', 'labour cost per unit']),
  source('aqa-3-6-3', '3.6.3', ['3.6 Human resource management', 'Organisational design and HR flow'], 'Required organisation structures/design decisions and human-resource flow.', ['functional', 'product-based', 'regional', 'matrix', 'authority', 'span', 'hierarchy', 'delegation', 'centralisation', 'decentralisation', 'human resource plan', 'recruitment', 'training', 'redeployment', 'redundancy']),
  source('aqa-3-6-4', '3.6.4', ['3.6 Human resource management', 'Motivation and engagement'], 'Current required motivation theories and financial/non-financial methods.', ['Taylor', 'Maslow', 'Herzberg', 'piece rate', 'commission', 'salary', 'performance-related pay', 'empowerment', 'team working', 'flexible working', 'job enrichment', 'job rotation']),
  source('aqa-3-6-5', '3.6.5', ['3.6 Human resource management', 'Employer-employee relations'], 'Employee involvement, representation, communication and relations.', ['trade unions', 'works councils', 'communication', 'relations']),

  source('aqa-3-7-1', '3.7.1', ['3.7 Strategic position', 'Mission objectives and strategy'], 'Mission, corporate/functional objectives, short-termism, strategy/tactics and SWOT.', ['short termism', 'ownership', 'strategy', 'tactics', 'functional objectives', 'SWOT']),
  source('aqa-3-7-2', '3.7.2', ['3.7 Strategic position', 'Financial ratio analysis'], 'Required strategic financial ratios and comparative interpretation.', ['return on capital employed', 'current ratio', 'gearing', 'payables days', 'receivables days', 'inventory turnover']),
  source('aqa-3-7-3', '3.7.3', ['3.7 Strategic position', 'Overall performance'], 'Non-financial performance, core competences, time horizons and Triple Bottom Line.', ['operations', 'human resource', 'marketing', 'core competences', 'short-', 'long-term', 'Elkington', 'Triple Bottom Line', 'Profit', 'People', 'Planet']),
  source('aqa-3-7-4', '3.7.4', ['3.7 Strategic position', 'Political and legal change'], 'Political/legal impacts including competition, labour/environment law and government/regulatory policy.', ['competition', 'labour market', 'environmental legislation', 'enterprise', 'regulators', 'infrastructure', 'international trade']),
  source('aqa-3-7-5', '3.7.5', ['3.7 Strategic position', 'Economic change'], 'Interpret UK/global economic change and its business implications.', ['GDP', 'taxation', 'exchange rates', 'inflation', 'fiscal', 'monetary', 'open trade', 'protectionism']),
  source('aqa-3-7-6', '3.7.6', ['3.7 Strategic position', 'Social and technological change'], 'Demographic/social/online change, CSR and Carroll, plus technological impacts.', ['migration', 'consumer lifestyle', 'online businesses', 'Corporate Social Responsibility', 'stakeholder', 'shareholder', 'Carroll', 'technological change']),
  source('aqa-3-7-7', '3.7.7', ['3.7 Strategic position', 'Competitive environment'], 'Porter Five Forces and implications for strategy/profit.', ['Porter', 'entry threat', 'buyer power', 'supplier power', 'rivalry', 'substitute threat']),
  source('aqa-3-7-8', '3.7.8', ['3.7 Strategic position', 'Investment appraisal'], 'Calculate and interpret all current investment-appraisal methods and evaluate investment criteria.', ['payback', 'average rate of return', 'net present value', 'investment criteria', 'non-financial', 'risk', 'uncertainty']),

  source('aqa-3-8-1', '3.8.1', ['3.8 Strategic direction', 'Markets and products'], 'Ansoff strategic-direction options and their value.', ['Ansoff', 'market penetration', 'market development', 'new product development', 'diversification']),
  source('aqa-3-8-2', '3.8.2', ['3.8 Strategic direction', 'Strategic positioning'], 'Porter positioning choices, influences, value and sustainable advantage.', ['Porter', 'low cost', 'differentiation', 'focus', 'competitive advantage']),

  source('aqa-3-9-1', '3.9.1', ['3.9 Strategic methods', 'Change in scale'], 'Growth/retrenchment, scale/scope effects and required growth methods/types.', ['organic', 'external', 'technical', 'purchasing', 'managerial', 'economies of scope', 'diseconomies', 'synergy', 'overtrading', 'mergers', 'takeovers', 'ventures', 'franchising', 'vertical', 'horizontal', 'conglomerate']),
  source('aqa-3-9-2', '3.9.2', ['3.9 Strategic methods', 'Innovation'], 'Innovation pressures/value, innovative organisation methods and IP protection.', ['product', 'process innovation', 'Kaizen', 'research and development', 'intrapreneurship', 'benchmarking', 'patents', 'copyrights']),
  source('aqa-3-9-3', '3.9.3', ['3.9 Strategic methods', 'Globalisation and internationalisation'], 'Globalisation, international-market choice/entry, overseas sourcing/production and international management.', ['emerging economies', 'export', 'licensing', 'alliances', 'direct investment', 'off-shoring', 're-shoring', 'multinational', 'local responsiveness', 'cost reduction']),
  source('aqa-3-9-4', '3.9.4', ['3.9 Strategic methods', 'Digital technology'], 'Pressures for and value of required digital technologies.', ['automation', 'e-commerce', 'big data', 'data mining']),

  source('aqa-3-10-1', '3.10.1', ['3.10 Strategic change', 'Managing change'], 'Types/value of change, flexible organisations, knowledge and resistance using current required models.', ['internal change', 'external change', 'incremental change', 'disruptive change', 'Lewin', 'restructuring', 'delayering', 'flexible employment contracts', 'organic', 'mechanistic', 'knowledge', 'Kotter and Schlesinger']),
  source('aqa-3-10-2', '3.10.2', ['3.10 Strategic change', 'Organisational culture'], 'Culture importance/influences/change using Handy current culture types.', ['Handy', 'task culture', 'role culture', 'power culture', 'person culture']),
  source('aqa-3-10-3', '3.10.3', ['3.10 Strategic change', 'Strategic implementation'], 'Leadership, communication, structure and current network-analysis scope.', ['leadership', 'communications', 'organisational structure', 'network diagrams', 'amendment', 'critical path', 'total float']),
  source('aqa-3-10-4', '3.10.4', ['3.10 Strategic change', 'Strategy problems and failure'], 'Strategic decision/implementation difficulty, emergence/drift, performance, planning and crisis/contingency.', ['planned', 'emergent', 'strategic drift', 'strategic performance', 'strategic planning', 'contingency planning', 'crisis management']),

  source('aqa-annex-quantitative', 'Annex: quantitative skills in business', ['Quantitative skills annex'], 'Course Truth must support all quantitative methods and interpretation boundaries required for A-level Business.', ['ratios', 'averages', 'percentages', 'percentage change', 'index numbers', 'market size', 'market share', 'market growth', 'break-even', 'labour productivity', 'capacity utilisation', 'labour turnover', 'gearing', 'payables days', 'receivables days', 'inventory turnover', 'expected value', 'net gain', 'payback', 'average rate of return', 'net present value', 'interpret, not calculate']),
]

function source(
  requirementId: string,
  officialReference: string,
  path: string[],
  summary: string,
  requiredTerms: string[] = [],
): SourceRequirement {
  return {
    requirementId,
    officialReference,
    path,
    summary,
    requiredTerms,
    sourceRefs: officialReference.startsWith('Annex')
      ? ['aqa-7132-specification']
      : ['aqa-7132-subject-content'],
  }
}

export function buildAqaAlevelBusiness7132CurriculumObligations(
  semanticItems: FoundationSemanticCoverageItem[],
): FoundationCoverageObligation[] {
  return sourceRequirements.map((requirement) => ({
    obligationId: requirement.requirementId,
    officialReference: `AQA 7132 ${requirement.officialReference}`,
    curriculumPath: requirement.path,
    summary: requirement.summary,
    semanticItemIds: semanticItems
      .filter((item) => item.requirementId === requirement.requirementId)
      .map((item) => item.id),
    requiredTerms: requirement.requiredTerms ?? [],
    sourceRefs: requirement.sourceRefs ?? ['aqa-7132-subject-content'],
  }))
}

export const AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS = sourceRequirements
