const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// GET all budgets with spending analysis
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long' });
    const currentYear = parseInt(year) || new Date().getFullYear();
    
    console.log(`🔍 Fetching budgets for ${currentMonth} ${currentYear}`);
    
    const budgets = await Budget.find({ 
      month: currentMonth, 
      year: currentYear,
      isActive: true 
    });

    // Calculate actual spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startOfMonth = new Date(currentYear, new Date(currentMonth + ' 1').getMonth(), 1);
        const endOfMonth = new Date(currentYear, new Date(currentMonth + ' 1').getMonth() + 1, 0, 23, 59, 59);
        
        const actualSpent = await Transaction.aggregate([
          {
            $match: {
              category: budget.category,
              type: 'expense',
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spent = actualSpent.length > 0 ? actualSpent[0].total : 0;
        const percentageUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
        const remaining = Math.max(0, budget.limit - spent);

        return {
          ...budget.toObject(),
          actualSpent: spent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          remaining: remaining,
          status: percentageUsed >= 100 ? 'over' : percentageUsed >= budget.alertThreshold ? 'warning' : 'safe'
        };
      })
    );

    console.log(`✅ Found ${budgetsWithSpending.length} budgets`);
    res.json(budgetsWithSpending);
  } catch (err) {
    console.error('❌ Budget GET error:', err);
    res.status(500).json({ error: 'Server error while fetching budgets', details: err.message });
  }
});

// POST create or update budget
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Budget POST received:', req.body);
    
    const { category, limit, month, year, alertThreshold } = req.body;
    
    // Enhanced validation
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required and cannot be empty' });
    }
    
    if (!limit || limit === '' || isNaN(parseFloat(limit))) {
      return res.status(400).json({ error: 'Valid limit amount is required' });
    }
    
    const limitValue = parseFloat(limit);
    if (limitValue <= 0) {
      return res.status(400).json({ error: 'Limit must be greater than zero' });
    }
    
    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }
    
    const yearValue = parseInt(year) || new Date().getFullYear();
    if (yearValue < 2020 || yearValue > 2030) {
      return res.status(400).json({ error: 'Year must be between 2020 and 2030' });
    }
    
    const alertThresholdValue = parseInt(alertThreshold) || 80;
    if (alertThresholdValue < 0 || alertThresholdValue > 100) {
      return res.status(400).json({ error: 'Alert threshold must be between 0 and 100' });
    }
    
    const budgetData = {
      category: category.trim().toLowerCase(),
      limit: limitValue,
      month: month,
      year: yearValue,
      alertThreshold: alertThresholdValue,
      isActive: true
    };
    
    console.log('🔍 Processed budget data:', budgetData);
    
    // Use upsert to create or update
    const budget = await Budget.findOneAndUpdate(
      { 
        category: budgetData.category, 
        month: budgetData.month, 
        year: budgetData.year 
      },
      budgetData,
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    console.log('✅ Budget created/updated:', budget);
    res.status(201).json(budget);
  } catch (err) {
    console.error('❌ Budget POST error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'A budget already exists for this category and time period',
        details: 'Try updating the existing budget instead'
      });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    if (err.name === 'StrictModeError') {
      return res.status(400).json({ 
        error: 'Invalid field in request', 
        details: 'One or more fields are not allowed in the budget schema'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create budget', 
      details: err.message 
    });
  }
});

// PUT update budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, month, year, alertThreshold, isActive } = req.body;
    
    const updateData = {};
    
    if (category) updateData.category = category.trim().toLowerCase();
    if (limit) {
      const limitValue = parseFloat(limit);
      if (limitValue > 0) updateData.limit = limitValue;
    }
    if (month) updateData.month = month;
    if (year) {
      const yearValue = parseInt(year);
      if (yearValue >= 2020 && yearValue <= 2030) updateData.year = yearValue;
    }
    if (alertThreshold !== undefined) {
      const threshold = parseInt(alertThreshold);
      if (threshold >= 0 && threshold <= 100) updateData.alertThreshold = threshold;
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    
    const budget = await Budget.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (err) {
    console.error('❌ Budget PUT error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(500).json({ error: 'Failed to update budget', details: err.message });
  }
});

// DELETE budget
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully', budget });
  } catch (err) {
    console.error('❌ Budget DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete budget', details: err.message });
  }
});

// GET budget alerts
router.get('/alerts', async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const budgets = await Budget.find({ 
      month: currentMonth, 
      year: currentYear,
      isActive: true 
    });

    const alerts = [];

    for (const budget of budgets) {
      const startOfMonth = new Date(currentYear, new Date(currentMonth + ' 1').getMonth(), 1);
      const endOfMonth = new Date(currentYear, new Date(currentMonth + ' 1').getMonth() + 1, 0, 23, 59, 59);

      const actualSpent = await Transaction.aggregate([
        {
          $match: {
            category: budget.category,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const spent = actualSpent.length > 0 ? actualSpent[0].total : 0;
      const percentageUsed = (spent / budget.limit) * 100;

      if (percentageUsed >= budget.alertThreshold) {
        alerts.push({
          budgetId: budget._id,
          category: budget.category,
          budgetLimit: budget.limit,
          spent: spent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          severity: percentageUsed >= 100 ? 'critical' : 'warning',
          message: percentageUsed >= 100 
            ? `Budget exceeded by ₹${(spent - budget.limit).toFixed(2)}`
            : `${Math.round(percentageUsed)}% of budget used`,
          alertThreshold: budget.alertThreshold
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    console.error('❌ Budget alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch budget alerts', details: err.message });
  }
});

module.exports = router;
