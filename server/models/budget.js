const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  month: {
    type: String, // e.g., "August 2025"
    required: true
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
