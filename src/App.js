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
  const { user, userStats, loading, showReward, rewardXP, handleRewardComplete } = useContext(UserContext);
  
  // Determine if user is authenticated or a guest
  const isAuthenticated = !!user;
  
  // If still loading, show a loading indicator
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <Routes>
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
        
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <img 
              src={logo} 
              alt="NetQuest Logo" 
              style={{ flexShrink: 0 }}
            />
            <span>NetQuest</span>
          </div>
        </Link>
      </div>
      <div className="top-bar-right">
        {isGuest && (
          <div className="guest-indicator">
            Guest Mode
            <Link to="/" className="login-prompt">
              Sign in to save progress
            </Link>
          </div>
        )}
        <img
          className="user-avatar"
          src={isGuest 
            ? "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png" 
            : "https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png"}
          alt="User Avatar"
        />
        {user && (
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
