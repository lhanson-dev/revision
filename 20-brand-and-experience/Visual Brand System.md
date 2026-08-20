---
title: "Revision Brand System"
document_id: "revision-visual-brand-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "0.9"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-20"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["visual identity", "cross-channel brand expression", "learner application visual system", "marketing-site visual system", "admin visual system", "social-media visual treatment", "video and motion brand treatment", "email visual treatment", "brand assets", "REV visual presence", "REV motion", "responsive navigation treatment", "typography system", "spacing and shape system", "controls and forms", "surface families", "iconography", "subject accents", "data visualisation", "asset naming and lifecycle"]
depends_on: ["Product UX Principles", "Emotional Experience Principles", "Tone of Voice Framework", "Information Architecture", "Core Product Messaging", "Claims and Progress Governance"]
supersedes: null
---
# Revision Brand System

## Purpose

Define Revision's canonical brand-guidelines and visual-expression system across every owned product, channel and asset.

Revision should feel recognisably like one brand across the learner application, marketing/editorial site, Admin, social media, video, email, presentations and reusable assets. Consistency comes from shared foundations and recognisable grammar, not from forcing every surface to use the same layout or card design.

This document governs visual identity and expression. Product behaviour, learner language, marketing claims and educational evidence remain governed by their respective authorities.

## Brand-system model

Revision uses four levels of visual control:

1. **Brand foundations — tightly controlled.** Identity, core palette, typography, themes, spacing rhythm, shape/depth, icon language, accessibility, focus treatment and core motion principles.
2. **Primitives — controlled variants.** Buttons, fields, selectors, tabs, chips, navigation, statuses and recurring interaction patterns.
3. **Surface families — flexible within rules.** Cards, panels, recommendations, REV surfaces, exam/performance surfaces and channel-specific modules.
4. **Composition and art direction — deliberately creative.** Page layouts, campaign compositions, social posts, video scenes and feature moments may vary substantially while using shared foundations.

The system therefore defines **what is fixed, what is bounded and what is free**.

## Founder-confirmed visual foundations — 20 August 2026

### Typeface

**Manrope** is the approved primary Revision typeface for brand and product use.

### Core identity

REV's approved core identity is the **Living E**:

- three horizontal bars form the recognisable E / REV symbol;
- the symbol sits inside a **soft halo** rather than a hard-edged or heavily sci-fi orb treatment;
- the visual character should feel calm, intelligent, present and responsive;
- glow is subtle and atmospheric, not neon spectacle;
- the three bars remain clear at small sizes; and
- the same symbol adapts across app icon, mobile centre navigation, conversation presence and larger homepage treatments.

The approved REV state family is:

- **Resting** — calm and ready;
- **Listening** — attentive and focused;
- **Thinking** — processing and analysing;
- **Responding** — generating a response; and
- **Completed** — done and ready.

Motion may distinguish these states, but meaning must remain understandable without motion and reduced-motion preferences must be respected.

### Calm Teal palette

Approved core brand colours:

- **Deep Teal Ink** — `#0F2F36`
- **Primary Teal** — `#2BB6A3`
- **Soft Aqua Accent** — `#E6FBF4`
- **Canvas Off-White** — `#FAFCFB`
- **Soft Surface Tint** — `#F1FAF8`
- **Graphite Ink** — `#132026`

Approved neutrals:

- **Neutral 0 / Near White** — `#FFFFFF`
- **Neutral 100 / Light** — `#F6F8F7`
- **Neutral 200 / Soft** — `#E6ECEB`
- **Neutral 600 / Medium** — `#607074`
- **Neutral 900 / Charcoal** — `#0F1416`

Approved supporting accents:

- **Sage** — `#BCE8CF`
- **Stone Blue** — `#C7D9EE`
- **Warm Sand** — `#F2E9D9`
- **Mist** — `#E9EEF2`

Approved functional source colours:

- **Success** — `#3BAA7A`
- **Warning** — `#DDAA3A`
- **Error** — `#E0605A`
- **Information** — `#4A8ECB`

Functional colours carry stable semantic meaning. They must not be repurposed merely for decoration, and colour must not be the sole carrier of meaning.

Approved stronger semantic foregrounds and pale surfaces:

