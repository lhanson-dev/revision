# LF-05 — 25 November 2026 fresh-chat Stage 2 review and source-corrected 12-item HOLD

**Release decision: HOLD.** These are original qualitative Revision extended-writing self-review tasks, not official AQA questions, examiner-calibrated marking or complete course coverage. All 33 new items remain in candidate staging, with six prior originals published. PR #854 is draft, diverged from approved main, and explicitly needs independent delta re-review plus authenticated learner A4 and its own Founder merge approval.

## Original external evidence, unmodified

- [Stage 1 question-only review](lf05-fresh-chat-review/2026-11-25-user-submitted-blind-review.md), 25 November, user-supplied complete 33/33; **32 PASS, 1 MINOR** (`BUS-LF05-01-16`), zero MATERIAL/BLOCKING; [normalized Stage 1](lf05-fresh-chat-review/2026-11-25-stage1-blind-structured.json).
- [Stage 2 answer-guide review](lf05-fresh-chat-review/2026-11-25-user-submitted-guided-review.md), 25 November, **21 PASS, 11 MINOR, 1 MATERIAL** (`PSY-LF05-16`), zero BLOCKING; [normalized Stage 2](lf05-fresh-chat-review/2026-11-25-stage2-guided-structured.json). Uploaded original Stage 2 file SHA256 `6ebbae987c497e496fb2d7047d7934549584b3dd6261641ecff9d13833a6aef6` (44,048 bytes). Total original reviewer assertions: 33 blind + 33 guided, NOT full-bank A3 PASS on corrected bytes.
- **Original immutable reviewer inputs:** pinned commit `5af3a7da290551cc3489a67763a9e3527b83a300`. Source SQL Git blobs: held six `572840fc1c9e4dd0a0f07e1bccb387ee59b18d5b`, held 27 `e58ac284a8114ae26dbe7e9253729def5521912e`. Original blind/guide packet Git blobs: `8715ef0ba2bb10b167a86168763323a653a7812e`, `2ed2406698a681bd1036df950d9abbdbc6c565f6`. These remain available at the immutable commit; the old evidence is **not** rewritten to show corrections as reviewed.
- The report claims a fresh ChatGPT context and correct ordering (blind before guides), but this authoring chat cannot independently verify that session isolation from pasted prose. It explicitly did not verify source licensing or examiner calibration. Record these as unresolved evidence limits; do not silently upgrade to a qualified-human examiner sign-off.

## Source verification and adjudication

The original Founder-provided primary PDF SHA256 files were checked: **AQA Psychology 7182 v1.4** `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; **AQA Business 7132 v2.0** `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. The Psychology PDF explicitly lists `§4.3.9 Forensic Psychology` offender profiling including organised/disorganised typology, data-driven investigative psychology and geographical profiling. These methods are **not synonyms**, but the authored question's unqualified **“data-driven offender profiling”** permits an accurate well-developed spatial/geographical profiling comparison as a main valid route. The Stage 2 MATERIAL concern is **accepted**, unlike the earlier automated-reviewer's unsupported allegation that the original guide had literally identified geographical and investigative psychology as synonyms. Distinct item/source-claim adjudication is essential.

The 11 MINOR findings were judged worthwhile to improve concrete student self-review without inventing a calibrated mark allocation. The Stage 1 Marshbrook ambiguity is accepted as a genuine case-wording improvement, so the question itself was also changed; it requires one new independent **blind** verdict. Numerical calculations remain as stated in the original reports, including Business gearing 56.25% and illustrative Orchid workforce estimates with explicit conditions.

