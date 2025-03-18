// Dictionary of common ports and their protocols for the Net+ exam
export const PORT_DATA = {
  20: { protocol: "FTP", category: "File Transfer" },
  22: { protocol: "SSH", category: "Remote Access" },
  23: { protocol: "Telnet", category: "Remote Access" },
  25: { protocol: "SMTP", category: "Email" },
  53: { protocol: "DNS", category: "Name Resolution" },
  67: { protocol: "DHCP", category: "Network Management" },
};

// Question types for the combined game
export const QUESTION_TYPES = {
  PORT: 'port',     // Ask for port number
  PROTOCOL: 'protocol'  // Ask for protocol name
};

// Game modes
export const GAME_MODES = {
  TIME_ATTACK: 'TIME_ATTACK',
  PRACTICE: 'PRACTICE'
};

// Default statistics for new users
export const DEFAULT_STATS = {
  bestScore: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  totalAttempts: 0,
  correctAnswers: 0
};

// Difficulty levels with their settings
export const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Easy',
    timeLimit: 60,
    timePenalty: 3,
    multiplier: 1,
    showHints: true
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 45,
    timePenalty: 5,
    multiplier: 1.5,
    showHints: false
  },
  HARD: {
    name: 'Hard',
    timeLimit: 30,
    timePenalty: 7,
    multiplier: 2,
    showHints: false
  }
};

// Special bonus types for random events
export const BONUS_TYPES = {
  DOUBLE_POINTS: 'doublePoints',
  EXTRA_TIME: 'extraTime',
  POWER_UP: 'powerUp',
  INSTANT_POINTS: 'instantPoints'
};

// Port Game specific settings
export const PORT_GAME_SETTINGS = {
  // Initial power-ups
  INITIAL_POWER_UPS: {
    timeFreeze: 1,
    categoryReveal: 1,
    skipQuestion: 1
  },
  
  // Streak milestones and rewards
  STREAK_MILESTONES: [5, 10, 15],
  STREAK_REWARDS: {
    15: { type: 'timeFreeze', amount: 1 },
    10: { type: 'skipQuestion', amount: 1 },
    5: { type: 'categoryReveal', amount: 1 }
  },
  
  // Scoring settings
  BASE_POINTS: 100,
  BONUS_TIME: 5,
  
  // Challenge types
  CHALLENGE_TYPES: [
    { type: 'streak', target: 10, description: 'Get a streak of 10 correct answers' },
    { type: 'accuracy', target: 90, description: 'Maintain 90% accuracy with at least 20 answers' },
    { type: 'score', target: 1500, description: 'Score 1500+ points in Time Attack mode' },
    { type: 'time', target: 120, description: 'Survive for 120 seconds in Time Attack Hard mode' },
    { type: 'combo', target: 8, description: 'Reach an 8x combo' }
  ],
  
  // Power-up effects
  POWER_UP_EFFECTS: {
    timeFreeze: { duration: 5, type: 'time' },
    categoryReveal: { type: 'reveal' },
    skipQuestion: { type: 'skip' }
  },
  
  // Daily challenge reward
  DAILY_CHALLENGE_XP_REWARD: 500
};
