# Fixed behavior and data contracts

These constraints are the regression boundary for the visual redesign. A later phase may change markup for layout or accessibility, but it must not change the behavior below without a separate functional decision.

## Routing and shells

- Keep React Router and every canonical path listed in the route inventory.
- Keep the 12 legacy path redirects exact and replace history entries during redirect.
- Protected `/dashboard/*` routes redirect anonymous users to `/`.
- Public, full-app, game, and lesson shells stay behaviorally distinct.
- Game and lesson routes continue to render global reward and milestone overlays.
- Push navigation scrolls to the top and focuses route content; browser back/forward restores the recorded scroll position.
- Unknown paths expose a recovery link; caught route failures expose retry and dashboard recovery without raw error details.

## Session and authentication

- Auth token storage key: `token`.
- Guest identity keys: `guest_user` and `guest_stats`.
- Guest entry via `?mode=guest` creates a fresh guest and removes the query parameter.
- A valid stored token is resolved through `GET /auth/me`; an invalid token is removed.
- Login expects `{ email, password }`; registration expects `{ username, email, password, displayName }`.
- Successful authentication returns a token and `data.user`, with `data.stats` optional on login and expected on registration.
- Logging out clears session/user/settings-related browser data and returns to `/` with a full reload.
- Guest and registered users keep distinct header messaging and avatar precedence.

## API endpoints and shapes

The frontend API base is `VITE_API_URL`, normalized to end in `/api`, or `http://<current-host>:5000/api` when unset/placeholder.

| Area | Contract |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| User | `GET /users/:id`, `PATCH /users/:id`, `GET /users/:id/stats`, `PATCH /users/:id/stats`, `GET /users/:id/achievements`, `POST /users/xp { amount }` |
| Games | `GET /games`, `GET /games/:id`, `GET /games/:id/content`, `POST /games/:id/results` |
| Leaderboards | `GET /leaderboards/global`, `GET /leaderboards/games/:gameId` |

`UserContext.updateStats(gameId, gameResults)` preserves the caller's result object. Registered-user success expects `response.data.data.xpEarned` and may include updated stats/level information. Guest updates preserve at least `correctAnswers`, `totalQuestions`, XP earned, games played, questions answered, streak, and level.

## Progress and statistics

The shared user-stat shape currently includes:

`totalXP`, `xp`, `level`, `currentStreak`, `streak`, `lastActive`, `gamesPlayed`, `questionsAnswered`, `correctAnswers`, `achievements`, game-specific completion/accuracy values, `fastestGameCompletion`, and `gameHistory`.

Do not change score formulas, timer values/penalties, multipliers, power-up counts, XP formulas, milestone thresholds, or best-score comparison semantics during the redesign.

Game-local statistics preserve `bestScore`, `bestStreak`, `gamesPlayed`, `totalAttempts`, and `correctAnswers` where present. Simplified games additionally retain their named completion/rate fields.

## Browser persistence

| Key/pattern | Owner |
| --- | --- |
| `net-study-settings-theme` | Theme preference: `system`, `dark`, or `light` |
| `net-study-settings-darkMode` | Legacy theme migration only |
| `net-study-settings-sound`, `netQuestSoundEnabled` | Audio preference/compatibility |
| `net-study-settings-notifications` | Notification preference |
| `net-study-settings-difficulty` | Default difficulty |
| `net-study-settings-username`, `net-study-settings-email`, `net-study-settings-avatar` | Settings/profile draft and avatar |
| `completedLessons`, `redirectedLessons` | Lesson completion and one-time completion redirect behavior |
| `portGameStats_<user>`, `protocolGameStats_<user>`, `acronymQuizStats_<user>` | User-scoped game stats |
| `subnettingGameStats`, `commandLineStats` | Current unscoped game stats |
| `learningProgress_<user>` | Learning progress utility |
| `lastDailyChallengeCompleted` | Daily challenge completion date |

Known inconsistent legacy keys, such as the separate `guestUser` write in one XP path, are documented baseline behavior—not permission to normalize persistence during visual work.

## Game interaction contracts

- Mode and difficulty selection occur before active play.
- Practice and Time Attack retain their current timer, hint, power-up, and ending behavior per game.
- Answer submission remains guarded against double submission by the current cooldown/answer-lock behavior.
- Correctness changes score/streak/timer exactly as it does now and plays the same existing sound triggers.
- Timer expiry reaches the existing end state and awards XP only through current paths.
- Power-ups keep current inventory, availability, depletion, and side effects.
- Result screens keep play-again, navigation, XP collection/award, personal-best, and share behavior.
- Game-specific inputs remain: free text, multiple choice, subnet address fields, rule builder controls, decrypt/identify input, and topology answers.

## Lessons and learning paths

- Markdown is fetched first from `/modules/module{moduleId}_lesson{lessonId}.md`, with the current source fallback retained.
- Missing content remains a “Lesson not found” state.
- Section parsing, code rendering/copy, knowledge-check parsing, and next-section behavior remain intact.
- Completion writes `module{moduleId}_lesson{lessonId}` to `completedLessons`, stages the completion overlay, records the redirect, then navigates to the next numbered lesson through 5 or back to learning paths.
- Static lesson availability/lock status, module metadata, XP rewards, and lesson copy do not change as part of visual migration.

## Accessibility behavior already covered

- Theme preferences apply `data-theme`, `color-scheme`, and legacy body classes.
- System-theme media listeners attach and clean up correctly.
- Reduced-motion foundation rules remain active.
- Route focus/scroll behavior and current labelled controls are regression requirements.
- Later phases may improve semantics and focus management, but must preserve operability while doing so.
