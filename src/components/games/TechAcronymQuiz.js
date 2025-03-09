import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames, submitGameResults } from '../../services/api';
import '../../styles/games/TechAcronymQuiz.css';
import '../../styles/games/GameModeCards.css';

// Organize acronyms by category
const ACRONYM_CATEGORIES = {
  NETWORKING: 'Networking',
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  SECURITY: 'Security'
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
    timeLimit: 20,
    timePenalty: 3,
    multiplier: 1,
    showHints: true
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 15,
    timePenalty: 5,
    multiplier: 1.5,
    showHints: false
  },
  HARD: {
    name: 'Hard',
    timeLimit: 10,
    timePenalty: 7,
    multiplier: 2,
    showHints: false
  }
};

// Dictionary of tech acronyms with variants and categories
const ACRONYM_DATA = {
  // Networking category
  "HTTP": {
    correct: "Hypertext Transfer Protocol",
    category: ACRONYM_CATEGORIES.NETWORKING,
    variants: ["Hypertext Transfer Protocol", "Hypertext Terminal Protocol", "High Transfer Text Protocol", "Hypertext Transmission Protocol"],
    hint: "Used for transmitting web pages"
  },
  "TCP": {
    correct: "Transmission Control Protocol",
    category: ACRONYM_CATEGORIES.NETWORKING,
    variants: ["Transmission Control Protocol", "Transport Control Protocol", "Transfer Control Protocol", "Timeout Control Protocol"],
    hint: "Connection-oriented protocol that guarantees delivery"
  },
  "IP": {
    correct: "Internet Protocol",
    category: ACRONYM_CATEGORIES.NETWORKING,
    variants: ["Internet Protocol", "Interface Protocol", "Information Protocol", "Internet Packet"],
    hint: "Fundamental protocol for routing packets on the internet"
  },
  "DNS": {
    correct: "Domain Name System",
    category: ACRONYM_CATEGORIES.NETWORKING,
    variants: ["Domain Name System", "Domain Name Server", "Digital Name Service", "Directory Naming System"],
    hint: "Translates domain names to IP addresses"
  },
  "DHCP": {
    correct: "Dynamic Host Configuration Protocol",
    category: ACRONYM_CATEGORIES.NETWORKING,
    variants: ["Dynamic Host Configuration Protocol", "Direct Host Control Protocol", "Dynamic Hub Configuration Protocol", "Device Host Configuration Process"],
    hint: "Automatically assigns IP addresses to devices"
  },
  
  // Hardware category
  "CPU": {
    correct: "Central Processing Unit",
    category: ACRONYM_CATEGORIES.HARDWARE,
    variants: ["Central Processing Unit", "Core Processing Unit", "Central Processor Unit", "Computer Processing Unit"],
    hint: "The 'brain' of a computer"
  },
  "RAM": {
    correct: "Random Access Memory",
    category: ACRONYM_CATEGORIES.HARDWARE,
    variants: ["Random Access Memory", "Rapid Access Memory", "Read Access Memory", "Runtime Addressable Memory"],
    hint: "Temporary memory that loses data when powered off"
  },
  "GPU": {
    correct: "Graphics Processing Unit",
    category: ACRONYM_CATEGORIES.HARDWARE,
    variants: ["Graphics Processing Unit", "Graphical Processing Unit", "Graphics Processor Unit", "General Processing Unit"],
    hint: "Specialized for displaying images and video"
  },
  
  // Security category
  "VPN": {
    correct: "Virtual Private Network",
    category: ACRONYM_CATEGORIES.SECURITY,
    variants: ["Virtual Private Network", "Virtual Public Network", "Virtual Protected Network", "Variable Private Network"],
    hint: "Creates a secure tunnel for your internet traffic"
  },
  "SSL": {
    correct: "Secure Sockets Layer",
    category: ACRONYM_CATEGORIES.SECURITY,
    variants: ["Secure Sockets Layer", "Secure Socket Link", "System Socket Layer", "Safe Sockets Layer"],
    hint: "Encryption protocol for secure web browsing"
  },
  "2FA": {
    correct: "Two-Factor Authentication",
    category: ACRONYM_CATEGORIES.SECURITY,
    variants: ["Two-Factor Authentication", "Two-Form Authentication", "Two-Field Authentication", "Dual Factor Authorization"],
    hint: "Requires two different types of verification"
  }
};

