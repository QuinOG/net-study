import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useStreak } from '../../hooks/useStreak';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames, submitGameResults } from '../../services/api';
import GameModeSelectScreen from '../ui/GameModeSelectScreen';
import DifficultySelectScreen from '../ui/DifficultySelectScreen';
import GameEndScreen from '../ui/GameEndScreen';
import '../../styles/games/PortGame.css';
import GameStatsRow from '../ui/GameStatsRow';
import PowerUpBar from '../ui/PowerUpBar';
import GameModeDisplay from '../ui/GameModeDisplay';
import QuestionCard from '../ui/QuestionCard';
import GameHUD from '../ui/GameHUD';
import MultipleChoiceAnswerSection from '../ui/MultipleChoiceAnswerSection';
import { 
  PORT_DATA, QUESTION_TYPES, GAME_MODES, DEFAULT_STATS, 
  DIFFICULTY_LEVELS, BONUS_TYPES,PORT_GAME_SETTINGS
} from '../../constants/gameConstants';

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
  const [incorrectAnswers, setCumulativeIncorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Initialize game stats with user-specific key
  const [gameStats, setGameStats] = useState(() => {
    const userKey = getUserKey();
    const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
  });
  
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [powerUps, setPowerUps] = useState(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    isCorrect: false
  });
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Add visual feedback state
  const [answerAnimation, setAnswerAnimation] = useState('');
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [xpEarnedPreview, setXpEarnedPreview] = useState(0);
  const [showXpPreview, setShowXpPreview] = useState(false);
  const questionRef = useRef(null);
  
  // Add combo system
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboMessage, setShowComboMessage] = useState(false);
  const [comboMessage, setComboMessage] = useState('');
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showSpeedBonus, setShowSpeedBonus] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  
  // Add particle effect state
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState('');
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  
  // Add streak milestones and rewards - increased thresholds for less spammy notifications
  const streakMilestones = PORT_GAME_SETTINGS.STREAK_MILESTONES;
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakReward, setStreakReward] = useState('');
  
  // Add surprise bonuses
  const [activeBonus, setActiveBonus] = useState(null);
  const [showBonusMessage, setShowBonusMessage] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [bonusTimeRemaining, setBonusTimeRemaining] = useState(0);
  
  // Add state for bonus XP earned from challenges
  const [bonusXpEarned, setBonusXpEarned] = useState(0);
  
  // Add notification cooldown timers to prevent spam
  const [comboCooldown, setComboCooldown] = useState(false);
  const [bonusCooldown, setBonusCooldown] = useState(false);
  const [streakCooldown, setStreakCooldown] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  
  // Added state for multiple choice
  const [options, setOptions] = useState([]);
  const [answerCooldown, setAnswerCooldown] = useState(false);
  
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

  // Load game stats from localStorage
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const userKey = getUserKey();
        
        // Load game stats from localStorage
        const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
        
        if (savedStats) {
          setGameStats(JSON.parse(savedStats));
        } else {
          // If no saved stats, initialize with defaults
          setGameStats(DEFAULT_STATS);
          localStorage.setItem(`portGameStats_${userKey}`, JSON.stringify(DEFAULT_STATS));
        }
        
        // Get game ID from API if needed for future features
        const gamesResponse = await getAllGames();
        const portGame = gamesResponse.data.data.find(game => 
          game.slug === 'port-master'
        );
        
        if (portGame) {
          setGameId(portGame.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        setLoading(false);
      }
    };
    
    loadGameData();
  }, []);
  
  // Monitor bonus time
  useEffect(() => {
    if (bonusTimeRemaining > 0 && gameStarted) {
      const timer = setTimeout(() => {
        setBonusTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (bonusTimeRemaining === 0 && activeBonus) {
      // End bonus when time runs out
      setActiveBonus(null);
      SoundManager.play('click');
    }
  }, [bonusTimeRemaining, gameStarted]);
  
  // Generate particles for effects
  const generateParticles = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <div key={i} className="particles" style={{ '--delay': `${i * 0.05}s` }}></div>
    ));
  };
  
  // Trigger random bonus (called occasionally during correct answers)
  const triggerRandomBonus = () => {
    // Don't show if we're in cooldown or if another notification was shown recently
    const currentTime = Date.now();
    const timeSinceLastNotification = currentTime - lastNotificationTime;
    if (bonusCooldown || activeBonus || timeSinceLastNotification < 3000 || Math.random() > 0.05) return;
    
    // Choose a random bonus
    const bonusTypes = Object.values(BONUS_TYPES);
    const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    
    // Set active bonus
    setActiveBonus(randomBonus);
    
    // Handle different bonus types
    switch (randomBonus) {
      case BONUS_TYPES.DOUBLE_POINTS:
        setBonusMessage('🔥 DOUBLE POINTS! 🔥');
        setBonusTimeRemaining(15); // 15 seconds of double points
        break;
        
      case BONUS_TYPES.EXTRA_TIME:
        if (gameMode === GAME_MODES.TIME_ATTACK) {
          const extraTime = 30;
          setTimeRemaining(prev => prev + extraTime);
          setBonusMessage(`⏱️ +${extraTime} SECONDS! ⏱️`);
        } else {
          // If not in time attack, give a different bonus
          setPowerUps(prev => ({...prev, skipQuestion: prev.skipQuestion + 1}));
          setBonusMessage('🎁 FREE SKIP POWER-UP! 🎁');
        }
        setBonusTimeRemaining(3); // Just show message for 3 seconds
        break;
        
      case BONUS_TYPES.POWER_UP:
        // Add one of each power-up
        setPowerUps(prev => ({
          timeFreeze: prev.timeFreeze + 1,
          categoryReveal: prev.categoryReveal + 1,
          skipQuestion: prev.skipQuestion + 1
        }));
        setBonusMessage('🎁 ALL POWER-UPS +1! 🎁');
        setBonusTimeRemaining(3); // Just show message for 3 seconds
        break;
        
      case BONUS_TYPES.INSTANT_POINTS:
        const bonusPoints = 250;
        setScore(prev => prev + bonusPoints);
        setBonusMessage(`💰 +${bonusPoints} BONUS POINTS! 💰`);
        setBonusTimeRemaining(3); // Just show message for 3 seconds
        break;
    }
    
    // Show bonus message
    setShowBonusMessage(true);
    setTimeout(() => {
      setShowBonusMessage(false);
    }, 2500);
    
    // Set cooldown for bonus messages
    setBonusCooldown(true);
    setTimeout(() => setBonusCooldown(false), 20000); // 20 second cooldown
    
    setLastNotificationTime(currentTime);
    
    // Trigger special particle effect
    const rect = questionRef.current?.getBoundingClientRect();
    if (rect) {
      setParticlePosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
      setParticleType('bonus');
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1800);
    }
    
    // Play special sound
    SoundManager.play('achievement');
  };

  // Get a random port from our dictionary
  const getRandomPort = () => {
    const portList = Object.keys(PORT_DATA);
    const randomIndex = Math.floor(Math.random() * portList.length);
    return portList[randomIndex];
  };

  // Get a random protocol from our dictionary
  const getRandomProtocol = () => {
    const protocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))];
    const randomIndex = Math.floor(Math.random() * protocols.length);
    return protocols[randomIndex];
  };

  // Generate port number options
  const generatePortOptions = (correctPort) => {
    const options = [correctPort];
    const portList = Object.keys(PORT_DATA);
    
    // Filter out the correct answer and shuffle
    const filteredPorts = portList
      .filter(port => port !== correctPort)
      .sort(() => 0.5 - Math.random());
    
    // Take 3 wrong answers and add the correct one
    options.push(...filteredPorts.slice(0, 1));
    
    // Shuffle and return
    return options.sort(() => 0.5 - Math.random());
  };

  // Generate protocol name options
  const generateProtocolOptions = (correctProtocol) => {
    // Get unique protocols
    const uniqueProtocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))];
    
    // Filter out the correct answer and shuffle
    const filteredProtocols = uniqueProtocols
      .filter(protocol => protocol !== correctProtocol)
      .sort(() => 0.5 - Math.random());
    
    // Take 3 wrong answers and add the correct one
    const options = [correctProtocol, ...filteredProtocols.slice(0, 1)];
    
    // Shuffle again and return
    return options.sort(() => 0.5 - Math.random());
  };

  // Generate a new question and set answer start time
  const generateQuestion = () => {
    // Set the start time for this question
    setAnswerStartTime(Date.now());
    
    // Randomly select question type
    const questionType = Math.random() > 0.5 ? QUESTION_TYPES.PORT : QUESTION_TYPES.PROTOCOL;
    
    if (questionType === QUESTION_TYPES.PORT) {
      // Create a "what is the port number" question
      const protocol = getRandomProtocol();
      
      // Find all ports that use this protocol
      const matchingPorts = Object.entries(PORT_DATA)
        .filter(([_, data]) => data.protocol === protocol)
        .map(([port, _]) => port);
      
      // Randomly select one of the ports if there are multiple
      const correctPort = matchingPorts[Math.floor(Math.random() * matchingPorts.length)];
      const portOptions = generatePortOptions(correctPort);
      
      setOptions(portOptions);
      
      return {
        type: QUESTION_TYPES.PORT,
        protocol: protocol,
        correctAnswer: correctPort,
        category: PORT_DATA[correctPort].category,
        hint: `Used for ${PORT_DATA[correctPort].category.toLowerCase()}`,
        showCategory: false
      };
    } else {
      // Create a "what is the protocol name" question
      const port = getRandomPort();
      const protocol = PORT_DATA[port].protocol;
      const protocolOptions = generateProtocolOptions(protocol);
      
      setOptions(protocolOptions);
      
      return {
        type: QUESTION_TYPES.PROTOCOL,
        port: port,
        correctAnswer: protocol,
        category: PORT_DATA[port].category,
        hint: `Used for ${PORT_DATA[port].category.toLowerCase()}`,
        showCategory: false
      };
    }
  };

  // Handle answer selection for multiple choice
  const handleAnswerClick = (selectedAnswer) => {
    // Prevent multiple submissions
    if (answerCooldown) return;
    
    setUserAnswer(selectedAnswer);
    setAnswerCooldown(true);
    
    // Check if the answer is correct
    const isCorrect = currentQuestion.correctAnswer === selectedAnswer;
    
    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };

    /////////////////////////
  // Handle Correct Answer //
  /////////////////////////

  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    
    // Calculate time taken to answer
    const endTime = Date.now();
    const timeTaken = endTime - (answerStartTime || endTime);
    
    // Check if we should show a notification based on last notification time
    const currentTime = Date.now();
    const timeSinceLastNotification = currentTime - lastNotificationTime;
    const canShowNotification = timeSinceLastNotification > 1000; // Minimum of 1 seconds between notifications
    
    // Calculate speed bonus (max 100 points for answering in less than 2 second)
    const calculatedSpeedBonus = timeTaken < 2000 ? Math.round((1000 - timeTaken) / 20) : 0;
    setSpeedBonus(calculatedSpeedBonus);
    
    // Only show speed bonus notification for significant bonuses (>=20) and if not too soon
    if (calculatedSpeedBonus >= 20 && canShowNotification) {
      setShowSpeedBonus(true);
      setTimeout(() => setShowSpeedBonus(false), 1000);
      setLastNotificationTime(currentTime);
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
    
    const multiplierChanged = newMultiplier > comboMultiplier;
    setComboMultiplier(newMultiplier);
    
    // Show combo message if multiplier changed or at significant milestones (reduced frequency)
    // Also check for cooldown to prevent spam
    if (!comboCooldown && canShowNotification && (multiplierChanged || newCombo === 5 || newCombo === 10 || newCombo === 15 || newCombo % 10 === 0)) {
      setComboMessage(`${newCombo}x Combo! ${newMultiplier}x Points`);
      setShowComboMessage(true);
      setTimeout(() => setShowComboMessage(false), 2000);
      
      // Set cooldown for combo messages
      setComboCooldown(true);
      setTimeout(() => setComboCooldown(false), 2000); // 2 second cooldown
      
      setLastNotificationTime(currentTime);
      
      // Play special sound for combo milestones
      SoundManager.play('streakMilestone');
      
      // Trigger particle effect
      const rect = questionRef.current?.getBoundingClientRect();
      if (rect) {
        setParticlePosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
        setParticleType('combo');
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1500);
      }
    }
    
    // Check for streak milestones - also check for cooldown
    if (!streakCooldown && streakMilestones.includes(newStreak) && !achievedMilestones.includes(newStreak) && canShowNotification) {
      // Add to achieved milestones
      setAchievedMilestones(prev => [...prev, newStreak]);
      
      // Generate reward based on streak milestone
      let reward = '';
      if (newStreak >= 15) {
        reward = 'Extra Time Freeze Power-up';
        setPowerUps(prev => ({...prev, timeFreeze: prev.timeFreeze + 1}));
      } else if (newStreak >= 10) {
        reward = 'Extra Skip Power-up';
        setPowerUps(prev => ({...prev, skipQuestion: prev.skipQuestion + 1}));
      } else {
        reward = 'Extra Category Power-up';
        setPowerUps(prev => ({...prev, categoryReveal: prev.categoryReveal + 1}));
      }
      
      // Show streak reward message
      setStreakReward(reward);
      setShowStreakReward(true);
      setTimeout(() => setShowStreakReward(false), 2500);
      
      // Set cooldown for streak messages
      setStreakCooldown(true);
      setTimeout(() => setStreakCooldown(false), 1000); // 1 second cooldown
      
      setLastNotificationTime(currentTime);
      
      // Play achievement sound
      SoundManager.play('achievement');
      
      // Trigger special particle effect
      const rect = questionRef.current?.getBoundingClientRect();
      if (rect) {
        setParticlePosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
        setParticleType('milestone');
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1800);
      }
    }
    
    // Possibly trigger a random bonus
    triggerRandomBonus();
    
    // Calculate score increase with multiplier and any active bonuses
    const basePoints = PORT_GAME_SETTINGS.BASE_POINTS;
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
    let totalMultiplier = difficultyMultiplier * comboMultiplier;
    
    // Apply double points bonus if active
    if (activeBonus === BONUS_TYPES.DOUBLE_POINTS) {
      totalMultiplier *= 2;
    }
    
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
    
    // Add time penalty for time attack mode
  const timePenalty = gameMode === GAME_MODES.TIME_ATTACK 
    ? DIFFICULTY_LEVELS[difficulty].timePenalty
    : 0;

  if (timePenalty > 0) {
    setTimeRemaining(prevTime => Math.max(0, prevTime + timePenalty));
  }

  // Customize feedback based on question type
  const feedbackMessage = currentQuestion.type === QUESTION_TYPES.PORT
    ? `${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}`
    : `Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}`;

  const timePenaltyText = timePenalty > 0 ? ` +${timePenalty}s added` : '';

  setFeedback({
    show: true,
    isCorrect: true,
    message: `Correct! ${feedbackMessage}${timePenaltyText}`,
  });
    
    // Hide feedback after delay and generate new question
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: true, message: '' });
      setUserAnswer('');
      setAnswerCooldown(false);
      setCurrentQuestion(generateQuestion()); // Generate new question
    }, 500);
    
    // Update stats
    setCorrectAnswers(prev => prev + 1);
    
    // Random bonuses
    triggerRandomBonus();
  };

   /////////////////////////////
  // Handle Incorrect Answer //
 /////////////////////////////

  const handleIncorrectAnswer = () => {
    SoundManager.play('incorrect');
    
    // Reset streak and combo
    setCurrentStreak(0);
    setCombo(0);
    setComboMultiplier(1);
    
    // Prepare visual feedback
    setAnswerAnimation('incorrect-animation');
    setTimeout(() => setAnswerAnimation(''), 1000);

    // Subtract time penalty for time attack mode
  const timePenalty = gameMode === GAME_MODES.TIME_ATTACK 
    ? DIFFICULTY_LEVELS[difficulty].timePenalty 
    : 0;

  if (timePenalty > 0) {
    setTimeRemaining(prevTime => Math.max(0, prevTime - timePenalty));
  }

  // Customize feedback based on question type
  const feedbackMessage = currentQuestion.type === QUESTION_TYPES.PORT
    ? `${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}`
    : `Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}`;

  const timePenaltyText = timePenalty > 0 ? ` -${timePenalty}s time penalty` : '';

  setFeedback({
    show: true,
    isCorrect: false,
    message: `Incorrect! ${feedbackMessage}${timePenaltyText}`,
  });
    
    // Hide feedback after delay and generate new question
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
      setUserAnswer('');
      setAnswerCooldown(false);
      setCurrentQuestion(generateQuestion()); // Generate new question
    }, 2000);
    
    // Update stats
    setCumulativeIncorrectAnswers(prev => prev + 1);
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
    const effect = PORT_GAME_SETTINGS.POWER_UP_EFFECTS[type];
    
    switch (type) {
      case 'timeFreeze':
        setTimeRemaining(prev => prev + effect.duration);
        setFeedback({
          show: true,
          message: `Time Freeze: +${effect.duration} seconds`,
          isCorrect: true
        });
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
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: false });
    }, 2000);
  };

  // Initialize game with selected mode and difficulty
  const initializeGame = (mode, diff) => {
    // Reset combo and streak tracking
    setCombo(0);
    setComboMultiplier(1);
    setAchievedMilestones([]);
    
    // Reset bonus state
    setActiveBonus(null);
    setBonusTimeRemaining(0);
    
    // Scroll to top when game initializes
    scrollToTop();
    
    setGameMode(mode);
    setDifficulty(diff);
    setGameStarted(true);
    setCurrentQuestion(generateQuestion());
    setShowGameOver(false);
    setScore(0);
    setCorrectAnswers(0);
    setCumulativeIncorrectAnswers(0);
    setCurrentStreak(0);
    
    // Set initial time based on difficulty
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    setStartTime(Date.now());
    
    // Reset power-ups
    setPowerUps(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
    
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
    const userKey = getUserKey();
    localStorage.setItem(`portGameStats_${userKey}`, JSON.stringify(updatedStats));
    console.log("Game stats updated:", updatedStats);
    
    // Calculate XP earned
    const xpEarned = score > 0 ? Math.max(10, Math.floor(score / 10)) : 0;
    
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

  // Game mode selection and rendering
  if (!gameStarted) {
    if (showDifficultySelect) {
      return (
        <div className="port-game">
          <h2 className="game-title">Network Protocol Challenge</h2>
          <p className="game-description">
            Test your knowledge of common network protocols and port numbers!
          </p>
          
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
      <div className="port-game">
        <h2 className="game-title">Network Protocol Challenge</h2>
        <p className="game-description">
          Test your knowledge of common network protocols and port numbers!
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

  // Show game over screen
  if (showGameOver) {
    return (
      <div className="port-game">
        <GameEndScreen
          gameTitle="Network Protocol Master"
          score={score}
          bestScore={gameStats.bestScore}
          xpEarned={score > 0 ? Math.max(10, Math.floor(score / 10)) : 0}
          correctAnswers={correctAnswers}
          totalAttempts={correctAnswers + incorrectAnswers}
          bestStreak={Math.max(currentStreak, gameStats.bestStreak)}
          isNewHighScore={score > gameStats.bestScore}
          onPlayAgain={() => {
            setShowGameOver(false);
            initializeGame(gameMode, difficulty);
          }}
          onBackToMenu={() => {
            setGameStarted(false);
            setGameMode(null);
            scrollToTop();
          }}
        />
      </div>
    );
  }

  // Main game interface
  return (
    <div className={`port-game ${gameStarted ? 'game-active' : ''}`}>

      {/* Immersive Game HUD Overlay - positioned absolutely over the game content */}
      <GameHUD 
          // Active bonus props
          activeBonus={activeBonus}
          bonusTimeRemaining={bonusTimeRemaining}
          
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
        
      {/* Game screen header */}
      <GameModeDisplay 
        gameMode={gameMode}
        difficulty={difficulty}
        difficultyLevels={DIFFICULTY_LEVELS}
      />
      
      {/* User Game Stats Row */}
      <GameStatsRow 
        score={score}
        streak={currentStreak}
        combo={combo}
        comboMultiplier={comboMultiplier}
        timeRemaining={timeRemaining}
        showXpPreview={showXpPreview}
        xpEarnedPreview={xpEarnedPreview}
        showSpeedBonus={showSpeedBonus}
        speedBonus={speedBonus}
        isTimeAttack={gameMode === GAME_MODES.TIME_ATTACK}
        scoreAnimation={scoreAnimation}
        streakAnimation={streakAnimation}
      />
      
      {/* Power-ups bar for timed game mode*/}
      <PowerUpBar 
        powerUps={powerUps}
        onPowerUpUse={handlePowerUp}
        isTimeAttack={gameMode === GAME_MODES.TIME_ATTACK}
        currentQuestion={currentQuestion}
      />

      
      
      <div className="game-content">
        {currentQuestion ? (
          <div className="game-layout">
            {/* Question Card */}
            <QuestionCard
              ref={questionRef}
              title={currentQuestion.type === QUESTION_TYPES.PORT 
                ? "What is the port number for:" 
                : "What protocol uses port:"}
              subtitle={currentQuestion.type === QUESTION_TYPES.PORT 
                ? currentQuestion.protocol 
                : currentQuestion.port}
              showHint={DIFFICULTY_LEVELS[difficulty].showHints}
              hint={currentQuestion.hint}
              animationClass={answerAnimation}
            >
              {currentQuestion.showCategory && (
                <span className="protocol-category">
                  ({currentQuestion.category})
                </span>
              )}
            </QuestionCard>
            
            {/* Multiple Choice Answers */}
            <MultipleChoiceAnswerSection
              options={options}
              userAnswer={userAnswer}
              correctAnswer={currentQuestion.correctAnswer}
              onAnswerClick={handleAnswerClick}
              answerCooldown={answerCooldown}
              onCollectClick={endGame}
            />
          </div>
        ) : (
          <div className="loading-question">
            <p>Loading question...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortGame;