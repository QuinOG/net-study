import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames, submitGameResults } from '../../services/api';
import '../../styles/games/PortGame.css';
import '../../styles/games/GameModeCards.css';

// Dictionary of common ports and their protocols for the Net+ exam
const PORT_DATA = {
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
  143: { protocol: "IMAP", description: "Internet Message Access Protocol", category: "Email" },
  161: { protocol: "SNMP", description: "Simple Network Management Protocol", category: "Network Management" },
  162: { protocol: "SNMP", description: "Simple Network Management Protocol (Trap)", category: "Network Management" },
  389: { protocol: "LDAP", description: "Lightweight Directory Access Protocol", category: "Directory Services" },
  443: { protocol: "HTTPS", description: "HTTP Secure", category: "Web" },
  445: { protocol: "SMB", description: "Server Message Block", category: "File Sharing" },
  500: { protocol: "ISAKMP", description: "Internet Security Association and Key Management Protocol", category: "VPN" },
  587: { protocol: "SMTP", description: "SMTP Submission", category: "Email" },
  636: { protocol: "LDAPS", description: "LDAP over SSL", category: "Directory Services" },
  993: { protocol: "IMAPS", description: "IMAP over SSL", category: "Email" },
  995: { protocol: "POP3S", description: "POP3 over SSL", category: "Email" },
  1433: { protocol: "MS SQL", description: "Microsoft SQL Server", category: "Database" },
  1434: { protocol: "MS SQL", description: "Microsoft SQL Server Browser", category: "Database" },
  3306: { protocol: "MySQL", description: "MySQL Database", category: "Database" },
  3389: { protocol: "RDP", description: "Remote Desktop Protocol", category: "Remote Access" },
  5060: { protocol: "SIP", description: "Session Initiation Protocol", category: "VoIP" },
  5061: { protocol: "SIP", description: "Session Initiation Protocol (TLS)", category: "VoIP" }
};

// Game modes
const GAME_MODES = {
  TIME_ATTACK: 'TIME_ATTACK',
  PRACTICE: 'PRACTICE'
};

// Difficulty levels with their settings
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

