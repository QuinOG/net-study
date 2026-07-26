import React, { useState, useEffect } from 'react';
import { FiAward, FiZap, FiActivity, FiTarget } from 'react-icons/fi';
import '../../styles/ui/StatsBar.css';

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
function StatsBar({ stats = {} }) {
  // Provide default values for all required stats
  const {
    bestScore = 0,
    bestStreak = 0,
    gamesPlayed = 0,
    totalAttempts = 0,
    correctAnswers = 0
  } = stats;

  const [animatedStats, setAnimatedStats] = useState({
    bestScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    accuracy: 0
  });
  
  // Calculate accuracy
  const accuracy = totalAttempts === 0 ? 0 : Math.floor((correctAnswers / totalAttempts) * 100);
  
  useEffect(() => {
    // Start with current animated values
    const startValues = { ...animatedStats };
    
    // Target values
    const targetValues = {
      bestScore,
      bestStreak,
      gamesPlayed,
      accuracy
    };
    
    // Animation duration in ms
    const duration = 1000;
    const startTime = Date.now();
    
    const animateStats = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedStats({
          bestScore: Math.floor(startValues.bestScore + (targetValues.bestScore - startValues.bestScore) * easeProgress),
          bestStreak: Math.floor(startValues.bestStreak + (targetValues.bestStreak - startValues.bestStreak) * easeProgress),
          gamesPlayed: Math.floor(startValues.gamesPlayed + (targetValues.gamesPlayed - startValues.gamesPlayed) * easeProgress),
          accuracy: Math.floor(startValues.accuracy + (targetValues.accuracy - startValues.accuracy) * easeProgress)
        });
        
        requestAnimationFrame(animateStats);
      } else {
        setAnimatedStats(targetValues);
      }
    };
    
    requestAnimationFrame(animateStats);
    
  }, [bestScore, bestStreak, gamesPlayed, totalAttempts, correctAnswers]);
  
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-icon">
          <FiAward />
        </div>
        <span className="stat-value">{animatedStats.bestScore}</span>
        <span className="stat-label">Best Score</span>
      </div>
      <div className="stat-item">
        <div className="stat-icon">
          <FiZap />
        </div>
        <span className="stat-value">{animatedStats.bestStreak}</span>
        <span className="stat-label">Best Streak</span>
      </div>
      <div className="stat-item">
        <div className="stat-icon">
          <FiActivity />
        </div>
        <span className="stat-value">{animatedStats.gamesPlayed}</span>
        <span className="stat-label">Games Played</span>
      </div>
      <div className="stat-item">
        <div className="stat-icon">
          <FiTarget />
        </div>
        <span className="stat-value">{animatedStats.accuracy}%</span>
        <span className="stat-label">Accuracy</span>
      </div>
    </div>
  );
}

export default StatsBar; 
