import { dataDrillSchema } from '../../../schema'

export const networkPractice = [
  dataDrillSchema.parse({
    id: 'a-level-network-amendment-01',
    title: 'Amending a network after a duration change',
    prompt: 'A project currently has two complete paths. A–C–E takes 18 days and B–D–E takes 23 days, so B–D–E is critical. New information increases activity C by 7 days. Amend the path timings and identify the new critical path.',
    answer: 'A–C–E now takes 25 days (18 + 7), while B–D–E remains 23 days. A–C–E becomes the new critical path and the minimum project duration becomes 25 days under the stated assumptions. The exercise shows why a network should be amended when activity timings change rather than treating the original critical path as permanent.',
  }),
]
