# Target Repository Structure

Status: Approved target pending implementation.

```text
revision/
├── src/
│   ├── app/
│   ├── engine/
│   ├── services/
│   └── types/
├── content/
│   └── business/aqa-as/paper-2/
├── tests/
├── supabase/
│   └── migrations/
├── 00-company-foundation/ ... 90-governance-registers/
├── decisions/
├── docs/technical/
└── other governed knowledge areas
```

## Boundary rules
- `src/app`: React UI and routing.
- `src/engine`: subject-agnostic learning-domain logic.
- `src/services`: auth, persistence and integrations.
- `content`: subject/paper material and capability configuration.
- `tests`: automated assurance beyond colocated unit tests where appropriate.
- `supabase/migrations`: authoritative database evolution history.

The existing `subjects/...` prototype structure will be retired progressively as its behaviour/content is extracted into the target structure.
