# AQA Psychology 7182 — Preliminary Source-First Coverage Map

**Date:** 2 October 2026
**Status:** Early prototype evidence, not final coverage assurance

This is the first coarse mapping of the accepted/open source corpus against the current AQA A-level Psychology 7182 topic structure. It is deliberately broad. The next pass should work at named requirement level rather than turning this early map into another large review exercise.

## Status meanings

- `STRONG_BASE` — accepted reusable sources already contain substantial relevant subject knowledge; expect targeted AQA-specific supplementation rather than rebuilding the topic.
- `PARTIAL` — useful reusable subject knowledge exists, but important named AQA requirements still need a targeted source/gap pass.
- `GAP_HEAVY` — current accepted corpus does not yet appear to provide enough of the AQA-specific topic; search targeted open sources before generating anything.

## Compulsory content

| AQA topic | Preliminary status | Evidence from accepted corpus / likely gap |
| --- | --- | --- |
| 1 Social influence | `STRONG_BASE` | BCcampus H5P Psychology directly covers Asch, conformity, normative/informational social influence, Milgram and situational obedience variation. Targeted gaps include exact AQA treatment of agentic state/legitimacy, authoritarian personality, resistance/locus of control and minority influence detail. |
| 2 Memory | `PARTIAL` | Broad memory architecture, forgetting and eyewitness-memory material exists. Exact AQA working-memory components, specified interference/cue treatment and cognitive-interview coverage require requirement-level mapping. |
| 3 Attachment | `STRONG_BASE` | Direct open-text coverage of Harlow, Bowlby, Ainsworth/Strange Situation and attachment types. Targeted gaps likely include Lorenz, van IJzendoorn, maternal deprivation, Romanian adoptees and exact early-attachment relationship requirements. |
| 4 Clinical Psychology and Mental Health | `STRONG_BASE` | Broad CC BY psychology/abnormal-psychology corpus covers definitions/disorders, depression, OCD, phobias and multiple treatment approaches. AQA-specific named explanatory/treatment models need targeted mapping. |
| 5 Approaches in Psychology | `STRONG_BASE` | Broad introductory texts cover behaviourist, cognitive, biological, psychodynamic and humanistic traditions plus learning/social-learning concepts. Exact named concepts/research and comparison requirements need a small reconciliation pass. |
| 6 Biopsychology | `STRONG_BASE` | Broad psychology/neuroscience material covers nervous system, neurons, synapses, neurotransmitters, endocrine/stress systems and brain structure/function. Exact AQA scanning methods, lateralisation/localisation and recovery/plasticity requirements need named-item confirmation. |
| 7 Research methods | `PARTIAL` | General research design, observation, survey, experimental method, reliability/validity and descriptive/statistical reasoning are available. The exact AQA list of scientific processes, report conventions and inferential-test choice/calculation rules needs a focused source pass. Learning Statistics with R is commercially reusable under CC BY-SA but ShareAlike implications make it less attractive for adapted learner prose. |
| 8 Issues and debates | `PARTIAL` | Underlying ideas such as nature/nurture, culture, bias, determinism, reductionism and research ethics appear across broad sources, but AQA packages them as a specific evaluative topic. Build from reusable subject facts plus targeted open sources rather than assuming an intro textbook maps cleanly. |

## Option 1 — one required by each learner/course configuration

| AQA topic | Preliminary status | Evidence from accepted corpus / likely gap |
| --- | --- | --- |
| 9 Relationships | `PARTIAL` | Broad open psychology covers attraction, similarity, self-disclosure and social exchange. AQA-specific matching/filter theory, equity, Rusbult investment model, Duck phases, online relationships and parasocial models require targeted supplementation. |
| 10 Gender | `PARTIAL` | Open material covers sex/gender concepts, gender identity and social influences; CC BY pages exist for Kohlberg-style gender development. Exact chromosome/hormone syndromes, Bem inventory, Martin/Halverson and gender incongruence requirements need targeted sourcing. |
| 11 Cognition and development | `STRONG_BASE` | Open texts directly cover Piaget, object permanence/conservation/egocentrism, Baillargeon-style infant cognition and theory of mind. Vygotsky/ZPD/scaffolding, Selman, Sally-Anne and mirror-neuron requirements need targeted confirmation/deepening. |

## Option 2 — one required by each learner/course configuration

| AQA topic | Preliminary status | Evidence from accepted corpus / likely gap |
| --- | --- | --- |
| 12 Schizophrenia | `STRONG_BASE` | CC BY psychology/abnormal-psychology texts cover symptoms, genetics/neural factors, dopamine and antipsychotic treatment. AQA-specific diagnosis issues, family/cognitive explanations, CBT/family therapy and diathesis-stress detail require targeted mapping. |
| 13 Eating behaviour | `PARTIAL` | Open H5P Psychology directly covers physiological hunger/satiety, hypothalamic control, leptin, obesity and anorexia. AQA requires additional ghrelin, evolutionary food preference, family systems, restraint/disinhibition/boundary model and named explanatory depth. |
| 14 Stress | `STRONG_BASE` | Open H5P Psychology directly covers general adaptation syndrome, HPA axis, cortisol, fight/flight, illness links, coping and social support. Exact AQA stress scales, personality types/hardiness, workplace stress, drug/SIT/biofeedback and gender coping need targeted sources. |

## Option 3 — one required by each learner/course configuration

| AQA topic | Preliminary status | Evidence from accepted corpus / likely gap |
| --- | --- | --- |
| 15 Aggression | `PARTIAL` | Broad social psychology covers aggression and some social/biological foundations. AQA-specific limbic/serotonin/testosterone/MAOA, ethology, evolutionary accounts, frustration-aggression, prisons and media mechanisms require targeted depth. |
| 16 Forensic Psychology | `GAP_HEAVY` | The broad intro corpus is not sufficient for AQA's offender profiling, criminal-personality/cognition, differential association, custody, behaviour modification, anger management and restorative justice requirements. Targeted CC BY research/open criminal-justice sources should be searched before any AI gap generation. |
| 17 Addiction | `PARTIAL` | Broad open psychology covers dependence, tolerance, withdrawal and substance-use/addiction foundations. AQA's nicotine/gambling mechanisms, cue reactivity, partial/variable reinforcement, cognitive bias, aversion/covert sensitisation and Prochaska model need targeted source discovery. |

## What this early map tells us

The source-first hypothesis remains plausible.

The broad commercially reusable corpus appears capable of supplying a substantial base across most of the compulsory course and several option topics. The likely work is **AQA-specific supplementation**, not creation of a Psychology Foundation from zero.

The correct next unit of work is therefore:

1. convert the AQA topic bullets into named requirements;
2. search the accepted corpus automatically/deterministically for each named requirement;
3. label each requirement `covered / partial / gap / uncertain`;
4. search targeted CC BY/public-domain sources only for `partial` and `gap` items; and
5. use AI generation only after source search has genuinely failed or where a small bridge/explanation must be independently authored from established facts.

Do not turn this prototype into a full Content Factory assurance run at this stage.
