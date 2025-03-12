import React from 'react';
import '../../styles/ui/QuestionCard.css';

const QuestionCard = React.forwardRef(({ 
  title, 
  subtitle,
  showHint = false, 
  hint = '', 
  animationClass = '',
  children 
}, ref) => {
  return (
    <div className="question-container" ref={ref}>
      <div className={`question-text ${animationClass}`}>
        {title && <h3>{title}</h3>}
        
        {subtitle && (
          <div className="protocol-name">
            {subtitle}
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
});

export default QuestionCard; 