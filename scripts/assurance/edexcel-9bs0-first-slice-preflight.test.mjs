import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkFirstSliceReview, defaultReviewPath, defaultIntakePath, defaultIndexPath } from './edexcel-9bs0-first-slice-preflight.mjs';
const read = p => JSON.parse(readFileSync(p,'utf8'));
const review = read(defaultReviewPath), intake = read(defaultIntakePath), index = read(defaultIndexPath);
const mutate = f => { const v = structuredClone(review); f(v); return checkFirstSliceReview(v,intake,index); };
describe('Stage 5 9BS0 research-only 1.1 and 1.2 lettered crosswalk', () => {
  it('retains 26 unreviewed lettered obligations and publication HOLD', () => {
    const result = checkFirstSliceReview(review,intake,index);
    expect(result.structural_status).toBe('PASS');
    expect(result.indexed_lettered_obligations).toBe(26);
    expect(result.possible_gaps).toEqual(['1.2.1:a','1.2.2:a','1.2.3:a','1.2.3:b']);
    expect(result.reuse_measured).toBe(false);
    expect(result.production_decision).toBe('HOLD');
  });
  it('fails if an obligation disappears or is mislabeled', () => {
    expect(mutate(x => x.lettered_obligations.pop()).errors).toContain('lettered_obligation_missing_or_misidentified');
    expect(mutate(x => x.lettered_obligations[0].id='1.1.1:z').errors).toContain('lettered_obligation_missing_or_misidentified');
  });
  it('rejects invented nodes or stale source-page locators', () => {
    expect(mutate(x => x.lettered_obligations[0].candidate_subject_node_ids=['NOT-FOUND']).errors).toContain('candidate_provenance_or_assurance_violation');
    expect(mutate(x => x.lettered_obligations[0].source_page_pdf_zero_based=42).errors).toContain('candidate_provenance_or_assurance_violation');
  });
  it('cannot promote reference-only content, reused nodes or educational approval', () => {
    expect(mutate(x => x.source_text_permitted_as_generation_input=true).errors).toContain('qualification_or_source_rights_mismatch');
    expect(mutate(x => x.approved_reuse_count=22).errors).toContain('unearned_reuse_or_publication_claim');
    expect(mutate(x => x.lettered_obligations[0].status='APPROVED').errors).toContain('candidate_provenance_or_assurance_violation');
    expect(mutate(x => x.lettered_obligations[0].nested_requirements_complete=true).errors).toContain('candidate_provenance_or_assurance_violation');
  });
});
