import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkQualificationIntake,DEFAULT_INTAKE,DEFAULT_INDEX } from './qualification-intake-preflight.mjs';

const source=JSON.parse(readFileSync(DEFAULT_INTAKE,'utf8'));
const index=JSON.parse(readFileSync(DEFAULT_INDEX,'utf8'));
const mutate=(fn)=>{ const copy=structuredClone(source);fn(copy);return checkQualificationIntake(copy,index); };
test('real Edexcel official-facts intake is structurally consistent but publication held',()=>{
 const out=checkQualificationIntake(source,index);
 assert.equal(out.structural_preflight,'PASS');
 assert.equal(out.publication_decision,'HOLD');
 assert.equal(out.verified_reuse_percent,null);
 assert.equal(out.produced_learner_assets,0);
 assert.ok(out.open_gates.includes('atomic_curriculum_requirements_complete'));
});
test('reject unequal qualification weights even when all papers have 100 raw marks',()=>{
 assert.ok(mutate(i=>i.components[2].qualification_weight_percent=35).failures.includes('weightings_not_100'));
});
test('reject false pre-release or lost synoptic requirement',()=>{
 assert.ok(mutate(i=>delete i.components[2].prerelease_context).failures.includes('paper_3_context_missing'));
 assert.ok(mutate(i=>i.obligations=i.obligations.filter(o=>o.id!=='SYNOPTIC_PAPER_3')).failures.includes('missing_obligation_SYNOPTIC_PAPER_3'));
});
test('reference-only source cannot be marked as model input',()=>{
 assert.ok(mutate(i=>i.sources[0].generative_input_allowed=true).failures.includes('source_rights_violation'));
});
test('reject fabricated Foundation reuse and unknown nodes',()=>{
 assert.ok(mutate(i=>i.topics[0].reuse_classification='REUSED').failures.includes('unearned_reuse_claim'));
 assert.ok(mutate(i=>i.topics[0].candidate_node_ids=['NOT-A-NODE']).failures.includes('candidate_node_link_not_in_index'));
});
test('reject hidden quantitative or content sections',()=>{
 assert.ok(mutate(i=>i.topics.pop()).failures.includes('twenty_section_headings_required'));
 assert.ok(mutate(i=>i.quantitative.required_skill_ids=[]).failures.includes('quantitative_obligations_incomplete'));
});
test('reject self-approved source or human-review claims',()=>{
 assert.ok(mutate(i=>i.assurance.foundation_approved=true).failures.includes('unearned_assurance_approval'));
});

test('all 80 official numbered subtopics remain unreviewed without pretending atomic completeness',()=>{
 const result=checkQualificationIntake(source,index);
 assert.equal(result.structural_preflight,'PASS');
 assert.equal(result.numbered_subtopics_structurally_indexed,80);
 assert.ok(result.open_gates.includes('atomic_curriculum_requirements_complete'));
 assert.equal(source.numbered_subtopic_index.subtopics.filter(x=>x.reusable_foundation_decision==='UNASSESSED').length,80);
});
test('lost subtopic, substitution and parent reassignment fail closed',()=>{
 assert.ok(mutate(i=>i.numbered_subtopic_index.subtopics.splice(10,1)).failures.includes('numbered_subtopic_index_incomplete_or_reordered'));
 assert.ok(mutate(i=>i.numbered_subtopic_index.subtopics[0].id='1.1.99').failures.includes('numbered_subtopic_index_incomplete_or_reordered'));
 assert.ok(mutate(i=>i.numbered_subtopic_index.subtopics[0].topic_id='4.4').failures.includes('subtopic_unsupported_promotion_or_invalid_locator'));
});
test('source page/provenance and premature reuse acceptance fail closed',()=>{
 assert.ok(mutate(i=>i.numbered_subtopic_index.subtopics[0].source_pdf_page_zero_based=-1).failures.includes('subtopic_unsupported_promotion_or_invalid_locator'));
 assert.ok(mutate(i=>i.numbered_subtopic_index.subtopics[0].reusable_foundation_decision='REUSED').failures.includes('subtopic_unsupported_promotion_or_invalid_locator'));
 assert.ok(mutate(i=>i.numbered_subtopic_index.licence_classification='OPEN').failures.includes('subtopic_source_provenance_or_authority_invalid'));
});
test('per-paper AO ranges must not be inferred from raw-paper marks',()=>{
 assert.ok(mutate(i=>i.assessment_objective_component_contributions.component_ranges[2].AO4=[8,10]).failures.includes('ao_component_ranges_inconsistent'));
 assert.ok(mutate(i=>i.assessment_objective_component_contributions.unit='percent_of_paper_raw_marks').failures.includes('ao_component_provenance_or_unit_invalid'));
});
test('seven official accounting ratio conventions cannot silently change',()=>{
 assert.equal(source.accounting_ratio_reference.ratios.length,7);
 assert.ok(mutate(i=>i.accounting_ratio_reference.ratios[5].numerator='total_liabilities').failures.includes('accounting_ratio_formula_contract_mismatch'));
 assert.ok(mutate(i=>i.accounting_ratio_reference.ratios.pop()).failures.includes('accounting_ratio_formula_contract_mismatch'));
});
test('hard educational reuse risks and atomic completion cannot be silently waived',()=>{
 assert.ok(mutate(i=>i.reuse_review_queue[0].verification_status='CLEARED').failures.includes('reuse_risks_silently_cleared_or_out_of_scope'));
 assert.ok(mutate(i=>i.assurance.atomic_curriculum_requirements_complete=true).failures.includes('unearned_assurance_approval'));
});

test('official 2027 final timetable confirms only paper dates, duration and sessions',()=>{
 const out=checkQualificationIntake(source,index);
 assert.equal(out.structural_preflight,'PASS');
 assert.equal(source.assessment_year_timetable_evidence.papers.length,3);
 assert.equal(source.assessment_year_timetable_evidence.pre_release_context_2027_verified,false);
});
test('reject 2027 schedule changes or unsupported specification approval',()=>{
 assert.ok(mutate(i=>i.assessment_year_timetable_evidence.papers[1].date='2027-05-20').failures.includes('official_2027_paper_dates_or_sessions_incorrect'));
 assert.ok(mutate(i=>i.assessment_year_timetable_evidence.exact_specification_currentness_confirmed=true).failures.includes('unsupported_2027_timetable_approval_claim'));
 assert.ok(mutate(i=>i.assessment_year_timetable_evidence.pre_release_context_2027_verified=true).failures.includes('unsupported_2027_timetable_approval_claim'));
});
test('reject timetable provenance that is not rights-safe reference-only',()=>{
 assert.ok(mutate(i=>i.assessment_year_timetable_evidence.source_id='UNVERIFIED').failures.includes('official_2027_timetable_provenance_or_rights_missing'));
 assert.ok(mutate(i=>i.sources.find(s=>s.id==='PEARSON-GCE-2027-FINAL-TIMETABLE').generative_input_allowed=true).failures.includes('official_2027_timetable_provenance_or_rights_missing'));
});
