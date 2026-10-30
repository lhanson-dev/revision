# Issue #698 — AQA Business 7132 elasticity examination-alignment correction

**30 October 2026 — candidate content correction, not yet merged/live.**

## Requirement identity and verified educational boundary

The official AQA AS/A-level Business specification `AQA-7131-7132-SP-2023.PDF`, A-level **7132**, v**2.0 June 2023**, **§3.3.2 Understanding markets and customers**, printed **p15** (PDF physical page index **14**) says students interpret price/income elasticity data and analyse effects of price or income changes on revenue; they **do not need to calculate** the elasticity coefficients. Official source: https://filestore.aqa.org.uk/resources/business/specifications/AQA-7131-7132-SP-2023.PDF . Source-rights classification **REFERENCE_ONLY**; all learner explanations, numbers and exercises are original Revision content. Source manifest `research/specification-to-learner/aqa-2027-source-manifest.json` pins Business PDF SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`; **original user-uploaded bytes have not been reacquired/rehashed** in this correction. Official version and page wording checked; exact uploaded-byte parity remains unverified.

## Observed site failure

The learner-facing Marketing topic overview `content/business/aqa-a-level/shared/topics.ts` already said PED interpretation, not coefficient calculation, is required. But the **published detailed Learn page** `bus-mkt-008`, assembled via `content/business/aqa-a-level/shared/learn.ts` from the original Foundation-native `content-factory/slices/aqa-7132-3.3/learn-practice/bus-mkt-008.json`, contained the heading **Calculating and using PED and YED** and demonstrated deriving both coefficients. Its paired source Practice items `ped-calculation-01` and `yed-calculation-01` instructed calculation of the coefficients. This conflicted with the examination-relevant learner guidance and risked directing the student toward an unrequired method instead of interpreted meaning, impact on revenue and conditional business judgement.

## Smallest safe correction

- Retain the **same Learn page, topic, source requirement IDs and original authored asset**, but state the AQA assessment boundary clearly and replace the coefficient-calculation worked-example heading with **Interpreting supplied PED and YED values**. Use supplied PED -0.4 and YED +2.0 to assess elasticity magnitude, income-response classification, revenue and profit limitations. Keep a legitimate **sales revenue** calculation (which is not prohibited by this assessment rule).
- Change the **two pre-existing generated source Practice prompts** (same stable IDs) from `capability: calculation` to `capability: interpretation`, supply the elasticity estimate within each scenario and require justified interpretation/revenue impact. Those `asset.practice.items` are **not currently published into Practice by `shared/learn.ts`**, so this patch does **not** create or claim two new learner exercises, marked results or Evidence/Plan capabilities. It keeps the retained production asset aligned when future projection is separately assured.
- Direct regression tests in `content/business/aqa-a-level/elasticity-exam-alignment.test.ts` verify the **real published Learn page in all three Business paper packs**, existing topic and identity, exam-boundary wording, exact numerical revenue arithmetic and retained-but-unpublished original source practice IDs.

## Scope, risk and honest assurance

This is an educational-content accuracy/scope correction on canonical `/revision/app/`, not a new feature. No new UI, data migration, student-record rewrite, Progress/REV/Plan recommendation change or marking capability. Existing scored question bank, mocks, historical evidence and previously released Finance/network DataDrills are untouched.

Teaching has clearer AQA demand alignment for **this** §3.3.2 capability. Its full educational adequacy, authentic scoring of interpretation and application, independent examiner review, other 41 Business source sections, original uploaded-PDF SHA parity, Psychology compulsory/options, and **real hosted authenticated learner acceptance** remain **UNVERIFIED** under #698/#703. Do not close any of #698's eight gates or claim a full course coverage PASS.

**Documentation-impact check:** content source update, real published-pack regression test, this technical evidence note and INDEX pointer are in the same governed PR. Approved normative curriculum and claims policy remain unchanged; no ADR or historical evidence rewriting is required. CI and production proof are separate release checks.
