# Source-preserved user-submitted LF-05 Stage 1 blind review — 25 November 2026

**Evidence status:** USER-SUBMITTED, BLIND QUESTION-ONLY; NOT full educational A3 PASS, not independent session/source-rights verification, not guided assessment, not A4 or release. The review below was supplied in a 44,959-byte `Pasted text.txt` attachment, SHA-256 `6e95b4b65ef4c8733ef6f88d12a2f9dffbc3aa8c9b785b958f6441929e60a0b9`. It claims ChatGPT GPT-6.2 reviewed the 11 blind batches outside authoring; that claim cannot be independently established from pasted prose alone. We preserve it without inventing session metadata or upgrading its verdicts.

**Reviewed exact source:** packet-index commit `5af3a7da290551cc3489a67763a9e3527b83a300`, SQL Git blobs `572840fc1c9e4dd0a0f07e1bccb387ee59b18d5b` and `e58ac284a8114ae26dbe7e9253729def5521912e` (both unchanged at upload), paired packet source blobs `8715ef0ba2bb10b167a86168763323a653a7812e` and `2ed2406698a681bd1036df950d9abbdbc6c565f6`. **Question-only tally:** 33/33 (Psychology 18, Business 15); 32 PASS, 1 MINOR `BUS-LF05-01-16`, zero MATERIAL or BLOCKING. Validity of guides remains unreviewed.

**Rights/provenance warning:** Report explicitly states it did not verify the Source Licence Register, formal reviewer context-isolation controls, or exact 2027 mark tariffs. No fresh publisher approval can be inferred. Source rights and review separation are pending.

---

# **LF-05 — Independent educational review**

**Stage 1: BLIND question assessment**\
Review date: 25 November 2026\
Reviewer: ChatGPT, GPT-6.2\
Scope: 33 original A-level Business and Psychology questions.

## **1. Review methodology**

I retrieved the [review packet index](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/README.md?utm_source=chatgpt.com) and all 11 BLIND batches from the specified immutable GitHub commit.

Each question is assessed independently against seven criteria:

- AQA specification alignment and topic accuracy.
- Examination paper and mark-style suitability.
- Accuracy of subject knowledge.
- Command words and clarity of assessment requirements.
- Numerical accuracy and sufficiency of supplied data.
- Ambiguity and potential unfairness to students.
- Legitimate alternative interpretations, arguments and conclusions.

**Independence declaration:** No GUIDED files, answer guides, previous question-level review findings or proposed corrections have been consulted. I have used the original questions, their supplied context and publicly accessible AQA subject-content references. No repository changes have been made.

The index itself contains administrative information about earlier review attempts. It does not establish any individual question's educational quality, and I have excluded that information from my assessment.

### **Specification baseline**

| Qualification               | Applicable specification                                                    |
| --------------------------- | --------------------------------------------------------------------------- |
| AQA A-level Psychology 7182 | Updated specification, first A-level assessment in summer 2027              |
| AQA A-level Business 7132   | Outgoing specification, applicable to students sitting examinations in 2027 |

This distinction matters because both qualifications are undergoing specification changes. AQA confirms these respective examination timelines.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA+2



Psychology's online specification uses section numbers beginning with 3, while the supplied packet uses section numbers beginning with 4. I have included the corresponding references where relevant rather than treating the numbering difference as a curriculum error.

### **Verdict definitions**

| Verdict  | Meaning                                                                                  |
| -------- | ---------------------------------------------------------------------------------------- |
| PASS     | Educationally sound; no mandatory question correction identified.                        |
| MINOR    | Limited wording, precision or metadata issue requiring correction.                       |
| MATERIAL | Substantive defect affecting educational accuracy or fair assessment.                    |
| BLOCKING | Fundamentally invalid, misleading, unanswerable or outside the applicable specification. |

A PASS at this stage applies exclusively to the original question. It does not validate its marking guide, model answer or suitability for publication.

## **2. Individual blind verdicts**

### **Batch 01 — Social influence, memory and research methods**

[Original BLIND batch 01](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-01-blind.md?utm_source=chatgpt.com)

**01 — PSY-LF05-01**

PASS

*Social support and locus of control — Paper 1, 16 marks*

