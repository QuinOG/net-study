import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../../utils/SoundManager';
import { UserContext } from '../../context/UserContext';
import '../../styles/games/ProtocolGame.css';

// Expanded dictionary for the Net+ exam
const portProtocols = {
  20: { protocol: "FTP", description: "File Transfer Protocol (Data)", category: "File Transfer" },
  21: { protocol: "FTP", description: "File Transfer Protocol (Control)", category: "File Transfer" },
  22: { protocol: "SSH", description: "Secure Shell", category: "Remote Access" },
  23: { protocol: "Telnet", description: "Terminal Network", category: "Remote Access" },
  25: { protocol: "SMTP", description: "Simple Mail Transfer Protocol", category: "Email" },
  53: { protocol: "DNS", description: "Domain Name System", category: "Name Resolution" },
  67: { protocol: "DHCP", description: "Dynamic Host Configuration Protocol (Server)", category: "Network Management" },
  68: { protocol: "DHCP", description: "Dynamic Host Configuration Protocol (Client)", category: "Network Management" },
  69: { protocol: "TFTP", description: "Trivial File Transfer Protocol", category: "File Transfer" },
  80: { protocol: "HTTP", description: "Hypertext Transfer Protocol", category: "Web" },
  110: { protocol: "POP3", description: "Post Office Protocol v3", category: "Email" },
  119: { protocol: "NNTP", description: "Network News Transfer Protocol", category: "News" },
  123: { protocol: "NTP", description: "Network Time Protocol", category: "Time Sync" },
  137: { protocol: "NetBIOS", description: "Network Basic Input/Output System (Name)", category: "File Sharing" },
  138: { protocol: "NetBIOS", description: "Network Basic Input/Output System (Datagram)", category: "File Sharing" },
  139: { protocol: "NetBIOS", description: "Network Basic Input/Output System (Session)", category: "File Sharing" },
  143: { protocol: "IMAP", description: "Internet Message Access Protocol", category: "Email" },
  161: { protocol: "SNMP", description: "Simple Network Management Protocol", category: "Network Management" },
  162: { protocol: "SNMP", description: "Simple Network Management Protocol (Traps)", category: "Network Management" },
  389: { protocol: "LDAP", description: "Lightweight Directory Access Protocol", category: "Directory Services" },
  443: { protocol: "HTTPS", description: "HTTP Secure", category: "Web" },
  445: { protocol: "SMB", description: "Server Message Block", category: "File Sharing" },
  465: { protocol: "SMTPS", description: "SMTP over SSL", category: "Email" },
  587: { protocol: "SMTP", description: "SMTP Submission", category: "Email" },
  993: { protocol: "IMAPS", description: "IMAP over SSL", category: "Email" },
  995: { protocol: "POP3S", description: "POP3 over SSL", category: "Email" },
  3306: { protocol: "MySQL", description: "MySQL Database", category: "Database" },
  3389: { protocol: "RDP", description: "Remote Desktop Protocol", category: "Remote Access" },
  8080: { protocol: "HTTP-Alt", description: "Alternative HTTP Port", category: "Web" }
};

const DIFFICULTY_LEVELS = {
  EASY: { 
    name: 'Easy', 
    multiplier: 1, 
    timeLimit: 60,
    showHints: true,
    timePenalty: 3
  },
  MEDIUM: { 
    name: 'Medium', 
    multiplier: 1.5, 
    timeLimit: 45,
    showHints: false,
    timePenalty: 5
  },
  HARD: { 
    name: 'Hard', 
    multiplier: 2, 
    timeLimit: 30,
    showHints: false,
    timePenalty: 7
  }
};

const GAME_MODES = {
  TIME_ATTACK: 'time_attack',
  PRACTICE: 'practice'
};

