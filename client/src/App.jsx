import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/transactions">Transactions</Link> |{' '}
        <Link to="/budgets">Budgets</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
      </Routes>
    </>
  );
}

export default App;
