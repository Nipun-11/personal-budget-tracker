import React, { useState } from 'react';

export default function BudgetForm({ onCreated }) {
  const [form, setForm] = useState({
    category: '',
    limit: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    alertThreshold: 80
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setForm({ 
          category: '', 
          limit: '', 
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear(),
          alertThreshold: 80
        });
        onCreated();
      }
    } catch (err) {
      console.error('❌ Failed to add budget:', err);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>💰 Create Budget</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            name="category"
            placeholder="Category (e.g., food, transport)"
            value={form.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            name="limit"
            type="number"
            step="0.01"
            placeholder="Budget limit (₹)"
            value={form.limit}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          
          <input
            name="year"
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Alert when {form.alertThreshold}% of budget is used:
          </label>
          <input
            name="alertThreshold"
            type="range"
            min="50"
            max="100"
            value={form.alertThreshold}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Create Budget
        </button>
      </form>
    </div>
  );
}
