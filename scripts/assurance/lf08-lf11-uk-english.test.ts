import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as ts from 'typescript'

import business1 from '../../content/business/aqa-a-level/paper-1'
import business2 from '../../content/business/aqa-a-level/paper-2'
import business3 from '../../content/business/aqa-a-level/paper-3'
import psychology1 from '../../content/psychology/aqa-a-level/paper-1'
import psychology2 from '../../content/psychology/aqa-a-level/paper-2'
import psychology3 from '../../content/psychology/aqa-a-level/paper-3'

/**
 * LF-08/LF-11. Warn on unambiguously US-only learner wording in the ACTUAL
 * published packs and learner-visible TSX/TS string literals. Do not rewrite
 * source keys, filenames, historical scored answer text or scientific terms.
 *
 * This is a narrow repeatable lexical guard, not a proof that every usage of
 * practice (noun) / practise (verb) is semantically correct.
 */
const americanEnglish = /\b(?:behaviors?|behavioral(?:ly)?|analyz(?:e|es|ed|ing)|organiz(?:e|es|ed|ing|ation|ations)|recogniz(?:e|es|ed|ing)|summariz(?:e|es|ed|ing)|prioritiz(?:e|es|ed|ing)|personaliz(?:e|es|ed|ing)|utiliz(?:e|es|ed|ing)|memorize(?:s|d|r)?|counselor|centered|colorful|colored|judgment|practicing|practiced|(?:can|should|must) practice)\b/gi

function flags(text: string): string[] {
  return [...text.matchAll(americanEnglish)].map(match => match[0])
}

function appSourceFiles(dir: string): string[] {
  const result: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) result.push(...appSourceFiles(path))
    else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\.[jt]sx?$/.test(entry.name)) result.push(path)
  }
  return result
}

function sourceVisibleStrings(path: string): string[] {
  const source = readFileSync(path, 'utf8')
  const syntax = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const found: string[] = []
  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) ||
        ts.isJsxText(node)) {
      found.push(node.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(syntax)
  return found
}

function stringsIn(value: unknown, results: string[], depth = 0) {
  if (depth > 30) throw new Error('Unexpected course pack depth while auditing published copy')
  if (typeof value === 'string') results.push(value)
  else if (Array.isArray(value)) value.forEach(item => stringsIn(item, results, depth + 1))
  else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => stringsIn(item, results, depth + 1))
  }
}

describe('LF-08 / LF-11 published UK-English regression', () => {
  it('recognises common US spelling and verb forms as review defects', () => {
    expect(flags('Analyze the behavior and then practice your answer.')).toEqual(['Analyze', 'behavior'])
    expect(flags('You should practice a written answer.')).toEqual(['should practice'])
    expect(flags('Organise your thoughts and practise this question.')).toEqual([])
  })

  it('checks all six real published AQA Business and Psychology course packs', () => {
    const packs = [business1, business2, business3, psychology1, psychology2, psychology3]
    for (const pack of packs) {
      const strings: string[] = []
      stringsIn(pack, strings)
      const errors = strings.flatMap(value => flags(value).map(word => `${word}: ${value.slice(0, 140)}`))
      expect(errors, `${pack.manifest.id} has US-English learner wording`).toEqual([])
    }
  })

  it('checks learner-app JSX and string literals without confusing DOM/CSS identifiers with learner words', () => {
    const files = appSourceFiles(join(process.cwd(), 'src', 'app'))
    expect(files.length).toBeGreaterThan(30)
    const errors = files.flatMap(path => sourceVisibleStrings(path)
      .flatMap(value => flags(value).map(word => `${path}: ${word}: ${value.slice(0, 140)}`)))
    expect(errors).toEqual([])
  })
})
