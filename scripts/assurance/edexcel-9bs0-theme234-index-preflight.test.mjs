import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {checkEdexcelThemes234Index,additionalIndexPath,theme1IndexPath,intakePath} from './edexcel-9bs0-theme234-index-preflight.mjs';

const read=path=>JSON.parse(readFileSync(path,'utf8'));
const data=read(additionalIndexPath),theme1=read(theme1IndexPath),intake=read(intakePath);
const mutate=fn=>{const clone=structuredClone(data);fn(clone);return checkEdexcelThemes234Index(clone,theme1,intake);};
describe('9BS0 remaining themes source-only structural index',()=>{
 it('checks all four themes while continuing to HOLD educational and publication acceptance',()=>{
  const actual=checkEdexcelThemes234Index(data,theme1,intake);
  expect(actual).toMatchObject({structural_status:'PASS',numbered_subtopics:80,
   lettered_identifiers:238,terminal_reference_positions:425,
   atomic_requirements_complete:false,reuse_verified:false,publication_eligible:false,
   production_decision:'HOLD'});
 });
 it('rejects any omitted, changed or duplicated numbered topic or letter identifier',()=>{
  expect(mutate(x=>x.subtopic_source_index.pop()).failures).toContain('numbered_lettered_or_nested_index_drift');
  expect(mutate(x=>x.subtopic_source_index[0].letter_ids[0]='2.1.1:z').failures).toContain('numbered_lettered_or_nested_index_drift');
  expect(mutate(x=>x.subtopic_source_index[0].nested_bullet_counts[0]=1).failures).toContain('numbered_lettered_or_nested_index_drift');
 });
 it('rejects silently omitted or misparented indented bullets',()=>{
  expect(mutate(x=>x.terminal_reference_ids.pop()).failures).toContain('terminal_reference_missing_or_invalid');
  expect(mutate(x=>x.terminal_reference_ids[0].parent_letter_id='4.4.3:a').failures).toContain('terminal_reference_missing_or_invalid');
  expect(mutate(x=>x.terminal_reference_ids[0].source_pdf_page_zero_based=42).failures).toContain('terminal_reference_missing_or_invalid');
 });
 it('rejects source-rights widening and premature course approval',()=>{
  expect(mutate(x=>x.rights='OPEN').failures).toContain('source_rights_or_identity_mismatch');
  expect(mutate(x=>x.source_prose_ingestion_allowed=true).failures).toContain('source_rights_or_identity_mismatch');
  expect(mutate(x=>x.assurance.atomic_educational_completeness=true).failures).toContain('unsupported_educational_or_publication_claim');
  expect(mutate(x=>x.assurance.founder_publication_approved=true).failures).toContain('unsupported_educational_or_publication_claim');
  expect(mutate(x=>x.terminal_reference_ids[0].candidate_reuse_state='REUSED').failures).toContain('reference_auto_approved_or_generated');
 });
 it('requires combined current source-index identities to reconcile to the earlier independent intake',()=>{
  const faulty=structuredClone(intake);
  faulty.numbered_subtopic_index.subtopics.pop();
  expect(checkEdexcelThemes234Index(data,theme1,faulty).failures).toContain('whole_course_numbered_source_identity_mismatch');
  expect(mutate(x=>x.reference_counts[4].lettered=48).failures).toContain('source_reference_totals_inconsistent');
 });
});
