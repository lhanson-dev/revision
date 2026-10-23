import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_INTAKE = path.resolve(here, '../../research/content-production-repeatability/edexcel-9bs0-stage5-intake.json');
export const DEFAULT_INDEX = path.resolve(here, '../../research/business-subject-foundation/v0.2-post-board-candidate/NODE_INDEX.json');

export function checkQualificationIntake(intake, index) {
  const failures = [];
  const check = (valid, reason) => { if (!valid) failures.push(reason); };
  const components = intake?.components ?? [];
  const topics = intake?.topics ?? [];
  const sources = intake?.sources ?? [];
  const idSet = new Set((index?.domains ?? []).flatMap(domain => domain.ids ?? []));
  check(intake?.classification === 'research_only_unapproved', 'intake_must_remain_research_only');
  check(intake?.qualification?.code === '9BS0', 'qualification_mismatch');
  check(components.length === 3 && new Set(components.map(c => c.id)).size === 3, 'three_distinct_papers_required');
  check(components.map(c => c.id).sort().join(',') === ['9BS0/01','9BS0/02','9BS0/03'].join(','), 'paper_id_mismatch');
  check(components.reduce((sum,c) => sum + c.qualification_weight_percent, 0) === 100, 'weightings_not_100');
  check(components.every(c => c.marks === 100 && c.duration_minutes === 120 && c.compulsory === true), 'paper_marks_timing_or_compulsion_invalid');
  check(components.every(c => c.sections?.join(',') === 'A,B'), 'paper_sections_invalid');
  check((components.find(c=>c.id === '9BS0/03')?.themes ?? []).join(',') === '1,2,3,4', 'paper_3_not_synoptic');
  check(components.find(c=>c.id === '9BS0/03')?.prerelease_context === true, 'paper_3_context_missing');
  check((intake?.themes ?? []).length === 4, 'four_themes_required');
  check(topics.length === 20 && new Set(topics.map(t=>t.id)).size === 20, 'twenty_section_headings_required');
  check(topics.every(t => t.id.startsWith(String(t.theme)+'.')), 'topic_theme_mismatch');
  check(topics.every(t => t.candidate_link_status === 'TOPIC_LEVEL_OPPORTUNITY_UNVERIFIED' && t.reuse_classification === 'UNMEASURED'), 'unearned_reuse_claim');
  check(topics.every(t => t.candidate_node_ids?.length > 0 && t.candidate_node_ids.every(id=>idSet.has(id))), 'candidate_node_link_not_in_index');
  check(idSet.size === index?.candidate_node_count && index?.authority_status === 'research_evidence_only', 'candidate_index_inconsistent_or_promoted');
  check(sources.length >= 3 && sources.every(s => s.rights === 'REFERENCE_ONLY' && s.generative_input_allowed === false && s.publication_reproduction_allowed === false), 'source_rights_violation');
  check((intake?.assessment_objectives ?? []).map(x=>x.id).join(',') === 'AO1,AO2,AO3,AO4', 'assessment_objectives_incomplete');
  check(intake?.quantitative?.qualification_marks_minimum_percent === 10 && intake.quantitative.required_skill_ids?.length === 9, 'quantitative_obligations_incomplete');
  const obligations = new Set((intake?.obligations ?? []).map(o=>o.id));
  for (const required of ['PRE_RELEASE_2027_CONTEXT','SYNOPTIC_PAPER_3','SUMMER_2027_CASE_PRESENTATION','ACCOUNTING_RATIO_CONVENTIONS','QUANTITATIVE_SKILLS_10_PERCENT','COMPONENT_AO_RANGES_AND_COMMAND_DEMAND']) {
    check(obligations.has(required), 'missing_obligation_'+required);
  }
  const expectedSubtopicCounts = {
    '1.1':3,'1.2':5,'1.3':5,'1.4':5,'1.5':6,
    '2.1':4,'2.2':4,'2.3':3,'2.4':4,'2.5':3,
    '3.1':4,'3.2':4,'3.3':4,'3.4':4,'3.5':3,'3.6':3,
    '4.1':5,'4.2':5,'4.3':3,'4.4':3
  };
  const idx = intake?.numbered_subtopic_index;
  const entries = idx?.subtopics ?? [];
  const expectedIds = Object.entries(expectedSubtopicCounts).flatMap(([id,count]) =>
    Array.from({length:count}, (_,i)=>`${id}.${i+1}`));
  const actualIds = entries.map(item=>item.id);
  check(idx?.source_id === 'PEARSON-SPEC-9BS0-2014-I1'
    && idx?.licence_classification === 'REFERENCE_ONLY'
    && idx?.record_status === 'NUMBERED_SUBTOPIC_IDENTIFIERS_ONLY_NOT_ATOMIC_REQUIREMENTS',
    'subtopic_source_provenance_or_authority_invalid');
  check(expectedIds.length === 80
    && entries.length === expectedIds.length
    && actualIds.every((id,i)=>id === expectedIds[i]), 'numbered_subtopic_index_incomplete_or_reordered');
  check(entries.every(e=>e.topic_id===e.id.split('.').slice(0,2).join('.')
    && e.theme===Number(e.id[0])
    && Number.isInteger(e.source_pdf_page_zero_based)
    && e.source_pdf_page_zero_based>=17 && e.source_pdf_page_zero_based<=42
    && e.review_status==='NOT_YET_ATOMICALLY_MAPPED'
    && e.reusable_foundation_decision==='UNASSESSED'
    && e.asset_coverage_status==='NOT_PRODUCED'), 'subtopic_unsupported_promotion_or_invalid_locator');
  check(Object.keys(expectedSubtopicCounts).every(id=>topics.some(t=>t.id===id)), 'subtopic_parent_topic_missing');
  check(idx?.remaining_denominator === 'LETTERED_AND_NESTED_EXAMINABLE_REQUIREMENTS_NOT_YET_ENUMERATED',
    'atomic_completeness_false_claim');
  const ao = intake?.assessment_objective_component_contributions;
  const actualRanges = ao?.component_ranges ?? [];
  const expectedRanges = [
    ['9BS0/01',[6,8],[7,9],[9,11],[8,10]],
    ['9BS0/02',[6,8],[7,9],[9,11],[8,10]],
    ['9BS0/03',[5,7],[5,7],[9,11],[9,11]]
  ];
  check(ao?.source_id==='PEARSON-SPEC-9BS0-2014-I1'
    && ao?.source_pdf_page_zero_based===47
    && ao?.unit==='percentage_points_of_total_qualification_not_component_raw_marks',
    'ao_component_provenance_or_unit_invalid');
  check(actualRanges.length===3 && expectedRanges.every(([component,...aos],i)=>{
    const candidate=actualRanges[i];
    return candidate?.component===component
      && ['AO1','AO2','AO3','AO4'].every((name,j)=>JSON.stringify(candidate[name])===JSON.stringify(aos[j]));
  }), 'ao_component_ranges_inconsistent');
  const ratioCatalog = [
    ['GROSS_PROFIT_MARGIN','gross_profit','revenue',100],
    ['OPERATING_PROFIT_MARGIN','operating_profit','revenue',100],
    ['NET_PROFIT_MARGIN','profit_for_year','revenue',100],
    ['CURRENT_RATIO','current_assets','current_liabilities',1],
    ['ACID_TEST_RATIO','current_assets_minus_inventory','current_liabilities',1],
    ['GEARING_RATIO','non_current_liabilities','capital_employed',100],
    ['ROCE','operating_profit','capital_employed',100]
  ];
  const ratio = intake?.accounting_ratio_reference;
  check(ratio?.source_id==='PEARSON-SPEC-9BS0-2014-I1'
    && ratio?.source_pdf_page_zero_based===64
    && ratio?.capital_employed_definition==='non_current_liabilities_plus_total_equity',
    'accounting_ratio_reference_invalid');
  check(ratio?.ratios?.length === ratioCatalog.length && ratioCatalog.every(([id,numerator,denominator,multiply_by],i)=>{
    const actual=ratio.ratios[i];
    return actual?.id===id && actual?.numerator===numerator
      && actual?.denominator===denominator && actual?.multiply_by===multiply_by;
  }), 'accounting_ratio_formula_contract_mismatch');
  check(intake?.quantitative?.skill_source_reference?.skill_count===9
    && intake.quantitative.skill_source_reference.source_pdf_page_zero_based===62,
    'quantitative_skill_source_reference_missing');
  const riskQueue = intake?.reuse_review_queue ?? [];
  check(riskQueue.length>=8 && riskQueue.every(x=>expectedIds.includes(x.subtopic_id)
    && x.verification_status==='UNRESOLVED'
    && x.not_an_asserted_defect===true), 'reuse_risks_silently_cleared_or_out_of_scope');
  const timetable = intake?.assessment_year_timetable_evidence;
  const expectedTimetable = [
    {id:'9BS0/01',date:'2027-05-13',session:'afternoon',duration_minutes:120},
    {id:'9BS0/02',date:'2027-05-19',session:'morning',duration_minutes:120},
    {id:'9BS0/03',date:'2027-06-08',session:'afternoon',duration_minutes:120}
  ];
  check(timetable?.status==='OFFICIAL_FINAL_PAPER_SCHEDULE_CONFIRMED_NOT_FULL_COHORT_SPEC_APPROVAL'
    && timetable?.assessment_year===2027
    && timetable?.source_id==='PEARSON-GCE-2027-FINAL-TIMETABLE'
    && sources.some(s=>s.id===timetable.source_id && s.rights==='REFERENCE_ONLY'
      && s.generative_input_allowed===false && s.publication_reproduction_allowed===false),
    'official_2027_timetable_provenance_or_rights_missing');
  check(JSON.stringify(timetable?.papers)===JSON.stringify(expectedTimetable),
    'official_2027_paper_dates_or_sessions_incorrect');
  check(timetable?.specific_start_clock_time_confirmed===false
    && timetable?.exact_specification_currentness_confirmed===false
    && timetable?.pre_release_context_2027_verified===false
    && timetable?.source_operation_rights_expanded===false,
    'unsupported_2027_timetable_approval_claim');
  const pending = Object.entries(intake?.assurance ?? {}).filter(([k,v])=>
    k!=='numbered_subtopic_identifiers_structurally_indexed' && v!==true).map(([k])=>k);
  check(intake?.assurance?.numbered_subtopic_identifiers_structurally_indexed===true
    && pending.length===Object.keys(intake?.assurance ?? {}).length-1, 'unearned_assurance_approval');
  return { structural_preflight:failures.length===0?'PASS':'FAIL', publication_decision:'HOLD', preproduction_decision:'HOLD', failures, open_gates:pending, candidate_nodes:index?.candidate_node_count ?? 0, verified_reuse_percent:null, produced_learner_assets:0, numbered_subtopics_structurally_indexed:entries.length, accounting_ratio_reference_count:ratio?.ratios?.length ?? 0, unresolved_reuse_risks:riskQueue.length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const intake=JSON.parse(readFileSync(process.argv[2] ?? DEFAULT_INTAKE,'utf8'));
  const index=JSON.parse(readFileSync(DEFAULT_INDEX,'utf8'));
  const result=checkQualificationIntake(intake,index);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if (result.structural_preflight !== 'PASS') process.exitCode=1;
}
