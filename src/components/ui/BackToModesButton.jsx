import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import '../../styles/ui/DifficultySelectScreen.css';

/**
 * Back to game modes button component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onClick Function to call when the button is clicked
 * @returns {JSX.Element} A back to game modes button
 */
function BackToModesButton({ onClick }) {
  return (
    <button className="back-to-modes-button" onClick={onClick}>
      <FiArrowLeft />
      Back to Game Modes
    </button>
  );
}

export default BackToModesButton; 