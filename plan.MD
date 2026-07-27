# NetQuest Visual Redesign Plan

> Planning document only. This roadmap does not authorize changes to game logic, scoring, persistence, routing, authentication, lesson content, or backend behavior.

## 1. Redesign outcome

Turn NetQuest from a collection of individually styled screens into one polished learning game with a recognizable identity, a clear progression loop, and consistent behavior on desktop and mobile.

The redesign should make the experience feel like an approachable **network operations academy**: technical and energetic, but not a generic neon “hacker” interface. Players should always understand:

1. What they can do next.
2. What they are currently learning.
3. How they performed.
4. How that performance advances their larger journey.

The primary product loop should read visually as:

**Choose a mission → configure the challenge → play → receive clear feedback → review results → continue progressing**

## 2. Current baseline

### What should be preserved

- A functional React/Vite application with route-level shells for public, dashboard, game, and lesson views.
- Eight playable networking games.
- Shared game elements such as mode selection, difficulty selection, stats, questions, answers, power-ups, HUD feedback, and end screens.
- Learning paths, lesson reading, quizzes, achievements, leaderboard, settings, guest mode, themes, sounds, rewards, and streaks.
- The recently added foundation files for tokens, themes, typography, reset, and reduced-motion behavior.
- Existing route, theme, and settings tests as regression coverage.

### Main design problems to solve

- Styling is highly fragmented: 46 CSS files and roughly 17,000 lines of CSS currently define overlapping visual rules.
- More than 1,200 hard-coded color occurrences outside the foundation layer prevent reliable theming and visual consistency.
- Global names such as `.content`, `.section-title`, `.game-card`, `.stat-item`, and `.nav-link` are reused across unrelated views and are vulnerable to cascade conflicts.
- Components mix old blue/green styling, newer cyan tokens, light-only landing styles, gradients, glass effects, glow effects, and several unrelated radius and spacing systems.
- The dashboard gives equal visual weight to too many things instead of prioritizing “continue learning” or “play next.”
- Game setup, gameplay, and result screens contain good functionality but do not yet feel like phases of the same journey.
- Feedback competes for attention: score, streak, timer, bonuses, power-ups, particles, reward overlays, and milestone celebrations can all become visually loud.
- Mobile rules are repeated across many files, which makes layouts hard to predict and maintain.
- Some presentation is embedded as inline styles, making responsive and theme behavior harder to control.
- Copy, iconography, naming, and branding vary between “Net Study,” “NetQuest,” “game,” “challenge,” and “master.”

## 3. Goals and non-goals

### Goals

- Establish a distinctive, cohesive visual identity for NetQuest.
- Make the next useful action obvious on every major screen.
- Create one reusable visual language for all eight games without removing their individual character.
- Improve information hierarchy, readability, touch ergonomics, and responsive behavior.
- Give success, failure, streaks, XP, and achievements a deliberate feedback hierarchy.
- Support dark and light themes from the same semantic token system.
- Meet WCAG 2.2 AA expectations for contrast, focus, keyboard access, motion, and target sizes.
- Reduce future design work by creating reusable primitives and documented patterns.
- Roll out the redesign incrementally, keeping the application playable after every phase.

### Non-goals

- Rewriting the game engine or consolidating game state in this project.
- Changing question data, difficulty, scoring, rewards, authentication, APIs, or persistence.
- Adding new games, learning modules, social systems, or monetization.
- Replacing React, Vite, React Router, or the current icon library.
- Performing a one-shot CSS rewrite across the entire application.

## 4. Creative direction

### Theme: “The Living Network”

Use the visual language of packets moving through a network: nodes, paths, hops, signals, topology maps, status lights, terminal labels, and subtle grid structures. The interface should feel precise enough for technical learners and playful enough to sustain a game loop.

### Visual characteristics

