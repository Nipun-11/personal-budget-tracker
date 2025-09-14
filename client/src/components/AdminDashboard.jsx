import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userPage, setUserPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics?period=30', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        fetchUsers(userPage);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>🔧 Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.name}</span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
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
      </header>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '0 2rem'
      }}>
        {['overview', 'users', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab ? '3px solid #007bff' : '3px solid transparent',
              color: activeTab === tab ? '#007bff' : '#666',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '1rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div>
            <h2>📊 System Overview</h2>
            
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #3498db'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>Total Users</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                  {dashboardData.overview.totalUsers}
                </p>
                <small style={{ color: '#666' }}>
                  {dashboardData.overview.activeUsers} active users
                </small>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #2ecc71'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2ecc71' }}>Total Transactions</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                  {dashboardData.overview.totalTransactions}
                </p>
                <small style={{ color: '#666' }}>All time</small>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #f39c12'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#f39c12' }}>Total Income</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                  ₹{dashboardData.financials.totalIncome.toLocaleString()}
                </p>
                <small style={{ color: '#666' }}>All users combined</small>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #e74c3c'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#e74c3c' }}>Total Expenses</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                  ₹{dashboardData.financials.totalExpenses.toLocaleString()}
                </p>
                <small style={{ color: '#666' }}>All users combined</small>
              </div>
            </div>

            {/* Recent Users */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3>👥 Recent Users</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Join Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Last Login</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem' }}>{user.name}</td>
                        <td style={{ padding: '1rem' }}>{user.email}</td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                            color: user.isActive ? '#155724' : '#721c24'
                          }}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Spenders */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>💸 Top Spenders</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Spent</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topSpenders.map(spender => (
                      <tr key={spender.userId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem' }}>{spender.userName}</td>
                        <td style={{ padding: '1rem' }}>{spender.userEmail}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{spender.totalSpent.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {spender.transactionCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && users && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>👥 User Management</h2>
              <div>
                <span>Total Users: {users.pagination?.totalUsers || 0}</span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Join Date</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Transactions</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Spent</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.users?.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem' }}>{user.name}</td>
                        <td style={{ padding: '1rem' }}>{user.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                            color: user.role === 'admin' ? '#1976d2' : '#666'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {user.stats.transactionCount}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{user.stats.totalSpent.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                            color: user.isActive ? '#155724' : '#721c24'
                          }}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: user.isActive ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users.pagination && users.pagination.totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '2rem'
                }}>
                  <button
                    onClick={() => {
                      setUserPage(prev => Math.max(1, prev - 1));
                      fetchUsers(userPage - 1);
                    }}
                    disabled={!users.pagination.hasPrev}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: users.pagination.hasPrev ? '#007bff' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: users.pagination.hasPrev ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Previous
                  </button>
                  
                  <span>
                    Page {users.pagination.currentPage} of {users.pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => {
                      setUserPage(prev => prev + 1);
                      fetchUsers(userPage + 1);
                    }}
                    disabled={!users.pagination.hasNext}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: users.pagination.hasNext ? '#007bff' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: users.pagination.hasNext ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div>
            <h2>📈 Analytics (Last 30 Days)</h2>
            
            {/* Top Categories */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3>🏆 Top Spending Categories</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Spent</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Users</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Avg per Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCategories.map((category, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                          {category.category}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{category.totalSpent.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {category.userCount}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          ₹{category.avgPerTransaction.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Stats for Last 30 Days */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>📊 Recent Category Breakdown</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Transaction Count</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Average Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.categoryStats.map((stat, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                          {stat._id}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{stat.total.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {stat.count}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          ₹{stat.avgAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
