import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, submitGameResults, getUserStats, updateUserStats, addUserXP } from '../services/api';
import { getGuestUser, createGuestUser, updateGuestStats, calculateGuestProgress, clearGuestData, defaultUserStats } from '../utils/GuestUser';

// Create context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
  
  // Load user on app startup
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Found token, attempting to load user data...');
          const response = await getCurrentUser();
          
          if (response && response.data && response.data.data) {
            console.log('User data loaded successfully');
            setUser(response.data.data.user);
            
            // Check if stats are included in the response
            if (response.data.data.stats) {
              console.log('Setting user stats from loadUser response');
              setUserStats(response.data.data.stats);
            } else {
              // If stats aren't included, fetch them separately
              console.log('Stats not included in loadUser response, fetching separately...');
              try {
                const statsResponse = await getUserStats(response.data.data.user.id);
                if (statsResponse && statsResponse.data && statsResponse.data.data) {
                  // Extract stats from the nested response structure
                  const statsData = statsResponse.data.data.stats || statsResponse.data.data;
                  console.log('Fetched user stats, extracted data:', statsData);
                  setUserStats(statsData);
                } else {
                  console.warn('Failed to fetch user stats during loadUser:', statsResponse);
                  // Set default stats
                  setUserStats({...defaultUserStats, userId: response.data.data.user.id});
                }
              } catch (statsError) {
                console.error('Error fetching user stats during loadUser:', statsError);
                // Set default stats
                setUserStats({...defaultUserStats, userId: response.data.data.user.id});
              }
            }
          } else {
            console.warn('Invalid response format when loading user:', response);
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      } else {
        // Check for guest user
        const guestData = getGuestUser();
        if (guestData) {
          setUser(guestData.user);
          setUserStats(guestData.stats);
        }
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await loginUser({ email, password });
      const { token, data } = response.data;
      
      console.log('Login successful, user data:', data);
      
      // Store token first to ensure authenticated requests work
      localStorage.setItem('token', token);
      
      // Set user information
      setUser(data.user);
      
      // If stats are included in the response, set them
      if (data.stats) {
        console.log('Setting user stats from login response:', data.stats);
        setUserStats(data.stats);
      } else {
        // If stats aren't included, fetch them separately
        console.log('Stats not included in login response, fetching separately...');
        try {
          const statsResponse = await getUserStats(data.user.id);
          if (statsResponse && statsResponse.data && statsResponse.data.data) {
            // Notice the nesting - we need to check if stats is within data
            const statsData = statsResponse.data.data.stats || statsResponse.data.data;
            console.log('Fetched user stats, extracted data:', statsData);
            setUserStats(statsData);
          } else {
            console.warn('Failed to fetch user stats after login:', statsResponse);
            // Set default stats if we couldn't fetch them
            setUserStats({...defaultUserStats, userId: data.user.id});
          }
        } catch (statsError) {
          console.error('Error fetching user stats after login:', statsError);
          // Set default stats if we couldn't fetch them
          setUserStats({...defaultUserStats, userId: data.user.id});
        }
      }
      
      // If user was a guest before, transfer guest data or clear it
      const guestData = getGuestUser();
      if (guestData) {
        clearGuestData();
        // Here you could add logic to transfer guest progress to the user account
        // by making an API call to merge data if your backend supports it
      }
      
      return data;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };
  
  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await registerUser(userData);
      const { token, data } = response.data;
      
      console.log('Registration successful, user data:', data);
      
      // If user was a guest before, transfer guest data or clear it
      const guestData = getGuestUser();
      if (guestData) {
        clearGuestData();
        // Here you could add logic to transfer guest progress to the user account
        // by making an API call to merge data if your backend supports it
      }
      
      localStorage.setItem('token', token);
      setUser(data.user);
      setUserStats(data.stats);
      return data;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserStats(null);
  };
  
  // Start guest session
  const startGuestSession = () => {
    const guestData = getGuestUser() || createGuestUser();
    setUser(guestData.user);
    setUserStats(guestData.stats);
    return guestData;
  };
  
  // Add XP to user (called by games)
  const addXP = async (amount) => {
    if (!user) {
      console.error("Cannot add XP: No user is logged in");
      return { error: "No user logged in" };
    }
    
    console.log(`Adding ${amount} XP to user:`, user.isGuest ? "Guest User" : user.username || user.email);
    
    // Set reward animation
    setRewardXP(amount);
    setShowReward(true);
    
    try {
      if (user.isGuest) {
        console.log("Processing XP for guest user");
        // For guest users, directly update stats in local storage
        const currentStats = { ...userStats };
        const newTotalXP = (currentStats.totalXP || 0) + amount;
        
        // Calculate new level (simple formula: 100 XP per level)
        const newLevel = Math.floor(newTotalXP / 100) + 1;
        const levelUp = newLevel > (currentStats.level || 1);
        
        const updatedStats = {
          ...currentStats,
          totalXP: newTotalXP,
          xp: newTotalXP,
          level: newLevel
        };
        
        setUserStats(updatedStats);
        
        // Update guest user data in local storage
        const guestUser = JSON.parse(localStorage.getItem('guestUser')) || {};
        guestUser.stats = updatedStats;
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
        
        console.log("Guest user XP updated in local storage:", updatedStats);
        
        // Check if player leveled up
        if (levelUp) {
          console.log(`Guest user leveled up to level ${newLevel}!`);
          // TODO: Add level up animation or notification
        }
        
        return { xpEarned: amount, levelUp };
      } else {
        console.log("Processing XP for registered user");
        // For registered users, use the API
        const numericAmount = parseInt(amount, 10);
        
        if (isNaN(numericAmount) || numericAmount <= 0) {
          console.error("Invalid XP amount:", amount);
          return { xpEarned: 0, error: "Invalid XP amount" };
        }
        
        console.log(`Sending XP update request: ${numericAmount} XP`);
        try {
          const response = await addUserXP(numericAmount);
          console.log("XP update response:", response?.data);
          
          if (response && response.data && response.data.success) {
            // Update user stats from response
            if (response.data.data) {
              const newStats = response.data.data;
              
              // Check for level up
              const oldLevel = userStats?.level || 1;
              const newLevel = newStats.level;
              const levelUp = newLevel > oldLevel;
              
              console.log(`XP updated successfully: ${userStats?.totalXP || 0} -> ${newStats.totalXP}, Level: ${oldLevel} -> ${newLevel}`);
              
              // Update state with new stats
              setUserStats(newStats);
              
              if (levelUp) {
                console.log(`User leveled up to ${newLevel}!`);
                // TODO: Add level up animation
              }
              
              return { 
                xpEarned: numericAmount, 
                levelUp,
                oldXP: userStats?.totalXP || 0,
                newXP: newStats.totalXP
              };
            }
          } else {
            console.warn("Server reported failure updating XP:", response?.data?.message || "Unknown error");
            return { xpEarned: numericAmount, error: response?.data?.message || "Failed to update XP" };
          }
        } catch (error) {
          console.error("Failed to update XP for signed-in user:", error);
          console.error("Error details:", error.response?.data || error);
          console.error("Error status:", error.response?.status);
          
          // Fall back to client-side update for better UX
          const currentStats = { ...userStats } || { totalXP: 0, level: 1 };
          const newTotalXP = (currentStats.totalXP || 0) + numericAmount;
          const newLevel = Math.floor(newTotalXP / 100) + 1;
          const levelUp = newLevel > (currentStats.level || 1);
          
          const updatedStats = {
            ...currentStats,
            totalXP: newTotalXP,
            xp: newTotalXP,
            level: newLevel
          };
          
          // Update state but not persisted
          setUserStats(updatedStats);
          console.log("Temporarily updated user stats client-side after API error:", updatedStats);
          
          return { 
            xpEarned: numericAmount, 
            levelUp, 
            clientSideOnly: true,
            error: error.response?.data?.message || error.message 
          };
        }
      }
    } catch (error) {
      console.error("Error in addXP function:", error);
      return { error: "Error processing XP" };
    }
    
    return { xpEarned: amount };
  };
  
  // Update user stats after completing a game
  const updateStats = async (gameId, gameResults) => {
    try {
      // Handle guest user
      if (user?.isGuest) {
        const { updatedStats, xpEarned, levelUp } = calculateGuestProgress(gameResults);
        updateGuestStats(updatedStats);
        setUserStats(updatedStats);
        setRewardXP(xpEarned);
        setShowReward(true);
        return { 
          data: { 
            stats: updatedStats,
            xpEarned,
            levelUp
          }
        };
      }
      
      // Handle registered user
      const response = await submitGameResults(gameId, gameResults);
      
      // Show XP reward animation
      setRewardXP(response.data.data.xpEarned);
      setShowReward(true);
      
      // Update user stats
      const statsResponse = await getUserStats(user._id);
      setUserStats(statsResponse.data.data.stats);
      
      return response.data;
    } catch (err) {
      console.error('Failed to update stats:', err);
      throw err;
    }
  };
  
  const handleRewardComplete = () => {
    setShowReward(false);
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        userStats,
        loading,
        error,
        login,
        register,
        logout,
        startGuestSession,
        addXP,
        updateStats,
        showReward,
        setShowReward,
        rewardXP,
        handleRewardComplete
      }}
    >
      {children}
    </UserContext.Provider>
  );
};