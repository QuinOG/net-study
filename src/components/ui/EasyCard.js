import React from 'react';
import { FiCheck } from 'react-icons/fi';
import '../../styles/ui/DifficultySelectScreen.css';

/**
 * Easy difficulty card component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the card is clicked
 * @param {Object} props.settings Difficulty settings
 * @returns {JSX.Element} An Easy difficulty card
 */
function EasyCard({ onClick, settings }) {
  return (
    <div className="difficulty-card easy-card" onClick={onClick}>
      <div className="difficulty-card-icon">
        <FiCheck />
      </div>
      <h3 className="difficulty-card-title">Easy</h3>
      <ul className="difficulty-card-features">
        <li className="difficulty-card-feature">Time Limit: {settings.timeLimit} seconds</li>
        <li className="difficulty-card-feature">Time Penalty: -{settings.timePenalty} seconds</li>
        <li className="difficulty-card-feature">Score Multiplier: {settings.multiplier}x</li>
        <li className="difficulty-card-feature">Hints: Available</li>
      </ul>
    </div>
  );
}

export default EasyCard; 