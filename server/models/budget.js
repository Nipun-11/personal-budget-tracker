const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert when 80% of budget is spent
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique budget per category per month/year
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
