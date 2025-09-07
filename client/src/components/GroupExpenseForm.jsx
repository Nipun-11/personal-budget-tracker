import React, { useState } from 'react';

export default function GroupExpenseForm({ group, onExpenseAdded }) {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitType: 'equal',
    category: 'food'
  });
  const [customSplits, setCustomSplits] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let splitDetails = [];
    
    if (expense.splitType === 'equal') {
      const amountPerPerson = parseFloat(expense.amount) / group.members.length;
      splitDetails = group.members.map(member => ({
        member,
        amount: amountPerPerson
      }));
    } else if (expense.splitType === 'unequal') {
      splitDetails = Object.entries(customSplits).map(([member, amount]) => ({
        member,
        amount: parseFloat(amount) || 0
      }));
    }

    const expenseData = {
      ...expense,
      amount: parseFloat(expense.amount),
      splitDetails
    };

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${group._id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      
      if (response.ok) {
        setExpense({ description: '', amount: '', paidBy: '', splitType: 'equal', category: 'food' });
        setCustomSplits({});
        onExpenseAdded();
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleCustomSplitChange = (member, amount) => {
    setCustomSplits(prev => ({
      ...prev,
      [member]: amount
    }));
  };

  return (
    <div style={{ 
      border: '2px solid #e3f2fd', 
      borderRadius: '12px', 
      padding: '20px', 
      marginBottom: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>💰 Add Group Expense</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Expense description"
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="number"
            step="0.01"
            placeholder="Total amount"
            value={expense.amount}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <select
            value={expense.paidBy}
            onChange={(e) => setExpense({...expense, paidBy: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="">Who paid?</option>
            {group.members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <select
            value={expense.category}
            onChange={(e) => setExpense({...expense, category: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="food">🍽️ Food</option>
            <option value="transport">🚗 Transport</option>
            <option value="accommodation">🏨 Stay</option>
            <option value="entertainment">🎬 Fun</option>
            <option value="other">📦 Other</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Split Method:</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <label>
              <input
                type="radio"
                value="equal"
                checked={expense.splitType === 'equal'}
                onChange={(e) => setExpense({...expense, splitType: e.target.value})}
              />
              Equal Split
            </label>
            <label>
              <input
                type="radio"
                value="unequal"
                checked={expense.splitType === 'unequal'}
                onChange={(e) => setExpense({...expense, splitType: e.target.value})}
              />
              Custom Split
            </label>
          </div>
        </div>
        
        {expense.splitType === 'unequal' && (
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>Custom Split:</h4>
            {group.members.map(member => (
              <div key={member} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>{member}:</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={customSplits[member] || ''}
                  onChange={(e) => handleCustomSplitChange(member, e.target.value)}
                  style={{ width: '100px', padding: '5px' }}
                />
              </div>
            ))}
          </div>
        )}
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ➕ Add Expense
        </button>
      </form>
    </div>
  );
}
