# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the first implemented Revision home shell that applies the approved visual direction and makes REV the primary post-login experience.

## Current implementation

The repository-root `index.html` remains the authentication entry point and signed-in Home route. The new shell separates presentation and behaviour into:

- `assets/home.css` — responsive visual system, desktop navigation, mobile bottom navigation, REV surface and reduced-motion behaviour.
- `assets/home.js` — Supabase authentication, identity display, saved-progress loading, deterministic REV recommendation, menu behaviour and restrained typing response.
- existing Business Paper 2 data files — reused by Home to interpret the current learner evidence without introducing a second curriculum copy.

## REV v0.1 behaviour

REV is not yet a general conversational model on Home. The first recommendation is deterministic and cost-efficient:

1. load the signed-in learner's `revision_progress` row for `business-aqa-as-paper-2`, falling back to local progress where necessary;
2. derive topic evidence from the existing flashcard and quiz state;
3. identify the weakest current topic when evidence exists; and
4. explain that recommendation in plain English.

If there is insufficient answer evidence, REV does not invent a weak area. It says that the baseline is insufficient and directs the learner to build evidence.

This is intentionally a v0.1 bridge. The recommendation calculation should later be extracted behind a shared recommendation/evidence service so Home and the paper module cannot drift.

## Responsive hierarchy

### Desktop

Home uses a persistent top navigation. REV is the dominant first surface, with a compact current-picture card alongside it and subject/progress/continue content beneath.

### Mobile

Home uses the Revision wordmark plus burger menu at the top and a fixed bottom navigation for Home, Subjects, Practice, Progress and REV. REV is the first CTA surface after the header; supporting content scrolls below it.

## Motion and accessibility

REV uses a restrained orb pulse and waveform movement. The first message may type on entry and recommendations may type in response. All motion is non-essential and is disabled/reduced when `prefers-reduced-motion` is set.

## Data and claim boundaries

The homepage does not invent exam dates, extra subjects or grade forecasts that are not stored by the current system. Progress labels are derived only from available saved evidence. Exam readiness remains unassessed until suitable exam-attempt evidence exists.

## GitHub Pages packaging

The Pages workflow builds the Vite learner application into `dist/` and then preserves the repository-root Home and legacy subject routes during the migration period.

Because the root Home depends on non-Vite files, deployment must explicitly copy:

- `index.html` → `dist/index.html`
- `subjects/` → `dist/subjects/`
- `assets/home.css` → `dist/assets/home.css`
- `assets/home.js` → `dist/assets/home.js`

The production smoke test verifies the deployed root contains the REV Home marker and that both Home assets return successfully, as well as continuing to verify the built `/app/` route. This prevents a successful Pages deployment from silently publishing a root Home whose required CSS or JavaScript was omitted from the artifact.
