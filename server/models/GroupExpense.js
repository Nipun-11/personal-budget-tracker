// server/models/GroupExpense.js
const mongoose = require('mongoose');

const GroupExpenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },       // name of member who paid
  splitAmong: [{ type: String, required: true }], // array of member names
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupExpense', GroupExpenseSchema);
