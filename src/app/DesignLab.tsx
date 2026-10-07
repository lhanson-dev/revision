import { useMemo, useState } from 'react'
import { RevPresence } from './RevPresence'
import {
  BrandAsset,
  Button,
  DrawerShell,
  EmptyState,
  Icon,
  IconButton,
  LearnBlock,
  LoadingState,
  Menu,
  MenuItem,
  ModalShell,
  OverlayBackdrop,
  PageHeader,
  PopoverShell,
  SegmentedControl,
  SelectField,
  Status,
  Surface,
  TextAreaField,
  TextField,
  accentStyle,
  type IconName,
} from './ui'
import { everyBlockType } from './ui/learn/fixtures'

type ThemeName = 'light' | 'dark'
type CoverageKind = 'shared' | 'page' | 'gap'

const themeStorageKey = 'revision:theme'

const iconNames: IconName[] = [
  'home', 'plan', 'progress', 'courses', 'menu', 'close', 'chevron-right', 'arrow-right', 'arrow-up', 'play',
  'user', 'settings', 'admin', 'upgrade', 'logout', 'sun', 'moon', 'monitor', 'info', 'warning', 'check', 'error', 'plus', 'trash',
]

const navItems = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'identity', label: 'Identity & REV' },
  { id: 'buttons', label: 'Buttons & actions' },
  { id: 'fields', label: 'Fields & selection' },
  { id: 'surfaces', label: 'Surfaces & cards' },
  { id: 'feedback', label: 'Status & feedback' },
  { id: 'navigation', label: 'Navigation & page structure' },
  { id: 'education', label: 'Educational treatments' },
  { id: 'data', label: 'Progress & data' },
  { id: 'states', label: 'Empty, loading & overlays' },
  { id: 'icons', label: 'Icons & graphic language' },
]

function initialTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function CoverageBadge({ kind }: { kind: CoverageKind }) {
  const meta: Record<CoverageKind, string> = {
    shared: 'Shared component',
    page: 'Approved page-owned pattern',
    gap: 'Approved pattern · shared primitive missing',
  }
  return <span className={`design-lab-coverage design-lab-coverage--${kind}`}>{meta[kind]}</span>
}

function SectionHeading({ id, title, description, coverage }: { id: string; title: string; description: string; coverage?: CoverageKind }) {
  return (
    <header className="design-lab-section-heading">
      <div>
        <p className="eyebrow">Design canvas</p>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {coverage && <CoverageBadge kind={coverage} />}
    </header>
  )
}

function TokenSwatch({ label, token, value }: { label: string; token: string; value: string }) {
  return (
    <div className="design-lab-token">
      <span className="design-lab-token-swatch" style={{ background: `var(${token})` }} aria-hidden="true" />
      <strong>{label}</strong>
      <code>{value}</code>
    </div>
  )
}

function TypeRow({ role, sample, meta, className }: { role: string; sample: string; meta: string; className: string }) {
  return (
    <div className="design-lab-type-row">
      <span>{role}</span>
      <strong className={className}>{sample}</strong>
      <small>{meta}</small>
    </div>
  )
}

function SpecimenCard({ title, coverage = 'shared', children }: { title: string; coverage?: CoverageKind; children: React.ReactNode }) {
  return (
    <Surface className="design-lab-specimen" variant="standard">
      <header className="design-lab-specimen-head">
        <h3>{title}</h3>
        <CoverageBadge kind={coverage} />
      </header>
      {children}
    </Surface>
  )
}