function ProtocolGame() {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  
  // Game state
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [currentPort, setCurrentPort] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [gameStats, setGameStats] = useState({
    correctAnswers: 0,
    totalAttempts: 0,
    bestStreak: 0,
    bestScore: 0,
    categoryMastery: {},
    gamesPlayed: 0,
    totalScore: 0
  });
  const [showGameOver, setShowGameOver] = useState(false);

  // Power-ups
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    categoryReveal: 2,
    skipQuestion: 1
  });

  // Initialize game with selected mode and difficulty
  const initializeGame = (mode, diff) => {
    setGameMode(mode);
    setDifficulty(diff);
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setCombo(1);
    setHintsRemaining(3);
    setTimeLeft(DIFFICULTY_LEVELS[diff].timeLimit);
    
    // Set initial category for category challenge mode
    if (mode === GAME_MODES.CATEGORY_CHALLENGE) {
      const categories = [...new Set(Object.values(portProtocols).map(p => p.category))];
      setCurrentCategory(categories[Math.floor(Math.random() * categories.length)]);
    }
    
    generateQuestion();
    
    // Play start game sound
    SoundManager.play('gameStart');
  };

  // Generate a new question based on game mode
  const generateQuestion = () => {
    if (gameMode === GAME_MODES.CATEGORY_CHALLENGE && currentCategory) {
      // Filter ports by current category
      const categoryPorts = Object.entries(portProtocols)
        .filter(([_, data]) => data.category === currentCategory);
      const randomPort = categoryPorts[Math.floor(Math.random() * categoryPorts.length)][0];
      setCurrentPort(parseInt(randomPort, 10));
    } else {
      const ports = Object.keys(portProtocols);
      setCurrentPort(parseInt(ports[Math.floor(Math.random() * ports.length)], 10));
    }
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!gameActive) return;
    
    const userAnswer = answer.trim().toUpperCase();
    const correctProtocol = portProtocols[currentPort].protocol;
    const isCorrect = userAnswer === correctProtocol.toUpperCase();
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      bestStreak: Math.max(prev.bestStreak, streak + (isCorrect ? 1 : 0))
    }));

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }

    setAnswer('');
    generateQuestion();
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    // Calculate points based on difficulty, combo, and time bonus
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
    const timeBonus = Math.max(1, timeLeft / DIFFICULTY_LEVELS[difficulty].timeLimit);
    const points = Math.round(100 * difficultyMultiplier * combo * timeBonus);
    
    setScore(prev => prev + points);
    setStreak(prev => prev + 1);
    setCombo(prev => Math.min(prev + 0.1, 3)); // Max combo multiplier of 3x
    
    // Visual and audio feedback
    setResult({
      message: `Correct! +${points} points`,
      type: 'success',
      points: points
    });
    SoundManager.play('correct');
    
    // Update category mastery
    const category = portProtocols[currentPort].category;
    setGameStats(prev => ({
      ...prev,
      categoryMastery: {
        ...prev.categoryMastery,
        [category]: (prev.categoryMastery[category] || 0) + 1
      }
    }));
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    const correctProtocol = portProtocols[currentPort].protocol;
    setStreak(0);
    setCombo(1);
    
    setResult({
      message: `Incorrect. The correct answer is "${correctProtocol}"`,
      type: 'error'
    });
    SoundManager.play('incorrect');
    
    // Reduce time in time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      setTimeLeft(prev => Math.max(0, prev - 5));
    }
  };

  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (powerUps[type] > 0) {
      setPowerUps(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));

      switch (type) {
        case 'timeFreeze':
          setTimeLeft(prev => prev + 10);
          break;
        case 'categoryReveal':
          setShowHint(true);
          break;
        case 'skipQuestion':
          generateQuestion();
          break;
        default:
          break;
      }
      
      SoundManager.play('powerup');
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameActive && gameMode === GAME_MODES.TIME_ATTACK) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, gameMode]);

  // End game
  const endGame = () => {
    setGameActive(false);
    
    // Update local game stats
    setGameStats(prev => ({
      ...prev,
      bestScore: Math.max(score, prev.bestScore),
      gamesPlayed: prev.gamesPlayed + 1,
      totalScore: prev.totalScore + score,
      bestStreak: Math.max(streak, prev.bestStreak)
    }));

    // Show game over screen
    setShowGameOver(true);
    
    // Play appropriate sound
    if (score > gameStats.bestScore) {
      SoundManager.play('achievement');
    }
    SoundManager.play('gameOver');
  };

  // Render difficulty selection if Time Attack was clicked
  if (showDifficultySelect) {
    return (
      <div className="protocol-game">
        <h2 className="game-title">Select Difficulty</h2>
        <div className="difficulty-select">
          <div className="difficulty-cards">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
              <div
                key={key}
                className="difficulty-card"
                data-difficulty={key}
                onClick={() => {
                  setDifficulty(key);
                  setShowDifficultySelect(false);
                  initializeGame(GAME_MODES.TIME_ATTACK, key);
                }}
              >
                <h4>{value.name}</h4>
                <ul>
                  <li>Time limit: {value.timeLimit}s</li>
                  <li>Score multiplier: {value.multiplier}x</li>
                  {key === 'EASY' ? (
                    <>
                      <li>Time penalty: -{value.timePenalty}s</li>
                      <hr className="separator" />
                      <li>Hints enabled</li>
                    </>
                  ) : (
                    <>
                      <li>Time penalty: -{value.timePenalty}s</li>
                      {value.showHints && <li>Hints enabled</li>}
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
          <button 
            className="back-button"
            onClick={() => setShowDifficultySelect(false)}
          >
            Back to Game Modes
          </button>
        </div>
      </div>
    );
  }

  // Render game menu if no mode selected
  if (!gameMode) {
    return (
      <div className="protocol-game">
        <h2 className="game-title">Protocol Master</h2>
        <div className="game-description">
          <p>Test your knowledge of network protocols and port numbers!</p>
          <p>Choose your game mode to begin.</p>
        </div>

        <div className="game-setup">
          <div className="mode-select">
            <h3>Game Mode</h3>
            <div className="game-modes">
              <div 
                className="game-mode-card"
                onClick={() => setShowDifficultySelect(true)}
              >
                <h4>Time Attack</h4>
                <p>Race against the clock! Answer quickly for bonus points.</p>
                <ul>
                  <li>Limited time per level</li>
                  <li>Time bonus for quick answers</li>
                  <li>Combo multiplier for streaks</li>
                </ul>
              </div>
              <div 
                className="game-mode-card"
                onClick={() => initializeGame(GAME_MODES.PRACTICE, 'EASY')}
              >
                <h4>Practice Mode</h4>
                <p>Learn at your own pace without time pressure.</p>
                <ul>
                  <li>No time limit</li>
                  <li>Hints available</li>
                  <li>Perfect for learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {gameStats.gamesPlayed > 0 && (
          <div className="stats-summary">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Best Score</span>
                <span className="stat-value">{gameStats.bestScore}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Streak</span>
                <span className="stat-value">{gameStats.bestStreak}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{gameStats.gamesPlayed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">
                  {Math.round((gameStats.correctAnswers / Math.max(1, gameStats.totalAttempts)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game over screen
  if (showGameOver) {
    return (
      <div className="protocol-game-menu">
        <h2>Game Over!</h2>
        <div className="game-over-stats">
          <h3>Game Summary</h3>
          <p>Score: {score}</p>
          <p>Best Streak: {streak}</p>
          <p>Accuracy: {Math.round((gameStats.correctAnswers / Math.max(1, gameStats.totalAttempts)) * 100)}%</p>
          {score > gameStats.bestScore && (
            <p className="new-record">New High Score! 🏆</p>
          )}
        </div>
        <div className="game-over-buttons">
          <button onClick={() => {
            setShowGameOver(false);
            initializeGame(gameMode, difficulty);
          }}>
            Play Again
          </button>
          <button onClick={() => {
            setShowGameOver(false);
            setGameMode(null);
          }}>
            Change Mode
          </button>
          <button onClick={() => navigate(-1)}>
            Exit Game
          </button>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="protocol-game">
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
        <div className="streak-display">
          <span className="streak">Streak: {streak}</span>
          <span className="combo">Combo: x{combo.toFixed(1)}</span>
        </div>
        {gameMode === GAME_MODES.TIME_ATTACK && (
          <div className="timer">Time: {timeLeft}s</div>
        )}
      </div>

      <div className="game-content">
        <div className="question-container">
          <h3>What protocol uses port <strong>{currentPort}</strong>?</h3>
          {showHint && (
            <div className="hint">
              Category: {portProtocols[currentPort].category}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type protocol name..."
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>

        {result && (
          <div className={`result-message ${result.type}`}>
            {result.message}
            {result.points && (
              <span className="points-earned">+{result.points}</span>
            )}
          </div>
        )}

        <div className="power-ups">
          {Object.entries(powerUps).map(([type, count]) => (
            <button
              key={type}
              onClick={() => handlePowerUp(type)}
              disabled={count === 0}
              className="power-up-btn"
            >
              {type} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="game-footer">
        <button onClick={endGame} className="end-game-btn">
          End Game
        </button>
        <button onClick={() => navigate(-1)} className="menu-btn">
          Game Menu
        </button>
      </div>
    </div>
  );
}

export default ProtocolGame;