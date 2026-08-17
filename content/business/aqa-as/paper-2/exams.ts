import { examSchema } from '../../../schema'

export const harbourHomeExam = examSchema.parse({
  id: 'harbour-home-1',
  title: 'Harbour Home Ltd',
  subtitle: 'Full original Paper 2 simulation',
  durationMinutes: 90,
  totalMarks: 80,
  caseHtml: `<p>Harbour Home Ltd (HH) is a UK private limited company selling modular home-office furniture online. It was founded six years ago by Maya and Ben, who each own 50% of the shares. Revenue has grown rapidly as hybrid working has become common, but management is now concerned that growth is creating operational and financial pressure.</p>
<p>HH manufactures desks and storage units in a rented factory. In 2025 it sold 18,000 units. The average selling price was £180, total variable costs were £1.89m and fixed costs were £720,000. In 2026 maximum annual capacity is 24,000 units and forecast output is 22,800 units. Customer reviews remain strong overall, but complaints about late delivery have doubled.</p>
<p>HH currently holds significant timber and component inventory because one key supplier has a long and unreliable lead time. The operations director proposes investing £500,000 in automated cutting equipment. She predicts this would increase capacity by 20%, reduce waste and lower variable cost per unit. Some experienced production employees fear the equipment will reduce job security. Labour turnover has already risen from 8% to 15%.</p>
<p>The marketing director wants to launch a premium range aimed at professional designers. Research suggests the segment values customisation and sustainable materials more than low prices. She proposes a high initial price and a relationship-marketing programme for repeat trade customers. Competitors are also entering the premium segment.</p>
<p>HH forecasts a temporary cash deficit if it buys the equipment immediately. A bank has offered a five-year loan. An investor has offered the full £500,000 in exchange for 20% of HH and a board seat. Maya prefers to retain control; Ben believes the investor’s e-commerce experience could accelerate growth.</p>
<p><strong>Industry data:</strong> the UK home-office furniture market index is 100 in 2024, 111 in 2025 and 123 in 2026. HH sales index is 100 in 2024, 119 in 2025 and 128 in 2026.</p>`,
  questions: [
    {
      id: 'hh-q1', marks: 3, topic: 'business', assessmentObjectives: { ao1: 1, ao2: 2, ao3: 0, ao4: 0 },
      prompt: 'Using the index data, calculate the percentage increase in the UK home-office furniture market between 2024 and 2026.',
      markingGuidance: ['Use the index change: (123 − 100) ÷ 100 × 100.','Correct answer: 23%.','Show the method and include %.'],
    },
    {
      id: 'hh-q2', marks: 3, topic: 'finance', assessmentObjectives: { ao1: 1, ao2: 2, ao3: 0, ao4: 0 },
      prompt: 'Using the 2025 data, calculate HH’s total contribution.',
      markingGuidance: ['Revenue = 18,000 × £180 = £3,240,000.','Total contribution = total revenue − total variable costs.','Correct answer: £1,350,000.'],
    },
    {
      id: 'hh-q3', marks: 4, topic: 'operations', assessmentObjectives: { ao1: 2, ao2: 2, ao3: 0, ao4: 0 },
      prompt: 'Explain one benefit to HH of operating at its forecast 2026 capacity utilisation.',
      markingGuidance: ['Capacity utilisation = 22,800 ÷ 24,000 × 100 = 95%.','Explain one contextual benefit such as spreading fixed costs across more output or making strong use of factory resources.','Apply to HH’s growth/cost position; do not claim high utilisation has no drawbacks.'],
    },
    {
      id: 'hh-q4', marks: 9, topic: 'operations', assessmentObjectives: { ao1: 3, ao2: 3, ao3: 3, ao4: 0 },
      prompt: 'Analyse the impact on HH of holding significant inventory.',
      markingGuidance: ['Develop at least one benefit and/or drawback with HH context.','Possible benefit: protects production from the unreliable supplier/long lead time, reducing lost output and late deliveries.','Possible drawback: cash is tied up, storage/waste risk rises and this matters because HH already forecasts a cash deficit.','Push the chain through to competitiveness, customer service, cash flow or profit.'],
    },
    {
      id: 'hh-q5', marks: 9, topic: 'marketing', assessmentObjectives: { ao1: 3, ao2: 3, ao3: 3, ao4: 0 },
      prompt: 'Analyse the impact on HH of using a high initial price for the premium range.',
      markingGuidance: ['Recognise price skimming/high initial pricing.','Use the designer segment’s stated preference for customisation/sustainable materials and potential willingness to pay.','Analyse revenue/margin/positioning benefits, but also competitor entry and volume risk.','A developed contextual chain matters more than listing advantages.'],
    },
    {
      id: 'hh-q6', marks: 16, topic: 'hr', assessmentObjectives: { ao1: 4, ao2: 2, ao3: 4, ao4: 6 },
      prompt: 'To what extent should HH use a more democratic approach when implementing the automation project?',
      markingGuidance: ['Analyse why employee involvement may improve information, acceptance, retention and implementation.','Use labour turnover rising 8% → 15% and job-security fears.','Counterbalance with speed, management expertise and the need to make a £500,000 investment decision.','Judgement should state what degree of consultation is appropriate and what it depends on.'],
    },
    {
      id: 'hh-q7', marks: 16, topic: 'finance', assessmentObjectives: { ao1: 4, ao2: 4, ao3: 4, ao4: 4 },
      prompt: 'Do you think HH should use the bank loan or the investor to finance the automation? Justify your answer.',
      markingGuidance: ['Analyse both options rather than giving isolated pros/cons.','Loan preserves Maya/Ben’s control but creates interest/repayment pressure while cash is forecast to be tight.','Investor reduces scheduled repayment pressure and brings e-commerce experience, but gives up 20% ownership and a board seat.','Make a contextual judgement based on cash resilience, control objectives, cost of finance and strategic value of expertise.'],
    },
    {
      id: 'hh-q8', marks: 20, topic: 'marketing', assessmentObjectives: { ao1: 4, ao2: 3, ao3: 5, ao4: 8 },
      prompt: '“For a growing business such as HH, operational performance is more important than marketing performance in determining long-term success.” To what extent do you agree?',
      markingGuidance: ['This is synoptic: draw together operations, marketing, finance and HR where relevant.','Operations case: 95% utilisation, late deliveries, supplier risk, automation, quality/capacity and cost.','Marketing case: premium positioning, new segment, competition, relationship marketing and willingness to pay.','Evaluate interdependence: strong marketing can create demand operations cannot fulfil; strong operations without demand cannot create sustainable revenue.','Finish with a clear, conditional judgement about which constraint is currently most important for HH and why long-term priorities may change.'],
    },
  ],
})

export const exams = [harbourHomeExam]
