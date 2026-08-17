---
title: "Personal Tutor Capability"
document_id: "revision-personal-study-coach-capability"
document_type: "domain-authority"
authority: "product"
status: "draft"
version: "0.2"
owner: "Founder"
effective_date: null
last_reviewed: "2026-08-17"
review_cadence: "quarterly"
content_review_status: "founder-review-required"
source_of_truth_for: ["personal tutor product capability"]
depends_on: ["Product UX Principles", "Tone of Voice Framework", "Security Standard"]
supersedes: null
---
# Personal Tutor Capability

## Decision sought

Approve a permanent, evidence-aware Personal Tutor as a flagship Revision capability, subject to the release gates in this document.

**Personal Tutor** is the capability name used in this draft. The final learner-facing product name remains open; candidates include **Revision Tutor** and **Study Coach**. “Bot” is not the intended finished positioning.

## Product promise

The Personal Tutor gives each learner an ongoing, syllabus-grounded tutoring conversation. It helps them decide what to study, understand difficult material, challenge explanations, practise actively and take the next useful action.

It combines:
- the learner’s selected subject, qualification, exam board and paper;
- approved versioned Revision content;
- the learner’s valid learning evidence;
- the current activity and recent study history; and
- clear uncertainty when the available evidence is incomplete.

It is not a general-purpose chatbot and must not present itself as a human teacher. It should nevertheless feel continuous and personal: the learner can question, challenge, revisit and deepen an explanation without an artificial per-session interruption.

## Intended learner outcome

After using the Study Coach, the learner should:
- understand the topic more clearly;
- have actively demonstrated or practised that understanding;
- know why the coach responded as it did;
- know what to do next; and
- retain control over whether to follow the recommendation.

A conversation that feels helpful but produces no learning or useful next action is not a successful coaching interaction.

## Core jobs

### Start a study session

On entry to the authenticated learner product, the coach may greet the learner and offer:
- **Guide me**
- **I’m stuck on something**
- **Continue where I left off**

The greeting must be lightweight and dismissible. It must not block access to the learner’s normal dashboard or create emotional pressure to engage.

### Continue an ongoing tutoring thread

The learner may continue discussing a topic for as long as the exchange remains useful and within fair-use controls. Revision must not expose a small turn counter or interrupt ordinary learning merely to protect fractions of a penny.

Between sessions, the Tutor may retain approved structured learning memory such as:
- current topic and next goal;
- concepts understood;
- misconceptions still unresolved;
- explanations or examples already tried;
- assistance received; and
- links to relevant evidence facts.

Structured tutoring memory is not mastery evidence and is not permission to retain full transcripts indefinitely.

### Explain and diagnose

When a learner says they do not understand a topic, the coach should:
1. acknowledge the difficulty without judgement;
2. establish what part is unclear where necessary;
3. explain in small, syllabus-relevant steps;
4. use an appropriate example;
5. check understanding through active recall or application;
6. correct misconceptions clearly;
7. connect the learning to assessment where relevant; and
8. offer a useful next action.

The coach should not default to long textbook-style answers.

### Guide from evidence

When invited to guide, the coach may use valid learning evidence to recommend a topic or activity. It must explain:
- what evidence informed the recommendation;
- how strong or incomplete that evidence is;
- why the proposed action is useful now; and
- what the learner is expected to improve.

Where there is insufficient evidence, it must say so and offer a short diagnostic activity rather than pretending to know the learner’s weakness.

### Support the current activity

The coach must be available from relevant learner journeys, including learning, recall, questions, tests, exam practice, results and progress.

Contextual help must respect the activity. During scored or exam-mode work, it must not reveal an answer in a way that invalidates the attempt. The learner may leave or end the scored attempt to receive full teaching support.

### Close the loop

A useful conversation should end with one or more appropriate actions such as:
- try a recall question;
- apply the idea to a case;
- review a linked concept;
- practise an exam question;
- continue the current activity; or
- stop for now.

The learner must always be able to ignore, change or end the recommendation.

## Behaviour principles

### Coach, do not perform

The default behaviour is to help the learner think. The coach may explain, scaffold, prompt, question, model a separate example and give feedback. It must not simply complete assessed work on the learner’s behalf.

### Grounded before fluent

Course and assessment claims must be grounded in the learner’s active, versioned Revision content pack and approved assessment guidance. General model knowledge must not silently override approved content.

If grounding is missing, conflicting or inadequate, the coach must narrow the claim, disclose uncertainty or decline to provide an authoritative course-specific answer.

### Evidence must be earned

Chat participation, message count, time spent and the coach’s own explanation are not proof of learner mastery.

Only a learner action that meets the learning-evidence rules may affect progress or readiness. Any evidence derived from a coaching interaction must preserve the learner action, assessed skill/topic, evaluation basis, result, provenance and relevant limitations.

### Personal, not manipulative

