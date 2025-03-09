import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import '../../styles/games/SubnettingChallenge.css';
import '../../styles/games/GameModeCards.css';

// Game modes
const GAME_MODES = {
  TIME_ATTACK: 'TIME_ATTACK',
  PRACTICE: 'PRACTICE'
};

// Difficulty levels with settings
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Easy',
    timeLimit: 120,
    timePenalty: 10,
    multiplier: 1,
    prefixRange: [20, 24], // Easier CIDR prefixes
    showHints: true
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 90,
    timePenalty: 15,
    multiplier: 1.5,
    prefixRange: [16, 28], // More varied CIDR prefixes
    showHints: false
  },
  HARD: {
    name: 'Hard',
    timeLimit: 60,
    timePenalty: 20,
    multiplier: 2,
    prefixRange: [8, 30], // Full range of CIDR prefixes
    showHints: false
  }
};

function SubnettingChallenge() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats } = useContext(UserContext);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Challenge state
  const [ip, setIp] = useState('');
  const [prefix, setPrefix] = useState(24);
  const [networkAnswer, setNetworkAnswer] = useState('');
  const [broadcastAnswer, setBroadcastAnswer] = useState('');
  const [firstUsableAnswer, setFirstUsableAnswer] = useState('');
  const [lastUsableAnswer, setLastUsableAnswer] = useState('');
  const [submitCooldown, setSubmitCooldown] = useState(false); // Cooldown state to prevent answer spamming
  
  // Performance tracking
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  
  // Power-ups
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    showFirst: 2, // Show the first answer (network address)
    skipQuestion: 1
  });
  
  // Game stats
  const [gameStats, setGameStats] = useState(() => {
    const savedStats = localStorage.getItem('subnettingGameStats');
    return savedStats ? JSON.parse(savedStats) : {
      bestScore: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      totalAttempts: 0,
      correctAnswers: 0
    };
  });

  // Helper functions to convert IP to/from integer
  const ipToInt = (ip) => {
    if (!ip) return 0;
    const parts = ip.split('.').map(Number);
    return (((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0)) >>> 0;
  };

  const intToIp = (num) => {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  };

  // Given an IP and prefix, compute the network address
  const getNetworkAddress = (ip, prefix) => {
    const ipInt = ipToInt(ip);
    const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
    const networkInt = ipInt & mask;
    return intToIp(networkInt);
  };

  // Compute the broadcast address
  const getBroadcastAddress = (ip, prefix) => {
    const ipInt = ipToInt(ip);
    const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
    const networkInt = ipInt & mask;
    const broadcastInt = networkInt | ((1 << (32 - prefix)) - 1);
    return intToIp(broadcastInt);
  };

  // Compute the first usable IP address
  const getFirstUsable = (ip, prefix) => {
    const network = ipToInt(getNetworkAddress(ip, prefix));
    return intToIp(network + 1);
  };

  // Compute the last usable IP address
  const getLastUsable = (ip, prefix) => {
    const broadcast = ipToInt(getBroadcastAddress(ip, prefix));
    return intToIp(broadcast - 1);
  };

  // Generate a new challenge based on difficulty
  const generateChallenge = () => {
    // Clear previous answers
    setNetworkAnswer('');
    setBroadcastAnswer('');
    setFirstUsableAnswer('');
    setLastUsableAnswer('');
    
    // Clear feedback
    setFeedback({ show: false, isCorrect: false, message: '' });
    
    // Get prefix range based on difficulty
    const prefixRange = DIFFICULTY_LEVELS[difficulty].prefixRange;
    
    // Generate random IP and prefix
    let randomOctet1 = Math.floor(Math.random() * 223) + 1; // Valid Class A, B, C
    if (randomOctet1 === 127) randomOctet1 = 128; // Avoid loopback
    
    const randomOctet2 = Math.floor(Math.random() * 256);
    const randomOctet3 = Math.floor(Math.random() * 256);
    const randomOctet4 = Math.floor(Math.random() * 256);
    
    // Generate random prefix within difficulty range
    const randomPrefix = Math.floor(Math.random() * (prefixRange[1] - prefixRange[0] + 1)) + prefixRange[0];
    
    const randomIp = `${randomOctet1}.${randomOctet2}.${randomOctet3}.${randomOctet4}`;
    
    setIp(randomIp);
    setPrefix(randomPrefix);
    
    // Make sure cooldown is disabled after generating a new challenge
    setSubmitCooldown(false);
    
    // Play sound
    SoundManager.play('click');
  };

  // Initialize game with selected mode and difficulty
  const initializeGame = (mode, diff) => {
    scrollToTop();
    setGameMode(mode);
    setDifficulty(diff);
    setGameStarted(true);
    setShowGameOver(false);
    
    // Reset game state
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    
    // Reset power-ups
    setPowerUps({
      timeFreeze: 2,
      showFirst: 2,
      skipQuestion: 1
    });
    
    // Generate first challenge
    generateChallenge();
    
    // Play start sound
    SoundManager.play('gameStart');
  };

  // Handle power-up usage
  const handlePowerUp = (type) => {
    // No power-ups in practice mode or if all used
    if (gameMode === GAME_MODES.PRACTICE || powerUps[type] <= 0) return;
    
    // Update power-up count
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    
    SoundManager.play('powerup');
    
    // Apply power-up effect
    switch (type) {
      case 'timeFreeze':
        // Add time in time attack mode
        setTimeRemaining(prev => prev + 15);
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Time freeze activated! +15 seconds"
        });
        break;
      case 'showFirst':
        // Show the network address
        setNetworkAnswer(getNetworkAddress(ip, prefix));
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Network address revealed!"
        });
        break;
      case 'skipQuestion':
        // Generate a new question
        generateChallenge();
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Question skipped!"
        });
        break;
      default:
        break;
    }
    
    // Hide feedback after 1.5 seconds
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
    }, 1500);
  };

  // End the game and update stats
  const endGame = () => {
    // Update game stats
    const newStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + (score > 0 ? 1 : 0),
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    
    setGameStats(newStats);
    localStorage.setItem('subnettingGameStats', JSON.stringify(newStats));
    
    // Award XP based on score
    const xpEarned = Math.round(score / 10);
    if (xpEarned > 0) {
      addXP(xpEarned);
      
      // Update global stats if exists
      if (updateStats) {
        updateStats('subnettingGame', {
          gamesPlayed: newStats.gamesPlayed,
          bestScore: newStats.bestScore,
          totalCorrect: newStats.correctAnswers
        });
      }
    }
    
    // Show game over screen
    setShowGameOver(true);
    
    // Play game over sound
    SoundManager.play('gameOver');
  };

  // Timer effect for time attack mode
  useEffect(() => {
    let timerId;
    if (gameStarted && gameMode === GAME_MODES.TIME_ATTACK && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameStarted, gameMode, timeRemaining]);

  // Save game stats when they change
  useEffect(() => {
    localStorage.setItem('subnettingGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Set game context for proper volume adjustment
  useEffect(() => {
    // Set game context for volume balancing
    SoundManager.setGameContext('SubnettingChallenge');
    
    // Cleanup when component unmounts
    return () => {
      // Reset game context when unmounting
      SoundManager.setGameContext('default');
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If in cooldown, do nothing
    if (submitCooldown) return;
    
    // Set cooldown to prevent answer spamming
    setSubmitCooldown(true);
    
    // Calculate correct answers
    const correctNetwork = getNetworkAddress(ip, prefix);
    const correctBroadcast = getBroadcastAddress(ip, prefix);
    const correctFirstUsable = getFirstUsable(ip, prefix);
    const correctLastUsable = getLastUsable(ip, prefix);
    
    // Check user answers
    const networkCorrect = networkAnswer.trim() === correctNetwork;
    const broadcastCorrect = broadcastAnswer.trim() === correctBroadcast;
    const firstUsableCorrect = firstUsableAnswer.trim() === correctFirstUsable;
    const lastUsableCorrect = lastUsableAnswer.trim() === correctLastUsable;
    
    if (networkCorrect && broadcastCorrect && firstUsableCorrect && lastUsableCorrect) {
      // All answers correct
      
      // Update streak and score
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Calculate points based on difficulty
      const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
      const pointsEarned = Math.round(100 * difficultyMultiplier);
      
      setScore(prev => prev + pointsEarned);
      setCorrectAnswers(prev => prev + 1);
      
      // Add time for time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        setTimeRemaining(prev => prev + 10); // Add 10 seconds for correct answer
      }
      
      // Show feedback
      setFeedback({
        show: true,
        isCorrect: true,
        message: `Correct! +${pointsEarned} points`
      });
      
      // Play correct sound
      SoundManager.play('correct');
      
      // Generate new challenge after a delay to show feedback
      setTimeout(() => {
        generateChallenge(); // This will also reset the cooldown
      }, 1500);
    } else {
      // Some answers incorrect
      setCurrentStreak(0);
      
      // Apply time penalty in time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        // Calculate new time after penalty
        const newTime = Math.max(0, timeRemaining - DIFFICULTY_LEVELS[difficulty].timePenalty);
        setTimeRemaining(newTime);
        
        // If time is now zero, end the game immediately
        if (newTime <= 0) {
          // Show feedback briefly before ending game
          let feedback = "Incorrect answers:\n";
          if (!networkCorrect) feedback += `Network address should be ${correctNetwork}\n`;
          if (!broadcastCorrect) feedback += `Broadcast address should be ${correctBroadcast}\n`;
          if (!firstUsableCorrect) feedback += `First usable address should be ${correctFirstUsable}\n`;
          if (!lastUsableCorrect) feedback += `Last usable address should be ${correctLastUsable}\n`;
          
          setFeedback({
            show: true,
            isCorrect: false,
            message: feedback
          });
          SoundManager.play('wrong');
          
          // Short delay before ending game
          setTimeout(() => {
            endGame();
          }, 2000); // Reduced from 3000ms to 2000ms for shorter feedback time
          return;
        }
      }
      
      // Show detailed feedback
      let feedbackMsg = "Incorrect answers:\n";
      if (!networkCorrect) feedbackMsg += `Network address should be ${correctNetwork}\n`;
      if (!broadcastCorrect) feedbackMsg += `Broadcast address should be ${correctBroadcast}\n`;
      if (!firstUsableCorrect) feedbackMsg += `First usable address should be ${correctFirstUsable}\n`;
      if (!lastUsableCorrect) feedbackMsg += `Last usable address should be ${correctLastUsable}\n`;
      
      setFeedback({
        show: true,
        isCorrect: false,
        message: feedbackMsg
      });
      
      // Play wrong sound
      SoundManager.play('wrong');
      
      // Reset cooldown after feedback
      setTimeout(() => {
        setSubmitCooldown(false);
      }, 2000); // Reduced from 3000ms to 2000ms for shorter feedback time
    }
  };

  // Rendering the menu if the game has not started
  if (!gameStarted && !showGameOver) {
    if (showDifficultySelect) {
      return (
        <div className="subnetting-game">
          <h2 className="game-title">Select Difficulty</h2>
          <div className="difficulty-select">
            <div className="difficulty-cards">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <div
                  key={key}
                  className="difficulty-card"
                  data-difficulty={key}
                  onClick={() => {
                    initializeGame(GAME_MODES.TIME_ATTACK, key);
                    scrollToTop();
                  }}
                >
                  <h4>{value.name}</h4>
                  <ul>
                    <li>{value.timeLimit} second time limit</li>
                    <li>{value.multiplier}x score multiplier</li>
                    {key === 'EASY' ? (
                      <>
                        <li>Easier prefixes (/20-/24)</li>
                        {value.showHints && <li>Hints available</li>}
                        <li>{value.timePenalty} second penalty for wrong answers</li>
                      </>
                    ) : key === 'MEDIUM' ? (
                      <>
                        <li>Mixed prefixes (/16-/28)</li>
                        {value.showHints && <li>Hints available</li>}
                        <li>{value.timePenalty} second penalty for wrong answers</li>
                      </>
                    ) : (
                      <>
                        <li>All prefixes (/8-/30)</li>
                        {value.showHints && <li>Hints available</li>}
                        <li>{value.timePenalty} second penalty for wrong answers</li>
                      </>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="nav-buttons">
              <button 
                className="back-button"
                onClick={() => {
                  setShowDifficultySelect(false);
                  scrollToTop();
                }}
              >
                ← Back to Mode Selection
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="subnetting-game">
        <h2 className="game-title">Subnetting Challenge</h2>
        <p className="game-description">
          Test your subnetting skills by calculating network attributes from CIDR notation
        </p>
        
        <div className="stats-container">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{gameStats.bestScore}</span>
              <span className="stat-label">Best Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gameStats.bestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gameStats.gamesPlayed}</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {gameStats.totalAttempts === 0 
                  ? '0%' 
                  : `${Math.floor((gameStats.correctAnswers / gameStats.totalAttempts) * 100)}%`}
              </span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>
        
        <div className="game-setup">
          <h3>Select Game Mode</h3>
          <div className="game-modes">
            <div 
              className="game-mode-card"
              onClick={() => {
                setShowDifficultySelect(true);
                scrollToTop();
              }}
            >
              <h3>Time Attack</h3>
              <p>Race against the clock to solve as many subnetting problems as possible!</p>
              <ul>
                <li>Limited time based on difficulty</li>
                <li>Correct answers add time</li>
                <li>Incorrect answers subtract time</li>
                <li>Score based on difficulty</li>
              </ul>
            </div>
            <div 
              className="game-mode-card"
              onClick={() => {
                initializeGame(GAME_MODES.PRACTICE, 'EASY');
                scrollToTop();
              }}
            >
              <h3>Practice Mode</h3>
              <p>Learn at your own pace without time pressure</p>
              <ul>
                <li>No time limit</li>
                <li>Detailed feedback</li>
                <li>Hints available</li>
                <li>Great for beginners</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="nav-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    return (
      <div className="subnetting-game">
        <div className="game-over-stats">
          <h2>{isNewHighScore ? '🏆 New High Score! 🏆' : 'Game Over'}</h2>
          <div className="final-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className={`stat-value ${isNewHighScore ? 'highlight' : ''}`}>{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Networks</span>
              <span className="stat-value">{correctAnswers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{Math.max(currentStreak, gameStats.bestStreak)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">XP Earned</span>
              <span className="stat-value">{Math.round(score / 10)}</span>
            </div>
          </div>
          <div className="game-over-buttons">
            <button 
              className="restart-btn"
              onClick={() => initializeGame(gameMode, difficulty)}
            >
              Play Again
            </button>
            <button 
              className="home-btn"
              onClick={() => {
                setShowGameOver(false);
                setGameStarted(false);
                scrollToTop();
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="subnetting-game">
      <div className="game-header">
        <div className="game-info">
          <div className="mode-indicator">
            {gameMode === GAME_MODES.TIME_ATTACK ? 'Time Attack' : 'Practice Mode'}
            <span className="difficulty-badge">{DIFFICULTY_LEVELS[difficulty].name}</span>
          </div>
          
          <div className="score-display">
            Score: <span>{score}</span>
          </div>
          
          {gameMode === GAME_MODES.TIME_ATTACK && (
            <div className={`time-display ${timeRemaining < 15 ? 'urgent' : ''}`}>
              Time: <span>{timeRemaining}s</span>
            </div>
          )}
          
          <div className="streak-display">
            Streak: <span>{currentStreak}</span>
          </div>
        </div>
        
        <div className="power-ups">
          <button 
            className={`power-up-btn ${powerUps.timeFreeze > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('timeFreeze')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.timeFreeze <= 0}
          >
            ⏱️ Freeze ({powerUps.timeFreeze})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.showFirst > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('showFirst')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.showFirst <= 0}
          >
            🔍 Show Network ({powerUps.showFirst})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.skipQuestion > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('skipQuestion')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.skipQuestion <= 0}
          >
            ⏭️ Skip ({powerUps.skipQuestion})
          </button>
        </div>
      </div>
      
      <div className="game-content">
        {feedback.show && (
          <div className={`feedback-message ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.message.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
        
        <div className="challenge-container">
          <div className="ip-display">
            {ip}/{prefix}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="subnet-forms">
              <div className="subnet-input-group">
                <label htmlFor="network-input">Network Address:</label>
                <input
                  id="network-input"
                  type="text"
                  value={networkAnswer}
                  onChange={(e) => setNetworkAnswer(e.target.value)}
                  placeholder="e.g. 192.168.1.0"
                  autoFocus
                  required
                  disabled={submitCooldown}
                />
              </div>
              
              <div className="subnet-input-group">
                <label htmlFor="broadcast-input">Broadcast Address:</label>
                <input
                  id="broadcast-input"
                  type="text"
                  value={broadcastAnswer}
                  onChange={(e) => setBroadcastAnswer(e.target.value)}
                  placeholder="e.g. 192.168.1.255"
                  required
                  disabled={submitCooldown}
                />
              </div>
              
              <div className="subnet-input-group">
                <label htmlFor="first-usable-input">First Usable IP:</label>
                <input
                  id="first-usable-input"
                  type="text"
                  value={firstUsableAnswer}
                  onChange={(e) => setFirstUsableAnswer(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  required
                  disabled={submitCooldown}
                />
              </div>
              
              <div className="subnet-input-group">
                <label htmlFor="last-usable-input">Last Usable IP:</label>
                <input
                  id="last-usable-input"
                  type="text"
                  value={lastUsableAnswer}
                  onChange={(e) => setLastUsableAnswer(e.target.value)}
                  placeholder="e.g. 192.168.1.254"
                  required
                  disabled={submitCooldown}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`submit-btn ${submitCooldown ? 'disabled' : ''}`}
              disabled={submitCooldown}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      
      {/* Back to menu and End Game buttons */}
      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {gameMode === GAME_MODES.PRACTICE && (
          <button 
            className="restart-btn"
            onClick={() => endGame()}
          >
            End Game & Collect XP
          </button>
        )}
        
        <button 
          className="back-button"
          onClick={() => {
            setGameStarted(false);
            scrollToTop();
          }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default SubnettingChallenge;
