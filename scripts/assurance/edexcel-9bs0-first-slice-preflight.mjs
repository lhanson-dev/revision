import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const defaultReviewPath = path.join(root, 'research/content-production-repeatability/edexcel-9bs0-first-slice-review.json');
export const defaultIntakePath = path.join(root, 'research/content-production-repeatability/edexcel-9bs0-stage5-intake.json');
export const defaultIndexPath = path.join(root, 'research/business-subject-foundation/v0.2-post-board-candidate/NODE_INDEX.json');

export function checkFirstSliceReview(review, intake, index) {
  const errors = [];
  const check = (ok, reason) => { if (!ok) errors.push(reason); };
  const spec = [['1.1.1','abcd'], ['1.1.2','abcde'], ['1.1.3','abcd'],
    ['1.2.1','a'], ['1.2.2','a'], ['1.2.3','ab'],
    ['1.2.4','abcde'], ['1.2.5','abcd']];
  const ids = spec.flatMap(([parent, letters]) => [...letters].map(letter => parent + ':' + letter));
  const parents = new Set(intake?.numbered_subtopic_index?.subtopics?.map(x => x.id) ?? []);
  const nodes = new Set((index?.domains ?? []).flatMap(x => x.ids ?? []));
  const rows = review?.lettered_obligations ?? [];
  check(review?.status === 'RESEARCH_NON_PUBLISHING'
    && review?.qualification === '9BS0'
    && review?.source_id === 'PEARSON-SPEC-9BS0-2014-I1'
    && review?.rights === 'REFERENCE_ONLY'
    && review?.source_text_permitted_as_generation_input === false,
    'qualification_or_source_rights_mismatch');
  check(review?.foundation_authority === 'RESEARCH_ONLY'
    && index?.authority_status === 'research_evidence_only'
    && review?.approved_reuse_count === null
    && review?.reviewed_reuse_percent === null
    && review?.publish_approved === false
    && review?.student_assets_generated === 0
    && review?.provider_calls === 0,
    'unearned_reuse_or_publication_claim');
  check(spec.every(([id, letters], i) =>
    parents.has(id) && review?.subtopic_letter_denominator?.[i]?.id === id
    && review?.subtopic_letter_denominator?.[i]?.letters === letters)
    && review?.subtopic_letter_denominator?.length === spec.length,
    'subtopic_letter_denominator_corrupt');
  check(rows.length === 26 && rows.every((x,i) => x.id === ids[i]),
    'lettered_obligation_missing_or_misidentified');
  check(rows.every(x => {
    const [parent] = x.id.split(':');
    return x.source_page_pdf_zero_based === (parent.startsWith('1.1') ? 17 : 18)
      && Array.isArray(x.candidate_subject_node_ids)
      && new Set(x.candidate_subject_node_ids).size === x.candidate_subject_node_ids.length
      && x.candidate_subject_node_ids.every(id => nodes.has(id))
      && x.status === 'UNREVIEWED'
      && x.nested_requirements_complete === false
      && ['DEPTH_OR_SUBJECT_GAP_INVESTIGATION','POTENTIAL_REUSE_UNVERIFIED'].includes(x.triage);
  }), 'candidate_provenance_or_assurance_violation');
  check(review?.scope_note?.includes('not the full nested atomic requirement denominator'),
    'unsupported_atomic_coverage_claim');
  return {
    structural_status: errors.length ? 'FAIL' : 'PASS',
    errors, indexed_lettered_obligations: rows.length,
    possible_gaps: rows.filter(x => x.triage === 'DEPTH_OR_SUBJECT_GAP_INVESTIGATION').map(x => x.id),
    reuse_measured: false, foundation_approved: false,
    publication_eligible: false, production_decision: 'HOLD'
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const read = filename => JSON.parse(readFileSync(filename,'utf8'));
  const output = checkFirstSliceReview(read(defaultReviewPath), read(defaultIntakePath), read(defaultIndexPath));
  process.stdout.write(JSON.stringify(output,null,2) + '\n');
  if (output.structural_status !== 'PASS') process.exitCode = 1;
}
