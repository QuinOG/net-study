import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserContext } from '../../context/UserContext';

function DrawerHarness() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open navigation</button><Sidebar mobileOpen={open} onClose={() => setOpen(false)} /></>;
}

test('announces the active route', () => {
  render(<MemoryRouter initialEntries={['/dashboard/stats']}><UserContext.Provider value={{ userStats: {} }}><Sidebar /></UserContext.Provider></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Statistics' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
});

test('mobile drawer locks scrolling, traps focus, closes on Escape, and restores focus', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><UserContext.Provider value={{ userStats: { totalXP: 25, currentStreak: 2 } }}><DrawerHarness /></UserContext.Provider></MemoryRouter>);
  const trigger = screen.getByRole('button', { name: 'Open navigation' });
  trigger.focus();
  await user.click(trigger);
  const drawer = screen.getByRole('dialog', { name: 'Primary navigation' });
  expect(document.body.style.overflow).toBe('hidden');
  await waitFor(() => expect(drawer).toContainElement(document.activeElement));

  const controls = drawer.querySelectorAll('a[href], button:not([disabled])');
  controls[controls.length - 1].focus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(controls[0]).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body.style.overflow).toBe('');
  expect(trigger).toHaveFocus();
});
