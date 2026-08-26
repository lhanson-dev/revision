# AI-Generated Visual Learning Content Opportunities

## Status

**Non-authoritative product opportunity catalogue.**

This document captures candidate ways Revision may use generative AI, including ChatGPT-compatible image generation, to create distinctive learner-facing visual content in future.

It does **not** mean every format below is approved product scope, a learner-facing slash command, or a commitment to a specific AI provider. Any material capability must still follow the governed product feature lifecycle and Definition of Ready before implementation.

## Strategic intent

The opportunity is not to generate decorative images for their own sake. It is to make explanations, revision material and feedback more useful by selecting a visual form that helps the learner understand, remember, compare, sequence, inspect or revisit something more effectively.

Where used well, AI-generated visual content could help Revision:

- create subject-appropriate explanations that are less repetitive than generic cards or textbook-style pages;
- adapt the representation of the same concept to the learner's need;
- make difficult structures, processes and relationships easier to inspect;
- turn dense information into memorable visual revision assets;
- offer multiple representations when a learner has not understood the first explanation;
- generate original supporting visuals without depending on a large fixed illustration library;
- strengthen the Learn → Practice → Feedback → Improve loop rather than creating a disconnected novelty tool.

A useful future REV behaviour could therefore be: **choose or generate the representation that best helps this learner understand this concept now**, rather than always replying with more text.

## Candidate visual transformations

The names below are working shorthand for content-generation patterns. They are not approved learner commands.

| Working shorthand | Transformation | Potential Revision use |
| --- | --- | --- |
| `/explodedview` | Disassembles an object so every part floats separately in mid-air. | Engineering, product design, mechanisms, scientific apparatus, physical systems and component relationships. |
| `/blueprint` | Renders the subject as a white-on-blue technical engineering drawing. | Design/technology, engineering, architecture and structured technical explanation. |
| `/360view` | Builds a multi-angle turnaround sheet of the same object. | Spatial understanding of objects, artefacts, components, anatomy models and design subjects. |
| `/cutaway` | Removes part of an outer surface to reveal what is inside. | Engines, organs, geological structures, buildings, cells, machinery and layered physical systems. |
| `/microstructure` | Shows an extreme close-up of surface texture and material makeup. | Materials science, biology, chemistry, geography and microscopic structures. |
| `/sketchnotes` | Turns information into hand-drawn notebook notes with arrows, circles and highlighting. | Topic summaries, retrieval prompts, revision recaps and memorable explanation pages. |
| `/xraylayers` | Uses a translucent view to show internal layers stacked front to back. | Anatomy, geology, manufactured products, electronics, cells and layered systems. |
| `/infographic` | Turns data or a dense set of facts into one clear graphic. | Statistics, comparisons, case-study facts, processes, cause/effect summaries and end-of-topic revision. |
| `/diagram` | Maps a process as a connected flow from input to output. | Scientific processes, business processes, computing flows, causal chains and decision logic. |
| `/timeline` | Lays out history, stages or progression from left to right. | History, literature context, scientific development, business events and process stages. |
| `/stickynotes` | Groups many ideas into columns like a strategy session. | Classification, planning, essay preparation, thematic grouping and comparing competing ideas. |
| `/mindmap` | Places one central idea with branches into related sub-ideas. | Topic overviews, essay planning, recall structures and connecting subtopics. |
| `/crosssection` | Shows a straight slice through an object or structure. | Geography, biology, geology, engineering, buildings and spatial structures. |
| `/isometric` | Creates a clean miniature 3D-from-above scene. | Systems, environments, factories, settlements, networks and spatial relationships. |
| `/schematic` | Produces a labelled technical specification sheet with callouts and measurements. | Circuits, mechanisms, scientific apparatus, design and technical subjects. |
| `/knolling` | Lays every component flat in an ordered grid. | Component identification, classification, comparing parts and deconstructing complex systems. |
| `/actionfigure` | Turns a person, role or product into a boxed collectible with accessories. | Optional engagement-led recap, historical figures, characters, occupations or concept mnemonics where educationally justified. |
| `/magazinecover` | Creates an editorial cover with masthead and cover lines. | Topic hooks, case-study summaries, historical moments, literature themes or revision recap artefacts. |
| `/lego` | Rebuilds a subject as a LEGO-like brick model. | Optional simplified structural explanation or engagement asset where abstraction helps rather than distracts. |
| `/wireframe` | Shows a stripped-back mesh or outline representation. | Shape, geometry, product form, structural design and spatial reasoning. |
| `/flatlay` | Arranges related items in an overhead composition. | Artefact sets, equipment, source materials, themed topic summaries and comparison sets. |
| `/storyboard` | Breaks an idea into sequential panels. | Processes, historical sequences, literature events, scientific mechanisms and worked-method steps. |
| `/patentdrawing` | Produces old-style line-art invention diagrams with numbered parts. | Engineering, invention history, product design and labelled-component recall. |
| `/anatomy` | Labels every relevant part of a subject like a biology chart. | Biology, physical geography, machinery, product components and any part-to-whole learning task. |
| `/comicpanel` | Creates a bold illustrated panel with dramatic framing. | Short narrative explanations, misconceptions, historical/literary moments and memorable scenario-based teaching. |
| `/miniature` | Creates a tiny handcrafted-model version of a full-size scene. | Geography, history, business environments, ecosystems and spatial systems. |

## Product-value tiers

These formats should not all be treated equally.

### Highest educational potential

Likely to justify early exploration because the visual form directly carries explanatory meaning:

