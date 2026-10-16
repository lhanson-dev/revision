import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')
const playwrightConfig = readFileSync(new URL('../../playwright.config.ts', import.meta.url), 'utf8')
const browserJob = workflow.split('  responsive-browser:\n')[1]?.split('  # Preserve the required')[0] ?? ''

describe('full browser regression shard contract', () => {
  it('declares the exact phone/tablet/full-desktop partition in the live workflow', () => {
    const entries = [...browserJob.matchAll(/^          - project: (phone|tablet|desktop)\n            shardIndex: (\d+)\n            shardTotal: (\d+)$/gm)]
      .map((match) => `${match[1]}:${match[2]}/${match[3]}`)
    expect(entries).toEqual(['phone:1/1', 'tablet:1/1', 'desktop:1/2', 'desktop:2/2'])
    expect(browserJob).toContain("REVISION_BROWSER_SHARD: ${{ matrix.shardIndex }}/${{ matrix.shardTotal }}")
    expect(browserJob).toContain("node scripts/assurance/run-browser-tests.mjs")
  })

  it('retains disjoint and complete browser coverage, separate visual artifacts and the fail-closed required gate', () => {
    expect(playwrightConfig).toMatch(/fullyParallel:\s*true/)
    expect(browserJob).toContain('fail-fast: false')
    expect(browserJob).toContain('name: interface-visual-regression-${{ github.run_id }}-${{ matrix.project }}-${{ matrix.shardIndex }}of${{ matrix.shardTotal }}')
    const requiredGate = workflow.split('  foundation-quality:\n')[1]?.split('  database-assurance:\n')[0] ?? ''
    expect(requiredGate).toContain('name: Foundation quality')
    expect(requiredGate).toContain('needs: [assurance-plan, foundation-static, responsive-browser]')
    expect(requiredGate).toContain('RESPONSIVE_BROWSER: ${{ needs.responsive-browser.result }}')
    expect(requiredGate).toContain('if [ "$STATIC_QUALITY" != "success" ] || [ "$RESPONSIVE_BROWSER" != "success" ]; then')
  })
})
