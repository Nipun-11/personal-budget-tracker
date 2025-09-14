import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import TransactionForm from '../components/TransactionForm';
import CategorySummary from '../components/CategorySummary';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [layout, setLayout] = useState('table');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`http://localhost:5000/api/transactions?${params}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('❌ Failed to fetch transactions:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>💸 Transactions</h2>
      
      <TransactionForm onCreated={fetchTransactions} />

      {/* Filters */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h3>🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <input
            name="category"
            placeholder="Category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          
          <input
            name="search"
            placeholder="Search description..."
            value={filters.search}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          
          <input
            name="startDate"
            type="date"
            placeholder="From date"
            value={filters.startDate}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          
          <input
            name="endDate"
            type="date"
            placeholder="To date"
            value={filters.endDate}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setLayout('card')}
          style={{
            padding: '8px 16px',
            backgroundColor: layout === 'card' ? '#2196f3' : '#e0e0e0',
            color: layout === 'card' ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Card View
        </button>
        <button 
          onClick={() => setLayout('table')}
          style={{
            padding: '8px 16px',
            backgroundColor: layout === 'table' ? '#2196f3' : '#e0e0e0',
            color: layout === 'table' ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Table View
        </button>
      </div>

      {/* Results */}
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No transactions found. Add your first transaction above! 📝
        </div>
      ) : (
        <>
          {layout === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {transactions.map((tx) => (
                <div 
                  key={tx._id} 
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '12px', 
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{tx.category}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: tx.type === 'income' ? '#d4edda' : '#f8d7da',
                      color: tx.type === 'income' ? '#155724' : '#721c24'
                    }}>
                      {tx.type}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: tx.type === 'income' ? '#28a745' : '#dc3545',
                    marginBottom: '10px'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </div>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    📅 {new Date(tx.date).toLocaleDateString()}
                  </p>
                  {tx.description && (
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{tx.description}</p>
                  )}
                  {tx.note && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                      {tx.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #dee2e6' }}>Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #dee2e6' }}>Category</th>
                    <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #dee2e6' }}>Description</th>
                    <th style={{ padding: '15px', textAlign: 'right', border: '1px solid #dee2e6' }}>Amount</th>
                    <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #dee2e6' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ padding: '15px', border: '1px solid #dee2e6' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', border: '1px solid #dee2e6', textTransform: 'capitalize' }}>
                        {tx.category}
                      </td>
                      <td style={{ padding: '15px', border: '1px solid #dee2e6' }}>
                        {tx.description || '-'}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        border: '1px solid #dee2e6', 
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: tx.type === 'income' ? '#28a745' : '#dc3545'
                      }}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '15px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          backgroundColor: tx.type === 'income' ? '#d4edda' : '#f8d7da',
                          color: tx.type === 'income' ? '#155724' : '#721c24'
                        }}>
                          {tx.type === 'income' ? '💰 Income' : '💸 Expense'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
=======
import { getTransactions } from '../services/api';
import TransactionForm from '../components/TransactionForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  // Fetch data from backend on first render
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await getTransactions();
      console.log("Fetched from backend:", data);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  return (
    <div>
      <h2>Transactions</h2>

      {/* Transaction Form */}
      <TransactionForm onCreated={fetchTransactions} />

      {/* Transaction List */}
      <ul>
        {transactions.map((tx) => (
          <li key={tx._id}>
            {tx.date} - {tx.category} - ₹{tx.amount} ({tx.type})
          </li>
        ))}
      </ul>
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)
    </div>
  );
}
