import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function Reports() {
  const [data, setData] = useState({
    transactions: [],
    budgets: [],
    loading: true,
    error: null
  });
 
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    category: 'all',
    type: 'all'
  });

  // Chart refs
  const monthlyChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const budgetChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const chartInstances = useRef({});

  // Fetch data
  useEffect(() => {
    fetchReportData();
  }, [filters]);

  // Cleanup charts
  useEffect(() => {
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    };
  }, []);

  const fetchReportData = async () => {
    setData(prev => ({ ...prev, loading: true }));
   
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        category: filters.category,
        type: filters.type
      });

      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/transactions?${params}`),
        fetch(`http://localhost:5000/api/budgets`)
      ]);

      const transactions = transactionsRes.ok ? await transactionsRes.json() : { transactions: [] };
      const budgets = budgetsRes.ok ? await budgetsRes.json() : [];

      setData({
        transactions: transactions.transactions || [],
        budgets: Array.isArray(budgets) ? budgets : [],
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load report data'
      }));
    }
  };

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const transactions = data.transactions;
   
    // Basic totals
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

    // Category breakdown
    const categories = {};
    transactions.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = { income: 0, expense: 0, count: 0 };
      }
      categories[t.category][t.type] += t.amount;
      categories[t.category].count += 1;
    });

    // Monthly breakdown
    const months = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      months[month][t.type] += t.amount;
    });

    // Top spending categories
    const topExpenseCategories = Object.entries(categories)
      .map(([category, data]) => ({ category, amount: data.expense, count: data.count }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      totals: { totalIncome, totalExpenses, netSavings, savingsRate },
      categories,
      months,
      topExpenseCategories,
      transactionCount: transactions.length
    };
  }, [data.transactions]);

  // Create charts
  useEffect(() => {
    if (data.loading || analytics.transactionCount === 0) return;

    setTimeout(() => {
      createMonthlyChart();
      createCategoryChart();
      createBudgetChart();
      createTrendChart();
    }, 100);
  }, [analytics, data.budgets]);

  const destroyChart = (key) => {
    if (chartInstances.current[key]) {
      chartInstances.current[key].destroy();
      delete chartInstances.current[key];
    }
  };

  const createMonthlyChart = () => {
    const ctx = monthlyChartRef.current;
    if (!ctx) return;

    destroyChart('monthly');

    const monthData = analytics.months;
    const labels = Object.keys(monthData);
    const incomeData = labels.map(month => monthData[month].income);
    const expenseData = labels.map(month => monthData[month].expense);

    chartInstances.current.monthly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: '#28a745',
            borderWidth: 2
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
            borderColor: '#dc3545',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `₹${value.toLocaleString()}`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    });
  };

  const createCategoryChart = () => {
    const ctx = categoryChartRef.current;
    if (!ctx) return;

    destroyChart('category');

    const topCategories = analytics.topExpenseCategories.slice(0, 8);
    const labels = topCategories.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1));
    const amounts = topCategories.map(item => item.amount);

    chartInstances.current.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: context => {
                const total = amounts.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  };

  const createBudgetChart = () => {
    const ctx = budgetChartRef.current;
    if (!ctx || data.budgets.length === 0) return;

    destroyChart('budget');

    const budgetData = data.budgets.map(budget => {
      const spent = analytics.categories[budget.category]?.expense || 0;
      return {
        category: budget.category,
        budget: budget.limit,
        spent,
        percentage: Math.min((spent / budget.limit) * 100, 100)
      };
    });

    chartInstances.current.budget = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: budgetData.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1)),
        datasets: [
          {
            label: 'Budget',
            data: budgetData.map(item => item.budget),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 2
          },
          {
            label: 'Spent',
            data: budgetData.map(item => item.spent),
            backgroundColor: budgetData.map(item =>
              item.percentage >= 100 ? 'rgba(239, 68, 68, 0.8)' :
              item.percentage >= 80 ? 'rgba(251, 191, 36, 0.8)' :
              'rgba(34, 197, 94, 0.8)'
            ),
            borderColor: budgetData.map(item =>
              item.percentage >= 100 ? '#ef4444' :
              item.percentage >= 80 ? '#fbbf24' :
              '#22c55e'
            ),
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `₹${value.toLocaleString()}`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    });
  };

  const createTrendChart = () => {
    const ctx = trendChartRef.current;
    if (!ctx) return;

    destroyChart('trend');

    const monthData = analytics.months;
    const labels = Object.keys(monthData);
    const savingsData = labels.map(month => monthData[month].income - monthData[month].expense);

    chartInstances.current.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Monthly Savings',
          data: savingsData,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: value => `₹${value.toLocaleString()}`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `Savings: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    });
  };

  // Export functions
  const exportToPDF = async () => {
    try {
      // This would typically use a library like jsPDF
      alert('PDF export functionality would be implemented here with jsPDF library');
    } catch (error) {
      alert('Export failed');
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = data.transactions.map(tx => ({
        Date: new Date(tx.date).toLocaleDateString(),
        Type: tx.type,
        Category: tx.category,
        Description: tx.description || '',
        Amount: tx.amount
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('CSV export failed');
    }
  };

  if (data.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3>Generating Reports...</h3>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div style={{
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h3>⚠️ Error Loading Reports</h3>
        <p>{data.error}</p>
        <button
          onClick={fetchReportData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            📊 Financial Reports
          </h1>
          <p style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Comprehensive analysis of your financial data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={exportToCSV}
            style={{
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Export CSV
          </button>
          
          <button
            onClick={exportToPDF}
            style={{
              padding: '10px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>🔍 Filter Reports</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              📅 From Date:
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              📅 To Date:
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              📂 Category:
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Categories</option>
              {Object.keys(analytics.categories).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              💰 Type:
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>💰 Total Income</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ₹{analytics.totals.totalIncome.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>💸 Total Expenses</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ₹{analytics.totals.totalExpenses.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: analytics.totals.netSavings >= 0
            ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>
            {analytics.totals.netSavings >= 0 ? '💵 Net Savings' : '⚠️ Deficit'}
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ₹{Math.abs(analytics.totals.netSavings).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {analytics.totals.savingsRate.toFixed(1)}% savings rate
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          color: '#2c3e50',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>📊 Transactions</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {analytics.transactionCount}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            Total transactions
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {/* Monthly Income vs Expenses */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            📊 Monthly Income vs Expenses
          </h3>
          <div style={{ height: '350px' }}>
            <canvas ref={monthlyChartRef}></canvas>
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            🍰 Expense Categories
          </h3>
          <div style={{ height: '350px' }}>
            <canvas ref={categoryChartRef}></canvas>
          </div>
        </div>

        {/* Budget Performance */}
        {data.budgets.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
              💰 Budget Performance
            </h3>
            <div style={{ height: '350px' }}>
              <canvas ref={budgetChartRef}></canvas>
            </div>
          </div>
        )}

        {/* Savings Trend */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            📈 Savings Trend
          </h3>
          <div style={{ height: '350px' }}>
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Top Categories Table */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
          🏆 Top Spending Categories
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Amount Spent</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Transactions</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Avg per Transaction</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>% of Total Expenses</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topExpenseCategories.map((item, index) => (
                <tr key={item.category} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{
                    padding: '15px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    #{index + 1} {item.category}
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#dc3545'
                  }}>
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    {item.count}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    ₹{(item.amount / item.count).toFixed(0)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    {((item.amount / analytics.totals.totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Footer */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          📊 Report generated on {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Period: {new Date(filters.dateRange.start).toLocaleDateString()} - {new Date(filters.dateRange.end).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
