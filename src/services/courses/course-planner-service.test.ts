import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { saveKnownPaperDates } from './course-planner-service'

type Row=Record<string, unknown>
function fakeAssessmentClient() {
  const rows: Row[]=[]
  let writes=0
  const client={
    from: (table: string) => {
      expect(table).toBe('revision_assessments')
      return {
        select: () => {
          const filters: [string,unknown][]=[]
          const query={
            eq: (key:string,value:unknown) => {filters.push([key,value]);return query},
            then: (resolve:(result:unknown)=>unknown) => Promise.resolve({
              data:rows.filter(row=>filters.every(([field,value])=>row[field]===value)),
              error:null,
            }).then(resolve),
          }
          return query
        },
        insert: (payload:Row) => ({
          select: () => ({
            single: async () => {
              writes++
              const row={...payload,assessment_id:'exam-'+writes}
              rows.push(row)
              return {data:row,error:null}
            },
          }),
        }),
        update: (payload:Row) => {
          const filters: [string,unknown][]=[]
          const query={
            eq: (key:string,value:unknown) => {filters.push([key,value]);return query},
            select: () => ({
              single: async () => {
                const row=rows.find(row=>filters.every(([field,value])=>row[field]===value))
                if(!row)return {data:null,error:{message:'Missing assessment'}}
                writes++
                Object.assign(row,payload)
                return {data:row,error:null}
              },
            }),
          }
          return query
        },
      }
    },
  } as unknown as SupabaseClient
  return {client,rows,get writes(){return writes}}
}

describe('Issue #698 Psychology Paper 3 first-use exam-date scope persistence',()=>{
  const base={
    courseId:'aqa:aqa-a-level:7182',subjectId:'psychology',
    moduleId:'psychology-aqa-a-level-7182-paper-3',
    title:'Paper 3: Issues and Options in Psychology',assessmentDate:'2027-06-09',
  }
  const selected=['issues-and-debates-in-psychology','relationships','schizophrenia','aggression']
  const changed=['issues-and-debates-in-psychology','gender','stress','forensic-psychology']
  it('writes the exact chosen topics and preserves them through repeated submission',async()=>{
    const stub=fakeAssessmentClient()
    const first={...base,scope:{topicIds:selected}}
    await saveKnownPaperDates(stub.client,'test-user',[first])
    expect(stub.rows).toHaveLength(1)
    expect(stub.rows[0].scope).toEqual({topicIds:selected})
    expect(stub.writes).toBe(1)
    await saveKnownPaperDates(stub.client,'test-user',[first])
    expect(stub.rows).toHaveLength(1)
    expect(stub.writes).toBe(1)
    expect(stub.rows[0].scope).toEqual({topicIds:selected})
  })
  it('updates the same saved exam when the learner corrects chosen options without changing the date',async()=>{
    const stub=fakeAssessmentClient()
    await saveKnownPaperDates(stub.client,'test-user',[{...base,scope:{topicIds:selected}}])
    await saveKnownPaperDates(stub.client,'test-user',[{...base,scope:{topicIds:changed}}])
    expect(stub.rows).toHaveLength(1)
    expect(stub.rows[0].scope).toEqual({topicIds:changed})
    expect(stub.writes).toBe(2)
  })
  it('preserves already-selected options when a legacy date-only update occurs',async()=>{
    const stub=fakeAssessmentClient()
    await saveKnownPaperDates(stub.client,'test-user',[{...base,scope:{topicIds:selected}}])
    await saveKnownPaperDates(stub.client,'test-user',[{...base,assessmentDate:'2027-06-10'}])
    expect(stub.rows).toHaveLength(1)
    expect(stub.rows[0].scope).toEqual({topicIds:selected})
    expect(stub.rows[0].assessment_date).toBe('2027-06-10')
  })
})