| Role | Strong foreground | Pale surface |
| --- | --- | --- |
| Success | `#2D7A5D` | `#E7F5EF` |
| Warning | `#826C31` | `#FBF5E7` |
| Error | `#AD504D` | `#FBECEB` |
| Information | `#3C72A2` | `#E9F1F9` |

### Light theme tokens

- background — `#FAFCFB`
- surface — `#FFFFFF`
- elevated surface — `#FFFFFF`
- border — `#E6ECEB`
- primary text — `#132026`
- secondary text — `#5B686C`
- primary action — `#2BB6A3`
- action text on Primary Teal — `#132026`
- inverse action surface — `#0F2F36`
- inverse action text — `#FFFFFF`

### Dark theme tokens

- background — `#0F2024`
- surface — `#13272B`
- elevated surface — `#173136`
- border — `#24434A`
- primary text — `#E6F2EF`
- secondary text — `#A8BCC0`
- primary action — `#2BB6A3`
- action text on Primary Teal — `#132026`
- inverse action surface — `#0F2F36`
- inverse action text — `#FFFFFF`

Primary Teal remains the branded action colour, but ordinary text/icons on that fill use Graphite Ink because white on Primary Teal does not meet the normal-text contrast target. White action text is reserved for tested darker fills such as Deep Teal Ink.

Light and dark modes are both first-class Revision experiences. Dark mode is not a separate brand; it is the same Calm Teal system translated into a darker surface hierarchy.

## Core visual idea

The confirmed direction is **calm, contemporary, trusted and focused**.

Revision should feel:

- made for students without looking childish;
- credible to parents and other paying/supporting adults;
- calm enough to reduce cognitive load;
- intelligent and personalised;
- contemporary rather than institutional;
- distinctive through the Living E, teal system and refined interaction language rather than heavy visual effects; and
- capable of expressive moments without making the entire experience visually loud.

The learner application should not resemble a dense adult SaaS dashboard, school LMS, children's game or sci-fi AI interface.

## Typography system

Use a small role-based hierarchy rather than arbitrary local font sizes.

| Role | Desktop | Mobile | Weight | Line height | Typical use |
| --- | --- | --- | --- | --- | --- |
| Display XL | 56px | 40px | 700 | 64 / 48 | Marketing hero / exceptional brand moment |
| Display L | 44px | 34px | 700 | 52 / 42 | Learner Home greeting / major page statement |
| H1 | 36px | 30px | 700 | 44 / 38 | Primary page title |
| H2 | 28px | 26px | 700 | 36 / 34 | Major section heading |
| H3 | 22px | 20px | 650/700 | 30 / 28 | Card group / working-area heading |
| H4 | 18px | 18px | 650/700 | 26 | Compact heading |
| Body L | 18px | 18px | 400/500 | 28 | Intro / explanation |
| Body | 16px | 16px | 400/500 | 24 | Default learner/product copy |
| Body S | 14px | 14px | 400/500 | 20 | Secondary UI / Admin density |
| Label | 13px | 13px | 600 | 18 | Field label / compact control label |
| Button | 15px | 15px | 600 | 20 | Button and prominent action label |
| Caption | 12px | 12px | 500/600 | 16 | Metadata / timestamps / helper metadata |

Learner body copy remains 16px minimum. Marketing may use display roles more freely; Admin may use Body S where density helps, but inputs should remain 16px where practical. Avoid routine weights above 700.

## Spacing and responsive layout

