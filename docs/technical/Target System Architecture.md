# Target System Architecture

Status: Approved target pending implementation.

## Current state
Revision currently operates as a static HTML/CSS/JavaScript application with paper-specific application/content files, Supabase Auth/progress sync and browser local state.

## Target state

```text
Learner browser
   |
React application
   |-- app: routes/screens/components
   |-- engine: learning/recall/assessment/progress/recommendations/exam
   |-- services: auth/progress/platform integrations
   |
versioned content packs (TypeScript + Zod validation)
   |
Supabase Auth + canonical progress data
```

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

## Migration principle
Refactor the current site directly toward this architecture while keeping the product usable between governed PRs. Do not maintain a permanent parallel V1/V2 architecture.
