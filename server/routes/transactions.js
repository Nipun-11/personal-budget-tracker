const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// GET all transactions with advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category.toLowerCase();
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching transactions' });
  }
});

// POST create transaction with budget tracking
router.post('/', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      category: req.body.category.trim().toLowerCase(),
      amount: parseFloat(req.body.amount)
    };

    const newTransaction = new Transaction(transactionData);
    const saved = await newTransaction.save();

    // Update budget if it's an expense
    if (saved.type === 'expense') {
      await updateBudgetSpending(saved.category, saved.amount, new Date(saved.date));
    }

    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid transaction data', details: err.message });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Helper function to update budget spending
async function updateBudgetSpending(category, amount, date) {
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  try {
    await Budget.findOneAndUpdate(
      { category, month, year },
      { $inc: { spent: amount } },
      { upsert: false }
    );
  } catch (error) {
    console.log('Budget not found for category:', category);
  }
}

// GET transaction analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Category-wise spending
    const categoryAnalytics = await Transaction.aggregate([
      { $match: { type: 'expense', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Total income and expenses
    const totals = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      categoryAnalytics,
      monthlyTrends,
      totals: {
        income: totals.find(t => t._id === 'income')?.total || 0,
        expense: totals.find(t => t._id === 'expense')?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

module.exports = router;