Use a **4px base rhythm** with the standard spacing set:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`

Recommended defaults:

- icon-to-label: 8px;
- tight internal grouping: 8–12px;
- control group: 12–16px;
- standard card padding: 20–24px;
- feature / REV padding: 28–32px;
- mobile page gutter: 16px;
- tablet page gutter: 24px;
- desktop page gutter: 32–40px;
- mobile section gap: 32px;
- tablet section gap: 48px;
- desktop section gap: 64px;
- marketing/hero breathing space: 64–96px where composition supports it.

Width guidance:

- general product max-width: 1200px;
- long-form reading: 680–760px;
- forms/focused setup flows: usually 560–680px;
- dense Admin tables may exceed the ordinary content width where operationally necessary.

Responsive design should scale spacing and composition while preserving hierarchy rather than redesigning the product entirely at each breakpoint.

## Radius, borders and elevation

Approved radius families:

- **Compact — 12px:** dense Admin cells, small grouped controls, compact statuses;
- **Control — 14px:** buttons, inputs, selects, segmented controls;
- **Standard surface — 20px:** ordinary cards and panels;
- **Feature surface — 32px:** REV, hero, editorial and high-expression surfaces;
- **Pill — 999px:** chips, badges, toggles and circular/pill treatments.

Depth should rely primarily on surface hierarchy, borders and whitespace rather than heavy shadow.

Light-mode elevation:

- **Flat:** 1px `#E6ECEB`, no shadow;
- **Raised:** border + `0 2px 8px rgba(15,47,54,.06)`;
- **Floating:** `0 10px 30px rgba(15,47,54,.10)`;
- **Overlay:** `0 20px 50px rgba(15,47,54,.14)`.

Dark mode should prefer surface-tone steps and `#24434A` borders. Shadows are primarily for floating/overlay separation.

## Controls and forms

### Control sizing

- Compact: 36px, Admin/secondary only;
- Standard: 44px minimum interaction height;
- Large: 52px for major learner/marketing CTA or large REV/search action;
- Icon button: 44×44px default touch target;
- Standard field: 48px.

### Button family

**Primary**
- Primary Teal `#2BB6A3`;
- Graphite Ink `#132026` text/icon;
- 14px radius;
- 44px standard / 52px major CTA.

**Strong / inverse primary**
- Deep Teal Ink `#0F2F36`;
- white text;
- use where a darker anchored CTA is compositionally preferable.

**Secondary**
- light: white or Soft Surface Tint with Neutral 200 border;
- dark: elevated dark surface with `#24434A` border;
- primary text colour;
- Soft Aqua may provide hover/selected emphasis.

**Tertiary**
- no permanent container;
- use primary/deep-teal text with teal icon/underline/accent;
- do not use Primary Teal as ordinary small text on white as the sole contrast signal.

**Destructive**
- Error colour may be used for border/icon/fill accent;
- destructive text uses an accessible strong semantic foreground or primary text.

All actions require visible hover where relevant, pressed, focus, disabled and loading states. No essential interaction may depend on hover.

### Form anatomy

- visible label above field; never placeholder-only;
- 48px standard field height;
- 14px radius;
- 16px input text;
- light: white surface + Neutral 200 border;
- dark: dark surface + `#24434A` border;
- helper text: Body S / 14px;
- focus uses a tested high-contrast border/ring without layout shift;
- error/warning/success require icon/text as well as colour;
- routine valid fields do not all need a success state;
- disabled and read-only are visually and behaviourally distinct;
- loading/submission prevents duplicate submission and preserves entered values after recoverable errors.

Selection controls use a 20–22px checkbox/radio visual inside a larger click/touch target. Toggle and chip states require position/mark/label semantics in addition to colour.

## Surface families

Revision uses named surface families rather than one universal card.

### Standard
Ordinary content grouping. 20px radius, Flat by default, 20–24px padding. Do not card-wrap every piece of content.

### Quiet / supporting
Secondary information and low-priority context. Soft Surface Tint/neutral surface, Flat depth, 20px radius.

### Interactive
Routes, choices, subject/topic selection and actionable summaries. 20px radius; Flat at rest, Raised on hover/focus/selection where appropriate. Affordance must not depend on hover.

### Feature / editorial
Exceptional brand moment, marketing storytelling or major learner feature. 32px radius. May use Deep Teal, Soft Aqua, illustration, larger type or asymmetric composition. Avoid repetitive grids of equally loud feature cards.

### Guidance / recommendation
Next step, explanation or coaching recommendation. 20px or 32px according to prominence. Evidence-based recommendations must explain why and must not visually overstate confidence.

### REV
REV conversation, recommendation and AI presence only. 32px for hero/major treatments; 20px for compact context. The Living E + soft halo is the distinctive device. Ordinary product cards must not borrow the halo simply to appear important.

### Status / feedback
Success, warning, error and information. 14–20px radius with approved semantic surface + strong foreground + icon + text.

### Exam / performance
Timed work, marks, paper readiness and performance evidence. 20px radius, calm structure, Deep Teal/Graphite anchors and restrained support accents. Must not manufacture urgency or unsupported certainty.

