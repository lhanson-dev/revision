# Technical Documentation

This area describes **how Revision currently works**. It does not define what the product should be.

## Current implementation snapshot
- Static HTML/CSS/JavaScript repository.
- GitHub Pages publishes from `main` / repository root.
- Root application provides email/password authentication and a REV-led signed-in Home experience.
- Desktop Home uses persistent top navigation; mobile Home uses a burger menu plus fixed bottom navigation.
- Home reads saved Business Paper 2 progress and can produce a deterministic evidence-based REV recommendation without an AI-model call.
- Supabase is used for authentication and cloud progress persistence.
- Current content hierarchy is implemented under `subjects/`.
- First live module is AQA AS Business Paper 2.
- Module code includes recall, testing, progress/readiness logic, data practice and full exam simulation.
- `REV Homepage Shell Implementation.md` describes the current Home/REV implementation and its known v0.1 boundary.

Detailed architecture, auth/data flow, content model, routing, deployment and testing documentation should continue to evolve as migration continues.

Where this document conflicts with code about **current implementation**, inspect the code and update this documentation. Neither code nor this document may silently redefine approved product authority.
