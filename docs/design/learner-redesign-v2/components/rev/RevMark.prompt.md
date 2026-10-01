REV's Living E. Use it on REV cards, Ask REV, the REV nav entry and the Home hero, and nowhere else.

```jsx
<RevMark size={30} />                       // waiting: slow breathing
<RevMark size={40} state="listening" />    // student is typing
<RevMark size={40} state="thinking" />
<RevMark size={40} state="responding" onSettled={() => setState('waiting')} />
<RevMark size={260} halo onDark />          // Home hero watermark
```

With reduced motion the mark stays still and a short label ("REV is thinking") shows the state. Never recolour it (except `var(--teal-on)` on teal buttons), outline it or add a face.
