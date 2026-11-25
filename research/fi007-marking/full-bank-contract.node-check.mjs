import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateBank,buildRequest} from './full-bank-contract.mjs';
const bank=JSON.parse(readFileSync(new URL('./full-bank-candidate-packs.json',import.meta.url),'utf8'));
const clone=()=>JSON.parse(JSON.stringify(bank));
test('all 39 question-specific research contracts have valid distinct identities and scales',()=>{const result=validateBank(bank);assert.deepEqual(result.errors,[]);assert.equal(bank.packs.length,39);assert.equal(new Set(bank.packs.map(p=>p.id)).size,39);});
test('all 39 requests use their exact own question, stimulus and guide',()=>{for(const p of bank.packs){const r=buildRequest(bank,p.id,'Synthetic answer only');assert.equal(r.questionId,p.id);assert.equal(r.question,p.prompt);assert.equal(r.stimulus,p.stimulus);assert.deepEqual(r.questionSpecificGuide,p.guide);assert.equal(r.maximum,p.maxMark);assert.ok(!('referenceMark' in r));}assert.throws(()=>buildRequest(bank,'UNKNOWN','test'));assert.throws(()=>buildRequest(bank,bank.packs[0].id,''));});
test('reject duplicate identities, missing stimulus and invented Research Methods AO allocation',()=>{const a=clone();a.packs[1].id=a.packs[0].id;assert.ok(validateBank(a).errors.length);const b=clone();b.packs.find(p=>p.family==='business-contextual-16').stimulus=null;assert.ok(validateBank(b).errors.length);const c=clone();c.families['psychology-research-methods-training'].emphasis={AO1:6,AO3:10};assert.ok(validateBank(c).errors.length);});
