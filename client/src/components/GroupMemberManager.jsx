import React, { useState } from 'react';

export default function GroupMemberManager({ group, onMembersUpdated }) {
  const [newMemberName, setNewMemberName] = useState('');
  const [bulkMembers, setBulkMembers] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add single member
  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      setError('Please enter a member name');
      return;
    }

    if (group.members.includes(newMemberName.trim())) {
      setError('Member already exists in this group!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const updatedMembers = [...group.members, newMemberName.trim()];
      await updateGroupMembers(updatedMembers);
      setNewMemberName('');
    } catch (error) {
      console.error('Failed to add member:', error);
      setError(`Failed to add member: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add multiple members at once
  const handleBulkAddMembers = async () => {
    if (!bulkMembers.trim()) {
      setError('Please enter member names');
      return;
    }

    const newMembers = bulkMembers
      .split('\n')
      .map(name => name.trim())
      .filter(name => name && !group.members.includes(name));

    if (newMembers.length === 0) {
      setError('No new members to add!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const updatedMembers = [...group.members, ...newMembers];
      await updateGroupMembers(updatedMembers);
      setBulkMembers('');
      setShowBulkAdd(false);
    } catch (error) {
      console.error('Failed to add members:', error);
      setError(`Failed to add members: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberToRemove) => {
    if (group.members.length <= 1) {
      setError('Group must have at least one member!');
      return;
    }

    // Check if member has any expenses
    const hasExpenses = group.expenses?.some(expense => 
      expense.paidBy === memberToRemove || 
      expense.splitDetails?.some(split => split.member === memberToRemove)
    );

    if (hasExpenses) {
      if (!window.confirm(`${memberToRemove} has expenses in this group. Removing them may affect calculations. Continue?`)) {
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      const updatedMembers = group.members.filter(member => member !== memberToRemove);
      await updateGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError(`Failed to remove member: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update group members via API
  const updateGroupMembers = async (newMembers) => {
    console.log('🔄 Updating group members:', newMembers);
    
    const response = await fetch(`http://localhost:5000/api/groups/${group._id}/members`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ members: newMembers })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to update members';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON (like HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON error response:', textResponse);
        errorMessage = `Server error (${response.status})`;
      }
      
      throw new Error(errorMessage);
    }

    const updatedGroup = await response.json();
    console.log('✅ Group updated:', updatedGroup);
    onMembersUpdated(updatedGroup);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ 
        margin: '0 0 20px 0', 
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        👥 Manage Members
        <span style={{
          backgroundColor: '#e8f4f8',
          color: '#0c5460',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {group.members.length} total
        </span>
      </h4>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Current Members */}
      <div style={{ marginBottom: '25px' }}>
        <h5 style={{ 
          marginBottom: '15px', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👤 Current Members
          {group.admins && group.admins.length > 0 && (
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              (👑 = Admin)
            </span>
          )}
        </h5>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {group.members.map((member, index) => {
            const isAdmin = group.admins?.includes(member);
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: isAdmin ? '#fff3cd' : '#e8f5e8',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: isAdmin ? '1px solid #ffeaa7' : '1px solid #c8e6c9',
                  position: 'relative'
                }}
              >
                {isAdmin && (
                  <span style={{ marginRight: '6px', fontSize: '14px' }}>👑</span>
                )}
                <span style={{ marginRight: '10px', fontWeight: isAdmin ? 'bold' : 'normal' }}>
                  {member}
                </span>
                <button
                  onClick={() => handleRemoveMember(member)}
                  disabled={loading}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.5 : 1
                  }}
                  title="Remove member"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Single Member */}
      <div style={{ marginBottom: '25px' }}>
        <h5 style={{ marginBottom: '10px', color: '#495057' }}>➕ Add New Member</h5>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Enter member name"
            value={newMemberName}
            onChange={(e) => {
              setNewMemberName(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1
            }}
          />
          <button
            onClick={handleAddMember}
            disabled={!newMemberName.trim() || loading}
            style={{
              padding: '12px 20px',
              backgroundColor: !newMemberName.trim() || loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !newMemberName.trim() || loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳' : '➕'} Add
          </button>
        </div>
      </div>

      {/* Bulk Add Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            setShowBulkAdd(!showBulkAdd);
            setError('');
          }}
          disabled={loading}
          style={{
            padding: '10px 16px',
            backgroundColor: showBulkAdd ? '#6c757d' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: loading ? 0.7 : 1
          }}
        >
          {showBulkAdd ? '📝 Hide Bulk Add' : '📝 Add Multiple Members'}
        </button>
      </div>

      {/* Bulk Add Section */}
      {showBulkAdd && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h5 style={{ marginBottom: '15px', color: '#495057' }}>
            📋 Add Multiple Members at Once
          </h5>
          <textarea
            placeholder="Enter member names (one per line)&#10;&#10;Example:&#10;John Doe&#10;Jane Smith&#10;Bob Johnson&#10;Alice Brown"
            value={bulkMembers}
            onChange={(e) => {
              setBulkMembers(e.target.value);
              setError('');
            }}
            rows="6"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              marginBottom: '15px',
              resize: 'vertical',
              fontSize: '14px',
              fontFamily: 'monospace',
              opacity: loading ? 0.7 : 1
            }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleBulkAddMembers}
              disabled={!bulkMembers.trim() || loading}
              style={{
                padding: '12px 20px',
                backgroundColor: !bulkMembers.trim() || loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !bulkMembers.trim() || loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Adding...' : '➕ Add All Members'}
            </button>
            {bulkMembers.trim() && !loading && (
              <span style={{ fontSize: '12px', color: '#6c757d' }}>
                {bulkMembers.split('\n').filter(name => name.trim()).length} members to add
              </span>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          color: '#6c757d', 
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px'
        }}>
          ⏳ Updating members...
        </div>
      )}
    </div>
  );
}
