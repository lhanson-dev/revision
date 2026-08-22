# FI-020 Implementation PR Scope

The implementation PR for FI-020 covers the Founder-approved Ready scope only:

- persisted authenticated learner-course membership;
- Courses replacing Subjects in the canonical learner shell;
- Add Course / confirmed Remove Course;
- saved-course contextual navigation;
- canonical `#/courses` routes with subject-first compatibility inputs;
- Home, Plan, global Progress and learner-wide REV filtered to active courses;
- exact course identity carried through planner recommendations;
- bounded existing-user transition;
- unknown-course integrity handling;
- product/assurance telemetry;
- RLS, database, unit, browser, responsive and release-readiness assurance; and
- aligned technical/lifecycle documentation.

It deliberately excludes FI-002 subscription-tier UI, FI-003 fuller tutor functionality and the separate Ask REV visual fix in PR #128.
