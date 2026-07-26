import React from 'react';
import { FiAward } from 'react-icons/fi';
import '../../styles/ui/DifficultySelectScreen.css';

/**
 * Hard difficulty card component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the card is clicked
 * @param {Object} props.settings Difficulty settings
 * @returns {JSX.Element} A Hard difficulty card
 */
function HardCard({ onClick, settings }) {
  return (
    <div className="difficulty-card hard-card" onClick={onClick}>
      <div className="difficulty-card-icon">
        <FiAward />
      </div>
      <h3 className="difficulty-card-title">Hard</h3>
      <ul className="difficulty-card-features">
        <li className="difficulty-card-feature">Time Limit: {settings.timeLimit} seconds</li>
        <li className="difficulty-card-feature">Time Penalty: -{settings.timePenalty} seconds</li>
        <li className="difficulty-card-feature">Score Multiplier: {settings.multiplier}x</li>
        <li className="difficulty-card-feature">Hints: None</li>
      </ul>
    </div>
  );
}

export default HardCard; 