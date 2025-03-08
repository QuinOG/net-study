import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiAward } from 'react-icons/fi';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside className="sidebar">
      {/*<h2 className="sidebar-title">Study App</h2>
      <button className="add-resource-btn">
        <FiPlus size={18} />
        <span>Add Resource</span>
      </button>*/}
      <button className="collapse-btn" onClick={toggleSidebar}>
        {collapsed ? "Show Menu" : "Hide Menu"}
      </button>
      {/* Navigation Menu */}
      {!collapsed && (
        <nav className="nav-menu">
          <ul>
            <li>
              <FiPlay />
              <span>
                <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Games
                </Link>
              </span>
            </li>
            <li>
              <FiBarChart2 />
              <span>
                <Link to="/dashboard/stats" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Stats
                </Link>
              </span>
            </li>
            <li>
              <FiAward />
              <span>
                <Link to="/dashboard/achievements" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Achievements
                </Link>
              </span>
            </li>
            <li>
              <FiSettings />
              <span>
                <Link to="/dashboard/settings" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Settings
                </Link>
              </span>
            </li>
          </ul>
        </nav>
      )}
    </aside>
  );
}

export default Sidebar;
