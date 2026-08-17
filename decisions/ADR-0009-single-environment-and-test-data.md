# ADR-0009 — Single environment and isolated test data

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will initially operate one production application environment and one production Supabase project.

Dedicated automated-test accounts and clearly classified synthetic data will be used for test automation.

## Rules
- Automated tests must never use genuine learner accounts.
- Test users/records must be identifiable and excluded from live reporting by default.
- Test fixtures should clean up after themselves where practical.
- Failed cleanup must never cause synthetic data to be treated as live.
- Additional environments are introduced only when operational need justifies them.
