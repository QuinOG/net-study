import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import logo from './netquest.png';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiBookOpen } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import PortGame from './PortGame.js';
import ProtocolGame from './ProtocolGame.js';
import SubnettingChallenge from './SubnettingChallenge';
import TechAcronymQuiz from './TechAcronymQuiz';
import Sidebar from './Sidebar';
import Settings from './Settings';
import LandingPage from './components/LandingPage';

// New Gamification components
import { UserProvider, UserContext } from './context/UserContext';
import StreakCounter from './components/StreakCounter';
import AchievementSystem from './components/AchievementSystem';
import LevelProgress from './components/LevelProgress';
import RewardAnimation from './components/RewardAnimation';
import DailyChallenge from './components/DailyChallenge';
import Leaderboard from './components/Leaderboard';
import SoundManager from './utils/SoundManager';

function AppContent() {
  const { userStats, showReward, rewardXP, handleRewardComplete } = useContext(UserContext);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  
  // If you want to implement real authentication:
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const login = () => setIsAuthenticated(true);
  // const logout = () => setIsAuthenticated(false);
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Protected routes - wrap in authentication check */}
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
                <Route path="/settings" element={<Settings />} />
                <Route path="/achievements" element={
                  <div className="content">
                    <h3 className="section-title">Your Achievements</h3>
                    <AchievementSystem userStats={userStats} />
                  </div>
                } />
                <Route path="/stats" element={
                  <div className="content">
                    <h3 className="section-title">Player Statistics</h3>
                    <Leaderboard minimized={false} />
                  </div>
                } />
              </Routes>
              <RightPanel />
            </div>
            
            {showReward && (
              <RewardAnimation 
                xpGained={rewardXP} 
                show={showReward} 
                onComplete={handleRewardComplete} 
              />
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
        <AppContent />
      </UserProvider>
    </Router>
  );
}

function Header() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={logo} 
              alt="NetQuest Logo" 
              width="24" 
              height="24" 
              style={{ flexShrink: 0 }}
            />
            <span>NetQuest</span>
          </div>
        </Link>
      </div>
      <div className="top-bar-right">
        <img
          className="user-avatar"
          src="https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png"
          alt="User Avatar"
        />
      </div>
    </header>
  );
}

function RightPanel() {
  const { userStats } = useContext(UserContext);
  
  return (
    <aside className="right-panel">
      <h3 className="panel-title">Study Progress</h3>
      
      {/* Level Progress */}
      <div className="progress-section">
        <LevelProgress userXP={userStats.totalXP} />
      </div>
      
      {/* Streak Section with colored flames */}
      <div className="streak-section">
        <StreakCounter streakDays={userStats.currentStreak} />
      </div>
      
      {/* Daily Challenge - only show if available */}
      <div className="challenge-section">
        <DailyChallenge userStats={userStats} />
      </div>
      
      {/* Recent Achievements Preview - only show if there are achievements */}
      {userStats.completedAchievements && userStats.completedAchievements.length > 0 && (
        <div className="achievements-section">
          <h4>Recent Achievements</h4>
          <div className="recent-achievements-preview">
            {userStats.completedAchievements.slice(-2).map(achievement => (
              <div key={achievement.id} className="mini-achievement">
                <span className="achievement-icon">{achievement.icon}</span>
                <span className="achievement-name">{achievement.name}</span>
              </div>
            ))}
          </div>
          <Link to="/dashboard/achievements" className="view-all-link">
            View All Achievements
          </Link>
        </div>
      )}
      
      {/* Only show goals section if there are goals or no achievements */}
      {(!userStats.completedAchievements || userStats.completedAchievements.length === 0) && (
        <div className="goals-section">
          <h4>Daily Goals</h4>
          <ul>
            <li>Play 2 rounds of Protocol Game</li>
            <li>Score at least 80% in Port Game</li>
          </ul>
        </div>
      )}
    </aside>
  );
}

function Home() {
  const { userStats } = useContext(UserContext);
  
  // Play click sound when game is selected
  const handleGameSelect = () => {
    SoundManager.play('click');
  };
  
  return (
    <main className="content">
      {/* Minimized Leaderboard */}
      <Leaderboard minimized={true} />
      
      <h3 className="section-title">Choose a Game</h3>
      
      <div className="game-grid">
        {/* Protocol Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiBookOpen size={32} />
          </div>
          <h4>Protocol Game</h4>
          <p className="card-description">
            Test your knowledge of common protocols and how they are used!
          </p>
          <Link to="/dashboard/protocol" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
        
        {/* Port Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiBookOpen size={32} />
          </div>
          <h4>Port Game</h4>
          <p className="card-description">
            Learn to match port numbers to the correct protocols and services!
          </p>
          <Link to="/dashboard/port" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
        
        {/* Subnet Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiBookOpen size={32} />
          </div>
          <h4>Subnetting Game</h4>
          <p className="card-description">
            Practice calculating different addresses from a random IP!
          </p>
          <Link to="/dashboard/subnet" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>

        <div className="game-card">
          <div className="card-icon">
            <FiBookOpen size={32} />
          </div>
          <h4>IT Acronym Game</h4>
          <p className="card-description">
            Test your knowledge of common tech acronyms and terminology!
          </p>
          <Link to="/dashboard/acronym" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