export function DesignLab() {
  const [theme, setTheme] = useState<ThemeName>(() => initialTheme())
  const [processing, setProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [selectedView, setSelectedView] = useState('Week')
  const [checkbox, setCheckbox] = useState(true)
  const [radio, setRadio] = useState('Option 1')
  const [toggle, setToggle] = useState(true)
  const [chips, setChips] = useState(['Marketing'])
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [menuSelection, setMenuSelection] = useState('Learn')

  const courseSections = useMemo(() => ['Overview', 'Learn', 'Practice', 'Exam Prep', 'Progress'], [])

  function changeTheme(nextTheme: ThemeName) {
    setTheme(nextTheme)
    window.localStorage.setItem(themeStorageKey, nextTheme)
  }

  function demonstrateProcessing() {
    setProcessing(true)
    setProcessingMessage('')
    window.setTimeout(() => {
      setProcessing(false)
      setProcessingMessage('Saved')
      window.setTimeout(() => setProcessingMessage(''), 1600)
    }, 1500)
  }

  function toggleChip(value: string) {
    setChips((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  return (
    <div className="planner-runtime design-lab-runtime" data-theme={theme}>
      <aside className="design-lab-sidebar" aria-label="Design Lab navigation">
        <BrandAsset asset="wordmark" className="design-lab-wordmark" alt="Revision" />
        <div className="design-lab-sidebar-title">
          <strong>Design Lab</strong>
          <span>Approved component canvas</span>
        </div>
        <nav>
          {navItems.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
        </nav>
        <div className="design-lab-sidebar-note">
          <strong>Governance lives in documentation.</strong>
          <span>This page is a working visual representation of approved rules and current reusable implementation.</span>
        </div>
      </aside>

      <main className="design-lab-main">
        <header className="design-lab-hero">
          <div>
            <p className="eyebrow">Founder review surface</p>
            <h1>Revision Design Canvas</h1>
            <p>Live, interactive examples of the foundations, components and approved page patterns available when composing Revision screens.</p>
          </div>
          <div className="design-lab-theme-switch" aria-label="Canvas theme">
            <Button variant={theme === 'light' ? 'primary' : 'secondary'} size="compact" onClick={() => changeTheme('light')}><Icon name="sun" size="inline" />Light</Button>
            <Button variant={theme === 'dark' ? 'primary' : 'secondary'} size="compact" onClick={() => changeTheme('dark')}><Icon name="moon" size="inline" />Dark</Button>
          </div>
        </header>

        <div className="design-lab-legend" role="note" aria-label="Implementation legend">
          <CoverageBadge kind="shared" />
          <CoverageBadge kind="page" />
          <CoverageBadge kind="gap" />
          <span>The amber label is deliberate: governance approves the pattern, but Revision does not yet own it as a reusable shared component.</span>
        </div>

        <section className="design-lab-section" aria-labelledby="foundations">
          <SectionHeading id="foundations" title="Foundations" description="The fixed visual grammar: Calm Teal colour roles, Manrope typography, spacing, radius and depth." />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Colour system">
              <div className="design-lab-token-grid">
                <TokenSwatch label="Deep Teal" token="--brand-deep-teal" value="#0F2F36" />
                <TokenSwatch label="Primary Teal" token="--brand-primary-teal" value="#2BB6A3" />
                <TokenSwatch label="Soft Aqua" token="--brand-soft-aqua" value="#E6FBF4" />
                <TokenSwatch label="Canvas" token="--color-bg" value="theme role" />
                <TokenSwatch label="Surface" token="--color-surface" value="theme role" />
                <TokenSwatch label="Graphite / text" token="--color-text" value="theme role" />
                <TokenSwatch label="Sage" token="--brand-sage" value="#BCE8CF" />
                <TokenSwatch label="Stone Blue" token="--brand-stone-blue" value="#C7D9EE" />
                <TokenSwatch label="Warm Sand" token="--brand-warm-sand" value="#F2E9D9" />
                <TokenSwatch label="Mist" token="--brand-mist" value="#E9EEF2" />
              </div>
            </SpecimenCard>

            <SpecimenCard title="Typography">
              <div className="design-lab-type-scale">
                <TypeRow role="Display L" sample="Revision that adapts to you" meta="44 / 52 · 700" className="design-lab-type-display" />
                <TypeRow role="H1" sample="Page title" meta="36 / 44 · 700" className="design-lab-type-h1" />
                <TypeRow role="H2" sample="Section title" meta="28 / 36 · 700" className="design-lab-type-h2" />
                <TypeRow role="H3" sample="Working-area heading" meta="22 / 30 · 700" className="design-lab-type-h3" />
                <TypeRow role="Body L" sample="Introductory explanation for a learner." meta="18 / 28" className="design-lab-type-body-l" />
                <TypeRow role="Body" sample="Default product and learning copy." meta="16 / 24" className="design-lab-type-body" />
                <TypeRow role="Label" sample="FIELD LABEL" meta="13 / 18 · 600" className="design-lab-type-label" />
                <TypeRow role="Caption" sample="Metadata and timestamps" meta="12 / 16" className="design-lab-type-caption" />
              </div>
            </SpecimenCard>

            <SpecimenCard title="Spacing rhythm">
              <div className="design-lab-spacing-scale">
                {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map((size) => (
                  <div key={size}><span>{size}</span><i style={{ width: `${size}px` }} /></div>
                ))}
              </div>
            </SpecimenCard>

            <SpecimenCard title="Radius & depth">
              <div className="design-lab-radius-grid">
                <div className="design-lab-radius design-lab-radius--compact"><strong>12px</strong><span>Compact</span></div>
                <div className="design-lab-radius design-lab-radius--control"><strong>14px</strong><span>Control</span></div>
                <div className="design-lab-radius design-lab-radius--surface"><strong>20px</strong><span>Surface</span></div>
                <div className="design-lab-radius design-lab-radius--feature"><strong>32px</strong><span>Feature</span></div>
                <div className="design-lab-radius design-lab-radius--pill"><strong>999px</strong><span>Pill</span></div>
              </div>
              <p className="design-lab-note">Depth comes from surface hierarchy, borders and restrained elevation — not heavy shadow.</p>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="identity">
          <SectionHeading id="identity" title="Identity & REV" description="Canonical wordmark, Living E assets and real product REV states. No mascot or substitute character." coverage="shared" />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Canonical brand assets">
              <div className="design-lab-brand-assets">
                <div><BrandAsset asset="wordmark" alt="Revision" /><span>Primary wordmark</span></div>
                <div><BrandAsset asset="living-e-resting" alt="REV Living E resting" /><span>Living E · resting asset</span></div>
                <div><BrandAsset asset="living-e-nav" alt="REV Living E navigation" /><span>Living E · navigation asset</span></div>
              </div>
            </SpecimenCard>
            <SpecimenCard title="REV state family">
              <div className="design-lab-rev-states">
                {(['resting', 'listening', 'thinking', 'responding'] as const).map((state) => (
                  <div key={state}><RevPresence state={state} size="compact" /><span>{state.charAt(0).toUpperCase() + state.slice(1)}</span></div>
                ))}
              </div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="buttons">
          <SectionHeading id="buttons" title="Buttons & actions" description="The PR #425 interaction-quality contract: hierarchy, 48px learner standard, 52px major CTA, compact Admin role, focus, press, disabled and processing feedback." coverage="shared" />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Action hierarchy">
              <div className="design-lab-button-stack">
                <Button variant="primary">Start flashcards</Button>
                <Button variant="strong">Save changes</Button>
                <Button variant="secondary">Learn more</Button>
                <Button variant="tertiary">View all <Icon name="arrow-right" size="inline" /></Button>
                <Button variant="destructive"><Icon name="trash" size="inline" />Remove course</Button>
              </div>
              <p className="design-lab-note">Hover, keyboard focus and pressed movement are live — interact with the controls rather than judging a screenshot.</p>
            </SpecimenCard>

            <SpecimenCard title="Sizes & states">
              <div className="design-lab-button-rows">
                <div><span>Compact · 36px</span><Button size="compact" variant="secondary">Refresh</Button></div>
                <div><span>Standard · 48px</span><Button>Check answer</Button></div>
                <div><span>Large · 52px</span><Button size="large">Start revision</Button></div>
                <div><span>Disabled</span><Button disabled>Add course</Button></div>
                <div><span>Processing</span><Button loading={processing} loadingLabel="Saving changes…" onClick={demonstrateProcessing}>Save changes</Button></div>
                {processingMessage && <Status tone="success" label={processingMessage}>Your change has been recorded.</Status>}
              </div>
            </SpecimenCard>

            <SpecimenCard title="Icon actions">
              <div className="design-lab-icon-actions">
                <IconButton label="Add item"><Icon name="plus" /></IconButton>
                <IconButton label="Close"><Icon name="close" /></IconButton>
                <IconButton label="Delete"><Icon name="trash" /></IconButton>
                <Button variant="secondary"><Icon name="plan" size="compact" />Add exam</Button>
                <Button><span>Continue</span><Icon name="arrow-right" size="compact" /></Button>
              </div>
              <p className="design-lab-note">Icon-only targets remain at least 44×44px. Icons support recognition; they do not replace necessary labels.</p>
            </SpecimenCard>

            <SpecimenCard title="Action language">
              <div className="design-lab-language-grid">
                <div><span>Data change</span><strong>Add course</strong></div>
                <div><span>Start work</span><strong>Start quick check</strong></div>
                <div><span>Assessment</span><strong>Check answer</strong></div>
                <div><span>Record evidence</span><strong>Record result</strong></div>
                <div><span>Navigation where obvious</span><strong>Previous / Next question</strong></div>
                <div><span>Avoid ambiguity</span><strong>Prefer consequence over “Submit”</strong></div>
              </div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="fields">
          <SectionHeading id="fields" title="Fields & selection controls" description="Live shared fields plus approved selection primitives. Missing shared primitives are shown explicitly rather than hidden." />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Shared fields">
              <div className="design-lab-form-grid">
                <TextField label="Text input" placeholder="Enter your answer…" />
                <TextField label="Search" placeholder="Search topics…" />
                <SelectField label="Select">
                  <option>Select an option…</option>
                  <option>Business</option>
                  <option>Economics</option>
                </SelectField>
                <TextField label="Exam date" type="date" defaultValue="2027-05-20" />
                <TextField label="Error example" defaultValue="Invalid value" error="Check this value and try again." />
                <TextAreaField label="Long answer" placeholder="Write your answer…" rows={5} />
              </div>
            </SpecimenCard>

            <SpecimenCard title="Selection primitives" coverage="gap">
              <div className="design-lab-selection-list">
                <label className="design-lab-check"><input type="checkbox" checked={checkbox} onChange={(event) => setCheckbox(event.target.checked)} /><span>Remember my choice</span></label>
                <fieldset className="design-lab-radio-group"><legend>Choose one</legend>{['Option 1', 'Option 2'].map((value) => <label key={value}><input type="radio" name="lab-radio" value={value} checked={radio === value} onChange={() => setRadio(value)} /><span>{value}</span></label>)}</fieldset>
                <div className="design-lab-toggle-row"><span>Enable notifications</span><button type="button" className="design-lab-toggle" role="switch" aria-checked={toggle} onClick={() => setToggle((value) => !value)}><span /></button></div>
                <div className="design-lab-chip-control" aria-label="Selected subjects">
                  {['Marketing', 'Finance', 'Operations'].map((value) => <button key={value} type="button" aria-pressed={chips.includes(value)} onClick={() => toggleChip(value)}>{value}{chips.includes(value) ? ' ×' : ' +'}</button>)}
                </div>
              </div>
              <p className="design-lab-note">Checkbox, radio, toggle and multi-select/chip semantics are approved. They do not yet have first-class shared Interface System components, so these specimens expose a real implementation gap.</p>
            </SpecimenCard>

            <SpecimenCard title="Segmented view selector">
              <SegmentedControl label="Plan view" className="design-lab-segmented">
                {['Day', 'Week', 'Month'].map((view) => <Button key={view} variant={selectedView === view ? 'strong' : 'tertiary'} aria-pressed={selectedView === view} onClick={() => setSelectedView(view)}>{view}</Button>)}
              </SegmentedControl>
              <p className="design-lab-note">Primary learner view selection prefers a 48px target. Specialist anatomy can remain distinct while meeting the same interaction-quality bar.</p>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="surfaces">
          <SectionHeading id="surfaces" title="Surfaces & card families" description="Revision does not use one universal card. Choose a surface family based on the job the content is doing." />
          <div className="design-lab-grid design-lab-grid--3">
            <SpecimenCard title="Standard">
              <Surface><h4>Card title</h4><p>Ordinary content grouping with restrained border and spacing.</p></Surface>
            </SpecimenCard>
            <SpecimenCard title="Quiet">
              <Surface variant="quiet"><h4>Supporting context</h4><p>Secondary information that should not compete with the main task.</p></Surface>
            </SpecimenCard>
            <SpecimenCard title="Interactive">
              <Surface variant="interactive"><button className="design-lab-card-link"><span><strong>Continue learning</strong><small>3.1 Target markets</small></span><Icon name="chevron-right" /></button></Surface>
            </SpecimenCard>
            <SpecimenCard title="Feature / editorial">
              <Surface variant="feature"><p className="eyebrow">Feature</p><h4>One exceptional moment</h4><p>Use larger type or stronger composition sparingly.</p></Surface>
            </SpecimenCard>
            <SpecimenCard title="Floating">
              <Surface variant="floating"><h4>Popover content</h4><p>Compact elevated context, menus and overlays.</p></Surface>
            </SpecimenCard>

            <SpecimenCard title="Guidance / recommendation" coverage="page">
              <div className="design-lab-family design-lab-family--guidance"><span className="design-lab-family-icon"><Icon name="arrow-right" /></span><div><p className="eyebrow">Recommended next</p><h4>Practise price elasticity</h4><p>REV is suggesting this because your last check showed uncertainty in this area.</p></div></div>
            </SpecimenCard>
            <SpecimenCard title="REV surface" coverage="page">
              <div className="design-lab-family design-lab-family--rev"><RevPresence size="compact" state="resting" /><div><p className="eyebrow">REV</p><h4>What would help?</h4><p>Ask about the topic, your plan or what to do next.</p></div></div>
            </SpecimenCard>
            <SpecimenCard title="Exam / performance" coverage="page">
              <div className="design-lab-family design-lab-family--exam"><div><small>Next exam</small><strong>42 days</strong><span>AQA Business · Paper 1</span></div><div className="design-lab-mini-progress"><span style={{ width: '68%' }} /></div><small>68% of planned coverage complete</small></div>
            </SpecimenCard>
            <SpecimenCard title="Subject accent" coverage="page">
              <div className="design-lab-family design-lab-family--subject"><span className="design-lab-subject-marker" /><div><small>BUSINESS</small><h4>AQA A-level Business</h4><span>A-level · AQA · 7132</span></div></div>
            </SpecimenCard>
            <SpecimenCard title="Pricing / entitlement" coverage="page">
              <div className="design-lab-family design-lab-family--pricing"><div><small>Plan</small><h4>Revision Plus</h4><p>Explain the learner value and entitlement boundary directly.</p></div><Button variant="secondary">View plan</Button></div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="feedback">
          <SectionHeading id="feedback" title="Status, tags, alerts & messages" description="Semantic feedback must use icon/text as well as colour. Tags and chips are for compact classification or state, not decoration." />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Shared semantic status">
              <div className="design-lab-status-stack">
                <Status tone="success" label="Completed">Great progress. You have completed this topic.</Status>
                <Status tone="info" label="Suggested next step">REV has updated your plan based on your recent work.</Status>
                <Status tone="warning" label="Needs work">This topic could use another short practice session.</Status>
                <Status tone="error" label="Could not save">Your work is still here. Try saving again.</Status>
              </div>
            </SpecimenCard>
            <SpecimenCard title="Tags & compact state" coverage="gap">
              <div className="design-lab-tag-cloud">
                <span className="design-lab-tag">Not started</span>
                <span className="design-lab-tag design-lab-tag--info">In progress</span>
                <span className="design-lab-tag design-lab-tag--success">Completed</span>
                <span className="design-lab-tag design-lab-tag--warning">Needs work</span>
                <span className="design-lab-tag design-lab-tag--focus">Exam focus</span>
              </div>
              <p className="design-lab-note">The visual language is governed, but Revision does not yet expose one general reusable Tag/Chip component.</p>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="navigation">
          <SectionHeading id="navigation" title="Navigation & page structure" description="A compact inventory of the approved navigation hierarchy and page-level structural building blocks — not copies of production pages." />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Shared menu">
              <Menu label="Example menu" className="design-lab-menu">
                {(['Overview', 'Learn', 'Practice', 'Exam Prep', 'Progress'] as const).map((item) => (
                  <MenuItem key={item} current={menuSelection === item} onClick={() => setMenuSelection(item)}><Icon name={item === 'Learn' ? 'courses' : item === 'Progress' ? 'progress' : 'chevron-right'} /><span>{item}</span></MenuItem>
                ))}
              </Menu>
            </SpecimenCard>

            <SpecimenCard title="Locked learner hierarchy" coverage="page">
              <div className="design-lab-nav-tree">
                <span>Home</span><span>Plan</span><span>Progress</span><strong>Courses</strong>
                <div className="design-lab-course-identity"><b>BUSINESS</b><small>A-level · AQA · 7132</small></div>
                {courseSections.map((section) => <span key={section} className={section === 'Learn' ? 'active' : ''}>{section}</span>)}
                <span className="level-2">1. What is business?</span>
                <span className="level-3">Marketing</span>
                <span className="level-4">3.1 Target markets</span>
              </div>
              <p className="design-lab-note">Course identity resets the hierarchy. Only academic descendants beneath Learn add progressive indentation.</p>
            </SpecimenCard>

            <SpecimenCard title="Page header">
              <PageHeader titleId="design-lab-header-example" eyebrow="AQA · Specification 7132" title="AQA A-level Business" description="A page title has one clear job, an optional eyebrow and a concise explanation of what the learner can do here." />
            </SpecimenCard>

            <SpecimenCard title="Course header pattern" coverage="page">
              <div className="design-lab-course-header">
                <div><p className="eyebrow">BUSINESS</p><h3>AQA A-level Business</h3><span>A-level · AQA · 7132</span></div>
                <div className="design-lab-course-tabs">{courseSections.map((section) => <button type="button" key={section} className={section === 'Learn' ? 'active' : ''}>{section}</button>)}</div>
              </div>
            </SpecimenCard>

            <SpecimenCard title="Next-step block" coverage="page">
              <div className="design-lab-next-step"><div><p className="eyebrow">Next up</p><h4>3.1 Target markets</h4><p>Understand how businesses identify and target different market segments.</p><span>~ 25 minutes</span></div><Button>Start <Icon name="arrow-right" size="inline" /></Button></div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="education">
          <SectionHeading id="education" title="Learn blocks" description="One shared style per Learn content type (tinted). The content says what a block is; the UI decides how it looks; the course supplies only its subject hue." coverage="shared" />
          <div className="learn-reading-workspace learn-reading-workspace--specimen" style={accentStyle('blue')}>
            {everyBlockType.map((block, index) => <LearnBlock key={`${block.type}-${index}`} block={block} />)}
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="data">
          <SectionHeading id="data" title="Progress, metrics & data visualisation" description="Evidence should be explained, not decorated. Different measures stay distinct rather than collapsing into one confidence score." coverage="page" />
          <div className="design-lab-grid design-lab-grid--3">
            <SpecimenCard title="Bounded progress" coverage="page">
              <div className="design-lab-metric"><strong>68%</strong><span>12 of 18 topics completed</span></div>
              <div className="design-lab-progress"><span style={{ width: '68%' }} /></div>
            </SpecimenCard>
            <SpecimenCard title="Countdown" coverage="page">
              <div className="design-lab-countdown"><Icon name="plan" /><div><strong>42 days</strong><span>until your first exam</span></div></div>
            </SpecimenCard>
            <SpecimenCard title="Comparison bars" coverage="page">
              <div className="design-lab-bars"><div><span>Marketing</span><i><b style={{ width: '78%' }} /></i><strong>78</strong></div><div><span>Finance</span><i><b style={{ width: '54%' }} /></i><strong>54</strong></div><div><span>Operations</span><i><b style={{ width: '66%' }} /></i><strong>66</strong></div></div>
            </SpecimenCard>
            <SpecimenCard title="List / table row" coverage="page">
              <div className="design-lab-table" role="table" aria-label="Topic progress example"><div role="row"><strong role="columnheader">Topic</strong><strong role="columnheader">Status</strong></div><div role="row"><span role="cell">1. What is business?</span><span role="cell" className="design-lab-tag design-lab-tag--success">Completed</span></div><div role="row"><span role="cell">2. Managers and leadership</span><span role="cell" className="design-lab-tag design-lab-tag--info">In progress</span></div></div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="states">
          <SectionHeading id="states" title="Empty, loading & overlays" description="The working states that stop the UI becoming ambiguous when content is absent, loading or temporarily layered." />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Empty state">
              <EmptyState title="No practice recorded yet" description="Complete a practice activity and Revision will start building useful evidence here." action={<Button>Choose a topic</Button>} />
            </SpecimenCard>
            <SpecimenCard title="Loading state">
              <LoadingState>Loading your latest progress…</LoadingState>
            </SpecimenCard>
            <SpecimenCard title="Modal, drawer & popover">
              <div className="design-lab-overlay-actions">
                <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
                <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
                <div className="design-lab-popover-anchor"><Button variant="secondary" aria-expanded={popoverOpen} onClick={() => setPopoverOpen((value) => !value)}>Toggle popover</Button>{popoverOpen && <PopoverShell label="Example popover" className="design-lab-popover"><strong>Compact context</strong><p>Use popovers for small, local information or actions.</p></PopoverShell>}</div>
              </div>
            </SpecimenCard>
          </div>
        </section>

        <section className="design-lab-section" aria-labelledby="icons">
          <SectionHeading id="icons" title="Icons & graphic language" description="One controlled rounded-line product icon set plus restrained Revision motifs. Living E remains identity, not a generic icon." coverage="shared" />
          <div className="design-lab-grid design-lab-grid--2">
            <SpecimenCard title="Current icon registry">
              <div className="design-lab-icon-grid">{iconNames.map((name) => <div key={name}><Icon name={name} /><span>{name}</span></div>)}</div>
            </SpecimenCard>
            <SpecimenCard title="Graphic / illustration language" coverage="page">
              <div className="design-lab-graphic"><div className="design-lab-graphic-shape design-lab-graphic-shape--one" /><div className="design-lab-graphic-shape design-lab-graphic-shape--two" /><BrandAsset asset="living-e-resting" alt="REV Living E" /><div><strong>Soft geometric crops, restrained line echoes and calm accent fields</strong><p>Use illustration as art direction inside a governed surface — never school clip-art, mixed 3D icon styles or decorative AI spectacle.</p></div></div>
            </SpecimenCard>
          </div>
        </section>

        <footer className="design-lab-footer">
          <strong>This canvas is not design authority.</strong>
          <span>Approved rules remain recorded in the Visual Brand System, Interactive Component Quality Standard and related product/experience documentation.</span>
        </footer>
      </main>

      {modalOpen && <>
        <OverlayBackdrop className="design-lab-overlay-backdrop" label="Close modal" onClick={() => setModalOpen(false)} />
        <ModalShell className="design-lab-modal" label="Example modal" onDismiss={() => setModalOpen(false)}>
          <header><p className="eyebrow">Example overlay</p><h2>Confirm this action?</h2></header>
          <p>Shared modal behaviour owns focus containment, Escape dismissal, background inertness and focus return.</p>
          <div className="design-lab-modal-actions"><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={() => setModalOpen(false)}>Delete</Button></div>
        </ModalShell>
      </>}

      {drawerOpen && <>
        <OverlayBackdrop className="design-lab-overlay-backdrop" label="Close drawer" onClick={() => setDrawerOpen(false)} />
        <DrawerShell className="design-lab-drawer" label="Example drawer" onDismiss={() => setDrawerOpen(false)}>
          <header className="design-lab-drawer-head"><div><p className="eyebrow">Example drawer</p><h2>Filters</h2></div><IconButton label="Close drawer" onClick={() => setDrawerOpen(false)}><Icon name="close" /></IconButton></header>
          <SelectField label="Topic"><option>All topics</option><option>Marketing</option><option>Finance</option></SelectField>
          <div className="design-lab-selection-list"><label className="design-lab-check"><input type="checkbox" defaultChecked /><span>Not started</span></label><label className="design-lab-check"><input type="checkbox" /><span>In progress</span></label></div>
          <Button onClick={() => setDrawerOpen(false)}>Apply filters</Button>
        </DrawerShell>
      </>}
    </div>
  )
}
