# Route and state inventory

Audited against `src/routes/AppRoutes.jsx`, `src/App.jsx`, the route-level UI components, all eight game components, `UserContext`, and current route tests.

## Shell and navigation inventory

| Shell | Routes | Persistent UI | Material states |
| --- | --- | --- | --- |
| Public | `/` | Landing header/footer | Anonymous, returning authenticated user, returning guest, login dialog, registration dialog, referral dialog |
| Full app | `/dashboard`, settings, learning paths, achievements, stats | Header, sidebar, reward/milestone overlays | Guest/authenticated account utility, sidebar expanded/collapsed, mobile drawer open/closed, route loading/error |
| Game | Eight game routes | Game-only main region plus reward/milestone overlays | Setup, active play, feedback/cooldown, result |
| Lesson | Dynamic lesson route | Lesson-only main region plus reward/milestone overlays | Loading, reading, knowledge check, completion, missing lesson |
| Recovery | `*` and route boundary | None | Not found, caught route error, retry |

The router moves focus to the route main region after push navigation, restores recorded scroll on history pop, and redirects unauthenticated protected navigation to `/`.

## Canonical route inventory

| Route | Surface | Required variants |
| --- | --- | --- |
| `/` | Landing | Anonymous; guest/registered welcome-back; login/register modal; client/server form errors; submitting; password shown/hidden; referral modal; copy/share actions |
| `/dashboard` | Dashboard | App initialization; guest/authenticated header; minimized leaderboard loading/data/fallback; zero and populated stats; eight mission cards; reward and milestone overlays |
| `/dashboard/settings` | Settings | Loading; guest and registered account fields; system/dark/light theme; sound and notification on/off; three difficulties; avatar selection; saving; saved; API failure; reset |
| `/dashboard/learning-paths` | Learning paths | Simulated loading; module expanded/collapsed; lesson completed/available/locked; module 0–100%; achievement locked/unlocked; level-up notice; achievement notice; activity levels 0–4 |
| `/dashboard/achievements` | Achievements | Stats loading; locked/unlocked achievements; progress values; recent-unlock notice |
| `/dashboard/stats` | Full leaderboard | Loading; XP/streak/level tabs; weekly/monthly/all-time; rank movement shown/hidden; search closed/open/results/no-results; current-user highlight; info tooltip; empty fallback |
| `/dashboard/learning/module/:moduleId/lesson/:lessonId` | Lesson detail | Fetch loading; content; missing/fetch failure; overview/content tabs; code copy idle/copied/failure; knowledge-check unanswered/completed; completion tab; completion overlay; previously completed lesson |
| `/dashboard/port` | Port Number Game | See game matrix |
| `/dashboard/protocol` | Protocol Matcher | See game matrix |
| `/dashboard/subnet` | Subnetting Challenge | See game matrix |
| `/dashboard/acronym` | Tech Acronym Quiz | See game matrix |
| `/dashboard/command` | Command Line Challenge | See game matrix |
| `/dashboard/network-topology` | Network Topology | See game matrix |
| `/dashboard/firewall-rules` | Firewall Rules | See game matrix |
| `/dashboard/encryption-challenge` | Encryption Challenge | See game matrix |

## Compatibility redirects

These are behavior, not duplicate redesign surfaces. They must remain exact redirects to the corresponding `/dashboard/*` route:

`/protocol`, `/port`, `/subnet`, `/acronym`, `/command`, `/network-topology`, `/firewall-rules`, `/encryption-challenge`, `/settings`, `/learning-paths`, `/achievements`, and `/stats`.

## Game-state matrix

All games require mode selection, difficulty selection, active play, timer expiry where applicable, manual end/return, and result actions to be reviewed. The table records additional distinct states.

| Game | Configuration states | Active challenge states | Feedback/reward states | Result states |
| --- | --- | --- | --- | --- |
| Port Number | Mode; Easy/Medium/Hard; stats loading | Practice/time attack; port→service and service→port; question loading; category revealed; timer warning; power-ups available/depleted; random bonus active | Correct; incorrect; answer cooldown; speed bonus; XP preview; streak 3/5/10/15; multiplier 1/1.5/2/2.5; particles | Normal; personal best; XP; share options/card |
| Protocol Matcher | Mode; Easy/Medium/Hard | Practice/time attack; text answer; hint/category visible; timer warning; freeze/reveal/skip available or depleted | Correct; incorrect; combo milestone; speed/XP preview | Normal; personal best; XP; share options/card |
| Subnetting | Mode; Easy/Medium/Hard | Practice/time attack; four address fields empty/filled; hint; timer warning; power-ups | Correct; incorrect with multiline solution; submit cooldown disables fields/action | Normal; personal best; XP; share options/card |
| Tech Acronym Quiz | Mode; category selection; difficulty | Practice/time attack; multiple choice; hint/category; timer warning; power-ups | Correct; incorrect; timeout; answer cooldown; combo/speed/streak/bonus notifications | Normal; personal best; XP; share options/card |
| Command Line | Mode; Easy/Medium/Hard | Practice/time attack; command/description question; optional OS filter; examples hidden/shown; question loading; power-ups | Correct; incorrect; answer lock; streak ≥3; reward notice; startup failure alert | Normal; personal best; XP; collect-XP action; share options/card |
| Network Topology | Identify/build mapping through shared mode choices; Easy/Medium/Hard | Question/progress; optional image; selected/unselected answer; submit disabled when empty; timer expiry | Correct/incorrect recorded in per-question results, with immediate progression | Normal; personal best; XP; share options/card |
| Firewall Rules | Configure/analyze mapping through shared mode choices; Easy/Medium/Hard | Scenario/progress; no-rules empty state; rule builder; populated rules; submit disabled when empty; hint time cost; timer expiry | Scenario score recorded with immediate progression | Normal; personal best; XP; share options/card |
| Encryption Challenge | Decrypt/identify mapping through shared mode choices; Easy/Medium/Hard | Decrypt text input or algorithm selection; hint time cost; submit disabled when empty; timer expiry | Correct/incorrect recorded with immediate progression | Normal; personal best; XP; share options/card |

## Cross-route transient states

- App initialization and guest initialization use a full-screen loading container.
- Lazy game/lesson modules have a route-level loading fallback.
- A caught render failure replaces the route with an alert, “Try again,” and “Return to dashboard.” Error details are deliberately hidden.
- Reward XP and milestone overlays can appear above full-app, game, and lesson shells.
- Milestones have level-up and achievement variants and staged animation.
- Game results include normal, perfect/high-performance, and personal-best messaging plus optional sharing.
- Mobile sidebar has collapsed/expanded and drawer open/closed states; the current implementation does not yet provide the complete modal-drawer behavior planned for Phase 2.
- Light/dark are resolved from `system`, `light`, or `dark`; reduced-motion rules exist globally and remain a required review variant.

## Known baseline gaps (record, do not silently redesign)

- Landing, referral, and authentication dialogs are not routed independently.
- Game implementations do not expose deterministic URLs for active/correct/incorrect/result states, so those references require scripted interaction or a later visual laboratory.
- Several simplified games advance immediately after submission and do not present persistent correctness feedback.
- Learning-path availability is static in module data while completion is also inferred from browser storage.
- Some nominal empty/error conditions use fallback demo data instead of an empty screen.
- `/dashboard/game-center` is referenced by one acronym-game control but is not a canonical route.
