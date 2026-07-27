# Critical smoke flows

Run these against both themes. Use 375px and 1280px for every flow; repeat the navigation and active-game portions at 768px and 1440px during visual sign-off. Test with reduced motion at least once for the game-completion flow.

Record result, browser, viewport, theme, session type, and screenshot filenames in the run log at the end of this document.

## F01 — Guest entry

Precondition: clear `token`, `guest_user`, and `guest_stats`.

1. Open `/` and verify anonymous landing content.
2. Choose **Explore as Guest** (future label: **Start as guest**).
3. Verify the URL settles on `/dashboard` without `?mode=guest`.
4. Verify the dashboard is usable, the header says Guest Mode, and **Sign in to save progress** is visible.
5. Reload and verify the same guest session restores.

Fixed result: a fresh local guest is created with default stats; no backend is required.

## F02 — Navigation and recovery

1. From the dashboard, open Settings, Learning Paths, Achievements, and Statistics using the sidebar.
2. Verify the active destination, route focus, and top scroll position after each push.
3. Use browser back and verify the previous scroll position restores.
4. Open `/port` and verify it redirects to `/dashboard/port`.
5. Open an unknown URL and verify Page Not Found plus Return Home.
6. Force a route render failure in a test fixture and verify Try Again recovers without exposing the thrown detail.

## F03 — Game setup

Primary baseline: Port Number Game. Repeat the setup transition once in each other game.

1. Open `/dashboard/port` as guest.
2. Verify best score/streak/games/accuracy stats render.
3. Select Practice, return to modes, then select Time Attack.
4. Select Easy, Medium, and Hard in separate runs.
5. Verify the active game receives the selected mode/difficulty and the dashboard escape remains available.

Fixed result: setup changes presentation state only; game settings retain their current values.

## F04 — Correct and incorrect answers

1. Start Port Number Game in Time Attack/Easy.
2. Submit one known correct answer.
3. Verify Correct appears before reward feedback; score, streak, multiplier, timer bonus, XP preview, and sounds update through current rules.
4. During the answer cooldown, attempt a second submission and verify it is ignored/disabled.
5. Submit one incorrect answer.
6. Verify the correct answer is shown; streak/multiplier reset and the time penalty applies.
7. Activate every available power-up and verify enabled, active, and depleted states.

## F05 — Game completion and results

1. Complete a game manually or allow Time Attack to reach zero.
2. Verify the result title, score, XP, core stats, best streak, and personal-best state where earned.
3. Open and close share options; open the share card; exercise native-share fallback/copy behavior where supported.
4. Choose Play Again and verify setup/game restarts through the current path.
5. Choose the dashboard/another-game action and verify navigation.
6. Verify updated local stats and guest XP survive reload.

## F06 — Lesson completion

1. Open `/dashboard/learning/module/1/lesson/1`.
2. Verify loading resolves to markdown content and section navigation works.
3. Copy a code block and verify its temporary copied state.
4. Advance to Knowledge Check, complete it, then open the completion state.
5. Mark the lesson complete.
6. Verify completion overlay, `completedLessons` persistence, redirect bookkeeping, and navigation to lesson 2.
7. Return to Learning Paths and verify completion/progress presentation updates.
8. Open a nonexistent lesson and verify Lesson not found.

## F07 — Settings change

1. Open Settings as guest and change System → Dark → Light.
2. Verify the theme applies immediately, survives route navigation, and survives reload.
3. Toggle sound and notifications, change difficulty and avatar, then save.
4. Verify saving/disabled state followed by success.
5. As a registered-user fixture, force profile update failure and verify the error state.
6. Reset defaults and verify System theme and default settings are restored.

## F08 — Logout

1. Start from a registered-user fixture with stored settings and game data.
2. Choose Logout.
3. Verify the app returns to `/`, protected navigation redirects to `/`, and the token/session is gone.
4. Repeat from the returning-guest landing state and verify guest/settings data is cleared.

## Run log template

| Date | Build/commit | Browser | Viewport/theme | Session | Flows | Result | Notes/artifacts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| _YYYY-MM-DD_ | _sha_ | _browser_ | _e.g. 375 dark_ | _guest/auth_ | _F01–F08_ | _pass/fail_ | _links_ |
