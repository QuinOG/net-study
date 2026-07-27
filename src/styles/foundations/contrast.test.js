import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/foundations/themes.css'), 'utf8');

function themeTokens(theme) {
  const block = css.match(new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'))?.[1] || '';
  return Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, value]) => [name, value]));
}

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255).map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrast(first, second) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

const textPairs = [
  ['text-primary', 'canvas'],
  ['text-secondary', 'canvas'],
  ['text-muted', 'canvas'],
  ['action-contrast', 'action-primary'],
  ['success-fg', 'success-bg'],
  ['warning-fg', 'warning-bg'],
  ['danger-fg', 'danger-bg'],
  ['info-fg', 'info-bg'],
  ['xp-fg', 'xp-bg'],
  ['streak-fg', 'streak-bg'],
];

test.each(['dark', 'light'])('%s semantic text pairs meet WCAG AA normal-text contrast', (theme) => {
  const tokens = themeTokens(theme);
  for (const [foreground, background] of textPairs) {
    expect(tokens[foreground], `${theme} ${foreground} exists`).toBeTruthy();
    expect(tokens[background], `${theme} ${background} exists`).toBeTruthy();
    expect(contrast(tokens[foreground], tokens[background]), `${theme}: ${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
  }
});

test.each(['dark', 'light'])('%s focus indicator contrasts with canvas and surfaces', (theme) => {
  const tokens = themeTokens(theme);
  for (const background of ['canvas', 'surface-1', 'surface-2']) expect(contrast(tokens.focus, tokens[background]), `${theme}: focus on ${background}`).toBeGreaterThanOrEqual(3);
});
