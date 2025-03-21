import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames } from '../../services/api';
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
  DIFFICULTY_LEVELS, BONUS_TYPES, PORT_GAME_SETTINGS
} from '../../constants/gameConstants';

function PortGame() {
  const navigate = useNavigate();
  const { userStats, addXP, user } = useContext(UserContext);
  const timerIdRef = useRef(null);
  const questionRef = useRef(null);
  
  const getUserKey = () => user?.id || user?.guestId || 'guest';
  
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
  const [multiplier, setMultiplier] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  
  const [gameStats, setGameStats] = useState(() => {
    const userKey = getUserKey();
    const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
  });
  
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [powerUps, setPowerUps] = useState(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
  const [feedback, setFeedback] = useState({ show: false, message: '', isCorrect: false });
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answerAnimation, setAnswerAnimation] = useState('');
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [xpEarnedPreview, setXpEarnedPreview] = useState(0);
  const [showXpPreview, setShowXpPreview] = useState(false);
  
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showSpeedBonus, setShowSpeedBonus] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState('');
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  
  const streakMilestones = PORT_GAME_SETTINGS.STREAK_MILESTONES;
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakReward, setStreakReward] = useState('');
  
  const [activeBonus, setActiveBonus] = useState(null);
  const [showBonusMessage, setShowBonusMessage] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [bonusTimeRemaining, setBonusTimeRemaining] = useState(0);
  
  const [options, setOptions] = useState([]);
  const [answerCooldown, setAnswerCooldown] = useState(false);
  
  useEffect(() => {
    if (user) {
      const userKey = getUserKey();
      const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
      setGameStats(savedStats ? JSON.parse(savedStats) : {
        bestScore: 0,
        bestStreak: 0,
        gamesPlayed: 0,
        totalAttempts: 0,
        correctAnswers: 0
      });
    }
  }, [user]);

  useEffect(() => {
    if (gameStats) localStorage.setItem(`portGameStats_${getUserKey()}`, JSON.stringify(gameStats));
  }, [gameStats]);

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

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const userKey = getUserKey();
        const savedStats = localStorage.getItem(`portGameStats_${userKey}`);
        setGameStats(savedStats ? JSON.parse(savedStats) : DEFAULT_STATS);
        const gamesResponse = await getAllGames();
        const portGame = gamesResponse.data.data.find(game => game.slug === 'port-master');
        if (portGame) setGameId(portGame.id);
        setLoading(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        setLoading(false);
      }
    };
    loadGameData();
  }, []);

  useEffect(() => {
    if (bonusTimeRemaining > 0 && gameStarted) {
      const timer = setTimeout(() => setBonusTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (bonusTimeRemaining === 0 && activeBonus) {
      setActiveBonus(null);
      SoundManager.play('click');
    }
  }, [bonusTimeRemaining, gameStarted]);

  const generateParticles = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <div key={i} className="particles" style={{ '--delay': `${i * 0.05}s` }}></div>
    ));
  };

  const triggerRandomBonus = () => {
    // Removed bonusCooldown, timeSinceLastNotification checks
    const bonusTypes = Object.values(BONUS_TYPES);
    const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    setActiveBonus(randomBonus);
    
    switch (randomBonus) {
      case BONUS_TYPES.DOUBLE_POINTS:
        setBonusMessage('🔥 DOUBLE POINTS! 🔥');
        setBonusTimeRemaining(15);
        break;
      case BONUS_TYPES.EXTRA_TIME:
        if (gameMode === GAME_MODES.TIME_ATTACK) {
          const extraTime = 30;
          setTimeRemaining(prev => prev + extraTime);
          setBonusMessage(`⏱️ +${extraTime} SECONDS! ⏱️`);
        } else {
          setPowerUps(prev => ({...prev, skipQuestion: prev.skipQuestion + 1}));
          setBonusMessage('🎁 FREE SKIP POWER-UP! 🎁');
        }
        setBonusTimeRemaining(3);
        break;
      case BONUS_TYPES.POWER_UP:
        setPowerUps(prev => ({
          timeFreeze: prev.timeFreeze + 1,
          categoryReveal: prev.categoryReveal + 1,
          skipQuestion: prev.skipQuestion + 1
        }));
        setBonusMessage('🎁 ALL POWER-UPS +1! 🎁');
        setBonusTimeRemaining(3);
        break;
      case BONUS_TYPES.INSTANT_POINTS:
        const bonusPoints = 250;
        setScore(prev => prev + bonusPoints);
        setBonusMessage(`💰 +${bonusPoints} BONUS POINTS! 💰`);
        setBonusTimeRemaining(3);
        break;
    }
    
    setShowBonusMessage(true); // No timeout to hide
    const rect = questionRef.current?.getBoundingClientRect();
    if (rect) {
      setParticlePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setParticleType('bonus');
      setShowParticles(true); // No timeout to hide
    }
    SoundManager.play('achievement');
  };

  const getRandomPort = () => {
    const portList = Object.keys(PORT_DATA);
    return portList[Math.floor(Math.random() * portList.length)];
  };

  const getRandomProtocol = () => {
    const protocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))];
    return protocols[Math.floor(Math.random() * protocols.length)];
  };

  const generatePortOptions = (correctPort) => {
    const options = [correctPort];
    const portList = Object.keys(PORT_DATA).filter(port => port !== correctPort).sort(() => 0.5 - Math.random());
    options.push(...portList.slice(0, 1));
    return options.sort(() => 0.5 - Math.random());
  };

  const generateProtocolOptions = (correctProtocol) => {
    const uniqueProtocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))]
      .filter(protocol => protocol !== correctProtocol)
      .sort(() => 0.5 - Math.random());
    const options = [correctProtocol, ...uniqueProtocols.slice(0, 1)];
    return options.sort(() => 0.5 - Math.random());
  };

  const generateQuestion = () => {
    setAnswerStartTime(Date.now());
    const questionType = Math.random() > 0.5 ? QUESTION_TYPES.PORT : QUESTION_TYPES.PROTOCOL;
    
    if (questionType === QUESTION_TYPES.PORT) {
      const protocol = getRandomProtocol();
      const matchingPorts = Object.entries(PORT_DATA)
        .filter(([_, data]) => data.protocol === protocol)
        .map(([port]) => port);
      const correctPort = matchingPorts[Math.floor(Math.random() * matchingPorts.length)];
      setOptions(generatePortOptions(correctPort));
      return {
        type: QUESTION_TYPES.PORT,
        protocol,
        correctAnswer: correctPort,
        category: PORT_DATA[correctPort].category,
        hint: `Used for ${PORT_DATA[correctPort].category.toLowerCase()}`,
        showCategory: false
      };
    } else {
      const port = getRandomPort();
      const protocol = PORT_DATA[port].protocol;
      setOptions(generateProtocolOptions(protocol));
      return {
        type: QUESTION_TYPES.PROTOCOL,
        port,
        correctAnswer: protocol,
        category: PORT_DATA[port].category,
        hint: `Used for ${PORT_DATA[port].category.toLowerCase()}`,
        showCategory: false
      };
    }
  };

  const handleAnswerClick = (selectedAnswer) => {
    if (answerCooldown) return;
    setUserAnswer(selectedAnswer);
    setAnswerCooldown(true);
    currentQuestion.correctAnswer === selectedAnswer ? handleCorrectAnswer() : handleIncorrectAnswer();
  };

  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    
    const endTime = Date.now();
    const timeTaken = endTime - (answerStartTime || endTime);
    
    const calculatedSpeedBonus = timeTaken < 2000 ? Math.round((1000 - timeTaken) / 20) : 0;
    setSpeedBonus(calculatedSpeedBonus);
    if (calculatedSpeedBonus >= 20) {
      setShowSpeedBonus(true); // No timeout to hide
    }
    
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    setStreakAnimation(true); // No timeout to hide
    
    let newMultiplier = 1;
    if (newStreak >= 9) newMultiplier = 2.5;
    else if (newStreak >= 6) newMultiplier = 2;
    else if (newStreak >= 3) newMultiplier = 1.5;
    setMultiplier(newMultiplier);
    
    if (streakMilestones.includes(newStreak) && !achievedMilestones.includes(newStreak)) {
      setAchievedMilestones(prev => [...prev, newStreak]);
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
      setStreakReward(reward);
      setShowStreakReward(true); // No timeout to hide
      SoundManager.play('achievement');
      const rect = questionRef.current?.getBoundingClientRect();
      if (rect) {
        setParticlePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setParticleType('milestone');
        setShowParticles(true); // No timeout to hide
      }
    }
    
    triggerRandomBonus();
    
    const basePoints = PORT_GAME_SETTINGS.BASE_POINTS;
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
    let totalMultiplier = difficultyMultiplier * newMultiplier;
    if (activeBonus === BONUS_TYPES.DOUBLE_POINTS) totalMultiplier *= 2;
    
    const scoreIncrease = Math.round(basePoints * totalMultiplier) + calculatedSpeedBonus;
    const newScore = score + scoreIncrease;
    setScore(newScore);
    setScoreAnimation(true); // No timeout to hide
    
    const potentialXp = Math.max(10, Math.floor(newScore / 10));
    setXpEarnedPreview(potentialXp);
    setShowXpPreview(true); // No timeout to hide
    
    const timePenalty = gameMode === GAME_MODES.TIME_ATTACK ? DIFFICULTY_LEVELS[difficulty].timePenalty : 0;
    if (timePenalty > 0) setTimeRemaining(prevTime => Math.max(0, prevTime + timePenalty));

    const feedbackMessage = currentQuestion.type === QUESTION_TYPES.PORT
      ? `${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}`
      : `Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}`;
    const timePenaltyText = timePenalty > 0 ? ` +${timePenalty}s added` : '';
    setFeedback({ show: true, isCorrect: true, message: `Correct! ${feedbackMessage}${timePenaltyText}` });
    
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: true, message: '' });
      setUserAnswer('');
      setAnswerCooldown(false);
      setCurrentQuestion(generateQuestion());
      // Reset popups for next answer
      setShowSpeedBonus(false);
      setShowStreakReward(false);
      setShowBonusMessage(false);
      setShowXpPreview(false);
      setShowParticles(false);
      setScoreAnimation(false);
      setStreakAnimation(false);
    }, 2000);
    
    setCorrectAnswers(prev => prev + 1);
  };

  const handleIncorrectAnswer = () => {
    SoundManager.play('incorrect');
    setCurrentStreak(0);
    setMultiplier(1);
    
    setAnswerAnimation('incorrect-animation');

    const timePenalty = gameMode === GAME_MODES.TIME_ATTACK ? DIFFICULTY_LEVELS[difficulty].timePenalty : 0;
    if (timePenalty > 0) setTimeRemaining(prevTime => Math.max(0, prevTime - timePenalty));

    const feedbackMessage = currentQuestion.type === QUESTION_TYPES.PORT
      ? `${currentQuestion.protocol} uses port ${currentQuestion.correctAnswer}`
      : `Port ${currentQuestion.port} uses ${currentQuestion.correctAnswer}`;
    const timePenaltyText = timePenalty > 0 ? ` -${timePenalty}s time penalty` : '';
    setFeedback({ show: true, isCorrect: false, message: `Incorrect! ${feedbackMessage}${timePenaltyText}` });
    
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, message: '' });
      setUserAnswer('');
      setAnswerCooldown(false);
      setCurrentQuestion(generateQuestion());
      setAnswerAnimation(''); // Reset animation after delay
    }, 2000);
    
    setCumulativeIncorrectAnswers(prev => prev + 1);
  };

  const handlePowerUp = (type) => {
    if (gameMode === GAME_MODES.PRACTICE || powerUps[type] <= 0) return;
    setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
    SoundManager.play('powerup');
    const effect = PORT_GAME_SETTINGS.POWER_UP_EFFECTS[type];
    
    switch (type) {
      case 'timeFreeze':
        setTimeRemaining(prev => prev + effect.duration);
        setFeedback({ show: true, message: `Time Freeze: +${effect.duration} seconds`, isCorrect: true });
        break;
      case 'categoryReveal':
        setCurrentQuestion(prev => ({ ...prev, showCategory: true }));
        setFeedback({ show: true, message: `Category: ${currentQuestion.category}`, isCorrect: true });
        break;
      case 'skipQuestion':
        setCurrentQuestion(generateQuestion());
        setFeedback({ show: true, message: 'Question skipped!', isCorrect: true });
        break;
    }
    setTimeout(() => setFeedback({ show: false, message: '', isCorrect: false }), 2000);
  };

  const initializeGame = (mode, diff) => {
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
    setMultiplier(1);
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    setStartTime(Date.now());
    setPowerUps(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
    setActiveBonus(null);
    setBonusTimeRemaining(0);
    setAchievedMilestones([]);
    SoundManager.play('gameStart');
  };

  const endGame = async () => {
    const updatedStats = {
      ...gameStats,
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + incorrectAnswers,
      correctAnswers: gameStats.correctAnswers + correctAnswers,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak)
    };
    setGameStats(updatedStats);
    localStorage.setItem(`portGameStats_${getUserKey()}`, JSON.stringify(updatedStats));
    
    const xpEarned = score > 0 ? Math.max(10, Math.floor(score / 10)) : 0;
    if (score > 0) await addXP(xpEarned);
    
    setShowGameOver(true);
    SoundManager.play('gameOver');
  };

  if (!gameStarted) {
    if (showDifficultySelect) {
      return (
        <div className="port-game">
          <h2 className="game-title">Network Protocol Challenge</h2>
          <p className="game-description">Test your knowledge of common network protocols and port numbers!</p>
          <DifficultySelectScreen 
            difficultyLevels={DIFFICULTY_LEVELS}
            onSelectDifficulty={(difficulty) => initializeGame(GAME_MODES.TIME_ATTACK, difficulty)}
            onBackClick={() => setShowDifficultySelect(false)}
          />
        </div>
      );
    }
    return (
      <div className="port-game">
        <h2 className="game-title">Network Protocol Challenge</h2>
        <p className="game-description">Test your knowledge of common network protocols and port numbers!</p>
        <GameModeSelectScreen 
          gameStats={gameStats}
          onTimeAttackSelect={() => setShowDifficultySelect(true)}
          onPracticeModeSelect={() => initializeGame(GAME_MODES.PRACTICE, 'EASY')}
        />
      </div>
    );
  }

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
          onPlayAgain={() => initializeGame(gameMode, difficulty)}
          onBackToMenu={() => { setGameStarted(false); setGameMode(null); }}
        />
      </div>
    );
  }

  return (
    <div className={`port-game ${gameStarted ? 'game-active' : ''}`}>
      <GameHUD 
        activeBonus={activeBonus}
        bonusTimeRemaining={bonusTimeRemaining}
        feedbackShow={feedback.show}
        feedbackMessage={feedback.message}
        feedbackIsCorrect={feedback.isCorrect}
        onFeedbackHide={() => setFeedback({ show: false, isCorrect: false, message: '' })}
        showBonus={showBonusMessage}
        bonusMessage={bonusMessage}
        showStreak={showStreakReward}
        streakReward={streakReward}
        currentStreak={currentStreak}
        showSpeedBonus={showSpeedBonus}
        speedBonus={speedBonus}
        score={score}
      />
      <GameModeDisplay gameMode={gameMode} difficulty={difficulty} difficultyLevels={DIFFICULTY_LEVELS} />
      <GameStatsRow 
        score={score}
        streak={currentStreak}
        multiplier={multiplier}
        timeRemaining={timeRemaining}
        showXpPreview={showXpPreview}
        xpEarnedPreview={xpEarnedPreview}
        showSpeedBonus={showSpeedBonus}
        speedBonus={speedBonus}
        isTimeAttack={gameMode === GAME_MODES.TIME_ATTACK}
        scoreAnimation={scoreAnimation}
        streakAnimation={streakAnimation}
      />
      <PowerUpBar 
        powerUps={powerUps}
        onPowerUpUse={handlePowerUp}
        isTimeAttack={gameMode === GAME_MODES.TIME_ATTACK}
        currentQuestion={currentQuestion}
      />
      <div className="game-content">
        {currentQuestion ? (
          <div className="game-layout">
            <QuestionCard
              ref={questionRef}
              title={currentQuestion.type === QUESTION_TYPES.PORT ? "What is the port number for:" : "What protocol uses port:"}
              subtitle={currentQuestion.type === QUESTION_TYPES.PORT ? currentQuestion.protocol : currentQuestion.port}
              showHint={DIFFICULTY_LEVELS[difficulty].showHints}
              hint={currentQuestion.hint}
              animationClass={answerAnimation}
            >
              {currentQuestion.showCategory && (
                <span className="protocol-category">({currentQuestion.category})</span>
              )}
            </QuestionCard>
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
          <div className="loading-question"><p>Loading question...</p></div>
        )}
      </div>
    </div>
  );
}

export default PortGame;