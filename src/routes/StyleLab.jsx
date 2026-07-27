import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  AnswerOption,
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  ErrorState,
  FeedbackNotice,
  Field,
  GameFrame,
  GameHUD,
  IconButton,
  LoadingState,
  NavItem,
  Notice,
  PageHeader,
  ProgressBar,
  RadioCard,
  SectionHeader,
  Select,
  Skeleton,
  StatTile,
  Surface,
  Switch,
  Tabs,
  Tooltip,
} from '../components/foundations/Primitives';
import '../styles/dev/StyleLab.css';

const tabs = [{ id: 'progress', label: 'Progress' }, { id: 'rewards', label: 'Rewards' }, { id: 'history', label: 'History' }];

function LabSection({ id, title, description, children }) {
  return <section id={id} className="style-lab__section" aria-labelledby={`${id}-title`}><SectionHeader headingId={`${id}-title`} title={title} description={description} />{children}</section>;
}

export default function StyleLab() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('time');
  const [activeTab, setActiveTab] = useState('progress');
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [answer, setAnswer] = useState('https');

  return <main className="style-lab" data-route-focus tabIndex="-1">
    <a className="style-lab__skip" href="#lab-content">Skip to components</a>
    <div className="style-lab__topology" data-motion="decorative" aria-hidden="true" />
    <PageHeader eyebrow="Development only · Phase 1" title="NetQuest visual laboratory" description="Semantic foundations and reusable interaction states for The Living Network. Use Tab and arrow keys to review behavior; switch themes without leaving this page." actions={<><Badge tone="info">Resolved: {resolvedTheme}</Badge><Button variant="secondary" onClick={() => window.location.assign('/')}>Return to app</Button></>} />

    <nav className="style-lab__toc" aria-label="Laboratory sections">
      {['Foundations', 'Actions', 'Forms', 'Progress', 'Feedback', 'States', 'Game'].map((item) => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}
    </nav>

    <div id="lab-content" className="style-lab__content">
      <LabSection id="foundations" title="Foundations" description="Semantic roles remain equivalent across light and dark; the selected preference is stored by the existing theme provider.">
        <Surface padding="lg" className="style-lab__theme-panel">
          <fieldset><legend>Theme preference</legend><div className="style-lab__radio-row">{['system', 'dark', 'light'].map((value) => <RadioCard key={value} name="lab-theme" value={value} checked={theme === value} onChange={() => setTheme(value)} label={value[0].toUpperCase() + value.slice(1)} description={value === 'system' ? 'Follow the operating system' : `Always use ${value} mode`} />)}</div></fieldset>
        </Surface>
        <div className="style-lab__swatches" aria-label="Semantic color examples">
          {['canvas', 'surface-1', 'surface-2', 'text-primary', 'action-primary', 'success-border', 'warning-border', 'danger-border', 'xp-border', 'streak-border', 'data-1', 'data-5'].map((token) => <div key={token} className="style-lab__swatch"><span style={{ background: `var(--color-${token})` }} /><code>--color-{token}</code></div>)}
        </div>
        <Surface padding="lg" className="style-lab__type-sample"><span className="nq-eyebrow">Live network mission</span><h2>Continue your journey</h2><p>Inter keeps instructions and long-form explanations clear at every supported width.</p><strong data-technical>192.168.10.0/24 · PORT 443 · 01:24</strong></Surface>
      </LabSection>

      <LabSection id="actions" title="Actions and navigation" description="One primary action per context; secondary, quiet, destructive, loading, and disabled states retain visible focus.">
        <div className="style-lab__row"><Button>Begin mission</Button><Button variant="secondary">Review lesson</Button><Button variant="quiet">Learn more</Button><Button variant="danger">Delete data</Button><Button loading>Save</Button><Button disabled>Unavailable</Button><IconButton label="Open sound settings">♪</IconButton><Tooltip label="Keyboard shortcut: S"><IconButton label="Sound information">?</IconButton></Tooltip></div>
        <Surface padding="sm" className="style-lab__nav-demo" aria-label="Navigation example"><NavItem to="/dev/ui-lab" active icon="⌂">Laboratory</NavItem><NavItem to="/dashboard/learning-paths" icon="⌁">Learning paths</NavItem><NavItem to="/dashboard/settings" icon="⚙">Settings</NavItem></Surface>
      </LabSection>

      <LabSection id="forms" title="Forms and selection" description="Native fields expose labels, help, validation, selected, disabled, checked, and switched states.">
        <div className="style-lab__form-grid"><Field label="Display name" defaultValue="Packet Pilot" hint="Shown on your profile." /><Field label="Email" defaultValue="invalid-address" error="Enter a valid email address." aria-label="Invalid email example" /><Field label="Disabled field" value="Managed by account" disabled readOnly /><Select label="Default difficulty" defaultValue="medium"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></div>
        <fieldset><legend>Mission mode</legend><div className="style-lab__radio-row"><RadioCard name="mode" value="practice" checked={selectedMode === 'practice'} onChange={() => setSelectedMode('practice')} label="Practice" description="Learn at your own pace with hints." meta="No timer" /><RadioCard name="mode" value="time" checked={selectedMode === 'time'} onChange={() => setSelectedMode('time')} label="Time Attack" description="Race the clock and build a streak." meta="60 seconds" /><RadioCard name="mode" value="locked" disabled label="Mastery" description="Complete five missions to unlock." meta="Locked" /></div></fieldset>
        <div className="style-lab__row"><Checkbox label="Show hints" description="Available in practice mode" defaultChecked /><Switch label="Sound effects" description="Play answer and reward sounds" checked={sound} onChange={(event) => setSound(event.target.checked)} /><Switch label="Notifications" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} /></div>
      </LabSection>

      <LabSection id="progress" title="Progress and data" description="Technical values use tabular monospace figures; progression colors have semantic roles rather than decorative meaning.">
        <div className="style-lab__stat-grid"><StatTile label="Score" value="1,240" detail="Personal best" icon="◎" /><StatTile label="XP earned" value="+120" detail="Level 4" tone="xp" icon="◇" /><StatTile label="Answer streak" value="6 ×2" detail="Next reward at 10" tone="streak" icon="↗" /><StatTile label="Accuracy" value="86%" detail="12 of 14 correct" icon="✓" /></div>
        <Surface padding="lg" className="style-lab__progress-stack"><ProgressBar label="Lesson progress" value={45} /><ProgressBar label="Daily goal" value={2} max={3} valueLabel="2 of 3" tone="success" /><ProgressBar label="Level progress" value={320} max={500} valueLabel="320 / 500 XP" tone="xp" /><ProgressBar label="Streak milestone" value={6} max={10} valueLabel="6 / 10" tone="streak" /></Surface>
        <div className="style-lab__row"><Badge>Available</Badge><Badge tone="success">Completed</Badge><Badge tone="warning">Timer low</Badge><Badge tone="danger">Incorrect</Badge><Badge tone="info">Current</Badge><Badge tone="xp">+120 XP</Badge><Badge tone="streak">Streak ×6</Badge></div>
      </LabSection>

      <LabSection id="feedback" title="Feedback and overlays" description="Correctness is understood first; XP and milestone feedback follow in lower-priority lanes.">
        <div className="style-lab__notice-grid"><Notice tone="success" title="Settings saved">Your preferences are available on this device.</Notice><Notice tone="warning" title="10 seconds remaining">The timer is approaching its final threshold.</Notice><Notice tone="danger" title="Connection failed">Check your network and try again.</Notice><Notice title="New mission available">Subnetting Challenge is ready to play.</Notice></div>
        <div className="style-lab__row"><Button onClick={() => setDialogOpen(true)}>Open dialog</Button><Button variant="secondary" onClick={() => setAnswer((current) => current === 'https' ? 'ssh' : 'https')}>Toggle answer state</Button></div>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Leave this mission?" description="Your current question will remain available when you return." actions={<><Button variant="quiet" onClick={() => setDialogOpen(false)}>Keep playing</Button><Button onClick={() => setDialogOpen(false)}>Leave mission</Button></>}><p>This native dialog supports Escape, focus containment, and focus restoration.</p></Dialog>
      </LabSection>

      <LabSection id="states" title="Tabs, loading, empty, and error" description="Recovery states use plain language and preserve a useful next action.">
        <Tabs label="Progress views" items={tabs} activeId={activeTab} onChange={setActiveTab} panelId="lab-progress-panel" />
        <Surface id="lab-progress-panel" role="tabpanel" aria-labelledby={`lab-progress-panel-${activeTab}-tab`} padding="lg"><strong>Selected panel: {tabs.find((item) => item.id === activeTab)?.label}</strong><p className="style-lab__muted">Use Left/Right, Home, and End while a tab has focus.</p></Surface>
        <div className="style-lab__state-grid"><Surface padding="lg"><Skeleton width="42%" height="1.25rem" /><div className="style-lab__skeleton-lines"><Skeleton /><Skeleton width="78%" /><Skeleton width="56%" /></div></Surface><LoadingState label="Loading mission data…" /><EmptyState title="No completed missions" action={<Button size="sm">Choose a mission</Button>}>Finish a mission to see your results here.</EmptyState><ErrorState title="Could not load progress" action={<Button size="sm" variant="secondary">Try again</Button>}>Your saved progress is safe.</ErrorState></div>
      </LabSection>

      <LabSection id="game" title="Shared game grammar" description="A stable HUD, center challenge, and bottom answer zone provide the visual contract for Phase 3.">
        <GameFrame><GameHUD stats={[{ label: 'Score', value: '1,240' }, { label: 'Streak', value: '6 ×2' }, { label: 'Time', value: '01:24' }, { label: 'Progress', value: '4 / 10' }]} /><FeedbackNotice correct title="Correct · +240 points">Port 443 carries HTTPS traffic.</FeedbackNotice><Surface padding="lg" className="style-lab__question"><Badge tone="info">Port → Service</Badge><p>Which service commonly listens on this port?</p><strong data-technical>443</strong><small data-technical>TCP · SECURE WEB TRAFFIC</small></Surface><div className="style-lab__answer-grid"><AnswerOption index="1">HTTP</AnswerOption><AnswerOption index="2" selected={answer === 'https'} result={answer === 'https' ? 'correct' : undefined}>HTTPS</AnswerOption><AnswerOption index="3" selected={answer === 'ssh'} result={answer === 'ssh' ? 'incorrect' : undefined}>SSH</AnswerOption><AnswerOption index="4" disabled>DNS · cooldown</AnswerOption></div></GameFrame>
      </LabSection>
    </div>
  </main>;
}
