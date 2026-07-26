import React, { useState, useEffect } from 'react';
import { FaTrophy, FaAward } from 'react-icons/fa';
import '../../styles/ui/MilestoneCelebration.css';

/**
 * Component to display celebration animations for user milestones
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the celebration
 * @param {string} props.type Type of milestone ('level-up', 'mastery', 'certification')
 * @param {Object} props.data Data related to the milestone (level, skill, etc.)
 * @param {Function} props.onComplete Callback when animation completes
 */
const MilestoneCelebration = ({ show, type = 'level-up', data = {}, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [visible, setVisible] = useState(false);
  
  // Reset and start animation when shown
  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimationStage(0);
      
      // Advance through animation stages
      const stageTimers = [
        setTimeout(() => setAnimationStage(1), 500),  // Start animation
        setTimeout(() => setAnimationStage(2), 2000), // Show details
        setTimeout(() => setAnimationStage(3), 3500), // Prepare to close
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 4000) // Complete animation
      ];
      
      return () => stageTimers.forEach(timer => clearTimeout(timer));
    }
  }, [show, onComplete]);
  
  // Don't render if not visible
  if (!visible) return null;
  
  // Render different milestone types
  const renderMilestone = () => {
    switch (type) {
      case 'level-up':
        return (
          <div className={`milestone-content level-up stage-${animationStage}`}>
            <div className="milestone-icon-container">
              <FaTrophy className="milestone-icon" />
              <div className="milestone-rays"></div>
            </div>
            <h2 className="milestone-title">Level Up!</h2>
            <div className="milestone-details">
              {data.level && (
                <div className="level-badge">
                  Level {data.level}
                </div>
              )}
              <p className="milestone-message">
                Congratulations! You've reached a new level in your networking journey.
              </p>
              {data.rewards && (
                <div className="milestone-rewards">
                  <h3>Rewards Unlocked</h3>
                  <ul>
                    {data.rewards.map((reward, index) => (
                      <li key={index}>{reward}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      
      // Add more milestone types later
      default:
        return (
          <div className={`milestone-content default stage-${animationStage}`}>
            <div className="milestone-icon-container">
              <FaAward className="milestone-icon" />
            </div>
            <h2 className="milestone-title">Achievement Unlocked!</h2>
          </div>
        );
    }
  };
  
  return (
    <div className={`milestone-celebration-overlay ${visible ? 'visible' : ''}`}>
      <div className="milestone-celebration-container">
        {renderMilestone()}
      </div>
    </div>
  );
};

export default MilestoneCelebration; 