**Source fit:** Correct. AQA 7182 §4.1.1 (online §3.1.1).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both explanations are explicitly within the curriculum. The question supports description and evaluation at an appropriate level of demand. Students should explain how social support reduces conformity or obedience pressures and how internal or external locus of control may influence resistance.

**Valid alternatives:** Asch's dissenting confederates, Milgram's disobedient peers, Holland's research, situational explanations, contradictory findings and limitations of personality-based explanations. Students should not be required to argue that internal locus of control invariably produces resistance.

**Correction:** None required.

**02 — PSY-LF05-02**

PASS

*Working-memory model and concurrent tasks — Paper 1, 16 marks*

**Source fit:** Correct. AQA 7182 §4.1.2 (online §3.1.2).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Concurrent task performance provides an appropriate way to examine the model's explanatory power. Students can explain specialised processing systems, attentional control and interference between tasks competing for limited resources.

**Valid alternatives:** Dual-task experiments, selective memory impairment, case-study evidence, limitations of the central executive and evidence concerning the episodic buffer. Students may legitimately concentrate their evaluation on the components most relevant to concurrent performance.

The model should not be presented as guaranteeing that any two tasks using different components can be completed without interference.

**Correction:** None required.

**03 — PSY-LF05-07**

PASS

*Design a memory-and-music investigation — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7182 §§4.2.3–4.2.3.1 (online §§3.2.3–3.2.3.1).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The scenario supplies an appropriate experimental design, participant group and independent variable. Students are expected to operationalise recall, standardise procedures and assess threats to validity.

An appropriate design could counterbalance both condition order and word-list allocation:

| Group           | First condition | Second condition |
| --------------- | --------------- | ---------------- |
| 10 participants | List A, music   | List B, silence  |
| 10 participants | List A, silence | List B, music    |
| 10 participants | List B, music   | List A, silence  |
| 10 participants | List B, silence | List A, music    |

This accounts for all 40 participants and avoids systematically confounding list identity with music.

**Valid alternatives:** Other properly balanced designs, pilot-testing word-list difficulty, standardising volume and musical material, controlling time of day, using filler tasks and standardising recall duration. Discussion of volunteer bias, demand characteristics, fatigue and ecological validity is appropriate.

The absence of predetermined controls is not a defect: proposing those controls is part of the assessment.

**Correction:** None required. The 16-mark allocation is suitable for extended training, rather than a confirmed official AQA research-design tariff.

### **Batch 02 — Marketing, operations and strategy**

[Original BLIND batch 02](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-02-blind.md?utm_source=chatgpt.com)

**04 — BUS-LF05-03-16**

PASS

*Mira Sports Drinks: product or price? — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.3.2–3.3.4.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The scenario creates a meaningful choice between product differentiation and price competition. The market research, falling sales volume and competitor activity support competing arguments.

**Calculation check:** The original selling price is missing, so a numerical price elasticity of demand cannot be established. Neither can the effect on total revenue or profit be determined from the supplied figures alone.

The question does not explicitly demand these calculations, so this is an acceptable limitation of the available evidence.

**Valid alternatives:** Premium positioning, price reductions, targeted discounts, a limited product trial or further market research. Students can question whether 80 urban athletes represent the wider market and whether stated interest translates into purchases.

**Correction:** None required. Do not require a numerical elasticity estimate or a definitive conclusion about revenue.

**05 — BUS-LF05-04-25**

PASS

*Lean production and competitiveness — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §3.4.3, with relevant links to §§3.4.4–3.4.5.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question provides sufficient scope for a broad evaluative essay. Students can analyse how reducing waste, inventory costs and inefficiency may improve competitiveness, while considering operational disruption and implementation costs.

**Valid alternatives:** Automation, innovation, workforce training, quality assurance, economies of scale, differentiation and improvements to supply-chain resilience.

A student could reasonably conclude that lean production is highly effective in one manufacturing environment but inappropriate as the principal strategy in another.

**Correction:** None required.

**06 — BUS-LF05-07-25**

PASS

*Quantitative versus qualitative strategic analysis — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §3.7, particularly §§3.7.2, 3.7.3 and 3.7.8.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The distinction between numerical evidence and qualitative strategic assessment is appropriate. Students have sufficient scope to evaluate reliability, comparability, forecasting uncertainty and information not adequately represented by numbers.

