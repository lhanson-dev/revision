# FI-001 — Student-Value Programme Acceptance Scenarios

**Status:** Proposed frozen product acceptance contract for the new FI-001 programme-first Definition of Ready, 15 October 2026. These are *expected outputs*, not claims that current production passes. Real approved course/paper mappings and valid assets must be used at implementation time; illustrative topic examples are not hard-coded production curriculum fixtures.

## Test method and invariant oracle

Fix local clock and `Europe/London`, active learner memberships, *real* AQA Business 7132 (three papers/shared ten areas) and AQA Psychology 7182 (compulsory content plus explicitly selected assured Paper 3 options only), selected paper deadlines, approved asset IDs, evidence source/provenance and realistic Monday-Sunday/exceptions. Keep a small held-out fixture set distinct from tuning fixtures. Run exactly the **same inputs** against current main at `fd856583` and the proposed engine; record programme objective structure, allocation, changed evidence, feasible supported Starts and student-facing content. Examples below specify relationships; no hypothetical exact topic weight or scientifically optimal study-minute split is assumed.

**Common five-view oracle (required for every scenario):** **Month** shows major knowledge/skill objectives, paper relationships and milestones to the final known exam; **Week** shows this week's outcomes/treatments and reasonable time/constraints; **Day** shows exact eligible actionable work with supported route; **Home** promotes the identical next Plan action or truthful no-plan fallback; **REV** explains why the *same* action contributes to a named weekly and exam objective, uncertainty and any programme trade-off. Future months must not disappear after day 14. No future exact session is silently booked. "Changed" below means rerun the same five-view contract after the event.

## Thirteen mandatory end-to-end student cases

### SV-01 — New learner, virtually no evidence
**Inputs:** One enrolled, published Business 7132 course; three real future paper dates; 3–4 realistic weekly study opportunities; no scored results and no starting check.
**Recommended programme and why:** map ten shared course areas once and map valid paper response demands separately; explicitly label evidence **unknown**. Front-load accessible core learning/check opportunities across the early preparation window, then suitable application/retrieval and authentic-paper practice where approved assets permit. Distribute feasible workload and show missing/unsupported demands, without declaring the learner weak or capable.
**Views:** Month = broad learn/assess/apply/prepare objectives through last paper; Week = a clearly named first knowledge/skill goal and why; Day/Home = exact supported introductory task; REV = "We don't have enough evidence yet; let's start with [valid topic] and then check what needs more work."
**Change:** A first valid scored result changes the evidence picture and later objectives without faking previous readiness. **Fail:** an unexplained list of weekly flashcards, "0% understanding", or blank future months.
**Current-main contrast:** can display rotating supported candidate topics; no evidenced backward learning-to-paper pathway.

### SV-02 — Strong in some areas, significant gaps in others
**Inputs:** Same published Business course and paper dates; several representative, recent scored responses secure in one required area; corroborated mistakes in a different area; limited capacity.
**Programme:** reduce unnecessary foundational repetition in demonstrated areas; prioritise relevant gap/required prerequisites, route from appropriate explanation to application and later valid retest; retain broader coverage of unassessed demands. Objective linked to applicable papers, not raw candidate count.
**Views:** Month reflects gap-repair-to-application then selected exam demand; Week names repair objective and treatment; Day/Home agree on first exact supported repair/learning action; REV cites actual evidence scope and uncertainty.
**Change:** fresh valid success reduces attention to repaired gap while maintaining demand-appropriate exam practice. **Fail:** equal time or endlessly repeating the weak-topic label regardless of improvement.
**Current-main contrast:** candidate weight may react to low percentages; not a treatment progression.

### SV-03 — Competing exams across active subjects
**Inputs:** Business 7132 and Psychology 7182 enrolled; Business earlier exam; Psychology later paper; both have supported work and comparable partial evidence; finite weekly availability.
**Programme:** identify earlier Business critical obligations without silently starving Psychology. Show justified coarse per-week allocations and what shifts after Business exam; if capacity forces deferral, name the deferred Psychology objective and why.
**Views:** Month = dated paper windows and preparation phases for *both* courses; Week = explain two objectives/workload trade-off; Day/Home same highest feasible supported work; REV explains why Business is urgent without claiming Psychology complete.
**Change:** after Business first paper, shared Business work still eligible for later papers; Psychology resources receive a visible sensible share. **Fail:** 30-minute week-index alternation offered as proof of correct balancing.
**Current-main contrast:** nearest-paper course ordering and alternation cannot derive total demands or appropriate share.

