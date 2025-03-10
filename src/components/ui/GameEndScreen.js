import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiAward, FiCheck, FiTrendingUp, FiTarget } from 'react-icons/fi';
import '../../styles/games/GameEndScreen.css';
import { UserContext } from '../../context/UserContext';
import { 
  FaTwitter, 
  FaWhatsapp,
  FaCamera,
  FaNetworkWired,
  FaTrophy,
  FaShare
} from 'react-icons/fa';

/**
 * Standardized Game End Screen component
 * @param {Object} props
 * @param {string} props.gameTitle - Title of the game
 * @param {number} props.score - Final score
 * @param {number} props.bestScore - Best score achieved
 * @param {number} props.xpEarned - XP earned from this game session
 * @param {number} props.correctAnswers - Number of correct answers
 * @param {number} props.totalAttempts - Total number of attempts
 * @param {number} props.bestStreak - Best streak achieved
 * @param {boolean} props.isNewHighScore - Whether this is a new high score
 * @param {Function} props.onPlayAgain - Callback for Play Again button
 * @param {Function} props.onBackToMenu - Callback for Back to Menu button
 * @param {Array} props.topicsProgress - Array of topics with progress percentages
 */
const GameEndScreen = ({
  gameTitle,
  score,
  bestScore,
  xpEarned,
  correctAnswers,
  totalAttempts,
  bestStreak,
  isNewHighScore,
  onPlayAgain,
  onBackToMenu,
  topicsProgress = []
}) => {
  const navigate = useNavigate();
  const { userStats } = useContext(UserContext);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareButtonHighlighted, setShareButtonHighlighted] = useState(false);
  const shareCardRef = useRef(null);
  const shareButtonRef = useRef(null);
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
  
  // Add an effect to highlight the share button after a short delay
  useEffect(() => {
    // After stats are shown, draw attention to the share button
    const highlightTimer = setTimeout(() => {
      setShareButtonHighlighted(true);
      
      // After highlighting, remove highlight after a few seconds
      const removeHighlightTimer = setTimeout(() => {
        setShareButtonHighlighted(false);
      }, 3000);
      
      return () => clearTimeout(removeHighlightTimer);
    }, 1500);
    
    return () => clearTimeout(highlightTimer);
  }, []);

  const handleShare = (platform) => {
    const shareText = `I just scored ${score}/${totalAttempts} on the ${gameTitle} in NetQuest! Can you beat my score? #NetQuest #NetworkingChallenge`;
    const shareUrl = window.location.origin;
    
    let shareLink;
    
    switch(platform) {
      case 'twitter':
        // Add UTM parameters for tracking
        const twitterUrl = `${shareUrl}?utm_source=twitter&utm_medium=social&utm_campaign=score_share`;
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(twitterUrl)}`;
        break;
      case 'whatsapp':
        // Add UTM parameters for tracking
        const whatsappUrl = `${shareUrl}?utm_source=whatsapp&utm_medium=social&utm_campaign=score_share`;
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + whatsappUrl)}`;
        break;
      case 'challenge':
        // Create a challenge link with the game type and score as parameters
        const gameType = gameTitle.toLowerCase().replace(/\s+/g, '-');
        // Add UTM parameters for better tracking of challenge links
        const challengeUrl = `${shareUrl}?game=${gameType}&challenge=${score}&by=${encodeURIComponent(userStats?.username || 'friend')}&utm_source=direct&utm_medium=challenge&utm_campaign=friend_challenge`;
        
        // Create a more compelling challenge message
        const challengeText = `🏆 CHALLENGE ACCEPTED? I just scored ${score} points on ${gameTitle} in NetQuest! Think you can beat me? Accept my challenge and prove your networking skills! ${challengeUrl}`;
        
        // Use the Web Share API if available, otherwise copy to clipboard
        if (navigator.share) {
          navigator.share({
            title: '⚡ NetQuest Challenge',
            text: challengeText,
          })
          .catch(error => console.log('Error sharing:', error));
          return;
        } else {
          navigator.clipboard.writeText(challengeText)
          .then(() => {
            alert('Challenge copied to clipboard! Share it with your friends and see if they can beat your score!');
          })
          .catch(err => {
            console.error('Failed to copy:', err);
          });
          return;
        }
      default:
        // Default case - shouldn't be reached with our new limited buttons
        if (navigator.share) {
          navigator.share({
            title: 'NetQuest Score',
            text: shareText,
            url: shareUrl,
          })
          .catch(error => console.log('Error sharing:', error));
          return;
        } else {
          navigator.clipboard.writeText(shareText + ' ' + shareUrl)
          .then(() => {
            alert('Share info copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
          return;
        }
    }
    
    window.open(shareLink, '_blank');
  };
  
  const getGameTitle = (type) => {
    switch(type) {
      case 'protocol':
        return 'Protocol Master Challenge';
      case 'acronym':
        return 'IT Acronym Quiz';
      case 'subnet':
        return 'Subnetting Challenge';
      case 'command':
        return 'Command Line Challenge';
      case 'firewall':
        return 'Firewall Rules Game';
      case 'encryption':
        return 'Encryption Challenge';
      case 'topology':
        return 'Network Topology Game';
      default:
        return 'NetQuest Game';
    }
  };
  
  // Add ShareCard overlay display logic
  const captureShareCard = () => {
    setShowShareCard(true);
  };

  // Function to close share card overlay
  const closeShareCard = () => {
    setShowShareCard(false);
  };

  // Function to copy card content to clipboard
  const copyCardContent = () => {
    const cardContent = `🏆 I just scored ${score}/${totalAttempts} (${accuracy}% accuracy) on ${gameTitle} in NetQuest! Can you beat my score? Try it at netquest.app #NetworkingChallenge`;
    
    navigator.clipboard.writeText(cardContent)
      .then(() => {
        alert('Card content copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Function to share directly from card
  const shareFromCard = (platform) => {
    const cardContent = `🏆 I just scored ${score}/${totalAttempts} (${accuracy}% accuracy) on ${gameTitle} in NetQuest! Can you beat my score?`;
    const shareUrl = 'https://netquest.app';
    
    let shareLink;
    
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(cardContent)}&url=${encodeURIComponent(shareUrl)}&hashtags=NetQuest,NetworkingChallenge`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(cardContent + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
  };
  
  return (
    <div className="game-end-screen">
      <div className="game-end-header">
        <h2 className={isNewHighScore ? 'new-high-score' : ''}>
          {isNewHighScore ? '🏆 New High Score! 🏆' : 'Game Over'}
        </h2>
        <h3 className="game-title">{gameTitle}</h3>
      </div>
      
      <div className="game-end-stats">
        <div className="stat-row primary">
          <div className="stat-item score">
            <FiBarChart2 className="stat-icon" />
            <span className="stat-label">Final Score</span>
            <span className={`stat-value ${isNewHighScore ? 'highlight' : ''}`}>{score}</span>
          </div>
          <div className="stat-item">
            <FiTrendingUp className="stat-icon" />
            <span className="stat-label">XP Earned</span>
            <span className="stat-value highlight-xp">+{xpEarned}</span>
          </div>
        </div>
        
        <div className="stat-row secondary">
          <div className="stat-item">
            <FiCheck className="stat-icon" />
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value">{correctAnswers}</span>
          </div>
          <div className="stat-item">
            <FiTarget className="stat-icon" />
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <FiAward className="stat-icon" />
            <span className="stat-label">Best Streak</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
      </div>
      
      {topicsProgress.length > 0 && (
        <div className="learning-progress">
          <h4>Topics Progress</h4>
          <div className="topics-grid">
            {topicsProgress.map((topic, index) => (
              <div key={index} className="topic-progress">
                <div className="topic-label">{topic.name}</div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${topic.progress}%` }}
                  ></div>
                </div>
                <div className="progress-percentage">{topic.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced Share Card Overlay */}
      {showShareCard && (
        <div className="shareable-card-overlay">
          <div className="shareable-card-container">
            <button className="close-card-button" onClick={closeShareCard}>×</button>
            
            <div className="shareable-card" ref={shareCardRef}>
              <div className="card-brand-header">
                <div className="logo">
                  <FaNetworkWired />
                </div>
                <div className="brand-name">NetQuest</div>
              </div>
              
              <h3>{gameTitle}</h3>
              
              <div className="score-display">
                {score}/{totalAttempts}
              </div>
              
              <div className="card-stats">
                <div className="card-stat">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{accuracy}%</span>
                </div>
                
                {bestStreak > 1 && (
                  <div className="card-stat">
                    <span className="stat-label">Best Streak</span>
                    <span className="stat-value streak">🔥 {bestStreak}</span>
                  </div>
                )}
              </div>
              
              <p className="tagline">Think you can beat me? Accept the challenge!</p>
              
              <div className="card-footer">
                <div className="website">netquest.app</div>
                <div className="qr-placeholder"></div>
              </div>
            </div>
            
            <div className="card-share-options">
              <button onClick={copyCardContent} className="copy-card-button">
                <FaShare /> Copy to Clipboard
              </button>
              <div className="direct-share-buttons">
                <button onClick={() => shareFromCard('twitter')} className="direct-share twitter">
                  <FaTwitter />
                </button>
                <button onClick={() => shareFromCard('whatsapp')} className="direct-share whatsapp">
                  <FaWhatsapp />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="game-end-buttons">
        <button 
          className="play-again-btn"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        <button 
          className="menu-btn"
          onClick={onBackToMenu}
        >
          Back to Menu
        </button>
        <button 
          className="dashboard-btn"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
      </div>
      
      {/* Gold Challenge Button below game-end-buttons */}
      <button 
        className="challenge-button"
        onClick={captureShareCard}
      >
        <FaTrophy /> Challenge Your Friends!
      </button>
    </div>
  );
};

export default GameEndScreen; 