import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../services/supabase/browser-client'

type IntakeResponse = {
  jobId: string
  issueNumber: number
  issueUrl: string
}

export function ContentOperations() {
  const [officialUrl, setOfficialUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdJob, setCreatedJob] = useState<IntakeResponse | null>(null)

  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')
    setCreatedJob(null)
    setSubmitting(true)

    try {
      const parsed = new URL(officialUrl)
      if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS awarding-body URL.')

      const { data, error } = await supabase.functions.invoke<IntakeResponse>('content-factory-intake', {
        body: { officialUrl: parsed.toString(), notes: notes.trim() || undefined },
      })

      if (error) throw error
      if (!data?.issueNumber || !data.jobId || !data.issueUrl) {
        throw new Error('The Content Factory did not return a valid job record.')
      }

      setCreatedJob(data)
      setOfficialUrl('')
      setNotes('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Course intake failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="dashboard screen-dashboard page-screen content-operations" aria-labelledby="content-operations-title">
      <header className="page-heading">
        <p className="eyebrow">Revision Admin</p>
        <h1 id="content-operations-title">Content Operations</h1>
        <p>Add a course from its official awarding-body source. The Content Factory will keep the resulting job separate from learner publication and merge approval.</p>
      </header>

      <section className="content-operations-panel" aria-labelledby="add-course-title">
        <p className="eyebrow">Content</p>
        <h2 id="add-course-title">Add course</h2>
        <p className="muted">Start with the official course or specification page. Optional instructions are only for genuine scope or course constraints.</p>

        <form className="content-operations-form" onSubmit={addCourse}>
          <label>
            Official awarding-body URL
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.aqa.org.uk/..."
              required
              value={officialUrl}
              onChange={(event) => setOfficialUrl(event.target.value)}
            />
            <span>Use an official awarding-body page, not a third-party revision site.</span>
          </label>

          <label>
            Optional instruction
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="For example: include the complete course and all compulsory papers."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {submitError ? <p className="content-operations-error" role="alert">{submitError}</p> : null}
          {createdJob ? (
            <div className="content-operations-success" role="status">
              <strong>Course job created.</strong>
              <span>Job {createdJob.jobId} · GitHub issue #{createdJob.issueNumber}</span>
              <a href={createdJob.issueUrl} target="_blank" rel="noreferrer">Open job record</a>
            </div>
          ) : null}

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating course job…' : 'Add course'}
          </button>
        </form>
      </section>
    </main>
  )
}
