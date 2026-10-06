import type { LearnBlock as LearnBlockData } from '../../../../content/learn-schema'
import { QuickCheck } from '../QuickCheck'
import { Comparison } from './Comparison'
import { Example } from './Example'
import { Explanation } from './Explanation'
import { KeyIdea } from './KeyIdea'
import { Misconception } from './Misconception'
import { Quantitative } from './Quantitative'
import { Recap } from './Recap'
import { Relationship } from './Relationship'
import { WorkedExample } from './WorkedExample'

export type LearnBlockProps = {
  block: LearnBlockData
  /** Where the layout has put a key idea: the right-hand margin or full width. Ignored by other types. */
  placement?: 'full' | 'margin'
}

/**
 * The one renderer for every Learn block. The content says what a block is (`type`); the UI decides
 * how it looks. The switch is exhaustive: adding a type to the schema without a case here is a
 * TypeScript error, and a type the schema does not know never reaches this point because content
 * validation rejects it. There is deliberately no generic fallback style.
 */
export function LearnBlock({ block, placement = 'full' }: LearnBlockProps) {
  switch (block.type) {
    case 'explanation': return <Explanation block={block} />
    case 'key-idea': return <KeyIdea block={block} placement={placement} />
    case 'example': return <Example block={block} />
    case 'worked-example': return <WorkedExample block={block} />
    case 'relationship': return <Relationship block={block} />
    case 'comparison': return <Comparison block={block} />
    case 'quantitative': return <Quantitative block={block} />
    case 'misconception': return <Misconception block={block} />
    // Unscored: QuickCheck has no answer callback and writes nothing, so it cannot touch progress.
    case 'quick-check': return <QuickCheck question={block.question} options={block.options} correctOptionId={block.correctOptionId} explanation={block.explanation} />
    case 'recap': return <Recap block={block} />
    default: return assertNever(block)
  }
}

function assertNever(block: never): never {
  throw new Error(`Unknown Learn block type: ${JSON.stringify(block)}`)
}
