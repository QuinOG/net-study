import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'net-study-settings-theme';
export const LEGACY_THEME_STORAGE_KEY = 'net-study-settings-darkMode';
export const VALID_THEMES = ['system', 'dark', 'light'];

const ThemeContext = createContext(null);

function safeStorage() {
  try { return window.localStorage; } catch { return null; }
}

export function readThemePreference(storage = safeStorage()) {
  let value = null;
  try { value = storage?.getItem(THEME_STORAGE_KEY); } catch { return 'system'; }
  if (VALID_THEMES.includes(value)) return value;
  if (value !== null) {
    try { storage?.setItem(THEME_STORAGE_KEY, 'system'); } catch { /* unavailable */ }
    return 'system';
  }
  try {
    const legacy = storage?.getItem(LEGACY_THEME_STORAGE_KEY);
    const migrated = legacy === 'true' ? 'dark' : legacy === 'false' ? 'light' : 'system';
    if (legacy === 'true' || legacy === 'false') {
      try { storage?.setItem(THEME_STORAGE_KEY, migrated); storage?.removeItem(LEGACY_THEME_STORAGE_KEY); } catch { /* unavailable */ }
    }
    return migrated;
  } catch { return 'system'; }
}

function systemIsDark() {
  try { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false; } catch { return false; }
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  document.body.classList.toggle('dark-mode', resolved === 'dark');
  document.body.classList.toggle('light-mode', resolved === 'light');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readThemePreference());
  const [systemDark, setSystemDark] = useState(systemIsDark);
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  const setTheme = useCallback((next) => {
    const preference = VALID_THEMES.includes(next) ? next : 'system';
    setThemeState(preference);
    try { safeStorage()?.setItem(THEME_STORAGE_KEY, preference); } catch { /* unavailable */ }
  }, []);

  useLayoutEffect(() => { applyTheme(resolvedTheme); }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    let media;
    try { media = window.matchMedia?.('(prefers-color-scheme: dark)'); } catch { return undefined; }
    if (!media) return undefined;
    setSystemDark(Boolean(media.matches));
    const onChange = (event) => setSystemDark(Boolean(event.matches));
    const add = media.addEventListener ? 'modern' : media.addListener ? 'legacy' : null;
    if (add === 'modern') media.addEventListener('change', onChange);
    if (add === 'legacy') media.addListener(onChange);
    return () => {
      if (add === 'modern') media.removeEventListener('change', onChange);
      if (add === 'legacy') media.removeListener(onChange);
    };
  }, [theme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
