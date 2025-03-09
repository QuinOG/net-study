const mongoose = require('mongoose');

const gameContentSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game ID is required']
    },
    contentType: {
      type: String,
      enum: ['question', 'challenge', 'scenario'],
      required: [true, 'Content type is required']
    },
    // Flexible content field as different game types require different structures
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Content is required']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add a text index on the content field for search functionality
gameContentSchema.index({ 'content': 'text' });

// Create the GameContent model
const GameContent = mongoose.model('GameContent', gameContentSchema);

module.exports = GameContent; 