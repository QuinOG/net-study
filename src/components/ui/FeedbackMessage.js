import React, { useEffect, useState } from 'react';
import '../../styles/ui/FeedbackMessage.css';

const FeedbackMessage = ({ show, message, isCorrect, autoHideDuration = 1500, onHide }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    if (show && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onHide) onHide();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onHide]);

  if (!visible) return null;

  return (
    <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
      {message}
    </div>
  );
};

export default FeedbackMessage; 