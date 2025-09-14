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
<<<<<<< HEAD
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
=======
  month: {
    type: String, // e.g., "August 2025"
    required: true
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)
  }
}, {
  timestamps: true
});

<<<<<<< HEAD
// Compound index for unique budget per category per month/year
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

=======
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)
module.exports = mongoose.model('Budget', budgetSchema);
