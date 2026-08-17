# Revision

A personalised revision platform for GCSE and A-level students, built around evidence-aware guidance, practice and exam preparation.

## Current learner application

The governed learner product is the React application at:

`/revision/app/`

Its signed-in Home is led by **REV**, Revision's non-human AI study-guide identity. REV is the first primary surface after login and asks the learner what they want to do next.

REV v0.1 uses the shared deterministic recommendation engine and the learner's structured evidence to suggest a useful topic/activity without spending an AI-model call. It explains the evidence and limitations behind the recommendation rather than inventing certainty.

Supporting subjects, progress, practice and exam-preparation features remain on the same Home experience and are available by scrolling beneath REV.

Desktop uses persistent top navigation. Mobile uses a Revision header with burger menu and fixed Home / Subjects / Practice / Progress / REV bottom navigation.

See:

- `20-brand-and-experience/Visual Brand System.md` — governing visual and REV experience authority.
- `docs/technical/REV Homepage Shell Implementation.md` — current React Home implementation.
- `docs/technical/React Cutover Parity Audit.md` — migration/cutover state.

## Repository structure

```text
/
├── app/                               # Vite entry HTML for the governed React learner app
├── src/
│   ├── app/                           # learner UI, REV Home, practice and exam simulator
│   ├── engine/                        # typed content, evidence and readiness/recommendation logic
│   └── services/                      # Supabase and persistence services
├── content/                           # governed typed learning content packs
├── index.html                         # migration/compatibility root Home
├── assets/                            # root compatibility Home assets
└── subjects/                          # legacy learner routes retained during cutover
```

## Content model

New content follows:

`Subject → Qualification / Exam Board → Paper or Area`

The first live content pack is AQA AS Business 7131 Paper 2. It includes notes, flashcards, topic links, formulas/data work, adaptive quick checks, case-study practice, exam-answer teaching, written exam questions and a full 80-mark/90-minute Paper 2 simulator.

## Progress principle

Progress is based on evidence rather than clicks. Revision distinguishes coverage, scored understanding evidence and exam readiness. Readiness is withheld until the required breadth and variety of evidence exists and is accompanied by a confidence level and explanation.

## Hosting

GitHub Pages deploys the Vite `dist/` build from `main` using `.github/workflows/deploy-pages.yml`. During migration the workflow also preserves the root compatibility page and legacy subject routes.
