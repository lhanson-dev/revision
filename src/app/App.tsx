import { architectureBoundaries } from './foundation'

export function App() {
  return (
    <main className="foundation-shell">
      <p className="eyebrow">Revision technical foundation</p>
      <h1>The scalable Revision application is being established.</h1>
      <p className="intro">
        This build proves the new React, TypeScript and Vite foundation without replacing the current learner site yet.
      </p>
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
