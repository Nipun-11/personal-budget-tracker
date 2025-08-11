import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/api';
import TransactionForm from '../components/TransactionForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await getTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const filteredTransactions = transactions
    .filter((tx) =>
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.date.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOption === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOption === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === 'amount-asc') {
        return Number(a.amount) - Number(b.amount);
      } else if (sortOption === 'amount-desc') {
        return Number(b.amount) - Number(a.amount);
      }
      return 0;
    });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Transactions</h2>

      {/* Transaction Form */}
      <TransactionForm onCreated={fetchTransactions} />

      {/* Search and Sort Controls */}
      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by category or date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="">-- Sort By --</option>
          <option value="date-asc">Date ↑</option>
          <option value="date-desc">Date ↓</option>
          <option value="amount-asc">Amount ↑</option>
          <option value="amount-desc">Amount ↓</option>
        </select>
      </div>

      {/* Transaction List */}
      <ul>
        {filteredTransactions.map((tx) => (
          <li key={tx._id}>
            {tx.date} - {tx.category} - ₹{tx.amount} ({tx.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
