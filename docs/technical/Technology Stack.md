# Technology Stack

Status: Approved target pending implementation.

## Application
- React
- TypeScript with strict checking
- Vite

## Content
- TypeScript-authored content packs
- Zod validation

## Data and authentication
- Existing Supabase project
- Supabase Auth
- PostgreSQL / Supabase data APIs protected by RLS
- Version-controlled Supabase migrations

## Testing
- TypeScript checks
- linting
- unit/integration tests (runner selected during implementation)
- Playwright browser journeys
- automated accessibility checks where practical

## CI/CD and hosting
- GitHub Actions
- GitHub Pages remains default hosting unless implementation proves a concrete need to change

## Deliberate exclusions for now
- no full-stack React framework
- no CMS
- no second environment unless justified
- no heavyweight monitoring service unless usage/risk justifies it
