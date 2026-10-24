import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkEdexcelTheme1Index, theme1Path, intakePath, firstSlicePath } from './edexcel-9bs0-theme1-index-preflight.mjs';

const read = file => JSON.parse(readFileSync(file,'utf8'));
const data = read(theme1Path), intake = read(intakePath), first = read(firstSlicePath);
const modify = cb => { const copy = structuredClone(data); cb(copy); return checkEdexcelTheme1Index(copy,intake,first); };

describe('9BS0 complete Theme 1 reference-only source identifier index', () => {
  it('preserves 24 subtopics, 75 lettered and 153 terminal source references without approving educational reuse', () => {
    const out=checkEdexcelTheme1Index(data,intake,first);
    expect(out).toMatchObject({
      structural_status:'PASS', numbered_subtopics:24, lettered_identifiers:75,
      terminal_structural_references:153, atomic_requirement_denominator_established:false,
      accepted_subject_reuse:null, production_decision:'HOLD', publication_eligible:false
    });
  });
  it('rejects omitted, duplicated or wrongly parented mandatory terminal references', () => {
    expect(modify(x=>x.terminal_reference_ids.pop()).failures).toContain('missing_duplicate_or_misplaced_terminal_reference');
    expect(modify(x=>x.terminal_reference_ids[1].id=x.terminal_reference_ids[0].id).failures).toContain('missing_duplicate_or_misplaced_terminal_reference');
    expect(modify(x=>x.terminal_reference_ids[0].parent_letter_id='1.5.6:a').failures).toContain('missing_duplicate_or_misplaced_terminal_reference');
  });
  it('detects omitted numbered subtopics and wrong lettered source denominator', () => {
    expect(modify(x=>x.subtopic_source_index.pop()).failures).toContain('subtopic_or_lettered_denominator_drift');
    expect(modify(x=>x.subtopic_source_index[0].nested_bullet_counts[0]=2).failures).toContain('subtopic_or_lettered_denominator_drift');
    expect(modify(x=>x.subtopic_source_index[0].letter_ids[0]='1.1.1:z').failures).toContain('subtopic_or_lettered_denominator_drift');
  });
  it('keeps official publisher source REFERENCE_ONLY and blocks fabricated approval', () => {
    expect(modify(x=>x.source_rights='OPEN').failures).toContain('qualification_or_reference_rights_mismatch');
    expect(modify(x=>x.source_prose_ingestion_allowed=true).failures).toContain('qualification_or_reference_rights_mismatch');
    expect(modify(x=>x.expert_review='PASSED').failures).toContain('false_approval_or_publication');
    expect(modify(x=>x.full_atomic_coverage='COMPLETE').failures).toContain('false_approval_or_publication');
    expect(modify(x=>x.terminal_reference_ids[0].candidate_reuse_state='REUSED').failures).toContain('unearned_terminal_coverage_or_reuse');
  });
  it('prevents representing source-line completeness as atomic curriculum acceptance', () => {
    expect(modify(x=>x.scope_statement='All atomic educational obligations reviewed').failures).toContain('unsupported_atomic_denominator_claim');
    const altered=structuredClone(first);
    altered.lettered_obligations[0].id='1.1.1:z';
    expect(checkEdexcelTheme1Index(data,intake,altered).failures).toContain('first_slice_bridge_mismatch');
  });
});
