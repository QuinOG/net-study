import React, { useState, useContext, useEffect } from 'react';
import './styles/layout/App.css';
import logo from './assets/images/netquest.png';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiBookOpen, FiTerminal, FiServer, FiWifi, FiCode, FiChevronRight, FiTrendingUp, FiTarget, FiAward, FiFlag, FiArrowRight, FiMenu, FiShare2, FiShield, FiLock } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import PortGame from './components/games/PortGame';
import ProtocolGame from './components/games/ProtocolGame';
import SubnettingChallenge from './components/games/SubnettingChallenge';
import TechAcronymQuiz from './components/games/TechAcronymQuiz';
import CommandLineChallenge from './components/games/CommandLineChallenge';
import NetworkTopologyGame from './components/games/NetworkTopologyGame';
import FirewallRulesGame from './components/games/FirewallRulesGame';
import EncryptionChallengeGame from './components/games/EncryptionChallengeGame';
import Sidebar from './components/layout/Sidebar';
import ScrollToTop from './components/layout/ScrollToTop';
import Settings from './components/ui/Settings';
import LandingPage from './components/ui/LandingPage';

// New Gamification components
import { UserProvider, UserContext } from './context/UserContext';
import StreakCounter from './components/ui/StreakCounter';
import AchievementSystem from './components/ui/AchievementSystem';
import LevelProgress from './components/ui/LevelProgress';
import RewardAnimation from './components/ui/RewardAnimation';
import DailyChallenge from './components/ui/DailyChallenge';
import Leaderboard from './components/ui/Leaderboard';
import SoundManager from './utils/SoundManager';
import { defaultUserStats } from './utils/GuestUser';

