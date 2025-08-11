import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

export const getTransactions = () => API.get('/transactions');
export const createTransaction = (data) => API.post('/transactions', data);

export const getBudgets = () => API.get('/budgets');
export const createBudget = (data) => API.post('/budgets', data);
export const getAISummary = () => API.get('/summary');