- diagram;
- timeline;
- cross-section;
- cutaway;
- anatomy;
- schematic;
- exploded view;
- x-ray/layer view;
- storyboard;
- mind map;
- infographic;
- microstructure;
- 360 view where spatial understanding matters.

### Useful representation alternatives

Potentially valuable when matched to the subject or learner need:

- sketchnotes;
- blueprint;
- isometric;
- wireframe;
- knolling;
- flat lay;
- patent drawing;
- sticky-note grouping.

### Engagement-led / use sparingly

These may create distinctiveness but are weak ideas if they become decoration or gimmicks:

- action figure;
- magazine cover;
- LEGO-style representation;
- comic panel;
- miniature scene.

They should earn their place by improving recall, comprehension, motivation or contextual understanding. "It looks cool" is not enough.

## Possible learner experiences

These patterns could eventually appear in several ways without exposing technical generation syntax to the learner:

1. **REV chooses a better explanation format** — when a learner is struggling, REV may offer a diagram, cross-section, timeline, storyboard or other visual representation instead of repeating text.
2. **Learn content variants** — a lesson may include generated visual explanations where the subject genuinely benefits from them.
3. **Revision asset generation** — a learner could request a topic summary as a mind map, sketchnote, infographic or timeline.
4. **Feedback and Weakness Repair** — an exposed misconception could trigger a narrowly targeted visual explanation before re-practice.
5. **Teacher/content-production support** — the Content Factory may generate candidate visual assets as bounded work units for review rather than requiring every asset to be manually illustrated.
6. **Multiple representations of one concept** — Revision could retain structured concept meaning while changing its visual representation, allowing a learner to try another explanation without changing the underlying educational truth.

## Generation and product rules

Any future implementation should apply the following constraints.

### Educational purpose first

A generated visual must have an explicit learning job. The system should know what the learner is expected to understand, notice, remember or do differently after seeing it.

### Structured truth before visual generation

Where factual labels, sequence, measurements, relationships or assessment-critical details matter, generate from a governed structured representation rather than asking an image model to invent educational truth from scratch.

The visual generator should render or support approved content; it should not become the authority for the content.

### Accuracy and review

Generated learner content remains subject to the existing educational source, provenance, accuracy and assurance gates. Visual outputs must not bypass the Content Factory's deterministic validation and independent educational review where those gates apply.

### Text inside images is high risk

Do not assume an image model will render labels, formulas, dates, units or long passages accurately. Where exact text matters, prefer deterministic HTML/SVG/canvas composition or overlay verified text separately from the generated illustration.

### Accessibility

Every meaningful visual requires an accessible equivalent appropriate to its learning purpose. At minimum this may include alt text or a structured text explanation; complex diagrams may require a richer description. The learner must not lose essential information because they cannot perceive the image.

### Personalisation without educational drift

Personalising style, representation or emphasis must not silently change the governed factual content, difficulty semantics or assessment meaning.

### Originality and rights

Use original generated material and governed source inputs. Do not depend on reproducing protected textbook illustrations, branded characters, copyrighted artwork or an identifiable living artist's style as the content strategy.

### Cost and latency

Visual generation is materially more expensive and slower than deterministic presentation. It should be used where it creates enough learner value to justify the cost. Reusable validated assets should be cached rather than regenerated unnecessarily.

### Provider independence

"ChatGPT" is a practical candidate generation capability, not an architectural dependency. The Content Factory should treat image generation as a bounded worker/provider capability so quality, price and provider can change without redefining the educational workflow.

## Relationship to Personalised Revision Intelligence

The strongest strategic version of this idea is **adaptive representation**, not an image-generator feature.

Revision should use learner evidence to decide when a different representation is likely to help. For example:

- repeated confusion about sequence → timeline or storyboard;
- confusion about part/whole relationships → anatomy, exploded view or schematic;
- confusion about an internal mechanism → cutaway, cross-section or x-ray layers;
- overloaded factual recall → mind map, sketchnotes or infographic;
- spatial misunderstanding → 360 view, wireframe or isometric view.

If the product cannot explain why a generated visual is more useful for the learner than the cheaper deterministic alternative, it should normally not generate it.

## Future analysis questions

Before promoting any of these ideas into product scope, analysis should establish:

- which subjects and learning objectives genuinely benefit from generated visuals;
- whether a deterministic template can produce the same learning value more reliably and cheaply;
- which formats can be generated accurately enough for learner use;
- what must be structured/verified separately from the image model;
- how assets are reviewed, versioned, cached and invalidated when source content changes;
- how accessibility equivalents are produced and assured;
- how generation latency affects the learner journey;
- per-asset and per-active-learner cost at plausible scale;
- whether generated assets improve comprehension, recall, re-practice performance or engagement versus the existing representation;
- which formats belong in static Content Factory production versus real-time personalised REV generation.

## Related governance

This opportunity catalogue must be interpreted alongside:

- `00-company-foundation/Product Strategy.md`;
- `10-product-governance/Product System Model.md`;
- `10-product-governance/backlog/Product Feature Backlog.md`;
- `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`;
- `40-evidence-and-trust/Evidence Trust and Educational Integrity.md`;
- `60-business-operations/AI Cost and Allowance Policy.md`;
- `80-company-workflows/Content Factory Operating Model.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`;
- `80-company-workflows/Feature Definition and Measurement Workflow.md`.

## Documentation impact

This file records candidate product/content opportunities only. It does not change approved learner behaviour, feature lifecycle state, current implementation, technical architecture or publication rules. No implementation documentation change is required until a specific capability is deliberately promoted and built.
