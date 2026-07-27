# Current UI reference screenshots

These files are visual baselines, not approved designs. They intentionally preserve clipping, overflow, hierarchy, hard-coded color, and theme inconsistencies visible in the current UI.

## Coverage

- Every canonical route has a light-theme 1280×900 capture.
- Landing, dashboard, settings, learning paths, lesson detail, and Port Number Game cover 375×812, 768×1024, 1280×900, and 1440×1000 in light and dark resolved themes.
- The six responsive surfaces represent the public, full-app, lesson, and game shells and the highest-priority Phase 0 layouts.
- Interaction-only states that cannot be addressed by URL are inventoried in `route-state-inventory.md` and exercised by `smoke-flows.md`.

## Folder convention

`<theme>/<viewport-width>/<route-slug>.png`

Examples:

- `light/375/landing.png`
- `dark/768/dashboard.png`
- `light/1280/firewall-rules.png`
- `dark/1440/lesson-1.png`

## Regenerate

From the repository root:

```powershell
node scripts/capture-phase-0.mjs
```

The script uses an already-running Vite server on port 4173 or starts one temporarily. Set `NETQUEST_CAPTURE_PORT` to use another port and `CHROME_PATH` if Chrome/Edge is not in a standard location. Each protected capture starts a fresh guest session in an isolated temporary browser profile.

Set `NETQUEST_CAPTURE_SKIP_EXISTING=1` to resume an interrupted capture without replacing completed files.

## Review notes

- Compare at 100% zoom; the pixel dimensions are part of the filename path.
- Do not use these images as implementation assets.
- Capture dates are filesystem metadata; Git remains the source of truth for which implementation the images represent.
- Re-run the full set immediately before a phase removes legacy CSS, then store the redesigned references separately rather than overwriting this Phase 0 baseline.
