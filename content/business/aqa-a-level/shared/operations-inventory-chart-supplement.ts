import { learnCourseSchema } from '../../../learn-schema'

/**
 * Issue #698: original AQA Business 7132 v2.0 §3.4.5, printed p19.
 * The Founder-supplied source is REFERENCE_ONLY. This page teaches chart
 * interpretation inside the existing canonical Business Learn course.
 * Learn worked steps and quick checks are UNSCORED, not independent evidence.
 */
export const operationsInventoryChartSupplement = learnCourseSchema.parse({
  chapters: [{
    id: 'operations',
    topicId: 'operations',
    title: '4. Operational Management',
    groups: [{
      id: 'inventory-chart-reading',
      title: 'Read an inventory control chart',
      pages: [{
        id: 'operations-inventory-control-chart',
        topicId: 'operations',
        sourceSectionIds: ['aqa-7132-3-4-5', 'inventory-control'],
        title: 'Inventory control: read what the lines show',
        orientation: 'Read the axes and timeline before interpreting re-order level, buffer inventory, deliveries and lead time. The plotted cycle is one original illustration, not a universal stock policy.',
        blocks: [
          {
            type: 'key-idea',
            definitions: [
              { term: 'Inventory control chart', definition: 'A graph of quantity held against time. Stock usually slopes down as it is used or sold and rises when a delivery is received.' },
              { term: 'Re-order level', definition: 'The stock level that triggers an order being placed. It is not normally when the delivery arrives.' },
              { term: 'Lead time', definition: 'Elapsed time between placing an order and receiving its delivery.' },
              { term: 'Buffer inventory', definition: 'Minimum protective stock used to cope with unexpected demand or delivery delays, not proof that stock can never run out.' },
              { term: 'Re-order quantity', definition: 'Quantity added by a delivery. Read the vertical rise from the inventory level just before arrival to the level immediately after arrival; it is not normally the re-order level.' },
            ],
          },
          {
            type: 'explanation',
            heading: 'Read the chart, not just a list of values',
            paragraphs: [
              'The horizontal axis measures elapsed days and the vertical axis measures packets in stock. The solid line traces stock on hand; the flat guide lines show the order trigger and planned buffer. A downward segment means stock is being used, not that a delivery is on its way. A vertical rise at the same day marks receipt of new packets; an order placed earlier does not instantly add inventory.',
              'The original illustrated business starts with 1,800 packets, uses 100 per day, orders when 800 remain on day 10 and receives 1,600 new packets on day 16, after six days. Inventory is 200 packets immediately before the delivery and then 1,800 immediately after. The plot makes these separate events visible.',
            ],
          },
          {
            type: 'quantitative',
            label: 'Original inventory chart',
            title: 'Stock level over time: re-order on day 10, delivery on day 16',
            xLabel: 'Day',
            yLabel: 'Packets in stock',
            series: [
              {
                name: 'Stock on hand',
                points: [
                  { x: 0, y: 1800, label: 'Day 0 · 1,800 before use' },
                  { x: 5, y: 1300, label: 'Day 5 · 1,300 left' },
                  { x: 10, y: 800, label: 'Day 10 · order placed' },
                  { x: 16, y: 200, label: 'Day 16 · before delivery' },
                  { x: 16, y: 1800, label: 'Day 16 · after delivery' },
                  { x: 20, y: 1400, label: 'Day 20 · 1,400 left' },
                ],
              },
              {
                name: 'Re-order level',
                points: [{ x: 0, y: 800 }, { x: 20, y: 800 }],
              },
              {
                name: 'Buffer stock level',
                points: [{ x: 0, y: 200 }, { x: 20, y: 200 }],
              },
            ],
            explanation: 'Use the order-trigger intersection on day 10 and the vertical delivery on day 16. The six-day horizontal gap is lead time. The vertical increase from 200 to 1,800 is a 1,600-packet delivery. The accompanying Show the data table is an accessible alternative to the plotted lines.',
          },
          {
            type: 'worked-example',
            title: 'Interpret the actual chart before calculating',
            setup: 'An original distributor uses 100 packets each day. Its inventory chart begins at 1,800 packets, crosses the 800-packet re-order guide on day 10 and falls to the 200-packet buffer on day 16, when a delivery restores it to 1,800. Assume sales and delivery behave exactly as shown in this single illustrative cycle.',
            task: 'From the plotted stock line, identify the order day, lead time and delivery quantity. Then assess the danger of a delayed delivery.',
            steps: [
              { label: 'Locate the order event', value: 'The descending stock line reaches the horizontal 800-packet re-order level on day 10. That is when the distributor places its order, not when inventory jumps.' },
              { label: 'Read the lead time', value: 'The delivery is marked by the vertical rise on day 16. Lead time is 16 − 10 = 6 days.' },
              { label: 'Read the arrival quantity', value: 'On day 16, inventory rises vertically from 200 to 1,800 packets: 1,800 − 200 = 1,600 packets delivered.' },
              { label: 'Interpret the protective buffer', value: 'At 100 packets used per day, the 200-packet buffer protects against about two additional days of normal demand, if those packets can be used. If the supplier is three days late, a stock-out can occur unless other measures are taken.' },
              { label: 'Make a conditional decision', value: 'If customers cannot tolerate a stock-out, the business could increase the order trigger, arrange a more reliable supplier or hold a larger buffer. More safety stock would, however, tie up cash and increase holding costs. Inspect demand variation and delivery reliability before choosing.' },
            ],
            conclusion: 'A graph-reading claim is not justified by simply recognising a formula. The order trigger, delivery event and lead-time gap must be located correctly. This unscored example does not prove the student can independently interpret an unseen chart.',
          },
          {
            type: 'quick-check',
            question: 'On the plotted chart, when is the order placed and when do new packets arrive?',
            options: [
              { id: 'day-ten-sixteen', text: 'Ordered on day 10 at 800 packets; delivered on day 16 after a six-day lead time' },
              { id: 'day-sixteen', text: 'Ordered and delivered on day 16 because that is when the stock line rises' },
              { id: 'day-zero', text: 'Ordered on day 0 and delivered on day 10 when stock reaches the re-order guide' },
              { id: 'buffer-trigger', text: 'Ordered only when the 200-packet buffer is reached on day 16' },
            ],
            correctOptionId: 'day-ten-sixteen',
            explanation: 'The line touches the 800-packet trigger at day 10, when the order is placed. The vertical rise on day 16 represents receipt, six days later. Learn checks are unscored and do not establish independent chart-reading mastery.',
          },
          {
            type: 'quick-check',
            question: 'If the same supplier arrives three days later than day 16 and use stays at 100 packets per day, what is the most defensible conclusion?',
            options: [
              { id: 'stockout-risk', text: 'The 200-packet buffer covers only about two extra days; there is a stock-out risk before delivery unless something changes' },
              { id: 'fully-protected', text: 'Buffer inventory guarantees enough stock for any delay' },
              { id: 'new-order', text: 'The re-order quantity automatically rises when lead time increases' },
              { id: 'cash-only', text: 'The delay can only affect cash flow, not customer service' },
            ],
            correctOptionId: 'stockout-risk',
            explanation: 'Two hundred packets ÷ 100 packets used each day = roughly two days of protection. A three-day delay would use more than this stock in the illustrated conditions. The business should consider both customer-service risk and the cash costs of a higher buffer.',
          },
          {
            type: 'misconception',
            title: 'An inventory control chart is not a promise of exact future stock.',
            paragraphs: [
              'The plotted stock line assumes the stated demand and delivery pattern. Actual levels may differ if usage accelerates, deliveries are partial or late, or goods are rejected. The re-order quantity equals maximum inventory minus stock immediately before delivery in this illustration, but not necessarily maximum minus buffer in every real business: the delivery may arrive at another level.',
            ],
          },
          {
            type: 'recap',
            items: [
              'Read inventory quantity vertically and time horizontally; identify the stock line rather than treating the guide levels as extra stock.',
              'Re-order level is the order trigger; lead time is the gap before receipt.',
              'Re-order quantity is the actual vertical stock increase on delivery, not necessarily the re-order level.',
              'Buffer inventory protects against uncertainty but has limits and ties up working capital.',
              'Interpret what the graph supports and what it does not; changes in demand, supplier reliability and storage costs affect the appropriate policy.',
            ],
          },
        ],
      }],
    }],
  }],
})
