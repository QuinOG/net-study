import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import '../../styles/ui/LandingPage.css';
import logo from '../../assets/images/netquest.png';
import LoginSignup from './LoginSignup';
import { UserContext } from '../../context/UserContext';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { startGuestSession } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };
  
  const handleExploreAsGuest = () => {
    startGuestSession();
    navigate('/dashboard');
  };

  const handleNavClick = (e) => {
    e.preventDefault();
    // In a real app, you would scroll to the section or navigate
    console.log('Navigation clicked');
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
          <button className="nav-link" onClick={handleLoginClick}>Login</button>
        </nav>
      </div>
      
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Master <span className="highlight">Networking</span> Concepts Through Interactive Learning
            </h1>
            <p className="hero-subtitle">
              NetQuest helps you build technical skills through gamified exercises,
              quizzes, and challenges designed for networking professionals and students
            </p>
            
            <div className="hero-buttons">
              <button className="explore-button primary" onClick={handleExploreAsGuest}>
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