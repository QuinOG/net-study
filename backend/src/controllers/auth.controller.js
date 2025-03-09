const { catchAsync, AppError } = require('../utils/errorHandler');
const { generateToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

// Register a new user
exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password, displayName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError('User with that email or username already exists', 400));
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username
  });

  // Create user stats
  await UserStats.create({
    userId: user._id,
    lastLoginDate: new Date()
  });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Update user stats for streak calculation
  const today = new Date().toDateString();
  const userStats = await UserStats.findOne({ userId: user._id });
  
  if (userStats) {
    const lastLogin = userStats.lastLoginDate ? new Date(userStats.lastLoginDate).toDateString() : null;
    
    // If this is their first login or they haven't logged in today
    if (!lastLogin || lastLogin !== today) {
      // Check if they logged in yesterday to maintain streak
      if (lastLogin) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastLogin === yesterdayString) {
          // They logged in yesterday, increment streak
          userStats.currentStreak += 1;
        } else {
          // They missed a day, reset streak
          userStats.currentStreak = 1;
        }
      } else {
        // First login ever
        userStats.currentStreak = 1;
      }
      
      userStats.lastLoginDate = new Date();
      await userStats.save();
    }
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req.user from the protect middleware
  const user = req.user;

  // Get user stats
  const userStats = await UserStats.findOne({ userId: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      user,
      stats: userStats
    }
  });
}); 