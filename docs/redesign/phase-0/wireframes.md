# Low-fidelity layouts

These wireframes approve information order and responsive behavior only. They do not prescribe final component styling.

## 1. Landing

```text
DESKTOP                                   MOBILE
┌ Brand ───── Product nav ─── Sign in ┐   ┌ Brand ───────── Menu ┐
│                                     │   ├──────────────────────┤
│ Value proposition   Live mission    │   │ Value proposition    │
│ Short proof          preview         │   │ Short proof          │
│ [Start as guest]     nodes/packets   │   │ [Start as guest]     │
│ [Sign in]                            │   │ [Sign in]            │
├─────────────────────────────────────┤   ├──────────────────────┤
│ Learn → Practice → Progress         │   │ Live mission preview │
├─────────────────────────────────────┤   ├──────────────────────┤
│ Selected real missions              │   │ 3-step learning loop │
├─────────────────────────────────────┤   ├──────────────────────┤
│ Product proof / referrals / footer  │   │ Missions → proof →   │
└─────────────────────────────────────┘   │ referrals → footer   │
                                          └──────────────────────┘
```

Primary action: **Start as guest**. Sign in remains visible but secondary. Referral content follows product explanation and proof.

## 2. Dashboard

```text
DESKTOP                                   MOBILE
┌ Sidebar ┬ Utility bar ──────────────┐   ┌ App bar ───── Avatar ┐
│ Brand   ├───────────────────────────┤   ├──────────────────────┤
│ Home    │ Continue your journey     │   │ Continue journey     │
│ Learn   │ [Next mission / lesson]   │   │ [Primary CTA]        │
│ Progress├───────────────┬───────────┤   ├──────────────────────┤
│ Settings│ Daily goal    │ Progress  │   │ Daily goal/progress  │
│         ├───────────────┴───────────┤   ├──────────────────────┤
│ Account │ Recommended missions      │   │ Recommended carousel │
│         ├───────────────────────────┤   ├──────────────────────┤
│         │ All missions / filters    │   │ All missions         │
└─────────┴───────────────────────────┘   └──────────────────────┘
```

Sidebar becomes a modal drawer below the shell breakpoint. The content order never changes; cards become one column and optional horizontal collections must remain keyboard scrollable.

## 3. Game setup

```text
┌ Back ─ Mission identity ─ Best score ┐
│ Icon  Port Number Game               │
│ Description • expected duration      │
├──────────────────────────────────────┤
│ Step 1 of 2 — Choose mode            │
│ ( ) Practice       (•) Time Attack   │
├──────────────────────────────────────┤
│ Step 2 of 2 — Choose difficulty      │
│ (•) Easy   ( ) Medium   ( ) Hard     │
├──────────────────────────────────────┤
│              [Begin mission]         │
└──────────────────────────────────────┘
```

On mobile, radio cards stack and the primary action remains visible after the selected options. Returning to the dashboard is a text action, not a competing button.

## 4. Active gameplay

```text
DESKTOP                                   MOBILE
┌ Score ─ Streak ─ Timer ─ Q 4/10 ┐       ┌ Score  Timer  4/10 ┐
├─────────────────────────────────┤       ├────────────────────┤
│ notification lane               │       │ notice lane        │
├─────────────────────────────────┤       ├────────────────────┤
│                                 │       │                    │
│        Challenge / prompt       │       │ Prompt             │
│        technical context        │       │ context            │
│                                 │       │                    │
├─────────────────────────────────┤       ├────────────────────┤
│ answer grid / structured input  │       │ answer/input stack │
├─────────────────────────────────┤       ├────────────────────┤
│ hint          power-up actions  │       │ hint / power-ups   │
└─────────────────────────────────┘       └────────────────────┘
```

HUD geometry stays fixed as values change. Correctness owns the center feedback layer; bonus, streak, and XP use the notification lane in that order. Controls never move under the pointer during cooldown.

## 5. Results

```text
┌ Outcome / personal best ─────────────┐
│ +XP earned                           │
│ Score       Accuracy       Best run  │
│ Improvement insight                  │
│ [Play again] [Choose another mission]│
├──────────────────────────────────────┤
│ Optional: share result ▾             │
└──────────────────────────────────────┘
```

On mobile, actions stack with Play Again first. Sharing is collapsed by default. Celebration overlays may decorate the result but cannot block either recovery action.

## 6. Learning path

```text
┌ Learning path progress / level ──────┐
│ Continue: Lesson 2  [Continue lesson]│
├──────────────────────────────────────┤
│ Module route                         │
│ ✓ Lesson 1                           │
│ ● Lesson 2 — current                 │
│ ○ Lesson 3 — available               │
│ 🔒 Lesson 4 — Complete lesson 3      │
├──────────────────────────────────────┤
│ Supporting activity / achievements   │
└──────────────────────────────────────┘
```

Desktop may show a route rail beside module detail. Mobile uses one vertical route. Locked rows state their prerequisite; they are never explained by icon/color alone.

## 7. Lesson

```text
DESKTOP                                   MOBILE
┌ Path / Lesson title ─── 45% ┐           ┌ Back ─ Lesson ─ 45% ┐
├ Sections ┬─────────────────┤           ├ Section scroller ───┤
│ Overview │ Reading column  │           │ Reading column      │
│ Concepts │ max ~72 chars   │           │ comfortable gutter  │
│ Examples │ code / figures  │           │ code scrolls only   │
│ Check    │                 │           │                     │
│          │ [Next section]  │           │ [Next section]      │
└──────────┴─────────────────┘           └─────────────────────┘
```

Reading measure and progress are stable. The knowledge check is a calm transition after content; lesson completion follows the check and keeps an obvious route back to the learning path.

## Responsive checkpoints

| Width | Layout decision |
| --- | --- |
| 320–375 | Single column; drawer navigation; stacked actions; 16px minimum gutter; only intentional code/tab horizontal scrolling |
| 768 | Tablet single/two-column hybrids based on content; setup cards may form rows; lesson navigation becomes compact |
| 1024 | Full shell may show persistent sidebar; game stage uses bounded center column |
| 1280 | Reference desktop grid and primary high-fidelity review width |
| 1440+ | Content max-width holds; extra canvas becomes breathing room, not wider reading lines |
