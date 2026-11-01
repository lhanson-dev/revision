import { describe, expect, it } from 'vitest'
import audit from './data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'
import baseline from './data/aqa-psychology-7182-source-first-review.json'
import { psychologyCourseTruthTopics } from '../../content/psychology/aqa-a-level/shared/course'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'

const packs = [paper1, paper2, paper3]
const counts: Record<string,number> = {
  '4.1.1':4,'4.1.2':4,'4.1.3':5,'4.1.4':5,
  '4.2.1':6,'4.2.2':6,'4.2.3':6,'4.2.3.1':17,'4.2.3.2':8,'4.2.3.3':3,
  '4.3.1':6,'4.3.2':4,'4.3.3':6,'4.3.4':4,'4.3.5':6,
  '4.3.6':6,'4.3.7':6,'4.3.8':5,'4.3.9':4,'4.3.10':6,
}
describe('Psychology #698 source-bullet checkpoint against published Learn', () => {
  it('pins the exact AQA source and complete Section 4 parent-bullet locator universe', () => {
    expect(audit.qualification.pdfSha256).toBe(baseline.source.sha256)
    expect(audit.qualification.code).toBe('7182')
    expect(audit.qualification.rights).toBe('REFERENCE_ONLY')
    expect(audit.rows).toHaveLength(117)
    expect(new Set(audit.rows.map(x => x.sourceCheckpointId)).size).toBe(117)
    for(const [section,count] of Object.entries(counts)) {
      const rows = audit.rows.filter(x => x.sourceSection === section)
      expect(rows,section).toHaveLength(count)
      expect(rows.map(x => x.bulletOrdinal)).toEqual(Array.from({length:count},(_,i)=>i+1))
      expect(rows.every(x => x.printedPage >=17 && x.printedPage <=24)).toBe(true)
    }
  })

  it('reconciles 118 published prototype records against 117 AQA bullets without false one-to-one claims', () => {
    const ids = audit.rows.flatMap(row => row.candidatePrototypeRequirementIds)
    const original = psychologyCourseTruthTopics.flatMap(t=>t.requirements.map(r=>r.requirementId))
    expect(ids).toHaveLength(118)
    expect(new Set(ids).size).toBe(118)
    expect(new Set(ids)).toEqual(new Set(original))
    const split=audit.rows.filter(row=>row.candidatePrototypeRequirementIds.length === 2)
    expect(split).toHaveLength(1)
    expect(split[0]).toMatchObject({sourceSection:'4.2.1',bulletOrdinal:1,candidatePrototypeRequirementIds:['PSY-05-01','PSY-05-02']})
  })

  it('links every mapped candidate to existing Learn pages in all three actual published packs', () => {
    for(const pack of packs) {
      expect(pack.manifest.status).toBe('available')
      const pages=new Map(pack.learn!.chapters.flatMap(ch=>ch.groups.flatMap(g=>g.pages)).map(page=>[page.id,page]))
      for(const row of audit.rows) {
        for(let i=0;i<row.candidatePrototypeRequirementIds.length;i++) {
          const id=row.candidatePrototypeRequirementIds[i]!
          const page=pages.get(row.candidateLearnPageIds[i]!)
          expect(page,id).toBeDefined()
          expect(page?.topicId).toBe(row.candidateTopicId)
          expect(page?.sourceSectionIds).toContain(id.toLowerCase().replaceAll('-',''))
        }
      }
    }
  })

  it('keeps every educational and real-learner assertion unverified', () => {
    expect(audit.rows.every(x=>x.teachingAdequacy==='unverified'&&x.independentPracticeAdequacy==='unverified'&&x.examPrepAdequacy==='unverified'&&x.authenticatedLearnerAcceptance==='unverified')).toBe(true)
    expect(audit.completion.allSection4BulletsLocated).toBe(true)
    expect(audit.completion.allNamedSubRequirementsIndependentlyEnumerated).toBe(false)
    expect(audit.completion.realSignedInLearnerAccepted).toBe(false)
    expect(baseline.acceptance.all_atomic_learner_content_assured).toBe(false)
    const grouped=new Map<string,Set<string>>()
    for(const row of audit.rows) {
      if(!grouped.has(row.scopeGroup))grouped.set(row.scopeGroup,new Set())
      grouped.get(row.scopeGroup)!.add(row.candidateTopicId)
    }
    expect(grouped.get('compulsory')?.size).toBe(8)
    for(const group of ['group-1','group-2','group-3'])expect(grouped.get(group)?.size).toBe(3)
  })
})
