import { useState, useCallback } from 'react';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [achievedMilestones, setAchievedMilestones] = useState([]);

  const getMultiplier = useCallback((streakCount) => {
    if (streakCount >= 9) return 2.5;
    if (streakCount >= 6) return 2.0;
    if (streakCount >= 3) return 1.5;
    return 1.0;
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    // Return relevant data for the game component
    return {
      streak: newStreak,
      multiplier: getMultiplier(newStreak),
      milestone: getMilestoneReward(newStreak, achievedMilestones),
    };
  }, [streak, achievedMilestones]);

  const handleWrongAnswer = useCallback(() => {
    setStreak(0);
  }, []);

  const getMilestoneReward = (streakCount, achieved) => {
    if (achieved.includes(streakCount)) return null;
    
    if (streakCount === 15) return { type: 'timeFreeze', amount: 1 };
    if (streakCount === 10) return { type: 'skipQuestion', amount: 1 };
    if (streakCount === 5) return { type: 'categoryReveal', amount: 1 };
    
    return null;
  };

  return {
    streak,
    multiplier: getMultiplier(streak),
    handleCorrectAnswer,
    handleWrongAnswer
  };
};