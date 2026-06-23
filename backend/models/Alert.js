const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  symbol: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['GT', 'LT'],
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);