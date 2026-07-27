import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './styles/layout/AppShell.css';
import { BrowserRouter as Router } from './router';
import AppRoutes from './routes/AppRoutes';
import Sidebar from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';
import Dashboard from './components/dashboard/Dashboard';
import Settings from './components/ui/Settings';
import LandingPage from './components/ui/LandingPage';
import LearningPaths from './components/ui/LearningPaths';
import { UserProvider, UserContext } from './context/UserContext';
import AchievementSystem from './components/ui/AchievementSystem';
import RewardAnimation from './components/ui/RewardAnimation';
import Leaderboard from './components/ui/Leaderboard';
import { defaultUserStats } from './utils/GuestUser';
import MilestoneCelebration from './components/ui/MilestoneCelebration';
import { LoadingState } from './components/foundations/Primitives';
import { ThemeProvider, useTheme } from './hooks/useTheme';

function AppContent() {
  const context = useContext(UserContext);
  const {
    user, userStats, loading, showReward, rewardXP, handleRewardComplete,
    startGuestSession, showMilestone, setShowMilestone, milestoneData,
  } = context;
  const { resolvedTheme, setTheme } = useTheme();
  const [initializingGuest, setInitializingGuest] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setMobileNavOpen(open => !open), []);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get('mode');
    if (mode === 'guest' && !user && !initializingGuest) {
      setInitializingGuest(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      try { startGuestSession(); } catch { setInitializingGuest(false); }
    }
  }, [loading, startGuestSession, user, initializingGuest]);

  useEffect(() => {
    if (user && initializingGuest) setInitializingGuest(false);
  }, [user, initializingGuest]);

  if (loading || initializingGuest) {
    return <main className="nq-route-state" data-route-focus tabIndex="-1"><LoadingState label="Loading your dashboard" /></main>;
  }

  const pages = {
    landing: <LandingPage />,
    settings: <div className="nq-shell-page"><Settings /></div>,
    learningPaths: <div className="nq-shell-page"><LearningPaths /></div>,
    achievements: <div className="nq-shell-page content progression-page"><header className="progression-page__header"><span className="nq-eyebrow">Personal progress</span><h1>Your Achievements</h1><p>Track milestones you have earned and see what to work toward next.</p></header><AchievementSystem userStats={userStats || defaultUserStats} /></div>,
    stats: <div className="nq-shell-page content progression-page"><header className="progression-page__header"><span className="nq-eyebrow">Social ranking</span><h1>Leaderboard</h1><p>Compare recent performance while keeping your own learning goals in focus.</p></header><Leaderboard minimized={false} /></div>,
  };
  const overlays = <>
    {showReward && <RewardAnimation xpGained={rewardXP} show onComplete={handleRewardComplete} />}
    <MilestoneCelebration show={showMilestone} type={milestoneData.type} data={milestoneData.data} onComplete={() => setShowMilestone(false)} />
  </>;
  const header = <Header
    menuOpen={mobileNavOpen}
    onToggleMenu={toggleMobileNav}
    menuButtonRef={menuButtonRef}
    resolvedTheme={resolvedTheme}
    onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
  />;
  const sidebar = <Sidebar mobileOpen={mobileNavOpen} onClose={closeMobileNav} menuButtonRef={menuButtonRef} />;

  return <AppRoutes authenticated={!!user} shell={{ header, sidebar }} home={<Dashboard />} overlays={overlays} pages={pages} />;
}

function App() {
  return <ThemeProvider><Router><UserProvider><AppContent /></UserProvider></Router></ThemeProvider>;
}

export function Header(props) {
  const { user, isGuest, logout } = useContext(UserContext);
  return <AppHeader user={user} isGuest={isGuest ?? user?.isGuest} logout={logout} {...props} />;
}

export default App;
