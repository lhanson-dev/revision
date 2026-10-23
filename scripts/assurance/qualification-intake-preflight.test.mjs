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
