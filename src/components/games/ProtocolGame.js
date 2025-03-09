import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../../utils/SoundManager';
import { UserContext } from '../../context/UserContext';
import scrollToTop from '../../utils/ScrollHelper';
import '../../styles/games/ProtocolGame.css';

// Use the exact same port dictionary as in PortGame.js
const PORT_DATA = {
  20: { protocol: "FTP", category: "File Transfer" },
  21: { protocol: "FTP", category: "File Transfer" },
  22: { protocol: "SSH", category: "Remote Access" },
  23: { protocol: "Telnet", category: "Remote Access" },
  25: { protocol: "SMTP", category: "Email" },
  53: { protocol: "DNS", category: "Name Resolution" },
  67: { protocol: "DHCP", category: "Network Management" },
  68: { protocol: "DHCP", category: "Network Management" },
  69: { protocol: "TFTP", category: "File Transfer" },
  80: { protocol: "HTTP", category: "Web" },
  110: { protocol: "POP3", category: "Email" },
  119: { protocol: "NNTP", category: "News" },
  123: { protocol: "NTP", category: "Time Sync" },
  137: { protocol: "NetBIOS", category: "File Sharing" },
  138: { protocol: "NetBIOS", category: "File Sharing" },
  139: { protocol: "NetBIOS", category: "File Sharing" },
  143: { protocol: "IMAP", category: "Email" },
  161: { protocol: "SNMP", category: "Network Management" },
  162: { protocol: "SNMP", category: "Network Management" },
  389: { protocol: "LDAP", category: "Directory Services" },
  443: { protocol: "HTTPS", category: "Web" },
  445: { protocol: "SMB", category: "File Sharing" },
  465: { protocol: "SMTPS", category: "Email" },
  587: { protocol: "SMTP", category: "Email" },
  993: { protocol: "IMAPS", category: "Email" },
  995: { protocol: "POP3S", category: "Email" },
  3306: { protocol: "MySQL", category: "Database" },
  3389: { protocol: "RDP", category: "Remote Access" },
  8080: { protocol: "HTTP-Alt", category: "Web" }
};

// Game modes exactly like PortGame.js
const GAME_MODES = {
  TIME_ATTACK: 'TIME_ATTACK',
  PRACTICE: 'PRACTICE'
};

// Difficulty levels with identical settings
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Easy',
    timeLimit: 60,
    timePenalty: 3,
    multiplier: 1,
    showHints: true
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 45,
    timePenalty: 5,
    multiplier: 1.5,
    showHints: false
  },
  HARD: {
    name: 'Hard',
    timeLimit: 30,
    timePenalty: 7,
    multiplier: 2,
    showHints: false
  }
};

