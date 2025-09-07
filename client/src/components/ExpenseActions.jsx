import React, { useState } from 'react';

export default function ExpenseActions({ group, expense, onExpenseUpdated, onExpenseDeleted }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    description: expense.description,
    amount: expense.amount,
    category: expense.category
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateExpense = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/groups/${group._id}/expenses/${expense._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData)
        }
      );

      if (response.ok) {
        const updatedGroup = await response.json();
        onExpenseUpdated(updatedGroup);
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Failed to update expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/groups/${group._id}/expenses/${expense._id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const updatedGroup = await response.json();
        onExpenseDeleted(updatedGroup);
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/groups/${group._id}/expenses/${expense._id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: commentAuthor.trim(),
            text: newComment.trim()
          })
        }
      );

      if (response.ok) {
        const updatedGroup = await response.json();
        onExpenseUpdated(updatedGroup);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button
          onClick={() => setShowEditForm(!showEditForm)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={handleDeleteExpense}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🗑️ Delete
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          💬 Comments ({expense.comments?.length || 0})
        </button>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '10px',
          border: '1px solid #e0e0e0'
        }}>
          <h6 style={{ marginBottom: '10px' }}>Edit Expense</h6>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '8px'
              }}
            />
            
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={editData.amount}
              onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value)})}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '8px'
              }}
            />
            
            <select
              value={editData.category}
              onChange={(e) => setEditData({...editData, category: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="food">🍽️ Food</option>
              <option value="transport">🚗 Transport</option>
              <option value="accommodation">🏨 Stay</option>
              <option value="entertainment">🎬 Fun</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleUpdateExpense}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? '⏳' : '💾'} Save
            </button>
            
            <button
              onClick={() => setShowEditForm(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h6 style={{ marginBottom: '10px' }}>💬 Comments</h6>
          
          {/* Existing Comments */}
          {expense.comments && expense.comments.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              {expense.comments.map((comment, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                    <strong>{comment.author}</strong> • {new Date(comment.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '14px' }}>{comment.text}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add New Comment */}
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '8px'
              }}
            />
            
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '8px',
                resize: 'vertical'
              }}
            />
            
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !commentAuthor.trim() || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? '⏳' : '💬'} Add Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
