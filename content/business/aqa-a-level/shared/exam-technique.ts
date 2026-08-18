import type { ExamTechniqueGuide } from '../../../schema'

export const examTechnique: ExamTechniqueGuide[] = [
  {
    id: 'calculate',
    title: 'Calculate — make the method visible',
    summary: 'Work out the value requested and show enough method for the calculation to be followed.',
    steps: ['Identify the required formula/relationship', 'Substitute the case data', 'Show the workings', 'Give the final answer with the correct unit or %'],
    tip: 'Check whether the question asks for a ratio, percentage, days, units or money. A correct number with the wrong unit can weaken an otherwise sound response.',
  },
  {
    id: 'describe',
    title: 'Describe — state the characteristics',
    summary: 'Use the data or information provided to set out the relevant characteristics or pattern without drifting into an unsupported explanation.',
    steps: ['Read the exact measure/axes', 'Identify the clearest trend or comparison', 'Use precise figures where useful', 'Add another distinct characteristic if the marks require it'],
    tip: 'For charts and data, distinguish what the evidence shows from why you think it happened.',
  },
  {
    id: 'explain',
    title: 'Explain — give the reason and consequence',
    summary: 'State a relevant factor and develop why or how it affects the business in the context given.',
    steps: ['State one relevant factor', 'Apply it to the business or situation', 'Explain the mechanism', 'Finish with the consequence for the decision/objective'],
    tip: 'Do not stop after naming a factor. AQA’s command-word guidance expects the point to be developed to address the question.',
  },
  {
    id: 'analyse',
    title: 'Analyse — build a logical chain',
    summary: 'Break the issue down and show how a factor leads to business consequences through a clear contextual chain.',
    steps: ['Make one relevant point', 'Use a specific case fact or data item', 'Explain why it changes the situation', 'Develop at least one further consequence', 'Link back to the question or objective'],
    tip: 'A long list is not analysis. Fewer developed chains usually show more analytical skill than many undeveloped assertions.',
  },
  {
    id: 'evaluate',
    title: 'Evaluate — judge from the evidence',
    summary: 'Compare the significance of competing arguments and finish with a supported judgement based on the evidence available.',
    steps: ['Analyse the strongest argument or implication', 'Analyse a counterargument, limitation or alternative', 'Compare significance using context, magnitude, probability or time', 'Reach an overall judgement', 'State what the judgement depends on'],
    tip: 'AQA’s guidance stresses counterarguments and circumstances. Evaluation is not a generic “however” paragraph; it changes the conclusion using the evidence.',
  },
  {
    id: 'justify',
    title: 'Justify — support a decision',
    summary: 'Build the case for a recommendation or conclusion while considering weaknesses and alternatives before choosing.',
    steps: ['Set the decision criterion', 'Analyse the strongest evidence for one option', 'Test it against the alternative or weakness', 'Use quantitative and qualitative evidence where relevant', 'Choose and support the option', 'Explain what could change your decision'],
    tip: 'A recommendation without comparison is assertion. Make it clear why your chosen option is better for this business now.',
  },
  {
    id: 'paper-1-essays',
    title: 'Paper 1 — 25-mark essay choices',
    summary: 'Paper 1 ends with two 25-mark essay sections, each requiring one answer chosen from two. The essay still needs business reasoning, not memorised model paragraphs.',
    steps: ['Read both options before choosing', 'Define the question’s decision or debate', 'Use relevant theory accurately', 'Develop arguments on both sides where the question requires judgement', 'Use realistic business context/examples without inventing facts as evidence', 'Finish with a clear conditional judgement'],
    tip: 'Choose the question you can analyse and evaluate best, not simply the topic with the most definitions you remember.',
  },
  {
    id: 'paper-2-data-response',
    title: 'Paper 2 — data response',
    summary: 'Paper 2 contains three compulsory data-response questions. Treat the stimulus as evidence to reason with, not decoration to quote.',
    steps: ['Read the question before mining the stimulus', 'Select the data that changes the argument', 'Calculate or compare accurately when useful', 'Explain the business mechanism behind the data', 'Use limitations/uncertainty in evaluation', 'Make case-specific judgements on longer responses'],
    tip: 'Application means the evidence changes your reasoning. Merely repeating a company name or number does not demonstrate why it matters.',
  },
  {
    id: 'paper-3-case-study',
    title: 'Paper 3 — integrated case study',
    summary: 'Paper 3 uses one compulsory case study and rewards the ability to connect functional and strategic areas across the full course.',
    steps: ['Build a quick picture of objectives, constraints and performance', 'Track repeated case evidence across the questions', 'Connect functional issues to strategy', 'Use ratios/calculations as evidence rather than endpoints', 'Prioritise the most significant factors', 'For the final judgement, explain why your priority beats the alternatives'],
    tip: 'AQA expects holistic understanding. Strong Paper 3 answers connect finance, operations, marketing, HR and strategy where the case genuinely supports the link.',
  },
]
