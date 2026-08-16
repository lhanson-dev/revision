# Jamie Revision Hub

A lightweight static revision platform designed to support multiple subjects, qualifications, exam boards and papers.

## Structure

```text
/
├── index.html                         # Revision Hub / subject chooser
└── subjects/
    └── business/
        ├── index.html                 # Business subject landing page
        └── aqa-as/
            └── paper-2/
                ├── index.html         # Paper 2 revision app
                ├── styles.css
                ├── data-core.js       # syllabus notes + formula bank
                ├── data-recall.js     # flashcards + mind-map relationships
                ├── data-test.js       # question bank + case study
                ├── app-core.js        # navigation, mastery + recall logic
                └── app-test.js        # test + case-study logic
```

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
3. Connect
4. Answer
5. Test

## Current module

AQA AS Business 7131 Paper 2 is the first live module. It includes full-course notes, flashcards, mind-map relationships, exam-answer blueprints, formula practice, mixed quizzes, a case-study trainer and local progress tracking.

## Hosting

The repository is designed to publish directly through GitHub Pages from the `main` branch and repository root.