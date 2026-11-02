/**
 * Deterministic signals for educational review, not a verdict on validity.
 * A single repeated answer letter, a repeated technical term, and intentional
 * spaced retrieval are not automatic content failures.
 */
export type McqQualityInput = {
  id: string
  prompt: string
  options: readonly string[]
  correctOption: number
  explanation: string
}

export type McqReviewFinding = {
  rule: 'invalid-key' | 'duplicate-option' | 'repeated-option-set' | 'answer-position-bias'
    | 'answer-position-run' | 'near-duplicate-stem' | 'length-clue' | 'generic-feedback'
  ids: string[]
  detail: string
  disposition: 'block' | 'review'
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
}

function stemSimilarity(a: string, b: string) {
  const x = new Set(normalise(a).split(' ').filter(Boolean))
  const y = new Set(normalise(b).split(' ').filter(Boolean))
  const shared = [...x].filter(word => y.has(word)).length
  const union = new Set([...x, ...y]).size
  return union ? shared / union : 0
}

export function reviewMcqQuality(items: readonly McqQualityInput[]): McqReviewFinding[] {
  const findings: McqReviewFinding[] = []
  const seenOptionSets = new Map<string, string[]>()
  for (const item of items) {
    if (item.correctOption < 0 || item.correctOption >= item.options.length ||
      !Number.isInteger(item.correctOption)) {
      findings.push({ rule: 'invalid-key', ids: [item.id], detail: 'Answer key is out of range.', disposition: 'block' })
    }
    const options = item.options.map(normalise)
    if (options.some(option => !option) || new Set(options).size !== options.length) {
      findings.push({ rule: 'duplicate-option', ids: [item.id], detail: 'Empty or duplicate answer wording.', disposition: 'block' })
    }
    const key = [...options].sort().join('\u241f')
    const grouped = seenOptionSets.get(key) ?? []
    grouped.push(item.id)
    seenOptionSets.set(key, grouped)
    if (/the keyed answer names the concept defined by the stem/i.test(item.explanation)) {
      findings.push({ rule: 'generic-feedback', ids: [item.id], detail: 'Feedback gives a reusable template rather than a specific misconception.', disposition: 'review' })
    }
    const lengths = item.options.map(value => value.length)
    const answerLength = lengths[item.correctOption] ?? 0
    const competitors = lengths.filter((_, i) => i !== item.correctOption)
    if (competitors.length >= 3 && answerLength > Math.max(...competitors) * 2.5) {
      findings.push({ rule: 'length-clue', ids: [item.id], detail: 'Correct answer is over 2.5 times longer than every distractor.', disposition: 'review' })
    }
  }
  for (const grouped of seenOptionSets.values()) {
    if (grouped.length >= 2) findings.push({
      rule: 'repeated-option-set', ids: grouped,
      detail: `Identical answer-option set used in ${grouped.length} separate questions.`, disposition: 'review',
    })
  }
  // A large directional imbalance is a review signal, never a hard failure.
  if (items.length >= 12) {
    const counts = new Map<number, number>()
    for (const item of items) counts.set(item.correctOption, (counts.get(item.correctOption) ?? 0) + 1)
    const [position, maximum] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!
    if (maximum / items.length >= 0.6) findings.push({
      rule: 'answer-position-bias', ids: items.map(item => item.id),
      detail: `Position ${'ABCD'[position] ?? String(position)} accounts for ${maximum}/${items.length} answers (>=60%).`,
      disposition: 'review',
    })
  }
  // Session order can vary: this is a deterministic authored-order approximation,
  // not a claim to test every adaptive sequence.
  for (let start = 0; start < items.length;) {
    let end = start + 1
    while (end < items.length && items[end]!.correctOption === items[start]!.correctOption) end++
    if (end - start >= 4) findings.push({
      rule: 'answer-position-run', ids: items.slice(start, end).map(item => item.id),
      detail: `${end - start} consecutive authored questions share a correct-answer position.`, disposition: 'review',
    })
    start = end
  }
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (normalise(items[i]!.prompt) === normalise(items[j]!.prompt) ||
        (items[i]!.prompt.length > 50 && items[j]!.prompt.length > 50 && stemSimilarity(items[i]!.prompt, items[j]!.prompt) >= 0.85)) {
        findings.push({
          rule: 'near-duplicate-stem', ids: [items[i]!.id, items[j]!.id],
          detail: 'Nearly identical question stems require a content reviewer to decide whether reinforcement is meaningful.', disposition: 'review',
        })
      }
    }
  }
  return findings
}
