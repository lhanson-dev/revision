import type { LearnBlock, LearnPage } from '../../../../content/learn-schema'

/**
 * Sample Learn content shaped exactly like content/learn-schema.ts, from the design system's
 * learn_content.js. Used by the fixture page, the Design Lab and the tests. It is not course content.
 */
export const breakEvenPage: LearnPage = {
  id: 'break-even-output',
  topicId: 'contribution-break-even',
  title: 'Break-even output',
  orientation: 'How many units a business has to sell before it stops making a loss, and how to work it out from contribution.',
  blocks: [
    { type: 'explanation', heading: 'Covering fixed costs first', paragraphs: [
      'Fixed costs like rent and salaries have to be paid whether a business sells one unit or a thousand. Each sale chips away at them. The amount each unit chips in is its contribution: the selling price minus the variable cost of making it.',
      'Once the contributions add up to the fixed costs, the business has broken even. It isn’t making a profit yet, but it’s no longer making a loss. Every unit after that adds its full contribution to profit.'] },
    { type: 'key-idea', label: 'Key idea', definitions: [
      { term: 'Break-even output', definition: 'The number of units a business must sell for total revenue to equal total costs. Profit is zero.' },
      { term: 'Contribution per unit', definition: 'Selling price minus variable cost per unit.' }] },
    { type: 'explanation', heading: 'Working it out', paragraphs: [
      'Divide fixed costs by contribution per unit. The answer is in units, not pounds, and you round up: you can’t sell 0.4 of a latte, and rounding down would leave you just short.'] },
    { type: 'worked-example', label: 'Worked example', title: 'A café’s break-even output', steps: [
      { label: 'Fixed costs per month', value: 'Rent £1,800 + wages £3,240 = £5,040' },
      { label: 'Contribution per latte', value: '£3.20 − £1.10 = £2.10' },
      { label: 'Break-even output', value: '£5,040 ÷ £2.10 = 2,400 lattes' }],
    conclusion: 'The café needs to sell 2,400 lattes a month, about 80 a day, before it makes any profit.' },
    { type: 'quantitative', label: 'Break-even chart', title: 'The café’s costs and revenue', xLabel: 'Lattes sold per month', yLabel: '£', series: [
      { name: 'Total revenue', points: [{ x: 0, y: 0 }, { x: 4000, y: 12800 }] },
      { name: 'Total costs', points: [{ x: 0, y: 5040 }, { x: 4000, y: 9440 }] },
      { name: 'Fixed costs', points: [{ x: 0, y: 5040 }, { x: 4000, y: 5040 }] }],
    explanation: 'The lines cross at 2,400 lattes (£7,680). Left of that the café makes a loss; right of it, a profit.' },
    { type: 'explanation', heading: 'What changes break-even', paragraphs: [
      'Break-even isn’t fixed. Anything that changes fixed costs, price or variable costs moves it, which is why managers use it to test a decision before they make it.'] },
    { type: 'relationship', label: 'How it connects', title: 'Raising the price', items: ['Price rises', 'Contribution per unit rises', 'Fewer units cover fixed costs', 'Break-even output falls'],
      explanation: 'A higher price may also mean fewer customers, so a lower break-even doesn’t guarantee more profit.' },
    { type: 'quick-check', question: 'The café’s rent goes up by £210 a month. What happens to its break-even output?', options: [
      { id: 'rises', text: 'It rises by 100 lattes' }, { id: 'same', text: 'It stays the same' }, { id: 'falls', text: 'It falls by 100 lattes' }],
    correctOptionId: 'rises', explanation: 'Rent is a fixed cost. Fixed costs rise by £210 and each latte contributes £2.10, so the café needs 100 more: 2,500 a month.' },
    { type: 'misconception', label: 'Common mix-up', title: 'Breaking even isn’t making a profit', paragraphs: [
      'At break-even, profit is exactly zero. It’s easy to write that a business “makes a profit at break-even”. It only makes a profit on the units it sells beyond that point.'] },
    { type: 'recap', label: 'What to remember', items: [
      'Break-even output = fixed costs ÷ contribution per unit.', 'The answer is in units. Round up.',
      'At break-even, profit is zero, not positive.', 'Changing price, variable costs or fixed costs moves break-even.'] },
  ],
}

export const exampleBlock: LearnBlock = {
  type: 'example', label: 'Example', title: 'Two bakeries, same rent',
  paragraphs: ['Both pay £2,000 a month in fixed costs. One sells loaves at £2.50 that cost £1.50 to make; the other sells sourdough at £5 that costs £2. The sourdough bakery contributes £3 a loaf, so it breaks even after 667 loaves. The first needs 2,000.'],
}

export const comparisonBlock: LearnBlock = {
  type: 'comparison', label: 'Compare', title: 'Fixed and variable costs',
  columns: [
    { heading: 'Fixed costs', items: [{ label: 'What it is', value: 'Doesn’t change with output' }, { label: 'Examples', value: 'Rent, salaries, insurance' }, { label: 'On the chart', value: 'A flat line' }] },
    { heading: 'Variable costs', items: [{ label: 'What it is', value: 'Rises with every unit made' }, { label: 'Examples', value: 'Ingredients, packaging, piece-rate pay' }, { label: 'On the chart', value: 'Starts at zero and slopes up' }] },
  ],
}

/** One sample of every block type the schema defines, in the order the schema lists them. */
export const everyBlockType: LearnBlock[] = [
  breakEvenPage.blocks[0], breakEvenPage.blocks[1], exampleBlock, breakEvenPage.blocks[3], breakEvenPage.blocks[6],
  comparisonBlock, breakEvenPage.blocks[4], breakEvenPage.blocks[8], breakEvenPage.blocks[7], breakEvenPage.blocks[9],
]

/** A page that exercises every type, with the example and comparison added before the recap. */
export const everyBlockPage: LearnPage = {
  id: 'every-block', topicId: 'fixtures', title: 'Every block type',
  orientation: 'One of each Learn block, so a style change shows up everywhere at once.',
  blocks: everyBlockType,
}
