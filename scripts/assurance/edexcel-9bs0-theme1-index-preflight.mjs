import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const theme1Path = path.join(root, 'research/content-production-repeatability/edexcel-9bs0-theme1-identifier-index.json');
export const intakePath = path.join(root, 'research/content-production-repeatability/edexcel-9bs0-stage5-intake.json');
export const firstSlicePath = path.join(root, 'research/content-production-repeatability/edexcel-9bs0-first-slice-review.json');

// Independently checked against Pearson 9BS0 Issue 1, PDF pages 17–23 (zero based).
// A zero means the lettered row has no indented bullets and itself is the terminal reference.
// These counts are a structural source audit, NOT a complete atomic learning-demand model.
export const SOURCE_ROW_SHAPE = Object.freeze([
  ['1.1.1','abcd',[3,4,0,0],17],['1.1.2','abcde',[0,3,0,3,0],17],['1.1.3','abcd',[0,0,0,0],17],
  ['1.2.1','a',[7],18],['1.2.2','a',[5],18],['1.2.3','ab',[0,0],18],['1.2.4','abcde',[0,0,0,0,0],18],['1.2.5','abcd',[0,0,0,0],18],
  ['1.3.1','ab',[3,2],19],['1.3.2','abcde',[0,0,3,4,3],19],['1.3.3','abc',[6,6,2],20],['1.3.4','ab',[0,2],20],['1.3.5','abcde',[0,2,0,3,0],20],
  ['1.4.1','abcd',[0,4,0,2],21],['1.4.2','abc',[1,0,3],21],['1.4.3','abc',[4,3,0],21],['1.4.4','abcd',[0,4,5,8],22],['1.4.5','ab',[1,4],22],
  ['1.5.1','abcde',[0,0,0,0,0],23],['1.5.2','ab',[0,2],23],['1.5.3','abc',[0,0,6],23],['1.5.4','abc',[0,0,0],23],['1.5.5','ab',[0,0],23],['1.5.6','a',[0],23]
]);

export function checkEdexcelTheme1Index(index, intake, firstSlice) {
  const failures = [];
  const requireCondition = (ok, code) => { if (!ok) failures.push(code); };
  const expectedSubtopics = SOURCE_ROW_SHAPE.map(([id,letters,counts,page]) => ({
    id, letter_ids:[...letters].map(letter=>id+':'+letter), nested_bullet_counts:counts, source_pdf_page_zero_based:page
  }));
  const expectedLetterIds = expectedSubtopics.flatMap(x=>x.letter_ids);
  const expectedTerminal = SOURCE_ROW_SHAPE.flatMap(([id,letters,counts,page]) =>
    [...letters].flatMap((letter,i)=>{
      const parent=id+':'+letter;
      return (counts[i]>0 ? Array.from({length:counts[i]},(_,j)=>parent+'/'+(j+1)) : [parent])
        .map(id=>({id,parent_letter_id:parent,source_pdf_page_zero_based:page}));
    }));
  const rows = index?.terminal_reference_ids ?? [];
  const parents = index?.subtopic_source_index ?? [];
  const governedSubtopics = new Set((intake?.numbered_subtopic_index?.subtopics??[]).map(x=>x.id));
  const previouslyObserved = (firstSlice?.lettered_obligations??[]).map(x=>x.id);
  requireCondition(index?.schema_version === 'edexcel-9bs0-theme1-structural-identifier-v1'
    && index?.qualification_code === '9BS0' && intake?.qualification?.code === '9BS0'
    && index?.theme_id === 1 && index?.source_id === 'PEARSON-SPEC-9BS0-2014-I1'
    && index?.source_rights === 'REFERENCE_ONLY'
    && index?.source_prose_ingestion_allowed === false, 'qualification_or_reference_rights_mismatch');
  requireCondition(index?.educational_status==='REFERENCE_ONLY_SOURCE_INDEX_UNAPPROVED'
    && index?.reuse_measurement==='NOT_MEASURED' && index?.expert_review==='PENDING'
    && index?.exact_cohort_source_universe==='INCOMPLETE' && index?.full_atomic_coverage==='INCOMPLETE'
    && index?.production_decision==='HOLD' && index?.learner_assets_produced===0
    && index?.provider_calls===0, 'false_approval_or_publication');
  requireCondition(JSON.stringify(parents)===JSON.stringify(expectedSubtopics)
    && parents.length===24 && parents.every(x=>governedSubtopics.has(x.id)),
    'subtopic_or_lettered_denominator_drift');
  requireCondition(rows.length===153 && expectedLetterIds.length===75
    && rows.every((x,i)=>x.id===expectedTerminal[i]?.id
      && x.parent_letter_id===expectedTerminal[i]?.parent_letter_id
      && x.source_pdf_page_zero_based===expectedTerminal[i]?.source_pdf_page_zero_based),
    'missing_duplicate_or_misplaced_terminal_reference');
  requireCondition(rows.every(x=>x.review_state==='SOURCE_ID_ONLY_UNASSESSED'
    && x.candidate_reuse_state==='UNMEASURED'
    && x.learner_asset_state==='NONE'), 'unearned_terminal_coverage_or_reuse');
  requireCondition(index?.scope_statement?.includes('do NOT establish the final atomic requirement denominator')===true,
    'unsupported_atomic_denominator_claim');
  requireCondition(JSON.stringify(expectedLetterIds.slice(0,26))===JSON.stringify(previouslyObserved),
    'first_slice_bridge_mismatch');
  return {
    structural_status: failures.length?'FAIL':'PASS', failures,
    numbered_subtopics:parents.length, lettered_identifiers:expectedLetterIds.length,
    terminal_structural_references:rows.length,
    atomic_requirement_denominator_established:false,
    accepted_subject_reuse:null, provider_cost_usd:0, publication_eligible:false,
    production_decision:'HOLD'
  };
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const read=p=>JSON.parse(readFileSync(p,'utf8'));
  const out=checkEdexcelTheme1Index(read(theme1Path),read(intakePath),read(firstSlicePath));
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  if (out.structural_status!=='PASS')process.exitCode=1;
}
