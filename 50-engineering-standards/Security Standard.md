---
title: "Security Standard"
document_id: "revision-security-standard"
document_type: "standard"
authority: "engineering"
status: "draft"
version: "0.1"
owner: "Founder"
effective_date: null
last_reviewed: null
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["application and data security"]
depends_on: ["ADR-0008", "ADR-0009"]
supersedes: null
---
# Security Standard

## Non-negotiable rules
- Supabase RLS must enforce access to learner-owned data.
- Browser-delivered configuration is treated as public.
- Service-role keys, database passwords and privileged credentials must never be shipped to clients or committed to Git.
- Database schema/policy changes must be version-controlled and reviewed.
- Auth and ownership controls must have automated tests.
- Destructive learner-data operations require deliberate confirmation and must not silently destroy progress.
- Migrations affecting learner data are high risk and should preserve compatibility/data wherever practical.
- Logs and telemetry must not expose passwords, tokens, secrets or unnecessary sensitive learner data.
