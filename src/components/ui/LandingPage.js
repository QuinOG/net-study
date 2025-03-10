import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/ui/LandingPage.css';
import logo from '../../assets/images/netquest.png';
import LoginSignup from './LoginSignup';
import { UserContext } from '../../context/UserContext';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout, startGuestSession, resetApplicationState } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Check if user is already logged in (including guest)
  const isLoggedIn = !!user;
  const isGuest = user?.isGuest || false;

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };
  
  // Handle exploring as guest
  const handleExploreAsGuest = (e) => {
    e.preventDefault();
    console.log("[LandingPage] Starting guest mode...");
    
    // Force a hard page reload to the dashboard with guest mode parameter
    window.location.href = "/dashboard?mode=guest";
  };
  
  // Handle continuing to dashboard
  const handleContinueToDashboard = (e) => {
    e.preventDefault();
    window.location.href = "/dashboard";
  };
  
  // Handle logging out
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    // The page will reload automatically after logout
  };

  const handleNavClick = (e) => {
    e.preventDefault();
    // In a real app, you would scroll to the section or navigate
    console.log('Navigation clicked');
  };

  // Different content depending on login status
  const renderMainContent = () => {
    // For logged in users (including guests)
    if (isLoggedIn) {
      return (
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome back, <span className="highlight">{user.displayName}</span>!
          </h1>
          <p className="hero-subtitle">
            {isGuest 
              ? "I'm not sure what to call you yet. . . Sign in to save your progress and access all features!"
              : "Continue your networking journey and sharpen your skills!"}
          </p>
          
          <div className="hero-buttons">
            <button 
              className="explore-button primary"
              onClick={handleContinueToDashboard}
            >
              Continue to Dashboard <FaArrowRight className="icon-right" />
            </button>
            
            <button 
              className="login-button"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="icon-left" /> Log Out
            </button>
            
            {isGuest && (
              <button 
                className="login-button primary"
                onClick={handleLoginClick}
              >
                Sign in to Save Progress <FaArrowRight className="icon-right" />
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // For non-logged in users (default view)
    return (
      <div className="hero-content">
        <h1 className="hero-title">
          Master <span className="highlight">Networking</span> Concepts Through Interactive Learning
        </h1>
        <p className="hero-subtitle">
          NetQuest helps you build technical skills through gamified exercises,
          quizzes, and challenges designed for networking students and professionals!
        </p>
        
        <div className="hero-buttons">
          <button 
            className="explore-button primary"
            onClick={handleExploreAsGuest}
          >
            Explore as Guest <FaArrowRight className="icon-right" />
          </button>
          <button 
            className="login-button primary"
            onClick={handleLoginClick}
          >
            Login to Save Progress <FaArrowRight className="icon-right" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="landing-logo">
          <img src={logo} alt="NetQuest Logo" />
          <span>NetQuest</span>
        </div>
        <nav className="landing-nav">
          <button className="nav-link" onClick={handleNavClick}>Features</button>
          <button className="nav-link" onClick={handleNavClick}>About</button>
          {!isLoggedIn && (
            <button className="nav-link" onClick={handleLoginClick}>Login</button>
          )}
          {isLoggedIn && (
            <button className="nav-link" onClick={handleLogout}>Logout</button>
          )}
        </nav>
      </div>
      
      <div className="landing-content">
        <div className="landing-hero">
          {renderMainContent()}
        </div>

        {showLoginModal && (
          <LoginSignup onClose={() => setShowLoginModal(false)} />
        )}

        <div className="landing-footer">
          <p>&copy; 2025 NetQuest. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 