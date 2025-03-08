import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import '../../styles/ui/Achievements.css';

const achievements = [
  // Network Fundamentals
  { id: 'proto_beginner', name: 'Protocol Beginner', description: 'Complete 5 protocol challenges', requirement: 5, category: 'protocol', icon: '🔰' },
  { id: 'proto_novice', name: 'Protocol Novice', description: 'Complete 15 protocol challenges', requirement: 15, category: 'protocol', icon: '📡' },
  { id: 'proto_expert', name: 'Protocol Expert', description: 'Complete 50 protocol challenges', requirement: 50, category: 'protocol', icon: '🏆' },
  { id: 'proto_master', name: 'Protocol Master', description: 'Achieve 100% accuracy in 10 protocol challenges', requirement: 10, category: 'protocol', icon: '👑' },
  
  // Port Numbers
  { id: 'port_beginner', name: 'Port Explorer', description: 'Match 10 ports correctly', requirement: 10, category: 'port', icon: '🚪' },
  { id: 'port_novice', name: 'Port Navigator', description: 'Match 30 ports correctly', requirement: 30, category: 'port', icon: '🔌' },
  { id: 'port_expert', name: 'Port Authority', description: 'Match 100 ports correctly', requirement: 100, category: 'port', icon: '⚓' },
  { id: 'port_master', name: 'Port Master', description: 'Get a perfect score 5 times in a row', requirement: 5, category: 'port', icon: '🌟' },
  
  // Subnetting
  { id: 'subnet_beginner', name: 'Subnet Starter', description: 'Complete 5 subnetting challenges', requirement: 5, category: 'subnet', icon: '🌐' },
  { id: 'subnet_novice', name: 'Subnet Solver', description: 'Complete 15 subnetting challenges', requirement: 15, category: 'subnet', icon: '🧩' },
  { id: 'subnet_expert', name: 'Subnet Wizard', description: 'Complete 30 subnetting challenges', requirement: 30, category: 'subnet', icon: '🧙' },
  { id: 'subnet_master', name: 'Subnet Master', description: 'Solve CIDR /30 and below challenges with 90% accuracy', requirement: 5, category: 'subnet', icon: '⭐' },
  
  // Streak Achievements
  { id: 'streak_beginner', name: 'Habit Forming', description: 'Maintain a 3-day streak', requirement: 3, category: 'streak', icon: '🔥' },
  { id: 'streak_novice', name: 'Commitment', description: 'Maintain a 7-day streak', requirement: 7, category: 'streak', icon: '🔥🔥' },
  { id: 'streak_expert', name: 'Dedication', description: 'Maintain a 14-day streak', requirement: 14, category: 'streak', icon: '🔥🔥🔥' },
  { id: 'streak_master', name: 'Unstoppable', description: 'Maintain a 30-day streak', requirement: 30, category: 'streak', icon: '🔥🔥🔥🔥' },
];

const AchievementSystem = ({ userStats }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentUnlock, setRecentUnlock] = useState(null);

  useEffect(() => {
    // Check for unlocked achievements based on user stats
    const newUnlocked = achievements.filter(achievement => {
      switch(achievement.category) {
        case 'protocol':
          return userStats.protocolChallengesCompleted >= achievement.requirement;
        case 'port':
          return userStats.portsMatchedCorrectly >= achievement.requirement;
        case 'subnet':
          return userStats.subnettingChallengesCompleted >= achievement.requirement;
        case 'streak':
          return userStats.currentStreak >= achievement.requirement;
        default:
          return false;
      }
    }).map(a => a.id);
    
    // Find newly unlocked achievements
    const newlyUnlocked = newUnlocked.filter(id => !unlockedAchievements.includes(id));
    
    if (newlyUnlocked.length > 0) {
      // Get the most recent achievement unlocked
      const recentAchievement = achievements.find(a => a.id === newlyUnlocked[0]);
      setRecentUnlock(recentAchievement);
      
      // Clear the notification after 5 seconds
      setTimeout(() => {
        setRecentUnlock(null);
      }, 5000);
    }
    
    setUnlockedAchievements(newUnlocked);
  }, [userStats]);

  return (
    <div className="achievements-container">
      {recentUnlock && (
        <div className="achievement-notification">
          <div className="achievement-icon">{recentUnlock.icon}</div>
          <div className="achievement-details">
            <h4>Achievement Unlocked!</h4>
            <p className="achievement-name">{recentUnlock.name}</p>
            <p className="achievement-description">{recentUnlock.description}</p>
          </div>
        </div>
      )}
      
      <div className="achievements-list">
        <h3>Your Achievements</h3>
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-item ${unlockedAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}`}
          >
            <span className="achievement-icon">{achievement.icon}</span>
            <div className="achievement-content">
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
              {!unlockedAchievements.includes(achievement.id) && (
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${Math.min(100, (getUserProgressForAchievement(userStats, achievement) / achievement.requirement) * 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to calculate progress towards an achievement
const getUserProgressForAchievement = (userStats, achievement) => {
  switch(achievement.category) {
    case 'protocol':
      return userStats.protocolChallengesCompleted;
    case 'port':
      return userStats.portsMatchedCorrectly;
    case 'subnet':
      return userStats.subnettingChallengesCompleted;
    case 'streak':
      return userStats.currentStreak;
    default:
      return 0;
  }
};

export default AchievementSystem; 