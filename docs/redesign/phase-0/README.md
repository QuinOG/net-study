# Phase 0 — Baseline and redesign specification

Status: **ready for product/design sign-off**. This package documents the current application and proposes the hierarchy for later phases. It intentionally changes no runtime UI, game logic, scoring, persistence, routing, authentication, lesson content, or backend behavior.

## Deliverables

| Deliverable | Artifact |
| --- | --- |
| Route and state inventory | [route-state-inventory.md](./route-state-inventory.md) |
| Fixed behavior and data contracts | [fixed-contracts.md](./fixed-contracts.md) |
| Critical smoke flows | [smoke-flows.md](./smoke-flows.md) |
| Low-fidelity layouts | [wireframes.md](./wireframes.md) |
| Visual direction and hierarchy | [visual-direction.md](./visual-direction.md) |
| Agreed product vocabulary | [vocabulary.md](./vocabulary.md) |
| Visual direction board | [concepts/visual-direction-board.svg](./concepts/visual-direction-board.svg) |
| High-fidelity key screens | [concepts/dashboard-key-screen.svg](./concepts/dashboard-key-screen.svg), [concepts/gameplay-key-screen.svg](./concepts/gameplay-key-screen.svg), and [concepts/lesson-key-screen.svg](./concepts/lesson-key-screen.svg) |
| Current UI references | [reference-screenshots/README.md](./reference-screenshots/README.md) |
| Reproducible capture command | [scripts/capture-phase-0.mjs](../../../scripts/capture-phase-0.mjs) |

## Acceptance gate

- [x] Every canonical route, redirect, shell, and material state variant is inventoried.
- [x] Existing runtime behavior, browser persistence, API shapes, and component boundaries are recorded as fixed constraints.
- [x] The proposed hierarchy is represented in wireframes and high-fidelity key screens.
- [x] Current UI references cover every canonical route at a desktop baseline and the major shell types at all requested widths in both resolved themes.
- [ ] Product/design owner approves the hierarchy and vocabulary below before Phase 1 component work begins.

## Approval record

Approver: _pending_

Date: _pending_

Decision: _pending — approve, approve with noted changes, or revise_

Notes: _pending_

## Review focus

The key decision is the priority order, not polish:

1. Dashboard: continue journey → daily progress → recommended missions → full library.
2. Game: stable HUD → challenge → action zone → correctness → reward → result.
3. Learning path: next lesson → route progress → supporting stats and achievements.
4. Lesson: reading progress → content → knowledge check → completion.

Once this ordering and the vocabulary are approved, Phase 1 can turn the visual language into tokens and primitives without guessing at product intent.