### Subject accent
Subject recognition while preserving one Revision system. Main surface remains neutral; accent appears in an icon tile, edge marker, chip or illustration detail.

### Pricing / upgrade
Package value and entitlement boundary. 20px ordinary / 32px featured plan. Locked states explain learner value and entitlement rather than relying on faded UI or a padlock alone.

Within an approved family, layout, illustration, accent placement and composition may vary. Shared typography, semantic colours, interaction states and accessibility rules provide coherence.

## Iconography

Use a consistent rounded-line language:

- default UI icon: 24px;
- compact: 20px;
- inline: 16px where legible;
- large icon tile: 28–32px;
- default stroke: 1.75–2px with rounded caps/joins;
- icons inherit `currentColor` rather than hard-coded arbitrary colours;
- selected/status icons may use fill selectively while retaining a clear silhouette;
- the Living E is a custom identity mark, not a generic icon.

Avoid mixed icon libraries, emoji as product controls, cartoon clip-art, inconsistent 3D icons and decorative symbols with unclear meaning.

## Graphic language

Approved recurring motifs:

- soft halo / diffused circle around REV only;
- three-line / stacked-line echoes derived from the Living E;
- restrained concentric rings or ripple traces for focus/listening states;
- rounded tabs, underlines and marker bars that subtly reference studying/revision;
- small dot/trace accents used sparingly to suggest activity or connection; and
- soft geometric crops and overlapping rounded fields for marketing/editorial composition.

Use one or two motifs per composition rather than all at once. Avoid heavy sci-fi particles, neon bloom, school clip-art and decorative complexity that competes with content.

## Subject differentiation

Subject identity combines **name + icon + optional accent**.

Approved recognition accents may use Soft Aqua Accent, Sage, Stone Blue, Warm Sand, Mist and Primary Teal as a shared brand accent rather than a unique subject colour.

Do not use Success, Warning or Error colours as subject identities. Colour alone is never sufficient. No fixed subject-to-colour mapping is approved; introduce one only if user testing shows it materially improves recognition.

## Data visualisation

### Core rule

Charts explain evidence; they do not decorate dashboards.

Use:

- progress bar for bounded part-to-whole completion;
- line chart for change over time;
- bar chart for comparison;
- stacked bar only when composition genuinely matters;
- donut only for a small number of categories where precise comparison is not important; and
- sparkline only as supplemental context, never as the only explanation.

Material progress/readiness views provide plain-English meaning and a next action where appropriate.

Never collapse coverage, understanding/mastery evidence, exam readiness and plan progress into one decorative percentage. A trend may legitimately move down when new evidence changes the picture.

Approved derived chart palette:

1. Data Teal `#168C7C`
2. Data Blue `#5F7FA3`
3. Data Sage `#5F8F73`
4. Data Sand `#A5824A`
5. Data Slate `#607074`

For three or more series, also use direct labels, markers, line styles or patterns so meaning is not colour-dependent. Primary Teal may be used as a fill/accent but should not be the sole thin essential line on white.

Neutral progress uses Data Teal/Deep Teal rather than Success green by default. Semantic status colours are used only where the underlying status genuinely carries that meaning.

Estimated grades/readiness follow Claims and Progress Governance, including clear labelling of estimates and evidence strength. "On track" must state on track for what.

## Homepage visual layout

The Founder-confirmed homepage direction applies across mobile, tablet and desktop in both light and dark modes.

The structural hierarchy is:

1. REV / Living E presence with generous breathing room near the top;
2. concise personalised greeting / "what shall we do today?" prompt;
3. prominent REV input beneath the greeting;
4. a small set of useful quick-action cards such as planning, continuing previous work, finding resources and progress;
5. "continue where you left off" or equivalent recent-context content beneath the first action layer; and
6. progressively richer content through scrolling rather than a dense dashboard above the fold.

The hierarchy scales rather than fundamentally changing across screen sizes.

## Navigation

Concept art never overrides Information Architecture.

The governed global learner destinations remain:

- Home
- Plan
- REV
- Progress
- Subjects

Mobile keeps REV in the centre of the five-item bottom navigation using the Living E. Desktop must also preserve REV as a genuine global destination. Account/profile and utilities remain secondary.

