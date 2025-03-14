import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
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
import { PORT_DATA, QUESTION_TYPES, GAME_MODES, DEFAULT_STATS, DIFFICULTY_LEVELS, BONUS_TYPES } from '../../constants/gameConstants';

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
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
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
  const streakMilestones = [10, 20, 30, 50, 100]; // Increased from [5, 10, 15, 25, 50, 100]
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakReward, setStreakReward] = useState('');

  // Add daily challenge state
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyChallengeProgress, setDailyChallengeProgress] = useState(0);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [showDailyChallengeComplete, setShowDailyChallengeComplete] = useState(false);
  
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

  // Generate daily challenge on mount
  useEffect(() => {
    generateDailyChallenge();
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
  
  // Generate a daily challenge
  const generateDailyChallenge = () => {
    // Get today's date as a seed
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already completed today's challenge
    const completedKey = `portGame_dailyChallenge_${today}_${getUserKey()}`;
    const isCompleted = localStorage.getItem(completedKey) === 'completed';
    
    if (isCompleted) {
      setDailyChallengeCompleted(true);
    }
    
    // Choose a random challenge type
    const challengeTypes = [
      { type: 'streak', target: 10, description: 'Get a streak of 10 correct answers' },
      { type: 'accuracy', target: 90, description: 'Maintain 90% accuracy with at least 20 answers' },
      { type: 'score', target: 1500, description: 'Score 1500+ points in Time Attack mode' },
      { type: 'time', target: 120, description: 'Survive for 120 seconds in Time Attack Hard mode' },
      { type: 'combo', target: 8, description: 'Reach an 8x combo' }
    ];
    
    // Use date as seed for consistent daily challenge
    const seed = parseInt(today.replace(/-/g, ''));
    const selectedChallenge = challengeTypes[seed % challengeTypes.length];
    
    setDailyChallenge(selectedChallenge);
  };
  
  // Update daily challenge progress
  const updateDailyChallenge = (stats) => {
    if (!dailyChallenge || dailyChallengeCompleted) return;
    
    let progress = 0;
    
    switch (dailyChallenge.type) {
      case 'streak':
        progress = Math.min(100, (currentStreak / dailyChallenge.target) * 100);
        break;
      case 'accuracy':
        if (correctAnswers + incorrectAnswers >= 20) {
          const accuracy = (correctAnswers / (correctAnswers + incorrectAnswers)) * 100;
          progress = Math.min(100, (accuracy / dailyChallenge.target) * 100);
        } else {
          progress = Math.min(100, ((correctAnswers / 20) * 90 / dailyChallenge.target) * 100);
        }
        break;
      case 'score':
        progress = Math.min(100, (score / dailyChallenge.target) * 100);
        break;
      case 'time':
        if (gameMode === GAME_MODES.TIME_ATTACK && difficulty === 'HARD') {
          progress = Math.min(100, ((stats.timeElapsed || 0) / dailyChallenge.target) * 100);
        }
        break;
      case 'combo':
        progress = Math.min(100, (combo / dailyChallenge.target) * 100);
        break;
    }
    
    setDailyChallengeProgress(progress);
    
    // Check if challenge completed
    if (progress >= 100 && !dailyChallengeCompleted) {
      completeDailyChallenge();
    }
  };
  
  // Complete daily challenge
  const completeDailyChallenge = () => {
    // Mark as completed
    setDailyChallengeCompleted(true);
    
    // Store completion in localStorage
    const today = new Date().toISOString().split('T')[0];
    const completedKey = `portGame_dailyChallenge_${today}_${getUserKey()}`;
    localStorage.setItem(completedKey, 'completed');
    
    // Show completion message and give bonus
    setShowDailyChallengeComplete(true);
    setTimeout(() => {
      setShowDailyChallengeComplete(false);
    }, 3000);
    
    // Award bonus XP (will be applied when game ends)
    setBonusXpEarned(prev => prev + 50);
    
    // Add bonus power-ups
    setPowerUps(prev => ({
      timeFreeze: prev.timeFreeze + 1,
      categoryReveal: prev.categoryReveal + 1,
      skipQuestion: prev.skipQuestion + 1
    }));
    
    // Play achievement sound
    SoundManager.play('achievement');
  };
  
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

  // Handle correct answer with enhanced feedback
  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    
    // Calculate time taken to answer
    const endTime = Date.now();
    const timeTaken = endTime - (answerStartTime || endTime);
    
    // Check if we should show a notification based on last notification time
    const currentTime = Date.now();
    const timeSinceLastNotification = currentTime - lastNotificationTime;
    const canShowNotification = timeSinceLastNotification > 2000; // Minimum of 2 seconds between notifications
    
    // Calculate speed bonus (max 100 points for answering in less than 2 seconds)
    const calculatedSpeedBonus = timeTaken < 2000 ? Math.round((2000 - timeTaken) / 20) : 0;
    setSpeedBonus(calculatedSpeedBonus);
    
    // Only show speed bonus notification for significant bonuses (>=30) and if not too soon
    if (calculatedSpeedBonus >= 30 && canShowNotification) {
      setShowSpeedBonus(true);
      setTimeout(() => setShowSpeedBonus(false), 1500);
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
      setTimeout(() => setShowComboMessage(false), 1500);
      
      // Set cooldown for combo messages
      setComboCooldown(true);
      setTimeout(() => setComboCooldown(false), 5000); // 5 second cooldown
      
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
      if (newStreak >= 30) {
        reward = 'Extra Time Freeze Power-up';
        setPowerUps(prev => ({...prev, timeFreeze: prev.timeFreeze + 1}));
      } else if (newStreak >= 20) {
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
      setTimeout(() => setStreakCooldown(false), 10000); // 10 second cooldown
      
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
    
    // Update daily challenge
    updateDailyChallenge({ timeElapsed: timeRemaining });
    
    // Calculate score increase with multiplier and any active bonuses
    const basePoints = 100;
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
    
    // Add time for time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      const bonusTime = 5 + Math.floor((newCombo / 5)); // Extra time for combos
      setTimeRemaining(prevTime => prevTime + bonusTime);
      
      // Customize feedback based on question type
      if (currentQuestion.type === QUESTION_TYPES.PORT) {
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Correct! Port ${currentQuestion.correctAnswer} is used for ${currentQuestion.protocol}. +${scoreIncrease} points, +${bonusTime}s`
        });
      } else {
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Correct! Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}. +${scoreIncrease} points, +${bonusTime}s`
        });
      }
    } else {
      // Customize feedback based on question type
      if (currentQuestion.type === QUESTION_TYPES.PORT) {
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Correct! Port ${currentQuestion.correctAnswer} is used for ${currentQuestion.protocol}. +${scoreIncrease} points`
        });
      } else {
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Correct! Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}. +${scoreIncrease} points`
        });
      }
    }
    
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

  // Enhance incorrect answer feedback
  const handleIncorrectAnswer = () => {
    SoundManager.play('incorrect');
    
    // Reset streak and combo
    setCurrentStreak(0);
    setCombo(0);
    setComboMultiplier(1);
    
    // Prepare visual feedback
    setAnswerAnimation('incorrect-animation');
    setTimeout(() => setAnswerAnimation(''), 1000);
    
    // Add time penalty for time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      const timePenalty = DIFFICULTY_LEVELS[difficulty].timePenalty;
      setTimeRemaining(prevTime => Math.max(0, prevTime - timePenalty));
      
      // Customize feedback based on question type
      if (currentQuestion.type === QUESTION_TYPES.PORT) {
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect! ${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}. -${timePenalty}s time penalty`
        });
      } else {
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect! Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}. -${timePenalty}s time penalty`
        });
      }
    } else {
      // Customize feedback based on question type
      if (currentQuestion.type === QUESTION_TYPES.PORT) {
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect! ${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}`
        });
      } else {
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Incorrect! Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}`
        });
      }
    }
    
    // Hide feedback after delay and generate new question
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
      setUserAnswer('');
      setAnswerCooldown(false);
      setCurrentQuestion(generateQuestion()); // Generate new question
    }, 1500);
    
    // Update stats
    setIncorrectAnswers(prev => prev + 1);
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
