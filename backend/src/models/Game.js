const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
      unique: true
    },
    type: {
      type: String,
      required: [true, 'Game type is required'],
      enum: ['ports', 'protocols', 'subnetting', 'acronyms', 'commandline', 'topology', 'firewall', 'encryption']
    },
    description: {
      type: String,
      required: [true, 'Game description is required']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    xpReward: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [0, 'XP reward must be a positive number']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    imageUrl: {
      type: String
    },
    instructions: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for game content
gameSchema.virtual('content', {
  ref: 'GameContent',
  foreignField: 'gameId',
  localField: '_id'
});

// Create the Game model
const Game = mongoose.model('Game', gameSchema);

module.exports = Game; 