---
title: "Engineering Standards"
document_id: "revision-engineering-standards"
document_type: "standard"
authority: "engineering"
status: "draft"
version: "0.1"
owner: "Founder"
effective_date: null
last_reviewed: null
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["engineering baseline"]
depends_on: ["Architecture Principles", "Testing & Assurance Standard", "Security Standard"]
supersedes: null
---
# Engineering Standards

## Purpose
Define the minimum engineering rules for Revision from the scalable refactor onward.

## Core rules
1. Use React + TypeScript + Vite; strict TypeScript checking is the default.
2. Keep learner UI, learning-domain logic, platform services and subject content separated.
3. New subjects/papers must consume shared engine capabilities rather than copy application logic.
4. Content must conform to the shared versioned schema and pass automated validation.
5. Supabase is canonical for persisted learner progress; local storage is cache/recovery only.
6. Important learner, data and security behaviour must have automated assurance.
7. CI is risk-based: run the smallest suite that gives sufficient confidence, with critical shared areas automatically escalating to full regression.
8. Database changes are version-controlled migrations.
9. No secrets or privileged credentials may be exposed to the browser or Git.
10. Learner-facing features must use simple language and explain purpose, expected outcome, result meaning and next action.
11. Test accounts/data must be isolated and excluded from live reporting.
12. Health must be evidence-based; Unknown must never be presented as Healthy.

## Scope
These standards govern the refactored Revision platform and all new work. Existing prototype code is migrated toward them as part of the approved refactor rather than maintained as a permanent exception.
