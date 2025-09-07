// server/routes/groupExpenses.js
const express = require('express');
const GroupExpense = require('../models/GroupExpense');
const Group = require('../models/Group');
const router = express.Router();

// Create expense
router.post('/', async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitAmong } = req.body;
    if (!groupId || !description || !amount || !paidBy || !splitAmong?.length) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // validate members exist in group (case-insensitive)
    const invalid = [paidBy, ...splitAmong].filter(m =>
      !group.members.some(mem => mem.toLowerCase() === m.toLowerCase())
    );
    if (invalid.length) {
      return res.status(400).json({ message: `Invalid members: ${invalid.join(', ')}` });
    }

    const expense = new GroupExpense({ groupId, description, amount, paidBy, splitAmong });
    await expense.save();
    return res.status(201).json(expense);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get all expenses for a group
router.get('/:groupId', async (req, res) => {
  try {
    const expenses = await GroupExpense.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Compute raw balances (member => net amount)
router.get('/:groupId/balances', async (req, res) => {
  try {
    const expenses = await GroupExpense.find({ groupId: req.params.groupId });
    const balances = {}; // member => net
    expenses.forEach(exp => {
      const share = Number(exp.amount) / exp.splitAmong.length;
      exp.splitAmong.forEach(member => {
        balances[member] = (balances[member] || 0) - share;
      });
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + Number(exp.amount);
    });
    res.json(balances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: simplified settlement (list of transactions to settle)
router.get('/:groupId/settlements', async (req, res) => {
  try {
    // compute balances same as above
    const expenses = await GroupExpense.find({ groupId: req.params.groupId });
    const balances = {};
    expenses.forEach(exp => {
      const share = Number(exp.amount) / exp.splitAmong.length;
      exp.splitAmong.forEach(member => {
        balances[member] = (balances[member] || 0) - share;
      });
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + Number(exp.amount);
    });

    // Convert balances to array and simplify
    const settlements = simplifyDebts(balances);
    res.json({ balances, settlements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// helper: greedy simplify algorithm
function simplifyDebts(balancesObj) {
  const list = Object.entries(balancesObj)
    .map(([name, bal]) => ({ name, bal: Number(bal) }))
    .filter(x => Math.abs(x.bal) > 1e-6); // ignore near-zero
  const settlements = [];
  if (!list.length) return settlements;

  // split into debtors (-) and creditors (+)
  const debtors = list.filter(x => x.bal < 0).sort((a,b)=>a.bal-b.bal); // most negative first
  const creditors = list.filter(x => x.bal > 0).sort((a,b)=>b.bal-a.bal); // most positive first

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.bal, creditor.bal);
    settlements.push({ from: debtor.name, to: creditor.name, amount: Number(amount.toFixed(2)) });
    debtor.bal += amount;
    creditor.bal -= amount;
    if (Math.abs(debtor.bal) < 1e-6) i++;
    if (Math.abs(creditor.bal) < 1e-6) j++;
  }
  return settlements;
}

module.exports = router;
