import { describe, expect, it } from 'vitest'
import { browserCliArguments } from './run-browser-tests.mjs'
import { learnTargetedBrowserSpecs, practiceTargetedBrowserSpecs } from './change-classifier.mjs'

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

  it('executes the complete Practice journey mapping on every viewport', () => {
    for (const project of ['phone', 'tablet', 'desktop']) {
      expect(browserCliArguments({
        project, mode: 'practice-targeted', fileList: practiceTargetedBrowserSpecs.join(','),
      })).toEqual(['test', ...practiceTargetedBrowserSpecs, `--project=${project}`])
    }
  })

  it('rejects incomplete and cross-domain targeted lists', () => {
    for (const project of ['phone', 'tablet', 'desktop']) {
      for (const files of [
        '',
        practiceTargetedBrowserSpecs.slice(1).join(','),
        [...practiceTargetedBrowserSpecs, 'tests/e2e/unknown.spec.ts'].join(','),
        learnTargetedBrowserSpecs.join(','),
      ]) {
        expect(() => browserCliArguments({ project, mode: 'practice-targeted', fileList: files })).toThrow()
      }
      expect(() => browserCliArguments({
        project, mode: 'learn-targeted', fileList: practiceTargetedBrowserSpecs.join(','),
      })).toThrow()
    }
  })

  it('partitions the entire desktop project into two accepted Playwright shards', () => {
    for (const [shard, flag] of [['1/2', '--shard=1/2'], ['2/2', '--shard=2/2']]) {
      expect(browserCliArguments({
        project: 'desktop', mode: 'conservative-full', fileList: '', shard,
      })).toEqual(['test', '--project=desktop', flag])
      expect(browserCliArguments({
        project: 'desktop', mode: 'learn-targeted', fileList: learnTargetedBrowserSpecs.join(','), shard,
      })).toEqual(['test', ...learnTargetedBrowserSpecs, '--project=desktop', flag])
      expect(browserCliArguments({
        project: 'desktop', mode: 'practice-targeted', fileList: practiceTargetedBrowserSpecs.join(','), shard,
      })).toEqual(['test', ...practiceTargetedBrowserSpecs, '--project=desktop', flag])
    }
  })

  it('rejects invalid or incomplete browser sharding rather than losing tests', () => {
    for (const project of ['phone', 'tablet']) {
      for (const shard of ['1/2', '2/2', '1/3']) {
        expect(() => browserCliArguments({
          project, mode: 'conservative-full', fileList: '', shard,
        })).toThrow()
      }
    }
    for (const shard of ['', '0/2', '3/2', '1/3', '2/3', '1/0', 'unsharded']) {
      expect(() => browserCliArguments({
        project: 'desktop', mode: 'conservative-full', fileList: '', shard,
      })).toThrow()
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