- **Canvas:** deep midnight navy in dark mode and cool near-white in light mode.
- **Primary action:** signal cyan, reserved for navigation and the main action.
- **Progress and success:** connection green.
- **Streak and urgency:** warm amber.
- **Errors:** accessible coral/red that is never communicated by color alone.
- **Typography:** Inter for interface and reading; IBM Plex Mono for ports, IP addresses, commands, timers, score values, and compact technical labels.
- **Shape:** mostly restrained 8–16px radii; pills only for statuses, filters, and compact metadata.
- **Depth:** borders and surface contrast first, shadows second, glow only for short-lived game feedback.
- **Texture:** subtle topology lines, node patterns, or packet trails in hero and empty areas; never behind dense lesson copy.
- **Motion:** fast and purposeful. Use movement to show state change, not as a permanent decoration.
- **Illustration:** a small reusable set of abstract network diagrams and device motifs rather than unrelated stock imagery.

### Experience rules

- Each screen gets one dominant call to action.
- Game-critical information stays stable in position during play.
- Correctness feedback appears before rewards; rewards appear before longer-term progression.
- Technical values use monospace and align consistently.
- Locked content explains how to unlock it.
- Hover is enhancement only; every action works and reads clearly without it.
- Celebration intensity scales with importance: answer < streak < game completion < level/milestone.
- Dark and light themes must be designed together, not generated by inversion.

## 5. Target experience by surface

### Landing and sign-in

- Replace the centered text-only hero with a split composition: concise value proposition and CTA on one side, interactive-looking “live network mission” preview on the other.
- Show the three-step learning loop and a small selection of real game types below the hero.
- Make “Start as guest” the clear primary CTA and “Sign in” the secondary CTA.
- Move referrals below product proof so they do not compete with first-run conversion.
- Restyle authentication as a focused, accessible dialog using shared fields and buttons.
- Use one responsive header with working section anchors and a compact mobile menu.

### Application shell and dashboard

- Replace the heavy top bar/sidebar combination with a calmer persistent shell.
- Keep brand and primary navigation in the sidebar; place account, theme, sound, and session state in a compact utility area.
- Make the dashboard start with a personalized “Continue your journey” panel.
- Follow with daily challenge/progress, recommended games, then the full game library.
- Give game cards category, difficulty, best score or completion, and a consistent action area.
- Add filtering/grouping only if it clarifies the existing eight games; do not add new content types.
- On mobile, use a proper modal navigation drawer with backdrop, close behavior, focus management, and scroll locking.

### Game setup

- Present mode and difficulty as a short two-step configuration flow under a shared game header.
- Keep the selected game identity, description, best score, and expected duration visible.
- Make selectable cards behave like actual radio options with obvious selected, hover, focus, and disabled states.
- Provide one stable primary action to begin and one low-emphasis route back to the dashboard.

### Active gameplay

- Use a consistent three-zone layout:
  - Compact top HUD for score, streak/multiplier, timer, and progress.
  - Center stage for the question or interactive challenge.
  - Bottom action zone for answers, hints, and power-ups.
- Reserve screen-center overlays for correctness feedback only.
- Move bonuses and streak notices to a predictable notification lane so they do not obscure the question.
- Use urgent timer treatments only at meaningful thresholds and never rely on color alone.
- Keep answer targets at least 44px high, with visible keyboard focus and disabled/cooldown states.
- Give each game one restrained accent motif while retaining the shared shell.

### Results and sharing

- Reduce the result view to a clear hierarchy: outcome, XP earned, core stats, improvement insight, then actions.
- Make “Play again” primary and “Choose another mission” secondary.
- Show personal-best and mastery celebrations only when earned.
- Move sharing into an optional secondary panel; simplify the share card so it reflects the new brand without competing with results.
- Preserve all existing share behavior while replacing placeholder or alert-driven presentation in a later functional project, outside this redesign scope.

### Learning paths and lessons

- Turn the learning path into an actual route/map with a prominent next lesson rather than a stack of equally weighted accordions.
- Show module state consistently: completed, current, available, and locked.
- Keep XP, duration, difficulty, prerequisites, and completion status in a standard metadata row.
- Redesign lessons for reading first: narrower content measure, persistent progress, legible section navigation, clear code blocks, and a calm knowledge-check transition.
- On mobile, turn section tabs into an accessible horizontal scroller or select/menu pattern.
- Keep game styling out of long-form lesson content; prioritize comprehension over spectacle.

