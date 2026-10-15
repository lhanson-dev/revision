import type { PreparationProgramme, PreparationWeek } from '../engine/planning/preparation'
import { formatMinutes, longDate, weekRangeLabel } from './plan-dates'
import { Button, Surface } from './ui'

interface Props {
  programme: PreparationProgramme
  courseLabel: (courseId: string) => string
  topicLabel: (courseId: string, topicId: string) => string
  onOpenWeek: (weekStart: string) => void
  view: 'day' | 'week' | 'month'
  anchor: string
}
function dated(key: string) {
  return `${longDate(key)} ${key.slice(0, 4)}`
}
function StudyWeek({ week, courseLabel, topicLabel, onOpenWeek }: Pick<Props, 'courseLabel' | 'topicLabel' | 'onOpenWeek'> & { week: PreparationWeek }) {
  return (
    <li className="pln-programme__week">
      <div>
        <strong>{weekRangeLabel(week.weekStart)} {week.visibleUntil.slice(0, 4)}</strong>
        <p>{week.availableMinutes === null ? 'Available study time unknown'
          : week.availableMinutes === 0 ? 'No saved study time for this week'
            : `${formatMinutes(week.availableMinutes)} known available; ${formatMinutes(week.allocatedMinutes)} allocated to supported objectives`}</p>
        {week.objectives.length ? (
          <>
            <p><strong>Preparation objectives</strong></p>
            <ul aria-label={`Study objectives for week of ${dated(week.weekStart)}`}>
              {week.objectives.map((objective) => (
                <li key={objective.candidateId}>
                  <strong>{courseLabel(objective.courseId)} — {topicLabel(objective.courseId, objective.topicId)}</strong>
                  <span> · {objective.purpose} · {formatMinutes(objective.estimatedMinutes)} estimated</span>
                  <p>{objective.reason}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{week.availableMinutes === 0
            ? 'No objectives allocated while availability is zero.'
            : week.availableMinutes === null
              ? 'Set realistic study time to allocate objectives; you can still start an unscheduled activity.'
              : 'No further verified activities are allocated this week. Later checks depend on new learning evidence; this is not proof the course is complete.'}</p>
        )}
        {week.milestones.length > 0 && (
          <ul aria-label="Exams and assessments this week">
            {week.milestones.map((milestone) =>
              <li key={milestone.assessmentId}>{milestone.title} · {courseLabel(milestone.courseId)} · {dated(milestone.date)}</li>)}
          </ul>
        )}
      </div>
      <Button variant="tertiary" size="compact" onClick={() => onOpenWeek(week.weekStart)}>
        View week<span className="sr-only"> of {dated(week.weekStart)}</span>
      </Button>
    </li>
  )
}
export function PlanProgrammeOutlook({ programme, courseLabel, topicLabel, onOpenWeek, anchor, view }: Props) {
  const final = programme.finalKnownAssessment
  const selected = programme.weeks.filter((week) =>
    view === 'month' ? week.visibleUntil.slice(0, 7) >= anchor.slice(0, 7)
      && week.visibleFrom.slice(0, 7) <= anchor.slice(0, 7)
      : week.weekStart <= anchor && week.visibleUntil >= anchor)
  const upcoming = programme.weeks.filter((week) => week.visibleUntil >= programme.today).slice(0, 3)
  const listProps = { courseLabel, topicLabel, onOpenWeek }
  return (
    <section className="pln-programme" aria-label="Your full exam programme">
      <Surface variant="quiet" className="pln-programme__surface">
        <h2>Preparation towards your exams</h2>
        {!final ? (
          <p>Add known exam dates to see a paper-linked programme. Revision will not invent your final exam date. Supported study remains available through Courses.</p>
        ) : (
          <>
            <p>Working towards <strong>{dated(final)}</strong> across {programme.weeks.length} weeks. Revision uses known paper deadlines, your evidence and saved study time to allocate supported preparation objectives. These remain adaptable forecasts, not booked sessions or promises of exam readiness.</p>
            <p>We have identified {programme.requiredMinutes > 0 ? formatMinutes(programme.requiredMinutes) : 'no measured time'} of currently supported preparation opportunities; {formatMinutes(programme.allocatedMinutes)} can be allocated with known availability. This is <strong>not</strong> a measurement of all syllabus work still needed.</p>
            {programme.requirements.length > 0 && (
              <div aria-label="Verified course knowledge requirements">
                <h3>What your known papers require</h3>
                <p>The approved course and paper mappings identify {programme.requirements.length} distinct knowledge topics across your known exams. {programme.requirements.filter((req) => req.supportedCandidateIds.length > 0).length} currently have supported activity opportunities, and {programme.requirements.filter((req) => req.allocatedCandidateIds.length > 0).length} have at least one proposed preparation objective. These are planning facts, not evidence that a topic has been learnt or the whole syllabus has been covered.</p>
                <details>
                  <summary>Explore the knowledge requirements and preparation gaps</summary>
                  <ul>
                    {programme.requirements.map((requirement) => (
                      <li key={requirement.courseId + ':' + requirement.topicId}>
                        <strong>{courseLabel(requirement.courseId)} — {topicLabel(requirement.courseId, requirement.topicId)}</strong>
                        <span> · Relevant paper dates: {requirement.papers.map((paper) => dated(paper.assessmentDate)).join(', ')}</span>
                        <p>{requirement.evidenceStatus === 'unknown'
                          ? 'Current understanding is unknown.'
                          : requirement.evidenceStatus === 'needs-work'
                            ? 'Existing scored evidence indicates more work is useful.'
                            : requirement.evidenceStatus === 'provisional'
                              ? 'Some evidence exists, but the picture is still provisional.'
                              : 'There is supported scored evidence for this topic, not a guarantee of exam readiness.'}</p>
                        <p>{requirement.hasAcceptedSession
                          ? 'You have saved a session for this topic; that choice is not proof of completion or understanding.'
                          : requirement.allocatedCandidateIds.length > 0
                            ? 'Revision has proposed supported preparation activity for this topic.'
                            : requirement.supportedCandidateIds.length > 0
                              ? 'Approved activities exist, but none are allocated in the current forecast.'
                              : 'No supported activity has been verified for this topic yet.'}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
            {programme.paperResponseRequirements.length > 0 && (
              <div aria-label="Verified paper response requirements">
                <h3>Paper response formats</h3>
                <p>Learning the topics is only part of exam preparation. Your known papers also require different answer formats. Revision identifies these from approved paper structures and only counts practice when an exact published question is mapped to the section.</p>
                <details>
                  <summary>Explore paper response requirements and practice gaps</summary>
                  <ul>
                    {programme.paperResponseRequirements.map((requirement) => (
                      <li key={requirement.sectionId}>
                        <strong>{courseLabel(requirement.courseId)} — {requirement.sectionName}</strong>
                        <span> · {dated(requirement.assessmentDate)} · {requirement.responseFormat} · {requirement.marks} marks</span>
                        <p>{requirement.allocatedPracticeCandidateIds.length
                          ? 'Revision has proposed a verified, section-matched exam practice opportunity. This does not prove proficiency.'
                          : requirement.verifiedPracticeCandidateIds.length
                            ? 'A verified question exists for this format, but it is not allocated in the current forecast.'
                            : 'No exact section-matched practice opportunity is verified yet. This requirement is not treated as covered.'}</p>
                        {requirement.verifiedAssessmentObjectives.length > 0 &&
                          <p>Verified practice question assessment objectives: {requirement.verifiedAssessmentObjectives.join(', ')}. These do not demonstrate mastery of the full paper.</p>}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
            {programme.verifiedPaperDemands.length > 0 && (
              <div aria-label="Verified paper response demands">
                <h3>Exam-response skills to prepare for</h3>
                <ul>{programme.verifiedPaperDemands.map((paper) =>
                  <li key={paper.assessmentId}>
                    <strong>{courseLabel(paper.courseId)} — {paper.title}</strong>
                    <span> · {dated(paper.date)} · Verified practice covers {paper.assessmentObjectives.join(', ') || 'documented paper demands'} using {paper.questionCount} supported question opportunities.</span>
                    <p>These are future exam-skill goals, not claims that the knowledge is already secure or that all paper demands are covered. Revision will adapt the next supported task using your evidence.</p>
                  </li>)}</ul>
              </div>
            )}
            {programme.constraints.length > 0 && <div aria-label="Preparation limitations">
              <strong>What we cannot yet guarantee</strong>
              <ul>{programme.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul>
            </div>}
            {selected.length > 0 && (
              <>
                <h3>{view === 'month' ? 'Objectives for this month' : 'Objectives for this week'}</h3>
                <ol className="pln-programme__weeks">
                  {selected.map((week) => <StudyWeek key={week.weekStart} week={week} {...listProps} />)}
                </ol>
              </>
            )}
            <details className="pln-programme__details">
              <summary>Explore the whole preparation programme and examination milestones</summary>
              <ol className="pln-programme__weeks">
                {programme.weeks.map((week) => <StudyWeek key={week.weekStart} week={week} {...listProps} />)}
              </ol>
            </details>
            {selected.length === 0 && (
              <>
                <h3>Coming up</h3>
                <ol className="pln-programme__weeks">
                  {upcoming.map((week) => <StudyWeek key={week.weekStart} week={week} {...listProps} />)}
                </ol>
              </>
            )}
            <p className="pln-card__note">Exact tasks appear in your near-term Day and Week plan. A preliminary objective is not accepted work; Revision will recalculate after meaningful evidence or availability changes.</p>
          </>
        )}
      </Surface>
    </section>
  )
}
