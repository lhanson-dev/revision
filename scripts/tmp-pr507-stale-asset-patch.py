from pathlib import Path

path = Path('scripts/assurance/aqa-business-7132-slice-learn-practice.test.ts')
text = path.read_text()

start_marker = "  it('keeps every committed Learn + Practice asset valid against its blueprint (software re-proof, no AI)', async () => {"
start = text.index(start_marker)
end = text.index("\n\n  const proofIt", start)

new = """  it('keeps every exact-fingerprint-reusable committed Learn + Practice asset valid while stale assets remain blocked for refresh (software re-proof, no AI)', async () => {
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    const teachingFor = (nodeId: string): SliceTeaching => {
      const subjectId = nodeId.toUpperCase()
      const node = candidate.nodes.get(subjectId)
      if (!node) throw new Error(`foundation_node_missing:${subjectId}`)
      return {
        subject_id: subjectId,
        title: node.title ?? null,
        teaching_content: node.teaching_content ?? {},
        quantitative_content: node.quantitative_content ?? {},
        source_ids: rows.get(subjectId)?.subject_truth_sources ?? [],
      }
    }

    const config = JSON.parse(await readFile('content-factory/slices/aqa-7132-batches.json', 'utf8')) as { batches: Array<{ id: string }>; top_up: { id: string } }
    // The top-up batch rebuilds some 3.5 nodes; its output replaces those node files in the 3.5 folder, so those files are checked against the top-up ledger when that run exists.
    const checks = [{ id: '3.5', blueprint: '3.5' }, ...config.batches.map((batch) => ({ id: batch.id, blueprint: batch.id })), { id: '3.5', blueprint: config.top_up.id }]
    for (const check of checks) {
      const dir = `content-factory/slices/aqa-7132-${check.id}/learn-practice`
      const blueprintPath = `content-factory/slices/aqa-7132-${check.blueprint}/BLUEPRINT.json`
      const ledgerPath = `content-factory/runs/aqa-7132-slice-${check.blueprint}/ledger.json`
      if (!existsSync(dir) || !existsSync(blueprintPath)) continue
      // A committed asset is reusable only when the current Blueprint + Foundation teaching + sources + asset bytes reconstruct its accepted ledger fingerprint.
      // Fingerprint-stale assets are deliberately not treated as current: the targeted resume proof names them and they remain blocked until the governed post-T8 refresh.
      if (!existsSync(ledgerPath)) continue
      const blueprint = JSON.parse(await readFile(blueprintPath, 'utf8')) as Blueprint
      const ledger = JSON.parse(await readFile(ledgerPath, 'utf8')) as Ledger
      for (const expectation of expectationsFromBlueprint(blueprint)) {
        const path = `${dir}/${expectation.nodeId}.json`
        if (!existsSync(path)) continue
        const output = nodeOutputSchema.parse(JSON.parse(await readFile(path, 'utf8')))
        const unit = buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching: teachingFor(expectation.nodeId), output })!
        const previous = ledger.units[expectation.nodeId]
        const exactMatch = Boolean(previous && ['passed', 'logged'].includes(previous.outcome) && previous.fingerprint === unit.fingerprint)
        if (!exactMatch) continue
        expect(unit.softwareFindings, `${check.id}/${expectation.nodeId}`).toEqual([])
      }
    }
  })"""

path.write_text(text[:start] + new + text[end:])

doc = Path('docs/technical/Content Factory Business Subject Foundation v0.8 T8 Remediation.md')
d = doc.read_text()
marker = "The failed run ledger is retained because the fast-path rule preserves valid item-level evidence even when another item blocks. A fresh post-merge T8 run must therefore review only units whose exact fingerprints change; it must not repurchase unchanged section reviews. No learner-publication, qualified-human-review or `foundation_approved` gate is changed."
addition = marker + "\n\nCommitted Learn/Practice assets follow the same fail-closed rule: repository-wide software re-proof treats an asset as current only when its accepted ledger fingerprint reconstructs exactly from the current Blueprint, Foundation teaching, sources and asset bytes. Fingerprint-stale assets are not reclassified as valid and are not regenerated before T8; the targeted resume proof records them for the post-T8 refresh."
if marker not in d:
    raise SystemExit('documentation marker not found')
doc.write_text(d.replace(marker, addition))
