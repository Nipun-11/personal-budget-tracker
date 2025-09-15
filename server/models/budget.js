const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount must be positive']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  period: {
    type: String,
    required: [true, 'Budget period is required'],
    enum: {
      values: ['weekly', 'monthly', 'quarterly', 'yearly'],
      message: 'Period must be weekly, monthly, quarterly, or yearly'
    },
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  alertThreshold: {
    type: Number,
    min: [0, 'Alert threshold must be between 0 and 100'],
    max: [100, 'Alert threshold must be between 0 and 100'],
    default: 80
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  lastAlertSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate budgets for same category and period
budgetSchema.index({ user: 1, category: 1, startDate: 1, endDate: 1 }, { unique: true });

// Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function() {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for overspend amount
budgetSchema.virtual('overspend').get(function() {
  return Math.max(0, this.spent - this.amount);
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageSpent;
  if (percentage <= this.alertThreshold) return 'good';
  if (percentage <= 100) return 'warning';
  return 'exceeded';
});

// Method to update spent amount
budgetSchema.methods.updateSpent = async function() {
  const Transaction = mongoose.model('Transaction');
  
  const result = await Transaction.aggregate([
    {
      $match: {
        user: this.user,
        category: this.category,
        type: 'expense',
        date: {
          $gte: this.startDate,
          $lte: this.endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  this.spent = result.length > 0 ? result[0].total : 0;
  return this.save();
};

// Static method to update all budgets for a user
budgetSchema.statics.updateUserBudgets = async function(userId) {
  const budgets = await this.find({ user: userId, isActive: true });
  
  for (const budget of budgets) {
    await budget.updateSpent();
  }
  
  return budgets;
};

// Method to check if budget needs alert
budgetSchema.methods.needsAlert = function() {
  const percentage = this.percentageSpent;
  const thresholdReached = percentage >= this.alertThreshold;
  const notRecentlyAlerted = !this.lastAlertSent || 
    (Date.now() - this.lastAlertSent.getTime()) > 24 * 60 * 60 * 1000; // 24 hours
  
  return thresholdReached && notRecentlyAlerted;
};

// Pre-save middleware to validate dates
budgetSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Include virtuals in JSON output
budgetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