**Valid alternatives:** Financial ratios, investment appraisal, market data, core competencies, customer opinions, organisational culture, SWOT and competitive analysis.

SWOT and similar frameworks should not automatically be classified as exclusively qualitative, because they may incorporate numerical evidence.

A conclusion favouring an integrated approach is valid.

**Correction:** None required.

### **Batch 03 — Attachment, depression and psychological approaches**

[Original BLIND batch 03](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-03-blind.md?utm_source=chatgpt.com)

**07 — PSY-LF05-03**

PASS

*Bowlby's monotropic theory — Paper 1, 16 marks*

**Source fit:** Correct. AQA 7182 §4.1.3 (online §3.1.3).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Formation of attachment and its subsequent influence are legitimate aspects of the theory. Students can address an evolved attachment system, monotropy, the importance of early development and the internal working model.

**Valid alternatives:** Multiple attachment findings, temperament explanations, cultural variation, continuity of relationships, sensitive-period interpretations and methodological criticism of attachment research.

Students should not be required to claim that only mothers can form primary attachments or that early attachment irrevocably determines adult relationships.

**Correction:** None required.

**08 — PSY-LF05-04**

PASS

*Cognitive explanations and CBT for depression — Paper 1, 16 marks*

**Source fit:** Correct. AQA 7182 §4.1.4 (online §3.1.4).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The combination of cognitive explanations and associated treatment is coherent. Beck's account, Ellis's account and cognitive therapy techniques provide sufficient material for description, analysis and evaluation.

**Valid alternatives:** Evidence about cognitive vulnerability, reverse causation, biological influences, therapy effectiveness, individual differences, therapeutic relationships and behavioural components of CBT.

A strong answer may discuss limitations of the cognitive explanation while recognising that CBT can still be effective. Treatment effectiveness alone does not prove that the proposed explanation is causal.

**Correction:** None required.

**09 — PSY-LF05-05**

PASS

*Behaviourism and social learning theory — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7182 §4.2.1 (online §3.2.1).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Comparing learning approaches is appropriate. The question allows students to explore environmental learning, direct reinforcement, observation and the role of cognitive processes.

**Valid alternatives:** Pavlov, Skinner, Bandura, differences in scientific methodology, practical applications, determinism, reductionism and biological constraints on learning.

The approaches overlap rather than being mutually exclusive. Social learning theory recognises reinforcement but does not require direct reinforcement for learning to occur.

**Correction:** None required. The word “usefulness” is broad but sufficiently constrained by the acquisition-of-behaviour context.

### **Batch 04 — Biopsychology, debates and relationships**

[Original BLIND batch 04](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-04-blind.md?utm_source=chatgpt.com)

**10 — PSY-LF05-06**

PASS

*Methods of studying localisation — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7182 §4.2.2 (online §3.2.2).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** All three named methods are legitimate specification content. The focus on localisation gives students an appropriate basis for comparing their strengths and limitations.

**Valid alternatives:** Discussion of spatial and temporal resolution, indirect measures of neural activity, causal limitations, brain pathology, compensatory changes and converging evidence from multiple methods.

EEG has useful temporal resolution but more limited ability to identify precise anatomical sources. This limitation makes it an appropriate method to evaluate rather than an inappropriate inclusion.

**Correction:** None required. ERPs may be relevant supporting material but are not an additional compulsory method in this question.

**11 — PSY-LF05-08**

PASS

*Nature–nurture debate — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.1 (online §3.3.1).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The requirement to draw on other psychology topics aligns particularly well with the interdisciplinary expectations of Issues and Debates.

**Valid alternatives:** Attachment, aggression, schizophrenia, gender development, addiction, learning approaches, genetic vulnerability, environmental influences and gene–environment interaction.

Students should be free to select examples from topics they have actually studied, including compulsory topics. No particular optional topic needs to be compulsory for a valid answer.

**Correction:** None required.

**12 — PSY-LF05-09**

PASS

*Social exchange theory and investment model — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.2 (online §3.3.2).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both theories explain aspects of relationship maintenance and commitment. Students can distinguish perceived rewards, costs and alternatives from the investment model's broader explanation of why someone remains committed.

**Valid alternatives:** Comparison levels, investments, satisfaction, cultural variation, difficulties measuring rewards and costs, longitudinal evidence and explanations of commitment in unsatisfying relationships.

