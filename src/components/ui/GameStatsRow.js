import React from 'react';
import { FiStar, FiZap, FiActivity, FiClock } from 'react-icons/fi';
import '../../styles/ui/GameStatsRow.css';

/**
 * A component that displays game statistics in a row
 * 
 * @param {Object} props Component props
 * @param {number} props.score Current game score
 * @param {number} props.streak Current streak count
 * @param {number} props.combo Current combo count
 * @param {number} props.comboMultiplier Current combo multiplier
 * @param {number} props.timeRemaining Time remaining (for time attack mode)
 * @param {boolean} props.showXpPreview Whether to show XP preview
 * @param {number} props.xpEarnedPreview Amount of XP to preview
 * @param {boolean} props.showSpeedBonus Whether to show speed bonus
 * @param {number} props.speedBonus Amount of speed bonus
 * @param {boolean} props.isTimeAttack Whether the game is in time attack mode
 * @returns {JSX.Element} A game stats row component
 */
function GameStatsRow({ 
  score,
  streak,
  combo,
  comboMultiplier,
  timeRemaining,
  showXpPreview,
  xpEarnedPreview,
  showSpeedBonus,
  speedBonus,
  isTimeAttack,
  scoreAnimation,
  streakAnimation
}) {
  return (
    <div className="game-stats-row">
      <div className={`score-display ${scoreAnimation ? 'score-bump' : ''}`}>
        <FiStar size={16} /> Score: <span>{score}</span>
        {showXpPreview && (
          <div className="xp-preview">+{xpEarnedPreview} XP potential</div>
        )}
        {showSpeedBonus && (
          <div className="speed-bonus">+{speedBonus} SPEED BONUS!</div>
        )}
      </div>
      
      <div className={`streak-display ${streakAnimation ? 'streak-bump' : ''}`}>
        <FiZap size={16} /> Streak: <span>{streak}</span>
      </div>
      
      <div className="combo-display">
        <FiZap size={16} /> Combo: <span className={combo >= 6 ? 'high-combo' : combo >= 3 ? 'medium-combo' : ''}>{combo}x</span>
      </div>
      
      <div className="multiplier-display">
        <FiActivity size={16} /> Multiplier: <span className={comboMultiplier > 1.5 ? 'high-multiplier' : comboMultiplier > 1 ? 'medium-multiplier' : ''}>{comboMultiplier}x</span>
      </div>
      
      {isTimeAttack && (
        <div className={`time-display ${timeRemaining < 10 ? 'urgent' : ''}`}>
          <FiClock size={16} /> Time: <span>{timeRemaining}s</span>
        </div>
      )}
    </div>
  );
}

export default GameStatsRow; 