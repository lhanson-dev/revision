# Privacy and Student Data Principles

**Status:** Draft authority candidate — v0.3  
**Purpose:** Define the product-level rules Revision should follow when collecting, using, sharing, retaining and allowing students to control personal data.

## Core principle

Revision should collect and use student data only where doing so creates a clear benefit for the student, supports safe and reliable operation, or meets a genuine legal or operational need.

Student data should be private by default, understandable in purpose and controllable where appropriate.

## 1. Data minimisation

Revision should collect only the information needed to:

- provide and operate the service;
- personalise learning and recommendations;
- support safety and safeguarding;
- maintain reliability and security;
- understand product performance at an appropriate level; or
- meet genuine legal or operational requirements.

The fact that data could be collected does not mean it should be collected.

New data collection should have a clear purpose before implementation.

FI-002 must not introduce learner date-of-birth collection solely because a subscription is purchased. The approved commercial model uses a separate adult billing-customer rule; any later learner-age data collection would require its own clear purpose and governance.

## 2. Tutor conversations are private student data

AI tutor conversations should be treated as private student data.

They should not automatically be visible to:

- parents or guardians;
- teachers;
- other students; or
- unrelated third parties.

Any future sharing model must be deliberately designed, clearly explained and governed by appropriate consent, safeguarding and legal rules.

## 3. Student data must not be used for general external model training by default

Identifiable student conversations, answers, assessment data or other personal information should not be used by default to train external or general-purpose AI models.

Where third-party AI services process student data to provide functionality, Revision should configure and contract for data handling that is consistent with this principle wherever reasonably possible.

Revision may later use suitably anonymised, aggregated or otherwise appropriately protected information to improve its own product, but such use must be deliberately governed rather than assumed.

## 4. Personalisation is a legitimate core use

Revision may use relevant student data within the product to make the service more useful and personalised.

This may include:

- subjects, qualifications, exam boards and papers;
- revision activity;
- specification coverage;
- test and assessment results;
- strengths and weaknesses;
- exam-practice evidence;
- preferences relevant to learning; and
- relevant tutor interactions.

Personalisation should serve the student rather than create unnecessary profiling or complexity.

## 5. Analytics should be proportionate

Revision may collect normal product analytics needed to understand whether the service is working effectively.

This may include information such as:

- feature usage;
- completion rates;
- technical errors;
- performance and reliability;
- aggregate engagement patterns; and
- journey drop-off.

Analytics should not collect sensitive student content simply because a tool makes that technically easy.

Collection should be proportionate to the question being answered.

## 6. Students should have meaningful control

Students should ultimately be able to view and correct important account and profile information held about them.

Revision should also provide appropriate controls for communication preferences, including where relevant:

- service notifications;
- email preferences;
- newsletter subscriptions;
- marketing communications; and
- other optional communication channels.

Where communications are optional, changing a preference later should be straightforward.

Revision should also provide a practical route for students to request or perform:

- data export; and
- account/data deletion,

subject to any genuinely necessary legal, safety or operational retention requirements.

Where a linked supporter relationship exists, the learner must also be able to understand who is linked and what that supporter can see. Exact unlinking rights and exceptional safeguarding/legal cases require the dedicated relationship design before production implementation.

## 7. Retention must have a defined reason

Identifiable student data should be retained only for as long as there is a defined reason to keep it.

Retention periods should be deliberately set for different data classes after legal, safety and operational review rather than using one arbitrary period for everything.

When there is no longer a valid reason to retain identifiable data, it should be deleted or appropriately anonymised.

Commercial records that a payer must retain or access for legitimate billing/legal purposes must remain separated from ongoing permission to access learner educational data.

## 8. Parent, payer and teacher access must remain bounded

Parent and teacher functionality must not create an automatic entitlement to detailed student data.

FI-002 additionally distinguishes the commercial **billing customer / payer** role from the data-permission **linked supporter** role.

Payment status and supporter permission must not be treated as interchangeable:

