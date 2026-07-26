import React from 'react';
import { FiClock } from 'react-icons/fi';
import '../../styles/ui/TimeAttackCard.css';

/**
 * Time Attack game mode card component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the card is clicked
 * @returns {JSX.Element} A Time Attack game mode card
 */
function TimeAttackCard({ onClick }) {
  return (
    <div className="time-attack-card" onClick={onClick}>
      <div className="time-attack-icon-container">
        <FiClock />
      </div>
      <h3 className="time-attack-title">Time Attack</h3>
      <p className="time-attack-description">
        Race against the clock to identify as many items as possible!
      </p>
      <ul className="time-attack-features">
        <li className="time-attack-feature">Limited time based on difficulty</li>
        <li className="time-attack-feature">Correct answers add time</li>
        <li className="time-attack-feature">Incorrect answers subtract time</li>
        <li className="time-attack-feature">Score based on speed and accuracy</li>
      </ul>
    </div>
  );
}

export default TimeAttackCard; 