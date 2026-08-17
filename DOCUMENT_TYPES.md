# Document Types

## Purpose
Define the permitted governed document types and their responsibilities.

| Type | Purpose | Authority |
|---|---|---|
| constitution | Governs the knowledge/decision system itself | highest meta-governance |
| source-of-truth | Canonical answer for a core substantive question | high |
| domain-authority | Canonical authority for one domain | high within domain |
| standard | Durable rules implementations/channels must satisfy | normative |
| operating-model | Defines how a function operates | normative |
| framework | Repeatable decision/evaluation method | normative/supporting |
| register | Structured current-state/governance record | varies |
| workflow | Approved repeatable process | normative |
| technical-document | Explains current implementation | descriptive |
| runbook | Operational procedure | operational |
| decision-record | Records why a material decision was made | historical/supporting |
| audit | Point-in-time evidence | historical |
| research | Exploration and hypotheses | non-authoritative |
| archive-record | Superseded/historical material | non-current |

## Standard authority metadata

```yaml
---
title: ""
document_id: ""
document_type: ""
authority: ""
status: "draft"
version: "0.1"
owner: ""
effective_date: null
last_reviewed: null
review_cadence: "quarterly"
content_review_status: "unreviewed"
source_of_truth_for: []
depends_on: []
supersedes: null
---
```

## Lifecycle
`draft → active → superseded → archived`

`active` means deliberately approved. Generated templates must not start active.

Use `[TO DEFINE]` rather than inventing unresolved decisions.