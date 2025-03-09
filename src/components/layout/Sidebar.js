import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPlay, FiBarChart2, FiSettings, FiAward, FiChevronLeft,
  FiTrendingUp, FiTarget, FiFlag, FiArrowRight
} from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import LevelProgress from '../ui/LevelProgress';
import StreakCounter from '../ui/StreakCounter';
import DailyChallenge from '../ui/DailyChallenge';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userStats } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState('nav');
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Update main layout class when sidebar is collapsed
    document.querySelector('.main-layout')?.classList.toggle('sidebar-collapsed', !collapsed);
  };

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Navigate to the given path
  const navigateTo = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  // Check if userStats is defined and has valid data
  const hasValidStats = userStats && typeof userStats === 'object';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Net Study</h2>
        <button className="sidebar-collapse-btn" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <FiChevronLeft size={20} />
        </button>
      </div>
      
      {!collapsed && (
        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab ${activeSection === 'nav' ? 'active' : ''}`} 
            onClick={() => setActiveSection('nav')}
          >
            Navigation
          </button>
          <button 
            className={`sidebar-tab ${activeSection === 'progress' ? 'active' : ''}`} 
            onClick={() => setActiveSection('progress')}
          >
            Progress
          </button>
        </div>
      )}
      
      {activeSection === 'nav' || collapsed ? (
        <nav className="nav-menu">
          <ul>
            <li 
              className={isActive('/dashboard') && !location.pathname.includes('/dashboard/') ? 'active' : ''} 
              data-title="Dashboard"
              onClick={navigateTo('/dashboard')}
            >
              <span className="nav-item-icon">
                <FiHome size={20} />
              </span>
              <span className="nav-item-text">
                Dashboard
              </span>
            </li>
            <li 
              className={isActive('/dashboard/stats') ? 'active' : ''} 
              data-title="Statistics"
              onClick={navigateTo('/dashboard/stats')}
            >
              <span className="nav-item-icon">
                <FiBarChart2 size={20} />
              </span>
              <span className="nav-item-text">
                Statistics
              </span>
            </li>
            <li 
              className={isActive('/dashboard/achievements') ? 'active' : ''} 
              data-title="Achievements"
              onClick={navigateTo('/dashboard/achievements')}
            >
              <span className="nav-item-icon">
                <FiAward size={20} />
              </span>
              <span className="nav-item-text">
                Achievements
              </span>
            </li>
            <li 
              className={isActive('/dashboard/settings') ? 'active' : ''} 
              data-title="Settings"
              onClick={navigateTo('/dashboard/settings')}
            >
              <span className="nav-item-icon">
                <FiSettings size={20} />
              </span>
              <span className="nav-item-text">
                Settings
              </span>
            </li>
          </ul>
        </nav>
      ) : (
        <div className="sidebar-progress">
          {/* Level Progress */}
          <div className="sidebar-section progress-section">
            <div className="section-header">
              <div className="icon">
                <FiBarChart2 size={18} />
              </div>
              <h4>Level Progress</h4>
            </div>
            <LevelProgress userXP={hasValidStats ? (userStats.totalXP || 0) : 0} />
          </div>
          
          {/* Streak Section */}
          <div className="sidebar-section streak-section">
            <div className="section-header">
              <div className="icon">
                <FiTrendingUp size={18} />
              </div>
              <h4>Daily Streak</h4>
            </div>
            <StreakCounter streakDays={hasValidStats ? (userStats.currentStreak || 0) : 0} />
          </div>
          
          {/* Daily Challenge */}
          <div className="sidebar-section challenge-section">
            <div className="section-header">
              <div className="icon">
                <FiTarget size={18} />
              </div>
              <h4>Daily Challenge</h4>
            </div>
            <DailyChallenge userStats={hasValidStats ? userStats : {}} />
          </div>
          
          {/* Recent Achievements Preview */}
          {hasValidStats && userStats.completedAchievements && userStats.completedAchievements.length > 0 && (
            <div className="sidebar-section achievements-section">
              <div className="section-header">
                <div className="icon">
                  <FiAward size={18} />
                </div>
                <h4>Recent Achievements</h4>
              </div>
              <div className="recent-achievements-preview">
                {userStats.completedAchievements.slice(-2).map(achievement => (
                  <div key={achievement.id} className="mini-achievement">
                    <span className="achievement-icon">{achievement.icon}</span>
                    <span className="achievement-name">{achievement.name}</span>
                  </div>
                ))}
              </div>
              <div className="view-all-link" onClick={navigateTo('/dashboard/achievements')}>
                <span>View All Achievements</span>
                <FiArrowRight size={16} />
              </div>
            </div>
          )}
          
          {/* Goals Section */}
          {(!hasValidStats || !userStats.completedAchievements || userStats.completedAchievements.length === 0) && (
            <div className="sidebar-section goals-section">
              <div className="section-header">
                <div className="icon">
                  <FiFlag size={18} />
                </div>
                <h4>Daily Goals</h4>
              </div>
              <ul>
                <li>
                  <span className="goal-icon">
                    <FiPlay size={16} />
                  </span>
                  <span className="goal-text">Play 2 rounds of Protocol Game</span>
                </li>
                <li>
                  <span className="goal-icon">
                    <FiTarget size={16} />
                  </span>
                  <span className="goal-text">Score at least 80% in Port Game</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
