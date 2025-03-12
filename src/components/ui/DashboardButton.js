import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

/**
 * A button component for navigating back to the dashboard
 * 
 * @param {Object} props Component props
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} A dashboard button component
 */
function DashboardButton({ className = '' }) {
  const navigate = useNavigate();
  
  return (
    <button 
      className={`dashboard-btn ${className}`}
      onClick={() => navigate('/dashboard')}
    >
      <FiHome /> Back to Dashboard
    </button>
  );
}

export default DashboardButton; 