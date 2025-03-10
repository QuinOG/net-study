/**
 * Learning Progress Tracker
 * Utility for tracking user progress across networking topics
 */

// Storage key for learning progress data
const PROGRESS_STORAGE_KEY = 'net-study-learning-progress';

// Networking topics with their categories and related games
const NETWORK_TOPICS = {
  PORTS: {
    name: 'Ports & Protocols',
    relatedGames: ['portGame', 'protocolGame'],
    categories: ['File Transfer', 'Email', 'Web', 'Remote Access', 'Directory Services', 'Network Management']
  },
  SUBNETTING: {
    name: 'Subnetting & Addressing',
    relatedGames: ['subnettingChallenge'],
    categories: ['IPv4', 'Subnet Masks', 'CIDR', 'Network Classes']
  },
  COMMANDS: {
    name: 'Command Line Tools',
    relatedGames: ['commandLineChallenge'],
    categories: ['Troubleshooting', 'Configuration', 'Diagnostics']
  },
  ACRONYMS: {
    name: 'Tech Acronyms',
    relatedGames: ['techAcronymQuiz'],
    categories: ['Networking', 'Hardware', 'Software', 'Security']
  },
  TOPOLOGY: {
    name: 'Network Topology',
    relatedGames: ['networkTopologyGame'],
    categories: ['LAN', 'WAN', 'Routing', 'Switching']
  },
  SECURITY: {
    name: 'Network Security',
    relatedGames: ['firewallRulesGame', 'encryptionChallengeGame'],
    categories: ['Firewalls', 'Encryption', 'Authentication', 'Access Control']
  }
};

/**
 * Initialize or get user learning progress
 * @param {string} userId - User ID or 'guest' for guest users
 * @returns {Object} Learning progress data
 */
const getUserProgress = (userId = 'guest') => {
  const storageKey = `${PROGRESS_STORAGE_KEY}_${userId}`;
  const savedProgress = localStorage.getItem(storageKey);
  
  if (savedProgress) {
    try {
      return JSON.parse(savedProgress);
    } catch (error) {
      console.error('Error parsing learning progress:', error);
      return createInitialProgress();
    }
  }
  
  // Initialize with default values
  const initialProgress = createInitialProgress();
  localStorage.setItem(storageKey, JSON.stringify(initialProgress));
  return initialProgress;
};

/**
 * Create initial progress structure
 * @returns {Object} Initial progress data
 */
const createInitialProgress = () => {
  const progress = {};
  
  // Initialize each topic with 0% progress
  Object.keys(NETWORK_TOPICS).forEach(topicKey => {
    const topic = NETWORK_TOPICS[topicKey];
    
    progress[topicKey] = {
      name: topic.name,
      progress: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      categories: {}
    };
    
    // Initialize categories
    topic.categories.forEach(category => {
      progress[topicKey].categories[category] = {
        name: category,
        progress: 0,
        totalQuestions: 0,
        correctAnswers: 0
      };
    });
  });
  
  return progress;
};

/**
 * Update learning progress based on game results
 * @param {string} gameId - ID of the game
 * @param {string} userId - User ID or 'guest'
 * @param {Object} results - Game results with totalQuestions, correctAnswers, etc.
 * @param {string|null} category - Specific category if applicable
 * @returns {Object} Updated progress data and topic-specific progress
 */
const updateProgress = (gameId, userId = 'guest', results, category = null) => {
  // Get current progress
  const progress = getUserProgress(userId);
  const storageKey = `${PROGRESS_STORAGE_KEY}_${userId}`;
  
  // Find which topics this game relates to
  const relatedTopics = [];
  
  Object.keys(NETWORK_TOPICS).forEach(topicKey => {
    if (NETWORK_TOPICS[topicKey].relatedGames.includes(gameId)) {
      relatedTopics.push(topicKey);
    }
  });
  
  if (relatedTopics.length === 0) {
    console.warn(`No topics found related to game: ${gameId}`);
    return { progress, topicsProgress: [] };
  }
  
  // Update progress for each related topic
  const updatedTopics = [];
  
  relatedTopics.forEach(topicKey => {
    const topic = progress[topicKey];
    
    // Update overall topic progress
    topic.totalQuestions += results.totalQuestions || 0;
    topic.correctAnswers += results.correctAnswers || 0;
    
    // Calculate new progress percentage (avoid division by zero)
    if (topic.totalQuestions > 0) {
      topic.progress = Math.min(
        Math.round((topic.correctAnswers / topic.totalQuestions) * 100),
        100
      );
    }
    
    // Update specific category if provided
    if (category && topic.categories[category]) {
      const categoryData = topic.categories[category];
      categoryData.totalQuestions += results.totalQuestions || 0;
      categoryData.correctAnswers += results.correctAnswers || 0;
      
      if (categoryData.totalQuestions > 0) {
        categoryData.progress = Math.min(
          Math.round((categoryData.correctAnswers / categoryData.totalQuestions) * 100),
          100
        );
      }
    }
    
    // Add to updated topics list
    updatedTopics.push({
      key: topicKey,
      name: topic.name,
      progress: topic.progress
    });
  });
  
  // Save updated progress
  localStorage.setItem(storageKey, JSON.stringify(progress));
  
  // Return updated progress data and topic-specific progress
  return { 
    progress, 
    topicsProgress: updatedTopics
  };
};

/**
 * Get learning progress for topics related to a specific game
 * @param {string} gameId - ID of the game
 * @param {string} userId - User ID or 'guest'
 * @returns {Array} Array of topic progress data
 */
const getGameTopicsProgress = (gameId, userId = 'guest') => {
  const progress = getUserProgress(userId);
  const topicsProgress = [];
  
  Object.keys(NETWORK_TOPICS).forEach(topicKey => {
    if (NETWORK_TOPICS[topicKey].relatedGames.includes(gameId)) {
      topicsProgress.push({
        key: topicKey,
        name: NETWORK_TOPICS[topicKey].name,
        progress: progress[topicKey].progress
      });
    }
  });
  
  return topicsProgress;
};

/**
 * Get topics with their progress data
 * @param {string} userId - User ID or 'guest'
 * @returns {Array} Array of topics with progress information
 */
const getAllTopicsProgress = (userId = 'guest') => {
  const progress = getUserProgress(userId);
  
  return Object.keys(progress).map(topicKey => ({
    key: topicKey,
    name: progress[topicKey].name,
    progress: progress[topicKey].progress,
    categories: Object.keys(progress[topicKey].categories).map(catKey => ({
      name: catKey,
      progress: progress[topicKey].categories[catKey].progress
    }))
  }));
};

export { 
  NETWORK_TOPICS,
  getUserProgress,
  updateProgress,
  getGameTopicsProgress,
  getAllTopicsProgress
}; 