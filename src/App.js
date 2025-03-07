import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiBookOpen } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import PortGame from './PortGame.js';
import ProtocolGame from './ProtocolGame.js';

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
          src="https://img.icons8.com/?size=160&id=IBgUXg3MQlTW&format=png"
          alt="User Avatar"
        />
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Study App</h2>
      <button className="add-resource-btn">
        <FiPlus size={18} />
        <span>Add Resource</span>
      </button>
      <nav className="nav-menu">
        <ul>
          <li className="active">
            <FiHome />
            <span>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Home
              </Link>
            </span>
          </li>
          <li>
            <FiPlay />
            <span>Games</span>
          </li>
          <li>
            <FiBarChart2 />
            <span>Stats</span>
          </li>
          <li>
            <FiSettings />
            <span>Settings</span>
          </li>
        </ul>
      </nav>
    </aside>
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
      </div>
    </main>
  );
}

export default App;
