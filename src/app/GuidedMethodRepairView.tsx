import type { GuidedMethodRepair } from './practice-repair'

/** Inert teaching, never a scored answer or independently validated method. */
export function GuidedMethodRepairView({ repair }: { repair: GuidedMethodRepair }) {
  return (
    <section className="practice-guided-repair" aria-label={`Guided repair: ${repair.title}`}>
      <p><strong>Try a different, unscored method check: {repair.title}</strong></p>
      <p>{repair.challenge}</p>
      <details>
        <summary>Reveal the worked method after your attempt</summary>
        <ol>{repair.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p>{repair.answer}</p>
        <p>{repair.caution}</p>
      </details>
      <p>This method check is for learning only. It is not marked and cannot clear a weakness; a different independent question is still required.</p>
    </section>
  )
}
