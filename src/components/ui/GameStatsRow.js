import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiStar, FiZap, FiActivity, FiClock, FiTrendingUp, FiInfo, FiAward } from 'react-icons/fi';
import '../../styles/ui/GameStatsRow.css';

const GameStatsRow = React.memo(({
  score,
  streak,
  multiplier,
  timeRemaining,
  showXpPreview,
  xpEarnedPreview,
  showSpeedBonus,
  speedBonus,
  isTimeAttack,
  scoreAnimation,
  streakAnimation
}) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [displayStreak, setDisplayStreak] = useState(streak);
  const previousScoreRef = useRef(score);
  const previousStreakRef = useRef(streak);
  const [reachedMilestones, setReachedMilestones] = useState([]);
  const statsRowRef = useRef(null);
  
  const [scoreIncreased, setScoreIncreased] = useState(false);
  const [streakIncreased, setStreakIncreased] = useState(false);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseMoveTimeoutRef = useRef(null);
  
  const nextMilestone = useMemo(() => {
    if (streak < 5) return 5;
    if (streak < 10) return 10;
    if (streak < 15) return 15;
    if (streak < 25) return 25;
    if (streak < 50) return 50;
    return 100;
  }, [streak]);

  useEffect(() => {
    if (previousScoreRef.current !== score) {
      setScoreIncreased(score > previousScoreRef.current);
      if (Math.abs(score - previousScoreRef.current) > 300) {
        let start = previousScoreRef.current;
        const end = score;
        const duration = 500;
        const step = Math.max(1, Math.floor(Math.abs(end - start) / (duration / 16)));
        const timer = setInterval(() => {
          if ((end > start && start + step >= end) || (end < start && start - step <= end)) {
            setDisplayScore(end);
            clearInterval(timer);
          } else {
            start = end > start ? start + step : start - step;
            setDisplayScore(start);
          }
        }, 16);
        return () => clearInterval(timer);
      } else {
        setDisplayScore(score);
      }
      previousScoreRef.current = score;
    }
  }, [score]);
  
  useEffect(() => {
    if (previousStreakRef.current !== streak) {
      const milestones = [5, 10, 15, 25, 50, 100];
      milestones.forEach(milestone => {
        if (streak >= milestone && previousStreakRef.current < milestone) {
          setReachedMilestones(prev => [...prev, milestone]);
          setTimeout(() => setReachedMilestones(prev => prev.filter(m => m !== milestone)), 3000);
        }
      });
      setStreakIncreased(streak > previousStreakRef.current);
      setDisplayStreak(streak);
      previousStreakRef.current = streak;
      const timer = setTimeout(() => setStreakIncreased(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak]);
  
  const formatTime = useCallback((seconds) => {
    if (seconds < 10) return `${seconds}s`;
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (!statsRowRef.current) return;
    const rect = statsRowRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
    if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
    mouseMoveTimeoutRef.current = setTimeout(() => setMousePosition({ x: 0.5, y: 0.5 }), 2000);
  }, []);

  useEffect(() => {
    const statsRow = statsRowRef.current;
    if (statsRow) {
      statsRow.addEventListener('mousemove', handleMouseMove);
      return () => {
        statsRow.removeEventListener('mousemove', handleMouseMove);
        if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
      };
    }
  }, [handleMouseMove]);
  
  const timerProgress = useMemo(() => {
    if (!isTimeAttack) return 0;
    const baseTime = 60;
    return Math.max(0, Math.min(100, (timeRemaining / baseTime) * 100));
  }, [isTimeAttack, timeRemaining]);
  
  const getCardStyle = (index) => {
    if (!mousePosition) return {};
    const offsetX = (mousePosition.x - 0.5) * 10;
    const offsetY = (mousePosition.y - 0.5) * 10;
    const factor = 1 - (index * 0.15);
    return {
      transform: `perspective(1000px) rotateX(${offsetY * factor}deg) rotateY(${-offsetX * factor}deg) translateZ(${index * 5}px)`
    };
  };

  return (
    <div className="game-stats-row" role="region" aria-label="Game Statistics" ref={statsRowRef}>
      <div className="stat-cards-container">
        <div 
          className={`stat-card score-display ${scoreAnimation ? 'score-bump' : ''} ${scoreIncreased ? 'increased' : ''}`}
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
        </div>
        
        <div 
          className={`stat-card streak-display ${streakAnimation ? 'streak-bump' : ''} ${streakIncreased ? 'increased' : ''}`}
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
        </div>
        
        <div 
          className={`stat-card multiplier-display ${multiplier > 1.5 ? 'high-multiplier' : multiplier > 1 ? 'medium-multiplier' : ''}`}
          tabIndex={0}
          aria-label={`Point multiplier: ${multiplier}x`}
          style={getCardStyle(2)}
        >
          <div className="stat-icon">
            <FiActivity className="icon" aria-hidden="true" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Multiplier</div>
            <div className="stat-value" aria-live="polite">{multiplier.toFixed(1)}x</div>
          </div>
        </div>
        
        {isTimeAttack && (
          <div 
            className={`stat-card time-display ${timeRemaining < 10 ? 'urgent' : timeRemaining < 20 ? 'warning' : ''}`}
            tabIndex={0}
            aria-label={`Time remaining: ${timeRemaining} seconds`}
            style={getCardStyle(3)}
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
          </div>
        )}
      </div>
    </div>
  );
});

GameStatsRow.displayName = 'GameStatsRow';

export default GameStatsRow;