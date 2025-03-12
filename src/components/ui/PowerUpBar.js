import React from 'react';
import { FiClock, FiTarget, FiSkipForward } from 'react-icons/fi';
import './PowerUpBar.css';

const PowerUpBar = ({ powerUps, onPowerUpUse, isTimeAttack, currentQuestion }) => {
  if (!isTimeAttack) return null;

  return (
    <div className="power-ups">
      <button 
        className={`power-up-btn ${powerUps.timeFreeze > 0 ? '' : 'disabled'}`}
        onClick={() => onPowerUpUse('timeFreeze')}
        disabled={powerUps.timeFreeze <= 0}
        title="Freeze the timer for 10 seconds"
      >
        <FiClock size={16} /> Freeze ({powerUps.timeFreeze})
      </button>
      
      <button 
        className={`power-up-btn ${powerUps.categoryReveal > 0 ? '' : 'disabled'}`}
        onClick={() => onPowerUpUse('categoryReveal')}
        disabled={powerUps.categoryReveal <= 0 || currentQuestion?.showCategory}
        title="Reveal the protocol category"
      >
        <FiTarget size={16} /> Category ({powerUps.categoryReveal})
      </button>
      
      <button 
        className={`power-up-btn ${powerUps.skipQuestion > 0 ? '' : 'disabled'}`}
        onClick={() => onPowerUpUse('skipQuestion')}
        disabled={powerUps.skipQuestion <= 0}
        title="Skip this question without penalty"
      >
        <FiSkipForward size={16} /> Skip ({powerUps.skipQuestion})
      </button>
    </div>
  );
};

export default PowerUpBar; 