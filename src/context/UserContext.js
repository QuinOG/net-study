import React, { createContext, useState, useEffect } from 'react';

// Create context
export const UserContext = createContext();

// Default user stats
const defaultStats = {
  currentStreak: 0,
  lastLoginDate: null,
  totalXP: 0,
  protocolChallengesCompleted: 0,
  protocolAccuracy: 0,
  portsMatchedCorrectly: 0,
  portMatchesWithoutErrors: 0,
  subnettingChallengesCompleted: 0,
  subnettingChallengesCompletedToday: 0,
  acronymPerfectScore: false,
  fastestGameCompletion: 999999, // in seconds
  completedAchievements: [],
  gameHistory: []
};

export const UserProvider = ({ children }) => {
  const [userStats, setUserStats] = useState(() => {
    // Load saved stats from localStorage if available
    const savedStats = localStorage.getItem('netQuestUserStats');
    return savedStats ? JSON.parse(savedStats) : defaultStats;
  });
  
  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('netQuestUserStats', JSON.stringify(userStats));
  }, [userStats]);
  
  // Check and update streak on login
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date();
      const todayDate = today.toDateString();
      
      // If this is their first login, set streak to 1
      if (!userStats.lastLoginDate) {
        setUserStats(prev => ({
          ...prev,
          currentStreak: 1,
          lastLoginDate: todayDate
        }));
        return;
      }
      
      // If they've already logged in today, do nothing
      if (userStats.lastLoginDate === todayDate) {
        return;
      }
      
      // Check if their last login was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toDateString();
      
      if (userStats.lastLoginDate === yesterdayDate) {
        // Increase streak
        setUserStats(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          lastLoginDate: todayDate
        }));
      } else {
        // Streak broken
        setUserStats(prev => ({
          ...prev,
          currentStreak: 1,
          lastLoginDate: todayDate
        }));
      }
    };
    
    checkStreak();
  }, []);
  
  // Add XP with animation
  const addXP = (amount) => {
    setRewardXP(amount);
    setShowReward(true);
    
    // Update XP after animation
    setTimeout(() => {
      setUserStats(prev => ({
        ...prev,
        totalXP: prev.totalXP + amount
      }));
    }, 500);
  };
  
  // Update game stats
  const updateGameStats = (gameType, stats) => {
    switch(gameType) {
      case 'protocol':
        setUserStats(prev => ({
          ...prev,
          protocolChallengesCompleted: prev.protocolChallengesCompleted + 1,
          protocolAccuracy: stats.accuracy,
          gameHistory: [...prev.gameHistory, { 
            type: 'protocol', 
            score: stats.score,
            date: new Date().toISOString() 
          }]
        }));
        break;
      
      case 'port':
        setUserStats(prev => ({
          ...prev,
          portsMatchedCorrectly: prev.portsMatchedCorrectly + stats.correct,
          portMatchesWithoutErrors: stats.noErrors ? prev.portMatchesWithoutErrors + 1 : 0,
          gameHistory: [...prev.gameHistory, { 
            type: 'port', 
            score: stats.score,
            date: new Date().toISOString() 
          }]
        }));
        break;
        
      case 'subnet':
        setUserStats(prev => ({
          ...prev,
          subnettingChallengesCompleted: prev.subnettingChallengesCompleted + 1,
          subnettingChallengesCompletedToday: prev.subnettingChallengesCompletedToday + 1,
          gameHistory: [...prev.gameHistory, { 
            type: 'subnet', 
            score: stats.score,
            date: new Date().toISOString() 
          }]
        }));
        break;
        
      case 'acronym':
        setUserStats(prev => ({
          ...prev,
          acronymPerfectScore: stats.isPerfect,
          gameHistory: [...prev.gameHistory, { 
            type: 'acronym', 
            score: stats.score,
            date: new Date().toISOString() 
          }]
        }));
        break;
        
      default:
        break;
    }
    
    // Update fastest completion time if applicable
    if (stats.timeSeconds && stats.timeSeconds < userStats.fastestGameCompletion) {
      setUserStats(prev => ({
        ...prev,
        fastestGameCompletion: stats.timeSeconds
      }));
    }
    
    // Add XP reward
    addXP(stats.xpEarned || 20);
  };
  
  // Reset daily challenges at midnight
  useEffect(() => {
    const resetDailyStats = () => {
      setUserStats(prev => ({
        ...prev,
        subnettingChallengesCompletedToday: 0
      }));
    };
    
    // Calculate time until midnight
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const msToMidnight = night.getTime() - now.getTime();
    
    // Set timeout to reset at midnight
    const timeoutId = setTimeout(resetDailyStats, msToMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Handle reward animation completion
  const handleRewardComplete = () => {
    setShowReward(false);
    setRewardXP(0);
  };
  
  return (
    <UserContext.Provider
      value={{
        userStats,
        updateGameStats,
        addXP,
        showReward,
        rewardXP,
        handleRewardComplete
      }}
    >
      {children}
    </UserContext.Provider>
  );
}; 