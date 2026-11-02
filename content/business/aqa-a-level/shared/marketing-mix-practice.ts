/** #698 / Business 7132 §3.3.4 original, non-scored paper construction drills.
 * Founder AQA source rights are REFERENCE_ONLY. A model-answer reveal is not
 * evidence of independently marked diagrams, calculations or evaluation.
 */
import { dataDrillSchema } from '../../../schema'

export const businessMarketingMixDrills = [
  dataDrillSchema.parse({
    id: 'rev7132-334-boston-matrix-01',
    topic: 'marketing',
    title: 'Build and challenge a Boston Matrix',
    prompt: 'On paper, draw a labelled four-quadrant Boston Matrix. For this example only, treat annual market growth above 8% as high and relative share above 1.0 as high. Calculate relative market share as our percentage share divided by the largest rival’s percentage share. Plot and name: Everyday Pans (our share 30%, rival 15%, growth 2%), Smart Kettles (our 10%, rival 20%, growth 12%), Travel Mugs (our 8%, rival 16%, growth 3%), Eco Cookware (our 22%, rival 11%, growth 15%). Explain which line might supply cash for investment in another and which line warrants further investigation before investment. Why is withdrawing a dog or investing in a star not automatic?',
    answer: 'Use vertical market growth and horizontal relative market share axes with clearly identified high and low regions. Everyday Pans: 30/15 = 2.00, low growth = cash cow. Smart Kettles: 10/20 = 0.50, high growth = question mark. Travel Mugs: 8/16 = 0.50, low growth = dog. Eco Cookware: 22/11 = 2.00, high growth = star. Everyday Pans might generate cash for investment in Eco Cookware or a carefully tested Smart Kettles opportunity, but actual cash generation is unknown from these four data pairs. Travel Mugs could still earn a contribution or serve loyal customers; Eco Cookware might demand heavy investment with uncertain returns. Check cash, contribution, competition, growth forecasts and strategic fit before choosing. This model-reveal exercise does NOT independently mark a student-drawn matrix, working or evaluation, and does not award mastery evidence.',
  }),
  dataDrillSchema.parse({
    id: 'rev7132-334-seven-ps-01',
    topic: 'marketing',
    title: 'Design an integrated seven-P mix for a service',
    prompt: 'Write a short recommendation for Northgate Testing, an industrial laboratory service selling annual safety testing to manufacturing businesses. Customers care most about reliable results, downtime and transparent turnaround times. A lower-price rival has unreliable booking and reporting. For each of the seven Ps (product, price, place, promotion, people, process, physical environment), propose a specific integrated decision. Analyse how the mix supports a premium position, one realistic conflict between its elements and the evidence you would check before committing. Contrast one element with what would matter more for a mass-market consumer cleaning product.',
    answer: 'A coherent industrial service mix could offer accredited, reliable testing and documented reports (product); value-based annual contract pricing tied to turnaround, with transparent terms (price); direct contracts and on-site or courier sample collection (place); technical demonstrations and verified reliability data rather than mass viral posts (promotion); trained laboratory analysts and responsive account teams (people); dependable sample tracking and escalation (process); clear premises, evidence of accreditation and professional digital reports (physical environment). The promise depends on the laboratory having capacity to meet premium turnaround commitments: faster service could increase staffing costs, and premium pricing could exclude smaller buyers. Check turnaround records, costs, repeat-contract rates and willingness to pay. For a mass-market consumer cleaning product, retailer availability, packaging and price promotions may weigh more. A model reveal is NOT an independently scored seven-P application or written evaluation; no marks or mastery are awarded.',
  }),
]
