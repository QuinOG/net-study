import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import '../../styles/ui/Leaderboard.css';
import firstPlaceIcon from '../../assets/images/1.png';
import secondPlaceIcon from '../../assets/images/2.png';
import thirdPlaceIcon from '../../assets/images/3.png';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAward, FiStar, FiZap, FiSearch, FiUser, FiInfo, FiX } from 'react-icons/fi';

// Simulated data - in a real app, this would come from a backend
const dummyLeaderboardData = [
  { id: 'user1', name: 'NetworkNinja', xp: 4200, streak: 15, level: 12, previousRank: 2 },
  { id: 'user2', name: 'PacketPro', xp: 3800, streak: 22, level: 11, previousRank: 1 },
  { id: 'user3', name: 'RouterGuru', xp: 3500, streak: 8, level: 10, previousRank: 3 },
  { id: 'user4', name: 'SubnetMaster', xp: 3200, streak: 12, level: 9, previousRank: 5 },
  { id: 'user5', name: 'CiscoKid', xp: 3000, streak: 5, level: 9, previousRank: 4 },
  { id: 'user6', name: 'FirewallFinder', xp: 4000, streak: 10, level: 8, previousRank: 6 },
  { id: 'user7', name: 'SwitchWizard', xp: 2500, streak: 7, level: 7, previousRank: 7 },
  { id: 'user8', name: 'OsiOverseer', xp: 2200, streak: 3, level: 6, previousRank: 9 },
  { id: 'user9', name: 'IPChampion', xp: 2000, streak: 4, level: 6, previousRank: 8 },
];

