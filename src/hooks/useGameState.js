import { useState } from 'react';
import { DEFAULT_STATS, PORT_GAME_SETTINGS } from '../constants/gameConstants';

export const useGameState = (getUserKey) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showGameOver, setShowGameOver] = useState(false);
  
  const [gameStats, setGameStats] = useState(() => {
    const savedStats = localStorage.getItem(`portGameStats_${getUserKey()}`);
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
  });

  return {
    gameState: {
      gameStarted,
      gameMode,
      difficulty,
      currentQuestion,
      score,
      correctAnswers,
      incorrectAnswers,
      timeRemaining,
      showGameOver,
      gameStats
    },
    gameStateActions: {
      setGameStarted,
      setGameMode,
      setDifficulty,
      setCurrentQuestion,
      setScore,
      setCorrectAnswers,
      setIncorrectAnswers,
      setTimeRemaining,
      setShowGameOver,
      setGameStats
    }
  };
};