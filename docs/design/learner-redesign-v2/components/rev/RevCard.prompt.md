REV's card for suggestions, patterns and advice. The only component allowed to use `--deep`.

```jsx
<RevCard eyebrow="REV suggests" actions={<><Button size="sm">Add to Thursday</Button><Button size="sm" variant="rev">Not now</Button></>}>
  Thursday looks light. Want me to move Saturday's Maths there?
</RevCard>
<RevCard hero eyebrow="REV suggests · 45 min" title="Nail break-even before Friday's quiz" reason="Why: break-even is marked Needs work.">
  <StepRow label="Learn · Contribution" status="done" />
</RevCard>
```

Every suggestion must include a reason from data. One primary action, one `rev` secondary.
