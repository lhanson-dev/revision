import { listCatalogueEntries } from '../engine/content/content-registry'
import { architectureBoundaries } from './foundation'

export function App() {
  const catalogue = listCatalogueEntries()

  return (
    <main className="foundation-shell">
      <p className="eyebrow">Revision technical foundation</p>
      <h1>The scalable Revision application is being established.</h1>
      <p className="intro">
        This build proves the new React, TypeScript and Vite foundation without replacing the current learner site yet.
      </p>

      <section aria-labelledby="content-registry">
        <h2 id="content-registry">Content registry</h2>
        <p>The React foundation now reads subject and paper metadata through the shared content adapter.</p>
        <ul>
          {catalogue.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.subject}</strong> · {entry.qualification} · {entry.paper} · {entry.topicCount} topics · {entry.totalMarks} marks
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="foundation-boundaries">
        <h2 id="foundation-boundaries">Application boundaries</h2>
        <ul>
          {architectureBoundaries.map((boundary) => (
            <li key={boundary}>{boundary}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
