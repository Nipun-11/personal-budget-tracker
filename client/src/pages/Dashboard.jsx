import React, { useEffect, useState, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import AISummary from '../components/AISummary.jsx';
import AIChatbot from '../components/AIChatbot.jsx';
import "../styles/Dashboard.css";

// Register Chart.js components
Chart.register();

export default function Dashboard() {
  // Chart refs for canvas elements
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const budgetChartRef = useRef(null);

  // Store chart instances for cleanup
  const chartInstances = useRef({});

  // Consolidated state management
  const [data, setData] = useState({
    analytics: null,
    transactions: [],
    groups: [],
    budgets: [],
    loading: true,
    error: null
  });

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    period: 'month',
    category: 'all'
  });

  // UI state
  const [viewMode, setViewMode] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Destroy existing chart
  const destroyChart = (chartKey) => {
    if (chartInstances.current[chartKey]) {
      chartInstances.current[chartKey].destroy();
      delete chartInstances.current[chartKey];
    }
  };

  // Create Category Doughnut Chart
  const createCategoryChart = (chartData) => {
    const ctx = categoryChartRef.current;
    if (!ctx || !chartData.labels || chartData.labels.length === 0) return;

    destroyChart('category');

    chartInstances.current.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.datasets[0].data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 5,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 14 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutQuart'
        }
      }
    });
  };

  // Create Trend Line Chart
  const createTrendChart = (chartData) => {
    const ctx = trendChartRef.current;
    if (!ctx || !chartData.labels || chartData.labels.length === 0) return;

    destroyChart('trend');

    chartInstances.current.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Income',
            data: chartData.datasets[0].data,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: 'Expenses',
            data: chartData.datasets[1].data,
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#dc3545',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: { size: 14 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `₹${(value/1000).toFixed(0)}k`,
              font: { size: 12 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: { size: 12 }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  // Create Budget Bar Chart
  const createBudgetChart = (budgets) => {
    const ctx = budgetChartRef.current;
    if (!ctx || !budgets || budgets.length === 0) return;

    destroyChart('budget');

    const categories = budgets.map(b => b.category);
    const budgetAmounts = budgets.map(b => b.limit);
    const spentAmounts = budgets.map(b => b.actualSpent || 0);

    chartInstances.current.budget = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Budget',
            data: budgetAmounts,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Spent',
            data: spentAmounts,
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `₹${value.toLocaleString()}`,
              color: '#6b7280'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              drawBorder: false
            },
            border: { display: false }
          },
          x: {
            ticks: { color: '#6b7280' },
            grid: { display: false },
            border: { display: false }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutElastic'
        }
      }
    });
  };

  // Fetch all data efficiently
  const fetchDashboardData = async () => {
    const isRefresh = !data.loading;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setData(prev => ({ ...prev, loading: true }));
    }

    try {
      const baseUrl = 'http://localhost:5000/api';
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        limit: '10'
      });

      // Parallel API calls for better performance
      const [analyticsRes, transactionsRes, groupsRes, budgetsRes] = await Promise.all([
        fetch(`${baseUrl}/transactions/analytics?${params}`),
        fetch(`${baseUrl}/transactions?${params}`),
        fetch(`${baseUrl}/groups`),
        fetch(`${baseUrl}/budgets`)
      ]);

      // Process responses
      const [analytics, transactionsData, groups, budgets] = await Promise.all([
        analyticsRes.ok ? analyticsRes.json() : null,
        transactionsRes.ok ? transactionsRes.json() : { transactions: [] },
        groupsRes.ok ? groupsRes.json() : [],
        budgetsRes.ok ? budgetsRes.json() : []
      ]);

      setData({
        analytics: analytics || { totals: { income: 0, expense: 0 }, categoryAnalytics: [], monthlyTrends: [] },
        transactions: transactionsData.transactions || [],
        groups: Array.isArray(groups) ? groups : [],
        budgets: Array.isArray(budgets) ? budgets : [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setData(prev => ({
        ...prev,
        error: 'Failed to load dashboard data. Please check your connection.',
        loading: false
      }));
    } finally {
      setRefreshing(false);
    }
  };

  // Update charts when data changes
  useEffect(() => {
    if (data.loading || data.error) return;

    // Small delay to ensure canvas elements are ready
    setTimeout(() => {
      const chartData = generateChartData();
      
      if (chartData.categoryChart.labels.length > 0) {
        createCategoryChart(chartData.categoryChart);
      }
      
      if (chartData.trendChart.labels.length > 0) {
        createTrendChart(chartData.trendChart);
      }
      
      if (data.budgets.length > 0) {
        createBudgetChart(data.budgets);
      }
    }, 100);

    // Cleanup function
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      chartInstances.current = {};
    };
  }, [data.analytics, data.budgets, viewMode]);

  // Fetch data on mount and filter changes
  useEffect(() => {
    fetchDashboardData();
  }, [filters.dateRange.start, filters.dateRange.end]);

  // Computed metrics with memoization
  const metrics = useMemo(() => {
    if (!data.analytics) return { income: 0, expenses: 0, savings: 0, savingsRate: 0 };
    
    const income = data.analytics.totals?.income || 0;
    const expenses = data.analytics.totals?.expense || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100) : 0;
    
    return { income, expenses, savings, savingsRate };
  }, [data.analytics]);

  // Generate chart data
  const generateChartData = () => {
    const categories = data.analytics?.categoryAnalytics?.slice(0, 6) || [];
    const trends = data.analytics?.monthlyTrends || [];
    
    // Category Chart Data
    const categoryChart = {
      labels: categories.map(c => c._id.charAt(0).toUpperCase() + c._id.slice(1)),
      datasets: [{
        data: categories.map(c => c.total)
      }]
    };

    // Trends Chart Data
    const monthLabels = Array.from(new Set(trends.map(t => `${t._id.month}/${t._id.year}`)));
    const incomeData = monthLabels.map(label => {
      const [month, year] = label.split('/');
      const trend = trends.find(t => t._id.month == month && t._id.year == year && t._id.type === 'income');
      return trend ? trend.total : 0;
    });
    const expenseData = monthLabels.map(label => {
      const [month, year] = label.split('/');
      const trend = trends.find(t => t._id.month == month && t._id.year == year && t._id.type === 'expense');
      return trend ? trend.total : 0;
    });

    const trendChart = {
      labels: monthLabels,
      datasets: [
        { data: incomeData },
        { data: expenseData }
      ]
    };

    return { categoryChart, trendChart };
  };

  // Quick period setter
  const setQuickPeriod = (period) => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        break;
    }

    setFilters(prev => ({
      ...prev,
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    }));
  };

  // Export functionality
  const exportData = async (format = 'csv') => {
    try {
      if (format === 'csv') {
        const csvData = data.transactions.map(tx => ({
          Date: new Date(tx.date).toLocaleDateString(),
          Type: tx.type,
          Category: tx.category,
          Description: tx.description || '',
          Amount: tx.amount
        }));

        if (csvData.length === 0) {
          alert('No data to export');
          return;
        }

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
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Loading state
  if (data.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Loading Your Financial Dashboard</h3>
          <p style={{ margin: 0, color: '#6c757d' }}>Analyzing your financial data with AI...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (data.error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 15px 0' }}>Unable to Load Dashboard</h3>
          <p style={{ margin: '0 0 20px 0' }}>{data.error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄 Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔃 Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = generateChartData();

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <style>{`
        .metric-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }
        .chart-container {
          transition: all 0.3s ease;
        }
        .chart-container:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .filter-button {
          transition: all 0.2s ease;
        }
        .filter-button:hover {
          transform: scale(1.05);
        }
        .export-button {
          transition: all 0.2s ease;
        }
        .export-button:hover {
          background-color: #218838 !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header Section */}
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
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📊 AI Financial Dashboard
          </h1>
          <p style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Intelligent insights for smarter financial decisions
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="overview">📊 Overview</option>
            <option value="detailed">📋 Detailed</option>
            <option value="analytics">📈 Analytics</option>
          </select>
          
          <button
            onClick={() => exportData('csv')}
            className="export-button"
            style={{
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Export CSV
          </button>
          
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            style={{
              padding: '10px 16px',
              backgroundColor: refreshing ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* AI Summary Widget */}
      <AISummary />

      {/* Filters Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '16px',
        marginBottom: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>🔍 Date Range & Filters</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Date Inputs */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
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
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
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
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Quick Period Buttons */}
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#495057' }}>
            ⚡ Quick Select:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Last Week', value: 'week', icon: '📅' },
              { label: 'Last Month', value: 'month', icon: '📊' },
              { label: 'Last Quarter', value: 'quarter', icon: '📈' },
              { label: 'Last Year', value: 'year', icon: '📆' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setQuickPeriod(period.value)}
                className="filter-button"
                style={{
                  padding: '10px 16px',
                  backgroundColor: filters.period === period.value ? '#007bff' : '#f8f9fa',
                  color: filters.period === period.value ? 'white' : '#495057',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {period.icon} {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {/* Income Card */}
        <div
          className="metric-card"
          onClick={() => setViewMode('detailed')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '32px', marginRight: '15px' }}>💰</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Total Income</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Revenue earned</p>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
            ₹{metrics.income.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Period: {filters.period}
          </div>
        </div>

        {/* Expenses Card */}
        <div
          className="metric-card"
          onClick={() => setViewMode('analytics')}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '32px', marginRight: '15px' }}>💸</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Total Expenses</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Money spent</p>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
            ₹{metrics.expenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {data.analytics?.categoryAnalytics?.length || 0} categories
          </div>
        </div>

        {/* Savings Card */}
        <div
          className="metric-card"
          style={{
            background: metrics.savings >= 0
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: `0 4px 15px ${metrics.savings >= 0 ? 'rgba(79, 172, 254, 0.4)' : 'rgba(250, 112, 154, 0.4)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '32px', marginRight: '15px' }}>
              {metrics.savings >= 0 ? '💵' : '⚠️'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {metrics.savings >= 0 ? 'Net Savings' : 'Deficit'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Financial balance</p>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
            ₹{Math.abs(metrics.savings).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {metrics.savingsRate.toFixed(1)}% savings rate
          </div>
        </div>

        {/* Groups Card */}
        <div
          className="metric-card"
          onClick={() => window.location.href = '/groups'}
          style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#2c3e50',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(168, 237, 234, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '32px', marginRight: '15px' }}>👥</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Active Groups</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Shared expenses</p>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
            {data.groups.length}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {data.groups.reduce((total, group) => total + (group.expenses?.length || 0), 0)} group expenses
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {/* Category Spending Chart */}
        {chartData.categoryChart.labels.length > 0 && (
          <div className="chart-container" style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
          }}>
            <h3 style={{
              marginBottom: '20px',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🍰 Spending by Category
              <span style={{
                fontSize: '12px',
                backgroundColor: '#e9ecef',
                color: '#6c757d',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                Top {chartData.categoryChart.labels.length}
              </span>
            </h3>
            <div style={{ height: '350px', display: 'flex', justifyContent: 'center' }}>
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </div>
        )}

        {/* Income vs Expenses Trend */}
        {chartData.trendChart.labels.length > 0 && (
          <div className="chart-container" style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
          }}>
            <h3 style={{
              marginBottom: '20px',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📈 Financial Trends
              <span style={{
                fontSize: '12px',
                backgroundColor: '#e9ecef',
                color: '#6c757d',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {chartData.trendChart.labels.length} periods
              </span>
            </h3>
            <div style={{ height: '350px' }}>
              <canvas ref={trendChartRef}></canvas>
            </div>
          </div>
        )}
      </div>

      {/* Budget Overview */}
      {data.budgets.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <h3 style={{
            marginBottom: '20px',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💰 Budget Health Check
            <span style={{
              fontSize: '12px',
              backgroundColor: '#e9ecef',
              color: '#6c757d',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {data.budgets.length} budgets
            </span>
          </h3>
          
          {/* Budget Chart */}
          {data.budgets.length > 0 && (
            <div style={{ height: '300px', marginBottom: '20px' }}>
              <canvas ref={budgetChartRef}></canvas>
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {data.budgets.slice(0, 6).map((budget, index) => {
              const spent = budget.actualSpent || 0;
              const percentage = Math.min((spent / budget.limit) * 100, 100);
              const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'safe';
              
              return (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    border: `2px solid ${
                      status === 'safe' ? '#28a745' :
                      status === 'warning' ? '#ffc107' : '#dc3545'
                    }`,
                    borderRadius: '12px',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      textTransform: 'capitalize',
                      color: '#2c3e50'
                    }}>
                      {budget.category}
                    </h4>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor:
                        status === 'safe' ? '#d4edda' :
                        status === 'warning' ? '#fff3cd' : '#f8d7da',
                      color:
                        status === 'safe' ? '#155724' :
                        status === 'warning' ? '#856404' : '#721c24'
                    }}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#e9ecef',
                    borderRadius: '10px',
                    height: '12px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor:
                        status === 'safe' ? '#28a745' :
                        status === 'warning' ? '#ffc107' : '#dc3545',
                      transition: 'width 0.8s ease',
                      borderRadius: '10px'
                    }}></div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                    <span>Spent: ₹{spent.toLocaleString()}</span>
                    <span>Limit: ₹{budget.limit.toLocaleString()}</span>
                  </div>
                  
                  {status === 'over' && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#dc3545',
                      fontWeight: '500'
                    }}>
                      Over budget by ₹{(spent - budget.limit).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {data.transactions.length > 0 && viewMode !== 'analytics' && (
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <h3 style={{
            marginBottom: '20px',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🕐 Recent Transactions
            <span style={{
              fontSize: '12px',
              backgroundColor: '#e9ecef',
              color: '#6c757d',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              Latest {Math.min(data.transactions.length, 10)}
            </span>
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{
                    padding: '15px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: '600',
                    color: '#495057'
                  }}>Date</th>
                  <th style={{
                    padding: '15px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: '600',
                    color: '#495057'
                  }}>Description</th>
                  <th style={{
                    padding: '15px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: '600',
                    color: '#495057'
                  }}>Category</th>
                  <th style={{
                    padding: '15px 12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: '600',
                    color: '#495057'
                  }}>Amount</th>
                  <th style={{
                    padding: '15px 12px',
                    textAlign: 'center',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: '600',
                    color: '#495057'
                  }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.slice(0, viewMode === 'detailed' ? 20 : 8).map((transaction, index) => (
                  <tr
                    key={transaction._id || index}
                    style={{
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '15px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#495057'
                    }}>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{
                      padding: '15px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#2c3e50',
                      fontWeight: '500'
                    }}>
                      {transaction.description || '-'}
                    </td>
                    <td style={{
                      padding: '15px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      textTransform: 'capitalize',
                      color: '#6c757d'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: '#e9ecef',
                        color: '#495057'
                      }}>
                        {transaction.category}
                      </span>
                    </td>
                    <td style={{
                      padding: '15px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'right',
                      color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                      fontWeight: 'bold',
                      fontSize: '15px'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                    <td style={{
                      padding: '15px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: transaction.type === 'income' ? '#d4edda' : '#f8d7da',
                        color: transaction.type === 'income' ? '#155724' : '#721c24'
                      }}>
                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.transactions.length > 8 && viewMode !== 'detailed' && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setViewMode('detailed')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                View All {data.transactions.length} Transactions
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
