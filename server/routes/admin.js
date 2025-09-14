const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin only
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalBudgets,
      recentUsers,
      transactionStats,
      topSpenders
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Active users (logged in within last 30 days)
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Total transactions
      Transaction.countDocuments(),
      
      // Total budgets
      Budget.countDocuments(),
      
      // Recent users (last 10)
      User.find()
        .select('name email createdAt lastLogin isActive')
        .sort({ createdAt: -1 })
        .limit(10),
        
      // Transaction statistics
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Top spending users
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        {
          $group: {
            _id: '$userId',
            totalSpent: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userName: '$user.name',
            userEmail: '$user.email',
            totalSpent: 1,
            transactionCount: 1
          }
        }
      ])
    ]);

    // Calculate growth metrics
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const [lastMonthUsers, thisMonthUsers] = await Promise.all([
      User.countDocuments({
        createdAt: {
          $gte: lastMonthStart,
          $lt: thisMonthStart
        }
      }),
      User.countDocuments({
        createdAt: { $gte: thisMonthStart }
      })
    ]);

    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0;

    // Process transaction stats
    const incomeStats = transactionStats.find(stat => stat._id === 'income') || { total: 0, count: 0 };
    const expenseStats = transactionStats.find(stat => stat._id === 'expense') || { total: 0, count: 0 };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalBudgets,
          userGrowthPercent: parseFloat(userGrowth)
        },
        financials: {
          totalIncome: incomeStats.total,
          totalExpenses: expenseStats.total,
          incomeTransactions: incomeStats.count,
          expenseTransactions: expenseStats.count,
          netAmount: incomeStats.total - expenseStats.total
        },
        recentUsers: recentUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        })),
        topSpenders: topSpenders.map(spender => ({
          userId: spender._id,
          userName: spender.userName,
          userEmail: spender.userEmail,
          totalSpent: spender.totalSpent,
          transactionCount: spender.transactionCount
        }))
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin dashboard data' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const [users, totalUsers] = await Promise.all([
      User.find(searchQuery)
        .select('name email role isActive createdAt lastLogin')
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .skip((page - 1) * limit),
      User.countDocuments(searchQuery)
    ]);

    // Get transaction counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [transactionCount, totalSpent, totalIncome] = await Promise.all([
          Transaction.countDocuments({ userId: user._id }),
          Transaction.aggregate([
            { $match: { userId: user._id, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),
          Transaction.aggregate([
            { $match: { userId: user._id, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        ]);

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin,
          stats: {
            transactionCount,
            totalSpent: totalSpent[0]?.total || 0,
            totalIncome: totalIncome[0]?.total || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users data' 
    });
  }
});

// @route   GET /api/admin/users/:userId
// @desc    Get detailed user information
// @access  Admin only
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, recentTransactions, budgets, transactionStats] = await Promise.all([
      User.findById(userId).select('-password'),
      Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(20),
      Budget.find({ userId }),
      Transaction.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const incomeStats = transactionStats.find(stat => stat._id === 'income') || { total: 0, count: 0 };
    const expenseStats = transactionStats.find(stat => stat._id === 'expense') || { total: 0, count: 0 };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin
        },
        stats: {
          totalIncome: incomeStats.total,
          totalExpenses: expenseStats.total,
          incomeTransactions: incomeStats.count,
          expenseTransactions: expenseStats.count,
          netAmount: incomeStats.total - expenseStats.total,
          budgetCount: budgets.length
        },
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description,
          date: tx.date,
          createdAt: tx.createdAt
        })),
        budgets: budgets.map(budget => ({
          id: budget._id,
          category: budget.category,
          limit: budget.limit,
          spent: budget.spent || 0,
          month: budget.month,
          year: budget.year
        }))
      }
    });

  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user details' 
    });
  }
});

// @route   PUT /api/admin/users/:userId
// @desc    Update user (activate/deactivate, change role)
// @access  Admin only
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user' 
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Admin only
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      categoryStats,
      dailyStats,
      monthlyGrowth,
      topCategories
    ] = await Promise.all([
      // Category wise spending
      Transaction.aggregate([
        { $match: { type: 'expense', date: { $gte: startDate } } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        },
        { $sort: { total: -1 } }
      ]),

      // Daily transaction stats
      Transaction.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              type: '$type'
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      // Monthly user growth
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            userCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Top spending categories overall
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        {
          $group: {
            _id: '$category',
            totalSpent: { $sum: '$amount' },
            userCount: { $addToSet: '$userId' },
            avgPerTransaction: { $avg: '$amount' }
          }
        },
        {
          $project: {
            category: '$_id',
            totalSpent: 1,
            userCount: { $size: '$userCount' },
            avgPerTransaction: { $round: ['$avgPerTransaction', 2] }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        dailyStats,
        monthlyGrowth,
        topCategories,
        period: days
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics data' 
    });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create new admin user (Super admin only)
// @access  Admin only
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if requesting user is super admin (first admin in DB)
    const adminCount = await User.countDocuments({ role: 'admin' });
    const firstAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    
    if (req.user._id.toString() !== firstAdmin._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admin can create new admins' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating admin user' 
    });
  }
});

module.exports = router;
