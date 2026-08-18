# Revision

A personalised revision platform for GCSE and A-level students, built around evidence-aware guidance, practice and exam preparation.

## Current learner application

The governed learner product is the React application at:

`/revision/app/`

Its signed-in Home is led by **REV**, Revision's non-human AI study-guide identity. REV is the first primary surface after login and asks the learner what they want to do next.

REV v0.1 uses the shared deterministic recommendation engine and structured learning evidence to suggest a useful subject, paper, topic and activity without spending an AI-model call. It explains the evidence and limitations behind the recommendation rather than inventing certainty.

Global learner navigation is:

- Home
- Subjects
- Progress
- REV

Selecting a subject opens a Subject Home. Selecting a substantial course, paper or component opens an Overview hub with focused contextual sections:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

These are distinct React screen states rather than one long course/paper page. Topics remain cross-cutting academic entities, so the same topic can be reached from learning, practice, exam preparation or progress without duplicating the underlying content/evidence model.

The current GitHub Pages host cannot serve arbitrary SPA deep paths directly, so the learner hierarchy uses reloadable hash routes beneath the permanent `/revision/app/` boundary. Routes are generated from catalogue identities rather than hard-coded subject names, for example:

`/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/practice`

Desktop uses persistent Home / Subjects / Progress / REV navigation. Mobile uses the same four learner-wide destinations in its fixed bottom navigation; course/paper sections appear as contextual navigation once the learner enters that academic context.

The repository root `/revision/` remains only a lightweight redirect into `/revision/app/` until the future public marketing/editorial site is introduced. The previous static learner runtime and `subjects/` routes are retired.

See:

- `10-product-governance/Information Architecture.md` — governing learner hierarchy and contextual-section authority.
- `20-brand-and-experience/Visual Brand System.md` — governing visual and REV experience authority.
- `docs/technical/REV Homepage Shell Implementation.md` — current React learner shell and catalogue behaviour.
- `docs/technical/Target System Architecture.md` — current/target technical architecture.
- `docs/technical/React Cutover Parity Audit.md` — historical pre-cutover parity audit.
- `docs/technical/React Cutover Closure.md` — cutover closure evidence and decision.

## Repository structure

```text
/
├── app/                               # Vite entry HTML for the governed React learner app
├── src/
│   ├── app/                           # catalogue-driven learner shell, navigation, focused screens, REV and exam simulator
│   ├── engine/                        # typed content, evidence and readiness/recommendation logic
│   └── services/                      # Supabase and persistence services
├── content/                           # governed typed learning content packs
├── supabase/                          # migrations, verification and database support
└── index.html                         # temporary redirect from /revision/ to /revision/app/
```

## Content model and automatic catalogue discovery

The current typed content manifest represents:

`Subject → Qualification / Exam Board → Paper or Area`

The learner experience presents that content through the broader governed hierarchy:

`Learner → Subject → Course/specification → Paper/component where applicable → focused section → Topic/activity → Evidence and feedback`

Content packs live beneath `content/**/index.ts`. Each validated pack default-exports itself. The Vite content registry discovers those pack entry points automatically at build time.

A pack with `manifest.status: 'available'` enters the current pilot learner catalogue automatically. The shared React shell then derives:

- the Subjects list;
- Subject Homes;
- course/paper cards;
- reloadable module/section routes;
- focused Learn / Practice / Exam Prep / Progress sections supported by that pack;
- evidence loading for that module;
- global Progress aggregation; and
- REV's deterministic cross-module prioritisation.

Adding an ordinary new subject or paper therefore should not require a new React page, route constant or subject-specific branch in the shared engine. The pack must still satisfy the governed content schema and tests.

The first live content pack is AQA AS Business 7131 Paper 2. It includes notes, flashcards, topic links, formulas/data work, adaptive quick checks, case-study practice, exam-answer teaching, written exam questions and a full 80-mark/90-minute Paper 2 simulator.

### Pilot catalogue boundary

Revision does **not yet persist per-user subject/course enrolments**. During the current Jamie pilot, all packs marked `available` are treated as part of the authenticated learner catalogue; `preview` and `planned` packs remain hidden.

Future learner enrolment should be implemented as a user-specific filter over the published catalogue. It should not require returning subject knowledge or route definitions to shared React code.

## Progress principle

Progress is based on evidence rather than clicks. Revision distinguishes coverage, scored understanding evidence and exam readiness. Readiness is withheld until the required breadth and variety of evidence exists and is accompanied by a confidence level and explanation.

The learner shell loads evidence for every currently published module so global Progress and REV can compare the wider revision picture rather than assuming a single paper.

## Hosting

GitHub Pages deploys the Vite `dist/` build from `main` using `.github/workflows/deploy-pages.yml`. The workflow publishes the React learner application plus the temporary root redirect, then smoke-tests the canonical `/app/` route and confirms the retired legacy learner routes are no longer published.
