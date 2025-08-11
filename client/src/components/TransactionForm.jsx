import React, { useState } from 'react';
import { createTransaction } from '../services/api';

export default function TransactionForm({ onCreated }) {
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("Submitting:", form);  // ← ADD THIS
    await createTransaction(form);
    setForm({ amount: '', type: 'expense', category: '', date: '' });
    onCreated();
  } catch (err) {
    console.error('Failed to add transaction:', err);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}
