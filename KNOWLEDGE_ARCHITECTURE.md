# Knowledge Architecture

## Purpose
Define where project knowledge belongs and how it moves from exploration to authority to implementation.

## Knowledge classes

### Normative truth
What **should** be true. Lives in the numbered authority folders.

### Current implementation truth
What the system **currently does**. Lives in code and `docs/technical/`.

### Historical evidence
What was observed at a point in time. Lives in `audits/`, `decisions/`, registers and `archive/`.

### Research
Ideas, hypotheses, prototypes and evidence gathering. Lives in `research/`. Research is not authority until deliberately promoted.

## Core classification rule
- What must the product/company/channel do? → governed authority.
- How does the current repository implement that rule? → code or technical documentation.
- Is it an idea or investigation? → research.
- Is it a dated observation? → audit/history.

## Conflict handling
Lower-order documents may explain or implement higher-order rules but may not redefine them. Current code is evidence of implementation state, not automatic permission to redefine authority.

## Promotion path
`research → decision/proposal → authority → implementation → technical documentation → audit/evidence`

## Archive rule
Superseded or historical documents must not compete with active authority. Preserve history; do not silently rewrite it.