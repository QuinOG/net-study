import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import logo from './netquest.png';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiBookOpen } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import PortGame from './PortGame.js';
import ProtocolGame from './ProtocolGame.js';
import SubnettingChallenge from './SubnettingChallenge';
import TechAcronymQuiz from './TechAcronymQuiz';
import Sidebar from './Sidebar';
import Settings from './Settings';

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
  
  return (
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
      <h3 className="panel-title">Study Info</h3>
      
      {/* Level Progress */}
      <LevelProgress userXP={userStats.totalXP} />
      
      {/* Streak Section with colored flames */}
      <StreakCounter streakDays={userStats.currentStreak} />
      
      {/* Daily Challenge */}
      <DailyChallenge userStats={userStats} />
      
      <div className="goals-section">
        <h4>Daily Goals</h4>
        <ul>
          <li>Play 2 rounds of Protocol Game</li>
          <li>Score at least 80% in Port Game</li>
        </ul>
      </div>
      
      {/* Recent Achievements Preview */}
      <div className="achievements-section">
        <h4>Recent Achievements</h4>
        <div className="recent-achievements-preview">
          {userStats.completedAchievements && userStats.completedAchievements.slice(-3).map(achievement => (
            <div key={achievement.id} className="mini-achievement">
              <span className="achievement-icon">{achievement.icon}</span>
              <span className="achievement-name">{achievement.name}</span>
            </div>
          ))}
          {(!userStats.completedAchievements || userStats.completedAchievements.length === 0) && (
            <p>Complete challenges to earn achievements!</p>
          )}
        </div>
        <Link to="/achievements" className="view-all-link">
          View All Achievements
        </Link>
      </div>
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
      <h3 className="section-title">Choose a Game</h3>
      
      {/* Minimized Leaderboard */}
      <Leaderboard minimized={true} />
      
      <div className="game-grid">
        {/* Protocol Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiPlay size={32} />
          </div>
          <h4>Protocol Game</h4>
          <p className="card-description">
            Test your knowledge of common protocols and how they are used!
          </p>
          <Link to="/protocol" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
        
        {/* Port Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiPlay size={32} />
          </div>
          <h4>Port Game</h4>
          <p className="card-description">
            Learn to match port numbers to the correct protocols and services!
          </p>
          <Link to="/port" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
        
        {/* Subnet Game Card */}
        <div className="game-card">
          <div className="card-icon">
            <FiPlay size={32} />
          </div>
          <h4>Subnetting Game</h4>
          <p className="card-description">
            Practice calculating different addresses from a random IP!
          </p>
          <Link to="/subnet" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>

        <div className="game-card">
          <div className="card-icon">
            <FiPlay size={32} />
          </div>
          <h4>IT Acronym Game</h4>
          <p className="card-description">
            Test your knowledge of common tech acronyms and terminology!
          </p>
          <Link to="/acronym" onClick={handleGameSelect}>
            <button className="start-btn">Start</button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
