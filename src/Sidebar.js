import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiSettings, FiPlus, FiMinusCircle, FiFolderMinus } from 'react-icons/fi';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Study App</h2>
      <button className="add-resource-btn">
        <FiPlus size={18} />
        <span>Add Resource</span>
      </button>
      {/* Collapse Toggle Button */}
      <button className="collapse-btn" onClick={toggleSidebar}>
        <FiFolderMinus size={18} />
        {collapsed ? "Show Menu" : "Hide Menu"}
      </button>
      {/* Navigation Menu */}
      {!collapsed && (
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
      )}
    </aside>
  );
}

export default Sidebar;
