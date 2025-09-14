import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import BudgetForm from '../components/BudgetForm';
import { getBudgets } from '../services/api';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
=======
import { getBudgets } from '../services/api';
import BudgetForm from '../components/BudgetForm';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
<<<<<<< HEAD
      setLoading(true);
      const response = await getBudgets();
      setBudgets(response.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch budgets:', err);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return { bg: '#d4edda', border: '#c3e6cb', text: '#155724' };
      case 'warning':
        return { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' };
      case 'over':
        return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' };
      default:
        return { bg: '#e9ecef', border: '#dee2e6', text: '#6c757d' };
    }
  };

  const getBudgetStatusIcon = (status) => {
    switch (status) {
      case 'safe':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'over':
        return '🚨';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading budgets...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>💰 Budget Management</h2>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <BudgetForm onCreated={fetchBudgets} />

      {budgets.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          border: '2px dashed #dee2e6',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ marginBottom: '15px' }}>No budgets created yet</h3>
          <p style={{ fontSize: '16px', marginBottom: '0' }}>
            Create your first budget above to start tracking your spending limits! 
            Set budgets for categories like food, transport, entertainment, etc.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📈 Budget Overview</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {budgets.filter(b => b.status === 'safe').length}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Safe Budgets</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {budgets.filter(b => b.status === 'warning').length}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Warning</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {budgets.filter(b => b.status === 'over').length}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Over Budget</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  ₹{budgets.reduce((sum, b) => sum + (b.limit || 0), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Budgeted</div>
              </div>
            </div>
          </div>

          {/* Budget Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '25px' 
          }}>
            {budgets.map((budget, index) => {
              const statusColors = getBudgetStatusColor(budget.status);
              const statusIcon = getBudgetStatusIcon(budget.status);
              
              return (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    border: `2px solid ${statusColors.border}`,
                    borderRadius: '16px',
                    padding: '25px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      textTransform: 'capitalize', 
                      color: '#2c3e50',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {budget.category}
                    </h4>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      border: `1px solid ${statusColors.border}`
                    }}>
                      {statusIcon} {budget.status === 'safe' ? 'On Track' : 
                                   budget.status === 'warning' ? 'Warning' : 
                                   'Over Budget'}
                    </span>
                  </div>
                  
                  {/* Amount Details */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#6c757d' }}>Spent:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: budget.status === 'over' ? '#dc3545' : '#2c3e50'
                      }}>
                        ₹{(budget.actualSpent || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#6c757d' }}>Budget:</span>
                      <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        ₹{budget.limit.toLocaleString()}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#6c757d' }}>Remaining:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: (budget.remaining || 0) >= 0 ? '#28a745' : '#dc3545'
                      }}>
                        ₹{Math.abs(budget.remaining || 0).toLocaleString()}
                        {(budget.remaining || 0) < 0 && ' over'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#6c757d', fontWeight: 'bold' }}>Progress</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: statusColors.text
                      }}>
                        {Math.min(budget.percentageUsed || 0, 999).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '10px', 
                      height: '12px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${Math.min((budget.percentageUsed || 0), 100)}%`,
                        height: '100%',
                        backgroundColor: budget.percentageUsed >= 100 ? '#dc3545' : 
                                       budget.percentageUsed >= (budget.alertThreshold || 80) ? '#ffc107' : '#28a745',
                        transition: 'width 0.3s ease',
                        borderRadius: '10px'
                      }}></div>
                      
                      {/* Alert threshold indicator */}
                      {budget.alertThreshold && (
                        <div style={{
                          position: 'absolute',
                          left: `${budget.alertThreshold}%`,
                          top: 0,
                          bottom: 0,
                          width: '2px',
                          backgroundColor: '#6c757d',
                          opacity: 0.5
                        }}></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Period */}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d',
                    textAlign: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid #e9ecef'
                  }}>
                    📅 {budget.month} {budget.year}
                    {budget.alertThreshold && (
                      <span style={{ marginLeft: '10px' }}>
                        ⚠️ Alert at {budget.alertThreshold}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
=======
      const { data } = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error('❌ Failed to fetch budgets:', err);
    }
  };

  return (
    <div>
      <h2>Budgets</h2>
      <BudgetForm onCreated={fetchBudgets} />
      <ul>
        {budgets.map((budget) => (
          <li key={budget._id}>
            <strong>{budget.category}</strong> - ₹{budget.limit} for {budget.month}
          </li>
        ))}
      </ul>
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)
    </div>
  );
}
