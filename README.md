# Revision

A lightweight revision platform designed to support multiple subjects, qualifications, exam boards and papers.

## Structure

```text
/
├── index.html                         # Authentication + REV-led learner Home
├── assets/
│   ├── home.css                       # responsive Home / navigation / REV visual system
│   └── home.js                        # auth, learner evidence and REV Home behaviour
└── subjects/
    └── business/
        ├── index.html                 # Business subject landing page
        └── aqa-as/
            └── paper-2/
                ├── index.html         # Paper 2 revision app
                ├── styles.css
                ├── data-core.js       # syllabus notes + formula bank
                ├── data-recall.js     # flashcards + topic relationships
                ├── data-test.js       # question bank + case study
                ├── app-core.js        # navigation + recall logic
                ├── app-test.js        # quick test + case-study logic
                ├── v2.js              # progress model + data lab + full exam simulator
                └── feedback-v3.js     # adaptive difficulty + evidence-aware readiness
```

## Current Home experience

After authentication, Home is led by **REV**, Revision's non-human AI study guide identity. REV is the first primary surface on desktop and mobile and asks the learner what they want to do next.

REV v0.1 does not spend an AI-model call to manufacture an initial recommendation. It reads the learner's existing Business Paper 2 progress and uses saved recall/quiz evidence to identify the current weakest area. Where there is not enough evidence, it says so and directs the learner to build a baseline rather than inventing certainty.

Supporting subject, progress and continue-learning content remains available by scrolling beneath REV. Desktop uses top navigation; mobile uses the Revision header, burger menu and fixed bottom navigation.

See `docs/technical/REV Homepage Shell Implementation.md` for the current implementation description and `20-brand-and-experience/Visual Brand System.md` for the governing visual direction.

## Design rule

New content should follow:

`Subject → Qualification / Exam Board → Paper or Area`

Examples:

- `subjects/business/aqa-as/paper-1/`
- `subjects/business/aqa-as/paper-2/`
- `subjects/maths/aqa-gcse/higher/`
- `subjects/economics/aqa-a-level/paper-1/`

Each revision module can use the same learning pattern where useful:

1. Learn
2. Recall
3. Link topics
4. Answer
5. Test
6. Measure progress
7. Simulate the exam

## Current module

AQA AS Business 7131 Paper 2 is the first live module. It includes full-course notes, flashcards, topic-linking relationships, exam-answer blueprints, formula and data practice, adaptive quick checks, case-study training, an 80-mark/90-minute Paper 2 simulator, cloud progress sync, AO1–AO4 tracking and evidence-aware revision recommendations.

## Progress principle

Progress is based on evidence rather than clicks. The app builds a baseline across the syllabus before presenting an exam-readiness score, then combines knowledge checks with exam performance to identify what to revise next.

## Hosting

The repository publishes directly through GitHub Pages from the `main` branch and repository root.
