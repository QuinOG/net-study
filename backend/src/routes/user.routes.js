const express = require('express');
const { 
  getUserProfile, 
  updateProfile, 
  getUserStats, 
  updateUserStats, 
  getUserAchievements 
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes below this middleware are protected
router.use(protect);

// User profile routes
router.get('/:id', getUserProfile);
router.patch('/:id', updateProfile);

// User stats routes
router.get('/:id/stats', getUserStats);
router.patch('/:id/stats', updateUserStats);

// User achievements routes
router.get('/:id/achievements', getUserAchievements);

// Add the XP update endpoint
router.post('/xp', async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid XP amount provided' 
      });
    }
    
    console.log(`Processing XP update for user ${userId}: ${amount} XP`);
    
    // Look for existing stats directly using the model
    const UserStats = require('../models/UserStats');
    let userStats = await UserStats.findOne({ userId });
    let isNewUser = false;
    
    // If user stats don't exist, create them
    if (!userStats) {
      console.log(`No stats found for user ${userId}, creating new stats record`);
      isNewUser = true;
      userStats = new UserStats({
        userId,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        lastLoginDate: new Date()
      });
    }
    
    // Update the stats with new XP
    const oldXP = userStats.totalXP;
    const oldLevel = userStats.level;
    
    userStats.totalXP += parseInt(amount);
    // Let the pre-save hook handle level calculation
    
    // Save the updated stats
    await userStats.save();
    
    console.log(`User ${userId}: Updated XP ${oldXP} -> ${userStats.totalXP}, Level ${oldLevel} -> ${userStats.level}`);
    
    // Return the updated stats
    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Initial user stats created with XP' : 'XP added successfully',
      data: userStats
    });
    
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add XP',
      error: error.message
    });
  }
});

// Admin only routes
router.use(restrictTo('admin'));

// Add admin routes here if needed

module.exports = router; 