import React from 'react';
import FeedbackMessage from './FeedbackMessage';
import ComboMessage from './ComboMessage';
import ActiveBonus from './ActiveBonus';
import '../../styles/ui/NotificationArea.css';

const NotificationArea = ({
  // Feedback message props
  feedbackShow = false,
  feedbackMessage = '',
  feedbackIsCorrect = false,
  onFeedbackHide,
  
  // Combo message props  
  showCombo = false,
  comboMessage = '',
  showBonus = false,
  bonusMessage = '',
  showStreak = false,
  streakReward = '',
  currentStreak = 0,
  
  // Active bonus props
  bonusType = null,
  bonusTimeRemaining = 0
}) => {
  return (
    <div className="notification-area">
      <div className="notification-content">
        {/* Show Active Bonus at the top since it's important */}
        <ActiveBonus 
          bonusType={bonusType}
          timeRemaining={bonusTimeRemaining}
        />
        
        {/* Display combo messages */}
        <ComboMessage 
          showCombo={showCombo}
          comboMessage={comboMessage}
          showBonus={showBonus}
          bonusMessage={bonusMessage}
          showStreak={showStreak}
          streakReward={streakReward}
          currentStreak={currentStreak}
        />
        
        {/* Display feedback messages */}
        <FeedbackMessage 
          show={feedbackShow}
          message={feedbackMessage}
          isCorrect={feedbackIsCorrect}
          autoHideDuration={1500}
          onHide={onFeedbackHide}
        />
      </div>
    </div>
  );
};

export default NotificationArea; 