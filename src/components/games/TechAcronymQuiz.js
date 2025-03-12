import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames, submitGameResults } from '../../services/api';
import GameEndScreen from '../ui/GameEndScreen';
import { updateProgress, getGameTopicsProgress } from '../../utils/LearningProgressTracker';
import { FiClock, FiTarget, FiZap, FiShield, FiRefreshCw, FiSkipForward, FiAward, FiStar } from 'react-icons/fi';
import GameModeSelectScreen from '../ui/GameModeSelectScreen';
import DifficultySelectScreen from '../ui/DifficultySelectScreen';
import GameHUD from '../ui/GameHUD';
import GameStatsRow from '../ui/GameStatsRow';
import '../../styles/games/TechAcronymQuiz.css';

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

// Default statistics for new users
const DEFAULT_STATS = {
  bestScore: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  totalAttempts: 0,
  correctAnswers: 0
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
  
  // Initial loading of game stats from localStorage or API 
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Get user-specific key for localStorage
        const userKey = getUserKey();
        
        // Load game stats from localStorage
        const savedStats = localStorage.getItem(`acronymQuizStats_${userKey}`);
        
        if (savedStats) {
          setGameStats(JSON.parse(savedStats));
        } else {
          // If no saved stats found, initialize with defaults
          setGameStats(DEFAULT_STATS);
          localStorage.setItem(`acronymQuizStats_${userKey}`, JSON.stringify(DEFAULT_STATS));
        }
        
        // Get game ID from API if needed for future features
        const gamesResponse = await getAllGames();
        const techAcronymGame = gamesResponse.data.data.find(game => 
          game.slug === 'tech-acronym-quiz'
        );
        
        if (techAcronymGame) {
          setGameId(techAcronymGame.id);
        }
        
        // Initialize topics progress
        const initialTopicsProgress = getGameTopicsProgress('techAcronymQuiz', userKey);
        setTopicsProgress(initialTopicsProgress);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        setLoading(false);
      }
    };
    
    loadGameData();
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

  // Add state for enhanced HUD notifications
  const [showComboMessage, setShowComboMessage] = useState(false);
  const [comboMessage, setComboMessage] = useState('');
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showSpeedBonus, setShowSpeedBonus] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakReward, setStreakReward] = useState('');
  const [showBonusMessage, setShowBonusMessage] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);
  
  // Streak milestones with higher thresholds to reduce spam
  const streakMilestones = [10, 20, 30, 50, 100];
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  
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
    
    // Track answer start time for speed bonuses
    setAnswerStartTime(Date.now());
    
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
    
    // Calculate XP earned
    const xpEarned = score > 0 ? Math.max(10, Math.floor(score / 10)) : 0;
    
    // Update learning progress tracking
    const gameResults = {
      totalQuestions: correctAnswers + incorrectAnswers,
      correctAnswers: correctAnswers
    };
    
    const { topicsProgress } = updateProgress('techAcronymQuiz', userKey, gameResults, selectedCategory);
    setTopicsProgress(topicsProgress);
    
    // Award XP (minimum 10 XP if score > 0, otherwise score-based)
    if (score > 0) {
      try {
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
            console.log("Level Up!", result.newLevel);
            // Maybe add a level up celebration in the future
          }
        }
      } catch (error) {
        console.error("Error in XP award process:", error);
      }
    } else {
      console.log("No XP awarded - score is 0");
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

  // Handle answer selection with enhanced feedback
  const handleAnswerClick = (selectedAnswer) => {
    if (answerCooldown) return;
    
    // Set cooldown to prevent double-clicking
    setAnswerCooldown(true);
    
    // Calculate time taken to answer
    const endTime = Date.now();
    const timeTaken = endTime - (answerStartTime || endTime);
    
    // Calculate speed bonus (only for very fast answers under 1.5 seconds)
    const calculatedSpeedBonus = timeTaken < 1500 ? Math.round((1500 - timeTaken) / 30) : 0;
    setSpeedBonus(calculatedSpeedBonus);
    
    // Only show speed bonus notification for significant bonuses (>=20)
    if (calculatedSpeedBonus >= 20) {
      setShowSpeedBonus(true);
      setTimeout(() => setShowSpeedBonus(false), 2000);
    }
    
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
      
      // Calculate points with speed bonus
      const earnedPoints = Math.round((basePoints * difficultyMultiplier * timeBonusMultiplier * comboMultiplier) + calculatedSpeedBonus);
      
      // Update score and streak
      setScore(prev => prev + earnedPoints);
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 1000);
      
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1000);
      
      setCorrectAnswers(prev => prev + 1);
      
      // Update best streak immediately if needed
      if (newStreak > gameStats.bestStreak) {
        const updatedStats = {
          ...gameStats,
          bestStreak: newStreak
        };
        setGameStats(updatedStats);
        
        // Save to localStorage
        localStorage.setItem(`acronymQuizStats_${getUserKey()}`, JSON.stringify(updatedStats));
      }
      
      // Update combo (max 2.0)
      const newCombo = Math.min(combo + 0.1, 2.0);
      setCombo(newCombo);
      
      // Show combo message only at significant milestones
      if (newStreak === 5 || newStreak === 10 || newStreak % 10 === 0) {
        setComboMessage(`${newStreak}x Streak! ${newCombo.toFixed(1)}x Points`);
        setShowComboMessage(true);
        setTimeout(() => setShowComboMessage(false), 2000);
      }
      
      // Check for streak milestones
      if (streakMilestones.includes(newStreak) && !achievedMilestones.includes(newStreak)) {
        // Add to achieved milestones
        setAchievedMilestones(prev => [...prev, newStreak]);
        
        // Generate reward based on streak milestone
        let reward = '';
        if (newStreak >= 30) {
          reward = 'Extra Time for All Questions!';
          setPowerUps(prev => ({...prev, timeFreeze: prev.timeFreeze + 1}));
        } else if (newStreak >= 20) {
          reward = 'Skip Question Power-up';
          setPowerUps(prev => ({...prev, skipQuestion: prev.skipQuestion + 1}));
        } else {
          reward = 'Category Hint Power-up';
          setPowerUps(prev => ({...prev, categoryReveal: prev.categoryReveal + 1}));
        }
        
        // Show streak reward message
        setStreakReward(reward);
        setShowStreakReward(true);
        setTimeout(() => setShowStreakReward(false), 3000);
      }
      
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
    
    // Set new answer start time for the next question
    setAnswerStartTime(Date.now() + 1500); // Account for the delay
    
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

  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [topicsProgress, setTopicsProgress] = useState([]);
  
  return (
    <div className="acronym-game">
      <h2 className="game-title">Tech Acronym Quiz</h2>
      <p className="game-description">
        Test your knowledge of common technology acronyms and what they stand for!
      </p>
      
      {/* Game Over Screen */}
      {showGameOver && (
        <GameEndScreen
          gameTitle="Tech Acronym Quiz"
          score={score}
          bestScore={gameStats.bestScore}
          xpEarned={score > 0 ? Math.max(10, Math.floor(score / 10)) : 0}
          correctAnswers={correctAnswers}
          totalAttempts={correctAnswers + incorrectAnswers}
          bestStreak={Math.max(currentStreak, gameStats.bestStreak)}
          isNewHighScore={score > gameStats.bestScore}
          topicsProgress={topicsProgress}
          onPlayAgain={() => {
            setShowGameOver(false);
            initializeGame(gameMode, difficulty, selectedCategory);
          }}
          onBackToMenu={goBackToMenu}
        />
      )}
      
      {/* Mode Selection */}
      {showModeSelect && !gameStarted && (
        <GameModeSelectScreen 
          gameStats={gameStats}
          onTimeAttackSelect={() => {
            setGameMode(GAME_MODES.TIME_ATTACK);
            setShowModeSelect(false);
            setShowCategorySelect(true);
            scrollToTop();
          }}
          onPracticeModeSelect={() => {
            setGameMode(GAME_MODES.PRACTICE);
            setShowModeSelect(false);
            setShowCategorySelect(true);
            scrollToTop();
          }}
        />
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
          <h2>Tech Acronym Quiz</h2>
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
      
      {/* Game HUD for notifications */}
      {gameStarted && !showGameOver && (
        <GameHUD 
          // Feedback message props  
          feedbackShow={feedback.show}
          feedbackMessage={feedback.message}
          feedbackIsCorrect={feedback.isCorrect}
          onFeedbackHide={() => setFeedback({ show: false, isCorrect: false, message: '' })}
          
          // Combo/streak message props
          showCombo={showComboMessage}
          comboMessage={comboMessage}
          showBonus={showBonusMessage}
          bonusMessage={bonusMessage}
          showStreak={showStreakReward}
          streakReward={streakReward}
          currentStreak={currentStreak}
          
          // Speed bonus props
          showSpeedBonus={showSpeedBonus}
          speedBonus={speedBonus}
          
          // Context information for position-aware notifications
          score={score}
          combo={combo}
        />
      )}
      
      {/* Add GameStatsRow component */}
      {gameStarted && !showGameOver && (
        <GameStatsRow 
          score={score}
          streak={currentStreak}
          combo={combo}
          comboMultiplier={combo} // Same as combo for this game
          timeRemaining={timeRemaining}
          isTimeAttack={gameMode === GAME_MODES.TIME_ATTACK}
          scoreAnimation={scoreAnimation}
          streakAnimation={streakAnimation}
          speedBonus={speedBonus}
          showSpeedBonus={showSpeedBonus}
        />
      )}
    </div>
  );
}

export default TechAcronymQuiz;
