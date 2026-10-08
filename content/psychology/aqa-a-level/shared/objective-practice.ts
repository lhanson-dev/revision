type PracticeRequirement = {
  requirementId: string
  subjectTruth: {
    definitionsAndCoreConcepts?: string[]
  }
}

export type PsychologyObjectivePracticeConcept = {
  label: string
  definition: string
  prompt: string
}

const conceptPattern = /^(.{2,110}?)\s+((?:(?:historically|primarily|partly|commonly|often)\s+)?(?:is|are|refers to|means|involves|concerns|describes|occurs when|treats|reflects|proposes|propose|proposed|examines|examine|examined|focuses on|focus on|uses|measures|explains|distinguishes|models|records|obtains|obtain|prepares|estimates|manipulates|classifies|converts|specifies|follows|relies on|relies|presents|argued|argues|studies|assigns|supports|predicts|seeks|emphasises|emphasizes|links|link|acts on|can reduce|can serve|can alter|can create|can support|defines|separates|consists of|transmit|restrict|protects|gives|organise|organises))\b(.*)$/i

export function stablePsychologyPracticeHash(value: string) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b)
  hash ^= hash >>> 16
  return hash >>> 0
}

export function psychologyObjectivePracticeConcept(requirement: PracticeRequirement): PsychologyObjectivePracticeConcept {
  const firstFull = requirement.subjectTruth.definitionsAndCoreConcepts?.[0]
  if (!firstFull) throw new Error(`Missing objective-practice definition for ${requirement.requirementId}`)
  const firstClause = firstFull.split(';')[0]?.trim() ?? firstFull.trim()

  if (requirement.requirementId === 'PSY-05-07') {
    return {
      label: 'Comparison of psychological approaches',
      definition: firstClause,
      prompt: `Which course focus is described here? ${firstClause.replace(/^Psychological approaches\b/, 'The major approaches')}`,
    }
  }

  const match = firstClause.match(conceptPattern)
  if (!match) throw new Error(`Cannot extract objective-practice concept for ${requirement.requirementId}: ${firstClause}`)
  const label = match[1]?.replace(/^(a|an|the)\s+/i, '').trim()
  const predicate = `${match[2]}${match[3] ?? ''}`.trim()
  if (!label || !predicate) throw new Error(`Incomplete objective-practice concept for ${requirement.requirementId}`)

  return {
    label,
    definition: firstClause,
    prompt: `Which concept or approach is described here? This concept ${predicate}`,
  }
}
