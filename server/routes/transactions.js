const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const saved = await newTransaction.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Invalid transaction data' });
  }
});

module.exports = router;
