import React, { useEffect, useState } from 'react';
import GroupForm from '../components/GroupForms';
import GroupMemberManager from '../components/GroupMemberManager';
import GroupExpenseForm from '../components/GroupExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BalanceSettlement from '../components/BalanceSettlement';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/groups');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const safeGroups = Array.isArray(data) ? data.map(group => ({
        ...group,
        name: group.name || 'Unnamed Group',
        members: Array.isArray(group.members) ? group.members : [],
        expenses: Array.isArray(group.expenses) ? group.expenses : [],
        settlements: Array.isArray(group.settlements) ? group.settlements : [],
        admins: Array.isArray(group.admins) ? group.admins : [],
        description: group.description || ''
      })) : [];
      
      setGroups(safeGroups);
      setError(null);
      
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setError(`Failed to load groups: ${error.message}`);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (newGroup) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const createdGroup = await response.json();
      
      const safeGroup = {
        ...createdGroup,
        name: createdGroup.name || 'Unnamed Group',
        members: Array.isArray(createdGroup.members) ? createdGroup.members : [],
        expenses: Array.isArray(createdGroup.expenses) ? createdGroup.expenses : [],
        settlements: Array.isArray(createdGroup.settlements) ? createdGroup.settlements : [],
        admins: Array.isArray(createdGroup.admins) ? createdGroup.admins : [],
        description: createdGroup.description || ''
      };
      
      setGroups(prev => [...prev, safeGroup]);
      setError(null);
      
    } catch (error) {
      console.error('Failed to create group:', error);
      setError(`Failed to create group: ${error.message}`);
    }
  };

  const handleGroupUpdated = (updatedGroup) => {
    const safeUpdatedGroup = {
      ...updatedGroup,
      name: updatedGroup.name || 'Unnamed Group',
      members: Array.isArray(updatedGroup.members) ? updatedGroup.members : [],
      expenses: Array.isArray(updatedGroup.expenses) ? updatedGroup.expenses : [],
      settlements: Array.isArray(updatedGroup.settlements) ? updatedGroup.settlements : [],
      admins: Array.isArray(updatedGroup.admins) ? updatedGroup.admins : [],
      description: updatedGroup.description || ''
    };
    
    setSelectedGroup(safeUpdatedGroup);
    setGroups(prev => prev.map(g => 
      g._id === safeUpdatedGroup._id ? safeUpdatedGroup : g
    ));
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGroups(prev => prev.filter(g => g._id !== groupId));
        if (selectedGroup && selectedGroup._id === groupId) {
          setSelectedGroup(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      setError('Failed to delete group. Please try again.');
    }
  };

  const getTotalExpenseAmount = (group) => {
    return group.expenses?.reduce((total, expense) => total + expense.amount, 0) || 0;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          Loading groups...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>👥 Group Expense Sharing</h2>
        {selectedGroup && (
          <button
            onClick={() => handleDeleteGroup(selectedGroup._id)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Delete Group
          </button>
        )}
      </div>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span><strong>Error:</strong> {error}</span>
          <button 
            onClick={() => {
              setError(null);
              fetchGroups();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {!selectedGroup ? (
        <>
          <GroupForm onCreated={handleCreateGroup} />
          
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
              Your Groups ({groups.length})
            </h3>
            
            {groups.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                border: '2px dashed #dee2e6',
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
                <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>No Groups Created Yet</h4>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  Create your first group above to start managing shared expenses with friends, 
                  family, or colleagues! 🎉
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '25px'
              }}>
                {groups.map((group, index) => (
                  <div 
                    key={group._id || index}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '16px',
                      padding: '25px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedGroup(group)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}
                  >
                    {/* Group Header */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#2c3e50',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        👥 {group.name}
                      </h4>
                      
                      {group.description && (
                        <p style={{ 
                          margin: '0', 
                          color: '#6c757d',
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          {group.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Group Stats */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                            {group.members.length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>Members</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                            {group.expenses.length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>Expenses</div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                          ₹{getTotalExpenseAmount(group).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Spent</div>
                      </div>
                    </div>
                    
                    {/* Members Preview */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                        <strong>👤 Members:</strong>
                      </div>
                      {group.members.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {group.members.slice(0, 3).map((member, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              {member}
                            </span>
                          ))}
                          {group.members.length > 3 && (
                            <span style={{
                              backgroundColor: '#f8f9fa',
                              color: '#6c757d',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              +{group.members.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#dc3545', fontSize: '14px' }}>No members</span>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup(group);
                      }}
                    >
                      💰 Manage Group
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          {/* Back Button */}
          <button 
            onClick={() => setSelectedGroup(null)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '25px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Groups
          </button>
          
          {/* Selected Group Info */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '16px',
            marginBottom: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              👥 {selectedGroup.name}
              <span style={{
                backgroundColor: '#e8f4f8',
                color: '#0c5460',
                padding: '4px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedGroup.members.length} members
              </span>
              <span style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '4px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedGroup.expenses.length} expenses
              </span>
            </h3>
            
            {selectedGroup.description && (
              <p style={{ 
                margin: '0 0 15px 0', 
                color: '#6c757d',
                fontStyle: 'italic'
              }}>
                📝 {selectedGroup.description}
              </p>
            )}
            
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <strong style={{ width: '100%', marginBottom: '8px', color: '#495057' }}>
                👤 Members:
              </strong>
              {selectedGroup.members.length > 0 ? (
                selectedGroup.members.map((member, idx) => {
                  const isAdmin = selectedGroup.admins?.includes(member);
                  return (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: isAdmin ? '#fff3cd' : '#007bff',
                        color: isAdmin ? '#856404' : 'white',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isAdmin && '👑'} {member}
                    </span>
                  );
                })
              ) : (
                <span style={{ color: '#dc3545' }}>No members in this group</span>
              )}
            </div>
          </div>
          
          {/* Member Management */}
          <GroupMemberManager 
            group={selectedGroup} 
            onMembersUpdated={handleGroupUpdated}
          />
          
          {/* Expense Management */}
          {Array.isArray(selectedGroup.members) && selectedGroup.members.length > 0 ? (
            <>
              <GroupExpenseForm 
                group={selectedGroup} 
                onExpenseAdded={handleGroupUpdated}
              />
              
              <ExpenseList 
                group={selectedGroup}
                onGroupUpdated={handleGroupUpdated}
              />
              
              <BalanceSettlement group={selectedGroup} />
            </>
          ) : (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              color: '#856404',
              padding: '25px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
              <h4 style={{ margin: '0 0 10px 0' }}>No Members in Group</h4>
              <p style={{ margin: '0 0 20px 0' }}>
                This group doesn't have any members yet. Please add members using the member management section above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
