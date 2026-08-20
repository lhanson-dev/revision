# AI Authority & Approval Matrix

| Activity | AI may inspect/propose | AI may implement on branch | Human approval required before state/authority change | Founder approval required before merge |
|---|---|---|---|---|
| Discovery / inventory | Yes | Yes | No | Yes |
| New → To Do feature decision | Yes | No self-approval | Yes — Founder by default | Yes |
| Feature analysis / Definition-of-Ready preparation | Yes | Yes, analysis/docs/spikes only | No for analysis; Yes for `Ready` | Yes |
| Analyse → Ready feature decision | Yes | No self-approval | Yes — Founder by default | Yes |
| Product authority | Yes | Draft only | Yes where product behaviour changes | Yes |
| Material feature implementation | Yes | Yes, only after recorded `Ready` | `Ready` approval must already exist | Yes |
| Implementation change / maintenance | Yes | Yes | As required by applicable authority | Yes |
| Documentation | Yes | Yes | As required by the governed content | Yes |
| Defect fix | Yes | Yes | As required by severity/governance | Yes |
| Research | Yes | Yes | No | Yes |
| Governance change | Yes | Draft only | Yes | Yes |

## Rules

- AI agents may assess a feature and recommend `To Do` or `Ready`; they may not self-approve either human gate.
- By default the Founder is the human approver for `New → To Do` and `Analyse → Ready` unless future governance explicitly delegates that authority.
- Material product implementation must not begin before recorded `Ready` approval.
- A feasibility spike during `Analyse` is not permission to ship production implementation.
- No AI agent may interpret technical mergeability, passing tests, silence, prior related approval or authorship as merge approval.
