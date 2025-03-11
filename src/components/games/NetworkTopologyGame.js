import React, { useState, useEffect, useContext } from 'react';
import { FiShare2, FiSmile, FiFrown, FiArrowRight } from 'react-icons/fi';
import '../../styles/games/NetworkTopologyGame.css';
import { UserContext } from '../../context/UserContext';
import GameModeCard from '../ui/GameModeCard';
import GameEndScreen from '../ui/GameEndScreen';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';

function NetworkTopologyGame() {
  const { addXP } = useContext(UserContext);
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'results'
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Game modes for network topology
  const gameModes = [
    {
      id: 'identify',
      title: 'Identify Topologies',
      description: 'Identify different network topologies from diagrams',
      icon: <FiShare2 />,
    },
    {
      id: 'design',
      title: 'Design Networks',
      description: 'Design network topologies to meet specific requirements',
      icon: <FiShare2 />,
    }
  ];

  // Difficulty levels
  const difficulties = [
    { id: 'easy', label: 'Easy', timeLimit: 60, questions: 5 },
    { id: 'medium', label: 'Medium', timeLimit: 45, questions: 8 },
    { id: 'hard', label: 'Hard', timeLimit: 30, questions: 10 }
  ];

  // Select game mode
  const handleModeSelect = (modeId) => {
    SoundManager.play('click');
    setSelectedMode(modeId);
  };

  // Select difficulty
  const handleDifficultySelect = (difficulty) => {
    SoundManager.play('click');
    setSelectedDifficulty(difficulty);
    
    // Generate questions based on mode and difficulty
    const generatedQuestions = generateQuestions(selectedMode, difficulty);
    setQuestions(generatedQuestions);
    
    // Start the game
    setGameState('playing');
    setQuestionIndex(0);
    setScore(0);
    setResults([]);
    
    // Set timer based on difficulty
    const difficultySettings = difficulties.find(d => d.id === difficulty);
    setTimeLeft(difficultySettings.timeLimit);
    setTimerActive(true);
  };

  // Generate dummy questions (in a real app, these would come from a database)
  const generateQuestions = (mode, difficulty) => {
    // This is a placeholder for demo purposes
    // In a real app, you would have a database of questions or generate them dynamically
    return Array(difficulties.find(d => d.id === difficulty).questions).fill().map((_, i) => ({
      id: i,
      question: `Question ${i + 1} for ${mode} mode (${difficulty} difficulty)`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      image: null // In a real app, this would be a network diagram
    }));
  };

  // Handle answer submission
  const handleSubmit = () => {
    SoundManager.play('click');
    
    // Check if answer is correct
    const isCorrect = userAnswer === questions[questionIndex].correctAnswer;
    
    // Add to results
    setResults(prev => [...prev, {
      question: questions[questionIndex].question,
      userAnswer,
      correctAnswer: questions[questionIndex].correctAnswer,
      isCorrect
    }]);
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Move to next question or show results
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
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
    setCurrentQuestion(null);
    setUserAnswer('');
    setScore(0);
    setQuestionIndex(0);
    setQuestions([]);
    setResults([]);
    setTimeLeft(0);
    setTimerActive(false);
  };

  return (
    <div className="game-interface network-topology-game">
      {gameState === 'setup' && !selectedMode && (
        <>
          <h3 className="game-title">Network Topology Challenge</h3>
          <p className="game-description">Test your knowledge of network topologies and design.</p>
          
          <div className="stats-container">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Best Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Questions Answered</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Games Played</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
          </div>
        
          <div className="game-setup">
            <h3>Network Topology Challenge</h3>
            <div className="game-modes">
              {gameModes.map(mode => (
                <GameModeCard 
                  key={mode.id}
                  title={mode.title}
                  description={mode.description}
                  icon={mode.icon}
                  onClick={() => handleModeSelect(mode.id)}
                />
              ))}
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
        </>
      )}
      
      {gameState === 'setup' && selectedMode && (
        <div className="game-setup">
          <h3>Select Difficulty</h3>
          <div className="difficulty-select">
            <div className="difficulty-cards">
              {difficulties.map(difficulty => (
                <button 
                  key={difficulty.id} 
                  className="difficulty-card"
                  onClick={() => handleDifficultySelect(difficulty.id)}
                >
                  <h4>{difficulty.label}</h4>
                  <ul>
                    <li>{difficulty.questions} questions</li>
                    <li>{difficulty.timeLimit} seconds time limit</li>
                    {difficulty.id === 'easy' && <li>Detailed explanations</li>}
                    {difficulty.id === 'medium' && <li>Moderate complexity</li>}
                    {difficulty.id === 'hard' && <li>Advanced network concepts</li>}
                  </ul>
                </button>
              ))}
            </div>
            <button className="back-btn" onClick={() => setSelectedMode(null)}>
              ← Back to Modes
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'playing' && (
        <div className="game-play">
          <div className="game-header">
            <div className="progress">
              Question {questionIndex + 1}/{questions.length}
            </div>
            <div className="timer">Time: {timeLeft}s</div>
            <div className="score">Score: {score}</div>
          </div>
          
          <div className="question-container">
            <h3>{questions[questionIndex].question}</h3>
            
            {questions[questionIndex].image && (
              <div className="question-image">
                <img src={questions[questionIndex].image} alt="Network Diagram" />
              </div>
            )}
            
            <div className="answer-options">
              {questions[questionIndex].options.map(option => (
                <button 
                  key={option}
                  className={`answer-option ${userAnswer === option ? 'selected' : ''}`}
                  onClick={() => setUserAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!userAnswer}
            >
              {questionIndex < questions.length - 1 ? 'Submit & Next' : 'Submit & Finish'}
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'results' && (
        <GameEndScreen
          gameTitle="Network Topology Game"
          score={score}
          bestScore={questions.length} // Using total questions as best score for now
          xpEarned={Math.round(score * 2)} // Adjust XP based on game difficulty
          correctAnswers={score}
          totalAttempts={questions.length}
          bestStreak={1} // This game doesn't track streaks, set to 1
          isNewHighScore={score === questions.length} // Perfect score is new high score
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

export default NetworkTopologyGame; 