import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import '../../styles/games/ProtocolGame.css';
import { getAllGames, submitGameResults } from '../../services/api';
import scrollToTop from '../../utils/ScrollHelper';
import GameModeSelectScreen from '../ui/GameModeSelectScreen';
import DifficultySelectScreen from '../ui/DifficultySelectScreen';
import GameEndScreen from '../ui/GameEndScreen';
import CollectXpButton from '../ui/CollectXpButton';
import GameStatsRow from '../ui/GameStatsRow';
import { FiClock, FiTarget, FiZap, FiSkipForward } from 'react-icons/fi';

// Use the exact same port dictionary as in PortGame.js
const PORT_DATA = {
  20: { protocol: "FTP", category: "File Transfer" },
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

// Memoized GameStatsRow component - will be used in the render
const MemoizedGameStatsRow = React.memo(GameStatsRow);

function ProtocolGame() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats, user } = useContext(UserContext);
  const timerIdRef = useRef(null); // Add ref for timer ID
  
  // Get current user ID for localStorage key
  const getUserKey = () => {
    return user?.id || user?.guestId || 'guest';
  };

  // Game state (note: "gameStarted" is used to match the port game)
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
    const savedStats = localStorage.getItem(`protocolGameStats_${userKey}`);
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

  // Add visual feedback state to match PortGame
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [xpEarnedPreview, setXpEarnedPreview] = useState(0);
  const [showXpPreview, setShowXpPreview] = useState(false);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showSpeedBonus, setShowSpeedBonus] = useState(false);
  
  // Add combo system to match PortGame
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  
  // Update gameStats in localStorage when user changes
  useEffect(() => {
    if (user) {
      const userKey = getUserKey();
      const savedStats = localStorage.getItem(`protocolGameStats_${userKey}`);
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
        localStorage.setItem(`protocolGameStats_${userKey}`, JSON.stringify(initialStats));
        setGameStats(initialStats);
      }
    }
  }, [user]);

  // Save game stats when they change
  useEffect(() => {
    if (gameStats) {
      const userKey = getUserKey();
      localStorage.setItem(`protocolGameStats_${userKey}`, JSON.stringify(gameStats));
    }
  }, [gameStats]);

  // Timer effect for time attack mode (matching PortGame.js)
  useEffect(() => {
    if (gameStarted && gameMode === GAME_MODES.TIME_ATTACK && timeRemaining > 0) {
      timerIdRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIdRef.current);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [gameStarted, gameMode, timeRemaining]);

  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get the protocol game from the database
        const response = await getAllGames({ type: 'protocols' });
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

  // Generate a new question and set answer start time
  const generateQuestion = () => {
    // Set the start time for this question
    setAnswerStartTime(Date.now());
    
    const port = getRandomPort();
    const protocol = PORT_DATA[port].protocol;
    const description = PORT_DATA[port].description || '';
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
    setShowGameOver(false);
    
    // Reset game state
    setCurrentQuestion(generateQuestion());
    setScore(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setCurrentStreak(0);
    
    // Reset combo system
    setCombo(0);
    setComboMultiplier(1);
    
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
    
    // Clear any existing timer if in time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK && timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }
    
    // Update game stats 
    const bestScoreUpdated = score > gameStats.bestScore;
    const bestStreakUpdated = currentStreak > gameStats.bestStreak;
    
    const updatedStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + incorrectAnswers,
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    
    // Store updated game stats
    setGameStats(updatedStats);
    localStorage.setItem(`protocolGameStats_${getUserKey()}`, JSON.stringify(updatedStats));
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
            // Celebrate level up with sound
            SoundManager.play('levelUp');
          }
        }
      } catch (error) {
        console.error("Exception when awarding XP:", error);
      }
    } else {
      console.log("No XP awarded - score was 0");
    }
    
    // Set game over state and play game over sound
    setShowGameOver(true);
    SoundManager.play('gameOver');
  };

  // Handle correct answer with enhanced feedback
  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    
    // Calculate time taken to answer
    const endTime = Date.now();
    const timeTaken = endTime - (answerStartTime || endTime);
    
    // Calculate speed bonus (max 50 points for answering in less than 2 seconds)
    const calculatedSpeedBonus = timeTaken < 2000 ? Math.round((2000 - timeTaken) / 40) : 0;
    setSpeedBonus(calculatedSpeedBonus);
    
    if (calculatedSpeedBonus > 0) {
      setShowSpeedBonus(true);
      setTimeout(() => setShowSpeedBonus(false), 1500);
    }
    
    // Update streak and set animation
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    setStreakAnimation(true);
    setTimeout(() => setStreakAnimation(false), 1000);
    
    // Update combo and combo multiplier
    const newCombo = combo + 1;
    setCombo(newCombo);
    
    // Update combo multiplier (increases every 3 combos)
    let newMultiplier = 1;
    if (newCombo >= 9) newMultiplier = 2.5;
    else if (newCombo >= 6) newMultiplier = 2;
    else if (newCombo >= 3) newMultiplier = 1.5;
    
    setComboMultiplier(newMultiplier);
    
    // Check if we should play combo sound
    if (newCombo === 3 || newCombo === 6 || newCombo === 9) {
      SoundManager.play('combo');
    }
    
    // Calculate score increase with multiplier
    const basePoints = 100;
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
    const totalMultiplier = difficultyMultiplier * newMultiplier;
    
    const scoreIncrease = Math.round(basePoints * totalMultiplier) + calculatedSpeedBonus;
    const newScore = score + scoreIncrease;
    
    // Show score animation
    setScore(newScore);
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 1000);
    
    // Show potential XP preview
    const potentialXp = Math.max(10, Math.floor(newScore / 10));
    setXpEarnedPreview(potentialXp);
    setShowXpPreview(true);
    setTimeout(() => setShowXpPreview(false), 2000);
    
    // Add time for time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      const bonusTime = 5 + Math.floor((newCombo / 5)); // Extra time for combos
      setTimeRemaining(prevTime => prevTime + bonusTime);
      setFeedback({
        show: true,
        isCorrect: true,
        message: `Correct! +${scoreIncrease} points (${totalMultiplier.toFixed(1)}x)${calculatedSpeedBonus > 0 ? `, +${calculatedSpeedBonus} speed bonus` : ''}, +${bonusTime}s`
      });
    } else {
      setFeedback({
        show: true,
        isCorrect: true,
        message: `Correct! +${scoreIncrease} points (${totalMultiplier.toFixed(1)}x)${calculatedSpeedBonus > 0 ? `, +${calculatedSpeedBonus} speed bonus` : ''}`
      });
    }
    
    // Hide feedback after delay and generate new question
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: true, message: '' });
      setUserAnswer('');
      setCurrentQuestion(generateQuestion()); // Generate new question
    }, 1500);
    
    // Update stats
    setCorrectAnswers(prev => prev + 1);
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    SoundManager.play('incorrect');
    
    // Reset streak and combo
    setCurrentStreak(0);
    setCombo(0);
    setComboMultiplier(1);
    
    const correctProtocol = currentQuestion.protocol;
    setIncorrectAnswers(prev => prev + 1);
    
    // Apply time penalty in time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      // Calculate new time after penalty
      const timePenalty = DIFFICULTY_LEVELS[difficulty].timePenalty;
      const newTime = Math.max(0, timeRemaining - timePenalty);
      setTimeRemaining(newTime);
      
      // If time is now zero, end the game immediately
      if (newTime <= 0) {
        // Show feedback briefly before ending game
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect. The correct answer is "${correctProtocol}". -${timePenalty}s time penalty`
        });
        
        // Short delay before ending game
        setTimeout(() => {
          endGame();
        }, 1000);
        return;
      }
      
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Incorrect. The correct answer is "${correctProtocol}". -${timePenalty}s time penalty`
      });
    } else {
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Incorrect. The correct answer is "${correctProtocol}"`
      });
    }
    
    // Hide feedback after delay and generate new question
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
      setUserAnswer('');
      setCurrentQuestion(generateQuestion()); // Generate new question
    }, 1500);
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

  // Memoize game stats row props to prevent unnecessary re-renders
  const gameStatsProps = useMemo(() => ({
    score,
    streak: currentStreak,
    combo,
    comboMultiplier,
    timeRemaining,
    showXpPreview,
    xpEarnedPreview,
    showSpeedBonus,
    speedBonus,
    isTimeAttack: gameMode === GAME_MODES.TIME_ATTACK,
    scoreAnimation,
    streakAnimation
  }), [
    score, 
    currentStreak, 
    combo, 
    comboMultiplier, 
    timeRemaining, 
    showXpPreview, 
    xpEarnedPreview, 
    showSpeedBonus, 
    speedBonus, 
    gameMode, 
    scoreAnimation, 
    streakAnimation
  ]);

  // Game mode selection and rendering
  if (!gameStarted) {
    if (showDifficultySelect) {
      return (
        <div className="protocol-game">
          <h2 className="game-title">Protocol Challenge</h2>
          
          <DifficultySelectScreen 
            difficultyLevels={DIFFICULTY_LEVELS}
            onSelectDifficulty={(difficulty) => {
              initializeGame(GAME_MODES.TIME_ATTACK, difficulty);
              scrollToTop();
            }}
            onBackClick={() => {
              setShowDifficultySelect(false);
              scrollToTop();
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="protocol-game">
        <h2 className="game-title">Protocol Challenge</h2>
        <p className="game-description">
          Test your knowledge of network protocols and their functions!
        </p>
        
        <GameModeSelectScreen 
          gameStats={gameStats}
          onTimeAttackSelect={() => {
            setShowDifficultySelect(true);
            scrollToTop();
          }}
          onPracticeModeSelect={() => {
            initializeGame(GAME_MODES.PRACTICE, 'EASY');
            scrollToTop();
          }}
        />
      </div>
    );
  }

  // Game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    return (
      <GameEndScreen
        gameTitle="Protocol Master Challenge"
        score={score}
        bestScore={gameStats.bestScore}
        xpEarned={Math.round(score / 10)}
        correctAnswers={correctAnswers}
        totalAttempts={correctAnswers + incorrectAnswers}
        bestStreak={Math.max(currentStreak, gameStats.bestStreak)}
        isNewHighScore={isNewHighScore}
        onPlayAgain={() => initializeGame(gameMode, difficulty)}
        onBackToMenu={() => {
          setShowGameOver(false);
          setGameMode(null);
          scrollToTop();
        }}
      />
    );
  }

  // Main game interface
  return (
    <div className="protocol-game">
      {/* Game Mode Display at the top */}
      <div className="game-mode-display">
        <div className="mode-indicator">
          {gameMode === GAME_MODES.TIME_ATTACK ? (
            <><FiClock size={18} /> Time Attack</>
          ) : (
            <><FiTarget size={18} /> Practice Mode</>
          )}
          <span className="difficulty-badge">{DIFFICULTY_LEVELS[difficulty].name}</span>
        </div>
      </div>
      
      {/* Use memoized GameStatsRow component with memoized props */}
      <MemoizedGameStatsRow {...gameStatsProps} />
      
      {/* Powerups (only in timed mode) */}
      {gameMode === GAME_MODES.TIME_ATTACK && (
        <div className="power-ups">
          <button 
            className={`power-up-btn ${powerUps.timeFreeze > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('timeFreeze')}
            disabled={powerUps.timeFreeze <= 0}
            title="Freeze the timer for 5 seconds"
          >
            <FiClock size={16} /> Freeze ({powerUps.timeFreeze})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.categoryReveal > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('categoryReveal')}
            disabled={powerUps.categoryReveal <= 0 || currentQuestion?.showCategory}
            title="Reveal the protocol category"
          >
            <FiTarget size={16} /> Category ({powerUps.categoryReveal})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.skipQuestion > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('skipQuestion')}
            disabled={powerUps.skipQuestion <= 0}
            title="Skip this question without penalty"
          >
            <FiSkipForward size={16} /> Skip ({powerUps.skipQuestion})
          </button>
        </div>
      )}
      
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
              aria-label="Protocol answer input"
            />
          </div>
          <CollectXpButton className="collect-xp-btn" onClick={endGame} />
        </form>
      </div>
    </div>
  );
}

export default ProtocolGame;
