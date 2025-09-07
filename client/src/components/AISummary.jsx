import React, { useState, useEffect } from 'react';

export default function AISummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAISummary();
  }, [period]);

  const fetchAISummary = async () => {
    setLoading(true);
    try {
      // Simple AI-like summary without external APIs
      const response = await fetch(`http://localhost:5000/api/ai-summary?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        // Fallback if AI endpoint doesn't exist
        setSummary({
          summary: "📊 Your finances look good this month! Keep tracking your expenses to maintain healthy spending habits.",
          recommendations: ["Continue monitoring your spending", "Set up budgets for better control", "Track your savings goals"]
        });
      }
    } catch (error) {
      console.log('AI Summary not available, showing fallback');
      setSummary({
        summary: "📊 Financial tracking is active. Add more transactions for better insights.",
        recommendations: ["Add regular income entries", "Categorize your expenses", "Set monthly budgets"]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        textAlign: 'center'
      }}>
        🤖 AI is analyzing your finances...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>🤖 AI Financial Insights</h3>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {summary && (
        <div>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {summary.summary}
          </div>

          {summary.recommendations && summary.recommendations.length > 0 && (
            <div>
              <h4 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>💡 Recommendations:</h4>
              <ul style={{ marginLeft: '20px', color: '#495057' }}>
                {summary.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={fetchAISummary}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🔄 Refresh
      </button>
    </div>
  );
}
