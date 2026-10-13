# PR #623 — Founder visual approval and baseline provenance

The Founder replied **“approved”** in the chat to the specific visual-comparison approval request for draft PR #623 on 13 October 2026. Reviewed PR head: `134a020c739714bce81f46286b0f3bab1b503425`. The 24 before/after pairs and their unavailable frozen-reference limitation were part of that request.

Durable approval record: https://github.com/lhanson-dev/revision/pull/623#issuecomment-6155109930

Scope: Issue #622 Home visuals and corresponding Home baseline updates from matching CI browser evidence. This is **visual approval only**, not merge/deployment approval. No unrelated baseline update is authorised. The PR remains draft and unmerged.

Reviewed evidence: `docs/design/learner-redesign-v2/screenshots/home-refinement-622-review/README.md` and `review-bundle.zip`. The ZIP retains its original review-time pending-approval labels as historical evidence; this record supersedes that acceptance status without rewriting the captures or original manifest.

The four Home constants will be updated only from exact-head CI's actual browser assertion logs or independently verified retained PNG bytes. Comparison algorithms, masks, tolerance, fixtures and all other baselines remain unchanged. Local rendered hashes are not promoted. Final exact-head CI and current-main integration are still required after the baseline update.

CI provenance and verified old/new values are recorded below when available.

## CI source and unchanged-renderer verification

Source: [Revision CI 38465031057](https://github.com/lhanson-dev/revision/actions/runs/38465031057), head `114f3cf9cb208d4ad5db8eb3fbf487fb70ddeb1f`, Foundation job `115530107681`. `git diff` proves no difference between this head and the reviewed head `134a020c739714bce81f46286b0f3bab1b503425` in `src/`, the protected visual fixture, Playwright config or lockfile. Later commits changed only tests/docs/evidence, not rendering.

The decoded GitHub job logs supply each actual PNG-byte SHA-256 via `Expected value` in `expect(approvedDigests).toContain(actualDigest)`; `Received array` contains the old baseline. Initial and retry values agree for all four cases. No local digest is promoted. Retained artifact [11849366473](https://github.com/lhanson-dev/revision/actions/runs/38465031057/artifacts/11849366473) is 73,873,303 bytes, above the executor transfer limit; direct executor log retrieval was forbidden at the artifact host. Connector log retrieval succeeded. Direct PNG-byte recomputation from that ZIP is not claimed.

That source run passed 1,343 unit tests (35 existing skips); its browser failures included the four intended hash mismatches and obsolete configured-review assertions, plus the earlier paused-clock 503 fixture already corrected in the reviewed head. The configured-review assertions now preserve full-day totals/completion/progress, require only the outstanding Start row and verify explicit mock/official kinds and stored dates. No assertion, retry or tolerance is suppressed.

| Case | Previous approved digest | Approved replacement from matching CI |
| --- | --- | --- |
| phone:light | `29b376006580d0c5ba534bc4401fbaa266d9402959447b31d01401687ad3389f` | `47d5f153515b778dd79dab6bd35fd73918d1b5a1b4d8c8918e49b499f2856eb4` |
| phone:dark | `496b44b5a8d0ce9e94660858293bd843928c6a95b282004d9a2db3cb4c6ea87c` | `5b6c3f993641752c0c1889a552272d40d18f0749d802e6455670d2c8eb84896b` |
| desktop:light | `b43dff4327a509f387d8711755bfd6227c7088b07cb1cbfaeb0c5a82ec1910d6` | `0018cdcc656f188de5b9b2ac0b442d7d92c73ed36354146ec35f376f6ef48661` |
| desktop:dark | `a13e547ad0af4b511c72d9aca39e2e8defcc5e7de27a6b3475fcc18f6d4cc821` | `8f6d19aec968e8a153b152c7d13a14176d002ddc3a20cbf2acf5ff2c14664a45` |

Fresh exact-head CI is required after this update. PR #623 remains draft and unmerged; Founder merge approval is still absent.

Local configured Home review assertions passed 4 cases / 4 intended viewport skips after the contract alignment, preserving full-day totals, completion and progress plus exact outstanding activity and chronological typed assessments. The expected CI hashes are not replaced with local hashes.
