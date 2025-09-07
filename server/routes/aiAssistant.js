const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Group = require('../models/Group');

// AI Summary Generator - Enhanced with smarter insights
router.get('/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch all relevant data
    const [transactions, budgets, groups] = await Promise.all([
      Transaction.find({ 
        date: { $gte: startDate, $lte: now } 
      }).sort({ date: -1 }),
      Budget.find({ isActive: true }),
      Group.find({ isActive: true })
    ]);

    // Calculate metrics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100) : 0;

    // Category analysis
    const categorySpending = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    // Budget analysis
    const budgetAlerts = budgets.filter(budget => {
      const spent = categorySpending[budget.category] || 0;
      const usage = (spent / budget.limit) * 100;
      return usage >= budget.alertThreshold;
    });

    // Generate AI-like insights
    const insights = generateFinancialInsights({
      income,
      expenses,
      savings,
      savingsRate,
      topCategory,
      budgetAlerts,
      transactionCount: transactions.length,
      period,
      groupCount: groups.length
    });

    res.json({
      summary: insights.summary,
      recommendations: insights.recommendations,
      metrics: {
        income,
        expenses,
        savings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        transactionCount: transactions.length,
        activeGroups: groups.length
      },
      alerts: budgetAlerts.map(b => ({
        category: b.category,
        message: `You've spent ${Math.round((categorySpending[b.category] / b.limit) * 100)}% of your ${b.category} budget`
      }))
    });

  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

// AI Chat Interface - Handles natural language queries
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await processNaturalLanguageQuery(message.toLowerCase(), context);
    
    res.json({
      response: response.message,
      data: response.data || null,
      suggestions: response.suggestions || []
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error processing your request. Please try again.',
      response: "I'm having trouble understanding that request. Try asking about your expenses, income, or spending by category."
    });
  }
});

// Smart expense categorization
router.post('/categorize', async (req, res) => {
  try {
    const { description, amount, merchant } = req.body;
    
    const category = categorizExpense({ description, amount, merchant });
    const confidence = calculateCategoryConfidence(description, category);
    
    res.json({
      suggestedCategory: category,
      confidence,
      alternatives: getSimilarCategories(category)
    });

  } catch (error) {
    console.error('Categorization Error:', error);
    res.status(500).json({ error: 'Failed to categorize expense' });
  }
});

// Helper function to generate financial insights
function generateFinancialInsights(data) {
  const { income, expenses, savings, savingsRate, topCategory, budgetAlerts, transactionCount, period, groupCount } = data;
  
  let summary = `📊 **Financial Summary (${period})**\n\n`;
  
  // Income analysis
  summary += `💰 **Income**: ₹${income.toLocaleString()}\n`;
  summary += `💸 **Expenses**: ₹${expenses.toLocaleString()}\n`;
  
  // Savings analysis
  if (savings > 0) {
    summary += `💵 **Savings**: ₹${savings.toLocaleString()} (${savingsRate.toFixed(1)}%)\n\n`;
  } else {
    summary += `⚠️ **Deficit**: ₹${Math.abs(savings).toLocaleString()}\n\n`;
  }

  // Spending pattern
  if (topCategory) {
    summary += `🏆 **Top Spending Category**: ${topCategory[0]} (₹${topCategory[1].toLocaleString()})\n\n`;
  }

  // Group activity
  if (groupCount > 0) {
    summary += `👥 **Active Groups**: ${groupCount} shared expense groups\n\n`;
  }

  // Generate recommendations
  const recommendations = [];
  
  if (savingsRate < 20) {
    recommendations.push("💡 Try to increase your savings rate to at least 20% of income");
  }
  
  if (budgetAlerts.length > 0) {
    recommendations.push(`⚠️ You're over budget in ${budgetAlerts.length} categories`);
  }
  
  if (expenses > income) {
    recommendations.push("🚨 Your expenses exceed income - consider reducing spending");
  }
  
  if (topCategory && topCategory[1] > income * 0.3) {
    recommendations.push(`📈 ${topCategory[0]} spending is high - consider optimization`);
  }

  return {
    summary,
    recommendations: recommendations.length > 0 ? recommendations : [
      "✅ Your finances look healthy! Keep up the good work."
    ]
  };
}

