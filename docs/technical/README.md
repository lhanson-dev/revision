# Technical Documentation

This area describes **how Revision currently works**. It does not define what the product should be.

## Current implementation snapshot
- Static HTML/CSS/JavaScript repository.
- GitHub Pages publishes from `main` / repository root.
- Root application provides email/password authentication and Revision Hub navigation.
- Supabase is used for authentication and cloud progress persistence.
- Current content hierarchy is implemented under `subjects/`.
- First live module is AQA AS Business Paper 2.
- Module code includes recall, testing, progress/readiness logic, data practice and full exam simulation.

Detailed architecture, auth/data flow, content model, routing, deployment and testing documentation should be added as migration continues.

Where this document conflicts with code about **current implementation**, inspect the code and update this documentation. Neither code nor this document may silently redefine approved product authority.