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
              id: 'business-aims-and-objectives',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'Business aims and objectives',
              orientation: 'Understand why businesses need objectives, why priorities change and how an objective can shape decisions across the business.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'Objectives give decisions direction',
                  paragraphs: [
                    'Businesses make choices about what to sell, where to invest, who to employ and how quickly to grow. Objectives give those decisions direction and provide a basis for judging performance.',
                    'Different organisations can pursue different objectives. Profit, growth, survival, cash flow, social impact and ethical aims can all matter, and their importance can change as circumstances change.',
                  ],
                },
                {
                  type: 'key-idea',
                  definitions: [
                    { term: 'Mission', definition: 'The broad purpose and direction of a business.' },
                    { term: 'Objective', definition: 'A more specific target that turns that purpose into something the business can work towards and assess.' },
                  ],
                },
                {
                  type: 'example',
                  title: 'A small independent café',
                  paragraphs: [
                    'During its first year, the café may prioritise survival by attracting regular customers and controlling costs. Once established, the owner might switch the priority to growth and consider opening a second café.',
                    'That change in objective affects more than one function: finance must fund the expansion, operations need capacity, HR may recruit staff and marketing must attract enough demand.',
                  ],
                },
                {
                  type: 'relationship',
                  title: 'How a growth objective can shape decisions',
                  items: [
                    'Growth objective',
                    'More investment',
                    'Greater capacity, marketing or staffing',
                    'Higher short-term cash requirement',
                    'Potential longer-term growth',
                  ],
                  explanation: 'The objective matters because it changes the chain of decisions and consequences, not simply because it appears in a business plan.',
                },
                {
                  type: 'misconception',
                  title: 'Profit is not automatically the main objective of every business.',
                  paragraphs: [
                    'The most appropriate objective depends on the organisation, its stage of development and its circumstances. Managers may also have to trade one objective against another over different time periods.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'A mission describes broad purpose; objectives turn purpose into targets.',
                    'Businesses can pursue several different objectives and priorities can change.',
                    'Objectives influence decisions across finance, operations, marketing and HR.',
                    'Evaluation should consider context and trade-offs rather than assume one objective always dominates.',
                  ],
                },
              ],
            },
            {
              id: 'revenue-costs-and-profit',
              topicId: 'business',
              sourceSectionIds: ['purpose-objectives-profit'],
              title: 'Revenue, costs and profit',
              orientation: 'Understand the relationship between sales revenue, business costs and profit, and why the three measures must not be confused.',
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
                    { label: 'Calculate revenue', value: '£8 selling price × 500 units = £4,000 revenue' },
                    { label: 'Identify total costs', value: 'Total costs = £3,200' },
                    { label: 'Calculate profit', value: '£4,000 revenue − £3,200 total costs = £800 profit' },
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
                    'Profit = revenue − total costs.',
                    'A change in sales is not enough on its own to explain what happens to profit.',
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'business-ownership',
          title: 'Business ownership',
          pages: [
            {
              id: 'limited-companies-and-shareholders',
              topicId: 'business',
              sourceSectionIds: ['forms-ownership'],
              title: 'Limited companies and shareholders',
              orientation: 'Understand what limited liability changes for owners and the main distinction between private and public limited companies.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'A limited company is legally separate from its owners',
                  paragraphs: [
                    'A limited company has a separate legal identity from its shareholders. This matters because the company can own assets, enter contracts and owe money in its own name.',
                    'Shareholders own shares in the company. Limited liability means their personal financial exposure is normally limited to the amount they have invested, rather than making them personally responsible for all company debts.',
                  ],
                },
                {
                  type: 'key-idea',
                  definitions: [
                    { term: 'Limited liability', definition: 'A shareholder’s personal financial responsibility is normally limited to the amount invested in the company.' },
                    { term: 'Shareholder', definition: 'A person or organisation that owns one or more shares in a company.' },
                  ],
                },
                {
                  type: 'comparison',
                  title: 'Private and public limited companies',
                  columns: [
                    {
                      heading: 'Private limited company',
                      items: [
                        { label: 'Shares', value: 'Shares are privately held and are not offered to the general public.' },
                        { label: 'Finance', value: 'Equity finance is usually raised from a more restricted group of owners or investors.' },
                        { label: 'Pressure', value: 'Ownership can remain relatively concentrated, although investor expectations still matter.' },
                      ],
                    },
                    {
                      heading: 'Public limited company',
                      items: [
                        { label: 'Shares', value: 'Shares can be offered to the public and traded through public markets where listed.' },
                        { label: 'Finance', value: 'The business may gain access to a much larger pool of equity finance.' },
                        { label: 'Pressure', value: 'Greater disclosure requirements and wider shareholder expectations can increase management pressure.' },
                      ],
                    },
                  ],
                },
                {
                  type: 'misconception',
                  title: 'Limited liability does not mean the company cannot fail or owe money.',
                  paragraphs: [
                    'The protection applies to shareholders’ personal liability. The company itself can still make losses, default on obligations or become insolvent.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'Limited companies have a separate legal identity from their owners.',
                    'Shareholders own the company through shares and normally benefit from limited liability.',
                    'Public limited companies can access public share ownership but face additional disclosure and shareholder pressures.',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'finance',
      topicId: 'finance',
      title: '5. Financial Management',
      groups: [
        {
          id: 'break-even-and-profitability',
          title: 'Break-even and profitability',
          pages: [
            {
              id: 'understanding-break-even',
              topicId: 'finance',
              sourceSectionIds: ['break-even-profitability'],
              title: 'Understanding break-even',
              orientation: 'Understand contribution, break-even output and how a break-even chart shows the point where total revenue equals total cost.',
              blocks: [
                {
                  type: 'explanation',
                  heading: 'Break-even is a relationship between price, variable cost and fixed cost',
                  paragraphs: [
                    'Contribution per unit is the selling price minus variable cost per unit. Each unit sold contributes that amount towards fixed costs first and then towards profit once fixed costs have been covered.',
                    'Break-even output is the quantity where total revenue equals total cost. Below that output the business makes a loss; above it, the business makes a profit if the assumptions hold.',
                  ],
                },
                {
                  type: 'worked-example',
                  title: 'Calculate break-even output',
                  steps: [
                    { label: 'Contribution per unit', value: '£10 selling price − £5 variable cost = £5 contribution' },
                    { label: 'Fixed costs', value: '£20,000' },
                    { label: 'Break-even output', value: '£20,000 ÷ £5 = 4,000 units' },
                  ],
                  conclusion: 'The business must sell 4,000 units before total contribution has covered the £20,000 fixed cost.',
                },
                {
                  type: 'quantitative',
                  title: 'Break-even chart',
                  xLabel: 'Output (units)',
                  yLabel: '£',
                  series: [
                    {
                      name: 'Total revenue',
                      points: [
                        { x: 0, y: 0, label: '0 units' },
                        { x: 2000, y: 20000, label: '2,000 units' },
                        { x: 4000, y: 40000, label: '4,000 units' },
                        { x: 6000, y: 60000, label: '6,000 units' },
                      ],
                    },
                    {
                      name: 'Total cost',
                      points: [
                        { x: 0, y: 20000, label: '0 units' },
                        { x: 2000, y: 30000, label: '2,000 units' },
                        { x: 4000, y: 40000, label: '4,000 units' },
                        { x: 6000, y: 50000, label: '6,000 units' },
                      ],
                    },
                  ],
                  explanation: 'The two lines meet at 4,000 units and £40,000. That intersection is the break-even point in this example.',
                },
                {
                  type: 'misconception',
                  title: 'Break-even is not a guaranteed prediction.',
                  paragraphs: [
                    'The calculation depends on assumptions about selling price, variable costs, fixed costs and output. If those assumptions change, the break-even point changes too.',
                  ],
                },
                {
                  type: 'recap',
                  items: [
                    'Contribution per unit = selling price − variable cost per unit.',
                    'Break-even output = fixed costs ÷ contribution per unit.',
                    'On a break-even chart, total revenue and total cost intersect at break-even.',
                    'Managers should test the assumptions rather than treat the result as certain.',
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
