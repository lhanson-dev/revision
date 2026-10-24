import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';
import {checkEdexcelMarketObligations,obligationsPath,sourceIndexPath,firstSlicePath} from './edexcel-9bs0-market-obligations-preflight.mjs';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const doc=read(obligationsPath),index=read(sourceIndexPath),slice=read(firstSlicePath);
const foundation=await loadBusinessSubjectFoundationCandidate();
const mutate=fn=>{const candidate=structuredClone(doc);fn(candidate);return checkEdexcelMarketObligations(candidate,index,slice,foundation);};

describe('9BS0 section 1.2 provisional atomic skills against real v0.8 Business Foundation',()=>{
 it('indexes 23 source positions and 26 skills but never grants coverage or publication',()=>{
   const report=checkEdexcelMarketObligations(doc,index,slice,foundation);
   expect(report).toMatchObject({structural_status:'PASS',
    official_source_reference_count:23,mapped_source_reference_count:23,
    provisional_skills:26,provisional_skills_with_candidate_links:24,
    accepted_reuse_percent:null,independent_educational_acceptance:false,
    production_decision:'HOLD',publication_eligible:false});
   expect(report.unlinked_skill_ids).toEqual(['EDX-9BS0-MKT-14A','EDX-9BS0-MKT-14B']);
   expect(report.candidate_fingerprint).toMatch(/^[0-9a-f]{64}$/);
 });
 it('rejects omitted, duplicated and retagged skill requirements',()=>{
   expect(mutate(x=>x.obligations.pop()).errors).toContain('provisional_skill_inventory_incomplete_or_mutated');
   expect(mutate(x=>x.obligations[0].id=x.obligations[1].id).errors).toContain('provisional_skill_inventory_incomplete_or_mutated');
   expect(mutate(x=>x.obligations[14].competency_type='causal_explanation').errors).toContain('provisional_skill_inventory_incomplete_or_mutated');
   expect(mutate(x=>x.obligations[1].source_reference_id='1.2.5:d').errors).toContain('educational_requirement_evidence_or_source_identity_invalid');
 });
 it('will not accept an invented node or borrow AQA mapping as Edexcel truth',()=>{
   expect(mutate(x=>x.obligations[0].candidate_subject_node_ids=['BUS-UNKNOWN']).errors).toContain('node_mapping_not_in_original_first_slice_or_effective_foundation');
   expect(mutate(x=>x.obligations[0].candidate_subject_node_ids=['BUS-FIN-014']).errors).toContain('node_mapping_not_in_original_first_slice_or_effective_foundation');
 });
 it('requires independent diagram evidence before suggesting graph reuse',()=>{
   expect(mutate(x=>x.obligations[14].candidate_subject_node_ids=['BUS-MKT-001']).errors).toContain('unverified_diagram_reuse_falsely_asserted');
 });
 it('rejects false legal, educational and model cost conclusions',()=>{
   expect(mutate(x=>x.source_use='OPEN').errors).toContain('reference_only_source_or_identity_violation');
   expect(mutate(x=>x.approved_course_truth=true).errors).toContain('unearned_atomicity_reuse_or_publication_approval');
   expect(mutate(x=>x.reuse_percentage_confirmed=90).errors).toContain('unearned_atomicity_reuse_or_publication_approval');
   expect(mutate(x=>x.provider_calls=1).errors).toContain('unearned_atomicity_reuse_or_publication_approval');
   expect(mutate(x=>x.obligations[0].qualified_human_reuse_decision='REUSED').errors).toContain('educational_requirement_evidence_or_source_identity_invalid');
 });
 it('rejects an index losing a required terminal source position',()=>{
   const changed=structuredClone(index);
   changed.terminal_reference_ids.splice(changed.terminal_reference_ids.findIndex(x=>x.id==='1.2.2:a/3'),1);
   expect(checkEdexcelMarketObligations(doc,changed,slice,foundation).errors).toContain('official_market_source_reference_index_drift');
 });
 it('rejects promotion of an effective Foundation that is still under review',()=>{
   const altered={...foundation,matrix:{...foundation.matrix,policy:{...foundation.matrix.policy,promotion_decision:'APPROVED'}}};
   expect(checkEdexcelMarketObligations(doc,index,slice,altered).errors).toContain('effective_foundation_incorrect_or_prematurely_promoted');
 });
});