Equity theory may be used as a relevant comparison, but the question does not require its full description.

**Correction:** None required.

### **Batch 05 — Gender, development and schizophrenia**

[Original BLIND batch 05](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-05-blind.md?utm_source=chatgpt.com)

**13 — PSY-LF05-10**

PASS

*Cognitive explanations of gender development — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.3 (online §3.3.3).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both named theories remain within the revised curriculum. Their different accounts of when and how children acquire gender-related understanding offer an appropriate evaluative comparison.

**Valid alternatives:** Gender identity, stability, constancy, schema-driven attention and memory, developmental evidence, early gender-typed behaviour and cultural influences.

Critical discussion of assumptions about binary gender and the generalisability of historical research is legitimate where linked to the theories.

**Correction:** None required.

**14 — PSY-LF05-11**

PASS

*Piaget and Vygotsky — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.4 (online §3.3.4).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The comparison is academically coherent. Students can contrast individual construction of knowledge with the influence of social interaction and supported learning.

**Valid alternatives:** Assimilation, accommodation, equilibration, developmental stages, scaffolding, the zone of proximal development, collaborative learning, discovery learning and research questioning children's supposed limitations.

An integrated conclusion recognising individual development and social support is acceptable. Neither theory should be caricatured as completely excluding the other's influences.

**Correction:** None required.

**15 — PSY-LF05-12**

PASS

*Interactionist explanations and treatment of schizophrenia — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.5 (online §3.3.5).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question appropriately connects vulnerability–stress explanations with treatment incorporating biological and psychological approaches.

**Valid alternatives:** Genetic susceptibility, developmental vulnerability, environmental stressors, trauma, biological treatments combined with psychological support, research evidence and difficulties establishing causal relationships.

Students should not be restricted to an interpretation in which vulnerability is exclusively genetic. More contemporary accounts recognise wider forms of predisposition and environmental interaction.

Treatment effectiveness does not independently prove the diathesis–stress explanation.

**Correction:** None required.

### **Batch 06 — Eating behaviour, stress and aggression**

[Original BLIND batch 06](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-06-blind.md?utm_source=chatgpt.com)

**16 — PSY-LF05-13**

PASS

*Explanations of anorexia nervosa — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.6 (online §3.3.6).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both biological and psychological explanations are relevant. The question permits a comparison of evidence, limitations and interactions between different explanatory mechanisms.

**Valid alternatives:** Genetic and neural explanations, family systems theory, observational learning, reinforcement, social influences, maladaptive beliefs and cognitive distortions.

Students may question whether observed biological changes are causes or consequences of the condition. Family-based explanations should be evaluated rather than presented as establishing parental blame.

**Correction:** None required. A 16-mark answer should permit selective depth across both categories rather than requiring exhaustive coverage of every specified explanation.

**17 — PSY-LF05-14**

PASS

*Stress inoculation therapy and biofeedback — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.7 (online §3.3.7).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both interventions are explicitly relevant. Students can describe cognitive coping preparation and the use of physiological feedback to develop self-regulation.

**Valid alternatives:** Effectiveness, maintenance of benefits, accessibility, equipment requirements, individual differences, motivation and comparison with other stress-management approaches.

Students may distinguish between managing stress responses and removing the original stressor. Both are legitimate evaluative considerations.

**Correction:** None required.

**18 — PSY-LF05-15**

PASS

*Frustration–aggression and social learning — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.8 (online §3.3.8).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** Both approaches provide valid explanations of aggression and allow comparison between responses to frustration and acquired behaviour.

**Valid alternatives:** Revised frustration–aggression accounts, displacement, observational learning, modelling, vicarious reinforcement, experimental evidence and biological or situational moderators.

Students can challenge the original deterministic proposition that frustration necessarily produces aggression. They may also distinguish laboratory aggression measures from real-world harmful behaviour.

**Correction:** None required.

### **Batch 07 — Forensic psychology, addiction and finance**

[Original BLIND batch 07](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-07-blind.md?utm_source=chatgpt.com)

**19 — PSY-LF05-16**

PASS

*Comparing offender profiling approaches — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.9 (online §3.3.9).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The terminology is consistent with the updated specification. The comparison provides scope to examine classifications of offenders, empirical pattern analysis and the usefulness of profiling in investigations.

