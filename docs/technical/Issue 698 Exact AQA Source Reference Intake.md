# Issue #698 — exact AQA Business 7132 and Psychology 7182 reference intake

**31 October 2026. Candidate technical implementation, not an educational-adequacy pass.** Canonical learner runtime is still `/revision/app/`. This is a controlled audit preflight only, not a learner-facing feature or an AI Content Factory ingestion licence.

## Exact immutable references

The manifest `scripts/assurance/data/aqa-official-reference-manifest.json` records:

| Official qualification | Edition | Pages | Founder-uploaded SHA-256 |
| --- | --- | ---: | --- |
| AQA A-level Business 7132 | v2.0, 14 June 2023 | 42 | `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332` |
| AQA A-level Psychology 7182 | v1.4, 1 September 2025 | 38 | `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d` |

Both original PDFs were re-uploaded by the Founder on 31 October, SHA-256 hash checked byte-for-byte against the pre-existing Issue #698 fingerprints, and stored in the Founder's private ChatGPT Library under `Revision/Official AQA Specifications`. That Library is not itself a repository or an externally authorised worker storage endpoint. This manifest instead provides official AQA direct-file URLs and expected byte hashes.

## Repeatable safe verification

Run from the repository root:

```bash
# List pinned identities only (does NOT verify current bytes).
node scripts/assurance/verify-aqa-official-reference.mjs --list

# Verify the exact authorised original files supplied for an audit.
node scripts/assurance/verify-aqa-official-reference.mjs --local business-7132:/path/to/business.pdf
node scripts/assurance/verify-aqa-official-reference.mjs --local psychology-7182:/path/to/psychology.pdf

# Optional explicit network check against AQA's official PDFs.
node scripts/assurance/verify-aqa-official-reference.mjs --official all
```

The verifier rejects wrong PDFs, unexpected hashes, bad headers, excessive file sizes, unknown course IDs, redirects off AQA's approved HTTPS host, and unavailable downloads. The command prints `REVISION_AQA_EXACT_SOURCE_VERIFIED` **only after a successful byte-identity match**, and errors fail with nonzero exit status. Official network checks are opt-in and keep the PDF bytes in memory. They do not write the documents into GitHub, CI build artifacts, content packs or a generation context. Tests run offline against synthetic fixtures, not licensed PDFs. If AQA changes the PDF at the same URL, an audit must **HOLD** pending explicit exact-version/provenance reconciliation rather than accepting a replacement. The local-PDF path supports disconnected audit environments.

A valid SHA-256 match establishes the identity of the supplied file, **not** whether a course correctly teaches or assesses every requirement. `--list` establishes only recorded metadata. Do not retroactively alter historical audit flags; each audit run must retain its own verified source evidence.

## Governance and remaining work

Both PDFs remain `REFERENCE_ONLY` under `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`: they may inform approved alignment checks but are not licensed for bulk reproduction, AI prompt ingestion or commercial reuse of source prose. Public availability does not grant those rights. This package contains no PDF text, no third-party exam materials and no change to governed source-use policy. If a production worker would need full protected PDF text or automatic extraction into a generative workflow, a separate permission-reviewed intake decision is required.

The remaining Issue #698 / #703 work is unchanged: complete and independently reconcile the exact-version source-first atomic obligations, cross-cutting skills, examination structure and Psychology Paper 3 options; examine *actual published* Learn, appropriate independently valid Practice and Exam Prep per obligation; correct deficiencies, prove marking integrity and verify authenticated learner evidence → repair → independent recheck → revised Plan/REV/Progress. Previous Business 344 keyword records, 194 checking prompts, and 80/421 provisional skill candidates, and Psychology's 118 records, are **not** independently proven completeness denominators. Source byte-verification is only one necessary check.

**Documentation impact:** This note, INDEX pointer, machine-readable manifest, small read-only CLI and tests accompany the same governed PR. Normative documents, historical audits, databases, published content and learner records are untouched. PR merge still requires explicit Founder approval.
