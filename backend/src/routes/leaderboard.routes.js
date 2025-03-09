const express = require('express');
const { 
  getGlobalLeaderboard, 
  getGameLeaderboard 
} = require('../controllers/leaderboard.controller');

const router = express.Router();

// Public routes
router.get('/global', getGlobalLeaderboard);
router.get('/games/:id', getGameLeaderboard);

module.exports = router; 