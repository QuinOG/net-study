import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ui/StreakCounter.css';

const StreakCounter = ({ streakDays = 0 }) => {
  const [animate, setAnimate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streakDays);
  const [hoverMilestone, setHoverMilestone] = useState(null);
  const streakRef = useRef(null);
  
  // Trigger animation when streak changes
  useEffect(() => {
    if (streakDays > prevStreak) {
      setAnimate(true);
      createConfetti();
      const timer = setTimeout(() => setAnimate(false), 1500);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streakDays);
  }, [streakDays, prevStreak]);

  // Create confetti effect when streak increases
  const createConfetti = () => {
    if (!streakRef.current) return;
    
    const container = streakRef.current;
    const containerRect = container.getBoundingClientRect();
    
    for (let i = 0; i < 40; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random properties
      const size = Math.random() * 8 + 6;
      const color = getRandomColor();
      const left = Math.random() * containerRect.width;
      const angle = Math.random() * 360;
      const delay = Math.random() * 0.5;
      
      // Apply styles
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = color;
      confetti.style.left = `${left}px`;
      confetti.style.top = '0px';
      confetti.style.transform = `rotate(${angle}deg)`;
      confetti.style.animationDelay = `${delay}s`;
      
      // Different shapes for confetti
      if (Math.random() > 0.7) {
        confetti.style.borderRadius = '0';
      } else if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
      } else {
        confetti.style.width = `${size * 0.4}px`;
        confetti.style.height = `${size}px`;
        confetti.style.borderRadius = `${size * 0.2}px`;
      }
      
      container.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };
  
  // Get random color for confetti
  const getRandomColor = () => {
    const colors = ['#4299e1', '#48bb78', '#ecc94b', '#ed8936', '#f56565', '#9f7aea', '#f687b3', '#68d391'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (streakDays >= 30) return 'purple';
    if (streakDays >= 21) return 'red';
    if (streakDays >= 14) return 'orange';
    if (streakDays >= 7) return 'yellow';
    if (streakDays >= 3) return 'green';
    return 'blue';
  };

  const flameColor = getFlameColor();
  
  // Calculate streak stats
  const streakStats = [
    { label: 'Current', value: streakDays },
    { label: 'Best', value: Math.max(streakDays, 30) }, // Placeholder for best streak
    { label: 'Total Days', value: streakDays + 15 } // Placeholder for total days
  ];
  
  // Milestone data
  const milestones = [
    { days: 3, label: "Getting Started", color: "green" },
    { days: 7, label: "One Week", color: "yellow" },
    { days: 14, label: "Two Weeks", color: "orange" },
    { days: 21, label: "Three Weeks", color: "red" },
    { days: 30, label: "One Month", color: "purple" }
  ];
  
  // Get next milestone
  const getNextMilestone = () => {
    for (const milestone of milestones) {
      if (streakDays < milestone.days) {
        return {
          days: milestone.days,
          daysLeft: milestone.days - streakDays,
          label: milestone.label,
          color: milestone.color
        };
      }
    }
    return null;
  };
  
  const nextMilestone = getNextMilestone();
  
  return (
    <div className="streak-container" ref={streakRef}>
      <div className={`streak-card ${animate ? 'glow-effect' : ''}`}>
        <div className="streak-header">
          <div className={`flame-icon ${flameColor}-flame ${animate ? 'pulse' : ''}`}>
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M12,2C10.6,2 9.5,4 9.5,4C9.5,4 7.7,6.5 6.5,9C5.3,11.5 5,14 5,14C5,14 3,14 3,16C3,18 5,18 5,18C5,18 7,22 12,22C17,22 19,18 19,18C19,18 21,18 21,16C21,14 19,14 19,14C19,14 18.7,11.5 17.5,9C16.3,6.5 14.5,4 14.5,4C14.5,4 13.4,2 12,2Z" 
                    fill="currentColor" />
            </svg>
            <div className="flame-particles">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="particle" />
              ))}
            </div>
          </div>
          <div className="streak-title-container">
            <span className="streak-title">Daily Streak</span>
            {nextMilestone && (
              <span className="next-milestone-hint">
                {nextMilestone.daysLeft} days to {nextMilestone.label}
              </span>
            )}
          </div>
          <button 
            className="streak-details-toggle" 
            onClick={() => setShowDetails(!showDetails)}
            aria-label="Toggle streak details"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d={showDetails ? "M7,15L12,10L17,15H7Z" : "M7,10L12,15L17,10H7Z"} fill="currentColor" />
            </svg>
          </button>
        </div>
        
        <div className={`streak-count-container ${animate ? 'celebrate' : ''}`}>
          <div className={`streak-count ${animate ? 'bounce' : ''}`}>
            {streakDays}
            <span className="streak-days">days</span>
          </div>
          
          {animate && (
            <div className="streak-achievement">
              <div className="achievement-badge">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,8H13V13.5L16.2,15.4L15.2,17L11,14.5V8Z" fill="currentColor" />
                </svg>
              </div>
              <span>Streak increased!</span>
            </div>
          )}
        </div>
        
        <div className="streak-progress">
          <div className="streak-milestones">
            {milestones.map(milestone => (
              <div 
                key={milestone.days} 
                className={`milestone ${streakDays >= milestone.days ? `milestone-${milestone.color} active` : ''}`}
                title={`${milestone.days} day milestone: ${milestone.label}`}
                onMouseEnter={() => setHoverMilestone(milestone)}
                onMouseLeave={() => setHoverMilestone(null)}
              >
                {streakDays >= milestone.days && (
                  <div className="milestone-dot" />
                )}
              </div>
            ))}
          </div>
          <div 
            className="streak-progress-bar" 
            style={{ 
              width: `${Math.min(100, (streakDays / 30) * 100)}%`,
              background: getProgressGradient(streakDays)
            }} 
          >
            {streakDays >= 3 && (
              <div className="progress-glow" />
            )}
          </div>
          <div className="milestone-labels">
            {milestones.map(milestone => (
              <div 
                key={milestone.days} 
                className={`milestone-label ${hoverMilestone === milestone ? 'highlight' : ''} ${streakDays >= milestone.days ? 'reached' : ''}`}
              >
                {milestone.days}
              </div>
            ))}
          </div>
        </div>
        
        <p className="streak-message">{getStreakMessage(streakDays)}</p>
        
        {showDetails && (
          <div className="streak-details">
            <div className="streak-stats">
              {streakStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="streak-calendar">
              <div className="calendar-header">Last 7 Days</div>
              <div className="calendar-days">
                {[...Array(7)].map((_, i) => {
                  const isActive = i < Math.min(7, streakDays);
                  return (
                    <div 
                      key={i} 
                      className={`calendar-day ${isActive ? 'active' : ''}`}
                      title={isActive ? 'Completed' : 'Missed'}
                    >
                      {isActive && (
                        <svg viewBox="0 0 24 24" width="12" height="12">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="streak-benefits">
              <div className="benefits-header">Streak Benefits</div>
              <div className="benefits-list">
                {milestones.map(milestone => (
                  <div 
                    key={milestone.days} 
                    className={`benefit-item ${streakDays >= milestone.days ? 'unlocked' : 'locked'}`}
                  >
                    <div className={`benefit-icon ${milestone.color}-flame`}>
                      {streakDays >= milestone.days ? (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <div className="benefit-details">
                      <div className="benefit-title">{milestone.label} Streak</div>
                      <div className="benefit-description">
                        {streakDays >= milestone.days 
                          ? `Unlocked at ${milestone.days} days` 
                          : `Unlock in ${milestone.days - streakDays} more days`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get progress gradient based on streak
const getProgressGradient = (days) => {
  if (days >= 30) return 'linear-gradient(90deg, #4299e1, #9f7aea)';
  if (days >= 21) return 'linear-gradient(90deg, #4299e1, #f56565)';
  if (days >= 14) return 'linear-gradient(90deg, #4299e1, #ed8936)';
  if (days >= 7) return 'linear-gradient(90deg, #4299e1, #ecc94b)';
  if (days >= 3) return 'linear-gradient(90deg, #4299e1, #48bb78)';
  return 'linear-gradient(90deg, #4299e1, #63b3ed)';
};

// Motivational messages based on streak length
const getStreakMessage = (days) => {
  if (days >= 30) return "Legendary! You're unstoppable!";
  if (days >= 21) return "Amazing dedication! Keep blazing!";
  if (days >= 14) return "Two weeks strong! On fire!";
  if (days >= 7) return "One week milestone! Great work!";
  if (days >= 3) return "Getting warmed up! Keep it going!";
  return "Starting your journey! Keep it up!";
};

export default StreakCounter; 