function ProtocolGame() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats } = useContext(UserContext);

  // Game state (note: "gameStarted" is used to match the port game)
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    bestScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    totalAttempts: 0,
    correctAnswers: 0
  });
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    categoryReveal: 2,
    skipQuestion: 1
  });
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    isCorrect: false
  });

  // Load saved game stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('protocolGameStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Save game stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('protocolGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Timer effect for time attack mode (matching PortGame.js)
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

  // Get a random port from our dictionary
  const getRandomPort = () => {
    const portList = Object.keys(PORT_DATA);
    const randomIndex = Math.floor(Math.random() * portList.length);
    return portList[randomIndex];
  };

  // Generate a new question
  const generateQuestion = () => {
    const port = getRandomPort();
    const protocol = PORT_DATA[port].protocol;
    const description = PORT_DATA[port].description;
    const category = PORT_DATA[port].category;
    return {
      port,
      protocol,
      description,
      category,
      showCategory: false
    };
  };

  // Initialize game with selected mode and difficulty
  const initializeGame = (mode, diff) => {
    scrollToTop();
    setGameMode(mode);
    setDifficulty(diff);
    setGameStarted(true);
    setCurrentQuestion(generateQuestion());
    setShowGameOver(false);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    setStartTime(Date.now());
    setPowerUps({
      timeFreeze: 2,
      categoryReveal: 2,
      skipQuestion: 1
    });
    SoundManager.play('gameStart');
  };

  // End the game and update stats
  const endGame = () => {
    const newStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + (score > 0 ? 1 : 0),
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    setGameStats(newStats);
    const xpEarned = Math.round(score / 10);
    if (xpEarned > 0) {
      addXP(xpEarned);
      if (updateStats) {
        updateStats('protocolGame', {
          gamesPlayed: newStats.gamesPlayed,
          bestScore: newStats.bestScore,
          totalCorrect: newStats.correctAnswers
        });
      }
    }
    setShowGameOver(true);
    setGameStarted(false);
    SoundManager.play('gameOver');
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    const pointsEarned = 100 * DIFFICULTY_LEVELS[difficulty].multiplier;
    setScore(score + pointsEarned);
    setCorrectAnswers(prev => prev + 1);
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      setTimeRemaining(prev => prev + 5);
    }
    setFeedback({
      show: true,
      message: `Correct! +${pointsEarned} points`,
      isCorrect: true
    });
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 1500);
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    const correctProtocol = currentQuestion.protocol;
    setCurrentStreak(0);
    
    // Apply time penalty in time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      // Calculate new time after penalty
      const newTime = Math.max(0, timeRemaining - DIFFICULTY_LEVELS[difficulty].timePenalty);
      setTimeRemaining(newTime);
      
      // If time is now zero, end the game immediately
      if (newTime <= 0) {
        // Show feedback briefly before ending game
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect. The correct answer is "${correctProtocol}"`
        });
        SoundManager.play('wrong');
        
        // Short delay before ending game
        setTimeout(() => {
          endGame();
        }, 1000);
        return;
      }
    }
    
    setFeedback({
      show: true,
      isCorrect: false,
      message: `Incorrect. The correct answer is "${correctProtocol}"`
    });
    SoundManager.play('wrong');
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
    }, 2000);
  };

  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (gameMode === GAME_MODES.PRACTICE || powerUps[type] <= 0) return;
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    SoundManager.play('powerup');
    switch (type) {
      case 'timeFreeze':
        setFeedback({
          show: true,
          message: 'Time Freeze: +5 seconds',
          isCorrect: true
        });
        setTimeRemaining(prev => prev + 5);
        break;
      case 'categoryReveal':
        setCurrentQuestion(prev => ({
          ...prev,
          showCategory: true
        }));
        setFeedback({
          show: true,
          message: `Category: ${currentQuestion.category}`,
          isCorrect: true
        });
        break;
      case 'skipQuestion':
        setCurrentQuestion(generateQuestion());
        setFeedback({
          show: true,
          message: 'Question skipped!',
          isCorrect: true
        });
        break;
      default:
        break;
    }
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 2000);
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Compare the entered protocol acronym (case-insensitive) with the correct one
    const answer = userAnswer.trim().toUpperCase();
    const correctProtocol = currentQuestion.protocol.toUpperCase();
    const isCorrect = answer === correctProtocol;
    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
  };

  // Rendering the menu if the game has not started
  if (!gameStarted && !showGameOver) {
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
                    initializeGame(GAME_MODES.TIME_ATTACK, key);
                    scrollToTop();
                  }}
                >
                  <h4>{value.name}</h4>
                  <ul>
                    <li>{value.timeLimit} second time limit</li>
                    {value.showHints && <li>Hints available</li>}
                    <li>{value.timePenalty} second penalty for wrong answers</li>
                    <li>{value.multiplier}x score multiplier</li>
                  </ul>
                </div>
              ))}
            </div>
            <button 
              className="back-button"
              onClick={() => {
                setShowDifficultySelect(false);
                scrollToTop();
              }}
            >
              Back to Game Modes
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="protocol-game">
        <h2 className="game-title">Protocol Master</h2>
        <p className="game-description">
          Test your knowledge of networking protocols and their functions.
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
              <p>Race against the clock to identify as many protocols as possible!</p>
              <ul>
                <li>Limited time based on difficulty</li>
                <li>Correct answers add time</li>
                <li>Incorrect answers subtract time</li>
                <li>Score based on speed and accuracy</li>
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
                <li>Hints available</li>
                <li>Detailed explanations</li>
                <li>Great for beginners</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    return (
      <div className="protocol-game">
        <div className="game-over-stats">
          <h2>{isNewHighScore ? '🏆 New High Score! 🏆' : 'Game Over'}</h2>
          <div className="final-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className={`stat-value ${isNewHighScore ? 'highlight' : ''}`}>{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
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
                setGameMode(null);
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
    <div className="protocol-game">
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
            <div className={`time-display ${timeRemaining < 10 ? 'urgent' : ''}`}>
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
            className={`power-up-btn ${powerUps.categoryReveal > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('categoryReveal')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.categoryReveal <= 0 || currentQuestion?.showCategory}
          >
            🔍 Category ({powerUps.categoryReveal})
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
            {feedback.message}
          </div>
        )}
        <div className="question-container">
          <h3 className="question-text">What protocol is used for:</h3>
          <div className="protocol-name">Port {currentQuestion?.port}</div>
          <div className="protocol-description">{currentQuestion?.description}</div>
          {(DIFFICULTY_LEVELS[difficulty].showHints || currentQuestion?.showCategory) && (
            <div className="hint">
              <span className="hint-label">Category:</span> {currentQuestion?.category}
            </div>
          )}
        </div>
        <form className="answer-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="answer-input">Enter Protocol Name:</label>
            <input
              id="answer-input"
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="e.g. HTTP"
              autoFocus
              required
            />
          </div>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default ProtocolGame;