// Process natural language queries
async function processNaturalLanguageQuery(message, context) {
  const keywords = message.split(' ').filter(word => word.length > 2);
  
  // Intent detection based on keywords
  if (keywords.some(k => ['spend', 'spent', 'expense', 'expenses'].includes(k))) {
    return await handleSpendingQuery(message, context);
  }
  
  if (keywords.some(k => ['income', 'earned', 'salary', 'revenue'].includes(k))) {
    return await handleIncomeQuery(message, context);
  }
  
  if (keywords.some(k => ['budget', 'limit', 'allocation'].includes(k))) {
    return await handleBudgetQuery(message, context);
  }
  
  if (keywords.some(k => ['save', 'savings', 'saved'].includes(k))) {
    return await handleSavingsQuery(message, context);
  }
  
  if (keywords.some(k => ['category', 'categories', 'breakdown'].includes(k))) {
    return await handleCategoryQuery(message, context);
  }
  
  if (keywords.some(k => ['group', 'groups', 'shared'].includes(k))) {
    return await handleGroupQuery(message, context);
  }

  // Default response with suggestions
  return {
    message: "I can help you understand your finances! Try asking me about:\n\n• Your spending this month\n• Budget status\n• Income vs expenses\n• Category breakdown\n• Group expenses\n• Savings progress",
    suggestions: [
      "How much did I spend this month?",
      "What's my biggest expense category?",
      "Am I within my budget?",
      "Show me my income vs expenses",
      "How are my group expenses?"
    ]
  };
}

// Spending query handler
async function handleSpendingQuery(message, context) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = await Transaction.find({
      type: 'expense',
      date: { $gte: startOfMonth, $lte: now }
    });
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = expenses.length;
    
    // Category breakdown
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    
    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    let response = `💸 **This Month's Spending**: ₹${total.toLocaleString()}\n`;
    response += `📝 **Total Transactions**: ${count}\n\n`;
    
    if (topCategories.length > 0) {
      response += `**Top Categories:**\n`;
      topCategories.forEach(([cat, amount], i) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        response += `${i + 1}. ${cat}: ₹${amount.toLocaleString()} (${percentage}%)\n`;
      });
    }

    return {
      message: response,
      data: { total, count, categories: topCategories },
      suggestions: [
        "Show me my budget status",
        "Which category should I reduce?",
        "Compare with last month"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't fetch your spending data right now. Please try again later.",
      suggestions: ["Try asking about your budget instead"]
    };
  }
}

// Income query handler
async function handleIncomeQuery(message, context) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const income = await Transaction.find({
      type: 'income',
      date: { $gte: startOfMonth, $lte: now }
    });
    
    const total = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    return {
      message: `💰 **This Month's Income**: ₹${total.toLocaleString()}\n📝 **Income Transactions**: ${income.length}`,
      data: { total, count: income.length },
      suggestions: [
        "Compare income vs expenses",
        "What's my savings rate?",
        "Show spending breakdown"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't fetch your income data right now.",
      suggestions: ["Ask about your expenses instead"]
    };
  }
}

// Budget query handler  
async function handleBudgetQuery(message, context) {
  try {
    const budgets = await Budget.find({ isActive: true });
    
    if (budgets.length === 0) {
      return {
        message: "You don't have any active budgets set up. Would you like to create some budgets to track your spending?",
        suggestions: [
          "How do I create a budget?",
          "Show my spending categories",
          "What should I budget for?"
        ]
      };
    }

    let response = `💰 **Budget Status**:\n\n`;
    
    for (const budget of budgets) {
      const spent = budget.actualSpent || 0;
      const percentage = Math.round((spent / budget.limit) * 100);
      const status = percentage >= 100 ? '🚨' : percentage >= 80 ? '⚠️' : '✅';
      
      response += `${status} **${budget.category}**: ₹${spent.toLocaleString()} / ₹${budget.limit.toLocaleString()} (${percentage}%)\n`;
    }

    return {
      message: response,
      data: { budgets: budgets.length },
      suggestions: [
        "Which budget am I overspending?",
        "How can I stay within budget?",
        "Show spending trends"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't check your budget status right now.",
      suggestions: ["Ask about your spending instead"]
    };
  }
}

// Savings query handler
async function handleSavingsQuery(message, context) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [incomeTransactions, expenseTransactions] = await Promise.all([
      Transaction.find({ type: 'income', date: { $gte: startOfMonth, $lte: now } }),
      Transaction.find({ type: 'expense', date: { $gte: startOfMonth, $lte: now } })
    ]);
    
    const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100) : 0;

    let response = `💵 **This Month's Savings**: ₹${Math.abs(savings).toLocaleString()}\n`;
    
    if (savings > 0) {
      response += `📈 **Savings Rate**: ${savingsRate.toFixed(1)}%\n\n`;
      
      if (savingsRate >= 20) {
        response += `🎉 Excellent! You're saving ${savingsRate.toFixed(1)}% of your income.`;
      } else if (savingsRate >= 10) {
        response += `👍 Good job! Consider increasing to 20% if possible.`;
      } else {
        response += `💡 Try to increase your savings rate to at least 10-20%.`;
      }
    } else {
      response += `🚨 **Deficit**: You're spending more than you earn this month.\n`;
      response += `💡 Consider reviewing your expenses to reduce spending.`;
    }

    return {
      message: response,
      data: { savings, savingsRate, income, expenses },
      suggestions: [
        "How can I save more money?",
        "Show me my biggest expenses",
        "What's my spending pattern?"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't calculate your savings right now.",
      suggestions: ["Ask about your income or expenses"]
    };
  }
}

