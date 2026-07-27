import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const outputRoot = join(root, 'docs', 'redesign', 'phase-0', 'reference-screenshots');
const port = Number(process.env.NETQUEST_CAPTURE_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}`;

const viewports = {
  375: [375, 812],
  768: [768, 1024],
  1280: [1280, 900],
  1440: [1440, 1000],
};

const routes = [
  ['landing', '/'],
  ['dashboard', '/dashboard'],
  ['settings', '/dashboard/settings'],
  ['learning-paths', '/dashboard/learning-paths'],
  ['achievements', '/dashboard/achievements'],
  ['statistics', '/dashboard/stats'],
  ['lesson-1', '/dashboard/learning/module/1/lesson/1'],
  ['port', '/dashboard/port'],
  ['protocol', '/dashboard/protocol'],
  ['subnet', '/dashboard/subnet'],
  ['acronym', '/dashboard/acronym'],
  ['command', '/dashboard/command'],
  ['network-topology', '/dashboard/network-topology'],
  ['firewall-rules', '/dashboard/firewall-rules'],
  ['encryption-challenge', '/dashboard/encryption-challenge'],
];

const responsiveSurfaces = new Set(['landing', 'dashboard', 'settings', 'learning-paths', 'lesson-1', 'port']);

function browserCandidates() {
  if (process.env.CHROME_PATH) return [process.env.CHROME_PATH];
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
  }
  if (process.platform === 'darwin') {
    return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  }
  return ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
}

function findBrowser() {
  const browser = browserCandidates().find(existsSync);
  if (!browser) throw new Error('Chrome or Edge was not found. Set CHROME_PATH and run again.');
  return browser;
}

async function serverResponds() {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverResponds()) return null;
  const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    stdio: 'ignore',
    windowsHide: true,
  });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await new Promise((done) => setTimeout(done, 200));
    if (await serverResponds()) return child;
  }
  child.kill();
  throw new Error(`Vite did not start at ${baseUrl}`);
}

function captureUrl(pathname) {
  if (pathname === '/') return `${baseUrl}/`;
  return `${baseUrl}${pathname}?mode=guest`;
}

async function waitForFile(pathname) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      if ((await stat(pathname)).size > 0) return;
    } catch { /* Chrome is still writing. */ }
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error(`Screenshot was not created: ${pathname}`);
}

async function capture(browser, { slug, pathname, theme, width, height }) {
  const directory = join(outputRoot, theme, String(width));
  const output = join(directory, `${slug}.png`);
  if (process.env.NETQUEST_CAPTURE_SKIP_EXISTING === '1' && existsSync(output)) {
    process.stdout.write(`kept ${theme}/${width}/${slug}.png\n`);
    return;
  }
  const profile = await mkdtemp(join(tmpdir(), 'netquest-phase-0-'));
  await mkdir(directory, { recursive: true });
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=2500',
    `--user-data-dir=${profile}`,
    `--screenshot=${output}`,
  ];
  if (theme === 'dark') args.push('--force-dark-mode');
  args.push(captureUrl(pathname));

  await new Promise((resolveRun, rejectRun) => {
    const child = spawn(browser, args, { cwd: root, stdio: 'ignore', windowsHide: true });
    child.once('error', rejectRun);
    child.once('close', (code) => code === 0 ? resolveRun() : rejectRun(new Error(`Browser exited ${code}: ${slug} ${theme} ${width}`)));
  });
  await waitForFile(output);
  await rm(profile, { recursive: true, force: true });
  process.stdout.write(`captured ${theme}/${width}/${slug}.png\n`);
}

async function main() {
  const browser = findBrowser();
  const server = await ensureServer();
  const jobs = new Map();

  for (const [slug, pathname] of routes) {
    jobs.set(`light-1280-${slug}`, { slug, pathname, theme: 'light', width: 1280, height: viewports[1280][1] });
  }
  for (const [slug, pathname] of routes.filter(([name]) => responsiveSurfaces.has(name))) {
    for (const theme of ['light', 'dark']) {
      for (const [widthText, [width, height]] of Object.entries(viewports)) {
        jobs.set(`${theme}-${widthText}-${slug}`, { slug, pathname, theme, width, height });
      }
    }
  }

  try {
    for (const job of jobs.values()) await capture(browser, job);
  } finally {
    if (server) server.kill();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
