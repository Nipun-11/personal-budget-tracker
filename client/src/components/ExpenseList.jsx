import React from 'react';
import ExpenseActions from './ExpenseActions';

export default function ExpenseList({ group, onGroupUpdated }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      transport: '🚗',
      accommodation: '🏨',
      entertainment: '🎬',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  if (!group.expenses || group.expenses.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '2px dashed #dee2e6',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>💸</div>
        <h4 style={{ margin: '0 0 10px 0' }}>No expenses added yet</h4>
        <p style={{ margin: 0 }}>
          Add your first group expense using the form above!
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ 
        marginBottom: '20px', 
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        📋 Group Expenses
        <span style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {group.expenses.length} total
        </span>
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {group.expenses.map((expense, index) => (
          <div 
            key={expense._id || index}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'}
          >
            {/* Expense Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <h4 style={{ 
                  margin: '0 0 5px 0', 
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {getCategoryIcon(expense.category)} {expense.description}
                </h4>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  💳 Paid by <strong>{expense.paidBy}</strong> • 📅 {formatDate(expense.date)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#dc3545' 
                }}>
                  ₹{expense.amount.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6c757d',
                  textTransform: 'capitalize'
                }}>
                  {expense.splitType} split
                </div>
              </div>
            </div>
            
            {/* Split Details */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#495057'
              }}>
                💰 Split Details:
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '8px' 
              }}>
                {expense.splitDetails?.map((split, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <span style={{ fontSize: '14px' }}>{split.member}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>
                      ₹{split.amount.toFixed(2)}
                    </span>
                  </div>
                )) || (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    No split details available
                  </div>
                )}
              </div>
            </div>

            {/* Comments Preview */}
            {expense.comments && expense.comments.length > 0 && (
              <div style={{ 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#e8f4f8',
                borderRadius: '6px',
                borderLeft: '4px solid #17a2b8'
              }}>
                <div style={{ fontSize: '12px', color: '#0c5460', fontWeight: 'bold' }}>
                  💬 {expense.comments.length} comment{expense.comments.length !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '13px', color: '#0c5460', marginTop: '4px' }}>
                  Latest: "{expense.comments[expense.comments.length - 1].text.substring(0, 50)}
                  {expense.comments[expense.comments.length - 1].text.length > 50 ? '...' : ''}"
                </div>
              </div>
            )}

            {/* Expense Actions */}
            <ExpenseActions
              group={group}
              expense={expense}
              onExpenseUpdated={onGroupUpdated}
              onExpenseDeleted={onGroupUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
