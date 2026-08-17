# ADR-0002 — Shared learning engine and content packs

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will use one shared learning engine. Subject, qualification, exam-board and paper-specific knowledge will be represented as content/configuration packs rather than duplicated application logic.

## Why
Adding new subjects must primarily mean adding content, not cloning a separate application.

## Consequences
- Shared capabilities include learning, recall, assessment, progress, recommendations and exam simulation.
- New learning needs should become reusable engine capabilities where practical.
- Subject-specific hacks inside content packs are not permitted by default.
