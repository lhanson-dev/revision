import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import './app/brand-tokens.css'
import './app/app.css'
import './app/living-e.css'
import './app/living-e-accessibility.css'
import './app/interface-system.css'
import './app/ui/ui-components.css'
import './app/ui/learner-v2-components.css'
import './app/interface-exam-experience.css'
import './app/exam.css'
import './app/exam-v2.css'
import './app/interactive-component-quality.css'
import { ExamSimulator, type ExamRuntime } from './app/ExamSimulator'
import { listRetainedAqa7132MockExams } from './app/retained-aqa-business-mock'
import { createSupabaseEvidenceStore, recordLearningEvidence } from './services/progress/learning-evidence-service'

// Dev-only recovery fixture: excluded from Vite production entrypoints. The
// endpoint is deliberately unreachable; Playwright supplies synthetic RLS-like
// PostgREST responses. Never connect this fixture to real learner accounts.
const userId = '00000000-0000-4000-8000-000000000041'
const courseId = 'aqa:aqa-a-level:7132'
const client = createClient('https://revision-recovery-fixture.invalid', 'synthetic-publishable-key', {
  auth: { persistSession: false, autoRefreshToken: false },
})
const evidenceStore = createSupabaseEvidenceStore(client)
// A representative two-question slice of retained AQA 7132 authored content.
 // The actual production catalogue/paper option checks remain covered separately.
const original = listRetainedAqa7132MockExams()[0]
const objective = original.questions.find(question => Boolean(question.correctOptionLabel))
const written = original.questions.find(question => !question.correctOptionLabel && question.id !== objective?.id)
const sample = [objective ?? original.questions[0], written ?? original.questions[1]]
const questions = sample.map(question => ({
  ...question, choiceGroup: undefined, choiceOption: undefined, choiceKind: undefined,
}))
const exam: ExamRuntime = {
  ...original, id: original.id + '-rec10-fixture', questions,
  totalMarks: questions.reduce((total, question) => total + question.marks, 0),
  printedMarks: undefined,
}
const checkpointContext = { client, userId, courseId, retentionDays: 14, timerPolicy: 'wall-clock' as const }
const moduleId = 'business-aqa-a-level-paper-1'

function Fixture() {
  const [visible, setVisible] = useState(true)
  const [serial, setSerial] = useState(0)
  return (
    <div className="planner-runtime" data-theme={new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light'}>
      <main className="page-screen">
        {!visible && <button onClick={() => { setSerial(value => value + 1); setVisible(true) }}>
          Reopen saved exam
        </button>}
        {visible && <ExamSimulator
          key={serial}
          exam={exam}
          moduleId={moduleId}
          saving={false}
          saveError=""
          autoStart="timed"
          onExit={() => setVisible(false)}
          onRecordEvidence={async (fact) => { await recordLearningEvidence(evidenceStore, userId, fact) }}
          checkpointContext={checkpointContext}
        />}
      </main>
    </div>
  )
}
createRoot(document.getElementById('root')!).render(<Fixture />)
