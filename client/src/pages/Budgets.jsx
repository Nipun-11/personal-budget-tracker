import React, { useEffect, useState } from 'react';
import { getBudgets } from '../services/api';
import BudgetForm from '../components/BudgetForm';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
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
    </div>
  );
}
