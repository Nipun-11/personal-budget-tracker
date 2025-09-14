import React, { useState } from 'react';

export default function TransactionForm({ onCreated }) {
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setForm({ 
          amount: '', 
          type: 'expense', 
          category: '', 
          description: '', 
          date: new Date().toISOString().split('T')[0], 
          note: '' 
        });
        onCreated();
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>💸 Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <select 
            name="type" 
            value={form.type} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="income">💰 Income</option>
            <option value="expense">💸 Expense</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            name="category"
            placeholder="Category (e.g., food, salary, transport)"
            value={form.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <textarea
            name="note"
            placeholder="Additional notes (optional)"
            value={form.note}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: form.type === 'income' ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add {form.type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
}