### SV-04 — Multi-paper course with shared syllabus
**Inputs:** Three Business 7132 papers with different dates, common learning areas and distinct valid paper skill/demand opportunities.
**Programme:** one shared knowledge obligation per actual course node, mapped to all relevant papers; explicit paper-response practice by paper only where verified; follow through to last paper.
**Views:** Month = paper sequence and shared-vs-distinct preparation objectives; Week = one named shared knowledge outcome plus paper-specific format where due; Day/Home = exact eligible topic/question; REV explains why paper 2 remains after paper 1.
**Change:** remove/move paper 1 without duplicate shared obligations or dropping later eligible work. **Fail:** duplicates per paper or any paper-1-specific practice scheduled on/after paper 1.
**Current-main contrast:** dedupe/cutoff safety exists; strategic response-skill preparation remains missing.

### SV-05 — Low weekly availability
**Inputs:** Two courses, several distant exams, one 30-minute supported work opportunity/week and zero-day exceptions.
**Programme:** show few defensible, attainable objectives; preserve eventual opportunities across subjects unless nearer deadline legitimately dominates, explain important unserved obligations. Never convert two 20-minute tasks into one '30-minute completion'.
**Views:** Month = truthful constrained course outcomes/what is unlikely to fit; Week = one feasible treatment; Day/Home = one exact whole activity; REV = "With this time, I recommend [x]; [y] needs revisiting when time is available."
**Change:** additional time permits a real additional priority; zero time removes scheduled work without declaring knowledge loss. **Fail:** routine alternating courses without need analysis, exceeding capacity, or promising full coverage.
**Current-main contrast:** a 1/2/3 topic cap/alternation protects display variation, not need-based tradeoffs.

### SV-06 — Starting only weeks before exams
**Inputs:** Business and/or Psychology exams in 2–4 weeks; mixed evidence, exam-demand skill uncertain; realistic sparse capacity.
**Programme:** prioritise attainable gaps and any existing valid exam-style demands with high relevance; use real prerequisites, avoid pretending a full syllabus learning programme fits. Do not force a full-course diagnostic before first useful work.
**Views:** Month = condensed explicit constrained-paper preparation window; Week = selected critical learning/application and paper technique; Day/Home = most useful feasible supported task; REV calmly explains opportunity cost.
**Change:** reduced days/capacity narrows objectives and maintains honesty. **Fail:** 40 topics uncritically scheduled, guaranteed grades, or all time allocated to flashcards.
**Current-main contrast:** urgency raises candidate score but not whole-programme triage.

### SV-07 — Learner misses a week
**Inputs:** Previously coherent two-subject programme, one week of suggested activity uncompleted; no changed scored knowledge evidence.
**Programme:** recompute remaining obligations and real capacity to papers; preserve genuine accepted sessions, do not roll forward seven overdue tasks and do not reduce knowledge score for absence.
**Views:** Month shows revised attainable phases/trade-offs; Week = focused restart objective; Day/Home = exact new best supported first action; REV offers an unjudgemental restart and explains changed capacity.
**Change:** a return and first scored practice result trigger normal evidence update. **Fail:** shame, streak debt, duplicate accepted work or claim of learning deterioration.
**Current-main contrast:** no-debt safety exists, but no full-strategy reallocation to recover.

### SV-08 — Learner completes more work than planned
**Inputs:** Student finishes additional supported work and gains valid scored evidence ahead of the planned objective; exams unchanged.
**Programme:** retain completion evidence and accepted-session history, free capacity for other unmet meaningful demands, avoid repeated busywork.
**Views:** Month reflects advancement/remaining demands, Week rebalances next objectives, Day/Home show a genuinely different next action where useful; REV gives factual recognition of progress.
**Change:** if additional work was unscored, adjust engagement/coverage only as governed, not mastery/readiness. **Fail:** keep same old daily/weekly recommendations solely because originally placed.
**Current-main contrast:** independent scored rank may change, but no ordered phase completion is demonstrated.

### SV-09 — Unexpected valid assessment weakness
**Inputs:** Previously reassuring scoped results; new assured independent practice reveals repeated relevant mistakes or an AO weakness in a required topic.
**Programme:** revise confidence/understanding only through existing evidence owner, insert appropriate explanation/reasoning-repair and valid later checking; displace less valuable planned work as necessary.
**Views:** Month shows shifted repair→application/check opportunity; Week = named change in objective and rationale; Day/Home exact supported repair action; REV explains real, scoped new evidence without extrapolating entire-course failure.
**Change:** follow-up valid positive evidence alters allocation again. **Fail:** ignore contradiction or invent whole-course unreadiness from one result.
**Current-main contrast:** weakness scoring may reorder a candidate, but no repair-and-confirm sequence.

### SV-10 — Genuine improvement
**Inputs:** Corroborated recent valid scored improvement in previously weak nodes; still insufficient evidence in paper-response skill.
**Programme:** reduce remedial repetition for evidenced nodes, keep suitable targeted reinforcement, elevate remaining independent exam-demand skill opportunities.
**Views:** Month shows transition from repair to apply/prepare; Week identifies different capability, Day/Home exact task; REV cites what improved and what still needs verification.
**Change:** evidence ages -> may invite a check, never automatically assert decline. **Fail:** repeated flashcards labelled 'revisit' for having appeared in a prior week's UI.
**Current-main contrast:** revisits keyed by *display history* rather than observed learner need.

