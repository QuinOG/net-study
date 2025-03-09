const express = require('express');
const { 
  getAllGames, 
  getGame, 
  getGameContent, 
  submitGameResults,
  createGame,
  updateGame,
  addGameContent
} = require('../controllers/game.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllGames);
router.get('/:id', getGame);
router.get('/:id/content', getGameContent);

// Protected routes
router.use(protect);
router.post('/:id/results', submitGameResults);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createGame);
router.patch('/:id', updateGame);
router.post('/:id/content', addGameContent);

module.exports = router; 