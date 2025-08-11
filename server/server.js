require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const aiSummaryRoutes = require('./routes/aiSummary');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
// API routes
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/ai-summary', require('./routes/aiSummary'));

// Dummy Routes
app.get('/', (req, res) => {
  res.send('Server is working!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
