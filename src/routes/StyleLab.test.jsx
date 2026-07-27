import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/useTheme';
import StyleLab from './StyleLab';

test('visual laboratory covers primitive families and switches resolved themes', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><ThemeProvider><StyleLab /></ThemeProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'NetQuest visual laboratory' })).toBeInTheDocument();
  for (const heading of ['Foundations', 'Actions and navigation', 'Forms and selection', 'Progress and data', 'Feedback and overlays', 'Tabs, loading, empty, and error', 'Shared game grammar']) expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: /dark/i }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem('net-study-settings-theme')).toBe('dark');
});