### Progress, leaderboard, achievements, and settings

- Use one stat-card system across dashboard, progress, game results, and leaderboard.
- Separate personal progress from social ranking so the leaderboard does not dominate the learning goal.
- Group achievements by status and make progress toward locked achievements understandable.
- Use consistent rank, XP, streak, and completion visualizations.
- Reorganize settings into Account, Appearance, Audio, Gameplay, and Data sections with clear save state and feedback.

## 6. Design system required before broad migration

### Foundation tokens

Extend the existing foundation instead of replacing it. Define and document:

- Semantic colors for canvas, surfaces, text, borders, actions, feedback, XP, streaks, ranks, and overlays.
- A single spacing scale, type scale, radius scale, shadow scale, z-index map, and motion scale.
- Layout tokens for header height, sidebar widths, content widths, reading width, HUD height, and responsive gutters.
- Component-state tokens for hover, pressed, selected, disabled, focus, success, warning, and danger.
- Data-visualization colors that maintain contrast in both themes.
- Breakpoint policy based on content behavior, with the existing values serving as initial reference points.

### Shared primitives

Create visual specifications first, then implement reusable components in a later coding phase:

- Button and icon button
- Link and navigation item
- Card/surface
- Badge/status chip
- Field, select, radio card, checkbox, and switch
- Progress bar/ring
- Stat tile
- Tooltip
- Dialog/drawer
- Toast/notification
- Tabs/segmented control
- Skeleton, loading, empty, and error states
- Page header and section header
- Game shell, game HUD, answer option, and feedback notice

Every primitive needs variants, interactive states, theme examples, keyboard behavior, responsive rules, and usage guidance. Avoid building variants that are not needed by an audited screen.

### CSS strategy

- Keep foundation CSS global and semantic.
- Scope component styles with a consistent naming convention or CSS Modules; choose one approach before migration.
- Stop adding new generic global class names.
- Replace hard-coded values as each component is migrated, not through a blind repository-wide replacement.
- Remove old rules only after the migrated surface passes visual and functional checks.
- Maintain a temporary legacy layer with a documented deletion list and no new additions.

## 7. Incremental delivery plan

Each phase should be a separately reviewable change. A phase is complete only when its acceptance gate passes; avoid partially converting unrelated screens in the same change.

### Phase 0 — Baseline and redesign specification

**Scope**

- Inventory every route and every distinct state: loading, empty, error, guest, authenticated, locked, active game, correct, incorrect, cooldown, game over, modal, and celebration.
- Capture reference screenshots at approximately 375px, 768px, 1280px, and 1440px widths for dark and light themes where supported.
- Record the critical smoke flows: guest entry, navigation, game setup, a correct and incorrect answer, game completion, lesson completion, settings change, and logout.
- Produce low-fidelity layouts for landing, dashboard, game setup, active gameplay, results, learning path, and lesson.
- Produce one visual direction board and a small set of high-fidelity key screens.
- Agree on vocabulary: NetQuest, mission/game naming, XP, streak, level, learning path, and achievement labels.

**Acceptance gate**

- All routes and state variants are accounted for.
- The new hierarchy is approved before component work begins.
- Existing behavior and data contracts are documented as fixed constraints.

### Phase 1 — Foundations and visual laboratory

**Scope**

- Expand semantic tokens and validate both themes.
- Specify typography, icon sizes, layout grids, elevation, focus rings, motion, and responsive behavior.
- Build a temporary internal showcase route or development-only page for primitives and their states.
- Add automated contrast checks where practical and visual examples for reduced motion.

**Acceptance gate**

- No primitive uses a raw brand color when a semantic token exists.
- All interactive states work in dark/light themes and with keyboard navigation.
- Text, controls, focus indicators, and feedback states meet WCAG 2.2 AA contrast targets.

### Phase 2 — App shell and dashboard

**Scope**

- Redesign header, sidebar, mobile drawer, route content frame, and loading/error/not-found presentation.
- Recompose the dashboard around continue/recommendation, daily progress, and the game library.
- Migrate game cards, section headers, compact leaderboard, level progress, and streak preview to shared primitives.
- Preserve current routes and the guest/authenticated branching behavior.

