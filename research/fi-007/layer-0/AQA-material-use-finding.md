# FI-007 Layer 0 — AQA material-use finding

**Evidence date:** 2026-08-22  
**Status:** research finding; not normative authority

## Finding

AQA's current public copyright/IP policy states that AQA materials are copyright-protected and that AQA does not permit its materials to be used in connection with AI-powered tools/technologies without permission. Its centre copyright policy is more explicit that putting AQA material into an AI tool would breach AQA policy.

Sources checked:

- https://www.aqa.org.uk/about-us/who-we-are/our-standards/copyright-and-intellectual-property-policy
- https://www.aqa.org.uk/about-us/who-we-are/our-standards/copyright-and-intellectual-property-policy/copyright-policy-for-centres

## Layer-0 consequence

Do **not** send the published AQA `AS Business 7131 Paper 2 Answers and Commentaries`, official question-paper text, mark schemes or other AQA material to candidate model APIs as benchmark input unless Revision first obtains permission that clearly covers the intended use.

The nine AQA examiner-marked outcomes identified in the Layer-0 proposal remain useful as **human calibration/reference evidence**, but not as direct model-evaluation payloads under the current permission position.

The immediate model benchmark therefore uses only the nine Revision-authored Harbour Home transfer cases and Revision-authored marking guidance in `transfer-cases.json`.

## Product implication

This is not merely a benchmark-dataset issue. Before FI-007 can use official awarding-body questions/mark schemes as live AI input, Revision needs a lawful content/provenance strategy that distinguishes:

- Revision-authored exam-style questions and marking packs;
- awarding-body material that Revision may link to or use for human assurance but not send to AI;
- material for which explicit AI-processing/reproduction permission has been obtained; and
- any future licensed provider/content route.

No assumption should be made that public availability equals permission for AI processing.

## Documentation impact

No normative authority changes in this research increment. This finding must be carried into FI-007 readiness, content provenance and production architecture decisions before any production marking implementation is authorised.
