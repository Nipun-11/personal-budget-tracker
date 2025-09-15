const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0.01, 'Budget limit must be greater than 0']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: () => new Date().getFullYear(),
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: [0, 'Alert threshold must be at least 0'],
    max: [100, 'Alert threshold cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  }
}, {
  timestamps: true,
  strict: true
});

// Compound index to prevent duplicate budgets for same category/month/year
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.limit > 0 ? (this.spent / this.limit) * 100 : 0;
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.limit - this.spent);
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'over';
  if (percentage >= this.alertThreshold) return 'warning';
  return 'safe';
});

// Ensure virtual fields are serialized
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
