import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroup, addExpense } from "../services/api";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expense, setExpense] = useState({ description: "", amount: "", paidBy: "" });

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    const data = await getGroup(id);
    setGroup(data);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expense.description || !expense.amount || !expense.paidBy) return;

    await addExpense(id, {
      ...expense,
      amount: parseFloat(expense.amount),
    });

    setExpense({ description: "", amount: "", paidBy: "" });
    fetchGroup();
  };

  const calculateBalances = () => {
    if (!group) return {};
    const balances = {};
    group.members.forEach((m) => (balances[m] = 0));

    const perExpense = group.expenses || [];
    perExpense.forEach((exp) => {
      const share = exp.amount / group.members.length;
      group.members.forEach((m) => {
        if (m === exp.paidBy) {
          balances[m] += exp.amount - share;
        } else {
          balances[m] -= share;
        }
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  if (!group) return <p>Loading...</p>;

  return (
    <div>
      <h2>👥 {group.name} - Group Details</h2>
      <h3>Members: {group.members.join(", ")}</h3>

      <h3>Add Expense</h3>
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          placeholder="Description"
          value={expense.description}
          onChange={(e) => setExpense({ ...expense, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={expense.amount}
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
        />
        <select
          value={expense.paidBy}
          onChange={(e) => setExpense({ ...expense, paidBy: e.target.value })}
        >
          <option value="">Select Payer</option>
          {group.members.map((m, idx) => (
            <option key={idx} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button type="submit">Add Expense</button>
      </form>

      <h3>Expenses</h3>
      <ul>
        {group.expenses.map((exp, idx) => (
          <li key={idx}>
            {exp.description} - {exp.amount} paid by {exp.paidBy}
          </li>
        ))}
      </ul>

      <h3>Balances</h3>
      <ul>
        {Object.entries(balances).map(([member, balance]) => (
          <li key={member}>
            {member}: {balance >= 0 ? `Gets ${balance}` : `Owes ${-balance}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
const [newMember, setNewMember] = useState("");

// Add member
const handleAddMember = async () => {
  if (!newMember.trim()) return;
  await axios.post(`${API}/groups/${id}/members`, { member: newMember.trim() });
  setNewMember("");
  fetchGroup();
};

// Remove member
const handleRemoveMember = async (member) => {
  await axios.delete(`${API}/groups/${id}/members/${member}`);
  fetchGroup();
};
