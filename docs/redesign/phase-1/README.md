# Phase 1 — Foundations and visual laboratory

Status: **implemented**. This phase expands the semantic foundation, introduces the first reusable primitives, and adds a development-only review route. It does not migrate existing product surfaces or change their behavior.

## Deliverables

| Deliverable | Location |
| --- | --- |
| Foundation scales | `src/styles/foundations/tokens.css` |
| Dark/light semantic roles | `src/styles/foundations/themes.css` |
| Focus, type, and reduced motion | `reset.css`, `typography.css`, `motion.css` |
| Shared primitives | `src/components/foundations/Primitives.jsx` |
| Scoped primitive styles | `src/styles/foundations/primitives.css` |
| Development visual laboratory | `/dev/ui-lab` via `src/routes/StyleLab.jsx` |
| Contrast automation | `src/styles/foundations/contrast.test.js` |
| Interaction coverage | `Primitives.test.jsx` and `StyleLab.test.jsx` |
| Token and primitive guidance | [tokens.md](./tokens.md) and [primitives.md](./primitives.md) |
| Legacy coexistence policy | [legacy-layer.md](./legacy-layer.md) |

## Acceptance gate

- [x] Primitive CSS contains no raw hex, RGB, or HSL brand colors.
- [x] Dark and light semantic text/action/feedback pairs meet WCAG 2.2 AA normal-text contrast in automated checks.
- [x] Focus indicators meet the 3:1 non-text contrast target against canvas and surface levels.
- [x] Buttons, fields, radio cards, checkbox, switch, progress, tabs, dialog, states, and game grammar have keyboard/programmatic coverage.
- [x] Reduced motion removes decorative topology, transform feedback, and shimmer while preserving readable states.
- [x] The visual laboratory demonstrates themes, variants, disabled/loading/selected/error/success states, responsive layouts, and technical typography.
- [x] `/dev/ui-lab` is gated by `import.meta.env.DEV` and is absent from production routing/build output.

## Review route

Run `npm start`, then open:

`http://localhost:5173/dev/ui-lab`

Review with keyboard only and at 320/375, 768, 1024, 1280, and 1440px. Use the theme radio cards at the top to compare System, Dark, and Light without leaving the page.

## Implementation boundary

The new primitives are opt-in. Existing application CSS remains the legacy layer until its owning route is migrated in Phase 2 or later. No existing component has been mass-rewritten to consume the new layer.
