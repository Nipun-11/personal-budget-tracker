import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* Hero Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        marginBottom: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 20px 0',
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          💰 Personal Budget Tracker
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: '#7f8c8d',
          margin: '0 0 40px 0',
          lineHeight: '1.6'
        }}>
          Take control of your finances with intelligent budgeting, expense tracking, 
          and group expense management. Make every rupee count!
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/dashboard"
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📊 View Dashboard
          </Link>
          
          <Link
            to="/transactions"
            style={{
              backgroundColor: '#2ecc71',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            💸 Add Transaction
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Individual Finance */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Personal Finance</h3>
          <ul style={{ color: '#7f8c8d', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Track income and expenses</li>
            <li>Set category-based budgets</li>
            <li>Get overspending alerts</li>
            <li>View spending analytics</li>
            <li>Export financial reports</li>
          </ul>
          <Link
            to="/budgets"
            style={{
              display: 'inline-block',
              backgroundColor: '#3498db',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              marginTop: '15px'
            }}
          >
            Manage Budgets →
          </Link>
        </div>

        {/* Group Expenses */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Group Expenses</h3>
          <ul style={{ color: '#7f8c8d', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Create expense groups</li>
            <li>Split bills equally or custom</li>
            <li>Track who owes what</li>
            <li>Optimize settlements</li>
            <li>Category-wise group tracking</li>
          </ul>
          <Link
            to="/groups"
            style={{
              display: 'inline-block',
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              marginTop: '15px'
            }}
          >
            Create Groups →
          </Link>
        </div>

        {/* Analytics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Smart Analytics</h3>
          <ul style={{ color: '#7f8c8d', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Visual spending charts</li>
            <li>Category breakdowns</li>
            <li>Monthly trend analysis</li>
            <li>Savings rate tracking</li>
            <li>Budget vs actual reports</li>
          </ul>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-block',
              backgroundColor: '#f39c12',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              marginTop: '15px'
            }}
          >
            View Analytics →
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>Why Choose Our Budget Tracker?</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
            <h4 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Smart Budgeting</h4>
            <p style={{ color: '#7f8c8d', margin: 0 }}>
              Set realistic budgets and get alerts before overspending
            </p>
          </div>
          
          <div>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚡</div>
            <h4 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Real-time Updates</h4>
            <p style={{ color: '#7f8c8d', margin: 0 }}>
              Instant balance calculations and spending updates
            </p>
          </div>
          
          <div>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔒</div>
            <h4 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Secure & Private</h4>
            <p style={{ color: '#7f8c8d', margin: 0 }}>
              Your financial data stays safe and private
            </p>
          </div>
          
          <div>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📱</div>
            <h4 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Easy to Use</h4>
            <p style={{ color: '#7f8c8d', margin: 0 }}>
              Intuitive interface that anyone can use
            </p>
          </div>
        </div>
      </div>
=======

export default function Home() {
  return (
    <div>
      <h2>Welcome to Budget Tracker</h2>
      <p>This is the Home page.</p>
>>>>>>> 3c830be (Fixed transactions fetch bug and added budget logic)
    </div>
  );
}
