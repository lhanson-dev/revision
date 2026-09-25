import { z } from 'zod'

const slugSchema = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const explanationBlockSchema = z.object({
  type: z.literal('explanation'),
  heading: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
})

const keyIdeaBlockSchema = z.object({
  type: z.literal('key-idea'),
  label: z.string().min(1).default('Key idea'),
  definitions: z.array(z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
  })).min(1),
})

const exampleBlockSchema = z.object({
  type: z.literal('example'),
  label: z.string().min(1).default('Example'),
  title: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
})

const workedExampleBlockSchema = z.object({
  type: z.literal('worked-example'),
  label: z.string().min(1).default('Worked example'),
  title: z.string().min(1).optional(),
  steps: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).min(1),
  conclusion: z.string().min(1).optional(),
})

const relationshipBlockSchema = z.object({
  type: z.literal('relationship'),
  label: z.string().min(1).default('How it connects'),
  title: z.string().min(1).optional(),
  items: z.array(z.string().min(1)).min(2),
  explanation: z.string().min(1).optional(),
})

const comparisonBlockSchema = z.object({
  type: z.literal('comparison'),
  label: z.string().min(1).default('Compare'),
  title: z.string().min(1).optional(),
  columns: z.array(z.object({
    heading: z.string().min(1),
    items: z.array(z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    })).min(1),
  })).min(2).max(3),
})

const quantitativeBlockSchema = z.object({
  type: z.literal('quantitative'),
  label: z.string().min(1).default('Quantitative visual'),
  title: z.string().min(1),
  xLabel: z.string().min(1),
  yLabel: z.string().min(1),
  series: z.array(z.object({
    name: z.string().min(1),
    points: z.array(z.object({
      x: z.number(),
      y: z.number(),
      label: z.string().min(1).optional(),
    })).min(2),
  })).min(1).max(3),
  explanation: z.string().min(1).optional(),
})

const misconceptionBlockSchema = z.object({
  type: z.literal('misconception'),
  label: z.string().min(1).default('Common mix-up'),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
})

const recapBlockSchema = z.object({
  type: z.literal('recap'),
  label: z.string().min(1).default('What to remember'),
  items: z.array(z.string().min(1)).min(1),
})

export const learnBlockSchema = z.discriminatedUnion('type', [
  explanationBlockSchema,
  keyIdeaBlockSchema,
  exampleBlockSchema,
  workedExampleBlockSchema,
  relationshipBlockSchema,
  comparisonBlockSchema,
  quantitativeBlockSchema,
  misconceptionBlockSchema,
  recapBlockSchema,
])

export const learnPageSchema = z.object({
  id: slugSchema,
  topicId: slugSchema,
  sourceSectionIds: z.array(slugSchema).optional(),
  title: z.string().min(1),
  orientation: z.string().min(1),
  blocks: z.array(learnBlockSchema).min(1),
})

export const learnGroupSchema = z.object({
  id: slugSchema,
  title: z.string().min(1),
  pages: z.array(learnPageSchema).min(1),
})

export const learnChapterSchema = z.object({
  id: slugSchema,
  topicId: slugSchema,
  title: z.string().min(1),
  groups: z.array(learnGroupSchema).min(1),
})

export const learnCourseSchema = z.object({
  chapters: z.array(learnChapterSchema).min(1),
})

export type LearnBlock = z.infer<typeof learnBlockSchema>
export type LearnPage = z.infer<typeof learnPageSchema>
export type LearnGroup = z.infer<typeof learnGroupSchema>
export type LearnChapter = z.infer<typeof learnChapterSchema>
export type LearnCourse = z.infer<typeof learnCourseSchema>
