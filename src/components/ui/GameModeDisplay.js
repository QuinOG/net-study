import React from 'react';
import { FiClock, FiTarget } from 'react-icons/fi';
import '../../styles/ui/GameModeDisplay.css';

const GameModeDisplay = ({ gameMode, difficulty, difficultyLevels }) => {
  return (
    <div className="game-mode-display">
      <div className="mode-indicator">
        {gameMode === 'TIME_ATTACK' ? (
          <><FiClock size={18} /> Time Attack</>
        ) : (
          <><FiTarget size={18} /> Practice Mode</>
        )}
        <span className="difficulty-badge">{difficultyLevels[difficulty].name}</span>
      </div>
    </div>
  );
};

export default GameModeDisplay; 