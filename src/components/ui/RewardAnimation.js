import React, { useEffect, useState } from 'react';
import '../../styles/ui/RewardAnimation.css';

const RewardAnimation = ({ xpGained, show, onComplete }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (show) {
      // Generate random particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        duration: Math.random() * 1 + 1,
        delay: Math.random() * 0.5
      }));
      
      setParticles(newParticles);
      
      // Cleanup animation after it's done
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="reward-animation-container">
      <div className="reward-center">
        <div className="xp-text-large">+{xpGained} XP</div>
        <div className="particles-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: `translate(${particle.x}px, ${particle.y}px)`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get a random color
const getRandomColor = () => {
  const colors = [
    '#f56565', // red
    '#ed8936', // orange
    '#ecc94b', // yellow
    '#48bb78', // green
    '#38b2ac', // teal
    '#4299e1', // blue
    '#667eea', // indigo
    '#9f7aea', // purple
    '#ed64a6', // pink
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

export default RewardAnimation; 