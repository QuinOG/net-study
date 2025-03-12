import React, { useEffect, useState } from 'react';
import '../../styles/ui/ComboMessage.css';

const ComboMessage = ({ 
  showCombo = false, 
  comboMessage = '', 
  showBonus = false, 
  bonusMessage = '',
  showStreak = false,
  streakReward = '',
  currentStreak = 0
}) => {
  const [visibleCombo, setVisibleCombo] = useState(showCombo);
  const [visibleBonus, setVisibleBonus] = useState(showBonus);
  const [visibleStreak, setVisibleStreak] = useState(showStreak);

  // Handle combo message visibility
  useEffect(() => {
    setVisibleCombo(showCombo);
    if (showCombo) {
      const timer = setTimeout(() => {
        setVisibleCombo(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCombo]);

  // Handle bonus message visibility
  useEffect(() => {
    setVisibleBonus(showBonus);
    if (showBonus) {
      const timer = setTimeout(() => {
        setVisibleBonus(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showBonus]);

  // Handle streak reward visibility
  useEffect(() => {
    setVisibleStreak(showStreak);
    if (showStreak) {
      const timer = setTimeout(() => {
        setVisibleStreak(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showStreak]);

  return (
    <>
      {visibleCombo && (
        <div className="combo-message">{comboMessage}</div>
      )}
      
      {visibleBonus && (
        <div className="bonus-message">{bonusMessage}</div>
      )}
      
      {visibleStreak && (
        <div className="streak-reward">
          <div className="streak-milestone">🏆 {currentStreak} STREAK MILESTONE!</div>
          <div className="streak-reward-text">Reward: {streakReward}</div>
        </div>
      )}
    </>
  );
};

export default ComboMessage; 