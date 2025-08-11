const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// 👉 GET all budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching budgets' });
  }
});

// 👉 POST a new budget
router.post('/', async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    const newBudget = new Budget({
      category,
      limit,
      month
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create budget' });
  }
});

module.exports = router;
