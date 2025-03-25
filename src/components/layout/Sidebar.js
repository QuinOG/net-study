import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiMap, FiChevronLeft } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import LevelProgress from '../ui/LevelProgress';
import StreakCounter from '../ui/StreakCounter';

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
              data-title="Games"
              onClick={navigateTo('/dashboard')}
            >
              <span className="nav-item-icon">
                <FiPlay size={20} />
              </span>
              <span className="nav-item-text">
                Games
              </span>
            </li>
            <li 
              className={isActive('/dashboard/learning-paths') ? 'active' : ''} 
              data-title="Learning Paths"
              onClick={navigateTo('/dashboard/learning-paths')}
            >
              <span className="nav-item-icon">
                <FiHome size={20} />
              </span>
              <span className="nav-item-text">
                Learning Paths
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
                <FiMap size={20} />
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
          <LevelProgress userXP={hasValidStats ? (userStats.totalXP || 0) : 0} />
          <StreakCounter streakDays={hasValidStats ? (userStats.currentStreak || 0) : 0} />
        </div>
      )}
    </aside>
  );
}

export default Sidebar;


