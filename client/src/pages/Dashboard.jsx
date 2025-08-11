import React, { useEffect, useState } from 'react';
import { getTransactions, getBudgets } from '../services/api';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [monthFilter, setMonthFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await getTransactions();
        const budgetRes = await getBudgets();
        setTransactions(txRes.data || []);
        setBudgets(budgetRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const applyFilters = () => {
    return transactions.filter((tx) => {
      const txMonth = new Date(tx.date).toLocaleString('default', { month: 'long' });
      return (
        (!monthFilter || txMonth === monthFilter) &&
        (!categoryFilter || tx.category === categoryFilter) &&
        (!typeFilter || tx.type === typeFilter)
      );
    });
  };

  const filteredTransactions = applyFilters();

  const allCategories = [...new Set(transactions.map((tx) => tx.category))];
  const allMonths = [...new Set(transactions.map((tx) =>
    new Date(tx.date).toLocaleString('default', { month: 'long' })
  ))];

  // Pie Chart
  const pieData = () => {
    const categoryTotals = {};
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
      }],
    };
  };

  // Bar Chart
  const barData = () => {
    const monthly = {};
    filteredTransactions.forEach((tx) => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
      if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
      monthly[month][tx.type] += Number(tx.amount);
    });

    const labels = Object.keys(monthly);
    const incomeData = labels.map((m) => monthly[m].income);
    const expenseData = labels.map((m) => monthly[m].expense);

    return {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: '#34d399' },
        { label: 'Expense', data: expenseData, backgroundColor: '#f87171' },
      ],
    };
  };

  // Line Chart
  const lineData = () => {
    const byDate = {};
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + Number(tx.amount);
      }
    });

    const sortedDates = Object.keys(byDate).sort();
    const values = sortedDates.map((d) => byDate[d]);

    return {
      labels: sortedDates,
      datasets: [{
        label: 'Expenses Over Time',
        data: values,
        fill: false,
        borderColor: '#60a5fa',
        tension: 0.2,
      }],
    };
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = totalIncome - totalExpense;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Dashboard</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">All Months</option>
          {allMonths.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      
      
      
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '10px', flex: 1 }}>
          💰 <strong>Income:</strong> ₹{totalIncome}
        </div>
        <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '10px', flex: 1 }}>
          💸 <strong>Expense:</strong> ₹{totalExpense}
        </div>
        <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '10px', flex: 1 }}>
          🧾 <strong>Savings:</strong> ₹{savings}
        </div>
      </div>

      {/* Charts */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3>📌 Category-wise Spending</h3>
        <Pie data={pieData()} />

        <h3 style={{ marginTop: '2rem' }}>📌 Monthly Income vs Expense</h3>
        <Bar data={barData()} />

        <h3 style={{ marginTop: '2rem' }}>📌 Expense Trend</h3>
        <Line data={lineData()} />
      </div>
    </div>
  );
}