## Cross-channel expression profiles

### Learner product

Calm, clear, intelligent and task-first. Standard, Quiet, Interactive and REV surfaces dominate. Feature surfaces remain scarce.

### Marketing and editorial

More expressive and story-led. Larger type, editorial composition, Feature surfaces, illustration, photography or motion may be used while retaining Calm Teal, Manrope and the shared interaction grammar.

### Admin and operations

Functional and restrained. Density may increase where the job requires it. Standard/Quiet surfaces and shared controls/status semantics dominate; tables should not be forced into card grids.

### Social media and campaigns

Higher expressive freedom within the approved identity. Recurring layouts and motifs should build recognition rather than create a new identity for each post.

### Video and motion

Motion may be more expressive than in-product motion, but the Living E, typography, palette and overall calm intelligence remain recognisable.

## Marketing and editorial pattern families

Marketing has seven approved recurring pattern families.

### Hero / proposition

- 64–96px vertical breathing room where viewport supports it;
- Display XL / Display L Manrope hierarchy;
- one dominant primary CTA and at most one secondary action;
- Feature surface or open-canvas editorial composition;
- Living E appears when the proposition is genuinely REV-led, not as compulsory decoration;
- product UI/screenshots are framed as product evidence rather than ornamental collage.

Avoid multiple equal CTAs, dense feature grids above the fold and halo overuse.

### Feature story

Use asymmetric two-column or stacked composition, one strong visual/product example, concise H2/H3-led copy and Standard/Feature/Guidance surfaces according to emphasis. Alternate composition to create editorial rhythm rather than repeating identical cards.

### Product proof / demonstration

Use real or clearly labelled representative UI. Annotate only the important point. Do not invent performance claims to make a mock-up persuasive. Evidence semantics remain governed by Claims and Progress Governance.

### Pricing / packaging

Use the Pricing/Upgrade surface family. Ordinary plans use Standard radius; a featured plan may use Feature radius. Price hierarchy must remain truthful, and locked-capability treatment explains additional learner value without shame or anxiety.

### Proof / testimonial / quote

Use Quiet or Feature surfaces according to prominence. Quotes remain readable and attributable. Marketing/evidence governance controls claims.

### Editorial / guide

Use 680–760px reading width, strong typography and spacing rather than wrapping every paragraph in a card. Inline diagrams, note surfaces or REV guidance may appear where context genuinely benefits.

### Closing CTA

Use one dominant action. Deep Teal or Soft Aqua Feature treatment is preferred over introducing a new campaign colour. Maintain enough whitespace to distinguish the close from another ordinary feature block.

## Admin / operations patterns

Admin remains recognisably Revision while prioritising operational efficiency.

### Admin shell

Use compact but readable Manrope hierarchy, neutral/Soft Surface foundations and Primary Teal for action/selection rather than decoration. The Living E halo appears only where a genuine REV/AI function is present. Navigation may be denser than learner navigation while preserving shared icon/control language.

### Tables

Tables are first-class. Do not force every row into cards. Compact 12px radius may be used where grouping requires it. Sticky headings/columns are allowed when useful. Sorting/filtering states must remain obvious without colour alone.

### Filters and search

Use shared Control radius and form anatomy. Compact 36px controls are acceptable in pointer/keyboard-dense contexts, while touch-exposed surfaces retain larger targets. Active filters use explicit labelled removable chips.

### Status and assurance

Semantic colours retain exactly the same meaning as elsewhere. Status cards use the Status family rather than colourful dashboard tiles. Unknown / Not checked must remain visually distinct from Success. Operational severity and educational-evidence semantics must not be conflated.

### Critical / destructive actions

Deep Teal/Graphite remains the default action language. Destructive operations use Error semantics and explicit confirmation where consequence warrants it. Irreversible actions must not rely on position or colour alone.

## Social media format families

Canonical working canvases are:

- square feed — **1080×1080**;
- portrait feed — **1080×1350**;
- story/reel — **1080×1920**;
- landscape/video thumbnail — **1920×1080**.

Five approved social pattern families are:

