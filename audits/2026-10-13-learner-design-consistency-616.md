# Learner design consistency corrective audit — Issue #616

**Status:** implementation candidate / visual acceptance pending; programme remains open.  
**Integration authority:** approved `main` `e9d1266791f234753780ffbb489f0126ce12eadf`.  
**Change:** draft [PR #618](https://github.com/lhanson-dev/revision/pull/618).  
**Scope:** canonical learner product; no marketing, pricing or Admin redesign.

## Authority and runtime

Read current `INDEX.md`, `AUTHORITY_HIERARCHY.md`, `KNOWLEDGE_ARCHITECTURE.md`, AI Agent Constitution, Learner Design System, Interactive Component Quality Standard, Interface System Operating Standard, Component Registry, implementation reconciliation, Design Lab Implementation and Testing & Assurance Standard. The applicable existing rules already govern these corrections; no normative amendment or new design decision is proposed.

`README.md`, `app/index.html`, `src/main.tsx` and production entry imports establish `/revision/app/` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` as canonical. Course sections are owned by `CourseExperienceScreen`; focused work by `FocusedLearningWorkspace` and `ExamSimulator`. `src/App.tsx` is not the canonical entry. The protected Design Lab is a derived reference, not evidence of learner route completeness. Browser evidence uses the production Vite build with synthetic network-edge data, not a second learner implementation or real learner accounts.

## Inventory

“Current” below distinguishes the observed implementation defect from its candidate correction. Correct is a judgement about the sampled production component and recorded states, not a claim that every future content permutation was tested. Intentional exceptions describe existing specialist interaction purposes; they do not approve new ordinary-action shapes.

| Finding | Screen/component | Approved design | Current implementation | Required correction |
|---|---|---|---|---|
| Fix — competing action owner | Authentication, account creation and password recovery | Shared Button; primary 14px / large 52px; shared states | Main had a pill CTA and raw local button families; candidate uses Button with contextual layout hooks | Remove local geometry/palette duplication; retain handlers, accessible names and recovery feedback |
| Correct — labelled fields | Authentication / account creation | 48px+, 14px radius, 16px Manrope text, visible labels | Existing labelled inputs consume canonical field roles; computed checks exercise both forms | Preserve labels/autocomplete and entered work |
| Fix — ordinary CTA override | First-use onboarding | Shared primary action geometry | Main primary override pill; candidate removes the redundant primary appearance rule | Inherit shared owner; first-use choice/card anatomy remains distinct |
| Intentional exception — selection cards | Onboarding course, subject, qualification and experience choices | Native labelled selection or specialist selection card; accessible state | Native radio/checkbox and card choices remain feature-owned | Preserve selection semantics and governed first-use persistence |
| Fix — empty Home CTA | Home with no courses / HomeSetupEmpty | Shared large ordinary action | Main uses separate pill `home-setup-primary`; candidate uses Button large | Retire the local ordinary action family |
| Fix — target shrink | Home v3 ordinary actions | 48px standard, 52px large; compact only justified secondary/pointer contexts | Main lowers every shared button to 44px; candidate removes blanket shrink | Restore shared sizing; preserve icon composer and tile/navigation purposes |
| Correct — canvas and navigation | Home, Plan, Progress, Courses and course sections | Stable learner canvas; desktop/sidebar, tablet/rail, phone/bottom navigation | Shared layout owner remains; route/canvas and overflow browser coverage retained | Verify representative responsive captures and existing 320px checks |
| Fix — compact primary | Practice Carry on, REV message launch, Plan move action | Primary learner actions are standard; compact is secondary/pointer density | Candidate removes inappropriate compact primary usage | Reject compact primary in rendered checks |
| Fix — touch target eligibility | Compact learner secondary actions | Compact 36px may be justified for pointer use; touch ordinary actions remain 48px | Shared coarse-pointer rule restores 48px in learner runtime; Admin descendants excluded | Check actual geometry; preserve selector exception |
| Intentional exception — selectors and calendar | Plan Day/Week/Month, date controls, capacity steppers; account appearance | State/date selection is distinct from ordinary actions; 44px minimum, 48px preferred primary view switch | Shared/named selector anatomy retained, including nested 9px segment inside 12px shell; Plan view switch is 48px | Enforce target sizes separately; do not force every control into ordinary Button shape |
| Fix — profile edit owner | Account dialog / first name | Shared 14px field, 48px target, 16px text; ordinary Save | Main local 11px field/action and 42px height override shared primitives; candidate removes duplicates, uses Button and existing ui-field | Retain save/retry behaviour and labelled input |
| Fix — modal surface/type | Profile, Settings, Plan exam-date dialog and exam interruptions | 20px ordinary modal; Bricolage 800 heading roles | Main account modal 24px; local heading scales/families; candidate uses central radius/display roles | Verify reflow, close target, focus containment and return |
| Correct — Courses | Index, open/add/remove course and confirmation | Shared ordinary hierarchy, semantic surfaces and fields | Existing shared controls retained; new checks visit index and existing journey tests retain add/remove/persistence coverage | Preserve active-course scope and evidence retention |
| Fix — recommendation action fork | Course Overview, Practice and shared RevSuggestionCard consumers | Genuine REV inverse surface plus ordinary shared actions | Main shared recommendation component still emits pill primary/secondary/plan families; candidate uses shared Button | Delete competing geometry/type/state rules |
| Fix — contextual hover ownership | Home/REV inverse alternatives | Readable foreground in default/hover/focus; same ordinary geometry | Candidate centralises existing inverse translation in Button `onInverse` rather than a local light-hover/white-text collision | Use shared contextual modifier and test rendered hover/focus |
| Fix — shared surface geometry/spacing | ProgressMeasures and ExaminerGuide | 20px ordinary surfaces; named spacing roles | Main literal 24px; candidate 20px, shared rhythm replaces 22px padding/14px gap | Check computed radius; ExaminerGuide retains existing release boundary |
| Correct — Progress meaning | Global/course Progress, Home measures | Separate coverage, understanding and readiness; semantic status/subject/functional roles | Evidence interpretation and aggregation unchanged; shared measures and semantic states retained | Preserve evidence truth; verify empty and representative populated states |
| Fix — ordinary reveal/retry | Learn WorkedExample, Quantitative data disclosure and shared QuickCheck retry | Shared ordinary actions, 14px radius, canonical hierarchy | Main uses `learn-pill` and separate retry family; candidate migrates actions and deletes families | Preserve step progression, aria-expanded/controls and unscored retry |
| Intentional exception — educational surfaces | Learn reading treatments, quantitative charts, page pager | Editorial reading workspace, distinct treatment/pager jobs | Existing production treatment components and reading measure retained | Keep answer choices/charts/pager semantics; no parallel teaching implementation |
| Fix — Practice action dimensions | Start, flashcard reveal and feedback progression | Named standard/large Button sizes and padding | Main uses local 26/28/22px action padding and hard-coded targets; candidate uses size props and removes geometry overrides | Retain phone full-width CTA rule and ref-based keyboard focus |
| Fix — Practice REV alternatives | Written feedback / challenge Cancel and Challenge a mark | Shared ordinary secondary actions on genuine inverse surface | Main separate pill family; candidate Button onInverse | Preserve marking/challenge handlers; fixture-only marker states are not proof of live marking availability |
| Intentional exception — assessment response | Practice answer options, confidence and flashcard ratings; exam question grid/flag | Different response/selection purpose; clear names/states/targets | Specialist response anatomy and learning-status meaning retained | No ordinary action recolouring of evidence states |
| Fix — legacy shared Button hooks | Focused practice case/question/formula/data activities | Shared Button owns interaction states | Main adds primary/secondary legacy classes to Button, activating competing hover/type rules; candidate removes classes and dead ordinary rules | Retain content, guidance, marking and next-question handlers |
| Fix — Exam Prep action family | Timed/untimed mock launch and in-page Back | Shared primary/secondary ordinary actions | Main separate pill `exam-button`; candidate real Button | Preserve entitlement-disabled untimed controls and focus restoration; role/name browser locator replaces retired class |
| Fix — ordinary simulator actions | Exam launch, navigation, self-mark/save, results, pause/resume/stop confirmations | Shared hierarchy and 14px control geometry; destructive Error semantics | Main raw primary/secondary/control/resume/danger families; candidate Button | Retain timer, interruption safeguards, answers, marking, evidence and completion routes |
| Intentional exception — focused writing | Exam response sheet, question grid and flag toggle | Dedicated performance workspace, task-specific editor/selection anatomy | Textarea/sheet and selection geometry retained; Ask REV/global navigation remain suppressed | Preserve pause/stop focus, confirmation and unsaved-work contract |
| Fix — REV composer field | Ask REV conversation | Ordinary labelled field: 14px radius, 48px, 16px input text | Main composer pill; candidate canonical field geometry | Preserve chat state, contextual draft and submission |
| Intentional exception — conversation prompts/identity | REV prompt chips, Living E, raised REV navigation | Deliberate prompt-chip and genuine identity anatomy | Chips/circles and canonical identity assets remain | Do not infer that identity or selector shapes are ordinary button defects |
| Correct — shared overlays | Navigation drawer, account menu and REV layer | Shared focus, inertness, Escape, scroll lock, return; compact menu/REV surface roles | Existing ModalShell/DrawerShell/PopoverShell ownership unchanged | Keep overlay-focus and accessibility regression; capture open states |
| Remove — dead competing family | Course Overview feature stylesheet | One current production composition | All `.course-overview-*` selectors in course-overview-rev-feature.css have no emitted TSX consumers; candidate retires file/import | No replacement compatibility or masking stylesheet |
| Intentional retention — structural migration sources | Legacy-named CSS imported by canonical entry | Composition may remain where live consumers exist; foundations stay centrally owned | app/exam/returning-home etc. retain live structural consumers; obsolete ordinary rules retired only where migration is proven | Existing retained-source and legacy-token controls remain; filename is not proof of a live parallel design system |

## The six original visual failures

The initial head was confirmed as `8f6d23712d1e5145558efa434e770fc6927bea5d`, draft and unmerged, with CI [38368619483](https://github.com/lhanson-dev/revision/actions/runs/38368619483). All non-browser CI jobs/checks had passed; browser had six image mismatches and the retired-class Exam Prep test failure.

Separate same-environment captures compared original approved base `f07bbbb0b8f2059e4fcd7f5cf811a8e0975b0a54` with that initial head:

| Case | Reviewed change | Design authority / interpretation |
|---|---|---|
| Desktop sign-in Light | CTA corners only; 52px height retained | Ordinary control radius 14px |
| Desktop sign-in Dark | Same corner correction | Geometry is theme-invariant |
| Phone Practice Light | Changed strip of the Start CTA near bottom navigation; full-page and computed checks are additionally needed | Existing fixed viewport snapshot barely shows the control; hash alone is weak geometry evidence |
| Phone Practice Dark | Same strip/corner correction | Same ordinary-action rule |
| Tablet Exam Prep Light | Shared geometry, padding/type/border and resulting mock-card flex reflow | Ordinary Button owner replaces local family; no fixed legacy card-height authority |
| Tablet Exam Prep Dark | Same reflow with semantic theme translation | Same component structure and geometry |

Early local captures used fallback fonts and were rejected as typography/baseline evidence. Subsequent captures explicitly verify loaded Manrope and Bricolage through the configured proxy/CA path. The screenshots are application evidence, not new design authority. Local raster hashes differ from historical CI hashes even on the approved base, so **no local digest is substituted for an approved CI baseline**. Final exact-head CI capture review and Founder visual approval remain necessary.

## Repeatable assurance

`tests/e2e/learner-design-consistency.spec.ts` runs Light/Dark across phone, tablet and desktop. It records actual control geometry, fields, palette, headings, surfaces, borders, shadows and font loading. Numeric checks cover ordinary radii/targets, primary colour/foreground, shared surfaces/fields, icon/selector targets, compact-primary and touch eligibility, hover/focus, async busy/disabled state, recoverable auth failure preserving work, and overflow. Routes and specialist states have separate assertions; selectors are not treated as ordinary buttons.

`scripts/assurance/learner-control-ownership.test.mjs` rejects common local ordinary-action shape/type/target forks, including generic descendant radius rules, and guards the retired stylesheet. Existing retired-token, raw-colour, theme, icon, route, evidence and screenshot controls remain. Source-only assertions are supplemental; actual rendered checks are the geometry evidence.

Reusable first-use and Practice session test data/helpers are extracted rather than duplicated. Existing Exam Prep selectors now use accessible role/name plus native enabled state; its non-wrapping check includes the new live buttons rather than a retired class.

For managed execution, explicitly set `REVISION_BROWSER_PROXY` to the inherited configured proxy. The new test routes only Google font assets through Playwright's Node request context with configured CA trust; TLS verification is not disabled. Normal CI leaves the optional proxy unset. Screenshot capture is enabled with `LEARNER_DESIGN_SHOTS=1`; screenshots are never automatically approved.

## Independent review and acceptance limits

Independent ChatGPT review found remaining Practice action padding, an accidentally lost phone-width rule and incomplete icon/selector/compact assertions. These were corrected. The reviewer independently ran 14 source/governance checks successfully and found no new material implementation defect in the examined migrations; this is not visual or merge approval.

The full learner route inventory is covered by representative built-application states, with existing browser suites supplying the deeper interaction/evidence paths. It is not exhaustive testing of every course/content/entitlement permutation. Written-marker fixture states are identified as test doubles; actual service, RLS and persistence assurance remains the repository CI responsibility. Historical approved baselines and previous audits are untouched.

**Open gates:** final candidate assurance after all corrections, fresh exact-head CI, final main integration check, independent final evidence review, Founder approval of changed visual baselines, then a distinct explicit PR-specific merge approval. Production smoke follows a separately approved merge. Issue #616 must not be closed or the programme declared complete while those gates remain open.
