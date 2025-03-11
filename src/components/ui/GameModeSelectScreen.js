import React from 'react';
import TimeAttackCard from './TimeAttackCard';
import PracticeModeCard from './PracticeModeCard';
import StatsBar from './StatsBar';
import DashboardButton from './DashboardButton';
import '../../styles/ui/GameModeSelectScreen.css';

/**
 * A screen component for selecting game modes
 * 
 * @param {Object} props Component props
 * @param {Object} props.gameStats The game statistics to display
 * @param {Function} props.onTimeAttackSelect Function to call when Time Attack mode is selected
 * @param {Function} props.onPracticeModeSelect Function to call when Practice mode is selected
 * @returns {JSX.Element} A game mode selection screen
 */
function GameModeSelectScreen({ 
  gameStats, 
  onTimeAttackSelect, 
  onPracticeModeSelect 
}) {
  return (
    <div className="game-mode-select-screen">
      <StatsBar stats={gameStats} />
      
      <div className="game-setup">
        <h3 className="mode-selection-title">Select Game Mode</h3>
        <div className="game-modes">
          <TimeAttackCard onClick={onTimeAttackSelect} />
          <PracticeModeCard onClick={onPracticeModeSelect} />
        </div>
      </div>
      
      <DashboardButton />
    </div>
  );
}

export default GameModeSelectScreen; 