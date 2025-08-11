import React, { useState } from 'react';
import { createBudget } from '../services/api';

export default function BudgetForm({ onCreated }) {
  const [form, setForm] = useState({
    category: '',
    limit: '',
    month: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBudget(form);
      setForm({ category: '', limit: '', month: '' });
      onCreated(); // refresh budget list
    } catch (err) {
      console.error('❌ Failed to add budget:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        required
      />
      <input
        name="limit"
        type="number"
        placeholder="Limit"
        value={form.limit}
        onChange={handleChange}
        required
      />
      <input
        name="month"
        placeholder="Month (e.g., August 2025)"
        value={form.month}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Budget</button>
    </form>
  );
}
