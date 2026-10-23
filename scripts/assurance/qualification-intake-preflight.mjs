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
  const pending = Object.entries(intake?.assurance ?? {}).filter(([,v])=>v!==true).map(([k])=>k);
  check(pending.length === Object.keys(intake?.assurance ?? {}).length, 'unearned_assurance_approval');
  return { structural_preflight:failures.length===0?'PASS':'FAIL', publication_decision:'HOLD', preproduction_decision:'HOLD', failures, open_gates:pending, candidate_nodes:index?.candidate_node_count ?? 0, verified_reuse_percent:null, produced_learner_assets:0 };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const intake=JSON.parse(readFileSync(process.argv[2] ?? DEFAULT_INTAKE,'utf8'));
  const index=JSON.parse(readFileSync(DEFAULT_INDEX,'utf8'));
  const result=checkQualificationIntake(intake,index);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if (result.structural_preflight !== 'PASS') process.exitCode=1;
}
