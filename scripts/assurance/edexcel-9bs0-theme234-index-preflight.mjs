import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const additionalIndexPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-theme234-identifier-index.json');
export const theme1IndexPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-theme1-identifier-index.json');
export const intakePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-stage5-intake.json');

// Independent compact source-layout control transcribed from the current Pearson Issue 1 specification.
// Format: subtopic | letter identifiers | indented bullet count for each letter | zero-based PDF page.
const ROWS=[
'2.1.1 abc 0,0,0 25','2.1.2 ab 6,7 25','2.1.3 ab 0,0 25','2.1.4 abc 0,0,0 25',
'2.2.1 abc 0,3,0 26','2.2.2 ab 0,0 26','2.2.3 abcdef 0,1,0,0,0,0 26','2.2.4 abcd 0,2,0,0 26',
'2.3.1 abc 3,2,0 27','2.3.2 ab 2,0 27','2.3.3 a 2 27',
'2.4.1 abc 4,1,1 28','2.4.2 abc 1,0,0 28','2.4.3 abcdef 0,0,0,0,0,0 28','2.4.4 abc 4,0,0 28',
'2.5.1 ab 5,0 29','2.5.2 a 5 29','2.5.3 a 0 29',
'3.1.1 ab 0,0 31','3.1.2 abcd 2,0,0,0 31','3.1.3 a 2 31','3.1.4 abc 0,0,0 31',
'3.2.1 ab 4,3 32','3.2.2 abcde 0,0,0,0,0 32','3.2.3 abc 0,0,0 32','3.2.4 a 4 32',
'3.3.1 abc 1,0,0 33','3.3.2 abcde 0,0,0,0,0 33','3.3.3 abc 0,0,0 33','3.3.4 abcd 0,0,3,0 33',
'3.4.1 ab 0,0 34','3.4.2 abcd 0,4,0,0 34','3.4.3 abcd 0,0,2,0 34','3.4.4 abc 1,0,0 34',
'3.5.1 ab 2,2 35','3.5.2 abc 2,0,0 35','3.5.3 ab 3,4 35',
'3.6.1 ab 5,4 36','3.6.2 abcd 0,0,0,0 36','3.6.3 ab 3,2 36',
'4.1.1 abcd 0,0,2,4 39','4.1.2 abc 0,0,0 39','4.1.3 abcdefgh 0,0,0,0,0,0,0,0 39','4.1.4 abc 0,0,2 39','4.1.5 ab 3,0 39',
'4.2.1 abcd 2,2,0,0 40','4.2.2 a 5 40','4.2.3 a 9 40','4.2.4 abcde 0,0,0,0,0 40','4.2.5 abc 0,2,0 40',
'4.3.1 abc 0,3,0 41','4.3.2 abc 0,0,0 41','4.3.3 a 6 41',
'4.4.1 ab 3,6 42','4.4.2 abcde 0,0,2,2,2 42','4.4.3 a 4 42'
];
const parse=row=>{
 const [id,letters,counts,p]=row.split(' ');
 return {id,letter_ids:[...letters].map(letter=>id+':'+letter),nested_bullet_counts:counts.split(',').map(Number),source_pdf_page_zero_based:Number(p)};
};
const SOURCE=ROWS.map(parse);
const expectedTerminal=SOURCE.flatMap(row=>row.letter_ids.flatMap((parent,i)=>{
 const n=row.nested_bullet_counts[i];
 return n>0?Array.from({length:n},(_,j)=>({id:parent+'/'+(j+1),parent_letter_id:parent,source_pdf_page_zero_based:row.source_pdf_page_zero_based})):[{id:parent,parent_letter_id:parent,source_pdf_page_zero_based:row.source_pdf_page_zero_based}];
}));
const expectedTotals={2:{numbered:18,lettered:50,terminal:83},3:{numbered:22,lettered:64,terminal:98},4:{numbered:16,lettered:49,terminal:91}};

export function checkEdexcelThemes234Index(index,theme1,intake){
 const failures=[]; const check=(ok,id)=>{if(!ok)failures.push(id)};
 const rows=index?.subtopic_source_index??[];
 const references=index?.terminal_reference_ids??[];
 const previous=theme1?.subtopic_source_index??[];
 const allOfficialIds=intake?.numbered_subtopic_index?.subtopics?.map(t=>t.id)??[];
 const allCombined=[...previous.map(x=>x.id),...rows.map(x=>x.id)];
 check(index?.schema_version==='edexcel-9bs0-theme234-structural-identifier-v1'
  && index?.status==='SOURCE_REFERENCE_INDEX_UNAPPROVED'
  && index?.source_id==='PEARSON-SPEC-9BS0-2014-I1'
  && index?.rights==='REFERENCE_ONLY'
  && index?.source_prose_ingestion_allowed===false
  && index?.qualification_code==='9BS0' && intake?.qualification?.code==='9BS0',
  'source_rights_or_identity_mismatch');
 check(JSON.stringify(index?.theme_ids)===JSON.stringify([2,3,4])
  && JSON.stringify(rows)===JSON.stringify(SOURCE)
  && rows.length===56,'numbered_lettered_or_nested_index_drift');
 check(references.length===272&&expectedTerminal.length===272
  && references.every((v,i)=>v.id===expectedTerminal[i]?.id
    && v.parent_letter_id===expectedTerminal[i]?.parent_letter_id
    && v.source_pdf_page_zero_based===expectedTerminal[i]?.source_pdf_page_zero_based),
  'terminal_reference_missing_or_invalid');
 check(references.every(x=>x.review_state==='SOURCE_ID_ONLY_UNASSESSED'
  && x.candidate_reuse_state==='UNMEASURED'
  && x.learner_asset_state==='NONE'),
  'reference_auto_approved_or_generated');
 check(JSON.stringify(index?.reference_counts)===JSON.stringify(expectedTotals),
  'source_reference_totals_inconsistent');
 check(previous.length===24&&allOfficialIds.length===80&&allCombined.length===80
  && new Set(allCombined).size===80
  && JSON.stringify(allCombined)===JSON.stringify(allOfficialIds),
  'whole_course_numbered_source_identity_mismatch');
 const a=index?.assurance??{};
 check(a.structural_data_recorded===true
  && a.atomic_educational_completeness===false
  && a.nested_requirement_semantics_reviewed===false
  && a.exact_2027_specification_verified===false
  && a.source_operation_permissions_confirmed_for_generation===false
  && a.foundation_reuse_measured===false
  && a.student_assets_produced===false
  && a.founder_publication_approved===false
  && index?.provider_calls===0 && index?.provider_cost_usd===0,
  'unsupported_educational_or_publication_claim');
 return {structural_status:failures.length?'FAIL':'PASS',failures,
  numbered_subtopics:allCombined.length,lettered_identifiers:75+163,
  terminal_reference_positions:153+272,
  atomic_requirements_complete:false,reuse_verified:false,
  publication_eligible:false,production_decision:'HOLD'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 const result=checkEdexcelThemes234Index(read(additionalIndexPath),read(theme1IndexPath),read(intakePath));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.structural_status!=='PASS')process.exitCode=1;
}
