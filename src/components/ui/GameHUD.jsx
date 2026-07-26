import React, { useState, useEffect, useRef } from 'react';
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
  
  // Notification queue to prevent overlapping
  const notificationQueue = useRef([]);
  const activeNotifications = useRef(new Set());
  
  // Function to process notification queue
  const processQueue = () => {
    if (notificationQueue.current.length === 0) return;
    
    const nextNotification = notificationQueue.current[0];
    if (!activeNotifications.current.has(nextNotification.type)) {
      // Activate the notification
      activeNotifications.current.add(nextNotification.type);
      nextNotification.activate();
      
      // Set up cleanup
      setTimeout(() => {
        activeNotifications.current.delete(nextNotification.type);
        notificationQueue.current.shift();
        processQueue();
      }, nextNotification.duration);
    }
  };
  
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
    if (feedbackShow && !feedbackVisible) {
      notificationQueue.current.push({
        type: 'feedback',
        activate: () => setFeedbackVisible(true),
        duration: 2000 // Increased from 1500
      });
      processQueue();
    } else if (!feedbackShow && feedbackVisible) {
      setFeedbackVisible(false);
      onFeedbackHide();
    }
  }, [feedbackShow, feedbackVisible, onFeedbackHide]);
  
  // Handle streak reward visibility
  useEffect(() => {
    if (showStreak && !streakVisible) {
      notificationQueue.current.push({
        type: 'streak',
        activate: () => setStreakVisible(true),
        duration: 3000 // Increased from 2500
      });
      processQueue();
    } else if (!showStreak && streakVisible) {
      setStreakVisible(false);
    }
  }, [showStreak, streakVisible]);
  
  // Handle combo message visibility
  useEffect(() => {
    if (showCombo && !comboVisible) {
      notificationQueue.current.push({
        type: 'combo',
        activate: () => setComboVisible(true),
        duration: 2000 // Increased from 1500
      });
      processQueue();
    } else if (!showCombo && comboVisible) {
      setComboVisible(false);
    }
  }, [showCombo, comboVisible]);
  
  // Handle bonus message visibility
  useEffect(() => {
    if (showBonus && !bonusMessageVisible) {
      notificationQueue.current.push({
        type: 'bonus',
        activate: () => setBonusMessageVisible(true),
        duration: 3000 // Increased from 2500
      });
      processQueue();
    } else if (!showBonus && bonusMessageVisible) {
      setBonusMessageVisible(false);
    }
  }, [showBonus, bonusMessageVisible]);
  
  // Handle bonus state visibility
  useEffect(() => {
    setBonusVisible(activeBonus !== null);
  }, [activeBonus]);
  
  // Handle speed bonus visibility
  useEffect(() => {
    if (showSpeedBonus && !speedBonusVisible && speedBonus >= 20) { // Only show for significant bonuses (>=20)
      notificationQueue.current.push({
        type: 'speedBonus',
        activate: () => setSpeedBonusVisible(true),
        duration: 2000 // Increased from 1500
      });
      processQueue();
    } else if (!showSpeedBonus && speedBonusVisible) {
      setSpeedBonusVisible(false);
    }
  }, [showSpeedBonus, speedBonusVisible, speedBonus]);

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
        
        {/* Speed Bonus Popup - only shown for significant bonuses */}
        {speedBonusVisible && speedBonus >= 20 && (
          <div className="hud-speed-bonus">
            <FiZap className="hud-icon" />
            <span>+{speedBonus} SPEED BONUS</span>
          </div>
        )}
        
        {/* Combo Message - shown less frequently */}
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