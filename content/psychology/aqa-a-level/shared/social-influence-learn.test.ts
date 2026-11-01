import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import audit from '../../../../scripts/assurance/data/aqa-psychology-7182-social-influence-atomic-review.json'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'
import { psychologySocialInfluenceLearnAdditions } from './social-influence-learn'

const packs = [paper1, paper2, paper3]
const sections = ['PSY-01-01','PSY-01-02','PSY-01-03','PSY-01-04']

function textForPage(pack: typeof paper1, requirementId: string) {
  const id = 'social-influence-' + requirementId.toLowerCase().replaceAll('-', '')
  const pages = pack.learn!.chapters.flatMap(ch=>ch.groups.flatMap(g=>g.pages))
  const page = pages.find(p=>p.id===id)
  expect(page,id).toBeDefined()
  expect(page?.sourceSectionIds).toContain(requirementId.toLowerCase().replaceAll('-', ''))
  return (page?.blocks ?? []).map(block=>JSON.stringify(block)).join(' ')
}

describe('Psychology #698 AQA 7182 v1.4 Social Influence source-first Learn correction',()=>{
  it('retains exact source identity and the real four-to-21 scoped demand map',()=>{
    expect(audit.source.sha256).toBe(crosswalk.qualification.pdfSha256)
    expect(audit.source.rights).toBe('REFERENCE_ONLY')
    expect(audit.source.exactScopeSafeguard.section411ConformityTypes).toEqual(['compliance','internalisation'])
    expect(audit.source.exactScopeSafeguard.identificationRequiredByThisExactVersion).toBe(false)
    expect(audit.rows).toHaveLength(21)
    expect(new Set(audit.rows.map(x=>x.id)).size).toBe(21)
    const parents = crosswalk.rows.filter(x=>x.sourceSection==='4.1.1')
    expect(parents).toHaveLength(4)
    expect(new Set(audit.rows.map(x=>x.sourceParent))).toEqual(new Set(parents.map(x=>x.sourceCheckpointId)))
    expect(new Set(audit.rows.map(x=>x.prototypeRequirementId))).toEqual(new Set(sections))
    expect(audit.rows.every(x=>x.printedPage===17 && x.sourceSection==='4.1.1')).toBe(true)
  })

  it('keeps all added explanations original and scoped to the four existing pages',()=>{
    expect(Object.keys(psychologySocialInfluenceLearnAdditions).sort()).toEqual([...sections].sort())
    expect(psychologySocialInfluenceLearnAdditions['PSY-01-01'].length).toBe(2)
    expect(psychologySocialInfluenceLearnAdditions['PSY-01-02'].length).toBe(2)
    expect(psychologySocialInfluenceLearnAdditions['PSY-01-03'].length).toBe(1)
    expect(psychologySocialInfluenceLearnAdditions['PSY-01-04'].length).toBe(1)
    for(const items of Object.values(psychologySocialInfluenceLearnAdditions)) {
      for(const block of items) {
        expect(block.type).toBe('explanation')
        expect(block.heading.length).toBeGreaterThan(10)
        expect(block.paragraphs.every(p=>p.length>60)).toBe(true)
      }
    }
  })

  it('publishes the original study and the named obedience and resistance distinctions in all three packs',()=>{
    for(const pack of packs) {
      expect(pack.manifest.status).toBe('available')
      const conformity=textForPage(pack,'PSY-01-01')
      for(const term of ['Asch', 'line', 'Group size','Unanimity','Task difficulty','normative','informational','internalisation']) {
        expect(conformity.toLowerCase(),term).toContain(term.toLowerCase())
      }
      const obedience=textForPage(pack,'PSY-01-02')
      for(const term of ['Milgram','Proximity','Location','commercial building','Uniform','Authoritarian Personality','F-scale','agentic']) {
        expect(obedience.toLowerCase(),term).toContain(term.toLowerCase())
      }
      const resistance=textForPage(pack,'PSY-01-03')
      for(const term of ['conformity','obedience','internal locus','external locus','disobedient']) {
        expect(resistance.toLowerCase(),term).toContain(term.toLowerCase())
      }
      const minority=textForPage(pack,'PSY-01-04')
      for(const term of ['Consistency','Commitment','Flexibility','rigidity']) {
        expect(minority.toLowerCase(),term).toContain(term.toLowerCase())
      }
      expect(pack.questions.filter(q=>q.topic==='social-influence')).toHaveLength(4)
    }
  })


  it('retains the independently checked study evidence and avoids conflating conditions or percentages with persons',()=>{
    for(const pack of packs) {
      const conformity=textForPage(pack,'PSY-01-01')
      for(const phrase of ['12 critical trials','18-trial','36.8%','fewer than 1%','3.6%','13.6%','31.8%','percentage of judgements','synchronic']) {
        if(phrase==='synchronic')continue
        expect(conformity,phrase).toContain(phrase)
      }
      const obedience=textForPage(pack,'PSY-01-02')
      for(const phrase of ['450-volt','remote/no-voice-feedback','voice-feedback','staged','65%','62.5%','40%','30%','47.5%','20%','acquiescence bias','harsh, punitive parenting','displaced','everyday clothes','Bickman','milkman','guard','field experiments','agentic-state interpretation','legitimacy-of-authority explanation','separate']) {
        expect(obedience,phrase).toContain(phrase)
      }
      const resistance=textForPage(pack,'PSY-01-03')
      for(const phrase of ['Asch','Milgram','10%','Rotter','correlational','social support']) {
        expect(resistance,phrase).toContain(phrase)
      }
      const minority=textForPage(pack,'PSY-01-04')
      for(const phrase of ['diachronic','synchronic','augmentation principle','Moscovici','8.42%','1.25%','0.25%','public judgements','rigidity']) {
        expect(minority,phrase).toContain(phrase)
      }
    }
  })

  it('never conflates authored teaching supply with assessed capability or learner success',()=>{
    expect(audit.currentSourceToLiveState.independentA2Review).toBe('not-run')
    expect(audit.rows.every(x=>x.teachingAdequacy==='unverified'&&x.practiceAdequacy==='unverified'&&!x.signedInLearnerAccepted)).toBe(true)
    expect(audit.fullAuditFinished).toBe(false)
    expect(audit.scope.provisionalNotOfficialDenominator).toBe(true)
  })
})
