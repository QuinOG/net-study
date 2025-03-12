import React from 'react';
import '../../styles/ui/QuestionCard.css';

const QuestionCard = ({ 
  title, 
  subtitle,
  description, 
  showHint = false, 
  hint = '', 
  animationClass = '',
  children 
}) => {
  return (
    <div className="question-container">
      <div className={`question-text ${animationClass}`}>
        {title && <h3>{title}</h3>}
        
        {subtitle && (
          <div className="protocol-name">
            {subtitle}
          </div>
        )}
        
        {description && (
          <div className="protocol-description">
            {description}
          </div>
        )}
        
        {showHint && hint && (
          <div className="hint">
            <span className="hint-label">Hint:</span> {hint}
          </div>
        )}
      </div>

      {/* Render additional content passed as children */}
      {children}
    </div>
  );
};

export default QuestionCard; 