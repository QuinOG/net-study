import React from 'react';
import '../../styles/ui/ActiveBonus.css';

const ActiveBonus = ({ bonusType, timeRemaining }) => {
  // Early return if no bonus is active
  if (!bonusType) return null;

  // Map bonus types to display text
  const getBonusLabel = (type) => {
    const bonusLabels = {
      'doublePoints': 'DOUBLE POINTS ACTIVE',
      'extraTime': 'TIME BONUS ACTIVE',
      'powerUp': 'POWER-UP BONUS ACTIVE',
      'instantPoints': 'POINT BONUS ACTIVE',
      // Add more bonus types as needed
    };
    
    return bonusLabels[type] || 'BONUS ACTIVE';
  };

  return (
    <div className={`active-bonus ${bonusType}`}>
      <div className="bonus-label">
        {getBonusLabel(bonusType)}
      </div>
      {timeRemaining > 0 && (
        <div className="bonus-timer">{timeRemaining}s</div>
      )}
    </div>
  );
};

export default ActiveBonus; 