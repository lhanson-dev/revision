import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';
import {auditEdexcelV08Reuse,firstSlicePath,intakePath} from './edexcel-9bs0-v08-reuse-audit.mjs';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const review=read(firstSlicePath),intake=read(intakePath);
const effective=await loadBusinessSubjectFoundationCandidate();
const mutate=(fn)=>{const copy=structuredClone(review);fn(copy);return auditEdexcelV08Reuse(effective,copy,intake);};
describe('Edexcel Stage 5 reuse evidence from effective Business v0.8, not stale v0.2 research',()=>{
 it('verifies actual effective version, fingerprint, source nodes and still holds publication',()=>{
  const result=auditEdexcelV08Reuse(effective,review,intake);
  expect(result.audit_status).toBe('PASS');
  expect(result.foundation_candidate_nodes).toBe(81);
  expect(result.foundation_candidate_version).toBe('v0.8-t8-exact-course-remediation');
  expect(result.foundation_candidate_fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(result.foundation_promotion_decision).toBe('NOT_YET_MADE');
  expect(result.edexcel_lettered_references).toBe(26);
  expect(result.references_without_candidate_node_ids).toEqual(['1.2.3:b']);
  expect(result.focused_market_requirements).toHaveLength(6);
  expect(result.measured_reuse_percent).toBeNull();
  expect(result.production_decision).toBe('HOLD');
  expect(result.publication_eligible).toBe(false);
  console.info('Stage 5 effective Business candidate:',result.foundation_candidate_version,
   'fingerprint:',result.foundation_candidate_fingerprint,
   'distinct candidate nodes:',result.distinct_candidate_nodes_in_first_slice,
   'changed awaiting reassurance:',result.effective_candidate_unreviewed_changed_nodes);
 });
 it('does not accept a v0.2 research source as the effective v0.8 Foundation',()=>{
  const fake={...effective,index:{...effective.index,candidate_version:'v0.2-post-board-candidate'}};
  expect(auditEdexcelV08Reuse(fake,review,intake).problems).toContain('effective_foundation_identity_invalid');
 });
 it('rejects dishonest promotion or source-rights changes',()=>{
  const bad={...effective,matrix:{...effective.matrix,policy:{...effective.matrix.policy,promotion_decision:'APPROVED'}}};
  expect(auditEdexcelV08Reuse(bad,review,intake).problems).toContain('foundation_unreviewed_promotion_boundary_broken');
  expect(mutate(x=>x.source_text_permitted_as_generation_input=true).problems).toContain('source_or_course_authority_invalid');
  expect(mutate(x=>x.approved_reuse_count=1).problems).toContain('source_or_course_authority_invalid');
 });
 it('rejects removed Edexcel obligations and fabricated effective candidate node IDs',()=>{
  expect(mutate(x=>x.lettered_obligations.pop()).problems).toContain('lettered_mapping_unreviewed_identity_invalid');
  expect(mutate(x=>x.lettered_obligations[0].candidate_subject_node_ids=['NOT-A-NODE']).problems).toContain('candidate_ids_not_in_effective_foundation');
 });
 it('rejects missing rights-eligible provenance for any candidate subject node',()=>{
  const bad={...effective,sourceById:new Map(effective.sourceById)};
  const id=review.lettered_obligations[0].candidate_subject_node_ids[0];
  const sourceId=effective.rows.get(id).subject_truth_sources[0];
  bad.sourceById.set(sourceId,{...effective.sourceById.get(sourceId),promotion_eligible:false});
  expect(auditEdexcelV08Reuse(bad,review,intake).audit_status).toBe('FAIL');
 });
});
