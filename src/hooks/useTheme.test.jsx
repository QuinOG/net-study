import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useTheme, ThemeProvider, THEME_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY } from './useTheme';

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return <div><span data-testid="theme">{theme}</span><span data-testid="resolved">{resolvedTheme}</span><button onClick={() => setTheme('light')}>light</button><button onClick={() => setTheme('invalid')}>invalid</button></div>;
}

function renderTheme() { return render(<ThemeProvider><Probe /></ThemeProvider>); }

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  document.body.className = '';
  window.matchMedia = (query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});

test('defaults to system and resolves the system preference', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  renderTheme();
  expect(screen.getByTestId('theme')).toHaveTextContent('system');
  expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.body).toHaveClass('dark-mode');
});

test.each(['dark', 'light'])('persists and applies %s preference', (preference) => {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  renderTheme();
  expect(screen.getByTestId('theme')).toHaveTextContent(preference);
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(preference);
  expect(document.documentElement.dataset.theme).toBe(preference);
  expect(document.documentElement.style.colorScheme).toBe(preference);
});

test('migrates legacy boolean into the new key and normalizes invalid new values', () => {
  localStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'false');
  renderTheme();
  expect(screen.getByTestId('theme')).toHaveTextContent('light');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  expect(localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBeNull();

  localStorage.clear();
  localStorage.setItem(THEME_STORAGE_KEY, 'nope');
  localStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'true');
  renderTheme();
  expect(screen.getAllByTestId('theme').at(-1)).toHaveTextContent('system');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
});

test('updates system resolution without changing system preference and cleans up', () => {
  let listener;
  window.matchMedia = () => ({ matches: false, addEventListener: (_, fn) => { listener = fn; }, removeEventListener: vi.fn() });
  const { unmount } = renderTheme();
  act(() => listener({ matches: true }));
  expect(screen.getByTestId('theme')).toHaveTextContent('system');
  expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  unmount();
});

test('registers one matching media listener and refreshes when switching from explicit to system', () => {
  let matches = true;
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  window.matchMedia = () => ({ get matches() { return matches; }, addEventListener, removeEventListener });
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  const { unmount } = renderTheme();
  expect(addEventListener).not.toHaveBeenCalled();
  act(() => screen.getByRole('button', { name: 'invalid' }).click());
  expect(screen.getByTestId('theme')).toHaveTextContent('system');
  expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  expect(addEventListener).toHaveBeenCalledTimes(1);
  expect(addEventListener.mock.calls[0][0]).toBe('change');
  expect(removeEventListener).not.toHaveBeenCalled();
  unmount();
  expect(removeEventListener).toHaveBeenCalledTimes(1);
  expect(removeEventListener.mock.calls[0][0]).toBe('change');
});

test('uses legacy media listener only when modern listener is unavailable', () => {
  const addListener = vi.fn();
  const removeListener = vi.fn();
  window.matchMedia = () => ({ matches: false, addListener, removeListener });
  const { unmount } = renderTheme();
  expect(addListener).toHaveBeenCalledTimes(1);
  unmount();
  expect(removeListener).toHaveBeenCalledTimes(1);
});
test('setTheme applies immediately and persists', () => {
  renderTheme();
  act(() => screen.getByRole('button', { name: 'light' }).click());
  expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
});
