import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import '../styles/LandingPage.css';
import logo from '../netquest.png';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="landing-logo">
          <img src={logo} alt="NetQuest Logo" />
          <h2>NetQuest</h2>
        </div>
      </div>

      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Network Concepts <span className="highlight">Through Play</span>
          </h1>
          
          <p className="hero-mission">
            At NetQuest, we believe learning networking skills should be engaging and enjoyable.
            Our interactive games and challenges make mastering technical concepts fun and effective.
          </p>
          
          <div className="button-group">
            <Link to="/dashboard" className="login-button primary">
              Explore as Guest <FaArrowRight className="icon-right" />
            </Link>
            <Link to="/dashboard" className="login-button primary">
              Login to Save Progress <FaArrowRight className="icon-right" />
            </Link>
          </div>
        </div>
      </div>

      <div className="landing-footer">
        <div className="footer-copyright">
          © {new Date().getFullYear()} NetQuest. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 