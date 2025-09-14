import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Import pages
import Home from './pages/Home.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets from './pages/Budgets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Groups from './pages/Groups.jsx';

// Import authentication components
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  return children;
}

// Navigation Component
function Navigation() {
  const { user, logout } = useAuth();

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
            📊 Dashboard
          </Link>
          <Link to="/groups" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>
            👥 Groups
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ marginRight: '15px', color: '#f39c12', textDecoration: 'none' }}>
              🔧 Admin
            </Link>
          )}
        </div>

        <div style={{ color: 'white' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>👤 {user.name}</span>
              <button 
                onClick={logout}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" style={{ color: 'white', marginRight: '10px' }}>Login</Link>
              <Link to="/register" style={{ color: 'white' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Main App Component
function AppContent() {
  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Navigation />
      
      {/* Page Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        
        <Route path="/budgets" element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/groups" element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        } />

        {/* Admin Route */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
