import React from 'react';
import { FiAward } from 'react-icons/fi';
import '../../styles/ui/CollectXpButton.css';

/**
 * A button component for ending game and collecting XP
 * 
 * @param {Object} props Component props
 * @param {string} props.className Additional CSS classes
 * @param {Function} props.onClick Function to call when button is clicked
 * @returns {JSX.Element} A end game and collect XP button component
 */
function CollectXpButton({ className = '', onClick }) {
  return (
    <button 
      className={`${className}`}
      onClick={onClick}
      type="button"
    >
      <FiAward size={18} /> End Game & Collect XP
    </button>
  );
}

export default CollectXpButton; 