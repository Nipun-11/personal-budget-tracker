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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.amount || form.amount === '') {
      setError('Amount is required');
      return false;
    }
    
    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a valid number greater than 0');
      return false;
    }
    
    if (!form.type) {
      setError('Transaction type is required');
      return false;
    }
    
    if (!form.category.trim()) {
      setError('Category is required');
      return false;
    }
    
    if (!form.date) {
      setError('Date is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Submitting transaction:', form);
      
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Transaction created successfully:', data);
        setForm({ 
          amount: '', 
          type: 'expense', 
          category: '', 
          description: '', 
          date: new Date().toISOString().split('T')[0], 
          note: '' 
        });
        if (onCreated) onCreated();
      } else {
        console.error('❌ Transaction creation failed:', data);
        setError(data.error || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
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
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <select 
            name="type" 
            value={form.type} 
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
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
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <textarea
            name="note"
            placeholder="Additional notes (optional)"
            value={form.note}
            onChange={handleChange}
            rows="3"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd', 
              resize: 'vertical',
              opacity: loading ? 0.7 : 1
            }}
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : (form.type === 'income' ? '#4caf50' : '#f44336'),
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Adding...' : `Add ${form.type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  );
}