| ID | Original Stage 1 / Stage 2 | Disposition in revised held source SQL and matching guide packet |
|---|---|---|
| `PSY-LF05-07` | PASS / MINOR | Four groups of 10 counterbalance order and list assignment; note that pilot-testing verifies word-list equivalence separately |
| `BUS-LF05-04-25` | PASS / MINOR | Clarify continuous improvement/quality may be inside lean; contrast genuine alternatives such as added capacity or automation |
| `PSY-LF05-04` | PASS / MINOR | Give practical CBT cognitive restructuring, behavioural experiment and Ellis REBT-related examples |
| `PSY-LF05-12` | PASS / MINOR | Add antipsychotic plus CBT/family-therapy integrated-treatment examples without requiring one fixed combination |
| `PSY-LF05-14` | PASS / MINOR | Specify three stress inoculation phases and practical biofeedback monitoring |
| `PSY-LF05-15` | PASS / MINOR | Distinguish strong original frustration-aggression proposal from later nuanced accounts |
| `PSY-LF05-16` | PASS / MATERIAL | **Material correction:** geographical profiling and/or investigative psychology may each be an accurate primary data-driven comparison; distinguish methods, preserve alternative credit, reject profiling-as-proof |
| `BUS-LF05-01-16` | MINOR / MINOR | Fix the original Marshbrook scenario (internally funded, slower expansion vs substantial borrowing); credit mixed finance, do not label £90k cash categorically inadequate |
| `BUS-LF05-04-16` | PASS / MINOR | New machine is potential capacity, not proven automation; unknown defect/delay cost ranking |
| `BUS-LF05-06-16` | PASS / MINOR | Turnover estimate assumes **average annual** 180 workers; accept £69,120 unrounded or £69,600 rounded replacement training costs, only when all leavers are replaced and trained |
| `BUS-LF05-09-25` | PASS / MINOR | Include merger/takeover forms, distinguish method of external growth from geographical direction |
| `PSY-LF05-02-S1` | PASS / MINOR | 24 sixth-form volunteers are explicitly known; recruitment process detail remains unknown |

## Exact corrected-source review boundary

The **revised HELD** SQL source Git blobs are `7f6304f49f4d736fb49387b7b11d6accdd2f7f3c` (six) and `b663a10f509e9009185329f23d44470b6f12c734` (27). The blind/guide canonical source-packet blobs are `db3508dbe46f5d9f7fc35452bc3e4430f23b4f4c` / `ffaba7d9494f6e84a2c3979baae942f4a378d847`. All 33 source SQL rows were matched exactly to the new blind + guided canonical packets, and 22 corresponding three-item portable input files were regenerated at commit `dd007582da9c517666e7168578708f9c0b7c8eac`. No question or guide is marked published in these migrations.

**Targeted shortest independent A3 delta:**

1. [New independent BLIND Marshbrook question](lf05-fresh-chat-review/2026-11-25-delta-01-marshbrook-blind.md) — start an outside-project fresh chat with **no authored guide**, because its wording and scenario changed.
2. [Separate GUIDED recheck for all 12 corrected guides](lf05-fresh-chat-review/2026-11-25-delta-12-guided.md) — after the new blind verdict has been frozen, obtain item-by-item guide verdicts against the exact revised guide bytes. A prior material response on old bytes does not clear the new source.
3. Preserve the original exact-input **32 unchanged Stage 1 question** findings and **21 unchanged Stage 2 guide** findings as prior evidence only after mechanically validating individual question, scenario and guide text equality across the old/new SQL versions. Do not blanket-reuse merely because a whole-file blob changed or a prior stage said PASS.
4. Every still-material/blocking source issue is HOLD; record per-ID recheck results and source/license/method/date/context attestation. Do not treat an automated schema check as educational approval.

Two held candidate pgTAP suites now have **22 planned assertions** (first six) and **40 planned assertions** (remaining 27), including 14 new source and fair-credit regression checks. The plan counts were checked mechanically; **CI and authenticated A4 remain to be executed**.

## Publication status and documentation impact

- No change to current six published originals or learner progress, RLS, existing private first-submission guidance, 14-day retention, or original-training-only claim.
- Source rights remain governed by `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`; public-source accessibility is not automatic reusable PDF licence. The reviewer itself declared Source Licence Register unverified. Preserve this unresolved gate, without claiming a legal decision.
- The [fresh-chat method](../docs/technical/LF-05%20Fresh%20Chat%20Independent%20Review%20Route.md) is now approved on main via Founder-approved PR #862, **not a waiver of independent source adjudication or public-launch qualified-human benchmark review**.
- After the A3 delta passes: complete real signed-in Business/Psychology A4 (save/reload, owner isolation, first submission before guide, Psychology selected option, expiry and anonymity), source/governance checks, controlled held-to-published migration and current-main integration (PR #854 is presently dirty), all final CI, PR-specific Founder approval, and actual production learner-visible count proof. The reviewer output cannot authorise the merge by itself.
- **Documentation-impact check:** source SQL, both canonical packets, portable packets, regression tests, verbatim and structured review evidence, this dated audit, LF-05 technical note and INDEX are updated in governed PR #854. Do not rewrite historic reviewer results or unrelated authorities.
