import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import './Leaderboard.css';

// Simulated data - in a real app, this would come from a backend
const dummyLeaderboardData = [
  { id: 'user1', name: 'NetworkNinja', xp: 4200, streak: 15, level: 12 },
  { id: 'user2', name: 'PacketPro', xp: 3800, streak: 22, level: 11 },
  { id: 'user3', name: 'RouterGuru', xp: 3500, streak: 8, level: 10 },
  { id: 'user4', name: 'SubnetMaster', xp: 3200, streak: 12, level: 9 },
  { id: 'user5', name: 'CiscoKid', xp: 3000, streak: 5, level: 9 },
  { id: 'user6', name: 'FirewallFinder', xp: 2700, streak: 10, level: 8 },
  { id: 'user7', name: 'SwitchWizard', xp: 2500, streak: 7, level: 7 },
  { id: 'user8', name: 'OsiOverseer', xp: 2200, streak: 3, level: 6 },
  { id: 'user9', name: 'IPChampion', xp: 2000, streak: 4, level: 6 },
];

const Leaderboard = () => {
  const { userStats } = useContext(UserContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeTab, setActiveTab] = useState('xp');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('weekly');
  const [userRank, setUserRank] = useState(null);
  
  // Calculate user level based on XP
  const calculateLevel = (xp) => {
    const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 
      3250, 3850, 4500, 5200, 6000, 6900, 7900, 9000, 10200];
    
    let level = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (xp >= thresholds[i]) {
        level = i;
      } else {
        break;
      }
    }
    
    return level;
  };
  
  // Load and sort leaderboard data
  useEffect(() => {
    const loadLeaderboard = () => {
      // In a real app, fetch data from server
      // For now, just use dummy data
      
      // Add current user to the list
      const currentUserData = {
        id: 'currentUser',
        name: 'You',
        xp: userStats.totalXP,
        streak: userStats.currentStreak,
        level: calculateLevel(userStats.totalXP),
        isCurrentUser: true
      };
      
      const allUsers = [...dummyLeaderboardData, currentUserData];
      
      // Sort based on active tab
      let sortedData;
      if (activeTab === 'xp') {
        sortedData = allUsers.sort((a, b) => b.xp - a.xp);
      } else if (activeTab === 'streak') {
        sortedData = allUsers.sort((a, b) => b.streak - a.streak);
      } else { // level
        sortedData = allUsers.sort((a, b) => b.level - a.level || b.xp - a.xp);
      }
      
      // Find user's rank
      const userIndex = sortedData.findIndex(user => user.isCurrentUser);
      setUserRank(userIndex + 1);
      
      // Only show top 10
      setLeaderboardData(sortedData.slice(0, 10));
    };
    
    loadLeaderboard();
  }, [userStats, activeTab, selectedTimeFrame]);
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <div className="leaderboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'xp' ? 'active' : ''}`}
            onClick={() => setActiveTab('xp')}
          >
            XP
          </button>
          <button 
            className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            Streak
          </button>
          <button 
            className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => setActiveTab('level')}
          >
            Level
          </button>
        </div>
        <div className="timeframe-select">
          <select 
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
      </div>
      
      <div className="user-rank">
        Your Rank: {userRank}
      </div>
      
      <div className="leaderboard-table">
        <div className="leaderboard-row header">
          <div className="rank-cell">Rank</div>
          <div className="name-cell">Name</div>
          <div className="score-cell">
            {activeTab === 'xp' ? 'XP' : activeTab === 'streak' ? 'Streak' : 'Level'}
          </div>
        </div>
        
        {leaderboardData.map((user, index) => (
          <div 
            key={user.id} 
            className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}
          >
            <div className="rank-cell">
              {index === 0 && <span className="medal gold">🥇</span>}
              {index === 1 && <span className="medal silver">🥈</span>}
              {index === 2 && <span className="medal bronze">🥉</span>}
              {index > 2 && index + 1}
            </div>
            <div className="name-cell">{user.name}</div>
            <div className="score-cell">
              {activeTab === 'xp' && user.xp}
              {activeTab === 'streak' && (
                <div className="streak-display">
                  <span className={`streak-flame ${getFlameColor(user.streak)}`}>🔥</span>
                  {user.streak}
                </div>
              )}
              {activeTab === 'level' && `Lvl ${user.level}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get flame color class based on streak
const getFlameColor = (streak) => {
  if (streak >= 30) return 'purple-flame';
  if (streak >= 21) return 'red-flame';
  if (streak >= 14) return 'orange-flame';
  if (streak >= 7) return 'yellow-flame';
  if (streak >= 3) return 'green-flame';
  return 'blue-flame';
};

export default Leaderboard; 