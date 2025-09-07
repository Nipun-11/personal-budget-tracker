import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';

export default function App() {
  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        padding: '15px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <nav style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#ecf0f1' 
          }}>
            💰 Budget Tracker
          </div>
          
          <div style={{ display: 'flex', gap: '0' }}>
            <Link 
              to="/" 
              style={{ 
                color: '#ecf0f1', 
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              🏠 Home
            </Link>
            
            <Link 
              to="/dashboard" 
              style={{ 
                color: '#ecf0f1', 
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📊 Dashboard
            </Link>
            
            <Link 
              to="/transactions" 
              style={{ 
                color: '#ecf0f1', 
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📒 Transactions
            </Link>
            
            <Link 
              to="/budgets" 
              style={{ 
                color: '#ecf0f1', 
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              💰 Budgets
            </Link>
            
            <Link 
              to="/groups" 
              style={{ 
                color: '#ecf0f1', 
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              👥 Groups
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/groups" element={<Groups />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          © 2025 Personal Budget Tracker - Manage your finances with ease! 💼
        </p>
      </footer>
    </div>
  );
}
