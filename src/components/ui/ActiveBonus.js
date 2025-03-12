import React from 'react';
import '../../styles/ui/ActiveBonus.css';

const ActiveBonus = ({ bonusType, timeRemaining }) => {
  // Early return if no bonus is active
  if (!bonusType) return null;

  // Map bonus types to display text
  const getBonusLabel = (type) => {
    // Use shorter text for the HUD-style display
    const bonusLabels = {
      'doublePoints': 'DOUBLE POINTS',
      'extraTime': 'TIME BONUS',
      'powerUp': 'POWER-UP BONUS',
      'instantPoints': 'POINT BONUS',
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