const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema(
  {
    gameType: {
      type: String,
      required: true,
      enum: ['ports', 'protocols', 'subnetting', 'acronyms', 'commandline', 'topology', 'firewall', 'encryption']
    },
    score: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number // in seconds
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastLoginDate: {
      type: Date
    },
    totalXP: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    protocolChallengesCompleted: {
      type: Number,
      default: 0
    },
    protocolAccuracy: {
      type: Number,
      default: 0
    },
    portsMatchedCorrectly: {
      type: Number,
      default: 0
    },
    portMatchesWithoutErrors: {
      type: Number,
      default: 0
    },
    subnettingChallengesCompleted: {
      type: Number,
      default: 0
    },
    subnettingChallengesCompletedToday: {
      type: Number,
      default: 0
    },
    fastestGameCompletion: {
      type: Number,
      default: 999999 // in seconds
    },
    completedAchievements: [String],
    gameHistory: [gameHistorySchema]
  },
  {
    timestamps: true
  }
);

// Calculate level based on XP
userStatsSchema.pre('save', function(next) {
  // Simple level calculation: level = 1 + (totalXP / 1000)
  // Adjust the formula as needed for your game balance
  if (this.isModified('totalXP')) {
    this.level = Math.floor(1 + (this.totalXP / 1000));
  }
  next();
});

// Create the UserStats model
const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats; 