# Legacy layer coexistence

Phase 1 does not delete or bulk-convert existing styles. The current `src/styles/ui`, `src/styles/games`, `src/styles/layout`, `src/App.css`, and component-specific imports form the temporary legacy layer.

## Rules

- No new generic global selectors such as `.content`, `.card`, `.nav-link`, or `.section-title`.
- New shared primitives use the `nq-` prefix.
- Development laboratory selectors use the `style-lab__` prefix.
- A route migration may replace hard-coded values only within the component being migrated.
- Remove a legacy stylesheet or selector only after repository search confirms no remaining consumer and the route passes its acceptance checks.
- New feature work outside the redesign should prefer existing `nq-` primitives when their behavior fits; it must not add visual variants speculatively.

## Deletion list ownership

| Area | Planned phase | Current owner |
| --- | --- | --- |
| App shell, dashboard, compact leaderboard, game cards | Phase 2 | `styles/layout`, dashboard rules in `App.css`, relevant UI styles |
| Port Number Game loop | Phase 3 | `PortGame.css` and shared legacy game UI |
| Remaining seven games | Phase 4 | `styles/games/*` and remaining shared game UI |
| Learning paths and lesson detail | Phase 5 | `LearningPaths.css`, `LessonDetail*.css` |
| Progress, achievements, leaderboard, settings | Phase 6 | Matching `styles/ui/*` files |
| Landing and authentication | Phase 7 | `LandingPage.css`, `LoginSignup.css` |
| Residual generic selectors and unused variants | Phase 8 | Repository-wide audit |