function PortGame() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats, user } = useContext(UserContext);
  const timerIdRef = useRef(null); // Add ref for timer ID
  
  // Get current user ID for localStorage key
  const getUserKey = () => {
    return user?.id || user?.guestId || 'guest';
  };
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Initialize game stats with user-specific key
  const [gameStats, setGameStats] = useState(() => {
    const userKey = getUserKey();
    const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
    return savedStats ? JSON.parse(savedStats) : {
      bestScore: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      totalAttempts: 0,
      correctAnswers: 0
    };
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
  const [gameId, setGameId] = useState(null);

  // Update gameStats in localStorage when user changes
  useEffect(() => {
    if (user) {
      const userKey = getUserKey();
      const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
      if (savedStats) {
        setGameStats(JSON.parse(savedStats));
      } else {
        // Initialize stats for this user if they don't exist
        const initialStats = {
          bestScore: 0,
          bestStreak: 0,
          gamesPlayed: 0,
          totalAttempts: 0,
          correctAnswers: 0
        };
        localStorage.setItem(`portGameStats_${userKey}`, JSON.stringify(initialStats));
        setGameStats(initialStats);
      }
    }
  }, [user]);

  // Save game stats to localStorage when they change
  useEffect(() => {
    if (gameStats) {
      const userKey = getUserKey();
      localStorage.setItem(`portGameStats_${userKey}`, JSON.stringify(gameStats));
    }
  }, [gameStats]);

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

  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get the port game from the database
        const response = await getAllGames({ type: 'ports' });
        if (response.data.data.games.length > 0) {
          setGameId(response.data.data.games[0]._id);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, []);

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
      showCategory: false,
      options: generateOptions(protocol)
    };
  };

  // Generate multiple choice options including the correct answer
  const generateOptions = (correctProtocol) => {
    // Get unique protocols
    const uniqueProtocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))];
    
    // Filter out the correct answer and shuffle
    const filteredProtocols = uniqueProtocols
      .filter(protocol => protocol !== correctProtocol)
      .sort(() => 0.5 - Math.random());
    
    // Take 3 wrong answers and add the correct one
    const options = filteredProtocols.slice(0, 3);
    options.push(correctProtocol);
    
    // Shuffle again and return
    return options.sort(() => 0.5 - Math.random());
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if answer is correct
    const isCorrect = userAnswer === currentQuestion.port;
    
    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
    
    // Reset input field and generate new question
    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    // Play correct sound
    SoundManager.play('correct');
    
    // Update streak and score
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    
    // Apply difficulty multiplier to score
    const pointsEarned = 100 * DIFFICULTY_LEVELS[difficulty].multiplier;
    const newScore = score + pointsEarned;
    setScore(newScore);
    setCorrectAnswers(prev => prev + 1);
    
    // Add time for time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      setTimeRemaining(prev => prev + 5); // Add 5 seconds for correct answer
    }
    
    // Show feedback
    setFeedback({
      show: true,
      message: `Correct! +${pointsEarned} points`,
      isCorrect: true
    });
    
    // Hide feedback after 1.5 seconds
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 1500);
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    // Play wrong sound
    SoundManager.play('wrong');
    
    // Reset streak
    setCurrentStreak(0);
    
    // Subtract time for time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      // Calculate new time after penalty
      const newTime = Math.max(0, timeRemaining - DIFFICULTY_LEVELS[difficulty].timePenalty);
      setTimeRemaining(newTime);
      
      // If time is now zero, end the game immediately
      if (newTime <= 0) {
        // Show feedback briefly before ending game
        setFeedback({
          show: true,
          message: `Incorrect! The port for ${currentQuestion.protocol} is ${currentQuestion.port}`,
          isCorrect: false
        });
        
        // Short delay before ending game
        setTimeout(() => {
          endGame();
        }, 1000);
        return;
      }
    }
    
    // Show feedback
    setFeedback({
      show: true,
      message: `Incorrect! The port for ${currentQuestion.protocol} is ${currentQuestion.port}`,
      isCorrect: false
    });
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 2000);
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
        // Pause the timer for 5 seconds
        const originalTimeRemaining = timeRemaining;
        setFeedback({
          show: true,
          message: 'Time Freeze: +5 seconds',
          isCorrect: true
        });
        setTimeRemaining(prev => prev + 5);
        break;
        
      case 'categoryReveal':
        // Reveal the category
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
        // Skip to next question
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
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 2000);
  };

  // Initialize game with selected mode and difficulty
  const initializeGame = (mode, diff) => {
    // Scroll to top when game initializes
    scrollToTop();
    
    setGameMode(mode);
    setDifficulty(diff);
    setGameStarted(true);
    setCurrentQuestion(generateQuestion());
    setShowGameOver(false);
    setScore(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setCurrentStreak(0);
    
    // Set initial time based on difficulty
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    setStartTime(Date.now());
    
    // Reset power-ups
    setPowerUps({
      timeFreeze: 2,
      categoryReveal: 2,
      skipQuestion: 1
    });
    
    // Play start game sound
    SoundManager.play('gameStart');
  };

  // End the game and update stats
  const endGame = async () => {
    console.log("Game ending! Processing final stats...");
    
    // We don't need to clear the timer manually since it's handled in the useEffect cleanup
    // The timer variable is 'timerId' not 'timer'
    
    // Update game stats
    const bestScoreUpdated = score > gameStats.bestScore;
    const bestStreakUpdated = currentStreak > gameStats.bestStreak;
    
    const updatedStats = {
      ...gameStats,
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + incorrectAnswers,
      correctAnswers: gameStats.correctAnswers + correctAnswers,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak)
    };
    
    // Store updated game stats
    setGameStats(updatedStats);
    localStorage.setItem(`portGameStats_${getUserKey()}`, JSON.stringify(updatedStats));
    console.log("Game stats updated:", updatedStats);
    
    // Award XP (minimum 10 XP if score > 0, otherwise score-based)
    if (score > 0) {
      try {
        const xpEarned = Math.max(10, Math.floor(score / 10));
        console.log(`Awarding ${xpEarned} XP for score of ${score}`);
        const result = await addXP(xpEarned);
        
        if (result.error) {
          console.error("Error awarding XP:", result.error);
        } else {
          console.log("XP award successful:", result);
          
          if (result.oldXP !== undefined && result.newXP !== undefined) {
            console.log(`XP updated: ${result.oldXP} → ${result.newXP} (+${result.xpEarned})`);
          }
          
          if (result.levelUp) {
            console.log("User leveled up!");
            // TODO: Add level up celebration
          }
        }
      } catch (error) {
        console.error("Exception when awarding XP:", error);
      }
    } else {
      console.log("No XP awarded - score was 0");
    }
    
    // Set game over
    setShowGameOver(true);
    
    // Play game over sound
    SoundManager.play('gameOver');
    console.log("Game over process complete");
  };

  // Game mode selection and rendering
  if (!gameStarted) {
    if (showDifficultySelect) {
      return (
        <div className="port-game">
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
            
            <div className="nav-buttons">
              <button 
                className="back-btn"
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
      <div className="port-game">
        <h2 className="game-title">Port Master</h2>
        <p className="game-description">
          Test your knowledge of network port numbers and which protocols use them.
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
              <p>Race against the clock to identify as many port numbers as possible!</p>
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
        
        <div className="nav-buttons">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    
    return (
      <div className="port-game">
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
                setGameStarted(false);
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
    <div className="port-game">
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
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.categoryReveal <= 0 || currentQuestion.showCategory}
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
          <h3 className="question-text">What port number is used for:</h3>
          <div className="protocol-name">{currentQuestion.protocol}</div>
          <div className="protocol-description">{currentQuestion.description}</div>
          
          {(DIFFICULTY_LEVELS[difficulty].showHints || currentQuestion.showCategory) && (
            <div className="hint">
              <span className="hint-label">Category:</span> {currentQuestion.category}
            </div>
          )}
        </div>
        
        <form className="answer-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="answer-input">Enter Port Number:</label>
            <input
              id="answer-input"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="e.g. 80"
              autoFocus
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
      
      {/* Add End Game button for practice mode */}
      {gameMode === GAME_MODES.PRACTICE && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="restart-btn"
            onClick={() => endGame()}
          >
            End Game & Collect XP
          </button>
        </div>
      )}
    </div>
  );
}

export default PortGame;
