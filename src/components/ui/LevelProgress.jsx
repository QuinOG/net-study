import React, { useState, useEffect, useRef } from 'react';
import { FiAward, FiStar, FiUnlock, FiTrendingUp, FiZap, FiTarget, FiChevronUp, FiChevronDown, FiClock, FiFlag, FiAperture, FiInfo } from 'react-icons/fi';
import '../../styles/ui/LevelProgress.css';

// Level titles
const levelTitles = [
  "Network Novice", "Cable Connector", "Protocol Pupil", "Subnet Student",
  "Data Traveler", "Packet Patroller", "Router Rookie", "Firewall Finder",
  "Switch Specialist", "TCP Technician", "IP Investigator", "LAN Leader",
  "WAN Warrior", "Cyber Scout", "Security Sentinel", "Network Navigator",
  "Protocol Professor", "Encryption Expert", "System Sage", "Network Maestro"
];

// Helper function to calculate level based on total XP
const calculateLevel = (totalXP) => {
  let xpRemaining = totalXP;
  let level = 1;
  let requiredXP = 50; // Base XP for level 1
  let totalXPForNextLevel = requiredXP;
  let totalXPForCurrentLevel = 0;
  
  while (xpRemaining >= requiredXP) {
    xpRemaining -= requiredXP;
    level++;
    totalXPForCurrentLevel = totalXPForNextLevel;
    requiredXP = Math.floor(requiredXP * 1.5); // Increase by 25% for next level
    totalXPForNextLevel += requiredXP;
  }
  
  return { 
    level, 
    currentLevelXP: xpRemaining, 
    nextLevelXP: requiredXP,
    totalXPForCurrentLevel,
    totalXPForNextLevel,
    overallProgress: (totalXP / totalXPForNextLevel) * 100
  };
};