// Category query handler
async function handleCategoryQuery(message, context) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = await Transaction.find({
      type: 'expense',
      date: { $gte: startOfMonth, $lte: now }
    });
    
    const categories = {};
    const total = expenses.reduce((sum, exp) => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      return sum + exp.amount;
    }, 0);
    
    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a);

    let response = `📊 **Spending by Category** (This Month):\n\n`;
    
    sortedCategories.forEach(([category, amount], index) => {
      const percentage = ((amount / total) * 100).toFixed(1);
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
      response += `${emoji} **${category}**: ₹${amount.toLocaleString()} (${percentage}%)\n`;
    });

    return {
      message: response,
      data: { categories: sortedCategories, total },
      suggestions: [
        "How can I reduce my top category?",
        "Compare with my budget",
        "Show last month's categories"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't fetch your category breakdown right now.",
      suggestions: ["Ask about total spending instead"]
    };
  }
}

// Group query handler
async function handleGroupQuery(message, context) {
  try {
    const groups = await Group.find({ isActive: true });
    
    if (groups.length === 0) {
      return {
        message: "You don't have any active groups yet. Groups are great for tracking shared expenses with friends, family, or colleagues!",
        suggestions: [
          "How do I create a group?",
          "What are groups used for?",
          "Show my personal expenses"
        ]
      };
    }

    let response = `👥 **Your Groups** (${groups.length} active):\n\n`;
    
    groups.forEach(group => {
      const expenseCount = group.expenses?.length || 0;
      const totalAmount = group.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      
      response += `• **${group.name}**: ${group.members?.length || 0} members, `;
      response += `${expenseCount} expenses (₹${totalAmount.toLocaleString()})\n`;
    });

    return {
      message: response,
      data: { groupCount: groups.length },
      suggestions: [
        "Show expenses for a specific group",
        "Who owes me money?",
        "Create a new group"
      ]
    };
    
  } catch (error) {
    return {
      message: "I couldn't fetch your group information right now.",
      suggestions: ["Ask about your personal expenses instead"]
    };
  }
}

// Simple expense categorization logic
function categorizExpense({ description, amount, merchant }) {
  const desc = description?.toLowerCase() || '';
  const merch = merchant?.toLowerCase() || '';
  const text = `${desc} ${merch}`;
  
  // Food categories
  if (text.match(/restaurant|cafe|coffee|food|pizza|burger|meal|dining|zomato|swiggy|dominos/)) {
    return 'food';
  }
  
  // Transport
  if (text.match(/uber|taxi|bus|train|metro|petrol|fuel|gas|parking|toll/)) {
    return 'transport';
  }
  
  // Entertainment  
  if (text.match(/movie|cinema|netflix|spotify|game|entertainment|bookmyshow|theater/)) {
    return 'entertainment';
  }
  
  // Shopping
  if (text.match(/amazon|flipkart|mall|store|shopping|clothes|fashion|myntra/)) {
    return 'shopping';
  }
  
  // Bills & Utilities
  if (text.match(/electric|water|internet|phone|mobile|recharge|bill|utility/)) {
    return 'utilities';
  }
  
  // Healthcare
  if (text.match(/hospital|doctor|medicine|pharmacy|medical|health/)) {
    return 'healthcare';
  }
  
  // Default
  return 'other';
}

function calculateCategoryConfidence(description, category) {
  // Simple confidence calculation based on keyword matches
  const keywords = {
    food: ['restaurant', 'cafe', 'food', 'meal'],
    transport: ['uber', 'taxi', 'fuel', 'petrol'],
    entertainment: ['movie', 'netflix', 'game'],
    shopping: ['amazon', 'store', 'clothes'],
    utilities: ['electric', 'phone', 'bill'],
    healthcare: ['hospital', 'medicine', 'doctor']
  };
  
  const categoryKeywords = keywords[category] || [];
  const matches = categoryKeywords.filter(keyword => 
    description?.toLowerCase().includes(keyword)
  ).length;
  
  return Math.min(0.5 + (matches * 0.2), 0.95); // 50-95% confidence
}

function getSimilarCategories(category) {
  const alternatives = {
    food: ['dining', 'groceries', 'snacks'],
    transport: ['travel', 'commute', 'fuel'],
    entertainment: ['leisure', 'hobbies', 'subscription'],
    shopping: ['retail', 'clothing', 'electronics'],
    utilities: ['bills', 'services', 'maintenance'],
    healthcare: ['medical', 'fitness', 'wellness'],
    other: ['miscellaneous', 'personal', 'general']
  };
  
  return alternatives[category] || ['general', 'other', 'miscellaneous'];
}

module.exports = router;
