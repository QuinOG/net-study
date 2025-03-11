import React from 'react';
import '../../styles/games/GameModeCards.css';

/**
 * A reusable card component for displaying game modes
 * 
 * @param {Object} props Component props
 * @param {string} props.title The title of the game mode
 * @param {string} props.description A brief description of the game mode
 * @param {ReactNode} props.icon An icon element to display
 * @param {Function} props.onClick Function to call when the card is clicked
 * @param {ReactNode} props.children Optional child elements to render inside the card
 * @returns {JSX.Element} A game mode card component
 */
function GameModeCard({ title, description, icon, onClick, children }) {
  return (
    <div className="game-mode-card" onClick={onClick}>
      <div className="icon">
        {icon}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      {children}
    </div>
  );
}

export default GameModeCard; 