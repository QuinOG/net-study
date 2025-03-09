const { catchAsync, AppError } = require('../utils/errorHandler');
const Game = require('../models/Game');
const GameContent = require('../models/GameContent');
const UserStats = require('../models/UserStats');

// Get all games
exports.getAllGames = catchAsync(async (req, res, next) => {
  // Build query
  const query = {};
  
  // Filter by type if provided
  if (req.query.type) {
    query.type = req.query.type;
  }
  
  // Filter by difficulty if provided
  if (req.query.difficulty) {
    query.difficulty = req.query.difficulty;
  }
  
  // Filter by active status
  if (req.query.active) {
    query.isActive = req.query.active === 'true';
  } else {
    // By default, only return active games
    query.isActive = true;
  }

  const games = await Game.find(query);

  res.status(200).json({
    status: 'success',
    results: games.length,
    data: {
      games
    }
  });
});

// Get a single game
exports.getGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new AppError('Game not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      game
    }
  });
});

// Get game content
exports.getGameContent = catchAsync(async (req, res, next) => {
  const gameId = req.params.id;
  
  // Check if game exists
  const game = await Game.findById(gameId);
  if (!game) {
    return next(new AppError('Game not found', 404));
  }
  
  // Build query
  const query = { gameId };
  
  // Filter by content type if provided
  if (req.query.contentType) {
    query.contentType = req.query.contentType;
  }
  
  // Filter by difficulty if provided
  if (req.query.difficulty) {
    query.difficulty = req.query.difficulty;
  }
  
  // Filter by active status
  if (req.query.active) {
    query.isActive = req.query.active === 'true';
  } else {
    // By default, only return active content
    query.isActive = true;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const gameContent = await GameContent.find(query)
    .skip(skip)
    .limit(limit);
  
  const total = await GameContent.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: gameContent.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      content: gameContent
    }
  });
});

// Submit game results
exports.submitGameResults = catchAsync(async (req, res, next) => {
  const gameId = req.params.id;
  const userId = req.user.id;
  
  // Check if game exists
  const game = await Game.findById(gameId);
  if (!game) {
    return next(new AppError('Game not found', 404));
  }
  
  // Get user stats
  const userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    return next(new AppError('User stats not found', 404));
  }
  
  // Extract game result data from request
  const { score, timeSpent, xpEarned = game.xpReward } = req.body;
  
  // Create game history entry
  const gameResult = {
    gameType: game.type,
    score,
    timeSpent,
    completedAt: new Date()
  };
  
  // Update user stats based on game type
  switch (game.type) {
    case 'ports':
      userStats.portsMatchedCorrectly += score;
      break;
    case 'protocols':
      userStats.protocolChallengesCompleted += 1;
      // Update accuracy if provided
      if (req.body.accuracy) {
        userStats.protocolAccuracy = 
          (userStats.protocolAccuracy * (userStats.protocolChallengesCompleted - 1) + req.body.accuracy) / 
          userStats.protocolChallengesCompleted;
      }
      break;
    case 'subnetting':
      userStats.subnettingChallengesCompleted += 1;
      
      // Check if this is the first challenge completed today
      const today = new Date().toDateString();
      const lastCompletionDate = userStats.gameHistory
        .filter(history => history.gameType === 'subnetting')
        .sort((a, b) => b.completedAt - a.completedAt)[0]?.completedAt;
      
      if (!lastCompletionDate || new Date(lastCompletionDate).toDateString() !== today) {
        userStats.subnettingChallengesCompletedToday = 1;
      } else {
        userStats.subnettingChallengesCompletedToday += 1;
      }
      break;
    // Add other game types as needed
  }
  
  // Update fastest completion time if applicable
  if (timeSpent && timeSpent < userStats.fastestGameCompletion) {
    userStats.fastestGameCompletion = timeSpent;
  }
  
  // Add XP
  userStats.totalXP += xpEarned;
  
  // Add game result to history
  userStats.gameHistory.push(gameResult);
  
  // Save updated stats
  await userStats.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      xpEarned,
      newTotalXP: userStats.totalXP,
      level: userStats.level
    }
  });
});

// Create a new game (admin only)
exports.createGame = catchAsync(async (req, res, next) => {
  const newGame = await Game.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      game: newGame
    }
  });
});

// Update a game (admin only)
exports.updateGame = catchAsync(async (req, res, next) => {
  const updatedGame = await Game.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!updatedGame) {
    return next(new AppError('Game not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      game: updatedGame
    }
  });
});

// Add content to a game (admin only)
exports.addGameContent = catchAsync(async (req, res, next) => {
  // Ensure gameId is set to the game being updated
  req.body.gameId = req.params.id;
  
  // Check if game exists
  const game = await Game.findById(req.params.id);
  if (!game) {
    return next(new AppError('Game not found', 404));
  }
  
  const newContent = await GameContent.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      content: newContent
    }
  });
}); 