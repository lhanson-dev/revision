# Content Factory Business Subject Foundation v0.8 Evidence URL Recovery

**Status:** implementation correction awaiting exact-head assurance and post-merge fresh v0.8 reassurance.

## Trigger

Fresh Business Foundation v0.8 reassurance workflow run `36589766815` reviewed exact `main` SHA `a66e253b5bdebb3c0f23497528aeb8dfb32d6e56` against candidate fingerprint:

`8d3daa57cee2113839ee4ec2aaa0731cc4d25afd73224178da96d53d7ee848ec`

The retained artifact is:

- artifact ID: `11043198393`;
- digest: `sha256:143e87caab90e7b209ede1db9c0ee21d87e1b794a63c4ae564b853bb61ec29ea`.

Deterministic v0.8 validation and the reassurance self-test passed. Group 1 (`BUS-FND-006`, `BUS-FIN-008`) also completed and passed, retaining one minor factoring source-scope finding.

Group 2 obtained a completed structured provider response but stopped at deterministic evidence validation with:

`BUS-PEO-001 evidence URL outside registered path for SRC-OER-HARD-SOFT-HRM-2024`

This is not a retained educational `fail_hold`. The deterministic evidence contract rejected the response before the group could become accepted assurance evidence.

## Evidence-retention limitation discovered

The v0.8 runner persisted a group evidence file only **after** `validateGroup(...)` succeeded. As a result, the completed Group 2 provider output was not retained in artifact `11043198393`; only Group 1 is present.

Therefore the historical artifact proves the source ID and validation failure, but it does **not** prove the exact alternate URL returned by the provider. This limitation must not be papered over by inventing or retrospectively reconstructing a Group 2 result.

The correction now retains completed provider output before deterministic validation and writes a separate `validation-failure.json` if the evidence contract rejects it. Such a failure remains `qualityDecision: not_reached`, distinct from both provider failure and educational `fail_hold`.

## Source diagnosis

`SRC-OER-HARD-SOFT-HRM-2024` remains the same promotion-eligible CC BY 4.0 publication:

- issuer: Journal of Infrastructure, Policy and Development / EnPress;
- article: *Performance of public service employees in Makassar: Hard & soft analysis of human resource management approach*;
- DOI: `10.24294/jipd.v8i9.5910`;
- canonical registered URL: `https://www.enpress-publisher.com/journal/JIPD/8/9/10.24294/jipd.v8i9.5910`.

Direct publisher inspection confirms EnPress exposes that same article ID / DOI through multiple publisher-controlled routes. The legacy OJS article route identifies article `5910`, and its PDF resolves as a child of that route (`.../article/view/5910/3860`). The current publisher also exposes the same DOI/article through a publisher-hosted file path below `.../files/journals/1/articles/5910/public/`. These are alternate route families to the same publication, not materially different educational sources.

The defect was therefore in the **registered-route contract / validator interaction**, not in the educational provenance of the source. No new reusable source and no teaching-content change are justified by this failure.

## Smallest safe correction

The source metadata now explicitly registers only these two verified equivalent EnPress route families for article `5910`:

- `https://systems.enpress-publisher.com/index.php/jipd/article/view/5910`;
- `https://www.enpress-publisher.com/files/journals/1/articles/5910/public`.

The canonical registered URL remains unchanged.

The reassurance validator now accepts an evidence URL only when it matches:

1. the source's canonical registered URL or a genuine child path; or
2. one of that source's explicitly registered alias URLs or a genuine child path.

It does **not** relax validation to any URL on the publisher domain. A sibling EnPress article such as article `5911`, an unrelated EnPress path, or a different domain remains invalid.

The same explicit aliases are passed to the reviewer in the permitted-source metadata so the evidence contract and deterministic validator agree.

## Deterministic regression controls

The v0.8 deterministic validator now requires:

- `BUS-PEO-001` to retain `SRC-OER-HARD-SOFT-HRM-2024`;
- that source to remain promotion-eligible CC BY 4.0;
- the exact two article-5910 alias route families above;
- an explicit alias basis;
- every alias to remain on an EnPress publisher domain and article-specific to `5910`;
- the metadata-patch set to contain both the previous GOV.UK metadata correction and this hard/soft-HRM route correction.

The reassurance self-test additionally proves:

- the canonical URL is accepted;
- every registered alias is accepted;
- sibling article `5911` is rejected;
- a different-domain lookalike is rejected; and
- completed provider evidence is retained before deterministic group validation.

## Candidate fingerprint consequence

`SOURCE_METADATA_PATCHES.json` participates in the Business v0.8 candidate fingerprint. Registering the source-specific aliases therefore deliberately creates a new candidate fingerprint:

`3bc018fe681b3cc6b7409ea009956bf20b97597a9ac70e9855e1c59e83ef8fa1`

This fingerprint change occurs even though:

- the 81-node taxonomy is unchanged;
- the 14 changed teaching nodes and 22 structured named facets are unchanged;
- prerequisite and relationship edges are unchanged;
- source rights are unchanged; and
- Business teaching content is unchanged.

The failed `8d3daa57...` reassurance remains historical evidence and cannot be promoted to a pass. After this correction is merged, a fresh v0.8 reassurance must run against the new exact `main` SHA and the new exact candidate fingerprint above.

## Full-CI infrastructure recovery

Exact-head PR assurance exposed an independent CI infrastructure failure after the content-specific suites had passed. Two attempts of the `Database, RLS and protected service assurance` job successfully completed migrations, release-readiness checks, all pgTAP suites and persistence integration tests, then failed while `supabase functions serve` attempted to pull:

`public.ecr.aws/supabase/edge-runtime:v1.74.2`

Both attempts returned:

`toomanyrequests: Data limit exceeded`

The second attempt ran on a different GitHub-hosted runner and reproduced the same public-ECR limit, so repeatedly rerunning unchanged CI was not treated as adequate recovery.

Supabase publishes the same pinned `v1.74.2` Edge Runtime through its official Docker Hub `supabase/edge-runtime` repository. CI therefore preloads exactly `docker.io/supabase/edge-runtime:v1.74.2`, retries that pull on transient registry failure, and tags the resulting local image with the exact `public.ecr.aws/supabase/edge-runtime:v1.74.2` name expected by Supabase CLI `2.111.0`. `supabase functions serve` and all protected Edge Function authorization tests remain unchanged and mandatory.

This is a delivery-reliability correction, not an assurance bypass: the runtime version stays pinned, an official Supabase publication is used, and CI still fails if the runtime cannot be obtained or the protected-service checks do not pass.

## Documentation impact

No normative authority change is required. The source-route correction implements the existing Educational Content Source Licensing and Provenance Standard, Subject Knowledge Foundation / Course Projection authority and AI-Assured Foundation Gate more faithfully by making equivalent publication routes explicit while continuing to fail closed.

The CI preload implements the existing Engineering Standards and Testing & Assurance Standard by preserving required automated protected-service assurance while removing a repeatable single-registry availability failure. It changes neither the declared security boundary nor the required test outcome.

No ADR is required because the source-rights model, assurance gates, candidate lifecycle, runtime architecture, protected-service behaviour and spend policy are unchanged. Historical failed reassurance and CI evidence is preserved unchanged.
