import { describe, expect, it } from 'vitest'
import { validateFoundationInternalLearningGenerationContexts } from './foundation-internal-learning-assurance'

describe('Foundation internal learning generation context assurance', () => {
  it('accepts provider-v9 Learn generation plus binding contexts alongside Practice contexts', () => {
    expect(() => validateFoundationInternalLearningGenerationContexts({
      workUnitCount: 2,
      generationContextIds: [
        'learn-generate-1',
        'learn-bind-1',
        'practice-1',
        'learn-generate-2',
        'learn-bind-2',
        'practice-2',
      ],
    })).not.toThrow()
  })

  it('continues to accept the legacy minimum of one Learn and one Practice context per work unit', () => {
    expect(() => validateFoundationInternalLearningGenerationContexts({
      workUnitCount: 2,
      generationContextIds: ['learn-1', 'practice-1', 'learn-2', 'practice-2'],
    })).not.toThrow()
  })

  it('fails closed when fewer than two generation contexts are retained per work unit', () => {
    expect(() => validateFoundationInternalLearningGenerationContexts({
      workUnitCount: 2,
      generationContextIds: ['learn-1', 'practice-1', 'learn-2'],
    })).toThrow('Expected at least 4 generation contexts, found 3')
  })

  it('fails closed for duplicate or previously used generation contexts', () => {
    expect(() => validateFoundationInternalLearningGenerationContexts({
      workUnitCount: 1,
      generationContextIds: ['context-1', 'context-1'],
    })).toThrow('Generation contexts must be unique')

    expect(() => validateFoundationInternalLearningGenerationContexts({
      workUnitCount: 1,
      generationContextIds: ['learn-context', 'practice-context', 'learn-binding-context'],
      forbiddenContextIds: ['learn-binding-context'],
    })).toThrow('Generation contexts collide with prior Foundation/assurance contexts')
  })
})
