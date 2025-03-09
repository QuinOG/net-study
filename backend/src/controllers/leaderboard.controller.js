const { catchAsync, AppError } = require('../utils/errorHandler');
const UserStats = require('../models/UserStats');
const User = require('../models/User');
const Game = require('../models/Game');

// Get global leaderboard
exports.getGlobalLeaderboard = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Get user stats sorted by totalXP
  const userStats = await UserStats.find()
    .sort({ totalXP: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await UserStats.countDocuments();
  
  // Get user details for each stat entry
  const leaderboardEntries = await Promise.all(
    userStats.map(async (stats) => {
      const user = await User.findById(stats.userId, 'username displayName avatar');
      return {
        userId: stats.userId,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        totalXP: stats.totalXP,
        level: stats.level,
        currentStreak: stats.currentStreak
      };
    })
  );
  
  res.status(200).json({
    status: 'success',
    results: leaderboardEntries.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      leaderboard: leaderboardEntries
    }
  });
});

// Get game-specific leaderboard
exports.getGameLeaderboard = catchAsync(async (req, res, next) => {
  const gameId = req.params.id;
  
  // Check if game exists
  const game = await Game.findById(gameId);
  if (!game) {
    return next(new AppError('Game not found', 404));
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Time period filter (all-time, monthly, weekly)
  const period = req.query.period || 'all-time';
  let dateFilter = {};
  
  if (period === 'monthly') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { 'gameHistory.completedAt': { $gte: monthAgo } };
  } else if (period === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { 'gameHistory.completedAt': { $gte: weekAgo } };
  }
  
  // Aggregate to find top performers for this game type
  const aggregationPipeline = [
    // Match users who have played this game type
    { $match: { 
      'gameHistory.gameType': game.type,
      ...dateFilter
    }},
    // Unwind the game history array
    { $unwind: '$gameHistory' },
    // Match only entries for this game type
    { $match: { 'gameHistory.gameType': game.type } },
    // Group by user and calculate metrics
    { $group: {
      _id: '$userId',
      highScore: { $max: '$gameHistory.score' },
      totalGames: { $sum: 1 },
      fastestCompletion: { $min: '$gameHistory.timeSpent' },
      lastPlayed: { $max: '$gameHistory.completedAt' }
    }},
    // Sort by high score (descending)
    { $sort: { highScore: -1 } },
    // Pagination
    { $skip: skip },
    { $limit: limit }
  ];
  
  const leaderboardData = await UserStats.aggregate(aggregationPipeline);
  
  // Get total count for pagination
  const countPipeline = [
    { $match: { 'gameHistory.gameType': game.type, ...dateFilter }},
    { $group: { _id: '$userId' }},
    { $count: 'total' }
  ];
  
  const totalCount = await UserStats.aggregate(countPipeline);
  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  
  // Get user details for each leaderboard entry
  const leaderboardEntries = await Promise.all(
    leaderboardData.map(async (entry) => {
      const user = await User.findById(entry._id, 'username displayName avatar');
      return {
        userId: entry._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        highScore: entry.highScore,
        totalGames: entry.totalGames,
        fastestCompletion: entry.fastestCompletion,
        lastPlayed: entry.lastPlayed
      };
    })
  );
  
  res.status(200).json({
    status: 'success',
    results: leaderboardEntries.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      game: {
        id: game._id,
        name: game.name,
        type: game.type
      },
      period,
      leaderboard: leaderboardEntries
    }
  });
}); 