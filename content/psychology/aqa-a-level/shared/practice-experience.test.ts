import { describe, expect, it } from 'vitest'

import { createLearningContentAdapter } from '../../../../src/engine/content/content-adapter'
import { practiceActivityModes } from '../../../practice-experience-schema'
import paper3 from '../paper-3'
import { psychologyCourseTruthTopics, psychologyTopics } from './course'
import {
  getPsychologyPracticeDesign,
  listPsychologyPracticeDesigns,
  psychologyDebateLinks,
  psychologyPracticeDesigns,
  psychologyPracticeExperienceMatrix as matrix,
} from './practice-experience'

const courseTruthIds = psychologyCourseTruthTopics.flatMap((topic) => topic.requirements.map((requirement) => requirement.requirementId))
const design = (id: string) => getPsychologyPracticeDesign(id)!
const formatsOf = (id: string) => design(id).formats
const aoOf = (formatId: string) => matrix.formats.find((format) => format.id === formatId)!.assessmentObjectives

describe('AQA Psychology 7182 practice experience matrix', () => {
  it('covers every Course Truth requirement exactly once and nothing else', () => {
    expect(courseTruthIds).toHaveLength(118)
    expect(matrix.requirements.map((item) => item.requirementId).sort()).toEqual([...courseTruthIds].sort())
    expect(psychologyPracticeDesigns).toHaveLength(118)
  })

  it('keys every design to an existing learner topic section', () => {
    const sections = new Set(psychologyTopics.flatMap((topic) => topic.sections.map((section) => `${topic.id}:${section.id}`)))
    for (const item of psychologyPracticeDesigns) expect(sections.has(`${item.topicId}:${item.sectionId}`)).toBe(true)
    expect(getPsychologyPracticeDesign('psy0101')?.requirementId).toBe('PSY-01-01')
  })

  it('maps every format onto Practice modes the learner-asset builder already produces', () => {
    for (const format of matrix.formats) {
      for (const mode of format.practiceModes) expect(practiceActivityModes).toContain(mode)
    }
    const used = new Set(matrix.requirements.flatMap((item) => item.formats))
    expect([...used].sort()).toEqual(matrix.formats.map((format) => format.id).sort())
  })

  it('places topics on the right paper, section and Paper 3 option group', () => {
    expect(design('PSY-04-01').placement).toMatchObject({ paperId: '7182/1', sectionId: 'D', optionGroup: null })
    expect(design('PSY-07-34').placement).toMatchObject({ paperId: '7182/2', sectionId: 'C', sectionMarks: 48 })
    expect(design('PSY-10-01').placement).toMatchObject({ paperId: '7182/3', sectionId: 'B', optionGroup: 1 })
    expect(design('PSY-14-01').placement).toMatchObject({ paperId: '7182/3', sectionId: 'C', optionGroup: 2 })
    expect(design('PSY-16-01').placement).toMatchObject({ paperId: '7182/3', sectionId: 'D', optionGroup: 3 })
  })

  it('gives every research methods point hands-on methods practice, not recall only', () => {
    const handsOn = ['study_autopsy', 'design_it', 'number_sprint', 'data_read', 'test_picker', 'sort_it', 'scenario_stem', 'debate_link', 'explain_chain']
    for (const item of listPsychologyPracticeDesigns().filter((candidate) => candidate.topicNumber === 7)) {
      expect(item.formats.some((format) => handsOn.includes(format)), item.requirementId).toBe(true)
    }
  })

  it('enforces the calculation boundaries in the v1.4 specification', () => {
    expect(formatsOf('PSY-07-32')).toContain('number_sprint')
    expect(design('PSY-07-32').demands).toContain('calculate')
    expect(formatsOf('PSY-07-34')).toEqual(['test_picker'])
    expect(design('PSY-07-34').demands).not.toContain('calculate')
    expect(design('PSY-07-29').demands).not.toContain('calculate')
    expect(design('PSY-07-26').specificationBoundary).toMatch(/standard deviation/i)
  })

  it('reflects v1.4 scope changes that older resources get wrong', () => {
    expect(design('PSY-01-01').specificationBoundary).toMatch(/internalisation and compliance only/)
    expect(design('PSY-02-02').specificationBoundary).toMatch(/Duration is not listed/)
    expect(design('PSY-05-03').specificationBoundary).toMatch(/biological approach/)
  })

  it('makes every Issues and Debates point a synoptic task with valid cross-topic examples', () => {
    const debates = psychologyDebateLinks()
    expect(debates).toHaveLength(6)
    for (const { debate, examples } of debates) {
      expect(debate.leadFormat.id).toBe('debate_link')
      expect(examples.length).toBeGreaterThanOrEqual(3)
      expect(examples.every((example) => example.topicNumber !== 8)).toBe(true)
    }
  })

  it('filters option topics to the learner\'s chosen Paper 3 options', () => {
    const forensic = psychologyTopics.find((topic) => topic.shortTitle === 'Forensic Psychology')!.id
    const designs = listPsychologyPracticeDesigns({ chosenOptionTopicIds: [forensic] })
    expect(designs.filter((item) => item.placement.optionGroup !== null).every((item) => item.topicId === forensic)).toBe(true)
    expect(designs.filter((item) => item.placement.optionGroup === null)).toHaveLength(71)
  })

  it('keeps sensitive topics third-person and evaluation-heavy practice in the mix', () => {
    for (const item of matrix.requirements.filter((candidate) => candidate.sensitivity === 'care')) {
      if (item.scenarioHook) expect(item.scenarioHook).not.toMatch(/\byou(r|'re)?\b/i)
    }
    for (const id of ['PSY-13-03', 'PSY-13-04', 'PSY-13-05', 'PSY-13-06']) expect(design(id).sensitivity).toBe('care')
    const withAo3 = matrix.requirements.filter((item) => item.formats.some((format) => aoOf(format).includes('AO3')))
    const ao3Floor = matrix.courseMixTargets.ao3ShareOfAssessmentPercent[0] / 100
    expect(withAo3.length / matrix.requirements.length).toBeGreaterThanOrEqual(ao3Floor)
  })

  it('reaches the site through the content adapter for every Psychology paper pack', () => {
    const adapter = createLearningContentAdapter(paper3)
    expect(adapter.listPracticeFormats()).toHaveLength(matrix.formats.length)
    expect(adapter.listPracticeDesigns()).toHaveLength(118)
    const socialInfluence = psychologyTopics.find((topic) => topic.shortTitle === 'Social influence')!.id
    expect(adapter.listPracticeDesigns(socialInfluence)).toHaveLength(4)
    expect(adapter.getPracticeDesign(socialInfluence, 'psy0102')?.formats[0]).toBe('evaluation_duel')
  })
})
