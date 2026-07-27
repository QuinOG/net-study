import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { UserContext } from '../../context/UserContext';

vi.mock('../../utils/SoundManager', () => ({ default: { play: vi.fn() } }));

test('shows current progress and preserves every mission route', () => {
  const value = {
    user: { id: 'guest-1', displayName: 'Guest User', isGuest: true },
    userStats: { totalXP: 75, currentStreak: 4, gamesPlayed: 9, questionsAnswered: 42, subnettingChallengesCompletedToday: 2 },
    loading: false,
  };
  render(<MemoryRouter><UserContext.Provider value={value}><Dashboard /></UserContext.Provider></MemoryRouter>);

  expect(screen.getByRole('heading', { name: 'Welcome back, Guest User' })).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: 'Daily progress' })).toHaveAttribute('aria-valuenow', '2');
  expect(screen.getByText('4 days')).toBeInTheDocument();
  const library = screen.getByRole('heading', { name: 'All missions' }).closest('section');
  const routes = ['port', 'protocol', 'subnet', 'acronym', 'command', 'network-topology', 'firewall-rules', 'encryption-challenge'];
  expect(within(library).getAllByRole('link', { name: /start mission/i })).toHaveLength(8);
  routes.forEach(route => expect(library.querySelector(`a[href="/dashboard/${route}"]`)).toBeInTheDocument());
  expect(screen.getByRole('link', { name: /view full leaderboard/i })).toHaveAttribute('href', '/dashboard/stats');
});
