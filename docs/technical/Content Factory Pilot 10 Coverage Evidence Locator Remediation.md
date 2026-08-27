# Content Factory Pilot #10 — Coverage Evidence Locator Remediation

**Status:** implementation record for governed remediation after Pilot #10  
**Authority:** implements the existing Content Factory v2 Expert Review Ready Amendment and Content Accuracy Assurance Gate; it does not change educational authority.

## Trigger

Pilot #10 ran from approved `main` at `15c9c00bfcc2de283ccc082a47d880a77788ac77` and created durable job Issue #198. The run stopped in the first Learn work unit because the generated learner content taught the required `shareholders and returns` point, but the provider-supplied `coverageEvidence` value paraphrased that content instead of reproducing an exact excerpt.

The deterministic evidence-integrity guard therefore failed correctly. Issue #198 and its workflow artifact remain the historical record of that blocked run; this remediation does not rewrite them.

## Root cause

Pilot #9 remediation correctly required exact, mechanically checkable teaching-point evidence. Its provider contract also made the generative model perform a clerical second task inside the same response: after writing the learner content, the model had to copy selected learner text verbatim into `coverageEvidence`.

Pilot #10 demonstrated that those responsibilities should be separated. The generated educational content may contain the required teaching while the model still paraphrases its own evidence field. Re-running until the model happens to copy the text exactly would make the pipeline probabilistic without improving educational quality. Relaxing the exact-excerpt validator would weaken assurance.

## Deterministic evidence-locator contract

Learn and Practice provider contracts therefore move to version 4.

The provider still must:

- explicitly teach or practise every supplied `requiredTeachingPoint`;
- return every required teaching point exactly once using the exact supplied teaching-point string;
- identify the precise generated content location where that point is taught or practised.

The provider no longer copies evidence prose into the provider response. Instead it returns a bounded structured locator.

For Learn, supported locations identify:

- introduction;
- section explanation;
- section key point;
- worked-example setup;
- worked-example step;
- worked-example conclusion;
- misconception correction;
- next action.

For Practice, the location identifies:

- the generated practice mode;
- the one-based activity index;
- the exact field: prompt, expected response, explanation or improvement action.

Revision resolves each valid locator deterministically to the actual generated string and writes that exact string into the existing durable `coverageEvidence` artifact field.

## Assurance boundary

The downstream learner-content artifact contract does not change. `coverageEvidence` remains:

`teachingPoint → exact verbatim evidence string`

The existing deterministic teaching-point validator also remains unchanged. It still requires:

- every required teaching point exactly once;
- no unassigned teaching point;
- no duplicate evidence claim;
- every final evidence value to be an actual excerpt of the generated artifact.

An invalid or out-of-range locator is a non-retryable provider-contract failure. Revision does not guess, perform fuzzy semantic matching or silently accept an approximate location.

This preserves the assurance strength introduced after Pilot #9 while removing a provider task that deterministic code can perform more reliably.

## Provider and cost impact

No additional model call is introduced. The same Learn and Practice calls return small structured locator metadata instead of duplicated prose, so the change should be cost-neutral or marginally reduce output tokens.

The live course spend ceiling remains unchanged. No paid pilot should be resumed across the implementation-head change represented by this remediation; after merge and production verification, the next proof must be a fresh run from the new approved `main`.

## Assurance

Provider-free regression assurance covers:

- Learn locator resolution to an exact generated learner-content field;
- Practice locator resolution to an exact generated activity field;
- preservation of the existing durable `coverageEvidence` shape;
- contract-version 4 provenance for Learn and Practice provider workers;
- fail-closed behaviour for invalid or missing locator targets;
- all existing strict Learn-mode and Practice-mode provider schema combinations;
- continued rejection of impossible provider-normalisation output without retrying a completed malformed response.

Standard repository TypeScript, lint, unit, build, browser, database/RLS and protected-service assurance remains required before merge according to repository risk-based CI.

## Documentation impact

No normative authority change is required. Existing authority already requires mechanically checked coverage and says deterministic work should be performed by deterministic code where possible.

This record documents how the current provider implementation fulfils that rule after Pilot #10 exposed the reliability defect. `INDEX.md` must index this implementation record. Historical Pilot #9 and Pilot #10 evidence remains unchanged.
