import React from 'react';
import EasyCard from './EasyCard';
import MediumCard from './MediumCard';
import HardCard from './HardCard';
import BackToModesButton from './BackToModesButton';
import '../../styles/ui/DifficultySelectScreen.css';

/**
 * A screen component for selecting difficulty levels
 * 
 * @param {Object} props Component props
 * @param {Object} props.difficultyLevels The difficulty level settings
 * @param {Function} props.onSelectDifficulty Function to call when a difficulty is selected
 * @param {Function} props.onBackClick Function to call when the back button is clicked
 * @returns {JSX.Element} A difficulty selection screen
 */
function DifficultySelectScreen({ 
  difficultyLevels, 
  onSelectDifficulty, 
  onBackClick 
}) {
  return (
    <div className="difficulty-select-screen">
      <h2 className="difficulty-select-title">Select Difficulty</h2>
      
      <div className="difficulty-cards-container">
        <EasyCard 
          settings={difficultyLevels.EASY} 
          onClick={() => onSelectDifficulty('EASY')} 
        />
        
        <MediumCard 
          settings={difficultyLevels.MEDIUM} 
          onClick={() => onSelectDifficulty('MEDIUM')} 
        />
        
        <HardCard 
          settings={difficultyLevels.HARD} 
          onClick={() => onSelectDifficulty('HARD')} 
        />
      </div>
      
      <BackToModesButton onClick={onBackClick} />
    </div>
  );
}

export default DifficultySelectScreen; 