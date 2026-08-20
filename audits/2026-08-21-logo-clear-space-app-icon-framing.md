# Logo clear-space and app-icon framing — 21 August 2026

**Status:** Founder-directed identity production decision  
**Authority impact:** specialised rules captured in `20-brand-and-experience/Identity Asset Usage Rules.md`  
**Implementation impact:** canonical app/browser masters added under `assets/brand/`; no learner runtime change in this PR

## Trigger

The Founder instructed: **Define logo clear-space and app icon framing**.

The approved Brand System already required minimum-size / clear-space guidance and an app-icon/browser package, but did not yet contain numeric production rules.

## Decision

### Full Revision wordmark

- Define x as the visible height of one teal E bar in the canonical wordmark.
- Keep at least **2x clear space on every side** of the visible artwork.
- Measure from visible artwork bounds, not the 1600×400 source artboard.
- Minimum full-wordmark width: **160px digital** / **35mm print**.
- Below that threshold, use an approved compact REV or Living E treatment rather than compressing the full wordmark.

### Standalone Living E

- Define e as one bar height in the canonical Living E master.
- Keep **1e clear space outside the visible outer halo** when the mark is used standalone outside a control/icon safe area.

### Primary app icon

- **1024×1024** canonical canvas.
- Full-bleed Deep Teal Ink `#0F2F36` background.
- Canonical Living E scaled proportionally into a centred **760×760** identity frame.
- No baked outer corner radius; platform masks own the outer shape.
- No wordmark or additional text in the icon.
- Essential bars and halo core remain within the central **66% safe region**; faint outer halo may clip under masks.

### Favicon

- Full-bleed Deep Teal background.
- Three centred Primary Teal bars.
- Halo omitted at 16×16 and 32×32 so small-size recognition is not lost to blur/detail.
- Canonical SVG plus 32×32 and 16×16 raster fallbacks.

## Production assets added

- `assets/brand/source/revision-app-icon-master.svg`
- `assets/brand/exports/revision-favicon.svg`
- `assets/brand/exports/revision-favicon-32.png`
- `assets/brand/exports/revision-favicon-16.png`

## Conflict check

No conflict with approved main authority was identified. `Visual Brand System.md` v0.9 explicitly requires clear-space/minimum-size guidance and a 1024×1024 or equivalent app-icon master, and already permits compact Living E treatments with reduced halo detail.

The new rules therefore specialise an open production requirement rather than changing the approved identity direction.

## Documentation-impact check

Because this decision defines what identity assets **should** do, it is captured in numbered brand authority rather than only in technical documentation. Production-readiness documentation, the asset README, manifest and `INDEX.md` are updated in the same governed branch. Historical Brand Studio material remains unchanged.
