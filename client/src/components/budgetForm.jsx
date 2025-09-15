import React, { useState } from 'react';

export default function BudgetForm({ onCreated }) {
  const [form, setForm] = useState({
    category: '',
    limit: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    alertThreshold: 80
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (name === 'limit' || name === 'alertThreshold' || name === 'year') {
      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.category.trim()) {
      setError('Category is required');
      return false;
    }
    
    if (!form.limit || form.limit === '') {
      setError('Budget limit is required');
      return false;
    }
    
    const limitNum = parseFloat(form.limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Budget limit must be a valid number greater than 0');
      return false;
    }
    
    if (!form.month) {
      setError('Month is required');
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
      console.log('🔍 Submitting budget:', form);
      
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          limit: parseFloat(form.limit),
          year: parseInt(form.year),
          alertThreshold: parseInt(form.alertThreshold)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Budget created successfully:', data);
        setForm({ 
          category: '', 
          limit: '', 
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear(),
          alertThreshold: 80
        });
        if (onCreated) onCreated();
      } else {
        console.error('❌ Budget creation failed:', data);
        setError(data.error || 'Failed to create budget');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
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
            name="category"
            placeholder="Category (e.g., food, transport)"
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
            name="limit"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Budget limit (₹)"
            value={form.limit}
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
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          
          <input
            name="year"
            type="number"
            min="2020"
            max="2030"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100px', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              opacity: loading ? 0.7 : 1
            }}
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
            disabled={loading}
            style={{ 
              width: '100%',
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
            backgroundColor: loading ? '#6c757d' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Creating...' : 'Create Budget'}
        </button>
      </form>
    </div>
  );
}
