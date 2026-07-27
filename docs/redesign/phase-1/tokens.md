# Foundation token policy

## Scales

- Typography: Inter for UI/reading and IBM Plex Mono for technical values; seven fluid sizes, four weights, three line heights.
- Spacing: a 4px base rhythm from `--space-1` through `--space-24`.
- Shape: 2–20px radii plus a status/filter pill token.
- Controls: small/medium/large heights with `--target-size-min` fixed at 44px.
- Layout: header, expanded/collapsed sidebar, HUD, responsive gutter, section gaps, and control/reading/game/page/wide content measures.
- Elevation: small/medium/large shadows and a theme-aware focus halo.
- Layers: base, raised, sticky, drawer, overlay, modal, and toast.
- Motion: 120/200/320ms durations, standard/emphasis easing, and two movement distances.

## Semantic color families

| Family | Purpose |
| --- | --- |
| `canvas`, `surface-*` | Page and component depth; borders before shadows |
| `text-*`, `link-*` | Primary, supporting, muted, inverse, and linked content |
| `action-*` | Primary/secondary action states and contrasting action text |
| `state-*` | Hover, pressed, selected, and disabled component states |
| `focus*` | Visible focus edge and halo |
| `success`, `warning`, `danger`, `info` | Feedback foreground/background/border triplets |
| `xp`, `streak` | Progression-specific foreground/background/border triplets |
| `rank-*` | Gold, silver, and bronze rank accents |
| `data-1`–`data-6` | Ordered chart series for each theme |
| `overlay`, `skeleton*` | Modal backdrops and loading placeholders |

## Usage rules

1. Component CSS uses semantic tokens only. Raw brand colors belong in `themes.css`.
2. Do not infer a color by naming its hue in component code; use its role.
3. Feedback uses foreground, background, and border from the same family and includes text/icon meaning.
4. XP and streak do not substitute for success and warning.
5. A selected control uses `state-selected` plus `state-selected-border`; focus remains independently visible.
6. Disabled states remain readable but are not used to convey required information.
7. Data colors are ordered consistently, but legends/labels remain mandatory.

## Breakpoint policy

CSS custom properties document breakpoint values but cannot be used directly in media-query conditions. Scoped styles use the matching values:

| Token | Value | Behavior |
| --- | --- | --- |
| `sm` | 480px | Compact phone refinements |
| `md` | 768px | Single-column to tablet hybrid |
| `lg` | 1024px | Persistent shell and wider grids |
| `xl` | 1280px | Full desktop composition |

Add a breakpoint only when content cannot remain usable, not to target a device model.

## Contrast coverage

Automated tests verify primary/secondary/muted text, primary actions, all feedback families, XP, streak, and focus against their intended backgrounds in both themes. Charts and complex adjacent-color combinations still require manual review in the route that uses them.
