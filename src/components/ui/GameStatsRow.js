import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiStar, FiZap, FiActivity, FiClock, FiTrendingUp, FiInfo, FiAward } from 'react-icons/fi';
import '../../styles/ui/GameStatsRow.css';

/**
 * A premium component that displays game statistics in a row with animations
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
 * @param {boolean} props.scoreAnimation Whether to animate the score
 * @param {boolean} props.streakAnimation Whether to animate the streak
 * @returns {JSX.Element} A game stats row component
 */
const GameStatsRow = React.memo(({ 
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
}) => {
  // For animated counter effects
  const [displayScore, setDisplayScore] = useState(score);
  const [displayStreak, setDisplayStreak] = useState(streak);
  const previousScoreRef = useRef(score);
  const previousStreakRef = useRef(streak);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [reachedMilestones, setReachedMilestones] = useState([]);
  const statsRowRef = useRef(null);
  
  // For tracking score trends
  const [scoreIncreased, setScoreIncreased] = useState(false);
  const [streakIncreased, setStreakIncreased] = useState(false);
  
  // For parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseMoveTimeoutRef = useRef(null);
  
  // Memoized milestone calculations
  const nextMilestone = useMemo(() => {
    if (streak < 5) return 5;
    if (streak < 10) return 10;
    if (streak < 15) return 15;
    if (streak < 25) return 25;
    if (streak < 50) return 50;
    return 100;
  }, [streak]);

  // Animate score counter when score changes
  useEffect(() => {
    // Skip animation on initial render
    if (previousScoreRef.current !== score) {
      // Set score trend indicator
      setScoreIncreased(score > previousScoreRef.current);
      
      // Animate the score counter if the difference is substantial
      if (Math.abs(score - previousScoreRef.current) > 300) {
        let start = previousScoreRef.current;
        const end = score;
        const duration = 500; // ms
        const step = Math.max(1, Math.floor(Math.abs(end - start) / (duration / 16)));
        const timer = setInterval(() => {
          if ((end > start && start + step >= end) || (end < start && start - step <= end)) {
            // Final step - set exact value
            setDisplayScore(end);
            clearInterval(timer);
          } else {
            // Increment/decrement by step
            start = end > start ? start + step : start - step;
            setDisplayScore(start);
          }
        }, 16); // ~60fps
        
        return () => clearInterval(timer);
      } else {
        // Small change, just update directly
        setDisplayScore(score);
      }
      
      previousScoreRef.current = score;
    }
  }, [score]);
  
  // Animate streak counter when streak changes
  useEffect(() => {
    // Skip animation on initial render
    if (previousStreakRef.current !== streak) {
      // Check for milestone achievements
      const milestones = [5, 10, 15, 25, 50, 100];
      milestones.forEach(milestone => {
        if (streak >= milestone && previousStreakRef.current < milestone) {
          // We've hit a new milestone
          setReachedMilestones(prev => [...prev, milestone]);
          // Play milestone sound (would need to be implemented)
          setTimeout(() => {
            setReachedMilestones(prev => prev.filter(m => m !== milestone));
          }, 3000);
        }
      });
      
      // Set streak trend indicator
      setStreakIncreased(streak > previousStreakRef.current);
      
      // Update the display value
      setDisplayStreak(streak);
      previousStreakRef.current = streak;
      
      // Reset trend indicator after 2 seconds
      const timer = setTimeout(() => {
        setStreakIncreased(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [streak]);
  
  // Helper function to handle tooltip display
  const handleTooltipToggle = useCallback((tooltipName) => {
    setActiveTooltip(activeTooltip === tooltipName ? null : tooltipName);
  }, [activeTooltip]);
  
  // Helper function for time formatting
  const formatTime = useCallback((seconds) => {
    if (seconds < 10) return `${seconds}s`;
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);
  
  // Handle mouse move for parallax effect
  const handleMouseMove = useCallback((e) => {
    if (!statsRowRef.current) return;
    
    const rect = statsRowRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
    
    // Clear any existing timeout
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
    
    // Reset mouse position after 2 seconds of no movement
    mouseMoveTimeoutRef.current = setTimeout(() => {
      setMousePosition({ x: 0.5, y: 0.5 });
    }, 2000);
  }, []);
  
  // Set up and clean up mouse move event listener
  useEffect(() => {
    const statsRow = statsRowRef.current;
    if (statsRow) {
      statsRow.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        statsRow.removeEventListener('mousemove', handleMouseMove);
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }
      };
    }
  }, [handleMouseMove]);
  
  // Calculate timer circle progress
  const timerProgress = useMemo(() => {
    if (!isTimeAttack) return 0;
    
    // Assume 60 seconds is the base time limit
    const baseTime = 60;
    const percentage = (timeRemaining / baseTime) * 100;
    // Ensure the value is between 0 and 100
    return Math.max(0, Math.min(100, percentage));
  }, [isTimeAttack, timeRemaining]);
  
  // Dynamic classNames for card parallax
  const getCardStyle = (index) => {
    if (!mousePosition) return {};
    
    // Calculate offset based on card position and mouse movement
    const offsetX = (mousePosition.x - 0.5) * 10;
    const offsetY = (mousePosition.y - 0.5) * 10;
    
    // Each card moves slightly differently for a layered effect
    const factor = 1 - (index * 0.15);
    
    return {
      transform: `perspective(1000px) rotateX(${offsetY * factor}deg) rotateY(${-offsetX * factor}deg) translateZ(${index * 5}px)`
    };
  };

  return (
    <div 
      className="game-stats-row" 
      role="region" 
      aria-label="Game Statistics"
      ref={statsRowRef}
    >
      <div className="stat-cards-container">
        <div 
          className={`stat-card score-display ${scoreAnimation ? 'score-bump' : ''} ${scoreIncreased ? 'increased' : ''}`}
          onMouseEnter={() => handleTooltipToggle('score')}
          onMouseLeave={() => handleTooltipToggle(null)}
          tabIndex={0}
          aria-label={`Score: ${score}`}
          style={getCardStyle(0)}
        >
          <div className="stat-icon">
            <FiStar className="icon" aria-hidden="true" />
            {scoreIncreased && <FiTrendingUp className="trend-up" aria-hidden="true" />}
          </div>
          <div className="stat-content">
            <div className="stat-label">Score</div>
            <div className="stat-value" aria-live="polite">{displayScore.toLocaleString()}</div>
          </div>
          {showXpPreview && (
            <div className="xp-preview" aria-live="polite">+{xpEarnedPreview} XP</div>
          )}
          {showSpeedBonus && (
            <div className="speed-bonus" aria-live="polite">+{speedBonus} <span>SPEED</span></div>
          )}
          {activeTooltip === 'score' && (
            <div className="stat-tooltip" role="tooltip">
              <div className="tooltip-title">Score Information</div>
              <div className="tooltip-row">
                <span>Potential XP:</span> 
                <span>{Math.max(10, Math.floor(score / 10))} XP</span>
              </div>
              <div className="tooltip-hint">Earn more points by maintaining combos!</div>
            </div>
          )}
        </div>
        
        <div 
          className={`stat-card streak-display ${streakAnimation ? 'streak-bump' : ''} ${streakIncreased ? 'increased' : ''}`}
          onMouseEnter={() => handleTooltipToggle('streak')}
          onMouseLeave={() => handleTooltipToggle(null)}
          tabIndex={0}
          aria-label={`Current streak: ${streak}`}
          style={getCardStyle(1)}
        >
          <div className="stat-icon">
            <FiZap className="icon" aria-hidden="true" />
            {streakIncreased && <FiTrendingUp className="trend-up" aria-hidden="true" />}
          </div>
          <div className="stat-content">
            <div className="stat-label">Streak</div>
            <div className="stat-value" aria-live="polite">{displayStreak}</div>
            {streak > 0 && (
              <div className="progress-to-milestone">
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(streak / nextMilestone) * 100}%` }}
                    aria-hidden="true"
                  ></div>
                </div>
                <div className="next-milestone-text">{nextMilestone}</div>
              </div>
            )}
          </div>
          {reachedMilestones.includes(streak) && (
            <div className="milestone-badge" aria-live="polite">
              <FiAward className="milestone-icon" />
              <span>Milestone!</span>
            </div>
          )}
          {activeTooltip === 'streak' && (
            <div className="stat-tooltip" role="tooltip">
              <div className="tooltip-title">Streak Information</div>
              <div className="tooltip-row">
                <span>Current Streak:</span> 
                <span>{streak} correct answers</span>
              </div>
              <div className="tooltip-row">
                <span>Next Milestone:</span>
                <span>{nextMilestone}</span>
              </div>
              <div className="tooltip-hint">Reach streak milestones for bonus rewards!</div>
            </div>
          )}
        </div>
        
        <div 
          className={`stat-card combo-display ${combo >= 9 ? 'high-combo' : combo >= 6 ? 'medium-high-combo' : combo >= 3 ? 'medium-combo' : ''}`}
          onMouseEnter={() => handleTooltipToggle('combo')}
          onMouseLeave={() => handleTooltipToggle(null)}
          tabIndex={0}
          aria-label={`Combo: ${combo}x`}
          style={getCardStyle(2)}
        >
          <div className="stat-icon">
            <FiZap className="icon" aria-hidden="true" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Combo</div>
            <div className="stat-value">
              <span className="combo-value" aria-live="polite">{combo}</span><span className="combo-x">x</span>
            </div>
          </div>
          {activeTooltip === 'combo' && (
            <div className="stat-tooltip" role="tooltip">
              <div className="tooltip-title">Combo Information</div>
              <div className="tooltip-hint">
                {combo < 3 
                  ? "Get 3 correct answers in a row for 1.5x points!" 
                  : combo < 6 
                    ? "Keep going! Get to 6 for 2x points!" 
                    : combo < 9 
                      ? "Almost there! Reach 9 for 2.5x points!" 
                      : "Maximum combo! 2.5x points on all answers!"}
              </div>
              <div className="tooltip-tiers">
                <div className={`tier ${combo >= 3 ? 'active' : ''}`}>3x = 1.5x points</div>
                <div className={`tier ${combo >= 6 ? 'active' : ''}`}>6x = 2x points</div>
                <div className={`tier ${combo >= 9 ? 'active' : ''}`}>9x = 2.5x points</div>
              </div>
            </div>
          )}
          <div className="combo-particles-container">
            {Array.from({ length: combo > 0 ? Math.min(combo, 10) : 0 }).map((_, i) => (
              <div 
                key={i} 
                className="combo-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div 
          className={`stat-card multiplier-display ${comboMultiplier > 1.5 ? 'high-multiplier' : comboMultiplier > 1 ? 'medium-multiplier' : ''}`}
          onMouseEnter={() => handleTooltipToggle('multiplier')}
          onMouseLeave={() => handleTooltipToggle(null)}
          tabIndex={0}
          aria-label={`Point multiplier: ${comboMultiplier}x`}
          style={getCardStyle(3)}
        >
          <div className="stat-icon">
            <FiActivity className="icon" aria-hidden="true" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Multiplier</div>
            <div className="stat-value" aria-live="polite">{comboMultiplier.toFixed(1)}x</div>
          </div>
          {activeTooltip === 'multiplier' && (
            <div className="stat-tooltip" role="tooltip">
              <div className="tooltip-title">Multiplier Information</div>
              <div className="tooltip-row">
                <span>Base:</span> 
                <span>1.0x</span>
              </div>
              <div className="tooltip-row">
                <span>Combo Bonus:</span>
                <span>+{(comboMultiplier - 1).toFixed(1)}x</span>
              </div>
              <div className="tooltip-hint">Higher combos = higher multipliers!</div>
            </div>
          )}
        </div>
        
        {isTimeAttack && (
          <div 
            className={`stat-card time-display ${timeRemaining < 10 ? 'urgent' : timeRemaining < 20 ? 'warning' : ''}`}
            onMouseEnter={() => handleTooltipToggle('time')}
            onMouseLeave={() => handleTooltipToggle(null)}
            tabIndex={0}
            aria-label={`Time remaining: ${timeRemaining} seconds`}
            style={getCardStyle(4)}
          >
            <div className="stat-icon">
              <FiClock className="icon" aria-hidden="true" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Time</div>
              <div className="stat-value" aria-live="polite">{formatTime(timeRemaining)}</div>
            </div>
            <svg className="timer-circle" viewBox="0 0 36 36">
              <path className="timer-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeWidth="2"
                fill="none"
              />
              <path className="timer-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeWidth="2"
                fill="none"
                style={{ strokeDashoffset: 100 - timerProgress }}
              />
            </svg>
            {activeTooltip === 'time' && (
              <div className="stat-tooltip" role="tooltip">
                <div className="tooltip-title">Time Information</div>
                <div className="tooltip-row">
                  <span>Time Left:</span> 
                  <span>{timeRemaining}s</span>
                </div>
                <div className="tooltip-hint">Correct answers add bonus time!</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <button 
        className="stats-info-button"
        onClick={() => handleTooltipToggle('help')}
        aria-label="Game statistics help"
        aria-expanded={activeTooltip === 'help'}
      >
        <FiInfo className="info-icon" aria-hidden="true" />
        <span className="visually-hidden">Game statistics information</span>
      </button>
      
      {activeTooltip === 'help' && (
        <div className="help-tooltip" role="tooltip">
          <div className="tooltip-title">Game Statistics</div>
          <ul>
            <li><strong>Score:</strong> Your current points</li>
            <li><strong>Streak:</strong> Consecutive correct answers</li>
            <li><strong>Combo:</strong> Combo level for bonus points</li>
            <li><strong>Multiplier:</strong> Point multiplier based on combo</li>
            {isTimeAttack && <li><strong>Time:</strong> Time remaining in seconds</li>}
          </ul>
          <div className="tooltip-hint">Hover or tap each stat for more details</div>
        </div>
      )}
    </div>
  );
});

// Add display name for React DevTools
GameStatsRow.displayName = 'GameStatsRow';

export default GameStatsRow; 