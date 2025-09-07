import React, { useState, useEffect } from "react";

export default function GroupForm({ onCreated }) {
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingGroups, setExistingGroups] = useState([]);
  const [nameError, setNameError] = useState("");

  // Fetch existing groups when component mounts
  useEffect(() => {
    fetchExistingGroups();
  }, []);

  const fetchExistingGroups = async () => {
    try {
      console.log('🔍 Fetching existing groups for validation...');
      const response = await fetch('http://localhost:5000/api/groups');
      if (response.ok) {
        const groups = await response.json();
        console.log('📋 Existing groups:', groups.map(g => g.name));
        setExistingGroups(groups);
      }
    } catch (error) {
      console.error('Failed to fetch existing groups:', error);
    }
  };

  // Check for duplicate names in real-time
  const checkDuplicateName = (name) => {
    if (!name.trim()) {
      setNameError("");
      return false;
    }

    const isDuplicate = existingGroups.some(group => 
      group.name?.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setNameError("⚠️ A group with this name already exists. Please choose a different name.");
      return true;
    } else {
      setNameError("");
      return false;
    }
  };

  // Handle group name changes with validation
  const handleGroupNameChange = (e) => {
    const value = e.target.value;
    setGroupName(value);
    checkDuplicateName(value);
  };

  // Add member functionality
  const handleAddMember = () => {
    if (memberName.trim() && !members.includes(memberName.trim())) {
      setMembers((prev) => [...prev, memberName.trim()]);
      setMemberName("");
    }
  };

  const handleRemoveMember = (name) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleMemberKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  // Form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted with data:', { groupName, members, description });

    // Validation checks
    if (!groupName.trim()) {
      setNameError("⚠️ Group name is required");
      return;
    }

    if (members.length === 0) {
      alert("⚠️ Please add at least one member to the group");
      return;
    }

    // Final duplicate check before submission
    if (checkDuplicateName(groupName)) {
      console.log('❌ Submission blocked: Duplicate group name');
      return;
    }

    setLoading(true);
    try {
      const newGroup = {
        name: groupName.trim(),
        members,
        description: description.trim()
      };

      console.log('📤 Submitting group:', newGroup);
      await onCreated(newGroup);
      
      // Success - reset form
      setGroupName("");
      setMembers([]);
      setDescription("");
      setNameError("");
      
      // Refresh existing groups list
      fetchExistingGroups();
      console.log('✅ Group created successfully!');
      
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      
      // Handle server-side duplicate error as backup
      if (error.message?.includes('already exists')) {
        setNameError("⚠️ Group name already exists. Please choose a different name.");
        fetchExistingGroups();
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form can be submitted
  const canSubmit = groupName.trim() && members.length > 0 && !nameError && !loading;

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '2px solid #e3f2fd',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '25px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>👥 Create New Group</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Group Name with Validation */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Group Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Trip to Goa, Roommates, Office Team"
            value={groupName}
            onChange={handleGroupNameChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: nameError ? '2px solid #dc3545' : '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: nameError ? '#fff5f5' : 'white'
            }}
          />
          
          {/* Error Message */}
          {nameError && (
            <div style={{
              color: '#dc3545',
              fontSize: '14px',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px'
            }}>
              {nameError}
            </div>
          )}
          
          {/* Existing Groups Hint */}
          {existingGroups.length > 0 && (
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px'
            }}>
              <strong>📝 Existing groups:</strong> {existingGroups.map(g => g.name).join(', ')}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Description (Optional):
          </label>
          <textarea
            placeholder="Brief description of this group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Add Members */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Add Members: <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Enter member name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              onKeyPress={handleMemberKeyPress}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            />
            <button 
              type="button" 
              onClick={handleAddMember}
              disabled={!memberName.trim() || members.includes(memberName.trim())}
              style={{
                padding: '12px 20px',
                backgroundColor: memberName.trim() && !members.includes(memberName.trim()) ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: memberName.trim() && !members.includes(memberName.trim()) ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}
            >
              ➕ Add
            </button>
          </div>

          {/* Members List */}
          {members.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                👥 Members ({members.length}):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {members.map((member, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e8f5e8',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: '1px solid #c8e6c9'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: canSubmit ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            fontWeight: 'bold',
            opacity: canSubmit ? 1 : 0.6
          }}
        >
          {loading ? '⏳ Creating Group...' : '✅ Create Group'}
        </button>
      </form>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2c3e50'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '10px 0 0 20px', padding: 0 }}>
          <li>🚫 Group names must be unique (no duplicates allowed)</li>
          <li>👥 Add at least 2 members to create a group</li>
          <li>✏️ Choose descriptive names for easy identification</li>
          <li>🔄 The form validates in real-time as you type</li>
        </ul>
      </div>
    </div>
  );
}