**Acceptance gate**

- Dashboard hierarchy is clear at all target widths.
- Navigation is keyboard operable and announces the active route.
- Mobile navigation traps/restores focus correctly and does not leave the page scrollable behind it.
- No dashboard regression in routing, guest mode, leaderboard loading, or user progress display.

### Phase 3 — One complete vertical slice: Port Number Game

**Why this comes first**

The Port Number Game already uses many shared pieces, so it can validate the full system from mode selection through game results before the other games are touched.

**Scope**

- Redesign game identity/header, stats, mode selection, difficulty selection, active HUD, question card, answers, hints, power-ups, feedback, bonuses, and result screen.
- Define the final responsive game layout and notification hierarchy.
- Exercise every gameplay state, including practice, time attack, cooldown, timer warning, correct/incorrect feedback, streak reward, power-up, and game end.
- Tune sound and motion presentation without changing their triggers or underlying logic.

**Acceptance gate**

- The complete port-game loop is visually coherent and usable at 320px width through large desktop.
- Content does not jump when score, feedback, or bonuses update.
- Keyboard-only play is possible for all answer and power-up actions.
- Reduced-motion mode removes nonessential transforms and particles while keeping state changes understandable.
- Existing score, timer, streak, power-up, XP, persistence, and navigation behavior remains unchanged.

### Phase 4 — Shared game template and remaining games

**Scope**

- Extract the proven visual patterns from the vertical slice into the shared game shell and primitives.
- Migrate games in small groups:
  1. Protocol Matcher and Tech Acronym Quiz.
  2. Subnetting and Command Line.
  3. Firewall Rules and Encryption Challenge.
  4. Network Topology.
- Give each game a single accent/icon motif, not an independent design system.
- Handle game-specific layouts explicitly: code/terminal input, subnet calculations, rule builders, encryption interactions, and topology canvases.

**Acceptance gate for each group**

- Setup, gameplay, feedback, and results match the shared interaction model.
- Game-specific content remains readable and does not overflow at target breakpoints.
- Shared changes do not alter already migrated games.
- All game logic and persistence smoke checks pass before moving to the next group.

### Phase 5 — Learning experience

**Scope**

- Redesign Learning Paths as a progression route with a prominent next action.
- Migrate module cards, lesson rows, states, metadata, progress, and achievements.
- Redesign Lesson Detail, section navigation, markdown typography, code blocks, activities, quizzes, completion, and responsive behavior.
- Align lesson rewards and completion moments with the game feedback hierarchy.

**Acceptance gate**

- A user can identify their next available lesson without opening every module.
- Locked, available, current, and completed states are distinct without relying only on color.
- Lesson text remains comfortable to read and code remains usable at mobile widths.
- Loading failure, missing lesson, quiz, and completion states are covered.

### Phase 6 — Progression and account surfaces

**Scope**

- Migrate full leaderboard, achievements, reward animation, milestone celebration, level progress, streaks, and statistics.
- Apply one system for stat hierarchy, ranks, progress indicators, and reward intensity.
- Redesign settings and account presentation with shared form controls and explicit feedback.
- Review avatar handling, guest messaging, theme controls, and logout placement for visual consistency.

**Acceptance gate**

- Personal progress and social comparison are clearly separated.
- Reward overlays never block recovery/navigation and work with reduced motion.
- All setting controls have labels, focus states, saved-state feedback, and theme parity.

### Phase 7 — Landing, authentication, and brand pass

**Scope**

- Implement the new landing hierarchy, product preview, proof sections, referral section, and footer.
- Migrate login/signup and referral dialogs to shared primitives.
- Standardize logo usage, product naming, game names, iconography, and concise interface copy across every route.
- Add network motifs or original illustration assets only after layouts are stable.

**Acceptance gate**

- Guest and sign-in actions are immediately distinguishable.
- Landing content explains the product before presenting referrals.
- Public/authenticated states and all dialogs work at each target width.
- Brand assets are optimized, theme-aware where needed, and do not obscure content.