The coach may use the learner’s chosen name and relevant study context. It must not:
- claim feelings, consciousness or a human relationship;
- encourage dependency or exclusivity;
- shame inactivity, weakness or mistakes;
- use streak anxiety or fabricated urgency;
- diagnose wellbeing, learning disabilities or mental-health conditions; or
- substitute for a teacher, parent, safeguarding professional or emergency service.

### Transparent recommendations

The learner must be able to understand why a recommendation was made. Personalisation must not become invisible profiling.

## Experience requirements

- The permanent entry point must remain reachable without obscuring core work.
- Mobile, tablet and desktop experiences must provide equivalent core coaching capability.
- Conversation UI must support keyboard, touch, screen-reader navigation and reduced motion.
- The coach must preserve the learner’s place when opened contextually.
- A new conversation, memory/history controls and explanation of data use must be easy to find.
- Ordinary tutoring must not display a small per-session response allowance.
- The learner should be able to resume an approved structured tutoring thread across sessions.
- Responses should be concise by default and expandable through dialogue.
- The coach must use the active Tone of Voice and Product UX Principles.

## Safety, privacy and trust gates

The Study Coach must not be released to learners until approved authority defines:
- the lawful basis and purpose for processing conversation data;
- whether and how conversations are persisted;
- retention and deletion rules;
- learner and parent/guardian visibility where applicable;
- model/provider data handling and training exclusions;
- prohibited content and safeguarding escalation;
- abuse, self-harm and emergency-response boundaries;
- age-appropriate design requirements;
- human support and incident handling; and
- analytics that avoid unnecessary sensitive text capture.

Credentials and privileged model access must never be exposed in browser code. Learner context supplied to a model must be minimised to what is necessary for the current task.

## Quality and operational requirements

Before release, Revision must be able to:
- identify the content version and evidence context used for a response;
- evaluate groundedness, correctness, educational usefulness and answer leakage;
- test representative safe-completion and refusal cases;
- monitor availability, latency, model/provider errors and cost;
- apply per-user and system usage limits;
- disable the capability safely without disabling core revision;
- prevent prompt injection from crossing system boundaries; and
- investigate a reported response without logging unnecessary sensitive learner data.

## Initial release scope

The first release should be deliberately narrow:
- authenticated learners only;
- the current AQA AS Business Paper 2 content pack only;
- ongoing typed tutoring conversation;
- structured cross-session learning memory where approved;
- topic explanation and misconception diagnosis;
- short active checks;
- contextual help outside protected scored/exam conditions;
- evidence-informed **Guide me** recommendations;
- explicit provenance and uncertainty behaviour; and
- no unrestricted web browsing, voice, image generation or open-domain advice.

## Non-goals for the initial release

- replacing teachers or human support;
- completing homework or live assessments;
- unrestricted general chat;
- emotional companionship;
- autonomous changes to curriculum or learner records;
- parent surveillance;
- automatic readiness changes from conversation alone; or
- supporting every subject before the first module is assured.

## Access and commercial hypothesis

The current hypothesis, not yet approved pricing authority, is:
- Revision’s core activities and evidence-based guidance remain available without requiring unrestricted Tutor use;
- free learners receive enough Personal Tutor access to experience its value;
- a future premium entitlement may provide generous fair-use ongoing tutoring, structured memory and deeper personal guidance; and
- the product must not use deliberately frustrating limits to manufacture an upgrade.

Entitlements, price and acceptable unit economics require evidence from the Jamie pilot before approval.

## Success measures

Primary measures:
- improvement between pre-check and post-check on the same concept;
- completion of an appropriate next learning action;
- reduction in repeated misconceptions;
- recommendation acceptance followed by valid learning evidence;
- grounded-answer correctness and assessment-alignment pass rate; and
- learner-reported clarity.

Guardrail measures:
- unsupported or incorrect course claims;
- answer leakage into protected assessments;
- false evidence creation;
- unsafe or age-inappropriate responses;
- complaints, reports and privacy incidents;
- cost per successful coached learning outcome; and
- latency or failures that interrupt study.

Message count, conversation duration and daily usage must not be treated as evidence of educational success.

## Release sequence

1. Prototype the interaction against approved content using synthetic learner profiles.
2. Establish privacy, safeguarding and AI-use authority.
3. Build grounded topic explanation and active checks.
4. Add contextual help with assessment-mode restrictions.
5. Add evidence-informed daily guidance with transparent rationale.
6. Pilot with a small controlled learner group.
7. Expand subjects or modalities only after assurance evidence supports it.

## Open Founder decisions

Before implementation planning is approved:
1. Choose the final learner-facing name: **Revision Tutor**, **Study Coach** or another option.
2. Approve the exact structured-memory fields, retention and learner deletion controls.
3. Decide whether any raw transcript is retained beyond the active session and for how long.
4. Decide the parent/guardian visibility model for under-18 learners.
5. Decide whether the Tutor may discuss non-study matters at all or redirects immediately.
6. Define free sampling, premium entitlement and pricing only after pilot evidence.
7. Define the pilot operating budget and exceptional-use ceiling.
