import React from 'react';
import '../../styles/games/GameModeCards.css';

/**
 * A component to display game statistics
 * 
 * @param {Object} props Component props
 * @param {Object} props.stats The statistics to display
 * @param {number} props.stats.bestScore The user's best score
 * @param {number} props.stats.bestStreak The user's best streak
 * @param {number} props.stats.gamesPlayed The number of games played
 * @param {number} props.stats.totalAttempts Total number of attempts
 * @param {number} props.stats.correctAnswers Number of correct answers
 * @returns {JSX.Element} A stats bar component
 */
function StatsBar({ stats }) {
  const { bestScore, bestStreak, gamesPlayed, totalAttempts, correctAnswers } = stats;
  
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{bestScore}</span>
        <span className="stat-label">Best Score</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{bestStreak}</span>
        <span className="stat-label">Best Streak</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{gamesPlayed}</span>
        <span className="stat-label">Games Played</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">
          {totalAttempts === 0 
            ? '0%' 
            : `${Math.floor((correctAnswers / totalAttempts) * 100)}%`}
        </span>
        <span className="stat-label">Accuracy</span>
      </div>
    </div>
  );
}

export default StatsBar; 