import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AnswerOption, Button, Dialog, Field, ProgressBar, RadioCard, Switch, Tabs } from './Primitives';

test('button exposes loading and disabled states without changing its label contract', () => {
  const { rerender } = render(<Button loading>Save</Button>);
  expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled();
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  rerender(<Button disabled>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('field associates label, help, and invalid state', () => {
  render(<Field label="Email" error="Enter a valid address" />);
  const field = screen.getByRole('textbox', { name: 'Email' });
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAccessibleDescription('Enter a valid address');
});

test('radio cards and switches retain native keyboard behavior', async () => {
  const user = userEvent.setup();
  function Fixture() {
    const [mode, setMode] = useState('practice');
    const [enabled, setEnabled] = useState(false);
    return <><RadioCard name="mode" value="practice" checked={mode === 'practice'} onChange={() => setMode('practice')} label="Practice" /><RadioCard name="mode" value="time" checked={mode === 'time'} onChange={() => setMode('time')} label="Time Attack" /><Switch label="Sounds" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /></>;
  }
  render(<Fixture />);
  await user.click(screen.getByRole('radio', { name: 'Time Attack' }));
  expect(screen.getByRole('radio', { name: 'Time Attack' })).toBeChecked();
  await user.click(screen.getByRole('switch', { name: 'Sounds' }));
  expect(screen.getByRole('switch', { name: 'Sounds' })).toBeChecked();
});

test('tabs support arrow, home, and end key navigation', () => {
  function Fixture() { const [active, setActive] = useState('one'); return <Tabs label="Demo" items={[{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }]} activeId={active} onChange={setActive} />; }
  render(<Fixture />);
  const first = screen.getByRole('tab', { name: 'One' });
  first.focus();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Two' }), { key: 'End' });
  expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus();
});

test('progress and answer options expose programmatic state', () => {
  render(<><ProgressBar label="Lesson" value={2} max={5} valueLabel="2 of 5" /><AnswerOption selected result="correct">HTTPS</AnswerOption></>);
  expect(screen.getByRole('progressbar', { name: 'Lesson' })).toHaveAttribute('aria-valuenow', '2');
  expect(screen.getByRole('button', { name: 'HTTPS' })).toHaveAttribute('aria-pressed', 'true');
});

test('dialog opens from state and closes from its labelled control', async () => {
  const user = userEvent.setup();
  function Fixture() { const [open, setOpen] = useState(false); return <MemoryRouter><Button onClick={() => setOpen(true)}>Open</Button><Dialog open={open} onClose={() => setOpen(false)} title="Demo dialog">Body</Dialog></MemoryRouter>; }
  render(<Fixture />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  expect(screen.getByRole('dialog', { name: 'Demo dialog' })).toHaveAttribute('open');
  await user.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(screen.queryByRole('dialog', { name: 'Demo dialog' })).not.toBeInTheDocument();
});
