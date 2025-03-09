import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import '../../styles/ui/DailyChallenge.css';

const dailyChallenges = [
  {
    id: 'protocol_1',
    name: 'Protocol Expert',
    description: 'Score at least 90% on the Protocol Game',
    reward: 50,
    type: 'protocol',
    difficulty: 'medium'
  },
  {
    id: 'port_1',
    name: 'Port Master',
    description: 'Match 10 ports correctly without errors',
    reward: 75,
    type: 'port',
    difficulty: 'hard'
  },
  {
    id: 'subnet_1',
    name: 'Subnet Solver',
    description: 'Complete 5 subnetting challenges',
    reward: 60,
    type: 'subnet',
    difficulty: 'medium'
  },
  {
    id: 'acronym_1',
    name: 'Acronym Ace',
    description: 'Get a perfect score on the IT Acronym Game',
    reward: 65,
    type: 'acronym',
    difficulty: 'medium'
  },
  {
    id: 'quick_1',
    name: 'Speed Demon',
    description: 'Complete any game in under 2 minutes',
    reward: 40,
    type: 'any',
    difficulty: 'easy'
  },
  {
    id: 'streak_1',
    name: 'Dedicated Learner',
    description: 'Log in for the 3rd consecutive day',
    reward: 30,
    type: 'login',
    difficulty: 'easy'
  }
];

const DailyChallenge = ({ userStats = {}, onChallengeComplete }) => {
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [completed, setCompleted] = useState(false);

  // Get a challenge based on the current date
  useEffect(() => {
    // Use current date to seed the daily challenge selection
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const challengeIndex = hashCode(dateString) % dailyChallenges.length;
    
    // Set today's challenge
    setDailyChallenge(dailyChallenges[challengeIndex]);
    
    // Check if challenge is already completed today
    const lastCompleted = localStorage.getItem('lastDailyChallengeCompleted');
    if (lastCompleted === dateString) {
      setCompleted(true);
    }
    
    // Calculate time until reset
    updateTimeRemaining();
    const timer = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Update the time remaining until challenge reset
  const updateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };
  
  // Check if challenge is completed
  useEffect(() => {
    if (!dailyChallenge || completed || !userStats) return;
    
    // Logic to check if challenge is completed based on userStats
    let isComplete = false;
    
    switch(dailyChallenge.type) {
      case 'protocol':
        isComplete = (userStats.protocolAccuracy || 0) >= 90;
        break;
      case 'port':
        isComplete = (userStats.portMatchesWithoutErrors || 0) >= 10;
        break;
      case 'subnet':
        isComplete = (userStats.subnettingChallengesCompletedToday || 0) >= 5;
        break;
      case 'acronym':
        isComplete = userStats.acronymPerfectScore || false;
        break;
      case 'any':
        isComplete = (userStats.fastestGameCompletion || Infinity) < 120; // less than 2 minutes
        break;
      case 'login':
        isComplete = (userStats.currentStreak || 0) >= 3;
        break;
      default:
        break;
    }
    
    if (isComplete) {
      setCompleted(true);
      
      // Save completion date
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      localStorage.setItem('lastDailyChallengeCompleted', dateString);
      
      // Call the callback to add XP reward if available
      if (onChallengeComplete) {
        onChallengeComplete(dailyChallenge.reward);
      }
    }
  }, [dailyChallenge, userStats, completed, onChallengeComplete]);
  
  if (!dailyChallenge) return null;
  
  return (
    <div className="daily-challenge">
      <div className="challenge-header">
        <div className="time-remaining">Resets in: {timeRemaining}</div>
      </div>
      
      <div className={`challenge-card ${getDifficultyClass(dailyChallenge.difficulty)} ${completed ? 'completed' : ''}`}>
        <div className="challenge-icon">
          {getChallengeIcon(dailyChallenge.type)}
        </div>
        <div className="challenge-content">
          <h4>{dailyChallenge.name}</h4>
          <p>{dailyChallenge.description}</p>
          <div className="challenge-reward">
            <span>Reward: {dailyChallenge.reward} XP</span>
            {completed ? (
              <div className="completed-badge">Completed ✓</div>
            ) : (
              <Link to={`/${dailyChallenge.type}`}>
                <button className="challenge-btn">Go to Challenge</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to create a hash from a string
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper function to get icon for challenge type
const getChallengeIcon = (type) => {
  switch (type) {
    case 'protocol':
      return '📡';
    case 'port':
      return '🔌';
    case 'subnet':
      return '🌐';
    case 'acronym':
      return '📝';
    case 'any':
      return '⏱️';
    case 'login':
      return '🔥';
    default:
      return '🎮';
  }
};

// Helper function to get class based on difficulty
const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'difficulty-easy';
    case 'medium':
      return 'difficulty-medium';
    case 'hard':
      return 'difficulty-hard';
    default:
      return '';
  }
};

export default DailyChallenge; 