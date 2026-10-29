import { dataDrillSchema } from '../../../schema'

export const networkPractice = [
  dataDrillSchema.parse({
    id: 'a-level-network-amendment-01',
    title: 'Amending a network after a duration change',
    prompt: 'A project currently has two complete paths. A–C–E takes 18 days and B–D–E takes 23 days, so B–D–E is critical. New information increases activity C by 7 days. Amend the path timings and identify the new critical path.',
    answer: 'A–C–E now takes 25 days (18 + 7), while B–D–E remains 23 days. A–C–E becomes the new critical path and the minimum project duration becomes 25 days under the stated assumptions. The exercise shows why a network should be amended when activity timings change rather than treating the original critical path as permanent.',
  }),
  dataDrillSchema.parse({
    id: 'a-level-network-amendment-02',
    title: 'Draw and amend a network after an activity duration changes',
    prompt: 'Draw an activity-on-node network on paper. Start splits into A (4 days) and B (6 days); A precedes C (7 days), B precedes D (5 days); both C and D must finish before E (3 days) can begin, and E leads to Finish. Label each node and duration. Identify the initial critical paths. Then amend C from 7 to 11 days and mark the new critical path, minimum duration and total float on the B–D branch. Reveal the model only after attempting your own diagram.',
    answer: 'The dependency arrows are Start→A→C→E→Finish and Start→B→D→E→Finish, with E joining both branches. Initially A–C–E = 4 + 7 + 3 = 14 days and B–D–E = 6 + 5 + 3 = 14 days; both are critical (zero total float). After C increases to 11 days, A–C–E = 4 + 11 + 3 = 18 days, while B–D–E remains 14 days. E must wait for C, so the new critical path is A–C–E, project duration 18 days, and the B–D branch has 4 days of total float. Compare your own labelled nodes, dependency arrows, join at E, durations, critical path and float with this explanation. This self-check is not independently scored evidence of constructing or amending a diagram.',
  }),
]
