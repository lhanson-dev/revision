Subject visuals: `SubjectTile` (Home grid), `CourseCard` (Courses list), `SubjectBadge` (letter square = subject icon).

```jsx
<SubjectTile hue="blue" letter="B" name="Business" covered={4} total={10} />
<CourseCard hue="violet-bio" letter="Bi" name="Biology" board="OCR A" covered={3} total={12}
  understanding={{ gotit: 1, nearly: 1, needswork: 1, notstarted: 9 }} next="Cell transport" />
```

All courses in a subject share its hue (GCSE and A-level Business are both blue). No mastery %.
