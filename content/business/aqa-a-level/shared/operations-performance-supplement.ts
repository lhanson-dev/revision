import { learnCourseSchema } from '../../../learn-schema'

/**
 * #698 AQA Business 7132 v2.0, §3.4.2 (printed p18).
 * Original Revision teaching and scenarios; official PDF is REFERENCE_ONLY.
 * Learn worked examples and quick checks are unscored, not evidence of mastery.
 */
export const operationsPerformanceSupplement = learnCourseSchema.parse({
  chapters: [{
    id: 'operations',
    topicId: 'operations',
    title: '4. Operational Management',
    groups: [{
      id: 'operational-measures-method',
      title: 'Calculate and interpret operational performance',
      pages: [{
        id: 'operations-four-performance-measures',
        topicId: 'operations',
        sourceSectionIds: ['operations-performance', 'aqa-7132-3-4-2'],
        title: 'Four operational measures: calculate, then decide',
        orientation: 'Keep the four denominators and time periods separate. Use the result to support a business judgement, not replace it.',
        blocks: [
          {
            type: 'key-idea',
            definitions: [
              { term: 'Capacity', definition: 'Maximum possible output in a defined time period under stated operating conditions. Find it from available resources and realistic output rates when given.' },
              { term: 'Capacity utilisation', definition: 'Actual output divided by maximum possible output for the same period, multiplied by 100.' },
              { term: 'Labour productivity', definition: 'Output in a stated period divided by the number of employees used to produce it. The result has output-per-worker units for that period.' },
              { term: 'Unit cost (average cost)', definition: 'Total production costs for the period divided by units produced in that same period.' },
            ],
          },
          {
            type: 'explanation',
            heading: 'Start with the unit, the period and the denominator',
            paragraphs: [
              'Before calculating, decide which measure the question asks for. Capacity is possible output; utilisation compares actual and possible output; labour productivity compares output with employees; unit cost compares total production cost with units produced. These are four different questions, not interchangeable labels.',
              'Keep output and capacity in the same unit and time period. State labour productivity as units per employee per named period, and average cost as pounds per unit. For capacity, multiply a practical rate by the available hours, workers or stations only when the scenario establishes that each can operate at that rate; do not invent uninterrupted operation.',
            ],
          },
          {
            type: 'worked-example',
            title: 'Derive capacity and utilisation separately',
            setup: 'A repair team has 4 staffed service bays. Each bay can complete 6 standard repairs per day, and the team operates for 5 days each week. During one week the team completes 96 repairs. Assume every bay has the stated usable rate throughout those five days.',
            task: 'Calculate weekly capacity and then weekly capacity utilisation.',
            steps: [
              { label: 'Identify possible throughput', value: 'Each of the 4 bays can complete 6 repairs per day for 5 days.' },
              { label: 'Calculate capacity', value: 'Weekly capacity = 4 × 6 × 5 = 120 repairs per week.' },
              { label: 'Calculate utilisation', value: 'Capacity utilisation = actual weekly output ÷ weekly capacity × 100 = 96 ÷ 120 × 100 = 80%.' },
              { label: 'Interpret with restraint', value: 'The team used 80% of its stated capacity. This leaves apparent headroom for busy periods, but says nothing by itself about whether all appointments were profitable or completed to a good quality standard.' },
            ],
            conclusion: '120 repairs per week is capacity; 80% is utilisation. Substituting one answer for the other fails to answer the question.',
          },
          {
            type: 'worked-example',
            title: 'Compare labour productivity and average cost',
            setup: 'A manufacturing workshop makes 7,200 reusable trays in one month with 24 production employees. Its total production costs for that same month are £93,600.',
            task: 'Calculate output per production employee and average cost per tray.',
            steps: [
              { label: 'Calculate labour productivity', value: '7,200 trays ÷ 24 employees = 300 trays per employee during that month.' },
              { label: 'Calculate unit cost', value: '£93,600 total production costs ÷ 7,200 trays = £13 per tray.' },
              { label: 'Keep the measures distinct', value: 'Labour productivity uses workers as the denominator; unit cost uses completed output as the denominator. They measure different aspects of performance.' },
              { label: 'Evaluate a decision', value: 'A lower unit cost or higher productivity can be useful, but compare quality, product mix, wage inputs, reliability and whether the change requires expensive machinery.' },
            ],
            conclusion: 'A correct final number is useful Practice evidence for the named measure; the worked method, units and interpretation still require separate scrutiny.',
          },
          {
            type: 'worked-example',
            title: 'Use operational evidence to make a conditional business decision',
            setup: 'A delivery business compares two original plans for next week. Its demand is usually about 900 deliveries per week but may rise above 1,000. Plan A adds shifts: forecast 960 deliveries from a weekly capacity of 1,200, with 12 delivery staff, £30,720 weekly operating costs and 94% delivered on time. Plan B trains and reschedules the existing team: forecast 900 deliveries from a weekly capacity of 1,000, with 10 staff, £25,200 weekly operating costs and 97% delivered on time. Each figure is a projection for the same one-week period, not a verified result.',
            task: 'Before reading the model reasoning, calculate both plans’ capacity utilisation, deliveries per worker and average cost per delivery. Recommend a plan for demand near 900, justify it using the figures and service conditions, and explain when the other plan might be better.',
            steps: [
              { label: 'Calculate Plan A from matching weekly figures', value: 'Utilisation = 960 ÷ 1,200 × 100 = 80%. Labour productivity = 960 ÷ 12 = 80 deliveries per worker per week. Average cost = £30,720 ÷ 960 = £32 per delivery.' },
              { label: 'Calculate Plan B from matching weekly figures', value: 'Utilisation = 900 ÷ 1,000 × 100 = 90%. Labour productivity = 900 ÷ 10 = 90 deliveries per worker per week. Average cost = £25,200 ÷ 900 = £28 per delivery.' },
              { label: 'Interpret the differences, not just the percentages', value: 'At their projected weekly volumes, Plan B has £4 lower average cost and 10 more deliveries per worker, with a higher projected on-time rate (97% versus 94%). Plan A has 200 more deliveries of capacity per week (1,200 versus 1,000), despite lower forecast utilisation of that capacity.' },
              { label: 'Make and qualify a decision', value: 'For demand near 900 where reliability and cost matter most, prefer Plan B provisionally: it covers the expected volume and has better projected service and average cost. If demand consistently moves above 1,000 per week or the firm needs substantial headroom, Plan A may be preferable despite its higher unit cost. Capacity alone does not ensure demand or quality.' },
              { label: 'Plan what to monitor', value: 'Check actual weekly orders and unfilled demand, punctuality, staffing costs and complaints before committing. These are projected comparisons; no option is proved more profitable because selling revenue, implementation risks and actual outcomes are not given.' },
            ],
            conclusion: 'A defensible answer uses at least two calculated measures alongside the case conditions, reaches a conditional recommendation and identifies missing evidence. Writing this judgement is an unscored Learn self-review, not independent AO3/AO4 or method-mark evidence.',
          },
          {
            type: 'quick-check',
            question: 'In the worked delivery case, demand next week is expected to be close to 900 deliveries and reliability matters, but demand could grow beyond 1,000. Which recommendation best uses the available data?',
            options: [
              { id: 'conditional', text: 'Prefer Plan B for current demand and service; monitor orders, and reconsider Plan A if sustained demand exceeds 1,000.' },
              { id: 'low-utilisation', text: 'Always choose Plan A because 80% utilisation proves it is more profitable.' },
              { id: 'guarantee', text: 'Choose Plan B permanently because its £28 average cost guarantees superior profit and quality.' },
              { id: 'capacity-only', text: 'Either plan is equally suitable because both can produce at least 900 deliveries.' },
            ],
            correctOptionId: 'conditional',
            explanation: 'Plan B projects £28 per delivery, 90 deliveries per worker and 97% on time, versus Plan A £32, 80 and 94%; it is a reasonable near-term choice for around 900 orders. Plan A offers greater capacity if demand regularly exceeds 1,000. The evidence does not establish profit or guarantee service outcomes. This is an unscored contextual decision check, not a marked written evaluation.',
          },
          {
            type: 'quick-check',
            question: 'A plant makes 6,000 units in one week with 20 employees and £90,000 total production costs. Which is its unit cost?',
            options: [
              { id: 'cost', text: '£15 per unit' },
              { id: 'productivity', text: '300 units per employee' },
              { id: 'total', text: '£90,000 per unit' },
              { id: 'other', text: '£4,500 per employee' },
            ],
            correctOptionId: 'cost',
            explanation: 'Unit cost uses total costs divided by output: £90,000 ÷ 6,000 = £15. The 300 figure measures productivity, not average cost. This Learn check is not saved as an independent assessment.',
          },
          {
            type: 'misconception',
            title: 'Higher utilisation does not automatically mean greater efficiency or better profit.',
            paragraphs: [
              'A service with no spare capacity may incur queues, missed deadlines, overtime and quality failures during demand peaks. An apparently low-cost or highly productive operation may also deliver the wrong product or weaker quality. Make decisions using several indicators and the conditions of the business.',
            ],
          },
          {
            type: 'recap',
            items: [
              'Capacity = maximum feasible output in the specified period and conditions.',
              'Utilisation = actual output ÷ capacity × 100; align units and period.',
              'Labour productivity = output ÷ employees; name the output and period.',
              'Average cost per unit = total production costs ÷ units produced.',
              'Apply each result alongside quality, flexibility, service and cost evidence rather than equating a single ratio with success.',
            ],
          },
        ],
      }],
    }],
  }],
})
