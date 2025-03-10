import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaSignOutAlt, 
  FaGamepad, 
  FaTrophy, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaShare, 
  FaUserPlus,
  FaTwitter,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa';
import '../../styles/ui/LandingPage.css';
import logo from '../../assets/images/netquest.png';
import LoginSignup from './LoginSignup';
import { UserContext } from '../../context/UserContext';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const { user, logout, startGuestSession, resetApplicationState, userStats, isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Check if user is already logged in (including guest)
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

  // Generate unique referral link
  const getReferralLink = () => {
    // In a real app, this would generate a unique code or use the user's username
    // For now, we'll just use a placeholder
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${isLoggedIn ? userStats.username || 'friend' : 'friend'}`;
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Referral link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Share referral via platform
  const shareReferral = (platform) => {
    const link = getReferralLink();
    const message = `Join me on NetQuest - the fun way to master networking skills! ${link} #NetQuest #NetworkingSkills`;
    
    let shareUrl;
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join me on NetQuest!')}&body=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
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

        {/* Refer a Friend Section */}
        <section className="referral-section">
          <div className="referral-content">
            <h2><FaUserPlus /> Invite Friends, Earn Rewards</h2>
            <p>Share NetQuest with your friends and colleagues. Both of you will receive bonus XP and exclusive achievements!</p>
            <button className="refer-button" onClick={() => setShowReferModal(true)}>
              <FaShare /> Refer a Friend
            </button>
          </div>
        </section>
        
        {/* Referral Modal */}
        {showReferModal && (
          <div className="referral-modal-overlay">
            <div className="referral-modal">
              <h3>Share NetQuest</h3>
              <p>Invite your friends and you'll both get bonus XP and exclusive achievements!</p>
              
              <div className="referral-link-box">
                <input 
                  type="text" 
                  readOnly 
                  value={getReferralLink()} 
                  className="referral-link-input"
                />
                <button onClick={copyReferralLink} className="copy-link-btn">Copy</button>
              </div>
              
              <div className="share-options">
                <button onClick={() => shareReferral('twitter')} className="share-btn twitter">
                  <FaTwitter /> Twitter
                </button>
                <button onClick={() => shareReferral('facebook')} className="share-btn facebook">
                  <FaFacebook /> Facebook
                </button>
                <button onClick={() => shareReferral('whatsapp')} className="share-btn whatsapp">
                  <FaWhatsapp /> WhatsApp
                </button>
                <button onClick={() => shareReferral('email')} className="share-btn email">
                  <FaEnvelope /> Email
                </button>
              </div>
              
              <button className="close-modal-btn" onClick={() => setShowReferModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        <div className="landing-footer">
          <p>&copy; 2025 NetQuest. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 