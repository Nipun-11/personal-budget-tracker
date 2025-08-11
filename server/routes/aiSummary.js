// routes/aiSummary.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Simple AI-like summary logic
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    let income = 0;
    let expenses = 0;
    const categoryTotals = {};

    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount;
      else expenses += tx.amount;

      if (!categoryTotals[tx.category]) {
        categoryTotals[tx.category] = 0;
      }
      categoryTotals[tx.category] += tx.amount;
    }

    const savings = income - expenses;
    const mostSpentCategory = Object.entries(categoryTotals).reduce(
      (max, curr) => (curr[1] > max[1] ? curr : max),
      ['', 0]
    )[0];

    const summary = `
      This month, your total income was ₹${income} and expenses were ₹${expenses}.
      You saved ₹${savings}.
      The category with the most spending was '${mostSpentCategory}'.
      Great job keeping track of your finances!
    `;

    res.json({ summary });
  } catch (err) {
    console.error('❌ AI Summary Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
