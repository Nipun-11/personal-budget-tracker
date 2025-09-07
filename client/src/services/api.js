import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// TRANSACTION API FUNCTIONS
// ============================================

export const getTransactions = (params = {}) => {
  const queryString = new URLSearchParams();
  
  // Add all valid parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryString.append(key, value);
    }
  });
  
  const url = queryString.toString() ? `/transactions?${queryString}` : '/transactions';
  return API.get(url);
};

export const createTransaction = (data) => {
  // Ensure category is properly formatted
  const formattedData = {
    ...data,
    category: data.category.trim().toLowerCase(),
    amount: parseFloat(data.amount)
  };
  
  return API.post('/transactions', formattedData);
};

export const updateTransaction = (id, data) => {
  const formattedData = {
    ...data,
    category: data.category.trim().toLowerCase(),
    amount: parseFloat(data.amount)
  };
  
  return API.put(`/transactions/${id}`, formattedData);
};

export const deleteTransaction = (id) => {
  return API.delete(`/transactions/${id}`);
};

export const getTransactionAnalytics = (params = {}) => {
  const queryString = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryString.append(key, value);
    }
  });
  
  const url = queryString.toString() ? `/transactions/analytics?${queryString}` : '/transactions/analytics';
  return API.get(url);
};

// ============================================
// BUDGET API FUNCTIONS
// ============================================

export const getBudgets = (params = {}) => {
  const queryString = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryString.append(key, value);
    }
  });
  
  const url = queryString.toString() ? `/budgets?${queryString}` : '/budgets';
  return API.get(url);
};

export const createBudget = (data) => {
  const formattedData = {
    ...data,
    category: data.category.trim().toLowerCase(),
    limit: parseFloat(data.limit),
    year: parseInt(data.year) || new Date().getFullYear(),
    alertThreshold: parseInt(data.alertThreshold) || 80
  };
  
  return API.post('/budgets', formattedData);
};

export const updateBudget = (id, data) => {
  const formattedData = {
    ...data,
    category: data.category.trim().toLowerCase(),
    limit: parseFloat(data.limit),
    year: parseInt(data.year) || new Date().getFullYear(),
    alertThreshold: parseInt(data.alertThreshold) || 80
  };
  
  return API.put(`/budgets/${id}`, formattedData);
};

export const deleteBudget = (id) => {
  return API.delete(`/budgets/${id}`);
};

export const getBudgetAlerts = () => {
  return API.get('/budgets/alerts');
};

// ============================================
// GROUP API FUNCTIONS
// ============================================

export const getGroups = () => {
  return API.get('/groups');
};

export const getGroup = (id) => {
  return API.get(`/groups/${id}`);
};

export const createGroup = (data) => {
  const formattedData = {
    ...data,
    name: data.name.trim(),
    members: data.members.map(member => member.trim()),
    description: data.description?.trim() || ''
  };
  
  return API.post('/groups', formattedData);
};

export const updateGroup = (id, data) => {
  const formattedData = {
    ...data,
    name: data.name.trim(),
    members: data.members.map(member => member.trim()),
    description: data.description?.trim() || ''
  };
  
  return API.put(`/groups/${id}`, formattedData);
};

export const deleteGroup = (id) => {
  return API.delete(`/groups/${id}`);
};

export const addGroupExpense = (groupId, data) => {
  const formattedData = {
    ...data,
    description: data.description.trim(),
    amount: parseFloat(data.amount),
    category: data.category.trim().toLowerCase(),
    paidBy: data.paidBy.trim()
  };
  
  return API.post(`/groups/${groupId}/expenses`, formattedData);
};

export const addGroupSettlement = (groupId, data) => {
  const formattedData = {
    ...data,
    from: data.from.trim(),
    to: data.to.trim(),
    amount: parseFloat(data.amount),
    note: data.note?.trim() || ''
  };
  
  return API.post(`/groups/${groupId}/settlements`, formattedData);
};

// ============================================
// AI SUMMARY API FUNCTIONS
// ============================================

export const getAISummary = () => {
  return API.get('/ai-summary');
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const exportTransactionsToCSV = async (params = {}) => {
  try {
    const response = await getTransactions({ ...params, limit: 10000 });
    const transactions = response.data.transactions || [];
    
    if (transactions.length === 0) {
      throw new Error('No transactions to export');
    }
    
    // Create CSV headers
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Note'];
    
    // Create CSV rows
    const rows = transactions.map(tx => [
      formatDate(tx.date),
      tx.type,
      tx.category,
      tx.description || '',
      tx.amount,
      tx.note || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: 'Transactions exported successfully' };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, message: error.message };
  }
};

// Default export with all functions
const apiService = {
  // Transactions
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionAnalytics,
  
  // Budgets
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  
  // Groups
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupExpense,
  addGroupSettlement,
  
  // AI Summary
  getAISummary,
  
  // Utilities
  formatCurrency,
  formatDate,
  exportTransactionsToCSV
};

export default apiService;
