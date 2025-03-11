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
  // Calculate level using progressive XP requirements
  // Level 1 requires 50 XP and each level after increases by a factor of 1.25
  if (this.isModified('totalXP')) {
    let totalXP = this.totalXP;
    let level = 1;
    let requiredXP = 50; // Base XP for level 1
    
    while (totalXP >= requiredXP) {
      totalXP -= requiredXP;
      level++;
      requiredXP = Math.floor(requiredXP * 1.25); // Increase by 25% for next level
    }
    
    this.level = level;
  }
  next();
});

// Create the UserStats model
const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats; 