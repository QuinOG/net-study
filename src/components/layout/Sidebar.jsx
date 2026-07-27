import React, { useContext, useEffect, useRef, useState } from 'react';
import { FiAward, FiBarChart2, FiChevronLeft, FiHome, FiMap, FiSettings, FiX } from 'react-icons/fi';
import { useLocation } from '../../router';
import { UserContext } from '../../context/UserContext';
import { getLevelProgress } from '../../utils/progression';
import { Badge, IconButton, NavItem, ProgressBar } from '../foundations/Primitives';

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { userStats } = useContext(UserContext);
  const asideRef = useRef(null);
  const openedPath = useRef(location.pathname);
  const latestPath = useRef(location.pathname);
  latestPath.current = location.pathname;
  const progress = getLevelProgress(userStats?.totalXP || 0);
  const streak = userStats?.currentStreak || 0;

  useEffect(() => {
    if (!mobileOpen) return undefined;
    openedPath.current = location.pathname;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => asideRef.current?.querySelector(focusableSelector)?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose?.(); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...(asideRef.current?.querySelectorAll(focusableSelector) || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (latestPath.current === openedPath.current && previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [mobileOpen, onClose, location.pathname]);

  const exactDashboard = location.pathname === '/dashboard';
  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome />, active: exactDashboard },
    { to: '/dashboard/learning-paths', label: 'Learning paths', icon: <FiMap />, active: location.pathname.startsWith('/dashboard/learning') },
    { to: '/dashboard/stats', label: 'Statistics', icon: <FiBarChart2 />, active: location.pathname === '/dashboard/stats' },
    { to: '/dashboard/achievements', label: 'Achievements', icon: <FiAward />, active: location.pathname === '/dashboard/achievements' },
    { to: '/dashboard/settings', label: 'Settings', icon: <FiSettings />, active: location.pathname === '/dashboard/settings' },
  ];

  return <>
    {mobileOpen && <button className="nq-sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={onClose} />}
    <aside ref={asideRef} id="primary-sidebar" className="nq-sidebar" data-collapsed={collapsed || undefined} data-mobile-open={mobileOpen || undefined} aria-label="Primary navigation" aria-modal={mobileOpen || undefined} role={mobileOpen ? 'dialog' : undefined}>
      <div className="nq-sidebar__header"><span className="nq-sidebar__academy">Academy</span><IconButton className="nq-sidebar__mobile-close" size="sm" label="Close navigation menu" onClick={onClose}><FiX /></IconButton><IconButton className="nq-sidebar__collapse" size="sm" label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed} onClick={() => setCollapsed((value) => !value)}><FiChevronLeft /></IconButton></div>
      <nav className="nq-sidebar__nav">{nav.map((item) => <NavItem key={item.to} to={item.to} active={item.active} icon={item.icon} title={collapsed ? item.label : undefined} onClick={onClose}>{item.label}</NavItem>)}</nav>
      <div className="nq-sidebar__progress">
        <div className="nq-sidebar__level"><div><Badge tone="xp">Level {progress.level}</Badge><strong>Network Novice</strong></div><ProgressBar label="Level progress" value={progress.current} max={progress.required} valueLabel={`${progress.current} / ${progress.required} XP`} tone="xp" /></div>
        <div className="nq-sidebar__streak"><span aria-hidden="true">↗</span><div><strong data-technical>{streak} day{streak === 1 ? '' : 's'}</strong><small>Current learning streak</small></div></div>
      </div>
    </aside>
  </>;
}
