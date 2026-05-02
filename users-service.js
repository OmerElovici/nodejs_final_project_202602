const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');
const User = require('./models/user');
const Cost = require('./models/cost');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/*
 * POST /api/add
 * Adds a new user.
 */
app.post('/api/add', async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;
    const newUser = new User({ id, first_name, last_name, birthday });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ id: 'error', message: error.message });
  }
});

/*
 * GET /api/users/:id
 * Returns details of a specific user including total costs.
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ id: 'error', message: 'User not found' });
    }
    
    // Calculate total costs
    const costs = await Cost.find({ userid: userId });
    const total = costs.reduce((sum, cost) => sum + cost.sum, 0);
    
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total: total
    });
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
  }
});

/*
 * GET /api/users
 * Returns a list of all users.
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
  }
});

const PORT = process.env.USERS_PORT || 3002;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Users service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
