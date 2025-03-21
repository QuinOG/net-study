import { useState, useCallback } from 'react';
import { PORT_GAME_SETTINGS } from '../constants/gameConstants';
import SoundManager from '../utils/SoundManager';

export const usePowerUps = (gameMode) => {
  // Power-up states
  const [powerUps, setPowerUps] = useState(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
  const [activeBonus, setActiveBonus] = useState(null);
  const [bonusTimeRemaining, setBonusTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    isCorrect: false
  });

  // Check if a power-up is available
  const hasPowerUp = useCallback((type) => {
    return powerUps[type] > 0;
  }, [powerUps]);

  // Reset power-ups to initial state
  const resetPowerUps = useCallback(() => {
    setPowerUps(PORT_GAME_SETTINGS.INITIAL_POWER_UPS);
    setActiveBonus(null);
    setBonusTimeRemaining(0);
  }, []);

  // Add power-ups
  const addPowerUp = useCallback((type, amount = 1) => {
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] + amount
    }));
  }, []);

  // Handle power-up usage
  const handlePowerUp = useCallback((type, currentQuestion, setCurrentQuestion, setTimeRemaining) => {
    // No power-ups in practice mode or if all used
    if (gameMode === 'PRACTICE' || !hasPowerUp(type)) return false;

    // Update power-up count
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));

    SoundManager.play('powerup');

    // Apply power-up effect
    const effect = PORT_GAME_SETTINGS.POWER_UP_EFFECTS[type];

    switch (type) {
      case 'timeFreeze':
        setTimeRemaining(prev => prev + effect.duration);
        setFeedback({
          show: true,
          message: `Time Freeze: +${effect.duration} seconds`,
          isCorrect: true
        });
        break;

      case 'categoryReveal':
        setCurrentQuestion(prev => ({
          ...prev,
          showCategory: true
        }));
        setFeedback({
          show: true,
          message: `Category: ${currentQuestion.category}`,
          isCorrect: true
        });
        break;

      case 'skipQuestion':
        setCurrentQuestion(prev => ({
          ...prev,
          skipped: true
        }));
        setFeedback({
          show: true,
          message: 'Question skipped!',
          isCorrect: true
        });
        break;

      default:
        break;
    }

    return true;
  }, [gameMode, hasPowerUp]);

  return {
    // State
    powerUps,
    setPowerUps,
    activeBonus,
    setActiveBonus,
    bonusTimeRemaining,
    setBonusTimeRemaining,
    feedback,
    setFeedback,

    // Functions
    hasPowerUp,
    resetPowerUps,
    addPowerUp,
    handlePowerUp
  };
};