**Valid alternatives:** Investigative psychology, geographical profiling, methodological weaknesses in typologies, statistical evidence, consistency of classification and limitations of predicting individual characteristics.

Students may argue that different approaches are useful for different types of investigation. Profiling should not be represented as independently establishing guilt.

**Correction:** None required.

**20 — PSY-LF05-17**

PASS

*Learning and cognitive explanations of gambling addiction — Paper 3, 16 marks*

**Source fit:** Correct. AQA 7182 §4.3.10 (online §3.3.10).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question correctly combines reinforcement-based explanations with cognitive accounts. Students can examine persistence despite losses and biased interpretations of outcomes.

**Valid alternatives:** Intermittent reinforcement, conditioned cues, negative reinforcement, illusion of control, gambler's fallacy, cognitive distortions and limitations of explanations considered independently.

Students should be able to argue that learning processes and cognitive biases interact.

**Correction:** None required.

**21 — BUS-LF05-01-16**

MINOR

*Marshbrook Bakery: cash flow versus profit — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.1.1, 3.5.1, 3.5.3–3.5.4.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA+1



**Reasoning:** The central question is sound. The figures support discussion of profitability, liquidity, borrowing and expansion risk.

**Calculation check:**

| Measure                                       | Correct result |
| --------------------------------------------- | -------------- |
| Revenue less total costs                      | £60,000        |
| Profit as a proportion of revenue             | 3.33%          |
| Proposed borrowing relative to available cash | 4.44 times     |
| Proposed borrowing relative to stated profit  | 6.67 times     |

The profit figure cannot automatically be classified as operating profit or post-tax profit. The cash balance is not itself a measure of cash flow.

**Identified defect:** The statement that managers want to borrow while owners “prefer to retain profits” creates an imprecise contrast. A business can simultaneously retain profits and borrow money. The wording does not establish whether owners want slower growth, greater cash reserves or internally financed expansion.

This is a limited scenario-quality issue rather than an invalid assessment.

**Valid alternatives:** Prioritise liquidity, prioritise long-term profitability, postpone expansion, expand incrementally or use a combination of internally generated funds and borrowing. Competitive pressure may justify expansion despite short-term financial risk.

**Recommended correction:** Replace the ambiguous owner preference with:

“Several owners favour a slower expansion funded from internally generated resources rather than substantial new borrowing.”

The central question can remain unchanged.

### **Batch 08 — Operations and financial management**

[Original BLIND batch 08](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-08-blind.md?utm_source=chatgpt.com)

**22 — BUS-LF05-04-16**

PASS

*Pine Components: quality versus capacity — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.4.2–3.4.5.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The supplied information supports both proposed operational priorities. High utilisation and late deliveries indicate operational pressure, while rework may consume capacity and contribute to delays.

**Calculation check:** At 96% capacity utilisation, nominal unused capacity is 4% of maximum capacity. The rework and late-delivery percentages have different denominators and must not simply be added or subtracted.

**Valid alternatives:** Improve quality to release effective capacity, invest in new machinery, use outsourcing or temporary resources, improve scheduling or combine interventions.

Students can reasonably challenge the assumption that quality and capacity improvements must be separate decisions.

**Correction:** None required.

**23 — BUS-LF05-05-16**

PASS

*Harbour Furniture: long-term borrowing — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.5.2–3.5.4 and 3.7.2.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA+1



**Reasoning:** The question provides a useful tension between operating profitability and short-term liquidity. Seasonal orders and variable borrowing costs strengthen the evaluation.

**Calculation check:**

| Measure                 | Working           | Result    |
| ----------------------- | ----------------- | --------- |
| Operating profit margin | £480k ÷ £6m × 100 | 8%        |
| Current ratio           | £700k ÷ £800k     | 0.875:1   |
| Net working capital     | £700k − £800k     | −£100,000 |

The current ratio may reasonably be rounded to 0.88:1 or 0.9:1, with appropriate precision.

Loan repayments, interest coverage and gearing cannot be calculated from the available information.

**Valid alternatives:** Accept the loan subject to cash-flow forecasts and affordable repayments, negotiate fixed interest, use equity finance, phase the investment or combine different sources of finance.

