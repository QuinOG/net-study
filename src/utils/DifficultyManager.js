/**
 * DifficultyManager.js - Adjusts difficulty based on player performance
 * 
 * This utility automatically scales game difficulty based on player's historical performance.
 * Each game type has specific parameters that can be adjusted.
 */

// Calculate user's skill level (1-10) based on past performance
export const calculateSkillLevel = (gameHistory, gameType) => {
  if (!gameHistory || gameHistory.length === 0) {
    return 1; // Default beginner level
  }
  
  // Filter history to only include the specific game type
  const gameTypeHistory = gameHistory.filter(game => game.type === gameType);
  
  if (gameTypeHistory.length === 0) {
    return 1; // No history for this game type
  }
  
  // Get recent games (last 10)
  const recentGames = gameTypeHistory.slice(-10);
  
  // Calculate average score
  const avgScore = recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length;
  
  // Use a logarithmic curve to determine skill level (1-10)
  // This makes early levels easier to achieve but higher levels require more skill
  const skillLevel = Math.min(10, Math.ceil(Math.log(avgScore * 0.4 + 1) / Math.log(1.5)));
  
  return skillLevel;
};

// Get difficulty parameters for Protocol Game
export const getProtocolGameDifficulty = (skillLevel) => {
  // Base parameters
  const params = {
    timeLimit: 45, // seconds
    questionCount: 10,
    obscureProtocolChance: 0,
    detailedQuestionsChance: 0,
    multipleCorrectAnswersChance: 0
  };
  
  // Adjust based on skill level
  if (skillLevel >= 3) {
    params.timeLimit = 40;
    params.obscureProtocolChance = 0.1;
  }
  
  if (skillLevel >= 5) {
    params.timeLimit = 35;
    params.questionCount = 12;
    params.obscureProtocolChance = 0.2;
    params.detailedQuestionsChance = 0.15;
  }
  
  if (skillLevel >= 7) {
    params.timeLimit = 30;
    params.questionCount = 15;
    params.obscureProtocolChance = 0.35;
    params.detailedQuestionsChance = 0.3;
    params.multipleCorrectAnswersChance = 0.1;
  }
  
  if (skillLevel >= 9) {
    params.timeLimit = 25;
    params.questionCount = 18;
    params.obscureProtocolChance = 0.5;
    params.detailedQuestionsChance = 0.4;
    params.multipleCorrectAnswersChance = 0.2;
  }
  
  return params;
};

// Get difficulty parameters for Port Game
export const getPortGameDifficulty = (skillLevel) => {
  // Base parameters
  const params = {
    timeLimit: 60, // seconds
    portCount: 8,
    obscurePortChance: 0,
    includeNumbers: true,
    includeProtocols: false
  };
  
  // Adjust based on skill level
  if (skillLevel >= 3) {
    params.timeLimit = 50;
    params.portCount = 10;
  }
  
  if (skillLevel >= 5) {
    params.timeLimit = 45;
    params.portCount = 12;
    params.obscurePortChance = 0.15;
    params.includeProtocols = true;
  }
  
  if (skillLevel >= 7) {
    params.timeLimit = 40;
    params.portCount = 15;
    params.obscurePortChance = 0.25;
  }
  
  if (skillLevel >= 9) {
    params.timeLimit = 35;
    params.portCount = 18;
    params.obscurePortChance = 0.4;
  }
  
  return params;
};

// Get difficulty parameters for Subnet Game
export const getSubnetGameDifficulty = (skillLevel) => {
  // Base parameters
  const params = {
    timeLimit: 90, // seconds
    questionCount: 5,
    lowestCIDR: 24, // Easier subnets first (larger subnets)
    includeIPv6: false,
    multipleQuestionsPerSubnet: false
  };
  
  // Adjust based on skill level
  if (skillLevel >= 3) {
    params.timeLimit = 80;
    params.lowestCIDR = 22;
  }
  
  if (skillLevel >= 5) {
    params.timeLimit = 70;
    params.questionCount = 7;
    params.lowestCIDR = 20;
    params.multipleQuestionsPerSubnet = true;
  }
  
  if (skillLevel >= 7) {
    params.timeLimit = 60;
    params.questionCount = 8;
    params.lowestCIDR = 16;
    params.includeIPv6 = true;
  }
  
  if (skillLevel >= 9) {
    params.timeLimit = 50;
    params.questionCount = 10;
    params.lowestCIDR = 8;
  }
  
  return params;
};

// Get difficulty parameters for Acronym Game
export const getAcronymGameDifficulty = (skillLevel) => {
  // Base parameters
  const params = {
    timeLimit: 45, // seconds
    acronymCount: 10,
    obscureAcronymChance: 0,
    multipleChoice: true,
    freeTypeAnswers: false
  };
  
  // Adjust based on skill level
  if (skillLevel >= 3) {
    params.timeLimit = 40;
    params.acronymCount = 12;
    params.obscureAcronymChance = 0.1;
  }
  
  if (skillLevel >= 5) {
    params.timeLimit = 35;
    params.acronymCount = 15;
    params.obscureAcronymChance = 0.2;
  }
  
  if (skillLevel >= 7) {
    params.timeLimit = 30;
    params.acronymCount = 18;
    params.obscureAcronymChance = 0.3;
    params.freeTypeAnswers = true;
    params.multipleChoice = false;
  }
  
  if (skillLevel >= 9) {
    params.timeLimit = 25;
    params.acronymCount = 20;
    params.obscureAcronymChance = 0.5;
  }
  
  return params;
}; 