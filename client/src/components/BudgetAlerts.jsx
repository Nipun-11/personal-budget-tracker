import React, { useEffect, useState } from 'react';

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/budgets/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div style={{
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Budget Status: All Good!</h4>
        <p style={{ margin: 0, color: '#2e7d32' }}>No budget alerts at this time. Keep up the great financial discipline! 🎉</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>⚠️ Budget Alerts</h3>
      {alerts.map((alert, index) => (
        <div
          key={index}
          style={{
            backgroundColor: alert.severity === 'critical' ? '#ffebee' : '#fff3e0',
            border: `1px solid ${alert.severity === 'critical' ? '#f44336' : '#ff9800'}`,
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ 
              margin: 0, 
              color: alert.severity === 'critical' ? '#c62828' : '#ef6c00',
              textTransform: 'capitalize'
            }}>
              {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.category} Category
            </h4>
            <span style={{ 
              fontWeight: 'bold',
              color: alert.severity === 'critical' ? '#c62828' : '#ef6c00'
            }}>
              {alert.percentageUsed}%
            </span>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            <strong>Spent:</strong> ₹{alert.spent.toFixed(2)} / ₹{alert.budgetLimit.toFixed(2)}
          </p>
          <p style={{ 
            margin: '5px 0 0 0', 
            fontSize: '14px', 
            fontStyle: 'italic',
            color: alert.severity === 'critical' ? '#c62828' : '#ef6c00'
          }}>
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}
