import { learnCourseSchema } from '../../../learn-schema'

export const learn = learnCourseSchema.parse({
  chapters: [
    {
      id: 'business',
      topicId: 'business',
      title: '1. What is Business?',
      groups: [
        {
          id: 'understanding-businesses',
          title: 'Understanding businesses',
          pages: [
            {
              id: 'why-businesses-exist',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'Why businesses exist',
              orientation: 'Understand why businesses exist, what they are trying to achieve and why those aims matter for everyday decisions.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'Businesses respond to needs and wants',
                  paragraphs: [
                    'Businesses provide goods or services that meet customer needs and wants. They combine resources such as people, finance, materials and technology to create something customers value.',
                    'Different organisations can exist for different reasons. Some prioritise profit or growth, while others may place survival, cash flow, social impact or ethical aims at the centre of their decisions.',
                  ],
                },
                {
                  type: 'key-idea',
                  definitions: [
                    { term: 'Need', definition: 'Something a customer considers essential or important.' },
                    { term: 'Want', definition: 'Something a customer would like to have, even if it is not essential.' },
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'Businesses combine resources to provide goods or services that customers value.',
                    'Different organisations can pursue different aims.',
                    'Those aims influence the decisions a business makes.',
                  ],
                },
              ],
            },
            {
              id: 'business-aims-and-objectives',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'Business aims and objectives',
              orientation: 'Why businesses need objectives, the different objectives they may pursue, and how objectives influence decisions.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'Why businesses need objectives',
                  paragraphs: [
                    'Every business makes choices about what to sell, where to invest, who to employ and how quickly to grow.',
                    'Objectives give those decisions direction. They also give the business something against which performance can be judged.',
                  ],
                },
                {
                  type: 'key-idea',
                  definitions: [
                    { term: 'Mission', definition: 'The broad purpose and direction of a business.' },
                    { term: 'Objective', definition: 'A more specific target that turns that purpose into something the business can work towards.' },
                  ],
                },
                {
                  type: 'explanation',
                  heading: 'Different businesses can have different objectives',
                  paragraphs: [
                    'A business does not always pursue the same objective. Profit may be important because owners expect a financial return. Growth may matter when a business wants to increase its scale or market position. A new or struggling business may make survival its immediate priority.',
                    'Cash flow can also become critical because a business needs enough cash available to meet its obligations when they fall due. Some organisations also pursue social or ethical objectives.',
                  ],
                },
                {
                  type: 'example',
                  title: 'A small independent café',
                  paragraphs: [
                    'During its first year, the café may prioritise survival: attracting enough regular customers and controlling costs.',
                    'Once established, the owner might change the objective to growth and decide to open a second café. That change could affect finance, staffing, marketing and operations.',
                  ],
                },
                {
                  type: 'explanation',
                  heading: 'Objectives influence decisions',
                  paragraphs: [
                    'An objective matters because it changes what the business is likely to do. A business pursuing growth might accept higher costs today if investment creates greater capacity for the future.',
                  ],
                },
                {
                  type: 'relationship',
                  title: 'How a growth objective can shape decisions',
                  items: [
                    'Growth objective',
                    'More investment',
                    'Greater capacity, marketing or staffing',
                    'Higher short-term costs and cash requirements',
                    'Potential longer-term growth',
                  ],
                },
                {
                  type: 'misconception',
                  title: 'Profit is not automatically the main objective of every business.',
                  paragraphs: [
                    'The most appropriate objective depends on the organisation and its circumstances. Priorities can also change over time.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'A mission describes the broad purpose of a business.',
                    'Objectives turn that purpose into more specific targets.',
                    'Businesses can pursue profit, growth, survival, cash-flow, social or ethical objectives.',
                    'The most appropriate objective depends on circumstances.',
                    'Objectives influence decisions across the business.',
                  ],
                },
              ],
            },
            {
              id: 'when-objectives-conflict',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'When business objectives conflict',
              orientation: 'Understand why achieving one objective can make another objective harder to achieve, especially over different time periods.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'Objectives can pull in different directions',
                  paragraphs: [
                    'Businesses often pursue several objectives at the same time. Those objectives do not always fit neatly together.',
                    'Growth may require investment that reduces short-term profit or cash. An ethical sourcing decision may increase costs in the short term while supporting reputation or long-term demand.',
                  ],
                },
                {
                  type: 'relationship',
                  title: 'A common growth trade-off',
                  items: [
                    'Growth objective',
                    'Investment in capacity or marketing',
                    'Higher short-term spending',
                    'Lower short-term cash or profit',
                    'Potential future sales growth',
                  ],
                },
                {
                  type: 'misconception',
                  title: 'A conflict does not mean one objective is wrong.',
                  paragraphs: [
                    'Managers have to judge which objective matters most in the current context and over what time period. The best decision depends on the evidence and the business situation.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'Businesses can pursue several objectives at once.',
                    'An action that helps one objective can weaken another.',
                    'Short-term and long-term effects may be different.',
                    'Managers need to make contextual trade-offs rather than assume one objective always dominates.',
                  ],
                },
              ],
            },
            {
              id: 'revenue-costs-and-profit',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'Revenue, costs and profit',
              orientation: 'Understand the basic relationship between sales revenue, business costs and profit, and why the three measures must not be confused.',
              blocks: [
                {
                  type: 'key-idea',
                  definitions: [
                    { term: 'Revenue', definition: 'The money a business receives from sales. It is also called turnover or sales revenue.' },
                    { term: 'Total costs', definition: 'The total fixed and variable costs incurred by the business.' },
                    { term: 'Profit', definition: 'The amount left when total costs are deducted from revenue.' },
                  ],
                },
                {
                  type: 'worked-example',
                  title: 'A simple profit calculation',
                  steps: [
                    { label: 'Selling price × quantity sold', value: '£8 × 500 = £4,000 revenue' },
                    { label: 'Total costs', value: '£3,200' },
                    { label: 'Profit = revenue − total costs', value: '£4,000 − £3,200 = £800' },
                  ],
                  conclusion: 'Higher revenue does not automatically mean higher profit: the cost of generating that revenue matters too.',
                },
                {
                  type: 'misconception',
                  title: 'Revenue and profit are not the same thing.',
                  paragraphs: [
                    'Revenue measures sales income before costs are deducted. Profit is what remains after the relevant costs are taken away.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'Revenue is sales income.',
                    'Total costs combine the costs incurred by the business.',
                    'Profit = revenue − total costs.',
                    'A change in sales is not enough on its own to explain what happens to profit.',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