const Leaderboard = ({ minimized = false }) => {
  const { userStats, loading } = useContext(UserContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('xp');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('weekly');
  const [userRank, setUserRank] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [showRankChanges, setShowRankChanges] = useState(true);
  const [highlightedUser, setHighlightedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const leaderboardRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Calculate user level based on XP
  const calculateLevel = (xp) => {
    let totalXP = xp;
    let level = 1;
    let requiredXP = 50; // Base XP for level 1
    
    while (totalXP >= requiredXP) {
      totalXP -= requiredXP;
      level++;
      requiredXP = Math.floor(requiredXP * 1.25); // Increase by 25% for next level
    }
    
    return level;
  };
  
  // Get rank change icon and class
  const getRankChange = (currentRank, previousRank) => {
    if (!showRankChanges || previousRank === undefined) return null;
    
    // Debug log to understand rank changes
    console.log(`Rank change - Current: ${currentRank}, Previous: ${previousRank}`);
    
    // Lower rank number is better (e.g., rank 1 is better than rank 2)
    // So if currentRank is lower than previousRank, the user improved
    if (currentRank < previousRank) {
      return { 
        icon: <FiTrendingUp className="rank-change-icon up" />, 
        change: previousRank - currentRank,
        class: 'rank-up'
      };
    } else if (currentRank > previousRank) {
      return { 
        icon: <FiTrendingDown className="rank-change-icon down" />, 
        change: currentRank - previousRank,
        class: 'rank-down'
      };
    } else {
      return { 
        icon: <FiMinus className="rank-change-icon same" />, 
        change: 0,
        class: 'rank-same'
      };
    }
  };
  
  // Calculate XP required for next level
  const calculateXpForNextLevel = (level) => {
    let requiredXP = 50; // Base XP for level 1
    for (let i = 1; i < level; i++) {
      requiredXP = Math.floor(requiredXP * 1.25);
    }
    return requiredXP;
  };
  
  // Calculate progress to next level
  const calculateLevelProgress = (xp, level) => {
    let totalXpForCurrentLevel = 0;
    let requiredXP = 50; // Base XP for level 1
    
    // Calculate total XP needed to reach current level
    for (let i = 1; i < level; i++) {
      totalXpForCurrentLevel += requiredXP;
      requiredXP = Math.floor(requiredXP * 1.25);
    }
    
    // Calculate XP earned in current level
    const xpInCurrentLevel = xp - totalXpForCurrentLevel;
    
    // Calculate XP needed for next level
    const xpForNextLevel = calculateXpForNextLevel(level);
    
    // Calculate progress percentage
    return Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100);
  };
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Load and sort leaderboard data
  useEffect(() => {
    const loadLeaderboard = () => {
      // Start with loading state
      setLocalLoading(true);
      
      // In a real app, fetch data from server
      // For now, just use dummy data
      
      // If we're still globally loading user data, wait for it
      if (loading) {
        return;
      }
      
      // Even after loading is done, if there are no userStats, use dummy data
      if (!userStats) {
        const data = dummyLeaderboardData.slice(0, minimized ? 3 : 10);
        setLeaderboardData(data);
        setFilteredData(data);
        setLocalLoading(false);
        return;
      }
      
      console.log("Rendering leaderboard with userStats:", userStats);
      
      // Add current user to the list
      const currentUserData = {
        id: 'currentUser',
        name: 'You',
        xp: userStats.totalXP || 0,
        streak: userStats.currentStreak || 0,
        level: calculateLevel(userStats.totalXP || 0),
        isCurrentUser: true,
        previousRank: userStats.previousRank || null
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
      
      // Only show top entries (3 for minimized, 10 for full)
      const displayCount = minimized ? 3 : 10;
      const dataToDisplay = sortedData.slice(0, displayCount);
      setLeaderboardData(dataToDisplay);
      setFilteredData(dataToDisplay);
      setLocalLoading(false);
    };
    
    loadLeaderboard();
  }, [userStats, activeTab, selectedTimeFrame, minimized, loading]);
  
  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(leaderboardData);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = leaderboardData.filter(user => 
      user.name.toLowerCase().includes(query)
    );
    
    setFilteredData(filtered);
  }, [searchQuery, leaderboardData]);
  
  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);
  
  // Scroll to highlighted user
  useEffect(() => {
    if (highlightedUser && leaderboardRef.current) {
      const userElement = document.getElementById(`leaderboard-user-${highlightedUser}`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Clear the highlight after animation
        const timer = setTimeout(() => {
          setHighlightedUser(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightedUser]);
  
  // Handle user click
  const handleUserClick = (userId) => {
    setHighlightedUser(userId);
  };
  
  // Jump to current user's position
  const jumpToUserPosition = () => {
    const currentUser = leaderboardData.find(user => user.isCurrentUser);
    if (currentUser) {
      setHighlightedUser(currentUser.id);
    }
  };
  
  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Reset search when opening
      setSearchQuery('');
      setFilteredData(leaderboardData);
    }
  };
  
  // Handle tooltip display
  const handleTooltipToggle = (tooltipId) => {
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId);
  };
  
  // Show loading state while we wait for user stats to be loaded
  if (localLoading || loading) {
    return (
      <div className={`leaderboard-container ${minimized ? 'minimized' : ''}`}>
        <div className="leaderboard-header">
          <h3>Leaderboard</h3>
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <div>Loading leaderboard data...</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get appropriate icon for the active tab
  const getTabIcon = (tab) => {
    switch(tab) {
      case 'xp':
        return <FiAward className="tab-icon" />;
      case 'streak':
        return <FiZap className="tab-icon" />;
      case 'level':
        return <FiStar className="tab-icon" />;
      default:
        return null;
    }
  };
  
  // Render minimized leaderboard for home page
  if (minimized) {
    return (
      <div className="leaderboard-container minimized">
        <div className="leaderboard-header">
          <h3>Leaderboard</h3>
          <div className="leaderboard-tabs">
            <button 
              className={`tab-btn ${activeTab === 'xp' ? 'active' : ''}`}
              onClick={() => setActiveTab('xp')}
            >
              {getTabIcon('xp')} XP
            </button>
            <button 
              className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
              onClick={() => setActiveTab('streak')}
            >
              {getTabIcon('streak')} Streak
            </button>
            <button 
              className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
              onClick={() => setActiveTab('level')}
            >
              {getTabIcon('level')} Level
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
        
        <div className="user-rank-container">
          <div className="user-rank">
            <span className="rank-label">Your Rank:</span> 
            <span className="rank-value">{userRank}</span>
            {userStats && userStats.previousRank && (
              <div className="rank-change-indicator">
                {getRankChange(userRank, userStats.previousRank)?.icon}
                {getRankChange(userRank, userStats.previousRank)?.change > 0 && 
                  <span className={`rank-change ${getRankChange(userRank, userStats.previousRank)?.class}`}>
                    {getRankChange(userRank, userStats.previousRank)?.change}
                  </span>
                }
              </div>
            )}
          </div>
          <div className="rank-changes-toggle">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={showRankChanges} 
                onChange={() => setShowRankChanges(!showRankChanges)}
              />
              <span className="toggle-text">Show Changes</span>
            </label>
          </div>
        </div>
        
        <div className="leaderboard-table minimized" ref={leaderboardRef}>
          <div className="leaderboard-row header">
            <div className="rank-cell">Rank</div>
            <div className="name-cell">Name</div>
            <div className="score-cell">
              {activeTab === 'xp' ? 'XP' : activeTab === 'streak' ? 'Streak' : 'Level'}
            </div>
            {showRankChanges && <div className="change-cell">Change</div>}
          </div>
          
          {filteredData.map((user, index) => (
            <div 
              key={user.id} 
              id={`leaderboard-user-${user.id}`}
              className={`leaderboard-row minimized ${user.isCurrentUser ? 'current-user' : ''} ${highlightedUser === user.id ? 'highlighted' : ''}`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="rank-cell minimized">
                {index === 0 && <img src={firstPlaceIcon} alt="1st Place" className="medal-icon" />}
                {index === 1 && <img src={secondPlaceIcon} alt="2nd Place" className="medal-icon" />}
                {index === 2 && <img src={thirdPlaceIcon} alt="3rd Place" className="medal-icon" />}
                {index > 2 && index + 1}
              </div>
              <div className="name-cell minimized">{user.name}</div>
              <div className="score-cell minimized">
                {activeTab === 'xp' && <span className="score-value">{formatNumber(user.xp)}</span>}
                {activeTab === 'streak' && (
                  <div className="streak-display">
                    <span className={`streak-flame ${getFlameColor(user.streak)}`}>🔥</span>
                    {user.streak}
                  </div>
                )}
                {activeTab === 'level' && (
                  <div className="level-badge-container">
                    <span className="level-badge">Lvl {user.level}</span>
                  </div>
                )}
              </div>
              {showRankChanges && (
                <div className="change-cell minimized">
                  {getRankChange(index + 1, user.previousRank)?.icon}
                  {getRankChange(index + 1, user.previousRank)?.change > 0 && 
                    <span className={`rank-change ${getRankChange(index + 1, user.previousRank)?.class}`}>
                      {getRankChange(index + 1, user.previousRank)?.change}
                    </span>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="view-all-container">
          <Link to="/stats" className="view-all-link">View Full Leaderboard →</Link>
        </div>
      </div>
    );
  }
  
  // Full leaderboard for stats page
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <div className="leaderboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'xp' ? 'active' : ''}`}
            onClick={() => setActiveTab('xp')}
            title="Sort by Experience Points"
          >
            {getTabIcon('xp')} XP
          </button>
          <button 
            className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
            title="Sort by Daily Streak"
          >
            {getTabIcon('streak')} Streak
          </button>
          <button 
            className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => setActiveTab('level')}
            title="Sort by User Level"
          >
            {getTabIcon('level')} Level
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
      
      <div className="leaderboard-controls">
        <div className="user-rank-container">
          <div className="user-rank">
            <span className="rank-label">Your Rank:</span> 
            <span className="rank-value">{userRank}</span>
            {userStats && userStats.previousRank && (
              <div className="rank-change-indicator">
                {getRankChange(userRank, userStats.previousRank)?.icon}
                {getRankChange(userRank, userStats.previousRank)?.change > 0 && 
                  <span className={`rank-change ${getRankChange(userRank, userStats.previousRank)?.class}`}>
                    {getRankChange(userRank, userStats.previousRank)?.change}
                  </span>
                }
              </div>
            )}
            <button 
              className="jump-to-user-btn" 
              onClick={jumpToUserPosition}
              title="Jump to your position"
            >
              <FiUser />
            </button>
          </div>
          
          <div className="leaderboard-actions">
            <div className="rank-changes-toggle">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showRankChanges} 
                  onChange={() => setShowRankChanges(!showRankChanges)}
                />
                <span className="toggle-text">Show Rank Changes</span>
              </label>
            </div>
            
            <button 
              className={`search-toggle-btn ${showSearch ? 'active' : ''}`} 
              onClick={toggleSearch}
              title="Search users"
            >
              {showSearch ? <FiX /> : <FiSearch />}
            </button>
            
            <div className="tooltip-container">
              <button 
                className="info-btn" 
                onClick={() => handleTooltipToggle('leaderboard-info')}
                title="Leaderboard information"
              >
                <FiInfo />
              </button>
              {activeTooltip === 'leaderboard-info' && (
                <div className="tooltip">
                  <h4>About the Leaderboard</h4>
                  <p>The leaderboard shows top performers based on your selected criteria (XP, Streak, or Level).</p>
                  <p>• <strong>XP</strong>: Experience points earned from completing challenges</p>
                  <p>• <strong>Streak</strong>: Consecutive days of activity</p>
                  <p>• <strong>Level</strong>: Your progression level based on XP</p>
                  <button className="close-tooltip" onClick={() => setActiveTooltip(null)}>
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showSearch && (
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <FiX />
                </button>
              )}
            </div>
            {searchQuery && filteredData.length === 0 && (
              <div className="no-results">No users found matching "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>
      
      <div className="leaderboard-table" ref={leaderboardRef}>
        <div className="leaderboard-row header">
          <div className="rank-cell">Rank</div>
          <div className="name-cell">Name</div>
          <div className="score-cell">
            {activeTab === 'xp' ? 'XP' : activeTab === 'streak' ? 'Streak' : 'Level'}
          </div>
          {showRankChanges && <div className="change-cell">Change</div>}
        </div>
        
        {filteredData.length > 0 ? (
          filteredData.map((user, index) => (
            <div 
              key={user.id} 
              id={`leaderboard-user-${user.id}`}
              className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''} ${highlightedUser === user.id ? 'highlighted' : ''}`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="rank-cell">
                {index === 0 && <img src={firstPlaceIcon} alt="1st Place" className="medal-icon" />}
                {index === 1 && <img src={secondPlaceIcon} alt="2nd Place" className="medal-icon" />}
                {index === 2 && <img src={thirdPlaceIcon} alt="3rd Place" className="medal-icon" />}
                {index > 2 && index + 1}
              </div>
              <div className="name-cell">{user.name}</div>
              <div className="score-cell">
                {activeTab === 'xp' && <span className="score-value">{formatNumber(user.xp)}</span>}
                {activeTab === 'streak' && (
                  <div className="streak-display">
                    <span className={`streak-flame ${getFlameColor(user.streak)}`}>🔥</span>
                    {user.streak}
                  </div>
                )}
                {activeTab === 'level' && (
                  <div className="level-badge-container">
                    <span className="level-badge">Lvl {user.level}</span>
                    <div className="level-progress-bar">
                      <div 
                        className="level-progress" 
                        style={{ width: `${calculateLevelProgress(user.xp, user.level)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {showRankChanges && (
                <div className="change-cell">
                  {getRankChange(index + 1, user.previousRank)?.icon}
                  {getRankChange(index + 1, user.previousRank)?.change > 0 && 
                    <span className={`rank-change ${getRankChange(index + 1, user.previousRank)?.class}`}>
                      {getRankChange(index + 1, user.previousRank)?.change}
                    </span>
                  }
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            {searchQuery ? (
              <div className="no-results-full">
                <FiSearch className="empty-icon" />
                <p>No users found matching "{searchQuery}"</p>
                <button 
                  className="clear-search-btn" 
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="no-data">
                <p>No leaderboard data available</p>
              </div>
            )}
          </div>
        )}
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