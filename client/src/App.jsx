import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial' }}>
      {/* Navigation */}
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '15px' }}>🏠 Home</Link>
        <Link to="/transactions" style={{ marginRight: '15px' }}>📒 Transactions</Link>
        <Link to="/budgets" style={{ marginRight: '15px' }}>💰 Budgets</Link>
        <Link to="/dashboard">📊 Dashboard</Link>
      </nav>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
