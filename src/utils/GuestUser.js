const GUEST_USER_KEY = 'guest_user';
const GUEST_STATS_KEY = 'guest_stats';

// Default stats for guest users and as fallback for registered users
export const defaultUserStats = {
  totalXP: 0,
  xp: 0,
  level: 1,
  currentStreak: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
  gamesPlayed: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  achievements: [],
  protocolChallengesCompleted: 0,
  protocolAccuracy: 0,
  portsMatchedCorrectly: 0,
  portMatchesWithoutErrors: 0,
  subnettingChallengesCompleted: 0,
  subnettingChallengesCompletedToday: 0,
  fastestGameCompletion: 999999,
  gameHistory: []
};

/**
 * Create a new guest user in local storage
 */
export const createGuestUser = () => {
  const guestUser = {
    id: `guest_${Date.now()}`,
    displayName: 'Guest User',
    isGuest: true,
    createdAt: new Date().toISOString()
  };
  
  // Use the default stats with a fresh timestamp
  const guestStats = {
    ...defaultUserStats,
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(guestStats));
  
  return { user: guestUser, stats: guestStats };
};

/**
 * Get the current guest user from local storage
 */
export const getGuestUser = () => {
  const guestUser = localStorage.getItem(GUEST_USER_KEY);
  const guestStats = localStorage.getItem(GUEST_STATS_KEY);
  
  if (!guestUser || !guestStats) {
    return null;
  }
  
  return {
    user: JSON.parse(guestUser),
    stats: JSON.parse(guestStats)
  };
};

/**
 * Update guest user stats in local storage
 */
export const updateGuestStats = (newStats) => {
  const currentStats = JSON.parse(localStorage.getItem(GUEST_STATS_KEY) || '{}');
  const updatedStats = { ...currentStats, ...newStats };
  
  localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(updatedStats));
  return updatedStats;
};

/**
 * Calculate XP and level for a guest user based on results
 */
export const calculateGuestProgress = (gameResults) => {
  const { correctAnswers, totalQuestions } = gameResults;
  const accuracyPercent = (correctAnswers / totalQuestions) * 100;
  
  // Base XP formula
  let xpEarned = Math.round(correctAnswers * 10);
  
  // Bonus for high accuracy
  if (accuracyPercent >= 90) {
    xpEarned += 20; // Perfect or near-perfect bonus
  } else if (accuracyPercent >= 75) {
    xpEarned += 10; // Good accuracy bonus
  }
  
  // Get current stats
  const currentStats = JSON.parse(localStorage.getItem(GUEST_STATS_KEY) || '{}');
  const newTotalXP = (currentStats.totalXP || 0) + xpEarned;
  
  // Calculate level using progressive formula
  const newLevel = calculateLevel(newTotalXP);
  
  // Update other stats
  const updatedStats = {
    totalXP: newTotalXP,
    xp: newTotalXP, // Set both totalXP and xp for compatibility
    level: newLevel,
    lastActive: new Date().toISOString(),
    gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
    questionsAnswered: (currentStats.questionsAnswered || 0) + totalQuestions,
    correctAnswers: (currentStats.correctAnswers || 0) + correctAnswers
  };
  
  // Update streak if played on consecutive days
  const lastActiveDate = currentStats.lastActive 
    ? new Date(currentStats.lastActive).setHours(0, 0, 0, 0) 
    : null;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);
  
  if (lastActiveDate === yesterday) {
    updatedStats.streak = (currentStats.streak || 0) + 1;
    updatedStats.currentStreak = (currentStats.currentStreak || 0) + 1;
  } else if (lastActiveDate !== today) {
    updatedStats.streak = 1;
    updatedStats.currentStreak = 1;
  }
  
  return {
    updatedStats,
    xpEarned,
    levelUp: newLevel > (currentStats.level || 1)
  };
};

/**
 * Clear guest user data from local storage
 */
export const clearGuestData = () => {
  // Remove the main guest user data
  localStorage.removeItem(GUEST_USER_KEY);
  localStorage.removeItem(GUEST_STATS_KEY);
  
  // Also remove any game-specific guest data that might exist
  const keysToRemove = [];
  
  // Find all localStorage keys that might be related to guest data, settings, or user preferences
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
        // Guest-specific keys
        key.includes('guest') || 
        key.includes('Game') || 
        key.includes('Stats_guest') ||
        key.includes('_guest_') ||
        // Settings keys
        key.includes('net-study-settings-') ||
        key.includes('netQuestSound')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all found keys
  keysToRemove.forEach(key => {
    console.log(`[Data Cleanup] Removing key: ${key}`);
    localStorage.removeItem(key);
  });
  
  console.log(`[Data Cleanup] Removed ${keysToRemove.length} guest/settings items`);
};

// Calculate level based on XP with progressive system
// Level 1 requires 50 XP, each level after increases by factor of 1.25
const calculateLevel = (totalXP) => {
  let xpRemaining = totalXP;
  let level = 1;
  let requiredXP = 50; // Base XP for level 1
  
  while (xpRemaining >= requiredXP) {
    xpRemaining -= requiredXP;
    level++;
    requiredXP = Math.floor(requiredXP * 1.25); // Increase by 25% for next level
  }
  
  return level;
};

// Named export for the utility object - best practice
const guestUserUtils = {
  createGuestUser,
  getGuestUser,
  updateGuestStats,
  calculateGuestProgress,
  clearGuestData
};

export default guestUserUtils; 