### Phase 8 — Consolidation, accessibility, and release polish

**Scope**

- Remove superseded CSS and unused component variants in small, verified batches.
- Eliminate remaining accidental hard-coded colors and unscoped legacy selectors.
- Audit keyboard order, landmarks, headings, labels, live announcements, contrast, zoom, and screen-reader output.
- Test 200% browser zoom, text enlargement, reduced motion, coarse pointers, slow network, and offline/error states.
- Profile CSS/JS/assets and reduce expensive shadows, backdrop filters, animations, and unnecessary font/icon weight.
- Run cross-browser checks in current Chrome, Firefox, Safari, and Edge.

**Acceptance gate**

- No critical or serious automated accessibility findings on primary flows, followed by manual keyboard and screen-reader checks.
- No horizontal page scroll at 320px except intentionally scrollable content such as code or tabs.
- Core flows remain usable under reduced motion and at 200% zoom.
- Production build, automated tests, route smoke tests, and agreed visual regression checks pass.
- Legacy stylesheet deletion list is empty or every remaining item has an owner and reason.

## 8. Review and testing matrix

Every migrated surface should be reviewed against this matrix before its legacy CSS is removed.

| Dimension | Required coverage |
| --- | --- |
| Theme | Dark and light |
| Width | 320/375, 768, 1024, 1280, and 1440px |
| Input | Mouse, touch-sized targets, keyboard only |
| Motion | Default and `prefers-reduced-motion` |
| Session | Guest and authenticated where applicable |
| State | Loading, normal, hover/focus, disabled, empty, error, and success |
| Content | Short labels, long labels, large values, and missing optional data |
| Zoom | 100% and 200% |

Functional smoke tests should stay focused on behavior the redesign could accidentally break: routes, focus after navigation, modal/drawer dismissal, game transitions, answer submission, timers, score display, power-ups, XP, local storage, theme persistence, and lesson completion.

## 9. Rollout safeguards

- Keep redesign changes route- or component-scoped so old and new surfaces can coexist temporarily.
- Do not change markup and logic in the same change unless the markup change is required for accessibility or layout.
- Capture before/after screenshots for every phase and review them side by side.
- Preserve public props and state contracts while shared visual components are introduced.
- Do not delete a legacy rule until repository search confirms it has no remaining consumer.
- Keep a per-phase rollback point; do not wait until the final cleanup to discover regressions.
- Treat unexplained visual differences as bugs even when automated tests pass.

## 10. Success measures

### Product signals

- More users begin a game or lesson from the dashboard.
- More started games reach the result screen.
- More lesson visitors complete the knowledge check.
- Fewer users abandon game setup before play begins.
- Guest users can find the save-progress/sign-in path without it interrupting play.

### Design and engineering signals

- All migrated colors, spacing, type, radii, shadows, and motion use shared tokens.
- The eight games share the same setup/gameplay/results grammar.
- The number of hard-coded colors, generic global selectors, duplicate media queries, and `!important` declarations trends down phase by phase.
- New UI work can be composed from existing primitives without copying a full stylesheet.
- Dark and light themes achieve equivalent hierarchy and accessibility.
- Primary routes have stable visual regression references at desktop and mobile widths.

## 11. Recommended execution order

Do not start by restyling all existing CSS. The highest-confidence sequence is:

1. Approve the visual direction and key layouts.
2. Finish tokens and the smallest useful primitive set.
3. Redesign the shell and dashboard.
4. Prove the entire game loop with the Port Number Game.
5. Convert the other games in small groups.
6. Convert learning, progression, settings, and public surfaces.
7. Remove the legacy layer and complete release QA.

This order creates visible improvement early, validates the hardest shared interaction before broad migration, and leaves the application functional at the end of every phase.

## 12. Definition of done for the redesign

The redesign is complete when every current route and significant state uses the approved visual system; both themes and target widths are supported; all critical flows retain their behavior; keyboard, screen-reader, contrast, zoom, and reduced-motion checks pass; and the legacy styling layer is removed or reduced to explicitly documented exceptions.
