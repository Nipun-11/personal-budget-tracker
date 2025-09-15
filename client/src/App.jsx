import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import pages (remove Reports import)
import Home from './pages/Home.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets from './pages/Budgets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Groups from './pages/Groups.jsx';

// Navigation Component
function Navigation() {
  return (
    <nav style={{
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#2c3e50',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            🏠 Home
          </Link>
          <Link to="/transactions" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            📒 Transactions
          </Link>
          <Link to="/budgets" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            💰 Budgets
          </Link>
          <Link to="/dashboard" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            📊 Dashboard & Reports
          </Link>
          <Link to="/groups" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            👥 Groups
          </Link>
        </div>
        <div style={{ color: 'white' }}>
          <span>💰 Budget Tracker</span>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Navigation />
      
      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
      </Routes>
    </div>
  );
}
