const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required']
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Achievement criteria is required']
    },
    icon: {
      type: String,
      default: 'default-achievement.png'
    },
    xpReward: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [0, 'XP reward must be a positive number']
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['beginner', 'progression', 'mastery', 'special'],
      default: 'progression'
    }
  },
  {
    timestamps: true
  }
);

// Create the Achievement model
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement; 