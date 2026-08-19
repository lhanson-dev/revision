import { describe, expect, it } from 'vitest'
import { assuranceCoverage, coverageCounts, dataSecurityCoverage, defectCoverage, journeyCoverage, parseAssuranceCoverageRegister } from './coverage-register'

describe('assurance coverage register projection', () => {
  it('parses the governed coverage table into stable records', () => {
    expect(assuranceCoverage.length).toBeGreaterThanOrEqual(20)
    expect(assuranceCoverage.find((record) => record.id === 'AV-01')).toMatchObject({ status: 'Covered', risk: 'High' })
    expect(assuranceCoverage.find((record) => record.id === 'DATA-01')).toMatchObject({ status: 'Partial', risk: 'Critical' })
    expect(defectCoverage()).toMatchObject({ id: 'DEF-01', status: 'Uncovered' })
  })

  it('keeps journey and data/security coverage independently countable', () => {
    const journeyCounts = coverageCounts(journeyCoverage())
    const dataCounts = coverageCounts(dataSecurityCoverage())

    expect(journeyCounts.Covered).toBeGreaterThan(0)
    expect(journeyCounts.Partial + journeyCounts.Uncovered).toBeGreaterThan(0)
    expect(dataCounts.Partial + dataCounts.Uncovered).toBeGreaterThan(0)
  })

  it('fails safely to Unknown for an unrecognised baseline label', () => {
    const markdown = '| XX-01 | Example | High | Browser | test.ts | Experimental | Add real evidence |'
    expect(parseAssuranceCoverageRegister(markdown)).toEqual([
      {
        id: 'XX-01',
        name: 'Example',
        risk: 'High',
        requiredAssurance: 'Browser',
        evidenceSource: 'test.ts',
        status: 'Unknown',
        gap: 'Add real evidence',
      },
    ])
  })
})