1. **Brand statement / message** — large Manrope statement, one Living-E-derived motif or soft geometric crop, small identity anchor, usually 8–20 words.
2. **Study tip / educational value** — short title plus one concise useful point and a calm icon/diagram; useful even without a sales CTA.
3. **Product showcase** — real product crop/device frame, one clear annotation or benefit statement, consistent Calm Teal screenshot framing.
4. **Proof / statistic** — one primary number/claim with plain-language context and source/evidence reference where required.
5. **Launch / campaign** — Feature-level expression with larger crops, Deep Teal fields and more motion while retaining Manrope, Calm Teal and approved motifs.

Keep key text inside platform safe areas. Do not use the Living E as a random bullet/icon or make the halo the background of every post. Captions/alt text carry essential information when the visual alone is insufficient.

## Video and motion-graphics system

### Opening sting

Recommended default: **0.8–1.5 seconds**. Use a clean Living E or Revision wordmark entrance with soft halo/pulse, no compulsory sound dependency and no unnecessary delay before useful content.

### Title card

Use Manrope H1/Display hierarchy, Calm Teal/Canvas or Deep Teal foundation, one supporting motif maximum, plus topic and optional qualification/series label.

### Lower third

Use readable 14px/16px-equivalent text at target resolution, a Soft Surface or Deep Teal compact bar with 12–14px corners, and positioning that does not cover key learning content.

### Captions/subtitles

Use high-contrast text with a solid or semi-opaque backing where video content reduces contrast. Avoid all-caps paragraphs. Keep line length and placement readable on mobile crops. Captions are functional, not decorative.

### Product demo frame

Show product at legible scale. Pointer/highlight treatment uses Primary/Data Teal and simple ring/marker language rather than glow everywhere. Zoom/crop only when it improves comprehension.

### End card

Recommended default: **2–3 seconds** where format allows. Show the Revision wordmark / Living E relationship with one CTA or destination on Deep Teal or Canvas; avoid multiple handles/URLs competing equally.

### Transitions

Prefer cuts, soft fades, short slides and Living-E-line wipes. Product-style branded transitions usually remain around **160–320ms**, with modest extension allowed in editorial video. Avoid spins, bounce-heavy motion, glitch, scanlines and sci-fi particle transitions.

## REV motion system

REV motion communicates state rather than ambient spectacle.

### Resting

Bars remain stable and evenly spaced. The halo breathes subtly on a **6–8 second** loop. Any sparse dot/trace movement must not resemble a notification.

### Listening

Bars remain recognisable. A soft outward ripple or slight equalised movement confirms attention on a **1.2–1.8 second** rhythm. Avoid aggressive microphone-waveform treatment unless context genuinely requires it.

### Thinking

Bars may stagger or shift in a controlled sequence and the halo/ring may become slightly more active on a **1.4–2.2 second** loop. The animation must not imply completion percentage or estimated time.

### Responding

Use a left-to-right or centre-out pulse as response begins, with state entry around **600–900ms**. Response text must not wait for the animation to complete. Typing animation, if used, must be fast and compatible with reduced-motion preferences.

### Completed

Bars settle back to equal alignment. The halo briefly expands/softens and returns to Resting over **700–1000ms**. Do not use confetti or gamified celebration by default.

### Reduced motion

When `prefers-reduced-motion` or equivalent preference is active:

- remove looping halo breathe, ripple and bar oscillation;
- use static state variants for Resting, Listening, Thinking, Responding and Completed;
- state changes use instant swap or a short opacity change of approximately 100–150ms maximum; and
- context/text must make the state understandable without animation.

REV motion must be lightweight, avoid layout shift and never block interaction or materially delay first useful paint. The Brand System governs appearance and behaviour, not a specific animation library.

## Email / lifecycle visual treatment

Email uses a simplified expression of the same system:

- Revision wordmark at top; Living E only where REV is genuinely the sender/context;
- white/Canvas background with Deep Teal text;
- Primary Teal + Graphite CTA treatment where email-client support and contrast remain safe;
- 14px CTA radius rather than oversized app-card radii;
- Status treatment may simplify to border + icon + text;
- no dependence on gradients, animation or advanced CSS for essential meaning; and
- dark-mode email treatment must be tested rather than assumed from app tokens.

## Production identity and asset package

Concept boards are approved visual references, not production master assets.