function AppContent() {
  const { user, userStats, loading, showReward, rewardXP, handleRewardComplete, startGuestSession } = useContext(UserContext);
  const [initializingGuest, setInitializingGuest] = useState(false);
  
  // Handle guest mode from URL parameter
  useEffect(() => {
    // Parse the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'guest' && !user && !initializingGuest) {
      console.log('[App] Detected guest mode parameter, initializing guest session');
      
      // Set flag to prevent repeated initialization
      setInitializingGuest(true);
      
      // Remove the parameter from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Initialize guest session immediately
      try {
        startGuestSession();
        console.log('[App] Guest session started successfully');
      } catch (error) {
        console.error('[App] Failed to start guest session:', error);
        // Reset the flag if initialization failed
        setInitializingGuest(false);
      }
    }
  }, [loading, startGuestSession, user, initializingGuest]);
  
  // Reset initialization flag when user is set
  useEffect(() => {
    if (user && initializingGuest) {
      setInitializingGuest(false);
    }
  }, [user, initializingGuest]);
  
  // Determine if user is authenticated or a guest
  const isAuthenticated = !!user;
  const isGuest = user?.isGuest || false;
  
  // If still loading or initializing guest session, show a loading indicator
  if (loading || initializingGuest) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Landing page is accessible by everyone, but authenticated users will see a special version */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Dashboard routes - accessible by both authenticated and guest users */}
      <Route path="/dashboard/*" element={
        isAuthenticated ? (
          <div className="app-container">
            <Header />
            <div className="main-layout">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/protocol" element={<ProtocolGame />} />
                <Route path="/port" element={<PortGame />} />
                <Route path="/subnet" element={<SubnettingChallenge />} />
                <Route path="/acronym" element={<TechAcronymQuiz />} />
                <Route path="/command" element={<CommandLineChallenge />} />
                <Route path="/network-topology" element={<NetworkTopologyGame />} />
                <Route path="/firewall-rules" element={<FirewallRulesGame />} />
                <Route path="/encryption-challenge" element={<EncryptionChallengeGame />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/achievements" element={
                  <div className="content">
                    <h3 className="section-title">Your Achievements</h3>
                    <AchievementSystem userStats={userStats || defaultUserStats} />
                  </div>
                } />
                <Route path="/stats" element={
                  <div className="content">
                    <h3 className="section-title">Player Statistics</h3>
                    <Leaderboard minimized={false} />
                  </div>
                } />
              </Routes>
            </div>
            
            {showReward && (
              <RewardAnimation xp={rewardXP} onComplete={handleRewardComplete} />
            )}
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      } />
      
      {/* Redirect for legacy routes */}
      <Route path="/protocol" element={<Navigate to="/dashboard/protocol" replace />} />
      <Route path="/port" element={<Navigate to="/dashboard/port" replace />} />
      <Route path="/subnet" element={<Navigate to="/dashboard/subnet" replace />} />
      <Route path="/acronym" element={<Navigate to="/dashboard/acronym" replace />} />
      <Route path="/command" element={<Navigate to="/dashboard/command" replace />} />
      <Route path="/network-topology" element={<Navigate to="/dashboard/network-topology" replace />} />
      <Route path="/firewall-rules" element={<Navigate to="/dashboard/firewall-rules" replace />} />
      <Route path="/encryption-challenge" element={<Navigate to="/dashboard/encryption-challenge" replace />} />
      <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
      <Route path="/achievements" element={<Navigate to="/dashboard/achievements" replace />} />
      <Route path="/stats" element={<Navigate to="/dashboard/stats" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <ScrollToTop />
        <AppContent />
      </UserProvider>
    </Router>
  );
}

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isGuest, logout } = useContext(UserContext);
  
  const toggleMobileMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };
  
  // Handle logo click to go to landing page
  const handleLogoClick = (e) => {
    e.preventDefault();
    // Use window.location.href instead of React Router navigation
    // to ensure a clean page load
    window.location.href = "/";
  };
  
  // Handle sign in click for guest users
  const handleSignInClick = (e) => {
    e.preventDefault();
    // Direct to landing page for sign in
    window.location.href = "/";
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <FiMenu size={24} />
        </button>
        
        {/* Logo with click handler instead of Link */}
        <div 
          className="logo" 
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={logo} 
            alt="NetQuest Logo" 
            style={{ flexShrink: 0 }}
          />
          <span>NetQuest</span>
        </div>
      </div>
      <div className="top-bar-right">
        {isGuest && (
          <div className="guest-indicator">
            Guest Mode
            <button 
              className="login-prompt" 
              onClick={handleSignInClick}
            >
              Sign in to save progress
            </button>
          </div>
        )}
        <img
          className="user-avatar"
          src={(() => {
            // Get the avatar from localStorage
            const storedAvatar = localStorage.getItem('net-study-settings-avatar');
            
            // Guest user - use stored avatar or default
            if (isGuest) {
              return storedAvatar ? `/avatars/${storedAvatar}` : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            }
            
            // Logged in user - use user.avatar, stored avatar, or default
            if (user?.avatar) {
              return `/avatars/${user.avatar}`;
            }
            
            return storedAvatar ? `/avatars/${storedAvatar}` : "https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png";
          })()}
          alt="User Avatar"
        />
        {user && !isGuest && (
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

function Home() {
  const { userStats, loading } = useContext(UserContext);
  
  // Play click sound when game is selected
  const handleGameSelect = () => {
    SoundManager.play('click');
  };
  
  return (
    <main className="content">
      {/* Minimized Leaderboard - will handle loading state internally */}
      <Leaderboard minimized={true} />
      
      <h3 className="section-title">Choose a Game</h3>
      <div className="game-grid">
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiServer size={32} />
            </div>
            <h4>Port Number Game</h4>
          </div>
          <p className="card-description">Match common networking ports with their services. Test your knowledge of TCP/UDP ports.</p>
          <Link to="/dashboard/port" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>
        
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiWifi size={32} />
            </div>
            <h4>Protocol Matcher</h4>
          </div>
          <p className="card-description">Match networking protocols with their functions. Learn protocol fundamentals and their uses.</p>
          <Link to="/dashboard/protocol" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>
        
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiCode size={32} />
            </div>
            <h4>Subnetting Challenge</h4>
          </div>
          <p className="card-description">Practice IP addressing and subnetting. Calculate network and broadcast addresses for IP ranges.</p>
          <Link to="/dashboard/subnet" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>
        
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiBookOpen size={32} />
            </div>
            <h4>Tech Acronym Quiz</h4>
          </div>
          <p className="card-description">Test your knowledge of networking acronyms and terminology from basic to advanced levels.</p>
          <Link to="/dashboard/acronym" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>
        
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiTerminal size={32} />
            </div>
            <h4>Command Line</h4>
          </div>
          <p className="card-description">Practice essential networking commands for different operating systems and network devices.</p>
          <Link to="/dashboard/command" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>

        {/* New Game: Network Topology */}
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiShare2 size={32} />
            </div>
            <h4>Network Topology</h4>
          </div>
          <p className="card-description">Build and analyze different network topologies. Learn about network design and optimization.</p>
          <Link to="/dashboard/network-topology" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>

        {/* New Game: Firewall Rules */}
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiShield size={32} />
            </div>
            <h4>Firewall Rules</h4>
          </div>
          <p className="card-description">Create and test firewall rule configurations. Learn about network security and access control.</p>
          <Link to="/dashboard/firewall-rules" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>

        {/* New Game: Encryption Challenge */}
        <div className="game-card">
          <div className="card-header">
            <div className="card-icon">
              <FiLock size={32} />
            </div>
            <h4>Encryption Challenge</h4>
          </div>
          <p className="card-description">Learn about encryption techniques and protocols used in networking and cybersecurity.</p>
          <Link to="/dashboard/encryption-challenge" onClick={handleGameSelect}>
            <button className="start-btn">Start Game</button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
