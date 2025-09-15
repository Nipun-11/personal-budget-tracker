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

    console.log('🔍 Transaction GET query:', req.query);

    // Build filter object
    const filter = {};
    
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    if (category) {
      filter.category = category.toLowerCase();
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // Include the entire end date
        filter.date.$lte = endDateObj;
      }
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount && !isNaN(parseFloat(minAmount))) {
        filter.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount && !isNaN(parseFloat(maxAmount))) {
        filter.amount.$lte = parseFloat(maxAmount);
      }
    }
    if (search && search.trim()) {
      filter.$or = [
        { description: { $regex: search.trim(), $options: 'i' } },
        { note: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Transaction.countDocuments(filter);

    console.log(`✅ Found ${transactions.length} transactions (${total} total)`);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    });
  } catch (err) {
    console.error('❌ Transaction GET error:', err);
    res.status(500).json({ error: 'Server error while fetching transactions', details: err.message });
  }
});

// POST create transaction with budget tracking
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Transaction POST received:', req.body);
    
    const { amount, type, category, description, date, note } = req.body;
    
    // Enhanced validation
    if (!amount || amount === '' || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
    }
    
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required and cannot be empty' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // Validate date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const transactionData = {
      amount: amountValue,
      type: type,
      category: category.trim().toLowerCase(),
      description: description ? description.trim() : '',
      date: dateObj,
      note: note ? note.trim() : ''
    };
    
    console.log('🔍 Processed transaction data:', transactionData);
    
    const newTransaction = new Transaction(transactionData);
    const saved = await newTransaction.save();
    
    console.log('✅ Transaction created:', saved);
    
    // Update budget if it's an expense
    if (saved.type === 'expense') {
      await updateBudgetSpending(saved.category, saved.amount, saved.date);
    }
    
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Transaction POST error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid data format', 
        details: `Invalid ${err.path}: ${err.value}`
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create transaction', 
      details: err.message 
    });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, date, note } = req.body;
    
    const updateData = {};
    
    if (amount !== undefined) {
      const amountValue = parseFloat(amount);
      if (amountValue > 0) updateData.amount = amountValue;
    }
    if (type && ['income', 'expense'].includes(type)) {
      updateData.type = type;
    }
    if (category) {
      updateData.category = category.trim().toLowerCase();
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (date) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) updateData.date = dateObj;
    }
    if (note !== undefined) {
      updateData.note = note.trim();
    }
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error('❌ Transaction PUT error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(500).json({ error: 'Failed to update transaction', details: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpending(transaction.category, -transaction.amount, transaction.date);
    }
    
    res.json({ message: 'Transaction deleted successfully', transaction });
  } catch (err) {
    console.error('❌ Transaction DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  }
});

// Helper function to update budget spending
async function updateBudgetSpending(category, amount, date) {
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  try {
    const result = await Budget.findOneAndUpdate(
      { category, month, year, isActive: true },
      { $inc: { spent: amount } },
      { new: true }
    );
    
    if (result) {
      console.log(`📊 Updated budget for ${category} (${month} ${year}): ${amount > 0 ? '+' : ''}₹${amount}`);
    } else {
      console.log(`💡 No active budget found for ${category} in ${month} ${year}`);
    }
  } catch (error) {
    console.error('❌ Error updating budget spending:', error);
  }
}

// GET transaction analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('🔍 Analytics query:', { startDate, endDate });
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = endDateObj;
      }
    }

    // Category-wise spending
    const categoryAnalytics = await Transaction.aggregate([
      { $match: { type: 'expense', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
          max: { $max: '$amount' },
          min: { $min: '$amount' }
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
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.type': 1 } }
    ]);

    // Total income and expenses
    const totals = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      }
    ]);

    // Weekly trends
    const weeklyTrends = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            week: { $week: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    const analytics = {
      categoryAnalytics,
      monthlyTrends,
      weeklyTrends,
      totals: {
        income: totals.find(t => t._id === 'income')?.total || 0,
        expense: totals.find(t => t._id === 'expense')?.total || 0,
        incomeCount: totals.find(t => t._id === 'income')?.count || 0,
        expenseCount: totals.find(t => t._id === 'expense')?.count || 0,
        avgIncome: totals.find(t => t._id === 'income')?.avg || 0,
        avgExpense: totals.find(t => t._id === 'expense')?.avg || 0
      }
    };

    console.log('✅ Analytics generated successfully');
    res.json(analytics);
  } catch (err) {
    console.error('❌ Analytics error:', err);
    res.status(500).json({ error: 'Failed to generate analytics', details: err.message });
  }
});

// GET transaction statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const stats = await Transaction.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          avgTransaction: { $avg: '$amount' },
          maxTransaction: { $max: '$amount' },
          minTransaction: { $min: '$amount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpenses: 0,
      avgTransaction: 0,
      maxTransaction: 0,
      minTransaction: 0
    };

    result.netSavings = result.totalIncome - result.totalExpenses;
    result.savingsRate = result.totalIncome > 0 ? (result.netSavings / result.totalIncome) * 100 : 0;

    res.json(result);
  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(500).json({ error: 'Failed to generate statistics', details: err.message });
  }
});

module.exports = router;
