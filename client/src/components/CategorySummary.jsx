import React from 'react';

export default function CategorySummary({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>📊 Category Summary</h3>
        <p>No transactions to display</p>
      </div>
    );
  }

  // Calculate category totals
  const categoryTotals = {};
  transactions.forEach(transaction => {
    const category = transaction.category || 'Other';
    const amount = parseFloat(transaction.amount) || 0;
    
    if (!categoryTotals[category]) {
      categoryTotals[category] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      categoryTotals[category].income += amount;
    } else {
      categoryTotals[category].expense += amount;
    }
  });

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3>📊 Category Summary</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Income</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Expenses</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryTotals).map(([category, totals]) => (
              <tr key={category} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', textTransform: 'capitalize' }}>
                  {category}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#28a745' }}>
                  ₹{totals.income.toLocaleString()}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#dc3545' }}>
                  ₹{totals.expense.toLocaleString()}
                </td>
                <td style={{ 
                  padding: '10px', 
                  textAlign: 'right',
                  color: (totals.income - totals.expense) >= 0 ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  ₹{(totals.income - totals.expense).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
