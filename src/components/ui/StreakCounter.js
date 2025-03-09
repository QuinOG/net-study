import React from 'react';
import '../../styles/ui/StreakCounter.css';

const StreakCounter = ({ streakDays = 0 }) => {
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
  
  return (
    <div className="streak-section">
      <div className="streak-header">
        <div className={`flame-icon ${flameColor}-flame`}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12,2C10.6,2 9.5,4 9.5,4C9.5,4 7.7,6.5 6.5,9C5.3,11.5 5,14 5,14C5,14 3,14 3,16C3,18 5,18 5,18C5,18 7,22 12,22C17,22 19,18 19,18C19,18 21,18 21,16C21,14 19,14 19,14C19,14 18.7,11.5 17.5,9C16.3,6.5 14.5,4 14.5,4C14.5,4 13.4,2 12,2Z" 
                  fill="currentColor" />
          </svg>
        </div>
        <span>Streak</span>
      </div>
      <div className="streak-count">{streakDays} days</div>
      <p className="streak-message">{getStreakMessage(streakDays)}</p>
    </div>
  );
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