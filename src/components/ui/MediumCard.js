import React from 'react';
import { FiZap } from 'react-icons/fi';
import '../../styles/ui/DifficultySelectScreen.css';

/**
 * Medium difficulty card component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the card is clicked
 * @param {Object} props.settings Difficulty settings
 * @returns {JSX.Element} A Medium difficulty card
 */
function MediumCard({ onClick, settings }) {
  return (
    <div className="difficulty-card medium-card" onClick={onClick}>
      <div className="difficulty-card-icon">
        <FiZap />
      </div>
      <h3 className="difficulty-card-title">Medium</h3>
      <ul className="difficulty-card-features">
        <li className="difficulty-card-feature">Time Limit: {settings.timeLimit} seconds</li>
        <li className="difficulty-card-feature">Time Penalty: -{settings.timePenalty} seconds</li>
        <li className="difficulty-card-feature">Score Multiplier: {settings.multiplier}x</li>
        <li className="difficulty-card-feature">Hints: Limited</li>
      </ul>
    </div>
  );
}

export default MediumCard; 