import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const runRoot = resolve(repoRoot, 'content-factory/runs/aqa-7132-mock-v1')
const artifactRoot = resolve(runRoot, 'artifact')

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

describe('AQA 7132 retained mock v1 release evidence', () => {
  it('retains the exact successful Action artifact byte-for-byte', () => {
    const manifest = readJson(resolve(runRoot, 'RETENTION_MANIFEST.json'))
    expect(manifest.source_run_id).toBe(37474355815)
    expect(manifest.source_artifact_id).toBe(11418322000)
    expect(manifest.source_artifact_zip_sha256).toBe(
      '305bfe75f4c32baba272c538f5f755e9bdc94ef0cc887a91514a2ffd9a3f585a',
    )
    expect(manifest.reviewed_commit).toBe('1c80a2642d988b603d83ccd74d58ff43836db0f5')
    expect(manifest.plan_fingerprint).toBe(
      '42ae1cf75e9cd6b35d3553ad083f01a921c6267b8b9b2c0d5397af001e83beed',
    )
    expect(manifest.retained_file_count).toBe(67)

    for (const [relativePath, expected] of Object.entries(
      manifest.files as Record<string, { bytes: number; sha256: string }>,
    )) {
      const payload = readFileSync(resolve(artifactRoot, relativePath))
      expect(payload.byteLength, relativePath).toBe(expected.bytes)
      expect(createHash('sha256').update(payload).digest('hex'), relativePath).toBe(expected.sha256)
    }
  })

  it('keeps the final assured set exact and unpublished', () => {
    const summary = readJson(resolve(artifactRoot, 'summary.json'))
    expect(summary.status).toBe('assured_not_published')
    expect(summary.publication_authority).toBe(false)
    expect(summary.learner_surface_changed).toBe(false)
    expect(summary.cumulative_spend_usd).toBe(6.540598)
    expect(summary.deterministic.quantitative_marks).toBe(34)
    expect(summary.deterministic.findings).toEqual([])
    expect(summary.deterministic.duplicates).toEqual([])
    expect(summary.unit_summary.passed).toHaveLength(13)
    expect(summary.unit_summary.reused_unchanged).toHaveLength(13)
    expect(summary.paper_summary.passed).toEqual(['7132/1', '7132/2', '7132/3'])
    expect(summary.paper_summary.reused_unchanged).toHaveLength(3)
    expect(summary.set_summary.can_progress).toBe(true)
    expect(summary.set_summary.blocking).toEqual([])
    expect(summary.set_summary.escalated).toEqual([])
    expect(summary.set_summary.failed).toEqual([])
    expect(summary.set_summary.logged).toEqual(['complete-set'])

    const papers = ['7132-1.json', '7132-2.json', '7132-3.json'].map((name) =>
      readJson(resolve(artifactRoot, 'papers', name)),
    )
    expect(papers.map((paper) => paper.duration_minutes)).toEqual([120, 120, 120])
    expect(papers.map((paper) => paper.attempted_raw_marks)).toEqual([100, 100, 100])
    expect(papers.map((paper) => paper.printed_raw_marks)).toEqual([150, 100, 100])
    expect(papers.map((paper) => paper.questions.length)).toEqual([25, 10, 6])
    expect(
      papers.every(
        (paper) =>
          paper.learner_claim ===
          "A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.",
      ),
    ).toBe(true)
  })

  it('records only restricted-pilot conditional release authority', () => {
    const assurance = readJson(resolve(runRoot, 'ASSURANCE_RECORD.json'))
    const release = readJson(resolve(repoRoot, 'content-factory/releases/aqa-7132-mock-v1.json'))

    expect(assurance.final_decision.status).toBe('CONDITIONAL PASS')
    expect(assurance.final_decision.scope).toBe('restricted_pilot')
    expect(assurance.qualified_human_subject_review.status).toBe('pending')
    expect(assurance.publication.current_state).toBe('not_published')
    expect(assurance.publication.assisted_marking_eligibility_changed).toBe(false)
    expect(
      assurance.issue_register.every((finding: { severity: string }) => finding.severity === 'minor'),
    ).toBe(true)

    expect(release.decision).toBe('conditional_pass')
    expect(release.release_type).toBe('restricted_pilot')
    expect(release.assurance.blocking).toBe(0)
    expect(release.assurance.escalated).toBe(0)
    expect(release.assurance.failed).toBe(0)
    expect(release.publication.learner_surface_changed_in_this_pr).toBe(true)
    expect(release.publication.current_state).toBe('restricted_pilot_integrated')
    expect(release.publication.integrated_pr_number).toBe(555)
    expect(release.publication.integration_head_sha).toBe('4ef4b5396bc37269f554fc7f956ff307d38a2bfe')
    expect(release.publication.integration_merge_sha).toBe('df136ca0b77305fc13a01b8577454e6cc4e055d3')
    expect(release.publication.founder_approval_status).toBe('passed')
    expect(release.publication.founder_approval_comment_id).toBe(6023917429)
    expect(release.publication.no_parallel_route).toBe(true)
    expect(release.publication.no_paid_generation).toBe(true)
    expect(release.publication.integration).toBe('Existing Exam Prep / Exam Simulator via deterministic retained-paper adapter')
  })
})
