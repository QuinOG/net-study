import React, { useState, useEffect } from 'react';
import { FiAward, FiZap, FiClock, FiPlus, FiGift } from 'react-icons/fi';
import '../../styles/ui/GameHUD.css';

const GameHUD = ({
  // Notification states
  activeBonus = null,
  bonusTimeRemaining = 0,
  showCombo = false,
  comboMessage = '',
  showBonus = false,
  bonusMessage = '',
  showStreak = false,
  streakReward = '',
  currentStreak = 0,
  feedbackShow = false,
  feedbackMessage = '',
  feedbackIsCorrect = false,
  showSpeedBonus = false,
  speedBonus = 0,
  
  // Game stats for context-aware positioning
  score = 0,
  combo = 0,
  
  // Callback for handling notification hide
  onFeedbackHide = () => {}
}) => {
  // State to track visibility with animations
  const [feedbackVisible, setFeedbackVisible] = useState(feedbackShow);
  const [bonusVisible, setBonusVisible] = useState(activeBonus !== null);
  const [comboVisible, setComboVisible] = useState(showCombo);
  const [bonusMessageVisible, setBonusMessageVisible] = useState(showBonus);
  const [streakVisible, setStreakVisible] = useState(showStreak);
  const [speedBonusVisible, setSpeedBonusVisible] = useState(showSpeedBonus);
  
  // Set appropriate icons for different notifications
  const getBonusIcon = (type) => {
    if (type === 'doublePoints') return <FiZap className="hud-icon double-points" />;
    if (type === 'extraTime') return <FiClock className="hud-icon extra-time" />;
    if (type === 'powerUp') return <FiGift className="hud-icon power-up" />;
    if (type === 'instantPoints') return <FiPlus className="hud-icon instant-points" />;
    return null;
  };
  
  // Handle feedback visibility with auto-hide
  useEffect(() => {
    setFeedbackVisible(feedbackShow);
    
    if (feedbackShow) {
      const timer = setTimeout(() => {
        setFeedbackVisible(false);
        onFeedbackHide();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [feedbackShow, onFeedbackHide]);
  
  // Handle streak reward visibility
  useEffect(() => {
    setStreakVisible(showStreak);
    
    if (showStreak) {
      const timer = setTimeout(() => {
        setStreakVisible(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [showStreak]);
  
  // Handle combo message visibility
  useEffect(() => {
    setComboVisible(showCombo);
    
    if (showCombo) {
      const timer = setTimeout(() => {
        setComboVisible(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showCombo]);
  
  // Handle bonus message visibility
  useEffect(() => {
    setBonusMessageVisible(showBonus);
    
    if (showBonus) {
      const timer = setTimeout(() => {
        setBonusMessageVisible(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [showBonus]);
  
  // Handle bonus state visibility
  useEffect(() => {
    setBonusVisible(activeBonus !== null);
  }, [activeBonus]);
  
  // Handle speed bonus visibility
  useEffect(() => {
    setSpeedBonusVisible(showSpeedBonus);
    
    if (showSpeedBonus) {
      const timer = setTimeout(() => {
        setSpeedBonusVisible(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showSpeedBonus]);

  return (
    <>
      {/* Overlay container for all HUD elements */}
      <div className="game-hud-overlay">
        {/* Active Bonus Notification */}
        {activeBonus && bonusVisible && (
          <div className={`hud-bonus-status ${activeBonus}`}>
            {getBonusIcon(activeBonus)}
            <div className="hud-bonus-content">
              <div className="hud-bonus-label">
                {activeBonus === 'doublePoints' && 'DOUBLE POINTS'}
                {activeBonus === 'extraTime' && 'TIME BONUS'}
                {activeBonus === 'powerUp' && 'POWER-UP BONUS'}
                {activeBonus === 'instantPoints' && 'POINT BONUS'}
              </div>
              {bonusTimeRemaining > 0 && (
                <div className="hud-bonus-timer">{bonusTimeRemaining}s</div>
              )}
            </div>
          </div>
        )}
        
        {/* Feedback Message (Correct/Incorrect) */}
        {feedbackVisible && (
          <div className={`hud-feedback ${feedbackIsCorrect ? 'correct' : 'incorrect'}`}>
            {feedbackMessage}
          </div>
        )}
        
        {/* Speed Bonus Popup */}
        {speedBonusVisible && speedBonus > 0 && (
          <div className="hud-speed-bonus">
            <FiZap className="hud-icon" />
            <span>+{speedBonus} SPEED BONUS</span>
          </div>
        )}
        
        {/* Combo Message */}
        {comboVisible && (
          <div className="hud-combo">
            <span>🔥 {comboMessage}</span>
          </div>
        )}
        
        {/* Bonus Message (Random rewards) */}
        {bonusMessageVisible && (
          <div className="hud-bonus-message">
            <span>{bonusMessage}</span>
          </div>
        )}
        
        {/* Streak Milestone */}
        {streakVisible && (
          <div className="hud-streak-milestone">
            <FiAward className="hud-icon award" />
            <div className="hud-streak-content">
              <div className="milestone-count">{currentStreak} STREAK!</div>
              <div className="milestone-reward">{streakReward}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GameHUD; 