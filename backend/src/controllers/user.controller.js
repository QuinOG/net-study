const { catchAsync, AppError } = require('../utils/errorHandler');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

// Get user profile
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const userStats = await UserStats.findOne({ userId: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      user,
      stats: userStats
    }
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Only allow certain fields to be updated
  const { displayName, avatar } = req.body;
  
  // Check if user is updating their own profile
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { displayName, avatar },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Get user statistics
exports.getUserStats = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Check if user is requesting their own stats or is an admin
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only view your own stats', 403));
  }

  const userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    return next(new AppError('User stats not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: userStats
    }
  });
});

// Update user statistics (used after completing games)
exports.updateUserStats = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  // Check if user is updating their own stats or is an admin
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own stats', 403));
  }

  const userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    return next(new AppError('User stats not found', 404));
  }

  // Update stats based on request body
  // This allows for flexible updates to different game stats
  const updates = req.body;
  
  // Prevent overwriting of certain fields
  delete updates.userId;
  delete updates._id;
  
  // If XP is being added, add it to the total
  if (updates.xpEarned) {
    updates.totalXP = userStats.totalXP + updates.xpEarned;
    delete updates.xpEarned;
  }
  
  // If a game result is being added, push it to the history
  if (updates.gameResult) {
    userStats.gameHistory.push(updates.gameResult);
    delete updates.gameResult;
  }
  
  // Apply all other updates
  Object.keys(updates).forEach(key => {
    userStats[key] = updates[key];
  });
  
  await userStats.save();

  res.status(200).json({
    status: 'success',
    data: {
      stats: userStats
    }
  });
});

// Get user achievements
exports.getUserAchievements = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    return next(new AppError('User stats not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      achievements: userStats.completedAchievements
    }
  });
}); 