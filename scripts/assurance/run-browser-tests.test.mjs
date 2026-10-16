import { describe, expect, it } from 'vitest'
import { browserCliArguments } from './run-browser-tests.mjs'
import { learnTargetedBrowserSpecs } from './change-classifier.mjs'

describe('responsive browser journey runner', () => {
  it('keeps the ordinary suite complete', () => {
    expect(browserCliArguments({ project: 'desktop', mode: 'conservative-full', fileList: '' }))
      .toEqual(['test', '--project=desktop'])
    expect(browserCliArguments({ project: 'tablet', mode: 'conservative-full', fileList: '' }))
      .toEqual(['test', '--project=tablet'])
  })

  it('executes the complete exact Learn mapping on all three viewports', () => {
    for (const project of ['phone', 'tablet', 'desktop']) {
      expect(browserCliArguments({
        project, mode: 'learn-targeted', fileList: learnTargetedBrowserSpecs.join(','),
      })).toEqual(['test', ...learnTargetedBrowserSpecs, `--project=${project}`])
    }
  })

  it('fails closed on unknown, partial or unexpected selections', () => {
    for (const mode of ['docs-only', '', 'unknown']) {
      expect(() => browserCliArguments({ project: 'desktop', mode, fileList: '' })).toThrow()
    }
    expect(() => browserCliArguments({ project: 'unknown', mode: 'conservative-full', fileList: '' })).toThrow()
    expect(() => browserCliArguments({ project: 'desktop', mode: 'learn-targeted', fileList: '' })).toThrow()
    expect(() => browserCliArguments({
      project: 'desktop', mode: 'learn-targeted', fileList: learnTargetedBrowserSpecs.slice(1).join(','),
    })).toThrow()
    expect(() => browserCliArguments({
      project: 'desktop', mode: 'learn-targeted', fileList: [...learnTargetedBrowserSpecs, 'tests/e2e/other.spec.ts'].join(','),
    })).toThrow()
    expect(() => browserCliArguments({
      project: 'desktop', mode: 'conservative-full', fileList: learnTargetedBrowserSpecs.join(','),
    })).toThrow()
  })
})
