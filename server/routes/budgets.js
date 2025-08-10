const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// @route   GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const newBudget = new Budget(req.body);
    const saved = await newBudget.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Invalid budget data' });
  }
});

module.exports = router;
