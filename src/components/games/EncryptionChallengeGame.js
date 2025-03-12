import React, { useState, useEffect, useContext } from 'react';
import { FiLock, FiUnlock, FiKey, FiCheck, FiX, FiArrowRight, FiClock, FiTarget, FiZap, FiShield, FiRefreshCw, FiSkipForward, FiAward, FiStar } from 'react-icons/fi';
import '../../styles/games/EncryptionChallengeGame.css';
import '../../styles/games/GameModeCards.css';
import { UserContext } from '../../context/UserContext';
import GameModeCard from '../ui/GameModeCard';
import GameModeSelectScreen from '../ui/GameModeSelectScreen';
import DifficultySelectScreen from '../ui/DifficultySelectScreen';
import GameEndScreen from '../ui/GameEndScreen';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';

function EncryptionChallengeGame() {
  const { addXP } = useContext(UserContext);
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'results'
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Game statistics
  const [gameStats, setGameStats] = useState({
    bestScore: 0,
    gamesPlayed: 0,
    challengesCompleted: 0,
    decryptRate: '0%'
  });

  // Game modes for encryption challenge
  const gameModes = [
    {
      id: 'decrypt',
      title: 'Decrypt Messages',
      description: 'Decrypt messages using various cryptographic methods',
      icon: <FiUnlock />,
    },
    {
      id: 'identify',
      title: 'Identify Algorithms',
      description: 'Identify which encryption algorithm was used',
      icon: <FiKey />,
    }
  ];

  // Difficulty levels
  const difficulties = [
    { id: 'easy', label: 'Easy', timeLimit: 180, scenarios: 3 },
    { id: 'medium', label: 'Medium', timeLimit: 240, scenarios: 4 },
    { id: 'hard', label: 'Hard', timeLimit: 300, scenarios: 5 }
  ];

  // Convert difficulties array to the format expected by DifficultySelectScreen
  const difficultyLevels = {
    EASY: {
      timeLimit: difficulties[0].timeLimit,
      timePenalty: 10,
      multiplier: 1,
      hints: true
    },
    MEDIUM: {
      timeLimit: difficulties[1].timeLimit,
      timePenalty: 15,
      multiplier: 1.5,
      hints: false
    },
    HARD: {
      timeLimit: difficulties[2].timeLimit,
      timePenalty: 20,
      multiplier: 2,
      hints: false
    }
  };

  // Select game mode
  const handleModeSelect = (modeId) => {
    SoundManager.play('click');
    if (modeId === 'time-attack') {
      // Time attack mode
      setSelectedMode('decrypt');
    } else if (modeId === 'practice') {
      // Practice mode
      setSelectedMode('identify');
    } else {
      setSelectedMode(modeId);
    }
  };

  // Select difficulty
  const handleDifficultySelect = (difficulty) => {
    SoundManager.play('click');
    setSelectedDifficulty(difficulty);
    
    // Generate challenges based on mode and difficulty
    const generatedChallenges = generateChallenges(selectedMode, difficulty);
    setChallenges(generatedChallenges);
    
    // Start the game
    setGameState('playing');
    setChallengeIndex(0);
    setCurrentChallenge(generatedChallenges[0]);
    setScore(0);
    setResults([]);
    setUserAnswer('');
    
    // Set timer based on difficulty
    const difficultySettings = difficulties.find(d => d.id === difficulty);
    setTimeLeft(difficultySettings.timeLimit);
    setTimerActive(true);
  };

  // Generate dummy challenges (in a real app, these would come from a database)
  const generateChallenges = (mode, difficulty) => {
    // This is a placeholder for demo purposes
    const basicChallenges = [
      {
        id: 1,
        type: 'caesar',
        difficulty: 'easy',
        encryptedText: 'Xlmw mw e wmqtpi Geiwev gmtliv.',
        key: '4',
        originalText: 'This is a simple Caesar cipher.',
        algorithm: 'Caesar Cipher',
        hint: 'Each letter is shifted by a fixed number in the alphabet.'
      },
      {
        id: 2,
        type: 'substitution',
        difficulty: 'medium',
        encryptedText: 'Xqku ku z ukwors ulduxkxlxkgf ykorqj.',
        key: 'A=Z,B=Y,C=X,...',
        originalText: 'This is a simple substitution cipher.',
        algorithm: 'Substitution Cipher',
        hint: 'Each letter is replaced by a different letter consistently.'
      },
      {
        id: 3,
        type: 'vigenere',
        difficulty: 'hard',
        encryptedText: 'Xaos mj e jmsgnv Zmxvrvrv tmtyvv.',
        key: 'KEY',
        originalText: 'This is a simple Vigenere cipher.',
        algorithm: 'Vigenère Cipher',
        hint: 'Uses a keyword to determine shift values that vary by position.'
      }
    ];
    
    // Filter and multiply challenges based on difficulty
    const filteredChallenges = basicChallenges.filter(c => {
      if (difficulty === 'easy') return c.difficulty === 'easy';
      if (difficulty === 'medium') return c.difficulty === 'easy' || c.difficulty === 'medium';
      return true; // Hard includes all
    });
    
    const count = difficulties.find(d => d.id === difficulty).challenges;
    let result = [];
    
    // Create enough challenges to match the count
    while (result.length < count) {
      result = [...result, ...filteredChallenges];
    }
    
    // Trim to exact count and randomize
    return result.slice(0, count).sort(() => Math.random() - 0.5);
  };

  // Handle answer submission
  const handleSubmit = () => {
    SoundManager.play('click');
    
    const isCorrect = userAnswer.toLowerCase().trim() === 
      (selectedMode === 'decrypt' 
        ? currentChallenge.originalText.toLowerCase().trim() 
        : currentChallenge.algorithm.toLowerCase().trim());
    
    // Add to results
    setResults(prev => [...prev, {
      challenge: currentChallenge,
      userAnswer,
      correctAnswer: selectedMode === 'decrypt' 
        ? currentChallenge.originalText 
        : currentChallenge.algorithm,
      isCorrect
    }]);
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Move to next challenge or show results
    if (challengeIndex < challenges.length - 1) {
      setChallengeIndex(prev => prev + 1);
      setCurrentChallenge(challenges[challengeIndex + 1]);
      setUserAnswer('');
    } else {
      setGameState('results');
      setTimerActive(false);
      
      // Calculate XP based on score and difficulty
      const difficultyMultiplier = 
        selectedDifficulty === 'easy' ? 10 : 
        selectedDifficulty === 'medium' ? 20 : 30;
      
      const earnedXP = score * difficultyMultiplier;
      
      // Award XP
      addXP(earnedXP);
    }
  };

  // Get hint (costs time)
  const getHint = () => {
    SoundManager.play('click');
    // Reduce time as a penalty for getting a hint
    setTimeLeft(prev => Math.max(0, prev - 15));
    // Show hint (in a real app, this might update UI state to display the hint)
    alert(`Hint: ${currentChallenge.hint}\nKey: ${currentChallenge.key}`);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Time's up - move to results
      setGameState('results');
      setTimerActive(false);
      
      // Calculate XP based on current score
      const difficultyMultiplier = 
        selectedDifficulty === 'easy' ? 10 : 
        selectedDifficulty === 'medium' ? 20 : 30;
      
      const earnedXP = score * difficultyMultiplier;
      
      // Award XP
      addXP(earnedXP);
    }
    
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft, addXP, score, selectedDifficulty]);

  // Reset game
  const resetGame = () => {
    SoundManager.play('click');
    setGameState('setup');
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setCurrentChallenge(null);
    setUserAnswer('');
    setScore(0);
    setChallengeIndex(0);
    setChallenges([]);
    setResults([]);
    setTimeLeft(0);
    setTimerActive(false);
  };

  return (
    <div className="encryption-challenge-game">
      <h2 className="game-title">Encryption Challenge</h2>
      <p className="game-description">
        Test your knowledge of encryption algorithms and cryptographic concepts!
      </p>
      
      {gameState === 'setup' && !selectedMode && (
        <GameModeSelectScreen 
          gameStats={gameStats}
          onTimeAttackSelect={() => handleModeSelect('time-attack')}
          onPracticeModeSelect={() => handleModeSelect('practice')}
        />
      )}
      
      {gameState === 'setup' && selectedMode && (
        <div className="game-setup">
          <DifficultySelectScreen
            difficultyLevels={difficultyLevels}
            onSelectDifficulty={(difficulty) => handleDifficultySelect(difficulty.toLowerCase())}
            onBackClick={() => setSelectedMode(null)}
          />
        </div>
      )}
      
      {gameState === 'playing' && currentChallenge && (
        <div className="game-play">
          <div className="game-header">
            <div className="progress">
              Challenge {challengeIndex + 1}/{challenges.length}
            </div>
            <div className="timer">
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="score">Score: {score}</div>
          </div>
          
          <div className="challenge-container">
            {selectedMode === 'decrypt' && (
              <>
                <h3>Decrypt the following message:</h3>
                <div className="encrypted-text">
                  {currentChallenge.encryptedText}
                </div>
              </>
            )}
            
            {selectedMode === 'identify' && (
              <>
                <h3>Identify the encryption algorithm:</h3>
                <div className="algorithm-example">
                  <div>
                    <strong>Original:</strong> This is a test message.
                  </div>
                  <div>
                    <strong>Encrypted:</strong> {currentChallenge.encryptedText}
                  </div>
                </div>
              </>
            )}
            
            <div className="answer-input">
              <input 
                type="text" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={
                  selectedMode === 'decrypt' 
                    ? "Enter decrypted message..." 
                    : "Enter encryption algorithm name..."
                }
              />
              
              <button 
                className="hint-btn"
                onClick={getHint}
                title="Get a hint (costs 15 seconds)"
              >
                Get Hint
              </button>
              
              <button 
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
              >
                {challengeIndex < challenges.length - 1 ? 'Submit & Next' : 'Submit & Finish'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameState === 'results' && (
        <GameEndScreen
          gameTitle="Encryption Challenge"
          score={score}
          bestScore={challenges.length} // Using challenge length as the best score for now
          xpEarned={Math.round(score * 2)} // Adjust XP based on game difficulty
          correctAnswers={score}
          totalAttempts={challenges.length}
          bestStreak={1} // This game doesn't track streaks, set to 1
          isNewHighScore={score === challenges.length} // Perfect score is new high score
          onPlayAgain={() => resetGame()}
          onBackToMenu={() => {
            setGameState('setup');
            setSelectedMode(null);
          }}
        />
      )}
    </div>
  );
}

export default EncryptionChallengeGame; 