function LevelProgress({ userXP = 0 }) {
  const [animateXP, setAnimateXP] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [prevXP, setPrevXP] = useState(userXP);
  const [activeTab, setActiveTab] = useState('progress');
  const progressRef = useRef(null);
  
  // Calculate level and progress using the progressive system
  const { level, currentLevelXP, nextLevelXP, overallProgress } = calculateLevel(userXP);
  const progressPercent = (currentLevelXP / nextLevelXP) * 100;
  
  // Trigger animation when XP changes
  useEffect(() => {
    if (userXP > prevXP) {
      setAnimateXP(true);
      createParticles();
      const timer = setTimeout(() => setAnimateXP(false), 1500);
      return () => clearTimeout(timer);
    }
    setPrevXP(userXP);
  }, [userXP, prevXP]);
  
  // Create particle effect when XP increases
  const createParticles = () => {
    if (!progressRef.current) return;
    
    const container = progressRef.current;
    const containerRect = container.getBoundingClientRect();
    const progressBar = container.querySelector('.xp-bar');
    const progressRect = progressBar.getBoundingClientRect();
    
    const particleCount = 20;
    const colors = ['#4299e1', '#9f7aea', '#ecc94b'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'xp-particle';
      
      // Random properties
      const size = Math.random() * 6 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = progressRect.right - containerRect.left - (Math.random() * 20);
      const top = progressRect.top - containerRect.top + (Math.random() * progressRect.height);
      const angle = Math.random() * 360;
      const delay = Math.random() * 0.3;
      
      // Apply styles
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.left = `${left}px`;
      particle.style.top = `${top}px`;
      particle.style.transform = `rotate(${angle}deg)`;
      particle.style.animationDelay = `${delay}s`;
      
      // Set random direction
      const randomX = (Math.random() - 0.5) * 60;
      const randomY = (Math.random() - 0.5) * 60;
      particle.style.setProperty('--x', `${randomX}px`);
      particle.style.setProperty('--y', `${randomY}px`);
      
      container.appendChild(particle);
      
      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, 2000);
    }
  };
  
  // Calculate milestones
  const milestones = [
    { position: 25, reward: "New Challenge Unlocked", icon: <FiUnlock size={14} /> },
    { position: 50, reward: "Bonus XP Multiplier", icon: <FiZap size={14} /> },
    { position: 75, reward: "Special Achievement", icon: <FiTarget size={14} /> }
  ];

  // Get next milestone
  const nextMilestone = {
    title: levelTitles[Math.min(level, levelTitles.length - 1)],
    description: `${nextLevelXP - currentLevelXP} XP until next level`,
    icon: <FiAward size={24} className="milestone-icon-svg" />
  };

  // Get level benefits
  const benefits = getLevelBenefits(level);
  
  // Get upcoming rewards
  const upcomingRewards = [
    { level: level + 1, reward: getLevelBenefits(level + 1)[0], icon: <FiFlag size={16} /> },
    { level: level + 2, reward: getLevelBenefits(level + 2)[0], icon: <FiAperture size={16} /> },
    { level: level + 3, reward: getLevelBenefits(level + 3)[0], icon: <FiClock size={16} /> }
  ];

  return (
    <div className="level-container">
      <div className={`level-card ${animateXP ? 'level-card-pulse' : ''}`}>
        <div className="level-header">
          <div className="level-badge-container">
            <div className={`level-badge ${animateXP ? 'pulse-animation' : ''}`}>
              <div className="level-badge-inner">{level}</div>
              <div className="level-badge-glow"></div>
            </div>
            <div className="level-stars">
              {[...Array(Math.min(5, Math.ceil(level / 4)))].map((_, i) => (
                <FiStar 
                  key={i} 
                  size={12} 
                  className={`level-star ${i < (level % 4 || 4) ? 'active' : ''}`} 
                />
              ))}
            </div>
          </div>
          <div className="level-title-container">
            <h3 className="level-title">{levelTitles[Math.min(level - 1, levelTitles.length - 1)]}</h3>
            <div className="level-subtitle">Level {level}</div>
          </div>
          <div className="level-actions">
            <button 
              className="level-info-button"
              onClick={() => setShowLevelInfo(!showLevelInfo)}
              aria-label="Toggle level information"
              title="Level Information"
            >
              <FiInfo size={18} />
            </button>
          </div>
        </div>

        {showLevelInfo && (
          <div className="level-benefits">
            <div className="benefits-header">
              <h4>Level {level} Benefits</h4>
              <button 
                className="collapse-button"
                onClick={() => setShowLevelInfo(false)}
                aria-label="Collapse benefits"
              >
                <FiChevronUp size={16} />
              </button>
            </div>
            <ul>
              {benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <div className="benefit-icon">
                    <FiUnlock size={14} />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="level-tabs">
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button 
            className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>

        {activeTab === 'progress' && (
          <div className="xp-progress" ref={progressRef}>
            <div className="progress-header">
              <div className="progress-title">Current Level Progress</div>
              <div className="progress-percentage">{Math.floor(progressPercent)}%</div>
            </div>
            
            <div className="xp-bar-container">
              <div 
                className={`xp-bar ${animateXP ? 'animate-width' : ''}`} 
                style={{ width: `${progressPercent}%` }} 
              >
                <div className="xp-bar-shine"></div>
              </div>
              
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`milestone-marker ${currentLevelXP >= (milestone.position / 100) * nextLevelXP ? 'milestone-reached' : ''}`}
                  style={{ left: `${milestone.position}%` }}
                >
                  <div className="milestone-icon">
                    {milestone.icon}
                  </div>
                  <div className="milestone-tooltip">
                    {milestone.reward}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="xp-text">
              <span className={`xp-current ${animateXP ? 'pulse-text' : ''}`}>{currentLevelXP}</span>
              <span className="xp-separator">/</span>
              <span className="xp-required">{nextLevelXP} XP</span>
              {animateXP && (
                <span className="xp-gained">+{userXP - prevXP} XP</span>
              )}
            </div>
            
            <div className="next-milestone">
              <div className="next-milestone-icon">
                {nextMilestone.icon}
              </div>
              <div className="next-milestone-info">
                <div className="next-milestone-title">{nextMilestone.title}</div>
                <div className="next-milestone-description">{nextMilestone.description}</div>
              </div>
              <div className="next-milestone-progress">
                <svg viewBox="0 0 36 36" className="circular-progress">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${progressPercent}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{Math.floor(progressPercent)}%</text>
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="upcoming-rewards">
            <div className="rewards-header">
              <h4>Upcoming Rewards</h4>
            </div>
            <div className="rewards-list">
              {upcomingRewards.map((reward, index) => (
                <div key={index} className="reward-item">
                  <div className="reward-level">Level {reward.level}</div>
                  <div className="reward-content">
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-text">{reward.reward}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="current-rewards">
              <div className="current-rewards-header">Current Rewards</div>
              <div className="current-reward-item">
                <div className="current-reward-icon">
                  <FiAward size={18} />
                </div>
                <div className="current-reward-text">
                  {benefits[0]}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get benefits for the next level
const getLevelBenefits = (level) => {
  const benefits = [
    "Access to basic challenges",
    "Daily bonus XP opportunities",
    "Access to intermediate challenges",
    "Custom profile badge",
    "Access to advanced challenges",
    "Double XP weekends",
    "Expert challenge access",
    "Challenge creation tools",
    "Community recognition features",
    "Master-level difficulty",
    "Exclusive networking resources",
    "Priority access to new features",
    "Custom challenge creation",
    "Advanced statistics tracking",
    "Mentor program eligibility",
    "Expert resource contributions",
    "Community leadership tools",
    "Challenge design capabilities",
    "Beta feature testing access",
    "Honorary NetQuest recognition"
  ];
  
  return level <= benefits.length ? [benefits[level-1]] : ["Legendary status and bragging rights!"];
};

export default LevelProgress; 