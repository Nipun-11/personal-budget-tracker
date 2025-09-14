const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createFirstAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@budgettracker.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@budgettracker.com',
      password: 'admin123456',
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@budgettracker.com');
    console.log('🔑 Password: admin123456');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('🌐 Access admin panel at: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createFirstAdmin();
