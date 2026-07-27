# Primitive usage guide

All styles use the `nq-` prefix. This avoids adding generic global names while keeping primitives usable across the legacy application. Import components from `src/components/foundations/Primitives.jsx`; foundation CSS is already loaded from `src/index.css`.

| Primitive | Variants/states | Keyboard and responsive behavior |
| --- | --- | --- |
| `Button` | primary, secondary, quiet, danger; sm/md/lg; loading/disabled | Native button; 44px default target; actions stack in compact headers/dialogs |
| `IconButton` | sm/md; disabled | Requires `label`; native button with visible tooltip/title |
| `NavItem` | normal/active | Link semantics and `aria-current="page"` |
| `Surface` | default, raised, subtle; four padding levels | Semantic element selectable with `as` |
| `Badge` | neutral, success, warning, danger, info, XP, streak | Non-interactive status; never color-only |
| `Field`, `Select` | normal, hover, invalid, disabled; hint/error | Native label/help association and `aria-invalid` |
| `RadioCard` | normal, hover, selected, focused, disabled | Native radio behavior; cards stack below 768px |
| `Checkbox`, `Switch` | checked/unchecked/focused | Native checkbox; switch exposes `role="switch"` |
| `ProgressBar` | progress, success, XP, streak | Programmatic min/max/now and optional value text |
| `StatTile` | default, XP, streak | Tabular monospace values; grid responds from 4→2→1 columns in the lab |
| `Tooltip` | hover/focus visible | Trigger is focusable; descriptive relationship uses `aria-describedby` |
| `Dialog` | open/closed | Native modal behavior: Escape, focus containment, and focus restoration |
| `Notice` | info, success, warning, danger | Status or alert role; icon plus title/copy |
| `Tabs` | active/inactive | Left/Right wrap; Home/End jump; roving tab stop; horizontal scrolling when needed |
| `Skeleton`, `LoadingState` | loading | Skeleton is decorative; loading text is a polite live status; shimmer stops under reduced motion |
| `EmptyState`, `ErrorState` | empty/error with optional recovery | Error uses alert semantics; recovery action remains visible |
| `PageHeader`, `SectionHeader` | description/actions optional | Header actions stack below 768px |
| `GameFrame`, `GameHUD` | shared game layout | HUD changes from one row to a stable 2×2 grid below 768px |
| `AnswerOption` | default, selected, correct, incorrect, disabled | Native button; `aria-pressed`; ≥64px in the lab |
| `FeedbackNotice` | correct/incorrect | Correctness text and icon accompany semantic color |

## Variant discipline

Only audited variants are included. Add a new variant when at least one real migrated surface requires a distinct semantic role; document it here and add dark/light, focus, disabled where applicable, and contrast coverage before use.

## Focus and motion

The global focus indicator is a 2px semantic edge with 3px offset and a theme-aware halo. Forced-colors mode falls back to a 3px system outline. Reduced motion suppresses transform movement, decorative topology, and skeleton shimmer; feedback remains present as static copy/color/icon.
