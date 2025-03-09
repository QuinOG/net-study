import React, { useState, useEffect, useContext } from 'react';
import { FiShare2, FiSmile, FiFrown, FiArrowRight } from 'react-icons/fi';
import '../../styles/games/NetworkTopologyGame.css';
import { UserContext } from '../../context/UserContext';
import GameModeCard from '../ui/GameModeCard';
import SoundManager from '../../utils/SoundManager';

function NetworkTopologyGame() {
  const { addXP } = useContext(UserContext);
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
      )}
      
      {gameState === 'setup' && selectedMode && (
        <div className="game-setup">
          <h3>Select Difficulty</h3>
          <div className="difficulty-select">
            {difficulties.map(difficulty => (
              <button 
                key={difficulty.id} 
                className="difficulty-btn"
                onClick={() => handleDifficultySelect(difficulty.id)}
              >
                {difficulty.label}
                <small>
                  {difficulty.questions} questions, {difficulty.timeLimit} seconds
                </small>
              </button>
            ))}
          </div>
          <button className="back-btn" onClick={() => setSelectedMode(null)}>
            Back to Modes
          </button>
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
        <div className="game-results">
          <h3>Game Results</h3>
          
          <div className="results-summary">
            <div className="score-display">
              <div className="score-value">{score}/{questions.length}</div>
              <div className="score-label">Score</div>
            </div>
            
            <div className="result-icon">
              {score / questions.length >= 0.7 ? 
                <FiSmile size={48} className="success-icon" /> : 
                <FiFrown size={48} className="failure-icon" />
              }
            </div>
            
            <div className="percentage-display">
              <div className="percentage-value">{Math.round((score / questions.length) * 100)}%</div>
              <div className="percentage-label">Correct</div>
            </div>
          </div>
          
          <div className="results-detail">
            <h4>Question Summary</h4>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="result-question">{result.question}</div>
                <div className="result-answer">
                  Your answer: {result.userAnswer}
                  {!result.isCorrect && (
                    <span className="correct-answer">
                      Correct answer: {result.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button className="restart-btn" onClick={resetGame}>
            <span>Play Again</span>
            <FiArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default NetworkTopologyGame; 