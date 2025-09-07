const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  settledAt: { type: Date, default: Date.now },
  note: { type: String, maxlength: 200 },
  isSettled: { type: Boolean, default: false }
});

const expenseSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paidBy: { 
    type: String, 
    required: true,
    trim: true
  },
  splitType: { 
    type: String, 
    enum: ['equal', 'unequal', 'percentage'], 
    default: 'equal' 
  },
  splitDetails: [{
    member: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  category: { 
    type: String, 
    default: 'general',
    trim: true,
    lowercase: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  receipt: { 
    type: String, 
    trim: true 
  },
  tags: [{
    type: String,
    trim: true
  }],
  comments: [{
    author: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  members: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  admins: [{
    type: String,
    trim: true
  }],
  expenses: [expenseSchema],
  settlements: [settlementSchema],
  currency: {
    type: String,
    default: '₹',
    maxlength: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowMemberAddExpenses: { type: Boolean, default: true },
    requireApprovalForExpenses: { type: Boolean, default: false },
    defaultSplitType: { type: String, default: 'equal' }
  }
}, {
  timestamps: true
});

// Case-insensitive unique index
groupSchema.index(
  { name: 1 }, 
  { 
    unique: true, 
    collation: { locale: 'en', strength: 2 } 
  }
);

// Performance indexes
groupSchema.index({ members: 1 });
groupSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Group", groupSchema);
