import { learnCourseSchema } from '../../../learn-schema'

/**
 * #698 / AQA Business 7132 v2.0 §3.3.4, printed pp16–17.
 * Original Revision teaching, informed by the Founder-supplied AQA reference-only PDF.
 * These Learn quick checks and worked models are NOT independently assessed skill evidence.
 */
export const marketingMixSupplement = learnCourseSchema.parse({
  chapters: [{
    id: 'marketing',
    topicId: 'marketing',
    title: '3. Marketing Management',
    groups: [
      {
        id: 'boston-matrix-method',
        title: 'Boston Matrix: classify, then evaluate',
        pages: [{
          id: 'boston-matrix-decision-method',
          topicId: 'marketing',
          sourceSectionIds: ['marketing-mix'],
          title: 'How to use the Boston Matrix without guessing the decision',
          orientation: 'Classify a portfolio using market growth and relative market share, then evaluate what the classification does and does not establish.',
          blocks: [
            {
              type: 'explanation',
              heading: 'Use the two different axes',
              paragraphs: [
                'The Boston Matrix compares products using market growth (high or low on the vertical axis) and relative market share (high or low on the horizontal axis). Relative market share is usually calculated by comparing the business product’s market share with that of its largest competitor. A share of 24% against a largest rival at 12% gives a relative share of 2.0, not 24% or 12%.',
                'High growth and high relative share is a star; low growth and high relative share is a cash cow; high growth and low relative share is a question mark; low growth and low relative share is a dog. The labels are simplified categories, not measured profitability, cash-flow outcomes or automatic instructions.',
                'The boundary between high and low growth depends on the industry and the comparison the manager is making. When a question gives a threshold, use that threshold; do not invent a universal AQA percentage cutoff.',
              ],
            },
            {
              type: 'worked-example',
              title: 'Classify four original product lines and recommend a justified allocation',
              setup: 'For this illustration, treat annual market growth above 8% as high and relative market share above 1.0 as high. A cleaning-products business has: Core Cleaner (24% share, largest rival 12%, 3% growth); Refill Pods (8%, rival 20%, 14% growth); Travel Wipes (7%, rival 22%, 2% growth); Concentrated Spray (29%, rival 16%, 15% growth).',
              task: 'Draw a four-quadrant matrix on paper, calculate each relative share and label the four lines before reading the reasoning.',
              steps: [
                { label: 'Identify the axes', value: 'Vertical axis = annual market growth; horizontal axis = relative market share. State the scenario thresholds explicitly. High share may be plotted on the left in a conventional Boston Matrix, but label your own direction clearly.' },
                { label: 'Calculate relative market shares', value: 'Core Cleaner = 24 / 12 = 2.00. Refill Pods = 8 / 20 = 0.40. Travel Wipes = 7 / 22 ≈ 0.32. Concentrated Spray = 29 / 16 ≈ 1.81.' },
                { label: 'Classify the lines', value: 'Core Cleaner (low growth, high share) = cash cow. Refill Pods (high growth, low share) = question mark. Travel Wipes (low growth, low share) = dog. Concentrated Spray (high growth, high share) = star.' },
                { label: 'Build a conditional portfolio case', value: 'A mature high-share cleaner could supply cash to support the growth of the spray. But actual cash generation, investment requirements and competitive strength require financial evidence. The question mark might merit selective investment or exit, depending on potential and costs.' },
                { label: 'Challenge the diagram', value: 'Low-share low-growth Travel Wipes might still be profitable, serve loyal customers or support the range. Market growth and relative share do not reveal margins, strategic links, brand fit, cash requirements or the likely effect of competitors.' },
              ],
              conclusion: 'Use the matrix to structure a decision, not to replace one. Revealing this model answer cannot independently mark a learner-drawn matrix, numerical working or written evaluation.',
            },
            {
              type: 'quick-check',
              question: 'A line has 6% market share against a rival with 18%, in a fast-growing market. What is the best Boston Matrix classification?',
              options: [
                { id: 'star', text: 'Star, because the market is growing quickly' },
                { id: 'question', text: 'Question mark: high growth but low relative share' },
                { id: 'cash', text: 'Cash cow, because it sells in a growing market' },
                { id: 'dog', text: 'Dog, because its relative share is below one' },
              ],
              correctOptionId: 'question',
              explanation: 'Its relative share is 6 / 18 = 0.33, which is low. A fast-growing market means high growth, so the line is a question mark. This does not by itself determine whether to invest.',
            },
            {
              type: 'misconception',
              title: 'A cash cow is not necessarily profitable and a dog is not necessarily disposable.',
              paragraphs: [
                'Portfolio categories combine growth and relative share only. Do not infer cash flow, contribution or ability to fund other products without financial evidence. Market definition, segment differences, competitive change and commercial interdependence can alter the decision.',
              ],
            },
            {
              type: 'recap',
              items: [
                'Calculate relative share using the largest competing product; do not confuse it with absolute market share.',
                'Star = high growth/high share; cash cow = low growth/high share; question mark = high growth/low share; dog = low growth/low share.',
                'Use a stated contextual growth threshold, and assess profitability, cash, brand and market evidence before recommending invest, maintain or withdraw.',
              ],
            },
          ],
        }],
      },
      {
        id: 'seven-ps-contextual-application',
        title: 'Apply the seven Ps to different markets',
        pages: [{
          id: 'marketing-mix-seven-ps-context',
          topicId: 'marketing',
          sourceSectionIds: ['marketing-mix'],
          title: 'Seven Ps for consumer goods, industrial goods and services',
          orientation: 'Select an integrated set of decisions for the actual target market rather than listing seven disconnected definitions.',
          blocks: [
            {
              type: 'key-idea',
              definitions: [
                { term: 'Product', definition: 'The core good or service and supporting features, quality, design, range or support.' },
                { term: 'Price', definition: 'The price and pricing approach, consistent with positioning, costs, demand and competitors.' },
                { term: 'Place', definition: 'Where and how the customer accesses the offer, including direct and multiple channels.' },
                { term: 'Promotion', definition: 'Communication, including advertising, social media, branding and viral approaches.' },
                { term: 'People', definition: 'Staff and others who deliver the promise, particularly in service encounters.' },
                { term: 'Process', definition: 'The steps through which customers order, receive, use or resolve problems with the offer.' },
                { term: 'Physical environment', definition: 'Visible evidence of quality, including premises, equipment, packaging and the online customer environment.' },
              ],
            },
            {
              type: 'explanation',
              heading: 'Adapt the mix to the customer and the business market',
              paragraphs: [
                'A consumer-facing good may depend heavily on packaging, retailers, prices and promotion, but support staff and the buying process still matter. A consumer service may depend on booking speed, reliability, staff skill and the condition of premises. An industrial buyer such as a factory may value specification, reliability, training, installation, delivery, service contracts and total operating cost more than mass advertising.',
                'Check how each element reinforces positioning, the target market, objectives, competition, the type of offer, the product life cycle and the Boston Matrix. These are the seven named integration influences in the source specification, not an automatic checklist that substitutes for relevant case data.',
              ],
            },
            {
              type: 'worked-example',
              title: 'Integrated industrial-service recommendation',
              setup: 'FlowServe sells industrial water-filtration units to UK food manufacturers and offers installation and maintenance. Buyers prioritise dependable hygiene and low unplanned downtime, not the lowest upfront price. A rival sells cheaper units but offers limited technical support.',
              task: 'Recommend a coherent seven-P mix with an explicit trade-off and judge which conditions would change it.',
              steps: [
                { label: 'Product and price', value: 'Specify reliable filtration units with tested performance and service warranties; a higher initial price may be justified by lower downtime and total operating cost if supported by measured evidence.' },
                { label: 'Place and promotion', value: 'Use direct account teams and installation partners; explain verified cost-of-downtime and reliability outcomes through technical demonstrations, rather than relying mainly on consumer viral posts.' },
                { label: 'People and process', value: 'Train engineers and support staff; provide predictable maintenance bookings, spare-parts availability and a documented escalation route for faults.' },
                { label: 'Physical environment', value: 'Provide credible on-site demonstrations, professional service reports and accessible technical documentation to make reliability visible.' },
                { label: 'Evaluation', value: 'This integrated premium solution may suit buyers facing costly stoppages, but depends on reliable delivery, measurable service quality and willingness to pay. Budget-limited customers and a stronger low-cost rival may favour a different balance.' },
              ],
              conclusion: 'For consumer food products or salon services, the same seven headings must be adapted to different buying motives and delivery constraints; copying the industrial mix would not be appropriate.',
            },
            {
              type: 'quick-check',
              question: 'A premium salon advertises expensive treatments but has rude staff, unreliable booking and an untidy reception. Which interpretation best applies the seven Ps?',
              options: [
                { id: 'adverts', text: 'More social advertising fixes the weaknesses in the other elements' },
                { id: 'price', text: 'Only price matters once the salon is positioned as premium' },
                { id: 'integrated', text: 'People, process and physical environment undermine the premium promise and need improvement together' },
                { id: 'product', text: 'Services do not need a product or place decision' },
              ],
              correctOptionId: 'integrated',
              explanation: 'An integrated mix must consistently deliver the promised experience. Advertising cannot substitute for service delivery; price must be credible in light of the actual experience.',
            },
            {
              type: 'recap',
              items: [
                'The seven Ps work together; do not treat people, process and physical environment as optional for services.',
                'Adapt applications to consumer and industrial buyers and to goods or services.',
                'Evaluate integration using the seven source-named influences plus contextual costs, capability and evidence.',
              ],
            },
          ],
        }],
      },
    ],
  }],
})