- a payer may fund a learner's subscription without automatically receiving learner progress information;
- a supporter may receive only the separately approved parent-visible information while the supporter relationship and relevant entitlement are valid; and
- ending a payer relationship, supporter relationship or relevant entitlement must update the corresponding access without deleting legitimate learner work or evidence.

High-level progress and support signals may be appropriate where separately governed, but detailed tutor conversations, individual answers and private learning interactions remain private by default.

For FI-002, where a valid linked supporter relationship and relevant Paid/Premium entitlement exist, Revision may provide a governed parent/supporter dashboard using an explicitly approved parent-visible data set. The commercial tier may change the quality of interpretation, synthesis, trends and support guidance available to the supporter, but must not be used to sell progressively deeper access to private learner information.

The parent-visible boundary for FI-002 must therefore exclude by default:

- REV conversation transcripts and private tutor interactions;
- individual learner answers and raw submitted work;
- private learner notes;
- detailed click-by-click or timestamp-by-timestamp activity surveillance;
- safeguarding-sensitive information; and
- other learner data not necessary for the approved reassurance/support purpose.

A learner must be told clearly and in age-appropriate language:

- who is linked as a supporter;
- what information that supporter can see; and
- that payment does not transfer ownership of the learner's educational data.

This information must remain available after the original linking moment.

A parent/supporter relationship must not be created by unrestricted account search that reveals whether a named child or email address has a Revision account. FI-002 should use governed invitation/linking flows, with exact verification and recovery mechanics designed before implementation.

Any future sharing beyond the approved FI-002 parent/supporter boundary must define:

- what is shared;
- with whom;
- why;
- under what authority or consent model;
- how the student is informed; and
- how safeguarding exceptions are handled.

Exact relationship verification, consent/authority, unlinking safeguards, payer age-assurance and other legal mechanisms require current external validation before production implementation.

## 9. Explain data use in plain language

Where Revision asks for personal information, the student should be able to understand why it is being requested and how it will be used.

Privacy explanations should be concise, age-appropriate and available at the point they matter rather than hidden only inside long policy text.

Linked-supporter visibility must be explained at the point of linking and remain discoverable later.

## 10. Privacy choices must not rely on dark patterns

Revision should not manipulate students into sharing more data or accepting optional communications.

Optional choices should be presented clearly and fairly, without confusing wording, pre-selected assumptions or unnecessary friction when changing a choice later.

A commercial upgrade must not be designed so that agreeing to broader parent/supporter data sharing becomes a hidden or coerced condition of receiving the paid learner entitlement.

## 11. Security and privacy are product requirements

Privacy policy is not enough without technical controls.

Implementation must support these principles through appropriate security, access control, logging, deletion, export, configuration and supplier-management controls.

FI-002 implementation must enforce payer, learner and linked-supporter permissions at the relevant server/data trust boundaries rather than relying on UI visibility alone.

Detailed technical requirements belong in the relevant engineering and operational standards.

## 12. Legal compliance must be independently verified

These principles define Revision's intended product stance. They do not by themselves establish compliance with UK GDPR, the Data Protection Act, the Age Appropriate Design Code or other applicable law and regulatory guidance.

Specific legal requirements, consent models, age-related obligations, relationship-verification requirements, retention rules and data-subject rights must be checked against current authoritative sources and professional advice where appropriate before production reliance.

The FI-002 18+ billing-customer rule is a product-policy choice for the initial UK MVP. It must not be represented as a legal conclusion about the validity of every contract entered into by a younger person in every UK jurisdiction or circumstance.

## Decision test

When deciding whether to collect, use, retain or share student data, ask:

1. Is there a clear reason Revision needs this data?
2. Does using it materially help the student, safety or service operation?
3. Could the same outcome be achieved with less or less-sensitive data?
4. Would the student reasonably understand and expect this use?
5. Is access restricted to those who genuinely need it?
6. Can the student control or correct it where appropriate?
7. Is there a defined reason and period for retaining it?
8. Would we be comfortable explaining the practice plainly to the student and their parent or guardian?
9. Are we accidentally treating payment as permission to see learner data?
