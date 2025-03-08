import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiBookOpen } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import PortGame from './PortGame.js';
import ProtocolGame from './ProtocolGame.js';
import SubnettingChallenge from './SubnettingChallenge';
import TechAcronymQuiz from './TechAcronymQuiz';
import Sidebar from './Sidebar';
import Settings from './Settings';

function App() {
  return (
    <Router>
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
          </Routes>
          <RightPanel />
        </div>
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="logo">Networking Fundamentals</div>
      </div>
      <div className="top-bar-right">
        <img
          className="user-avatar"
          // You can change the src to your preferred avatar image.
          src="https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png"
          alt="User Avatar"
        />
      </div>
    </header>
  );
}

function RightPanel() {
  return (
    <aside className="right-panel">
      <h3 className="panel-title">Study Info</h3>
      <div className="streak-section">
        <div className="streak-header">
          <FaTrophy size={20} />
          <span>Streak</span>
        </div>
        <div className="streak-count">5 days</div>
        <p>Keep it going!</p>
      </div>
      <div className="goals-section">
        <h4>Daily Goals</h4>
        <ul>
          <li>Play 2 rounds of Protocol Game</li>
          <li>Score at least 80% in Port Game</li>
        </ul>
      </div>
      <div className="achievements-section">
        <h4>Achievements</h4>
        <p>Newbie, Bronze Medal, 100% Protocols</p>
      </div>
    </aside>
  );
}

function Home() {
  return (
    <main className="content">
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
          <Link to="/protocol">
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
          <Link to="/port">
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
          <Link to="/subnet">
            <button className="start-btn">Start</button>
          </Link>
        </div>

        <div className="game-card">
          <div className="card-icon">
            <FiBookOpen size={32} />
          </div>
          <h4>IT Acronym Game</h4>
          <p className="card-description">
            Learn to match port numbers to the correct protocols and services!
          </p>
          <Link to="/acronym">
            <button className="start-btn">Start</button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
