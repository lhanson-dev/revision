# Issue #616 / PR #618 — visual approval and baseline provenance

On 13 October 2026 the Founder reviewed the linked learner consolidation visual bundle and explicitly authorised continuation: **"images are approved so you can continue"**. This authorises updating the corresponding visual baselines. It does not authorise merging PR #618.

Review evidence: `docs/design/learner-redesign-v2/screenshots/learner-consolidation-616-review/README.md` and its `review-bundle.zip`. Historical unapproved bundle packaging and audits are preserved.

Baseline source: [Revision CI run 38443372753](https://github.com/lhanson-dev/revision/actions/runs/38443372753), PR head `970db224507a28fec2c4e305ca6175e1af85b9f6`, integration checkout `e0431788911acaa3eb232b9ad2b4b66ddbe3026d` against approved main `e9d1266791f234753780ffbb489f0126ce12eadf`.

That run passed typecheck, lint (two existing hook warnings), build, 1,341 unit tests (35 skipped), database/RLS/protected services and authenticated/browser persistence. Responsive assurance reported 546 passed, 322 skipped and exactly 20 failed visual contracts. All 60 learner design-consistency cases passed; the earlier transition-sampling failures and rectangle-rounding failure did not recur.

All 20 replacement digests are taken from the actual browser assertion logs in Foundation quality job `115455556487`. Initial and retry values agree in every case. The 18 PNG-byte SHA-256 contracts use the log's `Expected value` (the actual screenshot supplied to `toContain`); the two focused Practice contracts use `Received` (decoded RGBA SHA-256). Comparison methods, fixture behaviour, phone animation mask and zero-tolerance checks are unchanged. No local screenshot digest is promoted.

Retained native evidence: [artifact 11838038046](https://github.com/lhanson-dev/revision/actions/runs/38443372753/artifacts/11838038046), `interface-visual-regression-38443372753`. Connector retrieval succeeded, but its 61,425,005-byte ZIP exceeds the executor's 32 MiB file-transfer limit; direct executor retrieval returned Forbidden at the artifact storage host. Direct PNG-byte recomputation from this artifact is therefore not claimed. The approved bundle remains the visual review evidence; CI logs supply the baseline digests.

Only the following active constants are replaced. Historical comments and earlier approval records remain accurate.

| Test file / case | Previous approved digest | Approved replacement from CI |
| --- | --- | --- |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedHomeScreenshotDigests / phone:light | `fa8bb402542a6e7c4f32b77ee543df0a6115f4760810325712a9bc279da7e911` | `29b376006580d0c5ba534bc4401fbaa266d9402959447b31d01401687ad3389f` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedHomeScreenshotDigests / phone:dark | `740062bb86dd877491baa98999446b547f8ec663806740bfcccc2ccc0d697787` | `496b44b5a8d0ce9e94660858293bd843928c6a95b282004d9a2db3cb4c6ea87c` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedHomeScreenshotDigests / desktop:light | `baa5e1a7dc58928015d319df792f09a603b4408f74a0af1338f6f274be6f32fe` | `b43dff4327a509f387d8711755bfd6227c7088b07cb1cbfaeb0c5a82ec1910d6` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedHomeScreenshotDigests / desktop:dark | `9053b9bd095be35b86e0067ab129883c7c4ab32810b4369d228b898c927ba726` | `a13e547ad0af4b511c72d9aca39e2e8defcc5e7de27a6b3475fcc18f6d4cc821` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedLearnScreenshotDigests / desktop:light | `d23f3be12cec9c1459bf98d8bc051a5b9d623fd89bafe5a0291cba96895b6e1e` | `f3304b023cbaddabdacf20194e4125e5aea77e29106b51d684b9555fc9d27062` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedLearnScreenshotDigests / desktop:dark | `f860f2a930f5c182076b26f60fe8de2914cda55cec39a64042de5a73cfc92e47` | `24a3903d8aabc8900141d9e64568ee27e539d0e3ddd875a55b658b143a18c8f0` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / phone:practice:light | `a71cd28ea165533d3d3c482bf215b6ea35fd591a257c52b1d0ce04cb92fc795c` | `913382d155a8e55c3053dad2bee856050386fe89feb487e951adc507c0cc87f3` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / phone:practice:dark | `652352e87674ce37d0c001656926c8568a7d7168e69e5761ce0ec5b64ccc4e1a` | `f692ff54a09b8649ebfd0f991335866988b885db19a24337bfe972d29a5f5a73` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / tablet:exam-prep:light | `bff5bc1af00066e64ce5255c631528725599ae2c325e6a1ab32cb51c365ecee6` | `9c4fedac7ff928735906fe02953370ac1a8c230640b8462d78a33cb134853997` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / tablet:exam-prep:dark | `bb16589e3ebc911c7ae7a72d51afa9920390a57151e4a24c20b999161755f129` | `5cf54eb772be1a0c5b259adcce0e21db47dff516e218d10602afa137f30f0912` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / tablet:timed-exam:light | `3a72b9e666f5d44aa2cec8941cd8ab28ceb55fc0dd39d32aa01b7808ae39d882` | `d2c94a6d3fce080858c19a111a41c4fc75c09e2141bb923e9c210747918f61f6` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCanvasScreenshotDigests / tablet:timed-exam:dark | `d1b7023b509c659ee8dc81090382debcfea478d2913261e5fc28077c9e331ec1` | `45445c124c8b237077769c6ec8c4a8c3550e33519b107108780f6930f1374aa7` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCourseOverviewDigests / desktop:light | `8ae21166a1a9106c80ced5b5a72966ac10c668af302517babb52aa227258ee90` | `8ef7f730770162cccd4c826df7b900131ff1a8d15770053a65eef0da4ca19132` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCourseOverviewDigests / desktop:dark | `5259dfef6d000088fdb9fd5c97db9f713b6b0de79da039ee091153963895a643` | `5ac454abb01c9e53e0057b6fb033958d0a7d14274fb5968592498ece07efbb00` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCourseOverviewDigests / phone:light | `33926a42ebbaca09c1ac2c330a455b47ccd3302709259d223fbf7f48ba208863` | `fa07b3e1b999642e14c3b588ab0063ef020f1572c579d9289f17a6c1901f43af` |
| `tests/e2e/interface-visual-regression.spec.ts` / approvedCourseOverviewDigests / phone:dark | `3e321f90e506a2106cceb3339dd07b0fd7ec6a4cb42728cd661b1a9dac3c556a` | `d0cfca9db327fae04bad5a322c677c66df56b1a604a470b745f8d32d946c9b1c` |
| `tests/e2e/auth-entry.spec.ts` / approvedSignInDigests / light | `d69e3bdb83fa5f5188e8f62bf31add2cc525fc7b99654a8980f8397bd2853128` | `184f09590d89b580e5a0b3074d54f90569fefed4054b82675aa46546ed264528` |
| `tests/e2e/auth-entry.spec.ts` / approvedSignInDigests / dark | `005c17ae47f605d2bcc2e0a2aef5535a0256271dd84f9373290352bf899771b5` | `a9cf53340b3f8faf4f1b5a1f79fadac59c3c7dd89e4157692b3d3904d77ce4c7` |
| `tests/e2e/practice-activity-visual.spec.ts` / cases / desktop:light:focused-practice | `d3ba2dc3791abffa78e69a6e8239dfb2ddcc1e97fec3c45ba0865888cd7253c0` | `ebf1eae802610e9154b4e11b95f6ce5b1547ce4d77a8f70ceb1dea06c3346add` |
| `tests/e2e/practice-activity-visual.spec.ts` / cases / desktop:dark:focused-practice | `02112642af5ffc011ee697a8a3633769dc87a99eeb3c7e581481fde8db6305b6` | `bbeb6868999be29a721de6380d8af81e80f1e982199c174ee38be6d48a2b32b0` |

## Remaining acceptance

Fresh CI on the updated exact PR head must pass, and current-main integration must be rechecked. PR #618 remains draft while that validation runs. A separate explicit Founder approval for PR #618's merge, the exact-head approval gate and subsequent production verification are required. Issue #616 remains open; no programme-completion claim is made.
