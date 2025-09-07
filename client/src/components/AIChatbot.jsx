import React, { useState } from 'react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hi! I'm your financial assistant. Ask me about your spending, budgets, or savings! 💰",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      // Simulate AI response (replace with actual AI service)
      const aiResponse = generateAIResponse(currentMessage.toLowerCase());
      
      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (message) => {
    // Simple keyword-based responses (replace with actual AI)
    if (message.includes('spend') || message.includes('expense')) {
      return "Based on your recent transactions, you can check your spending patterns in the dashboard charts. Would you like tips on reducing expenses?";
    } else if (message.includes('budget')) {
      return "Setting up budgets helps control spending. You can create budgets in the Budgets section. What category would you like to budget for?";
    } else if (message.includes('save') || message.includes('saving')) {
      return "Great question! Aim to save 20% of your income. Based on your current income vs expenses, I can help you find ways to increase savings.";
    } else if (message.includes('income')) {
      return "Track all your income sources regularly. This helps you understand your earning patterns and plan better financial goals.";
    } else {
      return "I can help you with questions about spending, budgeting, saving, and income tracking. What would you like to know?";
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
          zIndex: 1000
        }}
      >
        🤖
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      height: '400px',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '16px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>🤖 AI Assistant</h4>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: message.type === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              backgroundColor: message.type === 'user' ? '#007bff' : '#f8f9fa',
              color: message.type === 'user' ? 'white' : '#2c3e50',
              fontSize: '14px'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px 12px 12px 4px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              🤖 Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your finances..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          style={{
            padding: '8px 12px',
            backgroundColor: !inputMessage.trim() || loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer'
          }}
        >
          📤
        </button>
      </div>
    </div>
  );
}
