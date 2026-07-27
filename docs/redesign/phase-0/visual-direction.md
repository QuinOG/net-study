# Visual direction — The Living Network

The concept files visualize a network operations academy: clear, technical, energetic, and approachable. The motif is a live topology—nodes, paths, packet pulses, port labels, and status signals—without a permanent neon “hacker” treatment.

## Concept artifacts

- [Visual direction board](./concepts/visual-direction-board.svg): palette roles, typography, surfaces, controls, status hierarchy, and motif.
- [Dashboard key screen](./concepts/dashboard-key-screen.svg): journey-first hierarchy and restrained app shell.
- [Gameplay key screen](./concepts/gameplay-key-screen.svg): stable three-zone game layout and notification lane.
- [Lesson key screen](./concepts/lesson-key-screen.svg): reading-first layout and calm knowledge-check transition.

The SVGs are directional comps, not production assets. Phase 1 must translate them into semantic tokens and validate contrast in both themes before implementation.

## Visual rules

| Element | Direction |
| --- | --- |
| Canvas | Midnight navy in dark; cool near-white in light |
| Surfaces | Opaque hierarchy through fill and border first; blur is exceptional |
| Primary action | Signal cyan, limited to the current main action/navigation cue |
| Progress/success | Connection green |
| Streak/urgency | Warm amber; timer urgency only at meaningful thresholds |
| Error | Coral/red plus icon and explanatory copy |
| Type | Inter for interface/reading; IBM Plex Mono for ports, IPs, commands, timer, score, and compact technical labels |
| Radius | 8–16px for containers; pills only for statuses, filters, and compact metadata |
| Depth | Borders and surface steps before shadow; glow only during short-lived feedback |
| Motion | Fast state transitions; no ambient motion behind dense content |

## Feedback hierarchy

1. **Correctness:** center-stage, immediate, short, announced.
2. **Immediate consequence:** score/time/streak change in stable HUD positions.
3. **Small reward:** XP/speed/bonus in the notification lane.
4. **Milestone:** larger overlay only for meaningful streak, personal best, achievement, or level-up.
5. **Long-term progression:** result/dashboard update after the immediate event is understood.

The same event must not be celebrated simultaneously in multiple lanes.

## Proposed hierarchy by key surface

### Dashboard

Continue journey is the only dominant card. Daily goal and account progression are supporting context. Recommended missions precede the complete mission library. Social ranking is compact and below personal progress.

### Game

The HUD is a single stable row. The challenge stage owns attention. Answers and power-ups occupy a predictable bottom action zone. Timer, score, and notices never alter the challenge card's position.

### Lesson

Lesson title/progress and reading content dominate. Section navigation supports orientation. XP, achievements, and game-like decoration stay outside the reading column.

## Theme parity

Light and dark use the same semantic roles and relative emphasis. Light mode uses borders and cool surface steps rather than gray-on-white flattening. Dark mode uses restrained luminance contrast and does not turn every cyan element into a glow. Status hues must be tested independently on both canvases.

## Explicitly rejected directions

- Full-screen terminal styling, scan lines, green-on-black text, or decorative code rain.
- Glassmorphism on every surface.
- Gradient-filled body copy or multiple competing brand gradients.
- Pill-shaped large cards and controls without a status/filter reason.
- Persistent particles or pulsing elements that compete with questions or lesson text.
- Separate visual systems for each game; each receives only an accent motif.
