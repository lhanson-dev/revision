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
        sourceSectionIds: ['operations-performance'],
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
