import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

test('foundation imports are deterministic and include all layers', () => {
  const css = read('src/index.css');
  expect(css.indexOf('./styles/foundations/tokens.css')).toBeLessThan(css.indexOf('./styles/foundations/themes.css'));
  expect(css.indexOf('./styles/foundations/themes.css')).toBeLessThan(css.indexOf('./styles/foundations/reset.css'));
  expect(css.indexOf('./styles/foundations/reset.css')).toBeLessThan(css.indexOf('./styles/foundations/typography.css'));
  expect(css.indexOf('./styles/foundations/typography.css')).toBeLessThan(css.indexOf('./styles/foundations/motion.css'));
  expect(css.indexOf('./styles/foundations/motion.css')).toBeLessThan(css.indexOf('./styles/foundations/primitives.css'));
});

test('tokens and themes expose required foundation groups', () => {
  const tokens = read('src/styles/foundations/tokens.css');
  const themes = read('src/styles/foundations/themes.css');
  for (const term of ['--font-family-ui', '--font-family-mono', '--font-size-', '--space-', '--layout-', '--content-', '--control-', '--icon-', '--radius-', '--shadow-', '--z-', '--duration-', '--ease-', '--breakpoint-']) expect(tokens).toContain(term);
  for (const term of ['--color-canvas', '--color-surface', '--color-text', '--color-border', '--color-action', '--color-state', '--color-focus', '--color-success', '--color-warning', '--color-danger', '--color-info', '--color-xp', '--color-streak', '--color-rank', '--color-data', '--color-overlay']) expect(themes).toContain(term);
  expect(themes).toContain('[data-theme="light"]');
  expect(themes).toContain('[data-theme="dark"]');
});

test('primitive styles use semantic color tokens instead of raw brand colors', () => {
  const primitives = read('src/styles/foundations/primitives.css');
  expect(primitives).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  expect(primitives).not.toMatch(/\b(?:rgb|hsl)a?\(/i);
  expect(primitives).toContain('var(--color-action-primary)');
  expect(primitives).toContain('var(--color-state-selected)');
});

test('layout and motion policies cover target sizing and reduced decorative motion', () => {
  const tokens = read('src/styles/foundations/tokens.css');
  const motion = read('src/styles/foundations/motion.css');
  expect(tokens).toContain('--target-size-min: 2.75rem');
  expect(tokens).toContain('--layout-hud-height');
  expect(motion).toContain('[data-motion="decorative"]');
});

test('reset avoids universal typography, global list stripping, and unconditional motion overrides', () => {
  const reset = read('src/styles/foundations/reset.css');
  const motion = read('src/styles/foundations/motion.css');
  expect(reset).not.toMatch(/\*\s*\{[^}]*font-family/s);
  expect(reset).not.toMatch(/(?:ul|ol)\s*\{[^}]*list-style\s*:\s*none/s);
  expect(motion).toContain('prefers-reduced-motion: reduce');
  expect(motion).not.toMatch(/^\*[^\n]*\{[^}]*transition-duration/s);
});

test('font packages are imported exactly once from the entrypoint', () => {
  const css = read('src/index.css');
  const entry = read('src/index.jsx');
  expect(css).not.toContain('@fontsource');
  expect((entry.match(/@fontsource/g) || []).length).toBe(3);
});

test('index bootstrap applies the persisted theme before the app bundle', () => {
  const html = read('index.html');
  const script = html.match(/<script data-theme-bootstrap>([\s\S]*?)<\/script>/)?.[1] || '';
  expect(script).toContain('net-study-settings-theme');
  expect(script).toContain('net-study-settings-darkMode');
  expect(script).toContain("data-theme");
  expect(html.indexOf('<script data-theme-bootstrap>')).toBeLessThan(html.indexOf('src="/src/index.jsx"'));
});
