import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Settings from './Settings';
import { ThemeProvider, THEME_STORAGE_KEY } from '../../hooks/useTheme';
import { UserContext } from '../../context/UserContext';
import { updateUserProfile } from '../../services/api';

vi.mock('../../services/api', () => ({ updateUserProfile: vi.fn(() => Promise.resolve({})) }));
vi.mock('../../utils/SoundManager', () => ({ default: { isSoundEnabled: () => false, play: vi.fn() } }));

const user = { id: 'user-1', username: 'Ada', displayName: 'Ada', email: 'ada@example.com', avatar: 'avatar1.png', isGuest: false };
function renderSettings(match = false) {
  window.matchMedia = () => ({ matches: match, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  return render(<ThemeProvider><UserContext.Provider value={{ user, loading: false }}><Settings /></UserContext.Provider></ThemeProvider>);
}

beforeEach(() => { localStorage.clear(); document.body.className = ''; vi.clearAllMocks(); });

test('renders theme radios and applies each choice immediately', () => {
  renderSettings();
  expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.body).toHaveClass('dark-mode');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  fireEvent.click(screen.getByRole('radio', { name: 'Light' }));
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(document.body).toHaveClass('light-mode');
});

test('reset restores system preference', () => {
  renderSettings();
  fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
  fireEvent.click(screen.getByRole('button', { name: /reset to default/i }));
  expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
});

test('saves theme-only preference with resolved dark compatibility value', async () => {
  renderSettings(true);
  expect(document.documentElement.dataset.theme).toBe('dark');
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  await waitFor(() => expect(updateUserProfile).toHaveBeenCalled());
  const [, payload] = updateUserProfile.mock.calls[0];
  expect(payload.preferences.theme).toBe('system');
  expect(payload.preferences.darkMode).toBe(true);
});