A current ratio below one indicates potential liquidity pressure but does not independently establish insolvency.

**Correction:** None required.

**24 — BUS-LF05-05-25**

PASS

*Cash flow versus profitability during rapid growth — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §§3.5.1–3.5.4, with links to §3.9.1.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA+1



**Reasoning:** Rapid growth provides a coherent context for analysing the difference between accounting profit and cash availability, including the risk of overtrading.

**Valid alternatives:** Managing working capital, borrowing, controlling costs, improving margins, renegotiating payment terms, limiting growth or using different priorities at different stages.

Students may reasonably argue that short-term liquidity is the immediate survival priority while sustainable profitability determines longer-term viability.

**Correction:** None required.

### **Batch 09 — Human resources and strategic investment**

[Original BLIND batch 09](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-09-blind.md?utm_source=chatgpt.com)

**25 — BUS-LF05-06-16**

PASS

*Orchid Care Services: training expenditure — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.6.2–3.6.4.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question provides credible alternative causes of poor performance. Training may improve competence, but inconsistent rotas and limited progression suggest wider motivation and retention problems.

**Calculation check:**

- Customer satisfaction decreased by **9 percentage points**, equivalent to approximately 10.47% relative to its previous level.
- Assuming 180 represents average annual employment, 32% turnover implies approximately 58 departures.
- Assuming every departure requires one replacement recruit, indicative replacement training expenditure is approximately £69,000–£70,000.

The workforce average and recruitment assumptions are not confirmed. Consequently, the precise number of departures or annual training expenditure cannot be established.

**Valid alternatives:** Greater training expenditure, targeted training, improved workforce planning, more predictable rotas, career development or improved financial and non-financial incentives.

The question remains answerable without estimating training expenditure.

**Correction:** None required. If a future calculation task requires an exact number of departures, additional data would be necessary.

**26 — BUS-LF05-06-25**

PASS

*Financial reward and employee motivation — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §3.6.4.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** This is a suitable broad evaluative question. The service-business context gives students scope to explore customer interactions, quality and the difficulties of measuring individual performance.

**Valid alternatives:** Salary increases, commission, performance-related pay, empowerment, flexible working, team working, recognition and job enrichment.

Taylor, Maslow and Herzberg are relevant theoretical perspectives, but the question does not require all three to be included.

Students may conclude that financial rewards work particularly well under some employment conditions while non-financial factors dominate under others.

**Correction:** None required.

**27 — BUS-LF05-07-16**

PASS

*Kelton Mobility: financial indicators and overseas investment — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.7.2–3.7.3 and 3.7.8.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question appropriately tests whether financial information is sufficient to justify a strategic investment when important uncertainties remain unresolved.

**Calculation check:**

| Measure                 | Working              | Result    |
| ----------------------- | -------------------- | --------- |
| Operating profit margin | £2m ÷ £25m × 100     | 8%        |
| ROCE                    | £2m ÷ £16m × 100     | 12.5%     |
| Gearing                 | £9m ÷ £16m × 100     | 56.25%    |
| Stated NPV              | Supplied in scenario | +£900,000 |

The gearing calculation is consistent with the AQA Business formula.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://filestore.aqa.org.uk\&sz=32)

filestore.aqa.org.uk



The positive NPV supports investment under the underlying forecasting assumptions. However, the discount rate, cash-flow projections and initial investment cost are not supplied, so the NPV cannot be independently recalculated.

**Valid alternatives:** Approve, defer pending supplier negotiations, perform sensitivity analysis, phase the investment or reject it because of combined financial and operational risks.

Students should distinguish current business-wide financial performance from the expected performance of the proposed project.

**Correction:** None required.

### **Batch 10 — Strategic direction and growth**

[Original BLIND batch 10](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-10-blind.md?utm_source=chatgpt.com)

**28 — BUS-LF05-08-16**

PASS

*Nova Homecare: market development versus product development — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §3.8.1.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The proposed strategies are correctly distinguished. Existing services offered in new geographical markets represent market development, while a new product for existing customers represents product development.

**Calculation check:**

| Measure                                                 | Result     |
| ------------------------------------------------------- | ---------- |
| Difference in investment costs                          | £700,000   |
| Product development cost relative to market development | 2.75 times |

