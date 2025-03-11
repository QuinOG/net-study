import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiAward, FiCheck, FiTrendingUp, FiTarget, FiShare2, FiRotateCw, FiHome, FiLayout } from 'react-icons/fi';
import { 
  FaTwitter, 
  FaWhatsapp,
  FaShare,
  FaCamera,
  FaTrophy,
  FaMedal,
  FaDownload,
  FaStar,
  FaFireAlt,
  FaBolt,
  FaLightbulb,
  FaChartLine
} from 'react-icons/fa';
import '../../styles/games/GameEndScreen.css';
import { UserContext } from '../../context/UserContext';
import logo from '../../assets/images/netquest.png';

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
  const [animateStats, setAnimateStats] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [cardMousePosition, setCardMousePosition] = useState({ x: 0, y: 0 });
  const [isTilting, setIsTilting] = useState(false);
  const [tiltPosition, setTiltPosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const shareCardRef = useRef(null);
  const shareButtonRef = useRef(null);
  const gameEndScreenRef = useRef(null);
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
  
  // Check dark mode
  useEffect(() => {
    // Check if the user prefers dark mode or if it's set in the app
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const bodyHasDarkMode = document.body.classList.contains('dark-mode');
    setIsDarkMode(prefersDarkMode || bodyHasDarkMode);
    
    // Trigger stats animation after initial render
    setTimeout(() => {
      setAnimateStats(true);
      setIsAnimating(false);
    }, 600);
  }, []);
  
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
    const cardContent = `🏆 I achieved a score of ${score} with ${accuracy}% accuracy on ${gameTitle} in NetQuest! Can you beat my score? Try it at netquest.app #NetworkingChallenge`;
    
    navigator.clipboard.writeText(cardContent)
      .then(() => {
        alert('Card content copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Expanded achievement titles with more variety
  const getAchievementTitle = (score, totalAttempts, bestScore, isNewHighScore) => {
    const percentage = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
    
    if (isNewHighScore) return "New Personal Best!";
    if (percentage === 100) return "Perfect Score!";
    if (percentage >= 95) return "Networking Master!";
    if (percentage >= 90) return "Networking Expert!";
    if (percentage >= 85) return "Advanced Networker!";
    if (percentage >= 80) return "Network Pro!";
    if (percentage >= 75) return "Network Specialist!";
    if (percentage >= 70) return "Network Enthusiast!";
    if (percentage >= 65) return "Getting There!";
    if (percentage >= 60) return "Making Progress!";
    
    return "Challenge Complete!";
  };

  // Enhanced card styling based on score
  const getCardStyle = (score, totalAttempts, isNewHighScore) => {
    const percentage = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
    
    if (isNewHighScore) {
      return "new-record"; // Special styling for new records
    } else if (percentage === 100) {
      return "perfect-score"; // Gold background for perfect score
    } else if (percentage >= 80) {
      return "high-score"; // Silver background for high score
    } else if (percentage >= 60) {
      return "good-score"; // Bronze background for good score
    }
    
    return ""; // Default background
  };

  // Enhanced medal display
  const getMedalIcon = (score, totalAttempts, isNewHighScore) => {
    const percentage = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
    
    if (isNewHighScore) {
      return <FaStar className="medal new-record-star" />;
    } else if (percentage === 100) {
      return <FaTrophy className="medal gold" />;
    } else if (percentage >= 80) {
      return <FaMedal className="medal silver" />;
    } else if (percentage >= 60) {
      return <FaMedal className="medal bronze" />;
    }
    
    return null;
  };

  // Get motivational quote based on performance
  const getMotivationalQuote = (score, totalAttempts, isNewHighScore) => {
    const percentage = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
    
    if (isNewHighScore) {
      return "You've outdone yourself! Can your friends beat this?";
    } else if (percentage === 100) {
      return "Flawless victory! Challenge your friends to match this!";
    } else if (percentage >= 90) {
      return "So close to perfection! Share and inspire others!";
    } else if (percentage >= 80) {
      return "Excellent work! Share your impressive results!";
    } else if (percentage >= 70) {
      return "Great job! Challenge your peers to beat your score!";
    } else if (percentage >= 60) {
      return "Solid performance! Keep practicing and improving!";
    } else if (percentage >= 50) {
      return "You're making progress! Keep learning and growing!";
    }
    
    return "Every attempt is a step toward mastery. Keep going!";
  };
  
  // Get game icon for the shareable card
  const getGameIcon = (gameTitle) => {
    const gameName = gameTitle.toLowerCase();
    
    if (gameName.includes('protocol')) return <FiShare2 />;
    if (gameName.includes('acronym')) return <FiTarget />;
    if (gameName.includes('subnet')) return <FiTarget />;
    if (gameName.includes('command')) return <FiTarget />;
    if (gameName.includes('firewall')) return <FiTarget />;
    if (gameName.includes('encrypt')) return <FiTarget />;
    if (gameName.includes('topology')) return <FiTarget />;
    
    return <FiTarget />;
  };
  
  // Take a screenshot of the card (simplified version)
  const takeScreenshot = () => {
    alert('Screenshot functionality - in a real implementation, this would take a screenshot of the card');
  };
  
  // Handle card mouse movements for sparkle effect
  const handleCardMouseMove = (e) => {
    if (!shareCardRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCardMousePosition({ x, y });
    setShowSparkle(true);
    setSparklePosition({ x, y });
    
    // Hide sparkle after a short delay
    setTimeout(() => {
      setShowSparkle(false);
    }, 150);
  };
  
  // Handle card mouse leave
  const handleCardMouseLeave = () => {
    setShowSparkle(false);
  };
  
  // Toggle card flip
  const toggleCardFlip = () => {
    setCardFlipped(!cardFlipped);
  };
  
  // Handle 3D tilt effect
  const handleTiltMove = (e) => {
    if (!shareCardRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate tilt based on distance from center
    // Reduce the divisor to increase tilt effect
    const tiltX = ((mouseY - centerY) / (rect.height / 2)) * 10;
    const tiltY = ((mouseX - centerX) / (rect.width / 2)) * 10;
    
    setTiltPosition({ x: -tiltX, y: tiltY });
  };
  
  // Reset tilt when mouse leaves
  const handleTiltEnd = () => {
    setTiltPosition({ x: 0, y: 0 });
  };
  
  // Start tilting effect
  const startTilting = () => {
    setIsTilting(true);
  };
  
  // End tilting effect
  const stopTilting = () => {
    setIsTilting(false);
    handleTiltEnd();
  };
  
  // Function to handle sharing directly from the card
  const shareFromCard = (platform) => {
    handleShare(platform);
  };
  
  return (
    <div className={`game-end-screen ${isAnimating ? 'animating' : ''}`} ref={gameEndScreenRef}>
      <div className="game-end-header">
        <div className="game-result-banner">
          <div className="game-result-icon">
            {isNewHighScore ? <FaStar className="new-high-icon pulse" /> : <FaChartLine />}
          </div>
          {isNewHighScore ? (
            <h2 className="new-high-score">New High Score!</h2>
          ) : (
            <h2>{getAchievementTitle(score, totalAttempts, bestScore, isNewHighScore)}</h2>
          )}
        </div>
        <div className="game-title">{gameTitle}</div>
        
        {/* XP reward animation */}
        <div className="xp-reward">
          <div className="xp-icon"><FaBolt /></div>
          <div className="xp-amount">+{xpEarned} XP</div>
        </div>
      </div>
      
      <div className="game-end-stats">
        <div className="stat-row primary">
          <div className="stat-item score">
            <div className="score-medal">
              {getMedalIcon(score, totalAttempts, isNewHighScore)}
            </div>
            <div className="stat-value-container">
              <div className={`stat-value ${isNewHighScore ? 'highlight' : ''} ${animateStats ? 'animate' : ''}`}>
                {score}
              </div>
              <div className="stat-label">Final Score</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon"><FiCheck /></div>
            <div className="stat-value-container">
              <div className={`stat-value ${animateStats ? 'animate' : ''}`}>{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>
        
        <div className="stat-row secondary">
          <div className="stat-item">
            <div className="stat-icon"><FiBarChart2 /></div>
            <div className="stat-value-container">
              <div className={`stat-value ${bestScore < score ? 'highlight' : ''} ${animateStats ? 'animate-delay-1' : ''}`}>
                {bestScore}
              </div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon"><FiTrendingUp /></div>
            <div className="stat-value-container">
              <div className={`stat-value ${animateStats ? 'animate-delay-2' : ''}`}>
                {correctAnswers}/{totalAttempts}
              </div>
              <div className="stat-label">Correct/Total</div>
            </div>
          </div>
          
          {bestStreak > 1 && (
            <div className="stat-item">
              <div className="stat-icon streak-icon"><FaFireAlt /></div>
              <div className="stat-value-container">
                <div className={`stat-value ${animateStats ? 'animate-delay-3' : ''}`}>
                  {bestStreak}
                </div>
                <div className="stat-label">Best Streak</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Share Card Overlay with interactive elements */}
      {showShareCard && (
        <div className="shareable-card-overlay">
          <div className="confetti-container">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
          
          <div className="shareable-card-container">
            <button className="close-card-button" onClick={closeShareCard}>×</button>
            
            <div 
              className={`shareable-card ${getCardStyle(score, totalAttempts, isNewHighScore)} ${cardFlipped ? 'flipped' : ''} ${isDarkMode ? 'dark-theme' : ''}`} 
              ref={shareCardRef}
              onClick={toggleCardFlip}
              onMouseMove={isTilting ? handleTiltMove : handleCardMouseMove}
              onMouseEnter={startTilting}
              onMouseLeave={stopTilting}
              style={{
                transform: cardFlipped ? 'rotateY(180deg)' : `rotateY(${tiltPosition.y}deg) rotateX(${tiltPosition.x}deg)`,
                transition: isTilting ? 'transform 0.1s ease-out' : 'transform 0.6s ease-out'
              }}
            >
              {/* Front of card */}
              <div className="card-front">
                {/* Achievement Banner */}
                <div className="achievement-banner">
                  {getAchievementTitle(score, totalAttempts, bestScore, isNewHighScore)}
                </div>
                
                <div className="card-content">
                  <div className="card-brand-header">
                    <img src={logo} alt="NetQuest Logo" className="netquest-logo" />
                    <div className="brand-name">NetQuest</div>
                  </div>
                  
                  <h3>
                    {gameTitle}
                    <span className="game-icon-wrapper">{getGameIcon(gameTitle)}</span>
                  </h3>
                  
                  <div className="score-display">
                    Score of {score}
                    {getMedalIcon(score, totalAttempts, isNewHighScore)}
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
                    
                    <div className="card-stat">
                      <span className="stat-label">XP Earned</span>
                      <span className="stat-value xp">+{xpEarned}</span>
                    </div>
                  </div>
                  
                  <p className="tagline">{getMotivationalQuote(score, totalAttempts, isNewHighScore)}</p>
                </div>
                
                <div className="card-footer">
                  <div className="website">netquest.app</div>
                  <div className="card-instructions">Tap to flip</div>
                </div>
                
                {/* Visual sparkle effect on hover */}
                {showSparkle && (
                  <div 
                    className="card-sparkle" 
                    style={{ 
                      left: `${sparklePosition.x}px`, 
                      top: `${sparklePosition.y}px` 
                    }}
                  ></div>
                )}
              </div>
              
              {/* Back of card with additional info */}
              <div className="card-back">
                <div className="card-back-content">
                  <div className="card-brand-header">
                    <img src={logo} alt="NetQuest Logo" className="netquest-logo" />
                    <div className="brand-name">NetQuest</div>
                  </div>
                  
                  <h3>About {gameTitle}</h3>
                  
                  <div className="game-description">
                    Master essential networking skills through interactive challenges. 
                    Test your knowledge, improve your skills, and climb the ranks!
                  </div>
                  
                  <div className="stats-comparison">
                    <div className="comparison-item">
                      <span className="comparison-label">Your Score</span>
                      <span className="comparison-value">{score}</span>
                    </div>
                    <div className="comparison-item">
                      <span className="comparison-label">Best Score</span>
                      <span className="comparison-value">{bestScore}</span>
                    </div>
                    <div className="comparison-item">
                      <span className="comparison-label">Improvement</span>
                      <span className="comparison-value">
                        {bestScore > 0 
                          ? `${Math.round((score / bestScore) * 100)}%` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="skill-level">
                    <div className="skill-label">Skill Level:</div>
                    <div className="skill-meter">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${Math.min(100, (score / totalAttempts) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="website">netquest.app</div>
                  <div className="card-instructions">Tap to flip</div>
                </div>
              </div>
            </div>
            
            <div className="card-share-options">
              <div className="share-primary-buttons">
                <button onClick={copyCardContent} className="copy-card-button">
                  <FaShare /> Copy to Clipboard
                </button>
                <button onClick={takeScreenshot} className="screenshot-button">
                  <FaCamera /> Take Screenshot
                </button>
              </div>
              
              <div className="share-divider">
                <span>or share on</span>
              </div>
              
              <div className="direct-share-buttons">
                <button onClick={() => shareFromCard('twitter')} className="direct-share twitter" aria-label="Share on Twitter">
                  <FaTwitter />
                  <span className="share-tooltip">Twitter</span>
                </button>
                <button onClick={() => shareFromCard('whatsapp')} className="direct-share whatsapp" aria-label="Share on WhatsApp">
                  <FaWhatsapp />
                  <span className="share-tooltip">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="action-buttons-container">
        <div className="game-end-buttons">
          <button 
            className="play-again-btn"
            onClick={onPlayAgain}
          >
            <FiRotateCw /> Play Again
          </button>
          <button 
            className="menu-btn"
            onClick={onBackToMenu}
          >
            <FiHome /> Menu
          </button>
          <button 
            className="dashboard-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FiLayout /> Dashboard
          </button>
        </div>
        
        {/* Challenge Button */}
        <div className="challenge-button-container">
          <button 
            className={`challenge-button ${shareButtonHighlighted ? 'highlight-pulse' : ''}`}
            onClick={captureShareCard}
            ref={shareButtonRef}
          >
            <FaTrophy /> Challenge Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndScreen; 