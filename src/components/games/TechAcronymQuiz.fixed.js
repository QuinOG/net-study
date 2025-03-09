import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import { getAllGames, submitGameResults } from '../../services/api';
import '../../styles/games/TechAcronymQuiz.css';
import '../../styles/games/GameModeCards.css';

// Rest of your constants and ACRONYM_DATA remain unchanged

function TechAcronymQuiz() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats, user } = useContext(UserContext);
  const timerRef = useRef(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [gameId, setGameId] = useState(null);
  
  // Quiz state
  const [currentAcronym, setCurrentAcronym] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [startTime, setStartTime] = useState(null);
  
  // Add other state variables as needed
  
  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get the acronyms game from the database
        const response = await getAllGames({ type: 'acronyms' });
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
  const endGame = () => {
    // Clear any timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update game stats
    const newStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + incorrectAnswers,
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    
    setGameStats(newStats);
    localStorage.setItem('acronymQuizStats', JSON.stringify(newStats));
    
    // Award XP based on score
    const xpEarned = Math.round(score / 10);
    if (xpEarned > 0) {
      addXP(xpEarned);
      
      // Submit game results to backend if gameId exists
      if (gameId && user) {
        try {
          submitGameResults(gameId, {
            score: score,
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
            accuracy: (correctAnswers / (correctAnswers + incorrectAnswers)) * 100,
            xpEarned: xpEarned
          });
          
          // Update global stats if exists
          if (updateStats) {
            updateStats('acronymQuiz', {
              gamesPlayed: newStats.gamesPlayed,
              bestScore: newStats.bestScore,
              totalCorrect: newStats.correctAnswers
            });
          }
        } catch (error) {
          console.error("Error submitting game results:", error);
        }
      }
    }
    
    // Show game over screen
    setShowGameOver(true);
    
    // Play game over sound
    SoundManager.play('gameOver');
  };

  // Rest of your component methods

  return (
    // Your component JSX
    <div>
      {/* Your component UI */}
    </div>
  );
}

export default TechAcronymQuiz; 