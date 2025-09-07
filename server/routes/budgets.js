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
        const percentageUsed = (spent / budget.limit) * 100;
        const remaining = budget.limit - spent;

        return {
          ...budget.toObject(),
          actualSpent: spent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          remaining: Math.max(0, remaining),
          status: percentageUsed >= 100 ? 'over' : percentageUsed >= budget.alertThreshold ? 'warning' : 'safe'
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching budgets' });
  }
});

// POST create or update budget
router.post('/', async (req, res) => {
  try {
    const { category, limit, month, year, alertThreshold } = req.body;
    
    const budgetData = {
      category: category.trim().toLowerCase(),
      limit: parseFloat(limit),
      month,
      year: parseInt(year) || new Date().getFullYear(),
      alertThreshold: alertThreshold || 80
    };

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
        runValidators: true 
      }
    );

    res.status(201).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Budget already exists for this category and month' });
    }
    res.status(400).json({ error: 'Failed to create budget', details: err.message });
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
          category: budget.category,
          budgetLimit: budget.limit,
          spent: spent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          severity: percentageUsed >= 100 ? 'critical' : 'warning',
          message: percentageUsed >= 100 
            ? `Budget exceeded by ₹${(spent - budget.limit).toFixed(2)}`
            : `${Math.round(percentageUsed)}% of budget used`
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget alerts' });
  }
});

module.exports = router;
