# Authority Hierarchy

## Purpose
Define how authority is assigned, how conflicts are resolved, and who may approve changes into `main`.

## Default substantive order
1. Constitutional / knowledge governance
2. Founder / strategic doctrine
3. Product scope / taxonomy
4. Product Source of Truth
5. User Journey Source of Truth
6. Domain authorities
7. Standards / operating models
8. Technical documentation
9. Current implementation evidence
10. Audits / historical evidence
11. Research

Authority is responsibility-based, not a simplistic total ranking.

## Conflict rules
- Lower-order documents may not redefine higher-order rules.
- A document cannot promote itself to authority merely by calling itself canonical or official.
- Current implementation may reveal drift but cannot silently replace normative authority.
- Genuine conflicts must be surfaced and deliberately resolved.
- Historical audits remain historically true after remediation.

## Default merge authority

**Every merge into the repository's default branch requires explicit Founder approval.**

This applies to governance, product authority, implementation, technical documentation, defects, maintenance, workflows, registers, audits, automation and AI-generated PRs.

Approval must be explicit for the specific PR or merge. Silence, related prior approval, Founder authorship, passing tests, review status or technical mergeability do not constitute merge approval.

AI agents and automated workflows must stop before merge unless explicit Founder approval has already been given.

### Future delegation
The Founder may later delegate merge authority or define exempt change classes only through an explicit, documented, Founder-approved governance change defining scope, limits, revocation and escalation.

Until then, Founder approval for every merge is the governing default.