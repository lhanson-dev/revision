Responsive page shell for every learner screen. Use it instead of placing Sidebar yourself.

```jsx
const { bp, stack } = useBreakpoint();
<AppShell active="home" bp={bp} onNavigate={go}>
  <div style={{ display: 'grid', gridTemplateColumns: stack ? 'minmax(0,1fr)' : 'minmax(0,1fr) 340px', gap: 24 }}>…</div>
</AppShell>
```

Sidebar >960 · Rail 621–960 · TabBar ≤620. `focus` hides nav (Exam Prep). `footer` is a sticky bottom slot. Content is centred in the 1100px canvas, and the page never scrolls sideways.
