import type { LearnBlock } from '../../../../content/learn-schema'

export type LearnBlockOf<T extends LearnBlock['type']> = Extract<LearnBlock, { type: T }>
