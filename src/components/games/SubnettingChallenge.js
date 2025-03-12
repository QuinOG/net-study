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
import '../../styles/games/SubnettingChallenge.css';
import '../../styles/games/GameModeCards.css';
import GameModeCard from '../ui/GameModeCard';

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
  const { userStats, addXP, updateStats, user } = useContext(UserContext);
  const timerIdRef = useRef(null); // Add ref for timer ID
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameId, setGameId] = useState(null);
  
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
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  const [startTime, setStartTime] = useState(null);
  
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
    setIncorrectAnswers(0);
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
    
    setStartTime(Date.now());
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

  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get the subnetting game from the database
        const response = await getAllGames({ type: 'subnetting' });
        if (response.data.data.games.length > 0) {
          setGameId(response.data.data.games[0]._id);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, []);

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
    localStorage.setItem('subnettingGameStats', JSON.stringify(updatedStats));
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
    
    // Set game over state and play game over sound
    setShowGameOver(true);
    SoundManager.play('gameOver');
  };

  // Timer effect for time attack mode
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

  // Game mode selection and rendering
  if (!gameStarted) {
    if (showDifficultySelect) {
      return (
        <div className="subnetting-game">
          <h2 className="game-title">Subnetting Challenge</h2>
          
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
      <div className="subnetting-game">
        <h2 className="game-title">Subnetting Challenge</h2>
        <p className="game-description">
          Test your subnetting skills and calculate network addresses, broadcast addresses, and more!
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
        gameTitle="Subnetting Challenge"
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
          className="back-btn"
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