The figures cannot establish which option provides the better investment return because expected revenues and future cash flows are absent.

**Valid alternatives:** Geographic expansion, product development, partnership-led innovation, piloting the subscription product or sequential investment in both strategies.

A student may recognise that limited digital expertise creates risk without treating that limitation as insurmountable.

**Correction:** None required.

**29 — BUS-LF05-08-25**

PASS

*Differentiation versus low cost — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §3.8.2.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question correctly reflects competing approaches to strategic positioning and provides sufficient room for sustained evaluation.

**Valid alternatives:** Brand differentiation, innovation, customer experience, economies of scale, cost leadership, niche focus and circumstances in which elements of different approaches can coexist.

Low cost must not automatically be equated with low selling prices. A business with a cost advantage may choose to preserve higher margins rather than reduce prices.

Students can justify different strategies according to customer demand, competitive conditions and business capabilities.

**Correction:** None required.

**30 — BUS-LF05-09-16**

PASS

*Briar Logistics: acquisition versus organic growth — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §3.9.1.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The strategic alternatives are clearly distinguishable. The acquisition offers immediate access to drivers and existing operations, while organic expansion may reduce integration difficulties.

**Calculation check:**

| Measure                                                | Result    |
| ------------------------------------------------------ | --------- |
| Additional acquisition expenditure                     | £3m       |
| Acquisition cost relative to organic expansion         | 1.6 times |
| Acquisition cost premium relative to organic expansion | 60%       |

These are investment-cost comparisons, not profitability or return calculations.

**Valid alternatives:** Acquisition to support rapid expansion, organic growth to retain control, a partnership, phased expansion or an acquisition conditional on contract due diligence and IT integration planning.

The acquisition cannot be assumed to guarantee achievement of a national network within 18 months.

**Correction:** None required.

### **Batch 11 — Strategic change and applied memory**

[Original BLIND batch 11](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-11-blind.md?utm_source=chatgpt.com)

**31 — BUS-LF05-09-25**

PASS

*External growth and rapid expansion — Paper 1, 25 marks*

**Source fit:** Correct. AQA 7132 §3.9.1.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The question allows students to assess the speed and scale advantages of external growth against integration costs, finance requirements and organisational disruption.

**Valid alternatives:** Mergers, takeovers, organic expansion, joint ventures, franchising and other collaborative growth arrangements where relevant.

Students may question whether rapid expansion is itself desirable, provided their conclusion remains focused on the stated business objective.

**Correction:** None required.

**32 — BUS-LF05-10-16**

PASS

*Valen Foods: employee consultation and digital change — Paper 2, 16 marks*

**Source fit:** Correct. AQA 7132 §§3.10.1 and 3.10.3.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA



**Reasoning:** The scenario successfully creates competing pressures. The pilot demonstrates potential operational benefits, while staff concerns, management resistance and supplier readiness introduce implementation risks.

**Calculation check:** An 18% reduction in stockouts does not establish the absolute number of stockouts avoided. The 46% figure applies to surveyed staff, not necessarily the entire workforce.

Neither limitation prevents a meaningful evaluation.

**Valid alternatives:** Slower implementation, continued implementation with additional communication, phased warehouse deployment, training, employee participation and targeted engagement with resistant managers.

Lewin's force field analysis and Kotter and Schlesinger's approaches to managing resistance offer appropriate analytical frameworks. Other well-supported approaches are also legitimate.

**Correction:** None required.

**33 — PSY-LF05-02-S1**

PASS

*Working-memory model: contextual investigation — Paper 1, 16 marks*

**Source fit:** Correct. AQA 7182 §4.1.2 (online §3.1.2), with relevant research-methods application.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.aqa.org.uk\&sz=32)

AQA+1



**Reasoning:** This is a particularly useful applied question because it requires students to distinguish between theoretical explanation and the strength of the evidence supporting that explanation.

The phonological processing demands of the spoken-digit task and spoken-word task provide a plausible explanation for the lower accuracy in Task B. The visual tracking task has a different primary processing demand.

**Digit recall accuracy**

Task A — Visual tracking

**76%**

Task B — Spoken words

**49%**

Difference in accuracy

## **27 pp**

Invented educational data supplied in the original question.

**Calculation check:** The difference is 27 percentage points, or approximately a 35.5% relative reduction compared with Task A.