### SV-11 — Exam date changes
**Inputs:** Two papers, one moved forward and the other postponed; old programme and accepted sessions exist.
**Programme:** reconstruct all paper-eligibility windows and weekly phases, disclose materially tighter feasibility; carry shared work for later paper, preserve accepted learner sessions without presenting obsolete paper actions as endorsed.
**Views:** Month places actual new milestones, Week changes applicable outcome ordering, Day/Home exact newly eligible task, REV explains moved deadline and tradeoff.
**Change:** moving it back reallocates opportunities without stale paper urgency. **Fail:** tasks on/after moved earlier exam, duplicate paper milestones or unchanged old programme.
**Current-main contrast:** date safety covered; phase/workload reallocation missing.

### SV-12 — Impossible to cover everything
**Inputs:** Multiple imminent papers, significant demonstrated and unknown demands, capacity materially below credible total useful work.
**Programme:** prioritise verifiable high-value prerequisite and exam-demand opportunities subject to safety; expose a meaningful list of unserved learning/skill demands and tradeoffs without fictional completion or marks.
**Views:** Month = restrained prioritising view showing constraints across exams; Week = most attainable outcome, honest omissions; Day/Home exact feasible task; REV explains what is not covered and sensible alternative if the student elects to add time.
**Change:** capacity increases -> recompute and show additional feasible outcome; lack of increase remains valid. **Fail:** a full but impossible weekly topic rotation presented as comprehensive preparation.
**Current-main contrast:** prioritising exists as score/workload label, not explainable requirement-level impossibility assessment.

### SV-13 — Unknown dates and/or availability
**Inputs:** One active published course; exam dates absent, weekly capacity absent, or either separately absent; some evidence optional.
**Programme:** preserve useful course/skill-based rolling learning opportunities; no guessed paper or last-exam horizon, and no invented timed capacity allocation. Explain exactly which piece is missing and invite optional setup without blocking a first task.
**Views:** Month = partial strategy/explicit not-date-bound state rather than empty mistaken certainty; Week = bounded possible focus only where honest; Day/Home = supported *unscheduled* action; REV says unknown date/available time clearly and helps start.
**Change:** adding a date creates legitimate full horizon; adding availability creates a bounded feasible workload; neither creates educational evidence. **Fail:** zero-mastery assumption, fabricated month deadlines or disabled Home.
**Current-main contrast:** honest fallback exists; full education strategy is unbuilt.

## Quality gates and pass/fail policy

**Hard FAIL for any scenario:** past/unknown/incorrect paper or unsupported optional scope; shared-course obligation duplication; scheduled task on/after the associated date-only paper; generated work exceeding known daily available minutes; false asset/Start target; inactive course; invented grade/readiness/provenance; accepted-commitment loss; silent RLS data leak; misleading full-horizon/unknown-state claims; any cross-surface next-action divergence. Count zero tolerated hard failures across fixtures and date/timezone/property tests.

**Educational usefulness FAIL (even when technical tests pass):** any of SV-01..13 yields only a rotating topic label without treatment outcome/why-now reason; long-range periods fail to show genuine preparation objectives; no explicit response-skill opportunities when governed paper demands and supported assets exist; no coherent progression from unknown/weak foundations to appropriately demanding practice; unjustified course starvation or repeated exposure chosen because it appeared in a display; no plausible change after material evidence/date/time updates; false feasibility promise.

**Pass contract:** in each scenario, an expert reviewer can trace every weekly objective to exact course/paper obligation, evidence or uncertainty, treatment, reason and realistic opportunity; see necessary progression before the applicable paper; understand omitted work/constraints; identify the same immediate task and valid route in all three surfaces; and verify changes after a defined event. Compare candidate and current-main outputs on the same fixtures, recording objective relevance, coverage of obligations/AOs where supported, unserved workload, unnecessary repeat, actionability, deadline safety, post-change stability and comprehensibility. Better-looking variety is not a metric of educational value.

**Evidence quality:** counters and scenario reviews are expert/product judgement, not measured student learning gain. Require an accessible real-student comprehension/usability check before declaring the first meaningful vertical slice product-accepted; a later carefully designed learner trial/held-out retrieval or authentic exam practice is needed before efficacy or grades claims. No claim that any optimum interval, topic count or ratio has been proved.

**Implementation testing layers:** pure deterministic golden fixtures, property/sensitivity tests (UK DST, zero/15/30-minute exceptions, 120/365/730-day horizons), real assured adapters/course structures, scorer/provenance contract tests, Home/Plan/REV cross-route browser with exact Start and mobile/tablet/desktop + keyboard/axe, bounded accepted-session reads, owner/RLS tests on any altered persistence, and production smoke. Link results and deliberate exclusions in the Assurance Coverage Register. Retain R1-11 Partial until genuine shipped-content proof, independent of this programme value verdict.
