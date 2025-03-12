import React from 'react';
import CollectXpButton from './CollectXpButton';
import '../../styles/ui/MultipleChoiceAnswerSection.css';

/**
 * A reusable multiple choice answer section component
 * 
 * @param {Object} props Component props
 * @param {Array} props.options Array of answer options to display
 * @param {string} props.userAnswer Currently selected answer
 * @param {string} props.correctAnswer The correct answer
 * @param {Function} props.onAnswerClick Function to call when an answer is clicked
 * @param {boolean} props.answerCooldown Whether answer selection is currently on cooldown
 * @param {Function} props.onCollectClick Function to call when collect button is clicked
 * @returns {JSX.Element} Multiple choice answer section
 */
function MultipleChoiceAnswerSection({
  options,
  userAnswer,
  correctAnswer,
  onAnswerClick,
  answerCooldown,
  onCollectClick
}) {
  return (
    <div className="answer-section">
      <div className="answer-options">
        {options.map((option, index) => (
          <button 
            key={index}
            className={`answer-option ${userAnswer === option ? 
              (option === correctAnswer ? 'correct' : 'incorrect') : ''}`}
            onClick={() => onAnswerClick(option)}
            disabled={answerCooldown}
          >
            {option}
          </button>
        ))}
      </div>
      
      {/* End game and collect button */}
      <CollectXpButton className="collect-xp-btn" onClick={onCollectClick} />
    </div>
  );
}

export default MultipleChoiceAnswerSection; 