**Valid alternatives:** Students may legitimately argue that the results are consistent with the working-memory model, but do not conclusively establish it, because:

- Task A was always completed first, creating possible order effects.
- The tasks were not matched for difficulty.
- Attentional demands may differ between conditions.
- Repeating spoken words could interfere with subvocal rehearsal.
- Participant-level data and measures of variability are unavailable.
- Statistical significance cannot be established from the two means alone.

The scenario's methodological weaknesses are intentional opportunities for evaluation, not defects in the question.

**Correction:** None required. A conclusion that the evidence is insufficient to isolate the working-memory mechanism should receive appropriate credit.

## **3. Final blind-review register**

Stage 1 completion

# **33 / 33**

Complete

Pass

# **32**

Minor

# **1**

Material

# **0**

Blocking

# **0**

| Question ID    | Verdict |
| -------------- | ------- |
| PSY-LF05-01    | PASS    |
| PSY-LF05-02    | PASS    |
| PSY-LF05-07    | PASS    |
| BUS-LF05-03-16 | PASS    |
| BUS-LF05-04-25 | PASS    |
| BUS-LF05-07-25 | PASS    |
| PSY-LF05-03    | PASS    |
| PSY-LF05-04    | PASS    |
| PSY-LF05-05    | PASS    |
| PSY-LF05-06    | PASS    |
| PSY-LF05-08    | PASS    |
| PSY-LF05-09    | PASS    |
| PSY-LF05-10    | PASS    |
| PSY-LF05-11    | PASS    |
| PSY-LF05-12    | PASS    |
| PSY-LF05-13    | PASS    |
| PSY-LF05-14    | PASS    |
| PSY-LF05-15    | PASS    |
| PSY-LF05-16    | PASS    |
| PSY-LF05-17    | PASS    |
| BUS-LF05-01-16 | MINOR   |
| BUS-LF05-04-16 | PASS    |
| BUS-LF05-05-16 | PASS    |
| BUS-LF05-05-25 | PASS    |
| BUS-LF05-06-16 | PASS    |
| BUS-LF05-06-25 | PASS    |
| BUS-LF05-07-16 | PASS    |
| BUS-LF05-08-16 | PASS    |
| BUS-LF05-08-25 | PASS    |
| BUS-LF05-09-16 | PASS    |
| BUS-LF05-09-25 | PASS    |
| BUS-LF05-10-16 | PASS    |
| PSY-LF05-02-S1 | PASS    |

## **4. Independent reviewer conclusion**

[Certain] All 33 questions have relevant subject-content alignment with the applicable AQA qualifications. No material specification or question-level calculation errors were identified.

[Likely] The questions are educationally appropriate as original extended-writing practice materials. One Business scenario requires a minor clarification.

The distinction between a legitimate assessment challenge and a defective question is important. Several questions deliberately provide incomplete financial evidence or methodologically imperfect investigations. These are valid opportunities for students to demonstrate evaluation, rather than problems that necessarily require correction.

The principal remaining limitation is that question validity does not establish marking validity. A sound question could still be accompanied by an inaccurate calculation, restrictive marking criteria, an unjustified model conclusion or omitted alternative answers.

## **5. Audit closure and limitations**

| Control                                                  | Status |
| -------------------------------------------------------- | ------ |
| BLIND batches reviewed                                   | 11/11  |
| Unique question verdicts recorded                        | 33/33  |
| Psychology questions reviewed                            | 18/18  |
| Business questions reviewed                              | 15/15  |
| Official AQA subject-content references consulted        | Yes    |
| GUIDED files opened                                      | No     |
| Previous question-level verdicts consulted               | No     |
| Repository modified                                      | No     |
| Official AQA accreditation of original questions claimed | No     |
| Publication authorised                                   | No     |

**Review provenance:** The verdicts are recorded in this conversation, against commit `5af3a7da290551cc3489a67763a9e3527b83a300`. I have not independently verified the project's Source Licence Register, formal context-isolation controls or exact 2027 marking tariffs. I consulted public AQA alignment information rather than ingesting the full specification documents.

These are independent AI educational-review judgments, not certification by an authorised AQA examiner.

**Stage 1 BLIND review complete — 33/33 verdicts recorded.**

Stopped at the requested boundary.