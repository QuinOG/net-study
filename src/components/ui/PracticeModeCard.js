import React from 'react';
import { FiTarget } from 'react-icons/fi';
import '../../styles/ui/PracticeModeCard.css';

/**
 * Practice Mode game mode card component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the card is clicked
 * @returns {JSX.Element} A Practice Mode game mode card
 */
function PracticeModeCard({ onClick }) {
  return (
    <div className="practice-mode-card" onClick={onClick}>
      <div className="practice-mode-icon-container">
        <FiTarget />
      </div>
      <h3 className="practice-mode-title">Practice Mode</h3>
      <p className="practice-mode-description">
        Learn at your own pace without time pressure
      </p>
      <ul className="practice-mode-features">
        <li className="practice-mode-feature">No time limit</li>
        <li className="practice-mode-feature">Hints available</li>
        <li className="practice-mode-feature">Detailed explanations</li>
        <li className="practice-mode-feature">Great for beginners</li>
      </ul>
    </div>
  );
}

export default PracticeModeCard; 