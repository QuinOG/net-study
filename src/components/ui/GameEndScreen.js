import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiAward, FiCheck, FiTrendingUp, FiTarget } from 'react-icons/fi';
import '../../styles/games/GameEndScreen.css';

/**
 * Standardized Game End Screen component
 * @param {Object} props
 * @param {string} props.gameTitle - Title of the game
 * @param {number} props.score - Final score
 * @param {number} props.bestScore - Best score achieved
 * @param {number} props.xpEarned - XP earned from this game session
 * @param {number} props.correctAnswers - Number of correct answers
 * @param {number} props.totalAttempts - Total number of attempts
 * @param {number} props.bestStreak - Best streak achieved
 * @param {boolean} props.isNewHighScore - Whether this is a new high score
 * @param {Function} props.onPlayAgain - Callback for Play Again button
 * @param {Function} props.onBackToMenu - Callback for Back to Menu button
 * @param {Array} props.topicsProgress - Array of topics with progress percentages
 */
const GameEndScreen = ({
  gameTitle,
  score,
  bestScore,
  xpEarned,
  correctAnswers,
  totalAttempts,
  bestStreak,
  isNewHighScore,
  onPlayAgain,
  onBackToMenu,
  topicsProgress = []
}) => {
  const navigate = useNavigate();
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
  
  return (
    <div className="game-end-screen">
      <div className="game-end-header">
        <h2 className={isNewHighScore ? 'new-high-score' : ''}>
          {isNewHighScore ? '🏆 New High Score! 🏆' : 'Game Over'}
        </h2>
        <h3 className="game-title">{gameTitle}</h3>
      </div>
      
      <div className="game-end-stats">
        <div className="stat-row primary">
          <div className="stat-item score">
            <FiBarChart2 className="stat-icon" />
            <span className="stat-label">Final Score</span>
            <span className={`stat-value ${isNewHighScore ? 'highlight' : ''}`}>{score}</span>
          </div>
          <div className="stat-item">
            <FiTrendingUp className="stat-icon" />
            <span className="stat-label">XP Earned</span>
            <span className="stat-value highlight-xp">+{xpEarned}</span>
          </div>
        </div>
        
        <div className="stat-row secondary">
          <div className="stat-item">
            <FiCheck className="stat-icon" />
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value">{correctAnswers}</span>
          </div>
          <div className="stat-item">
            <FiTarget className="stat-icon" />
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <FiAward className="stat-icon" />
            <span className="stat-label">Best Streak</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
      </div>
      
      {/* Learning Progress Tracking */}
      {topicsProgress.length > 0 && (
        <div className="learning-progress">
          <h4>Topics Progress</h4>
          <div className="topics-grid">
            {topicsProgress.map((topic, index) => (
              <div key={index} className="topic-progress">
                <div className="topic-label">{topic.name}</div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${topic.progress}%` }}
                  ></div>
                </div>
                <div className="progress-percentage">{topic.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="next-goals">
        <h4>Next Goals</h4>
        <ul className="goals-list">
          {score < bestScore && (
            <li>Beat your high score of {bestScore} points</li>
          )}
          {accuracy < 90 && (
            <li>Achieve 90% accuracy (currently {accuracy}%)</li>
          )}
          {topicsProgress.some(topic => topic.progress < 100) && (
            <li>Master all topics to 100%</li>
          )}
          <li>Earn more XP to level up</li>
        </ul>
      </div>
      
      <div className="game-end-buttons">
        <button 
          className="play-again-btn"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        <button 
          className="menu-btn"
          onClick={onBackToMenu}
        >
          Back to Menu
        </button>
        <button 
          className="dashboard-btn"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default GameEndScreen; 