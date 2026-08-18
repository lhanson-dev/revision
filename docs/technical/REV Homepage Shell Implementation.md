# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the implemented Revision Home experience in the governed React learner application at `/app/`.

## Canonical learner route

The governed learner product is the Vite/React application published at:

`/revision/app/`

The REV-led Home design lives in `src/app/App.tsx` and `src/app/rev-home.css`.

The repository root `/revision/` is not a second learner application. Until a future public marketing/editorial site occupies `/`, the root contains only a lightweight redirect into `/revision/app/`.

## Home hierarchy

After authentication, the React app presents:

1. **REV first** — a large indigo recommendation/conversation surface containing the learner greeting and “What shall we do today?”.
2. **Today’s picture** — a compact evidence-aware summary beside REV on desktop and immediately below it on mobile.
3. **Subjects and progress overview** — supporting information that remains available by scrolling and does not compete with the first CTA.
4. **Practice workspace** — the full Business Paper 2 learning/practice capability.
5. **Exam Prep** — the full Paper 2 simulator.
6. **Detailed progress** — recent evidence and readiness explanation.

Desktop uses the approved persistent top navigation. Mobile uses the Revision header, burger menu and fixed Home / Subjects / Practice / Progress / REV bottom navigation.

## REV v0.1 behaviour

REV is not yet a general conversational model on Home. Its first useful recommendation is deterministic and cost-efficient.

The React Home uses the existing shared recommendation engine:

- `recommendNextActivity(...)` chooses a topic and activity from structured learner evidence;
- the recommendation carries a plain-English reason, evidence summary and confidence limitation;
- `assessPaperReadiness(...)` supplies the governed paper-readiness state;
- no extra AI-model call is required for the first recommendation.

When evidence is sparse, REV states the limitation and may recommend gathering coverage evidence rather than claiming a topic is weak.

The learner can ask REV to suggest the next step or choose practice manually. `LearningWorkspace` remains the execution surface for the recommended activity.

## Data and claim boundaries

Home displays only information supported by current product data. It does not invent:

- exam dates;
- additional subjects;
- grade forecasts;
- generic “on track” claims; or
- readiness where the governed evidence thresholds have not been met.

The compact progress overview distinguishes evidence coverage, scored activity and paper readiness. Evidence coverage means topics with recorded evidence; it is not presented as mastery or syllabus completion.

## Motion and accessibility

REV uses a restrained abstract orb/waveform presence. The initial message and returned recommendation may type onto the screen once.

Motion:

- is non-essential to understanding;
- stops under `prefers-reduced-motion`;
- does not flash; and
- does not block navigation or learning work.

## Implementation files

- `src/app/App.tsx` — authentication, REV Home shell, responsive navigation, evidence-aware Home summaries and learner capability composition.
- `src/app/rev-home.css` — approved v0.1 visual system application, REV motion, responsive Home hierarchy and navigation.
- `src/app/app.css` — learning workspace/component baseline retained during ongoing visual refinement.
- `src/engine/readiness/readiness.ts` — shared deterministic readiness and next-activity recommendation logic.
- `tests/e2e/app-responsive.spec.ts` — phone/tablet/desktop browser assurance for REV Home plus learning and exam journeys.

## GitHub Pages deployment

The Pages workflow builds the Vite learner application into `dist/` and deploys that artifact. `/app/` therefore changes only through the governed Vite build.

The workflow copies only the lightweight root redirect into the final artifact; it does not publish the retired static learner runtime or legacy `subjects/` routes.

Production smoke verifies:

- the root points into `/app/`;
- `/app/` references a built `/revision/assets/*.js` bundle rather than raw TypeScript source; and
- the retired legacy learner route and retired root Home asset path return 404.

## Future technical step

A later REV programme can add a genuine conversational layer on top of this deterministic first recommendation. The conversation layer should call the same governed evidence/recommendation services rather than developing a separate interpretation of learner progress.
