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