Before production implementation is considered complete, the canonical package must contain:

### Revision identity

- primary Revision wordmark — editable vector master;
- light-background SVG;
- dark-background SVG;
- monochrome dark SVG;
- monochrome light/reversed SVG;
- compact/approved lock-up if one exists;
- minimum-size and clear-space guidance.

### REV / Living E

- static Living E master SVG;
- light-theme and dark-theme variants;
- small/nav variant preserving three-bar legibility;
- static Resting / Listening / Thinking / Responding / Completed state files where states differ visually;
- canonical motion source once animation implementation is selected; and
- reduced-motion/static-state equivalents.

### App / browser

- app-icon master at **1024×1024** or platform-equivalent vector/master source;
- generated platform icon exports rather than manually redrawing every size;
- favicon SVG where supported;
- 32×32 and 16×16 raster fallbacks where required;
- maskable/PWA-safe treatment if required by the web app.

### Social / media templates

- 1080×1080;
- 1080×1350;
- 1080×1920;
- 1920×1080;
- editable source plus export preset;
- safe-zone guides where platform UI overlaps content.

### Video

- title-card master;
- lower-third master;
- caption-style reference;
- opening/end-card master;
- transparent motion exports only where a destination workflow requires them.

## Canonical asset naming and lifecycle

Use human-readable stable names and avoid spaces encoded as `%20` in exported filenames.

Recommended pattern:

`revision-{asset}-{variant}-{theme}-{size}.{ext}`

Examples:

- `revision-wordmark-primary-light.svg`
- `revision-wordmark-mono-dark.svg`
- `revision-rev-living-e-resting-light.svg`
- `revision-rev-living-e-nav-dark.svg`
- `revision-app-icon-1024.png`
- `revision-social-product-1080x1350.png`
- `revision-video-lower-third-light.svg`

Ordinary production filenames should not accumulate version suffixes such as `final-v7`. Version history belongs in source control or the canonical asset-management system.

Each canonical asset entry records:

- lifecycle status: Recommended / Alternative / Experimental / Deprecated / Do not use;
- editable source location;
- export location or generation method;
- intended channels;
- theme/variant rules;
- licensing/source information for third-party materials; and
- replacement/deprecation relationship where applicable.

## Brand reference and approval surface

Revision maintains a visual reference surface, currently called **Brand Studio**, where authorised contributors can see approved examples rather than infer them from prose.

Patterns/assets use these lifecycle statuses:

- **Recommended** — default choice for the stated job;
- **Alternative** — approved when context justifies it;
- **Experimental** — visible for exploration but not standard;
- **Deprecated** — retained for transition/history but not for new work; and
- **Do not use** — explicitly rejected or non-compliant.

A rendered example does not become policy merely because it appears in Brand Studio. Material additions to recurring brand grammar require the normal governed approval path.

## Accessibility

The Brand System inherits Product UX Principles and the WCAG 2.2 AA target.

At minimum:

- colour is never the only carrier of meaning;
- text/background combinations require adequate contrast;
- interactive controls need clear focus and touch states;
- motion must be reducible where non-essential;
- essential social/video information requires appropriate text/caption alternatives;
- charts require non-colour differentiation where needed; and
- hierarchy must survive supported screen sizes without making essential content inaccessible.

## Production-readiness work still required

The major brand grammar is now defined. Remaining work is production readiness and implementation, not further open-ended brand exploration:

1. obtain/create canonical editable/vector Revision wordmark and Living E masters;
2. derive approved light/dark/mono/static-state/app/favicon exports;
3. create/select the canonical REV motion source and implementation treatment;
4. create editable social/video template masters and safe-zone guides;
5. record canonical asset source/export/licensing/lifecycle metadata;
6. implement the Brand Studio reference surface if useful; and
7. migrate learner, marketing and Admin implementation onto the approved token/component system through governed implementation work.

These production tasks must not silently reinterpret the approved grammar. Material new colour roles, typography treatments, component families, identity treatments or recurring cross-channel patterns require deliberate review and approval.

## Approval and evolution

Founder approval focuses on the **brand grammar and representative range**, not every future composition.

New creative treatments may be produced within approved foundations/families. The target is **one coherent Revision brand with controlled foundations and deliberate creative range**.