function TechAcronymQuiz() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats, user } = useContext(UserContext);
  const timerRef = useRef(null);
  
  // Get current user ID for localStorage key
  const getUserKey = () => {
    return user?.id || user?.guestId || 'guest';
  };
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [gameId, setGameId] = useState(null);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Quiz state
  const [currentAcronym, setCurrentAcronym] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    categoryReveal: 2,
    skipQuestion: 1
  });
  const [answerCooldown, setAnswerCooldown] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // Load saved game stats from localStorage with user-specific key
  const [gameStats, setGameStats] = useState(() => {
    const userKey = getUserKey();
    const savedStats = localStorage.getItem(`acronymQuizStats_${userKey}`);
    return savedStats ? JSON.parse(savedStats) : {
      bestScore: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      totalAttempts: 0,
      correctAnswers: 0
    };
  });
  
  // Update gameStats in localStorage when user changes
  useEffect(() => {
    if (user) {
      const userKey = getUserKey();
      const savedStats = localStorage.getItem(`acronymQuizStats_${userKey}`);
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
        localStorage.setItem(`acronymQuizStats_${userKey}`, JSON.stringify(initialStats));
        setGameStats(initialStats);
      }
    }
  }, [user]);
  
  // Save gameStats to localStorage when they change
  useEffect(() => {
    if (user) {
      const userKey = getUserKey();
      localStorage.setItem(`acronymQuizStats_${userKey}`, JSON.stringify(gameStats));
    }
  }, [gameStats, user]);
  
  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get the acronyms game from the database
        const response = await getAllGames({ type: 'acronyms' });
        if (response.data.data.games.length > 0) {
          setGameId(response.data.data.games[0]._id);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, []);

  // Timer effect for time attack mode
  useEffect(() => {
    if (gameStarted && gameMode === GAME_MODES.TIME_ATTACK && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameMode, timeRemaining]);
  
  // Generate a question based on selected category
  const generateQuestion = () => {
    // Filter acronyms by category if one is selected
    const acronyms = Object.keys(ACRONYM_DATA).filter(acronym => 
      !selectedCategory || ACRONYM_DATA[acronym].category === selectedCategory
    );
    
    if (acronyms.length === 0) return null;
    
    // Select a random acronym
    const randomAcronym = acronyms[Math.floor(Math.random() * acronyms.length)];
    
    // Generate options
    const correctAnswer = ACRONYM_DATA[randomAcronym].correct;
    let allOptions = [...ACRONYM_DATA[randomAcronym].variants];
    
    // Shuffle options
    allOptions.sort(() => Math.random() - 0.5);
    
    setCurrentAcronym(randomAcronym);
    setOptions(allOptions);
    
    return randomAcronym;
  };

  // Initialize the game
  const initializeGame = (mode, diff, cat = null) => {
    setGameMode(mode);
    setDifficulty(diff);
    setSelectedCategory(cat);
    setGameStarted(true);
    setShowModeSelect(false);
    setShowCategorySelect(false);
    setShowDifficultySelect(false);
    setShowGameOver(false);
    
    // Reset game state
    setCurrentAcronym(generateQuestion());
    setScore(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setQuestionsAnswered(0);
    setCurrentStreak(0);
    setCombo(1);
    
    // Set initial time based on difficulty
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    setStartTime(Date.now());
    
    // Reset power-ups
    setPowerUps({
      timeFreeze: 2,
      categoryReveal: 2,
      skipQuestion: 1
    });
    
    // Play start sound
    SoundManager.play('gameStart');
  };
  
  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (powerUps[type] <= 0) return;
    
    // Update power-up count
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    
    // Apply power-up effect
    switch (type) {
      case 'timeFreeze':
        // Add 5 seconds to the timer
        setTimeRemaining(prev => prev + 5);
        SoundManager.play('powerup');
        break;
      case 'categoryReveal':
        // Show the category
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Category: ${ACRONYM_DATA[currentAcronym].category}`
        });
        setTimeout(() => {
          setFeedback({ show: false, isCorrect: false, message: '' });
        }, 2000);
        SoundManager.play('powerup');
        break;
      case 'skipQuestion':
        // Skip the current question
        setCurrentAcronym(generateQuestion());
        SoundManager.play('powerup');
        break;
      default:
        break;
    }
  };
  
  // Handle answer feedback
  const showAnswerFeedback = (isCorrect, message) => {
    setFeedback({
      show: true,
      isCorrect,
      message: message || (isCorrect ? "Correct!" : "Incorrect!")
    });
    
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
    }, 1500);
  };

  // End the game and update stats
  const endGame = async () => {
    console.log("Game ending! Processing final stats...");
    
    // Clear any existing timer using the correct reference
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
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
    
    // Store updated game stats with user-specific key
    setGameStats(updatedStats);
    const userKey = getUserKey();
    localStorage.setItem(`acronymQuizStats_${userKey}`, JSON.stringify(updatedStats));
    console.log(`Game stats updated for user ${userKey}:`, updatedStats);
    
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

  // Handle time out
  const handleTimeOut = () => {
    // Increment questions answered counter
    setQuestionsAnswered(prev => prev + 1);
    
    // Check if currentAcronym is valid before accessing properties
    if (currentAcronym && ACRONYM_DATA[currentAcronym]) {
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Time's up! The correct answer is: ${ACRONYM_DATA[currentAcronym].correct}`
      });
    } else {
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Time's up!`
      });
    }
    
    // Increment incorrect answers
    setIncorrectAnswers(prev => prev + 1);
    
    // End the game after showing feedback briefly
    setTimeout(async () => {
      await endGame();
    }, 2000);
  };

  // Handle answer selection
  const handleAnswerClick = (selectedAnswer) => {
    if (answerCooldown) return;
    
    // Set cooldown to prevent double-clicking
    setAnswerCooldown(true);
    
    // Increment questions answered counter
    setQuestionsAnswered(prev => prev + 1);
    
    // Check if correct
    const isCorrect = selectedAnswer === ACRONYM_DATA[currentAcronym].correct;
    
    if (isCorrect) {
      // Correct answer
      const basePoints = 10;
      const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
      const timeBonusMultiplier = timeRemaining / DIFFICULTY_LEVELS[difficulty].timeLimit;
      const comboMultiplier = combo;
      
      // Calculate points
      const earnedPoints = Math.round(basePoints * difficultyMultiplier * timeBonusMultiplier * comboMultiplier);
      
      // Update score and streak
      setScore(prev => prev + earnedPoints);
      setCurrentStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      // Update combo (max 2.0)
      setCombo(prev => Math.min(prev + 0.1, 2.0));
      
      // Add time for correct answer in time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        setTimeRemaining(prev => prev + 2);
      }
      
      // Show feedback
      showAnswerFeedback(true, `Correct! +${earnedPoints} points`);
      
      // Play sound
      SoundManager.play('correct');
    } else {
      // Incorrect answer
      setCurrentStreak(0);
      setCombo(1);
      setIncorrectAnswers(prev => prev + 1);
      
      // Subtract time for incorrect answer in time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        setTimeRemaining(prev => Math.max(prev - 3, 0));
      }
      
      // Show feedback
      showAnswerFeedback(false, `Incorrect! The correct answer is: ${ACRONYM_DATA[currentAcronym].correct}`);
      
      // Play sound
      SoundManager.play('incorrect');
    }
    
    // Generate new question after delay
    setTimeout(() => {
      setCurrentAcronym(generateQuestion());
      setAnswerCooldown(false);
    }, 1500);
  };
  
  // Reset game and go back to menu
  const goBackToMenu = () => {
    setGameStarted(false);
    setShowModeSelect(true);
    setShowGameOver(false);
    setCurrentAcronym(null);
    scrollToTop();
  };

  // Update the timeUp function
  const timeUp = async () => {
    setTimeRemaining(0);
    await endGame();
  };

  return (
    <div className="acronym-game">
      <h2 className="game-title">Tech Acronym Quiz</h2>
      <p className="game-description">
        Test your knowledge of technical acronyms across networking, hardware, and security.
      </p>
      
      {/* Game Over Screen */}
      {showGameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <div className="score-display">
            <h3>Score: {score}</h3>
            <p>Correct Answers: {correctAnswers}</p>
            <p>Accuracy: {Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)}%</p>
            <p>Best Streak: {Math.max(currentStreak, gameStats.bestStreak)}</p>
          </div>
          
          <button className="primary-button" onClick={goBackToMenu}>Back to Menu</button>
        </div>
      )}
      
      {/* Show stats first when in menu (consistent with other games) */}
      {!gameStarted && !showGameOver && showModeSelect && (
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
      )}
      
      {/* Mode Selection - now inside a game-setup container like other games */}
      {showModeSelect && !gameStarted && (
        <div className="game-setup">
          <h3>Select Game Mode</h3>
          <div className="game-modes">
            <div 
              className="game-mode-card"
              onClick={() => {
                setGameMode(GAME_MODES.TIME_ATTACK);
                setShowModeSelect(false);
                setShowCategorySelect(true);
                scrollToTop();
              }}
            >
              <h3>Time Attack</h3>
              <p>Race against the clock to identify as many acronyms as possible.</p>
              <ul>
                <li>Time limit based on difficulty</li>
                <li>Correct answers add time</li>
                <li>Incorrect answers reduce time</li>
                <li>Earn combo multipliers for consecutive correct answers</li>
              </ul>
            </div>
            
            <div 
              className="game-mode-card"
              onClick={() => {
                setGameMode(GAME_MODES.PRACTICE);
                setShowModeSelect(false);
                setShowCategorySelect(true);
                scrollToTop();
              }}
            >
              <h3>Practice Mode</h3>
              <p>Learn at your own pace without time pressure.</p>
              <ul>
                <li>No time limits</li>
                <li>Focus on learning the acronyms</li>
                <li>Still earn XP for correct answers</li>
                <li>Track your progress</li>
              </ul>
            </div>
          </div>
          
          {/* Add nav-buttons with Back to Dashboard button for consistency */}
          <div className="nav-buttons">
            <button 
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {/* Category Selection */}
      {showCategorySelect && !gameStarted && (
        <div className="category-selection">
          <h2>Select Category</h2>
          <div className="categories">
            <div 
              className="category-card"
              onClick={() => {
                setSelectedCategory(null);
                setShowCategorySelect(false);
                setShowDifficultySelect(true);
                scrollToTop();
              }}
            >
              <h3>All Categories</h3>
              <p>Mix of networking, hardware, and security acronyms.</p>
            </div>
            
            <div 
              className="category-card"
              onClick={() => {
                setSelectedCategory(ACRONYM_CATEGORIES.NETWORKING);
                setShowCategorySelect(false);
                setShowDifficultySelect(true);
                scrollToTop();
              }}
            >
              <h3>Networking</h3>
              <p>Focus on protocols, services, and networking terminology.</p>
            </div>
            
            <div 
              className="category-card"
              onClick={() => {
                setSelectedCategory(ACRONYM_CATEGORIES.HARDWARE);
                setShowCategorySelect(false);
                setShowDifficultySelect(true);
                scrollToTop();
              }}
            >
              <h3>Hardware</h3>
              <p>Computer components and hardware-related terminology.</p>
            </div>
            
            <div 
              className="category-card"
              onClick={() => {
                setSelectedCategory(ACRONYM_CATEGORIES.SECURITY);
                setShowCategorySelect(false);
                setShowDifficultySelect(true);
                scrollToTop();
              }}
            >
              <h3>Security</h3>
              <p>Cybersecurity terms and technologies.</p>
            </div>
          </div>
          
          <button 
            className="back-button"
            onClick={() => {
              setShowCategorySelect(false);
              setShowModeSelect(true);
              scrollToTop();
            }}
          >
            Back to Mode Selection
          </button>
        </div>
      )}
      
      {/* Difficulty Selection */}
      {showDifficultySelect && !gameStarted && (
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>
          <div className="difficulties">
            {Object.keys(DIFFICULTY_LEVELS).map(diff => (
              <div 
                key={diff}
                className="difficulty-card"
                onClick={() => initializeGame(gameMode, diff, selectedCategory)}
              >
                <h3>{DIFFICULTY_LEVELS[diff].name}</h3>
                <ul>
                  <li>Time Limit: {DIFFICULTY_LEVELS[diff].timeLimit}s per question</li>
                  <li>Time Penalty: {DIFFICULTY_LEVELS[diff].timePenalty}s for incorrect answers</li>
                  <li>Score Multiplier: {DIFFICULTY_LEVELS[diff].multiplier}x</li>
                  {DIFFICULTY_LEVELS[diff].showHints && <li>Hints Available</li>}
                </ul>
              </div>
            ))}
          </div>
          
          <button 
            className="back-button"
            onClick={() => {
              setShowDifficultySelect(false);
              setShowCategorySelect(true);
              scrollToTop();
            }}
          >
            Back to Category Selection
          </button>
        </div>
      )}
      
      {/* Game Interface */}
      {gameStarted && !showGameOver && currentAcronym && (
        <div className="game-interface">
          <div className="game-header">
            <div className="score">Score: {score}</div>
            <div className="time">Time: {timeRemaining}s</div>
          </div>
          
          <div className="power-ups">
            <button 
              className={`power-up ${powerUps.timeFreeze <= 0 ? 'disabled' : ''}`}
              onClick={() => handlePowerUp('timeFreeze')}
              disabled={powerUps.timeFreeze <= 0}
            >
              +5s ({powerUps.timeFreeze})
            </button>
            <button 
              className={`power-up ${powerUps.categoryReveal <= 0 ? 'disabled' : ''}`}
              onClick={() => handlePowerUp('categoryReveal')}
              disabled={powerUps.categoryReveal <= 0}
            >
              Hint ({powerUps.categoryReveal})
            </button>
            <button 
              className={`power-up ${powerUps.skipQuestion <= 0 ? 'disabled' : ''}`}
              onClick={() => handlePowerUp('skipQuestion')}
              disabled={powerUps.skipQuestion <= 0}
            >
              Skip ({powerUps.skipQuestion})
            </button>
          </div>
          
          <div className="question-container">
            <h2 className="acronym">{currentAcronym}</h2>
            {DIFFICULTY_LEVELS[difficulty].showHints && (
              <p className="hint">{ACRONYM_DATA[currentAcronym].hint}</p>
            )}
            
            {feedback.show && (
              <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                {feedback.message}
              </div>
            )}
          </div>
          
          <div className="timer-bar-container">
            <div 
              className={`timer-bar ${timeRemaining < 5 ? 'urgent' : ''}`} 
              style={{width: `${(timeRemaining / DIFFICULTY_LEVELS[difficulty].timeLimit) * 100}%`}}
            ></div>
          </div>
          
          <div className="answer-options">
            {options.map((option, index) => (
              <button 
                key={index} 
                className={`answer-option ${answerCooldown ? 'disabled' : ''}`}
                onClick={() => handleAnswerClick(option)}
                disabled={answerCooldown}
              >
                {option}
              </button>
            ))}
          </div>
          
          {currentStreak >= 3 && (
            <div className="combo-display">
              <span>Combo: <span className="combo-count">{currentStreak}</span></span>
              <span>Multiplier: <span className="multiplier">x{combo.toFixed(1)}</span></span>
            </div>
          )}
        </div>
      )}
      
      {/* Back to menu and End Game buttons */}
      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {gameMode === GAME_MODES.PRACTICE && gameStarted && !showGameOver && (
          <button 
            className="restart-btn"
            onClick={async () => await endGame()}
          >
            End Game & Collect XP
          </button>
        )}
        
        {gameStarted && !showGameOver && (
          <button 
            className="back-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                goBackToMenu();
              }
            }}
          >
            Back to Menu
          </button>
        )}
      </div>
      
      {/* Only show the back to dashboard button if not in game mode selection */}
      {(!showModeSelect || gameStarted || showGameOver) && (
        <div className="back-to-dashboard">
          <button onClick={() => navigate('/dashboard/game-center')}>
            Return to Game Center
          </button>
        </div>
      )}
    </div>
  );
}

export default TechAcronymQuiz;
