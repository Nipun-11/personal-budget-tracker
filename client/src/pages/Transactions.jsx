import React, { useEffect, useState } from 'react';
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
    </div>
  );
}
